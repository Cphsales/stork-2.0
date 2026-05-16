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

## Oprydnings- og opdaterings-strategi

Obligatorisk sektion. Hver plan skal eksplicit beskrive hvad der skal ryddes op og opdateres som konsekvens af pakkens leverance. Mangler denne sektion: plan er ikke approved.

**Filer der skal flyttes til arkiv** (efter pakken er merget):

- `docs/coordination/<pakke>-krav-og-data.md` → `docs/coordination/arkiv/` (standard for alle pakker)
- `docs/coordination/<pakke>-plan.md` → `docs/coordination/arkiv/`
- Alle `docs/coordination/plan-feedback/<pakke>-*.md` → `docs/coordination/arkiv/`
- [Andre pakke-specifikke arbejds-artefakter]

**Filer der skal slettes** (hvis pakken gør dem irrelevante):

- [Liste eller "ingen"]

**Dokumenter der skal opdateres** (som konsekvens af pakkens leverance):

- `docs/coordination/aktiv-plan.md` → ryd til "ingen aktiv plan" eller peg på næste
- `docs/coordination/seneste-rapport.md` → peger på ny slut-rapport (standard)
- `docs/coordination/mathias-afgoerelser.md` → entry hvis pakken indeholder strategiske retning-skift (ikke pakke-leverancer)
- `docs/strategi/bygge-status.md` → hvis pakken ændrer trin-status
- `docs/strategi/stork-2-0-master-plan.md` → hvis pakken introducerer rettelse (Appendix C)
- `docs/teknisk/teknisk-gaeld.md` → hvis pakken tilføjer/løser G-numre
- [Andre pakke-specifikke dokument-opdateringer]

**Reference-konsekvenser** (hvis pakken om-døber eller flytter filer):

- [Liste over filer der refererer den om-døbte/flyttede sti, og som skal opdateres]
- Verifikation: `grep -r "<gammel-sti>" docs/` returnerer 0 hits efter pakken

**Ansvar:** Code udfører oprydning + opdatering som del af pakkens build-leverance, ikke som separat trin. Slut-rapporten verificerer at det er gjort.

---

## Konsistens-tjek

- **Vision:** [styrker / svækker / uændret] — kort begrundelse
- **Master-plan:** [paragraf-referencer + om planen modsiger noget]
- **Disciplin-pakke:** [referencer formålet, holder afsnit 1-4 fra `docs/strategi/arbejds-disciplin.md`]

---

## Konklusion

Én afsluttende vurdering: bringer planen pakken nærmere formålet med acceptabel risiko? Hvis ja: klar til Codex-review-runde. Hvis nej: justér før indsendelse.
