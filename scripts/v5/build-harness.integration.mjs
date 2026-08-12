#!/usr/bin/env node
// build-harness.integration.mjs — RIGTIG-Postgres-bevis for frameworket (plan 2.C).
//
// IKKE en del af v5:selftest (CI er container-fri). Kør manuelt mod en ISOLERET
// éngangs-container (ALDRIG repoets PROD-db):
//   docker run -d --name v5-buildproof-pg -e POSTGRES_PASSWORD=test -p 55432:5432 \
//     public.ecr.aws/supabase/postgres:17.6.1.121
//   node scripts/v5/build-harness.integration.mjs
//
// Beviser mod virkelighed at frameworket (build-harness.mjs) fanger det PoC'en viste:
//   baseline afviser cross-org · WITH CHECK-true-mutant → tilladt = harness flipper
//   = mutant DRÆBT · en "findes"-signal (pg_policies) flipper IKKE = falsk-grøn.

import { execFileSync } from "node:child_process";
import { runEffectHarness, killMutant, runBuildProofEngine } from "./build-harness.mjs";

const CONTAINER = process.env.V5_PG_CONTAINER || "v5-buildproof-pg";
let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));

// --- container-tjek (spring rent over hvis den ikke kører) ---
function containerUp() {
  try {
    execFileSync("docker", ["exec", CONTAINER, "pg_isready", "-U", "postgres"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
if (!containerUp()) {
  console.log(`⚠ container '${CONTAINER}' kører ikke — springer integrations-bevis over (ikke en fejl).`);
  console.log("  Start: docker run -d --name v5-buildproof-pg -e POSTGRES_PASSWORD=test -p 55432:5432 public.ecr.aws/supabase/postgres:17.6.1.121");
  process.exit(0);
}

// --- rigtig sql-runner: SET ROLE + SET settings + sætningen i ÉN psql-session ---
function dockerPsql(sqlText, opts = {}) {
  // VERBOSITY verbose → fejl-linjen bærer SQLSTATE ("ERROR:  42501: ...") så vi kan
  // returnere en STRUKTURERET kode (ikke bare en fri streng frameworket ikke må stole på).
  const prelude = ["\\set VERBOSITY verbose"];
  if (opts.role) prelude.push(`set role ${opts.role};`);
  if (opts.settings) for (const [k, v] of Object.entries(opts.settings)) prelude.push(`set ${k} = '${String(v)}';`);
  const full = `${prelude.join("\n")}\n${sqlText}`;
  try {
    execFileSync("docker", ["exec", "-i", CONTAINER, "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1", "-q"], {
      input: full,
      stdio: ["pipe", "ignore", "pipe"],
    });
    return { ok: true, error: null, code: null };
  } catch (e) {
    const stderr = String(e.stderr || e.message);
    const m = stderr.match(/ERROR:\s+([0-9A-Z]{5}):/);
    return { ok: false, error: stderr.slice(0, 160), code: m ? m[1] : null };
  }
}
const query1 = (sqlText) => execFileSync("docker", ["exec", "-i", CONTAINER, "psql", "-U", "postgres", "-tAc", sqlText]).toString().trim();

// --- idempotent syntetisk RLS-fixture (cross-org isolation, ikke-bypass rolle) ---
console.log(`build-harness INTEGRATION mod '${CONTAINER}':`);
const setup = dockerPsql(`
  drop table if exists salg cascade;
  create table salg (id serial primary key, org_id int not null, beloeb numeric not null);
  alter table salg enable row level security;
  alter table salg force row level security;
  do $$ begin if not exists (select from pg_roles where rolname='app_role') then create role app_role; end if; end $$;
  grant app_role to postgres;
  grant select, insert on salg to app_role;
  grant usage on sequence salg_id_seq to app_role;
  drop policy if exists salg_org_isolation on salg;
  create policy salg_org_isolation on salg for all
    using (org_id = current_setting('app.current_org')::int)
    with check (org_id = current_setting('app.current_org')::int);
`);
eq("fixture opsat", setup.ok, true);

// harness: samme-org INSERT SKAL lykkes; cross-org INSERT SKAL afvises (RLS-effekt)
const harness = {
  asRole: "app_role",
  settings: { "app.current_org": "1" },
  positive: { sql: "insert into salg (org_id, beloeb) values (1, 100);" },
  negative: { sql: "insert into salg (org_id, beloeb) values (2, 100);", expectCode: "42501" },
};
// mutant: svæk WITH CHECK til true (bryder cross-org-isolationen)
const mutant = {
  knob: "with_check",
  apply: `drop policy salg_org_isolation on salg;
          create policy salg_org_isolation on salg for all
            using (org_id = current_setting('app.current_org')::int) with check (true);`,
  restore: `drop policy salg_org_isolation on salg;
            create policy salg_org_isolation on salg for all
              using (org_id = current_setting('app.current_org')::int)
              with check (org_id = current_setting('app.current_org')::int);`,
};

console.log("\neffect-harness mod rigtig RLS:");
const baseline = runEffectHarness(harness, dockerPsql);
eq("baseline green (samme-org OK, cross-org AFVIST)", baseline.green, true);
eq("  positiv lykkedes", baseline.positiveOk, true);
eq("  negativ afvist af RLS-grund", baseline.negRejectedRight, true);

console.log("\nmutation-kill mod rigtig RLS:");
const km = killMutant(mutant, harness, dockerPsql);
eq("WITH CHECK-true-mutant → DRÆBT (harnessen flippede)", km.killed, true);
eq("  policy gendannet efter", km.restored, true);

console.log("\nkontrast: 'findes'-signalet flipper IKKE (= falsk-grøn):");
const before = query1("select count(*) from pg_policies where tablename='salg';");
dockerPsql(mutant.apply, {});
const during = query1("select count(*) from pg_policies where tablename='salg';");
dockerPsql(mutant.restore, {});
eq("pg_policies-count uændret under mutanten (findes-test beviser intet)", before === during && before === "1", true);

console.log("\nfuld engine (build-proof-observationer):");
const eng = runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, dockerPsql);
eq("engine: allGreen", eng.allGreen, true);
eq("engine: allKilled", eng.allKilled, true);

// oprydning
dockerPsql("drop table if exists salg cascade;", {});

console.log("");
if (failed > 0) {
  console.error(`build-harness INTEGRATION: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("build-harness INTEGRATION: alle cases passed (mekanismen bevist mod rigtig Postgres)");
