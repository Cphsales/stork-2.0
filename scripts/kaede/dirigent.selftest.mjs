// scripts/kaede/dirigent.selftest.mjs — negativ-/fixture-test for kuréren
// (gov-5, plan V7 step 3). Mønster: fitness.selftest.mjs / governance-check.selftest.mjs.
//
// Dækker decide() (ren kerne) + tilstand.mjs' rene parsere — UDEN git/gh.
// Kør: pnpm kaede:selftest

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { mkdtempSync } from "node:fs";
import { decide, behandletNoegler, udfoer, transportCommit } from "./dirigent.mjs";
import { parseDeklaration, udtraekMarkers, findDivergens, afledEvents, erBogfoeringsSti } from "./tilstand.mjs";

const REGLER = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "kaede-regler.json"), "utf8"));

let failed = 0;
function check(navn, betingelse, detalje = "") {
  if (betingelse) {
    console.log(`  ✓ ${navn}`);
  } else {
    failed++;
    console.error(`  ✗ ${navn}${detalje ? ` — ${detalje}` : ""}`);
  }
}

const TOM = { divergens: [], gateOrd: [], leverancer: [], marker: { pakke: "gov-6-arkiv-fold", fase: "build" } };

// ---------- 1. divergens-STOP (én sandhed) ----------
{
  const h = decide(
    {
      ...TOM,
      divergens: [{ felt: "branch-sha", kilder: [] }],
      leverancer: [{ fil: "x.md", deklaration: null, markers: [] }],
    },
    REGLER,
  );
  check(
    "divergens → KAEDE-STOP som ENESTE handling",
    h.length === 1 && h[0].handling === "KAEDE-STOP" && h[0].grund === "divergens",
  );
}

// ---------- 2. gate-ord author-verifikation ----------
{
  const h = decide({ ...TOM, gateOrd: [{ author: "anden-bruger", tekst: "qwerg" }] }, REGLER);
  check(
    "gate-ord fra forkert author → IGNORER + flag, intet andet",
    h.some((x) => x.handling === "IGNORER-GATE-ORD" && x.flag) && !h.some((x) => x.handling === "GATE-ORD-REGISTRERET"),
  );
}
{
  const h = decide({ ...TOM, gateOrd: [{ author: "mgrubak", tekst: "slut OK" }] }, REGLER);
  check(
    "gate-ord fra mgrubak → registreret",
    h.some((x) => x.handling === "GATE-ORD-REGISTRERET" && x.ord === "slut OK"),
  );
}
{
  const h = decide(
    {
      ...TOM,
      gateOrd: [{ author: "mgrubak", tekst: "stop" }],
      leverancer: [{ fil: "y.md", deklaration: { naeste: "codex", type: "plan-version" }, markers: [] }],
    },
    REGLER,
  );
  check(
    "Mathias-stop → KAEDE-PAUSE, ingen dispatch (suverænitet)",
    h.at(-1).handling === "KAEDE-PAUSE" && !h.some((x) => x.handling === "DISPATCH"),
  );
}

// ---------- 3. transport-commit før routing ----------
{
  const h = decide(
    {
      ...TOM,
      leverancer: [{ fil: "docs/coordination/codex-reviews/r.md", untracked: true, deklaration: null, markers: [] }],
    },
    REGLER,
  );
  check(
    "untracked leverance → TRANSPORT-COMMIT, ingen dispatch i samme cyklus",
    h.some((x) => x.handling === "TRANSPORT-COMMIT") && !h.some((x) => x.handling === "DISPATCH"),
  );
}
{
  const h = decide(
    {
      ...TOM,
      laase: [{ aktoer: "code", spor: "gov-6-arkiv-fold" }],
      leverancer: [{ fil: "docs/coordination/codex-reviews/r.md", untracked: true, deklaration: null, markers: [] }],
    },
    REGLER,
  );
  check(
    "untracked + aktiv kørsel på sporet → VENT, ALDRIG transport-commit (halvskrevet-værn, runde 15)",
    h.some((x) => x.handling === "VENT" && x.grund === "koersel-paa-spor") &&
      !h.some((x) => x.handling === "TRANSPORT-COMMIT"),
  );
}

