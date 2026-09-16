#!/usr/bin/env node
// ci-gate-dom.mjs — C4: CI SOM DOMMER (plan 2.A »Autoritet = CI's friske evaluateGate emitteret som check-run v5/gate/<id>« · 2.E · DEL V ·
// M-41 Trin C4 · fabrik-beslutning 2026-09-15 / DEL VIII pkt. 36: lokal = candidate, CI = autoritet).
//
// Kør (CI-job m. checks:write): node scripts/v5/ci-gate-dom.mjs --commit <sha> --emit [--repo owner/navn]
// Kør (lokalt, tør): node scripts/v5/ci-gate-dom.mjs --commit <sha>
//
// For hver gate i registryet (recon · krav · plan · build · slut):
//   1. NÅETHED: gaten dømmes kun hvis dens gate-specifikke kandidat-/approval-fil FINDES i den pinnede commit (recon-coverage-proof ·
//      krav-approval · plan-approval · build-proof · chain-proof). En ikke-nået gate emitteres IKKE — et required check der mangler er
//      ikke grønt (aldrig »skipped = green«, plan DEL VII).
//   2. FRISK DOM: gatens udfør-side (runReconGate · runKravGate · runPlanGate) køres mod gatens PINNEDE commit — den commit hvis
//      artefakt gaten dømmer (verdikter og kvittering er bundet til den) — med evidenceRef = den PUSHEDE commit (hvor approval/verdikter
//      ligger). Den pinnede commit læses fra det committede kandidat-resultat `<gate>-gate-resultat.json`.commit_sha @ pushed commit og
//      SKAL være en forfader til (eller lig) den pushede commit; mangler filen eller er commit'en ikke i historikken → FAILURE m. grund.
//      IDENTITET (Codex P-1 F-C4-1): gatens artefakt og ALLE bindinger skal have samme blob-OID ved pinned og ved pushed, og launch.pakke
//      skal være den samme — en gammel åben dom må ikke blive grøn for ændret indhold. Nyere evidens-commits (approval/verdikter) er tilladt;
//      ændret artefakt/binding/pakke → FAILURE m. hvad der ændrede sig. recon dømmes ved den pushede commit selv (ingen approval).
//      build: dømmes af SIT EGET workflow (v5-build-dom.yml → ci-build-dom.mjs, kræver Postgres-service) — denne dommer emitterer INTET
//      for build (to emittere på samme check-navn ville give modstridende domme); slut: udfør-side ikke bygget → FAILURE m. grund.
//   3. EMISSION: resultatet mappes til check-run-payload (checkrun.mjs, fail-closed) og publiceres som `v5/gate/<id>` på head_sha via
//      GitHub REST (workflow-tokenets checks:write). Emission der fejler → exit ≠ 0 (aldrig stille).
//   Runner der kaster → conclusion failure (fail-closed). Jobbet er grønt når DOMMEREN KØRTE OG EMITTEREDE — gaternes udfald står i
//   check-runs, ikke i jobbets exit-kode.
//
// AUTORITET (ærlig): check-run'et er autoritativt først når (a) branch protection kræver `v5/gate/<id>` fra kilden »GitHub Actions«,
// og (b) et ruleset beskytter måle-laget (`scripts/v5/**` · `.github/workflows/**`) mod ikke-reviewede pushes. Begge er repo-admin
// (Mathias' infrastruktur, plan DEL V). Indtil da er også CI's dom en navngiven kandidat — men en der ikke kan produceres lokalt.
// Residualer: R-CI-AUTORITETSJOB (workflow-filens integritet = måle-lag) · R-CI-AUTENTICITET (build-proofens observationer produceres
// af CI's egen runner, C4b) · gate-App m. egen identitet i stedet for GITHUB_TOKEN (DEL V, admin) — ikke krævet for kandidat-drift.

import { GATE_IDS, checkRunName } from "./gates.mjs";
import { checkRunFromGateResult } from "./checkrun.mjs";
import { buildSnapshot } from "./gate-eval.mjs";
import { makeGit } from "./git.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { realpathSync, appendFileSync } from "node:fs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const isOid = (s) => typeof s === "string" && /^[0-9a-f]{40}$/.test(s);

