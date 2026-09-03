#!/usr/bin/env node
// consolidate-recon.mjs — v5's blinde recon-fletning (plan Fase 1).
//
// Tre blinde candidates → ÉT konsolideret recon-datasæt. Deterministisk og
// fail-closed: konsolidatoren DØMMER ALDRIG semantik — den fletter strukturelt.
//
// Konflikt-bevaring er HÅRD (planens ord): divergenser bevares med aktør-mærke,
// KUN ægte dubletter dedupes (strukturel identitet — deep-equal på substansen),
// kasseret uenighed → BLOKER. Derfor: den eneste mekaniske dedupe er byte-lige
// substans; alt andet bevares side om side. Over-bevaring er kun støj;
// tabt divergens er en falsk-grøn.
//
// Bøtte-divergens på et DERIVERET flade-punkt er en konflikt der ikke kan
// bevares "side om side" (recon-coverage-proofens bucket_map er én-værdi pr.
// punkt) → den BLOKERER (ok:false) i stedet for at vælge tavst.

const BUCKETS = Object.freeze(["nuvaerende-kode", "dokument", "intet-data"]);
const KODE_AKTORER = Object.freeze(["code", "codex"]);
const ALLE_AKTORER = Object.freeze(["code", "codex", "claude-ai"]);
const ATTESTER = Object.freeze(["workdir_attest", "web_forbud_attest", "read_forbud_attest"]);

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isPlainObject = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};

// kanonisk substans-nøgle til ÆGTE-dublet-detektion (sorterede nøgler,
// deterministisk). Kun fund med IDENTISK substans dedupes.
function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
}

