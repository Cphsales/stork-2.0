#!/usr/bin/env node
// byggetjek.mjs — byggetjekket og slutdommen (disciplin.md §2 trin 3-4, §6). Formaterne: scripts/README.md »Formater«.
//
// For den åbne pakke (launch/launch.json):
//   (d) bindinger: kravet er den blob, seneste `krav ok` bandt · ½-siden er den i planen, seneste `plan ok` bandt · planen er den
//       Codex' plan-dom (codex-plan.md) bandt · hele kørselsfladen er den dækningsdommen bandt, blob for blob
//   (c) intet låst ændret — følger af (d)
//   (a) testene grønne · (b) de udpegede mutanter dræbt — for den åbne pakke og alle lukkede pakker
//   slutdom: slutprøven (slutproeve.json) grøn
// Uden dækningsdom for den åbne pakke er den »ikke nået«: kun de lukkede pakkers regressionstests køres.
//
// Brug:
//   node scripts/v5/byggetjek.mjs --pg env --rapport <fil>        (CI: frisk testdatabase fra PG*-miljøet; aktørforbindelsen fra
//                                                                   V5_AKTOER_DATABASE_URL eller --pg-aktoer <json-argv>)
//   node scripts/v5/byggetjek.mjs --kun-bindinger                   (ingen database; kun (d))
//   node scripts/v5/byggetjek.mjs --pg env --kun-migrationer        (kun testdatabasens opstart og migrationer, fx til db:test)
//   … --base <ref>   en pakke-PR kræver grønt byggetjek + `slut ok` + kun afslutningsfiler efter prøven
// Exit 0 = grøn eller ikke nået (se rapporten) · exit 1 = rød.

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LEDGER, erGodkendelse, filBlobPar, passer, raekker } from "./sandhed-vagt.mjs";

export const FRISK_STORE_BOOTSTRAP = "insert into auth.users (id, email, aud, role) values ('6d034bba-84ec-48ad-a94e-219aa5755b88','bootstrap-1@test.invalid','authenticated','authenticated'), ('735dca62-808c-4389-b038-9242313c4a20','bootstrap-2@test.invalid','authenticated','authenticated') on conflict (id) do nothing;";
// én oprydnings-migration kræver data fra driften og har ingen effekt på en tom database; undtagelsen gælder kun præcis denne blob
export const FRISK_STORE_UNDTAGELSER = Object.freeze([{ path: "supabase/migrations/20260516200000_h024_test_artifact_cleanup.sql", blob: "b076fbc6b7a969aa4cb2e838e31653efc225f2d2" }]);

const OID = /^[0-9a-f]{40}$/;
const isPlain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const MAALELAG_JSON = ["forventnings-manifest.json", "angrebs-spec.json", "prover.json", "slutproeve.json"];

