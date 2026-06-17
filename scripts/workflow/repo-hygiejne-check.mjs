// Regel-flade klausul (i) — repo-hygiejne / klassifikations-checker (krav 8).
// Validerer en repo-sandheds-inventory: gyldig status/handling pr. doc, hver levende doc
// har formål + ejer-funktion + test/gate, og ÉN aktiv sandhed pr. emne (konkurrerende → BLOKER).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/repo-hygiejne-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

const tom = (v) => v == null || (typeof v === "string" && v.trim() === "");

// inventory = [{doc, status, emne, formaal, ejerFunktion, testGate, handling}]
export function validateInventory(inventory, def = loadDef()) {
  const fejl = [];
  const aktivePrEmne = new Map();
  for (const d of Array.isArray(inventory) ? inventory : []) {
    const hvor = d?.doc ?? "(uden doc)";
    if (!def.statusTaksonomi.includes(d?.status)) fejl.push(`ukendtStatus(${d?.status}): ${hvor}`);
    if (d?.handling && !def.handlingsTaksonomi.includes(d.handling))
      fejl.push(`ukendtHandling(${d.handling}): ${hvor}`);
    if (def.levendeStatus.includes(d?.status)) {
      for (const felt of ["formaal", "ejerFunktion", "testGate"]) {
        if (tom(d?.[felt])) fejl.push(`levendeDocUden(${felt}): ${hvor}`);
      }
    }
    if (d?.status === "aktiv-sandhed" && d?.emne) {
      aktivePrEmne.set(d.emne, (aktivePrEmne.get(d.emne) ?? 0) + 1);
    }
  }
  for (const [emne, n] of aktivePrEmne) {
    if (n > 1) fejl.push(`konkurrerendeSandhed(${emne}): ${n} aktive`);
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: repo-hygiejne-check.mjs <inventory.json>");
    process.exit(2);
  }
  const res = validateInventory(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("REPO-HYGIEJNE AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("repo-hygiejne OK (klassificeret + én aktiv sandhed pr. emne)");
}
