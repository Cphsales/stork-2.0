// S15-full (Leverance 4) — repo-hygiejne over HELE docs/-træet (Plan-2-precondition).
// Genbruger S15-lights kerne (validateS15 = (i) repo-hygiejne + dækningstjek), men over hele
// docs/ i stedet for kun workflow/. Build-tid: rapport-mode (exit 0). Plan-2-acceptance: --gate
// (exit 1 hvis ikke ren). Fuld docs/-klassifikation udføres når gaten køres før Plan 2.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative } from "node:path";
import { validateS15 } from "./s15-light-check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, "../..");
const INV_PATH = resolve(here, "../../workflow/doc-inventory.json");
export const loadInventory = (path = INV_PATH) => JSON.parse(readFileSync(path, "utf8")).inventory;

// Rekursiv liste af alle .md under en mappe (relativt til repo-roden).
export function scanDocsTree(dir, rod = REPO_ROOT) {
  const ud = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) ud.push(...scanDocsTree(p, rod));
    else if (e.name.endsWith(".md")) ud.push(relative(rod, p));
  }
  return ud;
}

// Genbrug (ingen parallel logik): (i) repo-hygiejne + dækningstjek over de givne md-filer.
export function validateS15Full(inventory, mdFiler) {
  return validateS15(inventory, mdFiler);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const gateMode = process.argv.includes("--gate");
  const docsDir = resolve(REPO_ROOT, "docs");
  const mdFiler = scanDocsTree(docsDir);
  const res = validateS15Full(loadInventory(), mdFiler);
  if (res.ok) {
    console.log(`S15-full OK — hele docs/ klassificeret (${mdFiler.length} docs)`);
    process.exit(0);
  }
  if (gateMode) {
    console.error("S15-full GATE AFVIST (Plan-2-precondition):\n  " + res.fejl.slice(0, 20).join("\n  "));
    process.exit(1);
  }
  // Build-tid rapport (ikke hård fejl): fuld klassifikation udføres før Plan 2.
  console.log(`S15-full RAPPORT — ${res.fejl.length} docs mangler klassifikation (køres som --gate før Plan 2).`);
  process.exit(0);
}
