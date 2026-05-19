# Rapport-skabelon

Skabelon for slut-rapporter der leveres EFTER implementation + commit (Code → Mathias). Trigger Codex-review-runde via opdatering af `docs/coordination/seneste-rapport.md`.

Indeholder lag-boundary-rapport-formatet ordret (felter må ikke omdøbes — fitness-værktøjer parser dem).

---

## Header

- **Pakke:** [pakke-kode + kort beskrivelse]
- **Commit-hash:** [SHA]
- **Plan-fil:** [sti — typisk `docs/coordination/arkiv/<pakke>-plan.md` post-commit]
- **Dato:** YYYY-MM-DD

---

## Lag-boundary-rapport

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

---

## Leverancer

Tabel pr. element i planen:

| Leverance | Status                     | Verifikation (test/fitness/grep) |
| --------- | -------------------------- | -------------------------------- |
| [navn]    | leveret / delvis / udskudt | [konkret reference]              |

---

## Halt-eskaleringer + clarifications undervejs (V5.3)

Hver halt-trigger der blev rejst under build dokumenteres her med outcome:

| Marker                | Hvad               | Iter | Outcome                 | Gate-fil-reference                |
| --------------------- | ------------------ | ---- | ----------------------- | --------------------------------- |
| [BRUD-PAA-KRAV / ...] | [kort beskrivelse] | 1-3  | LØS-konsensus / Mathias | [mathias-gate/-sti hvis relevant] |

"Ingen halt-eskaleringer" hvis intet trigger blev rejst.

**STOP-FOR-CLARIFICATION-events:** [liste eller "ingen"] — hver med spørgsmål + mål-part + svar + genoptag-tidspunkt.

---

## Optimerings-håndtering (V5.3)

Hver `OPTIMERING-FORSLAG` Codex rejste under build, med Code's svar:

| Forslag            | Klasse          | Code's svar (ADOPT/DEFER/DISMISS) | Begrundelse / G-nummer |
| ------------------ | --------------- | --------------------------------- | ---------------------- |
| [kort beskrivelse] | [hvilken batch] | ADOPT                             | [hvad blev gjort]      |
| ...                | ...             | DEFER                             | G-nummer YYY           |
| ...                | ...             | DISMISS                           | [hvorfor afvist]       |

`SPARRING-OENSKE`-events (Code stillede spørgsmål til Codex): [liste eller "ingen"].

"Ingen optimerings-aktivitet" hvis intet positive marker blev rejst.

---

## Plan-afvigelser

Hver afvigelse fra planen flagges her med:

- **Hvad:** [konkret ændring]
- **Hvorfor:** [teknisk begrundelse]
- **Godkendelse:** [Mathias-runde N / inline-fix-autoritet / inden-for-implementations-vej-domæne]
- **Konsekvens:** [G-nummer / opdatering af plan / ingen]

"Ingen afvigelser" hvis intet skred.

---

## Vision-tjek

Følger `docs/strategi/arbejds-disciplin.md` sektionen "Vision-tjek-skabelon — i hver trin-rapport":

- **Bygger vi den rigtige løsning, eller en workaround?** [pr. central design-beslutning]
- **Hvis workaround: dokumenteret plan?** [G-nummer + deadline-trin]
- **Vision-styrkelser denne pakke:** [liste]
- **Vision-svækkelser denne pakke:** [liste eller "ingen"]
- **Teknisk gæld akkumuleret:** [nye G-numre + reference]
- **Konklusion:** forsvarligt / kompromis / drift

---

## Fire-dokument-verifikation

**Obligatorisk sektion** (fra disciplin-skift 2026-05-16). Verificerer at den leverede pakke holder linjen mod alle fire forretnings-dokumenter, ikke kun mod vision. Spejler plan-filens "Fire-dokument-konsultation"-tabel, med tilføjet status post-build.

| Dokument                                    | Plan-konsultation | Post-build status   | Afvigelse                                         |
| ------------------------------------------- | ----------------- | ------------------- | ------------------------------------------------- |
| `docs/strategi/vision-og-principper.md`     | [ref. fra plan]   | overholdt / afveget | [hvis afveget: link til Plan-afvigelser nedenfor] |
| `docs/strategi/stork-2-0-master-plan.md`    | [ref. fra plan]   | overholdt / afveget | [link hvis afveget]                               |
| `docs/coordination/mathias-afgoerelser.md`  | [ref. fra plan]   | overholdt / afveget | [link hvis afveget]                               |
| `docs/coordination/<pakke>-krav-og-data.md` | [ref. fra plan]   | overholdt / afveget | [link hvis afveget]                               |

**Regler:**

- Status "overholdt" kræver at de plan-refererede paragraffer/principper/afgørelser/krav reelt er leveret i koden — ikke kun nævnt i plan
- Status "afveget" kræver konkret reference til Plan-afvigelser-sektionen med tilhørende godkendelse fra Mathias
- Hvis pakken introducerer ny rammeniveau-beslutning (typisk strategisk retning-skift): entry i `docs/coordination/mathias-afgoerelser.md` skal være del af pakkens commits, og det dokumenteres her
- Claude.ai's slut-rapport-review verificerer denne tabel mod commits

---

## G-numre / H-numre

- **Tilføjet:** [liste med kort beskrivelse + henvisning til `docs/teknisk/teknisk-gaeld.md`]
- **Løst:** [liste med commit-hash]
- **Opdateret status:** [liste]

---

## Oprydning + opdatering udført

Verifikation mod plan-filens "Oprydnings- og opdaterings-strategi"-sektion. Hver punkt:

**Filer flyttet til arkiv:**

- [fil-sti] → [arkiv-sti] (commit-hash)
- [...]

**Filer slettet:** [liste eller "ingen"]

**Dokumenter opdateret:**

- [dokument-sti]: [hvad blev ændret] (commit-hash)
- [...]

**Reference-konsekvenser håndteret:** [liste eller "ikke relevant"]

**Verifikation:** alle `grep`-tjek fra planen returnerer 0 hits. Hvis afvigelse: dokumentér i Plan-afvigelser ovenfor.

---

## Næste skridt

- **Næste pakke:** [navn + kort beskrivelse]
- **Forudsætninger inden næste start:** [eventuelle Mathias-afgørelser, godkendelser, eller eksterne events]

---

## Codex-review-trigger

Efter denne rapport committes + `docs/coordination/seneste-rapport.md` opdateres til at pege på denne fil, posterer Codex-notify-action en comment til tracker-issuet "Codex review queue". Codex-review-runde N følger derefter via `docs/skabeloner/codex-review-prompt.md` niveau 1-prefix.
