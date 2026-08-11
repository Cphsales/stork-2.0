#!/usr/bin/env node
// roller.mjs — v5's rolle-kontrakt-registry (plan 2.G) — maskinlæsbar kerne.
//
// "Hver rolle kompilerer til en verificerbar output-kontrakt." Dette er den
// maskinlæsbare del: hvilken aktør bærer rollen, hvad den PRODUCERER (bindes
// til verdikt/proof-schemaerne), dens web/kode/måle-lag-mandater, freshness,
// og de to forbyggende pligter (plan: forbyg > fang). Selve skill-PROMPTEN
// (naturligt sprog, AI-intern) + den skrive-zone-baserede routing hører til
// fase-wiring, hvor aktørerne faktisk invokeres og prompt-kvaliteten kan
// valideres ved kørsel — derfor bygges de ikke som "påstået-virker"-kode her.

import { ACTOR_SLUGS } from "./gates.mjs";

// output-typer en rolle kan producere (bindes til de øvrige moduler)
export const OUTPUT_TYPES = Object.freeze([
  "recon-candidate", // Fase 1: blindt recon-bidrag → consolidate
  "verdikt", // gate-verdikt (verdikt.mjs schema)
  "plan", // Fase 3: plan-doc (planner)
  "build", // Fase 4: produkt-diff (builder)
  "angrebs-spec", // Fase 4: Codex' kill-list/negativer FØR byg
  "raad", // rådgivende (ingen gate)
]);

// Hver rolle: hvilken AI-aktør · hvad den producerer · mandater · freshness ·
// (a) verificér-input-pligt + (b) forbyg-i-output-pligt (plan-forbygnings-tabel).
export const ROLLER = Object.freeze({
  "recon-code": {
    aktoer: "code",
    producerer: ["recon-candidate"],
    web: false,
    kode: true,
    ejerMaalelag: false,
    raadgivende: false,
    freshness: "frisk recon-session, blind for de andre",
    forbyg_input: "hash + forstå HELE pakke-kontekst-bundlet",
    forbyg_output: "kortlæg hele scope (ikke første-fund) · evidens-trace pr. fund · spørg v. uklarhed",
  },
  "recon-codex": {
    aktoer: "codex",
    producerer: ["recon-candidate"],
    web: false,
    kode: true,
    ejerMaalelag: false,
    raadgivende: false,
    freshness: "--ephemeral, blind for de andre",
    forbyg_input: "hash + forstå HELE pakke-kontekst-bundlet",
    forbyg_output: "kortlæg hele scope · evidens-trace pr. fund · cross-vendor blik",
  },
  "recon-claude-ai": {
    aktoer: "claude-ai",
    producerer: ["recon-candidate"],
    web: false,
    kode: false,
    ejerMaalelag: false,
    raadgivende: false,
    freshness: "frisk chat, blind for de andre",
    forbyg_input: "forstå forretnings-konteksten i bundlet",
    forbyg_output: "forretnings-flade kortlagt · spørg v. uklarhed (aldrig antag)",
  },
  "claude-ai": {
    aktoer: "claude-ai",
    producerer: ["verdikt"],
    web: false,
    kode: false, // forretnings-mening, ALDRIG kode-vurdering (Codex' bord)
    ejerMaalelag: false,
    raadgivende: false,
    freshness: "frisk chat pr. gate",
    forbyg_input: "handover-HALT mod recon-hash + forstå recon",
    forbyg_output: "fang intentionen + negativerne · kun HVAD · hvert berørt område dækket",
  },
  "planner-code": {
    aktoer: "code",
    producerer: ["plan"],
    web: false,
    kode: true,
    ejerMaalelag: false,
    raadgivende: false,
    freshness: "frisk session, ≠ recon-Code og ≠ builder-Code",
    forbyg_input: "krav-hash + forstå hvert K-n inkl. negativer",
    forbyg_output: "1:1 m. build · design fejl-klasser UD (constraints/types/RLS) · bid prover-bevisbar",
  },
  "builder-code": {
    aktoer: "code",
    producerer: ["build"],
    web: false,
    kode: true,
    ejerMaalelag: false, // Code skriver ALDRIG måle-laget
    raadgivende: false,
    freshness: "frisk session, ≠ planner-Code",
    forbyg_input: "plan-SHA + forstå mål inkl. negativer + committet angrebs-spec",
    forbyg_output: "design fejlen UD (umulighed > korrekthed) · små bids · byg fra artefakt, ikke hukommelse",
  },
  "code-reviewer": {
    aktoer: "code-reviewer",
    producerer: ["verdikt"],
    web: false,
    kode: true,
    ejerMaalelag: false,
    raadgivende: false,
    freshness: "frisk session ≠ byggerens",
    forbyg_input: "plan/diff ved SHA + forstå den faktiske logik/opsætning",
    forbyg_output: "dybde-inspektion → claim_graph_refs (kun gyldig ved eksekveret + dræbt mutant)",
  },
  "codex-angreb": {
    aktoer: "codex",
    producerer: ["verdikt", "angrebs-spec"],
    web: false, // angreb må ikke skabe nye 'sandheder' via web
    kode: true,
    ejerMaalelag: true, // Codex EJER måle-laget (der måler ≠ der bygger)
    raadgivende: false,
    freshness: "--ephemeral, cross-vendor (gpt-5.5 xhigh)",
    forbyg_input: "forstå artefaktet ved dets SHA før angreb",
    forbyg_output: "falsk-grøn-jagt · dybde intrinsisk (overfladisk test = falsk-grøn) · kill-list up-front",
  },
  "codex-forbedring": {
    aktoer: "codex",
    producerer: ["raad"],
    web: true, // forbedring MÅ søge alternativer på nettet
    kode: true,
    ejerMaalelag: false,
    raadgivende: true, // ingen gate — rådgivende
    freshness: "separat agent fra angreb",
    forbyg_input: "forstå det aktuelle design før forslag",
    forbyg_output: "bedre alternativer (test/forbyg/dybde) — rådgivende, aldrig en gate",
  },
});

