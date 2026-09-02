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
    forbyg_output: "komplet scope (ikke første-fund) · forstået (selv-testet) fund · OID-evidens pr. fund · kode-punkt ≠ intet-data",
  },
  "recon-codex": {
    aktoer: "codex",
    producerer: ["recon-candidate"],
    web: false,
    kode: true,
    ejerMaalelag: false,
    raadgivende: false,
    freshness: "--ephemeral, blind for de andre (uafhængighed er strukturel, ikke en jagt)",
    forbyg_input: "hash + forstå HELE pakke-kontekst-bundlet",
    forbyg_output: "komplet scope · forstået (selv-testet) fund · OID-evidens pr. fund · kode-punkt ≠ intet-data",
  },
  "recon-claude-ai": {
    aktoer: "claude-ai",
    producerer: ["recon-candidate"],
    web: false,
    kode: false,
    ejerMaalelag: false,
    raadgivende: false,
    freshness: "frisk chat, blind for de andre",
    forbyg_input: "forstå forretnings-konteksten i bundlet + byg fra committet SHA",
    forbyg_output: "hele forretnings-flade enumereret mod docs-struktur · hvert fund doc-forankret el. intet-data-flaget · spørg v. uklarhed (aldrig antag)",
  },
  "claude-ai": {
    aktoer: "claude-ai",
    producerer: ["verdikt"],
    web: false,
    kode: false, // forretnings-mening, ALDRIG kode-vurdering (Codex' bord)
    ejerMaalelag: false,
    raadgivende: false,
    freshness: "frisk terminal-session pr. gate",
    forbyg_input: "handover-HALT mod recon-hash + forstå recon",
    forbyg_output: "fang intentionen + negativerne · kun HVAD · hvert berørt område dækket · aldrig antag intention (HALT) · plan-verdikt OID-bundet (tavshed ≠ ja)",
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
    forbyg_output: "krav-ID-matrix (bijektion) · 1:1 m. build · design fejl-klasser UD (constraints/types/RLS) · bid prover-bevisbar",
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
    forbyg_output: "dybde-inspektion → claim_graph_refs (kun gyldig ved eksekveret + dræbt mutant) · plan⊨krav teknisk-troskab (bid leverer K's HVAD, ikke forretnings-merit)",
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
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
// plain object KUN: arvede/prototype-felter må ikke maskere manglende felter,
// og et array må ikke tælle som en rolle (fail-closed).
const isPlainObject = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};
const isDenseArrayOf = (a, pred) => {
  if (!Array.isArray(a)) return false;
  for (let i = 0; i < a.length; i++) if (!hasOwn(a, i)) return false;
  return a.every(pred);
};

const ROLLE_FELTER = Object.freeze([
  "aktoer",
  "producerer",
  "web",
  "kode",
  "ejerMaalelag",
  "raadgivende",
  "freshness",
  "forbyg_input",
  "forbyg_output",
]);

// validateRolle(id, r) → {ok, reasons}: strukturel konsistens af ÉN rolle
// (egne felter, korrekte typer). Semantik-invarianterne ligger i validateRoller.
export function validateRolle(id, r) {
  const reasons = [];
  const fail = (m) => reasons.push(`${id}: ${m}`);
  if (!isPlainObject(r)) return { ok: false, reasons: [`${id}: rolle er ikke et plain object`] };
  for (const k of Object.keys(r)) if (!ROLLE_FELTER.includes(k)) fail(`ukendt felt '${k}'`);
  for (const k of ROLLE_FELTER) if (!hasOwn(r, k)) fail(`manglende felt '${k}' (arvet/fraværende = rød)`);
  if (reasons.length) return { ok: false, reasons };

  if (!ACTOR_SLUGS.includes(r.aktoer)) fail(`ukendt aktør '${String(r.aktoer)}'`);
  if (!isDenseArrayOf(r.producerer, (t) => OUTPUT_TYPES.includes(t)) || r.producerer.length === 0)
    fail("producerer skal være ikke-tomt, tæt array af kendte output-typer");
  for (const b of ["web", "kode", "ejerMaalelag", "raadgivende"])
    if (typeof r[b] !== "boolean") fail(`${b} skal være boolean`);
  for (const s of ["freshness", "forbyg_input", "forbyg_output"]) if (!isNonEmptyString(r[s])) fail(`${s} mangler`);
  return { ok: reasons.length === 0, reasons };
}

// validateRoller(roller = ROLLER) → {ok, reasons}: hele registryet + planens
// sandheder som SEMANTISKE invarianter (bundet til aktør/producerer, IKKE til
// rolle-id) — så en fremtidig redigering (fx at ændre en rolles aktør) ikke
// tavst kan bryde dem, og nye roller er tilladt så længe de overholder
// semantikken. Tager et map-argument, så en test kan køre PRÆCIS samme logik
// mod en muteret kopi (ingen gen-implementering der kan divergere).
export function validateRoller(roller = ROLLER) {
  const reasons = [];
  if (!isPlainObject(roller)) return { ok: false, reasons: ["roller-map er ikke et plain object"] };
  for (const [id, r] of Object.entries(roller)) {
    const v = validateRolle(id, r);
    if (!v.ok) reasons.push(...v.reasons);
  }
  if (reasons.length) return { ok: false, reasons };

  for (const [id, r] of Object.entries(roller)) {
    const producerer = r.producerer;
    // "der måler ≠ der bygger": måle-lag-ejeren SKAL være en codex-aktør, og en
    // rolle der PRODUCERER kode (build/plan) må ALDRIG eje sit eget måle-lag.
    if (r.ejerMaalelag && r.aktoer !== "codex")
      reasons.push(`${id}: ejer måle-laget men er ikke codex (der måler ≠ der bygger)`);
    if (r.ejerMaalelag && (producerer.includes("build") || producerer.includes("plan")))
      reasons.push(`${id}: en byg-rolle må aldrig eje sit eget måle-lag`);
    // claude-ai vurderer ALDRIG kode.
    if (r.aktoer === "claude-ai" && r.kode !== false)
      reasons.push(`${id}: claude-ai må aldrig vurdere kode (kode skal være false)`);
    // web skaber nye 'sandheder' → kun tilladt for RÅDGIVENDE roller (ingen gate).
    if (r.web && !r.raadgivende)
      reasons.push(`${id}: web kun tilladt for rådgivende roller (recon/angreb/byg web-forbudt)`);
    // en rådgivende rolle bidrager ALDRIG til en gate → producerer kun 'raad'.
    if (r.raadgivende && !(producerer.length === 1 && producerer[0] === "raad"))
      reasons.push(`${id}: rådgivende rolle må kun producere 'raad' (aldrig gate-bidrag)`);
    if (!r.raadgivende && producerer.includes("raad")) reasons.push(`${id}: kun rådgivende roller må producere 'raad'`);
  }
  // mindst én måle-lag-ejer skal findes (ellers ejer INGEN måle-laget).
  if (!Object.values(roller).some((r) => r.ejerMaalelag))
    reasons.push("ingen rolle ejer måle-laget (Codex/angreb skal)");
  return { ok: reasons.length === 0, reasons };
}
