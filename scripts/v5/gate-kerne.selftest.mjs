#!/usr/bin/env node
// gate-kerne.selftest.mjs — per-mekanisme red-team af v5 gate-kernen
// (implementeringsplan DEL VI (a), kerne-scope). Hver case planter en
// falsk-grøn; gaten SKAL være lukket med en konkret begrundelse. Fixturet er
// et RIGTIGT git-repo (ægte OIDs, ægte blobs) — testene udøver kernens
// faktiske logik, ikke dens beskrivelse (KERNEN). + grønne stier: en gate der
// aldrig KAN åbne, beviser intet (fail-closed er gratis uden dem).

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { GATE_REGISTRY, evaluateGate, digestOf, scopeDigest, APPROVER } from "./gates.mjs";
import { makeGit, resolveRef } from "./git.mjs";
import { validateVerdiktSchema, makeVerdictVerifier, readBlobLines, excerptAt } from "./verdikt.mjs";

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};

// ---------- fixture: rigtigt git-repo ----------

const ROOT = mkdtempSync(join(tmpdir(), "v5-gate-kerne-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const git = makeGit(ROOT);
git("config", "user.name", "selftest");
git("config", "user.email", "selftest@local");

const FILES = {
  "launch/launch.json": JSON.stringify({ anker: "pakke-x", pakke: "pakke-x", author: APPROVER }) + "\n",
  "recon/bundle.json": JSON.stringify({ docs: ["docs/sandhed/vision.md"] }) + "\n",
  "recon/recon.md":
    "# recon — pakke-x\n\n- flade_punkt: rls-policy salg (kode-bøtte)\n- flade_punkt: provision-sats (intet_data)\n",
  "recon2/recon2.md": "# recon-2 — pakke-x\n\n- krav-drevet uddybning\n",
  "sandhed/krav/pakke-x-krav.md":
    "# pakke-x — krav-og-data\n" +
    "## K-1: cross-org data må ALDRIG kunne læses\n" +
    "Acceptkriterie: reelt cross-org forsøg afvises mod den rigtige RLS (negativ).\n" +
    "## K-2: provision beregnes af godkendt sats\n" +
    "Acceptkriterie: slut-effekt i DB-row, inkl. negativ (ikke-godkendt sats afvises).\n",
  "plan-build/pakke-x/plan.md": "# pakke-x — plan\n\n| K-1 | bid 1 | step 1 | effect-harness + mutant-kill |\n",
  "plan-build/pakke-x/build-proof.json": JSON.stringify({ bijektion: true, k_results: ["K-1", "K-2"] }) + "\n",
};
for (const [p, c] of Object.entries(FILES)) {
  mkdirSync(join(ROOT, dirname(p)), { recursive: true });
  writeFileSync(join(ROOT, p), c);
}
// Codex-fund 4: tom fil (tomt uddrag) + binær/ikke-UTF-8 blob (lossy decode).
writeFileSync(join(ROOT, "sandhed/krav/tom.md"), "");
writeFileSync(join(ROOT, "sandhed/krav/binaer.dat"), Buffer.from([0xff, 0xfe, 0x00, 0x01]));
git("add", "-A");
git("commit", "-qm", "fixture: kæde-artefakter");
const COMMIT = git("rev-parse", "HEAD");
const ref = (p) => resolveRef(git, COMMIT, p);

// ---------- byggeklodser (den GRØNNE sandhed — muteres pr. case) ----------

// Byg citatet med NØJAGTIG samme excerpt-beregning som produktionen
// (readBlobLines + excerptAt fra verdikt.mjs) — ingen divergerende kopi.
const mkEvidence = (path, start, end, commit = COMMIT) => {
  const r = resolveRef(git, commit, path);
  const excerpt = excerptAt(readBlobLines(git, r.oid).lines, [start, end]);
  return { commit_sha: commit, path, blob_oid: r.oid, line_span: [start, end], excerpt_sha: sha256(excerpt) };
};

const mkVerdict = (aktor, gateId, artifactRef, bindingsOids, evidence) => ({
  schema_version: 1,
  gate_id: gateId,
  aktor,
  artifact_oid: artifactRef.oid,
  bindings_oids: { ...bindingsOids },
  input_oids_read: [artifactRef.oid, ...Object.values(bindingsOids)],
  conclusion: "PASS",
  negative_cases: ["cross-org afvist mod reel RLS (K-1-negativ udøvet)"],
  claim_graph_refs: [],
  evidence: evidence.map((e) => ({ ...e })),
  run: {
    run_id: `run-${aktor}`,
    run_attempt: 1,
    raw_output_sha256: sha256(`raw-${aktor}`),
    actor_server_id: "ci-actor-runner",
  },
});

function greenKrav() {
  const artifact = ref("sandhed/krav/pakke-x-krav.md");
  const bindings = { recon: ref("recon/recon.md"), anker: ref("launch/launch.json") };
  const bOids = { recon: bindings.recon.oid, anker: bindings.anker.oid };
  const ev = [mkEvidence("sandhed/krav/pakke-x-krav.md", 2, 3)];
  const verdicts = [mkVerdict("code", "krav", artifact, bOids, ev), mkVerdict("codex", "krav", artifact, bOids, ev)];
  const snapshot = {
    commit_sha: COMMIT,
    artifact,
    bindings,
    proof_result: null,
    verdicts,
    approval: {
      login_server_verified: APPROVER,
      gate_id: "krav",
      scope_digest: scopeDigest("krav", artifact.oid, bOids),
      prerequisite_digests: verdicts.map(digestOf),
    },
    predecessor: { gate_id: "recon", conclusion: "success", artifact_oid: bindings.recon.oid },
  };
  return { snapshot, deps: { verifyVerdict: makeVerdictVerifier({ git }) } };
}

function greenBuild() {
  const artifact = ref("plan-build/pakke-x/build-proof.json");
  const bindings = { plan: ref("plan-build/pakke-x/plan.md") };
  const proof = {
    ok: true,
    gate_id: "build",
    proof_kind: "build-proof",
    artifact_oid: artifact.oid,
    bindings_oids: { plan: bindings.plan.oid },
    killed_mutants: 2, // payload — re-verificeres FRISK af verifyProof, aldrig trusted
  };
  const snapshot = {
    commit_sha: COMMIT,
    artifact,
    bindings,
    proof_result: proof,
    verdicts: [],
    approval: null,
    predecessor: { gate_id: "plan", conclusion: "success", artifact_oid: bindings.plan.oid },
  };
  // Frisk re-verifikation: verifyProof RE-REGNER payloadet (her: mutant-tal),
  // i stedet for at tro på det committede ok:true. Fuld proofs.mjs = byg-pkt 3.
  const deps = {
    verifyProof: (p) =>
      p.killed_mutants === 2 ? { ok: true, reasons: [] } : { ok: false, reasons: ["mutant-recount matcher ikke"] },
  };
  return { snapshot, deps };
}

function greenRecon() {
  const artifact = ref("recon/recon.md");
  const bindings = { anker: ref("launch/launch.json"), bundle: ref("recon/bundle.json") };
  const proof = {
    ok: true,
    gate_id: "recon",
    proof_kind: "recon-coverage",
    artifact_oid: artifact.oid,
    bindings_oids: { anker: bindings.anker.oid, bundle: bindings.bundle.oid },
  };
  return {
    snapshot: {
      commit_sha: COMMIT,
      artifact,
      bindings,
      proof_result: proof,
      verdicts: [],
      approval: null,
      predecessor: null,
    },
    deps: { verifyProof: () => ({ ok: true, reasons: [] }) },
  };
}

// ---------- runner ----------

function expectOpen(name, { snapshot, deps }, gateId) {
  const r = evaluateGate(gateId, snapshot, deps);
  r.open === true ? ok(name) : bad(name, `lukket: ${r.reasons.join(" | ")}`);
}
// plantet falsk-grøn → gaten SKAL være lukket, med begrundelse der matcher needle
function plantClosed(name, gateId, mk, mutate, needle) {
  const { snapshot, deps } = mk();
  const ctx = { snapshot: structuredClone(snapshot), deps };
  mutate(ctx);
  const r = evaluateGate(gateId, ctx.snapshot, ctx.deps ?? deps);
  const hit = r.reasons.some((x) => new RegExp(needle).test(x));
  !r.open && hit
    ? ok(name)
    : bad(
        name,
        r.open ? "GATEN ÅBNEDE (falsk-grøn slap igennem)" : `lukket men uden '${needle}': ${r.reasons.join(" | ")}`,
      );
}

console.log("gate-kerne red-team — grønne stier (gaten KAN åbne):");
expectOpen("krav-gate åbner på fuld gyldig evidens", greenKrav(), "krav");
expectOpen("build-gate åbner på typed bevis + frisk re-verifikation", greenBuild(), "build");
expectOpen("recon-gate (rod) åbner uden forgænger", greenRecon(), "recon");

console.log("\nplantede falsk-grønne — approver/rækkefølge (krav 5):");
plantClosed(
  "forkert approver (bot signerer)",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.approval.login_server_verified = "stork-code-bot";
  },
  "ikke mgrubak",
);
plantClosed(
  "scope_digest-replay fra andet artefakt",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.approval.scope_digest = scopeDigest("krav", ref("recon/recon.md").oid, { x: ref("recon/recon.md").oid });
  },
  "anti-replay",
);
plantClosed(
  "krav OK uden verdikt-reference (rækkefølge ubevist)",
  "krav",
  greenKrav,
  (c) => {
    delete c.snapshot.approval.prerequisite_digests;
  },
  "rækkefølge ubevist",
);
plantClosed(
  "krav OK der kun refererer ét af to verdikter",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.approval.prerequisite_digests = c.snapshot.approval.prerequisite_digests.slice(0, 1);
  },
  "matcher ikke de faktiske",
);
plantClosed(
  "krav OK med fabrikerede digests",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.approval.prerequisite_digests = [sha256("a"), sha256("b")];
  },
  "matcher ikke de faktiske",
);
plantClosed(
  "ukendt felt i approval",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.approval.note = "ser fint ud";
  },
  "uventet felt",
);