export const ROLLE_IDS = Object.freeze(Object.keys(ROLLER));

const isNonEmptyString = (v) => typeof v === "string" && v.length > 0;

// validateRolle(id, r) → {ok, reasons}: strukturel konsistens af ÉN rolle.
export function validateRolle(id, r) {
  const reasons = [];
  const fail = (m) => reasons.push(`${id}: ${m}`);
  if (r === null || typeof r !== "object") return { ok: false, reasons: [`${id}: rolle er ikke et objekt`] };
  if (!ACTOR_SLUGS.includes(r.aktoer)) fail(`ukendt aktør '${String(r.aktoer)}'`);
  if (!Array.isArray(r.producerer) || r.producerer.length === 0) fail("producerer skal være ikke-tomt array");
  else for (const t of r.producerer) if (!OUTPUT_TYPES.includes(t)) fail(`ukendt output-type '${t}'`);
  for (const b of ["web", "kode", "ejerMaalelag", "raadgivende"])
    if (typeof r[b] !== "boolean") fail(`${b} skal være boolean`);
  for (const s of ["freshness", "forbyg_input", "forbyg_output"]) if (!isNonEmptyString(r[s])) fail(`${s} mangler`);
  return { ok: reasons.length === 0, reasons };
}

// validateRoller() → {ok, reasons}: hele registryet + de tværgående invarianter
// der bærer planens sandheder (så en fremtidig redigering ikke tavst bryder dem).
export function validateRoller() {
  const reasons = [];
  for (const [id, r] of Object.entries(ROLLER)) {
    const v = validateRolle(id, r);
    if (!v.ok) reasons.push(...v.reasons);
  }
  // invariant 1: KUN codex-angreb ejer måle-laget (der måler ≠ der bygger).
  const ejere = ROLLE_IDS.filter((id) => ROLLER[id].ejerMaalelag);
  if (JSON.stringify(ejere) !== JSON.stringify(["codex-angreb"]))
    reasons.push(`måle-lag-ejerskab skal være præcis {codex-angreb}, er {${ejere.join(", ")}}`);
  // invariant 2: claude-ai vurderer ALDRIG kode (kode:false for begge claude-ai-roller).
  for (const id of ROLLE_IDS)
    if (ROLLER[id].aktoer === "claude-ai" && ROLLER[id].kode !== false)
      reasons.push(`${id}: claude-ai må aldrig vurdere kode (kode skal være false)`);
  // invariant 3: KUN codex-forbedring har web (recon + angreb + byg er web-forbudt).
  const webRoller = ROLLE_IDS.filter((id) => ROLLER[id].web);
  if (JSON.stringify(webRoller) !== JSON.stringify(["codex-forbedring"]))
    reasons.push(`web skal være præcis {codex-forbedring}, er {${webRoller.join(", ")}}`);
  // invariant 4: KUN codex-forbedring er rådgivende (alle andre bidrager til en gate).
  const raad = ROLLE_IDS.filter((id) => ROLLER[id].raadgivende);
  if (JSON.stringify(raad) !== JSON.stringify(["codex-forbedring"]))
    reasons.push(`rådgivende skal være præcis {codex-forbedring}, er {${raad.join(", ")}}`);
  return { ok: reasons.length === 0, reasons };
}
