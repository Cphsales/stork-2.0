# rette-til — Plan V1

**Branch:** claude/rette-til-kaede-fix
**Krav-dok:** docs/coordination/rette-til-krav-og-data.md (ordret kopi af
byg-bestillingen — skrevet af disciplin-vagt-terminalen på Mathias-go
2026-06-11; H-pakke-pragmatik: bestillingen ER kontrakten, punkterne er
forhåndsdikterede leverancer)

## Formål

> Denne pakke leverer: kæde-fixes for alle 11 KAEDE-STOP-fund fra gov-6-åbningen
> 2026-06-11, så gov-6 kan genåbnes på en kæde hvor preflight grøn + selftest
> grøn er slut-beviset — uden dirigent-genstart, uden at røre #126's gate-ord.

## Ramme (fra bestillingen — bindende)

- Branch fra origin/main · selftest UDVIDES FØR hvert fix · Codex-review pr.
  batch · kode-/CODEOWNERS-PR'er kræver Mathias-klik · status i
  rette-til-status.md · #126's gate-ord røres ikke · dirigenten genstartes IKKE.
- HEGN: intet kvalitets-kompromis · Codex-gaten urørt · konservativ
  klassifikation.

## Batches (implementations-rækkefølge = bestillingens punkt-rækkefølge)

| Batch | Punkter | Filer (forventet)                                                                                                                                           |
| ----- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 1       | .github/CODEOWNERS (separat PR #150) · dirigent.mjs · tilstand.mjs · selftest                                                                               |
| 2     | 2+3     | dirigent.mjs (transport↔lås) · adapters/codex.sh (tmp+mv) · selftest                                                                                        |
| 3     | 4+11    | tilstand.mjs (spor-anker) · dirigent.mjs (spor-værn, stop-fil) · preflight.sh · stork-kaede.service · selftest                                              |
| 4     | 5+6+9   | stork-kaede.service (PATH/.nvmrc) · dirigent.mjs (varighed) · preflight.sh (mobil-tjekliste + issue-write-probe) — punkt 10 UDGÅET (Mathias-ord 2026-06-12) |
| 5     | 7+8     | adapters/code.sh (læselister/plan-diæt) · claude-ai-rolle-instruks.md (recon-FORM)                                                                          |

## Patch-først-noter (§3.1)

Alle ændringer bygger ovenpå eksisterende kæde-kode (gov-5 plan V21); ingen
eksisterende selftest-case fjernes uden afløser der bevarer garantien (eneste
erstatning: sektion 21 direkte-commit → PR-vej, runde 14-garantien bevaret som
eksplicit case). Ingen DB-/migrations-flade berøres (ren tooling).

## End-to-end-test-design

dirigent.selftest.mjs (CI-håndhævet via `pnpm kaede:selftest`) udvides pr.
punkt FØR fixet; slut-bevis er preflight grøn + fuld selftest grøn på branchen.
