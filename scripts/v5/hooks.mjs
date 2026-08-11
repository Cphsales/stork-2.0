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

// writeDecision({rawPath, repoRoot, planLocked}) → {decision:"allow"|"deny", zone, reason}
// Fail-closed forbygning ved skrive-kald fra en Code-session:
// - udenfor repo  → deny (mistænkeligt / uden for fabrikkens greb)
// - sandhed       → deny (Mathias' bord; AI skriver aldrig)
// - måle-lag      → deny (der måler ≠ der bygger; Codex/CI ejer)
// - produkt, før plan-laast → deny (default-deny: intet produkt bygges før plan OK)
// - produkt, efter plan-laast → allow (build-fasen; de finere attack-spec-/
//   driver-routing-regler tilføjes med driver-biddet)
export function writeDecision(input) {
  // fail-closed på malformeret input: en hook-API skal returnere deny, aldrig
  // kaste (en wrapper der fejlhåndterer en exception kunne blive fail-open).
  if (input === null || typeof input !== "object" || Array.isArray(input))
    return { decision: "deny", zone: "udenfor", reason: "ugyldigt input (fail-closed)" };
  const ip = Object.getPrototypeOf(input);
  if (ip !== Object.prototype && ip !== null)
    return { decision: "deny", zone: "udenfor", reason: "input har ikke-standard prototype (manipuleret)" };
  const { rawPath, repoRoot, planLocked } = input;
  const zone = pathZone(rawPath, repoRoot);
  switch (zone) {
    case "udenfor":
      return { decision: "deny", zone, reason: "skrivning uden for repoet (fail-closed)" };
    case "sandhed":
      return { decision: "deny", zone, reason: "docs/sandhed er Mathias' bord — AI skriver aldrig her" };
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
