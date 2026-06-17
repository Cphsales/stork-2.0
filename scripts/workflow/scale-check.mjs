// S5 (Leverance 2) — scale-router. Ruter dybde + kontrol-intensitet til pakke-scale.
// ALTID-PÅ-kontroller scaler aldrig ned; kun scale-routede lettes ved lav scale.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/scale-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

export function decideRute(scale, def = loadDef()) {
  if (scale <= def.lavMax) return "DIRECT";
  if (scale >= def.hoejMin) return "DELEGATED";
  return "SIGNAL";
}

// Returnerer kontrol-sættet for en scale: altid-på + de scale-routede der er aktive.
export function kontrolSaet(scale, def = loadDef()) {
  const aktive = scale >= def.hoejMin ? [...def.scaleRoutet] : def.scaleRoutet.slice(0, 1);
  return { altidPaa: [...def.altidPaa], aktive };
}

// Et kontrol-sæt er ugyldigt hvis et altid-på-gulv er droppet (integritet kan ikke scales væk).
export function validateKontrolSaet(saet, def = loadDef()) {
  const fejl = [];
  for (const k of def.altidPaa) {
    if (!saet?.altidPaa?.includes(k)) fejl.push(`altidPaaDroppet(${k})`);
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const scale = Number(process.argv[2] ?? "5");
  console.log(`scale ${scale} → ${decideRute(scale)}; kontrol:`, JSON.stringify(kontrolSaet(scale)));
}
