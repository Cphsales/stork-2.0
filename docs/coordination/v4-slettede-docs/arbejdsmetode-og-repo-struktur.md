# Stork 2.0 — Arbejdsmetode og repo-struktur

**Status:** Aktiveret via H010 (commit `3c6bc0b`).

---

## Aktører og ansvar

- **Mathias** — afgør forretning og retning. Læser planer, godkender, beslutter.
- **Claude.ai** — strateg, formulerer prompts, vurderer mod vision, fanger glid.
- **Code** — eneste der skriver til repo. Bygger, tester, rapporterer.
- **Codex** — kritisk reviewer. Read-only. Validerer Code's arbejde.

**Cyklus:** plan → review → byg → review → godkend

---

## Repo-struktur

Al dokumentation samles under `docs/` med klare undermapper. Ingen filer i `/docs/`-rod. Undtagelse: navigation-filer (`LÆSEFØLGE.md`).

```
docs/
├── strategi/              # autoritative dokumenter
│   ├── vision-og-principper.md
│   ├── stork-2-0-master-plan.md
│   ├── arbejds-disciplin.md
│   ├── arbejdsmetode-og-repo-struktur.md
│   └── bygge-status.md
│
├── coordination/          # aktiv arbejds-state
│   ├── aktiv-plan.md
│   ├── seneste-rapport.md
│   ├── mathias-afgoerelser.md
│   ├── cutover-checklist.md
│   ├── codex-reviews/
│   ├── plan-feedback/
│   ├── rapport-historik/
│   └── arkiv/
│
├── teknisk/               # løbende teknisk dokumentation
│   ├── teknisk-gaeld.md
│   ├── permission-matrix.md
│   ├── lag-e-beregningsmotor-krav.md
│   └── lag-e-tidsregistrering-krav.md
│
└── skabeloner/            # genbrugelige skabeloner
    ├── plan-skabelon.md
    ├── rapport-skabelon.md
    └── codex-review-prompt.md
```

**Princip:** én sti til alt. Sporing via git, ikke chat-arkæologi.

---

## Disciplin-pakke

Tilføjes til `docs/strategi/arbejds-disciplin.md`.

### 1. Plan-skabelon med formåls-sætning øverst

Hver plan starter med:

> ## Formål
>
> Denne pakke leverer: [én sætning]
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

Code udfylder formålet før implementation. Codex læser formålet før review. Mathias tjekker mod formålet ved godkendelse.

### 2. Fast skabelon for lag-boundary-rapport

```
PAKKE [navn] — commit [hash]
Migration-gate: X migrations, Y kolonner, Z violations
Fitness: X/Y grøn
Scope: clean/dirty
Nye tests: [liste]
Branch ahead: N commits
Plan-afvigelser: [liste eller "ingen"]
G-numre tilføjet: [liste eller "ingen"]
Næste pakke: [navn]
```

Hvis felter mangler i Code's rapport: stop og bed om dem. Ingen tolkning.

### 3. Validerings-runde-disciplin

Hver runde indledes med formåls-genfremlæggelse. Fund vurderes mod formålet:

- **Bringer fundet os tættere på formålet?** → ACCEPT
- **Er fundet uafhængigt af formålet?** → G-nummer, ikke blocker

**Runde-trapper:**

- **Runde 1:** alle fund vurderes
- **Runde 2:** kun HØJ-fund stopper implementation. MELLEM → G-numre
- **Runde 3:** kun KRITISKE fund stopper. Resten → G-numre, implementation fortsætter

**Princippet:** validerings-runder bliver dyrere pr. runde, og værdi falder. Tredje runde skal være sjælden.

### 4. Glid-detector

Tre red flags hver aktør selv skal spotte.

**Code:**

- "Jeg har implicit forenklet" → STOP, flag
- "Jeg har ikke fået svar på samme spørgsmål 2 gange" → genfremlæg, ikke fortolk
- "Jeg afviger fra plan uden flag" → afvigelser flagges FØR implementation

**Claude.ai:**

- "Jeg gætter på masterplan" → tjek kilden
- "Jeg fabrikerer detalje" → flag som [syntese] eller fjern
- "Jeg pakker forslag som afgjort" → omformuler

---

## To høj-værdi-tiltag

### 1. Codex notification-trigger (etableret via H010.7, udvidet via H021)

GitHub Action `codex-notify.yml` trigger på commits til plan-/feedback-/rapport-filer.

- Nuværende state: **notification-only**. Action poster comment til tracker-issue #12 når relevante filer pushes (`aktiv-plan.md`, `plan-feedback/*.md`, `seneste-rapport.md`).
- Codex CLI eksekverer IKKE automatisk. Codex læser manuelt efter session-start og leverer review via plan-feedback-commits.
- Plan-paths-udvidelse leveret i H021 (round-trip-loop for plan-iterationer).
- Ingen auto-block, ingen auto-merge — Mathias afgør altid.

