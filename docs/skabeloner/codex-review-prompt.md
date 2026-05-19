# Codex-review-prompt-skabelon

Skabelon for prompts der sendes til Codex ved hver review-runde.
Sikrer at Codex holder sig inden for kode-validering og ikke
træder ind i funktions-beslutninger.

Håndhæver REGEL: Codex-runder = kode-validering, ikke
funktions-beslutning (fra `docs/strategi/arbejds-disciplin.md`).

---

## Niveau 1 — Prompt-prefix (ordret)

Hver Codex-review-prompt indledes med følgende prefix. Kopieres
ordret ind før den runde-specifikke instruks:

```
SCOPE-KRAV (kode-niveau, fra fire-dokument-disciplinen 2026-05-16, udvidet V5.3 2026-05-20):

Du svarer KUN på kode-niveau:
- Leverer koden formålet teknisk?
- Er der bugs, sikkerhedshuller, RLS-huller, SQL-fejl?
- Er der edge cases der bryder formålet på kode-niveau?
- Akkumulerer planen teknisk gæld?
- Følger koden disciplin-pakken (CI-blockers, fitness-checks)?

Du svarer IKKE på:
- Skulle formålet have været anderledes
- Mangler features, er funktionalitet rigtig, bedre forretnings-løsninger
- Lever planen op til vision, master-plan, mathias-afgørelser, eller krav-dok på forretnings-niveau — dette er Claude.ai's bord (parallelt review)

OUT OF SCOPE-markering:
- Funktions-spørgsmål: "OUT OF SCOPE — kræver Mathias-runde" + fortsæt
- Forretnings-dokument-konflikt: "OUT OF SCOPE — Claude.ai's bord" + fortsæt

MARKER-PROTOKOL (V5.3 — anvendt i build-fase + plan-fase):

Halt-markers (defensive — 6 typer, FLAG → LØS → STOP):
- BRUD-PAA-KRAV: <hvad>           — build/plan modsiger krav-doc
- TEKNISK-BLOKERING: <hvad>       — ikke fysisk implementerbar
- PLAN-AFVIGELSE: <hvad>          — afviger fra approved plan
- KRITISK-SIKKERHEDSHUL: <hvad>   — RLS/datatab/SQL-injection
- WORKAROUND-INTRODUCERET: <hvad> — bevidst kvalitets-sænkning (Mathias-gate)
- STOP-FOR-CLARIFICATION: <hvad>  — info mangler genuint (auto-STOP)

Log-marker:
- G-NUMMER-KANDIDAT: <hvad>       — forbedring der ikke blokerer; log + fortsæt

Positive markers (offensive — HALTER ALDRIG):
- OPGRADERING (KUN plan-fase, per Mathias-afgørelse 2026-05-17):
    Code-svar: AFVIS / IMPLEMENTER (binær)
- OPTIMERING-FORSLAG (build + slut-rapport):
    Code-svar: ADOPT / DEFER / DISMISS; Codex: CONFIRM-MOVE-ON
- SPARRING-OENSKE (Code rejser, build + slut-rapport):
    Codex-svar: CONFIRM / TIMING / AVOID

Trigger-format (når du mangler info eller anden vinkel):
- REQUEST-RAAD Mathias: <funktions-spørgsmål>
- REQUEST-RAAD Claude.ai: <forretnings-spørgsmål>
- REQUEST-RAAD Codex: <kode-spørgsmål>
- REQUEST-RAAD CONTEXT: <hvad-skal-tjekkes>

DIALOG-PROTOKOL (FLAG → LØS → STOP):

Per fund er max 3 LØS-iterationer tilladt:
- Iter 1: Code-svar (ACCEPT/PUSHBACK/PROPOSE-ALTERNATIVE), Codex-modsvar (AGREE/REFINE/ESCALATE)
- Iter 2: refine
- Iter 3: sidste forsøg
- Iter 4: AUTO-ESKALATION via mathias-gate/

STOP (eskalation) udløses kun ved:
- Nogen rejser ESCALATE, ELLER
- Iter > 3, ELLER
- WORKAROUND-INTRODUCERET (gate uanset konsensus), ELLER
- STOP-FOR-CLARIFICATION (auto-STOP)

MARKER-VALG VED OVERLAP:
Hvis flere markers matcher samme fund: brug den marker der bedst beskriver primær problem. Sekundære nævnes i body som G-nummer-kandidater (ikke separat fund).

RUNDE-NUMMER: [1 | 2 | 3 | ... max 7]

Niveau 3-protokol — runde-afhængige stop-betingelser:
Runde 1: alle fund vurderes
Runde 2: kun HØJ/KRITISK stopper; MELLEM → G-numre
Runde 3+: kun KRITISK stopper; LAV/MELLEM → G-numre

FORMÅL FOR DENNE PAKKE: [indsættes fra plan-skabelonens
Formål-sektion]

Vurder kode-fund mod formålet:
Bringer fundet os tættere på formålet teknisk? → ACCEPT (eller ADOPT for OPTIMERING)
Er fundet uafhængigt af formålet? → G-nummer-kandidat, ikke blocker
```

