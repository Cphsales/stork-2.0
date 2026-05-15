# Stork 2.0 — Arbejdsmetode og repo-struktur

**Status:** Plan, ikke aktiveret. Etableres efter R-runde-2 er færdig.

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
│   └── bygge-status.md
│
├── coordination/          # aktiv arbejds-state
│   ├── aktiv-plan.md
│   ├── seneste-rapport.md
│   ├── mathias-afgoerelser.md
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
    └── rapport-skabelon.md
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

### 1. Automatiseret Codex-trigger

GitHub Action der trigger på commits til `docs/coordination/seneste-rapport.md`.

- Action kører Codex CLI mod rapport + diff'et siden sidste validering
- Output committes som `docs/coordination/codex-reviews/<timestamp>.md`
- Ingen auto-block, ingen auto-merge — Mathias ser begge rapporter og afgør

**Værdi:** fjerner manuel paste-cyklus. Codex bliver konsistent del af workflow uden manuel aktivering.

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

4. **GitHub Action + Codex-trigger** sættes op som separat lille pakke. Kan kræve API-key-konfig — håndteres når relevant.

---

## Plan-flow for I-pakker

I-pakker (Infrastruktur) bruger commit-baseret plan-runde-loop frem for chat-baseret. Round-trip-feedback håndteres via `docs/coordination/plan-feedback/`-mappen og Codex-notify-action.

### Aktør-rækkefølge

1. **Claude.ai** leverer krav-og-data-dokument (`docs/coordination/<pakke>-krav-og-data.md`) med formål, scope, Mathias' afgørelser, og tekniske valg overladt til Code. Krav-dokumentet er **kontrakt**.
2. **Code** skriver `docs/coordination/<pakke>-plan.md` per `docs/skabeloner/plan-skabelon.md` baseret på krav-dokumentet. Code argumenterer for de tekniske valg.
3. **Code** opdaterer `docs/coordination/aktiv-plan.md` til at pege på plan-filen → Codex-notify trigger "ny-plan-version" comment til tracker-issue.
4. **Codex** reviewer planen og committer `docs/coordination/plan-feedback/<pakke>-V1-codex.md` → Codex-notify trigger "codex-feedback" comment.
5. **Code** svarer enten med `<pakke>-V2-code.md` ELLER opdaterer plan-filen direkte → trigger ny review-runde.
6. Loop indtil **Codex** committer `<pakke>-approved.md` → Codex-notify trigger "plan-approved" comment.
7. **Mathias + Claude.ai** validerer plan mod krav-dokumentet.
8. **Code** bygger.
9. **Code** leverer slut-rapport jf. eksisterende flow.
10. Plan-filen flyttes til `docs/coordination/plan-historik/` (hvis omdøbning fra `arkiv/` er gennemført, ellers `arkiv/`).

### Konvergens-signal

Codex committer `<pakke>-approved.md` med én linje:

```
Plan godkendt fra Codex' side. Klar til Mathias-validering.
```

Ingen andre filer i `plan-feedback/<pakke>-*` skal ændres efter approved-fil eksisterer.

### Krav-dokument-disciplin

Krav-dokumentet er **kontrakt**. Detaljer + brud-typer dokumenteret i `docs/strategi/arbejds-disciplin.md` sektion "Krav-dokument-disciplin". Hvis et plan-forslag ville modsige krav-dokumentet, committes `<pakke>-V<n>-blokeret.md` og runden stoppes — argumentation hører i ny krav-dokument-runde, ikke i plan-runden.

### Filnavngivning

| Fil                        | Skrevet af       | Trigger-comment  |
| -------------------------- | ---------------- | ---------------- |
| `<pakke>-V<n>-codex.md`    | Codex            | "codex-feedback" |
| `<pakke>-V<n>-code.md`     | Code             | "code-feedback"  |
| `<pakke>-approved.md`      | Codex            | "plan-approved"  |
| `<pakke>-V<n>-blokeret.md` | Code eller Codex | "plan-blokeret"  |

Detaljer: `docs/coordination/plan-feedback/README.md`.

---

## Ikke-i-scope

- Auto-block / auto-merge baseret på Codex-output (for risikabelt — Mathias afgør altid)
- Slack/email-notifikationer (overflødigt i nuværende setup)
- Lock-mønster-arkitektur (G032, separat post-DEL-8 plan)
- Andre AI-aktører end de fire eksisterende

---

**Klar til etablering når R-runde-2 lag-boundary er rapporteret og godkendt.**