console.log("\nplantede falsk-grønne — aktør-verdikter (anti-tavshed + binding):");
plantClosed(
  "FAIL-verdikt blokerer",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts[1].conclusion = "FAIL";
  },
  "ikke PASS",
);
plantClosed(
  "HALT-verdikt blokerer",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts[1].conclusion = "HALT";
  },
  "ikke PASS",
);
plantClosed(
  "manglende codex-verdikt (tavshed ≠ ja)",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts = c.snapshot.verdicts.filter((v) => v.aktor !== "codex");
  },
  "manglende verdikt fra codex",
);
plantClosed(
  "uventet aktør-verdikt afvises",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts.push({ ...structuredClone(c.snapshot.verdicts[0]), aktor: "claude-ai" });
  },
  "uventet aktør",
);
plantClosed(
  "dublet-verdikt afvises",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts.push(structuredClone(c.snapshot.verdicts[0]));
  },
  "dublet",
);
plantClosed(
  "verdikt bundet til forkert artefakt-OID (stale)",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts[0].artifact_oid = ref("recon/recon.md").oid;
  },
  "artifact_oid-binding brudt",
);
plantClosed(
  "verdikt med forkert bindings_oids",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts[0].bindings_oids.recon = ref("recon2/recon2.md").oid;
  },
  "bindings_oids-binding brudt",
);
plantClosed(
  "manglende verifyVerdict-dep = rød (fail-closed)",
  "krav",
  greenKrav,
  (c) => {
    c.deps = {};
  },
  "verifyVerdict-dep mangler",
);

