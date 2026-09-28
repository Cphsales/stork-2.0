#!/usr/bin/env node
// byggetjek.selftest.mjs — bindingerne og merge-kontrollen.
import { bindinger, mergeKontrol, halvside, erPakkePr, packageJsonErProdukt, rettelserFra, mutantAarsag } from "./byggetjek.mjs";

let ok = 0, fail = 0;
const t = (navn, c) => { if (c) { ok++; console.log(`  ✓ ${navn}`); } else { fail++; console.log(`  ✗ ${navn}`); } };
const P = "plan-build/p2";
const HS = "## Mathias' ½ side\n\nTo afvigelser.";
const plan = `# Plan\n\n${HS}\n\n## Resten\nx`;
const oid = (c) => c.repeat(40);
const K = "docs/sandhed/krav/p2-krav.md";
const B = { [K]: oid("a"), [`${P}/plan.md`]: oid("b"), [`${P}/forventnings-manifest.json`]: oid("c"), [`${P}/angrebs-spec.json`]: oid("d"), [`${P}/prover.json`]: oid("e"), [`${P}/slutproeve.json`]: oid("1"), "scripts/v5/p2/prover-run.mjs": oid("2"), "scripts/v5/p2/tests/a.test.mjs": oid("3") };
const laast = Object.fromEntries(Object.entries(B).filter(([k]) => k !== K && k !== `${P}/plan.md`));
const dom = { dom: "grøn", krav: oid("a"), plan: oid("b"), filer: laast };
const ledger = (ekstra = "") => [
  `| M-90 | d | »krav ok« | p2-krav.md → blob ${oid("a").slice(0, 12)} |`,
  `| M-91 | d | »plan ok« | plan-build/p2/plan.md → blob ${oid("b").slice(0, 12)} |`,
  ekstra].join("\n");
const mk = (o = {}) => {
  const f = { ...B, [`${P}/daekningsdom.json`]: "x", [`${P}/codex-plan.md`]: "x", ...o.filer };
  const tx = { [`${P}/plan.md`]: o.plan ?? plan, [`${P}/codex-plan.md`]: o.codexPlan ?? `dom: grøn\nplan.md → blob ${oid("b").slice(0, 12)}\n`, [`${P}/daekningsdom.json`]: o.domTekst ?? JSON.stringify(o.dom ?? dom) };
  const repo = { [oid("b")]: plan, ...o.repo };
  return bindinger({ pakke: "p2", blob: (p) => f[p], tekst: (p) => tx[p], findes: (p) => p in f, ledger: o.ledger ?? ledger(),
    blobTekst: (x) => Object.entries(repo).find(([k]) => k.startsWith(x))?.[1] ?? null,
    liste: (m) => Object.keys(f).filter((k) => k.startsWith(m)), aendret: o.aendret ?? [] });
};

