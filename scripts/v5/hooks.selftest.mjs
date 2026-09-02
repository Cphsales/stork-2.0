#!/usr/bin/env node
// hooks.selftest.mjs — red-team af path-klassificeringen + skrive-beslutningen
// (plan DEL VI (a)). Path-matching er et klassisk falsk-grøn-sted (traversal,
// segment-grænser, absolut vs. relativ) — derfor hård, konkret afprøvning.

import { pathZone, writeDecision, buildWriteDecision, toRepoRel } from "./hooks.mjs";

const ROOT = "/home/mathias/stork-implplan";
let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const eqZone = (path, want) => {
  const got = pathZone(path, ROOT);
  got === want ? ok(`${path || "(tom)"} → ${want}`) : bad(path, `forventede ${want}, fik ${got}`);
};
const denies = (n, args) => {
  const r = writeDecision(args);
  r.decision === "deny" ? ok(n) : bad(n, `forventede deny, fik allow (zone=${r.zone})`);
};
const allows = (n, args) => {
  const r = writeDecision(args);
  r.decision === "allow" ? ok(n) : bad(n, `forventede allow, fik deny (${r.reason})`);
};

console.log("pathZone — måle-lag (segment-sikker):");
eqZone("scripts/v5/gates.mjs", "maale-lag");
eqZone("scripts/v5", "maale-lag");
eqZone("test/v5/foo.selftest.mjs", "maale-lag");
eqZone(".claude/settings.json", "maale-lag");
eqZone(".github/workflows/ci.yml", "maale-lag");
eqZone(".workflow-state/gate.json", "maale-lag");
eqZone(`${ROOT}/scripts/v5/gates.mjs`, "maale-lag"); // absolut sti
eqZone("scripts/../scripts/v5/gates.mjs", "maale-lag"); // .. -normalisering

console.log("\npathZone — IKKE måle-lag (segment-grænse holder):");
eqZone("scripts/v5x/foo.mjs", "produkt"); // v5x ≠ v5
eqZone("scripts/v51/foo.mjs", "produkt");
eqZone("scripts/foo.mjs", "produkt");
eqZone(".githubx/workflows/ci.yml", "produkt");
eqZone(".github/workflowsx/ci.yml", "produkt");

console.log("\npathZone — sandhed:");
eqZone("docs/sandhed/vision.md", "sandhed");
eqZone("docs/sandhed/krav/pakke-x-krav.md", "sandhed");
eqZone("docs/sandhedx/foo.md", "produkt"); // segment-grænse
eqZone("docs/teknik/master-plan.md", "produkt");

console.log("\npathZone — produkt + udenfor:");
eqZone("apps/web/src/route.ts", "produkt");
eqZone("supabase/migrations/0001.sql", "produkt");
eqZone("../uden-for-repo.txt", "udenfor");
eqZone("/etc/passwd", "udenfor"); // absolut escape
eqZone("scripts/v5/../../../etc/passwd", "udenfor"); // traversal-escape
eqZone("", "udenfor");

console.log("\ntoRepoRel — escape-detektion:");
toRepoRel("../x", ROOT).escapes ? ok(".. escaper") : bad("escape", "ikke fanget");
toRepoRel("/tmp/x", ROOT).escapes ? ok("absolut uden for repo escaper") : bad("escape-abs", "ikke fanget");
!toRepoRel("scripts/v5/x", ROOT).escapes ? ok("normal sti escaper ikke") : bad("escape-normal", "falsk escape");
toRepoRel("", ROOT).escapes ? ok("tom sti = escape (fail-closed)") : bad("escape-tom", "ikke fanget");

console.log("\nwriteDecision — fail-closed forbygning:");
denies("sandhed altid deny (før plan)", { rawPath: "docs/sandhed/vision.md", repoRoot: ROOT, planLocked: false });
denies("sandhed altid deny (efter plan)", { rawPath: "docs/sandhed/vision.md", repoRoot: ROOT, planLocked: true });
denies("måle-lag altid deny (før plan)", { rawPath: "scripts/v5/gates.mjs", repoRoot: ROOT, planLocked: false });
denies("måle-lag altid deny (efter plan)", { rawPath: "scripts/v5/gates.mjs", repoRoot: ROOT, planLocked: true });
denies("udenfor deny", { rawPath: "/etc/passwd", repoRoot: ROOT, planLocked: true });

