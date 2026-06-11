# Mathias-gate — gov-5-automation-stale-dispatch-2

**Status: AFVENTER MATHIAS**

**Dato:** 2026-06-12 · **Rejst af:** Code (headless kæde-kørsel — dispatch: opgave
`naeste-version`, spor `ingen`, fil `codex-reviews/2026-06-11-selvtjek-docs.mjs-runde-14.md`,
frossen @ `3655023`)
**Klasse:** TEKNISK-BLOKERING (§6.1) / §13-STOP — GENTAGELSE af stale-dispatch
(gate -1, PR #136/#138) **plus pause-svigt**: den mekaniske åben-gate-pause holdt ikke.

## Hvad skete (kort)

Kæden vækkede Code for at skrive ny version på runde 14-reviewet af
`scripts/selvtjek-docs.mjs`. Git-sync viste at arbejdet allerede ER udført:

- Runde 14-fundet blev håndteret **ACCEPT** og bogført @ `3655023` — præcis den
  hash dispatchen selv fryser ved.
- Runde 15 (`bd75da6`) og 16 (`dd07699`) er også håndteret; runde 17 er bogført
  APPROVAL (`2b706ea`). Cyklussen er afsluttet på main.

Code har derfor IKKE skrevet en ny version (ville duplikere en afsluttet cyklus)
og stopper per §13/§9.2. `docs/coordination/ingen-status.md` er heller ikke
oprettet — `ingen` er aktiv-pakke-sentinellen, ikke en pakke (samme symptom 3
som gate -1).

## Det NYE ift. gate -1 (begge gate-PR'er #136 + #138 er stadig ÅBNE/AFVENTER)

1. **Pause-svigt:** åben-gate-pausen er arbejdstræ-baseret
   (`scripts/kaede/tilstand.mjs:252-259` scanner `docs/coordination/mathias-gate/`
   for "AFVENTER MATHIAS"). Gate-kopien fra gate -1 er ikke længere i
   arbejdstræet (mappen fandtes ikke ved denne kørsel; årsag ukendt — den var
   untracked og dermed skrøbelig). Dirigenten så derfor ingen åben gate.
2. **Burst:** 2026-06-11T22:32:38Z affyrede dirigenten 12+ stale dispatches i ét
   poll (dispatch-log): disciplin-runde-20/21, gov-6-forslag-runde-9/28/29/31,
   selvtjek-docs.mjs-runde-12→17 — alle med spor `ingen`, alle allerede
   bogført/konvergeret på main (stikprøvet: `3655023`, `dd07699`, `2b706ea`,
   `946e12f`, `b69090b`).
3. **Parallelle instanser live:** ved denne kørsel (2026-06-12) kører flere
   headless instanser samtidig i SAMME arbejdstræ på samme burst (observeret:
   Code på SKILL-runde-23 og -24 + flere claude-ai-rolle-adapters). Risiko for
   index-/checkout-kollisioner og dublerede gate-filer.
4. **Gate-ord re-registreres:** `qwers gov-6` er registreret igen ved hvert poll
   (22:33:44Z, 22:34:50Z, 22:35:55Z, …) — dubleret registrering af samme ord.
5. **Bi-observation (exit-3-kontrakten):** adapteren (`code.sh:42`) propagerer
   claude-processens egen exit-kode; Code kan ikke selv sætte exit 3 indefra.
   Gate-FILEN er den reelle stop-mekanisme — endnu en grund til at den ikke må
   bo i en untracked fil alene.

## Handling taget af Code nu (ingen byggen videre)

- Denne gate-fil er lagt i arbejdstræet → pausen genetableres mekanisk ved
  dirigentens næste poll (fail-closed-designet virker igen, så længe filen står).
- Filen er committet på branch `gate/gov-5-stale-dispatch-2` + PR (CODEOWNERS
  default-own → review-request — notifikationskanal, jf. 403-symptomet i gate -1).
- INTET andet er ændret: ingen ny plan-version, ingen `ingen-status.md`.

## Din afgørelse

- **GODKENDT** → som gate -1: Code retter som første kæde-arbejde (a) kurérens
  tilstandslæsning (bogførte leverancer tælles som behandlede), (b) guard mod
  sentinel-værdien `ingen` i pakke-resolution, (c) pause-robusthed (gate-tilstand
  må ikke afhænge af en untracked arbejdstræ-fil — fx også tjekke committede
  gate-filer/åbne gate-PR'er), (d) notifikationskanalen (403), (e) dubleret
  gate-ord-registrering. Bogføres som gov-6-evidens (krav 8).
- **AFVIST** → kuréren stoppes (`systemctl --user stop stork-kaede`) og arbejdet
  køres manuelt (krav 7-fallback) mens kæde-fixet planlægges separat.

**Anbefaling uanset afgørelse:** stop servicen NU (`systemctl --user stop
stork-kaede`) indtil fixet er bygget — pausen har bevist sig skrøbelig, og
parallelle instanser i samme arbejdstræ er en aktiv kollisionsrisiko.

Denne gate er instans 2 af samme rod-årsag som #136/#138 — afgøres naturligt
sammen med dem.

**G/H-nummer:** foreslås rejst ved GODKENDT (hjem: huskeliste/teknisk-gæld).
**Deadline:** før næste kæde-poll (gate-filen håndhæver mekanisk — forudsat den
bliver stående i træet).

---

## Addendum 2026-06-12 — instans 3 (selvtjek-docs runde-15), bogført her

Endnu en parallel Code-instans fra samme burst (dispatch: opgave
`naeste-version`, spor `ingen`, fil
`codex-reviews/2026-06-11-selvtjek-docs.mjs-runde-15.md`, "frossen" @
`bd75da6` — selve commiten hvor runde 15-fundet blev håndteret ACCEPT).
Samme verifikation, samme konklusion: cyklus konvergeret (runde 16 @
`dd07699`, runde 17 APPROVAL @ `2b706ea`) → ingen ny version skrevet, ingen
`ingen-status.md` oprettet, servicen urørt.

Observationer fra instans 3:

- Instans 2 og 3 genetablerede **uafhængigt og samtidigt** pause-ankrene i
  træet (00:39) — instans 3's gate 2-skrivning blev kun forhindret i dublet
  af et fil-eksistens-værn. Konkret bevis på punkt 3 (parallelle instanser →
  dublet-risiko).
- claude-ai-rollen leverede parallelt tre premisse-fejls-rapporter
  (`codex-reviews/2026-06-12-ingen-troskab-1/2/3.md`, untracked i træet —
  samme transport-skrøbelighed som leverance-tabet i gate 1-addendum).
- Ingen yderligere gate-fil/PR oprettet (repo-renhed: én gate pr. rod-årsag);
  instans 3 bogføres med dette addendum.

---

## Addendum 2 (instans 2) — rod-årsag + storm-omfang, verificeret

- **Sandsynlig årsag til det forsvundne pause-anker:** repo-renheds-fejning
  (PR #146/arkiv-prune-sporet) rensede untracked filer i træet;
  `stork-kaede.service` blev genstartet 00:32:34 CEST (ExecMainStartTimestamp,
  verificeret) — **bursten fyrede 4 sekunder senere** (22:32:38Z = 00:32:38
  lokal). "Årsag ukendt" i punkt 1 ovenfor er hermed indsnævret.
- **Storm-omfang verificeret:** dispatch-loggen indeholder **27 DISPATCH-poster**
  i selve storm-pollet (22:32:3xZ) — de 12+ nævnt ovenfor var kun de sidst
  loggede.
- Gate -1-kopierne er genoprettet ordret i træet af parallel-instanser; fire
  AFVENTER-filer holder nu pausen. Denne fil er desuden committet på
  `gate/gov-5-stale-dispatch-2` (PR #147) — robust mod en ny træ-rensning,
  modsat de untracked kopier.
