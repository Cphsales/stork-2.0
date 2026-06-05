# Stork 2.0 — Arbejds-disciplin (V5)

<!-- governance-owns: aktoerer-roller, workflow, gates, severities, vagter, skabeloner, bevarings-politik -->

Ét hjem for hvordan vi arbejder sammen: aktører, roller, flow, gates, severities, disciplin. Mathias styrer tanker, funktioner, logik og vision; AI'erne (Claude.ai, Code, Codex) bygger. Vi bygger ovenpå eksisterende kode, ikke nyt hver gang.

> **Dette er det eneste rolle- og proces-hjem.** Vision-og-principper.md definerer ikke længere aktører eller roller — det er proces, og det bor her. Ved konflikt om systemets vision vinder vision-dokumentet; ved spørgsmål om hvordan vi arbejder vinder denne fil.

> **V5-ændringer fra V4 (afgørelser, kan omgøres):** Genindført fire discipliner V4 tabte uden beslutning, fordi de er bærende — formåls-immutabilitet (§3.0), differentieret modsigelses-håndtering (§8), destructive-drops-preflight (§3.9), glid-detector (§9). Ikke genindført det V4 bevidst droppede (footer): 3-AI forretningsgang-triangulering og fire-dok-konsultations-tabel — substansen ligger i §9.1 proaktiv recon og §9.3 Codex-review-fokus, og V4 havde ret i at skære ceremonien. Automation skrevet ærligt som notify-only (§2, §6.2).

---

## §1 Aktører og roller

