#!/usr/bin/env node
// gate-eval.selftest.mjs — red-team af server-side dommer-broen (plan DEL VI (a)).
// Beviser at buildSnapshot resolver artefakt+bindinger fra RÅ git via layoutet
// (inkl. <pakke>-substitution) og integrerer med evaluateGate ende-til-ende.

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { buildSnapshot, DEFAULT_LAYOUT } from "./gate-eval.mjs";
import { evaluateGate } from "./gates.mjs";
import { makeGit, resolveRef } from "./git.mjs";
import { deriveSurface } from "./coverage.mjs";
import { makeProofVerifier } from "./proofs.mjs";

let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};

// ---------- fixture ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-gate-eval-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const git = makeGit(ROOT);
git("config", "user.name", "selftest");
git("config", "user.email", "selftest@local");

const PAKKE = "pakke-x";
const FILES = {
  "launch/launch.json": JSON.stringify({ anker: PAKKE, pakke: PAKKE }) + "\n",
  "recon/bundle.json":
    JSON.stringify({
      docs: ["vision.md"],
      // flade_filter PÅKRÆVET for recon-gaten (fravær = rød) — dækker fixture-fladen
      flade_filter: { punkt_ids: ["migration:supabase/migrations/0001.sql", "rls_enabled:salg", "rls_policy:salg:salg_egen"] },
    }) + "\n",
  "recon/recon.md": "# recon\n",
  [`plan-build/${PAKKE}/recon2.md`]: "# recon2\n",
  [`docs/sandhed/krav/${PAKKE}-krav.md`]: "# krav\n## K-1\nAcceptkriterie: negativ.\n",
  [`plan-build/${PAKKE}/plan.md`]: "# plan\n",
  "supabase/migrations/0001.sql":
    "alter table salg enable row level security;\n" +
    'create policy "salg_egen" on salg for select using (org_id = auth_org());\n',
};
for (const [p, c] of Object.entries(FILES)) {
  mkdirSync(join(ROOT, dirname(p)), { recursive: true });
  writeFileSync(join(ROOT, p), c);
}
git("add", "-A");
git("commit", "-qm", "fixture");
const COMMIT = git("rev-parse", "HEAD");

// recon-coverage-proof-input (fuld dækning), som i proofs.selftest
const bundle = resolveRef(git, COMMIT, "recon/bundle.json");
const launch = resolveRef(git, COMMIT, "launch/launch.json");
const recon = resolveRef(git, COMMIT, "recon/recon.md");
const reconProof = () => {
  const bucket_map = {};
  for (const p of deriveSurface({ git, commitSha: COMMIT }).points)
    bucket_map[p.id] = p.kind === "config" ? "dokument" : "nuvaerende-kode";
  return {
    ok: true,
    gate_id: "recon",
    proof_kind: "recon-coverage",
    artifact_oid: recon.oid,
    bindings_oids: { anker: launch.oid, bundle: bundle.oid },
    bucket_map,
    independence: {
      bundle_oid: bundle.oid,
      actors: ["code", "codex", "claude-ai"].map((a) => ({
        aktor: a,
        workdir_attest: true,
        web_forbud_attest: true,
        read_forbud_attest: true,
      })),
    },
    conflicts_preserved: true,
    omission_devil: { conclusion: "PASS", filter_angreb: "PASS", pakke_flade_angreb: "PASS" },
  };
};

console.log("buildSnapshot — git-resolution af artefakt + bindinger:");
{
  const snap = buildSnapshot("recon", { git, commitSha: COMMIT, pakke: PAKKE, proofResult: reconProof() });
  snap.artifact?.path === "recon/recon.md"
    ? ok("recon-artefakt resolvet fra git")
    : bad("recon-artifact", JSON.stringify(snap.artifact));
  snap.bindings.anker?.path === "launch/launch.json" && snap.bindings.bundle?.path === "recon/bundle.json"
    ? ok("recon-bindinger (anker+bundle) resolvet")
    : bad("recon-bindings", JSON.stringify(snap.bindings));
}
{
  // <pakke>-substitution i krav/plan-stier
  const snap = buildSnapshot("krav", { git, commitSha: COMMIT, pakke: PAKKE });
  snap.artifact?.path === `docs/sandhed/krav/${PAKKE}-krav.md`
    ? ok("krav-artefakt-sti <pakke>-substitueret korrekt")
    : bad("krav-path", JSON.stringify(snap.artifact));
  snap.bindings.recon?.path === "recon/recon.md" && snap.bindings.anker?.path === "launch/launch.json"
    ? ok("krav-bindinger resolvet")
    : bad("krav-bindings", JSON.stringify(snap.bindings));
}
{
  const snap = buildSnapshot("plan", { git, commitSha: COMMIT, pakke: PAKKE });
  snap.bindings.recon2?.path === `plan-build/${PAKKE}/recon2.md`
    ? ok("plan-binding recon2 <pakke>-substitueret")
    : bad("recon2", JSON.stringify(snap.bindings.recon2));
}

