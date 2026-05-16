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

### Trigger-ord (overvågnings-system)

| Trigger | Hvem paster | Til hvem          | Betydning                                                      |
| ------- | ----------- | ----------------- | -------------------------------------------------------------- |
| `qwers` | Mathias     | Alle tre, en gang | Aktivér rolle. Paster sammen med overvågnings-prompt-fil       |
| `qwerr` | Mathias     | Den aktive aktør  | "Din tur" — aktøren finder selv ud af hvad via tracker + state |
| `qwerg` | Mathias     | Code              | "Plan godkendt, byg nu" — starter build-fase                   |

Overvaagnings-prompts ligger i `docs/coordination/overvaagning/`:

- `code-overvaagning.md`
- `codex-overvaagning.md`
- `claude-ai-overvaagning.md`

Mathias paster den relevante fil + `qwers` som første besked i ny session for hver aktør.

### Aktør-rækkefølge

1. **Claude.ai** leverer krav-og-data-dokument (`docs/coordination/<pakke>-krav-og-data.md`) med formål, scope, Mathias' afgørelser, og tekniske valg overladt til Code. Krav-dokumentet er **kontrakt**.
2. **Mathias** godkender + committer krav-dokumentet til main.
3. **`qwerr` til Code** → Code skriver `docs/coordination/<pakke>-plan.md` per `docs/skabeloner/plan-skabelon.md` baseret på krav-dokumentet. Push til `claude/<pakke>-plan`-branch. Codex-notify trigger "ny-plan-version" comment til tracker-issue.
4. **`qwerr` til Codex** → Codex reviewer planen og committer `docs/coordination/plan-feedback/<pakke>-V<n>-codex.md` (feedback) eller `<pakke>-V<n>-approved-codex.md` (approval).
5. **`qwerr` til Claude.ai** → Claude.ai reviewer planen mod krav-dokumentet. Hvis feedback: skriver `docs/coordination/plan-feedback/<pakke>-V<n>-claude-ai.md` til disk; Mathias committer.
6. Hvis EN af to har feedback: **`qwerr` til Code** → Code laver V<n+1> baseret på feedback. Loop tilbage til 4-5.
7. Når BÅDE Codex og Claude.ai har approved: plan er klar til Mathias-godkendelse.
8. **Mathias godkender plan** + paster **`qwerg` til Code** → Code starter build-fase. Opretter `claude/<pakke>-build`-branch, laver fil-cluster-commits, push, opretter PR.
9. **Mathias merger build-PR** efter CI grøn.
10. **`qwerr` til Code** → Code laver slut-rapport (`docs/coordination/rapport-historik/<dato>-<pakke>.md`) + arkiverer plan-filer + rydder aktiv-plan. Push til `claude/<pakke>-slut-rapport`. Opretter PR. Codex-notify trigger "slut-rapport-push".
11. **`qwerr` til Codex** → Codex reviewer slut-rapport. Feedback eller approval.
12. Hvis feedback: **`qwerr` til Code** → Code opdaterer slut-rapport på samme branch. Loop tilbage til 11.
13. Når Codex har approved: **Mathias merger slut-rapport-PR**.

### Approval-regel (strict)

En plan er KUN approved når BÅDE Codex og Claude.ai har leveret approval.

- Kun Codex approver, Claude.ai har feedback → V<n+1>
- Kun Claude.ai approver, Codex har feedback → V<n+1>
- Begge approver → plan klar til Mathias-godkendelse (`qwerg`)

Code må IKKE begynde build før Mathias eksplicit har pastet `qwerg`.

### Anti-glid: severity-disciplin

For at undgå mange runder uden tab af grundighed: alle fund markeres med severity.

- **KRITISK** — plan kan ikke bygges som beskrevet, vil ramme produktion-risiko, eller bryder vision-princip / krav-dokument. STOPPER plan i alle runder.
- **MELLEM** — reelt problem men ikke produktion-blokerende. Stopper plan i runde 1; bliver G-nummer i runde 2+.
- **KOSMETISK** — stilistisk eller mindre forbedring. Stopper IKKE plan. G-nummer-kandidat.

Reviewer-anti-glid-regler:

1. Hvis alle fund er KOSMETISKE → lever APPROVAL + G-nummer-anbefalinger
2. Hvis fund er MELLEM og vi er i runde 2+ → lever APPROVAL + G-numre. Plan går videre.
3. Hvis fund er KRITISKE → lever FEEDBACK uanset runde
4. Ved tvivl om severity → marker konservativt (hellere G-nummer end ekstra runde)

