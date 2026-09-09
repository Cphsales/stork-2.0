#!/usr/bin/env node
// kvittering.mjs — godkendelses-KVITTERINGEN (M-41 princip 9 · GRUNDPLAN-v2 3c/B7 · P2-gates F-1, 2026-09-09).
//
// PROBLEMET: approval-filen er data. `orderedApproval` beviser at approval refererer de
// rigtige verdikt-digests (LIGHED) — ikke at Mathias' ord faldt EFTER de endelige verdikter
// og på PRÆCIS den fremlæggelse han så (HÆNDELSEN). M-38 (15:06) lå før r4b (15:10).
// LØSNINGEN: driveren skriver + committer en KVITTERING FØR fremlæggelsen sendes:
//   plan-build/<pakke>/<gate>-kvittering.json = { schema_version, gate_id, pakke, artifact_oid,
//   bindings_oids, scope_digest, prerequisite_digests (de endelige verdikters digests),
//   fremlaeggelse {path, blob_oid}, devil {path, blob_oid, dom:"PASS"}, frosset (ISO) }.
// Approval (senere commit) bærer kvittering_digest = sha256(kvitteringens committede bytes).
// Kernen (gates.mjs, gate.approvalReceipt) kræver frisk verifyApproval, som her kontrollerer (mekanisk,
// mod git-historik — IKKE en autentificeret menneske-hændelse; se residual nederst):
//   (1) digest: approval.kvittering_digest == sha256 af kvitteringen @ evidenceRef
//   (2) indhold: gate/pakke/artefakt/bindinger/scope/prerequisite_digests == gatens FAKTISKE
//   (3) fremlæggelse + devil-dom er de COMMITTEDE blobs @ evidenceRef (den tekst han så)
//   (4) RÆKKEFØLGE i git-historikken: kvitteringens sidste berørings-commit er ÆGTE forfader til
//       approvalens (aldrig samme commit, aldrig efter). Det beviser commit-orden, ikke hvem der skrev
//       approval-filen — den autentiske menneske-hændelse (server-verificeret mgrubak) er CI-approver-
//       flowets bord.
// Enhver ændring efter kvitteringen (ny tekst, nyt verdikt) → ny kvittering + ny fremlæggelse.
// DEKLARERET RESIDUAL: kvitteringen er ikke signeret af en betroet server (CI-approver-flow,
// plan DEL V/2.F). Lokalt hviler den på git-historik + fabrik-frys — samme tillidsniveau som
// alt andet i den lokale gate-dom, og ærligt stærkere end digests alene.
import { createHash } from "node:crypto";
import { isOid, digestOf, HISTORISKE_UNDTAGELSER, GATE_REGISTRY } from "./gates.mjs";
export const PROVENANCE_DIR = (pakke) => `plan-build/${pakke}/provenance`;

const hasOwn = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
const isPlain = (o) => o !== null && typeof o === "object" && !Array.isArray(o) && (Object.getPrototypeOf(o) === Object.prototype || Object.getPrototypeOf(o) === null);
// egne indeks-felter (ingen iterator/accessor-tricks — samme princip som kernen)
const ownIndexArray = (a) => (Array.isArray(a) ? Array.from({ length: a.length }, (_, i) => Object.getOwnPropertyDescriptor(a, String(i))?.value) : null);
const sameMap = (a, b) => {
  if (!isPlain(a) || !isPlain(b)) return false;
  const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]);
};
const PAKKE_RE = /^[a-z][a-z0-9-]*$/;
const SHA256_RE = /^[0-9a-f]{64}$/;

export const KVITTERING_KEYS = Object.freeze(["schema_version", "gate_id", "pakke", "artifact_oid", "bindings_oids", "scope_digest", "prerequisite_digests", "fremlaeggelse", "devil", "frosset"]);
export const kvitteringDigest = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const kvitteringPath = (pakke, gateId) => `plan-build/${pakke}/${gateId}-kvittering.json`;
export const approvalPath = (pakke, gateId) => `plan-build/${pakke}/${gateId}-approval.json`;

