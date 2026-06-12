// scripts/kaede/dirigent.mjs — kædens kurér (gov-5, plan V7 step 2).
//
// TRANSPORT, ALDRIG DØMMEKRAFT (krav 6): kuréren læser tilstands-felter og
// aktør-deklarationer, matcher mod kaede-regler.json og dispatcher aktør-kørsler.
// Den genererer/redigerer aldrig leverance-indhold, vurderer aldrig indhold,
// merger aldrig beslutnings-sti-PR'er og vækker aldrig af egen dagsorden.
//
// Kerne: decide(tilstand, regler) er REN — al effekt (dispatch, transport-commit,
// log) bor i udfoer(). Selftest dækker decide() uden git/gh (dirigent.selftest.mjs).
//
// Brug:
//   node scripts/kaede/dirigent.mjs --dry-run     én cyklus, print handlinger
//   node scripts/kaede/dirigent.mjs --once        én cyklus, udfør
//   node scripts/kaede/dirigent.mjs               poll-løkke (systemd-service)

import { execFileSync, spawn } from "node:child_process";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { laesTilstand } from "./tilstand.mjs";

const KAEDE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROD = join(KAEDE_DIR, "..", "..");
const LOG_STI = join(KAEDE_DIR, ".dispatch-log.jsonl");
const LAAS_STI = join(KAEDE_DIR, ".dirigent.lock");

// ---------- decide: REN beslutningskerne ----------
//
// tilstand: { divergens, gateOrd, leverancer, marker, events?, laase?, behandlede? }
//   laase:      [{ aktoer, spor }] — igangværende kørsler (frossen-version-værn)
//   behandlede: ["<fil>@<sha>"]   — allerede dispatchede leverancer (idempotens)
// regler: kaede-regler.json-objektet
//
// Returnerer ordnet liste af handlinger. Første STOP-klasse-handling gør listen
// endelig — fejl transporteres aldrig videre (krav 4).

// Betingelses-evaluator (design pkt. 11, TILLÆG 3-skærpelsen): REN opslags-
// funktion over tilstand.betingelsesFakta. Ukendt betingelse = fail-closed.
// SHA-match er prefix-tolerant (reviews bærer kort SHA, filSha er fuld).
function shaMatch(a, b) {
  return !!a && !!b && (String(a).startsWith(String(b)) || String(b).startsWith(String(a)));
}
export function betingelseOpfyldt(navn, fakta = {}) {
  switch (navn) {
    case "codex-approval-paa-aktuel-plan-sha":
      return shaMatch(fakta.codexApprovalSha, fakta.planSha);
    case "troskabs-pass-paa-aktuel-plan-sha":
      return shaMatch(fakta.troskabsPassSha, fakta.planSha);
    case "ingen-aabne-gates":
      return (fakta.aabneGates ?? 1) === 0;
    case "krav-ok-hash-matcher-fil-hash":
      return shaMatch(fakta.kravOkHash, fakta.kravDokHash);
    case "begge-kode-recon-docs-findes":
      return !!fakta.reconKode && !!fakta.reconResearch;
    case "claude-ai-approval-findes":
      return !!fakta.claudeAiApproval;
    case "slut-ok-registreret":
      return !!fakta.slutOk;
    default:
      return false; // fail-closed: ukendt betingelse kan aldrig være opfyldt
  }
}

