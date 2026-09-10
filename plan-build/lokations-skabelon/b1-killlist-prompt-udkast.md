# B1 — Codex' BLINDE kill-list-udkast: prompt + blind-workdir-recept (UDKAST)

**Status: UDKAST** (driver-10b 2026-09-09, uden aktør · revideret 2026-09-10 af ny driver-session
de4474: recepten TØRKØRT @ 5eb3736 uden aktør, se nederst). Kørslen starter FØRST når mathias-9b har
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
PIN=<pinned commit — HEAD på branchen ved kørsel = »Trin A færdig«-SHA'en eller nyere>
W=/home/mathias/.claude/jobs/870c5b0e/tmp/b1-blind        # driverens job-tmp; ingen .git — plan.md kan ikke genskabes
rm -rf "$W" "$W.tar" && mkdir -p "$W"
git archive --format=tar -o "$W.tar" "$PIN" && tar -xf "$W.tar" -C "$W" && rm -f "$W.tar"   # to trin (worktree-guard tillader ikke pipe fra git)
rm -rf "$W/plan-build/lokations-skabelon"                  # ALT plan-afledt væk i ét hug
# 10/9: fabrik-armens arkiver fjernes også — analyser-2026-09-08 er workflow-analyser skrevet EFTER plan v1
# (refererer plan-blob 423d9b20, angrebs-/audit-/kildetjek-fund-tal og plan-fasens kørsler) → plan-afledt;
# p2-haerdning-2026-09-09 er transport-hærdning (ikke B1-input; fjernes for enkelhed og skarpt grep-tjek)
rm -rf "$W/docs/workflow-faerdiggoerelse/analyser-2026-09-08" "$W/docs/workflow-faerdiggoerelse/p2-haerdning-2026-09-09"
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
# forventet: 9402164d · 2bdbb122 · 4af07ef4 · <ledger-blob @ PIN — @ 5eb3736 = 14722b4c; genberegn: git rev-parse "$PIN":plan-build/lokations-skabelon/mathias-ord.md> · 714f9b80 · 6e569779
grep -rl "423d9b20\|lokation_status_skift\|lokation_opret" "$W" --include=*.md | grep -vE 'recon2\.md|mathias-ord\.md'   # skal være TOM
grep -n "423d9b20\|lokation_status_skift\|lokation_opret" "$W/plan-build/lokations-skabelon/mathias-ord.md"   # forventet: KUN M-41-rækken (OID-reference, intet plan-indhold) — output gemmes i provenance
# informativt bredere tjek (ikke bindende): forventede træf = docs/teknisk/cutover-checklist.md (gammel »plan v1
# sektion 4«, urelateret master-plan-reference) · scripts/v5/roller/{codex-angreb,code-reviewer,planner-code}.md
# (rolle-regler om kill-list/fold-ind) · docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md (lovligt input,
# nævner kun at plan v1's kill-list var plannerens) · docs/foraeldet-workflow/arkiv/mathias-afgoerelser-historik.md
# (dødt arkiv, andet »plan v1«) — INGEN andre; nye træf = STOP og vurdér
grep -rlE "plan-angreb|fresh-eyes-r1|kildetjek|FUND-[1-5]|fold-ind|kill-list-UDKAST|plan v1|plan\.md:[0-9]" "$W" --include=*.md | grep -vE 'recon2\.md|mathias-ord\.md'
```

**Hvad Codex ser:** hele kodebasen @ PIN (migrationer, scripts, fitness, roller) · krav (låst) ·
recon2 + recon-2-bilag (mutationsfrø) · P-8 · ledger M-1..M-41 · ordbog @ før-plan · implplan.
**Hvad Codex IKKE ser:** plan.md · forventningsliste-udkast · fold-ind-instruks-udkast · fund-log ·
plan-angreb-r1 · plan-audit-fresh-eyes-r1 · p4-plan-kildetjek · drift-log · ordbogens plan-sektion
· alle øvrige plan-build-filer (buildability, verdikter, krav-udkast — irrelevante for B1 og
fjernet for enkelhed) · `docs/workflow-faerdiggoerelse/analyser-2026-09-08/` (workflow-analyser efter
plan v1: GRUNDPLAN v1/v2, flow, over-test, tid, validering — plan-afledte) ·
`docs/workflow-faerdiggoerelse/p2-haerdning-2026-09-09/` (transport-hærdning, fabrik-materiale). NB: recon2.md nævner kandidat-navne (fx `lokation_opret`) som recon-forslag
— det er recon-føde, ikke plan-indhold, og er tilladt. NB2 (tørkørsel 10/9): ledgerens M-41-række
nævner plan-blob-OID'et `423d9b20` i sætningen »er IKKE `plan ok` til plan v1 (blob 423d9b20)« — en
reference til at planen findes, ikke plan-indhold; ledgeren er lovligt input (M-ord binder), derfor
ekskluderes `mathias-ord.md` fra grep-tjekket, og kontrol-grep'et ovenfor dokumenterer at træfferen
er netop den række og ingen anden.

**Kald (wrapper v4 efter Trin A — signatur `<rolle> <dom|produktion> <workdir> <timeout≥1 s> <out uden
for workdir> <promptfil>`; @ 5eb3736 har `codex-run.sh` STADIG v2-signaturen `<workdir> <model> <effort>
<timeout> <out> <promptfil>`, så kaldet nedenfor er mekanisk umuligt før Trin A-pushet — verificér
signaturen i filens hoved efter pull):**
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
skal låsen committes FØR kaldet (fabrik-armens fil — meld, kør ikke selv; filen findes IKKE @ 5eb3736,
den kommer med Trin A). (5) **VERDIKT-DRAFT-kontrakten (kontrakt-ændring 2) gælder KUN gate-domme
(B6).** B1 er produktion: leverancen skal IKKE slutte med en `VERDIKT-DRAFT:`-linje, `verdikt-byg.mjs`
kaldes ikke, og prompten beder ikke om den. Den arkiverede kill-list-leverance bruges aldrig senere
som gate-leverance.

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
Din afsluttende besked (slutbeskeden — ikke filen) skal være kort: filnavn + sha256 af
kill-list-udkast.md + optællingen + bindingerne — intet andet.
```

