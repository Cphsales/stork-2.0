#!/usr/bin/env node
// forventnings-manifest.selftest.mjs — red-team af manifest-kontrakten (C1): en gyldig fixture + hver
// plantet falsk-grøn (dublet, alias-kæde, UT uden negativ, fri fejlklasse, overdragelse uden ref …) → rød.
import { validateManifest, expectedSet, REJECT_SQLSTATES, PROOF_FORMS } from "./forventnings-manifest.mjs";

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));
const OID = (c) => c.repeat(40);
const rc = (sqlstate, sted, fase = "wrapper", aktoer = "app_role", grund = "navn_blank") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "lokation_opret(text,text)" });
const fixture = () => ({
  schema_version: 1, pakke: "lokations-skabelon",
  bindings: { forventningsliste: { path: "plan-build/lokations-skabelon/forventningsliste-udkast.md", oid: OID("a") }, krav: { path: "docs/sandhed/krav/lokations-skabelon-krav.md", oid: OID("b") }, plan: { path: "plan-build/lokations-skabelon/plan.md", oid: OID("c") } },
  guards: [{ id: "g.navn-blank", beskrivelse: "check i lokation_opret: navn må ikke være blank" }, { id: "g.min-en-stand", beskrivelse: "trigger: mindst én aktiv stand" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", effekt_bid: "2.2", kildeankre: ["K:22", "P:27", "T:N1"],
      negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blankt navn → 22023", reject_contract: rc("22023", "lokation_opret: navn_blank"), sole_guard_ref: "g.navn-blank" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", effekt_bid: "2.3", kildeankre: ["K:24"], assertions: [{ id: "hist-p1", form: "FS" }, { id: "hist-arvet", form: "FS" }], negatives: [] },
    { id: "K-2/ac-6", k_id: "K-2", kind: "ac", proof_forms: ["UT", "FS", "SA"], scope: "nu", effekt_bid: "3.1", kildeankre: ["K:41", "T:§4.3"], assertions: [{ id: "race-sidste-to", form: "SA" }],
      negatives: [{ id: "K-2/ac-6/neg-1", beskrivelse: "sidste aktive stand deaktiveres → P0001", reject_contract: rc("P0001", "trg_min_en_stand", "apply"), sole_guard_ref: "g.min-en-stand" }] },
    { id: "K-2/ac-4", k_id: "K-2", kind: "ac", proof_forms: ["FS", "SA"], scope: "nu", overdraget_former: ["SA"], overdragelse_ref: "trin 24 (dobbeltbooking)", kildeankre: ["K:39"], negatives: [] },
    { id: "K-2/ac-9", k_id: "K-2", kind: "ac", proof_forms: ["FS"], scope: "overdragelse", overdragelse_ref: "trin 24", kildeankre: ["K:44"], negatives: [] },
    { id: "K-3/ac-6", k_id: "K-3", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", kildeankre: ["K:66"],
      negatives: [{ id: "K-3/ac-6/neg-1", beskrivelse: "dobbelt fravalg → 22023", reject_contract: rc("22023", "klient_fravaelg: dublet") }] },
    { id: "K-6/ac-5", k_id: "K-6", kind: "ac", proof_forms: ["FS", "MH"], scope: "nu", kildeankre: ["K:125"], aliases: [{ id: "K-3/ac-6", former: ["UT"] }],
      negatives: [{ id: "K-6/ac-5/neg-1", beskrivelse: "som K-3/ac-6/neg-1 via kobling", reject_contract: rc("22023", "klient_fravaelg: dublet") }] },
    { id: "K-7/S", k_id: "K-7", kind: "struktur", proof_forms: ["UT"], scope: "nu", kildeankre: ["K:134", "T:150"],
      negatives: [{ id: "K-7/S/neg-1", beskrivelse: "fjernet fysisk kolonne uden klassifikation → CI-klasse", reject_contract: { kanal: "exit", exit_code: 1, klasse: "klassifikation-mangler", afvisningssted: "ci: klassifikations-tjek", fase: "ci", aktoer: "ci-runner" } }] },
    { id: "K-9/ac-1", k_id: "K-9", kind: "ac", proof_forms: ["MH", "UT"], scope: "nu", kildeankre: ["K:166"],
      negatives: [{ id: "K-9/ac-1/neg-1", beskrivelse: "uden grant → 42501", reject_contract: rc("42501", "grant execute", "kald", "uautoriseret") }] },
  ],
});
const red = (n, mut, re) => { const m = fixture(); mut(m); const v = validateManifest(m); v.ok === false && (re ? v.reasons.some((r) => re.test(r)) : true) ? ok(n) : bad(n, `ok=${v.ok} reasons=${JSON.stringify(v.reasons).slice(0, 200)}`); };

