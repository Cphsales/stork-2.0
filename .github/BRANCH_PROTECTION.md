# Branch-beskyttelse — main

## Aflæst tilstand (2026-09-24, med botens token)

- `main` er beskyttet; det krævede statustjek er `Lint, typecheck, test, build` (samle-tjekket i `ci.yml`), håndhævet for alle.
- En PR, der rører filer med en kodeejer (`.github/CODEOWNERS`: `* @mgrubak`), kræver kodeejerens godkendelse på GitHub (2026-09-29: PR #183 blev afvist af »base branch policy« med grønt samle-tjek og en review-anmodning til `@mgrubak`). Mathias valgte at beholde kravet og godkende på GitHub (ledger M-84). Botens token kan ikke aflæse reglen (403).
- Botten `stork-code-bot` har admin-rolle.

## Hvad spærringen før drift hviler på

Mathias godkender med ord i chatten, skrevet i ledgeren (disciplin.md §2), og godkender desuden PR'en på GitHub som kodeejer (M-84). Værnet før drift er samle-tjekket: det kræver vagten, byggetjekket og — for en PR der ændrer pakke-kode — Mathias' `slut ok` for den prøvede version. Codex' merge-dom uden for PR'en dækker, at en PR i princippet kan ændre selve CI-filen.

## Aflæs eller skærp reglen (kræver admin-login)

```bash
gh api /repos/Cphsales/stork-2.0/branches/main/protection
```

Se huskeliste H030 (nedgradér botten til write, aflæs reglen).
