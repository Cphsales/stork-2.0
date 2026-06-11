# gov-6 — Forslag og udskudte punkter (katalog)

**Status-ramme (Mathias-beslutning 2026-06-11 — det ENESTE låste):** gov-6 er
UDSKUDT, ikke droppet. Åbnes igen når Mathias afgør det. Form: fuld gennemgang af
V5 + implementering af mangler + rettelse af fejl. Alt i dette katalog er
FORSLAG/ÅBENT og afgøres af Mathias i pakkens krav-dok-dialog — intet låses før.
Kataloget sikrer at intet kun lever i chat eller hukommelse. Code fører kataloget
på Mathias-ord; punkter forlader det når de afgøres (ind i krav-dok/plan) eller
bevidst slettes.

## 1 · Forslag til pakkens form (afgøres i krav-dok-dialogen)

- [FORSLAG] Emne-lags-form: ét krav-dok m. mål-tegning som ramme, bidder under,
  hver bid = fuldt kæde-gennemløb (krav 8 bevises gentagne gange). Tidligere
  drøftet 12/6 som omdefinering — nu kun forslag.
- [FORSLAG] Scope-kandidat: dokument-sandhed/-fornyelse — docs-fundene i afsnit 4
  som recon-forspring til dialogen.
- [FORSLAG] Pakkenavn afgøres i dialogen (åbningen 2026-06-11 brugte `gov-6`;
  ældre plan-tekst sagde `gov-6-arkiv-fold` — divergensen lukkes ved navnevalget).
- [ÅBENT] Krav-kandidat (Mathias): LØBENDE led-status til telefonen + TO-VEJS bred
  indgang mellem gates (spørgsmål/observation mid-spor). Hvad det konkret betyder,
  mærkes i gennemløbene.

## 2 · Cowork som kandidat-mekanisme til to-vejs-kanalen [FORSLAG]

Desktop-appens Cowork: fil-adgang (postkasse-mønster), mobil→desktop-opgaver,
scheduled tasks til led-status. Codes hegn (2026-06-11):

- Postkassen er INFORMATIONS-kanal (fakta/spørgsmål/observationer) — ALDRIG
  gate-flade: author-verifikation kan ikke flyttes til en lokal fil; gates bliver
  på GitHub.
- Test-spørgsmålet er Cowork-SANDBOXENS adgang til `\\wsl.localhost\Ubuntu\...`
  (ikke Windows→WSL generelt; kæden poller, så inotify-grænsen er irrelevant).
  10-minutters-test: Cowork-opgave skriver én fil i gitignored postkasse-mappe →
  WSL læser → samme vej tilbage.
- Baseline-kandidat der skal slås: GitHub-fladen — issue-kommentarer mid-spor
  (ny leverance-type i regelbogen) + kurér-postet led-status; ingen ny aktør,
  ingen ny trust-flade, kører på GitHub Mobile som preflight alligevel kræver.

Hjem: behovet → krav-dok-dialogen; mekanik-evalueringen → partnerskabs-runden
(sammen med Claude-app-gennemgangen).

## 2b · App-adgangs-helheden (Code-vurdering 2026-06-11 — Mathias bad om helhed, afløser tidligere udskydelse til runden)

Verificeret på disk: desktop-appen har INGEN lokal MCP-config; SKILL.md's
"Filesystem-MCP fra repoet" refererer en connector der ikke findes; project
knowledge er stale (april-filer). Kontrolpostens lag (krav-dok-dialog +
gate-læsninger) er dermed systemets dårligst forsynede — kassens
Claude.ai-fejlklasser (stale referencer, gamle hjemler) deler denne rod, og §13's
frisk-pull-bekræftelse er en manuel omgåelse af hullet.

- [FORSLAG, anbefalet] GitHub-connector i appen → Cphsales/stork-2.0 (Mathias-klik,
  mgrubak-auth, read): frisk merged-sandhed + PR-branch-læsning (slut-rapport-review)
  + mobil. §13-ceremonien bortfalder. Hegn: §1-docs-lag forbliver instruks-båret.
- [FORSLAG, sekundær] Filesystem-MCP scopet til `\\wsl.localhost\Ubuntu\...\docs`
  hvis arbejdstræ-læsning ønskes — mekanisk rollehegn, men værts-afhængig, kun desktop.
- [ÅBENT] Project knowledge degraderes (5 stale filer slettes; ÉN-versions-reglen).
- [AFVENTER mekanisme-valg] SKILL.md-rettelse (Code-PR) så instruksen matcher den
  valgte adgangsvej — docs foregriber ikke valget.

## 3 · Udskudte tekniske punkter (VENT — kun bogført, ikke implementeret)

- [FORSLAG] 2a model-/effort-tiering pr. KAEDE_OPGAVE (+ claude-ai-adapteren i
  samme matrix). Betingelse: selvtjek-værn bevist i kæde-gennemløb + 0a-tal.
  Hegn: Codex-gaten urørt · konservativ klassifikation · nedgradering aldrig før
  værnene står.
- [FORSLAG] 3a timeout-konstanter fra adapters → kaede-regler.json
  (konfiguration-i-data-invarianten).
- [FORSLAG] Codex-gate-genbesøg (omfang på rene pointer-synk-reviews): beslutning
  på EVIDENS efter 1a-selvtjek-greppet har kørt en hel pakke.
- [FORSLAG] Fold-politik for codex-reviews/ (mappen vokser hurtigt; §4-rydningen
  sker ved gov-5-pakke-luk — politikken for fremtidige pakker afklares her).

## 4 · Docs-fund (kassens afsnit 7 — recon-forspring til dialogen)

- [ÅBENT] permission-matrix dateret 2026-05-15 = FØR gov-3b's SECDEF-konverteringer
  (regenerering uverificeret).
- [ÅBENT] `docs/claude-ai/SKILL.md` bærer før-gov-5-rolle.
- [ÅBENT] aktiv-plan.md er vokset til log — sanering.
- [ÅBENT] plan-feedback/ er tom — afklaring.
- [FORSLAG] 1.0-reference (storks-logikker, frontend-sider-oversigt) → mærket
  repo-arkiv så kædens recon når dem; destillering pr. emne når emnet åbner.

## 5 · Punkter med hjem i partnerskabs-runden (pointer — substansen bor i kassen)

Kryds-validerings-modellen (måles i gov-6 + forretnings-trin først) · plan-fasens
bidde-struktur (monolit-fundet) · glid-fangst-resthullet (tvillinge-hukommelse,
mønstre på tværs) · dyb-kontekst-deklarationen (handlings-bias) ·
overgangs-spørgsmålet (headless gate før bevis) · Claude-app-gennemgangen
(Scheduled Tasks, Routines, plugins, Cowork-mekanikken) · samarbejdsformen
(ping/pong mid-fase, "validering ≠ greatness").

## 6 · Mathias' åbne flade-punkter [ÅBENT — hans klik/ord]

5d interaktiv permission-model (bud: prompts interaktivt, skip i kæden) ·
app-project-filer (5 stale fra 1.0-æraen slettes) · instructions-tekstens stale
referencer · strøm-/sleep-opsætning på værten (krævet før natlig kædedrift) ·
telefon-push/GitHub Mobile-modtagesiden (preflight-punktet i rette-til-pakken
verificerer opsætningen) · ÉN-versions-reglen i app-projektet · skill-klik
(venter til repo-SKILL.md er løst).