// nåethed: den fil hvis eksistens i commit'en betyder »pakken har nået denne gate« (<pakke> substitueres)
export const NAAETHED = Object.freeze({
  recon: "recon/recon-coverage-proof.json",
  krav: "plan-build/<pakke>/krav-approval.json",
  plan: "plan-build/<pakke>/plan-approval.json",
  build: "plan-build/<pakke>/build-proof.json",
  slut: "plan-build/<pakke>/chain-proof.json",
});
// pinned commit pr. gate: recon = den pushede commit; krav/plan = kandidat-resultatets commit_sha; build/slut = proofens snapshot (C4b)
export const PINNED_KILDE = Object.freeze({ recon: null, krav: "plan-build/<pakke>/krav-gate-resultat.json", plan: "plan-build/<pakke>/plan-gate-resultat.json", build: null, slut: null });
// gates der dømmes og emitteres af et ANDET workflow (eget job m. store): denne dommer emitterer intet for dem — én emitter pr. check-navn
export const DELEGERET = Object.freeze({ build: "v5-build-dom.yml (ci-build-dom.mjs)" });

// standard-runnere: udfør-siderne, dynamisk importeret (så selvtesten kan injicere sine egne uden git)
async function defaultRunners() {
  const [{ runReconGate }, { runKravGate }, { runPlanGate }] = await Promise.all([import("./recon-gate-run.mjs"), import("./krav-gate-run.mjs"), import("./plan-gate-run.mjs")]);
  const ikkeBygget = (gate) => () => ({ open: false, gate_id: gate, reasons: [`${gate}-gatens udfør-side (C4b) er ikke bygget endnu — fail-closed: en nået gate uden dommer er RØD, ikke tavs`] });
  return {   // (pinned, {root, evidenceRef: pushed})
    recon: (pinned, o) => runReconGate(pinned, { root: o.root }),
    krav: (pinned, o) => runKravGate(pinned, { root: o.root, evidenceRef: o.evidenceRef }),
    plan: (pinned, o) => runPlanGate(pinned, { root: o.root, evidenceRef: o.evidenceRef }),
    build: ikkeBygget("build"),
    slut: ikkeBygget("slut"),
  };
}