// ---------- 4. routing pr. leverance-type (vækningsmodellen) ----------
const ROUTING_CASES = [
  ["plan-version", "codex"],
  ["build-batch", "codex"],
  ["slut-rapport", "claude-ai-rolle"],
  ["review-feedback", "code"],
  ["review-approval", "code"],
  ["sparring-oenske", "codex"],
  ["sparring-svar", "code"],
  ["kode-fund", "code"],
  ["optimering-forslag", "code"],
  ["loes-replik", "codex"],
  ["fund-gate-pakke", "mathias"],
];
for (const [type, forventet] of ROUTING_CASES) {
  const h = decide(
    { ...TOM, leverancer: [{ fil: `f-${type}.md`, sha: "abc123", deklaration: null, type, markers: [] }] },
    REGLER,
  );
  const d = h.find((x) => x.handling === "DISPATCH");
  check(`type '${type}' → ${forventet}`, d?.aktoer === forventet, JSON.stringify(h));
}

// ---------- 5. aktør-deklaration overrider modtager (vækningsret hos aktørerne) ----------
{
  const h = decide(
    {
      ...TOM,
      leverancer: [
        { fil: "f.md", sha: "s1", deklaration: { naeste: "claude-ai-rolle", type: "review-approval" }, markers: [] },
      ],
    },
    REGLER,
  );
  check(
    "→NÆSTE-deklaration overrider default-modtager",
    h.find((x) => x.handling === "DISPATCH")?.aktoer === "claude-ai-rolle",
  );
}

// ---------- 6. frossen version: SHA bindes i dispatch-kontekst ----------
{
  const h = decide(
    {
      ...TOM,
      leverancer: [
        { fil: "plan.md", sha: "f554220", deklaration: { naeste: "codex", type: "plan-version" }, markers: [] },
      ],
    },
    REGLER,
  );
  check(
    "dispatch binder leverance-SHA (verdikt på frossen version)",
    h.find((x) => x.handling === "DISPATCH")?.kontekst.sha === "f554220",
  );
}

// ---------- 7. idempotens: behandlede leverancer dispatches ikke igen ----------
{
  const lev = { fil: "plan.md", sha: "s2", deklaration: { naeste: "codex", type: "plan-version" }, markers: [] };
  const h = decide({ ...TOM, leverancer: [lev], behandlede: ["plan.md@s2"] }, REGLER);
  check("behandlet leverance → ingen ny dispatch (idempotens)", !h.some((x) => x.handling === "DISPATCH"));
}

// ---------- 8. lås pr. (aktør, spor): igangværende kørsel afbrydes aldrig ----------
{
  const h = decide(
    {
      ...TOM,
      laase: [{ aktoer: "codex", spor: "gov-6-arkiv-fold" }],
      leverancer: [{ fil: "V8.md", sha: "s3", deklaration: { naeste: "codex", type: "plan-version" }, markers: [] }],
    },
    REGLER,
  );
  check(
    "lås på (codex, spor) + ny plan-V → VENT, ikke dobbelt-kørsel",
    h.some((x) => x.handling === "VENT" && x.grund === "laas") && !h.some((x) => x.handling === "DISPATCH"),
  );
}

// ---------- 9. fund-gate-markers → Mathias-dispatch + spor-pause (runde 14) ----------
for (const marker of ["NEEDS-MATHIAS", "ESCALATE", "STOP-FOR-CLARIFICATION"]) {
  const h = decide(
    {
      ...TOM,
      leverancer: [
        { fil: "rev.md", sha: "s4", deklaration: { naeste: "code", type: "review-feedback" }, markers: [marker] },
        { fil: "anden.md", sha: "s4b", deklaration: { naeste: "codex", type: "plan-version" }, markers: [] },
      ],
      events: [{ type: "build-pr-merged", sha: "m4" }],
    },
    REGLER,
  );
  const d = h.filter((x) => x.handling === "DISPATCH");
  check(
    `${marker} → FUND-GATE + KUN mathias-dispatch; øvrige leverancer/events pauses`,
    h.some((x) => x.handling === "FUND-GATE") &&
      d.length === 1 &&
      d[0].aktoer === "mathias" &&
      d[0].opgave === "gate-anmodning",
  );
}
{
  const h = decide(
    {
      ...TOM,
      aabneGates: ["docs/coordination/mathias-gate/g.md"],
      leverancer: [{ fil: "f.md", sha: "s", deklaration: { naeste: "codex", type: "plan-version" }, markers: [] }],
      events: [{ type: "build-pr-merged", sha: "m" }],
    },
    REGLER,
  );
  check(
    "åben Mathias-gate → SPOR-PAUSET som eneste handling (pausen varer til afgørelse)",
    h.length === 1 && h[0].handling === "SPOR-PAUSET",
  );
}
{
  const h = decide(
    {
      ...TOM,
      leverancer: [
        { fil: "rev.md", sha: "s5", deklaration: { naeste: "code", type: "review-feedback" }, markers: ["KRITISK"] },
      ],
    },
    REGLER,
  );
  check(
    "KRITISK alene → normal feedback-routing (næste runde, ikke Mathias-gate)",
    h.find((x) => x.handling === "DISPATCH")?.aktoer === "code",
  );
}