console.log("\nende-til-ende — buildSnapshot + evaluateGate (recon-gaten):");
{
  const snap = buildSnapshot("recon", { git, commitSha: COMMIT, pakke: PAKKE, proofResult: reconProof() });
  const r = evaluateGate("recon", snap, { verifyProof: makeProofVerifier({ git }) });
  r.open ? ok("recon-gaten ÅBNER via gate-eval-broen") : bad("e2e-grøn", r.reasons.join(" | "));
}
{
  // manglende binding-fil (layout peger forkert) → rød
  const layout = { ...DEFAULT_LAYOUT, bundle: "findes/ikke.json" };
  const snap = buildSnapshot("recon", { git, commitSha: COMMIT, pakke: PAKKE, layout, proofResult: reconProof() });
  const r = evaluateGate("recon", snap, { verifyProof: makeProofVerifier({ git }) });
  !r.open && r.reasons.some((x) => /binding 'bundle'/.test(x))
    ? ok("manglende binding-fil → gaten lukker (fail-closed)")
    : bad("e2e-manglende-binding", r.open ? "ÅBNEDE" : r.reasons.join(" | "));
}
{
  // ukendt pakke → artefakt findes ikke → rød (ikke kast)
  const snap = buildSnapshot("krav", { git, commitSha: COMMIT, pakke: "findes-ikke" });
  snap.artifact === null
    ? ok("ukendt pakke → artefakt-ref null (evaluateGate fail-lukker)")
    : bad("ukendt-pakke", JSON.stringify(snap.artifact));
}

console.log("\nCodex-fund — tree (mappe) på artefakt-sti åbner IKKE gaten:");
{
  // byg et commit hvor 'recon/recon.md' er en MAPPE, ikke en fil
  const R2 = mkdtempSync(join(tmpdir(), "v5-tree-"));
  process.on("exit", () => rmSync(R2, { recursive: true, force: true }));
  execFileSync("git", ["init", "-q", R2]);
  const g2 = makeGit(R2);
  g2("config", "user.name", "selftest");
  g2("config", "user.email", "selftest@local");
  for (const [p, c] of Object.entries({
    "launch/launch.json": "{}\n",
    "recon/bundle.json": "{}\n",
    "recon/recon.md/ikke-artefaktet.txt": "recon.md er en MAPPE her\n", // tree, ikke blob
    "supabase/migrations/0001.sql": "alter table salg enable row level security;\n",
  })) {
    mkdirSync(join(R2, dirname(p)), { recursive: true });
    writeFileSync(join(R2, p), c);
  }
  g2("add", "-A");
  g2("commit", "-qm", "recon.md som mappe");
  const C2 = g2("rev-parse", "HEAD");
  const snap = buildSnapshot("recon", { git: g2, commitSha: C2, pakke: PAKKE });
  snap.artifact?.type === "tree"
    ? ok("buildSnapshot resolver tree-stien (som forventet input)")
    : bad("tree-resolve", JSON.stringify(snap.artifact));
  const r = evaluateGate("recon", snap, { verifyProof: makeProofVerifier({ git: g2 }) });
  !r.open && r.reasons.some((x) => /artifact-ref mangler\/ugyldig/.test(x))
    ? ok("tree-artefakt → gaten LUKKER (blob kræves; fil-artefakt findes ikke)")
    : bad("tree-artefakt", r.open ? "ÅBNEDE på en mappe!" : r.reasons.join(" | "));
}

console.log("\nfail-closed input-validering:");
const throws = (n, fn, needle) => {
  try {
    fn();
    bad(n, "kastede ikke");
  } catch (e) {
    new RegExp(needle).test(e.message) ? ok(n) : bad(n, `forkert fejl: ${e.message}`);
  }
};
throws("ukendt gate → kast", () => buildSnapshot("vrøvl", { git, commitSha: COMMIT, pakke: PAKKE }), "ukendt gate");
throws(
  "pakke med traversal → kast",
  () => buildSnapshot("krav", { git, commitSha: COMMIT, pakke: "../etc" }),
  "ugyldig pakke",
);
throws("tom commitSha → kast", () => buildSnapshot("recon", { git, commitSha: "", pakke: PAKKE }), "pinned commit-OID");
throws(
  "ikke-pinned ref (HEAD) → kast",
  () => buildSnapshot("recon", { git, commitSha: "HEAD", pakke: PAKKE }),
  "pinned commit-OID",
);
throws("git-dep mangler → kast", () => buildSnapshot("recon", { commitSha: COMMIT, pakke: PAKKE }), "git-dep mangler");

console.log("");
if (failed > 0) {
  console.error(`gate-eval red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("gate-eval red-team: alle cases passed");
