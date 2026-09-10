# B2 — Codex' måle-adapter-tjek: prompt + kørselsrecept (UDKAST)

**Status: UDKAST** (driver-10b session de4474, 2026-09-10, uden aktør). B2's lås (GRUNDPLAN-v2 B2 ·
runbook B2 · forventningsliste §5 pkt. 1) kræver at Codex viser, om måle-adapteren kan udtrykke de
fire bevisformer UT · FS · MH · SA som særskilte udfald — herunder »læsning med nul rækker« (K-8 ac 4)
som FS-observation, ikke som fravær af fejl. Kørslen er en **dom** (read-only) men **ikke et
gate-verdikt**: `STORK_V5_GATE_INPUT` sættes IKKE, og leverancen skal IKKE slutte med en
`VERDIKT-DRAFT:`-linje (kontrakt-ændring 2 gælder kun B6). Leverancen = Codex' `-o`-output (read-only
sandbox → Codex kan ikke skrive filer i workdir'en); den arkiveres byte-identisk som
`provenance/b2-adapter-tjek.leverance.md` + `provenance/b2-adapter-tjek.{prompt.txt,provenance.txt,receipt.json}`.

## Driverens forhåndsobservation @ fd443c4 (til kalibrering af prompten — ikke en dom)

`scripts/v5/build-harness.mjs`: `runEffectHarness` = positiv SKAL lykkes + negativ SKAL afvises med
`expectCode ∈ REJECT_CODES` hvor `REJECT_CODES = ["42501"]` alene; `killMutant` = konfig-knap
apply/restore, dræbt ⟺ negAllowed under mutant; `runBuildProofEngine` = pr. K baseline + hver mutant
dræbt/restored/ren. Ingen orakel-observation af slutværdi (FS), ingen sideeffekt-observation (MH),
ingen to-sessions-barriere (SA); domæne-afvisninger (22023 · P0001 · P0002) er ikke anerkendte
reject-klasser. Forventningslisten kræver netop disse. Forventet udfald af dommen: »kan IKKE udtrykke
de fire udfald i dag« + præcis krav-liste → kontrakt-input til fabrik-armens C1 (sandheds-motoren).
Sekvens B2-lås ↔ C1 AFGJORT med mathias-9b (10/9 ~10:10): matrixen låses nu; Codex' dom stilles pr.
bevisform OG pr. K (kan adapteren @ HEAD udtrykke det i dag — ja/nej — og hvilken præcis, testbar
adapter-forpligtelse mangler: observation · reject-klasse · barriere); leverance + kvittering arkiveres
i `provenance/` og bogføres som »adapter-krav-liste modtaget« — IKKE PASS. C1 (fabrik-armen, parallelt
med B3-B7) bygger adapterkontrakten mod krav-listen + matrixen; »adapter-tjek PASS« = ny Codex-dom mod
den integrerede adapter = Trin C-kriterie før første bid. Plan-låsen (B6/B7) afhænger IKKE af
adapter-PASS (plan-gatens bindinger er krav/recon2/p8/ordbog/killlist).

## Kørselsrecept (driveren)

- Rolle: `codex-angreb` · aktivitet: `dom` (read-only) · workdir: **ren checkout @ PIN** (ikke blind
  — B2 må se planen og forventningslisten; brug `git archive` som i B1 men uden fjernelse af
  plan-build, så ingen arbejdstræ-rester følger med) · timeout 1800 s · `$OUT` uden for workdir.
- `unset STORK_V5_GATE_INPUT` før kaldet (ikke gate-verdikt). Tjekliste ellers som B1 (lock ·
  binaries.lock · preflight · suite grøn · prompt-sha256 noteret).
- Kald: `scripts/v5/codex-run.sh codex-angreb dom "$W" 1800 <out-dir>/OUT-b2-adapter.md <promptfil>`
- Efter kørsel: `$OUT` → `provenance/b2-adapter-tjek.leverance.md` (byte-identisk, sha256 noteret) ·
  receipt/provenance/prompt → `provenance/b2-adapter-tjek.*` · konklusion + krav-liste refereres i
  forventningslisten §5 pkt. 1 (status-linje) · commit + push · B2-lås: `forventningsliste-udkast.md`
  får status-linje LÅST + blob noteres i køreplanens status-log (eller rename til
  `forventningsliste.md` — afgøres når mathias-9b har svaret på B2/C1-sekvensen).

## Prompt-udkast (OID'er udfyldes ved kørsel)

