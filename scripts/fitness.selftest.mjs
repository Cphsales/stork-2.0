#!/usr/bin/env node
// fitness.selftest.mjs — negativ-test (§3.6) for gov-3a's §3-checks.
// Beviser at de fanger overtrædelser, inkl. de falsk-grøn-klasser Codex fandt:
// #4 både-update-og-delete + trigger-final-state (drop-after-create), #7 eksakt
// undtagelses-sæt, og fail-closed for required live-checks i CI.
// Kører mod git archive HEAD (committed tree).

import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, appendFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  predicateColumns,
  classifyIdColumn,
  leadingBtreeColumns,
  secdefMarkerViolations,
  appWriteViolations,
  compareAdvisorBaseline,
} from "./fitness.mjs";

const ROOT = process.cwd();
let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};

function fixture() {
  const d = mkdtempSync(join(tmpdir(), "fittest-"));
  execSync(`git archive HEAD | tar -x -C "${d}"`, { stdio: "pipe" });
  return d;
}
function runFitness(root, extraEnv = {}) {
  try {
    const out = execSync(`node ${join(ROOT, "scripts/fitness.mjs")}`, {
      cwd: root,
      stdio: "pipe",
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: "", CI: "", ...extraEnv },
    }).toString();
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout?.toString() || "") + (e.stderr?.toString() || "") };
  }
}
function sed(d, expr) {
  const needle = expr.split("/")[1];
  execSync(`grep -rlI -- ${JSON.stringify(needle)} "${d}/supabase/migrations" | xargs sed -i ${JSON.stringify(expr)}`, {
    stdio: "pipe",
  });
}
// plant: kør en mutation på fixture, forvent specifik violation-substring + exit≠0
function plant(name, mutate, needle) {
  const d = fixture();
  mutate(d);
  const r = runFitness(d);
  r.code !== 0 && new RegExp(needle).test(r.out)
    ? ok(name)
    : bad(name, `code=${r.code}, needle "${needle}" ${new RegExp(needle).test(r.out) ? "fundet" : "IKKE fundet"}`);
  rmSync(d, { recursive: true, force: true });
}

// baseline: clean committed tree, live skippet lokalt -> static checks grønne
{
  const d = fixture();
  const r = runFitness(d);
  r.code === 0 ? ok("baseline (static checks) -> exit 0") : bad("baseline", `forventede exit 0, fik ${r.code}`);
  rmSync(d, { recursive: true, force: true });
}

// #1 fail-closed: required live-check uden token i CI -> violation (ikke skip-til-grøn)
{
  const d = fixture();
  const r = runFitness(d, { CI: "true" }); // token stadig "" -> liveGuard fail-closed
  r.code !== 0 && /SUPABASE_ACCESS_TOKEN mangler i CI/.test(r.out)
    ? ok("fail-closed: live-check uden token i CI -> violation")
    : bad("fail-closed", `code=${r.code}`);
  rmSync(d, { recursive: true, force: true });
}

// #4 update-only -> mangler delete-dækning
plant(
  "#4 update-only trigger -> fanges (delete ikke dækket)",
  (d) => sed(d, "s/before update or delete/before update/Ig"),
  "BÅDE update og delete \\(update=true, delete=false\\)",
);
// #4 delete-only -> mangler update-dækning
plant(
  "#4 delete-only trigger -> fanges (update ikke dækket)",
  (d) => sed(d, "s/before update or delete/before delete/Ig"),
  "BÅDE update og delete \\(update=false, delete=true\\)",
);
// #4 drop-after-create -> senere DROP TRIGGER fjerner immutabilitet (final-state)
plant(
  "#4 drop-after-create -> fanges (trigger final-state)",
  (d) =>
    writeFileSync(
      join(d, "supabase/migrations/99999999999999_zz_drop_immut.sql"),
      "drop trigger audit_log_immutability on core_compliance.audit_log;\n",
    ),
  "guard-trigger \\(execute audit_log_immutability_check\\) ikke fundet",
);
// #4 GUARD-specifik: pay_periods-guard ændret til delete-only, men pay_periods_set_updated_at
// (before update) intakt -> union ville false-green'e; guard-specifik check fanger det (Codex runde 3)
plant(
  "#4 guard delete-only m. set_updated_at intakt -> fanges (ikke union)",
  (d) => sed(d, "s/before update or delete on core_money.pay_periods/before delete on core_money.pay_periods/I"),
  "pay_periods_lock_and_delete_check dækker ikke BÅDE update og delete \\(update=false, delete=true\\)",
);
// #7 manglende mutable-flag i guard
plant(
  "#7 guard mangler mutable-flag -> fanges",
  (d) => sed(d, "s/is_candidate/zz_renamed/g"),
  "undtager ikke mutable-flag",
);
// #7 EKSTRA undtaget felt -> for bredt (et snapshot-felt gjort mutérbart)
plant(
  "#7 guard undtager ekstra felt -> fanges",
  (d) => sed(d, "s/- 'candidate_run_id'/- 'candidate_run_id' - 'gross_amount'/g"),
  "undtager EKSTRA felt",
);