export function decide(tilstand, regler) {
  const handlinger = [];
  const laase = tilstand.laase ?? [];
  const behandlede = new Set(tilstand.behandlede ?? []);
  const spor = tilstand.marker?.pakke ?? "ingen";
  // Betingelses-tjek pr. OPGAVE (regelbogs-håndhævelse): mangler → liste af navne
  const manglendeBetingelser = (opgave) =>
    (regler.betingelser?.[opgave] ?? []).filter((navn) => !betingelseOpfyldt(navn, tilstand.betingelsesFakta));

  // 1. Divergens (én sandhed) — STOPPER alt; intet andet vurderes.
  if (tilstand.divergens?.length) {
    return [{ handling: "KAEDE-STOP", grund: "divergens", detalje: tilstand.divergens }];
  }

  // (Åben-gate-tjek flyttet til 2b — EFTER gate-ord-behandling, så Mathias'
  // GODKENDT/AFVIST kan løfte pausen; Codex runde 16: deadlock ellers.)

  // 2. Gate-ord: author-verifikation FØR alt andet brug af ordet.
  for (const ord of tilstand.gateOrd ?? []) {
    const erGateOrd = regler.gate_ord.some(
      (g) => ord.tekst === g || ord.tekst.startsWith(`${g} `) || ord.tekst.startsWith(`${g}\n`),
    );
    if (!erGateOrd) continue;
    if (ord.author !== regler.identiteter.gate_author) {
      handlinger.push({ handling: "IGNORER-GATE-ORD", author: ord.author, tekst: ord.tekst, flag: true });
      continue;
    }
    if (ord.tekst === "stop" || ord.tekst.startsWith("stop ")) {
      return [...handlinger, { handling: "KAEDE-PAUSE", grund: "Mathias-stop (suverænitet)" }];
    }
    handlinger.push({ handling: "GATE-ORD-REGISTRERET", ord: ord.tekst });
  }

  // 2b. Åben Mathias-gate (runde 14 + 16): gate-fil m. "AFVENTER MATHIAS"
  // pauser sporet — MEN en frisk, author-verificeret afgørelse (gate-godkendt/
  // gate-afvist-event fra GODKENDT/AFVIST-ord) løfter den: gate-filen afgøres
  // (ordret transport af Mathias' ord) og Code dispatches til genoptagelse.
  // Alt andet på sporet forbliver pauset i denne cyklus.
  if (tilstand.aabneGates?.length) {
    const afgoerelser = (tilstand.events ?? []).filter(
      (e) =>
        (e.type === "gate-godkendt" || e.type === "gate-afvist") &&
        !behandlede.has(`event:${e.type}@${e.sha ?? "HEAD"}#code`),
    );
    if (!afgoerelser.length) {
      return [...handlinger, { handling: "SPOR-PAUSET", gates: tilstand.aabneGates, spor }];
    }
    for (const e of afgoerelser) {
      handlinger.push({ handling: "GATE-AFGJORT", afgoerelse: e.type, gates: tilstand.aabneGates, sha: e.sha });
      handlinger.push({
        handling: "DISPATCH",
        aktoer: "code",
        opgave: regler.events[e.type][0].opgave,
        adapter: regler.aktoerer.code.adapter,
        kontekst: { event: e.type, sha: e.sha ?? null, spor },
      });
    }
    return handlinger; // afgørelsen bærer cyklussen; øvrig routing fra næste cyklus
  }

  // 3. Untracked leverancer → transport-commit (ordret) før routing — men
  // ALDRIG mens en kørsel er aktiv på sporet (Codex runde 15-fund): filen kan
  // være halvskrevet indtil aktørens exit 0 har bevist at den er færdig.
  // Konservativt: enhver aktiv kørsel på sporet → VENT.
  for (const lev of tilstand.leverancer ?? []) {
    if (!lev.untracked) continue;
    if (laase.some((l) => l.spor === spor)) {
      handlinger.push({ handling: "VENT", fil: lev.fil, grund: "koersel-paa-spor" });
      continue;
    }
    // Selv-validering før frys (design pkt. 12, V15/V16): typens selvtjek-
    // liste vedhæftes — udfoer() kører den FØR commit; fejl = ingen frys.
    const tcType = lev.deklaration?.type ?? lev.type ?? null;
    const tcRegel = tcType ? regler.leverance_typer[tcType] : null;
    handlinger.push({
      handling: "TRANSPORT-COMMIT",
      fil: lev.fil,
      selvtjek: tcRegel?.selvtjek ?? [],
      afsender: tcRegel?.afsender ?? null,
      spor,
    });
  }

  // 4. Committede, ubehandlede leverancer → routing.
  for (const lev of tilstand.leverancer ?? []) {
    if (lev.untracked) continue; // routes i næste cyklus, efter transport-commit
    if (lev.aendret) {
      // Modificeret tracked bærer (runde 13-fund 1): aktør m. commit-ret er
      // midt i arbejdet — ingen routing (stale filSha ≠ worktree-indhold),
      // ingen transport-commit (aldrig halvfærdigt arbejde). Venter.
      handlinger.push({ handling: "AFVENTER-COMMIT", fil: lev.fil });
      continue;
    }
    const noegle = `${lev.fil}@${lev.sha ?? "HEAD"}`;
    if (behandlede.has(noegle)) continue;

    // 4a. Fund-gate-markers → Mathias-gate + spor-pause (runde 14-fund 1):
    // fund-gaten DISPATCHES til mathias-adapteren (gate-anmodning + gate-fil,
    // B3) og ALT efterfølgende på sporet pauses i denne cyklus. Fra næste
    // cyklus bærer gate-filen pausen (regel 1b) til Mathias afgør.
    const gateMarkers = (lev.markers ?? []).filter((m) => regler.fund_gate_markers.includes(m));
    if (gateMarkers.length) {
      handlinger.push({ handling: "FUND-GATE", fil: lev.fil, markers: gateMarkers, spor });
      handlinger.push({
        handling: "DISPATCH",
        aktoer: "mathias",
        opgave: "gate-anmodning",
        adapter: regler.aktoerer.mathias.adapter,
        kontekst: { fil: lev.fil, sha: lev.sha ?? null, spor },
      });
      return handlinger; // spor-pause: intet andet routes i denne cyklus
    }

    // 4b. Type: deklaration vinder over filnavns-inferens. Committed fil HELT
    //     uden deklaration/type er pre-kæde-arv (menneske-committet) — kuréren
    //     handler kun på eksplicitte deklarationer (transport-princippet); den
    //     ignoreres logget. DEKLARERET men ukendt type → STOP (aktiv fejl).
    const type = lev.deklaration?.type ?? lev.type ?? null;
    if (type === null && lev.deklaration === null) {
      handlinger.push({ handling: "ARV-IGNORERET", fil: lev.fil });
      continue;
    }
    let regel = type ? regler.leverance_typer[type] : null;
    if (!regel) {
      return [...handlinger, { handling: "KAEDE-STOP", grund: "ukendt-leverance-type", fil: lev.fil, type }];
    }

    // 4b2. Marker-routing (V17/runde 25): troskabs-verdikt routes pr. PASS/FEEDBACK
    if (regel.routing_pr_marker) {
      const markerNavn = Object.keys(regel.routing_pr_marker).find((m) => (lev.markers ?? []).includes(m));
      if (!markerNavn) {
        return [...handlinger, { handling: "KAEDE-STOP", grund: "ukendt-verdikt-marker", fil: lev.fil, type }];
      }
      regel = { ...regel, ...regel.routing_pr_marker[markerNavn] };
    }

    // 4b3. Modtager-løse typer (recon-docs): REGISTRERET — behandlet, ingen
    //     dispatch; events afleder den videre vej (recon-kode-klar m.v.).
    if (regel.modtager === null || regel.modtager === undefined) {
      if (!lev.deklaration?.naeste) {
        handlinger.push({ handling: "REGISTRERET", kontekst: { fil: lev.fil, sha: lev.sha ?? null, spor } });
        continue;
      }
    }

    // 4c. Modtager: aktør-deklaration kan override modtager (vækningsret hos
    //     aktørerne) — men kun til kendte aktører; ukendt → STOP (fail-closed).
    const modtager = lev.deklaration?.naeste ?? regel.modtager;
    if (!regler.aktoerer[modtager]) {
      return [...handlinger, { handling: "KAEDE-STOP", grund: "ukendt-modtager", fil: lev.fil, modtager }];
    }

    // 4d. Lås pr. (aktør, spor): igangværende kørsel afbrydes ALDRIG
    //     (verdikt på frossen version) — leverancen venter til næste cyklus.
    if (laase.some((l) => l.aktoer === modtager && l.spor === spor)) {
      handlinger.push({ handling: "VENT", fil: lev.fil, modtager, grund: "laas" });
      continue;
    }

    // 4e. Betingelser (design pkt. 11): mangler én, KAN der ikke dispatches.
    const mangler = manglendeBetingelser(regel.opgave);
    if (mangler.length) {
      handlinger.push({ handling: "BLOKERET", opgave: regel.opgave, fil: lev.fil, mangler });
      continue;
    }

    handlinger.push({
      handling: "DISPATCH",
      aktoer: modtager,
      opgave: regel.opgave,
      adapter: regler.aktoerer[modtager].adapter,
      kontekst: { fil: lev.fil, sha: lev.sha ?? null, spor },
    });
  }

  // 5. Kalender-poll-events (eksterne tilstande: merges, checks, åbnings-ord).
  for (const ev of tilstand.events ?? []) {
    const modtagere = regler.events[ev.type];
    if (!modtagere) {
      return [...handlinger, { handling: "KAEDE-STOP", grund: "ukendt-event", event: ev.type }];
    }
    // eventSpor (V20/V21, runde 28+29): qwers-båret pakkenavn vinder over
    // markørens "ingen" og bruges KONSEKVENT — lås, betingelser, dispatch.
    const eventSpor = ev.pakke ?? spor;
    for (const m of modtagere) {
      // Event-idempotens PR. MODTAGER (Codex runde 11-fund): multi-modtager-
      // events må aldrig droppe én aktørs kørsel fordi en andens lykkedes.
      if (behandlede.has(`event:${ev.type}@${ev.sha ?? "HEAD"}#${m.aktoer}`)) continue;
      if (laase.some((l) => l.aktoer === m.aktoer && l.spor === eventSpor)) {
        handlinger.push({ handling: "VENT", event: ev.type, modtager: m.aktoer, grund: "laas" });
        continue;
      }
      // Betingelser (design pkt. 11) — også på event-vejen.
      const mangler = manglendeBetingelser(m.opgave);
      if (mangler.length) {
        handlinger.push({ handling: "BLOKERET", opgave: m.opgave, event: ev.type, mangler });
        continue;
      }
      handlinger.push({
        handling: "DISPATCH",
        aktoer: m.aktoer,
        opgave: m.opgave,
        adapter: regler.aktoerer[m.aktoer].adapter,
        kontekst: { event: ev.type, sha: ev.sha ?? null, spor: eventSpor },
      });
    }
  }

  if (!handlinger.length) handlinger.push({ handling: "INGEN" });
  return handlinger;
}

