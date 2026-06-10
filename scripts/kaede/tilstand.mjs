// scripts/kaede/tilstand.mjs — kædens tilstandslæser (gov-5, plan V7 step 1).
//
// READ-ONLY: læser git + gh + filsystem og normaliserer til ét tilstands-objekt.
// Skriver ALDRIG. Dømmekraft bor i aktørerne; her bor kun observation.
//
// Rene funktioner (parseDeklaration, udtraekMarkers, findDivergens) eksporteres
// separat og dækkes af dirigent.selftest.mjs uden git/gh-afhængighed.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// ---------- rene parsere ----------

// Leverance-deklaration: sidste linje af formen "→NÆSTE: <aktør> [<type>]"
// (vækningsretten ligger hos aktørerne — kuréren læser kun deklarationen).
const DEKLARATION_RE = /^→NÆSTE:\s*(code|codex|claude-ai-rolle|mathias)(?:\s*\[([a-zæøå-]+)\])?\s*$/imu;

export function parseDeklaration(tekst) {
  const linjer = String(tekst).trimEnd().split("\n");
  for (let i = linjer.length - 1; i >= 0; i--) {
    const linje = linjer[i].trim();
    if (!linje) continue;
    const m = linje.match(DEKLARATION_RE);
    if (m) return { naeste: m[1].toLowerCase(), type: m[2]?.toLowerCase() ?? null };
    // kun sidste ikke-tomme linje kan bære deklarationen
    return null;
  }
  return null;
}

// Markers pr. §5/§6.1 — samme bracket-tolerante klasse som codex-review.sh's parser.
// \b efter KRITISK så "KRITISKE" ikke matcher (G055-lektionen).
const MARKER_RES = {
  "NEEDS-MATHIAS": /^\[?NEEDS-MATHIAS\]?(\b|:)/m,
  ESCALATE: /^\[?ESCALATE\]?(\b|:)/m,
  KRITISK: /^\[?KRITISK\]?\b/m,
  "MANGLENDE-EKSISTERENDE-BEVARELSE": /^\[?MANGLENDE-EKSISTERENDE-BEVARELSE\]?(\b|:)/m,
  "STOP-FOR-CLARIFICATION": /^\[?STOP-FOR-CLARIFICATION\]?(\b|:)/m,
  "BRUD-PAA-KRAV": /^\[?BRUD-PAA-KRAV\]?(\b|:)/m,
  "TEKNISK-BLOKERING": /^\[?TEKNISK-BLOKERING\]?(\b|:)/m,
  "PLAN-AFVIGELSE": /^\[?PLAN-AFVIGELSE\]?(\b|:)/m,
  "KRITISK-SIKKERHEDSHUL": /^\[?KRITISK-SIKKERHEDSHUL\]?(\b|:)/m,
  "WORKAROUND-INTRODUCERET": /^\[?WORKAROUND-INTRODUCERET\]?(\b|:)/m,
  APPROVAL: /^APPROVAL\b/m,
};

export function udtraekMarkers(tekst) {
  const fundet = [];
  for (const [navn, re] of Object.entries(MARKER_RES)) {
    if (re.test(String(tekst))) fundet.push(navn);
  }
  return fundet;
}

// Divergens-tjek (én sandhed, vision-princip 1): hvert kilde-par SKAL være enige.
// Input: [{felt, kilder: [{navn, vaerdi}, ...]}] → liste af uenigheder.
export function findDivergens(kildePar) {
  const divergens = [];
  for (const par of kildePar) {
    const vaerdier = new Set(par.kilder.map((k) => JSON.stringify(k.vaerdi ?? null)));
    if (vaerdier.size > 1) divergens.push({ felt: par.felt, kilder: par.kilder });
  }
  return divergens;
}

// ---------- impure læsning (tynd, defensiv) ----------

