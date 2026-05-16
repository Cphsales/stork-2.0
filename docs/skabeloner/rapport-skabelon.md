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
