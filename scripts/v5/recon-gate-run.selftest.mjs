#!/usr/bin/env node
// recon-gate-run.selftest.mjs — red-team af gate-transporten (udfør-siden).
// Falsk-grøn-klasserne: manglende/manipuleret proof-fil · manglende launch ·
// crash-som-grøn (top-guard) · ægte grøn sti mod rigtigt git-fixture.

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { runReconGate } from "./recon-gate-run.mjs";
import { makeGit } from "./git.mjs";

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };

// ---------- fixture: komplet gate-klar repo ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-gaterun-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const git = makeGit(ROOT);
git("config", "user.name", "selftest");
git("config", "user.email", "selftest@local");

const write = (p, c) => {
  mkdirSync(join(ROOT, dirname(p)), { recursive: true });
  writeFileSync(join(ROOT, p), c);
};
const commit = (msg) => {
  git("add", "-A");
  git("commit", "-qm", msg);
  return git("rev-parse", "HEAD");
};

write("launch/launch.json", JSON.stringify({ anker: "a", anker_sha: "x", pakke: "pakke-x", author: "mgrubak" }) + "\n");
write(
  "recon/bundle.json",
  JSON.stringify({
    flade_filter: { punkt_ids: ["migration:supabase/migrations/0001.sql", "rls_enabled:salg", "rls_policy:salg:salg_egen"] },
  }) + "\n",
);
write("recon/recon.md", "# recon — pakke-x\n");
write(
  "supabase/migrations/0001.sql",
  "alter table salg enable row level security;\n" + 'create policy "salg_egen" on salg for select using (org_id = auth_org());\n',
);
const proof = () => ({
  bucket_map: {
    "migration:supabase/migrations/0001.sql": "nuvaerende-kode",
    "rls_enabled:salg": "nuvaerende-kode",
    "rls_policy:salg:salg_egen": "nuvaerende-kode",
  },
  independence: {
    bundle_oid: null, // udfyldes efter commit (kend OID først da)
    actors: ["code", "codex", "claude-ai"].map((a) => ({
      aktor: a,
      workdir_attest: true,
      web_forbud_attest: true,
      read_forbud_attest: true,
    })),
  },
  conflicts_preserved: true,
  omission_devil: { conclusion: "PASS", filter_angreb: "PASS", pakke_flade_angreb: "PASS" },
});
// to-trins-commit: først alt andet, så proof med korrekt bundle-OID
let C = commit("fixture uden proof");
const bundleOid = git("rev-parse", `${C}:recon/bundle.json`);
const p = proof();
p.independence.bundle_oid = bundleOid;
write("recon/recon-coverage-proof.json", JSON.stringify(p) + "\n");
C = commit("fixture med proof");

console.log("runReconGate — grøn sti:");
{
  const r = runReconGate(C, { root: ROOT });
  r.open === true ? ok("komplet fixture → gaten åbner") : bad("grøn", r.reasons?.join("; "));
}

console.log("\nrunReconGate — fail-closed:");
{
  const r = runReconGate(git("rev-parse", `${C}^`), { root: ROOT });
  r.open === false && r.reasons.some((x) => x.includes("proof_result mangler"))
    ? ok("manglende proof-fil → rød (ikke crash)")
    : bad("uden-proof", JSON.stringify(r));
}
{
  // manipuleret proof: et flade-punkt fjernet fra bucket_map → frisk re-derivation fanger det
  const p2 = proof();
  p2.independence.bundle_oid = bundleOid;
  delete p2.bucket_map["rls_enabled:salg"];
  write("recon/recon-coverage-proof.json", JSON.stringify(p2) + "\n");
  const C2 = commit("manipuleret proof");
  const r = runReconGate(C2, { root: ROOT });
  r.open === false && r.reasons.some((x) => x.includes("uklassificeret"))
    ? ok("manipuleret bucket_map → rød (frisk re-kør fanger det)")
    : bad("manipuleret", JSON.stringify(r));
}
{
  // devil-akse fjernet → rød
  const p3 = proof();
  p3.independence.bundle_oid = bundleOid;
  delete p3.omission_devil.filter_angreb;
  write("recon/recon-coverage-proof.json", JSON.stringify(p3) + "\n");
  const C3 = commit("proof uden filter-akse");
  const r = runReconGate(C3, { root: ROOT });
  r.open === false && r.reasons.some((x) => x.includes("filter_angreb"))
    ? ok("manglende devil-akse → rød")
    : bad("devil-akse", JSON.stringify(r));
}
{
  const r = runReconGate("0".repeat(40), { root: ROOT });
  r.open === false && r.reasons.some((x) => x.includes("fail-closed"))
    ? ok("ukendt commit → rød (top-guard, ikke crash)")
    : bad("ukendt-commit", JSON.stringify(r));
}
{
  const r = runReconGate(C, { root: mkdtempSync(join(tmpdir(), "v5-tomt-")) });
  r.open === false ? ok("brudt/tomt repo → rød (ikke crash)") : bad("brudt-repo", JSON.stringify(r));
}
{
  // launch med ugyldigt pakke-navn → buildSnapshot afviser (PAKKE_RE)
  write("launch/launch.json", JSON.stringify({ pakke: "../evil" }) + "\n");
  const C4 = commit("ugyldig pakke");
  const r = runReconGate(C4, { root: ROOT });
  r.open === false && r.reasons.some((x) => x.includes("fail-closed"))
    ? ok("traversal-pakkenavn i launch → rød")
    : bad("pakke-re", JSON.stringify(r));
}

console.log("");
if (fail > 0) {
  console.error(`recon-gate-run red-team: ${fail} FEJLEDE`);
  process.exit(1);
}
console.log(`recon-gate-run red-team: alle ${pass} cases passed`);