console.log("\nwriteDecision — krav-upload-ruten (smal driver-rute, sandhed-protect ellers intakt):");
{
  const mandat = { pakke: "pakke-x", udkastBlobOid: "a".repeat(40) };
  const r1 = writeDecision({ rawPath: "docs/sandhed/krav/pakke-x-krav.md", repoRoot: ROOT, planLocked: false, kravUpload: mandat });
  r1.decision === "allow" ? ok("gyldigt mandat + eksakt krav-sti → allow") : bad("krav-allow", r1.reason);
  const r2 = writeDecision({ rawPath: "docs/sandhed/vision.md", repoRoot: ROOT, planLocked: false, kravUpload: mandat });
  r2.decision === "deny" ? ok("mandat åbner IKKE andre sandhed-stier") : bad("krav-scope", "ALLOW (falsk-grøn)");
  const r3 = writeDecision({ rawPath: "docs/sandhed/krav/pakke-y-krav.md", repoRoot: ROOT, planLocked: false, kravUpload: mandat });
  r3.decision === "deny" ? ok("mandat åbner IKKE en anden pakkes krav-sti") : bad("krav-pakke", "ALLOW (falsk-grøn)");
  const r4 = writeDecision({ rawPath: "docs/sandhed/krav/pakke-x-krav.md", repoRoot: ROOT, planLocked: false, kravUpload: { pakke: "pakke-x", udkastBlobOid: "ikke-en-oid" } });
  r4.decision === "deny" ? ok("ugyldig udkast-OID → deny") : bad("krav-oid", "ALLOW (falsk-grøn)");
  const r5 = writeDecision({ rawPath: "docs/sandhed/krav/pakke-x-krav.md", repoRoot: ROOT, planLocked: false, kravUpload: { pakke: "../evil", udkastBlobOid: "a".repeat(40) } });
  r5.decision === "deny" ? ok("traversal-pakkenavn → deny (PAKKE_RE)") : bad("krav-traversal", "ALLOW (falsk-grøn)");
  const r6 = writeDecision({ rawPath: "docs/sandhed/krav/pakke-x-krav.md", repoRoot: ROOT, planLocked: false, kravUpload: Object.create({ pakke: "pakke-x", udkastBlobOid: "a".repeat(40) }) });
  r6.decision === "deny" ? ok("arvet/prototype-mandat → deny (egne felter)") : bad("krav-proto", "ALLOW (falsk-grøn)");
  const r7 = writeDecision({ rawPath: "docs/sandhed/krav/pakke-x-krav.md", repoRoot: ROOT, planLocked: false });
  r7.decision === "deny" ? ok("uden mandat er krav-stien stadig deny") : bad("krav-udenmandat", "ALLOW (falsk-grøn)");
}
denies("produkt før plan-laast deny (default-deny)", {
  rawPath: "apps/web/src/x.ts",
  repoRoot: ROOT,
  planLocked: false,
});
allows("produkt efter plan-laast allow", { rawPath: "apps/web/src/x.ts", repoRoot: ROOT, planLocked: true });
denies("produkt default planLocked (udeladt = false)", { rawPath: "apps/web/src/x.ts", repoRoot: ROOT });

console.log("\nCodex P2-regressioner (2026-08-11):");
eqZone("scripts\\v5\\gates.mjs", "maale-lag"); // backslash → separator (fail-closed)
eqZone("docs\\sandhed\\vision.md", "sandhed");
eqZone(".github\\workflows\\ci.yml", "maale-lag");
denies("backslash måle-lag deny (efter plan)", { rawPath: "scripts\\v5\\x.mjs", repoRoot: ROOT, planLocked: true });
denies('planLocked="false" (truthy string) → deny', { rawPath: "apps/web/x.ts", repoRoot: ROOT, planLocked: "false" });
denies("planLocked=1 (truthy tal) → deny", { rawPath: "apps/web/x.ts", repoRoot: ROOT, planLocked: 1 });
denies("planLocked={} (truthy objekt) → deny", { rawPath: "apps/web/x.ts", repoRoot: ROOT, planLocked: {} });
allows("planLocked===true (ægte) → allow", { rawPath: "apps/web/x.ts", repoRoot: ROOT, planLocked: true });
for (const [label, arg] of [
  ["null", null],
  ["undefined", undefined],
  ["streng", "scripts/v5/x"],
  ["tal", 42],
]) {
  let r, threw;
  try {
    r = writeDecision(arg);
  } catch {
    threw = true;
  }
  !threw && r?.decision === "deny"
    ? ok(`writeDecision(${label}) → deny (kaster ikke, fail-closed)`)
    : bad(`ugyldigt-input-${label}`, threw ? "kastede" : r?.decision);
}

console.log("\nCodex-fund (genangreb) — top-level prototype-input:");
{
  const gyldig = { rawPath: "apps/web/x.ts", repoRoot: ROOT, planLocked: true };
  const proto = Object.create(gyldig); // arvede felter, egne = []
  const r = writeDecision(proto);
  r.decision === "deny"
    ? ok("Object.create(gyldig-input) → deny (ikke-standard prototype)")
    : bad("proto-input", r.decision);
}