// #4 SAME-FILE drop+recreate table uden trigger -> final-state har immutable tabel uden trigger
// (Codex runde 2: ordnet op-stream pr. migration, ikke create-så-drop i to passes)
plant(
  "#4 same-file drop+recreate table uden trigger -> fanges",
  (d) =>
    writeFileSync(
      join(d, "supabase/migrations/99999999999998_core_money_recreate_cancel.sql"),
      "drop table core_money.cancellations;\ncreate table core_money.cancellations (id uuid primary key);\n",
    ),
  "guard-trigger \\(execute cancellations_immutability_check\\) ikke fundet",
);
// #7 old/new-sammenligning fjernet (if false then) -> guard raiser ikke ved snapshot-felt-ændring
plant(
  "#7 old/new-sammenligning fjernet -> fanges",
  (d) => sed(d, "s/if v_old <> v_new then/if false then/Ig"),
  "ingen old/new-sammenligning",
);

// ─── gov-3b-1: rene-helper unit-tests (#19 FK-dækning + #6 indeks-pr-policy) ──
// Behavioral bevis uden DB: parserne fanger brud (ikke kun grøn mod main).
{
  const eq = (n, got, want) =>
    got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, ville ${JSON.stringify(want)}`);

  // #6 predicateColumns
  eq(
    "#6 session-var-gate -> ingen prædikat-kolonne",
    predicateColumns("(current_setting('stork.allow_x_write', true) = 'true'::text)", ["id", "status"], "core_x.t")
      .size,
    0,
  );
  {
    const r = predicateColumns("(auth_user_id = auth.uid())", ["auth_user_id", "id"], "core_identity.employees");
    r.has("auth_user_id") && !r.has("uid") && r.size === 1
      ? ok("#6 reel kolonne auth_user_id (ikke auth.uid)")
      : bad("#6 auth_user_id", [...r].join(","));
  }
  {
    // Codex HØJ-negativ-test: fremmed-alias act.id må IKKE blive pending_changes.id
    const r = predicateColumns(
      "exists (select 1 from core_identity.permission_actions act where act.id = action_id)",
      ["id", "action_id", "requested_by"],
      "core_identity.pending_changes",
    );
    r.has("action_id") && !r.has("id")
      ? ok("#6 Codex-negativ: act.id -> {action_id}, ikke {id}")
      : bad("#6 act.id falsk-match", [...r].join(","));
  }
  {
    // Codex build-review HØJ: fuld schema.table.column må heller ikke efterlade ".id"
    const r = predicateColumns(
      "exists (select 1 from core_identity.permission_actions where core_identity.permission_actions.id = action_id)",
      ["id", "action_id", "requested_by"],
      "core_identity.pending_changes",
    );
    r.has("action_id") && !r.has("id")
      ? ok("#6 schema-kvalificeret fremmed ref -> {action_id}, ikke {id}")
      : bad("#6 schema-kvalificeret fremmed ref", [...r].join(","));
  }
  {
    const r = predicateColumns(
      "pending_changes.requested_by = current_employee_id()",
      ["requested_by"],
      "core_identity.pending_changes",
    );
    r.has("requested_by")
      ? ok("#6 eksplicit current-table-kvalificering tælles")
      : bad("#6 requested_by", [...r].join(","));
  }
  eq(
    "#6 setting-streng m. tabel-navn -> ingen falsk kolonne",
    predicateColumns("current_setting('stork.allow_clients_write', true)='true'", ["id"], "core_identity.clients").size,
    0,
  );
  {
    const lead = leadingBtreeColumns([
      { tbl: "core_identity.pending_changes", col: "action_id", amname: "hash" },
      { tbl: "core_identity.pending_changes", col: "requested_by", amname: "btree" },
    ]);
    const cols = lead.get("core_identity.pending_changes") || new Set();
    cols.has("requested_by") && !cols.has("action_id")
      ? ok("#6 non-btree leading index tæller ikke som dækning")
      : bad("#6 non-btree index", [...cols].join(","));
  }

  // #19 classifyIdColumn
  const cv = (k, o) => classifyIdColumn(k, o);
  eq("#19 PK -> null", cv("core_identity.org_node_versions.version_id", { isPK: true, hasFK: false }), null);
  eq("#19 hasFK -> null", cv("core_money.commission_snapshots.employee_id", { isPK: false, hasFK: true }), null);
  eq("#19 exemption -> null", cv("core_money.cancellations.match_id", { isPK: false, hasFK: false }), null);
  eq(
    "#19 FK_PENDING m. target fraværende -> null",
    cv("core_money.cancellations.source_sale_id", { isPK: false, hasFK: false, targetExists: false }),
    null,
  );
  {
    const v = cv("core_money.cancellations.source_sale_id", { isPK: false, hasFK: false, targetExists: true });
    v && /grace udløbet/.test(v)
      ? ok("#19 FK_PENDING selv-udløb: target findes uden FK -> violation")
      : bad("#19 selv-udløb", String(v));
  }
  {
    const v = cv("core_money.cancellations.mystery_id", { isPK: false, hasFK: false });
    v && /uden FK/.test(v) ? ok("#19 ukendt *_id uden FK -> violation") : bad("#19 ukendt", String(v));
  }
}

// ─── gov-3b-2: ren-helper unit-tests (#10 SECDEF-markør-disciplin) ──
// Mekanisk §3.6-bevis uden live-DB: baseline grøn, trigger OK, ukendt SECDEF, stale allowlist-entry.
{
  const sanctioned = { "s.f(uuid)": "write-rpc" };
  // baseline: trigger-row + sanctioned-row -> ingen violations
  secdefMarkerViolations(
    [
      { key: "s.trig()", returnsTrigger: true },
      { key: "s.f(uuid)", returnsTrigger: false },
    ],
    sanctioned,
  ).length === 0
    ? ok("#10 baseline (trigger + sanctioned) -> 0 violations")
    : bad("#10 baseline", "forventede 0 violations");
  // trigger-funktion ikke i allowlist -> stadig OK
  secdefMarkerViolations([{ key: "s.onlytrigger()", returnsTrigger: true }], {}).length === 0
    ? ok("#10 trigger uden allowlist-entry -> OK")
    : bad("#10 trigger OK", "trigger må passere uden markør");
  // ukendt non-trigger SECDEF (tom allowlist, isolerer unknown-grenen) -> præcis 1 violation
  {
    const v = secdefMarkerViolations([{ key: "s.ny(uuid)", returnsTrigger: false }], {});
    v.length === 1 && /uden markør/.test(v[0])
      ? ok("#10 ukendt SECDEF uden markør -> violation")
      : bad("#10 ukendt SECDEF", JSON.stringify(v));
  }
  // stale allowlist-entry (ingen matchende live-row) -> violation
  {
    const v = secdefMarkerViolations([{ key: "s.f(uuid)", returnsTrigger: false }], {
      "s.f(uuid)": "write-rpc",
      "s.gone()": "write-rpc",
    });
    v.length === 1 && /fjern entry/.test(v[0])
      ? ok("#10 stale allowlist-entry -> violation")
      : bad("#10 stale entry", JSON.stringify(v));
  }
}

// ─── gov-3b-3b: ren-helper unit-tests (#18 app-write-REVOKE-disciplin) ──
// Mekanisk §3.6-bevis uden live-DB: ren tilstand, app-rolle-write fanges, exemption respekteres.
{
  // ren tilstand (ingen app-rolle-write) -> 0 violations
  appWriteViolations([], {}).length === 0
    ? ok("#18 ingen app-write -> 0 violations")
    : bad("#18 baseline", "forventede 0");
  // app-rolle med write på core_* -> violation
  {
    const v = appWriteViolations([{ tbl: "core_identity.clients", role: "authenticated", priv: "INSERT" }], {});
    v.length === 1 && /skal skrive via SECURITY DEFINER-RPC/.test(v[0])
      ? ok("#18 authenticated INSERT på core_* -> violation")
      : bad("#18 violation", JSON.stringify(v));
  }
  // exemption -> skippes
  appWriteViolations([{ tbl: "core_identity.clients", role: "authenticated", priv: "INSERT" }], {
    "core_identity.clients.authenticated.INSERT": "begrundet undtagelse",
  }).length === 0
    ? ok("#18 exemption -> skippes")
    : bad("#18 exemption", "forventede 0");
}

// ---------- advisor-baseline (G066) — compare-logikken bider begge veje ----------
{
  const base = { secdef_exposed: ["public.f(a int)"], rls_no_policy: ["core_x.t"] };
  compareAdvisorBaseline({ secdef_exposed: ["public.f(a int)"], rls_no_policy: ["core_x.t"] }, base).length === 0
    ? ok("advisor-baseline match -> 0 violations")
    : bad("advisor-baseline match", "forventede 0");
  const ny = compareAdvisorBaseline(
    { secdef_exposed: ["public.f(a int)", "public.NY(b text)"], rls_no_policy: ["core_x.t"] },
    base,
  );
  ny.length === 1 && /NY secdef_exposed/.test(ny[0])
    ? ok("advisor-baseline ny eksponering -> roed")
    : bad("advisor-baseline ny", `fik ${ny.length}: ${ny[0] || ""}`);
  const fjernet = compareAdvisorBaseline({ secdef_exposed: [], rls_no_policy: ["core_x.t"] }, base);
  fjernet.length === 1 && /findes ikke laengere live/.test(fjernet[0])
    ? ok("advisor-baseline fjernet entry -> roed (stram baselinen)")
    : bad("advisor-baseline fjernet", `fik ${fjernet.length}`);
}

if (failed) {
  console.error(`\nfitness selftest FEJLEDE (${failed})`);
  process.exit(1);
}
console.log("\nfitness selftest: alle cases passed");
