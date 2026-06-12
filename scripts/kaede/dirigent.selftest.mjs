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
import {
  decide,
  behandletNoegler,
  udfoer,
  transportCommit,
  selvtjekKoer,
  betingelseOpfyldt,
  syncFremad,
  stopFilSkriv,
  stopFilLaes,
} from "./dirigent.mjs";
import {
  parseDeklaration,
  udtraekMarkers,
  findDivergens,
  afledEvents,
  erBogfoeringsSti,
  infererType,
} from "./tilstand.mjs";

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
{
  // rette-til punkt 2: transport bindes til AFSENDER-adapterens exit 0 —
  // typens afsender (her codex for recon-research-doc) har aktiv kørsel på et
  // ANDET spor → stadig VENT (adapter-kontrakten: exit 0 = leverance klar;
  // fil-eksistens er aldrig bevis).
  const h = decide(
    {
      ...TOM,
      laase: [{ aktoer: "codex", spor: "andet-spor" }],
      leverancer: [
        {
          fil: "docs/coordination/gov-6-arkiv-fold-recon-research.md",
          untracked: true,
          type: "recon-research-doc",
          deklaration: null,
          markers: [],
        },
      ],
    },
    REGLER,
  );
  check(
    "untracked + AFSENDER-adapterens kørsel i gang (andet spor) → VENT, ingen transport (punkt 2: exit 0-binding)",
    h.some((x) => x.handling === "VENT" && x.grund === "afsender-koersel") &&
      !h.some((x) => x.handling === "TRANSPORT-COMMIT"),
  );
}
{
  // punkt 3-kontrakt (mekanisk tekst-tjek): codex.sh må ALDRIG streame direkte
  // til målfilen (filen findes ellers tom fra start — race-fundet 3c); output
  // går til tmp-fil og flyttes atomisk (mv) ved succes.
  const codexSh = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "adapters", "codex.sh"), "utf8");
  check(
    'codex.sh: ingen direkte stream til "$UD" + atomisk mv fra tmp (punkt 3)',
    !/>\s*"\$UD"/.test(codexSh) && /mv\s+"\$UD_TMP"\s+"\$UD"/.test(codexSh),
  );
}

// ---------- 4. routing pr. leverance-type (vækningsmodellen) ----------
const ROUTING_CASES = [
  ["plan-version", "codex"],
  ["build-batch", "codex"],
  ["slut-rapport", "claude-ai-rolle"],
  ["review-feedback", "code"],
  ["review-approval", "claude-ai-rolle"],
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
      aabneGates: ["docs/coordination/mathias-gate/g.md"],
      events: [{ type: "gate-godkendt", sha: "c9" }],
      leverancer: [{ fil: "f.md", sha: "s", deklaration: { naeste: "codex", type: "plan-version" }, markers: [] }],
    },
    REGLER,
  );
  check(
    "GODKENDT-afgørelse → GATE-AFGJORT uden Code-dispatch i SAMME cyklus (runde 3/4-KRITISK: afgørelsen skal fryses på main først)",
    h.some((x) => x.handling === "GATE-AFGJORT") &&
      !h.some((x) => x.handling === "DISPATCH") &&
      !h.some((x) => x.handling === "SPOR-PAUSET"),
  );
}
{
  // Efter merge + ff-synk er gaten lukket (fil bærer AFGJORT) — Code-dispatchen
  // kommer ad event-vejen (regelbogens gate-godkendt) i en SENERE cyklus.
  const h = decide({ ...TOM, aabneGates: [], events: [{ type: "gate-godkendt", sha: "c9" }] }, REGLER);
  check(
    "gate lukket (merged + ff-synket) + ubehandlet GODKENDT-event → Code-dispatch ad event-vejen",
    h.find((x) => x.handling === "DISPATCH")?.opgave === "gate-afgjort-fortsaet" &&
      h.find((x) => x.handling === "DISPATCH")?.aktoer === "code",
  );
}
{
  const h = decide(
    {
      ...TOM,
      aabneGates: ["docs/coordination/mathias-gate/g.md"],
      events: [{ type: "gate-godkendt", sha: "c9" }],
      behandlede: ["event:gate-godkendt@c9#code"],
    },
    REGLER,
  );
  check(
    "allerede behandlet afgørelse → SPOR-PAUSET igen (ingen dobbelt-genoptag)",
    h.at(-1).handling === "SPOR-PAUSET",
  );
}
{
  const e = afledEvents({
    pakke: "p",
    paaMain: { kravDok: true, planFil: true },
    buildPr: null,
    gateOrd: [
      { id: "c9", author: "mgrubak", tekst: "GODKENDT" },
      { id: "c10", author: "anden", tekst: "GODKENDT" },
    ],
    gateAuthor: "mgrubak",
    mainSha: "m",
  });
  check(
    "GODKENDT-ord fra mgrubak → gate-godkendt-event; fra anden author → intet",
    e.filter((x) => x.type === "gate-godkendt").length === 1 && e[0].sha === "c9",
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
  const fakta = { claudeAiApproval: true, slutOk: true };
  const h = decide({ ...TOM, betingelsesFakta: fakta, events: [{ type: "slut-ok-registreret", sha: "m" }] }, REGLER);
  check(
    "slut OK + Claude.ai-APPROVAL (betingelser opfyldt) → slut-merge dispatches",
    h.find((x) => x.handling === "DISPATCH")?.opgave === "slut-merge",
  );
  const h2 = decide(
    {
      ...TOM,
      betingelsesFakta: { slutOk: true, claudeAiApproval: false },
      events: [{ type: "slut-ok-registreret", sha: "m" }],
    },
    REGLER,
  );
  check(
    "slut OK UDEN Claude.ai-APPROVAL → BLOKERET (regelbogs-håndhævelse)",
    h2.some((x) => x.handling === "BLOKERET" && x.mangler.includes("claude-ai-approval-findes")),
  );
}
{
  const INGEN_PAKKE = { ...TOM, marker: { pakke: "ingen", fase: "plan" } };
  const h = decide(
    { ...INGEN_PAKKE, events: [{ type: "qwers-aabning", sha: "c1", pakke: "gov-6-arkiv-fold" }] },
    REGLER,
  );
  const d = h.filter((x) => x.handling === "DISPATCH");
  check(
    "qwers-åbning → kæden IGANGSÆTTES (V8/V13): Code + Codex recon-dispatches",
    d.length === 2 &&
      d.some((x) => x.opgave === "recon-kode" && x.aktoer === "code") &&
      d.some((x) => x.opgave === "recon-research" && x.aktoer === "codex"),
  );
  check(
    "spor-anker (V20): dispatch-kontekst bærer det qwers-bårne pakkenavn, ikke markørens 'ingen'",
    d.every((x) => x.kontekst.spor === "gov-6-arkiv-fold"),
  );
  const h2 = decide(
    {
      ...INGEN_PAKKE,
      laase: [{ aktoer: "code", spor: "gov-6-arkiv-fold" }],
      events: [{ type: "qwers-aabning", sha: "c1", pakke: "gov-6-arkiv-fold" }],
    },
    REGLER,
  );
  check(
    "lås på qwers-båret navn → VENT for den låste aktør (V21: eventSpor i lås-tjek)",
    h2.some((x) => x.handling === "VENT" && x.modtager === "code") &&
      h2.filter((x) => x.handling === "DISPATCH").every((x) => x.aktoer !== "code"),
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
    recon: { kode: true, research: true, oplaeg: true, klar: true },
  });
  check(
    "krav-dok på main + ingen plan + recon-fase afsluttet → krav-dok-merged (V9)",
    e.some((x) => x.type === "krav-dok-merged"),
  );
  const eUdenRecon = afledEvents({
    pakke: "gov-6-arkiv-fold",
    paaMain: { kravDok: true, planFil: false, rapportFil: false },
    buildPr: null,
    gateOrd: [],
    gateAuthor: "mgrubak",
    mainSha: "m",
    recon: { klar: false },
  });
  check(
    "krav-dok på main UDEN recon-klar → INGEN krav-dok-merged (runde 17-betingelsen)",
    !eUdenRecon.some((x) => x.type === "krav-dok-merged"),
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
    gateOrd: [
      { id: "c1", author: "mgrubak", tekst: "qwers gov-6-arkiv-fold" },
      { id: "c2", author: "anden", tekst: "qwers ond-pakke" },
    ],
    gateAuthor: "mgrubak",
    mainSha: "m",
  });
  check(
    "ingen aktiv pakke → KUN author-verificeret qwers afleder åbnings-event (V13)",
    e.length === 1 && e[0].type === "qwers-aabning" && e[0].pakke === "gov-6-arkiv-fold",
  );
}
{
  const e = afledEvents({
    pakke: "p",
    paaMain: { kravDok: false, planFil: false },
    buildPr: null,
    gateOrd: [{ id: "c9", author: "mgrubak", tekst: "krav OK abc1234" }],
    gateAuthor: "mgrubak",
    mainSha: "m",
    recon: {},
  });
  check(
    "'krav OK <hash>' → krav-ok-hash-registreret m. hash (V9 versions-binding)",
    e.some((x) => x.type === "krav-ok-hash-registreret" && x.hash === "abc1234"),
  );
}

