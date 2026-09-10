# Fold-ind-instruks runde 2 (UDKAST) — plan v2 → plan v3 (batch efter B4), lokations-skabelon

**Status: UDKAST** (driver-10b session de4474, 2026-09-10 ~18:35, skrevet mens B4-C kører). GRUNDPLAN-v2 B4:
»rest = ∅ eller ÉN dokumenteret ekstra runde (batch → v3)« — dette er den ene ekstra runde. Alle regler i
`fold-ind-instruks-udkast.md` (runde 1) gælder uændret; nedenfor står KUN batchen og de skærpede krav.
Rolle: **planner-code** (samme rolletekst @ lock). Aktivitet: produktion. Workdir: arkiv @ `<PIN3>` UDEN
`.git`, UDEN FOR `~/.claude` (B3-lærdom). Verificér blobs med `git hash-object <fil>` (én kommando pr.
Bash-kald). Skriv KUN `plan-build/lokations-skabelon/plan.md` (v3) og `fold-ind-rapport-r3.md`.

## Bindinger (afvigelse = HALT)

- plan v2 (din forgænger, denne rundes udgangspunkt): `plan.md` @ `2069aa16e36d4b693ddad5f6166ec928ee72fa45`
- fold-ind-rapport-r2 (din forgængers påstande — 19 af 46 »RETTET M. BEVIS« var IKKE båret): `fold-ind-rapport-r2.md` @ `39936c64f96d9dc6ac97af87d7ddd8b1e20f99bb`
- **Batch-kilder (alle skal foldes ind):**
  - `plan-angreb-r2.md` @ `0b2a36ca14e05a14459694b125fde3f84dc34ca5` — §1 (19 fund »Nej« m. begrundelse) · §2 (21 kill-list-poster »Nej«) · §3 **A2-1..A2-15** m. angrebs-spec · §4 frit pas
  - `plan-audit-fresh-eyes-r2.md` @ `292d029cfb8eb0e5d65ee9ffdde04892ca117bf7` — **FUND2-1..FUND2-6** · synlighedsmangler D-2..D-8 · noter · runde-1-status · **samlet Mathias-liste** (S-1 · S-2 · B-1 · B-2 · B-4 · B-5 · D-1..D-8; B-3 udgår)
  - `plan-slutlaesning-r2.md` @ `<SLUTLAESNING-BLOB>` — code-reviewerens rest-dom + egne fund **R2-n** (fyldes ind når C er landet)
  - `fund-log.md` @ `<FUNDLOG-BLOB>` — 70 fund: 27 båret · 19 genåbnet (→ A2-n) · 24 modtaget (NF-1/NF-2 · D-1 · FUND2-1..6 · A2-1..15)
  - driver-observation **D-1** (fund-log Kilde 5): påstanden »Formålsblokken er byte-identisk med kravets Formål« er uprøvet — ret formuleringen til det der faktisk gælder (første afsnit identisk; kravets sektion har yderligere afsnit), eller gør den sand.
- uændrede låste input: krav `9402164d` · kill-list `13b78392` · forventningsliste (LÅST) `2200b76e` · recon2 `2bdbb122` · bilag `6e569779` · P-8 `4af07ef4` · ledger `<LEDGER-BLOB>` · ordbog `<ORDBOG-BLOB>` · implplan (D10/D12/D13 · Fase 3 pkt. 3/3a3/4) · adapter-krav-liste `provenance/b2-adapter-tjek.leverance.md` @ `460a9b26` (C1-input; tabel 2's »MANGLER KILDE« skal være låst i v3)

## Skærpede krav (ud over runde 1's pkt. 1-10)

11. **Hvert »RETTET M. BEVIS« peger på PRÆCIS den linje og det ID i plan v3 der bærer rettelsen** (fabrik-armen
    10/9 18:3x): rapportens kolonne »v3-afsnit« = `plan.md:<linje>` + `K-n/ac-m` (eller `K-n/S` · `K-n/ac-m/neg-k`
    · `Bid n.m` · `S-nn`), og kolonnen »bevis« nævner den negativ/observation/mutant (m. bevisform UT/FS/MH/SA og
    `reject_contract_ref`) der nu bærer hullet. En henvisning til et afsnit uden linje/ID er ÅBEN. A' verificerer
    pr. henvisning — ikke pr. påstand. Runde 1's 19 ikke-bårne fund skal hver have en NY række der viser hvorfor
    v3-teksten nu bærer det (eller ærligt »ikke rettet — kræver Mathias/åbent« m. begrundelse).
12. **A2-1..A2-15 er selvstændige fund** — én tilstand pr. A2-id (rettet m. bevis · inden for mandat m. citeret
    kilde · kræver Mathias m. spørgsmål+udfald). De 6 BLOKER (A2-1 · A2-3 · A2-4 · A2-5 · A2-11 · A2-14) skal
    enten rettes m. bevis eller give HALT-flag — »inden for mandat« er kun gyldigt med en kilde der faktisk bærer.
    Angrebs-spec'en i §3 er dit sammenligningsgrundlag pr. fund (Codex' T-/S-poster er autoritet, D10-filter).
