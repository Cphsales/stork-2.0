#!/usr/bin/env node
// plan-gate-run.selftest.mjs — red-team af forgænger-pinningen i plan-gate-run (driver-fund 2026-09-21: krav-gaten blev dømt ved planens
// commit i stedet for sin egen pin → falsk RØD plan-gate; og omvendt må en gammel åben krav-dom ikke bære en plan hvor krav-inputs er ændret).
// Fixture = rigtigt git-repo (ægte OIDs). forgaengerPin er den rene dommer; runPlanGate prøves fail-closed uden approval.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { forgaengerPin, runPlanGate } from "./plan-gate-run.mjs";
import { makeGit, resolveRef } from "./git.mjs";

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));
const throwsWith = (n, fn, re) => { try { fn(); bad(n, "kastede IKKE"); } catch (e) { re.test(e.message) ? ok(n) : bad(n, `kastede uden '${re}': ${e.message.slice(0, 200)}`); } };

const ROOT = mkdtempSync(join(tmpdir(), "v5-plangate-")); process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]); const git = makeGit(ROOT); git("config", "user.name", "t"); git("config", "user.email", "t@l");
const put = (p, c) => { mkdirSync(join(ROOT, dirname(p)), { recursive: true }); writeFileSync(join(ROOT, p), c); };
const commit = (m) => { git("add", "-A"); git("commit", "-qm", m); return git("rev-parse", "HEAD"); };
put("launch/launch.json", JSON.stringify({ pakke: "pk", anker: "x", anker_sha: "a".repeat(40), author: "m" }) + "\n");
put("recon/recon.md", "# recon\n"); put("docs/sandhed/krav/pk-krav.md", "# krav v1\n");
const C1 = commit("krav-pin");                                                       // krav-gatens pin
put("plan-build/pk/krav-gate-resultat.json", JSON.stringify({ open: true, gate_id: "krav", reasons: [], commit_sha: C1 }) + "\n");
put("plan-build/pk/plan.md", "# plan\n");
const C2 = commit("plan + krav-resultat");                                          // planens commit (efterkommer, krav-inputs uændrede)
const kravBlob = resolveRef(git, C1, "docs/sandhed/krav/pk-krav.md").oid;
const P = (over = {}) => forgaengerPin({ git, commitSha: C2, evidenceRef: C2, pakke: "pk", forgaenger: "krav", ...over });

console.log("forgaengerPin — krav-gaten dømmes ved SIN EGEN pin:");
{ const r = P(); eq("resultat @ C2 peger på C1 → pin = C1 (ikke planens commit)", r.pin, C1); eq("artifact_oid = krav-gatens eget artefakt @ pin", r.artifact_oid, kravBlob); }
put("plan-build/pk/krav-gate-resultat.json", JSON.stringify({ open: true, gate_id: "krav", reasons: [], commit_sha: C2 }) + "\n"); const C3 = commit("resultat peger på C2 (skrevet efter dommen @ C2)");
{ const r = forgaengerPin({ git, commitSha: C2, evidenceRef: C3, pakke: "pk", forgaenger: "krav" }); eq("produktions-mønstret: gatens commit = C2, evidens @ senere commit C3 hvis resultat peger på C2 → pin == gatens commit → ok (intet identitetsopslag nødvendigt)", r.pin, C2); }
throwsWith("kandidat-resultat mangler @ evidens → kast (fail-closed)", () => P({ evidenceRef: C1 }), /findes ikke @ evidens/);
put("plan-build/pk/krav-gate-resultat.json", JSON.stringify({ open: true, gate_id: "krav", reasons: [], commit_sha: "HEAD" }) + "\n"); const C4 = commit("mutable pin");
throwsWith("commit_sha 'HEAD' (mutable ref) → kast", () => forgaengerPin({ git, commitSha: C4, evidenceRef: C4, pakke: "pk", forgaenger: "krav" }), /fuld OID/);
put("plan-build/pk/krav-gate-resultat.json", "ikke json\n"); const C5 = commit("korrupt resultat");
throwsWith("kandidat-resultat er ikke JSON → kast", () => forgaengerPin({ git, commitSha: C5, evidenceRef: C5, pakke: "pk", forgaenger: "krav" }), /ikke gyldig JSON/);
const ORPHAN = git("commit-tree", `${C1}^{tree}`, "-m", "orphan");
put("plan-build/pk/krav-gate-resultat.json", JSON.stringify({ open: true, gate_id: "krav", reasons: [], commit_sha: ORPHAN }) + "\n"); const C6 = commit("fremmed pin");
throwsWith("pin er ikke forfader til gatens commit (orphan m. samme træ) → kast (fremmed historik)", () => forgaengerPin({ git, commitSha: C6, evidenceRef: C6, pakke: "pk", forgaenger: "krav" }), /fremmed historik/);
put("plan-build/pk/krav-gate-resultat.json", JSON.stringify({ open: true, gate_id: "krav", reasons: [], commit_sha: C1 }) + "\n"); put("docs/sandhed/krav/pk-krav.md", "# krav v2 — ÆNDRET\n"); const C7 = commit("krav ændret efter pin");
throwsWith("krav-dokumentet ÆNDRET mellem pin og gatens commit → kast (gammel dom gælder ikke ændret indhold, F-C4-1)", () => forgaengerPin({ git, commitSha: C7, evidenceRef: C7, pakke: "pk", forgaenger: "krav" }), /ÆNDRET .*artefakt/);
put("docs/sandhed/krav/pk-krav.md", "# krav v1\n"); put("recon/recon.md", "# recon ÆNDRET\n"); const C8 = commit("recon ændret efter pin");
throwsWith("en krav-BINDING (recon) ændret mellem pin og gatens commit → kast", () => forgaengerPin({ git, commitSha: C8, evidenceRef: C8, pakke: "pk", forgaenger: "krav" }), /binding recon/);
put("recon/recon.md", "# recon\n"); put("launch/launch.json", JSON.stringify({ pakke: "anden", anker: "x", anker_sha: "a".repeat(40), author: "m" }) + "\n"); const C9 = commit("pakke ændret");
throwsWith("launch.pakke ændret mellem pin og gatens commit → kast", () => forgaengerPin({ git, commitSha: C9, evidenceRef: C9, pakke: "pk", forgaenger: "krav" }), /pakke pk → anden|findes ikke|ÆNDRET/);

console.log("\nrunPlanGate — fail-closed ende-til-ende:");
{ const r = runPlanGate(C2, { root: ROOT, evidenceRef: C2 }); eq("uden plan-approval @ evidens → lukket (kastede fail-closed)", r.open === false && /fail-closed/.test(r.reasons[0]), true); }
{ const r = runPlanGate(C6, { root: ROOT, evidenceRef: C6 }); eq("fremmed forgænger-pin → lukket m. 'fremmed historik' i grunden (ikke tavs, ikke åben)", r.open === false && r.reasons.some((x) => /fremmed historik|fail-closed/.test(x)), true); }
{ const r = runPlanGate("HEAD", { root: ROOT }); eq("mutable ref som gatens commit → lukket", r.open, false); }

console.log("");
if (fail > 0) { console.error(`plan-gate-run: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`plan-gate-run red-team: alle ${pass} cases passed`);
