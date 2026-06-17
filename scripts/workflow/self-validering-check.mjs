// Regel-flade klausul (m) — self-validerings-checker (krav 3, aktøren selv).
// Pr. handoff skal aktøren skrive en self-validerings-blok: hvilke docs læst, hvad holdt
// op mod, drift fundet, hvad ikke verificeret, hvilken kanariefugl ville afsløre snyd.
// Erstatter ALDRIG uafhængig review — første forsvarslag. Tom/sprunget blok → FAIL.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/self-validering-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

const tom = (v) =>
  v == null ||
  (typeof v === "string" && v.trim() === "") ||
  (Array.isArray(v) && v.length === 0);

// blok = { docsLaest, holdtOpMod, kanariefugl, driftFundet, ikkeVerificeret }
export function validateSelfValidering(blok, def = loadDef()) {
  const fejl = [];
  for (const felt of def.indholdsFelter) {
    if (tom(blok?.[felt])) fejl.push(`manglerIndhold(${felt})`);
  }
  for (const felt of def.tilstedeFelter) {
    if (blok?.[felt] === undefined) fejl.push(`manglerFelt(${felt})`);
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: self-validering-check.mjs <blok.json>");
    process.exit(2);
  }
  const res = validateSelfValidering(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("SELF-VALIDERING AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("self-validering OK");
}