**Værdi:** notification fjerner behov for manuel paste-cyklus mellem aktører. Auto-eksekvering af Codex CLI overvejes ikke (kræver API-key-konfig + monitorering — ikke prioriteret).

### 2. Beslutnings-log

Append-only fil: `docs/coordination/mathias-afgoerelser.md`.

Code skriver hver gang Mathias siger "ja" eller "GO" til noget substantielt:

- Dato
- Beslutning (kort)
- Begrundelse (kort)
- Plan-reference (commit-hash eller fil)

**Værdi:** løser memory-problemet. Afgørelser bliver søgbare. Genvej for nye sessions — start med at læse loggen. Tjek-mod-fil hvis Code "pakker forslag som afgjort".

---

## Etablerings-rækkefølge

Efter R-runde-2 er færdig:

1. **Code restrukturerer `docs/`** til ny mappe-struktur. Ren flytte-commit. Eksisterende filer flyttes til korrekte undermapper, ingen indholds-ændring.

2. **Code opretter `coordination/`-undermappe** med tomme skabeloner + initial `mathias-afgoerelser.md` med alle låste afgørelser fra hidtidige sessions (vision-commit, Problem 1-4, Q-pakke-korrektion, lock-mønster udskudt, etc.).

3. **Code opdaterer `arbejds-disciplin.md`** med disciplin-pakken (afsnit 1-4 ovenfor).

