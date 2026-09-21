#!/usr/bin/env node
// angrebs-indeks.selftest.mjs — red-team af validateAngrebsIndeks (skema 2, hurtigt spor 2026-09-21): komplethed mod manifestet
// (form · negativ · delbevis · D10 · K-gulv · bid-graf) og bindings/filer/oids — hvert hul → rød m. navngivet grund.
import { validateAngrebsIndeks } from "./angrebs-indeks.mjs";
let passed = 0, failed = 0;
const ok = (n) => { passed++; console.log(`  ✓ ${n}`); };
const bad = (n, d) => { failed++; console.error(`  ✗ ${n} — ${d}`); };
const green = (n, r) => (r.ok ? ok(n) : bad(n, `rød: ${r.reasons.join(" | ").slice(0, 500)}`));
const red = (n, r, needle) => { const hit = r.reasons.some((x) => new RegExp(needle).test(x)); !r.ok && hit ? ok(n) : bad(n, r.ok ? "GRØN (hullet slap igennem)" : `rød men uden '${needle}': ${r.reasons.join(" | ").slice(0, 400)}`); };
const O = "0".repeat(40), P = "1".repeat(40), MO = "2".repeat(40), T1 = "3".repeat(40), T2 = "4".repeat(40);
const rc = (sqlstate, sted, grund, fase = "wrapper", aktoer = "app_role") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "f(text)" });
const MANIFEST = { schema_version: 1, pakke: "pk", bindings: { forventningsliste: { path: "plan-build/pk/forventningsliste.md", oid: O }, krav: { path: "docs/sandhed/krav/pk-krav.md", oid: O }, plan: { path: "plan-build/pk/plan.md", oid: P } },
  guards: [{ id: "g.navn", beskrivelse: "navn" }, { id: "g.andet", beskrivelse: "andet" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", effekt_bid: "bid-2", kildeankre: ["K:1"], assertions: [{ id: "audit-row", form: "MH" }], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blank", reject_contract: rc("22023", "f.lokation_opret", "navn_blank"), sole_guard_ref: "g.navn" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], assertions: [{ id: "hist", form: "FS" }], negatives: [] },
    { id: "K-2/ac-1", k_id: "K-2", kind: "ac", proof_forms: ["UT"], scope: "nu", kildeankre: ["K:9"], negatives: [{ id: "K-2/ac-1/neg-1", beskrivelse: "x", reject_contract: rc("P0001", "f.x", "x") }] },
  ] };
const F1 = "scripts/v5/pk/tests/k1.test.mjs", F2 = "scripts/v5/pk/tests/k2.test.mjs";
const IDX = () => ({ schema_version: 2, pakke: "pk", bindings: { manifest: { path: "plan-build/pk/forventnings-manifest.json", oid: MO }, plan: { path: "plan-build/pk/plan.md", oid: P } },
  bids: [{ bid_id: "bid-1", kind: "forudsaetning", depends_on: [], covers: [] }, { bid_id: "bid-2", kind: "effekt", depends_on: ["bid-1"], covers: ["K-1/ac-1", "K-1/ac-3", "K-2/ac-1"] }],
  tests: [
    { id: "t-k1-neg", file: F1, oid: T1, covers: ["K-1/ac-1:UT", "K-1/ac-1/neg-1"] },
    { id: "t-k1-audit", file: F1, oid: T1, covers: ["K-1/ac-1:MH", "K-1/ac-1|audit-row"] },
    { id: "t-k1-fs", file: F1, oid: T1, covers: ["K-1/ac-3:FS", "K-1/ac-3|hist"] },
    { id: "t-k2-neg", file: F2, oid: T2, covers: ["K-2/ac-1:UT", "K-2/ac-1/neg-1"] },
  ],
  mutants: [
    { mutant_id: "m-navn", guard_ref: "g.navn", apply: "M_NAVN_OFF", restore: "M_NAVN_ON", target_test_ids: ["t-k1-neg"], control_test_ids: ["t-k1-fs"] },
    { mutant_id: "m-k2", guard_ref: "g.andet", apply: "M2_OFF", restore: "M2_ON", target_test_ids: ["t-k2-neg"], control_test_ids: ["t-k1-neg"] },
  ] });
