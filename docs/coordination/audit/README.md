# Audit-rapporter

Sandheds-konsistens-audits af repo'ets dokument- og kode-state. Én fil pr. audit-runde, navngivet `audit-<aktør>-<dato>.md` (fx `audit-code-2026-05-15.md`, `audit-codex-2026-05-15.md`).

**Scope pr. audit:**

- LAG 1: Sandheds-konsistens — dokument modsiger dokument/kode/setup/status
- LAG 2 (uden for scope): bugs, sikkerhedshuller, logiske fejl (det er review, ikke audit)

**Parallel-audit-konvention:** Når Mathias kører dybde-audit, leverer Code og Codex uafhængige rapporter UDEN at se hinandens fund. Konvergens vs divergens måler defensive blinde pletter.

Append-only struktur. Audits flyttes ikke til arkiv — bevares som historik for hvilke sandheds-fund der eksisterede på hvilket tidspunkt.
