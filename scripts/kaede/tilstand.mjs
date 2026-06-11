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
  PASS: /^PASS\b/m,
  FEEDBACK: /^FEEDBACK\b/m,
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
export function afledEvents({ pakke, paaMain, buildPr, gateOrd, gateAuthor, mainSha, recon = {} }) {
  const events = [];
  // Åbnings- og gate-ord-afledning kører ALTID (V13/runde 21: åbning sker
  // netop ved aktiv-pakke: ingen). Author-filter også her (forsvar i dybden).
  for (const ord of gateOrd ?? []) {
    if (ord.author !== gateAuthor) continue;
    if (ord.tekst.startsWith("qwers "))
      events.push({ type: "qwers-aabning", sha: ord.id ?? mainSha, pakke: ord.tekst.slice(6).trim() });
  }
  if (!pakke || pakke === "ingen") return events;

  // Recon-afledninger (V8-kædestart): afledte tilstande af leverance-eksistens
  if (recon.kode && recon.research && !recon.oplaeg)
    events.push({ type: "recon-kode-klar", sha: recon.kodeSha ?? mainSha, pakke });
  if (recon.kode && recon.research && recon.oplaeg)
    events.push({ type: "recon-klar", sha: recon.oplaegSha ?? mainSha, pakke });

  // krav-dok-merged betinget af recon-fase afsluttet (Codex runde 17/V9)
  if (paaMain.kravDok && !paaMain.planFil && (recon.klar ?? false))
    events.push({ type: "krav-dok-merged", sha: mainSha });
  if (buildPr?.merged && !paaMain.rapportFil)
    events.push({ type: "build-pr-merged", sha: buildPr.mergeSha ?? mainSha });
  if (buildPr?.klar && buildPr?.beslutningsSti)
    events.push({ type: "build-pr-klar-beslutningssti", sha: buildPr.headSha ?? mainSha });
  for (const ord of gateOrd ?? []) {
    if (ord.author !== gateAuthor) continue;
    if (ord.tekst === "slut OK") events.push({ type: "slut-ok-registreret", sha: ord.id ?? mainSha });
    // Versions-bindingen (V9, rest-klik-afgørelse 2): "krav OK <hash>"
    const kravOk = ord.tekst.match(/^krav OK ([0-9a-f]{7,64})$/);
    if (kravOk) events.push({ type: "krav-ok-hash-registreret", sha: ord.id ?? mainSha, hash: kravOk[1] });
    // Gate-afgørelser (runde 16): GODKENDT/AFVIST løfter åben Mathias-gate
    if (ord.tekst === "GODKENDT" || ord.tekst.startsWith("GODKENDT "))
      events.push({ type: "gate-godkendt", sha: ord.id ?? mainSha });
    if (ord.tekst === "AFVIST" || ord.tekst.startsWith("AFVIST "))
      events.push({ type: "gate-afvist", sha: ord.id ?? mainSha });
  }
  return events;
}

