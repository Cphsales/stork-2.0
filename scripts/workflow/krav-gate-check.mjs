// S8 (Leverance 3) — KRAV-GATE. KOMPONERER (ingen parallel logik):
//  (f) krav-troskab + (k) djævlens-advokat-pass + (j) fire-aktør-binding på krav-hash
//  + S7 kravspec bundet mod aktuel S6 recon-sandhed (Codex-note: obligatorisk ved gaten).
// Mathias sidst (efter de tre AI). Ingen APPROVAL uden djævel-pass.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { validateKravTroskab } from "./krav-troskab-check.mjs";
import { validateDjaevelPass } from "./djaevel-check.mjs";
import { validateBinding } from "./handoff-check.mjs";
import { validateKravspecRun } from "./kravspec-runtime-check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/krav-gate-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

// gate = { kravTroskab, djaevelPass, kravspecRun, currentReconHash, current:{kravHash},
//          aiVerdikter:[{aktoer,kravHash}], mathiasVerdikt:{aktoer,kravHash}|null }
export function validateKravGate(gate, def = loadDef()) {
  const fejl = [];
  // (f) krav-troskab (matrix+binding+menings+kæde).
  const f = validateKravTroskab(gate?.kravTroskab ?? {});
  if (!f.ok) fejl.push(...f.fejl.map((x) => `troskab:${x}`));
  // (k) djævlens-advokat FØR approval.
  const k = validateDjaevelPass(gate?.djaevelPass ?? {});
  if (!k.ok) fejl.push(...k.fejl.map((x) => `djaevel:${x}`));
  // S7 kravspec bundet mod aktuel S6 recon-sandhed (obligatorisk her).
  const s7 = validateKravspecRun(gate?.kravspecRun ?? {}, { expectedReconHash: gate?.currentReconHash });
  if (!s7.ok) fejl.push(...s7.fejl.map((x) => `kravspec:${x}`));
  if (!gate?.currentReconHash) fejl.push("manglerCurrentReconHash");
  // (j) fire-aktør-binding på samme krav-hash.
  const aiVerdikter = Array.isArray(gate?.aiVerdikter) ? gate.aiVerdikter : [];
  for (const a of def.aiAktoerer) {
    const v = aiVerdikter.find((x) => x?.aktoer === a);
    if (!v) fejl.push(`manglerAiVerdikt(${a})`);
    else {
      const b = validateBinding(v, gate?.current);
      if (!b.ok) fejl.push(...b.fejl.map((x) => `binding(${a}):${x}`));
    }
  }
  // Mathias sidst: hans verdikt må først komme når alle tre AI er der.
  const alleAi = def.aiAktoerer.every((a) => aiVerdikter.some((x) => x?.aktoer === a));
  if (gate?.mathiasVerdikt && !alleAi) fejl.push("mathiasIkkeSidst");
  // Mathias' egen verdikt skal OGSÅ bindes til samme krav-hash (ægte fire-aktør; Codex-lukning).
  if (gate?.mathiasVerdikt) {
    const bm = validateBinding(gate.mathiasVerdikt, gate?.current);
    if (!bm.ok) fejl.push(...bm.fejl.map((x) => `binding(Mathias):${x}`));
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: krav-gate-check.mjs <gate.json>");
    process.exit(2);
  }
  const res = validateKravGate(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("KRAV-GATE AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("krav-gate OK (troskab + djævel + kravspec-binding + fire-aktør, Mathias sidst)");
}
