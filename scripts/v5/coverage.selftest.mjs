#!/usr/bin/env node
// coverage.selftest.mjs — red-team af den uafhængige flade-deriver + komplethed-
// dommer (plan DEL VI (a)). deriveSurface testes mod et RIGTIGT git-repo (ægte
// migrations/policies); checkCoverage testes pure. Bærende: en sprunget
// disposition og et kode-punkt-som-intet-data SKAL fange (ingen tavs udeladelse).

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { deriveSurface, checkCoverage } from "./coverage.mjs";
import { makeGit } from "./git.mjs";

let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const expectGreen = (n, r) => (r.ok === true ? ok(n) : bad(n, `rød: ${r.reasons.join(" | ")}`));
const expectRed = (n, r, needle) => {
  const hit = r.reasons.some((x) => new RegExp(needle).test(x));
  !r.ok && hit
    ? ok(n)
    : bad(n, r.ok ? "GRØN (udeladelse slap igennem)" : `rød men uden '${needle}': ${r.reasons.join(" | ")}`);
};

// ---------- fixture: rigtigt repo med migrations + RLS ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-coverage-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const git = makeGit(ROOT);
git("config", "user.name", "selftest");
git("config", "user.email", "selftest@local");

const FILES = {
  "turbo.json": "{}\n",
  "tsconfig.base.json": "{}\n",
  "supabase/migrations/0001_init.sql":
    "create table salg (id uuid primary key, org_id uuid);\n" +
    "alter table salg enable row level security;\n" +
    'create policy "salg_select_egen_org" on salg for select using (org_id = auth_org());\n' +
    "create policy salg_insert on public.salg for insert with check (org_id = auth_org());\n",
  "supabase/migrations/0002_kommentar.sql":
    "-- create policy udkommenteret_skal_ikke_taelles on salg for update using (true);\n" +
    "alter table provision enable row level security;\n",
};
for (const [p, c] of Object.entries(FILES)) {
  mkdirSync(join(ROOT, dirname(p)), { recursive: true });
  writeFileSync(join(ROOT, p), c);
}
git("add", "-A");
git("commit", "-qm", "fixture: migrations + rls");
const COMMIT = git("rev-parse", "HEAD");

console.log("deriveSurface — non-LLM statisk derivation af committet tree:");
const surface = deriveSurface({ git, commitSha: COMMIT });
const ids = surface.points.map((p) => p.id);
const has = (id) => ids.includes(id);

has("migration:supabase/migrations/0001_init.sql") && has("migration:supabase/migrations/0002_kommentar.sql")
  ? ok("migrations deriveret (begge filer)")
  : bad("migrations", ids.join(", "));
has("rls_enabled:salg") && has("rls_enabled:provision")
  ? ok("RLS-enable deriveret (salg + provision)")
  : bad("rls_enabled", ids.join(", "));
has("rls_policy:salg:salg_select_egen_org") && has("rls_policy:public.salg:salg_insert")
  ? ok("RLS-policies deriveret (citeret + skema-kvalificeret navn)")
  : bad("rls_policy", ids.join(", "));
!ids.some((id) => /udkommenteret/.test(id))
  ? ok("udkommenteret DDL tælles IKKE som flade (kommentar-strip)")
  : bad("kommentar-strip", "udkommenteret policy blev deriveret");
has("config:turbo.json") && has("config:tsconfig.base.json")
  ? ok("config-filer deriveret")
  : bad("config", ids.join(", "));
JSON.stringify(deriveSurface({ git, commitSha: COMMIT }).points) === JSON.stringify(surface.points)
  ? ok("derivation er deterministisk (stabil orden)")
  : bad("determinisme", "to kørsler gav forskellig flade");

// fuld disposition-map (grøn baseline)
const fullDisp = () => {
  const d = {};
  for (const p of surface.points)
    d[p.id] = { bøtte: p.kind === "config" ? "dokument" : "nuvaerende-kode", disposition: "behandlet" };
  return d;
};

