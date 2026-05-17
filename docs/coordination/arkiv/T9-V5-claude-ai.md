# T9-plan V5 — Claude.ai forretnings-dokument-feedback (ERSTATTER tidligere V5-approval)

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** V5
**Dato:** 2026-05-17
**Resultat:** FEEDBACK — KRITISK
**Erstatter:** `T9-V5-approved-claude-ai.md` (approval trukket tilbage)
**Runde:** 4+

---

## Begrundelse for tilbagetrækning af approval

Min V5-approval verificerede at V4's 6 inkonsistens-punkter var rettet. Det var de — V5-sweep'en er korrekt udført.

Men jeg overså at apply-grænsen (cron-filterets `effective_from <= current_date`-clause fra Beslutning 15) ikke er konsistent placeret i ALLE apply-paths. Codex' V5-fund afslører at:

- **Beslutning 7** beskriver cron som `status='approved' AND undo_deadline <= now()` — uden effective_from-clause
- **Valg 8's cron-kontrakt** gentager samme filter uden effective_from
- **`pending_change_apply(p_change_id)`** beskrives som manuel/admin-apply uden krav om effective_from-check
- **Step 8-testen** bruger direkte `pending_change_apply` for at undgå cron-ventetid

Konsekvens: den centrale apply-funktion kan apply'e future-dated rows for tidligt. Cron-filteret er kun ÉT sted hvor due-check sker; manuel/admin-vej er bypass.

Det modsiger krav-dok 6.1 + 4.1 + 4.2 fordi apply-paths kan materialisere future-dated state før gælder-dato. Samme klasse problem som V2's `effective_to IS NULL`-bypass og V3's `pending_change_request`-bypass.

Per Modsigelses-disciplin: plan-blokerende. KRITISK.

Min V5-approval var for lempelig. Trækkes tilbage.

---

## Erkendelse af review-fejl

Mit V5-approval-tekst sagde:

> "Krav-dok 6.1 + 4.1 + 4.2 + 3.6.1 nu entydigt leveret efter V5-sweep"

Det var for tidligt at sige. Korrekt verifikation ville have inkluderet sammenligning af Beslutning 7's cron-tekst og Beslutning 15's cron-filter — de er inkonsistente. Beslutning 7 nævner kun undo_deadline; Beslutning 15 nævner begge.

**Lærdom:** Når arkitektur-beslutning specificerer "apply venter på BÅDE X OG Y", verificer at både X og Y er håndhævet i ALLE apply-paths (cron + manuel + admin), ikke kun ét sted. Det skal eksplicit kontrolleres som del af konsistens-tjek.

Lignende mønster som V2 hvor jeg undervurderede severity af effective-date-problemet. Lærdom: ved temporal-model-fund (effective_from / version-boundary / due-check), vurder altid at alle apply-/read-paths håndhæver samme invariants. Hvis ÉT path mangler invariant, er det bypass-finding på samme niveau som de tidligere.

---

## Min KRITISK-finding (bekræfter Codex' V5 KRITISK fra forretnings-dokument-perspektiv)

### [KRITISK] `pending_change_apply` (manuel/admin) håndhæver ikke effective_from-due-check

**Konkret afvigelse:**

Beslutning 15 (V4) specificerer:

> "Apply-cron udfører kun pending_changes hvor BÅDE undo_deadline (fra approve_at + undo_period) OG effective_from (fra pending.effective_from) er passeret."

Men due-check er kun specificeret som CRON-filter, ikke som invariant i den centrale `pending_change_apply`-funktion. Plan-tekst er internt inkonsistent:

- **Beslutning 7** (Cron-filter): `status='approved' AND undo_deadline <= now()` — mangler effective_from
- **Beslutning 15** (Cron-filter): `status='approved' AND undo_deadline <= now() AND effective_from <= current_date` — har begge
- **Valg 8** (Cron-kontrakt): "flytter approved-rows til applied når `undo_deadline <= now()`" — mangler effective_from
- **`pending_change_apply` RPC-beskrivelse:** "flytter approved→applied; kalder intern handler. Eksekveres af cron eller manuelt af admin" — ingen due-check-invariant
- **Step 8-test:** bruger `pending_change_apply` direkte for at undgå cron-ventetid — ville apply'e future-dated for tidligt hvis kaldt på sådan en row

**Konsekvens — forretnings-dokument-brud:**