// doemGates({commitSha (pushed), root, git?, runners?, exists?, readJson?, isAncestor?, pakke?}) → [{gate, naaet, fil, pinned, result|null, checkRun|null}]
// identitet(gate, sha, pakke) → { pakke, artifact: oid, bindings: {k: oid} } — det gaten dømmer, ved én commit (default: gate-eval's layout + launch.json)
function defaultIdentitet(g) {
  return (gate, sha, pakke) => {
    const launch = JSON.parse(g.bytes("show", `${sha}:launch/launch.json`).toString("utf8"));
    const snap = buildSnapshot(gate, { git: g, commitSha: sha, pakke });
    return { pakke: launch.pakke, artifact: snap.artifact?.oid ?? null, bindings: Object.fromEntries(Object.entries(snap.bindings ?? {}).map(([k, v]) => [k, v?.oid ?? null])) };
  };
}
const canonId = (x) => JSON.stringify({ pakke: x.pakke, artifact: x.artifact, bindings: Object.fromEntries(Object.entries(x.bindings ?? {}).sort()) });
export async function doemGates({ commitSha, root = repoRoot, git = null, runners = null, exists = null, readJson = null, isAncestor = null, identitet = null, pakke = null, gates = GATE_IDS } = {}) {
  if (!isOid(commitSha)) throw new Error("commitSha skal være en fuld 40-hex commit-OID (pinned — aldrig en mutable ref)");
  const g = git ?? makeGit(root);
  const findes = exists ?? ((path) => { try { g("cat-file", "-e", `${commitSha}:${path}`); return true; } catch { return false; } });
  const laesJson = readJson ?? ((path) => JSON.parse(g.bytes("show", `${commitSha}:${path}`).toString("utf8")));
  const erForfader = isAncestor ?? ((anc, desc) => { if (anc === desc) return true; try { g("merge-base", "--is-ancestor", anc, desc); return true; } catch { return false; } });
  const idAt = identitet ?? defaultIdentitet(g);
  let pk = pakke;
  if (!pk) { try { pk = JSON.parse(g.bytes("show", `${commitSha}:launch/launch.json`).toString("utf8")).pakke; } catch (e) { throw new Error(`launch/launch.json kan ikke læses i ${commitSha.slice(0, 7)}: ${e?.message ?? e}`); } }
  if (typeof pk !== "string" || !pk) throw new Error("launch.pakke mangler");
  const R = runners ?? (await defaultRunners());
  const out = [];
  for (const gate of gates) {
    if (!GATE_IDS.includes(gate)) throw new Error(`ukendt gate '${gate}'`);
    const fil = NAAETHED[gate].replace("<pakke>", pk);
    if (!findes(fil)) { out.push({ gate, naaet: false, fil, pinned: null, result: null, checkRun: null }); continue; }
    if (DELEGERET[gate]) { out.push({ gate, naaet: true, fil, pinned: null, result: null, checkRun: null, delegeret: DELEGERET[gate] }); continue; }
    // pinned commit: kandidat-resultatets commit_sha (krav/plan) — SKAL være OID og forfader til/lig den pushede commit
    let pinned = commitSha; let result = null;
    const kilde = PINNED_KILDE[gate] ? PINNED_KILDE[gate].replace("<pakke>", pk) : null;
    if (kilde) {
      if (!findes(kilde)) result = { open: false, gate_id: gate, reasons: [`kandidat-resultatet ${kilde} findes ikke i den pushede commit — CI kan ikke afgøre hvilken commit gaten dømmer (fail-closed)`] };
      else {
        let cs = null; try { cs = laesJson(kilde)?.commit_sha; } catch (e) { result = { open: false, gate_id: gate, reasons: [`${kilde} kan ikke læses: ${e?.message ?? e}`] }; }
        if (!result) { if (!isOid(cs)) result = { open: false, gate_id: gate, reasons: [`${kilde}.commit_sha mangler/ikke en fuld OID (fail-closed)`] }; else if (!erForfader(cs, commitSha)) result = { open: false, gate_id: gate, reasons: [`${kilde}.commit_sha ${cs.slice(0, 7)} er ikke forfader til den pushede commit ${commitSha.slice(0, 7)} — gaten dømmer en fremmed historik (fail-closed)`] }; else pinned = cs; }
      }
      // F-C4-1: identitetsbinding pinned ↔ pushed — samme pakke, samme artefakt-OID, samme bindings-OID'er; ellers er den gamle dom forældet
      if (!result && pinned !== commitSha) {
        let a = null, b = null;
        try { a = idAt(gate, pinned, pk); b = idAt(gate, commitSha, pk); } catch (e) { result = { open: false, gate_id: gate, reasons: [`identitet kan ikke afgøres (${e?.message ?? e}) — artefakt/bindinger findes ikke ens ved pinned og pushed (fail-closed)`] }; }
        if (!result && canonId(a) !== canonId(b)) {
          const diff = []; if (a.pakke !== b.pakke) diff.push(`pakke ${a.pakke} → ${b.pakke}`); if (a.artifact !== b.artifact) diff.push(`artefakt ${String(a.artifact).slice(0, 12)} → ${String(b.artifact).slice(0, 12)}`);
          for (const k of new Set([...Object.keys(a.bindings), ...Object.keys(b.bindings)])) if (a.bindings[k] !== b.bindings[k]) diff.push(`binding ${k} ${String(a.bindings[k]).slice(0, 12)} → ${String(b.bindings[k]).slice(0, 12)}`);
          result = { open: false, gate_id: gate, reasons: [`indholdet er ÆNDRET siden den dømte commit ${pinned.slice(0, 7)}: ${diff.join(" · ")} — en gammel åben dom gælder ikke ændret indhold (F-C4-1); ny gate-dom kræves`] };
        }
      }
    }
    if (!result) { try { result = await R[gate](pinned, { root, pakke: pk, evidenceRef: commitSha }); } catch (e) { result = { open: false, gate_id: gate, reasons: [`dommeren kastede (fail-closed): ${e?.message ?? String(e)}`] }; } }
    const cr = checkRunFromGateResult(gate, result);
    if (cr && cr.output) cr.output.summary = `pinned ${pinned.slice(0, 12)} · evidens @ pushed ${commitSha.slice(0, 12)}\n${cr.output.summary}`;
    out.push({ gate, naaet: true, fil, pinned, result, checkRun: cr });
  }
  return out;
}