console.log("\nbuildWriteDecision — attack-spec-gate (build-fase, plan 2.E):");
const bwAllows = (n, args) => {
  const r = buildWriteDecision(args);
  r.decision === "allow" ? ok(n) : bad(n, `deny: ${r.reason}`);
};
const bwDenies = (n, args, needle) => {
  const r = buildWriteDecision(args);
  const hit = !needle || new RegExp(needle).test(r.reason);
  r.decision === "deny" && hit ? ok(n) : bad(n, r.decision === "deny" ? `deny men uden '${needle}': ${r.reason}` : "ALLOW (falsk-grøn)");
};
const buildOk = { rawPath: "apps/web/x.ts", repoRoot: ROOT, planLocked: true, driverRouted: true, bidId: "bid-1", bidAngrebsSpecCommitted: true };
bwAllows("driver-routet produkt-skriv m. bid + committet angrebs-spec → allow", buildOk);
bwDenies("direkte skrivevej (ikke driver-routet)", { ...buildOk, driverRouted: false }, "uden om driveren");
bwDenies("driver-routet men uden aktiv bid", { ...buildOk, bidId: "" }, "uden aktiv bid");
bwDenies("bid uden committet angrebs-spec (angreb foreligger ikke)", { ...buildOk, bidAngrebsSpecCommitted: false }, "committet angrebs-spec");
bwDenies("før plan-laast (default-deny)", { ...buildOk, planLocked: false }, "plan-laast");
bwDenies("måle-lags-skriv (uanset build-flag)", { ...buildOk, rawPath: "scripts/v5/x.mjs" }, "måle-laget");
bwDenies("sandhed-skriv", { ...buildOk, rawPath: "docs/sandhed/x.md" }, "Mathias' bord");
bwDenies("uden for repo", { ...buildOk, rawPath: "../etc/passwd" }, "uden for repo");
// eksplicit true påkrævet — truthy må ALDRIG åbne (auto-fix-makro der sætter driverRouted:'ja')
bwDenies("driverRouted truthy-men-ikke-true", { ...buildOk, driverRouted: "ja" }, "uden om driveren");
bwDenies("bidAngrebsSpecCommitted truthy-men-ikke-true", { ...buildOk, bidAngrebsSpecCommitted: 1 }, "committet angrebs-spec");
bwDenies("malformeret input (null)", null, "ugyldigt input");
{
  const proto = Object.create(buildOk);
  const r = buildWriteDecision(proto);
  r.decision === "deny" ? ok("Object.create(gyldig) → deny (prototype-input)") : bad("bw-proto", r.decision);
}
// Codex-P2 #B1: accessor/symbol/ukendt eget felt i input → deny (ustabile værdier)
{
  const inp = { repoRoot: ROOT, planLocked: true, bidId: "bid-1", bidAngrebsSpecCommitted: true };
  let n = 0;
  Object.defineProperty(inp, "rawPath", { enumerable: true, get: () => (n++ === 0 ? "apps/web/x.ts" : "scripts/v5/hooks.mjs") });
  Object.defineProperty(inp, "driverRouted", { enumerable: true, value: true });
  bwDenies("accessor rawPath (god-under-check, ond-bagefter) → deny", inp, "accessor");
}
{
  const inp = { rawPath: "apps/web/x.ts", repoRoot: ROOT, planLocked: true, bidId: "bid-1", bidAngrebsSpecCommitted: true };
  Object.defineProperty(inp, "driverRouted", { enumerable: true, get: () => true });
  bwDenies("accessor driverRouted → deny", inp, "accessor");
}
bwDenies("symbol-nøgle i input → deny", { ...buildOk, [Symbol("x")]: 1 }, "symbol-nøgle");
bwDenies("ukendt felt i input → deny", { ...buildOk, sneaky: 1 }, "ukendt felt");
// Object.prototype-forurening må ikke levere fakta til et tomt {} (læser kun egne data)
{
  const vals = { rawPath: "apps/web/x.ts", repoRoot: ROOT, planLocked: true, driverRouted: true, bidId: "bid-1", bidAngrebsSpecCommitted: true };
  for (const k of Object.keys(vals)) Object.prototype[k] = vals[k];
  let r;
  try {
    r = buildWriteDecision({});
  } finally {
    for (const k of Object.keys(vals)) delete Object.prototype[k];
  }
  r.decision === "deny" ? ok("Object.prototype-forurenede felter → deny (kun egne data læses)") : bad("bw-objproto", "ALLOW (falsk-grøn)");
}

console.log("");
if (failed > 0) {
  console.error(`hooks red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("hooks red-team: alle cases passed");