console.log("\nplantede falsk-grønne — læsebevis mod rå git:");
plantClosed(
  "orphan-blob-citat (blob ikke på citeret sti)",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts[0].evidence[0].blob_oid = ref("recon/recon.md").oid;
  },
  "stale/orphan-citat",
);
plantClosed(
  "fabrikeret citat (excerpt_sha matcher ikke)",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts[0].evidence[0].excerpt_sha = sha256("noget der lyder rigtigt");
  },
  "excerpt_sha matcher ikke",
);
plantClosed(
  "citat fra anden commit end den gatede",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts[0].evidence[0].commit_sha = "0".repeat(40);
  },
  "gated commit",
);
plantClosed(
  "line_span uden for blobben",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts[0].evidence[0].line_span = [1, 999];
  },
  "uden for blob",
);
plantClosed(
  "ikke-eksisterende sti i citat",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts[0].evidence[0].path = "findes/ikke.md";
  },
  "findes ikke",
);
plantClosed(
  "ukendt felt i verdikt (schema fail-closed)",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts[0].ekstra_ros = "flot arbejde";
  },
  "ukendt felt",
);
plantClosed(
  "manglende server-provenance (run.actor_server_id)",
  "krav",
  greenKrav,
  (c) => {
    delete c.snapshot.verdicts[0].run.actor_server_id;
  },
  "manglende felt",
);
plantClosed(
  "tom evidens-liste (ord uden læsning)",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.verdicts[0].evidence = [];
  },
  "ikke-tomt, tæt array",
);