// validateKvittering(kv, {gateId, pakke, artifactOid, expectedOids, expectedScope, verdictDigests}) → {ok, reasons}
export function validateKvittering(kv, ctx) {
  const reasons = [];
  const fail = (r) => reasons.push(`kvittering: ${r}`);
  if (!isPlain(kv)) return { ok: false, reasons: ["kvittering: ikke et plain object"] };
  for (const k of Object.keys(kv)) if (!KVITTERING_KEYS.includes(k)) fail(`uventet felt '${k}' (fail-closed)`);
  for (const k of KVITTERING_KEYS) if (!hasOwn(kv, k)) fail(`manglende felt '${k}'`);
  if (reasons.length) return { ok: false, reasons };
  if (kv.schema_version !== 1) fail("schema_version ≠ 1");
  if (kv.gate_id !== ctx.gateId) fail(`gate_id '${String(kv.gate_id)}' ≠ gaten '${ctx.gateId}'`);
  if (typeof kv.pakke !== "string" || !PAKKE_RE.test(kv.pakke)) fail("pakke ugyldig");
  else if (ctx.pakke !== undefined && kv.pakke !== ctx.pakke) fail(`pakke '${kv.pakke}' ≠ gatens pakke '${ctx.pakke}'`);
  if (!isOid(kv.artifact_oid) || kv.artifact_oid !== ctx.artifactOid) fail("artifact_oid ≠ gatens artefakt (kvitteringen gælder en anden tekst)");
  if (!sameMap(kv.bindings_oids, ctx.expectedOids)) fail("bindings_oids ≠ gatens bindinger");
  if (typeof kv.scope_digest !== "string" || kv.scope_digest !== ctx.expectedScope) fail("scope_digest ≠ gatens scope");
  const pd = ownIndexArray(kv.prerequisite_digests);
  const want = [...ctx.verdictDigests].sort();
  if (!pd || pd.length !== want.length || !pd.every((x) => typeof x === "string" && SHA256_RE.test(x))) fail(`prerequisite_digests ugyldig/antal (${pd ? pd.length : "?"} ≠ ${want.length})`);
  else {
    const got = [...pd].sort();
    if (!want.every((d, i) => d === got[i])) fail("prerequisite_digests ≠ de endelige verdikter (kvitteringen blev skrevet på andre verdikter)");
  }
  for (const [f, keys] of [["fremlaeggelse", ["path", "blob_oid"]], ["devil", ["path", "blob_oid", "dom"]]]) {
    const o = kv[f];
    if (!isPlain(o)) { fail(`${f}: mangler/ikke et objekt`); continue; }
    for (const k of Object.keys(o)) if (!keys.includes(k)) fail(`${f}: uventet felt '${k}'`);
    if (typeof o.path !== "string" || o.path.length === 0 || o.path.includes("..") || o.path.startsWith("/")) fail(`${f}.path ugyldig`);
    if (!isOid(o.blob_oid)) fail(`${f}.blob_oid er ikke en OID`);
  }
  if (isPlain(kv.devil) && kv.devil.dom !== "PASS") fail(`devil.dom '${String(kv.devil?.dom)}' ≠ PASS — fremlæggelsen var ikke REN da kvitteringen blev skrevet`);
  if (typeof kv.frosset !== "string" || Number.isNaN(Date.parse(kv.frosset))) fail("frosset er ikke et ISO-tidsstempel");
  return { ok: reasons.length === 0, reasons };
}

// makeApprovalVerifier({git, pakke, evidenceRef, paths?}) → verifyApproval(approval, ctx) → {ok, reasons}
// git = makeGit(root) · evidenceRef = commit/ref hvor kvittering + approval + fremlæggelse er committet.
// resolveEvidence(git, ref) → pinned commit-OID (P2 F-7: HEAD må aldrig læses flere gange under en dom —
// to læsninger under et ref-skift blandede to ugyldige tilstande til én grøn). Runnere opløser ÉN gang og
// giver OID'en videre til alle verifikatorer og læsninger.
export function resolveEvidence(git, ref = "HEAD") {
  const oid = git("rev-parse", "--verify", `${ref}^{commit}`);
  if (!isOid(oid)) throw new Error(`evidens-ref '${ref}' opløser ikke til en commit`);
  return oid;
}

export function makeApprovalVerifier({ git, pakke, evidenceRef = "HEAD", paths } = {}) {
  if (typeof git !== "function") throw new Error("makeApprovalVerifier: git-dep mangler");
  if (typeof pakke !== "string" || !PAKKE_RE.test(pakke)) throw new Error("makeApprovalVerifier: ugyldig pakke");
  const E = resolveEvidence(git, evidenceRef); // pinned én gang (F-7)
  return (approval, ctx) => {
    try {
      return verifyInner(git, pakke, E, paths, approval, ctx);
    } catch (e) {
      return { ok: false, reasons: [`verifyApproval kastede (fail-closed): ${e?.message ?? String(e)}`] };
    }
  };
}

