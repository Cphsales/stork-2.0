# recon/spor — arbejds-spor for lokations-skabelon Fase 1 (arkiveret 2026-09-02)

Arkiveret EFTER workdir-oprydning (lærdommen der udløste arkiverings-reglen i
plan Fase 1) — derfor ufuldstændigt, ærligt deklareret:

**Bevaret:**
- `konsolideret.json` — consolidateRecon-output (216 fund-id'er, 77 konflikter,
  29 usikkerheder) som `recon/recon.md` + `recon-2-bilag.md` er deterministisk
  renderet fra (byte-identitet verificeret, commit 3f49d891).
- `kandidat-claude-ai.json` — recon-Claude.ai's fulde kandidat (33 fund,
  51-punkts flade-enumeration, 15 usikkerheder) @ bundle cde07ec7.
- `surface-309.json` — den fulde mekaniske derivation @ launch-commit
  (deriveSurface; genskabes deterministisk med coverage.mjs).

**Tabt (workdir-oprydning før arkivering):** recon-Code- og recon-Codex-
kandidaterne (182/78 fund) + devil-output-filerne. Deres substans overlever i
konsolideret.json (alle fund, aktør-mærket); devil-konklusionerne (PASS begge
akser, filter-fundet p0) står i `recon/recon-coverage-proof.json` +
commit-historikken (86def88 → 32738fd → 5a7f068).

Slettes ved lukke-PR (Fase 6); git-historikken bevarer sporet.
