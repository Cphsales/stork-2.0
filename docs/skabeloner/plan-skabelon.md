# Plan-skabelon

Skabelon for plan-filer der leveres FØR implementation (Code → Codex → Mathias-godkendelse → Code bygger).

Hver plan starter med Formål-sektionen ordret. Resten af strukturen er vejledende — udelad sektioner der ikke gælder for pakken, men hold rækkefølgen.

---

## Formål

> Denne pakke leverer: [én sætning]
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Scope

**I scope:**

- Master-plan-paragraffer: [§X.Y, §X.Z]
- Krav-specs: [navn + paragraf]
- Tilstødende G-numre der skal håndteres: [liste]
- Rettelser fra master-plan (rettelse N) der gælder: [liste]

**IKKE i scope:**

- [Hvad ligner det, men hører til senere trin?]
- [Hvilke G-numre venter på senere trin?]

---

## Strukturel beslutning

Hvis pakken indeholder et arkitektur-valg der binder fremtidige pakker: dokumentér valget eksplicit her med begrundelse. Ellers udelad sektionen.

---

## Mathias' afgørelser (input til denne plan)

Liste af konkrete afgørelser Mathias har truffet før plan blev skrevet. Plan er konsistent med disse. Hver entry:

- **Afgørelse N:** [kort beslutning]
- **Begrundelse:** [hvorfor]
- **Plan-konsekvens:** [hvad ændrer det i denne plan]

---

## Implementations-rækkefølge

Konkret rækkefølge for migrations / kode-ændringer. Pr. step:

- **Step-kode** (R7a, P1b, etc.)
- **Hvad:** [én sætning]
- **Hvorfor først/sidst:** [afhængighed til andre steps]
- **Migration-fil:** [forventet navn]
- **Risiko:** [lav/mellem/høj + rollback]

---

## Test-konsekvens

Liste pr. ny eller ændret test:

- **Test-fil:** [sti]
- **Hvad verificeres:** [én sætning]
- **Forventet status:** [grøn / dokumenteret skip / forventet rød hvis pre-aktivering]

---

## Risiko + kompensation

Risiko-matrix:

| Migration | Værste-case | Sandsynlighed  | Rollback              |
| --------- | ----------- | -------------- | --------------------- |
| [step]    | [scenarie]  | lav/mellem/høj | [konkret revert-step] |

Kompensation (generelt): hvad sker hvis hele pakken fejler under build.

---

## Konsistens-tjek

- **Vision:** [styrker / svækker / uændret] — kort begrundelse
- **Master-plan:** [paragraf-referencer + om planen modsiger noget]
- **Disciplin-pakke:** [referencer formålet, holder afsnit 1-4 fra `docs/strategi/arbejds-disciplin.md`]

---

## Konklusion

Én afsluttende vurdering: bringer planen pakken nærmere formålet med acceptabel risiko? Hvis ja: klar til Codex-review-runde. Hvis nej: justér før indsendelse.
