// S9 (Leverance 3) — PLAN-GATE. KOMPONERER (j) dual-hash-binding (plan-SHA + krav-hash) +
// (k) djævlens-advokat-pass + kumulativ kæde-troskab (plan⊨vision+krav) + Mathias sidst.
// Kan ikke låses før ren krav-gate (S8). Stale plan-SHA/krav-hash → afvist.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { validateDjaevelPass } from "./djaevel-check.mjs";
import { validateBinding } from "./handoff-check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/plan-gate-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

// gate = { kravGateRen, djaevelPass, planTroskab:{planModVisionOgKrav},
//          current:{planSha,kravHash}, aiVerdikter:[{aktoer,planSha,kravHash}], mathiasVerdikt }
export function validatePlanGate(gate, def = loadDef()) {
  const fejl = [];
  // Plan kan ikke låses før ren krav-gate.
  if (!gate?.kravGateRen) fejl.push("kravGateIkkeRen");
  // (k) djævlens-advokat FØR approval.
  const k = validateDjaevelPass(gate?.djaevelPass ?? {});
  if (!k.ok) fejl.push(...k.fejl.map((x) => `djaevel:${x}`));
  // Kumulativ kæde-troskab: plan⊨vision+krav.
  if (!gate?.planTroskab?.planModVisionOgKrav) fejl.push("manglerPlanTroskab");
  // (j) fire-aktør DUAL-HASH-binding (plan-SHA + krav-hash).
  const aiVerdikter = Array.isArray(gate?.aiVerdikter) ? gate.aiVerdikter : [];
  for (const a of def.aiAktoerer) {
    const v = aiVerdikter.find((x) => x?.aktoer === a);
    if (!v) fejl.push(`manglerAiVerdikt(${a})`);
    else {
      const b = validateBinding(v, gate?.current);
      if (!b.ok) fejl.push(...b.fejl.map((x) => `binding(${a}):${x}`));
    }
  }
  // Mathias sidst.
  const alleAi = def.aiAktoerer.every((a) => aiVerdikter.some((x) => x?.aktoer === a));
  if (gate?.mathiasVerdikt && !alleAi) fejl.push("mathiasIkkeSidst");
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: plan-gate-check.mjs <gate.json>");
    process.exit(2);
  }
  const res = validatePlanGate(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("PLAN-GATE AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("plan-gate OK (dual-hash fire-aktør + djævel + plan-troskab, Mathias sidst, ren krav-gate)");
}
