# B1 — Codex' BLINDE kill-list-udkast: prompt + blind-workdir-recept (UDKAST)

**Status: UDKAST** (driver-10b 2026-09-09, uden aktør). Kørslen starter FØRST når mathias-9b har
meldt »Trin A færdig« og den nye `codex-run.sh` er committet (rolle → model/effort/sandbox afledes af
`actors.lock`; BLOKER hvis rolletekst@HEAD ≠ lock). Den endelige prompt (med OID'er udfyldt)
arkiveres byte-identisk i `provenance/` efter kørslen (A1-reglen). Rolleteksten der gælder, er den
P-6-konsistente `codex-angreb.md` efter Trin A — afsnittene »Kill-listen: afledningsmetode +
obligatorisk gulv« og »Timing + snit mod planner« er grundlaget for prompten nedenfor; læs den
endelige version igennem før kørsel og ret prompten hvis snittet er ændret.

## Hvorfor blind (GRUNDPLAN-v2 princip 2 · B1 · Claude F-1 · V-3)

Kill-listen i plan v1 (§1, »Kill-list-UDKAST pr. K«) er skrevet af planneren — den der også skrev
det beviset skal ramme. Codex' liste skal være den uafhængige blinde vinkel: skrevet fra låst krav +
recon-2 (+ P-8, som selv er blind for planen), UDEN at have set plan v1 eller noget afledt af den.
Blindhed er mekanisk (filerne findes ikke i workdir'en; ingen versionshistorik at genskabe dem fra)
og bevist ved commit-orden: `kill-list-udkast.md` committes FØR planneren får den som input til v2.

## Blind workdir — recept (driveren udfører; alt logges i provenance)

```bash
PIN=<pinned commit — HEAD på branchen ved kørsel, fx 5dac500 eller nyere efter Trin A>
W=/home/mathias/.claude/jobs/d2883eb4/tmp/b1-blind        # ingen .git — plan.md kan ikke genskabes
mkdir -p "$W" && git archive "$PIN" | tar -x -C "$W"
rm -rf "$W/plan-build/lokations-skabelon"                  # ALT plan-afledt væk i ét hug
mkdir -p "$W/plan-build/lokations-skabelon"
# kun de fire lovlige plan-build-input lægges tilbage — ved blob, ikke ved arbejdstræ:
git show "$PIN":plan-build/lokations-skabelon/recon2.md              > "$W/plan-build/lokations-skabelon/recon2.md"
git show "$PIN":plan-build/lokations-skabelon/p8-slutproeve-spec.md  > "$W/plan-build/lokations-skabelon/p8-slutproeve-spec.md"
git show "$PIN":plan-build/lokations-skabelon/mathias-ord.md         > "$W/plan-build/lokations-skabelon/mathias-ord.md"
git show 04e5cfb:plan-build/lokations-skabelon/ordbog.md             > "$W/plan-build/lokations-skabelon/ordbog.md"   # FØR-plan-blob 714f9b80
# verificér blobs i workdir'en (ingen .git → hash-object er den eneste vej, og den virker uden repo):
git hash-object "$W"/docs/sandhed/krav/lokations-skabelon-krav.md \
                "$W"/plan-build/lokations-skabelon/{recon2,p8-slutproeve-spec,mathias-ord,ordbog}.md \
                "$W"/recon/recon-2-bilag.md
# forventet: 9402164d · 2bdbb122 · 4af07ef4 · <ledger-blob @ PIN> · 714f9b80 · 6e569779
grep -rl "423d9b20\|lokation_status_skift\|lokation_opret" "$W" --include=*.md | grep -v recon2.md   # skal være TOM
```

**Hvad Codex ser:** hele kodebasen @ PIN (migrationer, scripts, fitness, roller) · krav (låst) ·
recon2 + recon-2-bilag (mutationsfrø) · P-8 · ledger M-1..M-41 · ordbog @ før-plan · implplan.
**Hvad Codex IKKE ser:** plan.md · forventningsliste-udkast · fold-ind-instruks-udkast · fund-log ·
plan-angreb-r1 · plan-audit-fresh-eyes-r1 · p4-plan-kildetjek · drift-log · ordbogens plan-sektion
· alle øvrige plan-build-filer (buildability, verdikter, krav-udkast — irrelevante for B1 og
fjernet for enkelhed). NB: recon2.md nævner kandidat-navne (fx `lokation_opret`) som recon-forslag
— det er recon-føde, ikke plan-indhold, og er tilladt.

**Kald (ny wrapper efter Trin A):**
`scripts/v5/codex-run.sh codex-angreb produktion "$W" 2400 <out-dir>/OUT-killlist.md <promptfil>`
— sandbox = workspace-write (den skriver én fil i workdir-roden) · model/effort fra lock · PID-fil
`$OUT.pid` · provenance `$OUT.provenance` (gives til `verdikt-byg.mjs` som 5. arg hvis kørslen
skal bindes i et verdikt; B1 er produktion, ikke dom). Preflight (altid nyeste CLI · pinned model
tilgængelig) kører før spawn som altid. **To regler fra v3-wrapperen (mathias-9b 09-09 13:5x):**
(1) rolleteksten @ `skill_oid` injiceres AUTOMATISK som første del af prompten (P2 F-5) — kopiér
den IKKE ind; prompt-filen indeholder KUN opgaven. (2) `$OUT` (Codex' slutbesked · provenance ·
PID) SKAL ligge uden for workdir'en — wrapperen blokerer ellers; leverancen `kill-list-udkast.md`
skrives af Codex i workdir-roden og hentes derfra byte-identisk. (3) B1 er PRODUKTION: miljøet må
IKKE have `STORK_V5_GATE_INPUT` sat (kontrakt-ændring 1) — `unset` før kaldet. Skriver wrapperen en
`$OUT.receipt.json`, arkiveres den også (`provenance/kill-list-udkast.receipt.json`). (4)
`scripts/v5/binaries.lock.json` skal matche den installerede codex-CLI; opdaterer preflight CLI'en,
skal låsen committes FØR kaldet (fabrik-armens fil — meld, kør ikke selv).

**Efter kørsel (driveren):** `cmp` + sha256 af `$W/kill-list-udkast.md` → kopi byte-identisk til
`plan-build/lokations-skabelon/kill-list-udkast.md` (gate-bundet navn, `DEFAULT_LAYOUT.killlist`)
· prompt + provenance + Codex-slutbesked → `provenance/kill-list-udkast.*` · fund-log: kill-listens
poster registreres IKKE som fund (den er input til B3), men kørslen noteres i drift-log · COMMIT +
PUSH FØR planneren startes (commit-orden = blindheds-bevis) · derefter B2-lås.

## Prompt-udkast (OID'er udfyldes ved kørsel)

```text
Du er codex-ANGREB i Stork-fabrikkens Fase 3. Din rolletekst står ovenfor (injiceret af
wrapperen @ skill_oid) — følg den, især »Kill-listen: afledningsmetode + obligatorisk gulv« og
»Timing + snit mod planner«. Pakke: lokations-skabelon. Workdir = kodebasen @ pinned commit <PIN>,
uden .git — verificér blobs med `git hash-object <fil>`.

OPGAVE: skriv dit EGET kill-list-UDKAST pr. K — BLINDT. Du har IKKE planen (den er bevidst fjernet
fra workdir'en); du skriver fra kravet og recon-2 alene, så listen bliver den uafhængige vinkel
plan-gaten skal dømme planens dybde mod. Forsøg ikke at rekonstruere eller gætte planen.

Bindinger (verificér med git hash-object — afvigelse = STOP, skriv HALT i output):
- KRAV (låst, immutabelt): docs/sandhed/krav/lokations-skabelon-krav.md @ 9402164d87a35fb939661058bea77c1a052493d0
- recon-2: plan-build/lokations-skabelon/recon2.md @ 2bdbb122158b6f8c72fc942b8de28e679742b4aa
  (begge aktørers testveje; R2-K1..R2-K9; R2-TEST) — recon-2's tjekliste er fælles kontrolgrundlag, IKKE katalog: dit pas er dit eget.
- mutationsfrø: recon/recon-2-bilag.md @ 6e569779353ea1d0a2bf747ce6eda6509de1aea0 (frø, ikke krav-føde; kravet har forrang)
- P-8 slutprøve-spec: plan-build/lokations-skabelon/p8-slutproeve-spec.md @ 4af07ef4164882ca54643e79df3554c0bf22b0e4
  (§3.1 canary-regler · §3.3 targeted mutationer pr. K · §4.3 samtidighed — skrevet uden planen, lovligt input)
- ledger: plan-build/lokations-skabelon/mathias-ord.md @ <LEDGER-BLOB> (M-1..M-41 — M-ord binder; kravet citerer dem)
- ordbog: plan-build/lokations-skabelon/ordbog.md @ 714f9b80028ad34656d94ccd2bfadb4ceb2e70b6 (Mathias' ord ↔ systemord, før-plan-version)
- implplan: docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md (2.C config-mutant-kill · D10 mutant-regel · D12 forudsætnings-bids · Fase 3 pkt. 3/3a2note E20)

METODE PR. K (K-1..K-9, rolletekstens tre trin):
1. Læs K's acceptkriterier inkl. negativer og struktur-»umuligt«-listen.
2. Udpeg hvert VÆRN der ALENE bærer et afvisnings-acceptkriterie (policy · predikat · rolle-check ·
   guard · operator · constraint · grant/revoke · dato-led · trigger). Fordi planen ikke er kendt,
   navngiver du værnet som VÆRN-KLASSE + det recon-2-forbillede det vil blive bygget efter
   (path:linjer @ blob fra recon-2's evidensregister) — ikke som opfundne RPC-navne. Brug P-8's
   forretningshandlings-navne hvor et navn er nødvendigt.
3. Definér for hvert sådant værn ÉN MENINGSFULD mutant der bryder det (D10: én pr. afvisnings-ac hvis
   værn alene bærer negativet — ALDRIG pr. konfig-knap; et redundant værn gøres ikke isoleret
   nødvendigt; et DB-bagstop der ikke er nåbart fra den offentlige flade er separat schema-bevis,
   ikke et domæne-kill). Angiv EFFEKT-STIEN der dræber den: indgang (offentlig flade) · rolle
   (non-bypass; lovligt søsterkald først) · observation (hård slut-effekt/opslag pr. dato, aldrig
   helper-return) · forventet afvisning (SQLSTATE/domænefejl) — så en »findes«-test ikke kan
   overleve. Markér de to E20-races (K-2 sidste stand · K-6 dublet-kobling) som to-sessions-krav;
   ingen andre samtidigheds-mutanter.
4. Gulv: ≥1 targeted mutant pr. opsætnings-/konfig-/logik-K. Mangler et K et bærende værn i
   recon-2's flade (dvs. planen SKAL opfinde det), skriv det eksplicit som »VÆRN SKAL LEVERES« —
   det er et plan-krav, ikke et hul i din liste.
5. Krav-troskab: intet i listen må kræve noget kravet ikke siger; kravets scope-ærligheder
   (booking/trin 24 · lag F) respekteres — mutanter dér er overdragelser, ikke kills.

OUTPUT: kill-list-udkast.md i workdir-roden. Form: én tabel pr. K:
| ac | værn (klasse + forbillede path:linjer @ blob) | mutant (én, meningsfuld) | effekt-sti (indgang · rolle · observation · afvisning) | D10-begrundelse (hvorfor værnet alene bærer negativet) |
+ pr. K: gulv-tjek (≥1 targeted) · »VÆRN SKAL LEVERES«-poster · overdragelser. Slut med:
optælling (mutanter pr. K · to-sessions-krav · skal-leveres) og din binding (alle blobs ovenfor).
Ingen påstande om udførte kørsler — dette er angrebs-spec, ikke runtime-PASS. Web forbudt. Læs
ikke uden for workdir'en. Opfind ikke fund; skriv »MANGLER KILDE« hvor recon-2 ikke bærer et
forbillede.
```

## Tjekliste før kørsel (driveren)

- [ ] mathias-9b: »Trin A færdig« + SHA modtaget; branch pullet; suite grøn lokalt.
- [ ] `actors.lock[codex-angreb]` = rolletekst@HEAD (wrapperen blokerer ellers).
- [ ] `binaries.lock.json` matcher installeret codex-CLI (ellers: meld til fabrik-armen, vent på lås-commit).
- [ ] `STORK_V5_GATE_INPUT` er IKKE sat (produktion).
- [ ] Preflight: nyeste Codex-CLI · pinned model tilgængelig (`preflight.mjs`).
- [ ] Blind workdir bygget efter recepten; grep-tjekket TOM; blobs matcher.
- [ ] Prompt: `<PIN>` og `<LEDGER-BLOB>` udfyldt; KUN opgaven (rolletekst injiceres af wrapperen);
      gemt som fil uden for workdir; sha256 noteret. `$OUT` ligger uden for workdir.
- [ ] Kørsel via ny wrapper (produktion, workspace-write, timeout 2400 s); PID-fil noteret — dræb
      aldrig med brede mønstre.
- [ ] Efter kørsel: byte-identisk arkivering + provenance + commit + push FØR B3-planneren startes.
