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

// Læser fuld kæde-tilstand. `behandlede` (Set af "fil@sha") leveres af
// dirigentens dispatch-log så decide() forbliver ren og idempotent.
export function laesTilstand({ repoRod, kaedeIssue = null }) {
  git(["fetch", "--quiet"], repoRod);

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

  const leverancer = [];
  for (const dir of ["codex-reviews", "plan-feedback"]) {
    const fuldDir = join(koordDir, dir);
    if (!existsSync(fuldDir)) continue;
    for (const fil of readdirSync(fuldDir)) {
      if (!fil.endsWith(".md")) continue;
      const sti = `docs/coordination/${dir}/${fil}`;
      const tekst = readFileSync(join(repoRod, sti), "utf8");
      leverancer.push({
        fil: sti,
        untracked: untracked.includes(sti),
        deklaration: parseDeklaration(tekst),
        markers: udtraekMarkers(tekst),
      });
    }
  }

  // Gate-ord fra kæde-issue (author følger med — verifikation sker i decide())
  let gateOrd = [];
  if (kaedeIssue) {
    try {
      const raw = gh(
        ["issue", "view", String(kaedeIssue), "--json", "comments", "--jq", JSON.stringify(".comments[] | {author: .author.login, body: .body}")],
        repoRod,
      );
      gateOrd = raw
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l))
        .map((k) => ({ author: k.author, tekst: k.body.trim() }));
    } catch {
      gateOrd = []; // issue utilgængeligt → ingen gate-ord; kæden venter (fail-closed)
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

  return { branch, lokalSha, remoteSha, marker, leverancer, gateOrd, divergens };
}
