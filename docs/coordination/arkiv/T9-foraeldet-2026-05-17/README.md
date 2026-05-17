# T9-runde — Forældet (V1-V3 trukket tilbage 2026-05-17)

Denne mappe indeholder den oprindelige T9-runde der blev gennemført før
afdæknings-session 2026-05-17. Runden blev trukket tilbage fordi forretnings-
fundamentet var misforstået.

## Hvad gik galt

- V1-V3 antog visibility-modellen "team-medlemskab som åben metadata" på
  employee_team_assignments-tabellen. Det modsagde mathias-afgoerelser
  2026-05-16 pkt 7 ("cross-team-adgang løses via rollen — Rollen kan have et
  scope der hedder 'ser alt under min afdeling' eller 'ser alt'").
- Claude.ai godkendte fejlagtigt V1, V2 og V3 (sidste som MELLEM-finding).
  Trak V3-approval tilbage som KRITISK-feedback efter Mathias spotted at
  approvalen modsagde pkt 7.
- Afdæknings-session 2026-05-17 afslørede yderligere misforståelser:
  navigations-strukturen, terminologi (gren/område/stamme), permission-
  elementernes hierarki, ét-træ-misforståelsen.

## Hvad blev rettet i omstarten

Nyt krav-dokument skrevet på basis af afdækningen:

- Ét træ (organisations-træet), ikke to
- Permission-elementer i tre niveauer (Område → Page → Tab) som data i DB
- Tre synligheds-værdier (Sig selv / Hiraki / Alt) — Hiraki udledt af placering
- Klient kun tilknyttet team-knuder
- Knude-løs er gyldig medarbejder-tilstand
- Klart funktions-fokus (hvad systemet skal kunne) frem for datastruktur-beskrivelse
- Klient-til-team-import udskudt til trin 10 (kræver klient-skabelon)

## Status

Disse filer er bevaret for historik og audit-spor. Den ny T9-runde starter
med nyt krav-dokument og nye plan-runder. Reference:
`docs/coordination/T9-krav-og-data.md` (nyt) + mathias-afgoerelser-entry
2026-05-17 (afdæknings-session).