function git(args, cwd) {
  // stderr pipes (ikke arves): upushet branch giver forventelig rev-parse-fejl
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function gh(args, cwd) {
  return execFileSync("gh", args, { cwd, encoding: "utf8" }).trim();
}

function parseAktivMarker(aktivPlanTekst) {
  let marker = null;
  for (const linje of String(aktivPlanTekst).split("\n")) {
    const m = linje.trim().match(/^<!--\s*aktiv-pakke:\s*(\S+)(?:\s+fase:\s*(plan|build|rapport))?\s*-->$/);
    if (m) marker = { pakke: m[1], fase: m[2] ?? "plan" };
  }
  return marker;
}

// ---------- ren event-afledning (Codex B1-fund 2) ----------
//
// Events er AFLEDTE TILSTANDE (ikke besked-strøm): genberegnes hver cyklus af
// rå kilder; idempotens bæres af behandlede-nøgler (event:<type>@<sha>).
// gateOrd filtreres på gateAuthor OGSÅ her (forsvar i dybden — decide() gør det igen).
export function afledEvents({ pakke, paaMain, buildPr, gateOrd, gateAuthor, mainSha }) {
  if (!pakke || pakke === "ingen") return [];
  const events = [];
  if (paaMain.kravDok && !paaMain.planFil) events.push({ type: "krav-dok-merged", sha: mainSha });
  if (buildPr?.merged && !paaMain.rapportFil)
    events.push({ type: "build-pr-merged", sha: buildPr.mergeSha ?? mainSha });
  if (buildPr?.klar && buildPr?.beslutningsSti)
    events.push({ type: "build-pr-klar-beslutningssti", sha: buildPr.headSha ?? mainSha });
  for (const ord of gateOrd ?? []) {
    if (ord.author !== gateAuthor) continue;
    if (ord.tekst === "slut OK") events.push({ type: "slut-ok-registreret", sha: ord.id ?? mainSha });
    if (ord.tekst.startsWith("qwers "))
      events.push({ type: "qwers-aabning", sha: ord.id ?? mainSha, pakke: ord.tekst.slice(6).trim() });
  }
  return events;
}

// Bogførings-sti-tjek (de 7 P3-mønstre). NB: CODEOWNERS er det HÅNDHÆVENDE
// værn (GitHub) — denne helper afgør kun om kuréren skal re-requeste Mathias-
// review (transport-høflighed); GitHub kræver det uanset hvad denne siger.
const BOGFOERING_RES = [
  /^docs\/coordination\/aktiv-plan\.md$/,
  /^docs\/coordination\/seneste-rapport\.md$/,
  /^docs\/coordination\/codex-reviews\//,
  /^docs\/coordination\/plan-feedback\//,
  /^docs\/coordination\/rapport-historik\//,
  /^docs\/coordination\/[^/]+-status\.md$/,
  /^docs\/coordination\/[^/]+-plan\.md$/,
];
export function erBogfoeringsSti(fil) {
  return BOGFOERING_RES.some((re) => re.test(fil));
}

function filSha(sti, cwd) {
  try {
    return git(["log", "-1", "--format=%H", "--", sti], cwd) || null;
  } catch {
    return null;
  }
}

function paaOriginMain(sti, cwd) {
  try {
    git(["cat-file", "-e", `origin/main:${sti}`], cwd);
    return true;
  } catch {
    return false;
  }
}

function laesBuildPr(pakke, cwd) {
  try {
    const raw = gh(
      [
        "pr",
        "view",
        `claude/${pakke}-build`,
        "--json",
        "state,mergedAt,mergeCommit,headRefOid,statusCheckRollup,files",
        "--jq",
        "{state, mergedAt, mergeSha: .mergeCommit.oid, headSha: .headRefOid, checks: [.statusCheckRollup[]?.conclusion // .statusCheckRollup[]?.status], filer: [.files[].path]}",
      ],
      cwd,
    );
    const pr = JSON.parse(raw);
    return {
      merged: pr.state === "MERGED",
      mergeSha: pr.mergeSha ?? null,
      headSha: pr.headSha ?? null,
      klar: pr.state === "OPEN" && pr.checks.length > 0 && pr.checks.every((c) => c === "SUCCESS"),
      beslutningsSti: (pr.filer ?? []).some((f) => !erBogfoeringsSti(f)),
    };
  } catch {
    return null; // ingen build-PR endnu — ikke en fejl
  }
}

// Læser fuld kæde-tilstand. `behandlede` (Set af "fil@sha"/"event:type@sha")
// leveres af dirigentens dispatch-log så decide() forbliver ren og idempotent.
export function laesTilstand({ repoRod, kaedeIssue = null, fetch = true }) {
  if (fetch) git(["fetch", "--quiet"], repoRod);

  const branch = git(["branch", "--show-current"], repoRod);
  const lokalSha = git(["rev-parse", "HEAD"], repoRod);
  let remoteSha = null;
  try {
    remoteSha = git(["rev-parse", `origin/${branch}`], repoRod);
  } catch {
    remoteSha = null; // branch endnu ikke pushet — ikke divergens, men observeret
  }

  const aktivPlanSti = join(repoRod, "docs/coordination/aktiv-plan.md");
  const marker = existsSync(aktivPlanSti) ? parseAktivMarker(readFileSync(aktivPlanSti, "utf8")) : null;

  // Leverance-filer: coordination-fladen (untracked = afventer transport-commit)
  const koordDir = join(repoRod, "docs/coordination");
  const untracked = git(["status", "--porcelain", "docs/coordination/"], repoRod)
    .split("\n")
    .filter((l) => l.startsWith("??"))
    .map((l) => l.slice(3).trim());

  // Leverance-bærere (Codex B1-runde 9-fund 1 — fuld flade):
  //   codex-reviews/ + plan-feedback/  → Codex'/Claude.ai-rollens leverancer
  //   rapport-historik/                → slut-rapporter
  //   <pakke>-status.md                → CODES leverance-bærer (§3.5: status
  //     opdateres sidst i hver leverance med →NÆSTE-deklaration som sidste
  //     linje — plan-V<n>/build-batch/slut-rapport routes via den)
  const aktivPakke =
    (existsSync(aktivPlanSti) && parseAktivMarker(readFileSync(aktivPlanSti, "utf8"))?.pakke) || "ingen";
  const leveranceStier = [];
  for (const dir of ["codex-reviews", "plan-feedback", "rapport-historik"]) {
    const fuldDir = join(koordDir, dir);
    if (!existsSync(fuldDir)) continue;
    for (const fil of readdirSync(fuldDir)) {
      if (fil.endsWith(".md")) leveranceStier.push(`docs/coordination/${dir}/${fil}`);
    }
  }
  if (aktivPakke !== "ingen" && existsSync(join(koordDir, `${aktivPakke}-status.md`))) {
    leveranceStier.push(`docs/coordination/${aktivPakke}-status.md`);
  }

  // Artefakt-opslag (Codex runde 10-fund 1): status-filen er BÆRER, men
  // verdiktet skal fryses til ARTEFAKTET. Pr. deklareret type slås artefaktets
  // egen sidste commit op — den SHA bindes i dispatch-konteksten.
  function artefaktSha(deklType) {
    if (aktivPakke === "ingen" || !deklType) return null;
    if (deklType === "plan-version") return filSha(`docs/coordination/${aktivPakke}-plan.md`, repoRod);
    if (deklType === "build-batch") return git(["rev-parse", "HEAD"], repoRod); // batch = commit-flade
    if (deklType === "slut-rapport") {
      const dir = join(koordDir, "rapport-historik");
      if (!existsSync(dir)) return null;
      const fil = readdirSync(dir)
        .filter((f) => f.endsWith(`-${aktivPakke}.md`))
        .sort()
        .at(-1);
      return fil ? filSha(`docs/coordination/rapport-historik/${fil}`, repoRod) : null;
    }
    return null;
  }

  const leverancer = [];
  for (const sti of leveranceStier) {
    const tekst = readFileSync(join(repoRod, sti), "utf8");
    const erUntracked = untracked.includes(sti);
    const deklaration = parseDeklaration(tekst);
    leverancer.push({
      fil: sti,
      untracked: erUntracked,
      // frossen version: artefaktets SHA vinder over bærerens (runde 10-fund 1)
      sha: erUntracked ? null : (artefaktSha(deklaration?.type) ?? filSha(sti, repoRod)),
      deklaration,
      markers: udtraekMarkers(tekst),
    });
  }

  // Gate-ord fra kæde-issue (author + kommentar-id følger med — verifikation i decide())
  let gateOrd = [];
  if (kaedeIssue) {
    try {
      // NB: jq-filteret gives RÅT (Codex runde 9-fund 2: JSON.stringify gjorde
      // det til streng-literal → gh-fejl → catch → tomme gate-ord, stille).
      const raw = gh(
        [
          "issue",
          "view",
          String(kaedeIssue),
          "--json",
          "comments",
          "--jq",
          ".comments[] | {id: .id, author: .author.login, body: .body}",
        ],
        repoRod,
      );
      gateOrd = raw
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l))
        .map((k) => ({ id: k.id, author: k.author, tekst: k.body.trim() }));
    } catch {
      gateOrd = []; // issue utilgængeligt → ingen gate-ord; kæden venter (fail-closed)
    }
  }

  // Events: afledte tilstande for den aktive pakke (rå kilder: origin/main + build-PR)
  const pakke = marker?.pakke ?? "ingen";
  const reglerSti = join(repoRod, "scripts/kaede/kaede-regler.json");
  const gateAuthor = JSON.parse(readFileSync(reglerSti, "utf8")).identiteter.gate_author;
  let events = [];
  if (pakke !== "ingen") {
    const mainSha = git(["rev-parse", "origin/main"], repoRod);
    events = afledEvents({
      pakke,
      paaMain: {
        kravDok: paaOriginMain(`docs/coordination/${pakke}-krav-og-data.md`, repoRod),
        planFil: paaOriginMain(`docs/coordination/${pakke}-plan.md`, repoRod),
        rapportFil: false, // rapport-historik/<dato>-<pakke>.md — dato ukendt; afklares ved opslag
      },
      buildPr: fetch ? laesBuildPr(pakke, repoRod) : null,
      gateOrd,
      gateAuthor,
      mainSha,
    });
    // rapportFil: glob-opslag mod origin/main (dato-præfiks ukendt)
    try {
      const rapportFiler = git(
        ["ls-tree", "--name-only", "origin/main", "docs/coordination/rapport-historik/"],
        repoRod,
      );
      if (rapportFiler.split("\n").some((f) => f.endsWith(`-${pakke}.md`))) {
        events = events.filter((e) => e.type !== "build-pr-merged");
      }
    } catch {
      /* rapport-historik findes ikke endnu — events står */
    }
  }

  const divergens = findDivergens([
    {
      felt: `branch-sha (${branch})`,
      kilder: [
        { navn: "lokal", vaerdi: lokalSha },
        { navn: "origin", vaerdi: remoteSha ?? lokalSha }, // upushet branch er ikke uenighed
      ],
    },
  ]);

  return { branch, lokalSha, remoteSha, marker, leverancer, gateOrd, events, divergens };
}
