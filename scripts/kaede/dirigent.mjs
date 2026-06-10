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

import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

export function decide(tilstand, regler) {
  const handlinger = [];
  const laase = tilstand.laase ?? [];
  const behandlede = new Set(tilstand.behandlede ?? []);
  const spor = tilstand.marker?.pakke ?? "ingen";

  // 1. Divergens (én sandhed) — STOPPER alt; intet andet vurderes.
  if (tilstand.divergens?.length) {
    return [{ handling: "KAEDE-STOP", grund: "divergens", detalje: tilstand.divergens }];
  }

  // 2. Gate-ord: author-verifikation FØR alt andet brug af ordet.
  for (const ord of tilstand.gateOrd ?? []) {
    const erGateOrd = regler.gate_ord.some((g) => ord.tekst === g || ord.tekst.startsWith(`${g} `) || ord.tekst.startsWith(`${g}\n`));
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

  // 3. Untracked leverancer → transport-commit (ordret) før routing.
  for (const lev of tilstand.leverancer ?? []) {
    if (lev.untracked) handlinger.push({ handling: "TRANSPORT-COMMIT", fil: lev.fil });
  }

  // 4. Committede, ubehandlede leverancer → routing.
  for (const lev of tilstand.leverancer ?? []) {
    if (lev.untracked) continue; // routes i næste cyklus, efter transport-commit
    const noegle = `${lev.fil}@${lev.sha ?? "HEAD"}`;
    if (behandlede.has(noegle)) continue;

    // 4a. Fund-gate-markers → Mathias-gate + spor-pause; modtager dispatches IKKE.
    const gateMarkers = (lev.markers ?? []).filter((m) => regler.fund_gate_markers.includes(m));
    if (gateMarkers.length) {
      handlinger.push({ handling: "FUND-GATE", fil: lev.fil, markers: gateMarkers, spor });
      continue;
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
    const regel = type ? regler.leverance_typer[type] : null;
    if (!regel) {
      return [...handlinger, { handling: "KAEDE-STOP", grund: "ukendt-leverance-type", fil: lev.fil, type }];
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
    if (behandlede.has(`event:${ev.type}@${ev.sha ?? "HEAD"}`)) continue; // event-idempotens
    const modtagere = regler.events[ev.type];
    if (!modtagere) {
      return [...handlinger, { handling: "KAEDE-STOP", grund: "ukendt-event", event: ev.type }];
    }
    for (const m of modtagere) {
      if (laase.some((l) => l.aktoer === m.aktoer && l.spor === spor)) {
        handlinger.push({ handling: "VENT", event: ev.type, modtager: m.aktoer, grund: "laas" });
        continue;
      }
      handlinger.push({
        handling: "DISPATCH",
        aktoer: m.aktoer,
        opgave: m.opgave,
        adapter: regler.aktoerer[m.aktoer].adapter,
        kontekst: { event: ev.type, sha: ev.sha ?? null, spor },
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

function transportCommit(fil) {
  // Ordret commit af aktør-leverance — kuréren rører ALDRIG indholdet.
  execFileSync("git", ["add", fil], { cwd: REPO_ROD });
  execFileSync(
    "git",
    ["commit", "--quiet", "-m", `kæde-transport: ${fil} (ordret aktør-leverance — dispatch-log: se scripts/kaede/.dispatch-log.jsonl)`],
    { cwd: REPO_ROD },
  );
  execFileSync("git", ["push", "--quiet"], { cwd: REPO_ROD });
}

export function udfoer(handlinger, { dryRun = false } = {}) {
  const laase = [];
  for (const h of handlinger) {
    if (dryRun) {
      console.log(`[dry-run] ${JSON.stringify(h)}`);
      continue;
    }
    log(h);
    switch (h.handling) {
      case "TRANSPORT-COMMIT":
        transportCommit(h.fil);
        break;
      case "DISPATCH": {
        const adapterSti = join(REPO_ROD, h.adapter);
        if (!existsSync(adapterSti)) {
          // Adapter mangler (B2 leverer dem) → ærligt STOP, ingen stille skip.
          log({ handling: "KAEDE-STOP", grund: "adapter-mangler", adapter: h.adapter });
          console.error(`KÆDE-STOP: adapter mangler: ${h.adapter} — manuelt flow (krav 7)`);
          return { stoppet: true, laase };
        }
        // DISPATCH-loggen ovenfor er FORSØG — behandlet-status bæres ALENE af
        // KOERSEL-SLUT m. exit 0 (Codex B1-fund 1: fejlet kørsel må aldrig
        // tælle som behandlet eller passere stille).
        laase.push({ aktoer: h.aktoer, spor: h.kontekst.spor });
        const res = spawnSync("bash", [adapterSti], {
          cwd: REPO_ROD,
          encoding: "utf8",
          env: { ...process.env, KAEDE_OPGAVE: h.opgave, KAEDE_FIL: h.kontekst.fil ?? "", KAEDE_SHA: h.kontekst.sha ?? "", KAEDE_SPOR: h.kontekst.spor },
        });
        laase.pop();
        log({ handling: "KOERSEL-SLUT", aktoer: h.aktoer, exit: res.status, kontekst: h.kontekst });
        if (res.status !== 0) {
          // Adapter-kontrakt (B2): exit 0 = leverance leveret (indholdet bærer
          // selv markers); alt andet = kørsel fejlede → STOP, manuelt flow.
          // Ingen auto-retry: en permanent fejlende adapter må aldrig loope.
          log({ handling: "KAEDE-STOP", grund: "adapter-fejl", aktoer: h.aktoer, exit: res.status });
          console.error(`KÆDE-STOP: ${h.aktoer}-adapter exit ${res.status} — manuelt flow (krav 7)`);
          return { stoppet: true, laase };
        }
        break;
      }
      case "KAEDE-STOP":
      case "KAEDE-PAUSE":
        console.error(`${h.handling}: ${h.grund} — manuelt flow består (krav 7)`);
        return { stoppet: true, laase };
      default:
        break; // INGEN / VENT / GATE-ORD-REGISTRERET / IGNORER-GATE-ORD / FUND-GATE: logget ovenfor; FUND-GATE-anmodning bæres af mathias-adapteren (B3)
    }
  }
  return { stoppet: false, laase };
}

// ---------- CLI / poll-løkke ----------

// REN: behandlet-nøgler udledes KUN af succesfulde kørsler (KOERSEL-SLUT,
// exit 0) — fejlede dispatches efterlader ingen behandlet-markering (de fører
// til KAEDE-STOP i udfoer; ved manuel genstart re-evalueres leverancen).
export function behandletNoegler(logLinjer) {
  return logLinjer
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((p) => p.handling === "KOERSEL-SLUT" && p.exit === 0 && p.kontekst)
    .map((p) => (p.kontekst.fil ? `${p.kontekst.fil}@${p.kontekst.sha ?? "HEAD"}` : `event:${p.kontekst.event}@${p.kontekst.sha ?? "HEAD"}`));
}

function laesBehandlede() {
  if (!existsSync(LOG_STI)) return [];
  return behandletNoegler(readFileSync(LOG_STI, "utf8").split("\n"));
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const offline = argv.includes("--offline"); // sandbox-verifikation: ingen fetch/gh
  const once = argv.includes("--once") || dryRun;

  if (existsSync(LAAS_STI)) {
    console.error(`Dirigent kører allerede (${LAAS_STI}) — én instans ad gangen.`);
    process.exit(64);
  }
  writeFileSync(LAAS_STI, String(process.pid));
  process.on("exit", () => rmSync(LAAS_STI, { force: true }));

  const regler = JSON.parse(readFileSync(join(KAEDE_DIR, "kaede-regler.json"), "utf8"));
  mkdirSync(KAEDE_DIR, { recursive: true });

  do {
    try {
      const tilstand = laesTilstand({ repoRod: REPO_ROD, kaedeIssue: regler.kaede_issue ?? null, pakke: null, fetch: !offline });
      tilstand.behandlede = laesBehandlede();
      const handlinger = decide(tilstand, regler);
      const resultat = udfoer(handlinger, { dryRun });
      if (resultat.stoppet) process.exit(2);
    } catch (fejl) {
      // Uventet fejl = kæde-STOP, aldrig stille videre (krav 4).
      log({ handling: "KAEDE-STOP", grund: "uventet-fejl", detalje: String(fejl) });
      console.error(`KÆDE-STOP (uventet fejl): ${fejl}`);
      process.exit(2);
    }
    if (!once) await new Promise((r) => setTimeout(r, regler.poll_interval_sekunder * 1000));
  } while (!once);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