console.log("\ncheckCoverage — komplethed-dom (ingen tavs udeladelse):");
expectGreen("fuld disposition → grøn", checkCoverage(surface, fullDisp()));
expectRed(
  "sprunget flade-punkt → rød",
  checkCoverage(
    surface,
    (() => {
      const d = fullDisp();
      delete d["rls_policy:salg:salg_select_egen_org"];
      return d;
    })(),
  ),
  "uden disposition",
);
expectRed(
  "kode-punkt klassificeret intet-data → rød",
  checkCoverage(
    surface,
    (() => {
      const d = fullDisp();
      d["rls_enabled:salg"] = { bøtte: "intet-data", disposition: "behandlet" };
      return d;
    })(),
  ),
  "koden findes",
);
expectRed(
  "ugyldig bøtte → rød",
  checkCoverage(
    surface,
    (() => {
      const d = fullDisp();
      d["config:turbo.json"] = { bøtte: "vrøvl", disposition: "behandlet" };
      return d;
    })(),
  ),
  "ugyldig bøtte",
);
expectRed(
  "ugyldig disposition → rød",
  checkCoverage(
    surface,
    (() => {
      const d = fullDisp();
      d["config:turbo.json"] = { bøtte: "dokument", disposition: "måske" };
      return d;
    })(),
  ),
  "ugyldig disposition",
);
expectRed("dispositions ikke objekt → rød", checkCoverage(surface, null), "ikke et objekt");
expectRed("surface uden points → rød", checkCoverage({}, fullDisp()), "points mangler");
{
  const r = checkCoverage(
    surface,
    (() => {
      const d = fullDisp();
      delete d["rls_enabled:provision"];
      return d;
    })(),
  );
  r.uncovered.includes("rls_enabled:provision")
    ? ok("uncovered-liste peger præcist på det sprungne punkt")
    : bad("uncovered", r.uncovered.join(","));
}
// et kode-punkt må gerne være 'udskudt'/'ikke-relevant' (afgrænsning) så længe det er DISPONERET
expectGreen(
  "kode-punkt eksplicit udskudt → grøn (afgrænsning ≠ udeladelse)",
  checkCoverage(
    surface,
    (() => {
      const d = fullDisp();
      d["rls_policy:public.salg:salg_insert"] = { bøtte: "nuvaerende-kode", disposition: "udskudt" };
      return d;
    })(),
  ),
);

// ---------- Codex P2-regressioner (2026-08-11) ----------
console.log("\nCodex-fund — SQL-former der før slap forbi derivationen:");
{
  const R2 = mkdtempSync(join(tmpdir(), "v5-coverage-sql-"));
  process.on("exit", () => rmSync(R2, { recursive: true, force: true }));
  execFileSync("git", ["init", "-q", R2]);
  const g2 = makeGit(R2);
  g2("config", "user.name", "selftest");
  g2("config", "user.email", "selftest@local");
  mkdirSync(join(R2, "supabase/migrations"), { recursive: true });
  writeFileSync(
    join(R2, "supabase/migrations/0001.sql"),
    "alter table if exists public.accounts enable row level security;\n" +
      "create /* vigtig */ policy block_comment_policy on public.accounts for select using (true);\n" +
      'create policy quoted_qualified on "public"."accounts" for insert with check (true);\n' +
      'create policy "quoted""navn" on public.accounts for update using (true);\n' +
      "alter policy altered_policy on public.accounts using (true);\n",
  );
  g2("add", "-A");
  g2("commit", "-qm", "sql-kanter");
  const C2 = g2("rev-parse", "HEAD");
  const s2 = deriveSurface({ git: g2, commitSha: C2 });
  const id2 = s2.points.map((p) => p.id);
  const h2 = (id) => id2.includes(id);

  h2("rls_enabled:public.accounts")
    ? ok("ENABLE RLS med 'if exists' + skema.tabel")
    : bad("if-exists-rls", id2.join(", "));
  h2("rls_policy:public.accounts:block_comment_policy")
    ? ok("CREATE POLICY med block-kommentar mellem tokens")
    : bad("block-comment-policy", id2.join(", "));
  h2("rls_policy:public.accounts:quoted_qualified")
    ? ok('quoted-qualified tabel "public"."accounts" normaliseret korrekt')
    : bad("quoted-qualified", id2.join(", "));
  h2('rls_policy:public.accounts:quoted"navn')
    ? ok('citeret policy-navn med ""-escape')
    : bad("quoted-escape", id2.join(", "));
  h2("rls_policy:public.accounts:altered_policy")
    ? ok("ALTER POLICY deriveres (ikke kun CREATE)")
    : bad("alter-policy", id2.join(", "));
}

