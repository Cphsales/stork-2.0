# Plan-skabelon

Skabelon for plan-filer der leveres FØR implementation (Code → Codex → Mathias-godkendelse → Code bygger).

Hver plan starter med Verificerede afhængigheder + Formål-sektionerne ordret. Resten af strukturen er vejledende — udelad sektioner der ikke gælder for pakken, men hold rækkefølgen.

---

## Verificerede afhængigheder

**Obligatorisk sektion ØVERST** (V2 2026-05-20 — recon-først per `docs/coordination/overvaagning/code-overvaagning.md`). Code SKAL læse hver tidligere-trins migration-fil og hver kode-fil planen refererer FØR plan-indhold skrives. Antagelser om API'er (signaturer, return-typer, side-effects) uden file:linje-reference = KRITISK-fabrikation; Codex blokerer planen og recon-først gentages.

| Afhængighed (RPC / tabel / view / migration / type) | Verificeret fra (file:linje) | Note (signatur, return-type, invariant)   |
| --------------------------------------------------- | ---------------------------- | ----------------------------------------- |
| `<navn>`                                            | `<sti>:<linje>`              | `<faktisk signatur eller relevant fakta>` |

Hvis denne pakke ikke bygger ovenpå eksisterende artefakter (rent greenfield i isoleret område): marker "N/A — greenfield, ingen eksterne afhængigheder" og forklar kort. Default antagelse er at sektionen er udfyldt.

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

Konkret rækkefølge for migrations / kode-ændringer. Hver step skal indeholde nok detalje til at Codex kan verificere end-to-end uden at gætte. Pr. step:

- **Step-kode** (R7a, P1b, etc.)
- **Type:** [RPC / migration / policy / GRANT / trigger / cron / test / view / edge-function / andet]
- **Hvad:** [én sætning om intentionen]
- **Eksakt indhold:** For RPC: signatur + body-skitse. For policy: USING + WITH CHECK. For migration: DDL. For GRANT: statement. For trigger: trigger-definition + funktion. Ikke prosa-beskrivelse — pseudo-SQL eller pseudo-TS.
- **Afhængigheder:** hvilke andre steps den bygger på
- **Migration-fil:** forventet navn
- **Risiko:** lav/mellem/høj + rollback

---

## Fundament-tjek-passeret

