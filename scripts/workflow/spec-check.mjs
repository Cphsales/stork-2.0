// Regel-flade klausul (b) — spec-skema-checker + matrix-gate (S7).
// Validerer en kravspec mod spec-skemaet: krav-ID-format, acceptkriterie, og matrix-
// binding (hvert krav → step + test; hver plan-step → et krav). Tekst-der-ER-funktionen.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SKEMA_PATH = resolve(here, "../../workflow/spec-skema.json");

export function loadSkema(path = SKEMA_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

// spec = { krav: [{id, acceptkriterie, step, test, pakke?, begrundelse?}], planSteps?: ["S1",...] }
export function validateSpec(spec, skema = loadSkema()) {
  const fejl = [];
  const idRe = new RegExp(skema.kravIdFormat);
  const krav = Array.isArray(spec?.krav) ? spec.krav : [];
  const refererede = new Set();

  for (const k of krav) {
    const hvor = k?.id ?? "(uden id)";
    if (!k?.id || !idRe.test(k.id)) fejl.push(`ugyldigtKravId: ${hvor}`);
    if (!k?.acceptkriterie) fejl.push(`kravUdenAcceptkriterie: ${hvor}`);
    if (k?.pakke === 2) {
      if (!k?.begrundelse) fejl.push(`pakke2UdenBegrundelse: ${hvor}`);
      continue; // Pakke-2-krav kraever ikke step/test i denne pakke.
    }
    if (!k?.step) fejl.push(`kravUdenStep: ${hvor}`);
    else refererede.add(k.step);
    if (!k?.test) fejl.push(`kravUdenTest: ${hvor}`);
  }

  // Omvendt dækning: en plan-step uden et krav der peger på den (kun hvis planSteps er givet).
  if (Array.isArray(spec?.planSteps)) {
    for (const s of spec.planSteps) {
      if (!refererede.has(s)) fejl.push(`stepUdenKrav: ${s}`);
    }
  }

  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: spec-check.mjs <spec.json>");
    process.exit(2);
  }
  const res = validateSpec(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("SPEC AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("spec OK");
}
