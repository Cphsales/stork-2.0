#!/usr/bin/env node
// angrebs-spec.selftest.mjs — red-team af måle-spec-validatoren (C1-r2 F-13/F-16/F-18 · C1-r3 F-24/F-26): gyldig spec mod manifest → ok;
// hver plantet indsnævring (udeladt case/negativ/delbevis · forkert bid · blandet kanal · fase/aktør ≠ kontrakt i ALLE varianter ·
// mutant uden footprint/controls · D10-hul · id-kollision · slettet forudsætning) → rød.
import { validateAngrebsSpec } from "./angrebs-spec.mjs";

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const OID = (c) => c.repeat(40);
const rc = (sqlstate, sted, grund, fase = "wrapper", aktoer = "app_role") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "f(text)" });
const manifest = () => ({
  schema_version: 1, pakke: "p", bindings: { forventningsliste: { path: "f.md", oid: OID("a") }, krav: { path: "k.md", oid: OID("b") }, plan: { path: "p.md", oid: OID("c") } },
  guards: [{ id: "g.navn", beskrivelse: "x" }, { id: "g.min", beskrivelse: "y" }, { id: "g.klass", beskrivelse: "z" }, { id: "g.pris", beskrivelse: "w" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", effekt_bid: "bid-2", kildeankre: ["K:1"], assertions: [{ id: "audit-row", form: "MH" }], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "b", reject_contract: rc("22023", "f.opret", "navn_blank"), sole_guard_ref: "g.navn" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], assertions: [{ id: "hist", form: "FS" }], negatives: [] },
    { id: "K-2/ac-6", k_id: "K-2", kind: "ac", proof_forms: ["SA", "UT"], scope: "nu", kildeankre: ["K:6"], assertions: [{ id: "r1", form: "SA" }], negatives: [{ id: "K-2/ac-6/neg-1", beskrivelse: "s", reject_contract: rc("P0001", "f.deakt", "min_en_stand", "apply"), sole_guard_ref: "g.min" }] },
    { id: "K-7/S", k_id: "K-7", kind: "struktur", proof_forms: ["UT"], scope: "nu", kildeankre: ["K:7"], negatives: [{ id: "K-7/S/neg-1", beskrivelse: "ci", reject_contract: { kanal: "exit", exit_code: 1, klasse: "klassifikation", afvisningssted: "ci", fase: "ci", aktoer: "ci" } }] },
  ],
});
const EP = { kind: "rpc", ref: "f" }; const A = { role: "app_role" };
const spec = () => ({
  schema_version: 1, pakke: "p", bindings: { manifest: { path: "m.json", oid: OID("d") }, plan: { path: "p.md", oid: OID("c") } },
  bids: [{ bid_id: "bid-1", kind: "forudsaetning", depends_on: [], covers: [] }, { bid_id: "bid-2", kind: "effekt", depends_on: ["bid-1"], covers: ["K-1/ac-1", "K-1/ac-3", "K-2/ac-6", "K-7/S"] }],
  cases: [
    { case_id: "c-ut", obligation_id: "K-1/ac-1", negative_id: "K-1/ac-1/neg-1", proof_form: "UT", fase: "wrapper", bid_id: "bid-2", hard_effect: "db-row", entrypoint: EP, actor: A, setup: { sql: "S" }, positive: { sql: "P" }, negative: { sql: "N" }, state: { sql: "ST" } },
    { case_id: "c-mh", obligation_id: "K-1/ac-1", proof_form: "MH", bid_id: "bid-2", hard_effect: "db-row", entrypoint: EP, actor: A, action: { sql: "ACT" }, witnesses: [{ id: "audit-row", observe: { sql: "W" }, expect: { kind: "count", value: 1 } }] },
    { case_id: "c-fs", obligation_id: "K-1/ac-3", proof_form: "FS", bid_id: "bid-2", hard_effect: "state", entrypoint: EP, actor: A, observe: { sql: "O" }, expect: { kind: "scalar", value: 100 }, checkpoints: [{ id: "hist", observe: { sql: "OH" }, expect: { kind: "scalar", value: 80 } }] },
    { case_id: "c-sa", obligation_id: "K-2/ac-6", proof_form: "SA", fase: "apply", bid_id: "bid-2", hard_effect: "db-row", entrypoint: EP, actor: A, race: { race_id: "r1", a: { sql: "a" }, b: { sql: "b" }, barrier: "row-lock", invariant: { observe: { sql: "I" }, expect: { kind: "scalar", value: 1 } }, reject_negative_id: "K-2/ac-6/neg-1" } },
    { case_id: "c-ut2", obligation_id: "K-2/ac-6", negative_id: "K-2/ac-6/neg-1", proof_form: "UT", fase: "apply", bid_id: "bid-2", hard_effect: "db-row", entrypoint: EP, actor: A, positive: { sql: "P2" }, negative: { sql: "N2" }, state: { sql: "ST2" } },
    { case_id: "c-ci", obligation_id: "K-7/S", negative_id: "K-7/S/neg-1", proof_form: "UT", fase: "ci", bid_id: "bid-2", hard_effect: "state", entrypoint: { kind: "ui-flow", ref: "ci" }, actor: { role: "ci" }, check: { cmd: ["node", "k.mjs"] } },
  ],
  mutants: [
    { mutant_id: "m-navn", guard_ref: "g.navn", target_case_id: "c-ut", target_assertion_id: "negativ-afvist-bundet", controls: ["c-fs"], apply: "A1", restore: "R1", footprint: { observe: { sql: "FP1" } } },
    { mutant_id: "m-min", guard_ref: "g.min", target_case_id: "c-ut2", target_assertion_id: "negativ-afvist-bundet", controls: ["c-fs"], apply: "A2", restore: "R2", footprint: { observe: { sql: "FP2" } } },
    { mutant_id: "m-klass", guard_ref: "g.klass", target_case_id: "c-ci", target_assertion_id: "exit-klasse", controls: ["c-fs"], apply: "A3", restore: "R3", footprint: { observe: { sql: "FP3" } } },
  ],
});
const red = (n, mut, re, mm) => { const s = spec(); const m = manifest(); mut(s, m); const v = validateAngrebsSpec(s, m); !v.ok && v.reasons.some((r) => re.test(r)) ? ok(n) : bad(n, `ok=${v.ok} ${JSON.stringify(v.reasons).slice(0, 220)}`); };

console.log("angrebs-spec — gyldig spec mod manifest:");
{ const v = validateAngrebsSpec(spec(), manifest()); v.ok ? ok("gyldig spec → ok") : bad("gyldig spec", JSON.stringify(v.reasons)); }
console.log("\nangrebs-spec — plantede indsnævringer → rød:");
red("udeladt case (MH) → udeladelse", (s) => (s.cases = s.cases.filter((c) => c.case_id !== "c-mh")), /ingen MH-case|audit-row/);
red("udeladt negativ (UT for K-2/ac-6) → rød", (s) => { s.cases = s.cases.filter((c) => c.case_id !== "c-ut2"); s.mutants = s.mutants.filter((m) => m.mutant_id !== "m-min"); }, /negativ 'K-2\/ac-6\/neg-1'/);
red("navngivet checkpoint 'hist' mangler → rød (F-13)", (s) => (s.cases[2].checkpoints = []), /delbevis 'hist'/);
red("navngivet vidne omdøbt → rød", (s) => (s.cases[1].witnesses[0].id = "andet"), /delbevis 'audit-row'/);
red("SA race_id ≠ manifestets → rød", (s) => (s.cases[3].race.race_id = "r9"), /delbevis 'r1'/);
red("case på rogue forpligtelse → rød", (s) => s.cases.push({ ...s.cases[2], case_id: "c-x", obligation_id: "K-9/ac-1" }), /ikke forventet/);
red("case i bid der ikke dækker forpligtelsen → rød", (s) => { s.bids.push({ bid_id: "bid-3", kind: "effekt", depends_on: [], covers: ["K-1/ac-3"] }); s.bids[1].covers = s.bids[1].covers.filter((o) => o !== "K-1/ac-3"); }, /er ikke det effekt-bid der dækker|uden case/);
red("blandet kanal: sqlstate-UT m. check → rød (F-11)", (s) => (s.cases[0].check = { cmd: ["x"] }), /blandet variant/);
red("blandet kanal: exit-UT m. negative → rød (F-11)", (s) => (s.cases[5].negative = { sql: "N" }), /blandet variant/);
red("fase ≠ kontraktens → rød (F-14)", (s) => (s.cases[0].fase = "apply"), /fase 'apply' ≠ kontraktens/);
red("actor.role ≠ kontraktens aktør → rød (F-14)", (s) => (s.cases[0].actor = { role: "postgres" }), /≠ kontraktens aktør/);
red("SA actor.role ≠ kontraktens aktør → rød", (s) => (s.cases[3].actor = { role: "postgres" }), /SA actor.role/);
red("SA fase ≠ kontraktens (wrapper ≠ apply) → rød (F-24)", (s) => (s.cases[3].fase = "wrapper"), /SA fase 'wrapper' ≠ kontraktens 'apply'/);
red("SA uden fase → rød (F-24)", (s) => delete s.cases[3].fase, /SA fase 'undefined' ≠/);
red("exit-UT fase ≠ kontraktens (wrapper ≠ ci) → rød (F-24)", (s) => (s.cases[5].fase = "wrapper"), /≠ kontraktens 'ci' \(exit-kanal, F-24\)/);
red("exit-UT actor.role ≠ kontraktens aktør (postgres ≠ ci) → rød (F-24)", (s) => (s.cases[5].actor = { role: "postgres" }), /≠ kontraktens aktør 'ci' \(exit-kanal, F-24\)/);
red("mutant_id kolliderer med et case_id → rød (F-26)", (s) => (s.mutants[0].mutant_id = "c-ut"), /kolliderer med et case_id/);
red("expect uden value (scalar) → rød", (s) => (s.cases[2].expect = { kind: "scalar" }), /gyldig expect/);
red("negative_id på FS-case → rød", (s) => (s.cases[2].negative_id = "K-1/ac-1/neg-1"), /negative_id kun på UT/);
red("mutant uden footprint → rød (F-13/F-16)", (s) => delete s.mutants[0].footprint, /footprint/);
red("mutant uden controls → rød", (s) => (s.mutants[0].controls = []), /controls skal være/);
red("mutant m. control == target → rød", (s) => (s.mutants[0].controls = ["c-ut"]), /controls skal være/);
red("mutant uden target_assertion_id → rød", (s) => delete s.mutants[0].target_assertion_id, /target_assertion_id/);
red("mutant m. udeklareret guard → rød", (s) => (s.mutants[0].guard_ref = "g.x"), /ikke deklareret/);
red("eneste-værn uden mutant → D10 rød", (s) => (s.mutants = s.mutants.filter((m) => m.mutant_id !== "m-navn")), /D10: negativ 'K-1\/ac-1\/neg-1'/);
red("eneste-værn-mutant på FS-case → D10 rød (F-9)", (s) => (s.mutants[0].target_case_id = "c-fs"), /D10/);
red("K-7 uden mutant → gulv", (s) => (s.mutants = s.mutants.filter((m) => m.mutant_id !== "m-klass")), /K 'K-7' har ingen mutant/);
red("forudsætning uden effekt-bid der afhænger → rød", (s) => (s.bids[1].depends_on = []), /intet effekt-bid afhænger/);
red("cyklisk bid-graf → rød", (s) => (s.bids[0].depends_on = ["bid-2"]), /cyklisk/);
red("covers udelader K-7/S → rød", (s) => (s.bids[1].covers = s.bids[1].covers.filter((o) => o !== "K-7/S")), /dækkes af intet effekt-bid/);
red("manifestets effekt_bid ≠ dækkende bid → rød", (s) => { s.bids[1].bid_id = "bid-9"; for (const c of s.cases) c.bid_id = "bid-9"; }, /effekt_bid 'bid-2'/);
red("bindings.plan ≠ manifestets plan → rød", (s) => (s.bindings.plan.oid = OID("e")), /bindings\.plan ≠/);
red("pakke ≠ manifestets → rød", (s) => (s.pakke = "q"), /pakke/);
red("ugyldigt manifest → rød", (s, m) => (m.obligations = []), /manifestet er ugyldigt/);
{ // forudsætning slettet: den grønne spec uden bid-1 er stadig internt gyldig — det er VERIFIERENS sammenligning proof↔spec der fanger sletningen (F-18); her bekræftes blot at grafen er del af spec'en
  const s = spec(); s.bids = s.bids.filter((b) => b.bid_id !== "bid-1"); s.bids[0].depends_on = []; const v = validateAngrebsSpec(s, manifest()); v.ok ? ok("spec uden forudsætning er internt gyldig — F-18 lukkes ved proof↔spec-lighed i verifieren (bid-grafen er en del af den låste spec)") : bad("spec-graf", JSON.stringify(v.reasons)); }
console.log("");
if (fail > 0) { console.error(`angrebs-spec: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`angrebs-spec: ${pass} ok`);
