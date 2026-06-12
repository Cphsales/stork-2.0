# Codex review — rette-til runde 1

**Pakke:** rette-til
**Fase:** build
**Plan-fil:** docs/coordination/rette-til-plan.md
**Plan-SHA:** 79fa95e
**Fil-hash (reviewet indhold):** 09ad5e0a71c9a8ab8c8162d30a186053f0f1b1ec
**Fil-tilstand:** ren
**Dato:** 2026-06-12
**Reasoning:** xhigh
**Model:** gpt-5.5
**Varighed:** 221s
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/rette-til-plan.md 1 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Transport-idempotens kan skjule manglende PR/auto-merge  
Konkret afvigelse: `transportCommit()` returnerer `afventer-merge` alene fordi remote-branchen findes ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:301)). Hvis `gh pr create` eller `gh pr merge --auto --rebase` fejler efter push, står der en branch uden bevist PR/auto-merge, og næste cyklus stopper ikke. Det realiserer ikke kravets “branch → PR → auto-merge”-spor end-to-end.  
Anbefalet handling: [V2-rettelse] Ved eksisterende transport-branch: verificér PR findes og auto-merge er armeret, eller forsøg at oprette/arme igen. Hvis det ikke kan bevises, `KAEDE-STOP`.

[KRITISK] CODEOWNERS-forudsætningen er ikke faktisk state i denne branch  
Konkret afvigelse: `erBogfoeringsSti()` klassificerer recon-filer som ejer-løs bogføring ([tilstand.mjs](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:148)), men branchens `.github/CODEOWNERS` har stadig kun de ni gamle mønstre ([CODEOWNERS](/home/mathias/stork-2.0/.github/CODEOWNERS:17)). Krav-dok kalder recon-mønstrene en kritisk forudsætning for 0-bogførings-klik. Separat PR findes, men den er ikke på `origin/main`; batchen kan derfor merge kode der antager en GitHub-regel, som endnu ikke håndhæves.  
Anbefalet handling: [V2-rettelse] Gør CODEOWNERS-PR’en til hård forudsætning før denne branch, eller inkluder/rebasér efter den, så helper og GitHub-værn igen matcher faktisk state.

Kørt: `pnpm kaede:selftest` og `pnpm governance:check` grønne.
