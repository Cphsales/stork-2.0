# gov-5-automation — Pakke-status

**Sidste handling:** Codex APPROVAL på plan V4 (runde 4, 2026-06-10) — plan-fasen er Codex-godkendt.
**Næste forventet:** qwerg-gaten: (1) Mathias-mandat til 13a protection-dump → dump ind i plan, (2) krav-dok-Formål-prefix fornys, (3) Claude.ai leverer qwerg-gate-pakke (§9.1), (4) Mathias læser + paster qwerg → branch merges samlet → build.
**Konvergens-counter:** 4 (afsluttet m. APPROVAL)
**Blocker (før qwerg, ikke for iteration):** (1) step 13a protection-dump kræver Mathias-mandat (admin READ af branch-protection — rå dump skal stå i planen før qwerg). (2) Format-punkt: krav-dok-Formål mangler `> Denne pakke leverer:`-prefix (structural-chain-krav ved markør-flip) — Mathias/Claude.ai fornyer linjen, indhold uændret.
**Klik-design (krav 3+9):** hele plan-fasen bor på denne ene branch (krav-dok V2 + plan V1..Vn + status + reviews); draft-PR giver CI uden notifikation; merges i ét hug post-qwerg — 0 Mathias-klik under iterationen.
