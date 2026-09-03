#!/usr/bin/env node
// preflight.mjs — aktør-pre-flight (plan 2.F, Mathias 2026-09-03: "altid nyeste").
//
// Grænsen (planens ord): "nyeste CLI" er TRANSPORT — opdateres automatisk før
// aktør-spawn; "nyeste MODEL" er AKTØR-IDENTITET/provenance — et model-skift
// kræver Mathias' ord + actors.lock-opdatering, aldrig automatik (gpt-5.6 var
// fx afvist af kontoen). Driveren kalder disse PURE beslutninger med friske
// opslag (installeret version · `npm view <pkg> version` · kontoens model-
// liste) og handler på svaret. Fail-closed: malformet input → halt, aldrig
// et tavst "ok".

const SEMVER_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

// cmpSemver(a, b) → -1 | 0 | 1 · kaster på malformet (fail-closed opstrøms)
export function cmpSemver(a, b) {
  const pa = typeof a === "string" ? a.match(SEMVER_RE) : null;
  const pb = typeof b === "string" ? b.match(SEMVER_RE) : null;
  if (!pa || !pb) throw new Error(`cmpSemver: malformet version ('${String(a)}' vs '${String(b)}')`);
  for (let i = 1; i <= 3; i++) {
    const d = Number(pa[i]) - Number(pb[i]);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

// decideCliPreflight({installed, newest}) → {action: "ok"|"opdater"|"halt", reason}
// CLI = transport: bagud → "opdater" (driveren opdaterer FØR aktøren spawnes;
// fejler opdateringen → driveren HALTer med besked). Malformet → halt.
export function decideCliPreflight({ installed, newest } = {}) {
  let cmp;
  try {
    cmp = cmpSemver(installed, newest);
  } catch (e) {
    return { action: "halt", reason: `pre-flight kunne ikke afgøre CLI-version (fail-closed): ${e.message}` };
  }
  if (cmp < 0) return { action: "opdater", reason: `CLI ${installed} er bagud (nyeste ${newest}) — opdatér FØR aktør-spawn` };
  return { action: "ok", reason: `CLI ${installed} er nyeste (${newest})` };
}

// decideModelPreflight({pinned, vurderede, available}) →
//   {action: "ok"|"flag-mathias"|"halt", reason, nye}
// MODEL = aktør-identitet: pinned SKAL være tilgængelig for kontoen (ellers
// halt — aktøren kan ikke køre som sin lock'ede identitet). Nyere/ukendte
// modeller (available ∖ (vurderede ∪ {pinned})) → flag til Mathias — skiftet
// er HANS ord + actors.lock-opdatering, aldrig automatik.
export function decideModelPreflight({ pinned, vurderede, available } = {}) {
  if (typeof pinned !== "string" || pinned.length === 0)
    return { action: "halt", reason: "model-pin mangler i actors.lock (fail-closed)", nye: [] };
  if (!Array.isArray(available) || !available.every((m) => typeof m === "string"))
    return { action: "halt", reason: "kontoens model-liste mangler/ugyldig (fail-closed)", nye: [] };
  if (!available.includes(pinned))
    return { action: "halt", reason: `pinned model '${pinned}' er ikke tilgængelig for kontoen — aktør-identiteten kan ikke opfyldes`, nye: [] };
  const kendte = new Set([pinned, ...(Array.isArray(vurderede) ? vurderede : [])]);
  const nye = available.filter((m) => !kendte.has(m)).sort();
  if (nye.length > 0)
    return { action: "flag-mathias", reason: `nye modeller tilgængelige (${nye.join(", ")}) — skift er Mathias' ord + actors.lock, aldrig automatik`, nye };
  return { action: "ok", reason: `pinned '${pinned}' kører; ingen u-vurderede modeller`, nye: [] };
}
