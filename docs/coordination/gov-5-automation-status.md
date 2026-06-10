# gov-5-automation — Pakke-status

**Sidste handling:** Build B1 committet (2026-06-11): kurér-kerne — tilstand.mjs (read-only læser + rene parsere), kaede-regler.json (deklarativ routing), dirigent.mjs (ren decide() + udfoer()-effekter, transport-commit, dispatch-log, lås, divergens-STOP), dirigent.selftest.mjs (45 cases grønne) + CI-step + gitignore-værn. Dry-run-smoke fangede arv-klassen (pre-kæde-filer) → ARV-IGNORERET-regel. Codex batch-review B1 dispatchet.
**Næste forventet:** Codex B1-verdikt parallelt med Code B2 (adapters: codex.sh docs-fase, code.sh, claude-ai-rolle.sh, mathias.mjs).
**Konvergens-counter:** 7 (V6+V7 hver Mathias-tilladt)
**Blocker:** ingen — 13a udført, prefix synket.
**Klik-design (krav 3+9):** hele plan-fasen bor på denne ene branch (krav-dok V2 + plan V1..Vn + status + reviews); draft-PR giver CI uden notifikation; merges i ét hug post-qwerg — 0 Mathias-klik under iterationen.
