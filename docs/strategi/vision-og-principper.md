# Stork 2.0 — Vision og principper

> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette.

## Vision

Stork 2.0 bygges til at holde. Vi tager ikke nemme løsninger, hardkodede
shortcuts, eller midlertidige fixes der bliver permanente. Hvert valg
vurderes mod hvad der står om 5 år, ikke hvad der virker i dag.

Systemet er fundamentet for Copenhagen Sales' drift. Det skal kunne tåle
ny lovgivning, nye klienter, nye datatyper, og nye krav uden at blive
bygget om. Det betyder data, rettigheder og forretningslogik styres i
UI — ikke i kode. Algoritmer lever i kode, alt andet i data. Du har
kontrollen, ikke en hardkodet regel.

Vi bygger greenfield. 1.0's anti-mønstre kopieres ikke, selv hvis det
går hurtigere. Workarounds uden plan er drift. Vi accepterer ikke
teknisk gæld uden eksplicit beslutning om hvornår den løses.

Audit, rettigheder, anonymisering og retention er ikke add-ons. Det er
fundament. De skal være på plads før systemet går i produktion, og de
skal kunne ændres i UI når nye regler kommer.

## Tre bærende principper

De tre essentielle principper hele systemet bygges på. Alt andet leder tilbage til disse.

1. **Én sandhed** — én autoritativ kilde pr. fakta. Database er sandheden; alt andet (frontend-state, edge-cache, beregningsresultater) er views af samme sandhed. Konflikt mellem to kilder er en fejl, ikke en feature.

2. **Styr på data** — hver kolonne har eksplicit semantik: klassifikation, PII-niveau, retention. GDPR-compliance er indbygget, ikke add-on.

3. **Sammenkobling eksplicit i modellen** — relations som data, ikke implicit i kode. FK-constraints er obligatoriske mellem relaterede entiteter.

De ni operationelle principper nedenfor er konkretiseringer af disse tre.

## Ni operationelle principper

### 1. Data-kontrol i UI

Al data — uanset kilde (UI, API, uploads) — klassificeres i UI for PII,
retention og anonymisering.

### 2. Rettigheder i UI

Team-træ styrer hvilken data der vises. Page/tabs styrer hvilke dele
af systemet der ses. Superadmin er eneste hardkodede rolle.

### 3. Forretningslogik som data

KPI'er, lønarter, formler, klassifikationer, regler — alt er data i UI.
Algoritmer er kode, værdier er data.

### 4. Default = intet

Ingen PII, ingen retention, ingen anonymisering, ingen audit-opgradering
medmindre det aktivt vælges i UI.

### 5. Lifecycle for konfiguration

Alt der påvirker data-håndtering gennemgår draft → tested → approved →
active. Aktivering er bevidst handling, ikke automatik.

### 6. Audit på alt der ændrer data

Per-row audit som default. Snapshot-tabeller har aggregat-audit som
undtagelse.

### 7. Anonymisering bevarer audit

Anonymisering er UPDATE der erstatter PII med placeholder. Row forbliver,
audit-spor bevares.

### 8. Identitet eksisterer én gang

Personer findes som én entitet. Systemer kobles via identity-mapping,
ikke parallelle person-tabeller.

### 9. Status-modeller bevarer historik

Forretningshandlinger ændrer aldrig oprindelig data. Statusændringer
sker via separate tabeller eller status-felter, aldrig ved overskrivning.

## Arbejdsmetode

### Tre AI-aktører

- **Claude.ai** — strateg, prompt-forberedelse, sparring
- **Code (CLI)** — primær builder, repo + Supabase-adgang
- **Codex** — kritisk reviewer, djævlens advokat

### Ansvarsfordeling

Mathias afgør forretning. Code afgør teknik. Hvis Code er uenig i en
teknisk afgørelse: argumentér konkret, bøj ikke for autoritet.

### Trin-cyklus

plan → review → byg → review → godkend

Lag-boundary-godkendelse er eksplicit. Rydning af working tree, grønne
tests, ren stop-hook — ingen af disse er implicit godkendelse.
