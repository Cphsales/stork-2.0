# Mathias-gate — gov-5-automation-stale-dispatch-1

**Status: AFVENTER MATHIAS**

**Dato:** 2026-06-11 · **Rejst af:** Code (headless kæde-kørsel — dispatch: opgave
`naeste-version`, spor `ingen`, fil `codex-reviews/2026-06-11-gov-5-automation-runde-3.md`,
frossen @ `93512d6`)
**Klasse:** TEKNISK-BLOKERING (§6.1) / §13-STOP (uventede commits ved sync) —
kæde-tilstandsdivergens

## Hvad skete (kort)

Kæden vækkede Code for at håndtere runde 3-reviewet med en ny version. Den
obligatoriske git-sync viste at arbejdet allerede ER udført og afsluttet:

- Runde 3's ene fund ([MELLEM] aktiv-plan stale "46 review-runder") blev håndteret
  **ACCEPT** og rettet i samme commit som reviewet blev bogført (`93512d6`).
- Runde 4 gav derefter **APPROVAL + §8.1-SVAR: INGEN-MODSIGELSE** (`6f47c9e`) —
  cyklussen er konvergeret.
- Eneste senere commit (`ffeaeec`) er ren formattering.

Code har derfor IKKE skrevet en ny version (det ville duplikere/genåbne en
konvergeret cyklus) og stopper per §13: uventede commits ved sync → STOP, rapportér.

## Det underliggende problem — kuréren læser tilstand forkert

Dispatch-loggen (`scripts/kaede/.dispatch-log.jsonl`, poster 18:51–18:52Z) viser at
det ikke er ét enkelt fejlskud:

1. **Runde 2-reviewet** (behandlet ACCEPT @ `eba5466`) står OGSÅ i kø til Code
   (VENT, grund: laas).
2. **Slut-rapporten** står i kø til claude-ai-rollen pga. sin →NÆSTE-linje
   (rapportens linje 87) — som pakke-status eksplicit erklærede HISTORISK efter
   dit slut OK.
3. **Spor-navnet afledes som `ingen`** (aktiv-pakke-markøren) i stedet for
   leverancens pakke: denne dispatch bad Code opdatere
   `docs/coordination/ingen-status.md` (findes ikke), og kuréren har en
   troskabs-dispatch `2026-06-11-ingen-troskab-1.md` i kø.
4. **Dit `qwers gov-6` er registreret** (18:52:41Z) — gov-6-åbningen lander oven
   i den fejllæste tilstand.
5. **Kædens notifikationskanal til dig er brudt:** bot-tokenet afvises med 403
   på issue-kommentarer (både GraphQL- og REST-ruten, efterprøvet mod #126), og
   systemd-unit'en injicerer intet andet token — mathias-adapterens
   `kommenter()` (gate-anmodninger, hash-posts, notifikationer) rammer samme
   væg i drift. Denne gate når dig derfor via PR (CODEOWNERS default-own →
   review-request) + push-notifikation i stedet.

Mønster: committet leverance-filer hvis svar allerede er bogført tælles stadig som
ubehandlede (behandlet-signalet mangler når rettelsen landede i samme/senere
commit), og →NÆSTE-deklarationer i historiske filer forældes ikke. Rod-årsags-fix
er Codes bord — efter dit ord.

## Din afgørelse

- **GODKENDT** → kæden forbliver pauset på denne gate; Code retter som første
  gov-6-arbejde (a) kurérens tilstandslæsning (stale leverancer markeres
  behandlede / historiske deklarationer forældes) og (b) notifikationskanalen
  (token-rettighed Issues:write eller alternativ kanal — symptom 5), og fundet
  bogføres som gov-6-evidens (krav 8 — præcis den fejlklasse lavrisiko-testfasen
  skal fange). Derefter genoptages gov-6-åbningen på ren tilstand.
- **AFVIST** → alternativ: kuréren stoppes (`systemctl --user stop stork-kaede`)
  og gov-6 køres i manuelt flow (krav 7-fallback) mens kæde-fixet planlægges
  separat.

Gaten pauser kæden mekanisk (åben-gate-scan, dirigent 2b) — ingen flere stale
dispatches imens. Ordet afgives på kæde-issue #126 (eneste gate-ord-flade når
`aktiv-pakke: ingen`).

## Bi-observation (ingen handling påkrævet)

`ffeaeec`'s commit-besked siger "git diff -w tom"; reelt overlever én
markdown-tabel-ruler-linje (prettier-bindestreger) en `-w`-diff — intet
tekstindhold ændret. Noteret for bogføringspræcision.

**G/H-nummer:** foreslås rejst ved GODKENDT (hjemmet er huskeliste/teknisk-gæld —
tildeles ikke her).
**Deadline:** før næste kæde-dispatch (gaten håndhæver mekanisk).