13. **Kræver-Mathias-poster skrives IKKE væk.** Fresh-eyes' to ægte spørgsmål (S-1 gruppens feltliste FAST vs. K:181
    default · S-2 »persondata« = direct vs. K:143) er KRÆVER MATHIAS: v3 skriver spørgsmålet i hans sprog (ordbogens
    ord, scenarie, ét-ords-svar) og HVAD v3 gør i HVERT udfald (begge udfald skal være bygbare fra v3 uden ny
    plan-runde, fx som markeret variant). Du vælger IKKE svaret. B-3 udgår i nuværende form (tre beslutninger);
    B-2 relabeles til plan-valg inden for K:181; B-1 får formrettelser (»træder i kraft«, navne) og konsekvensen for
    til-kobling; B-4/B-5 skrives som bekræftelser (ét skridt fra M-17/M-36 · analogi M-30.2); D-1..D-8 som synlige
    defaults. Den samlede liste til Mathias står ÉT sted i v3 (§10) og gentages i rapporten — driveren tager den
    gennem spørgsmåls-devilen.
14. **Manifest-klar matrix (A2-10 · fabrik-armens C1):** ingen aliasrækker (fem i v2) — hver K/ac/struktur/negativ har
    PRÆCIS ét ID; K-9 får individuelle bevisformer pr. ac; hver negativ har `reject_contract_ref` (negativ-ID ·
    observationskanal · offentlig signatur/probe · fase · aktørkontekst · præcis SQLSTATE · afvisningssted/domænegrund
    — adapter-krav-listen tabel 1/UT). Matrixen sendes til fabrik-armen som sti + blob → C1's manifest afledes fra v3.
15. **Afvisningskontrakter konsistente (A2-13):** samme negativ har samme førbetingelse, sted og klasse i §0.2
    afvisnings-katalog, §1 matrix og §2 register — én kilde, henvisninger i de andre.
16. **D12/bid-orden (A2-9):** intet bid »done« må kræve bevis fra et senere bid; forudsætnings-bid → effekt-bid →
    K/ac/negativ → cases skrives eksplicit og cyklusfrit.
17. **Kill-list-dispositioner (§2 »Nej«, 21 poster):** hver får ny disposition I/R/S m. virksomt target (locus ·
    indgang · rolle · effektassertion) eller citeret begrundelse; A2-6/A2-7's »forkert disponeret«/»lover anden
    mutation« rettes ved kilden, ikke ved omformulering.
18. **P-8-kædens kildebinding (A2-14):** kildeidentitet og måltarget bindes NU (hvad der låses før build, hvad der
    fetches efter — P-8 §1), syntetiske bid-fixtures erklæres eksplicit ikke-held-out.

## Output

- `plan.md` v3 (status UDKAST, hoved m. alle OID'er inkl. `angreb_r2_oid` · `audit_r2_oid` · `slutlaesning_r2_oid`,
  ny §11 ændringslog v2 → v3 pr. fund-id).
- `fold-ind-rapport-r3.md`: tabel m. ALLE 70 fund-id'er (46 + NF-1/NF-2 + D-1 + FUND2-1..6 + A2-1..15 + R2-n) ·
  tilstand · `plan.md:<linje>` + ID · bevis/mandat/spørgsmål-med-udfald · optælling pr. tilstand · nye fund fra
  K-genlæsning · HALT-flag · kill-list-disposition (21 gen-disponerede) · den samlede Mathias-liste · bindinger.
  Kravet: ÅBNE = 0 (»kræver Mathias« er ikke åbent — det er en tilstand m. spørgsmål+udfald).
- Slutbesked: to filnavne + sha256 + optælling + HALT (eller »ingen HALT«) + bindinger. Web forbudt · antag aldrig ·
  rør ikke driverens filer.
