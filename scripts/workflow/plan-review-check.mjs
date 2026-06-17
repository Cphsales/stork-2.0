// S10 (Leverance 3) — plan-review + dispositioner. KOMPONERER dispositions-vokabular (a) +
// proportionel re-validering (g). Hvert fund SKAL disponeres med et gyldigt verdikt;
// udisponeret/ugyldigt → blokerer. Re-valideringsomfang afgøres deterministisk af (g).
import { readFileSync } from "node:fs";
import { validDisposition } from "./gate-check.mjs";
import { decideReValidering } from "./review-dybde-check.mjs";

// review = { fund: [{disposition}], reValidering: {hasBaseline, touched} }
export function validatePlanReview(review) {
  const fejl = [];
  for (const f of Array.isArray(review?.fund) ? review.fund : []) {
    if (!f?.disposition) fejl.push("udisponeretFund");
    else if (!validDisposition(f.disposition)) fejl.push(`ugyldigDisposition(${f.disposition})`);
  }
  const reValidering = decideReValidering(review?.reValidering ?? { hasBaseline: false });
  return { ok: fejl.length === 0, fejl, reValidering };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: plan-review-check.mjs <review.json>");
    process.exit(2);
  }
  const res = validatePlanReview(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("PLAN-REVIEW AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log(`plan-review OK (alle fund disponeret) · re-validering: ${res.reValidering}`);
}