// ---------- 10. fail-closed: ukendt type / modtager / event → KAEDE-STOP ----------
{
  const h = decide(
    { ...TOM, leverancer: [{ fil: "x.md", sha: "s6", deklaration: null, type: "ukendt-type", markers: [] }] },
    REGLER,
  );
  check(
    "ukendt leverance-type → KAEDE-STOP",
    h.at(-1).handling === "KAEDE-STOP" && h.at(-1).grund === "ukendt-leverance-type",
  );
}
{
  const h = decide(
    { ...TOM, leverancer: [{ fil: "gammel-fil.md", sha: "s9", deklaration: null, type: null, markers: [] }] },
    REGLER,
  );
  check(
    "committed fil uden deklaration/type → ARV-IGNORERET (pre-kæde, ingen STOP)",
    h.some((x) => x.handling === "ARV-IGNORERET") &&
      !h.some((x) => x.handling === "KAEDE-STOP" || x.handling === "DISPATCH"),
  );
}
{
  const h = decide(
    {
      ...TOM,
      leverancer: [
        { fil: "x.md", sha: "s7", deklaration: { naeste: "hacker-aktoer", type: "plan-version" }, markers: [] },
      ],
    },
    REGLER,
  );
  check(
    "ukendt modtager i deklaration → KAEDE-STOP (fail-closed)",
    h.at(-1).handling === "KAEDE-STOP" && h.at(-1).grund === "ukendt-modtager",
  );
}
{
  const h = decide({ ...TOM, events: [{ type: "ukendt-event" }] }, REGLER);
  check("ukendt event → KAEDE-STOP", h.at(-1).handling === "KAEDE-STOP" && h.at(-1).grund === "ukendt-event");
}

// ---------- 11. kalender-events: kædens væknings-punkter ----------
{
  const h = decide({ ...TOM, events: [{ type: "krav-dok-merged", sha: "m1" }] }, REGLER);
  const aktoerer = h.filter((x) => x.handling === "DISPATCH").map((x) => x.aktoer);
  check("krav-dok-merged → Code OG Codex parallelt (§2.1)", aktoerer.includes("code") && aktoerer.includes("codex"));
}
{
  const h = decide({ ...TOM, events: [{ type: "build-pr-merged", sha: "m2" }] }, REGLER);
  check("build-pr-merged → Code (slut-rapport)", h.find((x) => x.handling === "DISPATCH")?.opgave === "slut-rapport");
}
{
  const h = decide({ ...TOM, events: [{ type: "build-pr-klar-beslutningssti" }] }, REGLER);
  check(
    "build-PR m. beslutnings-sti → Mathias review-request",
    h.find((x) => x.handling === "DISPATCH")?.aktoer === "mathias",
  );
}
{
  const h = decide({ ...TOM, events: [{ type: "slut-ok-registreret" }] }, REGLER);
  check(
    "slut OK registreret → Code merger slut-rapport (ordet er gaten)",
    h.find((x) => x.handling === "DISPATCH")?.opgave === "slut-merge",
  );
}
{
  const h = decide({ ...TOM, events: [{ type: "qwers-aabning" }] }, REGLER);
  check(
    "qwers-åbning → kvittering (Step 0/1 er dialog — ingen aktør-vækning)",
    h.find((x) => x.handling === "DISPATCH")?.opgave === "kvittering",
  );
}

// ---------- 12. tom tilstand → INGEN ----------
{
  const h = decide(TOM, REGLER);
  check("tom tilstand → INGEN (kuréren finder ikke på arbejde)", h.length === 1 && h[0].handling === "INGEN");
}

