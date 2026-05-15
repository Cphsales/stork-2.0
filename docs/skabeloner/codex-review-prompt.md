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
SCOPE-KRAV:

Du svarer KUN på: leverer koden formålet, er der bugs,
sikkerhedshuller, RLS-huller, SQL-fejl, edge cases,
disciplin-overholdelse
Du svarer IKKE på: skulle formålet have været anderledes,
mangler features, er funktionalitet rigtig, bedre
forretnings-løsninger
Hvis du opdager funktions-spørgsmål: marker dem som
"OUT OF SCOPE — kræver Mathias-runde" og fortsæt review

Funktions-beslutninger hører hos Mathias.
RUNDE-NUMMER: [1 | 2 | 3]

Runde 1: alle fund vurderes
Runde 2: kun HØJ-fund stopper implementation. MELLEM → G-numre
Runde 3: kun KRITISKE fund stopper. Resten → G-numre

FORMÅL FOR DENNE PAKKE: [indsættes fra plan-skabelonens
Formål-sektion]
Vurder fund mod formålet:

Bringer fundet os tættere på formålet? → ACCEPT
Er fundet uafhængigt af formålet? → G-nummer, ikke blocker
```

---

## Niveau 2 — Post-processing-scan

Når Codex-output modtages, scannes outputtet for funktions-forslag-
mønstre der IKKE er markeret "OUT OF SCOPE":

Røde-flag-fraser:

- "kunne overveje at..."
- "ville være bedre hvis..."
- "burde måske tilføje..."
- "alternativ tilgang..."
- "bedre design ville være..."
- "anbefaler at refaktorere til..."
- "feature mangler:..."
- "mangler funktionalitet for..."

Hvis fundet OG ikke markeret OUT OF SCOPE: Code flagger til
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
[Hvis V > 0: liste hver instans med citat fra Codex-output]
[Hvis W > 0: liste hver instans for Mathias-vurdering]
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
