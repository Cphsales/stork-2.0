#!/usr/bin/env node
// actors-lock.selftest.mjs — red-team af validateActorsLock (plan 2.F).
// Bygger et rigtigt git-repo med rolle-skill-filer, deriverer en lås, validerer
// grøn, og planter falsk-grønne (drift, latest, web-lækage, stale skill-OID …).

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeGit } from "./git.mjs";
import { ROLLER, ROLLE_IDS } from "./roller.mjs";
import { validateActorsLock, deriveActorsLock } from "./actors-lock.mjs";

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
    : bad(n, r.ok ? "GRØN (falsk-grøn slap igennem)" : `rød men uden '${needle}': ${r.reasons.join(" | ")}`);
};

// ---------- fixture: repo med de 9 rolle-skill-filer ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-actorslock-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const git = makeGit(ROOT);
git("config", "user.name", "selftest");
git("config", "user.email", "selftest@local");
mkdirSync(join(ROOT, "scripts/v5/roller"), { recursive: true });
for (const role of ROLLE_IDS) writeFileSync(join(ROOT, `scripts/v5/roller/${role}.md`), `# rolle: ${role}\n`);
git("add", "-A");
git("commit", "-qm", "fixture: rolle-skills");
const COMMIT = git("rev-parse", "HEAD");

