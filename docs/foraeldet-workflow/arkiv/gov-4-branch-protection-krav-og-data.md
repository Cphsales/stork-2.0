# gov-4-branch-protection — Krav-og-data

**Type:** Pakke-ekstrakt af det fælles gov-krav-dok + Mathias' pakke-åbning
**Dato:** 2026-06-10

> **Ærlig note (jf. gov-docs-renhed-præcedens):** Code-draftet ekstrakt — intet
> nyt forretnings-indhold. Kilderne er (1) det fælles gov-krav-dok
> `governance-vagt-krav-og-data.md` pkt 4, (2) D2 fra gov-docs-renhed-krav-dok'en
> ("gov-4 kræver både CI-status og code-owner-review"), (3) Mathias'
> pakke-åbning 2026-06-10 ("H026 skal løses i planen før required review
> aktiveres") og (4) [H026] i huskeliste.md. Ingen forretnings-afgørelse er
> truffet af Code.

## Formål

> Denne pakke leverer: bindende gates på main — required CI-checks og required
> code-owner-review — så intet kan merges uden om processen, med
> approval-mekanikken (H026) løst før required review aktiveres.

## I scope

1. Required status checks på main udfyldes (CI inkl. governance:check +
   selftest skal være grøn før merge). _(fælles gov-krav pkt 4; D2.)_
2. Required code-owner-review (≥ 1 approval) aktiveres. _(D2.)_
3. **H026 løses FØRST:** approval-mekanik så Mathias reelt kan approve — Code
   må ikke optræde som PR-author under Mathias' konto når review bliver
   required. Mekanikken er Codes bord i planen. _(Mathias 2026-06-10; H026.)_
4. CODEOWNERS bringes til at virke — fund under recon: ejer-referencen peger på
   organisationen (ugyldig som code owner), ikke på Mathias' bruger. _(Code-recon
   2026-06-10; følger af D2 — uden fixet er code-owner-review virkningsløst.)_

## IKKE i scope

- gov-5 automation (Codex-runner, auto-merge, plan-branch-trigger).
- gov-6 arkiv-fold.
- Stamme-doc-banner-opdatering FORFATTES ikke af Code (forfatterregel §8.1) —
  koordineres som Mathias/Claude.ai-leverance, Code committer ordret.

## End-to-end-test-design

Branch protection kan ikke selftestes i CI (checken kan ikke teste sin egen
gate). Verifikations-protokol med dokumenterede outputs i slut-rapporten:
(a) direkte push til main → afvist; (b) PR med rød CI → merge blokeret;
(c) PR uden Mathias-approval → blokeret; (d) PR med approval + grøn CI →
mergeable. (a) er allerede observeret 2026-06-10.

## Åbne spørgsmål

- _(Mathias, ved qwerg)_ Bot-konto-navn + accept af machine-user-tilgangen
  (planen anbefaler machine user frem for GitHub App — begrundelse i plan).
