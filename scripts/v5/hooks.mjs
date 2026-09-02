#!/usr/bin/env node
// hooks.mjs — v5's forbyggende skrive-klassificering (plan 2.E, lokal del).
//
// Lokale hooks = FRIKTION/UX (fail-lukket forbygning ved kilden), IKKE
// autoritet: den u-forfalskelige håndhævelse er GitHub rulesets/branch-
// protection (DEL V, admin). Dette modul er den KANONISKE definition af hvad
// der er måle-lag / sandhed / produkt — samme definition genbruges senere af
// ruleset-genereringen, så hook og platform ikke kan divergere.
//
// Kernen er ren path-klassificering: robust normalisering (relativ/absolut/.. ·
// backslash→separator) + SEGMENT-sikker prefix-match (scripts/v5 rammer ikke
// scripts/v5x). En tekstuel sti klassificeres; symlink-escape er sandboxens
// bord (jf. prover).
//
// PLATFORM (bevidst): klassificeringen er case-SENSITIV og POSIX — det matcher
// præcis hvad git/GitHub håndhæver på vores stak (Linux/WSL2). En case-fold
// ville DIVERGERE fra platformen. Windows-runtime er uden for scope.

import { isAbsolute, relative, resolve, sep } from "node:path";

// Måle-laget: "der måler ≠ der bygger" — Code må aldrig skrive her (Codex/CI
// ejer). Sandhed: Mathias' bord — AI skriver aldrig her.
export const MEASUREMENT_PREFIXES = Object.freeze([
  "scripts/v5",
  "test/v5",
  ".claude",
  ".github/workflows",
  ".workflow-state",
]);
export const SANDHED_PREFIXES = Object.freeze(["docs/sandhed"]);

// segment-sikker: relPath === prefix ELLER relPath starter med prefix + "/".
// (rammer "scripts/v5" og "scripts/v5/foo", men ALDRIG "scripts/v5x".)
const underPrefix = (relPath, prefix) => relPath === prefix || relPath.startsWith(prefix + "/");
const underAny = (relPath, prefixes) => prefixes.some((p) => underPrefix(relPath, p));

// toRepoRel(rawPath, repoRoot) → {relPath, escapes}
// Normaliserer til en repo-relativ POSIX-sti. escapes=true hvis stien peger
// uden for repoRoot (efter .. -opløsning) — fail-closed-signal.
export function toRepoRel(rawPath, repoRoot) {
  if (typeof rawPath !== "string" || rawPath.length === 0) return { relPath: null, escapes: true };
  if (typeof repoRoot !== "string" || repoRoot.length === 0) return { relPath: null, escapes: true };
  // backslash → separator FØR klassificering: 'scripts\v5\x' skal ikke slippe
  // forbi måle-lags-matchen som et "produkt"-filnavn (fail-closed).
  const posixRaw = rawPath.replaceAll("\\", "/");
  const root = resolve(repoRoot);
  const abs = isAbsolute(posixRaw) ? resolve(posixRaw) : resolve(root, posixRaw);
  const rel = relative(root, abs);
  // uden for repo: relative giver "" (= roden selv, ok) eller starter med ".."
  if (rel === "") return { relPath: "", escapes: false };
  if (rel === ".." || rel.startsWith(".." + sep)) return { relPath: null, escapes: true };
  return { relPath: rel.split(sep).join("/"), escapes: false };
}

// pathZone(rawPath, repoRoot) → "sandhed" | "maale-lag" | "produkt" | "udenfor"
export function pathZone(rawPath, repoRoot) {
  const { relPath, escapes } = toRepoRel(rawPath, repoRoot);
  if (escapes || relPath === null || relPath === "") return "udenfor";
  if (underAny(relPath, SANDHED_PREFIXES)) return "sandhed";
  if (underAny(relPath, MEASUREMENT_PREFIXES)) return "maale-lag";
  return "produkt";
}