## Tjekliste før kørsel (driveren)

- [ ] mathias-9b: »Trin A færdig« + SHA modtaget; branch pullet; suite grøn lokalt (kørt selv).
- [ ] Wrapper-signatur @ HEAD er v4 (`<rolle> <dom|produktion> <workdir> <timeout> <out> <promptfil>`) —
      læs hovedet af `codex-run.sh`; @ 5eb3736 var den stadig v2.
- [ ] `.prettierignore` @ HEAD dækker `plan-build/` — ellers ødelægger lint-staged byte-identiteten
      ved commit af leverancen (husky kører mekanisk i driverens worktree fra 10/9).
- [ ] Rolleteksten `codex-angreb.md` @ HEAD genlæst (P-6-konsistent efter Trin A); prompten rettet
      hvis afsnittene »Kill-listen …« / »Timing + snit …« har ændret snit.
- [ ] `actors.lock[codex-angreb]` = rolletekst@HEAD (wrapperen blokerer ellers).
- [ ] `binaries.lock.json` matcher installeret codex-CLI (ellers: meld til fabrik-armen, vent på lås-commit).
- [ ] `STORK_V5_GATE_INPUT` er IKKE sat (produktion).
- [ ] Preflight: nyeste Codex-CLI · pinned model tilgængelig (`preflight.mjs`).
- [ ] Blind workdir bygget efter recepten @ den endelige PIN (tørkørt @ 5eb3736 10/9 — gentages);
      grep-tjekket TOM efter eksklusion af recon2/mathias-ord; kontrol-grep i ledgeren viser KUN
      M-41-rækken; alle 6 blobs matcher (ledger-blob genberegnet @ PIN).
- [ ] Prompt: `<PIN>` og `<LEDGER-BLOB>` udfyldt; KUN opgaven (rolletekst injiceres af wrapperen);
      gemt som fil uden for workdir; sha256 noteret. `$OUT` ligger uden for workdir.
- [ ] Kørsel via ny wrapper (produktion, workspace-write, timeout 2400 s); PID-fil noteret — dræb
      aldrig med brede mønstre.
- [ ] Efter kørsel: byte-identisk arkivering + provenance + commit + push FØR B3-planneren startes.

## Tørkørsel 2026-09-10 @ 5eb3736 (driver-10b session de4474 · uden aktør · job-tmp `b1-blind-dryrun`)

Formål: bevise at recepten er mekanisk sund FØR den endelige PIN kendes. Resultat:

- Arkiv @ 5eb3736 udpakket uden `.git` (552 filer; `git archive -o` + `tar -xf`, fordi
  worktree-guarden afviser pipe fra git). `plan-build/lokations-skabelon/` fjernet i ét hug; de fire
  lovlige input lagt tilbage ved blob.
- `git hash-object` i workdir'en (uden repo): krav `9402164d` · recon2 `2bdbb122` · P-8 `4af07ef4` ·
  ledger `14722b4c` (@ 5eb3736) · ordbog `714f9b80` (før-plan, fra 04e5cfb) · bilag `6e569779` —
  alle seks som forventet.
- Grep-tjek (`423d9b20|lokation_status_skift|lokation_opret`, minus recon2): ÉN træffer =
  `mathias-ord.md` linje 95 (M-41: »… er IKKE `plan ok` til plan v1 (blob 423d9b20) …«). Vurdering:
  OID-reference, ikke plan-indhold; ledgeren er lovligt input → recepten præciseret (eksklusion +
  kontrol-grep). Ingen andre filer i workdir'en nævner plan-blobben.
- Udestående til den endelige PIN: wrapper v4 (ikke @ 5eb3736) · `binaries.lock.json` (ikke @
  5eb3736) · `.prettierignore` for `plan-build/` (ikke @ 5eb3736) · ledger-blob genberegnes ·
  rolletekst genlæses. Alle fire er Trin A-leverancer — bekræfter aktør-stoppet.
- **Anden tørkørsel @ cae6fb0 (efter Trin A-push, 10/9 ~10:10):** grep-tjekket var IKKE tomt — fire
  filer i `docs/workflow-faerdiggoerelse/analyser-2026-09-08/` (grundplan-v1/v2 · flow-claude ·
  validering-codex) nævner plan-blobben og plan-fasens fund-tal/kørsler. Mappen (10 filer) er
  fabrik-armens workflow-analyser skrevet efter plan v1 → plan-afledt → fjernes fra den blinde
  workdir sammen med `p2-haerdning-2026-09-09/`. Recepten ovenfor er opdateret; kørslen bruger den
  PIN der bærer denne recept.