// emitCheckRuns({repo, headSha, domme, token, fetchFn, apiBase}) → [{name, conclusion, status, id}] — kaster ved enhver fejl (aldrig stille)
export async function emitCheckRuns({ repo, headSha, domme, token, fetchFn = globalThis.fetch, apiBase = "https://api.github.com" } = {}) {
  if (typeof repo !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error("repo skal være owner/navn");
  if (!isOid(headSha)) throw new Error("headSha skal være en fuld commit-OID");
  if (typeof token !== "string" || !token) throw new Error("GITHUB_TOKEN mangler — emission kræver checks:write (fail-closed: intet emitteres)");
  if (typeof fetchFn !== "function") throw new Error("fetch mangler");
  const emitted = [];
  for (const d of domme) {
    if (!d.naaet || !d.checkRun) continue;
    const body = { name: d.checkRun.name, head_sha: headSha, status: "completed", conclusion: d.checkRun.conclusion, output: { title: d.checkRun.output.title, summary: d.checkRun.output.summary.slice(0, 65000) }, external_id: `v5:${d.gate}:${headSha.slice(0, 12)}` };
    if (body.name !== checkRunName(d.gate)) throw new Error(`check-run-navn '${body.name}' ≠ ${checkRunName(d.gate)} (payload-mapperen må aldrig omdirigere)`);
    const res = await fetchFn(`${apiBase}/repos/${repo}/check-runs`, { method: "POST", headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res || typeof res.status !== "number" || res.status < 200 || res.status >= 300) throw new Error(`emission af ${body.name} fejlede: HTTP ${res?.status ?? "?"} ${typeof res?.text === "function" ? (await res.text()).slice(0, 300) : ""}`);
    let id = null; try { id = (await res.json())?.id ?? null; } catch { id = null; }
    emitted.push({ name: body.name, conclusion: body.conclusion, status: res.status, id });
  }
  return emitted;
}

export function resume(domme, emitted = null) {
  const lines = [`# v5 gate-dommer (CI = autoritet)`, ``, `| gate | nået | dom | check-run |`, `|---|---|---|---|`];
  for (const d of domme) lines.push(`| ${d.gate} | ${d.naaet ? (d.delegeret ? "ja" : `ja (pinned ${String(d.pinned).slice(0, 7)})`) : `nej (${d.fil} findes ikke)`} | ${d.delegeret ? `dømmes af ${d.delegeret}` : d.naaet ? (d.result?.open === true ? "ÅBEN" : "LUKKET") : "—"} | ${d.checkRun ? `${d.checkRun.name} → ${d.checkRun.conclusion}${emitted ? (emitted.find((e) => e.name === d.checkRun.name) ? " (emitteret)" : " (IKKE emitteret)") : " (tør kørsel)"}` : "ingen (ikke nået = ikke grøn)"} |`);
  for (const d of domme) if (d.naaet && d.result?.open !== true) lines.push(``, `**${d.gate} lukket:** ${(d.result?.reasons ?? []).slice(0, 12).map((r) => `- ${r}`).join("\n")}`);
  return lines.join("\n");
}

function erMain() {
  if (!process.argv[1] || process.argv[1] === "-") return false;
  try { if (import.meta.url === pathToFileURL(process.argv[1]).href) return true; return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; }
}
if (erMain()) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
  const commitSha = arg("--commit"); const emit = process.argv.includes("--emit"); const repo = arg("--repo") ?? process.env.GITHUB_REPOSITORY;
  (async () => {
    const domme = await doemGates({ commitSha });
    let emitted = null;
    if (emit) emitted = await emitCheckRuns({ repo, headSha: commitSha, domme, token: process.env.GITHUB_TOKEN });
    const md = resume(domme, emitted); console.log(md);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n");
    console.log(JSON.stringify({ commit: commitSha, domme: domme.map((d) => ({ gate: d.gate, naaet: d.naaet, open: d.result?.open ?? null, conclusion: d.checkRun?.conclusion ?? null })), emitted }, null, 1));
  })().catch((e) => { console.error(`✗ ci-gate-dom: ${e?.message ?? e}`); process.exit(1); });
}
