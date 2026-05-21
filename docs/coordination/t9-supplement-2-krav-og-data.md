# T9-supplement-2 — krav og data

**Pakke-type:** Lille opfølgnings-pakke. Lukker G057 + G059 i `docs/teknisk/teknisk-gaeld.md`.
**Forudsætning:** T9-fundament + T9-supplement merget; trin 10 merget (T10.7b etablerede klient-bypass-mønster).

---

## 1. Formål

To T9-fundament-mangler observeret under trin 10's build:

- **G059:** Fem T9 wrapper-RPC'er (org_node + employee + team-veje) kan ikke
  gennemføre den forretningsgang de er bygget til, fordi de ikke sætter
  `stork.t9_write_authorized`-session-var før `pending_change_request`. INSERT
  på `pending_changes` fejler for authenticated bruger med FORCE RLS.
  T10.7b fixede de to klient-wrappers; de fem øvrige forblev broken.
- **G057:** To T9 forretnings-invariants i apply-handlers (`_apply_client_place`
  team-aktiv-check + `_apply_team_close` allerede-inaktiv-check) blokerer
  superadmin. T10.7b satte bypass-mønstret for klient-aktiv-check; T9's
  tilsvarende invariants forblev uden bypass.

## 2. Forretningssandheder (kilde-validerede)

### 2.1 Page/tab + se/skrive er rammen for adgang

Det er selve page/tab der afgør hvilke ting der kan rettes. Hvis man har
adgang til en side (fx vagtplan) og man har skrive-rettigheder på den side,
kan man tilføje sygdom, oprette vagter osv. Hver page/tab kan der vælges se
eller skrive adgang.

Konsekvens: ingen separate handlings-rettigheder. Skrive-adgang på pagen =
bruger kan udføre alle handlinger på pagen.

- **Kilde:** Mathias chat 2026-05-21 (denne pakke); mathias-afgoerelser
  2026-05-17 (T9-omstart-ramme punkt 3 — to akser: kan_tilgå/kan_skrive).

### 2.2 Superadmin har fuld se+skrive på alle pages/tabs + bypasser forretnings-invarianter

Superadmin har ret til alt. Fuld se og fuld skrive overalt. Superadmin er
eneste hardkodede rolle. Superadmin bypasser desuden forretnings-invarianter
(aktiv-checks, allerede-tilstand-checks o.l.) som praksis for nød-operationer
— ramme for hele systemet, ikke pakke-specifik beslutning. Strukturelle
invarianter bypasses aldrig (jf. §2.4).

- **Kilde:** vision-princip 2 (eneste hardkodede rolle); mathias-afgoerelser
  2026-05-17 punkt 10 (synlighed=Alt); mathias-afgoerelser 2026-05-21
  (bypass-ramme på forretnings-invarianter, Del 1).

### 2.3 Pending-change-mekanismen er ramme-låst forretningsgang

Alle ændringer med gældende dato følger fortrydelses-mekanisme: gældende dato
→ godkendelse → fortrydelses-periode → ændring kan rulles tilbage i UI indtil
periodens udløb → derefter permanent. Gælder struktur-ændringer,
medarbejder-placeringer, klient-flytninger.

Vejen for authenticated bruger med relevant skrive-rettighed på pagen er via
wrapper-RPC'er der opretter pending changes.

- **Kilde:** mathias-afgoerelser 2026-05-17 punkt 13.

### 2.4 Strukturelle invariants bypasses aldrig

Klienter tilknyttes kun knuder af type team. Team-luk virker kun på
team-knude. Disse er strukturelle sandheder om hvad data overhovedet KAN
være. Bypasses ikke, heller ikke af superadmin. Bypass ville korrumpere
data-modellen.

- **Kilde:** mathias-afgoerelser 2026-05-17 punkt 6.

## 3. Pakkens leverancer

### 3.1 Wrapper-vejen virker for authenticated bruger (G059)

De fem T9 wrapper-RPC'er der i dag fejler skal kunne gennemføre
pending-change-flowet for authenticated bruger med relevant skrive-rettighed:

- Oprette/ændre afdeling eller team
- Deaktivere organisations-knude
- Lukke team
- Placere medarbejder på knude
- Fjerne medarbejder fra knude

Smoke-tests skal verificere wrapper-flowet end-to-end (ikke kun via direkte
`_apply_*`-kald).

### 3.2 Superadmin-bypass på T9 forretnings-invariants (G057)

Superadmin skal kunne gennemføre:

- Placere klient på team der ikke er aktivt på effective_from (matcher
  T10.7b-mønstret for klient-aktiv-check)
- Lukke team der allerede er inaktivt (idempotens-no-op for superadmin)

Bypass-mønstret følger T10.7b's `is_admin`-check lokalt i handler;
form er idempotency-model (vagten passerer for superadmin → handler kører →
effektivt no-op hvis allerede i mål-tilstand), ikke separat break-glass-sti.
Almindelig bruger fastholdes af invariants.

Strukturelle invariants (klient-til-team-only, team_close_not_team) bypasses
ikke — heller ikke for superadmin.

- **Kilde:** mathias-afgoerelser 2026-05-21 (Del 1 bypass-ramme + Del 2
  idempotency-model).

## 4. Hvad pakken ikke leverer

- De øvrige T9-supplement-skitse-punkter (team-retype trigger, backdated
  guards, API/schema exposure, import-stubs, type-codegen, read-RPC gates,
  step 12 superadmin-robusthed). Disse håndteres separat.
- Ændringer til pending-change-flowet selv (fortrydelses-mekanisme,
  gælder-dato-håndtering, audit-spor).
- Ændringer til page/tab + se/skrive-rammen. Den er fundament; denne pakke
  bruger den, definerer den ikke.