console.log("\nCodex-fund (genangreb) — RLS-regex krydser ikke statement-grænser:");
{
  const R3 = mkdtempSync(join(tmpdir(), "v5-coverage-stmt-"));
  process.on("exit", () => rmSync(R3, { recursive: true, force: true }));
  execFileSync("git", ["init", "-q", R3]);
  const g3 = makeGit(R3);
  g3("config", "user.name", "selftest");
  g3("config", "user.email", "selftest@local");
  mkdirSync(join(R3, "supabase/migrations"), { recursive: true });
  writeFileSync(
    join(R3, "supabase/migrations/0001.sql"),
    "alter table public.not_rls add column marker integer;\n" +
      "alter table public.real_rls enable row level security;\n" +
      "alter table only public.tredje enable row level security;\n",
  );
  g3("add", "-A");
  g3("commit", "-qm", "stmt-grænser");
  const C3 = g3("rev-parse", "HEAD");
  const id3 = deriveSurface({ git: g3, commitSha: C3 }).points.map((p) => p.id);
  id3.includes("rls_enabled:public.real_rls")
    ? ok("real_rls deriveret (regex krydser ikke ; fra forrige statement)")
    : bad("stmt-krydsning", id3.join(", "));
  !id3.includes("rls_enabled:public.not_rls")
    ? ok("not_rls IKKE fejltilskrevet (den enabler ikke RLS)")
    : bad("fejltilskrivning", id3.join(", "));
  id3.includes("rls_enabled:public.tredje") && !id3.some((x) => x === "rls_enabled:only")
    ? ok("ALTER TABLE ONLY: tabellen deriveret, ikke 'only'")
    : bad("only-tolerance", id3.join(", "));
}

console.log("\nCodex-fund (final) — kommentar-syntaks i string-literal skjuler ikke reel DDL:");
{
  const R4 = mkdtempSync(join(tmpdir(), "v5-coverage-str-"));
  process.on("exit", () => rmSync(R4, { recursive: true, force: true }));
  execFileSync("git", ["init", "-q", R4]);
  const g4 = makeGit(R4);
  g4("config", "user.name", "selftest");
  g4("config", "user.email", "selftest@local");
  mkdirSync(join(R4, "supabase/migrations"), { recursive: true });
  writeFileSync(
    join(R4, "supabase/migrations/0001.sql"),
    "select '/* ikke en kommentar, bare en streng-literal';\n" +
      "alter table public.accounts enable row level security;\n" +
      "select '*/ også bare en streng-literal';\n",
  );
  // + nested block-kommentar der SKAL strippe (rigtig kommentar)
  writeFileSync(
    join(R4, "supabase/migrations/0002.sql"),
    "/* ydre /* indre */ stadig kommentar */\nalter table public.rigtig enable row level security;\n",
  );
  g4("add", "-A");
  g4("commit", "-qm", "string-literal + nested comment");
  const C4 = g4("rev-parse", "HEAD");
  const id4 = deriveSurface({ git: g4, commitSha: C4 }).points.map((p) => p.id);
  id4.includes("rls_enabled:public.accounts")
    ? ok("reel enable-RLS mellem to '/*'-streng-literals deriveret (ikke slugt)")
    : bad("string-literal-skjul", id4.join(", "));
  id4.includes("rls_enabled:public.rigtig")
    ? ok("statement efter NESTET block-kommentar deriveret korrekt")
    : bad("nested-comment", id4.join(", "));
}

