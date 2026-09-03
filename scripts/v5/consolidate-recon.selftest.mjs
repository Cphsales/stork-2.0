#!/usr/bin/env node
// consolidate-recon.selftest.mjs — red-team-cases for den blinde fletning.
// Falsk-grøn-klasserne: tabt divergens (værst) · tavs manglende dækning ·
// forkert input (bundle-mismatch) · attest-mangel · tavs aktør.

import { consolidateRecon, renderReconFiles } from "./consolidate-recon.mjs";

let pass = 0, fail = 0;
const t = (navn, fn) => {
  try { fn(); pass++; }
  catch (e) { fail++; console.error(`RØD  ${navn}: ${e.message}`); }
};
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const SURFACE = { points: [{ id: "migration:a.sql", kind: "migration" }, { id: "config:x", kind: "config" }] };
const OID = "a".repeat(40);
const attester = { workdir_attest: true, web_forbud_attest: true, read_forbud_attest: true };
const bm = { "migration:a.sql": "nuvaerende-kode", "config:x": "nuvaerende-kode" };
const mkFund = (over = {}) => ({ id: "migration:a.sql", boette: "nuvaerende-kode", hvad: "RLS på a", ...over });
const mk = (aktor, over = {}) => ({ aktor, bundle_oid: OID, attester: { ...attester }, bucket_map: { ...bm }, fund: [mkFund()], ...over });
const alle = (over = {}) => [mk("code", over.code), mk("codex", over.codex), { aktor: "claude-ai", bundle_oid: OID, attester: { ...attester }, fund: [], flade_enumeration: ["vision §1"], ...(over["claude-ai"] ?? {}) }];

t("grøn: tre gyldige candidates konsolideres", () => {
  const r = consolidateRecon({ candidates: alle(), surface: SURFACE, bundleOid: OID });
  assert(r.ok, `uventet rød: ${r.reasons.join("; ")}`);
  assert(r.recon.bucket_map["migration:a.sql"] === "nuvaerende-kode", "bucket_map mangler punkt");
  assert(r.recon.fund.length === 1 && r.recon.fund[0].bidrag.length === 1, "ægte dublet ikke deduperet");
  assert(r.recon.flade_enumeration.length === 1, "forretnings-enumeration tabt");
});

t("rød: manglende aktør (tavshed) blokerer", () => {
  const r = consolidateRecon({ candidates: alle().slice(0, 2), surface: SURFACE, bundleOid: OID });
  assert(!r.ok && r.reasons.some((x) => x.includes("manglende aktør: claude-ai")), "tavs aktør gled igennem");
});

t("rød: bundle_oid-mismatch blokerer (forkert input)", () => {
  const c = alle(); c[1].bundle_oid = "b".repeat(40);
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(!r.ok && r.reasons.some((x) => x.includes("codex: bundle_oid")), "bundle-mismatch gled igennem");
});

t("rød: attest ikke eksplicit true blokerer (også arvet)", () => {
  const c = alle(); delete c[0].attester.web_forbud_attest;
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(!r.ok && r.reasons.some((x) => x.includes("code: web_forbud_attest")), "manglende attest gled igennem");
  const c2 = alle(); c2[0].attester = Object.create({ workdir_attest: true, web_forbud_attest: true, read_forbud_attest: true });
  const r2 = consolidateRecon({ candidates: c2, surface: SURFACE, bundleOid: OID });
  assert(!r2.ok, "arvede attester gled igennem (prototype)");
});

t("rød: bucket_map-hul hos én kode-aktør blokerer", () => {
  const c = alle(); delete c[1].bucket_map["config:x"];
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(!r.ok && r.reasons.some((x) => x.includes("codex: bucket_map dækker ikke config:x")), "hul gled igennem");
});

t("rød: bøtte-divergens BLOKERER (vælger aldrig tavst)", () => {
  const c = alle(); c[1].bucket_map["config:x"] = "dokument";
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(!r.ok && r.reasons.some((x) => x.includes("bøtte-divergens på config:x")), "divergens valgt tavst");
  assert(r.konflikter.some((k) => k.type === "boette-divergens" && k.punkt === "config:x"), "konflikt ikke bevaret");
});

t("fund-divergens BEVARES aktør-mærket (samme id, anden substans)", () => {
  const c = alle({ codex: { fund: [mkFund({ hvad: "RLS på a — men ser org-hul" })] } });
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(r.ok, `uventet rød: ${r.reasons.join("; ")}`);
  const f = r.recon.fund.find((x) => x.id === "migration:a.sql");
  assert(f.bidrag.length === 2, "divergerende fund deduperet — TABT DIVERGENS (falsk-grøn)");
  assert(f.bidrag[0].aktor !== f.bidrag[1].aktor, "aktør-mærke mangler");
});

t("rød: fund uden id blokerer (fælles nøgling)", () => {
  const c = alle({ code: { fund: [mkFund({ id: "" })] } });
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(!r.ok && r.reasons.some((x) => x.includes("code: fund uden gyldigt id")), "nøgleløst fund gled igennem");
});

t("rød: dublet-candidate for samme aktør blokerer", () => {
  const c = [...alle(), mk("code")];
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(!r.ok && r.reasons.some((x) => x.includes("dublet-candidate")), "dublet-aktør gled igennem");
});

