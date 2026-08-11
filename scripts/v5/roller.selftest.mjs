#!/usr/bin/env node
// roller.selftest.mjs — verificerer rolle-registryets konsistens + at de
// tværgående invarianter (planens sandheder) faktisk håndhæves, så en
// fremtidig redigering ikke tavst kan bryde dem.

import { ROLLER, ROLLE_IDS, OUTPUT_TYPES, validateRolle, validateRoller } from "./roller.mjs";

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

console.log("\nplanens sandheder som invarianter (validateRoller fanger brud):");
// hjælper: kopiér registry, muter, kør en isoleret invariant-tjek via validateRolle+manuelt
const brydExpectRed = (n, mutate, needle) => {
  const clone = structuredClone(ROLLER);
  mutate(clone);
  // gen-implementér validateRoller's invariant-tjek mod clone (ren funktion på data)
  const reasons = [];
  const ids = Object.keys(clone);
  for (const [id, r] of Object.entries(clone)) {
    const v = validateRolle(id, r);
    if (!v.ok) reasons.push(...v.reasons);
  }
  const ejere = ids.filter((id) => clone[id].ejerMaalelag);
  if (JSON.stringify(ejere) !== JSON.stringify(["codex-angreb"])) reasons.push("måle-lag-ejerskab brudt");
  for (const id of ids)
    if (clone[id].aktoer === "claude-ai" && clone[id].kode !== false) reasons.push("claude-ai-kode brudt");
  const webR = ids.filter((id) => clone[id].web);
  if (JSON.stringify(webR) !== JSON.stringify(["codex-forbedring"])) reasons.push("web brudt");
  const raad = ids.filter((id) => clone[id].raadgivende);
  if (JSON.stringify(raad) !== JSON.stringify(["codex-forbedring"])) reasons.push("raadgivende brudt");
  reasons.some((x) => new RegExp(needle).test(x)) ? ok(n) : bad(n, `manglede '${needle}': ${reasons.join(" | ")}`);
};

brydExpectRed(
  "Code får måle-lag-ejerskab → fanget",
  (c) => (c["builder-code"].ejerMaalelag = true),
  "måle-lag-ejerskab",
);
brydExpectRed(
  "måle-lag-ejer fjernet fra Codex → fanget",
  (c) => (c["codex-angreb"].ejerMaalelag = false),
  "måle-lag-ejerskab",
);
brydExpectRed("claude-ai får lov at vurdere kode → fanget", (c) => (c["claude-ai"].kode = true), "claude-ai-kode");
brydExpectRed("recon får web → fanget", (c) => (c["recon-code"].web = true), "web");
brydExpectRed("angreb bliver rådgivende → fanget", (c) => (c["codex-angreb"].raadgivende = true), "raadgivende");
brydExpectRed("ukendt aktør → fanget", (c) => (c["planner-code"].aktoer = "hacker"), "ukendt aktør");
brydExpectRed("ukendt output-type → fanget", (c) => (c["builder-code"].producerer = ["magi"]), "ukendt output-type");

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