console.log("\nplantede falsk-grønne — maskine-bevis (typed binding + frisk re-kør):");
plantClosed(
  "generisk {ok:true} åbner intet",
  "build",
  greenBuild,
  (c) => {
    c.snapshot.proof_result = { ok: true };
  },
  "binding brudt|bindings_oids",
);
plantClosed(
  "ok som streng 'true' afvises",
  "build",
  greenBuild,
  (c) => {
    c.snapshot.proof_result.ok = "true";
  },
  "eksplicit true",
);
plantClosed(
  "bevis bundet til forkert artefakt",
  "build",
  greenBuild,
  (c) => {
    c.snapshot.proof_result.artifact_oid = ref("recon/recon.md").oid;
  },
  "artifact_oid-binding",
);
plantClosed(
  "forkert proof_kind (genbrugt bevis-type)",
  "build",
  greenBuild,
  (c) => {
    c.snapshot.proof_result.proof_kind = "recon-coverage";
  },
  "proof_kind-binding",
);
plantClosed(
  "committet ok:true men frisk re-verifikation fejler",
  "build",
  greenBuild,
  (c) => {
    c.snapshot.proof_result.killed_mutants = 0;
  },
  "frisk verifyProof fejlede",
);
plantClosed(
  "manglende verifyProof-dep = rød (fail-closed)",
  "build",
  greenBuild,
  (c) => {
    c.deps = {};
  },
  "verifyProof-dep mangler",
);
plantClosed(
  "uventede verdikter på maskine-gate",
  "build",
  greenBuild,
  (c) => {
    c.snapshot.verdicts = [{ aktor: "code" }];
  },
  "uventede verdikter",
);
plantClosed(
  "uventet approval på maskine-gate",
  "build",
  greenBuild,
  (c) => {
    c.snapshot.approval = { login_server_verified: APPROVER };
  },
  "uventet approval",
);

console.log("\nplantede falsk-grønne — kæden (indholds-bundet forgænger):");
plantClosed(
  "forgænger-check mangler",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.predecessor = null;
  },
  "predecessor-check mangler",
);
plantClosed(
  "forgænger ikke success",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.predecessor.conclusion = "failure";
  },
  "ikke success",
);
plantClosed(
  "forgænger {open:true} uden indholds-match",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.predecessor.artifact_oid = ref("recon2/recon2.md").oid;
  },
  "indholds-bundet kæde",
);
plantClosed(
  "forkert forgænger-gate",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.predecessor.gate_id = "plan";
  },
  "kræver recon|predecessor gate_id",
);
plantClosed(
  "uventet forgænger på rod-gate",
  "recon",
  greenRecon,
  (c) => {
    c.snapshot.predecessor = { gate_id: "slut", conclusion: "success", artifact_oid: ref("recon/recon.md").oid };
  },
  "rod-gate",
);
plantClosed(
  "manglende binding",
  "krav",
  greenKrav,
  (c) => {
    delete c.snapshot.bindings.recon;
  },
  "binding 'recon' mangler",
);
plantClosed(
  "uventet ekstra binding",
  "krav",
  greenKrav,
  (c) => {
    c.snapshot.bindings.smuglet = ref("recon2/recon2.md");
  },
  "uventet binding",
);

