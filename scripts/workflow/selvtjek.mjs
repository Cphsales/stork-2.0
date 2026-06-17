// S13 — Pakke-1 substrat-selvtjek. To lag, så kanariefuglene ikke kan omgås:
//  1) DÆKNING: hver *-check.mjs SKAL have en matchende *-check.selftest.mjs (ellers FAIL) —
//     lukker silent-skip via fejlnavn/manglende test; nye kontrakter (f-m) tvinges med.
//  2) KØRSEL: alle *-check.selftest.mjs køres; CI fejler hvis nogen fejler.
// Funktionerne eksporteres så meta-selftesten kan bevise begge fail-stier.
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

export const findCheckers = (dir) => readdirSync(dir).filter((f) => f.endsWith("-check.mjs"));
export const findSelftests = (dir) => readdirSync(dir).filter((f) => f.endsWith("-check.selftest.mjs"));

// Checkere uden matchende selftest (silent-skip-risiko).
export function manglendeDaekning(dir) {
  const selftests = new Set(findSelftests(dir));
  return findCheckers(dir).filter((c) => !selftests.has(c.replace(/\.mjs$/, ".selftest.mjs")));
}

// Kører hver selftest; returnerer dem der fejler (non-zero exit).
export function koerSelftests(dir, { stdio = "inherit" } = {}) {
  const fejlede = [];
  for (const t of findSelftests(dir)) {
    try {
      execFileSync(process.execPath, [resolve(dir, t)], { stdio });
    } catch {
      fejlede.push(t);
    }
  }
  return fejlede;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mangler = manglendeDaekning(here);
  if (mangler.length) console.error(`DÆKNINGS-FEJL — checker uden selftest (silent-skip): ${mangler.join(", ")}`);
  const fejlede = koerSelftests(here);
  if (fejlede.length) console.error(`FEJLEDE selftests: ${fejlede.join(", ")}`);
  if (mangler.length || fejlede.length) process.exit(1);
  console.log(
    `workflow selvtjek: ${findSelftests(here).length} selftests grønne, ${findCheckers(here).length} checkere dækket`,
  );
}