Reference: `docs/strategi/arbejds-disciplin.md` runde-trapper.

### Pakke-skala-disciplin

Proces-vægten skaleres til pakke-størrelsen. Tre niveauer:

- **Stor (I-pakke / kompleks H-pakke)**: fuld plan-runde-proces (krav-dok → plan → review → build → slut-rapport)
- **Mellem (H-pakke)**: plan + ét review (kan være Codex eller Claude.ai afhængigt af om det er teknisk eller krav-relateret), derefter build
- **Lille (mikro-H-pakke)**: PR direkte uden plan-runde. Codex reviewer PR'en. Mathias merger.

Krav-dokumentet specificerer pakke-størrelse i "Type"-feltet. Standard er fuld proces hvis ikke andet står.

### Oprydnings- og opdaterings-disciplin

Hver plan-fase skal eksplicit beskrive hvad der ryddes op og opdateres som konsekvens af pakkens leverance. Det forhindrer at coordination-mappen vokser ukontrolleret med arbejds-artefakter fra afsluttede pakker, og at relaterede dokumenter glider ud af synkron.

**Plan-skabelon-sektion (obligatorisk):** "Oprydnings- og opdaterings-strategi" lister:

- Filer der skal flyttes til `docs/coordination/arkiv/` (standard: krav-dok, plan, plan-feedback-filer)
- Filer der skal slettes (hvis pakken gør dem irrelevante)
- Dokumenter der skal opdateres som konsekvens (aktiv-plan, seneste-rapport, mathias-afgoerelser, bygge-status, master-plan, teknisk-gaeld)
- Reference-konsekvenser (grep-verifikation for omdøbte/flyttede stier)

**Approval-blocker:** plan uden "Oprydnings- og opdaterings-strategi"-sektion er ikke approval-klar. Codex og Claude.ai bør levere FEEDBACK hvis sektionen mangler eller er tom.

**Code's ansvar:** udfør oprydning + opdatering som DEL af build-leverancen, ikke som separat trin. Slut-rapporten verificerer at det er gjort i sektion "Oprydning + opdatering udført".

**Hvorfor det er disciplin, ikke valgfri:** uden eksplicit strategi opstår drift mellem dokumenter, arkiv-mappen ophober uden mening, og fremtidige aktører må selv arkæologisk afgøre hvilke filer der stadig er aktuelle.

### Krav-dokument-disciplin

Krav-dokumentet er **kontrakt**. Detaljer + brud-typer dokumenteret i `docs/strategi/arbejds-disciplin.md` sektion "Krav-dokument-disciplin". Hvis et plan-forslag ville modsige krav-dokumentet, committes `<pakke>-V<n>-blokeret.md` og runden stoppes — argumentation hører i ny krav-dokument-runde, ikke i plan-runden.

### Filnavngivning i `plan-feedback/`

| Fil                                  | Skrevet af                  | Trigger-comment           |
| ------------------------------------ | --------------------------- | ------------------------- |
| `<pakke>-V<n>-codex.md`              | Codex                       | `codex-feedback`          |
| `<pakke>-V<n>-claude-ai.md`          | Claude.ai (via Mathias)     | `claude-ai-feedback`      |
| `<pakke>-V<n>-approved-codex.md`     | Codex                       | `plan-approved-codex`     |
| `<pakke>-V<n>-approved-claude-ai.md` | Claude.ai (via Mathias)     | `plan-approved-claude-ai` |
| `<pakke>-V<n>-blokeret.md`           | Code, Codex eller Claude.ai | `plan-blokeret`           |

**Bemærk:** codex-notify.yml-workflowet differentierer endnu ikke fuldt mellem `codex-feedback` og `claude-ai-feedback` (begge poster generisk "Codex-feedback"-comment pt.). Code's overvågnings-prompt kompenserer ved at læse filerne direkte i `plan-feedback/`. Workflow-opdatering er separat H-pakke når prioriteret.

---

## Ikke-i-scope

- Auto-block / auto-merge baseret på Codex-output (for risikabelt — Mathias afgør altid)
- Slack/email-notifikationer (overflødigt i nuværende setup)
- Lock-mønster-arkitektur (G032, separat post-DEL-8 plan)
- Andre AI-aktører end de fire eksisterende

---

**Klar til etablering når R-runde-2 lag-boundary er rapporteret og godkendt.**
