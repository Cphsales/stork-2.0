# Stork 2.0 — Arbejds-disciplin (V4)

Disciplin for hvordan vi arbejder sammen om Stork 2.0. Mathias styrer tanker, funktioner, logik og vision; AI'erne (Claude.ai, Code, Codex) bygger kode. Vi bygger ovenpå eksisterende kode, ikke nyt hver gang.

---

## §1 Aktører og roller

| Aktør         | Rolle                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Mathias**   | Tanker, funktioner, logik, vision. Eneste beslutningstager. Skriver/dikterer krav-dok pr. pakke. Godkender plan + slut-rapport |
| **Claude.ai** | Krav-dok-typist (skriver Mathias' tanker ned). Slut-rapport-reviewer (verificerer at vi leverede det vi lovede)                |
| **Code**      | Builder. Skriver migrations, RPC'er, tests. Eneste der har skrive-adgang til repo                                              |
| **Codex**     | Uafhængig kode-reviewer. Read-only. Finder bugs, RLS-huller, SQL-fejl, manglende eksisterende-bevarelse                        |

**Hvad ingen AI må:**

- Træffe forretnings-beslutninger på Mathias' vegne
- Skrive "afgørelser" eller "ramme-låsninger" som AI
- Fortolke retning som specifikation (uden eksplicit bekræftelse)
- Designe datamodel uden Mathias-input (Claude.ai); skrive kode (Codex)

---

## §2 Workflow — 5-step flow

Alle pakker kører fuld disciplin. Ingen skala-distinktion.

```
0. Pakke-åbning (Mathias åbner ny pakke)
   ↓
1. Krav-dok (Mathias → Claude.ai-typist med proaktiv recon; Mathias-validator)
   │  Mathias merger krav-dok-PR
   ↓ (Code auto-fortsætter)
2. Plan (Code + Codex parallel; skitse → størrelses-tjek → fuld plan eller split)
   ↓
3. qwerg approval (Mathias)
   ↓
4. Build (Code batches; Codex per-batch auto; end-to-end-konsistens-tjek per batch)
   │  Mathias merger build-PR; migrations auto-deployes
   ↓ (Code auto-fortsætter)
5. Slut-rapport (Code skriver; Claude.ai-review FØR merge; Mathias merger)
```

**Auto-fortsæt-pile (V4):** Mathias paster KUN ved Step 0 (pakke-åbning) og Step 3 (`qwerg`); resten er auto via Code's state-detection (se §8.2).

### Step 0 — Pakke-åbning

Mathias melder ny pakke ud i chat. Ingen skala-vurdering nødvendig — alle pakker kører samme disciplin.

### Step 1 — Krav-dok

Claude.ai skriver `docs/coordination/<pakke>-krav-og-data.md` baseret på Mathias' chat-input. Mathias er direkte validator i samme chat.

**Krav-dok-disciplin:**

- Indeholder Mathias' tanker om hvad pakken skal levere (forretning + funktion + logik)
- Ingen "kilde: XXX"-citater (Mathias ER kilden — hans ord i chat)
- Ingen tabel-navne, kolonner, RPC-signaturer (det er Code's bord i plan-fasen)
- Hver påstand kan peges på Mathias-ord — hvis ingen kilde: spørg, skriv ikke

### Step 2 — Plan (med skitse-tjek)

**Step 2.0 — Plan-skitse + størrelses-tjek:**

Code laver skitse af planen og tæller migrations + RPC'er ændret.

| Skitse-størrelse | Handling                                                                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1-5 migrations   | Fortsæt med fuld V1                                                                                                                                                                                                     |
| 6+ migrations    | **STOP.** Code leverer split-forslag: "Krav-dok kan implementeres i 3 dele — A (3 mig), B (4 mig), C (2 mig)". Mathias godkender split. Krav-dok forbliver ÉT dokument; implementations splittes over sekvens af pakker |

**Step 2.1 — Fuld plan (parallel Code+Codex fra V1):**

Code skriver V<n>; Codex laver parallel kode-research efter blind-vinkler. Begge leverer outputs samtidigt; Codex integrerer V<n>-review + kode-research i ÉN leverance.

**Sekvens pr. iteration V<n>:**

1. **Parallel start:** Code skriver V<n>; Codex laver parallel kode-research
2. **Udveksling:** Code committer V<n>; Codex committer integreret leverance i `docs/coordination/plan-feedback/<pakke>-V<n>-codex.md`
3. **V<n+1>-åbning:** Code håndterer hvert KODE-FUND eksplicit (ADRESSERET i sektion X / AFVIST fordi Y)
4. **Stop:** Codex APPROVAL + positive marker "INGEN NYE FUND I KODE" → Mathias paster `qwerg`

### Step 3 — qwerg approval

Mathias paster `qwerg` når plan er approved af Codex OG Mathias selv har læst igennem.

### Step 4 — Build

Code bygger i batches (3-5 migrations pr. batch). Codex laver per-batch review automatisk på push (se §6.2 automation).

**Build-disciplin:**

- Patch-først (vis eksisterende body 1:1 + diff — se §3)
- End-to-end-konsistens-tjek per batch (grants + policies + session-vars + signaturer stemmer)
- Smoke-test fejler → STOP-FOR-CLARIFICATION-gate (ikke Code-selvbeslutning — se §3)
- Konvergens-counter på review-runder (se §3)

### Step 5 — Slut-rapport

Code skriver `docs/coordination/rapport-historik/<dato>-<pakke>.md`. Claude.ai laver step-5 review **FØR slut-rapport-PR merges** (ikke efter). Mathias merger når Claude.ai approver.

---

## §3 V4-disciplin-tilføjelser

### 3.1 Patch-først (bygge ovenpå, ikke nyt)

For HVER eksisterende funktion/policy/tabel der ændres:

1. Plan-fil inkluderer NUVÆRENDE body 1:1 med file:linje
2. Plan-fil markerer DIFF eksplicit (linje X fjernes, linje Y tilføjes, gates/kommentarer/kolonner bevares)
3. Migration-fil starter med diff-summary-kommentar

**Plan-leverance pr. ændret funktion (format):**

````markdown
### RPC: <schema>.<navn>(<args>)

**Eksisterende body** (fra <file>:<linje-fra>-<linje-til>):

```sql
-- exact 1:1 copy of current function body
```
````

**Ændringer:**

- Linje X: <hvad fjernes>
- Linje Y: <hvad tilføjes>
- Bevares uden ændring: <hvilke gates, kommentarer, kolonner, audit-spor>

**Begrundelse for ændring:** [krav-dok-reference]

**Hvor er den kaldt fra:** [file:linje for hver caller]

````

**Codex' KRITISK-kategori:** `MANGLENDE-EKSISTERENDE-BEVARELSE` — hvis V<n+1> mister gate/kommentar/kolonne fra eksisterende body uden eksplicit begrundelse → STOP.

### 3.2 DB-state-dump som plan-pre-condition

Code må ikke skrive plan før den har dumpet konkret DB-state via Supabase MCP:

- Hver eksisterende RPC plan refererer: hent `pg_get_functiondef(...)` 1:1
- Hver tabel: hent kolonner + constraints
- Hver policy: hent SELECT/INSERT/UPDATE/DELETE-policies
- Hver grant: hent eksisterende GRANT'er

Disse lægges i plan-fil under "Verificerede DB-objekter" som råt output. Code må ikke gætte eller bruge cached state.

### 3.3 End-to-end-spor pr. write-vej

For hver write-RPC (eksisterende eller ny) der ændres eller tilføjes — plan og build skal eksplicit demonstrere fuldt flow:

1. **GRANT + policy + session-var som tre-pak:** har planen GRANT på tabellen, RLS-policy med session-var-reference, og sætter session-var FØR operation?
2. **SELECT-policy bredde:** er SELECT-policy bred nok til alle legitime læsere?
3. **Apply-dispatcher-extension:** for hver ny write-RPC, eksplicit specificeret pattern
4. **Eksempel-row gennem flow:** følg én konkret eksempel-row (non-admin med relevant permission) gennem UI-input → handler → RPC → DB → læsning
5. **Krydscheck mod fundament-tjek:** hvis Code har sagt "ja" til et tjek Codex finder fejl på = KRITISK fund

Manglende ét af disse = KRITISK fund i plan-review.

### 3.4 Konvergens-counter med auto-STOP

Hver pakke har en counter i pakke-status (se §3.5). Counter incrementerer pr. V<n>.

| Runde | Status |
| ----- | ------ |
| 1-3   | Normalt |
| 4     | Mathias-alert: "Vi har 4 runder — er krav-dok præcist nok?" |
| 5     | Pakke pauseres automatisk; Mathias bestemmer om vi fortsætter, splitter, eller genåbner krav-dok |
| 6+    | Auto-STOP — krav-dok genåbnes eller pakken splittes. Ingen V7+ uden Mathias-godkendt re-spec |

Forhindrer 16-runde-spiraler. Hvis vi ikke konvergerer i 3-4 runder, er problemet ikke "Code skal prøve igen" — det er at rammen er forkert.

### 3.5 Pakke-status.md — eksplicit kontekst mellem AI-sessioner

Hver aktiv pakke har én lille fil: `docs/coordination/<pakke>-status.md`.

**Format:**

```markdown
# <pakke> — status

**Sidste handling:** YYYY-MM-DD HH:MM (Code/Codex/Claude.ai/Mathias — kort beskrivelse)
**Næste forventet:** [hvem + hvad]
**Konvergens-counter:** V<n>, runde N for fund-type X (alert ved 4)
**Aktuel blocker:** [konkret, eller "ingen"]
````

AI'er læser denne FØRST før de gør noget. Det erstatter tracker-issue-events + manuelle Mathias-rapporter.

### 3.6 End-to-end test er leverings-kriterium

Hver pakke skal levere mindst ÉN test der følger ÉT konkret flow: UI-input/RPC-call → DB-write → RLS-tjek → læsning. Schema-only-test (kun "kolonner findes") accepteres ikke som leverance.

**Konsekvens:**

- Migration-gate i CI udvides med "Hver pakke har mindst én end-to-end-smoke-test"
- Plan-skabelon-sektion: "End-to-end-test-design" obligatorisk
- Smoke-afvigelse fra krav-dok §test-design → STOP-FOR-CLARIFICATION-gate

### 3.7 STOP-FOR-CLARIFICATION-gate

Build-fase afvigelse fra krav-dok kræver eksplicit Mathias-godkendelse via gate-fil — IKKE Code-selvbeslutning.

**Trigger:** Code overvejer "implementations-vej-justering" der afviger fra krav-dok-leverance (fx schema-only-test i stedet for end-to-end).

**Procedure:**

1. STOP build
2. Code skriver `docs/coordination/mathias-gate/<pakke>-<type>-<N>.md` med `Status: AFVENTER MATHIAS` + konkret afvigelse + begrundelse
3. Mathias edit'er: `Status: GODKENDT` eller `Status: AFVIST — alternativ: <hvad>`
4. Code: ved GODKENDT genoptag build; ved AFVIST implementer alternativ

**Eksplicit FORBUDT:** "Det er midlertidigt"-undskyldning. "Min fortolkning af krav-dok"-justering. Alt afvigelse går gennem gate.

### 3.8 Pakke-størrelses-grænse (kode-niveau)

Skitse > 5 migrations → STOP, foreslå split (se Step 2.0). Forhindrer pakker der er for store til at reviewes end-to-end.

---

## §4 Bevarelses-disciplin — hvad gemmes, hvad slettes

**Princip:** Vi gemmer ikke ligegyldige iterationsfiler. Kun krav + godkendt plan + slut-rapport overlever pakken — resten lever i git-history og merge-commits.

### Bevares evigt på main

| Fil                              | Sti under pakke-arbejde                                                                                                                                                                       | Sti efter pakke-lukker                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Krav-dok                         | `docs/coordination/<pakke>-krav-og-data.md`                                                                                                                                                   | `docs/coordination/arkiv/<pakke>-krav-og-data.md`      |
| Godkendt plan (kun slut-version) | `docs/coordination/<pakke>-plan.md`                                                                                                                                                           | `docs/coordination/arkiv/<pakke>-plan.md`              |
| Slut-rapport                     | —                                                                                                                                                                                             | `docs/coordination/rapport-historik/<dato>-<pakke>.md` |
| Opdateringer til                 | `docs/strategi/vision-og-principper.md`, `docs/strategi/forretningsforstaaelse.md`, `docs/strategi/stork-2-0-master-plan.md` (overblik, opdateres til sidst), `docs/teknisk/teknisk-gaeld.md` | (uændret — opdateres in-place på main)                 |

### Slettes ved pakke-lukker

| Fil/Mappe                                                                  | V4-skæbne                                |
| -------------------------------------------------------------------------- | ---------------------------------------- |
| `docs/coordination/<pakke>-status.md`                                      | Slettes (kontekst forsvinder med pakken) |
| `docs/coordination/plan-feedback/<pakke>-V<n>-codex.md` (alle iterationer) | Slettes                                  |
| `docs/coordination/codex-reviews/<dato>-<pakke>-runde-*.md` (alle runder)  | Slettes                                  |
| `docs/coordination/mathias-gate/<pakke>-*.md` (afgjorte gate-filer)        | Slettes                                  |
| Plan-versionerne V1, V2, V3... i samme fil                                 | Git-history bevarer iterations-spor      |

### Hvor lever historikken så?

- **Iterationer:** git log + commit-messages på `claude/<pakke>-plan`-branch
- **Codex-fund der blev løst:** i selve koden (commit-history)
- **Codex-fund der ikke blev løst:** som G-numre i `teknisk-gaeld.md`
- **Disciplin-ændringer:** i de opdaterede autoritative dokumenter

---

## §5 Severities + FLAG/LØS-dialog

### Severities

| Severity                             | Konsekvens                                                                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **KRITISK**                          | Stopper plan/build i alle runder. Code SKAL adressere i næste runde                                                                       |
| **MANGLENDE-EKSISTERENDE-BEVARELSE** | KRITISK-undertype: mister gate/kommentar/kolonne fra eksisterende body uden begrundelse                                                   |
| **MELLEM**                           | Stopper i runde 1. Bliver G-nummer i runde 2+                                                                                             |
| **KOSMETISK**                        | Stopper IKKE. G-nummer-kandidat                                                                                                           |
| **OPGRADERING**                      | Stopper IKKE i sig selv. Code skal eksplicit afvise eller implementere i V<n+1>. Codex må levere APPROVAL og samtidig OPGRADERING-forslag |
| **NEEDS-MATHIAS**                    | Stopper plan i alle runder. Code kan IKKE lave V<n+1> før Mathias har afgjort. Reviewer dokumenterer eksplicit spørgsmål til Mathias      |
| **FULDSTYRKE-MANGEL**                | Kun Mathias-rejst. AI scrapper output og gentager samme V-nummer (ikke V<n+1>)                                                            |

### Runde-trapper

- **Runde 1:** alle fund vurderes
- **Runde 2:** kun HØJ/KRITISK stopper. MELLEM → G-numre
- **Runde 3:** kun KRITISK stopper. Resten → G-numre, implementation fortsætter
- **Runde 4+:** se konvergens-counter i §3.4

### FLAG → LØS-dialog (Code's svar pr. Codex-fund)

| Svar                    | Hvornår                                                                  |
| ----------------------- | ------------------------------------------------------------------------ |
| **ACCEPT**              | "Du har ret, jeg fixer i næste commit"                                   |
| **PUSHBACK**            | "Fund er ikke gyldigt pga. X" (argumentér; Codex kan AGREE eller REFINE) |
| **PROPOSE-ALTERNATIVE** | "Du har en pointe, men her er Y i stedet"                                |

Codex modsvarer AGREE / REFINE / ESCALATE. Max 3 LØS-iterationer pr. fund. Iter > 3 → auto-eskalation via `mathias-gate/`.

### Code's positive markers

| Marker                                | Codex svarer                    |
| ------------------------------------- | ------------------------------- |
| **OPTIMERING-FORSLAG** (Codex rejser) | Code: ADOPT / DEFER / DISMISS   |
| **SPARRING-OENSKE** (Code rejser)     | Codex: CONFIRM / TIMING / AVOID |

---

## §6 Build-fase markers + automation

### 6.1 Halt-markers (defensive)

| Marker                    | Trigger                                            | Routing                                                |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| `BRUD-PAA-KRAV`           | Build/plan modsiger krav-dok                       | → Step 1 (revid krav-dok)                              |
| `TEKNISK-BLOKERING`       | Ikke fysisk implementerbar (CI/tooling/dependency) | → Step 2 (revid plan); fundamental: Mathias-eskalation |
| `PLAN-AFVIGELSE`          | Build afviger fra approved plan uden krav-brud     | → Step 2 (plan V<n+1>) eller Mathias-godkendelse       |
| `KRITISK-SIKKERHEDSHUL`   | RLS-hul, datatab, SQL-injection, sikkerheds-risiko | Fix i samme batch; ikke muligt → Mathias               |
| `WORKAROUND-INTRODUCERET` | Bevidst kvalitets-sænkning                         | Mathias-gate to-fil-flow                               |
| `STOP-FOR-CLARIFICATION`  | Info mangler genuint ELLER afvigelse fra krav-dok  | Auto-STOP; gate-fil; mål-part svarer; genoptag         |

### 6.2 Automation (V4 leveret)

| Workflow                              | Trigger                                         | Aktion                                                              |
| ------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------- |
| `codex-notify.yml`                    | Push til main rører aktiv-plan/seneste-rapport  | Tracker-comment "ny plan-version" / "slut-rapport pushet"           |
| `codex-notify.yml`                    | Push til `claude/<pakke>-build`                 | Tracker-comment "Codex per-batch review klar"                       |
| `codex-notify.yml`                    | PR åbnet med head=`claude/<pakke>-slut-rapport` | Tracker-comment "Claude.ai step-5 — FØR merge"                      |
| `migrations-deploy.yml` (deploy)      | Push til main rører `supabase/migrations/*.sql` | `supabase db push --linked` til live + tracker-comment success/fail |
| `migrations-deploy.yml` (types-regen) | Efter deploy lykkedes                           | Regen `packages/types/src/database.ts`; hvis ændringer: auto-PR     |

### 6.3 Mathias-gate to-fil-flow

For `WORKAROUND-INTRODUCERET`, `STOP-FOR-CLARIFICATION`, ESCALATE-konsensus (begge ESCALATE), og auto-eskalation (iter > 3):

1. Build pauser (script exit code = 3 WORKAROUND eller 4 ESCALATE)
2. Code skriver `docs/coordination/mathias-gate/<pakke>-<type>-<N>.md` med `Status: AFVENTER MATHIAS` + begrundelse + G-nummer + deadline
3. Mathias edit'er gate-fil: `Status: GODKENDT` eller `Status: AFVIST — alternativ: <hvad>`
4. Code: ved GODKENDT → genoptag build; ved AFVIST → implementer alternativ
5. Ved pakke-lukker: gate-fil slettes (bevarelses-disciplin §4)

---

## §7 Stork-invariant-tjek pr. pakke

For at "bygge korrekt" er der seks Stork-specifikke invarianter hver pakke skal stå op mod. Verificeres i slut-rapport:

| #   | Invariant                    | Test                                                              |
| --- | ---------------------------- | ----------------------------------------------------------------- |
| 1   | Vision-overholdelse          | Vision-tjek-sektion i slut-rapport (ja/nej + evidens pr. princip) |
| 2   | Permission-matrix-konsistens | RPC→tab/page mapping opdateret + RLS dækker alle write-veje       |
| 3   | Audit-trigger-dækning        | Alle nye tabeller har audit-trigger (fitness-tjek)                |
| 4   | Konfiguration-i-data         | Ingen hardkodede satser/lønarter (lint)                           |
| 5   | End-to-end-flow virker       | Smoke-test passerer (ikke schema-only)                            |
| 6   | Anonymisering-bevaring       | UPDATE, ikke DELETE; FK'er intakt                                 |

**Format i slut-rapport:** tabel med ja/nej + evidens pr. invariant. Manglende eller "nej" uden begrundelse → KRITISK feedback fra Claude.ai-reviewer.

---

## §8 Rolle-disciplin pr. AI

Hver AI har sin egen sektion. Når Mathias paster `qwers` læser AI'en sin sektion + bekræfter rolle.

### §8.1 Claude.ai

**Rolle:** Krav-dok-typist (Step 1) + slut-rapport-reviewer (Step 5).

**MÅ:**

- Skrive krav-dok baseret på Mathias' chat-input
- Stille spørgsmål direkte til Mathias i krav-dok-fasen
- Reviewe slut-rapport mod krav-dok + vision + forretningsforstaaelse
- Levere FEEDBACK eller APPROVAL — aldrig begge

**MÅ IKKE:**

- Træffe tekniske beslutninger
- Skrive påstande i krav-dok uden Mathias-kilde (= Mathias' ord i chat)
- Lave kode-vurderinger (Codex' bord) eller designe datamodel (Code's bord)
- Skrive "afgørelser" som AI

**Triggers:**

- `qwers` (uden pakke-kontekst) → læs §8.1, bekræft "Rolle bekræftet som Claude.ai. Klar til qwerr eller pakke-kontekst."
- `qwers <pakke-emne>` (Step 1-start) → læs §8.1, bekræft rolle, **OG lav proaktiv kontekst-recon FØR krav-dok-skrivning** — STRENGT i forretnings-sprog:
  1. Læs relevante sektioner i `forretningsforstaaelse.md` (matcher pakke-emne)
  2. Læs `vision-og-principper.md` hvis pakken rammer princip-niveau
  3. Search `rapport-historik/` for tidligere relaterede forretnings-pakker — kun forretnings-niveau-resume
  4. Spørg Mathias om uddybning hvis forretnings-konteksten er uklar

  **FORBUDT i recon-output:** tabel-navne, kolonne-navne, RPC-signaturer, kode-eksempler, datamodel-skitser. Det er Code's bord i plan-fasen. Hvis du ser kode-sprog i kilder, OVERSÆT til forretnings-sprog ("klient-data" ikke "core_identity.clients").

  Output i chat (forretnings-niveau):
  - Kort "Det vi har"-sammenfatning af forretnings-evne (3-5 punkter)
  - Targeted forretnings-spørgsmål til Mathias
  - Forslag til scope-grænser

  Mathias' svar bliver til krav-dok-indhold (også forretnings-niveau).

- `qwerr` → tjek tracker for `slut-rapport-pr` eller `slut-rapport-push`; lever review

**Slut-rapport-review fokus:**

- Stork-invariant-tjek-tabel (§7) udfyldt korrekt
- Pakken leverede det krav-dok lovede
- Eventuelle plan-afvigelser dokumenteret med Mathias-godkendelse
- Severities: KRITISK (sektion mangler eller leverance afveget uden godkendelse) / MELLEM (reel afvigelse) / KOSMETISK / NEEDS-MATHIAS

### §8.2 Code

**Rolle:** Builder. Skriver migrations, RPC'er, tests.

**MÅ:**

- Vælge tekniske løsninger inden for godkendt plan
- Argumentere imod Mathias' instrukser hvis der er teknisk grund (PUSHBACK i FLAG/LØS)
- Stoppe ved blokerende udfordring og lave gate-fil

**MÅ IKKE:**

- Tage forretnings-afgørelser
- Udvide scope uden plan-revurdering
- Afvige fra krav-dok-leverance uden Mathias-gate
- Genfortolke eksisterende funktioner uden patch-først-disciplin (§3.1)

**Triggers:**

- `qwers` → læs §8.2, bekræft "Rolle bekræftet som Code"
- `qwerr` → læs pakke-status.md + tracker; udfør næste handling
- `qwerg` → start build af approved plan

**Auto-fortsæt mellem steps (V4 — ingen manuel `qwerr` mellem):**

Når Code opdager følgende state-ændringer via tracker + repo, fortsæt automatisk uden at vente på ny prompt fra Mathias:

| Detekteret state                                                                     | Auto-handling                                                                                                                |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Krav-dok-PR merget til main (`docs/coordination/<pakke>-krav-og-data.md` ny på main) | Start Step 2.0 plan-skitse + størrelses-tjek; hvis ≤5 mig → fortsæt med Step 2.1 V1; hvis 6+ → rapport split-forslag og stop |
| Plan-V<n> committet til `claude/<pakke>-plan`                                        | Vent på Codex-review (manuelt eller via tracker); ved nyt KODE-FUND → V<n+1>; ved APPROVAL → vent på `qwerg` fra Mathias     |
| Build-PR merget til main (post-deploy + types-regen lykkedes)                        | Start Step 5 slut-rapport-skrivning automatisk; commit + åbn slut-rapport-PR                                                 |

Code må IKKE auto-fortsætte ved:

- Blokerende udfordring under build → STOP-FOR-CLARIFICATION-gate
- Konvergens-counter ≥ 5 → pause + Mathias-afgørelse
- Plan-skitse > 5 migrations → split-forslag, stop

**Step 2 plan-disciplin:**

- DB-state-dump som plan-pre-condition (§3.2)
- Patch-først for alle eksisterende funktioner (§3.1)
- End-to-end-spor pr. write-vej (§3.3)
- Plan-pre-push-tjekliste: formål matcher krav-dok, alle krav-dok-leverancer dækket, eksisterende-body-sektioner udfyldt

**Step 4 build-disciplin:**

- Batches på 3-5 migrations (push trigger Codex per-batch review)
- End-to-end-konsistens-tjek per batch
- Smoke-afvigelse → STOP-FOR-CLARIFICATION-gate (§3.7)
- Reference-konsistens-pass FØR slut-rapport committes (grep alle file-stier, G-numre, runde-numre, commit-SHAs)

### §8.3 Codex

**Rolle:** Uafhængig kode-reviewer. Read-only.

**MÅ:**

- Flage ALT der ser tvivlsomt ud på kode-niveau
- Foreslå tekniske anbefalinger (OPGRADERING)
- Bestride at noget er "kompromis" — kan det reelt være "drift"?

**MÅ IKKE:**

- Skrive kode
- Træffe beslutninger
- Holde noget tilbage fordi det "sandsynligvis er OK"
- Acceptere "kendt gæld" som forklaring uden G-nummer
- Eskalere alt til NEEDS-MATHIAS som flugt-vej

**Triggers:**

- `qwers` → læs §8.3, bekræft "Rolle bekræftet som Codex"
- `qwerr` → læs pakke-status.md + tracker; lever review

**Plan-review fokus:**

- Patch-først-disciplin: er eksisterende body 1:1 + diff korrekt? (§3.1)
- End-to-end-spor pr. write-vej: alle 5 punkter eksplicit? (§3.3)
- DB-state-dump: matcher plan-referencer faktisk DB-state?
- Krav-dok-konsistens: dækker plan alle krav-dok-leverancer uden scope-creep?
- Vision + forretningsforstaaelse-modsigelse?

**Build-review fokus (per-batch auto):**

- Migration konsistent med plan
- Migration-gate Phase 2 strict overholdt
- End-to-end-konsistens (grants + policies + session-vars)
- Smoke-test-design matcher krav-dok

**Approval-regel:**

- APPROVAL eller FEEDBACK — aldrig begge (undtagelse: APPROVAL + OPGRADERING-forslag)
- KUN Codex-approval kræves for plan (Mathias godkender bagefter med qwerg)

---

## §9 Skabeloner (inline)

Når AI'er starter et nyt artefakt, følg disse skabeloner.

### §9.1 Krav-dok-skabelon

```markdown
# <pakke> — Krav-og-data

**Type:** Mathias' tanker om hvad pakken skal levere
**Dato:** YYYY-MM-DD

## Formål

> Denne pakke leverer: [én sætning]

## Forretningssandheder

[Mathias' tanker om hvad systemet skal kunne — punkter på forretnings-niveau, ikke teknisk-niveau]

## I scope

- [Konkret leverance 1]
- [Konkret leverance 2]

## IKKE i scope

- [Hvad ligner, men ikke hører til denne pakke]

## End-to-end-test-design

[Mindst ÉN konkret flow der skal testes: UI-input/RPC-call → DB-write → RLS-tjek → læsning]

## Åbne spørgsmål

[Spørgsmål Mathias ikke har svaret på endnu — afklares før plan-fase]
```

### §9.2 Plan-skabelon

```markdown
# <pakke> — Plan V<n>

**Branch:** claude/<pakke>-plan
**Krav-dok:** docs/coordination/<pakke>-krav-og-data.md

## Formål

[1:1 fra krav-dok §Formål]

## Verificerede DB-objekter (DB-state-dump)

[Råt output fra Supabase MCP: eksisterende RPC-bodies, tabeller, policies, grants]

## Verificerede afhængigheder

| Reference | Defineret i | Linje | Brug i denne plan |
| --------- | ----------- | ----- | ----------------- |

## Patch-først pr. ændret funktion

[For hver eksisterende funktion der ændres:

- Eksisterende body 1:1 + file:linje
- Diff (linje X fjernes, linje Y tilføjes, bevares uden ændring: Z)
- Begrundelse + callers]

## End-to-end-spor pr. write-vej

[For hver write-RPC: GRANT + policy + session-var + apply-dispatcher + eksempel-row-flow]

## Implementations-rækkefølge

| Step | Type | Hvad | Eksakt indhold | Afhængigheder | Risiko |
| ---- | ---- | ---- | -------------- | ------------- | ------ |

## End-to-end-test-design

[Konkret smoke-test-fil + flow]

## Oprydnings- og opdaterings-strategi

[Hvilke autoritative dokumenter opdateres pakken: forretningsforstaaelse (sjældent), master-plan (overblik), teknisk-gaeld (G-numre)]
```

### §9.3 Slut-rapport-skabelon

```markdown
# <pakke> — Slut-rapport

**Dato:** YYYY-MM-DD
**Pakke-branch:** claude/<pakke>-build
**Merge-commit:** <hash>

## Formål (genfremlagt fra krav-dok)

[1:1 fra krav-dok]

## Leverancer (mod krav-dok §I scope)

| Krav-dok-leverance | Status | Migration/RPC | Test | Evidens |
| ------------------ | ------ | ------------- | ---- | ------- |

## Stork-invariant-tjek

| Invariant              | Status | Evidens                              |
| ---------------------- | ------ | ------------------------------------ |
| Vision-overholdelse    | ✓/✗    | [vision-princip + hvordan opfyldt]   |
| Permission-matrix      | ✓/✗    | [opdateret fil + linje]              |
| Audit-trigger          | ✓/✗    | [fitness-tjek grøn]                  |
| Konfiguration-i-data   | ✓/✗    | [ingen hardkodede satser]            |
| End-to-end-flow        | ✓/✗    | [smoke-test grøn — ikke schema-only] |
| Anonymisering-bevaring | ✓/✗    | [UPDATE, ikke DELETE; FK'er intakt]  |

## Plan-afvigelser

[Liste eller "ingen". Hver afvigelse har Mathias-gate-fil eller eksplicit godkendelse]

## G-numre rejst

[Liste med reference til teknisk-gaeld.md]

## Konvergens-historie

| V<n> | Codex-fund | Code-svar | Outcome |
| ---- | ---------- | --------- | ------- |

## Vision-tjek

- Bygger vi den rigtige løsning, eller en workaround?
- Vision-styrkelser denne pakke:
- Vision-svækkelser denne pakke (hvis nogen):
- Konklusion: forsvarligt / kompromis / drift
```

### §9.4 Codex-review-prompt-skabelon

```markdown
[NIVEAU 1-PREFIX — bruges som intro i hver Codex-review-prompt]

Du er Codex i Stork 2.0's plan-automation-flow — uafhængig kode-reviewer.

Læs disse FØR review:

- docs/strategi/vision-og-principper.md
- docs/strategi/forretningsforstaaelse.md (tanke-data, ikke kontrakt)
- docs/strategi/disciplin.md §8.3 (din rolle)
- docs/coordination/<pakke>-krav-og-data.md (pakke-kontrakt)
- docs/coordination/<pakke>-plan.md (det du reviewer)
- docs/coordination/<pakke>-status.md (kontekst + konvergens-counter)

Review-fokus:

- Patch-først-disciplin (§3.1): eksisterende body 1:1 + diff?
- End-to-end-spor (§3.3): alle 5 punkter pr. write-vej?
- DB-state-dump (§3.2): matcher faktisk state?
- Krav-dok-konsistens
- Vision + forretningsforstaaelse-modsigelse
- MANGLENDE-EKSISTERENDE-BEVARELSE (KRITISK-undertype)

Format pr. fund:
[SEVERITY] Kort beskrivelse
Konkret afvigelse: ...
Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]
```

### §9.5 Pakke-status-skabelon

Se §3.5 — kort fil med sidste handling, næste forventet, konvergens-counter, blocker.

---

## §10 Disciplin-tjekliste — før hver migration skrives

1. **Hvilket vision-element understøtter dette?**
2. **Hvilket vision-element kunne det svække?**
3. **Er der en simplere løsning der bygger samme funktionalitet uden vision-kompromis?**
4. **Hvis kompromis: er det dokumenteret med plan (G-nummer + deadline)?**
5. **Skal nogen halt-marker rejses?** (§6.1)
6. **Patch-først-disciplin overholdt?** (§3.1 — eksisterende body 1:1 + diff)
7. **End-to-end-spor pr. write-vej dokumenteret?** (§3.3)

Hvis "nej" på 4 eller 7: STOP og spørg Mathias.

---

## §11 Stop-betingelser

Ud over disciplin-tjeklisten, STOP altid ved:

- Master-plan-konflikt (men husk: master-plan er overblik, ikke kontrakt)
- Vision-modsigelse (LÅST autoritet)
- Designvalg ikke afgjort
- Data-tab risiko ud over allerede afgjort
- Konvergens-counter rammer 5 (auto-pause)
- Inline-fix-autoritet kræver migration der ændrer fundament-infrastruktur

---

## §12 Git-sync-disciplin

Før enhver session-start eller review-runde:

```
git pull origin main
```

- **Code:** pull ved hver trigger. Ved tvivl: pull først, spørg ikke om state først
- **Codex (automatiseret):** kører på commit-trigger, har frisk state
- **Codex (manuel review):** pull før reviewet starter
- **Claude.ai:** kan ikke pulle direkte. Beder Mathias om commit-hash ved tvivl

Hvis pull viser uventede commits: STOP, rapportér til Mathias.

---

**Sidste opdatering:** 2026-05-22 — V4 etableret. Konsoliderer V3's arbejds-disciplin + workflow-skabelon + 3 overvågnings-filer + 4 skabeloner til ÉN fil. Drop Step 1.0, drop mathias-afgoerelser-refs, drop fire-dok-konsultation, drop skala-distinktion. Tilføj patch-først, end-to-end-spor, DB-state-dump, pakke-status.md, konvergens-counter, STOP-FOR-CLARIFICATION-gate, end-to-end-test som leverings-kriterium, Stork-invariant-tjek.