// ---------- udfoer: effekter (dispatch, transport-commit, log) ----------

function log(post) {
  appendFileSync(LOG_STI, `${JSON.stringify({ tid: new Date().toISOString(), ...post })}\n`);
}

// Ordret transport af PRÆCIS én aktør-leverance via PR-vejen (rette-til punkt 1,
// GH006-fundet: direkte main-push afvises af gov-4-protection — kuréren pusher
// ALDRIG main). Bogførings-sti-mønstret (bevist af #130/#132): transport-commit
// på gren → PR → `gh pr merge --auto --rebase`; gren-navnet bærer indholds-
// hashen, så samme leverance aldrig får dublet-PR (idempotens — afventer-merge).
// Committen bygges i et midlertidigt worktree fra origin/main: hoved-checkoutets
// index røres ALDRIG (runde 14-garantien composes strukturelt: fremmede staged
// ændringer KAN ikke følge med). Kuréren rører aldrig indholdet (ordret).
// gh er injicerbar så selftesten kan bevise vejen uden netværk/gh-auth.
function ghExec(args, cwd) {
  return execFileSync("gh", args, { cwd, encoding: "utf8" }).trim();
}
export function transportCommit(fil, { cwd = REPO_ROD, remote = "origin", base = "main", gh = ghExec } = {}) {
  const g = (args, dir = cwd) => execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim();
  const blob = g(["hash-object", "--", fil]);
  const gren = `kaede/transport/${fil.replace(/[^a-zA-Z0-9._/-]+/g, "-").replaceAll("/", "--")}-${blob.slice(0, 7)}`;
  const opretOgArmerPr = () => {
    gh(
      [
        "pr",
        "create",
        "--base",
        base,
        "--head",
        gren,
        "--title",
        `kæde-transport: ${fil}`,
        "--body",
        "Ordret aktør-leverance (kæde-transport, gov-5). Rolle-valideret bogførings-sti: merger på grøn CI " +
          "(gate-model: Mathias' gates er ordene, ikke klikkene). Beslutnings-sti-filer afventer code-owner-review.",
      ],
      cwd,
    );
    gh(["pr", "merge", gren, "--auto", "--rebase"], cwd);
  };
  // Gren m. samme indholds-hash findes på remote → transporten er i flight,
  // MEN gren-eksistens er ikke bevis for PR + auto-merge (Codex runde 1-fund 1):
  // PR-tilstanden BEVISES — mangler PR genoprettes den; mangler armering
  // re-armeres; lukket u-merged PR er transport-fejl (fail-closed).
  if (g(["ls-remote", "--heads", remote, gren])) {
    let pr = null;
    try {
      pr = JSON.parse(gh(["pr", "view", gren, "--json", "state,autoMergeRequest"], cwd));
    } catch {
      pr = null; // ingen PR for grenen (create fejlede i en tidligere cyklus)
    }
    if (pr?.state === "MERGED") return { status: "afventer-merge", gren }; // ff-synk samler op næste cyklus
    if (pr?.state === "OPEN" && pr.autoMergeRequest) return { status: "afventer-merge", gren };
    if (pr?.state === "OPEN") {
      gh(["pr", "merge", gren, "--auto", "--rebase"], cwd); // re-armér auto-merge
      return { status: "afventer-merge", gren };
    }
    if (pr) return { status: "transport-fejl", gren, grund: `PR ${pr.state} uden merge` };
    opretOgArmerPr();
    return { status: "pr-oprettet", gren };
  }
  const tmp = mkdtempSync(join(tmpdir(), "kaede-transport-"));
  try {
    g(["worktree", "add", "--quiet", "--detach", tmp, `${remote}/${base}`]);
    mkdirSync(dirname(join(tmp, fil)), { recursive: true });
    copyFileSync(join(cwd, fil), join(tmp, fil));
    g(["add", "--", fil], tmp);
    g(
      [
        "commit",
        "--quiet",
        "--only",
        "-m",
        `kæde-transport: ${fil} (ordret aktør-leverance — dispatch-log: se scripts/kaede/.dispatch-log.jsonl)`,
        "--",
        fil,
      ],
      tmp,
    );
    g(["push", "--quiet", remote, `HEAD:refs/heads/${gren}`], tmp);
  } finally {
    try {
      g(["worktree", "remove", "--force", tmp]);
    } catch {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
  opretOgArmerPr();
  return { status: "pr-oprettet", gren };
}

// PR-vejens konvergens (rette-til punkt 1): efter en transport-PR-merge er
// origin/main foran det lokale checkout. RENT bagud er ikke divergens — kuréren
// ff-synker fremad (transport-niveau, ingen dømmekraft) og fjerner lokale
// untracked leverance-kopier hvis indhold nu ER frosset identisk på origin
// (blob-match — afviger indholdet røres intet og divergens-tjekket STOPper).
// Lokal-egne commits (ægte divergens) synkes ALDRIG væk (fail-closed).
export function syncFremad({ cwd = REPO_ROD, fetch = true } = {}) {
  const g = (args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
  if (fetch) g(["fetch", "--quiet"]);
  const branch = g(["branch", "--show-current"]);
  let originSha;
  try {
    originSha = g(["rev-parse", `origin/${branch}`]);
  } catch {
    return { synket: false, grund: "ingen-remote-gren" };
  }
  if (g(["rev-parse", "HEAD"]) === originSha) return { synket: false, grund: "allerede-ens" };
  try {
    g(["merge-base", "--is-ancestor", "HEAD", `origin/${branch}`]);
  } catch {
    return { synket: false, grund: "divergens" };
  }
  const untracked = g(["status", "--porcelain", "--untracked-files=all", "docs/coordination/"])
    .split("\n")
    .filter((l) => l.startsWith("??"))
    .map((l) => l.slice(3).trim());
  const fjernede = [];
  for (const fil of untracked) {
    try {
      if (g(["rev-parse", `origin/${branch}:${fil}`]) === g(["hash-object", "--", fil])) {
        rmSync(join(cwd, fil));
        fjernede.push(fil);
      }
    } catch {
      // findes ikke på origin — lokal leverance afventer stadig transport; røres ikke
    }
  }
  try {
    g(["merge", "--ff-only", "--quiet", `origin/${branch}`]);
  } catch (fejl) {
    return { synket: false, grund: `ff-fejl: ${fejl}`, fjernede };
  }
  return { synket: true, fjernede };
}

// Selvtjek-motor (design pkt. 12, V15/V16 — Mathias-forslag): MEKANISKE tjek
// før frys, ingen dømmekraft. Returnerer { ok, fejl: [beskrivelser] }.
export function selvtjekKoer(tjekListe, filSti, { repoRod = REPO_ROD } = {}) {
  const fejl = [];
  if (!(tjekListe ?? []).length) return { ok: true, fejl }; // tom liste: intet at læse/tjekke
  const tekst = readFileSync(join(repoRod, filSti), "utf8");
  for (const tjek of tjekListe ?? []) {
    if (tjek.tjek === "konsistens-grep" && tjek.forbudt) {
      if (new RegExp(tjek.forbudt, "m").test(tekst))
        fejl.push(`konsistens-grep: forbudt mønster '${tjek.forbudt}' fundet`);
    } else if (tjek.tjek === "counter-sync") {
      // Målte klasse (runde 18b/22/26): status-counter vs. plan-header-counter
      const spor = filSti.match(/coordination\/(.+)-status\.md$/)?.[1];
      const planSti = join(repoRod, `docs/coordination/${spor}-plan.md`);
      const statusTal = tekst.match(/[Kk]onvergens-counter:\*{0,2}\s*(\d+)/)?.[1];
      if (spor && existsSync(planSti) && statusTal) {
        const planTal = readFileSync(planSti, "utf8").match(/konvergens-counter:\s*(\d+)/)?.[1];
        if (planTal && planTal !== statusTal) fejl.push(`counter-sync: status ${statusTal} ≠ plan ${planTal}`);
      }
    } else if (tjek.tjek === "ordret-diff") {
      // Målte klasse (runde 18a): "body 1:1"-løfter m. KILDE-markør diffes mod kilden
      const blokRe = /KILDE:\s*(\S+?):(\d+)[–-](\d+)\s*\n+```[a-z]*\n([\s\S]*?)```/g;
      let m;
      while ((m = blokRe.exec(tekst))) {
        const [, kilde, fra, til, citeret] = m;
        const kildeSti = join(repoRod, kilde);
        if (!existsSync(kildeSti)) {
          fejl.push(`ordret-diff: kilde ${kilde} findes ikke`);
          continue;
        }
        const kildeLinjer = readFileSync(kildeSti, "utf8")
          .split("\n")
          .slice(Number(fra) - 1, Number(til))
          .join("\n");
        if (kildeLinjer.trim() !== citeret.trim()) fejl.push(`ordret-diff: ${kilde}:${fra}-${til} afviger fra citatet`);
      }
    } else {
      fejl.push(`ukendt selvtjek-type: ${tjek.tjek}`); // fail-closed
    }
  }
  return { ok: fejl.length === 0, fejl };
}

// Parallel eksekvering (Codex runde 12-fund): DISPATCH spawner ASYNKRONT —
// Code og Codex kører samtidig (krav 5, §2.1). `koerende` er kurérens register
// over aktive kørsler: nøgle "<aktoer>::<spor>" → { aktoer, spor, faerdig }.
// Registret bliver til decide()'s `laase` næste cyklus — låsen holdes på tværs
// af poll-cyklusser, ikke kun inden for én udfoer().
export function udfoer(
  handlinger,
  { dryRun = false, koerende = new Map(), onStop = null, regler = null, transportFn = transportCommit } = {},
) {
  for (const h of handlinger) {
    if (dryRun) {
      console.log(`[dry-run] ${JSON.stringify(h)}`);
      continue;
    }
    log(h);
    switch (h.handling) {
      case "TRANSPORT-COMMIT": {
        // Selv-validering før frys (design pkt. 12): fejl = INGEN frys,
        // INGEN videre dispatch — SELVTJEK-FEJL routes til afsenderen
        // (afsender "dialog" → Mathias-notifikation, ingen genkørsel).
        const resultat = selvtjekKoer(h.selvtjek ?? [], h.fil);
        if (!resultat.ok) {
          log({ handling: "SELVTJEK-FEJL", fil: h.fil, fejl: resultat.fejl, afsender: h.afsender });
          console.error(`SELVTJEK-FEJL: ${h.fil} — ${resultat.fejl.join(" · ")}`);
          if (h.afsender && h.afsender !== "dialog" && regler?.aktoerer?.[h.afsender]) {
            udfoer(
              [
                {
                  handling: "DISPATCH",
                  aktoer: h.afsender,
                  opgave: "selvtjek-fejl-rettelse",
                  adapter: regler.aktoerer[h.afsender].adapter,
                  kontekst: { fil: h.fil, sha: null, spor: h.spor ?? "ingen" },
                },
              ],
              { dryRun, koerende, onStop, regler },
            );
          } else {
            log({ handling: "MATHIAS-NOTIFIKATION", grund: "selvtjek-fejl-i-dialog-output", fil: h.fil });
          }
          break;
        }
        const transport = transportFn(h.fil);
        if (transport.status === "transport-fejl") {
          // Codex runde 1-fund 1: u-beviselig PR-tilstand er fejl, aldrig
          // stille afventen — STOP (manuelt flow, krav 7).
          log({ handling: "KAEDE-STOP", grund: "transport-fejl", fil: h.fil, detalje: transport.grund });
          console.error(`KÆDE-STOP: transport-fejl for ${h.fil} — ${transport.grund} (manuelt flow, krav 7)`);
          return { stoppet: true };
        }
        log({
          handling: transport.status === "pr-oprettet" ? "TRANSPORT-PR-OPRETTET" : "TRANSPORT-AFVENTER-MERGE",
          fil: h.fil,
          gren: transport.gren,
          spor: h.spor ?? "ingen",
        });
        break;
      }
      case "GATE-AFGJORT": {
        // Ordret transport af Mathias' afgørelses-ord ind i gate-filen
        // (§6.3-status-skift) — templated indsættelse, ingen vurdering.
        const ord = h.afgoerelse === "gate-godkendt" ? "GODKENDT" : "AFVIST";
        for (const gateFil of h.gates) {
          const sti = join(REPO_ROD, gateFil);
          const tekst = readFileSync(sti, "utf8");
          writeFileSync(sti, tekst.replace(/AFVENTER MATHIAS/g, `AFGJORT: ${ord} (kæde-issue ${h.sha})`));
          const gateTransport = transportFn(gateFil);
          log({ handling: "TRANSPORT-GATE-AFGJORT", fil: gateFil, gren: gateTransport.gren });
        }
        break;
      }
      case "DISPATCH": {
        const adapterSti = join(REPO_ROD, h.adapter);
        if (!existsSync(adapterSti)) {
          // Adapter mangler (B2 leverer dem) → ærligt STOP, ingen stille skip.
          log({ handling: "KAEDE-STOP", grund: "adapter-mangler", adapter: h.adapter });
          console.error(`KÆDE-STOP: adapter mangler: ${h.adapter} — manuelt flow (krav 7)`);
          return { stoppet: true };
        }
        // DISPATCH-loggen er FORSØG — behandlet-status bæres ALENE af
        // KOERSEL-SLUT m. exit 0 (Codex B1-fund 1).
        const noegle = `${h.aktoer}::${h.kontekst.spor}`;
        // Dispatch pr. filtype (Codex runde 35: mathias.mjs er Node/ESM —
        // bash-spawn gav syntaksfejl før mobilfladen overhovedet ramtes).
        const fortolker = adapterSti.endsWith(".mjs") ? process.execPath : "bash";
        const child = spawn(fortolker, [adapterSti], {
          cwd: REPO_ROD,
          stdio: ["ignore", "inherit", "inherit"],
          env: {
            ...process.env,
            KAEDE_OPGAVE: h.opgave,
            KAEDE_FIL: h.kontekst.fil ?? "",
            KAEDE_SHA: h.kontekst.sha ?? "",
            KAEDE_SPOR: h.kontekst.spor,
          },
        });
        const faerdig = new Promise((resolve) => {
          child.on("exit", (code) => {
            koerende.delete(noegle);
            log({ handling: "KOERSEL-SLUT", aktoer: h.aktoer, exit: code, kontekst: h.kontekst });
            if (code !== 0) {
              // Adapter-kontrakt (B2): exit 0 = leverance leveret; alt andet =
              // kørsel fejlede → STOP, manuelt flow. Ingen auto-retry-loop.
              log({ handling: "KAEDE-STOP", grund: "adapter-fejl", aktoer: h.aktoer, exit: code });
              console.error(`KÆDE-STOP: ${h.aktoer}-adapter exit ${code} — manuelt flow (krav 7)`);
              onStop?.();
            }
            resolve(code);
          });
        });
        koerende.set(noegle, { aktoer: h.aktoer, spor: h.kontekst.spor, faerdig });
        break;
      }
      case "KAEDE-STOP":
      case "KAEDE-PAUSE":
        console.error(`${h.handling}: ${h.grund} — manuelt flow består (krav 7)`);
        return { stoppet: true };
      default:
        break; // INGEN / VENT / GATE-ORD-REGISTRERET / IGNORER-GATE-ORD / FUND-GATE / ARV-IGNORERET: logget; FUND-GATE-anmodning bæres af mathias-adapteren (B3)
    }
  }
  return { stoppet: false };
}

// ---------- CLI / poll-løkke ----------

// REN: behandlet-nøgler udledes KUN af succesfulde kørsler (KOERSEL-SLUT,
// exit 0) — fejlede dispatches efterlader ingen behandlet-markering (de fører
// til KAEDE-STOP i udfoer; ved manuel genstart re-evalueres leverancen).
export function behandletNoegler(logLinjer) {
  return logLinjer
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter(
      (p) =>
        (p.handling === "KOERSEL-SLUT" && p.exit === 0 && p.kontekst) || (p.handling === "REGISTRERET" && p.kontekst), // modtager-løse typer (V21): behandlet uden kørsel
    )
    .map((p) =>
      p.kontekst.fil
        ? `${p.kontekst.fil}@${p.kontekst.sha ?? "HEAD"}`
        : `event:${p.kontekst.event}@${p.kontekst.sha ?? "HEAD"}#${p.aktoer}`,
    );
}

function laesBehandlede() {
  if (!existsSync(LOG_STI)) return [];
  return behandletNoegler(readFileSync(LOG_STI, "utf8").split("\n"));
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const offline = argv.includes("--offline"); // sandbox-verifikation: ingen fetch/gh
  const baseline = argv.includes("--baseline");
  const once = argv.includes("--once") || dryRun || baseline;

  if (existsSync(LAAS_STI)) {
    console.error(`Dirigent kører allerede (${LAAS_STI}) — én instans ad gangen.`);
    process.exit(64);
  }
  writeFileSync(LAAS_STI, String(process.pid));
  process.on("exit", () => rmSync(LAAS_STI, { force: true }));

  const regler = JSON.parse(readFileSync(join(KAEDE_DIR, "kaede-regler.json"), "utf8"));
  mkdirSync(KAEDE_DIR, { recursive: true });

  // Baseline-seeding (Codex runde 32): ved aktivering skrives ALLE eksisterende
  // committede leverancer + aktuelle events som REGISTRERET/behandlet — ellers
  // flyder historikken ind som live dispatches. Kør: dirigent.mjs --baseline
  if (baseline) {
    const tilstand = laesTilstand({ repoRod: REPO_ROD, kaedeIssue: regler.kaede_issue ?? null, fetch: !offline });
    let antal = 0;
    for (const lev of tilstand.leverancer ?? []) {
      if (lev.untracked || lev.aendret) continue;
      log({ handling: "REGISTRERET", grund: "baseline-seed", kontekst: { fil: lev.fil, sha: lev.sha ?? "HEAD" } });
      antal++;
    }
    for (const ev of tilstand.events ?? []) {
      for (const m of regler.events[ev.type] ?? []) {
        log({
          handling: "KOERSEL-SLUT",
          exit: 0,
          grund: "baseline-seed",
          aktoer: m.aktoer,
          kontekst: { event: ev.type, sha: ev.sha ?? "HEAD" },
        });
        antal++;
      }
    }
    console.log(`Baseline seedet: ${antal} poster i dispatch-loggen. Kæden kan nu køre live.`);
    process.exit(0);
  }

  // Fail-closed live-guard (runde 32): UDEN baseline-log er historikken
  // u-skelnelig fra nye leverancer — live-kørsel nægtes, ikke advares.
  if (!dryRun && !existsSync(LOG_STI)) {
    console.error(
      "KÆDE-STOP: ingen dispatch-log — kør 'node scripts/kaede/dirigent.mjs --baseline' ved aktivering (baseline-seeding, runde 32).",
    );
    process.exit(64);
  }

  const koerende = new Map(); // aktive aktør-kørsler — kilden til decide()'s laase
  let stopSignal = false;
  const onStop = () => {
    stopSignal = true;
  };

  do {
    try {
      // PR-vejens konvergens (punkt 1): rent bagud → ff-synk FØR tilstandslæsning,
      // så merged transport-PR'er ikke fremstår som divergens. Fail-closed ved alt andet.
      if (!offline) {
        const synk = syncFremad({ cwd: REPO_ROD });
        if (synk.synket || synk.fjernede?.length) log({ handling: "FF-SYNK", ...synk });
      }
      const tilstand = laesTilstand({
        repoRod: REPO_ROD,
        kaedeIssue: regler.kaede_issue ?? null,
        fetch: !offline,
      });
      tilstand.behandlede = laesBehandlede();
      tilstand.laase = [...koerende.values()].map((k) => ({ aktoer: k.aktoer, spor: k.spor }));
      const handlinger = decide(tilstand, regler);
      const resultat = udfoer(handlinger, { dryRun, koerende, onStop, regler });
      if (resultat.stoppet || stopSignal) {
        await Promise.all([...koerende.values()].map((k) => k.faerdig)); // kørende afsluttes, intet nyt startes
        process.exit(2);
      }
    } catch (fejl) {
      // Uventet fejl = kæde-STOP, aldrig stille videre (krav 4).
      log({ handling: "KAEDE-STOP", grund: "uventet-fejl", detalje: String(fejl) });
      console.error(`KÆDE-STOP (uventet fejl): ${fejl}`);
      await Promise.all([...koerende.values()].map((k) => k.faerdig));
      process.exit(2);
    }
    if (!once) await new Promise((r) => setTimeout(r, regler.poll_interval_sekunder * 1000));
  } while (!once);
  await Promise.all([...koerende.values()].map((k) => k.faerdig)); // --once: afvent igangsatte
  if (stopSignal) process.exit(2);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