t("½-siden udtrækkes til næste afsnit", halvside(plan) === HS);
t("alt bundet → grøn", mk().status === "grøn");
t("uden dækningsdom → ikke nået", bindinger({ pakke: "p2", blob: () => "", tekst: () => "", findes: () => false, ledger: "", blobTekst: () => null, liste: () => [] }).status === "ikke nået");
t("krav uden krav ok → rød", mk({ ledger: ledger().replace("»krav ok«", "»nej«") }).status === "rød");
t("krav ok med forbehold (»krav ok, men …«) → rød", mk({ ledger: ledger().replace("»krav ok«", "»krav ok, men ikke K-3«") }).status === "rød");
t("krav ok der binder kravets blob til en anden fil → rød", mk({ ledger: ledger().replace("p2-krav.md → blob", "vision-og-principper.md → blob") }).status === "rød");
t("½-siden ændret efter plan ok → rød", mk({ plan: plan.replace("To afvigelser.", "Tre afvigelser.") }).status === "rød");
t("plan ok binder en blob der ikke findes i repoet → rød", mk({ repo: { [oid("b")]: null } }).status === "rød");
const plan2 = plan.replace("x", "y"); // teknisk rettelse: ½-siden uændret
t("plan ændret teknisk (½-side uændret) med ny Codex-dom → grøn", mk({ filer: { [`${P}/plan.md`]: oid("f") }, plan: plan2, codexPlan: `dom: grøn\nplan.md → blob ${oid("f").slice(0, 12)}\n`, dom: { ...dom, plan: oid("f") } }).status === "grøn");
t("plan ændret uden ny Codex-dom → rød", mk({ filer: { [`${P}/plan.md`]: oid("f") }, plan: plan2, dom: { ...dom, plan: oid("f") } }).status === "rød");
const HS3 = plan.replace("To afvigelser.", "Tre afvigelser.");
t("nyeste plan ok gælder: ½-siden tilbage til den ældre godkendte → rød", mk({ ledger: ledger(`| M-95 | d | »plan ok« | plan-build/p2/plan.md → blob ${oid("9").slice(0, 12)} |`), repo: { [oid("9")]: HS3 } }).status === "rød");
t("en anden pakkes plan ok (samme ½-side) godkender ikke → rød", mk({ ledger: ledger().replace("plan-build/p2/plan.md", "plan-build/p1/plan.md") }).status === "rød" && mk({ ledger: ledger().replace("plan-build/p2/plan.md", "plan.md") }).status === "rød");
t("ændret målelag i en lukket pakke uden binding → rød; med binding → grøn", mk({ filer: { "scripts/v5/p1/tests/a.test.mjs": oid("5") }, aendret: ["scripts/v5/p1/tests/a.test.mjs"] }).status === "rød" && mk({ filer: { "scripts/v5/p1/tests/a.test.mjs": oid("5") }, aendret: ["scripts/v5/p1/tests/a.test.mjs"], dom: { ...dom, filer: { ...laast, "scripts/v5/p1/tests/a.test.mjs": oid("5") } } }).status === "grøn");
t("slettet DB-test uden binding → rød; bundet som slettet (null) → grøn", mk({ aendret: ["supabase/tests/smoke/t10_x.sql"] }).status === "rød" && mk({ aendret: ["supabase/tests/smoke/t10_x.sql"], dom: { ...dom, filer: { ...laast, "supabase/tests/smoke/t10_x.sql": null } } }).status === "grøn");
t("dom godkender sletning, men filen findes → rød", mk({ filer: { "supabase/tests/smoke/t10_x.sql": oid("4") }, aendret: ["supabase/tests/smoke/t10_x.sql"], dom: { ...dom, filer: { ...laast, "supabase/tests/smoke/t10_x.sql": null } } }).status === "rød");
t("Codex' plan-dom ikke grøn → rød", mk({ codexPlan: `dom: rød\nplan.md → blob ${oid("b").slice(0, 12)}\n` }).status === "rød");
t("låst test ændret efter dækningsdommen → rød", mk({ filer: { [`${P}/angrebs-spec.json`]: oid("9") } }).status === "rød");
t("dækningsdom gælder andet krav → rød", mk({ dom: { ...dom, krav: oid("7") } }).status === "rød");
const uden = (sti) => ({ ...dom, filer: Object.fromEntries(Object.entries(laast).filter(([k]) => k !== sti)) });
t("dækningsdom binder ikke prover.json → rød", mk({ dom: uden(`${P}/prover.json`) }).status === "rød");
t("dækningsdom binder ikke slutproeve.json → rød", mk({ dom: uden(`${P}/slutproeve.json`) }).status === "rød");
t("dækningsdom binder ikke prover-run.mjs → rød", mk({ dom: uden("scripts/v5/p2/prover-run.mjs") }).status === "rød");
t("dækningsdom ikke grøn → rød", mk({ dom: { ...dom, dom: "rød" } }).status === "rød");
t("dækningsdom = null → rød", mk({ domTekst: "null" }).status === "rød");
t("dækningsdom = [] → rød", mk({ domTekst: "[]" }).status === "rød");
t("ændret DB-test i PR'en uden binding → rød", mk({ filer: { "supabase/tests/smoke/t10b_x.sql": oid("4") }, aendret: ["supabase/tests/smoke/t10b_x.sql"] }).status === "rød");
t("ændret DB-test i PR'en med binding → grøn", mk({ filer: { "supabase/tests/smoke/t10b_x.sql": oid("4") }, aendret: ["supabase/tests/smoke/t10b_x.sql"], dom: { ...dom, filer: { ...laast, "supabase/tests/smoke/t10b_x.sql": oid("4") } } }).status === "grøn");