// ---------- 13. parseDeklaration ----------
check(
  "deklaration m. type",
  JSON.stringify(parseDeklaration("indhold\n\n→NÆSTE: codex [plan-version]\n")) ===
    JSON.stringify({ naeste: "codex", type: "plan-version" }),
);
check(
  "deklaration u. type",
  JSON.stringify(parseDeklaration("x\n→NÆSTE: code")) === JSON.stringify({ naeste: "code", type: null }),
);
check("ingen deklaration → null", parseDeklaration("almindelig tekst\nuden deklaration") === null);
check("deklaration IKKE på sidste linje ignoreres", parseDeklaration("→NÆSTE: codex\nmere tekst bagefter") === null);
check(
  "ukendt aktør i deklaration → null (fail-closed i parser)",
  parseDeklaration("x\n→NÆSTE: hacker [plan-version]") === null,
);

// ---------- 14. udtraekMarkers ----------
check("APPROVAL findes", udtraekMarkers("APPROVAL — Runde 7\n").includes("APPROVAL"));
check("[KRITISK] bracket-form findes", udtraekMarkers("[KRITISK] Noget er galt\n").includes("KRITISK"));
check("KRITISKE matcher IKKE (G055)", !udtraekMarkers("KRITISKE forhold er fine\n").includes("KRITISK"));
check("NEEDS-MATHIAS findes", udtraekMarkers("NEEDS-MATHIAS: afgørelse kræves\n").includes("NEEDS-MATHIAS"));

// ---------- 15. findDivergens ----------
check(
  "enige kilder → ingen divergens",
  findDivergens([
    {
      felt: "sha",
      kilder: [
        { navn: "a", vaerdi: "x" },
        { navn: "b", vaerdi: "x" },
      ],
    },
  ]).length === 0,
);
check(
  "uenige kilder → divergens",
  findDivergens([
    {
      felt: "sha",
      kilder: [
        { navn: "a", vaerdi: "x" },
        { navn: "b", vaerdi: "y" },
      ],
    },
  ]).length === 1,
);

// ---------- 16. behandletNoegler (Codex B1-fund 1: kun succesfulde kørsler tæller) ----------
{
  const logLinjer = [
    JSON.stringify({ handling: "DISPATCH", kontekst: { fil: "a.md", sha: "s1" } }),
    JSON.stringify({ handling: "KOERSEL-SLUT", exit: 0, kontekst: { fil: "a.md", sha: "s1" } }),
    JSON.stringify({ handling: "DISPATCH", kontekst: { fil: "b.md", sha: "s2" } }),
    JSON.stringify({ handling: "KOERSEL-SLUT", exit: 1, kontekst: { fil: "b.md", sha: "s2" } }),
    JSON.stringify({
      handling: "KOERSEL-SLUT",
      exit: 0,
      aktoer: "code",
      kontekst: { event: "krav-dok-merged", sha: "m1" },
    }),
  ];
  const noegler = behandletNoegler(logLinjer);
  check("exit 0 → behandlet", noegler.includes("a.md@s1"));
  check("exit ≠ 0 → IKKE behandlet (fejlet kørsel droppes aldrig stille)", !noegler.includes("b.md@s2"));
  check("event-kørsel m. exit 0 → nøgle PR. AKTØR (runde 11)", noegler.includes("event:krav-dok-merged@m1#code"));
}

// ---------- 17. event-idempotens i decide — PR. MODTAGER (Codex runde 11) ----------
{
  const h = decide(
    {
      ...TOM,
      events: [{ type: "krav-dok-merged", sha: "m1" }],
      behandlede: ["event:krav-dok-merged@m1#code", "event:krav-dok-merged@m1#codex"],
    },
    REGLER,
  );
  check("begge modtagere behandlet → ingen ny dispatch", !h.some((x) => x.handling === "DISPATCH"));
}
{
  const h = decide(
    { ...TOM, events: [{ type: "krav-dok-merged", sha: "m1" }], behandlede: ["event:krav-dok-merged@m1#code"] },
    REGLER,
  );
  const d = h.filter((x) => x.handling === "DISPATCH");
  check(
    "én modtager behandlet (code OK, codex fejlede) → KUN codex re-dispatches",
    d.length === 1 && d[0].aktoer === "codex",
  );
}

