# Fold-ind-instruks til planner-Code (UDKAST) — plan v1 → plan v2, lokations-skabelon

**Status: UDKAST** (driver-10b 2026-09-09, uden aktør). Bruges i Trin B trin B3 (GRUNDPLAN-v2), EFTER
B1 (Codex' blinde `kill-list-udkast.md` er committet) og B2 (forventningslisten er låst). OID'erne
mærket `<udfyldes>` sættes af driveren ved kørslen; den endelige prompt arkiveres i `provenance/`
efter kørslen (A1-reglen). Rolle: **planner-code** (`scripts/v5/roller/planner-code.md` — den
P-6-konsistente version efter Trin A; kaldet afledes af rolle + lås, ikke af denne fil). Aktivitet:
**produktion** (skriver plan-build-filer). Workdir: arkiv @ pinned commit UDEN `.git` (se
kørselsrecept nederst); regel-commit og alle input-OID'er bindes i provenance (fabrik-frys,
GRUNDPLAN-v2 princip 8).

## Bindinger (verificér ALLE med `git hash-object <fil>` FØR du skriver — afvigelse = HALT)

Workdir'en er et arkiv uden `.git`, så `git rev-parse` virker ikke — `git hash-object <fil>` giver
samme blob-OID og virker uden repo. Pinned commit: `<PIN>`.

- **KRAV (immutabelt, gate-åbent):** `docs/sandhed/krav/lokations-skabelon-krav.md` @ blob
  `9402164d`. Planen må aldrig modsige det. Et krav-problem retter du IKKE i kravet — det bliver et
  HALT-flag til driveren (retur til Mathias er hans bord).
- **Plan v1 (din forgænger):** `plan-build/lokations-skabelon/plan.md` @ blob `423d9b20` (commit
  ec4a3d9). Du skriver v2 oven på den. Ingen afgørelse (V1-V13, S-1..S-16) ændres tavst: hver
  ændring peger på fund-id + kilde.
- **recon2** `2bdbb122` · **mutationsbilag** `recon/recon-2-bilag.md` `6e569779` · **P-8**
  `p8-slutproeve-spec.md` `4af07ef4` · **ordbog** `ordbog.md` · **ledger** `mathias-ord.md`
  (M-1..M-41) · **implplan** `docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md`
  (Fase 3 pkt. 2-4, D10/D12/D13).
- **Fund (alle 46):** `fund-log.md` er registret; kilderne er `plan-angreb-r1.md` (A-1..A-15, inkl.
  afsnittet »Pr.-K-afledning til revideret kill-list«) · `plan-audit-fresh-eyes-r1.md`, afsnit
  »## Plan-audit (blob 423d9b20)« (FUND-1..5 + noter) · `p4-plan-kildetjek.md` (F01-F16 · U01-U10;
  §3-§10 er kontekst, kun §1/§2 er fund).
- **Codex' BLINDE kill-list:** `kill-list-udkast.md` @ `<udfyldes>` — skrevet fra låst krav +
  recon-2 UDEN at have set plan v1 (commit-orden er beviset). Den er **kill-list-autoritet**; plan
  v1's kill-list-UDKAST pr. K er dit sammenligningsgrundlag, ikke autoritet.
- **Forventningsliste (B2, LÅST 2026-09-10):** `forventningsliste-udkast.md` @
  `2200b76e29b52f7084c0bfe003c0a2e8121c2346` (filnavnet beholdt; status-blokken siger LÅST). v2's matrix
  skal kunne læses 1:1 mod den (ac · bevisform UT/FS/MH/SA · effekt-bid · chain-step · canary). Brug
  ID-reglerne i dens §5 pkt. 6 når du navngiver ac/negativer i matrixen (`K-n/ac-m` · `K-n/S` ·
  `K-n/ac-m/neg-k`; K-9 »1+2« splittes; alias skrives ud) — så C1's manifest kan afledes uden tolkning.
  Codex' adapter-krav-liste (`provenance/b2-adapter-tjek.leverance.md`) er C1-input, ikke plan-input;
  men dens tabel 2 viser pr. K hvilke observationer/reject-klasser beviset skal kunne udtrykke — hvor
  den skriver »MANGLER KILDE«, skal v2 låse den præcise kode/tilstand (eller markere det som åbent).

## Opgaven: plan v2 + fold-ind-rapport

Skriv **plan v2** (samme fil, samme skabelon, status UDKAST, ny plan-SHA) der folder ALLE 46 fund,
kill-listen og forventningslisten ind. Bindende krav til arbejdet:

1. **Hvert fund får PRÆCIS én tilstand** i fold-ind-rapporten (princip 6 »beskriv ≠ luk« — et fund
   der kun er omtalt, er ÅBENT):
   - **RETTET M. BEVIS** — hvad blev ændret (v2-linje/afsnit) + hvordan man ser at hullet er lukket:
     den negativ, observation eller mutant der nu bærer det (bevisform fra forventningslisten).
   - **INDEN FOR MANDAT** — begrundet afgørelse uden ændring, med kilden der giver mandatet (K:linje ·
     M-ord · recon-fakta @ OID · P-8-afsnit). »Vi vurderer« er ikke mandat. Gælder også fund du
     mener er forkerte: skriv hvorfor kilden bærer planen, ikke fundet.
   - **KRÆVER MATHIAS** — det præcise forretningsspørgsmål (hans sprog, scenarie, ét-ords-svar), og
     hvad v2 gør i HVERT udfald. Du stiller det IKKE selv; driveren tager det gennem
     spørgsmåls-devilen. Materialitets-test først (M-33 værn 1+2): kan svaret afledes i ét skridt
     af et eksisterende M-ord, er det en **bekræftelse** (batches i fremlæggelsen), ikke et spørgsmål.
2. **Overlap grupperes, men hver fund-id kvitteres.** Flere kilder rammer samme hul (fx A-4 · F03 ·
   FUND-1 · U06 om indirect-persondata uden anonymiseringsvej; A-1 · F01 om DML-grants; A-12 · F12
   om to-sessions-beviset; A-13 · U01 om P-8-indbinding; A-3 · F04 om nedgraderingsforbuddet;
   A-9 · U04 om forsinket apply; A-10 · F06 om UTC). Én rettelse — men rapporten har én række pr.
   fund-id med samme tilstand og henvisning til rettelsen.
3. **D10-filter på kill-listen:** én MENINGSFULD dræbt mutant pr. afvisnings-ac hvis værn alene bærer
   negativet — aldrig pr. konfig-knap; redundante værn gøres ikke isoleret nødvendige;
   targeted-gulvet (≥ 1 pr. opsætnings-K) består. Pr.-knap-mutanter fra angrebets pr.-K-tabel og
   fra plan v1 skæres eller begrundes eksplicit. Hvor Codex' kill-list og plan v1 divergerer,
   følger du Codex' medmindre kravet siger andet — dokumentér valget pr. mutant. Ikke-nåbare
   DB-bagstoppere får separat constraint-/schema-bevis og tæller ikke som offentlige domænekills
   (F11).
4. **Matrixen udvides** med kolonnerne chain-step (P-8 C0-C10) og canary (P-8 N1-N9) pr. ac og
   optager P-8-blobben `4af07ef4` i planens hoved (A-13 · U01). K-7's **nedgraderingsforbud** får
   sin egen matrix-række med udførende kode + negativ (A-3 · F04). Samtidighed skæres til de to
   E20-races (K-2 sidste aktive stand · K-6 dublet-kobling) og er BLOKERENDE bevis — plan v1's
   B-3-residualvej vendes (A-12 · F12). Permutation: én kontrolkopi.
5. **K-forpligtelsen består:** efter fold-ind genlæses hvert K mod forventningslisten. Er et ac blevet
   svagere (»designet UD« uden offentlig negativ · en positiv kontrol tabt · en SA nedgraderet), er
   det et NYT fund i rapporten — ikke en tavs justering.
6. **1:1 uden overdrivelse:** byggeren må intet beslutte, men »fastlagt« må kun stå hvor det ER
   fastlagt (U02 · U05: fulde signaturer, returtyper, ACL/revoke på nye funktioner, named errors,
   numeric-/integer-udfald, trigger-DDL og -sikkerhedskontekst). Skriv hellere »valgt her: …« end en
   påstand om at noget allerede findes (F09 · F10 · F15 · F16: ret kildehenvisninger til de
   faktiske spans).
7. **Ordbog:** nye navne kræver ordbogs-entry (driveren committer entryen før gaten) — en
   navne-afvigelse uden entry er FAIL ved plan-gaten. Formålsblokken forbliver byte-identisk med
   kravets.
8. **P-8 er input, ikke dom:** beskæringen (E20) er plan-gatens dom; du markerer hvad du har skåret
   og hvorfor, så gate-aktørerne kan dømme snittet.

## Output (skriv KUN disse to filer)

- `plan-build/lokations-skabelon/plan.md` — **v2**, status UDKAST, hovedet opdateret: pinned commit
  · krav_oid · recon2_oid · p8_oid · killlist_oid · forventningsliste_oid · ledger-spænd (M-1..M-41).