// consolidateRecon({candidates, surface, bundleOid}) →
//   { ok, reasons, konflikter, recon: {bucket_map, fund, usikkerheder, flade_enumeration, aktorer} }
// fail-closed: enhver strukturel mangel → ok:false med navngiven grund.
export function consolidateRecon({ candidates, surface, bundleOid }) {
  const reasons = [];
  const konflikter = [];
  const fail = (r) => reasons.push(r);

  if (!Array.isArray(candidates)) return { ok: false, reasons: ["candidates mangler/er ikke en liste"], konflikter, recon: null };
  if (typeof bundleOid !== "string" || bundleOid.length === 0)
    return { ok: false, reasons: ["bundleOid mangler"], konflikter, recon: null };
  const points = surface?.points;
  if (!Array.isArray(points)) return { ok: false, reasons: ["surface.points mangler/ugyldig"], konflikter, recon: null };

  // 1) kandidat-validering: fuldt aktør-sæt, ingen dubletter, bundle-binding, attester
  const byAktor = new Map();
  for (const c of candidates) {
    if (!isPlainObject(c)) { fail("candidate er ikke et objekt"); continue; }
    if (!ALLE_AKTORER.includes(c.aktor)) { fail(`ukendt aktør: ${String(c.aktor)}`); continue; }
    if (byAktor.has(c.aktor)) { fail(`dublet-candidate for aktør: ${c.aktor}`); continue; }
    if (c.bundle_oid !== bundleOid) fail(`${c.aktor}: bundle_oid matcher ikke det committede bundle (læste forkert input)`);
    if (!isPlainObject(c.attester)) fail(`${c.aktor}: attester mangler`);
    else for (const a of ATTESTER) if (!hasOwn(c.attester, a) || c.attester[a] !== true) fail(`${c.aktor}: ${a} ikke eksplicit true`);
    if (!Array.isArray(c.fund)) fail(`${c.aktor}: fund mangler/er ikke en liste`);
    byAktor.set(c.aktor, c);
  }
  for (const want of ALLE_AKTORER) if (!byAktor.has(want)) fail(`manglende aktør: ${want} (anti-tavshed)`);
  if (reasons.length > 0) return { ok: false, reasons, konflikter, recon: null };

  // 2) bucket_map-fletning: kode-aktørerne SKAL dække hvert deriveret punkt.
  // Enighed → værdien; divergens → BLOKER (kan ikke bevares i én-værdi-map).
  const bucket_map = {};
  for (const p of points) {
    const vals = [];
    for (const ak of KODE_AKTORER) {
      const bm = byAktor.get(ak).bucket_map;
      if (!isPlainObject(bm) || !hasOwn(bm, p.id)) { fail(`${ak}: bucket_map dækker ikke ${p.id}`); continue; }
      const b = bm[p.id];
      if (!BUCKETS.includes(b)) { fail(`${ak}: ugyldig bøtte '${String(b)}' for ${p.id}`); continue; }
      vals.push({ ak, b });
    }
    if (vals.length !== KODE_AKTORER.length) continue; // fejl allerede noteret
    const unique = [...new Set(vals.map((v) => v.b))];
    if (unique.length === 1) bucket_map[p.id] = unique[0];
    else {
      konflikter.push({ type: "boette-divergens", punkt: p.id, vals });
      fail(`bøtte-divergens på ${p.id}: ${vals.map((v) => `${v.ak}=${v.b}`).join(" vs ")} (BLOKER — vælg aldrig tavst)`);
    }
  }

  // 3) fund-fletning: nøglet på id. Ægte dubletter (identisk substans, samme id)
  // dedupes; alt andet bevares aktør-mærket. INGEN semantisk dom her.
  const fundById = new Map();
  const seenSubstans = new Set();
  for (const ak of ALLE_AKTORER) {
    for (const f of byAktor.get(ak).fund) {
      if (!isPlainObject(f) || typeof f.id !== "string" || f.id.length === 0) {
        fail(`${ak}: fund uden gyldigt id (fælles nøgling påkrævet)`);
        continue;
      }
      // Codex-fund (2026-09-02): fund-bøtten SKAL være gyldig OG konsistent med
      // den konsoliderede bucket_map for deriverede punkter — ellers kan et
      // kode-punkt VISES i forkert bøtte i recon.md mens gaten er grøn
      // (præsentations-falsk-grøn), eller et fund tabes tavst i renderen.
      if (!BUCKETS.includes(f.boette)) {
        fail(`${ak}: fund ${f.id} med ugyldig bøtte '${String(f.boette)}' (ville tabes/fejlroutes tavst i render)`);
        continue;
      }
      if (hasOwn(bucket_map, f.id) && f.boette !== bucket_map[f.id]) {
        fail(
          `${ak}: fund ${f.id} bøtte '${f.boette}' modsiger den konsoliderede bucket_map '${bucket_map[f.id]}' (intern selvmodsigelse — fail-closed)`,
        );
        continue;
      }
      const { id, ...substans } = f;
      const key = `${id}\u0000${canonical(substans)}`;
      if (seenSubstans.has(key)) continue; // ÆGTE dublet (byte-lig substans)
      seenSubstans.add(key);
      if (!fundById.has(id)) fundById.set(id, []);
      fundById.get(id).push({ aktor: ak, ...f });
    }
  }
  // divergens-markering (samme id, forskellig substans) — bevares, mærkes.
  // B2 (Mathias 2026-09-03): klassifikation starter "uklassificeret"; omission-
  // devil'en dømmer påstands-konflikt (modstridende GØR/AFVISER — Mathias' bord)
  // vs ordlyds-forskel (kun AI-spor). Uklassificeret behandles som påstand
  // (fail-closed: hellere én for meget til Mathias end en tabt modsigelse).
  for (const [id, arr] of fundById)
    if (arr.length > 1) konflikter.push({ type: "fund-divergens", punkt: id, antal: arr.length, klassifikation: "uklassificeret" });

  // 4) usikkerheder + forretnings-enumeration bevares rå (aktør-mærket)
  const usikkerheder = [];
  for (const ak of ALLE_AKTORER)
    for (const u of byAktor.get(ak).usikkerheder ?? []) usikkerheder.push({ aktor: ak, tekst: String(u) });
  const flade_enumeration = (byAktor.get("claude-ai").flade_enumeration ?? []).map(String);

  const ok = reasons.length === 0;
  return {
    ok,
    reasons,
    konflikter,
    recon: ok
      ? {
          bucket_map,
          fund: [...fundById.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([id, bidrag]) => ({ id, bidrag })),
          usikkerheder,
          flade_enumeration,
          aktorer: [...ALLE_AKTORER],
        }
      : null,
  };
}

