// S7 (Leverance 2) — kravspec-skabelse. Bygger kravspec FRA recon-sandhed-1 (S6) med
// Claude.ai-medforfatter (build-vs-ønsker + krav⊨vision) og matrix-validering (genbrug af b).
// Producerer krav-hash. (Krav-godkendelsen S8 = separat dømmekraft.)
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { validateSpec } from "./spec-check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const tom = (v) => v == null || (typeof v === "string" && v.trim() === "");
export const kravHashAf = (spec) =>
  createHash("sha256")
    .update(JSON.stringify(spec ?? null))
    .digest("hex");

// run = { reconHash, spec, medforfatterBidrag, buildVsOensker, kravModVision }
// expectedReconHash (valgfri): den aktuelle S6 recon-sandhed-hash — binder kravspec mod den.
export function validateKravspecRun(run, { expectedReconHash } = {}) {
  const fejl = [];
  // Bygget FRA den ene konsoliderede recon-sandhed (S6) — HÅRD: skal være en 64-hex sandhed-hash,
  // ikke en vilkårlig streng (Codex-lukning). Helst bundet mod den aktuelle S6-sandhed.
  if (tom(run?.reconHash)) fejl.push("ikkeByggetFraReconSandhed");
  else if (!/^[0-9a-f]{64}$/.test(run.reconHash)) fejl.push("ugyldigReconHash");
  else if (expectedReconHash && run.reconHash !== expectedReconHash) fejl.push("reconHashMismatch");
  // Matrix-gate (genbrug af b) — ingen parallel logik.
  const m = validateSpec(run?.spec);
  if (!m.ok) fejl.push(...m.fejl.map((f) => `matrix:${f}`));
  // Claude.ai krav-medforfatter (krav 2) + kæde-top (krav⊨vision).
  if (tom(run?.medforfatterBidrag)) fejl.push("manglerMedforfatterBidrag");
  if (tom(run?.buildVsOensker)) fejl.push("manglerBuildVsOensker");
  if (tom(run?.kravModVision)) fejl.push("manglerKravModVision");
  return { ok: fejl.length === 0, fejl, kravHash: kravHashAf(run?.spec) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: kravspec-runtime-check.mjs <run.json>");
    process.exit(2);
  }
  const res = validateKravspecRun(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("KRAVSPEC-RUN AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log(`kravspec-run OK · krav-hash: ${res.kravHash.slice(0, 12)}…`);
}
