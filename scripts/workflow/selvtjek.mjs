// S13 — kører ALLE Pakke-1 substrat-selftests (regel-flade-klausulernes kanariefugle).
// Auto-opdager *-check.selftest.mjs, så nye kontrakter kommer med automatisk.
// Wiret i CI (pnpm workflow:selftest) → substratets tests KØRER (ikke papirgrøn).
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tests = readdirSync(here)
  .filter((f) => f.endsWith(".selftest.mjs"))
  .sort();

let fejl = 0;
for (const t of tests) {
  try {
    execFileSync(process.execPath, [resolve(here, t)], { stdio: "inherit" });
  } catch {
    fejl++;
  }
}
if (fejl) {
  console.error(`workflow selvtjek: ${fejl}/${tests.length} selftest-filer fejlede`);
  process.exit(1);
}
console.log(`workflow selvtjek: ${tests.length} selftest-filer grønne`);
