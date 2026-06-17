// Regel-flade klausul (d) — recon-præsentation + recon-output-skema-checker (krav 6 / S1d).
// Validerer at forretnings-recon er i de 3 kategorier OG at hvert fund er struktureret
// (recon-output-skema) så transport kan flette parallelle aktør-recons mekanisk.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SKEMA_PATH = resolve(here, "../../workflow/recon-skema.json");

export function loadSkema(path = SKEMA_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

// recon = { fund: [{kilde, kategori, emne, evidensRef, aktoer, klassifikation}] }
export function validateRecon(recon, skema = loadSkema()) {
  const fejl = [];
  const fund = Array.isArray(recon?.fund) ? recon.fund : [];
  for (const f of fund) {
    const hvor = f?.emne ?? "(uden emne)";
    for (const felt of skema.fundFelter) {
      if (!f?.[felt]) fejl.push(`fundUdenFelt(${felt}): ${hvor}`);
    }
    if (f?.kategori && !skema.kategorier.includes(f.kategori)) fejl.push(`ukendtKategori(${f.kategori}): ${hvor}`);
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: recon-check.mjs <recon.json>");
    process.exit(2);
  }
  const res = validateRecon(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("RECON AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("recon OK (3 kategorier + struktureret)");
}
