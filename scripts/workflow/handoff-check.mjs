// Regel-flade klausul (j) — aktør-handoff / SHA-binding-checker (krav 2/5/9).
// Et verdikt skal binde til SAMME plan-SHA + krav-hash som den aktuelle artefakt;
// stale (gammel SHA) eller manglende binding → afvist. Hver aktør har en defineret kanal.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/handoff-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

// verdikt = {planSha, kravHash, ...}; current = {planSha, kravHash}
export function validateBinding(verdikt, current, def = loadDef()) {
  const fejl = [];
  for (const felt of def.bindingFelter) {
    if (!verdikt?.[felt]) fejl.push(`bindingMangler(${felt})`);
    else if (verdikt[felt] !== current?.[felt]) fejl.push(`stale(${felt})`);
  }
  return { ok: fejl.length === 0, fejl };
}

export const kanalFor = (aktoer, def = loadDef()) => def.kanaler[aktoer] ?? null;

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , verdiktPath, currentPath] = process.argv;
  if (!verdiktPath || !currentPath) {
    console.error("brug: handoff-check.mjs <verdikt.json> <current.json>");
    process.exit(2);
  }
  const res = validateBinding(
    JSON.parse(readFileSync(verdiktPath, "utf8")),
    JSON.parse(readFileSync(currentPath, "utf8")),
  );
  if (!res.ok) {
    console.error("BINDING AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("binding OK (verdikt bundet til aktuel plan-SHA + krav-hash)");
}
