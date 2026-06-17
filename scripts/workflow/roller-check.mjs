// S2 — rolle-instruks-checker. To lag:
//  1) STRUKTUR: hver workflow-rolle importerer de krævede kontrakter (c/d/e/h alle;
//     k i review-roller; krav-troskab+chat-recon i Claude.ai-workflow). Almindelig = fri.
//  2) ADFÆRD: kontrakterne styrer rollens output i en realistisk opgave (test-tråd).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/roller.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

export function importererForRolle(navn, def = loadDef()) {
  return def.roller?.[navn]?.importerer ?? [];
}

// 1) Struktur: krævede imports pr. rolle-type.
export function validateRoller(def = loadDef()) {
  const fejl = [];
  for (const [navn, r] of Object.entries(def.roller ?? {})) {
    if (r.type === "workflow") {
      for (const k of def.krav.workflowAlle) {
        if (!r.importerer.includes(k)) fejl.push(`${navn} mangler import: ${k}`);
      }
      if (def.reviewRoller.includes(navn)) {
        for (const k of def.krav.reviewRoller) {
          if (!r.importerer.includes(k)) fejl.push(`${navn} (review) mangler import: ${k}`);
        }
      }
      if (navn === "Claude.ai-workflow") {
        for (const k of def.krav.claudeWorkflowEkstra) {
          if (!r.importerer.includes(k)) fejl.push(`${navn} mangler import: ${k}`);
        }
      }
    } else if (r.type === "almindelig" && r.importerer.length) {
      fejl.push(`${navn} (almindelig) bør være fri dialog, ikke importere kontrakter`);
    }
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = validateRoller();
  if (!res.ok) {
    console.error("ROLLER AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("roller OK (kontrakter importeret i de rigtige roller)");
}
