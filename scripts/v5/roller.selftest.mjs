#!/usr/bin/env node
// roller.selftest.mjs — verificerer rolle-registryets konsistens + at de
// tværgående invarianter (planens sandheder) faktisk håndhæves, så en
// fremtidig redigering ikke tavst kan bryde dem.

import { ROLLER, ROLLE_IDS, validateRoller } from "./roller.mjs";

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
// M-40 B6 (Claude O-10): tre fakta-dubletter slettet — de var allerede håndhævet
// mekanisk af validateRoller på det RIGTIGE registry (grøn-checket øverst):
//   claude-ai.kode===false        → semantik-invariant (+ brud-case ovenfor)
//   codex-angreb.ejerMaalelag     → "ingen ejer måle-laget → fanget"-casen kan
//                                   kun gå grøn hvis codex-angreb er ENESTE ejer
//   OUTPUT_TYPES ∋ recon-candidate → registry-grøn kræver producerer ⊆ OUTPUT_TYPES
// De to fakta herunder er IKKE dubletter: ingen invariant binder angrebs-spec
// til codex-angreb, og ingen invariant kræver at codex-forbedring HAR web.
ROLLER["codex-angreb"].producerer.includes("angrebs-spec")
  ? ok("Codex(angreb) skriver angrebs-spec")
  : bad("codex-spec", "nej");
ROLLER["codex-forbedring"].web === true && ROLLER["codex-forbedring"].raadgivende === true
  ? ok("Codex(forbedring) har web + er rådgivende (ingen gate)")
  : bad("codex-forbedring", "web/raad forkert");

console.log("\nfriskhed som STRUKTURERET rollebinding (M-40 B5, Codex O-13 — ikke tekst-match):");
// recon≠planner≠builder håndhæves som DATATJEK: tre ADSKILTE registry-entries
// (parvis forskellige rolle-objekter — et alias ville kollapse adskillelsen)
// for SAMME aktør (code), og hver deklarerer en frisk session i freshness-
// feltet. Faktisk sessions-adskillelse efterprøves i aktør-transporten/P-1;
// det gamle includes("≠ planner")-ord-match beviste kun tegn i en streng.
{
  const kaede = ["recon-code", "planner-code", "builder-code"];
  const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const alleFindes = kaede.every((id) => hasOwn(ROLLER, id));
  const parvisAdskilte =
    alleFindes && new Set(kaede.map((id) => ROLLER[id])).size === kaede.length;
  const sammeAktoer = alleFindes && kaede.every((id) => ROLLER[id].aktoer === "code");
  alleFindes && parvisAdskilte && sammeAktoer
    ? ok("recon≠planner≠builder: tre adskilte rolle-objekter i registryet, samme aktør (code)")
    : bad("rolle-adskillelse", `findes=${alleFindes} adskilte=${parvisAdskilte} sammeAktoer=${sammeAktoer}`);
  const uFriske = alleFindes ? kaede.filter((id) => !/frisk|ephemeral/i.test(ROLLER[id].freshness)) : kaede;
  uFriske.length === 0
    ? ok("recon/planner/builder deklarerer alle frisk session (freshness-feltet refererer 'frisk')")
    : bad("freshness", `mangler frisk-deklaration: ${uFriske.join(", ")}`);
}

console.log("");
if (failed > 0) {
  console.error(`roller red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("roller red-team: alle cases passed");
