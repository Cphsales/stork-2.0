// S15-light — seed repo-sandheds-inventory + dækningstjek.
// Kører (i) repo-hygiejne over inventory'et OG verificerer at hver levende workflow-doc
// (.md) er inventoriseret (ingen uinventeret doc). LIGHT scope = workflow/; fuld docs/-tree
// = Leverance 4. Giver doc-grundlaget S6 forventer.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { validateInventory } from "./repo-hygiejne-check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const INV_PATH = resolve(here, "../../workflow/doc-inventory.json");
const WORKFLOW_DIR = resolve(here, "../../workflow");

export const loadInventory = (path = INV_PATH) => JSON.parse(readFileSync(path, "utf8")).inventory;

// Hermetisk kerne: (i)-validering + at hver md-fil er inventoriseret.
export function validateS15(inventory, mdFiler) {
  const res = validateInventory(inventory);
  const fejl = [...res.fejl];
  const inventoriseret = new Set(inventory.map((d) => d.doc));
  for (const md of mdFiler) {
    if (!inventoriseret.has(md)) fejl.push(`uinventeretDoc(${md})`);
  }
  return { ok: fejl.length === 0, fejl };
}

export function workflowMdFiler(dir = WORKFLOW_DIR) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => `workflow/${f}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = validateS15(loadInventory(), workflowMdFiler());
  if (!res.ok) {
    console.error("S15-LIGHT AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("S15-light OK (inventory klassificeret, én aktiv sandhed pr. emne, alle workflow-docs inventoriseret)");
}