// writeDecision({rawPath, repoRoot, planLocked, kravUpload?}) → {decision, zone, reason}
// Fail-closed forbygning ved skrive-kald fra en Code-session:
// - udenfor repo  → deny (mistænkeligt / uden for fabrikkens greb)
// - sandhed       → deny (Mathias' bord; AI skriver aldrig) — MED én smal,
//   eksplicit driver-rute (Mathias 2026-09-02, terminal-krav-modellen):
//   kravUpload = { pakke, udkastBlobOid } tillader skriv til PRÆCIS
//   `docs/sandhed/krav/<pakke>-krav.md` — driverens byte-identiske flyt af
//   udkastet på Mathias' `krav upload`-ord. Alle andre sandhed-stier forbliver
//   deny (sandhed-protect slækkes ALDRIG generelt); byte-identiteten
//   (krav-blob-OID == udkast-blob-OID) håndhæves af driver-flytten + er
//   re-verificerbar ved krav-gatens OID-binding.
// - måle-lag      → deny (der måler ≠ der bygger; Codex/CI ejer)
// - produkt, før plan-laast → deny (default-deny: intet produkt bygges før plan OK)
// - produkt, efter plan-laast → allow (build-fasen; de finere attack-spec-/
//   driver-routing-regler tilføjes med driver-biddet)
const KRAV_PAKKE_RE = /^[a-z][a-z0-9-]*$/; // samme som launcher (anti-traversal)
const isHexOid = (s) => typeof s === "string" && /^[0-9a-f]{40}$/.test(s);
export function writeDecision(input) {
  // fail-closed på malformeret input: en hook-API skal returnere deny, aldrig
  // kaste (en wrapper der fejlhåndterer en exception kunne blive fail-open).
  if (input === null || typeof input !== "object" || Array.isArray(input))
    return { decision: "deny", zone: "udenfor", reason: "ugyldigt input (fail-closed)" };
  const ip = Object.getPrototypeOf(input);
  if (ip !== Object.prototype && ip !== null)
    return { decision: "deny", zone: "udenfor", reason: "input har ikke-standard prototype (manipuleret)" };
  const { rawPath, repoRoot, planLocked, kravUpload } = input;
  const zone = pathZone(rawPath, repoRoot);
  switch (zone) {
    case "udenfor":
      return { decision: "deny", zone, reason: "skrivning uden for repoet (fail-closed)" };
    case "sandhed": {
      // smal driver-rute for krav-upload — alle betingelser EKSPLICITTE og
      // fail-closed: plain object mandat + gyldigt pakke-navn + udkast-OID +
      // eksakt sti-match. Alt andet i sandhed = deny som altid.
      if (kravUpload !== undefined && kravUpload !== null) {
        const kp = Object.getPrototypeOf(kravUpload);
        const plain = typeof kravUpload === "object" && !Array.isArray(kravUpload) && (kp === Object.prototype || kp === null);
        if (
          plain &&
          typeof kravUpload.pakke === "string" &&
          KRAV_PAKKE_RE.test(kravUpload.pakke) &&
          isHexOid(kravUpload.udkastBlobOid)
        ) {
          const { relPath } = toRepoRel(rawPath, repoRoot);
          if (relPath === `docs/sandhed/krav/${kravUpload.pakke}-krav.md`)
            return {
              decision: "allow",
              zone,
              reason: `krav-upload (driver-flyt på Mathias' ord): docs/sandhed/krav/${kravUpload.pakke}-krav.md — byte-identisk mod udkast ${kravUpload.udkastBlobOid.slice(0, 12)}`,
            };
        }
        return { decision: "deny", zone, reason: "kravUpload-mandat ugyldigt eller sti-mismatch (fail-closed)" };
      }
      return { decision: "deny", zone, reason: "docs/sandhed er Mathias' bord — AI skriver aldrig her" };
    }
    case "maale-lag":
      return { decision: "deny", zone, reason: "måle-laget ejes af Codex/CI (der måler ≠ der bygger)" };
    case "produkt":
      // eksplicit true — en truthy string/tal/objekt må ALDRIG åbne produkt-skriv.
      return planLocked === true
        ? { decision: "allow", zone, reason: "produkt-skriv tilladt efter plan-laast (build-fasen)" }
        : { decision: "deny", zone, reason: "default-deny: intet produkt bygges før plan OK (plan-laast)" };
    default:
      return { decision: "deny", zone: "udenfor", reason: "ukendt zone (fail-closed)" };
  }
}