function verifyInner(git, pakke, evidenceRef, paths, approval, ctx) {
  const reasons = [];
  const fail = (r) => reasons.push(r);
  if (!isPlain(approval) || !isPlain(ctx)) return { ok: false, reasons: ["verifyApproval: ugyldigt input"] };
  const kvP = paths?.kvittering ?? kvitteringPath(pakke, ctx.gateId);
  const apP = paths?.approval ?? approvalPath(pakke, ctx.gateId);
  let bytes;
  try { bytes = git.bytes("show", `${evidenceRef}:${kvP}`); } catch { return { ok: false, reasons: [`kvittering mangler @ ${evidenceRef}:${kvP} (hændelseskæden er ubevist)`] }; }
  const digest = kvitteringDigest(bytes);
  if (approval.kvittering_digest !== digest) fail(`approval.kvittering_digest (${String(approval.kvittering_digest).slice(0, 12)}) ≠ sha256 af committet kvittering (${digest.slice(0, 12)}) — approval refererer en anden kvittering`);
  let kv;
  try { kv = JSON.parse(bytes.toString("utf8")); } catch { return { ok: false, reasons: [...reasons, "kvittering er ikke gyldig JSON"] }; }
  const v = validateKvittering(kv, { ...ctx, pakke });
  reasons.push(...v.reasons);
  if (v.ok) {
    // (3) den tekst Mathias så + devilens dom er de committede BLOBS @ evidens-commit (P2 F-6: et tree-OID
    // for en mappe "findes" også — typen skal være blob)
    for (const f of ["fremlaeggelse", "devil"]) {
      let oid = null, type = null;
      try { oid = git("rev-parse", "--verify", "--quiet", `${evidenceRef}:${kv[f].path}`); type = git("cat-file", "-t", oid); } catch { oid = null; }
      if (oid !== kv[f].blob_oid) fail(`${f}: ${kv[f].path} @ ${evidenceRef.slice(0, 7)} er ${oid ? oid.slice(0, 12) : "fraværende"} ≠ kvitteringens blob ${kv[f].blob_oid.slice(0, 12)} (teksten er ændret efter kvitteringen)`);
      else if (type !== "blob") fail(`${f}: ${kv[f].path} er ikke en fil (git-type ${String(type)})`);
    }
    // (3b) devilens DOM læses fra blobben — kvitteringens dom:"PASS" er en påstand, blobben er kilden (P2 F-5).
    // Devil-filen er JSON: { konklusion: "PASS", fremlaeggelse_blob: <oid af den dømte fremlæggelse>, … }
    if (!reasons.length) {
      let devil = null;
      try { devil = JSON.parse(git.bytes("show", `${evidenceRef}:${kv.devil.path}`).toString("utf8")); } catch { devil = null; }
      if (!isPlain(devil)) fail("devil: filen er ikke et JSON-objekt — dommen kan ikke læses");
      else {
        if (devil.konklusion !== "PASS") fail(`devil: blobbens konklusion er '${String(devil.konklusion)}', ikke PASS — kvitteringens dom:PASS modsiges af kilden`);
        if (devil.fremlaeggelse_blob !== kv.fremlaeggelse.blob_oid) fail(`devil: dommen gælder fremlæggelses-blob ${String(devil.fremlaeggelse_blob).slice(0, 12)}, ikke kvitteringens ${kv.fremlaeggelse.blob_oid.slice(0, 12)}`);
      }
    }
  }
  // (3c) approval-objektet SKAL være PRÆCIS den committede approval @ E (eksistens + kanonisk indhold) — runde 3:
  // en slettet approval har stadig en "sidste berørings-commit", og et in-memory approval-objekt kunne afvige fra filen
  try {
    const apFil = JSON.parse(git.bytes("show", `${evidenceRef}:${apP}`).toString("utf8"));
    const apCommitted = isPlain(apFil) && isPlain(apFil.approval) ? apFil.approval : apFil;
    if (digestOf(apCommitted) !== digestOf(approval)) fail(`approval-objektet ≠ den committede approval @ ${evidenceRef.slice(0, 7)}:${apP} (digest-mismatch)`);
  } catch (e) {
    if (/canonicalJson/.test(String(e?.message))) fail("approval kan ikke digestes kanonisk (ugyldige felter)");
    else fail(`approval mangler @ ${evidenceRef.slice(0, 7)}:${apP} — ingen committet godkendelse at binde til`);
  }
  // (4) rækkefølge: kvitteringens sidste berøring er ÆGTE forfader til approvalens sidste berøring
  const sidste = (p) => { const c = git("log", "-1", "--format=%H", evidenceRef, "--", p); return isOid(c) ? c : null; };
  const cK = sidste(kvP), cA = sidste(apP);
  if (!cK) fail("kvitteringens commit kan ikke findes i historikken");
  if (!cA) fail(`approvalens commit kan ikke findes (${apP} @ ${evidenceRef})`);
  if (cK && cA) {
    if (cK === cA) fail("kvittering og approval er i SAMME commit — rækkefølgen er ubevist (kvitteringen skal committes FØR fremlæggelsen sendes)");
    else {
      let forfader = false;
      try { git("merge-base", "--is-ancestor", cK, cA); forfader = true; } catch { forfader = false; }
      if (!forfader) fail(`kvitteringens commit (${cK.slice(0, 7)}) er ikke forfader til approvalens (${cA.slice(0, 7)}) — kvitteringen er ændret efter godkendelsen, eller godkendelsen kom først`);
    }
  }
  return { ok: reasons.length === 0, reasons };
}