// ---------- 18. afledEvents (ren event-afledning af rå tilstand) ----------
{
  const e = afledEvents({
    pakke: "gov-6-arkiv-fold",
    paaMain: { kravDok: true, planFil: false, rapportFil: false },
    buildPr: null,
    gateOrd: [],
    gateAuthor: "mgrubak",
    mainSha: "m",
  });
  check(
    "krav-dok på main + ingen plan → krav-dok-merged",
    e.some((x) => x.type === "krav-dok-merged"),
  );
}
{
  const e = afledEvents({
    pakke: "gov-6-arkiv-fold",
    paaMain: { kravDok: true, planFil: true, rapportFil: false },
    buildPr: { merged: true, mergeSha: "ms" },
    gateOrd: [],
    gateAuthor: "mgrubak",
    mainSha: "m",
  });
  check(
    "build-PR merged + ingen rapport → build-pr-merged",
    e.some((x) => x.type === "build-pr-merged") && !e.some((x) => x.type === "krav-dok-merged"),
  );
}
{
  const e = afledEvents({
    pakke: "p",
    paaMain: { kravDok: true, planFil: true },
    buildPr: { klar: true, beslutningsSti: true, headSha: "h" },
    gateOrd: [],
    gateAuthor: "mgrubak",
    mainSha: "m",
  });
  check(
    "build-PR klar m. beslutnings-sti → review-request-event",
    e.some((x) => x.type === "build-pr-klar-beslutningssti"),
  );
}
{
  const e = afledEvents({
    pakke: "p",
    paaMain: { kravDok: true, planFil: true },
    buildPr: null,
    gateOrd: [
      { id: "c1", author: "mgrubak", tekst: "slut OK" },
      { id: "c2", author: "anden", tekst: "slut OK" },
    ],
    gateAuthor: "mgrubak",
    mainSha: "m",
  });
  check(
    "slut OK fra mgrubak → event; fra anden author → IKKE (forsvar i dybden)",
    e.filter((x) => x.type === "slut-ok-registreret").length === 1 && e[0].sha === "c1",
  );
}
{
  const e = afledEvents({
    pakke: "ingen",
    paaMain: { kravDok: true, planFil: false },
    buildPr: null,
    gateOrd: [],
    gateAuthor: "mgrubak",
    mainSha: "m",
  });
  check("ingen aktiv pakke → ingen events", e.length === 0);
}

// ---------- 19. erBogfoeringsSti (de 7 P3-mønstre) ----------
check("aktiv-plan.md er bogføring", erBogfoeringsSti("docs/coordination/aktiv-plan.md"));
check("status-fil er bogføring", erBogfoeringsSti("docs/coordination/gov-6-arkiv-fold-status.md"));
check(
  "rapport-historik er bogføring",
  erBogfoeringsSti("docs/coordination/rapport-historik/2026-06-12-gov-5-automation.md"),
);
check(
  "krav-og-data er IKKE bogføring (kontrakt)",
  !erBogfoeringsSti("docs/coordination/gov-6-arkiv-fold-krav-og-data.md"),
);
check("scripts/kaede er IKKE bogføring (værn)", !erBogfoeringsSti("scripts/kaede/dirigent.mjs"));
check(
  "arkiv-plan er IKKE bogføring (anchored mønster)",
  !erBogfoeringsSti("docs/coordination/arkiv/gov-4-branch-protection-plan.md"),
);

// ---------- 19b. modificeret tracked bærer → AFVENTER-COMMIT (Codex runde 13) ----------
{
  const h = decide(
    {
      ...TOM,
      leverancer: [
        {
          fil: "docs/coordination/p-status.md",
          aendret: true,
          sha: "gammelSha",
          deklaration: { naeste: "codex", type: "plan-version" },
          markers: [],
        },
      ],
    },
    REGLER,
  );
  check(
    "modificeret tracked bærer → AFVENTER-COMMIT, ingen routing (stale frossen SHA) og ingen transport-commit",
    h.some((x) => x.handling === "AFVENTER-COMMIT") &&
      !h.some((x) => x.handling === "DISPATCH" || x.handling === "TRANSPORT-COMMIT"),
  );
}