**Obligatorisk for Mellem/Stor-pakker** (parallel til "Fire-dokument-konsultation" og "Oprydnings- og opdaterings-strategi"). Valgfri for Lille-pakker (mikro-fix, doc-rettelse, oprydning under 100 linjer). Mangler sektionen i Mellem/Stor uden begrundet "N/A": planen er ikke approval-klar (KRITISK feedback fra Codex i plan-review; Code's pre-push-tjekliste skal fange det først).

V2-reduktion (2026-05-20): tabellen er reduceret fra 7 til 4 essentielle tjek. Recon-først (Verificerede afhængigheder-sektionen øverst) dækker det tidligere "Apply-dispatcher-extension"-, "jsonb-format"- og "Backdated guards"-tjek der nu er en del af recon-disciplinen. Codex verificerer at indholdet stemmer (V2 — Claude.ai-plan-reviewer-rolle udgået).

| Tjek                                                               | Status     | Reference  |
| ------------------------------------------------------------------ | ---------- | ---------- |
| Hver write-RPC har GRANT + INSERT/UPDATE-policy + session-var      | ja/nej/N/A | step-koder |
| Hver SELECT-policy bred nok til legitime læsere                    | ja/nej/N/A | step-koder |
| Eksempel-row verificeret gennem flow                               | ja/nej/N/A | reference  |
| Plan-detaljer eksplicit (ingen "TBD" / "Code afgør" / overladelse) | ja/nej     | —          |

"N/A" = denne pakke har ingen leverancer der rammer dette tjek (skal begrundes kort i Reference-kolonnen).

---

## Test-konsekvens

Liste pr. ny eller ændret test:

- **Test-fil:** [sti]
- **Hvad verificeres:** [én sætning]
- **Forventet status:** [grøn / dokumenteret skip / forventet rød hvis pre-aktivering]

---

## Build-fase halt-håndtering (V5.3 — workflow-spec reference)

Planen skal kortfattet beskrive forventede halt-trigger-scenarier under build, så Codex ved hvad der skal rejses som halt-marker vs G-nummer-kandidat. Se `docs/skabeloner/workflow-skabelon.md` for fuld marker-protokol-spec.

- **Forventede WORKAROUND-kandidater:** [liste eller "ingen forventet"]
- **Forventede PLAN-AFVIGELSE-scenarier:** [liste eller "ingen forventet"]
- **Kritiske invarianter der ikke må brydes:** [fx FORCE RLS, audit-trigger-dækning] — dette guider Codex' KRITISK-SIKKERHEDSHUL-vurdering

Hvis planen IKKE forudser nogen halt-scenarier, marker eksplicit "ingen halt-scenarier forventet".

## Optimerings-hypoteser (V5.3 — valgfri)

Hvis planen ser oplagte optimerings-muligheder under build, dokumentér dem her som **hypoteser** Codex kan rejse som OPTIMERING-FORSLAG. Code kan ADOPT / DEFER / DISMISS per V5.3-svar-typer.

- [Hypotese 1: kort beskrivelse]
- [Hypotese 2: ...]

Ikke obligatorisk — udelad hvis planen er straight-forward.

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

**Bemærk:** Konsistens-tjek-sektionen er den ældre version af kilde-verifikation. Med fire-dokument-disciplinen (2026-05-16) er den bredere verifikation flyttet til **Fire-dokument-konsultation**-sektionen nedenfor (obligatorisk). Denne sektion bevares for disciplin-pakke-referencen.

- **Disciplin-pakke:** [referencer formålet, holder afsnit 1-4 fra `docs/strategi/arbejds-disciplin.md`]

---

## Fire-dokument-konsultation

**Obligatorisk sektion.** Hver plan skal eksplicit dokumentere konsultation af de fire autoritative forretnings-dokumenter (defineret i `docs/strategi/arbejds-disciplin.md` sektionen "Fire autoritative forretnings-dokumenter"). Mangler denne sektion eller har "nej" på konsulteret-kolonnen: Codex blokerer planen med severity KRITISK i plan-review (V2 — Claude.ai-plan-reviewer-rolle udgået; Code har selv-disciplin om at udfylde tabellen før plan-commit).

V2 dokument-hierarki (jf. `mathias-afgoerelser.md` 2026-05-20 "Workflow-justering V2"):

- `vision-og-principper.md` = **LÅST-AUTORITATIV**. Konflikt → automatisk blokering.
- `stork-2-0-master-plan.md` + `mathias-afgoerelser.md` = **RETNINGSGIVENDE** (kan rettes løbende). Konflikt → trigger-for-opdatering, Mathias afgør om plan ændres eller dokumentet opdateres. Ikke automatisk blokering.
- `<pakke>-krav-og-data.md` = **PAKKE-KONTRAKT** efter approval (låst inden for pakken). Konflikt → blokering med severity KRITISK.

| Dokument                                    | Konsulteret | Status           | Relevante referencer                                                                   | Konflikt med plan?                                             |
| ------------------------------------------- | ----------- | ---------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `docs/strategi/vision-og-principper.md`     | ja / nej    | LÅST-AUTORITATIV | [konkrete princip-numre, fx "princip 1, 7, 9"]                                         | ja / nej — ja = automatisk blokering                           |
| `docs/strategi/stork-2-0-master-plan.md`    | ja / nej    | RETNINGSGIVENDE  | [konkrete paragraf-numre + rettelser, fx "§1.7, §3, §4 trin 9, rettelse 19 C1"]        | ja / nej — ja = trigger-for-opdatering (Mathias afgør)         |
| `docs/coordination/mathias-afgoerelser.md`  | ja / nej    | RETNINGSGIVENDE  | [konkrete datoer + emner, fx "2026-05-16 (forretningssandhed), 2026-05-15 (T9 pause)"] | ja / nej — ja = trigger-for-opdatering (Mathias afgør)         |
| `docs/coordination/<pakke>-krav-og-data.md` | ja / nej    | PAKKE-KONTRAKT   | [hele filen, eller specifikke sektioner]                                               | ja / nej — ja = blokering KRITISK (krav-dok eller plan rettes) |

**Regler:**

- "Konsulteret = nej" på nogen række = plan blokeret af Codex i plan-review (V2 — Code's selv-disciplin skal udfylde tabellen før plan-commit; Claude.ai-plan-reviewer-rolle udgået)
- "Referencer" må ikke være "hele filen" som dovent svar på vision/master-plan/mathias-afgørelser — skal være konkrete (paragraf-numre, princip-numre, datoer)
- "Konflikt = ja" på nogen række kræver eksplicit håndtering i Strukturel beslutning-sektionen ovenfor med konkret beskrivelse af konflikt og hvordan planen håndterer den (eller hvilket dokument der opdateres)
- Vision-konflikt = automatisk blokering. Master-plan/mathias-afgørelser-konflikt = trigger-for-opdatering, ikke automatisk blokering. Krav-dok-konflikt (efter approval) = KRITISK fordi krav-dok er PAKKE-KONTRAKT.

---

## Konklusion

Én afsluttende vurdering: bringer planen pakken nærmere formålet med acceptabel risiko? Hvis ja: klar til Codex-review-runde. Hvis nej: justér før indsendelse.