// ---------- TRANSPORT-kvittering (codex-run.sh $OUT.receipt.json) — P2 F-2/F-10 ----------
// makeTransportVerifier({git, pakke, evidenceRef, gateId, commitSha, artifactPath}) → verifyTransport(verdicts)
// For hvert verdikt m. aktor "codex": run.receipt_sha256 SKAL findes, og en fil *.receipt.json i
// plan-build/<pakke>/provenance/ @ evidenceRef SKAL hashe til den; kvitteringen SKAL være status success,
// selftest false, lock_mode committed, aktivitet dom, gate_input == {gateId, commitSha, artifactPath}, og
// attempts.last.output_sha256 == verdiktets run.raw_output_sha256 (leverancen der bærer dommen).
// Claude-Agent-aktører (code · code-reviewer · claude-ai) har ingen wrapper → SELV-ERKLÆRET (deklareret
// residual til CI actor-runner) — de springes over her, men kræves at have IKKE receipt_sha256 (ingen
// forfalsket transport-lighed).
const SHA256 = /^[0-9a-f]{64}$/;
export function validateTransportReceipt(r, ctx) {
  const reasons = [];
  const fail = (m) => reasons.push(`transport-kvittering: ${m}`);
  if (!isPlain(r)) return { ok: false, reasons: ["transport-kvittering: ikke et plain object"] };
  if (r.schema_version !== 2) fail(`schema_version ${String(r.schema_version)} ≠ 2`);
  if (r.status !== "success") fail(`status '${String(r.status)}' ≠ success`);
  if (r.selftest === true || r.selftest !== false) fail("selftest-flag mangler eller er sat — kørslen er ikke gate-evidens");
  if (r.lock_mode !== "committed") fail(`lock_mode '${String(r.lock_mode)}' ≠ committed`);
  if (r.aktivitet !== "dom") fail(`aktivitet '${String(r.aktivitet)}' ≠ dom (en gate-dom skrives kun af en dom-kørsel)`);
  const gi = r.gate_input;
  if (!isPlain(gi)) fail("gate_input mangler — kørslen var ikke bundet til nogen gate");
  else {
    if (gi.gate_id !== ctx.gateId) fail(`gate_input.gate_id '${String(gi.gate_id)}' ≠ '${ctx.gateId}'`);
    if (gi.gated_commit !== ctx.commitSha) fail("gate_input.gated_commit ≠ gatens pinnede commit");
    if (gi.artifact_path !== ctx.artifactPath) fail(`gate_input.artifact_path '${String(gi.artifact_path)}' ≠ '${ctx.artifactPath}'`);
  }
  for (const k of ["rolle", "model", "effort", "skill_oid", "prompt_sha256", "run_id"]) if (typeof r[k] !== "string" || !r[k]) fail(`mangler ${k}`);
  if (!/^[0-9a-f]{40}$/.test(String(r.regel_commit))) fail(`regel_commit '${String(r.regel_commit)}' er ikke en fast 40-hex commit-OID (en flytbar ref som HEAD kan genopslås til en anden lås, F-18)`);
  const at = Array.isArray(r.attempts) ? r.attempts : null;
  if (!at || at.length < 1 || at.length > 2) fail("ugyldigt antal forsøg");
  else {
    for (const [i, a] of at.entries()) if (!isPlain(a) || a.attempt !== i + 1 || a.model !== r.model || a.effort !== r.effort || a.sandbox !== r.sandbox) fail(`forsøg ${i + 1} ude af rækkefølge eller med anden model/effort/sandbox`);
    const last = at[at.length - 1];
    if (!isPlain(last) || last.rc !== 0 || !(Number(last.output_bytes) > 0) || !SHA256.test(String(last.output_sha256))) fail("sidste forsøg leverede ikke");
    else if (ctx.rawOutputSha256 !== undefined && last.output_sha256 !== ctx.rawOutputSha256) fail(`leverance (${String(last.output_sha256).slice(0, 12)}) ≠ verdiktets raw_output_sha256 (${String(ctx.rawOutputSha256).slice(0, 12)})`);
  }
  return { ok: reasons.length === 0, reasons };
}