| Aktør         | Rolle                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Mathias**   | Tanker, funktioner, logik, vision. Eneste beslutningstager. Dikterer krav-dok pr. pakke. Godkender plan + slut-rapport                    |
| **Claude.ai** | Krav-dok-typist (skriver Mathias' tanker ned). Slut-rapport-reviewer. Strategisk sparring. **Docs-lag — kigger ikke på kode/DB-tilstand** |
| **Code**      | Builder. Migrations, RPC'er, tests. Eneste med skrive-adgang til repo                                                                     |
| **Codex**     | Uafhængig kode-reviewer. Read-only. Bugs, RLS-huller, SQL-fejl, manglende-eksisterende-bevarelse                                          |

**Ingen AI må:** træffe forretnings-beslutninger på Mathias' vegne · skrive "afgørelser"/"ramme-låsninger" som AI · fortolke retning som specifikation uden bekræftelse · designe datamodel uden Mathias-input (Claude.ai) · skrive kode (Codex) · påstå repo-/DB-tilstand uden at have verificeret den (alle).

---

## §2 Workflow — 5-step flow

Alle pakker kører fuld disciplin. Ingen skala-distinktion.

```
0. Pakke-åbning (Mathias)
   ↓
1. Krav-dok (Mathias → Claude.ai-typist, proaktiv recon; Mathias validerer)   ← gate: "krav OK"
   ↓
2. Plan (Code + Codex parallel; skitse → størrelses-tjek → fuld plan eller split)
   ↓
3. qwerg approval (Mathias)                                                    ← gate: "qwerg"
   ↓
4. Build (Code batches; Codex per-batch; end-to-end-konsistens per batch)
   ↓
5. Slut-rapport (Code skriver; Claude.ai-review FØR merge)                     ← gate: "slut OK"
```

Tre gates kræver Mathias: `krav OK`, `qwerg`, `slut OK`. Trin 2 og 4 er hvor det meste arbejde sker.

> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** `codex-notify` poster kun tracker-comment. Der er **ingen Codex-runner og ingen auto-merge-workflow endnu**, og plan-branchen er ikke dækket af triggeren (H020). Indtil det bygges: Mathias merger PR'er, og Codex-review relæes manuelt. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.

### Step 0 — Pakke-åbning

Mathias melder ny pakke ud i chat.

### Step 1 — Krav-dok

Claude.ai skriver `docs/coordination/<pakke>-krav-og-data.md` fra Mathias' chat-input; Mathias validerer i samme chat.

- Mathias' tanker om hvad pakken skal levere (forretning + funktion + logik)
- Ingen tabel-navne/kolonner/RPC-signaturer (Code's bord i plan-fasen)
- Hver påstand peges på Mathias-ord — ingen kilde: spørg, skriv ikke. Ingen fabrikation.

### Step 2 — Plan (med skitse-tjek)

**2.0 skitse + størrelse:** 1-5 migrations → fuld V1. 6+ → STOP, split-forslag (krav-dok forbliver ÉT dok, implementation splittes over pakker).
**2.1 fuld plan (Code+Codex parallel fra V1):** Code skriver V<n>; Codex laver parallel kode-research. Code håndterer hvert KODE-FUND eksplicit i V<n+1> (ADRESSERET / AFVIST fordi Y). Stop: Codex APPROVAL + "INGEN NYE FUND".

### Step 3 — qwerg

Mathias paster `qwerg` når Codex har approved OG Mathias selv har læst igennem.

### Step 4 — Build

Batches på 3-5 migrations. Patch-først (§3.1). End-to-end-konsistens per batch. Smoke-fejl → STOP-gate (§3.7).

### Step 5 — Slut-rapport

Code skriver `rapport-historik/<dato>-<pakke>.md`. Claude.ai reviewer FØR merge.

---

## §3 Bygge-disciplin

### 3.0 Formåls-immutabilitet (genindført)

Hver pakke har ét FORMÅL (krav-dok §Formål). Når Mathias har godkendt det, er det **låst**. Code må ændre den tekniske implementations-vej undervejs (Code's domæne — flag i slut-rapport under Plan-afvigelser), men **ikke** formålet. Afslører implementation at formålet ikke kan leveres: STOP, eskalér. Codex-fund kan føre til bug-fix, implementations-ændring, G-nummer eller STOP+eskalation — **aldrig** til at Code ændrer formål, tilføjer features eller omtolker hvad pakken skal levere.

### 3.1 Patch-først (byg ovenpå, ikke nyt)

For HVER eksisterende funktion/policy/tabel der ændres: plan inkluderer NUVÆRENDE body 1:1 med file:linje + markerer DIFF eksplicit (hvad fjernes/tilføjes, hvilke gates/kommentarer/kolonner/audit-spor bevares) + migration starter med diff-summary. Tab af gate/kommentar/kolonne uden begrundelse = `MANGLENDE-EKSISTERENDE-BEVARELSE` (KRITISK).

### 3.2 DB-state-dump som plan-pre-condition

Code må ikke skrive plan før konkret DB-state er dumpet via Supabase MCP (RPC-bodies via `pg_get_functiondef`, kolonner+constraints, policies, grants) og lagt i plan under "Verificerede DB-objekter" som råt output. Ingen gæt, ingen cached state.

### 3.3 End-to-end-spor pr. write-vej

For hver write-RPC der ændres/tilføjes: (1) GRANT + policy + session-var som tre-pak, (2) SELECT-policy bred nok til alle legitime læsere, (3) apply-dispatcher-extension, (4) én eksempel-row gennem fuldt flow (UI → handler → RPC → DB → læsning), (5) krydscheck mod fundament-tjek. Manglende ét = KRITISK i plan-review.

### 3.4 Konvergens-counter med auto-STOP

Counter i pakke-status, incrementerer pr. V<n>. Runde 1-3 normalt · 4 Mathias-alert ("er krav-dok præcist nok?") · 5 auto-pause · 6+ auto-STOP (krav-dok genåbnes eller pakken splittes). Konvergerer vi ikke i 3-4 runder er problemet rammen, ikke "prøv igen".

### 3.5 Pakke-status.md — kontekst mellem sessioner

Hver aktiv pakke har én lille fil: sidste handling · næste forventet · konvergens-counter · aktuel blocker. AI'er læser den FØRST.

### 3.6 End-to-end-test er leverings-kriterium

Hver pakke leverer mindst ÉN test gennem ÉT konkret flow (UI/RPC → DB-write → RLS → læsning). Schema-only ("kolonner findes") accepteres ikke.

### 3.7 STOP-FOR-CLARIFICATION-gate

Build-afvigelse fra krav-dok kræver eksplicit Mathias-godkendelse via gate-fil — ikke Code-selvbeslutning. STOP build → `mathias-gate/<pakke>-<type>-<N>.md` (Status: AFVENTER MATHIAS + afvigelse + begrundelse) → Mathias: GODKENDT/AFVIST → genoptag/alternativ. FORBUDT: "det er midlertidigt", "min fortolkning".

### 3.8 Pakke-størrelses-grænse

Skitse > 5 migrations → STOP, foreslå split.

### 3.9 Destructive drops kræver preflight (genindført — højeste indsats; Stork rører løndata)

`DROP TABLE/COLUMN`, `TRUNCATE`, `DELETE` uden WHERE o.l. kræver:

- **Tom-check:** `count(*) = 0`, eller eksplicit kvittering for antal rows der tabes
- **Reference-check:** ingen FK refererer det droppede (ikke kun CASCADE-fix)
- **Audit-spor:** session-vars `source_type` + `change_reason` sat før operation
- **Rollback-plan:** hvordan operationen rulles tilbage

Pre-cutover (ingen rigtige data): tom-check + audit-spor er minimum. Post-cutover: alle fire er CI-blocker; manglende preflight = review-rejection. Dette er den dyreste fejl-klasse i systemet.

---

## §4 Bevarelses-disciplin — hvad gemmes, hvad slettes

**Princip:** kun krav-dok + godkendt plan (slut-version) + slut-rapport overlever pakken. Resten lever i git-history.

**Bevares på main:** krav-dok → `arkiv/<pakke>-krav-og-data.md` · plan → `arkiv/<pakke>-plan.md` · slut-rapport → `rapport-historik/<dato>-<pakke>.md` · in-place-opdateringer til vision, forretningsforstaaelse, master-plan (overblik), teknisk-gaeld.

**Slettes ved pakke-luk:** `<pakke>-status.md` · alle `plan-feedback/<pakke>-V<n>-*` · alle `codex-reviews/<pakke>-runde-*` · afgjorte `mathias-gate/<pakke>-*` · plan-versioner V1..Vn (git-history bevarer sporet).

**Én bevarings-politik.** Arkivet er ikke en voksende kirkegård; iterations-, recon- og review-filer lever i git-history, ikke som filer på main.

---

## §5 Severities + FLAG/LØS-dialog

| Severity                             | Konsekvens                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **KRITISK**                          | Stopper plan/build i alle runder. Code SKAL adressere næste runde                                                                                |
| **MANGLENDE-EKSISTERENDE-BEVARELSE** | KRITISK-undertype: mister gate/kommentar/kolonne fra eksisterende body uden begrundelse                                                          |
| **MELLEM**                           | Stopper i runde 1. G-nummer i runde 2+                                                                                                           |
| **KOSMETISK**                        | Stopper IKKE. G-nummer-kandidat                                                                                                                  |
| **OPGRADERING**                      | Stopper IKKE. Code afviser eller implementerer eksplicit i V<n+1>. Codex må give APPROVAL + OPGRADERING samtidig                                 |
| **NEEDS-MATHIAS**                    | Stopper i alle runder. Code kan ikke lave V<n+1> før Mathias afgør. Reviewer skriver eksplicit spørgsmål. Max 2 pr. review — flugtvej hvis flere |
| **FULDSTYRKE-MANGEL**                | Kun Mathias-rejst. AI scrapper output, gentager samme V-nummer                                                                                   |

Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEVARELSE binder patch-først; OPGRADERING muliggør approval+forslag samtidig.)

**Runde-trapper:** runde 1 alle fund vurderes · runde 2 kun KRITISK stopper, MELLEM → G-numre · runde 3 kun KRITISK, resten → G-numre · runde 4+ se §3.4.

**FLAG → LØS (Code's svar pr. Codex-fund):** ACCEPT / PUSHBACK (argumentér; Codex: AGREE/REFINE) / PROPOSE-ALTERNATIVE. Max 3 LØS-iterationer pr. fund; > 3 → auto-eskalation via `mathias-gate/`.

**Positive markers:** OPTIMERING-FORSLAG (Codex) → Code: ADOPT/DEFER/DISMISS · SPARRING-OENSKE (Code) → Codex: CONFIRM/TIMING/AVOID.

---

## §6 Build-markers + automation

### 6.1 Halt-markers

`BRUD-PAA-KRAV` → Step 1 · `TEKNISK-BLOKERING` → Step 2 / Mathias · `PLAN-AFVIGELSE` → Step 2 / Mathias · `KRITISK-SIKKERHEDSHUL` → fix samme batch / Mathias · `WORKAROUND-INTRODUCERET` → mathias-gate · `STOP-FOR-CLARIFICATION` → gate-fil.

### 6.2 Automation (Codes bord — tilstand: notify-only)

`codex-notify.yml` poster tracker-comments på push til aktiv-plan/seneste-rapport/build-branch og på slut-rapport-PR. **Den kører ikke Codex, og der er ingen auto-merge.** Mål-tilstand (skal bygges, Codes bord): plan-branch-trigger (H020), Codex-runner, auto-merge ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations — verificér mod Codes kortlægning før den antages aktiv.

### 6.3 Mathias-gate to-fil-flow

For WORKAROUND-INTRODUCERET, STOP-FOR-CLARIFICATION, dobbelt-ESCALATE og iter > 3: build pauser → Code skriver gate-fil (Status: AFVENTER MATHIAS + begrundelse + G-nummer + deadline) → Mathias: GODKENDT/AFVIST → genoptag/alternativ → slettes ved pakke-luk.

---

## §7 Stork-invariant-tjek pr. pakke (verificeres i slut-rapport)

| #   | Invariant                    | Test                                                        |
| --- | ---------------------------- | ----------------------------------------------------------- |
| 1   | Vision-overholdelse          | Vision-tjek-sektion (ja/nej + evidens pr. princip)          |
| 2   | Permission-matrix-konsistens | RPC→tab/page-mapping opdateret + RLS dækker alle write-veje |
| 3   | Audit-trigger-dækning        | Alle nye tabeller har audit-trigger (fitness)               |
| 4   | Konfiguration-i-data         | Ingen hardkodede satser/lønarter (lint)                     |
| 5   | End-to-end-flow virker       | Smoke-test passerer (ikke schema-only)                      |
| 6   | Anonymisering-bevaring       | UPDATE, ikke DELETE; FK'er intakt                           |

Tabel med ja/nej + evidens. Manglende eller "nej" uden begrundelse → KRITISK fra Claude.ai-reviewer.

---

## §8 Modsigelses-disciplin (genindført — differentieret efter dokument-status)

Hvad en modsigelse udløser afhænger af hvilket dokument den rammer. Det forhindrer at arbejdet stopper på master-plan (som er overblik, ikke kontrakt).

| Dokument                                | Status              | Modsigelse udløser                                                                                                                                           |
| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt. Dokumentér i blokker-fil, argumentér ikke videre                                                                             |
| `stork-2-0-master-plan.md` + afgørelser | **RETNINGSGIVENDE** | Rapport til Mathias — IKKE auto-blokering. Han afgør: er rammen forældet (rettes) eller skal pakken justeres? Arbejdet stopper ikke, det venter på afgørelse |
| krav-dok + plan (efter approval)        | **PAKKE-KONTRAKT**  | STOP. KRITISK indtil Mathias afgør re-godkendelse eller justering                                                                                            |

Pointe: kun vision og pakke-kontrakten stopper automatisk. Master-plan-modsigelse er en trigger for en afgørelse, ikke en blokering.

### §8.1 Governance-vagt (gov-2 — mekanisk lag-1 + Codex-mandat)

Spærhagen der fanger governance-drift, så disciplinen ikke kun hviler på selv-tjek.

**Mekanisk (lag 1 — `scripts/governance-check.mjs`, `pnpm governance:check`, CI-step):** døde doc-stier (docs + scripts), junk/lock-filer, brudte LÆSEFØLGE-/pointer-mål, **owns-unikhed** (ét begreb, ét hjem), nummer-hjem-unikhed (G/H kanonisk entry ét sted), H-ref-integritet (hver H-ref → åben entry eller historisk-kode i `huskeliste.md`). Princip: **owner = definitionshjem, ikke mention-hjem.** Hver governance-doc deklarerer sit ejerskab via en `<!-- governance-owns: … -->`-markør; scanneren fejler ved dobbelt-ejerskab. **Ærlig grænse:** fanger _deklareret_ dobbelt-ejerskab + nummer-dubletter mekanisk; _udeklareret prosa-overlap_ fanges ikke mekanisk → lag 2.

**Codex-mandat (lag 2 — semantisk):** ved enhver ændring til en governance-doc (vision / disciplin / master-plan / forretningsforstaaelse / owns:-register) SKAL Codex eksplicit svare: **"modsiger dette prosa-mæssigt et begreb som en anden doc ejer?"** før merge. Det dækker den klasse scanneren ikke kan.

**Governance-ændringer er review-artefakter:** en ændring til vision/disciplin/master-plan går gennem samme gate som kode — `governance:check` grøn + Codex' prosa-modsigelses-svar. Fraværet af netop dette gav V5's rolle-modsigelse (vision↔disciplin); §8.1 lukker den klasse.

---

## §9 Rolle-disciplin pr. AI

Når Mathias paster `qwers` læser AI'en sin sektion + bekræfter rolle.

**Glid-detector (genindført — svageste lag).** Selv-tjek fanger ikke pålideligt; det bærende værn er mekanisk tjek + Codex + Mathias. Men hver aktør spotter selv:

- **Code:** "jeg har implicit forenklet" / "ikke fået svar 2 gange" / "afviger fra plan uden flag" → STOP, flag
- **Claude.ai:** "jeg gætter på kilde" / "jeg fabrikerer detalje" / "jeg pakker forslag som afgjort" / "jeg påstår repo-tilstand uden at have set den" → flag [gæt] eller verificér/spørg
- **Codex:** "jeg holder nok-OK tilbage" / "jeg eskalerer for at undgå at afgøre" → flag

### §9.1 Claude.ai

**Rolle:** krav-dok-typist (Step 1) + slut-rapport-reviewer (Step 5) + sparring. Docs-lag.
**MÅ:** skrive krav-dok fra Mathias' input · spørge Mathias direkte i krav-dok-fasen · reviewe slut-rapport mod krav-dok + vision + forretningsforstaaelse · levere FEEDBACK eller APPROVAL (aldrig begge).
**MÅ IKKE:** tekniske beslutninger · krav-dok-påstande uden Mathias-kilde · kode-vurdering (Codex' bord) · datamodel-design (Code's bord) · skrive "afgørelser" · påstå at noget ER bygget når et dokument kun siger det SKAL bygges (→ "ikke verificeret, Codes bord").
**Triggers:** `qwers` → bekræft rolle · `qwers <pakke>` → bekræft + proaktiv kontekst-recon STRENGT i forretnings-sprog (læs forretningsforstaaelse + evt. vision + søg rapport-historik; output: "det vi har" + targeted spørgsmål + scope-forslag; FORBUDT: tabel/kolonne/RPC-navne) · `qwerr` → slut-rapport-review.

### §9.2 Code

**Rolle:** builder.
**MÅ:** vælge tekniske løsninger inden for godkendt plan · PUSHBACK med teknisk grund · stoppe ved blokering og lave gate-fil.
**MÅ IKKE:** forretnings-afgørelser · udvide scope uden plan-revurdering · afvige fra krav-dok-leverance uden gate · genfortolke eksisterende funktioner uden patch-først (§3.1) · ændre formål (§3.0).
**Triggers:** `qwers` → bekræft · `qwerr` → læs pakke-status + udfør næste · `qwerg` → byg.
**Plan-disciplin:** DB-state-dump (§3.2) · patch-først (§3.1) · end-to-end-spor (§3.3) · pre-push-tjekliste (formål matcher krav-dok, alle leverancer dækket, body-sektioner udfyldt).

### §9.3 Codex

**Rolle:** uafhængig kode-reviewer, read-only.
**MÅ:** flage alt tvivlsomt på kode-niveau · foreslå OPGRADERING · bestride "kompromis" som mulig drift.
**MÅ IKKE:** skrive kode · beslutte · holde "nok OK" tilbage · acceptere "kendt gæld" uden G-nummer · eskalere alt til NEEDS-MATHIAS som flugt.
**Plan-review-fokus (dækker den gamle fire-dok-konsultations substans):** patch-først korrekt? · end-to-end-spor alle 5? · DB-state-dump matcher faktisk state? · krav-dok-konsistens uden scope-creep? · vision + forretningsforstaaelse-modsigelse? **Approval:** APPROVAL eller FEEDBACK (undtagelse: APPROVAL + OPGRADERING). Kun Codex-approval kræves for plan.

---

## §10 Skabeloner (inline)

### §10.1 Krav-dok-skabelon

```markdown
# <pakke> — Krav-og-data

**Type:** Mathias' tanker om hvad pakken skal levere
**Dato:** YYYY-MM-DD

## Formål

> Denne pakke leverer: [én sætning]

## Forretningssandheder

[Mathias' tanker om hvad systemet skal kunne — forretnings-niveau, ikke teknisk]

## I scope

- [Konkret leverance]

## IKKE i scope

- [Hvad ligner, men ikke hører til denne pakke]

## End-to-end-test-design

[Mindst ÉN konkret flow: UI/RPC → DB-write → RLS → læsning]

## Åbne spørgsmål

[Afklares før plan-fase]
```

### §10.2 Plan-skabelon

```markdown
# <pakke> — Plan V<n>

**Branch:** claude/<pakke>-plan
**Krav-dok:** docs/coordination/<pakke>-krav-og-data.md

## Formål

[1:1 fra krav-dok]

## Verificerede DB-objekter (DB-state-dump)

[Råt Supabase-MCP-output: RPC-bodies, tabeller, policies, grants]

## Verificerede afhængigheder

| Reference | Defineret i | Linje | Brug i denne plan |

## Patch-først pr. ændret funktion

[Eksisterende body 1:1 + file:linje · diff · begrundelse + callers]

## End-to-end-spor pr. write-vej

[GRANT + policy + session-var + apply-dispatcher + eksempel-row-flow]

## Implementations-rækkefølge

| Step | Type | Hvad | Eksakt indhold | Afhængigheder | Risiko |

## End-to-end-test-design

[Konkret smoke-test-fil + flow]

## Oprydnings- og opdaterings-strategi

[Hvilke autoritative docs opdateres: forretningsforstaaelse, master-plan, teknisk-gaeld]
```

### §10.3 Slut-rapport-skabelon

```markdown
# <pakke> — Slut-rapport

**Dato:** YYYY-MM-DD · **Branch:** claude/<pakke>-build · **Merge-commit:** <hash>

## Formål (genfremlagt fra krav-dok)

## Leverancer (mod krav-dok §I scope)

| Krav-dok-leverance | Status | Migration/RPC | Test | Evidens |

## Stork-invariant-tjek

| Invariant | Status | Evidens |
| Vision-overholdelse | ✓/✗ | [princip + hvordan opfyldt] |
| Permission-matrix | ✓/✗ | [opdateret fil + linje] |
| Audit-trigger | ✓/✗ | [fitness grøn] |
| Konfiguration-i-data | ✓/✗ | [ingen hardkodede satser] |
| End-to-end-flow | ✓/✗ | [smoke grøn — ikke schema-only] |
| Anonymisering-bevaring | ✓/✗ | [UPDATE ikke DELETE; FK intakt] |

## Plan-afvigelser

[Liste eller "ingen" — hver med Mathias-gate-fil eller godkendelse]

## G-numre rejst

[Reference til teknisk-gaeld.md]

## Konvergens-historie

| V<n> | Codex-fund | Code-svar | Outcome |

## Vision-tjek

- Rigtig løsning eller workaround?
- Vision-styrkelser / -svækkelser denne pakke
- Konklusion: forsvarligt / kompromis / drift
```

### §10.4 Codex-review-prompt-skabelon

```markdown
Du er Codex i Stork 2.0 — uafhængig kode-reviewer.

Læs FØR review:

- docs/strategi/vision-og-principper.md
- docs/strategi/forretningsforstaaelse.md (tanke-data, ikke kontrakt)
- docs/strategi/disciplin.md §9.3 (din rolle)
- docs/coordination/<pakke>-krav-og-data.md (pakke-kontrakt)
- docs/coordination/<pakke>-plan.md (det du reviewer)
- docs/coordination/<pakke>-status.md (kontekst + konvergens-counter)

Review-fokus:

- Patch-først (§3.1): eksisterende body 1:1 + diff?
- End-to-end-spor (§3.3): alle 5 punkter pr. write-vej?
- DB-state-dump (§3.2): matcher faktisk state?
- Krav-dok-konsistens uden scope-creep
- Vision + forretningsforstaaelse-modsigelse
- MANGLENDE-EKSISTERENDE-BEVARELSE (KRITISK-undertype)

Format pr. fund:
[SEVERITY] Kort beskrivelse
Konkret afvigelse: ...
Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]
```

### §10.5 Pakke-status-skabelon

Se §3.5 — kort fil med sidste handling, næste forventet, konvergens-counter, blocker.

---

## §11 Disciplin-tjekliste — før hver migration skrives

1. Hvilket vision-element understøtter dette? 2. Hvilket kunne det svække? 3. Findes en simplere løsning uden vision-kompromis? 4. Hvis kompromis: dokumenteret med G-nummer + deadline? 5. Skal en halt-marker rejses (§6.1)? 6. Patch-først overholdt (§3.1)? 7. End-to-end-spor dokumenteret (§3.3)? 8. Hvis destructive drop: preflight kørt (§3.9)?

Hvis "nej" på 4, 7 eller 8: STOP og spørg Mathias.

---

## §12 Stop-betingelser

Master-plan-konflikt (men master-plan er overblik — se §8) · vision-modsigelse (LÅST) · designvalg ikke afgjort · data-tab-risiko ud over allerede afgjort · konvergens-counter rammer 5 · destructive drop uden preflight (§3.9) · inline-fix kræver ændring af fundament-infrastruktur.

---

## §13 Git-sync-disciplin

`git pull origin main` før enhver session-start/review-runde. Påstande baseret på cached/forældet kopi = fabrikation. Code: pull ved hver trigger. Codex (auto): frisk på commit-trigger. Codex (manuel): pull før review. Claude.ai: kan ikke pulle — beder Mathias om commit-hash/fil-indhold ved tvivl, antager ikke fra hukommelse. Uventede commits ved pull → STOP, rapportér.

---

## Forudsætninger før V5 er fuldt i kraft (ikke gjort endnu — ærligt)

Adoption af denne fil er første skridt, ikke hele V5. Udestår:

- **Docs-oprydning (Claude.ai's bord):** fold arkivet til git-history (gov-6).
- **Master-plan (Claude.ai's bord):** afklar om Appendix C's rettelses-historik hører i planen eller i historik.
- **Fundament + spærhager (Codes bord):** de manglende CI-blockers (gov-3, i gang) · branch protection (gov-4) · Codex-runner + auto-merge + plan-branch-trigger (gov-5).

Gjort i V5-adoptionen: disciplin.md = V5 · vision renset for roller · seneste-rapport-pointer rettet · skill flyttet til docs/claude-ai/ (tombstone `git rm`'et) · Appendix A 4-dim markeret superseded · LÆSEFØLGE opdateret · `codex-notify.yml` handoff-refs rettet til §9.1/§9.3. · **gov-1 (repo↔DB-paritet, PR #92 merged)** · **gov-2 (mekanisk spærhage + owns-register + §8.1 Codex-mandat + H-hjem `huskeliste.md`, PR #93 merged)**.

V5 virker kun hvis erstatning faktisk sker — denne fil afløser V4, lægges ikke ved siden af.

---

**V5 — 2026-06-03.** Afløser V4 (2026-05-22). Genindfører formåls-immutabilitet, differentieret modsigelses-håndtering, destructive-drops-preflight, glid-detector. Beholder V4's bevidste forenklinger. Skriver automation ærligt som notify-only.