console.log("\nCodex-fund (final2) — E-strenge, dollar-quotes, identifier-normalisering:");
{
  const R5 = mkdtempSync(join(tmpdir(), "v5-coverage-final2-"));
  process.on("exit", () => rmSync(R5, { recursive: true, force: true }));
  execFileSync("git", ["init", "-q", R5]);
  const g5 = makeGit(R5);
  g5("config", "user.name", "selftest");
  g5("config", "user.email", "selftest@local");
  mkdirSync(join(R5, "supabase/migrations"), { recursive: true });
  // E-streng med \'-escape må ikke lukke for tidligt og sluge efterfølgende DDL
  writeFileSync(
    join(R5, "supabase/migrations/0001.sql"),
    "select E'har en \\' escaped quote og /* falsk kommentar';\n" +
      "alter table public.real_rls enable row level security;\n",
  );
  // dollar-quote function-body med RLS-lignende tekst → må IKKE over-derivere
  writeFileSync(
    join(R5, "supabase/migrations/0002.sql"),
    "create function f() returns void language plpgsql as $$\n" +
      "begin\n  -- alter table public.fake enable row level security;\n  perform 1;\nend;\n$$;\n" +
      "alter table public.ægte enable row level security;\n",
  );
  // identifier: unquoted uppercase → lowercase; unicode bevaret
  writeFileSync(join(R5, "supabase/migrations/0003.sql"), "alter table Public.Café enable row level security;\n");
  g5("add", "-A");
  g5("commit", "-qm", "final2-kanter");
  const C5 = g5("rev-parse", "HEAD");
  const id5 = deriveSurface({ git: g5, commitSha: C5 }).points.map((p) => p.id);
  id5.includes("rls_enabled:public.real_rls")
    ? ok("E-streng med \\'-escape sluger ikke efterfølgende DDL")
    : bad("e-string-miss", id5.join(", "));
  id5.includes("rls_enabled:public.ægte") && !id5.some((x) => /fake/.test(x))
    ? ok("dollar-quote-body over-deriverer ikke (fake ikke deriveret); top-level ægte deriveret")
    : bad("dollar-overderive", id5.join(", "));
  id5.includes("rls_enabled:public.café")
    ? ok("unquoted identifier: uppercase→lowercase + unicode bevaret (Public.Café → public.café)")
    : bad("ident-norm", id5.join(", "));
}

console.log("\nCodex-fund — git-show-fejl er fail-closed (ingen tavs tom SQL):");
{
  const fakeGit = (...args) => {
    if (args[0] === "ls-tree") return "supabase/migrations/0001.sql";
    if (args[0] === "show") throw new Error("simuleret læsefejl (fx > maxBuffer)");
    return "";
  };
  let threw = false;
  try {
    deriveSurface({ git: fakeGit, commitSha: "deadbeef" });
  } catch (e) {
    threw = /fail-closed/.test(e.message);
  }
  threw
    ? ok("ulæselig migration → deriveSurface kaster (fail-closed, ikke tom SQL)")
    : bad("git-show-fail-closed", "slugte fejlen");
}

console.log("\nCodex-fund — checkCoverage afviser arvede disposition-felter:");
expectRed(
  "disposition med prototype-felter → rød",
  checkCoverage(
    surface,
    (() => {
      const d = fullDisp();
      const anyId = surface.points[0].id;
      d[anyId] = Object.create({ bøtte: "dokument", disposition: "behandlet" });
      return d;
    })(),
  ),
  "egne felter",
);

console.log("");
if (failed > 0) {
  console.error(`coverage red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("coverage red-team: alle cases passed");
