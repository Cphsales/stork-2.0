# fold-ind-rapport r7 — lokations-skabelon (plan v3.4 `71479b11` → plan v3.5) — KUN delta (TO rettelser efter B6 runde 3's DELTA-domme, M-44)

**Aktør:** planner-code (Claude Fable 5.1 · xhigh · rolle @ skill_oid `eb190c08`) · **dato:** 2026-09-16 · **workdir:** arkiv @ `2e8e12bff9ac37efe4f931f3415544ac9d751a31` (uden `.git`, uden for `~/.claude`) · **input verificeret m. `git hash-object` (én kommando pr. kald — ALLE bindinger i instruks v3.5 matcher, ingen afvigelse):** plan v3.4 `71479b11c6a4346311c2140d43e92b0a1b2f6bf4` (1028 linjer) · rapport-r6 `580334bc290669a0244250c3322453c0023a0e0e` · manifest v3.4 `a2128907582f659070a6f9942be28cd6f04bc718` · `provenance/plan-v34.md` = `71479b11…` (byte-identisk m. plan v3.4) · `provenance/manifest-v34.committet.json` = `a2128907…` · `plan-angreb-r6.md` `529be398b3a33e94c1ce9cb5b196c6528882a1d9` (Codex A'''') · `plan-slutlaesning-r5.md` `bcd6691b5db8a4068e180b819fab77ae316091c1` (code-reviewer C'') · `plan-verdikt-claude-ai-r3.md` `fcf0e8fc696b43dfad269badc539bdd274c73cfb` (claude-ai D'') · fund-log `35455b1def79c3d6e2f73d20edfdbd8124bc323a` (Kilde 23-25) · ledger `05275cef255ec8112e93da182681fa229b10aff0` (M-1..M-44) · krav `9402164d` · kill-list `13b78392` · forventningsliste `2200b76e` · recon2 `2bdbb122` · P-8 `4af07ef4` · ordbog `bcab6b4e` · kildekontrakt v4 `33dd3509` · validator `scripts/v5/forventnings-manifest.mjs` `64ea01e0` · implplan (workdir) `c0763fb55ff662dfb6181aa98dc81b4d45773e7c` (fabrik-tekst — henvist m. sti @ P-commit, blobben jages ikke; dens pkt. 39 `:339` bærer selv »prover-run.mjs ligger i måle-lags-zonen«). **Zone-kilde genlæst i workdir:** `scripts/v5/hooks.mjs` @ `295e81a70a27b4b0ac42f0a1c489cbc75f950027` (`MEASUREMENT_PREFIXES` = `scripts/v5` · `test/v5` · `.claude` · `.github/workflows` · `.workflow-state` `:23-29`; `SANDHED_PREFIXES` = `docs/sandhed` `:30`; segment-sikker prefix-match `:34`; `pathZone` `:56-61` — sandhed → maale-lag → ellers `produkt`; `commitZoneDecision` `:251-255` — builder-code KUN `produkt`, codex KUN `maale-lag`).

**Læseregel (instruks v3.5 pkt. 40):** rapporten er et DELTA — §1 har én række pr. fund-id der ændrede tilstand siden r6 (A6-1 · A6-2 · R5-1 · R5-2; R5-n er samme sager som A6-n); §5 giver den FULDE optælling over ALLE fund. »plan.md:linje« = linje i den skrevne v3.5-fil (**1039 linjer**: v3.4's 1028 + §11.6's 11 — INGEN linjer indsat/slettet før §11.6, så alle `plan.md:<linje>`-henvisninger i §11.4/§11.5 og manifestets `P:`-ankre gælder uændret). Tilstande: **RETTET M. BEVIS** · **INDEN FOR MANDAT** · **DRIVER** · **SYNK**. **KRÆVER MATHIAS = 0** (ingen §10-post er ændret; ingen krav-berøring — begge rettelser er form/sti i plan-mekanikken, bord-test NEJ uden videre).

**Delta-attest (pkt. 40):** `diff provenance/plan-v34.md plan-build/lokations-skabelon/plan.md` = PRÆCIS 11 ændrede linjer, alle `c`-hunks m. uændret linjenummer — **1 · 11 · 13 · 37 · 391 · 436 · 438 · 790 · 1004 · 1016 · 1022** — + `1027a1028,1038` (§11.6, indsat efter v3.4's sidste tabelrække NF-12; v3.4's afsluttende tomme linje følger efter som linje 1039). **§1-§3 er byte-identiske med v3.4 uden for hunks 391 · 436 · 438 (alle A6-1; §1 har INGEN hunk).** `37` er §0.1 FA-6 · `790` §8 · `1004` §11.4-note · `1016`/`1022` §11.5 · `1`/`11`/`13` hoved/§0. `diff provenance/manifest-v34.committet.json plan-build/lokations-skabelon/forventnings-manifest.json` = ALENE linje 15 (`bindings.plan.oid` `71479b11…` → `"<udfyldes af driveren>"`) — manifestet er indholdsmæssigt uændret (pkt. 40).

## 1. Delta-tabel

### 1.1 Codex A'''' — A6-1 · A6-2 (begge klasse (a): »rest i den navngivne rettelse, ikke et nyt helhedsfund«)

| fund-id | tilstand | plan.md:linje + ID | bevis / valg |
| --- | --- | --- | --- |
| A6-1 (RET (a) · A5-7's rest — `plan.md:391`/`:436` bandt `cmd` og kørsel til `plan-build/lokations-skabelon/prover-run.mjs` = PRODUKT-zone pr. hooks (builder allow · Codex deny); ejerskabsprosaen lukkede ikke den konkrete adgang til målekomponenten) | **RETTET M. BEVIS** | `plan.md:37` §0.1 FA-6 (a) (runner = **`scripts/v5/lokations-skabelon/prover-run.mjs`**, MÅLE-LAGS-zonen; zone-kilde `scripts/v5/hooks.mjs:23-24,56-61 @ 295e81a7` + commit-zonen `:251-255`; `prover.json` bliver på `plan-build/lokations-skabelon/` (pkt. 39's filform, læst af CI's build-dommer dér) m. `cmd` mod måle-lags-stien; »P-7 rød« suppleret m. »hook-deny for builder-code«) · `:391` §3 (vi)(a) (`prover.json` = `{"cmd": ["node", "scripts/v5/lokations-skabelon/prover-run.mjs"], "resultRelPath": "plan-build/lokations-skabelon/prover-result.json"}` + runneren `scripts/v5/lokations-skabelon/prover-run.mjs` m. zone-note) · `:436` Step 1.4 (leverance-sti; byggeren kører `node scripts/v5/lokations-skabelon/prover-run.mjs` = `prover.json`'s `cmd`; hook-deny) · `:438` Bid 1 done (runner-sti) · `:790` §8 build⊨plan (runner-sti) · `:1004` §11.4 pkt. 35.10 (v3.3's `cmd`-form markeret »rettet i v3.5« — historisk række, ikke bindende) · `:1022` §11.5 A5-7-række (rest noteret lukket; tilstand »RB (rest A6-1 lukket v3.5)«) · `:1035` §11.6 A6-1-række | **Valg = Codex' lukning ordret:** runneren bundet til den beskyttede sti under `scripts/v5/`; `cmd` og ALLE kørselsreferencer rettet (`grep -n 'plan-build/lokations-skabelon/prover-run.mjs' plan.md` rammer nu KUN forklarende/historiske omtaler: `:11` (A6-1-beskrivelsen) · `:37` (»v3.4's sti … lå i PRODUKT-zonen«) · `:1004` (v3.3-form m. rettelsesnote) · `:1022` (rest-note) · `:1035` (§11.6) — ingen binder `cmd` eller kørsel); forfatterskab (Codex, Fase 4 pkt. 1 sammen m. `angrebs-spec.json`), frys (før Bid 1, blindhedsgrænsen) og byggerens kørsel (Step 1.4 og frem) UÆNDREDE; `prover.json`'s placering uændret (implplan pkt. 39's filform `plan-build/<pakke>/prover.json`). **Zone-bevis — verificeret i kilden her, ikke kun Codex' probe:** `pathZone` klassificerer `scripts/v5/**` segment-sikkert som `maale-lag` (`hooks.mjs:23-24,34,60`) og alt uden for `docs/sandhed`/måle-præfikserne — herunder `plan-build/**` — som `produkt` (`:61`); `commitZoneDecision` tillader builder-code KUN `produkt` (`:251-252`) og codex KUN `maale-lag` (`:254-255`). Dermed: `plan-build/lokations-skabelon/prover-run.mjs` = produkt (builder allow · Codex deny) · `scripts/v5/lokations-skabelon/prover-run.mjs` = måle-lag (builder deny · Codex allow) — identisk m. Codex' probe-tabel. Falsk-grøn-vejen (byggeren ændrer den komponent der attesterer dens leverance) er nu lukket MEKANISK (hook-deny), ikke kun ved P-7-prosa. Implplan pkt. 39 (sti @ P-commit) bærer samme placering (»prover-run.mjs ligger i måle-lags-zonen«). Uændrede forekomster UDEN sti (`:272` bijektion · `:393` Bid 1 heading · `:696` §5 · `:841` BV-5) nævner kun filnavnet og kræver ingen ændring; `resultRelPath` er et CI-artefakt der ikke committes. Ingen ny beslutning for byggeren; **ingen manifest-ændring** (ingen forpligtelse/negativ/assertion refererer runneren). Bevisform: bindings-strukturelt (sti + zone-kilde @ blob; hook-adfærden er kode, ikke prosa). |
| A6-2 (RET (a) · `235c235` og `599c599` stod i §11.5's fælles hunk-liste `:1012` men i ingen fund-id-række, selvom indledningen lovede »hver bundet til et fund-id nedenfor«) | **RETTET M. BEVIS** | `plan.md:1016` §11.5 R4-1/A5-3-rækkens linje-kolonne: **`:235`** K-7/ac-2 værdi-assert (strategi-anker `15557e93:21-25`: `blank` = `'[anonymized]'`, ikke P1a-seedets tomme streng) · **`:599`** Step 5.2 mapping-seed-note (strategi-ankrene `15557e93:21-25` blank · `15557e93:31-40,51-55` hash · `…@anonymized.invalid`) — mærket »A6-2 (= R5-1), henvisning tilføjet i v3.5« · `:1036` §11.6 A6-2-række | §11.5:1012's påstand er nu SAND for alle 23 §1-§3-hunks i v3.3 → v3.4 (Codex' hunk-tabel: `235c235` · `599c599` var de eneste to uden række — begge nu i R4-1/A5-3-rækken, hvor C' krævede ankeret tilføjet under R4-1). Indholdet af `:235`/`:599` er UÆNDRET siden v3.4 (Codex: »indholdet er efterprøvet og stemmer med R4-1's strategianker«; C'': »præcis det anker C' krævede tilføjet under R4-1«); kun henvisningen er tilføjet. Ingen §1-§3-ændring; ingen manifest-ændring. |

### 1.2 Code-reviewer C'' — R5-1 · R5-2 (formrester, klasse (a); PASS-dommen vælter ikke — samme sager som A6-2 · A6-1)

| fund-id | tilstand | plan.md:linje + ID | bevis / note |
| --- | --- | --- | --- |
| R5-1 (= A6-2: `:235`/`:599` i hunk-listen uden fund-række) | **RETTET M. BEVIS** (= A6-2) | `plan.md:1016` · `:1036` | Se A6-2. C'' bad driveren notere det i fund-loggen; det er nu lukket i planen selv (én række, én henvisning). |
| R5-2 (= A6-1: `prover-run.mjs` bundet til `plan-build/lokations-skabelon/`; fabrik-afgørelse (b) navngiver `scripts/v5/` eller `plan-build/<pakke>/maalelag/`) | **RETTET M. BEVIS** (= A6-1) | `plan.md:37` · `:391` · `:436` · `:438` · `:790` · `:1004` · `:1022` · `:1035` | Se A6-1. **Valgt `scripts/v5/lokations-skabelon/`, IKKE `plan-build/<pakke>/maalelag/`:** hooks' `pathZone` (`295e81a7:23-29,56-61`) kender ingen `maalelag/`-undtagelse — enhver sti under `plan-build/` er `produkt`, så alternativet ville have gentaget A6-1's hul mekanisk; `scripts/v5/` er den eneste af de to navngivne der faktisk klassificeres `maale-lag` (og den Codex' A6-1-lukning navngiver). |

### 1.3 claude-ai D'' — PASS, ingen fund mod planen → ingen række.

### 1.4 Øvrige synkroniseringer (ingen fund-id — hoved/§0/§11.6)

`plan.md:1` (v3.5 · `manifest_v34_oid a2128907` · `slutlaesning_r5_oid bcd6691b` · `angreb_r6_oid 529be398` · `claudeai_r3_oid fcf0e8fc` · `fundlog_oid 35455b1d` · `plan_v33_oid 414b0ce8` · **`plan_v34_oid 71479b11c6a4346311c2140d43e92b0a1b2f6bf4`** · `implplan_oid 75ee9373` uændret (ikke re-pinnet — fabrik-afgørelse (a)/R4-3; implplanen henvises m. sti @ P-commit) · status UDKAST) · `:11` (v3.5-indledning: to rettelser, tre delta-domme m. blobs, diff-anvisning mod `provenance/plan-v34.md`, manifest indholdsmæssigt uændret, implplan m. sti @ P-commit; v3.4-indledningen bevaret som »forgængeren«) · `:13` pinned `2e8e12bf` (v3.4 @ `2f71b4ef`). **§11.6** (ny — ændringslog v3.4 → v3.5 pr. fund-id m. `plan.md:<linje>` + fuld hunk-liste + »§1-§3 ellers byte-identiske med v3.4 — `diff provenance/plan-v34.md plan.md`«, `:1029-1038`). Planen er 1039 linjer.

## 2. Nye fund fra K-genlæsning (instruks pkt. 30)

**Ingen.** Ingen §1-obligation, negativ, bevisform, assertion, guard eller effekt-bid er ændret (§1 har ingen hunk; 391/436/438 er §3-tekst om prover-kørslens sti og rører ingen K). Bevisformerne (UT 47 · MH 19 · FS 35 · SA 2), E20-snittet (T2.6 · T6.2), de 127 negativer og 12 eneste-værn er uændrede. Ingen ac svækket, ingen positiv kontrol tabt, ingen SA nedgraderet → intet NF-13.

## 3. HALT-flag

**INGEN.** Kravet `9402164d` er bygbart som skrevet; intet foreslås ændret eller fodnoteret. Begge rettelser er plan-mekanik (en runner-sti og en ændringslog-henvisning) uden krav-berøring — Codex A'''': »Intet konstateret krav-problem → ikke HALT«. **KRÆVER MATHIAS: 0** (ingen §10-post ændret; bord-testen er triviel NEJ for begge).

## 4. Manifest (tredje leverance — `forventnings-manifest.json` v3.5)

**Indholdsmæssigt UÆNDRET (pkt. 40):** ingen ID, negativ, assertion, guard, bevisform eller `effekt_bid` berøres — leveret byte-identisk med v3.4's committede manifest (`provenance/manifest-v34.committet.json` @ `a2128907`) på nær linje 15: `bindings.plan.oid` = `"<udfyldes af driveren>"` (planneren kender ikke sin egen slut-blob). To Edit-skridt: OID → 40 × `0` (skemaet kræver 40 hex) → validator → placeholder genindsat; de to skridt er de eneste forskelle mellem den validerede og den leverede fil.

**Validator (`node scripts/v5/forventnings-manifest.mjs validate plan-build/lokations-skabelon/forventnings-manifest.json` @ `64ea01e0`) — KØRT i denne session, exit 0:**

```
✓ manifest gyldigt: lokations-skabelon · 9 K · 60 forpligtelser i nu-scope (0 overdraget) · 127 negativer · pr. form {"UT":47,"MH":19,"FS":35,"SA":2} · 12 eneste-værn
```

Forventet (pkt. 40): 60 · 127 negativer · 12 eneste-værn — stemmer. Driveren indsætter `bindings.plan.oid` (`git hash-object plan.md`) og kører validatoren igen FØR commit — forventet identisk stats-linje.

## 5. Fuld optælling pr. tilstand — ALLE fund (instruksens formel: 132 (r6) + A6-1/A6-2 = 134; R5-1/R5-2 er samme sager og tælles ikke dobbelt)

| tilstand | antal | fund-id'er |
| --- | ---: | --- |
| RETTET M. BEVIS (inkl. »afgjort af M-42«, BÅRET (v2) kvitteret, BORTFALDET, DRIVER + RB) | **116** | r6's 114 + **A6-1 (= R5-2) · A6-2 (= R5-1)** |
| INDEN FOR MANDAT (kilde citeret / deklareret default) | **16** | FUND2-1 · FUND2-2 · FUND2-4 · FUND2-5 · DV-1 · DV-2 · NF-3 · NF-4 · NF-5 · NF-6 · NF-7 · NF-8 · NF-9 · NF-10 · NF-11 · NF-12 |
| DRIVER (kvitteret) | **2** | R2-5 · R2-6 |
| KRÆVER MATHIAS | **0** | — |
| **ÅBNE** | **0** | — |
| **i alt** | **134** | 132 + 2 (A6) |

Kontrol: 116 + 16 + 2 + 0 = 134. Uden for plannerens optælling (driverens/fremlæggelsens egne rækker, uændret siden r6): F-1 · F-2 · V32-1. Fund-loggen (driverens) opdateres af driveren ud fra denne tabel (Kilde 23-24's fire rækker → tilstand + rettelses-OID = plan v3.5-blob + bevis-reference `plan.md:<linje>` ovenfor).

## 6. §10-tabellen

**Gengives IKKE** (pkt. 40): ingen post er ændret; tabellen er byte-identisk med v3.4 (rapport-r6 §6).

## 7. Nye ordbogs-entries

**Ingen.** Stien `scripts/v5/lokations-skabelon/prover-run.mjs` er systemteknik uden Mathias-flade (§5 nævner allerede `prover-run.mjs` som teknik). Formålsblokken er uændret (første afsnit identisk med K:7).

## 8. Bindinger og leverancer

- **plan v3.5:** `plan-build/lokations-skabelon/plan.md` — status UDKAST; hoved m. `plan_v34_oid 71479b11c6a4346311c2140d43e92b0a1b2f6bf4` · `angreb_r6_oid 529be398` · `slutlaesning_r5_oid bcd6691b` · `claudeai_r3_oid fcf0e8fc` · `manifest_v34_oid a2128907` · `fundlog_oid 35455b1d` · pinned `2e8e12bf`; **§11.6** = ændringslog v3.4 → v3.5 (A6-1 · A6-2 m. `plan.md:<linje>`; »§1-§3 ellers byte-identiske med v3.4 — `diff provenance/plan-v34.md plan.md`«); 1039 linjer; sha256 i slutbeskeden.
- **denne rapport:** `plan-build/lokations-skabelon/fold-ind-rapport-r7.md`.
- **manifest:** `plan-build/lokations-skabelon/forventnings-manifest.json` (v3.5 = v3.4 indholdsmæssigt) — `bindings.plan.oid = "<udfyldes af driveren>"`; validator KØRT: gyldigt (§4).
- Ingen ændring i krav, recon, P-8, ordbog, ledger, fund-log, kildekontrakt-filerne, kill-list, forventningsliste, køreplan, hooks eller provenance/. Ingen kode i produkt- eller måle-zonen. Web ikke brugt. Ingen andre aktørers workdirs læst. Bash brugt til `git hash-object` (én pr. kald), `grep`/`sed -n`/`wc`/`ls`/`tail`/`diff`, `node scripts/v5/forventnings-manifest.mjs validate …` (tilladt i denne kørsel) og sha256 af leverancerne; alle filændringer via Edit/Write — ingen hjælperfiler skrevet.
- **Driver-opgaver før gaten:** `bindings.plan.oid` udfyldes m. `git hash-object plan.md` og validatoren køres igen · fund-log opdateres (Kilde 23/24: R5-1 · R5-2 · A6-1 · A6-2 → RETTET M. BEVIS, rettelses-OID = plan v3.5-blob, bevis = `plan.md:<linje>` fra §1; »kræver Mathias« = 0; i alt 134) · `provenance/plan-v35.md` + `manifest-v35.committet.json` lægges ved (A5-6-mønstret) · delta-dommere (Codex A''''' henvisnings-delta pr. §11.6-række; code-reviewer/claude-ai kun berørte afsnit) kører `diff provenance/plan-v34.md plan.md` selv · Codex' Fase 4 pkt. 1-leverance (`prover.json` + `scripts/v5/lokations-skabelon/prover-run.mjs` + `angrebs-spec.json`) følger nu den bundne sti.