// Type-inferens fra filnavns-mønster + markers (runde 31-fund 3): kædens
// leverance-bærere uden →NÆSTE-deklaration. REN og selftest-dækket.
// NB: aktivering kræver baseline-seeding (step 10-preflight) — eksisterende
// filer skrives som REGISTRERET i dispatch-loggen, ellers flyder historikken ind.
export function infererType(sti, markers = []) {
  if (/-krav-og-data\.md$/.test(sti)) return "krav-dok-udkast";
  if (/-recon-kode\.md$/.test(sti)) return "recon-kode-doc";
  if (/-recon-research\.md$/.test(sti)) return "recon-research-doc";
  if (/-recon-oplaeg\.md$/.test(sti)) return "recon-oplaeg";
  if (/codex-reviews\/.*-troskab-/.test(sti)) return "troskabs-verdikt";
  if (/codex-reviews\/.*-claude-ai\.md$/.test(sti)) return null; // claude-ai-review: bæres af betingelsesFakta (claudeAiApproval), ikke routing
  if (/codex-reviews\//.test(sti)) return markers.includes("APPROVAL") ? "review-approval" : "review-feedback";
  return null;
}

// Bogførings-sti-tjek (de 9 P3-mønstre — V9 rest-klik-afgørelser: arkiv +
// krav-og-data un-ownet, gated af ord/hash). NB: CODEOWNERS er det HÅNDHÆVENDE
// værn (GitHub) — denne helper afgør kun om kuréren skal re-requeste Mathias-
// review (transport-høflighed); GitHub kræver det uanset hvad denne siger.
const BOGFOERING_RES = [
  /^docs\/coordination\/aktiv-plan\.md$/,
  /^docs\/coordination\/seneste-rapport\.md$/,
  /^docs\/coordination\/codex-reviews\//,
  /^docs\/coordination\/plan-feedback\//,
  /^docs\/coordination\/rapport-historik\//,
  /^docs\/coordination\/arkiv\//,
  /^docs\/coordination\/[^/]+-status\.md$/,
  /^docs\/coordination\/[^/]+-plan\.md$/,
  /^docs\/coordination\/[^/]+-krav-og-data\.md$/,
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

function laesIssueOrdHelper(issueNr, cwd) {
  try {
    const raw = gh(
      [
        "issue",
        "view",
        String(issueNr),
        "--json",
        "comments",
        "--jq",
        ".comments[] | {id: .id, author: .author.login, body: .body}",
      ],
      cwd,
    );
    return raw
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l))
      .map((k) => ({ id: k.id, author: k.author, tekst: k.body.trim() }));
  } catch {
    return []; // issue utilgængeligt → ingen gate-ord; kæden venter (fail-closed)
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

  // Åbne Mathias-gates (§6.3-to-fil-flow): gate-fil m. "AFVENTER MATHIAS"
  // pauser sporet (decide regel 1b) indtil Mathias afgør.
  const gateDir = join(repoRod, "docs/coordination/mathias-gate");
  const aabneGates = existsSync(gateDir)
    ? readdirSync(gateDir)
        .filter((f) => f.endsWith(".md"))
        .filter((f) => /AFVENTER MATHIAS/.test(readFileSync(join(gateDir, f), "utf8")))
        .map((f) => `docs/coordination/mathias-gate/${f}`)
    : [];

  // Leverance-filer: coordination-fladen (untracked = afventer transport-commit)
  const koordDir = join(repoRod, "docs/coordination");
  const porcelain = git(["status", "--porcelain", "docs/coordination/"], repoRod).split("\n").filter(Boolean);
  const untracked = porcelain.filter((l) => l.startsWith("??")).map((l) => l.slice(3).trim());
  // Modificeret TRACKED fil (Codex runde 13-fund 1): en aktør m. commit-ret er
  // midt i arbejdet — kuréren committer ALDRIG halvfærdigt arbejde og må ikke
  // route filen (worktree-tekst + gammel filSha = forkert frossen version).
  const aendrede = porcelain.filter((l) => !l.startsWith("??")).map((l) => l.slice(3).trim());

  // Leverance-bærere (Codex B1-runde 9-fund 1 — fuld flade):
  //   codex-reviews/ + plan-feedback/  → Codex'/Claude.ai-rollens leverancer
  //   rapport-historik/                → slut-rapporter
  //   <pakke>-status.md                → CODES leverance-bærer (§3.5: status
  //     opdateres sidst i hver leverance med →NÆSTE-deklaration som sidste
  //     linje — plan-V<n>/build-batch/slut-rapport routes via den)
  const markerPakke =
    (existsSync(aktivPlanSti) && parseAktivMarker(readFileSync(aktivPlanSti, "utf8"))?.pakke) || "ingen";
  // Åbnings-anker (runde 34-fund 2): under åbning er markøren "ingen", men
  // qwers-ordet (stående issue, author-verificeret) bærer pakken — den ankrer
  // recon-scan, recon-fakta og pakke-issue FØR markøren flipper ved plan-fasen.
  const reglerTidlig = JSON.parse(readFileSync(join(repoRod, "scripts/kaede/kaede-regler.json"), "utf8"));
  let aabningsPakke = null;
  if (fetch && markerPakke === "ingen" && reglerTidlig.kaede_issue) {
    const ord = laesIssueOrdHelper(reglerTidlig.kaede_issue, repoRod);
    const qwers = ord
      .filter((o) => o.author === reglerTidlig.identiteter.gate_author && o.tekst.startsWith("qwers "))
      .at(-1);
    aabningsPakke = qwers ? qwers.tekst.slice(6).trim() : null;
  }
  const aktivPakke = markerPakke !== "ingen" ? markerPakke : (aabningsPakke ?? "ingen");
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
  // krav-dok-udkast (V19/V21) + recon-leverancer (runde 31-fund 1): bærere i
  // BEGGE tilstande — untracked (→ transport-commit/frys) OG committed-indtil-
  // behandlet. Typer infereres af filnavne; ingen →NÆSTE-deklaration krævet.
  if (aktivPakke !== "ingen") {
    for (const suffix of ["-krav-og-data.md", "-recon-kode.md", "-recon-research.md", "-recon-oplaeg.md"]) {
      if (existsSync(join(koordDir, `${aktivPakke}${suffix}`))) {
        leveranceStier.push(`docs/coordination/${aktivPakke}${suffix}`);
      }
    }
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
    // Type-inferens (V19 + runde 31): filnavns-mønster + markers
    const markersForSti = udtraekMarkers(tekst);
    const inferreretType = infererType(sti, markersForSti);
    leverancer.push({
      fil: sti,
      untracked: erUntracked,
      aendret: aendrede.includes(sti),
      type: inferreretType,
      // frossen version: artefaktets SHA vinder over bærerens (runde 10-fund 1)
      sha: erUntracked ? null : (artefaktSha(deklaration?.type) ?? filSha(sti, repoRod)),
      deklaration,
      markers: markersForSti,
    });
  }

  // Pr.-pakke kæde-issue (runde 31-fund 2): status-filens 'Kæde-issue: #N'
  // bærer pakkens gate-ord (krav OK-hash, slut OK, GODKENDT/AFVIST, stop);
  // stående issue (kaedeIssue) bærer qwers-åbninger. Begge læses.
  let pakkeIssue = null;
  if (aktivPakke !== "ingen") {
    const statusSti = join(koordDir, `${aktivPakke}-status.md`);
    if (existsSync(statusSti)) {
      pakkeIssue = readFileSync(statusSti, "utf8").match(/Kæde-issue:\s*#(\d+)/)?.[1] ?? null;
    }
  }

  // Gate-ord fra issues (author + kommentar-id følger med — verifikation i decide())
  const laesIssueOrd = (issueNr) => laesIssueOrdHelper(issueNr, repoRod);
  let gateOrd = [];
  if (fetch && pakkeIssue) gateOrd = gateOrd.concat(laesIssueOrd(pakkeIssue));
  if (fetch && kaedeIssue) gateOrd = gateOrd.concat(laesIssueOrd(kaedeIssue));

  // Events: afledte tilstande (V13/runde 21: qwers-afledning kører ALTID —
  // åbning sker netop ved aktiv-pakke: ingen; pakke-events kun m. aktiv pakke)
  const pakke = aktivPakke; // effektiv pakke: markør ELLER qwers-åbnings-anker (runde 34)
  const regler = reglerTidlig;
  const gateAuthor = regler.identiteter.gate_author;
  const mainSha = git(["rev-parse", "origin/main"], repoRod);

  // Recon-fakta (V8-kædestart): leverance-eksistens pr. konvention i regler.recon_filer
  const reconSti = (slags) => regler.recon_filer[slags].replace("<pakke>", pakke);
  // KUN committede recon-filer tæller (runde 31-fund 1: untracked må aldrig
  // drive næste led før frys) — filSha er null for aldrig-committede filer.
  const recon =
    pakke === "ingen"
      ? {}
      : {
          kode: !!filSha(reconSti("kode"), repoRod),
          research: !!filSha(reconSti("research"), repoRod),
          oplaeg: !!filSha(reconSti("oplaeg"), repoRod),
          kodeSha: filSha(reconSti("kode"), repoRod),
          oplaegSha: filSha(reconSti("oplaeg"), repoRod),
        };
  if (pakke !== "ingen") recon.klar = recon.kode && recon.research && recon.oplaeg;

  let events = afledEvents({
    pakke,
    paaMain:
      pakke === "ingen"
        ? {}
        : {
            kravDok: paaOriginMain(`docs/coordination/${pakke}-krav-og-data.md`, repoRod),
            planFil: paaOriginMain(`docs/coordination/${pakke}-plan.md`, repoRod),
            rapportFil: false, // glob-opslag nedenfor
          },
    buildPr: fetch && pakke !== "ingen" ? laesBuildPr(pakke, repoRod) : null,
    gateOrd,
    gateAuthor,
    mainSha,
    recon,
  });
  if (pakke !== "ingen") {
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

  // Betingelses-fakta (design pkt. 11, TILLÆG 3-skærpelsen): rå tilstande som
  // decide() evaluerer regler.betingelser imod. Kilde-disciplin: reviews/verdikter
  // bærer "Plan-SHA: <sha>"-header (codex-review.sh); fil-hash er git blob-hash.
  function nyesteLeveranceSha(typeNavn, markerKraevet) {
    const kandidater = leverancer.filter(
      (l) =>
        !l.untracked &&
        (l.deklaration?.type === typeNavn || l.type === typeNavn) &&
        (l.markers ?? []).includes(markerKraevet),
    );
    if (!kandidater.length) return null;
    const fil = kandidater.at(-1).fil;
    const m = readFileSync(join(repoRod, fil), "utf8").match(/Plan-SHA:\s*([0-9a-f]{7,40})/i);
    return m ? m[1] : null;
  }
  const kravFil = `docs/coordination/${pakke}-krav-og-data.md`;
  const betingelsesFakta =
    pakke === "ingen"
      ? {}
      : {
          planSha: filSha(`docs/coordination/${pakke}-plan.md`, repoRod),
          codexApprovalSha: nyesteLeveranceSha("review-approval", "APPROVAL"),
          troskabsPassSha: nyesteLeveranceSha("troskabs-verdikt", "PASS"),
          kravDokHash: existsSync(join(repoRod, kravFil)) ? git(["hash-object", kravFil], repoRod) : null,
          kravOkHash: events.find((e) => e.type === "krav-ok-hash-registreret")?.hash ?? null,
          claudeAiApproval: leverancer.some(
            (l) => !l.untracked && (l.markers ?? []).includes("APPROVAL") && /-claude-ai\.md$/.test(l.fil),
          ),
          slutOk: events.some((e) => e.type === "slut-ok-registreret"),
          reconKode: recon.kode ?? false,
          reconResearch: recon.research ?? false,
          aabneGates: aabneGates.length,
        };

  const divergens = findDivergens([
    {
      felt: `branch-sha (${branch})`,
      kilder: [
        { navn: "lokal", vaerdi: lokalSha },
        { navn: "origin", vaerdi: remoteSha ?? lokalSha }, // upushet branch er ikke uenighed
      ],
    },
  ]);

  return { branch, lokalSha, remoteSha, marker, leverancer, gateOrd, events, aabneGates, betingelsesFakta, divergens };
}