// renderReconFiles({recon, konflikter, meta}) → {reconMd, bilagMd}
//
// Aftager-kæden definerer formen (plan Fase 1): recon.md er KRAV-føde —
// 3 bøtter, forretnings-oversætbart, hvert fund disposition-klart
// (GØR/AFVISER + negativer = frø til acceptkriterier). Mutation-/test-dybde-
// materiale er IKKE krav-føde → det renderes til BILAGET (recon-2's spor,
// konsumeres i Fase 3/4). Intet kasseres; det ligger hos sin aftager.
// Deterministisk: samme input → byte-samme output (ingen datoer/tilfældighed).
export function renderReconFiles({ recon, konflikter, meta }) {
  if (!recon || typeof recon !== "object") throw new Error("renderReconFiles: recon mangler");
  const m = meta ?? {};
  const buckets = { "nuvaerende-kode": [], dokument: [], "intet-data": [] };
  for (const f of recon.fund)
    for (const bid of f.bidrag) {
      const b = bid.boette;
      // Codex-fund (2026-09-02): ukendt bøtte må ALDRIG droppes tavst — et fund
      // der hverken lander i recon.md eller bilaget er informations-tab.
      // Konsolideringen afviser ugyldige bøtter; dette er fail-closed-backstop.
      if (!Object.prototype.hasOwnProperty.call(buckets, b))
        throw new Error(`renderReconFiles: fund ${f.id} (${bid.aktor}) med ukendt bøtte '${String(b)}' (fail-closed — tavst drop forbudt)`);
      buckets[b].push({ id: f.id, bid, flerAktor: f.bidrag.length > 1 });
    }
  const ev = (bid) =>
    bid.evidens
      ? `${bid.evidens.path}:${Array.isArray(bid.evidens.line_span) ? bid.evidens.line_span.join("-") : "?"} @ ${String(bid.evidens.blob_oid).slice(0, 12)}`
      : (bid.forankring ?? "(uforankret)");
  const negativer = (bid) => {
    const n = bid.negativer ?? (bid.forbyder !== undefined ? [bid.forbyder] : []);
    return Array.isArray(n) ? n : [String(n)];
  };
  const fundLinje = (x) => {
    const hvad = x.bid.hvad ?? x.bid.kraever ?? "";
    const negs = negativer(x.bid).map((n) => `\n  - AFVISER: ${n}`).join("");
    const mark = x.flerAktor ? ` **[divergens bevaret — se Konflikter]**` : "";
    const beroert = x.bid.beroert ? ` · ${x.bid.beroert}` : "";
    const omraade = x.bid.omraade ? ` · ${x.bid.omraade}` : "";
    return `- **${x.id}** (${x.bid.aktor}${beroert}${omraade})${mark}\n  ${hvad}${negs}\n  _evidens:_ ${ev(x.bid)}`;
  };
  const sortKey = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : a.bid.aktor < b.bid.aktor ? -1 : 1);

  const reconMd = [
    `# recon — ${m.pakke ?? "?"}`,
    ``,
    `Status: konsolideret · bundle: ${m.bundle_oid ?? "?"} · anker: ${m.anker ?? "?"}`,
    `Aktører (3-blind): ${recon.aktorer.join(" · ")} · pakke-flade: ${m.flade_punkter ?? "?"} punkter (flade_filter i bundlet)`,
    `Aftager: KRAV-dokken (Fase 2) — hvert fund er disposition-klart (behandlet/udskudt/ikke-relevant).`,
    `Mutation-/test-dybde-materiale: se ${m.bilag_path ?? "recon-2-bilaget"} (aftager: recon-2/plan, Fase 3).`,
    ``,
    `## Bøtte 1 — nuværende kode ("x er bygget sådan — korrekt?")`,
    ``,
    ...buckets["nuvaerende-kode"].sort(sortKey).map(fundLinje),
    ``,
    `## Bøtte 2 — dokument ("dok y siger — korrekt?")`,
    ``,
    ...buckets["dokument"].sort(sortKey).map(fundLinje),
    ``,
    `## Bøtte 3 — intet-data ("hvad skal x kunne?")`,
    ``,
    ...buckets["intet-data"].sort(sortKey).map(fundLinje),
    ``,
    `## Konflikter (bevaret uenighed — aktør-mærket, aldrig kasseret)`,
    ``,
    `_Påstands-konflikter (+ uklassificerede, fail-closed) er Mathias' bord; ordlyds-forskelle er AI-spor og står kun i listen herunder som note._`,
    ``,
    // Codex-fund (2026-09-03): fund-divergenser AFLEDES af selve fund-dataene
    // (bidrag.length > 1) — en stale/manglende konflikt-liste fra kalderen kan
    // aldrig SKJULE en divergens. Konflikt-listen bruges kun som
    // klassifikations-kilde; mangler klassifikationen → uklassificeret (påstand).
    ...(() => {
      const klassMap = new Map(
        (konflikter ?? []).filter((k) => k?.type === "fund-divergens").map((k) => [k.punkt, k.klassifikation]),
      );
      const divergenser = recon.fund
        .filter((f) => f.bidrag.length > 1)
        .map((f) => ({ punkt: f.id, antal: f.bidrag.length, klassifikation: klassMap.get(f.id) ?? "uklassificeret" }));
      const andre = (konflikter ?? []).filter((k) => k?.type !== "fund-divergens");
      const linjer = [
        ...andre.map((k) => `- ${k.type} @ ${k.punkt}${k.antal ? ` (${k.antal} bidrag)` : ""}`),
        ...divergenser.map((d) => {
          const mark =
            d.klassifikation === "ordlyds-forskel"
              ? " _(ordlyds-forskel — kun AI-spor)_"
              : d.klassifikation === "påstands-konflikt"
                ? " **(påstands-konflikt — Mathias' bord)**"
                : " **(uklassificeret → behandles som påstand)**";
          return `- fund-divergens @ ${d.punkt} (${d.antal} bidrag)${mark}`;
        }),
      ];
      return linjer.length ? linjer : ["(ingen)"];
    })(),
    ``,
    `## Usikkerheder (HALT-flag — til afklaring, aldrig oprundet til fund)`,
    ``,
    ...(recon.usikkerheder.length ? recon.usikkerheder.map((u) => `- (${u.aktor}) ${u.tekst}`) : ["(ingen)"]),
    ``,
    `## Forretnings-flade-enumeration (claude-ai — udeladelser er synlige her)`,
    ``,
    ...recon.flade_enumeration.map((e) => `- ${e}`),
    ``,
  ].join("\n");

  const bilagLinjer = [];
  for (const f of recon.fund)
    for (const bid of f.bidrag)
      if (bid.mutation) bilagLinjer.push(`- **${f.id}** (${bid.aktor}): ${bid.mutation}`);
  const bilagMd = [
    `# recon-2-bilag — ${m.pakke ?? "?"} (IKKE krav-føde)`,
    ``,
    `Aftager: recon-2 → plan-dokken (Fase 3) — brydende mutationer pr. fund`,
    `(frø til Codex' kill-lists/angrebs-spec; dømmes ved plan-gaten).`,
    ``,
    ...bilagLinjer.sort(),
    ``,
  ].join("\n");

  return { reconMd, bilagMd };
}