```text
Du er codex-ANGREB i Stork-fabrikkens Fase 3 (Trin B2). Din rolletekst står ovenfor (injiceret af
wrapperen @ skill_oid). Pakke: lokations-skabelon. Workdir = kodebasen @ pinned commit <PIN>, uden
.git — verificér blobs med `git hash-object <fil>`. Sandbox er read-only: du skriver ingen filer; din
leverance er din afsluttende besked (den gemmes som fil af driveren). Dette er IKKE et gate-verdikt:
skriv ALDRIG strengen VERDIKT-DRAFT: nogen steder i din besked.

OPGAVE (dom, read-only): Afgør om fabrikkens MÅLE-ADAPTER kan udtrykke de fire bevisformer i
forventningslisten som SÆRSKILTE, mekanisk skelnelige udfald — og hvor den ikke kan, skriv den
præcise kontrakt-udvidelse der kræves (som input til sandheds-motoren, GRUNDPLAN-v2 Trin C1).

Bindinger (verificér — afvigelse = STOP, skriv HALT):
- forventningsliste (B2-udkast): plan-build/lokations-skabelon/forventningsliste-udkast.md @ <FL-BLOB>
  — §0 definerer UT (ulovlig tilladelse) · FS (forkert slutværdi) · MH (manglende handling) · SA
  (samtidighed) og tildelingsreglerne; §1 giver bevisform pr. ac; §3 de to E20-races; §5 pkt. 1 er
  spørgsmålet du dømmer.
- måle-adapter: scripts/v5/build-harness.mjs @ <BH-BLOB> (runEffectHarness · killMutant ·
  runBuildProofEngine · REJECT_CODES) · scripts/v5/build-proof.mjs @ <BP-BLOB> (verifyBuildProof:
  K-sæt, bids, mutants, claim_graph) · scripts/v5/prover.mjs @ <PR-BLOB>.
- krav (låst): docs/sandhed/krav/lokations-skabelon-krav.md @ 9402164d87a35fb939661058bea77c1a052493d0
- P-8: plan-build/lokations-skabelon/p8-slutproeve-spec.md @ 4af07ef4164882ca54643e79df3554c0bf22b0e4
  (§3.1 canaries · §3.3 targeted mutationer · §4.1 orakel · §4.3 samtidighed/historie)
- implplan: docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md (2.C · 2.D · Fase 3 pkt.
  3a3 · Fase 4 pkt. 3 · M-40 D10/D11/D12 · M-41 Trin C1)

METODE:
1. Pr. bevisform (UT · FS · MH · SA): (a) hvad adapteren @ PIN KAN udtrykke i dag — cite path:linjer;
   (b) hvad forventningslisten kræver som udfald (cite ac-rækker, mindst én pr. bevisform, inkl.
   K-8 ac 4 »nul rækker« for FS og K-2 ac 6 / K-6 dublet-kobling for SA); (c) GAB: præcis hvad der
   mangler — udtrykt som kontrakt (felter · reject-klasser · observationsform · barriere), IKKE som
   implementering. Ingen fri fejl-streng må kunne selv-svække et check (Codex-fund i REJECT_CODES-
   kommentaren) — sig hvordan domæne-koder (22023 · P0001 · P0002 · 42501) bindes pr. ac uden at
   åbne for »anden fejlkode tæller som afvist«.
2. Skelnelighed: kan et bevis-resultat mekanisk klassificeres som netop ét af de fire udfald (eller
   protokol-fejl)? Hvor to udfald kan forveksles (fx MH vs. FS ved manglende sideeffekt; UT-afvisning
   af forkert grund), skriv den regel der skiller dem.
3. D10/D12 mod adapteren: mutant-modellen er i dag pr. konfig-knap (killMutant.knob). Sig præcist hvad
   »én meningsfuld mutant pr. afvisnings-ac hvis værn alene bærer negativet« og »forudsætnings-bid
   binder til effekt-bid« kræver af spec-formen (kTests) — som kontrakt.
4. Frit pas: én ting forventningslisten selv mangler for at være maskin-læsbar som K-sæt til
   build-proof (Fase 4 pkt. 3: K/ac/negativ-sættet kommer fra den LÅSTE forventningsliste) — hvis
   noget; ellers skriv »INTET FUND«.

5. Pr. K (K-1..K-9, forventningslisten §1): hvilke bevisformer K's ac-rækker kræver; pr. bevisform
   ja/nej om adapteren @ PIN kan udtrykke den i dag for netop de rækker; og den præcise, TESTBARE
   adapter-forpligtelse der mangler (observation · reject-klasse(r) m. SQLSTATE · barriere) — med
   ac-nummer. K-8 ac 4 (»nul rækker« = FS) og K-2 ac 6 / K-6 dublet-kobling (SA) skal stå eksplicit.

OUTPUT (din afsluttende besked, markdown):
KONKLUSION: én af »KAN UDTRYKKE ALLE FIRE« / »KAN IKKE — adapter-krav-liste følger« / »HALT«.
Tabel 1 (pr. bevisform, fire rækker): | bevisform | kan i dag (path:linjer) | krævet af listen (ac) |
gab som kontrakt | skelne-regel |.
Tabel 2 (pr. K, ni rækker): | K | bevisformer krævet (ac) | kan i dag pr. bevisform (ja/nej) |
manglende adapter-forpligtelse (observation · reject-klasse · barriere) — testbar |.
Så D10/D12-kontrakten (pkt. 3), frit pas (pkt. 4), og din binding (alle blobs ovenfor). Ingen
påstande om udførte kørsler; web forbudt; læs ikke uden for workdir'en; opfind intet — skriv
»MANGLER KILDE« hvor en kilde ikke bærer. Din besked bogføres af driveren som »adapter-krav-liste
modtaget« (kontrakt-input til sandheds-motoren), ikke som PASS.
```

## Tjekliste før kørsel (driveren)

- [ ] CLI-preflight afgjort (samme udfald som B1) · suite grøn @ PIN · lock/rolletekst konsistent.
- [ ] `STORK_V5_GATE_INPUT` IKKE sat.
- [ ] `<PIN>`, `<FL-BLOB>`, `<BH-BLOB>`, `<BP-BLOB>`, `<PR-BLOB>` udfyldt fra `git rev-parse <PIN>:<sti>`.
- [ ] Ren checkout @ PIN bygget (archive), blobs verificeret i workdir'en.
- [ ] Efter kørsel: byte-identisk arkivering + commit + push; B2-lås efter mathias-9b's svar på
      sekvensen (låst matrix + krav-liste → C1, eller adapter-PASS mod C1-kontrakt).