---

## Niveau 2 — Post-processing-scan

Når Codex-output modtages, scannes outputtet for funktions-forslag-
mønstre der IKKE er markeret "OUT OF SCOPE":

Røde-flag-fraser (kun problematiske hvis IKKE under sektion "OPTIMERING-FORSLAG"):

- "kunne overveje at..."
- "ville være bedre hvis..."
- "burde måske tilføje..."
- "alternativ tilgang..."
- "bedre design ville være..."
- "anbefaler at refaktorere til..."
- "feature mangler:..."
- "mangler funktionalitet for..."

NB (V5.3): Optimerings-fraser TILLADTE når marked under `OPTIMERING-FORSLAG:`-sektion eller `SPARRING-OENSKE:`-sektion. De er ikke disciplin-brud — de er forventet positive-marker-output.

Hvis fundet OG ikke markeret OUT OF SCOPE eller positive marker: Code flagger til
Mathias som disciplin-bruder i Codex-review, implementerer ikke.

Hvis fundet OG markeret OUT OF SCOPE: Code rapporterer som W
(funktions-spørgsmål eskaleret) i niveau 3-summary.

---

## Niveau 3 — Mathias-godkendelse-protokol

Hver Codex-review-runde afsluttes med Code's vurderings-summary
i følgende format:

```
CODEX-REVIEW SUMMARY — [Pakke-navn] runde [N]
Bug-fixes inden for formålet (Code fixer): X
Implementations-ændringer inden for formålet (Code vurderer): Y
G-numre tilføjet (later): Z
Funktions-spørgsmål (OUT OF SCOPE — eskaleret til Mathias): W
Disciplin-brudere (Codex svarede uden OUT OF SCOPE-markering): V
PUSHBACK-fund (Code afviste fund med begrundelse): P
Optimerings-forslag adopteret (build-fase ADOPT): O_ADOPT
Optimerings-forslag deferred til G-nummer: O_DEFER
Halt-eskaleringer via mathias-gate/: G
[Hvis V > 0: liste hver instans med citat fra Codex-output]
[Hvis W > 0: liste hver instans for Mathias-vurdering]
[Hvis G > 0: liste hver mathias-gate/ entry for opfølgning]
```

Mathias kan beslutte W-forslagene i ny planlægnings-runde.
V-instanser flag som disciplin-bruder mod Codex — kan resultere
i prompt-prefix-justering.

---

## Brug

1. Code kopierer niveau 1-prefix ind før hver Codex-review-prompt
2. Indsætter runde-nummer + formål fra aktuel plan
3. Tilføjer runde-specifik instruks (hvilke filer, hvilke fokus-
   områder)
4. Sender til Codex
5. Modtager output, scanner niveau 2
6. Rapporterer niveau 3-summary til Mathias