// ---------- 20. parallel eksekvering (Codex runde 12: BEVIS, ikke kun beslutning) ----------
{
  const KAEDE = dirname(fileURLToPath(import.meta.url));
  const TMP = join(KAEDE, ".selftest-tmp");
  const LOG = join(KAEDE, ".dispatch-log.jsonl");
  const logBackup = existsSync(LOG) ? readFileSync(LOG, "utf8") : null;
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  const stub = (navn) =>
    writeFileSync(
      join(TMP, navn),
      `#!/bin/bash\ndate +%s%N > "${TMP}/${navn}-start"\nsleep 0.4\ndate +%s%N > "${TMP}/${navn}-slut"\n`,
    );
  stub("a.sh");
  stub("b.sh");
  writeFileSync(join(TMP, "fejl.sh"), "#!/bin/bash\nexit 7\n");

  const koerende = new Map();
  const dispatches = [
    {
      handling: "DISPATCH",
      aktoer: "code",
      opgave: "t",
      adapter: "scripts/kaede/.selftest-tmp/a.sh",
      kontekst: { fil: "a", sha: "s", spor: "test" },
    },
    {
      handling: "DISPATCH",
      aktoer: "codex",
      opgave: "t",
      adapter: "scripts/kaede/.selftest-tmp/b.sh",
      kontekst: { fil: "b", sha: "s", spor: "test" },
    },
  ];
  udfoer(dispatches, { koerende });
  check("to dispatches → to samtidige kørsler i registret", koerende.size === 2);
  await Promise.all([...koerende.values()].map((k) => k.faerdig));
  const t = (f) => BigInt(readFileSync(join(TMP, f), "utf8").trim());
  check("parallelitet BEVIST: b startede FØR a sluttede (overlap)", t("b.sh-start") < t("a.sh-slut"));
  check("kørende-register tømt efter afslutning", koerende.size === 0);

  let stoppet = false;
  udfoer(
    [
      {
        handling: "DISPATCH",
        aktoer: "code",
        opgave: "t",
        adapter: "scripts/kaede/.selftest-tmp/fejl.sh",
        kontekst: { fil: "c", sha: "s", spor: "test" },
      },
    ],
    { koerende, onStop: () => (stoppet = true) },
  );
  await Promise.all([...koerende.values()].map((k) => k.faerdig));
  check("adapter exit ≠ 0 → onStop kaldt (KAEDE-STOP, ingen stille videre)", stoppet);
  const logLinjer = readFileSync(LOG, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
  check(
    "fejlet kørsel logget m. exit 7 + KAEDE-STOP",
    logLinjer.some((p) => p.handling === "KOERSEL-SLUT" && p.exit === 7) &&
      logLinjer.some((p) => p.handling === "KAEDE-STOP" && p.grund === "adapter-fejl"),
  );

  rmSync(TMP, { recursive: true, force: true });
  if (logBackup === null) rmSync(LOG, { force: true });
  else writeFileSync(LOG, logBackup);
}

// ---------- 21. transport-commit-isolation (Codex runde 14: BEVIS i tmp-repo) ----------
{
  const repo = mkdtempSync(join(tmpdir(), "kaede-tc-"));
  const g = (...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
  g("init", "--quiet");
  g("config", "user.email", "selftest@kaede");
  g("config", "user.name", "kaede-selftest");
  writeFileSync(join(repo, "fremmed.md"), "v1");
  g("add", "fremmed.md");
  g("commit", "--quiet", "-m", "init");
  writeFileSync(join(repo, "fremmed.md"), "v2-staged-men-IKKE-kædens");
  g("add", "fremmed.md"); // fremmed ændring ligger staged i index
  writeFileSync(join(repo, "leverance.md"), "aktør-leverance");
  transportCommit("leverance.md", { cwd: repo, push: false });
  const sidsteCommitFiler = g("show", "--name-only", "--format=", "HEAD");
  check("transport-commit indeholder KUN leverancen", sidsteCommitFiler === "leverance.md");
  check(
    "fremmed staged ændring følger IKKE med (forbliver staged)",
    g("status", "--porcelain").includes("M  fremmed.md"),
  );
  rmSync(repo, { recursive: true, force: true });
}

// ---------- resultat ----------
if (failed) {
  console.error(`\nKæde-selftest FEJLEDE (${failed})`);
  process.exit(1);
}
console.log("\nKæde-selftest: alle cases passed");
