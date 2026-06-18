# Build 1.1 — HANDOFF (dag-slut 2026-06-18)

> Formål: nye terminaler i morgen fortsætter **uden konteksttab eller gæt**. Læs dette + memory `project_stork_build1_recon.md` FØR du rører noget. **Ingen build før PR #173 er godkendt/merged.**

## 1. Aktuel status

- **PR #172 — MERGED** til `main @ 9ad386c`: oprindelig Build 1.1-plan (`docs/coordination/workflow-faerdiggoerelse-build-1.1-plan.md`). Merget på Mathias' »plan ok«.
- **PR #173 — DRAFT** (branch `claude/build-1.1-1.2-split`): split-opdatering — **Build 1.1 = M2 runtime/acceptance uden app-chat-recon · Build 1.2 = S1l Claude.ai app-chat-recon · Plan 2 først efter begge grønne.** Ingen merge.
- **PR #173 skal Codex-reviewes via git (egen kanal)** før byg fortsætter. Gate-regel: Codex APPROVAL kun efter egen git-læsning, aldrig paste.
- **A1/A2/acceptance-register-kode er PAUSET** i `git stash` på branch `claude/build-1.1-pr1-runtime-bro`. Genskab: `git checkout claude/build-1.1-pr1-runtime-bro && git stash pop` (stash@{0}).
- **Ingen build-PR må fortsætte før PR #173 er godkendt/merged.**

## 2. Build 1.1 scope (efter split) — M2, uden app-chat-recon

- **A1** `scripts/kaede` ↔ `workflow/` til ÉN runtime-sandhed (workflow autoritativ; kaede = motor; divergens → BLOKER).
- **A2** Code→Codex reel actor-channel (headless `codex exec`, committet prompt, committet SHA-bundet artefakt; gaten beregner `computedArtifactSha`).
- **A3** headless `claude -p` som Claude.ai gate-aktør (verdikt-kanal; **ikke** S1l chat-recon).
- **A4** S15 minimum-inventory grøn FØR recon.
- **A5** reel recon (forretnings- + kode-recon + dokument-recon) **uden app-chat-recon** → committet hash'et recon-sandhed.
- **A6** kravspec fra recon-hash.
- **A7** gates (S8/S9) fra **reelle** actor-artefakter (tre AI: Code/Codex/Claude.ai; Mathias sidst), ikke literals.
- **A8** S11 reel master-plan snapshot/diff.
- **A9** S15 final docs grøn (`--gate` hard-wired).
- **A10** M2 runtime-acceptance: reel committet testpakke uden fixtures + F01–F26.
- **Acceptance-register** F01–F26 (`workflow/acceptance-register.json`); **S1l/app-chat-recon flyttet til Build 1.2** (ikke i M2).

## 3. Build 1.2 scope — den rigtige S1l-kanal

- Reel Claude.ai app-chat-recon/S1l-kanal. **ÅBEN FAKTA der afgør kanalen: er claude.ai Enterprise eller Pro/Max?**
  - **Enterprise → Compliance API** (`/v1/compliance/apps/chats` + `/messages`, key `read:compliance_user_data`; kilde-ankret href/dato/tråd, dato-filtrerbar).
  - **Pro/Max → struktureret eksport-reader** (Settings>Privacy>Export → ZIP-JSON m. chat-URL+timestamp; semi-manuel, men kilde-ankret).
  - Afvist: `/remote-control`, `/teleport` (kun Claude Code-session); løs copy/paste/paraphrase uden kildeanker.
- **Acceptance:** ukildet chat-påstand → **FAIL** · ignoreret chat-beslutning → **FEEDBACK/FAIL** · modsigelse mod låst doc uden `tilMathias` → **FAIL** · relay-snyd (paraphrase, ikke bundet til reel kilde) → **FAIL**.

## 4. Stopregler (bindende)

- **Plan 2 må ikke starte** før **Build 1.1 M2-acceptance grøn OG Build 1.2 S1l-acceptance grøn.**
- Structural/selftests må **aldrig** tælle som acceptance.
- Fixtures/literals må **aldrig** gøre build grøn.
- Code-transport/orkestrator må **aldrig** skrive/ændre actor-verdikter (F23).
- `workflow/` er autoritativ state; `scripts/kaede` er transport-motor.

## 5. I morgen — første trin (rækkefølge)

1. **Codex reviewer PR #173** via egen git-kanal (læs filen fra branchen, ikke paste).
2. Hvis **APPROVAL** → Mathias kan godkende/merge #173.
3. Derefter **pop stash** på `claude/build-1.1-pr1-runtime-bro` (`git stash pop`).
4. **Første build-PR = A1 + A2 + acceptance-register-skelet** (én vertikal skive), **ikke** hele A1–A10. Codex-review via egen kanal; ingen merge uden Mathias' ord.

---

_Status: UDKAST, uncommitted. Committes kun på Mathias' ord. Primær kontinuitet ligger også i memory `project_stork_build1_recon.md` (auto-load)._