// buildWriteDecision(input) → {decision, zone, reason}  (plan 2.E, attack-spec-gate)
//
// Den FINE build-fase-gate writeDecision udskyder eksplicit "til driver-biddet".
// Efter plan-laast er et produkt-skriv en TILSTAND-maskine, ikke et frit ja:
// et skriv er KUN tilladt hvis det er (a) DRIVER-routet, (b) bundet til en aktiv
// bid, og (c) den bid har en COMMITTET angrebs-spec (angrebet skal foreligge FØR
// byg — ellers er der intet at måle dybden mod). Alt andet → deny. En positiv
// allowlist: direkte skriveveje uden om driveren OG auto-fix-/"issue→PR"-makroer
// (som aldrig er driver-routede bid-byg) falder automatisk i deny.
//
// input = { rawPath, repoRoot, planLocked, driverRouted, bidId, bidAngrebsSpecCommitted }
export function buildWriteDecision(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input))
    return { decision: "deny", zone: "udenfor", reason: "ugyldigt input (fail-closed)" };
  const ip = Object.getPrototypeOf(input);
  if (ip !== Object.prototype && ip !== null)
    return { decision: "deny", zone: "udenfor", reason: "input har ikke-standard prototype (manipuleret)" };

  // RENE data-felter: en getter kunne returnere en gyldig værdi UNDER checket og
  // en anden BAGEFTER (ustabilt input); symbol/ikke-enumerable/ukendte egne felter
  // skjuler intention. Afvis dem, og SNAPSHOT værdierne én gang før brug.
  // RESIDUAL (ærlig, Codex): en Proxy kan lyve om ownKeys/descriptors og alligevel
  // levere grønne værdier — det kan en ren JS-funktion ikke afsløre. Men input her
  // er DRIVER-leveret autoritet (driverRouted/bidId/angrebs-spec er driverens fakta,
  // ikke bruger-data), og driveren konstruerer plain-data, ikke Proxies. Transport-
  // laget (driver-signatur + aktiv-bid-lookup) er den egentlige garanti; dette lag
  // er fail-closed forbygning oven på den.
  const ALLOWED = ["rawPath", "repoRoot", "planLocked", "driverRouted", "bidId", "bidAngrebsSpecCommitted"];
  for (const k of Reflect.ownKeys(input)) {
    if (typeof k === "symbol")
      return { decision: "deny", zone: "udenfor", reason: "symbol-nøgle i input (fail-closed)" };
    const d = Object.getOwnPropertyDescriptor(input, k);
    if (typeof d.get === "function" || typeof d.set === "function" || !d.enumerable)
      return { decision: "deny", zone: "udenfor", reason: `accessor/ikke-enumerable felt '${k}' i input (fail-closed)` };
    if (!ALLOWED.includes(k))
      return { decision: "deny", zone: "udenfor", reason: `ukendt felt '${k}' i input (fail-closed)` };
  }
  // læs KUN egne DATA-felter: et felt arvet fra (en forurenet) Object.prototype
  // eller en accessor må aldrig levere en fakta til et ellers tomt {}. (Global
  // built-in-prototype-mutation er en runtime-antagelse uden for scope — samme
  // note som i actors-lock/verdikt; her lukkes object-NIVEAU-arv.)
  const ownVal = (k) => {
    const d = Object.getOwnPropertyDescriptor(input, k);
    return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined;
  };
  const rawPath = ownVal("rawPath");
  const repoRoot = ownVal("repoRoot");
  const planLocked = ownVal("planLocked");
  const driverRouted = ownVal("driverRouted");
  const bidId = ownVal("bidId");
  const bidAngrebsSpecCommitted = ownVal("bidAngrebsSpecCommitted");

  // zone-gaten først (samme kanoniske klassificering; måle-lag/sandhed/udenfor
  // afvises uanset build-fase-flag). Snapshot'ede værdier — ikke live input.
  const coarse = writeDecision({ rawPath, repoRoot, planLocked });
  if (coarse.decision === "deny") return coarse;

  // her: zone = produkt OG planLocked === true. Anvend attack-spec-tilstanden.
  if (driverRouted !== true)
    return { decision: "deny", zone: "produkt", reason: "direkte skrivevej uden om driveren (kun driver-routede bid-byg tillades)" };
  if (typeof bidId !== "string" || bidId.length === 0)
    return { decision: "deny", zone: "produkt", reason: "skriv uden aktiv bid (bidId mangler)" };
  if (bidAngrebsSpecCommitted !== true)
    return { decision: "deny", zone: "produkt", reason: "bid mangler committet angrebs-spec (angrebet skal foreligge før byg)" };
  return { decision: "allow", zone: "produkt", reason: `produkt-skriv tilladt: driver-routet bid '${bidId}' med committet angrebs-spec` };
}