export function makeTransportVerifier({ git, pakke, evidenceRef = "HEAD", gateId, commitSha, artifactPath } = {}) {
  if (typeof git !== "function") throw new Error("makeTransportVerifier: git-dep mangler");
  if (typeof pakke !== "string" || !PAKKE_RE.test(pakke)) throw new Error("makeTransportVerifier: ugyldig pakke");
  if (typeof gateId !== "string" || !isOid(commitSha) || typeof artifactPath !== "string") throw new Error("makeTransportVerifier: gate/commit/artefakt kræves");
  const E = resolveEvidence(git, evidenceRef); // pinned én gang (F-7)
  return (verdicts) => {
    try {
      const reasons = [];
      if (!Array.isArray(verdicts)) return { ok: false, reasons: ["verifyTransport: verdicts er ikke et array"] };
      // alle committede kvitteringer @ evidenceRef, hashet én gang
      let filer = [];
      try { filer = git("ls-tree", "--name-only", `${E}:${PROVENANCE_DIR(pakke)}`).split("\n").filter((f) => /\.receipt\.json$/.test(f)); } catch { filer = []; }
      const bySha = new Map();
      for (const f of filer) {
        const bytes = git.bytes("show", `${E}:${PROVENANCE_DIR(pakke)}/${f}`);
        bySha.set(kvitteringDigest(bytes), { f, bytes });
      }
      // committede leverancer (F-14): <navn>.leverance.md — slås op på sha256 af bytes
      const leverancer = new Map();
      let levFiler = [];
      try { levFiler = git("ls-tree", "--name-only", `${E}:${PROVENANCE_DIR(pakke)}`).split("\n").filter((f) => /\.leverance\.md$/.test(f)); } catch { levFiler = []; }
      for (const f of levFiler) {
        const bytes = git.bytes("show", `${E}:${PROVENANCE_DIR(pakke)}/${f}`);
        leverancer.set(kvitteringDigest(bytes), { f, bytes });
      }
      for (const v of verdicts) {
        if (!isPlain(v) || !isPlain(v.run)) { reasons.push("verdikt/run ugyldig"); continue; }
        const rs = v.run.receipt_sha256;
        if (v.aktor !== "codex") {
          if (rs !== undefined) reasons.push(`${String(v.aktor)}: receipt_sha256 på en aktør uden transport-kvittering (forfalsket lighed)`);
          continue; // SELV-ERKLÆRET residual (Claude-Agent-aktører) — deklareret
        }
        if (!SHA256.test(String(rs))) {
          // PRÆCIS det historiske r4b-verdikt (digest-bundet) accepteres uden kvittering — intet andet
          let historisk = false;
          try { historisk = rs === undefined && HISTORISKE_UNDTAGELSER.verdikter.includes(digestOf(v)); } catch { historisk = false; } // u-digestbart verdikt = ikke historisk
          if (historisk) continue;
          reasons.push("codex: run.receipt_sha256 mangler — dommen er ikke bundet til nogen kørsel (F-2; ikke en registreret historisk undtagelse)"); continue;
        }
        const hit = bySha.get(rs);
        if (!hit) { reasons.push(`codex: ingen committet kvittering @ ${E.slice(0, 7)}:${PROVENANCE_DIR(pakke)} hasher til ${rs.slice(0, 12)}`); continue; }
        let r; try { r = JSON.parse(hit.bytes.toString("utf8")); } catch { reasons.push(`codex: kvittering ${hit.f} er ikke JSON`); continue; }
        const val = validateTransportReceipt(r, { gateId, commitSha, artifactPath, rawOutputSha256: v.run.raw_output_sha256 });
        if (!val.ok) { reasons.push(...val.reasons.map((x) => `codex (${hit.f}): ${x}`)); continue; }
        // F-15: forventet rolle for gaten · kørsels-identitet · lås @ regel_commit == lås @ evidens-commit
        const gate = GATE_REGISTRY.find((g) => g.id === gateId);
        if (!gate?.codexRolle || r.rolle !== gate.codexRolle) reasons.push(`codex (${hit.f}): kvitteringens rolle '${String(r.rolle)}' ≠ gatens codex-rolle '${String(gate?.codexRolle)}'`);
        if (v.run.run_id !== r.run_id) reasons.push(`codex (${hit.f}): verdiktets run_id ≠ kvitteringens`);
        if (v.run.run_attempt !== r.attempts.length) reasons.push(`codex (${hit.f}): verdiktets run_attempt (${String(v.run.run_attempt)}) ≠ kvitteringens antal forsøg (${r.attempts.length})`);
        if (v.run.effort !== r.effort) reasons.push(`codex (${hit.f}): verdiktets effort ≠ kvitteringens`);
        try {
          // F-18 (runde 5): regel_commit SKAL være en COMMIT — et tree-OID m. samme lås-blob er også et gyldigt `<oid>:sti`-opslag
          let typeR = null; try { typeR = git("cat-file", "-t", r.regel_commit); } catch { typeR = null; }
          if (typeR !== "commit") { reasons.push(`codex (${hit.f}): regel_commit er ikke en commit (git-type ${String(typeR)})`); continue; }
          const lockE = git("rev-parse", `${E}:scripts/v5/actors.lock.json`);
          const lockR = git("rev-parse", `${r.regel_commit}:scripts/v5/actors.lock.json`);
          if (lockE !== lockR) reasons.push(`codex (${hit.f}): kørt under en anden lås (@${String(r.regel_commit).slice(0, 7)}) end den gældende @ evidens-commit ${E.slice(0, 7)}`);
          // F-18: læs PRÆCIS den sammenlignede låseblob (blob-OID), aldrig et nyt ref-opslag
          const lock = JSON.parse(git.bytes("show", lockR).toString("utf8"));
          const rolle = Object.prototype.hasOwnProperty.call(lock, r.rolle) ? lock[r.rolle] : null;
          if (!rolle || rolle.aktoer !== "codex" || rolle.skill_oid !== r.skill_oid || rolle.model !== r.model || rolle.reasoning !== r.effort) reasons.push(`codex (${hit.f}): kvitteringens rolle/skill/model/effort matcher ikke låsen @ ${String(r.regel_commit).slice(0, 7)}`);
        } catch (e) { reasons.push(`codex (${hit.f}): lås-opslag fejlede (${e?.message ?? e})`); }
        // F-14: dommens felter GENUDLEDES fra den hash-bundne, COMMITTEDE leverance (<navn>.leverance.md)
        const levHit = leverancer.get(r.attempts[r.attempts.length - 1].output_sha256);
        if (!levHit) { reasons.push(`codex (${hit.f}): ingen committet leverance @ ${E.slice(0, 7)}:${PROVENANCE_DIR(pakke)} hasher til kvitteringens output_sha256 — dommen kan ikke genudledes`); continue; }
        const ud = udtraekVerdiktDraft(levHit.bytes.toString("utf8"));
        if (!ud.ok) { reasons.push(...ud.reasons.map((x) => `codex (${levHit.f}): ${x}`)); continue; }
        reasons.push(...draftMatcherVerdikt(ud.draft, v).map((x) => `codex (${levHit.f}): ${x}`));
      }
      return { ok: reasons.length === 0, reasons };
    } catch (e) {
      return { ok: false, reasons: [`verifyTransport kastede (fail-closed): ${e?.message ?? String(e)}`] };
    }
  };
}