Hvis admin manuelt kalder `pending_change_apply` på en future-dated pending_change (fx fordi `cron pauset af incident` og admin manuelt apply'er hængende changes for at unblock), så vil:

- Apply-handler skrive ny org_node_versions-row med `effective_from = <future>` og `effective_to = NULL`
- Aktiv-placement-filter (`effective_from <= current_date AND ...`) returnerer den nye row korrekt som "ikke aktiv endnu"
- MEN: hvis admin senere sletter pending_change eller noget andet sker, kan state være inkonsistent
- OG: hvis future-dated change var i `current_date <= effective_from < tomorrow`, vil den blive aktiv FØR den skulle

Værre: hvis Step 8-test apply'er på future-dated row for at teste, vil teste demonstrere at apply fungerer, men i produktion kan samme path bruges utilsigtet.

**Krav-dok-konsekvens:**

- **Krav-dok 6.1** ("Gammel sandhed ændres ikke af ny sandhed"): bypass i pending_change_apply gør ikke garantien håndhævet
- **Krav-dok 4.2** ("Hent placering aktuelt"): kan returnere future-dated row som "aktuel" hvis admin har manuelt apply'et for tidligt
- **Krav-dok 4.1** ("Hent træ"): samme; træ-state kan vise future-dated structure

**Per Modsigelses-disciplin:** plan-blokerende. KRITISK feedback.

**Anbefalet handling: V6-rettelse** (matcher Codex' anbefaling)

Flyt invariantet ind i `pending_change_apply` som central gate:

- `pending_change_apply` må kun apply'e rows hvor `status='approved' AND undo_deadline <= now() AND effective_from <= current_date`; ellers returnerer kontrolleret fejl/no-op uden state-mutation
- Opdatér Beslutning 7, Valg 8 og Step 1 så alle apply-kontrakter bruger samme due-definition
- Cron-filter forbliver som performance/selection-filter, men ikke eneste sikkerhedsgrænse
- Smoke-test for direkte manuel `pending_change_apply` på future-dated row: status forbliver approved, applied_at forbliver NULL, ingen versions/placements ændres

---

## Modsigelses-tjek mod fire-dokument-rammen (re-verifikation)

| Dokument                                   | Konflikt observeret?                                                                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/strategi/vision-og-principper.md`    | **Indirekte konflikt.** Princip 9 (status-modeller bevarer historik) brudt af bypass i pending_change_apply.                                                        |
| `docs/strategi/stork-2-0-master-plan.md`   | Master-plan §1.7's versionerede tilknytninger forudsætter konsistent apply-gate; bypass underminerer det.                                                           |
| `docs/coordination/mathias-afgoerelser.md` | **Indirekte konflikt.** 2026-05-17 pkt 13 (alle gældende-dato-ændringer følger fortrydelses-mekanisme) brudt fordi bypass kan materialisere change før gælder-dato. |
| `docs/coordination/T9-krav-og-data.md`     | **Konflikt.** Krav-dok 6.1 + 4.1 + 4.2 ikke entydigt leveret pga. bypass.                                                                                           |

---

## STOP-rapportering til Mathias

Per V5-planens egen disciplin-note i konklusion:

> "Hvis V5 stadig har inkonsistens: STOP og rapportér til Mathias (det er 4. KRITISK-iteration; videre runder kan signalere at planen kræver fundamental re-tænkning)."

Vi er nu på **5. KRITISK-iteration** (V1: 2 KRITISKE; V2: 2 KRITISKE; V3: 1 KRITISK; V4: 1 KRITISK; V5: 1 KRITISK). Plan har konsekvent samme problem-klasse: temporal-model/security-invariants placeres på ét sted i planen men ikke alle apply-paths.

Mønstret antyder at problemet ikke er i selve arkitekturen (Beslutning 11+12+13+14+15 er rigtige), men i HVORDAN planen verificerer at invariants er placeret konsistent ALLE relevante steder. Code's plan-process fanger ikke gap'en mellem "én sektion specificerer invariant" og "alle apply/read-paths håndhæver invariant".

**Anbefaling til Mathias:**

V6 kan rette dette specifikke fund. Men før V6 bør Mathias overveje:

1. **Skal Code's V6 inkludere systematisk invariants-tabel?** En tabel der lister hvert invariant (fx "apply venter på undo*deadline + effective_from", "authenticated kan ikke EXECUTE \_apply*\*", "current placement = effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)") og for hvert: ALLE plan-steder + tests + fitness-checks der håndhæver det. Det ville fange gap'en før review.

2. **Skal planen pauses for genovervejelse?** 5. iteration af samme problem-klasse kan signalere at plan-process'en mangler eksplicit verifikations-disciplin for invariants-konsistens. Eventuelt værd at adressere i selve plan-skabelonen.

3. **Skal Code's V6 være "konsistens-sweep-only" som V5?** Hvis ja, så er V6 kun rettelse af 4 plan-steder + tilføjelse af invariants-tabel. Det er trivielt at gennemføre korrekt.

Mathias afgør.

---

## Forhold til Codex' V5 KRITISK-fund

Codex' V5 KRITISK 1 dækker samme problem som min nuværende KRITISK-finding. Vi er enige på severity og anbefalet handling.

Codex' tekniske analyse er fyldig (linje-referencer til konkrete plan-steder); min forretnings-dokument-analyse fokuserer på krav-dok-konsekvensen. Sammen dækker vi fundet fra begge perspektiver.

---

## Konklusion

**Resultat: FEEDBACK — KRITISK**

Min V5-approval trækkes tilbage. V5 har én KRITISK forretnings-dokument-modsigelse (apply-gate ikke entydig) der bryder krav-dok 6.1 + 4.1 + 4.2.

V6 forventes med konkret rettelse — flyt due-check (`effective_from <= current_date`) ind i `pending_change_apply` som central invariant. Cron-filter er ikke eneste sikkerhedsgrænse.

**Erkendelse af review-fejl:** Mit V5-approval verificerede V4-fundenes adressering men overså at apply-grænsen ikke er entydigt placeret. Lærdom: ved temporal-model-invariants, verificer at alle apply-paths (ikke kun cron) håndhæver samme due-check.

**Stop-rapportering:** Vi er på 5. KRITISK-iteration. Per plan-konklusionens egen disciplin-note skal jeg STOPPE og rapportere til Mathias. Mønstret (invariants-gap mellem én sektion og alle paths) antyder at plan-process'en mangler eksplicit invariants-konsistens-verifikation. Mathias afgør om V6 skal lave systematisk invariants-tabel, eller om planen skal pauses for genovervejelse.

---

## Approval-status

| Reviewer          | Status                                               |
| ----------------- | ---------------------------------------------------- |
| Claude.ai (denne) | **FEEDBACK — KRITISK** (V5-approval trukket tilbage) |
| Codex             | FEEDBACK — KRITISK (apply-gate bypass)               |

Plan er KRITISK-blokeret af begge reviewere. STOP-rapportering til Mathias.
