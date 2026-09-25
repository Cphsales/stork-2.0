# Branch-beskyttelse — main

## Aflæst tilstand (2026-09-24, med botens token)

- `main` er beskyttet; det krævede statustjek er `Lint, typecheck, test, build` (samle-tjekket i `ci.yml`), håndhævet for alle.
- Om der kræves en godkendelse på GitHub, kan botens token ikke aflæse (403). PR #172 blev merget uden review.
- Botten `stork-code-bot` har admin-rolle.

## Hvad spærringen før drift hviler på

Mathias godkender med ord i chatten, skrevet i ledgeren (disciplin.md §2), ikke med et klik på GitHub. Værnet før drift er samle-tjekket: det kræver vagten, byggetjekket og — for en PR der ændrer pakke-kode — Mathias' `slut ok` for den prøvede version. Codex' merge-dom uden for PR'en dækker, at en PR i princippet kan ændre selve CI-filen.

## Aflæs eller skærp reglen (kræver admin-login)

```bash
gh api /repos/Cphsales/stork-2.0/branches/main/protection
```

Se huskeliste H030 (nedgradér botten til write, aflæs reglen).