const V = (f) => { const i = IDX(); f(i); return validateAngrebsIndeks(i, MANIFEST); };
const t = (i) => IDX().tests[i];
console.log("grøn:");
green("komplet indeks → grøn", V(() => {}));
console.log("\nskema/bindings:");
red("schema_version 1 (DSL) → rød", V((i) => (i.schema_version = 1)), "schema_version ≠ 2");
red("pakke ≠ manifestets", V((i) => (i.pakke = "anden")), "pakke ≠");
red("bindings.manifest uden oid", V((i) => delete i.bindings.manifest.oid), "bindings.manifest skal være");
red("bindings.plan ≠ manifestets plan-binding", V((i) => (i.bindings.plan.oid = O)), "bindings.plan ≠ manifestets");
red("ikke et objekt", validateAngrebsIndeks(null, MANIFEST), "plain object");
red("ugyldigt manifest → rød (fail-closed)", validateAngrebsIndeks(IDX(), { ...MANIFEST, obligations: [] }), "manifestet er ugyldigt");
console.log("\ntests — komplethed og referencer:");
red("UT-formen udækket (test fjernet) → rød", V((i) => (i.tests = i.tests.filter((x) => x.id !== "t-k2-neg"))), "ingen test dækker formen UT");
red("negativet udækket (covers uden neg-id) → rød", V((i) => (i.tests[3].covers = ["K-2/ac-1:UT"])), "negativ 'K-2/ac-1/neg-1': ingen test");
red("delbevis udækket → rød", V((i) => (i.tests[1].covers = ["K-1/ac-1:MH"])), "delbeviset 'audit-row'");
red("covers m. form der ikke er manifestets for forpligtelsen → rød", V((i) => i.tests[2].covers.push("K-1/ac-3:UT")), "formen er ikke manifestets");
red("covers m. ukendt reference → rød", V((i) => i.tests[0].covers.push("K-9/ac-1:UT")), "ikke en manifest-reference");
red("covers m. ukendt delbevis → rød", V((i) => i.tests[0].covers.push("K-1/ac-1|findes-ikke")), "ukendt delbevis");
red("tom covers → rød", V((i) => (i.tests[0].covers = [])), "covers skal være et ikke-tomt");
red("file uden for scripts/v5/<pakke>/tests/ → rød", V((i) => (i.tests[0].file = "supabase/tests/k1.test.mjs")), "file skal ligge under");
red("file m. '..' → rød", V((i) => (i.tests[0].file = "scripts/v5/pk/tests/../../x.test.mjs")), "file skal ligge under");
red("file uden .test.mjs → rød", V((i) => (i.tests[0].file = "scripts/v5/pk/tests/k1.mjs")), "file skal ligge under");
red("oid mangler → rød", V((i) => delete i.tests[0].oid), "oid \\(blob af testfilen\\) mangler");
red("dublet test-id → rød", V((i) => (i.tests[1].id = "t-k1-neg")), "dublet test-id");
red("tests tom → rød", V((i) => (i.tests = [])), "tests skal være et ikke-tomt");
console.log("\nmutanter — D10 og K-gulv:");
red("mutant m. ukendt guard_ref → rød", V((i) => (i.mutants[0].guard_ref = "g.ukendt")), "ikke deklareret");
red("mutant uden apply → rød", V((i) => delete i.mutants[0].apply), "apply/restore kræves");
red("targets tomme → rød", V((i) => (i.mutants[0].target_test_ids = [])), "target_test_ids skal være");
red("target ukendt → rød", V((i) => (i.mutants[0].target_test_ids = ["t-x"])), "target_test_ids skal være");
red("controls overlapper targets → rød", V((i) => (i.mutants[0].control_test_ids = ["t-k1-neg"])), "disjunkte fra targets");
red("controls tomme → rød", V((i) => (i.mutants[0].control_test_ids = [])), "control_test_ids skal være");
red("D10: mutanten på eneste-værnet rammer ikke en test der dækker netop negativet → rød", V((i) => (i.mutants[0].target_test_ids = ["t-k1-audit"])), "D10: negativ 'K-1/ac-1/neg-1' bæres alene af 'g.navn'");
red("D10: mutanten på eneste-værnet fjernet → rød", V((i) => (i.mutants = i.mutants.filter((m) => m.mutant_id !== "m-navn"))), "D10");
red("K-gulv: K-2 uden mutant → rød", V((i) => (i.mutants = i.mutants.filter((m) => m.mutant_id !== "m-k2"))), "K 'K-2' har ingen mutant");
red("mutant_id kolliderer m. test-id → rød", V((i) => (i.mutants[1].mutant_id = "t-k1-fs")), "kolliderer");
red("dublet mutant_id → rød", V((i) => (i.mutants[1].mutant_id = "m-navn")), "dublet");
green("mutant m. locus_ref 'plan:…' (I-locus uden manifest-værn) → grøn, tæller for K-gulv", V((i) => { i.mutants[1] = { mutant_id: "m-k2", locus_ref: "plan:T3.2", apply: "X", restore: "Y", target_test_ids: ["t-k2-neg"], control_test_ids: ["t-k1-neg"] }; }));
red("mutant m. både guard_ref og locus_ref → rød", V((i) => (i.mutants[1].locus_ref = "plan:T3.2")), "præcis én af");
red("mutant m. locus_ref uden 'plan:' → rød", V((i) => { delete i.mutants[1].guard_ref; i.mutants[1].locus_ref = "T3.2"; }), "locus_ref");
red("locus_ref-mutant tæller IKKE for D10 (eneste-værn kræver værnets mutant)", V((i) => { delete i.mutants[0].guard_ref; i.mutants[0].locus_ref = "plan:navn"; }), "D10");
green("SA-test som target tæller for D10 (covers negativet)", V((i) => { i.tests.push({ id: "t-k1-sa", file: F1, oid: T1, covers: ["K-1/ac-1/neg-1"] }); i.mutants[0].target_test_ids = ["t-k1-sa"]; }));
console.log("\nbids (D12):");
red("forpligtelse udækket af effekt-bid → rød", V((i) => (i.bids[1].covers = ["K-1/ac-1", "K-1/ac-3"])), "dækkes af intet effekt-bid");
red("effekt_bid-binding brudt → rød", V((i) => { i.bids[1].bid_id = "bid-9"; }), "binder effekt_bid 'bid-2'");
red("cyklus → rød", V((i) => (i.bids[0].depends_on = ["bid-2"])), "cyklisk");
red("forudsætning ingen afhænger af → rød", V((i) => (i.bids[1].depends_on = [])), "intet effekt-bid afhænger af");
red("bids tom → rød", V((i) => (i.bids = [])), "bids skal være");
console.log("");
if (failed) { console.error(`angrebs-indeks: ${failed} FEJLEDE (${passed} ok)`); process.exit(1); }
console.log(`angrebs-indeks red-team: alle ${passed} cases passed`);