// ---------- verdikt-draft i leverancen (P2 F-10/F-16 → runde 9: INGEN Markdown-parsing) ----------
// Runde 4-8 lærte: en CommonMark-parser (fences · info-strenge · indrykning · linjeskift · containere) kan ikke
// gøres falsk-grøn-fri ét skridt ad gangen — hver runde fandt en ny regel. Vejnings-reglen: det simpleste der fuldt
// dækker. Kontrakten er nu uden Markdown-semantik:
//   * leverancens SIDSTE ikke-tomme linje er  `VERDIKT-DRAFT: <base64(JSON)>`
//   * der må findes PRÆCIS én linje i hele filen der (trimmet) begynder med `VERDIKT-DRAFT:` — også et citeret
//     eksempel tæller, så et citat kan aldrig smugle en anden dom ind (2 linjer = rød), og intet citat kan blive
//     "aktivt" på bekostning af den ægte (den ægte SKAL være sidst)
//   * base64 skal være kanonisk (round-trip-identisk) og dekode til ét plain JSON-objekt
// Ingen fence-tilstand, ingen containere, ingen Unicode-whitespace-semantik — kun linjer, trim og base64.
export const DRAFT_MARK = "VERDIKT-DRAFT:";
export function udtraekVerdiktDraft(text) {
  if (typeof text !== "string") return { ok: false, reasons: ["leverance er ikke tekst"] };
  const lines = text.split(/\r\n|\r|\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) { const t = lines[i].trim(); if (t.startsWith(DRAFT_MARK)) hits.push({ i, t }); }
  if (hits.length !== 1) return { ok: false, reasons: [`leverancen skal indeholde PRÆCIS én linje der begynder med ${DRAFT_MARK} (fandt ${hits.length}) — også citerede eksempler tæller`] };
  let last = -1;
  for (let i = lines.length - 1; i >= 0; i--) if (lines[i].trim() !== "") { last = i; break; }
  if (hits[0].i !== last) return { ok: false, reasons: [`${DRAFT_MARK}-linjen skal være leverancens SIDSTE ikke-tomme linje (den står på linje ${hits[0].i + 1}, sidste er ${last + 1})`] };
  const b64 = hits[0].t.slice(DRAFT_MARK.length).trim();
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) return { ok: false, reasons: [`${DRAFT_MARK}: værdien er ikke base64`] };
  const buf = Buffer.from(b64, "base64");
  if (buf.toString("base64") !== b64) return { ok: false, reasons: [`${DRAFT_MARK}: base64 er ikke kanonisk (round-trip afviger)`] };
  let draft;
  try { draft = JSON.parse(buf.toString("utf8")); } catch { return { ok: false, reasons: [`${DRAFT_MARK}: dekoder ikke til gyldig JSON`] }; }
  if (!isPlain(draft)) return { ok: false, reasons: [`${DRAFT_MARK}: JSON er ikke et objekt`] };
  return { ok: true, draft, reasons: [] };
}