t("migration og låsefil er pakke-kode; docs og scripts er ikke", erPakkePr(["supabase/migrations/x.sql"]) && erPakkePr(["pnpm-lock.yaml"]) && !erPakkePr(["docs/x.md", "scripts/v5/x.mjs"]));
const pj = (o) => JSON.stringify({ name: "stork", scripts: { build: "turbo run build", "supabase:link": "supabase link", "v5:selftest": "node a.mjs", ...o.scripts }, devDependencies: { x: "1", ...o.dev } });
const DEPLOY = "run: pnpm supabase:link\n run: pnpm types:generate";
t("package.json: kun workflowets scripts ændret → ikke pakke-kode", !packageJsonErProdukt(pj({}), pj({ scripts: { "v5:selftest": "node b.mjs", "kaede:x": undefined } }), DEPLOY) && !erPakkePr(["package.json"], { packageJsonProdukt: false }));
t("package.json: build-, deploy- eller livscyklus-script ændret → pakke-kode", packageJsonErProdukt(pj({}), pj({ scripts: { build: "evil" } }), DEPLOY) && packageJsonErProdukt(pj({}), pj({ scripts: { "supabase:link": "supabase link --project-ref andet" } }), DEPLOY) && packageJsonErProdukt(pj({}), pj({ scripts: { postinstall: "curl x" } }), DEPLOY));
t("package.json: afhængighed ændret → pakke-kode", packageJsonErProdukt(pj({}), pj({ dev: { x: "2" } }), DEPLOY));
const R = `${P}/slut-rapport.md`, G = `${P}/codex-gennemgang.md`, MP = "docs/strategi/stork-2-0-master-plan.md";
// slut-rapporten efter skabelonen i disciplin.md §10.3
const rapport = `# p2 — Slut-rapport\n\n**Dato:** 2026-09-28 · **Prøvet kodeversion:** commit abcdef1 (den version slutprøven, Codex' samlede gennemgang og byggetjekket kørte på) · **Krav:** @ blob · **Plan:** v1 @ blob\n\n## Rettelser i Mathias' dokumenter\n\n| Dokument + afsnit | Nuværende tekst | Ny tekst | Forventet blob efter rettelsen |\n| --- | --- | --- | --- |\n| \`docs/strategi/stork-2-0-master-plan.md\` §4.1 | gammel | ny | ${oid("6").slice(0, 12)} |\n\n## Fremlæggelse for Mathias\n\nx\n`;
const sl = (ord = "»slut ok«", maal = `plan-build/p2/slut-rapport.md → blob ${oid("5").slice(0, 12)} · commit abcdef1 · stork-2-0-master-plan.md → blob ${oid("6").slice(0, 12)}`) => `| M-99 | d | ${ord} | ${maal} |`;
t("skabelonens rettelsestabel læses", JSON.stringify(rettelserFra(rapport)) === JSON.stringify([{ fil: "docs/strategi/stork-2-0-master-plan.md", blob: oid("6").slice(0, 12) }]));
const mkK = ({ ledg = sl(), aendret = [R, G, "docs/sandhed/mathias-ord.md", MP], blobs = {}, cg = "commit abcdef1", rap = rapport, ld } = {}) => {
  const b = { [R]: oid("5"), [MP]: oid("6"), [G]: oid("7"), ...blobs }; const tx = { [R]: rap, [G]: cg };
  return mergeKontrol({ pakke: "p2", ledger: ledg, blob: (p) => b[p] ?? oid("0"), tekst: (p) => tx[p], findes: (p) => p in tx || p in b,
    aendretSiden: () => aendret, ledgerDiff: () => ld ?? { slettet: 0, tilfoejet: [ledg.split("\n").pop()] } });
};
t("kun afslutningsfiler efter prøven → ok", mkK().length === 0);
t("uden slut ok → afvist", mkK({ ledg: "" }).length === 1);
t("slut ok med forbehold → afvist", mkK({ ledg: sl("»slut ok men vent med deploy«") }).length === 1);
t("kode ændret efter prøven → afvist", mkK({ aendret: [R, "supabase/migrations/y.sql"] }).length === 1);
t("package.json ændret efter prøven → afvist", mkK({ aendret: ["package.json"] }).length === 1);
t("slut-rapporten ændret efter slut ok → afvist", mkK({ blobs: { [R]: oid("4") } }).length === 1);
t("dokumentrettelse med anden blob → afvist", mkK({ blobs: { [MP]: oid("8") } }).length === 1);
t("dokumentrettelse der ikke står i rapportens rettelser → afvist", mkK({ rap: rapport.replace(/\| `docs\/strategi.*\n/, "") }).length === 1);
t("en migration opført som »rettelse« i rapporten → afvist", mkK({ aendret: [R, "supabase/migrations/20260928000000_x.sql"], blobs: { "supabase/migrations/20260928000000_x.sql": oid("6") }, rap: rapport.replace("`docs/strategi/stork-2-0-master-plan.md` §4.1", "`supabase/migrations/20260928000000_x.sql`") }).length === 1);
t("en anden pakkes slut ok godkender ikke", mkK({ ledg: sl(undefined, `plan-build/p1/slut-rapport.md → blob ${oid("5").slice(0, 12)} · commit abcdef1`) }).length === 1);
t("rapportens prøvede kodeversion ≠ slut ok's commit → afvist", mkK({ rap: rapport.replace("abcdef1", "1234567") }).length === 1);
t("ledgerens rækker ændret → afvist", mkK({ ld: { slettet: 2, tilfoejet: [sl()] } }).length === 1);
t("ekstra ledgerpost efter prøven → afvist", mkK({ ld: { slettet: 0, tilfoejet: ["| M-98 | d | »hm« | — |", sl()] } }).length === 1);
t("Codex' gennemgang uden det prøvede commit → afvist", mkK({ cg: "commit 1234567" }).length === 1);
t("Codex' gennemgang mangler → afvist", mergeKontrol({ pakke: "p2", ledger: sl(), blob: (p) => (p === R ? oid("5") : oid("6")), tekst: () => rapport, findes: (p) => p === R || p === MP, aendretSiden: () => [R, MP], ledgerDiff: () => ({ slettet: 0, tilfoejet: [sl()] }) }).length === 1);

const M = { applied_ok: true, targets: [{ id: "t1", failed: true }], controls: [{ id: "c1", ok: true }], restore_ok: true, restored: [{ id: "t1", ok: true }] };
t("mutantens årsag: target bestod · kontrol fejlede · restore fejlede · efter restore", /target-test bestod.*t1/.test(mutantAarsag({ ...M, targets: [{ id: "t1", failed: false }] })) && /kontroltest fejlede.*c1/.test(mutantAarsag({ ...M, controls: [{ id: "c1", ok: false }] })) && /restore fejlede/.test(mutantAarsag({ ...M, restore_ok: false })) && /efter restore.*t1/.test(mutantAarsag({ ...M, restored: [{ id: "t1", ok: false }] })));
console.log(`\nbyggetjek: ${ok} ok${fail ? `, ${fail} FEJL` : ""}`);
process.exit(fail ? 1 : 0);
