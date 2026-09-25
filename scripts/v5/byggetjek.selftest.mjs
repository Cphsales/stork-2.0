#!/usr/bin/env node
// byggetjek.selftest.mjs — bindingerne og merge-kontrollen.
import { bindinger, mergeKontrol, halvside, sha256, erPakkePr } from "./byggetjek.mjs";

let ok = 0, fail = 0;
const t = (navn, c) => { if (c) { ok++; console.log(`  ✓ ${navn}`); } else { fail++; console.log(`  ✗ ${navn}`); } };
const P = "plan-build/p2";
const HS = "## Mathias' ½ side\n\nTo afvigelser.";
const plan = `# Plan\n\n${HS}\n\n## Resten\nx`;
const oid = (c) => c.repeat(40);
const B = { "docs/sandhed/krav/p2-krav.md": oid("a"), [`${P}/plan.md`]: oid("b"), [`${P}/forventnings-manifest.json`]: oid("c"), [`${P}/angrebs-spec.json`]: oid("d"), [`${P}/prover.json`]: oid("e") };
const dom = { dom: "grøn", krav: oid("a"), plan: oid("b"), filer: { [`${P}/forventnings-manifest.json`]: oid("c"), [`${P}/angrebs-spec.json`]: oid("d"), [`${P}/prover.json`]: oid("e") } };
const ledger = (ekstra = "") => [
  `| M-90 | d | »krav ok« | kravet → blob ${oid("a").slice(0, 12)} |`,
  `| M-91 | d | »plan ok« | plan.md → blob ${oid("b").slice(0, 12)} · ½-side → sha256 ${sha256(halvside(plan)).slice(0, 12)} |`,
  ekstra].join("\n");
const filer = (over = {}) => ({ ...B, [`${P}/daekningsdom.json`]: "x", [`${P}/codex-plan.md`]: "x", ...over });
const mk = (o = {}) => {
  const f = filer(o.filer); const tx = { [`${P}/plan.md`]: o.plan ?? plan, [`${P}/codex-plan.md`]: o.codexPlan ?? `dom: grøn\nplan.md → blob ${oid("b").slice(0, 12)}\n`, [`${P}/daekningsdom.json`]: JSON.stringify(o.dom ?? dom) };
  return bindinger({ pakke: "p2", blob: (p) => f[p], tekst: (p) => tx[p], findes: (p) => p in f, ledger: o.ledger ?? ledger() });
};

t("½-siden udtrækkes til næste afsnit", halvside(plan) === HS);
t("alt bundet → grøn", mk().status === "grøn");
t("uden dækningsdom → ikke nået", bindinger({ pakke: "p2", blob: () => "", tekst: () => "", findes: () => false, ledger: "" }).status === "ikke nået");
t("krav uden krav ok → rød", mk({ ledger: ledger().replace("»krav ok«", "»nej«") }).status === "rød");
t("½-siden ændret efter plan ok → rød", mk({ plan: plan.replace("To afvigelser.", "Tre afvigelser.") }).status === "rød");
t("plan ændret teknisk (½-side uændret) med ny Codex-dom → grøn", mk({ filer: { [`${P}/plan.md`]: oid("f") }, codexPlan: `dom: grøn\nplan.md → blob ${oid("f").slice(0, 12)}\n`, dom: { ...dom, plan: oid("f") } }).status === "grøn");
t("plan ændret uden ny Codex-dom → rød", mk({ filer: { [`${P}/plan.md`]: oid("f") }, dom: { ...dom, plan: oid("f") } }).status === "rød");
t("Codex' plan-dom ikke grøn → rød", mk({ codexPlan: `dom: rød\nplan.md → blob ${oid("b").slice(0, 12)}\n` }).status === "rød");
t("låst test ændret efter dækningsdommen → rød", mk({ filer: { [`${P}/angrebs-spec.json`]: oid("9") } }).status === "rød");
t("dækningsdom gælder andet krav → rød", mk({ dom: { ...dom, krav: oid("7") } }).status === "rød");
t("dækningsdom binder ikke prover.json → rød", mk({ dom: { ...dom, filer: { [`${P}/forventnings-manifest.json`]: oid("c"), [`${P}/angrebs-spec.json`]: oid("d") } } }).status === "rød");
t("dækningsdom ikke grøn → rød", mk({ dom: { ...dom, dom: "rød" } }).status === "rød");

t("migration er pakke-kode", erPakkePr(["supabase/migrations/x.sql"]) && !erPakkePr(["docs/x.md", "scripts/v5/x.mjs"]));
const R = `${P}/slut-rapport.md`;
const sl = (maal) => `| M-99 | d | »slut ok« | ${maal} |`;
const mkK = ({ ledg, aendret, blobs = {}, slet = 0, cg = "commit abcdef1" }) => mergeKontrol({ pakke: "p2", ledger: ledg, blob: (p) => blobs[p] ?? oid("0"), tekst: () => cg, aendretSiden: () => aendret, ledgerSletninger: () => slet });
const god = sl(`slut-rapport.md → blob ${oid("5").slice(0, 12)} · commit abcdef1 · stork-2-0-master-plan.md → blob ${oid("6").slice(0, 12)}`);
t("kun afslutningsfiler efter prøven → ok", mkK({ ledg: god, aendret: [R, "plan-build/lokations-skabelon/mathias-ord.md", `${P}/codex-gennemgang.md`, "docs/strategi/stork-2-0-master-plan.md"], blobs: { [R]: oid("5"), "docs/strategi/stork-2-0-master-plan.md": oid("6") } }).length === 0);
t("uden slut ok → afvist", mkK({ ledg: "", aendret: [] }).length === 1);
t("kode ændret efter prøven → afvist", mkK({ ledg: god, aendret: [R, "supabase/migrations/y.sql"], blobs: { [R]: oid("5") } }).length === 1);
t("package.json ændret efter prøven → afvist", mkK({ ledg: god, aendret: ["package.json"], blobs: { [R]: oid("5") } }).length === 1);
t("slut-rapporten ændret efter slut ok → afvist", mkK({ ledg: god, aendret: [R], blobs: { [R]: oid("4") } }).length === 1);
t("dokumentrettelse med anden blob → afvist", mkK({ ledg: god, aendret: ["docs/strategi/stork-2-0-master-plan.md"], blobs: { [R]: oid("5"), "docs/strategi/stork-2-0-master-plan.md": oid("8") } }).length === 1);
t("ledgerens rækker ændret → afvist", mkK({ ledg: god, aendret: [], blobs: { [R]: oid("5") }, slet: 2 }).length === 1);
t("Codex' gennemgang uden det prøvede commit → afvist", mkK({ ledg: god, aendret: [`${P}/codex-gennemgang.md`], blobs: { [R]: oid("5") }, cg: "commit 1234567" }).length === 1);

console.log(`\nbyggetjek: ${ok} ok${fail ? `, ${fail} FEJL` : ""}`);
process.exit(fail ? 1 : 0);
