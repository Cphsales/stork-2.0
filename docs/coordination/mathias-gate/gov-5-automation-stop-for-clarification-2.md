# gov-5-automation — STOP-FOR-CLARIFICATION 2 (stale kæde-dispatch, instans 2 — pause-ankeret overlevede ikke genstart)

**Status: AFVENTER MATHIAS**
**Dato:** 2026-06-12
**Rejst af:** Code (headless kæde-kørsel, disciplin §9.2 / §3.7 / §6.3)
**Repo-state ved STOP:** main @ `b69090b` (rent træ ved vækning, HEAD = origin/main)
**Relateret:** gate 1 (`gov-5-automation-stop-for-clarification-1.md`, PR #136) — samme fejl-klasse, stadig AFVENTER MATHIAS (PR OPEN, ingen gate-ord registreret)

## Hvad kæde-opgaven bad om

> Reviewet i `docs/coordination/codex-reviews/2026-06-11-disciplin-runde-21.md`
> (frossen @ `267aa91…`) kræver næste plan-version: håndtér hvert fund eksplicit
> (ACCEPT/PUSHBACK/PROPOSE-ALTERNATIVE), skriv V<n+1>, commit+push.
> Til sidst: opdater `docs/coordination/ingen-status.md` (…) '→NÆSTE: …'.

## Afvigelse — samme fejl-klasse som gate 1, ny instans

1. **Runde 21-fundet er allerede håndteret og lukket** — i præcis den commit
   dispatchen fryser på. `267aa91` (på main; eneste commit der rører filen)
   bogfører reviewet OG lukker dets ene [MELLEM]: runde 20 klassificeret
   UGYLDIG (kørt mod tom upstream-diff), runde 21 GÆLDENDE, "MELLEM gjaldt
   kun runde 20-artefaktet (lukket ved denne klassifikation)".
2. **Ingen plan-version at inkrementere.** Reviewets pakke-felt siger
   "disciplin", fase docs — `docs/strategi/disciplin.md` er en V5-styret
   governance-doc, ikke en plan-serie. En "V22" ville være fabrikation.
3. **Målfilen findes stadig ikke.** `docs/coordination/ingen-status.md`
   eksisterer ikke; "ingen" er fortsat sentinellen fra aktiv-plan-markøren
   `<!-- aktiv-pakke: ingen -->` (samme template-fejl som gate 1, punkt 3).

## NYT ift. gate 1 — åben-gate-pausen er ikke genstarts-robust (fail-open påvist)

- Gate 1 pausede "ingen"-sporet via untracked gate-kopi i arbejdstræet
  (pausen er arbejdstræ-baseret, `tilstand.mjs:252-259`; SPOR-PAUSET
  bekræftet 2026-06-11 18:53:46Z).
- `stork-kaede.service` blev genstartet 2026-06-12 00:32:34 CEST
  (22:32:34Z). Ved genstart var arbejdstræet RENT — pause-ankeret
  (untracked gate-kopi) var væk.
- **4 sekunder efter genstart** (22:32:38Z) masse-dispatchede kuréren ~22
  stale opgaver på "ingen"-sporet i parallel (dispatch-log: 10 × code
  "naeste-version" + 12 × claude-ai-rolle "krav-troskabs-tjek" — alle på
  reviews der allerede er bogført/lukket på main). Denne Code-vækning er
  dispatch'en 22:32:38.580Z på disciplin-runde-21.
- **Leverance-tab:** claude-ai-rollens leverance fra instans 1
  (`codex-reviews/2026-06-11-ingen-troskab-1.md`, untracked, afventede
  transport-commit jf. gate 1-addendum) findes ikke i nogen commit
  (`git log --all` tom) — den blev slettet sammen med pause-ankeret.
- Konsekvens: åben-gate-pause OG utransporterede leverancer hviler på
  untracked filer der ikke overlever genstart/oprydning af arbejdstræet.
  Det er fail-open — i modstrid med kædens eget fail-closed-princip (§6.2).
- `qwers gov-6` står fortsat GATE-ORD-REGISTRERET hvert poll uden dispatch
  (uændret fra gate 1-addendum) — gov-6 er stadig fanget bag "ingen"-sporet.

## Handling udført (minimal — intet byggeri forbi STOP)

- **Pause-ankeret genoprettet:** gate 1-filen lagt ordret tilbage i
  `docs/coordination/mathias-gate/` (fra gate-branchen) + denne fil lagt
  ved siden af → sporet pauser igen ved næste poll (~65 s interval).
- Denne fil committet til `gate/gov-5-automation-stale-dispatch` og pushet
  (PR #136 bærer nu begge instanser).
- IKKE udført (fabrikation, jf. gate 1): ingen V-version skrevet, ingen
  `ingen-status.md` oprettet, ingen →NÆSTE-deklaration på "ingen"-sporet.
- Kuréren er IKKE stoppet (system-state-ændring uden mandat) — men se
  afgørelses-punkt 2.

## Mathias afgør (GODKENDT/AFVIST på opgaven + nyt driftspunkt)

1. **Opgaven (AFVIST forventet, uændret fra gate 1):** dispatchen er
   forældet/fejl-afledt → ingen handling, gaten lukkes sammen med gate 1.
2. **NYT — kurér-drift indtil fejlen er rettet:** pausen genoprettes nu,
   men holder kun til næste gang arbejdstræet ryddes/servicen genstarter.
   Anbefaling (Codes bord, kræver Mathias-mandat): stop kuréren
   (`systemctl --user stop stork-kaede`) til rette-til-pakken har
   (a) guardet dirigentens pakke-resolution mod sentinellen `ingen`,
   (b) gjort åben-gate-pausen persistent (ikke arbejdstræ-baseret),
   (c) gjort leverance-transport robust mod arbejdstræ-oprydning.
   Manuelt flow består som dokumenteret fallback (krav 7).
   Alternativ: lad kuréren køre videre — accepteret risiko er nye
   masse-dispatches (~20 stale opgaver i kø) hver gang pausen tabes.

## Verifikations-spor

- Dispatch: `scripts/kaede/.dispatch-log.jsonl` 22:32:38.580Z — DISPATCH
  code/naeste-version på disciplin-runde-21, spor "ingen", sha `267aa91…`;
  efterfølgende VENT (laas) 22:33:44 / 22:34:50 / 22:35:55Z på samme fil
- Masse-dispatch: 22 DISPATCH-linjer 22:32:38.558–38.615Z, alle spor "ingen"
- Service-genstart: `systemctl --user status stork-kaede` → active since
  2026-06-12 00:32:34 CEST; preflight OK (status=0)
- Fund lukket: `git log --oneline -1 -- docs/coordination/codex-reviews/2026-06-11-disciplin-runde-21.md` → kun `267aa91` (bogført + lukket i samme commit); `git branch --contains 267aa91…` → main
- Gate 1 uafgjort: PR #136 OPEN, 0 kommentarer; ingen GODKENDT/AFVIST i
  dispatch-log (kun gentaget GATE-ORD-REGISTRERET "qwers gov-6")
- Leverance-tab: `git log --all --oneline -- docs/coordination/codex-reviews/2026-06-11-ingen-troskab-1.md` → tom
- `gh auth status` → aktiv konto stork-code-bot (preflight-verificeret)
