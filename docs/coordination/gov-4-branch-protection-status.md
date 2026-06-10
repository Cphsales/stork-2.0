# gov-4-branch-protection — Pakke-status

**Sidste handling:** qwerg 2026-06-10 → build batch 1: (i) ADMIN_HANDLE capturet FØR alt auth-arbejde (R4-1-protokol; gemt udenfor repo i ~/.stork-gov4-admin-handle — kan ikke stå her pga. hook-låsen); (ii) G061-migration `20260610190000_gov4_g061_comment_paritet.sql` + G061 → LØST; (iii) step 3 udført på qwerg-mandat: required check `Lint, typecheck, test, build` (strict) aktiv — verificeret via API. Codex batch-review dispatched.
**Næste forventet:** BLOKERET PÅ MATHIAS (step 1-handlinger): (1) opret bot-GitHub-bruger (default ved tavshed: `stork-code-bot`); (2) invitér den til Cphsales-org'en med WRITE på stork-2.0 (ikke admin); (3) generér fine-grained PAT (contents RW + pull-requests RW) og udlevér; (4) hook-valg: (a) midlertidig unlock eller (b) regex-præcisering (handle+`/`). Derefter: Code auth-skift + assert → CODEOWNERS-PR (step 2, m. dobbelt gyldigheds-gate) → step 4 (required review) → step 5 (docs + H026-luk + Claude.ai-forfattet banner).
**Konvergens-counter:** 5 (afsluttet — konvergeret ved runde 5-APPROVAL; pause ophævet af Mathias, valg a). Fund-kæde: 4 → 2 → 1 → 1 → 0.
**Aktuel blocker:** Mathias' bot-setup + hook-valg (step 2/4/5 venter; intet mere Code kan bygge).

Noter:

- Pakke-åbning Mathias 2026-06-10: "gov-4 — branch protection (CI + code-owner-review required). H026 skal løses i planen før required review aktiveres."
- Krav-grundlag: ekstrakt-dok (peger på fælles governance-vagt-krav-og-data.md pkt 4 + D2 + H026).
- 1 migration (G061-opsamling, fund R1-3). Kerne-afgørelser i plan: machine-user-bot (H026) + CODEOWNERS-fix
  (org-konto er ugyldig som code owner — recon-fund).
- TRE åbne spørgsmål til Mathias ved qwerg: bot-navn/accept + commit-konventions-skifte + hook-lås vs CODEOWNERS-write (unlock eller regex-præcisering).