// ---------- regressioner: Codex' uafhængige angreb 2026-08-11 (P4: fanget → permanent test) ----------
console.log("\nCodex-fund 1 — evidens-relevans (citat skal bevise læsning af DET gatede input):");
plantClosed(
  "verdikt citerer kun en binding (anker), ikke selve krav-artefaktet",
  "krav",
  greenKrav,
  (c) => {
    const anker = mkEvidence("launch/launch.json", 1, 1);
    for (const v of c.snapshot.verdicts) v.evidence = [anker];
  },
  "citerer ikke selve artefaktet",
);
plantClosed(
  "input_oids_read dækker ikke bindingerne (ubevist læsning af gatet input)",
  "krav",
  greenKrav,
  (c) => {
    for (const v of c.snapshot.verdicts) v.input_oids_read = [v.artifact_oid]; // droppede recon+anker
  },
  "input_oids_read dækker ikke",
);
plantClosed(
  "citat af en OID uden for artefakt+bindinger (recon2 er ikke en krav-binding)",
  "krav",
  greenKrav,
  (c) => {
    const r2 = mkEvidence("recon2/recon2.md", 1, 1);
    for (const v of c.snapshot.verdicts) {
      v.input_oids_read = [...v.input_oids_read, r2.blob_oid]; // erklær den, så intern-check ikke dominerer
      v.evidence = [v.evidence[0], r2]; // beholder krav-citatet + smugler recon2 ind
    }
  },
  "uden for artefakt\\+bindinger",
);

console.log("\nCodex-fund 2 — sparse arrays (huller må ikke passere som udfyldt):");
plantClosed(
  "sparse input_oids_read (new Array(n))",
  "krav",
  greenKrav,
  (c) => {
    for (const v of c.snapshot.verdicts) v.input_oids_read = new Array(2);
  },
  "tæt array",
);
plantClosed(
  "sparse evidence-array",
  "krav",
  greenKrav,
  (c) => {
    for (const v of c.snapshot.verdicts) v.evidence = new Array(1);
  },
  "tæt array",
);

console.log("\nCodex-fund 3 — prototype-/arvede felter tæller ikke som egne data:");
{
  const { snapshot, deps } = greenKrav();
  const s = structuredClone(snapshot);
  // felterne lever på prototypen → Object.keys(v) === [] → hasOwn-required fanger det.
  s.verdicts = s.verdicts.map((v) => Object.create(v));
  const r = evaluateGate("krav", s, deps);
  const hit = r.reasons.some((x) => /arvet/.test(x));
  !r.open && hit
    ? ok("Object.create(proto)-verdikt afvises (required = EGNE felter, digest ser samme)")
    : bad("prototype-verdikt", r.open ? "GATEN ÅBNEDE via prototype-felter" : r.reasons.join(" | "));
}