console.log("forventnings-manifest — gyldig fixture:");
{
  const v = validateManifest(fixture()); eq("gyldigt manifest → ok", v.ok && v.reasons.length === 0, true);
  const e = expectedSet(fixture());
  eq("forventet mængde: 8 forpligtelser i nu-scope (hel overdragelse ekskluderet men listet)", e.obligations.size === 8 && e.overdraget.has("K-2/ac-9"), true);
  eq("deloverdragelse: K-2/ac-4 forventes kun i FS (SA overdraget til trin 24)", [...e.obligations.get("K-2/ac-4").forms].join(",") === "FS" && e.overdragetFormer.get("K-2/ac-4").join(",") === "SA", true);
  eq("alias-ekspansion: K-6/ac-5 forventes i FS,MH + UT (fra alias) og bærer selv sit negativ", [...e.obligations.get("K-6/ac-5").forms].sort().join(",") === "FS,MH,UT" && e.obligations.get("K-6/ac-5").negatives.length === 1, true);
  eq("navngivne assertions pr. forpligtelse hentes fra manifestet", e.obligations.get("K-1/ac-3").assertions.map((a) => a.id).join(",") === "hist-p1,hist-arvet" && e.obligations.get("K-2/ac-6").assertions[0].id === "race-sidste-to", true);
  eq("effekt_bid eksponeres", e.obligations.get("K-1/ac-1").effekt_bid, "2.2");
  eq("reject_contract bærer grund (præcist fejl-token)", e.negatives.get("K-1/ac-1/neg-1").reject_contract.grund, "navn_blank");
  eq("K-sæt afledt af manifestet: K-1 K-2 K-3 K-6 K-7 K-9", [...e.ks].sort().join(","), "K-1,K-2,K-3,K-6,K-7,K-9");
  eq("negativer: 6, med reject_contract og eneste-værn hvor sat", e.negatives.size === 6 && e.negatives.get("K-1/ac-1/neg-1").sole_guard_ref === "g.navn-blank" && e.negatives.get("K-3/ac-6/neg-1").sole_guard_ref === null, true);
  eq("eneste-værn → negativer", JSON.stringify([...e.soleGuards.entries()].sort()), JSON.stringify([["g.min-en-stand", ["K-2/ac-6/neg-1"]], ["g.navn-blank", ["K-1/ac-1/neg-1"]]]));
  eq("former pr. forpligtelse hentes fra manifestet (K-2/ac-6 = UT,FS,SA)", [...e.obligations.get("K-2/ac-6").forms].join(","), "UT,FS,SA");
  eq("alias skrevet ud: K-6/ac-5 → K-3/ac-6", e.obligations.get("K-6/ac-5").aliases.join(","), "K-3/ac-6");
  eq("konstanter frosne", Object.isFrozen(REJECT_SQLSTATES) && Object.isFrozen(PROOF_FORMS) && REJECT_SQLSTATES.length === 4, true);
}
console.log("\nforventnings-manifest — plantede falsk-grønne → rød:");
red("schema_version ≠ 1", (m) => (m.schema_version = 2), /schema_version/);
red("pakke ugyldig", (m) => (m.pakke = "Lokations Skabelon"), /pakke/);
red("binding mangler (krav)", (m) => delete m.bindings.krav, /bindings\.krav/);
red("binding m. kort oid", (m) => (m.bindings.plan.oid = "abc"), /bindings\.plan/);
red("obligations tomt", (m) => (m.obligations = []), /ikke-tomt/);
red("dublet forpligtelses-id", (m) => m.obligations.push({ ...m.obligations[1] }), /dublet forpligtelses-id/);
red("id-grammatik (K-1/ac-01)", (m) => (m.obligations[1].id = "K-1/ac-01"), /K-n\/ac-m/);
red("id-grammatik (sammensat K-9 »1+2«)", (m) => (m.obligations[7].id = "K-9/ac-1+2"), /K-n\/ac-m/);
red("kind ≠ id-form (struktur m. ac-id)", (m) => (m.obligations[1].kind = "struktur"), /matcher ikke id-formen/);
red("k_id ≠ præfiks", (m) => (m.obligations[1].k_id = "K-2"), /ikke id'ets præfiks/);
red("proof_forms tom", (m) => (m.obligations[1].proof_forms = []), /proof_forms/);
red("proof_forms ukendt form", (m) => (m.obligations[1].proof_forms = ["FS", "XX"]), /proof_forms/);
red("proof_forms dublet", (m) => (m.obligations[1].proof_forms = ["FS", "FS"]), /dublet bevisform/);
red("UT uden negativ (afvisnings-ac kan ikke bevises)", (m) => (m.obligations[0].negatives = []), /UT kræver ≥1 negativ/);
red("negativ uden UT blandt formerne", (m) => (m.obligations[1].negatives = [{ id: "K-1/ac-3/neg-1", beskrivelse: "x", reject_contract: rc("22023", "y") }]), /negativer kræver UT/);
red("negativ-id under forkert forpligtelse", (m) => (m.obligations[0].negatives[0].id = "K-1/ac-2/neg-1"), /hører ikke under/);
red("dublet negativ-id", (m) => m.obligations[0].negatives.push({ ...m.obligations[0].negatives[0] }), /dublet negativ-id/);
red("sqlstate uden for klasserne (fri fejlliste)", (m) => (m.obligations[0].negatives[0].reject_contract = rc("23505", "unik")), /ikke en anerkendt klasse/);
red("sqlstate som tal", (m) => (m.obligations[0].negatives[0].reject_contract.sqlstate = 22023), /ikke en anerkendt klasse/);
red("reject_contract uden afvisningssted", (m) => delete m.obligations[0].negatives[0].reject_contract.afvisningssted, /afvisningssted mangler/);
red("reject_contract uden offentlig_signatur", (m) => delete m.obligations[0].negatives[0].reject_contract.offentlig_signatur, /offentlig_signatur mangler/);
red("kanal ukendt (svar)", (m) => (m.obligations[0].negatives[0].reject_contract.kanal = "svar"), /kanal skal være/);
red("exit-kontrakt uden exit_code", (m) => delete m.obligations[7].negatives[0].reject_contract.exit_code, /exit_code/);
red("exit-kontrakt exit_code 0", (m) => (m.obligations[7].negatives[0].reject_contract.exit_code = 0), /exit_code/);
red("exit-kontrakt uden klasse", (m) => delete m.obligations[7].negatives[0].reject_contract.klasse, /navngiven klasse/);
red("sole_guard_ref ukendt", (m) => (m.obligations[0].negatives[0].sole_guard_ref = "g.findes-ikke"), /ukendt guard/);
red("dublet guard-id", (m) => m.guards.push({ ...m.guards[0] }), /dublet guard-id/);
red("overdragelse uden overdragelse_ref", (m) => delete m.obligations[3].overdragelse_ref, /overdragelse kræver/);
red("scope ukendt", (m) => (m.obligations[3].scope = "senere"), /scope skal være/);
red("kildeankre tom", (m) => (m.obligations[1].kildeankre = []), /kildeankre/);
red("alias til ukendt", (m) => (m.obligations[6].aliases = [{ id: "K-3/ac-9", former: ["UT"] }]), /findes ikke/);
red("alias til sig selv", (m) => (m.obligations[6].aliases = [{ id: "K-6/ac-5", former: ["UT"] }]), /til sig selv/);
red("alias-kæde (mål er selv alias)", (m) => (m.obligations[5].aliases = [{ id: "K-1/ac-1", former: ["MH"] }]), /selv et alias/);
red("alias fra nu-scope til overdraget", (m) => (m.obligations[6].aliases = [{ id: "K-2/ac-9", former: ["FS"] }]), /overdraget men/);
red("alias uden former (implicit ekspansion) → rød", (m) => (m.obligations[6].aliases = ["K-3/ac-6"]), /aliases skal være/);
red("alias m. former uden for målets former", (m) => (m.obligations[6].aliases = [{ id: "K-3/ac-6", former: ["SA"] }]), /uden for målets/);
red("alias m. UT men ejeren uden eget negativ (C1-r1 F-2) → rød", (m) => (m.obligations[6].negatives = []), /kræver at .* selv deklarerer sit negativ/);
red("reject_contract uden grund → rød (F-4)", (m) => delete m.obligations[0].negatives[0].reject_contract.grund, /grund/);
red("overdraget_former ⊄ proof_forms", (m) => (m.obligations[3].overdraget_former = ["MH"]), /overdraget_former ⊄/);
red("overdraget_former = alle former → brug scope overdragelse", (m) => (m.obligations[3].overdraget_former = ["FS", "SA"]), /alle former overdraget/);
red("deloverdragelse uden ref", (m) => delete m.obligations[3].overdragelse_ref, /kræver overdragelse_ref/);
red("assertion m. form uden for proof_forms", (m) => (m.obligations[1].assertions = [{ id: "x", form: "MH" }]), /uden for proof_forms/);
red("assertion m. form UT (UT's delbeviser er negativer)", (m) => (m.obligations[0].assertions = [{ id: "x", form: "UT" }]), /negativerne/);
red("dublet assertion-id", (m) => (m.obligations[1].assertions = [{ id: "a", form: "FS" }, { id: "a", form: "FS" }]), /dublet assertion-id/);
red("sparse obligations-array", (m) => { m.obligations.length = 10; }, /tæt array/);
red("proof_forms som getter (accessor) → rød", (m) => Object.defineProperty(m.obligations[1], "proof_forms", { enumerable: true, get: () => ["FS"] }), /proof_forms/);
red("arvet felt via prototype tæller ikke", (m) => { const o = Object.create({ scope: "nu" }); Object.assign(o, m.obligations[1]); delete o.scope; m.obligations[1] = o; }, /plain object|scope|ikke-tomt/);
{
  // expectedSet kaster på ugyldigt manifest (fail-closed, aldrig delvis mængde)
  const m = fixture(); m.obligations[0].negatives = [];
  let threw = false; try { expectedSet(m); } catch { threw = true; } eq("expectedSet kaster på ugyldigt manifest (ingen delvis forventning)", threw, true);
}
console.log("");
if (fail > 0) { console.error(`forventnings-manifest: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`forventnings-manifest: ${pass} ok`);
