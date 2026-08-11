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

console.log("");
if (failed > 0) {
  console.error(`coverage red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("coverage red-team: alle cases passed");