// ---------- 19. erBogfoeringsSti (de 7 P3-mønstre) ----------
check("aktiv-plan.md er bogføring", erBogfoeringsSti("docs/coordination/aktiv-plan.md"));
check("status-fil er bogføring", erBogfoeringsSti("docs/coordination/gov-6-arkiv-fold-status.md"));
check(
  "rapport-historik er bogføring",
  erBogfoeringsSti("docs/coordination/rapport-historik/2026-06-12-gov-5-automation.md"),
);
check(
  "krav-og-data ER bogføring (V11: gated af krav OK-hash, ikke klik)",
  erBogfoeringsSti("docs/coordination/gov-6-arkiv-fold-krav-og-data.md"),
);
check("scripts/kaede er IKKE bogføring (værn)", !erBogfoeringsSti("scripts/kaede/dirigent.mjs"));
check(
  "arkiv ER bogføring (V11: efter slut OK)",
  erBogfoeringsSti("docs/coordination/arkiv/gov-4-branch-protection-plan.md"),
);

// rette-til punkt 1: de tre recon-mønstre er nu ejer-løs bogførings-flade
// (CODEOWNERS-PR'en) — helperen skal være sand mod CODEOWNERS (én sandhed).
check("recon-kode er bogføring (rette-til punkt 1)", erBogfoeringsSti("docs/coordination/gov-6-recon-kode.md"));
check(
  "recon-research er bogføring (rette-til punkt 1)",
  erBogfoeringsSti("docs/coordination/gov-6-recon-research.md"),
);
check("recon-oplaeg er bogføring (rette-til punkt 1)", erBogfoeringsSti("docs/coordination/gov-6-recon-oplaeg.md"));

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
  writeFileSync(
    join(TMP, "node-adapter.mjs"),
    `import { writeFileSync } from "node:fs";\nwriteFileSync("${TMP}/mjs-koerte", "ok");\n`,
  );

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
    { koerende, onStop: () => (stoppet = true), stopDir: TMP },
  );
  await Promise.all([...koerende.values()].map((k) => k.faerdig));
  check("adapter exit ≠ 0 → onStop kaldt (KAEDE-STOP, ingen stille videre)", stoppet);
  // .mjs-adapter dispatches via node (Codex runde 35: mathias.mjs er ESM)
  udfoer(
    [
      {
        handling: "DISPATCH",
        aktoer: "mathias",
        opgave: "t",
        adapter: "scripts/kaede/.selftest-tmp/node-adapter.mjs",
        kontekst: { fil: "m", sha: "s", spor: "test" },
      },
    ],
    { koerende },
  );
  await Promise.all([...koerende.values()].map((k) => k.faerdig));
  check(".mjs-adapter eksekveres via node, ikke bash (runde 35)", existsSync(join(TMP, "mjs-koerte")));
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