export function halvside(planTekst) {
  const linjer = String(planTekst).split("\n");
  const i = linjer.findIndex((l) => /^## Mathias' ½ side\s*$/.test(l));
  if (i < 0) return null;
  let j = linjer.findIndex((l, k) => k > i && /^## /.test(l));
  if (j < 0) j = linjer.length;
  return linjer.slice(i, j).join("\n").trim();
}
export const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");

// seneste(ledger, ordet, passerFil) → { raekke, par } for den seneste række, hvor hans ord er `ordet` og en fil → blob passer
export function seneste(ledger, ordet, passerFil) {
  const r = raekker(ledger).filter((x) => erGodkendelse(x.ord, ordet));
  for (let i = r.length - 1; i >= 0; i--) {
    const par = filBlobPar(r[i].maal).find((p) => passerFil(p.fil));
    if (par) return { raekke: r[i], par };
  }
  return null;
}
// pakkens egne filer nævnes med fuld sti (plan.md og slut-rapport.md findes i alle pakker); kravet har pakkens navn i filnavnet
const erKravFil = (pakke) => (f) => f === `docs/sandhed/krav/${pakke}-krav.md` || f === `${pakke}-krav.md` || f === `plan-build/${pakke}/krav-udkast.md`;
const erFil = (sti) => (f) => f === sti;

// målelaget: pakkemapperne i scripts/v5/ (ikke rolleteksterne), manifest/testindeks/testvalg/slutprøve og databasens tests
export const erMaalelag = (s) => /^scripts\/v5\/(?!roller\/)[^/]+\/./.test(s) || /^plan-build\/[^/]+\/(forventnings-manifest|angrebs-spec|prover|slutproeve)\.json$/.test(s) || (/^supabase\/tests\//.test(s) && !/\.md$/.test(s));
const egenPakke = (pakke, s) => s.startsWith(`scripts/v5/${pakke}/`) || s.startsWith(`plan-build/${pakke}/`);

// bindinger({pakke, blob, tekst, findes, ledger, blobTekst, liste, aendret?}) → { status: "ikke nået"|"grøn"|"rød", fejl: [] }
//   blobTekst(oid) → indholdet af en blob i repoet eller null · liste(mappe) → de sporede filer under mappen
//   aendret = stierne PR'en ændrer (med --base): hver ændret målelagsfil (også en lukket pakkes og supabase/tests/) skal være bundet
export function bindinger({ pakke, blob, tekst, findes, ledger, blobTekst, liste, aendret = [] }) {
  const P = `plan-build/${pakke}`;
  const fejl = [];
  const krav = `docs/sandhed/krav/${pakke}-krav.md`;
  const plan = `${P}/plan.md`;
  if (!findes(`${P}/daekningsdom.json`)) return { status: "ikke nået", fejl: ["ingen dækningsdom endnu"] };
  // kravet mod seneste krav ok
  if (!findes(krav)) fejl.push(`${krav} findes ikke`);
  else {
    const k = seneste(ledger, "krav ok", erKravFil(pakke));
    if (!k) fejl.push(`ledgeren har intet \`krav ok\`, der binder ${pakke}-krav.md → blob`);
    else if (!blob(krav).startsWith(k.par.blob)) fejl.push(`kravet (blob ${blob(krav).slice(0, 12)}) er ikke den blob, ${k.raekke.nr} bandt (${k.par.blob})`);
  }
  // ½-siden mod seneste plan ok · planen mod Codex' plan-dom
  if (!findes(plan)) fejl.push(`${plan} findes ikke`);
  else {
    const hs = halvside(tekst(plan));
    const g = seneste(ledger, "plan ok", erFil(plan));
    if (!hs) fejl.push("planen har intet afsnit »## Mathias' ½ side«");
    else if (!g) fejl.push(`ledgeren har intet \`plan ok\`, der binder ${plan} → blob`);
    else {
      const godkendt = blobTekst(g.par.blob);
      if (godkendt === null) fejl.push(`planen, ${g.raekke.nr} godkendte (blob ${g.par.blob}), findes ikke i repoet`);
      else if (halvside(godkendt) !== hs) fejl.push(`½-siden er ændret efter \`plan ok\` (${g.raekke.nr}) — ændret ½-side kræver nyt \`plan ok\``);
    }
    const cp = `${P}/codex-plan.md`;
    if (!findes(cp)) fejl.push("Codex' plan-dom (codex-plan.md) mangler");
    else {
      const t = tekst(cp);
      if (!/^dom: grøn\s*$/m.test(t)) fejl.push("Codex' plan-dom har ikke linjen »dom: grøn«");
      if (!filBlobPar(t).some((p) => passer(p.fil, plan) && blob(plan).startsWith(p.blob))) fejl.push(`Codex' plan-dom binder ikke den nuværende plan (plan.md → blob ${blob(plan).slice(0, 12)})`);
    }
  }
  // kørselsfladen mod dækningsdommen
  let d = null;
  try { d = JSON.parse(tekst(`${P}/daekningsdom.json`)); if (!isPlain(d)) { d = null; fejl.push("daekningsdom.json skal være et objekt {dom, krav, plan, filer}"); } }
  catch { fejl.push("daekningsdom.json er ikke gyldig JSON"); }
  if (d) {
    if (d.dom !== "grøn") fejl.push("dækningsdommen er ikke grøn");
    if (findes(krav) && d.krav !== blob(krav)) fejl.push("dækningsdommen gælder et andet krav (feltet krav = kravets fulde blob)");
    if (findes(plan) && d.plan !== blob(plan)) fejl.push("dækningsdommen gælder en anden plan (feltet plan = planens fulde blob)");
    const filer = isPlain(d.filer) ? d.filer : {};
    if (!isPlain(d.filer)) fejl.push("dækningsdommen har intet objekt filer {sti: blob}");
    // også en slettet målelagsfil uden for pakken skal stå i dommen (som null = dommen godkender sletningen)
    const noedvendige = [...MAALELAG_JSON.map((f) => `${P}/${f}`), ...liste(`scripts/v5/${pakke}/`), ...aendret.filter((s) => erMaalelag(s) && (!egenPakke(pakke, s) || findes(s)))];
    for (const sti of new Set(noedvendige)) if (!(sti in filer)) fejl.push(`dækningsdommen binder ikke ${sti}`);
    for (const [sti, oid] of Object.entries(filer)) {
      if (oid === null) { if (findes(sti)) fejl.push(`dækningsdommen godkender sletning af ${sti}, men filen findes`); }
      else if (typeof oid !== "string" || !OID.test(oid)) fejl.push(`dækningsdommens blob for ${sti} er ikke 40 tegn hex (eller null for en slettet fil)`);
      else if (!findes(sti)) fejl.push(`låst fil mangler: ${sti}`);
      else if (blob(sti) !== oid) fejl.push(`låst fil ændret efter dækningsdommen: ${sti}`);
    }
  }
  return { status: fejl.length ? "rød" : "grøn", fejl };
}

// pakke-kode = det der kommer i drift: migrationer, funktioner, app, pakker og den konfiguration de bygges og køres med.
// Afhængigheder ændres kun sammen med låsefilen (CI installerer med --frozen-lockfile).
const PRODUKT_RE = /^(supabase\/(migrations|functions)\/|supabase\/config\.toml$|apps\/|packages\/|pnpm-lock\.yaml$|pnpm-workspace\.yaml$|turbo\.json$|tsconfig\.base\.json$|\.npmrc$|\.nvmrc$)/;
// Rod-package.json er pakke-kode, når andet end workflowets egne scripts ændres: afhængigheder, livscyklus-scripts
// (fx postinstall), build-scripts og de scripts deployet kalder (migrations-deploy.yml: pnpm <script>).
const LIVSCYKLUS = ["preinstall", "install", "postinstall", "prepare", "prepublish", "prepublishOnly", "prepack", "postpack", "build", "dev", "start"];
export function packageJsonErProdukt(foer, efter, deployTekst = "") {
  let a, b; try { a = JSON.parse(foer); b = JSON.parse(efter); } catch { return true; }
  const stabil = (v) => (v && typeof v === "object" && !Array.isArray(v) ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stabil(v[k])}`).join(",")}}` : JSON.stringify(v));
  const uden = (o) => { const { scripts, ...rest } = o ?? {}; return stabil(rest); };
  if (uden(a) !== uden(b)) return true;
  const deploy = new Set([...String(deployTekst).matchAll(/\bpnpm (?:run )?([a-z0-9:_-]+)/gi)].map((m) => m[1]));
  const drift = (n) => LIVSCYKLUS.includes(n) || deploy.has(n);
  const navne = new Set([...Object.keys(a.scripts ?? {}), ...Object.keys(b.scripts ?? {})]);
  return [...navne].some((n) => drift(n) && (a.scripts ?? {})[n] !== (b.scripts ?? {})[n]);
}
export const erPakkePr = (stier, { packageJsonProdukt = true } = {}) => stier.some((p) => PRODUKT_RE.test(p) || (p === "package.json" && packageJsonProdukt));

// afsnit(tekst, overskrift) → teksten under »## <overskrift>« til næste »## «
const afsnit = (t, o) => { const l = String(t).split("\n"); const i = l.findIndex((x) => x.trim() === `## ${o}`); if (i < 0) return null; let j = l.findIndex((x, k) => k > i && /^## /.test(x)); if (j < 0) j = l.length; return l.slice(i + 1, j).join("\n"); };

// rettelserFra(afsnit) → [{fil, blob}] fra skabelonens tabel (disciplin.md §10.3):
//   | Dokument + afsnit | Nuværende tekst | Ny tekst | Forventet blob efter rettelsen |
export function rettelserFra(t) {
  const ud = [];
  for (const l of String(t).split("\n")) {
    if (!/^\s*\|/.test(l) || /^\s*\|[\s:|-]+\|\s*$/.test(l)) continue;
    const c = l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((x) => x.trim());
    const fil = (c[0].match(/`?([A-Za-z0-9_./-]+\.md)`?/) ?? [])[1];
    const blob = (c[c.length - 1].match(/(?<![0-9a-f])([0-9a-f]{12,40})(?![0-9a-f])/) ?? [])[1];
    if (fil && blob) ud.push({ fil, blob });
  }
  return ud;
}
// dokumenter der kan rettes med `slut ok`: docs/**.md — ikke workflowets disciplin.md, kravene eller ledgeren
const erDokument = (s) => /^docs\/.+\.md$/.test(s) && s !== "docs/strategi/disciplin.md" && !s.startsWith("docs/sandhed/krav/") && s !== LEDGER;

// mergeKontrol({pakke, ledger, blob, tekst, findes, aendretSiden, ledgerDiff}) → fejl[]
// Efter `slut ok` må kun afslutningsfilerne ændres, og hver kontrolleres ét sted (disciplin.md §2 trin 4 punkt 1-4).
//   aendretSiden(commit) → stier ændret fra commit til HEAD, eller null hvis commit ikke findes
//   ledgerDiff(commit) → { slettet: antal, tilfoejet: [linjer] } for ledgeren fra commit til HEAD
export function mergeKontrol({ pakke, ledger, blob, tekst, findes, aendretSiden, ledgerDiff }) {
  const P = `plan-build/${pakke}`, R = `${P}/slut-rapport.md`, G = `${P}/codex-gennemgang.md`;
  const s = seneste(ledger, "slut ok", erFil(R));
  if (!s) return [`ledgeren har intet \`slut ok\`, der binder ${R} → blob`];
  const commit = (s.raekke.maal.match(/(?<![0-9a-z])commit ([0-9a-f]{7,40})(?![0-9a-f])/) ?? [])[1];
  if (!commit) return [`\`slut ok\`-rækken (${s.raekke.nr}) skal nævne »commit <sha>« — den prøvede kodeversion`];
  const fejl = [];
  if (!findes(R) || !blob(R).startsWith(s.par.blob)) return [`slut-rapporten er ændret efter \`slut ok\` (${s.raekke.nr} bandt ${s.par.blob})`];
  const rapport = tekst(R);
  const pk = (rapport.match(/Prøvet kodeversion\W*(?:commit\s+)?`?([0-9a-f]{7,40})(?![0-9a-f])/i) ?? [])[1];
  if (!pk || !(pk.startsWith(commit) || commit.startsWith(pk))) fejl.push(`slut-rapportens »Prøvet kodeversion« (${pk ?? "mangler"}) er ikke det commit, \`slut ok\` bandt (${commit})`);
  // (4) Codex' gennemgang nævner det prøvede commit
  if (!findes(G)) fejl.push("Codex' gennemgang (codex-gennemgang.md) mangler");
  else if (!tekst(G).includes(commit)) fejl.push(`Codex' gennemgang nævner ikke det prøvede commit ${commit}`);
  const aendret = aendretSiden(commit);
  if (aendret === null) return [...fejl, `det prøvede commit ${commit} findes ikke`];
  // (1) dokumentrettelserne har præcis den blob, rapporten angiver — og kun dokumenter kan være afslutningsfiler
  const rettelser = rettelserFra(afsnit(rapport, "Rettelser i Mathias' dokumenter") ?? "");
  for (const sti of aendret) {
    if (sti === R || sti === G || sti === LEDGER) continue;
    const r = erDokument(sti) ? rettelser.find((p) => passer(p.fil, sti)) : null;
    if (r && findes(sti) && blob(sti).startsWith(r.blob)) continue;
    fejl.push(`${sti} er ændret efter den prøvede version (commit ${commit}) og er ikke et dokument med den blob, slut-rapportens rettelser angiver`);
  }
  // (3) ledgeren er sit tidligere indhold uændret plus præcis den nye `slut ok`-post
  const ld = ledgerDiff(commit);
  const nye = ld.tilfoejet.filter((l) => l.trim());
  if (ld.slettet > 0) fejl.push("ledgeren har fået ændret eller slettet rækker efter det prøvede commit");
  if (nye.length !== 1 || nye[0] !== s.raekke.linje) fejl.push(`ledgeren må efter det prøvede commit kun have fået \`slut ok\`-posten (${nye.length} nye linjer)`);
  return fejl;
}

// pakker med målelag = mapper i plan-build/ med angrebs-spec.json
export function pakkerMedMaalelag(root) {
  if (!existsSync(join(root, "plan-build"))) return [];
  return readdirSync(join(root, "plan-build")).filter((p) => existsSync(join(root, "plan-build", p, "angrebs-spec.json"))).sort();
}

// AKTOER_SQL → de roller aktørforbindelsens login kan blive (MEMBER, transitivt), som kan omgå rettighederne
const AKTOER_SQL = `select b.rolname from pg_roles a join pg_roles b on pg_has_role(a.oid, b.oid, 'MEMBER')
where a.rolname = current_user and (b.rolsuper or b.rolbypassrls or exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r','p') and c.relrowsecurity and not c.relforcerowsecurity and n.nspname not in ('pg_catalog','information_schema') and c.relowner = b.oid))`;

// mutantAarsag(m) → hvorfor en mutant ikke blev dræbt: apply, en target der bestod, en kontroltest der fejlede, restore eller efter restore
export function mutantAarsag(m) {
  if (!m.applied_ok) return m.detail ?? "apply fejlede";
  const t = (m.targets ?? []).filter((x) => !x.failed); if (!(m.targets ?? []).length) return "ingen target-tests"; if (t.length) return `target-test bestod under mutanten: ${t.map((x) => x.id).join(", ")}`;
  const c = (m.controls ?? []).filter((x) => !x.ok); if (c.length) return `kontroltest fejlede under mutanten: ${c.map((x) => x.id).join(", ")}`;
  if (!m.restore_ok) return "restore fejlede";
  const r = (m.restored ?? []).filter((x) => !x.ok); if (r.length) return `test fejlede efter restore: ${r.map((x) => x.id).join(", ")}`;
  return "mutanten blev ikke dræbt";
}

async function koerDatabase({ root, argv, aktoerArgv, rapport, pakker, kunMigrationer = false }) {
  const { makePgRunner, producentMiljoe } = await import("./pg-runner.mjs");
  const { runTestSuite } = await import("./test-runner.mjs");
  const { validateAngrebsIndeks, validateSlutproeve } = await import("./angrebs-indeks.mjs");
  const http = process.env.V5_PGRST_URL ? { baseUrl: process.env.V5_PGRST_URL, jwtSecret: process.env.V5_PGRST_JWT_SECRET ?? "", defaultSchema: process.env.V5_PGRST_SCHEMA || null } : null;
  const runner = makePgRunner({ argv, aktoerArgv, http });
  const git = (a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8" });
  const b = await runner.sql(FRISK_STORE_BOOTSTRAP, {});
  if (!b.ok) return { ok: false, fejl: [`testdatabasens opstart fejlede: ${b.error}`] };
  const migs = readdirSync(join(root, "supabase/migrations")).filter((f) => f.endsWith(".sql")).sort();
  for (const f of migs) {
    const p = `supabase/migrations/${f}`;
    const u = FRISK_STORE_UNDTAGELSER.find((x) => x.path === p);
    if (u) { if (git(["hash-object", p]).trim() !== u.blob) return { ok: false, fejl: [`${p} er ændret; undtagelsen gælder kun blob ${u.blob.slice(0, 8)}`] }; continue; }
    // byggerens migration sendes som én forespørgsel til serveren: psql-klientkommandoer (\! …) kan ikke køre på CI-maskinen
    const r = runner.ren(readFileSync(join(root, p), "utf8"));
    if (!r.ok) return { ok: false, fejl: [`migration ${p} fejlede: ${r.error}`] };
  }
  if (http) { try { await runner.sql("notify pgrst, 'reload schema';", {}); } catch {} }
  if (kunMigrationer) return { ok: true, fejl: [], pakker: {} };
  if (pakker.length) {
    // aktørkald går over en forbindelse, der ikke kan blive en rolle med bypass (testens SQL kan ikke skifte til service_role m.fl.)
    if (!aktoerArgv) return { ok: false, fejl: ["aktørforbindelsen mangler (V5_AKTOER_DATABASE_URL eller --pg-aktoer)"] };
    const a = makePgRunner({ argv: aktoerArgv }).sql(AKTOER_SQL, {});
    if (!a.ok) return { ok: false, fejl: [`kan ikke tjekke aktørforbindelsen: ${a.error}`] };
    if (a.rows.length) return { ok: false, fejl: [`aktørforbindelsen kan blive en rolle, der omgår rettighederne: ${a.rows.map((x) => x.rolname).join(", ")}`] };
  }
  const ud = { ok: true, fejl: [], pakker: {} };
  const rod = (pakke, f) => { ud.ok = false; ud.fejl.push(`${pakke}: ${f}`); };
  const laes = (p) => { try { return JSON.parse(readFileSync(join(root, p), "utf8")); } catch { return undefined; } };
  for (const pakke of pakker) {
    const P = `plan-build/${pakke}`;
    ud.pakker[pakke] = {};
    const manifest = laes(`${P}/forventnings-manifest.json`);
    if (manifest === undefined) { rod(pakke, "forventnings-manifest.json mangler eller er ikke JSON"); continue; }
    const suiter = [["test", "angrebs-spec.json", validateAngrebsIndeks], ["slutprøve", "slutproeve.json", validateSlutproeve]];
    for (const [navn, fil, valider] of suiter) {
      const index = laes(`${P}/${fil}`);
      if (index === undefined) { rod(pakke, `${fil} mangler eller er ikke JSON`); continue; }
      const v = valider(index, manifest);
      if (!v.ok) { rod(pakke, `${fil} er ugyldig: ${v.reasons.slice(0, 5).join("; ")}`); continue; }
      let res;
      try { res = await runTestSuite({ index, indexOid: git(["hash-object", `${P}/${fil}`]).trim(), runner, manifest, root, runId: `byggetjek-${pakke}-${navn}` }); }
      catch (e) { rod(pakke, `${navn} kunne ikke køres: ${e?.message ?? e}`); continue; }
      const roede = [...res.tests.filter((t) => t.ok !== true).map((t) => ({ id: t.id, covers: t.covers, detail: t.detail })), ...res.mutants.filter((m) => m.killed !== true).map((m) => ({ id: m.mutant_id, detail: mutantAarsag(m), mutant: m }))];
      ud.pakker[pakke][navn] = { ...res.summary, roede };
      const alleOk = res.tests.length >= 1 && roede.length === 0;
      if (!alleOk) rod(pakke, `${navn} ikke grøn (${JSON.stringify(res.summary)}${roede.length ? `; ${roede.slice(0, 3).map((x) => `${x.id}: ${String(x.detail).slice(0, 120)}`).join(" | ")}` : ""})`);
    }
    // testvalg-filen: kun pakkens egen prover-run.mjs må køres, og kun dens egen resultatfil læses
    const pj = laes(`${P}/prover.json`);
    const cmd = ["node", `scripts/v5/${pakke}/prover-run.mjs`], resultat = `${P}/prover-result.json`;
    if (!isPlain(pj) || JSON.stringify(pj.cmd) !== JSON.stringify(cmd) || pj.resultRelPath !== resultat) { rod(pakke, `prover.json skal være {"cmd": ${JSON.stringify(cmd)}, "resultRelPath": "${resultat}"}`); continue; }
    rmSync(join(root, resultat), { force: true });
    const k = spawnSync(cmd[0], cmd.slice(1), { cwd: root, encoding: "utf8", env: producentMiljoe(process.env), timeout: 600000 });
    const res = laes(resultat);
    ud.pakker[pakke].prover = res ?? null;
    if (k.status !== 0 || !isPlain(res) || res.failed !== 0 || !(res.total >= 1)) rod(pakke, `prover-kørslen ikke grøn (rc ${k.status}, ${JSON.stringify(res ?? null)})`);
  }
  if (rapport) writeFileSync(rapport, JSON.stringify(ud, null, 1) + "\n");
  return ud;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  const root = process.env.STORK_V5_REPO ?? process.cwd();
  const git = (a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const findes = (p) => existsSync(join(root, p));
  const blob = (p) => git(["hash-object", p]).trim();
  const tekst = (p) => readFileSync(join(root, p), "utf8");
  const blobTekst = (oid) => { try { return git(["cat-file", "blob", oid]); } catch { return null; } };
  const liste = (mappe) => git(["ls-files", "--", mappe]).split("\n").filter(Boolean);
  const ledger = findes(LEDGER) ? tekst(LEDGER) : "";
  const base = arg("--base");
  const aendret = base ? git(["diff", "--name-only", `${base}...HEAD`]).split("\n").filter(Boolean) : [];
  let pakke = null; try { pakke = JSON.parse(tekst("launch/launch.json")).pakke ?? null; } catch {}
  const b = pakke ? bindinger({ pakke, blob, tekst, findes, ledger, blobTekst, liste, aendret }) : { status: "ingen åben pakke", fejl: [] };
  console.log(`byggetjek: åben pakke ${pakke ?? "(ingen)"} → bindinger ${b.status}${b.fejl.length ? ": " + b.fejl.join(" · ") : ""}`);
  let db = { ok: true, fejl: [] };
  if (!process.argv.includes("--kun-bindinger")) {
    const pg = arg("--pg") ?? "env";
    const argv = pg === "env" ? ["psql", "-X"] : JSON.parse(pg);
    const aktoerArgv = arg("--pg-aktoer") ? JSON.parse(arg("--pg-aktoer")) : process.env.V5_AKTOER_DATABASE_URL ? ["psql", "-X", process.env.V5_AKTOER_DATABASE_URL] : null;
    // den åbne pakke køres først, når dens bindinger er grønne; lukkede pakker køres altid (regression)
    const pakker = pakkerMedMaalelag(root).filter((p) => p !== pakke || b.status === "grøn");
    db = await koerDatabase({ root, argv, aktoerArgv, rapport: arg("--rapport"), pakker, kunMigrationer: process.argv.includes("--kun-migrationer") });
    console.log(`byggetjek: tests og slutprøve ${db.ok ? "grønne" : "RØDE: " + db.fejl.join(" · ")}`);
  }
  let status = b.status === "rød" || !db.ok ? "rød" : b.status === "grøn" ? "grøn" : "ikke nået";
  if (base) {
    // en lukket pakkes målelag forsvinder aldrig, og ændret målelag uden for den åbne pakke skal være bundet af dens dækningsdom
    const fra = new Set(git(["ls-tree", "-r", "--name-only", base, "--", "plan-build"]).split("\n").map((f) => (f.match(/^plan-build\/([^/]+)\/angrebs-spec\.json$/) ?? [])[1]).filter(Boolean));
    const nu = new Set(pakkerMedMaalelag(root));
    const vaek = [...fra].filter((p) => !nu.has(p));
    const ubundet = b.status === "grøn" ? [] : aendret.filter((s) => erMaalelag(s) && !(pakke && egenPakke(pakke, s)));
    for (const p of vaek) console.log(`byggetjek: RØD — den lukkede pakke ${p}'s målelag er fjernet (regressionstestene skal blive)`);
    if (ubundet.length) console.log(`byggetjek: RØD — målelaget er ændret uden en dækningsdom, der binder det: ${ubundet.join(", ")}`);
    if (vaek.length || ubundet.length) status = "rød";
  }
  const pjProdukt = aendret.includes("package.json") ? packageJsonErProdukt((() => { try { return git(["show", `${base}:package.json`]); } catch { return "{}"; } })(), findes("package.json") ? tekst("package.json") : "{}", findes(".github/workflows/migrations-deploy.yml") ? tekst(".github/workflows/migrations-deploy.yml") : "") : false;
  if (base && erPakkePr(aendret, { packageJsonProdukt: pjProdukt })) {
    const mk = pakke ? mergeKontrol({ pakke, ledger, blob, tekst, findes,
      aendretSiden: (c) => { try { return git(["diff", "--name-only", c, "HEAD"]).split("\n").filter(Boolean); } catch { return null; } },
      ledgerDiff: (c) => { const l = git(["diff", "--unified=0", c, "HEAD", "--", LEDGER]).split("\n"); return { slettet: l.filter((x) => x.startsWith("-") && !x.startsWith("---")).length, tilfoejet: l.filter((x) => x.startsWith("+") && !x.startsWith("+++")).map((x) => x.slice(1)) }; } })
      : ["pakke-kode ændret, men ingen åben pakke i launch/launch.json"];
    if (status !== "grøn") mk.unshift(`en pakke-PR kræver et grønt byggetjek (status: ${status})`);
    console.log(`byggetjek: pakke-PR → ${mk.length ? "AFVIST: " + mk.join(" · ") : "slut ok og afslutningsfiler i orden"}`);
    if (mk.length) status = "rød";
  }
  console.log(`byggetjek: ${status}`);
  if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `status=${status}\n`, { flag: "a" });
  process.exit(status === "rød" ? 1 : 0);
}