- `plan-build/lokations-skabelon/fold-ind-rapport-r2.md` — tabel: fund-id · kilde · tilstand ·
  v2-linje/afsnit · bevis / mandat-kilde / spørgsmål-med-udfald; optælling pr. tilstand; sektion
  »nye fund fra K-genlæsning« (pkt. 5); sektion »HALT-flag« (krav-problemer, retur til Mathias).
  Kravet til rapporten: **åbne fund = 0**; ellers HALT med listen.

Web FORBUDT · antag aldrig (mangler en kilde, skriv »MANGLER KILDE« — opfind ikke) · læs ALDRIG
andre aktørers workdirs · ingen ændring i krav, recon, P-8, ordbog, ledger eller fund-log (driverens
filer) · ingen kode i produktzonen (plan-fasen bygger intet). Din afsluttende besked: kort — de to
filnavne + sha256 af hver + optælling pr. tilstand + HALT-flag (eller »ingen HALT«) + dine bindinger.

## Kørselsrecept (driveren) — planner-code via `claude -p` (UDKAST, driver-10b 2026-09-10)

Der findes ingen Claude-wrapper (kun `codex-run.sh`); Claude-aktører kører »som før — selv-erklæret,
deklareret residual« (køreplan). Recepten gør kørslen så reproducerbar og arkiveret som muligt
(lærdom: fresh-eyes r1 blev kørt interaktivt — prompten er tabt):

- **Preflight:** B1 committet + pushet (kill-list-blob kendt) · B2 låst (forventningsliste-blob
  kendt) · suite grøn @ PIN (kørt selv) · rent arbejdstræ · `claude --version` noteres
  (Claude-transport; »altid nyeste« = `claude update`-status) · model/effort fra
  `actors.lock[planner-code]` = claude-fable-5-1 · xhigh (aldrig fra denne fil) · rolletekst-blob @
  PIN hasher til `lock.skill_oid` (driveren verificerer selv — ingen wrapper gør det).
- **Workdir:** `git archive` @ PIN → `$JOB/tmp/b3/wd` (ingen `.git`). IKKE blind — planneren SKAL
  se plan v1, alle fund, kill-listen og forventningslisten.
- **Prompt-fil** (uden for workdir): rolletekst (`planner-code.md` @ PIN, byte-identisk) + `\n---\n`
  + denne instruks m. `<PIN>` og alle `<udfyldes>` udfyldt. sha256 noteres i provenance.
- **Kald** (detached fra workdir; skrive-zone = workdir via `acceptEdits` — skriv uden for cwd
  afvises mekanisk i `-p`-mode; Bash kun til læsning + hash):
  `cd "$WD" && setsid nohup timeout --signal=KILL 5400s claude -p --model claude-fable-5-1 --effort xhigh --permission-mode acceptEdits --allowedTools "Read,Grep,Glob,Write,Edit,Bash(git hash-object:*),Bash(sed -n:*),Bash(grep:*),Bash(wc:*),Bash(ls:*),Bash(cat:*),Bash(head:*),Bash(tail:*)" --output-format json "$(cat "$PROMPT")" > "$OUT.json" 2> "$OUT.stderr.log" < /dev/null &`
  — `$OUT.json` (result · session_id · model · usage · varighed · num_turns) er provenance-kernen.
- **Efter kørsel:** `plan.md` + `fold-ind-rapport-r2.md` kopieres byte-identisk (cmp + sha256) fra
  workdir til `plan-build/lokations-skabelon/`; `provenance/fold-ind-r2.{prompt.txt,claude-result.json,provenance.txt}`
  (provenance.txt: claude-version · model · effort · PIN · alle input-blobs · start/slut · sha256 af
  de to leverancer · afvig). **Fund-log** opdateres af DRIVEREN ud fra rapporten (46 rækker →
  tilstand + rettelses-OID = plan v2-blob + bevis-reference) — planneren rører den ikke. Nye
  ordbogs-entries committes af driveren FØR gaten. HALT-flag i rapporten → stop: ingen »klar«-commit
  af v2; »kræver Mathias«-poster går i B7's ene samlede liste via devil.
- **Kendte residualer:** ingen mekanisk sandbox for læsning/netværk i Claude Code (`Web FORBUDT`
  er prompt-regel); effort/model er CLI-flag, ikke lås-afledt af en wrapper; kvitteringen er
  selv-erklæret (ingen `receipt.json`-kontrakt for Claude-aktører — deklareret i køreplanen).
