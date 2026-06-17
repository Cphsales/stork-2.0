// Regel-flade klausul (c) — Mathias-kommunikationskontrakt-checker (krav 6).
// En Mathias-bundet besked må kun være "hvad" (beslutning/retning), aldrig kode/hvordan.
// Mekaniserer den klareste overtrædelse: kode-hegn + impl-kommando-linjer i Mathias-fladen.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/mathias-komm-kontrakt.json");

export function loadDef(path = DEF_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

// Returnerer {ok, fejl[]} for en Mathias-bundet besked (tekst).
export function checkMathiasMessage(text, def = loadDef()) {
  const fejl = [];
  if (/```/.test(text)) fejl.push("kodeHegn: fenced code block paa Mathias' bord");
  const linjer = text.split("\n");
  for (const kmd of def.forbudtIMathiasFlade.implKommandoer) {
    if (
      linjer.some(
        (l) =>
          l
            .trimStart()
            .toLowerCase()
            .startsWith(kmd.trim().toLowerCase() + " ") || l.trimStart().toLowerCase().startsWith(kmd.toLowerCase()),
      )
    )
      fejl.push(`implKommando: "${kmd.trim()}" paa Mathias' bord`);
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: mathias-komm-check.mjs <besked.md>");
    process.exit(2);
  }
  const res = checkMathiasMessage(readFileSync(path, "utf8"));
  if (!res.ok) {
    console.error("MATHIAS-FLADE AFVIST (kode/hvordan paa hans bord):\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("Mathias-flade OK (kun hvad)");
}