t("usikkerheder bevares aktør-mærket", () => {
  const c = alle({ code: { fund: [mkFund()], usikkerheder: ["forstod ikke X"] } });
  c[0].usikkerheder = ["forstod ikke X"];
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(r.ok && r.recon.usikkerheder.some((u) => u.aktor === "code" && u.tekst === "forstod ikke X"), "usikkerhed tabt");
});

t("rød: fund-bøtte modsiger konsolideret bucket_map (præsentations-falsk-grøn, Codex-fund)", () => {
  const c = alle({ code: { fund: [mkFund({ boette: "intet-data" })] } });
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(!r.ok && r.reasons.some((x) => x.includes("modsiger den konsoliderede bucket_map")), "selvmodsigende fund-bøtte gled igennem");
});

t("rød: fund med ugyldig bøtte (ville tabes tavst i render, Codex-fund)", () => {
  const c = alle({ code: { fund: [mkFund({ id: "oid:abc:x", boette: "ikke-bygget" })] } });
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(!r.ok && r.reasons.some((x) => x.includes("ugyldig bøtte 'ikke-bygget'")), "ugyldig fund-bøtte gled igennem");
});

t("render-backstop: ukendt bøtte i håndbygget recon → kast (aldrig tavst drop)", () => {
  let threw = false;
  try {
    renderReconFiles({ recon: { fund: [{ id: "x", bidrag: [{ aktor: "code", boette: "ukendt" }] }], usikkerheder: [], flade_enumeration: [], aktorer: [] }, konflikter: [], meta: {} });
  } catch (e) {
    threw = /tavst drop forbudt/.test(e.message);
  }
  assert(threw, "render droppede ukendt bøtte tavst");
});

t("render: mutation er ALDRIG i recon.md (krav-føde), KUN i bilaget (recon-2-spor)", () => {
  const c = alle({ code: { fund: [mkFund({ mutation: "drop WITH CHECK på a" })] } });
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(r.ok, `uventet rød: ${r.reasons.join("; ")}`);
  const { reconMd, bilagMd } = renderReconFiles({ recon: r.recon, konflikter: r.konflikter, meta: { pakke: "p" } });
  assert(!reconMd.includes("drop WITH CHECK"), "mutation lækkede ind i krav-fladen");
  assert(bilagMd.includes("drop WITH CHECK på a"), "mutation mangler i bilaget (spor tabt)");
});

t("render: claude-ai-fund normaliseres (kraever/forbyder → hvad/AFVISER) + divergens er mærket", () => {
  const c = alle({
    codex: { fund: [mkFund({ hvad: "RLS på a — divergent læsning" })] },
    "claude-ai": { fund: [{ id: "doc:x#y", boette: "intet-data", omraade: "cooldown", kraever: "systemet skal K", forbyder: "aldrig F", forankring: "citat — dok x" }], flade_enumeration: ["vision §1"] },
  });
  const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
  assert(r.ok, `uventet rød: ${r.reasons.join("; ")}`);
  const { reconMd } = renderReconFiles({ recon: r.recon, konflikter: r.konflikter, meta: {} });
  assert(reconMd.includes("systemet skal K") && reconMd.includes("AFVISER: aldrig F"), "claude-ai-fund ikke normaliseret");
  assert(reconMd.includes("citat — dok x"), "doc-forankring tabt");
  assert(reconMd.includes("divergens bevaret"), "fund-divergens ikke mærket i krav-fladen");
  assert(reconMd.includes("fund-divergens @ migration:a.sql"), "konflikt-listen mangler divergensen");
});

console.log(`consolidate-recon.selftest: ${pass} grønne, ${fail} røde`);
if (fail > 0) process.exit(1);

// --- B2: divergens-klassificering (påstand → Mathias; ordlyd → AI-spor) ---
{
  let p2 = 0, f2 = 0;
  const t2 = (navn, fn) => { try { fn(); p2++; } catch (e) { f2++; console.error(`RØD  ${navn}: ${e.message}`); } };
  const a2 = (c, m) => { if (!c) throw new Error(m); };
  t2("B2: uklassificeret divergens behandles som påstand (fail-closed)", () => {
    const c = alle({ codex: { fund: [mkFund({ hvad: "anden læsning" })] } });
    const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
    a2(r.ok, r.reasons.join("; "));
    a2(r.konflikter.some((k) => k.klassifikation === "uklassificeret"), "klassifikation mangler");
    const { reconMd } = renderReconFiles({ recon: r.recon, konflikter: r.konflikter, meta: {} });
    a2(reconMd.includes("uklassificeret → behandles som påstand"), "uklassificeret ikke løftet til Mathias");
  });
  t2("B2: ordlyds-forskel markeres som AI-spor (ikke Mathias' bord)", () => {
    const c = alle({ codex: { fund: [mkFund({ hvad: "anden læsning" })] } });
    const r = consolidateRecon({ candidates: c, surface: SURFACE, bundleOid: OID });
    const konf = r.konflikter.map((k) => (k.type === "fund-divergens" ? { ...k, klassifikation: "ordlyds-forskel" } : k));
    const { reconMd } = renderReconFiles({ recon: r.recon, konflikter: konf, meta: {} });
    a2(reconMd.includes("ordlyds-forskel — kun AI-spor"), "ordlyds-forskel ikke markeret");
    a2(!reconMd.includes("uklassificeret → behandles"), "stadig markeret som påstand");
  });
  console.log(`consolidate-recon B2: ${p2} grønne, ${f2} røde`);
  if (f2 > 0) process.exit(1);
}