// ---------- 21. transport→PR-vej (rette-til punkt 1, GH006: aldrig direkte main-push) ----------
// Erstatter den gamle direkte-commit-test; runde 14-garantien (fremmed staged
// ændring følger ALDRIG med) bevares som eksplicit case i den nye vej.
function nytTestRepoMedOrigin() {
  const base = mkdtempSync(join(tmpdir(), "kaede-pr-"));
  const origin = join(base, "origin.git");
  const repo = join(base, "repo");
  execFileSync("git", ["init", "--bare", "--quiet", "-b", "main", origin]);
  execFileSync("git", ["clone", "--quiet", origin, repo]);
  const g = (...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
  g("config", "user.email", "selftest@kaede");
  g("config", "user.name", "kaede-selftest");
  writeFileSync(join(repo, "README.md"), "init");
  g("add", "README.md");
  g("commit", "--quiet", "-m", "init");
  g("push", "--quiet", "-u", "origin", "main");
  const o = (...args) => execFileSync("git", args, { cwd: origin, encoding: "utf8" }).trim();
  return { base, origin, repo, g, o };
}
{
  const { base, repo, g, o } = nytTestRepoMedOrigin();
  // fremmed staged ændring i hoved-checkoutet (runde 14-bevarelsen)
  writeFileSync(join(repo, "README.md"), "v2-staged-men-IKKE-kædens");
  g("add", "README.md");
  // untracked aktør-leverance
  mkdirSync(join(repo, "docs/coordination/codex-reviews"), { recursive: true });
  const fil = "docs/coordination/codex-reviews/r.md";
  writeFileSync(join(repo, fil), "aktør-leverance");
  const ghKald = [];
  // fakeGh m. styrbar PR-tilstand (Codex runde 1-fund 1): 'pr view' svarer med
  // prTilstand; null = ingen PR for grenen (gh fejler).
  const ghSvar = { prTilstand: null };
  const fakeGh = (args) => {
    ghKald.push(args.join(" "));
    if (args[0] === "pr" && args[1] === "view") {
      if (!ghSvar.prTilstand) throw new Error("no pull requests found");
      return JSON.stringify(ghSvar.prTilstand);
    }
    return "";
  };
  const mainFoer = o("rev-parse", "main");
  const lokalHeadFoer = g("rev-parse", "HEAD");
  const res = transportCommit(fil, { cwd: repo, gh: fakeGh });
  check("transport-vej: origin/main URØRT (aldrig direkte main-push, GH006)", o("rev-parse", "main") === mainFoer);
  check(
    "transport-vej: leverancen pushet til kaede/transport/-gren på origin",
    res.status === "pr-oprettet" &&
      res.gren.startsWith("kaede/transport/") &&
      o("rev-parse", `refs/heads/${res.gren}`).length === 40,
  );
  check(
    "transport-vej: transport-committen indeholder PRÆCIS én fil (leverancen)",
    o("show", "--name-only", "--format=", `refs/heads/${res.gren}`) === fil,
  );
  check(
    "transport-vej: gh pr create + gh pr merge --auto --rebase (bogførings-sti-mønstret, #130/#132)",
    ghKald.some((k) => k.startsWith("pr create")) &&
      ghKald.some((k) => k.startsWith("pr merge") && k.includes("--auto") && k.includes("--rebase")),
  );
  check(
    "transport-vej: lokal main + index urørt — ingen lokal commit; fremmed staged ændring består (runde 14)",
    g("rev-parse", "HEAD") === lokalHeadFoer &&
      g("status", "--porcelain", "--untracked-files=all").includes("M  README.md") &&
      g("status", "--porcelain", "--untracked-files=all").includes(`?? ${fil}`),
  );
  // Codex runde 1-fund 1: 'gren findes' er IKKE bevis for PR + auto-merge —
  // afventer-merge må kun returneres når PR-tilstanden er BEVIST.
  ghSvar.prTilstand = { state: "OPEN", autoMergeRequest: { enabledAt: "2026-06-12" } };
  const kaldFoer = ghKald.length;
  const res2 = transportCommit(fil, { cwd: repo, gh: fakeGh });
  check(
    "transport-vej: gren + ÅBEN PR m. armeret auto-merge → afventer-merge, INGEN dublet-PR (idempotens)",
    res2.status === "afventer-merge" && !ghKald.slice(kaldFoer).some((k) => k.startsWith("pr create")),
  );
  ghSvar.prTilstand = { state: "OPEN", autoMergeRequest: null };
  const res3 = transportCommit(fil, { cwd: repo, gh: fakeGh });
  check(
    "transport-vej: gren + åben PR UDEN auto-merge → re-armering (pr merge --auto --rebase), ingen ny PR",
    res3.status === "afventer-merge" &&
      ghKald.at(-1).startsWith("pr merge") &&
      ghKald.at(-1).includes("--auto") &&
      !ghKald.slice(kaldFoer).some((k) => k.startsWith("pr create")),
  );
  ghSvar.prTilstand = null;
  const res4 = transportCommit(fil, { cwd: repo, gh: fakeGh });
  check(
    "transport-vej: gren UDEN PR (create fejlede tidligere) → PR oprettes + armeres igen (recovery)",
    res4.status === "pr-oprettet" &&
      ghKald.slice(kaldFoer).some((k) => k.startsWith("pr create")) &&
      ghKald.at(-1).startsWith("pr merge"),
  );
  ghSvar.prTilstand = { state: "CLOSED", autoMergeRequest: null };
  const res5 = transportCommit(fil, { cwd: repo, gh: fakeGh });
  check(
    "transport-vej: gren + LUKKET u-merged PR → transport-fejl (fail-closed, aldrig stille afventer)",
    res5.status === "transport-fejl",
  );
  rmSync(base, { recursive: true, force: true });
}

// ---------- 21c. udfoer: transport-fejl → KAEDE-STOP (Codex runde 1-fund 1) ----------
{
  const KAEDE = dirname(fileURLToPath(import.meta.url));
  const LOG = join(KAEDE, ".dispatch-log.jsonl");
  const logBackup = existsSync(LOG) ? readFileSync(LOG, "utf8") : null;
  const TMP_STOP = mkdtempSync(join(tmpdir(), "kaede-stop-"));
  const res = udfoer([{ handling: "TRANSPORT-COMMIT", fil: "x.md", selvtjek: [], afsender: "codex", spor: "p" }], {
    transportFn: () => ({ status: "transport-fejl", gren: "kaede/transport/x", grund: "PR CLOSED uden merge" }),
    stopDir: TMP_STOP,
  });
  const logLinjer = readFileSync(LOG, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
  check(
    "udfoer: transport-fejl → KAEDE-STOP logget + stoppet (ingen stille videre)",
    res.stoppet === true &&
      logLinjer.some((p) => p.handling === "KAEDE-STOP" && p.grund === "transport-fejl"),
  );
  check(
    "udfoer: transport-fejl skriver stop-filen (persistent, punkt 11a)",
    stopFilLaes({ dir: TMP_STOP })?.grund === "transport-fejl",
  );
  rmSync(TMP_STOP, { recursive: true, force: true });
  if (logBackup === null) rmSync(LOG, { force: true });
  else writeFileSync(LOG, logBackup);
}

// ---------- 21b. syncFremad (PR-vejens konvergens: bagud-stilling er ikke divergens) ----------
{
  const { base, origin, repo, g } = nytTestRepoMedOrigin();
  // simulér merged transport-PR på origin/main via en anden klon
  const klon2 = join(base, "klon2");
  execFileSync("git", ["clone", "--quiet", origin, klon2]);
  const g2 = (...args) => execFileSync("git", args, { cwd: klon2, encoding: "utf8" }).trim();
  g2("config", "user.email", "selftest@kaede");
  g2("config", "user.name", "kaede-selftest");
  mkdirSync(join(klon2, "docs/coordination"), { recursive: true });
  writeFileSync(join(klon2, "docs/coordination/p-recon-kode.md"), "frossen leverance");
  g2("add", "docs/coordination/p-recon-kode.md");
  g2("commit", "--quiet", "-m", "kæde-transport: p-recon-kode.md");
  g2("push", "--quiet", "origin", "main");
  // lokal: samme leverance ligger stadig untracked (identisk indhold)
  mkdirSync(join(repo, "docs/coordination"), { recursive: true });
  writeFileSync(join(repo, "docs/coordination/p-recon-kode.md"), "frossen leverance");
  const res = syncFremad({ cwd: repo });
  check(
    "syncFremad: rent bagud → ff-synk; identisk untracked kopi afløst af den frosne (rent træ)",
    res.synket === true &&
      g("rev-parse", "HEAD") === g("rev-parse", "origin/main") &&
      g("status", "--porcelain") === "",
  );
  // ægte divergens: lokal-egen commit → INGEN synk (fail-closed; divergens-tjek STOPper)
  writeFileSync(join(repo, "lokal.md"), "lokal-egen");
  g("add", "lokal.md");
  g("commit", "--quiet", "-m", "lokal-egen commit");
  const headFoer = g("rev-parse", "HEAD");
  writeFileSync(join(klon2, "ny.md"), "origin går videre");
  g2("add", "ny.md");
  g2("commit", "--quiet", "-m", "origin videre");
  g2("push", "--quiet", "origin", "main");
  const res2 = syncFremad({ cwd: repo });
  check(
    "syncFremad: ægte divergens (lokal-egen commit) → INGEN synk, HEAD urørt (fail-closed)",
    res2.synket === false && res2.grund === "divergens" && g("rev-parse", "HEAD") === headFoer,
  );
  rmSync(base, { recursive: true, force: true });
}

// ---------- 21d. GATE-AFGJORT: transport-fejl → KAEDE-STOP, ingen Code-dispatch (Codex runde 2) ----------
{
  const KAEDE = dirname(fileURLToPath(import.meta.url));
  const LOG = join(KAEDE, ".dispatch-log.jsonl");
  const logBackup = existsSync(LOG) ? readFileSync(LOG, "utf8") : null;
  const TMP = join(KAEDE, ".selftest-tmp");
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  const gateFil = "scripts/kaede/.selftest-tmp/gate.md";
  const gateFuldSti = join(KAEDE, "..", "..", gateFil);
  writeFileSync(gateFuldSti, "Status: AFVENTER MATHIAS\n");
  writeFileSync(join(TMP, "adapter.sh"), `#!/bin/bash\ntouch "${TMP}/dispatch-koerte"\n`);
  const res = udfoer(
    [
      { handling: "GATE-AFGJORT", afgoerelse: "gate-godkendt", gates: [gateFil], sha: "c9" },
      {
        handling: "DISPATCH",
        aktoer: "code",
        opgave: "gate-afgjort-fortsaet",
        adapter: "scripts/kaede/.selftest-tmp/adapter.sh",
        kontekst: { event: "gate-godkendt", sha: "c9", spor: "p" },
      },
    ],
    {
      transportFn: () => ({ status: "transport-fejl", gren: "kaede/transport/gate", grund: "PR CLOSED uden merge" }),
      stopDir: TMP,
    },
  );
  const logLinjer = readFileSync(LOG, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
  check(
    "GATE-AFGJORT m. transport-fejl → KAEDE-STOP + INGEN efterfølgende Code-dispatch (gate-sporet er fail-closed)",
    res.stoppet === true &&
      logLinjer.some((p) => p.handling === "KAEDE-STOP" && p.grund === "transport-fejl") &&
      !existsSync(join(TMP, "dispatch-koerte")),
  );
  check(
    "GATE-AFGJORT: lokal gate-fil rullet tilbage til AFVENTER MATHIAS også ved transport-fejl (pausesporet består)",
    readFileSync(gateFuldSti, "utf8").includes("AFVENTER MATHIAS"),
  );
  rmSync(TMP, { recursive: true, force: true });
  if (logBackup === null) rmSync(LOG, { force: true });
  else writeFileSync(LOG, logBackup);
}

// ---------- 21e. GATE-AFGJORT pending PR: lokal rollback + ingen dispatch (Codex runde 3/4-KRITISK) ----------
{
  const KAEDE = dirname(fileURLToPath(import.meta.url));
  const LOG = join(KAEDE, ".dispatch-log.jsonl");
  const logBackup = existsSync(LOG) ? readFileSync(LOG, "utf8") : null;
  const TMP = join(KAEDE, ".selftest-tmp");
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  const gateFil = "scripts/kaede/.selftest-tmp/gate.md";
  const gateFuldSti = join(KAEDE, "..", "..", gateFil);
  writeFileSync(gateFuldSti, "Status: AFVENTER MATHIAS\n");
  let transporteretIndhold = null;
  const res = udfoer([{ handling: "GATE-AFGJORT", afgoerelse: "gate-godkendt", gates: [gateFil], sha: "c9" }], {
    transportFn: (fil) => {
      transporteretIndhold = readFileSync(join(KAEDE, "..", "..", fil), "utf8");
      return { status: "pr-oprettet", gren: "kaede/transport/gate-x" };
    },
    stopDir: TMP,
  });
  check(
    "GATE-AFGJORT m. pending PR: AFGJORT-indhold transporteres, men lokal fil bevarer AFVENTER MATHIAS indtil merge+ff-synk",
    res.stoppet === false &&
      transporteretIndhold?.includes("AFGJORT: GODKENDT") &&
      readFileSync(gateFuldSti, "utf8").includes("AFVENTER MATHIAS"),
  );
  rmSync(TMP, { recursive: true, force: true });
  if (logBackup === null) rmSync(LOG, { force: true });
  else writeFileSync(LOG, logBackup);
}

// ---------- 22. regelbogs-håndhævelse: betingelser → BLOKERET (V8-V21) ----------
{
  const lev = { fil: "v.md", sha: "s", deklaration: null, type: "troskabs-verdikt", markers: ["PASS"] };
  const h1 = decide({ ...TOM, leverancer: [lev], betingelsesFakta: {} }, REGLER);
  check(
    "troskabs-PASS uden Codex-APPROVAL@plan-SHA → BLOKERET, ingen build-dispatch",
    h1.some((x) => x.handling === "BLOKERET" && x.opgave === "build-start") &&
      !h1.some((x) => x.handling === "DISPATCH"),
  );
  const faktaOk = { codexApprovalSha: "abc1234", troskabsPassSha: "abc1234", planSha: "abc1234def", aabneGates: 0 };
  const h2 = decide({ ...TOM, leverancer: [lev], betingelsesFakta: faktaOk }, REGLER);
  check(
    "troskabs-PASS m. alle build-betingelser (SHA-match, prefix-tolerant) → build-start dispatches",
    h2.find((x) => x.handling === "DISPATCH")?.opgave === "build-start" &&
      h2.find((x) => x.handling === "DISPATCH")?.aktoer === "code",
  );
  const faktaForkertSha = { ...faktaOk, troskabsPassSha: "fff9999" };
  const h3 = decide({ ...TOM, leverancer: [lev], betingelsesFakta: faktaForkertSha }, REGLER);
  check(
    "PASS bundet til FORKERT plan-SHA → BLOKERET (mekaniseret diff-tom-tjek)",
    h3.some((x) => x.handling === "BLOKERET" && x.mangler.includes("troskabs-pass-paa-aktuel-plan-sha")),
  );
  const hFeedback = decide({ ...TOM, leverancer: [{ ...lev, markers: ["FEEDBACK"] }] }, REGLER);
  check(
    "troskabs-FEEDBACK → Code næste version (marker-routing)",
    hFeedback.find((x) => x.handling === "DISPATCH")?.opgave === "naeste-version",
  );
  const hUkendt = decide({ ...TOM, leverancer: [{ ...lev, markers: [] }] }, REGLER);
  check(
    "troskabs-verdikt uden PASS/FEEDBACK-marker → KAEDE-STOP (fail-closed)",
    hUkendt.at(-1).handling === "KAEDE-STOP" && hUkendt.at(-1).grund === "ukendt-verdikt-marker",
  );
}
{
  const h = decide(
    {
      ...TOM,
      betingelsesFakta: { kravOkHash: "aaa1111", kravDokHash: "bbb2222" },
      events: [{ type: "krav-ok-hash-registreret", sha: "c1", hash: "aaa1111" }],
    },
    REGLER,
  );
  check(
    "krav OK-hash ≠ fil-hash → krav-dok-merge BLOKERET (versions-bindingen)",
    h.some((x) => x.handling === "BLOKERET" && x.mangler.includes("krav-ok-hash-matcher-fil-hash")),
  );
  const h2 = decide(
    {
      ...TOM,
      betingelsesFakta: { kravOkHash: "aaa1111", kravDokHash: "aaa1111" },
      events: [{ type: "krav-ok-hash-registreret", sha: "c1", hash: "aaa1111" }],
    },
    REGLER,
  );
  check(
    "krav OK-hash == fil-hash → krav-dok-merge dispatches (kæden merger det validerede)",
    h2.find((x) => x.handling === "DISPATCH")?.opgave === "krav-dok-merge",
  );
}
{
  const h = decide(
    {
      ...TOM,
      betingelsesFakta: { reconKode: true, reconResearch: false },
      events: [{ type: "recon-kode-klar", sha: "r1" }],
    },
    REGLER,
  );
  check(
    "recon-syntese uden begge kode-docs → BLOKERET",
    h.some((x) => x.handling === "BLOKERET" && x.opgave === "recon-syntese"),
  );
}

// ---------- 23. krav-dok-udkast to-cyklus-flow (V19/V21) ----------
{
  const untracked = {
    fil: "docs/coordination/p-krav-og-data.md",
    untracked: true,
    type: "krav-dok-udkast",
    deklaration: null,
    markers: [],
  };
  const h1 = decide({ ...TOM, leverancer: [untracked] }, REGLER);
  const tc = h1.find((x) => x.handling === "TRANSPORT-COMMIT");
  check("untracked krav-dok-udkast → TRANSPORT-COMMIT m. afsender 'dialog'", tc?.afsender === "dialog");
  const committed = {
    fil: "docs/coordination/p-krav-og-data.md",
    untracked: false,
    sha: "k1",
    type: "krav-dok-udkast",
    deklaration: null,
    markers: [],
  };
  const h2 = decide({ ...TOM, leverancer: [committed] }, REGLER);
  check(
    "committed krav-dok-udkast → DISPATCH mathias/hash-post (næste cyklus)",
    h2.find((x) => x.handling === "DISPATCH")?.opgave === "hash-post" &&
      h2.find((x) => x.handling === "DISPATCH")?.aktoer === "mathias",
  );
}

// ---------- 24. REGISTRERET: modtager-løse recon-typer (V21) ----------
{
  const h = decide(
    {
      ...TOM,
      leverancer: [
        {
          fil: "docs/coordination/p-recon-kode.md",
          untracked: false,
          sha: "r1",
          type: "recon-kode-doc",
          deklaration: null,
          markers: [],
        },
      ],
    },
    REGLER,
  );
  check(
    "recon-doc (modtager null) → REGISTRERET, ingen dispatch (events bærer videre vej)",
    h.some((x) => x.handling === "REGISTRERET") && !h.some((x) => x.handling === "DISPATCH"),
  );
  const noegler = behandletNoegler([
    JSON.stringify({ handling: "REGISTRERET", kontekst: { fil: "docs/coordination/p-recon-kode.md", sha: "r1" } }),
  ]);
  check(
    "REGISTRERET tæller som behandlet (idempotens uden kørsel)",
    noegler.includes("docs/coordination/p-recon-kode.md@r1"),
  );
}

// ---------- 25. selvtjek-motoren (design pkt. 12 — de tre målte klasser) ----------
{
  const TMP2 = join(dirname(fileURLToPath(import.meta.url)), ".selftest-tmp");
  rmSync(TMP2, { recursive: true, force: true });
  mkdirSync(join(TMP2, "docs/coordination"), { recursive: true });
  const rod = TMP2;
  writeFileSync(join(rod, "docs/coordination/p-status.md"), "# status\nKonvergens-counter: 7\n");
  writeFileSync(join(rod, "docs/coordination/p-plan.md"), "**Plan-version:** V9 · konvergens-counter: 9\n");
  const r1 = selvtjekKoer([{ tjek: "counter-sync" }], "docs/coordination/p-status.md", { repoRod: rod });
  check("counter-sync: status 7 ≠ plan 9 → FEJL (runde 18b-klassen fanges)", !r1.ok);
  writeFileSync(join(rod, "docs/coordination/p-status.md"), "# status\nKonvergens-counter: 9\n");
  const r2 = selvtjekKoer([{ tjek: "counter-sync" }], "docs/coordination/p-status.md", { repoRod: rod });
  check("counter-sync: 9 == 9 → OK", r2.ok);
  writeFileSync(join(rod, "kilde.txt"), "linje1\nlinje2\nlinje3\n");
  writeFileSync(join(rod, "lev.md"), "Løfte:\n\nKILDE: kilde.txt:1-2\n\n```\nlinje1\nlinje2\n```\n");
  check("ordret-diff: korrekt citat → OK", selvtjekKoer([{ tjek: "ordret-diff" }], "lev.md", { repoRod: rod }).ok);
  writeFileSync(join(rod, "lev2.md"), "Løfte:\n\nKILDE: kilde.txt:1-2\n\n```\nlinje1\nFORKERT\n```\n");
  check(
    "ordret-diff: afvigende citat → FEJL (runde 18a-klassen fanges)",
    !selvtjekKoer([{ tjek: "ordret-diff" }], "lev2.md", { repoRod: rod }).ok,
  );
  writeFileSync(join(rod, "lev3.md"), "tabellen siger afventer\n");
  check(
    "konsistens-grep: forbudt mønster → FEJL",
    !selvtjekKoer([{ tjek: "konsistens-grep", forbudt: "afventer" }], "lev3.md", { repoRod: rod }).ok,
  );
  check(
    "ukendt selvtjek-type → FEJL (fail-closed)",
    !selvtjekKoer([{ tjek: "magisk-tjek" }], "lev3.md", { repoRod: rod }).ok,
  );
  rmSync(TMP2, { recursive: true, force: true });
}

// ---------- 26. betingelseOpfyldt: fail-closed ----------
check("ukendt betingelse → aldrig opfyldt (fail-closed)", !betingelseOpfyldt("fantasi-betingelse", {}));
check("ingen-aabne-gates: udefineret fakta → IKKE opfyldt (fail-closed)", !betingelseOpfyldt("ingen-aabne-gates", {}));

// ---------- 27. type-inferens (runde 31-fund 3) ----------
check("recon-kode-fil → recon-kode-doc", infererType("docs/coordination/p-recon-kode.md") === "recon-kode-doc");
check(
  "recon-research-fil → recon-research-doc",
  infererType("docs/coordination/p-recon-research.md") === "recon-research-doc",
);
check("recon-oplaeg-fil → recon-oplaeg", infererType("docs/coordination/p-recon-oplaeg.md") === "recon-oplaeg");
check("krav-og-data → krav-dok-udkast", infererType("docs/coordination/p-krav-og-data.md") === "krav-dok-udkast");
check(
  "codex-review m. APPROVAL → review-approval",
  infererType("docs/coordination/codex-reviews/2026-06-12-p-runde-1.md", ["APPROVAL"]) === "review-approval",
);
check(
  "codex-review m. fund → review-feedback",
  infererType("docs/coordination/codex-reviews/2026-06-12-p-runde-1.md", ["KRITISK"]) === "review-feedback",
);
check(
  "troskab-fil → troskabs-verdikt",
  infererType("docs/coordination/codex-reviews/2026-06-12-p-troskab-1.md", ["PASS"]) === "troskabs-verdikt",
);
check(
  "claude-ai-review → null (bæres af betingelsesFakta, ikke routing)",
  infererType("docs/coordination/codex-reviews/2026-06-12-p-runde-2-claude-ai.md", ["APPROVAL"]) === null,
);
check("ukendt fil → null (ARV-vejen)", infererType("docs/coordination/et-eller-andet.md") === null);

// ---------- 28. inferreret review-approval routes til troskabs-tjek (runde 31 end-to-end) ----------
{
  const h = decide(
    {
      ...TOM,
      leverancer: [
        {
          fil: "docs/coordination/codex-reviews/2026-06-12-p-runde-9.md",
          untracked: false,
          sha: "r9",
          type: "review-approval",
          deklaration: null,
          markers: ["APPROVAL"],
        },
      ],
    },
    REGLER,
  );
  check(
    "inferreret APPROVAL-review → DISPATCH claude-ai-rolle/krav-troskabs-tjek (fangst-laget vækkes)",
    h.find((x) => x.handling === "DISPATCH")?.opgave === "krav-troskabs-tjek",
  );
}

// ---------- 29. recon-events bærer pakken (runde 34: spor-anker hele vejen) ----------
{
  const e = afledEvents({
    pakke: "gov-6-arkiv-fold",
    paaMain: { kravDok: false, planFil: false },
    buildPr: null,
    gateOrd: [],
    gateAuthor: "mgrubak",
    mainSha: "m",
    recon: { kode: true, research: true, oplaeg: false, kodeSha: "rk" },
  });
  check(
    "recon-kode-klar bærer pakke-feltet (eventSpor-anker)",
    e.find((x) => x.type === "recon-kode-klar")?.pakke === "gov-6-arkiv-fold",
  );
}

// ---------- 30. spor-anker på transport-vejen (rette-til punkt 4) ----------
// Rodårsag (KAEDE-STOP 2026-06-11): laesTilstand beregnede qwers-ankeret
// (aktivPakke) men returnerede det ikke — decide() faldt tilbage til markørens
// "ingen", så transport-commit løb m. spor "ingen" og (aktør, spor)-låsen
// matchede aldrig transport-værnet.
{
  const AABNING = { ...TOM, marker: { pakke: "ingen", fase: "plan" }, pakke: "gov-6" };
  const h = decide(
    {
      ...AABNING,
      leverancer: [{ fil: "docs/coordination/gov-6-recon-kode.md", untracked: true, deklaration: null, markers: [] }],
    },
    REGLER,
  );
  check(
    "tilstand.pakke (qwers-anker) vinder over markørens 'ingen': transport-commit bærer spor 'gov-6'",
    h.find((x) => x.handling === "TRANSPORT-COMMIT")?.spor === "gov-6",
  );
  const h2 = decide(
    {
      ...AABNING,
      laase: [{ aktoer: "code", spor: "gov-6" }],
      leverancer: [{ fil: "docs/coordination/gov-6-recon-kode.md", untracked: true, deklaration: null, markers: [] }],
    },
    REGLER,
  );
  check(
    "lås på qwers-båret spor matcher nu transport-værnet → VENT (racen fra 2026-06-11 lukket)",
    h2.some((x) => x.handling === "VENT" && x.grund === "koersel-paa-spor") &&
      !h2.some((x) => x.handling === "TRANSPORT-COMMIT"),
  );
}
{
  // laesTilstand SKAL returnere pakke-feltet (integrations-tjek på det rigtige
  // repo, offline): markøren er "ingen" og fetch=false → pakke === "ingen".
  const { laesTilstand } = await import("./tilstand.mjs");
  const t = laesTilstand({ repoRod: join(dirname(fileURLToPath(import.meta.url)), "..", ".."), fetch: false });
  check("laesTilstand returnerer 'pakke'-feltet (spor-ankeret eksporteres)", "pakke" in t);
}

// ---------- 31. spor 'ingen'-dispatch-værn (rette-til punkt 11b) ----------
// Replay af stale-floden 2026-06-11 22:32Z: gamle committede review-filer +
// aktiv-pakke "ingen" → kuréren dispatchede naeste-version/krav-troskabs-tjek
// m. spor "ingen". Pakke-bundne opgaver dispatches ALDRIG uden pakke.
{
  const INGEN = { ...TOM, marker: { pakke: "ingen", fase: "plan" } };
  const h = decide(
    {
      ...INGEN,
      leverancer: [
        {
          fil: "docs/coordination/codex-reviews/2026-06-11-disciplin-runde-21.md",
          untracked: false,
          sha: "267aa91",
          type: "review-feedback",
          deklaration: null,
          markers: ["KRITISK"],
        },
      ],
    },
    REGLER,
  );
  check(
    "committed leverance + spor 'ingen' → BLOKERET, ALDRIG dispatch (stale-flod-replay)",
    h.some((x) => x.handling === "BLOKERET" && (x.mangler ?? []).includes("spor-ikke-ingen")) &&
      !h.some((x) => x.handling === "DISPATCH"),
  );
  const h2 = decide(
    {
      ...INGEN,
      leverancer: [
        {
          fil: "docs/coordination/codex-reviews/2026-06-12-x-troskab-9.md",
          untracked: true,
          type: "troskabs-verdikt",
          deklaration: null,
          markers: ["FEEDBACK"],
        },
      ],
    },
    REGLER,
  );
  check(
    "untracked leverance + spor 'ingen' → BLOKERET, ALDRIG transport-commit (stale artefakter fryses ikke)",
    h2.some((x) => x.handling === "BLOKERET" && (x.mangler ?? []).includes("spor-ikke-ingen")) &&
      !h2.some((x) => x.handling === "TRANSPORT-COMMIT"),
  );
  const h3 = decide({ ...INGEN, events: [{ type: "krav-dok-merged", sha: "m1" }] }, REGLER);
  check(
    "event uden pakke + spor 'ingen' → BLOKERET på event-vejen",
    h3.some((x) => x.handling === "BLOKERET" && (x.mangler ?? []).includes("spor-ikke-ingen")) &&
      !h3.some((x) => x.handling === "DISPATCH"),
  );
  const h4 = decide(
    { ...INGEN, events: [{ type: "qwers-aabning", sha: "c1", pakke: "gov-6" }] },
    REGLER,
  );
  check(
    "qwers-åbning bærer egen pakke → dispatches stadig (værnet rammer kun ægte 'ingen')",
    h4.filter((x) => x.handling === "DISPATCH").length === 2,
  );
}

// ---------- 32. persistent KAEDE-STOP (rette-til punkt 11a) ----------
// Rodårsag (nat til 12/6, #147): systemd Restart=on-failure genoplivede
// processen hvert 30s efter verdikt-exit 2 — stop skal være PERSISTENT.
{
  const KAEDE = dirname(fileURLToPath(import.meta.url));
  const TMP = join(KAEDE, ".selftest-tmp");
  const LOG = join(KAEDE, ".dispatch-log.jsonl");
  const logBackup = existsSync(LOG) ? readFileSync(LOG, "utf8") : null;
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  check("stopFilLaes: ingen stop-fil → null", stopFilLaes({ dir: TMP }) === null);
  stopFilSkriv("test-grund", { x: 1 }, { dir: TMP });
  check(
    "stopFilSkriv/stopFilLaes: round-trip m. grund + tid",
    stopFilLaes({ dir: TMP })?.grund === "test-grund" && !!stopFilLaes({ dir: TMP })?.tid,
  );
  rmSync(join(TMP, ".kaede-stop"), { force: true });
  const res = udfoer([{ handling: "KAEDE-STOP", grund: "divergens", detalje: [] }], { stopDir: TMP });
  check(
    "udfoer KAEDE-STOP → stop-fil skrevet (stoppet kæde forbliver stoppet gennem genstart)",
    res.stoppet === true && stopFilLaes({ dir: TMP })?.grund === "divergens",
  );
  rmSync(join(TMP, ".kaede-stop"), { force: true });
  udfoer([{ handling: "KAEDE-PAUSE", grund: "Mathias-stop (suverænitet)" }], { stopDir: TMP });
  check(
    "udfoer KAEDE-PAUSE (Mathias-stop) → stop-fil skrevet (suverænitet består gennem genstart)",
    stopFilLaes({ dir: TMP })?.grund === "Mathias-stop (suverænitet)",
  );
  rmSync(join(TMP, ".kaede-stop"), { force: true });
  writeFileSync(join(TMP, "fejl.sh"), "#!/bin/bash\nexit 7\n");
  const koerende = new Map();
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
    { koerende, stopDir: TMP },
  );
  await Promise.all([...koerende.values()].map((k) => k.faerdig));
  check(
    "adapter-fejl (exit ≠ 0) → stop-fil skrevet (restart-loop kan ikke genoplive)",
    stopFilLaes({ dir: TMP })?.grund === "adapter-fejl",
  );
  rmSync(TMP, { recursive: true, force: true });
  if (logBackup === null) rmSync(LOG, { force: true });
  else writeFileSync(LOG, logBackup);
}
{
  // Mekaniske tekst-kontrakter (samme klasse som punkt 3-kontrakten):
  const KAEDE = dirname(fileURLToPath(import.meta.url));
  const preflight = readFileSync(join(KAEDE, "preflight.sh"), "utf8");
  check(
    "preflight.sh nægter at køre forbi stop-filen (punkt 11a: fail-closed før baseline)",
    preflight.includes(".kaede-stop"),
  );
  const unit = readFileSync(join(KAEDE, "stork-kaede.service"), "utf8");
  check(
    "stork-kaede.service: verdikt-exits genopliver ikke (RestartPreventExitStatus) + start-loft (StartLimit)",
    /RestartPreventExitStatus=.*\b2\b/.test(unit) && /StartLimitBurst=/.test(unit) && /StartLimitIntervalSec=/.test(unit),
  );
  const dirigent = readFileSync(join(KAEDE, "dirigent.mjs"), "utf8");
  check(
    "dirigent.mjs nægter live-/once-/baseline-kørsel når stop-filen findes (punkt 11a)",
    dirigent.includes("stopFilLaes()") || /stopFilLaes\(\)/.test(dirigent),
  );
  const tilstandSrc = readFileSync(join(KAEDE, "tilstand.mjs"), "utf8");
  check(
    "tilstand.mjs: git/gh-kald bærer timeout (punkt 11c: en hængende cyklus efterlader aldrig en log-løs instans)",
    /timeout:\s*\d+/.test(tilstandSrc),
  );
}

// ---------- 33. behandlet åbnings-ord genfyrer ALDRIG efter genstart (punkt 11, eksplicit) ----------
{
  // Genstarts-scenariet bevist mekanisk: dispatch-loggen bærer KOERSEL-SLUT
  // exit 0 for begge recon-modtagere af qwers-eventet (kommentar-id c1) —
  // efter genstart genlæses loggen og eventet må IKKE dispatche igen.
  const logLinjer = [
    JSON.stringify({
      handling: "KOERSEL-SLUT",
      exit: 0,
      aktoer: "code",
      kontekst: { event: "qwers-aabning", sha: "c1", spor: "gov-6" },
    }),
    JSON.stringify({
      handling: "KOERSEL-SLUT",
      exit: 0,
      aktoer: "codex",
      kontekst: { event: "qwers-aabning", sha: "c1", spor: "gov-6" },
    }),
  ];
  const h = decide(
    {
      ...TOM,
      marker: { pakke: "ingen", fase: "plan" },
      behandlede: behandletNoegler(logLinjer),
      events: [{ type: "qwers-aabning", sha: "c1", pakke: "gov-6" }],
    },
    REGLER,
  );
  check(
    "stående 'qwers gov-6' (#126) m. behandlet-state i loggen → INGEN gen-dispatch efter dirigent-genstart",
    !h.some((x) => x.handling === "DISPATCH"),
  );
  // …og et NYT qwers-ord (nyt kommentar-id) åbner stadig:
  const h2 = decide(
    {
      ...TOM,
      marker: { pakke: "ingen", fase: "plan" },
      behandlede: behandletNoegler(logLinjer),
      events: [{ type: "qwers-aabning", sha: "c2-nyt-ord", pakke: "gov-6" }],
    },
    REGLER,
  );
  check(
    "nyt qwers-ord (nyt kommentar-id) → åbner stadig (idempotens rammer kun det behandlede id)",
    h2.filter((x) => x.handling === "DISPATCH").length === 2,
  );
}

// ---------- resultat ----------
if (failed) {
  console.error(`\nKæde-selftest FEJLEDE (${failed})`);
  process.exit(1);
}
console.log("\nKæde-selftest: alle cases passed");