4. **GitHub Action + Codex-trigger** er etableret i H010.7 som `.github/workflows/codex-notify.yml` (notification-only til tracker-issue #12) og udvidet med plan-paths i H021.

---

## Plan-flow med overvågnings-system

Alle planlagte pakker (I-pakker, H-pakker) bruger commit-baseret plan-runde-loop frem for chat-baseret. Round-trip-feedback håndteres via `docs/coordination/plan-feedback/`-mappen og codex-notify-workflow.

**Operationel reference:** [`docs/skabeloner/workflow-skabelon.md`](../skabeloner/workflow-skabelon.md) er autoritativ for hvordan flowet køres step-by-step (5-step V2 flow + loops + meta-regel + marker-protokol + Mathias-gate to-fil-flow). Denne fil dækker hvorfor — workflow-skabelon dækker hvordan. V5.3 marker-protokol bevaret fra Lag 1; flow-strukturen forenklet i V2 2026-05-20.

### Trigger-ord (overvågnings-system)

| Trigger | Hvem paster | Til hvem          | Betydning                                                       |
| ------- | ----------- | ----------------- | --------------------------------------------------------------- |
| `qwers` | Mathias     | Alle tre, en gang | Aktivér rolle. Aktøren læser selv sin overvågnings-fil fra repo |
| `qwerr` | Mathias     | Den aktive aktør  | "Din tur" — aktøren finder selv ud af hvad via tracker + state  |
| `qwerg` | Mathias     | Code              | "Plan godkendt, byg nu" — starter build-fase                    |

Overvaagnings-prompts ligger i `docs/coordination/overvaagning/`:

- `code-overvaagning.md`
- `codex-overvaagning.md`
- `claude-ai-overvaagning.md`

Mathias paster `qwers` som første besked i ny session for hver aktør. Aktøren læser sin egen overvågnings-fil fra repo (Filesystem-MCP for Claude.ai, direkte fra working tree for Code og Codex) og bekræfter rollen.

### Aktør-rækkefølge (V2 2026-05-20 — simplificeret)

Erfaring fra trin 10-forsøget (2026-05-20): tidligere 15-trins flow med tre Claude.ai-roller + separat forretningsspørgsmål-fil + krav-dok-reviewer-runde skabte unødigt bureaukrati. Workflow simplificeret. Plan-fase (Code+Codex) bevares uændret — Codex' review fangede fabrikation effektivt.

1. **Pakke-skala-vurdering** (Mathias). Hvor mange åbne forretnings-spørgsmål? 0-2 = Lille (skip krav-dok). 3-5 = Mellem (krav-dok via simplificeret flow). 6+ = Stor (krav-dok + ekstra valideringer).
2. **Claude.ai-forfatter laver krav-dok** i ÉN chat-session med Mathias som direkte validator. Forfatter:
   - Forstår steppet (læser master-plan §4 trin X + §1.X)
   - Identificérer forretnings-punkter at afklare
   - Recon: søger svar i master-plan + mathias-afgørelser + vision + eksisterende kode
   - Validér eller spørg Mathias punkt-for-punkt
   - Skriver `docs/coordination/<pakke>-krav-og-data.md` via Filesystem-MCP
3. **Mathias godkender krav-dok direkte** (ingen separat reviewer-chat). Paster `qwerr` til Code.
4. **Code committer krav-dok** til main via separat PR (`claude/<pakke>-krav-og-data`-branch). Når PR er merged: Code fortsætter til plan-arbejde uden ny qwerr.
5. **Code laver recon-først** (NY 2026-05-20): læser hver tidligere-trins migration-fil planen refererer. Skriver "Verificerede afhængigheder"-sektion. Antagelser om API'er uden file:linje-reference = KRITISK-fabrikation.
6. **Code skriver plan** baseret på krav-dok + verificerede afhængigheder. Push til `claude/<pakke>-plan`-branch.
7. **Code kører selv `scripts/codex-review.sh <plan-fil> <n> --phase=plan`** for hver V<n>. Codex leverer feedback eller approval. Ingen manuel paste-instruktion til Mathias.
8. **Code iterér plan V1 → V2 → ...** baseret på Codex-feedback. Hvis Codex finder KRITISK-fund vedr. fabrikation: STOP, recon-først skal gentages, rapport til Mathias.
9. **Når Codex har approved: rapport til Mathias**. Plan er klar til godkendelse.
10. **Mathias godkender plan** + paster **`qwerg` til Code** → Code starter build-fase.
11. **Code bygger** på `claude/<pakke>-build`-branch. Fil-cluster-commits. Inkluder oprydning (arkivér krav-dok + plan). Opretter PR.
12. **Mathias merger build-PR** efter CI grøn.
13. **`qwerr` til Code** → Code laver slut-rapport. Push til `claude/<pakke>-slut-rapport`. Opretter PR. Codex-notify trigger "slut-rapport-push".
14. **Claude.ai (bias-frisk slut-rapport-reviewer)** leverer review: "byggede vi det vi lovede?" mod fire forretnings-dokumenter.
15. Hvis feedback: Code opdaterer + ny review-runde. Hvis approval: Mathias merger slut-rapport-PR.

**Sparring-på-tværs (uformelt sikkerhedsnet):** Mathias kan paste indhold fra én chat til en anden AI for verifikation hvis han fornemmer noget. Disciplinen er rammen, ikke isolation mellem aktører.

### Approval-regel (V2 strict)

V2 simplificerer plan-approval. Plan-fase er Code + Codex (Claude.ai-plan-reviewer-rolle udgår per V2-justering 2026-05-20):

- Codex har feedback → V<n+1>
- Codex approver → plan klar til Mathias-godkendelse (`qwerg`)

Code må IKKE begynde build før Mathias eksplicit har pastet `qwerg`.

**Krav-dok-approval i V2:** Mathias er direkte validator i krav-dok-fasen (step 1). Ingen separat Claude.ai-krav-dok-reviewer-rolle. Forfatter skriver krav-dok via Filesystem-MCP, Mathias bekræfter direkte i chat. Spørgsmål-runden sker også i chat — ingen committed mellem-artefakter.

### Anti-glid: severity-disciplin

For at undgå mange runder uden tab af grundighed: alle fund markeres med severity.

- **KRITISK** — plan kan ikke bygges som beskrevet, vil ramme produktion-risiko, eller bryder vision-princip / krav-dokument. STOPPER plan i alle runder.
- **MELLEM** — reelt problem men ikke produktion-blokerende. Stopper plan i runde 1; bliver G-nummer i runde 2+.
- **KOSMETISK** — stilistisk eller mindre forbedring. Stopper IKKE plan. G-nummer-kandidat.
- **OPGRADERING** (ny 2026-05-17) — Codex har bedre kodemetode end Code planlagt. Stopper IKKE plan; Code skal eksplicit afvise eller implementere i V<n+1>. Codex må levere APPROVAL og samtidig foreslå OPGRADERING.
- **NEEDS-MATHIAS** (ny 2026-05-18) — fund hvor reviewer reelt ikke kan afgøre uden Mathias-input (to gyldige valg, ny ramme-beslutning, dokument-modsigelse, scope-grænse-tvivl). STOPPER plan i alle runder. Code kan IKKE lave V<n+1> før Mathias har afgjort. Se `docs/strategi/arbejds-disciplin.md` sektion "NEEDS-MATHIAS-severity" for fuld detalje.

Reviewer-anti-glid-regler:

1. Hvis alle fund er KOSMETISKE → lever APPROVAL + G-nummer-anbefalinger
2. Hvis fund er MELLEM og vi er i runde 2+ → lever APPROVAL + G-numre. Plan går videre.
3. Hvis fund er KRITISKE → lever FEEDBACK uanset runde
4. Hvis fund er OPGRADERING uden andre kritiske → lever APPROVAL + OPGRADERING-forslag. Code skal eksplicit afvise eller implementere i V<n+1>.
5. Hvis fund er NEEDS-MATHIAS → lever FEEDBACK uanset øvrige fund. Plan stoppes indtil Mathias har svaret. Max 2 NEEDS-MATHIAS pr. review.
6. Ved tvivl om severity → marker konservativt (KOSMETISK frem for MELLEM, MELLEM frem for KRITISK, KRITISK frem for NEEDS-MATHIAS). Hellere G-nummer end ekstra runde, hellere KRITISK end unødvendig eskalering.

Reference: `docs/strategi/arbejds-disciplin.md` runde-trapper.

### Pakke-skala-disciplin (V2 2026-05-20)

Mathias afgør pakke-skala i step 0 baseret på antal åbne forretnings-spørgsmål. Tre niveauer:

- **Stor (6+ åbne spm)**: fuld V2-flow (krav-dok-fase med Mathias som direkte validator → plan-fase Code+Codex → build → slut-rapport + Claude.ai-review). Ekstra validerings-runder kan kræves i krav-dok-fasen.
- **Mellem (3-5 åbne spm)**: simplificeret krav-dok-fase (få spm direkte i chat, derefter krav-dok) → plan-fase Code+Codex → build → slut-rapport + Claude.ai-review.
- **Lille (0-2 åbne spm)**: skip krav-dok-fase. PR direkte uden plan-runde for mikro-fix; ellers Code skriver plan direkte mod master-plan + mathias-afgørelser-rammen, Codex reviewer, Mathias merger.

Krav-dok-review udgår i V2 (Mathias er direkte validator). Plan-review er Code+Codex only.

### Oprydnings- og opdaterings-disciplin

Hver plan-fase skal eksplicit beskrive hvad der ryddes op og opdateres som konsekvens af pakkens leverance. Det forhindrer at coordination-mappen vokser ukontrolleret med arbejds-artefakter fra afsluttede pakker, og at relaterede dokumenter glider ud af synkron.

**Plan-skabelon-sektion (obligatorisk):** "Oprydnings- og opdaterings-strategi" lister:

- Filer der skal flyttes til `docs/coordination/arkiv/` (V2 standard: krav-dok, plan, plan-feedback-filer)
- Filer der skal slettes (hvis pakken gør dem irrelevante)
- Dokumenter der skal opdateres som konsekvens (aktiv-plan, seneste-rapport, mathias-afgoerelser, bygge-status, master-plan, teknisk-gaeld)
- Reference-konsekvenser (grep-verifikation for omdøbte/flyttede stier)

**Approval-blocker:** plan uden "Oprydnings- og opdaterings-strategi"-sektion er ikke approval-klar. Code skal selv sikre sektionen er udfyldt før plan-commit (selv-disciplin i pre-push-tjekliste); Codex flagger sektionens mangel som KRITISK i plan-review.

**Code's ansvar:** udfør oprydning + opdatering som DEL af build-leverancen, ikke som separat trin. Slut-rapporten verificerer at det er gjort i sektion "Oprydning + opdatering udført".

**Hvorfor det er disciplin, ikke valgfri:** uden eksplicit strategi opstår drift mellem dokumenter, arkiv-mappen ophober uden mening, og fremtidige aktører må selv arkæologisk afgøre hvilke filer der stadig er aktuelle.

### Krav-dokument-disciplin

Krav-dokumentet er **kontrakt**. Detaljer + brud-typer dokumenteret i `docs/strategi/arbejds-disciplin.md` sektion "Krav-dokument-disciplin". Hvis et plan-forslag ville modsige krav-dokumentet, committes `<pakke>-V<n>-blokeret.md` og runden stoppes — argumentation hører i ny krav-dokument-runde, ikke i plan-runden.

### Filnavngivning i `plan-feedback/`

| Fil                              | Skrevet af       | Trigger-comment       |
| -------------------------------- | ---------------- | --------------------- |
| `<pakke>-V<n>-codex.md`          | Codex            | `codex-feedback`      |
| `<pakke>-V<n>-approved-codex.md` | Codex            | `plan-approved-codex` |
| `<pakke>-V<n>-blokeret.md`       | Code eller Codex | `plan-blokeret`       |

**V2-note:** Claude.ai-plan-reviewer-rolle udgået i V2 (jf. `mathias-afgoerelser.md` 2026-05-20). Plan-fase er Code + Codex; `<pakke>-V<n>-claude-ai.md` og `<pakke>-V<n>-approved-claude-ai.md` fra V5.3 produceres ikke længere. Eventuelle eksisterende sådanne filer på historiske pakke-branches arkiveres ved pakke-lukning som hidtil.

---

## Ikke-i-scope

- Auto-block / auto-merge baseret på Codex-output (for risikabelt — Mathias afgør altid)
- Slack/email-notifikationer (overflødigt i nuværende setup)
- Lock-mønster-arkitektur (G032, separat post-DEL-8 plan)
- Andre AI-aktører end de fire eksisterende

---

**Klar til etablering når R-runde-2 lag-boundary er rapporteret og godkendt.**
