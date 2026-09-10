# B4 — delta + frit pas på plan v2: prompter + kørselsrecept (UDKAST)

**Status: UDKAST** (driver-10b session de4474, 2026-09-10, skrevet mens B3 kører). Trin B4 (GRUNDPLAN-v2
B4 · M-41 beslutning 1 · runbook B4): **codex-angreb (dom: delta + ét frit helheds-pas) ∥ fresh-eyes
(frisk claude-ai-instans, plan v2) → derefter code-reviewer som frisk slutlæser**. Alle tre dømmer
SAMME plan v2-blob (princip 5: ét delta-batch pr. runde). Output: `plan-angreb-r2.md` ·
`plan-audit-fresh-eyes-r2.md` · `plan-slutlaesning-r2.md` + fund-log (nye fund → »modtaget«). Færdig
når rest = ∅, eller ÉN dokumenteret ekstra runde (batch → v3). **Ingen af de tre er gate-verdikter**
(B6 venter på Mathias' ord): ingen `STORK_V5_GATE_INPUT`, ingen `VERDIKT-DRAFT:`-linje, ingen
`verdikt-byg`. OID'er mærket `<udfyldes>` sættes ved kørslen; prompter arkiveres i `provenance/`.

## Fælles bindinger (udfyldes efter B3-commit)

- plan v2: `plan-build/lokations-skabelon/plan.md` @ `<PLAN-V2-BLOB>` (commit `<PIN>`)
- fold-ind-rapport: `fold-ind-rapport-r2.md` @ `<RAPPORT-BLOB>` — **KUN til delta-scope (hvilke fund →
  hvilke v2-afsnit); ALDRIG som lukningsliste** (princip 6: helteksten dømmes mod K-forpligtelsen,
  ikke producentens forklaring)
- plan v1 (forgænger): `423d9b20` @ ec4a3d9 — til delta-diff
- fund-log @ `<FUNDLOG-BLOB>` (46 fund m. tilstand efter B3) · plan-angreb-r1 `c5b467db` ·
  plan-audit-fresh-eyes-r1 `cb10e231` · p4-plan-kildetjek `c50fe1f2`
- kill-list (Codex, blind) `13b78392` · forventningsliste (LÅST) `2200b76e` · krav `9402164d` · recon2
  `2bdbb122` · bilag `6e569779` · P-8 `4af07ef4` · ledger `<LEDGER-BLOB>` · ordbog `<ORDBOG-BLOB>`
  (m. plan-fasens entries) · implplan (Fase 3 pkt. 3/3a3/3b/4 · D10/D12/D13)

## Delta-scope (driveren udleder MEKANISK før kørsel, lægges i workdir som `b4-delta-scope.md`)

1. `diff` plan v1 (423d9b20) → v2: ændrede afsnit/linjer (unified diff, arkiveret).
2. Pr. fund i fold-ind-rapporten: fund-id → tilstand → v2-afsnit → berørte K/ac/negativer (fra
   rapportens rækker + forventningslistens kildeankre).
3. Afhængigheds-lukning: de K/negativer/bids som de ændrede afsnit refererer (matrix-rækker ·
   bid-afhængigheder · D12-relationer) — **delta = rettelserne OG det de berører, ikke kun
   diff-linjerne** (princip 4).

---

## Prompt A — codex-angreb: delta-verifikation + ét frit helheds-pas (dom, read-only)

Kørsel: `codex-run.sh codex-angreb dom "$W" 2400 <out>/OUT-angreb-r2.md <promptfil>` · workdir = fuldt
arkiv @ PIN uden `.git` · `STORK_V5_GATE_INPUT` IKKE sat · leverance = `-o` (read-only kan ikke skrive
filer) → `plan-angreb-r2.md` byte-identisk + `provenance/plan-angreb-r2.*`.

```text
Du er codex-ANGREB i Stork-fabrikkens Fase 3, runde 2 (M-41 beslutning 1: ét samlet rettelses-batch +
delta på berørte krav/negativer/afhængigheder + ét frit helheds-pas). Din rolletekst står ovenfor.
Pakke: lokations-skabelon. Workdir = kodebasen @ pinned commit <PIN>, uden .git — verificér blobs med
`git hash-object <fil>`. Dette er IKKE et gate-verdikt: skriv aldrig strengen VERDIKT-DRAFT: nogen
steder. Web forbudt. Læs ikke uden for workdir'en.

INPUT (verificér — afvigelse = STOP, skriv HALT):
- plan v2: plan-build/lokations-skabelon/plan.md @ <PLAN-V2-BLOB>
- plan v1: din runde-1-genstand — IKKE i workdir; brug b4-delta-scope.md (driverens mekaniske diff v1→v2
  + fund→afsnit→berørte K) som delta-kort. Dine egne runde-1-fund: plan-angreb-r1.md @ c5b467db (A-1..A-15).
- fold-ind-rapport-r2.md @ <RAPPORT-BLOB> — KUN som kort over hvad planneren SIGER er ændret; ALDRIG som
  lukningsliste. Du dømmer helteksten mod den oprindelige K-forpligtelse (rolletekst »Beskriv ≠ luk«).
- fund-log.md @ <FUNDLOG-BLOB> (46 fund m. tilstand) · plan-audit-fresh-eyes-r1.md @ cb10e231 (FUND-1..5) ·
  p4-plan-kildetjek.md @ c50fe1f2 (F01-F16 · U01-U10)
- din egen BLINDE kill-list: kill-list-udkast.md @ 13b78392 (autoritet; plan v2 skal folde den ind med
  D10-filter — dokumenteret pr. mutant)
- forventningsliste (LÅST) @ 2200b76e · krav @ 9402164d · recon2 @ 2bdbb122 · bilag @ 6e569779 · P-8 @
  4af07ef4 · ledger @ <LEDGER-BLOB> · ordbog @ <ORDBOG-BLOB> · implplan (D10/D12/D13 · Fase 3 pkt. 3/3a3/4)

OPGAVE, to pas — begge obligatoriske:
PAS 1 — DELTA: for HVERT af de 46 fund (A-1..A-15 · FUND-1..5 · F01-F16 · U01-U10) og for hver post i din
kill-list (Tn.m · Sn.m · SL): (a) er tilstanden i fold-ind-rapporten BÅRET af plan v2's tekst? »Rettet m.
bevis« kræver at v2 nu bærer den negativ/observation/mutant der lukker hullet (cite v2 path:linjer +
bevisform fra forventningslisten); »inden for mandat« kræver at den citerede kilde (K:linje · M-ord ·
recon @ OID · P-8-afsnit) faktisk bærer planen; »kræver Mathias« kræver et præcist forretningsspørgsmål
m. udfald. En tilstand der ikke bæres = ÅBENT fund (nyt id A2-n). (b) Berørte K/ac/negativer/
afhængigheder (b4-delta-scope.md pkt. 3): er de stadig konsistente efter rettelsen — ingen ac blevet
svagere (»designet UD« uden offentlig negativ · positiv kontrol tabt · SA nedgraderet · D12-relation
brudt · bid-orden brudt)? (c) Kill-listen: pr. K — er hver Tn.m enten indfoldet (én meningsfuld mutant
gennem effekt-stien, D10) eller eksplicit skåret m. citeret begrundelse? SL-poster: leverer v2 værnet?
»MANGLER KILDE«: har v2 låst præcis kode/tilstand (SQLSTATE · afvisningssted · førbetingelse)?
PAS 2 — FRIT HELHEDS-PAS (katalog-opslag er ikke nok — princip 4): læs v2 som helhed og spørg om to
lokalt rigtige dele tilsammen bryder et K, en negativ eller P-8's kæde C0-C10 / canaries N1-N9; om
bid-opdelingen er afhængigheds-ordnet og prover-bevisbar; om matrixen er en bijektion (ingen K uden
bid+test, intet rogue-bid); om ID-reglerne (K-n/ac-m · K-n/S · K-n/ac-m/neg-k) er fulgt uden aliasser;
om E20-snittet holder (kun T2.6/T6.2 som SA). Skriv det som selvstændige fund (A2-n), ikke som
kommentarer.

OUTPUT (din afsluttende besked, markdown): 
1) »Rest-status: TOM« eller »Rest-status: n åbne« øverst.
2) Tabel pr. fund-id (46 + kill-list-poster): | id | rapportens tilstand | BÅRET ja/nej | v2 path:linjer |
hvis nej: hvorfor + hvad der mangler |.
3) Nye fund A2-1..A2-n: alvor (BLOKER/RET) · akse · kort · berører (K/ac) · citat (v2 path:linjer) ·
hvad der lukker det (bevisform). Ingen fund = »INGEN NYE FUND« med begrundelse for hver af pas 2's
spørgsmål.
4) Binding (alle blobs). Ingen påstande om udførte kørsler. Opfind intet — »MANGLER KILDE« hvor kilden
ikke bærer.
```

## Prompt B — fresh-eyes: antag-aldrig-audit af plan v2 (frisk claude-ai-instans, read-only)

Kørsel: `claude -p --model claude-fable-5-1 --effort xhigh --permission-mode dontAsk --settings
<read-only-settings: kun Read/Grep/Glob + Bash til læsning/hash; Write/Edit/web/rm/cp/mv/git add-commit-push nægtet> --output-format json < promptfil` fra workdir @ PIN (arkiv uden `.git`); prompt =
`claude-ai.md` @ PIN (byte-identisk, hash = lock.skill_oid) + separator + opgaven. FRISK instans =
ny session, ingen historik (runde-1-auditten var samme instans som krav-auditten — det gentages ikke).
Leverance = result-JSON'ens tekst → `plan-audit-fresh-eyes-r2.md` + `provenance/plan-audit-fresh-eyes-r2.*`.

```text
Du er en FRISK fresh-eyes-instans i claude-ai-rollen (rolleteksten ovenfor). Du har IKKE skrevet
kravet eller planen og har ingen historik. Pakke: lokations-skabelon. Workdir = kodebasen @ <PIN> uden
.git — verificér blobs med `git hash-object <fil>`. Kun læsning (ingen skrivning). Web forbudt.

OPGAVE — antag-aldrig-audit af plan v2 (plan-build/lokations-skabelon/plan.md @ <PLAN-V2-BLOB>), som
runde 1's plan-audit (plan-audit-fresh-eyes-r1.md @ cb10e231, afsnit »## Plan-audit (blob 423d9b20)«)
men mod v2 og med runde 2's tre pligter:
1. UBEKRÆFTEDE AFLEDNINGER: hver påstand i v2 om forretningen (hvad Mathias vil, hvad der »gælder«,
   default-valg, sprog/navne) skal bæres af krav @ 9402164d (K:linje), ledger @ <LEDGER-BLOB> (M-n,
   verbatim), ordbog @ <ORDBOG-BLOB> eller P-8 @ 4af07ef4 — ellers er den et fund (FUND2-n) m. citat ·
   hvorfor kilden ikke bærer · forslag (bekræftelse hvis ét-skridts-afledning af et M-ord, ellers
   ægte spørgsmål i Mathias' sprog m. ét-ords-svar). Kravet har forrang: en plan-afledning der
   indsnævrer et K (fx »persondata« → »direct«) er et fund uanset planens begrundelse.
2. RUNDE-1-FUND (FUND-1..5) + de »kræver Mathias«-poster fold-ind-rapporten (@ <RAPPORT-BLOB>) angiver:
   er hver enten fjernet fra v2, markeret som bekræftelse, eller formuleret som spørgsmål m. udfald?
   Rapporten er kort, ikke lukningsliste — du læser v2's tekst selv.
3. FORM TIL MATHIAS: de »kræver Mathias«-spørgsmål v2/rapporten rejser — er de ét spørgsmål hver, i
   hans sprog (ordbogens ord), med scenarie og ét-ords-svar, og materialitets-testet (M-33: kan svaret
   afledes af et eksisterende M-ord → bekræftelse, ikke spørgsmål)? Lav ÉN samlet liste (kilde ·
   eksisterende svar · materialitet) — det er den liste driveren tager til devil-passet.

OUTPUT (markdown): »Rest-status: TOM / n fund« øverst · positivt først (hvad der bæres, m. kildeankre) ·
FUND2-n m. citat/hvorfor/forslag · runde-1-status pr. FUND-1..5 · den samlede Mathias-liste · binding
(alle blobs). Antag aldrig; skriv »MANGLER KILDE« hvor ingen kilde findes. Aldrig kode/buildability.
```

## Prompt C — code-reviewer: FRISK slutlæser (efter A og B er landet; read-only)

Kørsel: `claude -p --model claude-fable-5-1 --effort xhigh --permission-mode dontAsk --settings
<read-only-settings: kun Read/Grep/Glob + Bash til læsning/hash; Write/Edit/web/rm/cp/mv/git add-commit-push nægtet> --output-format json < promptfil` fra workdir @ PIN2 (arkiv efter commit af A+B's
leverancer) · prompt = `code-reviewer.md` @ PIN2 + opgaven. Leverance → `plan-slutlaesning-r2.md` +
`provenance/plan-slutlaesning-r2.*`. **Ikke gate-verdiktet** (det er B6, samme rolle, senere, m.
`STORK_V5_GATE_INPUT`) — dette er M-41's »code-reviewer som frisk slutlæser« der afgør rest = ∅.

```text
Du er code-reviewer (rolleteksten ovenfor) som FRISK SLUTLÆSER i Fase 3 runde 2 (M-41 beslutning 1) —
ikke gate-dommer (den dom kommer senere, bundet til gaten). Workdir = kodebasen @ <PIN2> uden .git —
verificér blobs med `git hash-object <fil>`. Kun læsning. Web forbudt.

INPUT: plan v2 @ <PLAN-V2-BLOB> · kill-list-udkast.md @ 13b78392 · forventningsliste (LÅST) @ 2200b76e ·
krav @ 9402164d · recon2 @ 2bdbb122 · P-8 @ 4af07ef4 · plan-angreb-r2.md @ <ANGREB-R2-BLOB> ·
plan-audit-fresh-eyes-r2.md @ <AUDIT-R2-BLOB> · fold-ind-rapport-r2.md @ <RAPPORT-BLOB> (kort, ikke
lukningsliste) · fund-log @ <FUNDLOG-BLOB> · implplan (D10/D12/D13).

OPGAVE (rolletekstens »Beskriv ≠ luk« sidste sætning: du læser uden producentens egen forklaring på
hvorfor alt er løst):
1. Læs plan v2 HELT som frisk læser mod K-1..K-9's oprindelige forpligtelse (krav + forventningsliste):
   pr. K — rammer de planlagte tests slut-effekten (public entrypoint · ikke-bypass · hård slut-effekt;
   helper-return = FAIL)? Er kill-listens Tn.m indfoldet tilstrækkeligt (D10, gennem effekt-stien) og
   SL-værnene leveret? Er teknisk troskab holdt (overclaim · teach-to-the-test · teknik-forklædt
   afvigelse)? Er bid-opdelingen afhængigheds-ordnet m. D12-relationer og »done« pr. bid?
2. Rest efter runde 2: hvert åbent fund fra plan-angreb-r2 og plan-audit-fresh-eyes-r2 — er det ægte
   åbent, eller båret af v2 (cite path:linjer)? Tilføj egne fund (R2-n) hvor du ser noget begge missede.
3. Dom om rest: »REST = ∅« (alle tre kilder tomme eller båret) ELLER »REST ≠ ∅ — én ekstra runde
   nødvendig« m. den præcise batch (hvilke fund → hvilke v2-afsnit).

OUTPUT (markdown): rest-dom øverst · pr. K én linje (dybde · troskab · kill-list · bid) m. path:linjer ·
åbne fund m. kilde-id · egne fund R2-n · binding. Godkend aldrig ved fravær af indvending — positivt
kræver sti-bundet evidens. Antag aldrig — uklart → HALT.
```

## Rækkefølge og commit-orden (driveren)

1. B3 committet + pushet (plan v2 · fold-ind-rapport-r2 · fund-log opdateret · ordbog-entries) → PIN.
2. Delta-scope udledt mekanisk (`b4-delta-scope.md`, committet før kørsel) → A ∥ B spawnes på SAMME
   PIN/blob; resultater arkiveres byte-identisk i SAMME arbejdsgang (A1-lærdom); nye fund → fund-log
   »modtaget«; commit + push → PIN2.
3. C spawnes @ PIN2 (ser A + B) → arkiveres → commit + push.
4. Rest = ∅ → B5 (pullet) → B6 venter på Mathias' ord. Rest ≠ ∅ → ÉN dokumenteret ekstra runde: samlet
   batch → planner (v3, samme instruks + batch) → A/B/C igen på v3 (princip 5: ét delta-batch pr. runde).