// draftMatcherVerdikt(draft, v) → reasons[] — dommens felter i verdiktet SKAL være dem leverancen bærer (F-14)
export function draftMatcherVerdikt(draft, v) {
  const reasons = [];
  const canon = (x) => JSON.stringify(x, (k, val) => (val && typeof val === "object" && !Array.isArray(val) ? Object.fromEntries(Object.keys(val).sort().map((kk) => [kk, val[kk]])) : val));
  if (draft.aktor !== v.aktor) reasons.push(`leverancens draft.aktor '${String(draft.aktor)}' ≠ verdiktets '${String(v.aktor)}'`);
  if (draft.conclusion !== v.conclusion) reasons.push(`leverancens draft.conclusion '${String(draft.conclusion)}' ≠ verdiktets '${String(v.conclusion)}' (dommen er byttet efter kørslen)`);
  if (canon(draft.negative_cases ?? null) !== canon(v.negative_cases ?? null)) reasons.push("negative_cases i verdiktet ≠ leverancens");
  if (canon(draft.claim_graph_refs ?? []) !== canon(v.claim_graph_refs ?? [])) reasons.push("claim_graph_refs i verdiktet ≠ leverancens");
  const evD = Array.isArray(draft.evidence) ? draft.evidence.map((e) => ({ path: e?.path, line_span: e?.line_span })) : null;
  const evV = Array.isArray(v.evidence) ? v.evidence.map((e) => ({ path: e?.path, line_span: e?.line_span })) : null;
  if (canon(evD) !== canon(evV)) reasons.push("evidence (path + line_span) i verdiktet ≠ leverancens");
  return reasons;
}