console.log("\nCodex-fund 4 — læsebevis kræver ægte tekst-blob:");
plantClosed(
  "tree-oid som citat (mappe, ikke fil)",
  "krav",
  greenKrav,
  (c) => {
    const treeOid = git("rev-parse", `${COMMIT}:sandhed`);
    const treeEv = {
      commit_sha: COMMIT,
      path: "sandhed",
      blob_oid: treeOid,
      line_span: [1, 1],
      excerpt_sha: sha256("x"),
    };
    for (const v of c.snapshot.verdicts) {
      v.input_oids_read = [...v.input_oids_read, treeOid];
      v.evidence = [v.evidence[0], treeEv];
    }
  },
  "ikke en blob",
);
plantClosed(
  "tom fil (tomt uddrag beviser intet)",
  "krav",
  greenKrav,
  (c) => {
    const tom = ref("sandhed/krav/tom.md");
    const tomEv = {
      commit_sha: COMMIT,
      path: "sandhed/krav/tom.md",
      blob_oid: tom.oid,
      line_span: [1, 1],
      excerpt_sha: sha256(""),
    };
    for (const v of c.snapshot.verdicts) {
      v.input_oids_read = [...v.input_oids_read, tom.oid];
      v.evidence = [v.evidence[0], tomEv];
    }
  },
  "tomt uddrag",
);
plantClosed(
  "binær/ikke-UTF-8 blob som citat",
  "krav",
  greenKrav,
  (c) => {
    const bin = ref("sandhed/krav/binaer.dat");
    const binEv = {
      commit_sha: COMMIT,
      path: "sandhed/krav/binaer.dat",
      blob_oid: bin.oid,
      line_span: [1, 1],
      excerpt_sha: sha256("x"),
    };
    for (const v of c.snapshot.verdicts) {
      v.input_oids_read = [...v.input_oids_read, bin.oid];
      v.evidence = [v.evidence[0], binEv];
    }
  },
  "gyldig UTF-8",
);

console.log("\nCodex-fail-crash — dårligt input giver RØD, ikke exception:");
{
  const { snapshot, deps } = greenKrav();
  const s = structuredClone(snapshot);
  s.verdicts[0].boom = undefined; // ukendt felt m. undefined-værdi (før: digestOf kastede)
  const r = evaluateGate("krav", s, deps);
  !r.open && r.reasons.some((x) => /ukendt felt/.test(x)) && !r.reasons.some((x) => /kastede/.test(x))
    ? ok("verdikt m. undefined-felt afvises rent (ingen crash, digest sprunget over)")
    : bad("fail-crash", r.open ? "ÅBNEDE" : `uventet: ${r.reasons.join(" | ")}`);
}
{
  const { snapshot } = greenKrav();
  const r = evaluateGate("krav", snapshot, {
    verifyVerdict: () => {
      throw new Error("dep-crash");
    },
  });
  !r.open && r.reasons.some((x) => /kastede/.test(x))
    ? ok("dep der kaster → top-level fail-closed (rød, ikke boblende crash)")
    : bad("top-level-guard", r.open ? "ÅBNEDE" : r.reasons.join(" | "));
}

console.log("\nCodex-fund — registry deep-frozen (kan ikke muteres i memory):");
Object.isFrozen(GATE_REGISTRY[1].bindings) && Object.isFrozen(GATE_REGISTRY[1].expectedActors)
  ? ok("indlejrede registry-arrays er frosne")
  : bad("deep-freeze", "indlejret array ikke frosset");
try {
  GATE_REGISTRY[1].bindings.push("smuglet");
  bad("deep-freeze-push", "push på frosset bindings-array lykkedes");
} catch {
  ok("push på frosset registry-array kaster (strict mode)");
}

console.log("\nstale-detektion via ægte ny commit (OID-binding, ikke commit_sha):");
{
  writeFileSync(
    join(ROOT, "sandhed/krav/pakke-x-krav.md"),
    FILES["sandhed/krav/pakke-x-krav.md"] + "## K-3: nyt krav\nAcceptkriterie: ny slut-effekt.\n",
  );
  git("add", "-A");
  git("commit", "-qm", "krav ændret (ny version)");
  const COMMIT2 = git("rev-parse", "HEAD");
  const { snapshot, deps } = greenKrav(); // gamle verdikter/approval — bundet til GAMMEL krav-OID
  const s2 = structuredClone(snapshot);
  s2.commit_sha = COMMIT2;
  s2.artifact = resolveRef(git, COMMIT2, "sandhed/krav/pakke-x-krav.md"); // NY OID
  s2.bindings = {
    recon: resolveRef(git, COMMIT2, "recon/recon.md"),
    anker: resolveRef(git, COMMIT2, "launch/launch.json"),
  };
  const r = evaluateGate("krav", s2, deps);
  const hit = r.reasons.some((x) => /artifact_oid-binding brudt/.test(x));
  !r.open && hit
    ? ok("nyt krav-indhold lukker gaten til gen-evaluering (gamle verdikter/approval ugyldige)")
    : bad("stale-detektion", r.open ? "ÅBNEDE på stale evidens" : r.reasons.join(" | "));
  const uOids = { recon: s2.bindings.recon.oid, anker: s2.bindings.anker.oid };
  const rescope = scopeDigest("krav", s2.artifact.oid, uOids);
  rescope !== snapshot.approval.scope_digest
    ? ok("scope_digest skifter med indholdet (approval kan ikke genbruges)")
    : bad("scope-digest-stale", "digest uændret trods nyt indhold");
}