// fabrikkens nuværende aktør-politik (opdaterbar — Codex=gpt-5.5 indtil 5.6 API-key)
const policy = {
  code: { model: "claude-opus-5", reasoning: "high", allowed_tools: ["read", "grep", "git"] },
  "code-reviewer": { model: "claude-opus-5", reasoning: "high", allowed_tools: ["read", "grep", "git"] },
  "claude-ai": { model: "claude-opus-5", reasoning: "high", allowed_tools: ["read", "app-chat"] },
  codex: { model: "gpt-5.5", reasoning: "xhigh", allowed_tools: ["read", "grep", "git", "web"] },
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const derived = () => deriveActorsLock({ git, commitSha: COMMIT, policy });
const validate = (lock) => validateActorsLock(lock, { git, commitSha: COMMIT });
const mutated = (fn) => {
  const l = clone(derived());
  fn(l);
  return l;
};

console.log("deriveActorsLock + validateActorsLock — grøn sti:");
expectGreen("derived lås validerer (git-path-bundet skill_oid)", validate(derived()));
expectGreen("validering uden git (struktur + OID-format)", validateActorsLock(derived(), {}));

console.log("\nderive respekterer web-mandatet:");
{
  const l = derived();
  const webForbudt = ROLLE_IDS.filter((r) => !ROLLER[r].web);
  const lækage = webForbudt.filter((r) => l[r].allowed_tools.some((t) => /web|browse/i.test(t)));
  lækage.length === 0 ? ok("web-forbudte roller har INGEN web-værktøj i derived lås") : bad("web-strip", `lækage: ${lækage.join(",")}`);
  /web/i.test(l["codex-forbedring"].allowed_tools.join(",")) ? ok("codex-forbedring (web:true) beholder web") : bad("forbedring-web", "web mangler");
}

console.log("\ndækning (anti-tavshed):");
expectRed("manglende rolle i låsen", validate(mutated((l) => delete l["claude-ai"])), "mangler i actors.lock");
expectRed("ukendt rolle i låsen", validate(mutated((l) => (l["hacker"] = clone(l["recon-code"])))), "ukendt rolle");

console.log("\nkonsistens mod roller.mjs (ingen drift):");
expectRed("aktoer-drift", validate(mutated((l) => (l["recon-code"].aktoer = "codex"))), "roller-registryets");
expectRed("provider forkert for aktør", validate(mutated((l) => (l["recon-codex"].provider = "anthropic"))), "forventet");
expectRed("output_schema-drift", validate(mutated((l) => (l["codex-angreb"].output_schema = ["verdikt"]))), "drift");

console.log("\nprovenance (eksakt model + skill-OID, aldrig latest):");
expectRed("model = latest-agtig", validate(mutated((l) => (l["recon-code"].model = "claude-opus-latest"))), "latest");
expectRed("reasoning ukendt", validate(mutated((l) => (l["recon-code"].reasoning = "turbo"))), "reasoning");
expectRed("skill_path forkert", validate(mutated((l) => (l["recon-code"].skill_path = "scripts/v5/roller/andet.md"))), "skill_path");
expectRed("skill_oid ikke OID (latest)", validate(mutated((l) => (l["recon-code"].skill_oid = "latest"))), "eksakt OID");
expectRed(
  "stale skill_oid (anden fils blob)",
  validate(mutated((l) => (l["recon-code"].skill_oid = derived()["recon-codex"].skill_oid))),
  "matcher ikke skill_path",
);

console.log("\nweb-mandat i låsen (alias/præfiks — Codex-P2 #1):");
expectRed("web-værktøj på web-forbudt rolle", validate(mutated((l) => l["recon-code"].allowed_tools.push("web"))), "web-værktøj");
expectRed("web-alias 'web_search'", validate(mutated((l) => l["recon-code"].allowed_tools.push("web_search"))), "web-værktøj");
expectRed("web-alias 'web.fetch'", validate(mutated((l) => l["recon-code"].allowed_tools.push("web.fetch"))), "web-værktøj");
expectRed("web-alias 'mcp__web__search'", validate(mutated((l) => l["recon-code"].allowed_tools.push("mcp__web__search"))), "web-værktøj");
expectRed("web-alias 'anthropic:web-search'", validate(mutated((l) => l["recon-code"].allowed_tools.push("anthropic:web-search"))), "web-værktøj");
// Codex-P2 #A2: camelCase browse/browser-alias skal fanges
expectRed("web-alias 'browserSearch' (camelCase)", validate(mutated((l) => l["recon-code"].allowed_tools.push("browserSearch"))), "web-værktøj");
expectRed("web-alias 'browseUrl' (camelCase)", validate(mutated((l) => l["recon-code"].allowed_tools.push("browseUrl"))), "web-værktøj");
expectRed("web-alias 'webSearch' (camelCase)", validate(mutated((l) => l["recon-code"].allowed_tools.push("webSearch"))), "web-værktøj");
expectGreen("ikke-web værktøj 'webhook' fejl-flag'es IKKE", validate(mutated((l) => l["recon-code"].allowed_tools.push("webhook"))));
expectGreen("codex-forbedring MÅ have web", validate(derived()));

console.log("\nnested-array renhed (Codex-P2 #A1):");
{
  const l = clone(derived());
  const arr = ["ok-tool"];
  arr.some = () => false; // egen some-override der ville forfalske web-checket
  l["recon-code"].allowed_tools = arr;
  expectRed("allowed_tools m. egen some-override", validateActorsLock(l, { git, commitSha: COMMIT }), "array-property");
}
{
  const l = clone(derived());
  const arr = ["raad"];
  arr[Symbol.iterator] = function* () {
    yield "recon-candidate";
  };
  l["codex-forbedring"].output_schema = arr; // codex-forbedring producerer 'raad'
  expectRed("output_schema m. egen Symbol.iterator", validateActorsLock(l, { git, commitSha: COMMIT }), "symbol-nøgle på array");
}

console.log("\nJS-API-kant (Codex-P2 #2/#3): symbol/ikke-enumerable/accessor fail-lukkes:");
{
  const l = clone(derived());
  Object.defineProperty(l["recon-code"], "extra_hidden", { value: "x", enumerable: false });
  expectRed("ikke-enumerable eget felt", validateActorsLock(l, { git, commitSha: COMMIT }), "ikke-enumerable");
}
{
  const l = clone(derived());
  l["recon-code"][Symbol("extra")] = "x";
  expectRed("symbol-nøgle på entry", validateActorsLock(l, { git, commitSha: COMMIT }), "symbol-nøgle");
}
{
  const l = clone(derived());
  const pinned = l["recon-code"].model;
  let n = 0;
  Object.defineProperty(l["recon-code"], "model", { enumerable: true, configurable: true, get() { return n++ === 0 ? pinned : "latest"; } });
  expectRed("accessor-felt (getter der skifter model→latest)", validateActorsLock(l, { git, commitSha: COMMIT }), "accessor");
}

console.log("\nstruktur-fail-closed:");
expectRed("manglende felt", validate(mutated((l) => delete l["recon-code"].model)), "manglende felt 'model'");
expectRed("ukendt felt", validate(mutated((l) => (l["recon-code"].secret = "x"))), "ukendt felt");
expectRed("tom allowed_tools", validate(mutated((l) => (l["recon-code"].allowed_tools = []))), "allowed_tools");
expectRed("role-felt ≠ nøgle", validate(mutated((l) => (l["recon-code"].role = "recon-codex"))), "≠ nøglen");
expectRed("lås er ikke plain object", validateActorsLock(Object.create(derived()), { git, commitSha: COMMIT }), "ikke et plain object");
expectRed("entry er ikke plain object", validate(mutated((l) => (l["recon-code"] = "x"))), "ikke et plain object");

console.log("");
if (failed > 0) {
  console.error(`actors-lock red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("actors-lock red-team: alle cases passed");
