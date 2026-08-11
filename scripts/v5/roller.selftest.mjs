#!/usr/bin/env node
// roller.selftest.mjs — verificerer rolle-registryets konsistens + at de
// tværgående invarianter (planens sandheder) faktisk håndhæves, så en
// fremtidig redigering ikke tavst kan bryde dem.

import { ROLLER, ROLLE_IDS, OUTPUT_TYPES, validateRoller } from "./roller.mjs";

let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};

console.log("registry-konsistens:");
validateRoller().ok
  ? ok("alle roller strukturelt gyldige + invarianter holder")
  : bad("registry", validateRoller().reasons.join(" | "));

// de forventede roller findes (planens aktør-tabel + fase-brug)
for (const id of [
  "recon-code",
  "recon-codex",
  "recon-claude-ai",
  "claude-ai",
  "planner-code",
  "builder-code",
  "code-reviewer",
  "codex-angreb",
  "codex-forbedring",
])
  ROLLE_IDS.includes(id) ? ok(`rolle findes: ${id}`) : bad("mangler-rolle", id);

console.log("\nplanens sandheder som SEMANTISKE invarianter (validateRoller fanger brud):");
// muter en KOPI + kør PRÆCIS samme validateRoller (map-argument) — ingen
// gen-implementering der kan divergere fra produktionslogikken.
const brydExpectRed = (n, mutate, needle) => {
  const clone = structuredClone(ROLLER);
  mutate(clone);
  const r = validateRoller(clone);
  !r.ok && r.reasons.some((x) => new RegExp(needle).test(x))
    ? ok(n)
    : bad(n, r.ok ? "GRØN (brud slap igennem)" : `manglede '${needle}': ${r.reasons.join(" | ")}`);
};

// Codex-fund 2: invarianter bundet til SEMANTIK, ikke rolle-id
brydExpectRed(
  "Code får måle-lag-ejerskab → fanget",
  (c) => (c["builder-code"].ejerMaalelag = true),
  "eje sit eget måle-lag|ikke codex",
);
brydExpectRed(
  "måle-lag-ejer bliver Code-aktør (id uændret) → fanget",
  (c) => (c["codex-angreb"].aktoer = "code"),
  "ikke codex",
);
brydExpectRed(
  "byg-rolle (planner) ejer måle-lag → fanget",
  (c) => (c["planner-code"].ejerMaalelag = true),
  "eje sit eget måle-lag",
);
brydExpectRed("ingen ejer måle-laget → fanget", (c) => (c["codex-angreb"].ejerMaalelag = false), "ingen rolle ejer");
brydExpectRed("claude-ai får lov at vurdere kode → fanget", (c) => (c["claude-ai"].kode = true), "aldrig vurdere kode");
brydExpectRed(
  "recon får web (ikke rådgivende) → fanget",
  (c) => (c["recon-code"].web = true),
  "web kun tilladt for rådgivende",
);
brydExpectRed(
  "rådgivende rolle producerer gate-verdikt → fanget",
  (c) => (c["codex-forbedring"].producerer = ["verdikt"]),
  "kun producere 'raad'",
);
brydExpectRed(
  "gate-rolle producerer 'raad' → fanget",
  (c) => (c["code-reviewer"].producerer = ["raad"]),
  "kun rådgivende",
);
brydExpectRed("ukendt aktør → fanget", (c) => (c["planner-code"].aktoer = "hacker"), "ukendt aktør");
brydExpectRed("ukendt output-type → fanget", (c) => (c["builder-code"].producerer = ["magi"]), "kendte output-typer");
brydExpectRed(
  "arvet rolle (prototype) → fanget",
  (c) => (c["planner-code"] = Object.create(ROLLER["planner-code"])),
  "plain object",
);
brydExpectRed("array som rolle → fanget", (c) => (c["planner-code"] = []), "plain object");

console.log("\nkonkrete rolle-fakta (planens aktør-tabel):");
ROLLER["claude-ai"].kode === false ? ok("claude-ai vurderer ikke kode") : bad("claude-ai", "kode ≠ false");
ROLLER["codex-angreb"].ejerMaalelag === true ? ok("Codex(angreb) ejer måle-laget") : bad("codex", "ejer ikke");
ROLLER["codex-angreb"].producerer.includes("angrebs-spec")
  ? ok("Codex(angreb) skriver angrebs-spec")
  : bad("codex-spec", "nej");
ROLLER["codex-forbedring"].web === true && ROLLER["codex-forbedring"].raadgivende === true
  ? ok("Codex(forbedring) har web + er rådgivende (ingen gate)")
  : bad("codex-forbedring", "web/raad forkert");
ROLLER["builder-code"].freshness.includes("≠ planner")
  ? ok("builder-Code er frisk ≠ planner-Code")
  : bad("freshness", ROLLER["builder-code"].freshness);
OUTPUT_TYPES.includes("recon-candidate") ? ok("output-typer defineret") : bad("output-typer", "mangler");

console.log("");
if (failed > 0) {
  console.error(`roller red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("roller red-team: alle cases passed");