console.log("\ndigest-determinisme (kanonisk, nøgle-orden ligegyldig):");
digestOf({ a: 1, b: [2, { c: "x" }] }) === digestOf({ b: [2, { c: "x" }], a: 1 })
  ? ok("digestOf er nøgle-ordens-uafhængig")
  : bad("digest-determinisme", "nøgle-orden ændrede digest");
try {
  digestOf({ a: undefined });
  bad("digest fail-closed", "undefined blev tavst accepteret");
} catch {
  ok("digestOf kaster på utilladt værdi (intet tavst drop)");
}

console.log("\nCodex-genangreb — top-level snapshot-prototype:");
{
  const { snapshot, deps } = greenKrav();
  const protoSnap = Object.create(snapshot); // arvede felter, egne = []
  const r = evaluateGate("krav", protoSnap, deps);
  !r.open && r.reasons.some((x) => /ikke-standard prototype/.test(x))
    ? ok("Object.create(snapshot) → gaten lukker (fail-closed)")
    : bad("snapshot-prototype", r.open ? "ÅBNEDE" : r.reasons.join(" | "));
}

console.log("\nCodex-genangreb — læsebevis bevarer UTF-8 BOM (rå bytes):");
{
  const RB = mkdtempSync(join(tmpdir(), "v5-bom-"));
  process.on("exit", () => rmSync(RB, { recursive: true, force: true }));
  execFileSync("git", ["init", "-q", RB]);
  const gb = makeGit(RB);
  gb("config", "user.name", "selftest");
  gb("config", "user.email", "selftest@local");
  writeFileSync(join(RB, "bom.md"), "﻿Kravlinje\nlinje2\n"); // BOM foran linje 1
  gb("add", "-A");
  gb("commit", "-qm", "bom");
  const CB = gb("rev-parse", "HEAD");
  const oid = resolveRef(gb, CB, "bom.md").oid;
  const lines = readBlobLines(gb, oid).lines;
  lines[0] === "﻿Kravlinje"
    ? ok("readBlobLines bevarer BOM i linje 1 (strippes ikke)")
    : bad("bom-bevaring", JSON.stringify(lines[0]));
  // et citat beregnet UDEN BOM må IKKE matche de rå bytes
  const excerptMedBom = excerptAt(lines, [1, 1]);
  sha256(excerptMedBom) !== sha256("Kravlinje")
    ? ok("citat uden BOM ≠ rå bytes (BOM-stripping ville have givet falsk match)")
    : bad("bom-hash", "BOM blev strippet — falsk match muligt");
}

console.log("\nregistry-sanitet:");
GATE_REGISTRY.every((g) => g.predecessor === null || GATE_REGISTRY.some((p) => p.id === g.predecessor))
  ? ok("alle forgængere findes i registry (DAG intakt)")
  : bad("registry", "forgænger peger på ukendt gate");
GATE_REGISTRY.every((g) => g.predecessor === null || g.bindings.includes(g.predecessorBinding))
  ? ok("predecessorBinding er altid en reel binding")
  : bad("registry", "predecessorBinding uden for bindings");
const schemaProbe = validateVerdiktSchema({});
!schemaProbe.ok ? ok("tomt verdikt afvises af schema") : bad("schema", "tomt verdikt passerede");

console.log("");
if (failed > 0) {
  console.error(`gate-kerne red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("gate-kerne red-team: alle cases passed (grønne stier + alle plantede falsk-grønne fanget)");
