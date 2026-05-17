# T9-plan V5 — Claude.ai approval (TRUKKET TILBAGE 2026-05-17)

**Status: APPROVAL TRUKKET TILBAGE**

Min oprindelige V5-approval verificerede at V4's 6 inkonsistens-punkter var rettet — det var de. Men jeg overså at apply-grænsen (cron-filterets `effective_from <= current_date`-clause fra Beslutning 15) ikke er konsistent placeret i ALLE apply-paths. Codex' V5 KRITISK-fund (`T9-V5-codex.md`) afslører at `pending_change_apply` (manuel/admin-vej) er bypass.

Det modsiger krav-dok 6.1 + 4.1 + 4.2 fordi apply-paths kan materialisere future-dated state før gælder-dato.

**Den gældende position er:** `docs/coordination/plan-feedback/T9-V5-claude-ai.md` (FEEDBACK — KRITISK).

Plan-V5 er KRITISK-blokeret af både Codex og Claude.ai. V6 forventes — eller plan kan pauses for genovervejelse (5. KRITISK-iteration; Mathias afgør).

**Erkendelse af review-fejl:** Mit V5-approval-tekst sagde "Krav-dok 6.1 + 4.1 + 4.2 + 3.6.1 nu entydigt leveret efter V5-sweep" — det var for tidligt at sige. Korrekt verifikation ville have inkluderet sammenligning af Beslutning 7's cron-tekst og Beslutning 15's cron-filter (de er inkonsistente) + tjek at `pending_change_apply` håndhæver samme due-check som cron.

Lærdom: ved temporal-model-invariants (effective_from / version-boundary / due-check), verificer at ALLE apply-paths håndhæver samme invariants, ikke kun ét sted.

Lignende mønster som V2 hvor jeg undervurderede severity af effective-date-problemet.

---

Se `T9-V5-claude-ai.md` for konkret feedback og STOP-rapportering til Mathias.
