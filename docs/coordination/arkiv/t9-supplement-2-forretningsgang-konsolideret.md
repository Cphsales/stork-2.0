---
status: forretningsgang-konsolidering (Step 1.0)
pakke: T9-supplement-2 (G057 + G059)
aktør: Claude.ai (konsoliderings-rolle)
kilder: t9-supplement-2-forretningsgang-code.md, t9-supplement-2-forretningsgang-codex.md, t9-supplement-2-forretningsgang-claude-ai.md
---

# T9-supplement-2 — Forretningsgang-konsolidering

## Resume af de tre rapporter

Alle tre rapporter peger på samme grundlæggende problem-områder og samme
forretningsgange. Konvergensen er høj på "hvad er problemet" og lavere på
"hvilken kilde retfærdiggør løsningen". Især "superadmin må alt"-rammen
fortolkes som givet af Code og Codex; Claude.ai's rapport flager at den
eksplicitte ramme-entry ikke findes i `mathias-afgoerelser.md` — det er ÅBENT
spørgsmål til Mathias.

## Matrix

| Forretningsgang                                                               | Code-rapport                                                                                            | Codex-rapport                                                                                                  | Claude.ai-rapport                                                                                                    | Konvergens?                                                      | Mathias-afgørelse                            |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| **G059 — Authenticated bruger opretter org-struktur-ændring via UI**          | Punkt C: wrappers mangler session-var → INSERT på `pending_changes` fejler med FORCE RLS                | Punkt i + ii: wrapper-skrivevejen for org-/team-/medarbejder-veje er broken indtil session-var sættes          | Punkt 1: ramme-låst pending-change-flow (Mathias 2026-05-17 pkt 13) virker ikke for authenticated bruger via wrapper | JA — fuld konvergens                                             | _(åben)_                                     |
| **G059 — Authenticated bruger placerer/fjerner medarbejder via UI**           | Dækket implicit i punkt C                                                                               | Punkt i: omfattet af samme wrapper-skrivevej-fix                                                               | Punkt 2: forretnings-fundament fra Mathias 2026-05-17 pkt 7 + 2026-05-16 pkt 7                                       | JA                                                               | _(åben)_                                     |
| **G059 — Authenticated bruger lukker team eller deaktiverer afdeling via UI** | Dækket implicit i punkt C                                                                               | Punkt ii: teamlukning skal være RLS-realiserbar, ikke ny forretning                                            | Punkt 3: forretnings-fundament fra Mathias 2026-05-16 pkt 3 + 6                                                      | JA                                                               | _(åben)_                                     |
| **G057 — Superadmin lukker allerede-inaktivt team**                           | Punkt B: "vision-princip 2's bypass-mønster" — bypass nødvendigt                                        | Punkt iv: vagten "allerede inaktiv" er bypass-kandidat, struktur-vagt (node_type=team) bevares                 | Punkt 4: forretningssituation tydelig; rammens kilde-status uklar (se ÅBENT 1)                                       | DELVIS — alle tre ser samme behov, Claude.ai flager kilde-status | _(åben)_                                     |
| **G057 — Superadmin placerer klient på inaktivt team**                        | Punkt A: T10.7b satte bypass på klient-aktiv-check men ikke på team-aktiv-check                         | Punkt iii: forretningsvagt "target skal være aktivt team" tillader lokalt bypass                               | Punkt 5: forretningssituation tydelig; rammens kilde-status uklar (se ÅBENT 1)                                       | DELVIS — samme observation som ovenfor                           | _(åben)_                                     |
| **G057 — Strukturelle invarianter bypasses aldrig**                           | Implicit i A og B                                                                                       | Punkt iv + v: kun forretnings-invariants bypasses; strukturelle (node_type=team, klient-til-team-only) bevares | Punkt 6: kilde i Mathias 2026-05-17 pkt 6 + vision-princip 8 analog                                                  | JA — fuld konvergens, ingen tvivl                                | _(intet at afgøre)_                          |
| **Tests rammer ikke wrapper-vejen**                                           | Punkt D: T9-smoke-tests kalder `_apply_*` direkte; G059 ville være opdaget hvis wrapper-flow var testet | Ikke eksplicit nævnt                                                                                           | Nævnt kort i punkt 1 ("manifesterer sig først når frontend bygges")                                                  | KUN CODE eksplicit. Forretningsmæssigt: ja, dækningshul.         | _(intet at afgøre — Code's plan-fase-input)_ |
| **Deploy-rækkefølge G059 før G057**                                           | Punkt E: G059 først så G057 kan smoke-testes via wrapper-flow                                           | Ikke nævnt                                                                                                     | Ikke nævnt                                                                                                           | KUN CODE — teknisk plan-input, ikke forretningsgang              | _(intet at afgøre — hører i plan-fase)_      |
| **Cutover-irrelevans**                                                        | Punkt F: G057+G059 er ikke cutover-blockers                                                             | Ikke nævnt                                                                                                     | Ikke nævnt                                                                                                           | KUN CODE — kontekst-info                                         | _(intet at afgøre)_                          |

## Åbne spørgsmål (kun fra Claude.ai-rapporten)

### ÅBENT 1 — Eksplicit ramme-afgørelse: rækkevidden af "superadmin må alt"

Code refererer til "vision-princip 2's bypass-mønster". Codex refererer til
"superadmins nødmandat". G057 (teknisk-gaeld.md) refererer til "Mathias-afgørelse
2026-05-21 'superadmin må alt'". Ingen af de tre kilder kan jeg verificere:

- `vision-og-principper.md` princip 2 siger: "Team-træ styrer hvilken data der
  vises. Page/tabs styrer hvilke dele af systemet der ses. **Superadmin er
  eneste hardkodede rolle.**" — det handler om hvor permission-konfig lever,
  ikke om bypass af forretnings-invarianter.
- `mathias-afgoerelser.md` 2026-05-17 pkt 10 siger: "Superadmin = synlighed=Alt
  på alle elementer." — det handler om synligheds-aksen, ikke om bypass.
- Ingen entry på 2026-05-21 i `mathias-afgoerelser.md` etablerer "superadmin
  må alt"-rammen som ramme-niveau-afgørelse.

Code og Codex behandler bypass-mandatet som etableret, men det er ikke i en
verificerbar kilde. Det er præcis den fabrikations-fælde Mathias-afgørelse
2026-05-18 (krav-dok-skrivnings-disciplin) skal forhindre.

**Mathias bør afgøre eksplicit:**

- Var T10.7b's `is_admin_by_employee_id`-bypass en pakke-specifik beslutning,
  eller en ramme-afgørelse der gælder fremover for alle forretnings-invariants?
- Hvis ramme-afgørelse: skal den registreres som entry i `mathias-afgoerelser.md`
  før denne pakke bruger den som kilde?
- Hvis pakke-specifik: skal T9's invarianter forblive uden bypass, og
  T10.7b's klient-bypass i stedet revurderes som inkonsistens den anden vej?

### ÅBENT 2 — Idempotency vs. eksplicit bypass-rolle

For "luk allerede-inaktivt team" er der to forretnings-modeller:

- **Idempotency-model:** "luk team" er idempotent for superadmin — allerede-
  inaktivt → no-op. Almindelig bruger får fortsat fejl. (T10.7b's
  klient-bypass følger denne variant.)
- **Eksplicit bypass-rolle:** vagten stopper alle, også superadmin; superadmin
  går via separat sti (fx break-glass eller dedikeret RPC) når nødvendigt.

Code's punkt B og Codex' punkt iv antager begge model 1 uden at eksplicit
diskutere alternativet. Mathias afgør hvilken model der matcher intentionen.

## Pakke-skala-vurdering efter konsolidering

Min vurdering: **Lille pakke** (0-2 åbne spørgsmål). De seks forretningsgange er
låste i mathias-afgoerelser 2026-05-17 + 2026-05-16. ÅBENT 1 og ÅBENT 2 er
forretningspolitiske afgørelser Mathias kan svare på i chat uden krav-dok-fase.
Code og Codex tilføjer ingen åbne spørgsmål jeg ikke har set.

Hvis Mathias afgør ÅBENT 1 som "ramme-status": en entry i
`mathias-afgoerelser.md` bør oprettes som kilde før plan-fasen starter — så
Code og Codex har en stabil reference.

## Konvergens-vurdering pr. kategori

- **Kerne-forretningsgange (G059):** fuld konvergens, ingen ÅBNE
- **Forretnings-invariants vs. strukturelle invariants (G057-afgrænsning):**
  fuld konvergens
- **Bypass-mandatets kilde (G057-grundlag):** uenig om om kilden eksisterer.
  Claude.ai siger "ikke verificeret"; Code/Codex behandler som givet. Det er
  ÅBENT 1.
- **Bypass-modellens form:** ikke berørt af Code/Codex; ÅBENT 2 fra Claude.ai

Ingen nye uenigheder kræver Code-kald-ind for at argumentere fra kode-siden.
Begge åbne spørgsmål er forretningspolitiske og afgøres af Mathias.
