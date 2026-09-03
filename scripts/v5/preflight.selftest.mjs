#!/usr/bin/env node
// preflight.selftest.mjs — red-team af "altid nyeste"-pre-flighten (plan 2.F).
// Falsk-grøn-klasserne: bagud-CLI der melder ok · malformet version der glider
// igennem · utilgængelig pinned model der ikke halter · auto-model-skift.

import { cmpSemver, decideCliPreflight, decideModelPreflight } from "./preflight.mjs";

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };

console.log("cmpSemver:");
cmpSemver("0.147.0", "0.153.0") < 0 ? ok("0.147.0 < 0.153.0 (Codex-casen)") : bad("semver", "forkert orden");
cmpSemver("2.1.259", "2.1.259") === 0 ? ok("lighed") : bad("semver-eq", "forkert");
cmpSemver("0.9.0", "0.10.0") < 0 ? ok("numerisk, ikke leksikalsk (0.9 < 0.10)") : bad("semver-num", "leksikalsk fælde");
{
  let threw = false;
  try { cmpSemver("1.2", "1.2.3"); } catch { threw = true; }
  threw ? ok("malformet version kaster") : bad("semver-malformet", "gled igennem");
}

console.log("\ndecideCliPreflight (CLI = transport, auto-opdatering):");
{
  const r = decideCliPreflight({ installed: "0.147.0", newest: "0.153.0" });
  r.action === "opdater" ? ok("bagud → opdater før spawn") : bad("cli-bagud", r.action);
}
{
  const r = decideCliPreflight({ installed: "0.153.0", newest: "0.153.0" });
  r.action === "ok" ? ok("nyeste → ok") : bad("cli-ok", r.action);
}
{
  const r = decideCliPreflight({ installed: "0.154.0", newest: "0.153.0" });
  r.action === "ok" ? ok("foran registry (pre-release) → ok, aldrig nedgradering") : bad("cli-foran", r.action);
}
{
  const r = decideCliPreflight({ installed: undefined, newest: "0.153.0" });
  r.action === "halt" ? ok("manglende installeret version → halt (fail-closed)") : bad("cli-mangler", r.action);
}
{
  const r = decideCliPreflight({ installed: "0.153.0", newest: "ukendt" });
  r.action === "halt" ? ok("malformet registry-svar → halt (aldrig tavst ok)") : bad("cli-malformet", r.action);
}

console.log("\ndecideModelPreflight (MODEL = aktør-identitet, Mathias' ord):");
{
  const r = decideModelPreflight({ pinned: "gpt-5.5", vurderede: ["gpt-5.6"], available: ["gpt-5.5", "gpt-5.6"] });
  r.action === "ok" ? ok("pinned kører + alle andre vurderet → ok") : bad("model-ok", r.action);
}
{
  const r = decideModelPreflight({ pinned: "gpt-5.5", vurderede: [], available: ["gpt-5.5", "gpt-5.7"] });
  r.action === "flag-mathias" && r.nye.includes("gpt-5.7")
    ? ok("ny u-vurderet model → flag til Mathias (aldrig auto-skift)")
    : bad("model-flag", JSON.stringify(r));
}
{
  const r = decideModelPreflight({ pinned: "gpt-5.5", vurderede: [], available: ["gpt-5.7"] });
  r.action === "halt" ? ok("pinned utilgængelig for kontoen → halt") : bad("model-pin-væk", r.action);
}
{
  const r = decideModelPreflight({ pinned: "", available: ["x"] });
  r.action === "halt" ? ok("manglende pin → halt") : bad("model-uden-pin", r.action);
}
{
  const r = decideModelPreflight({ pinned: "gpt-5.5", vurderede: undefined, available: undefined });
  r.action === "halt" ? ok("manglende model-liste → halt (fail-closed)") : bad("model-uden-liste", r.action);
}

console.log("");
if (fail > 0) {
  console.error(`preflight red-team: ${fail} FEJLEDE`);
  process.exit(1);
}
console.log(`preflight red-team: alle ${pass} cases passed`);

// --- decideWorktreePreflight (A4: rent arbejdstræ før aktør-kørsel) ---
import { decideWorktreePreflight } from "./preflight.mjs";
console.log("\ndecideWorktreePreflight:");
{
  const r = decideWorktreePreflight({ porcelain: [] });
  r.action === "ok" ? console.log("  ✓ rent træ → ok") : (process.exitCode = 1, console.error("  ✗ rent træ: " + r.action));
}
{
  const r = decideWorktreePreflight({ porcelain: [" M scripts/v5/x.mjs", "?? ny.md"] });
  r.action === "halt" && r.urene.length === 2
    ? console.log("  ✓ urent træ → halt med listen")
    : (process.exitCode = 1, console.error("  ✗ urent træ: " + JSON.stringify(r)));
}
{
  const r = decideWorktreePreflight({});
  r.action === "halt" ? console.log("  ✓ manglende status → halt (fail-closed)") : (process.exitCode = 1, console.error("  ✗ manglende status"));
}
if (process.exitCode === 1) { console.error("preflight worktree-cases FEJLEDE"); process.exit(1); }
