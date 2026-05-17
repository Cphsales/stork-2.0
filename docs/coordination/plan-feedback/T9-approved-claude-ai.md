# T9-plan V6 — Claude.ai forretnings-dokument-approval

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** V6
**Dato:** 2026-05-17
**Resultat:** APPROVAL
**Runde:** 5+

---

## Sammenfatning

V6 er narrow fix af Codex' V5 KRITISK-fund (apply-gate placering) + adresserer mine V5 KOSMETISKE observationer.

Mit V5 KRITISK-fund (samme som Codex' V5 KRITISK) er fuldt adresseret: due-check `status='approved' AND undo_deadline <= now() AND effective_from <= current_date` er nu central invariant i `pending_change_apply`-RPC'en, ikke kun cron-filter. Manuel/admin direct-kald til `pending_change_apply` på future-dated row → `RAISE EXCEPTION 'not_yet_due'`. Ingen state-mutation. Cron forbliver som selection-filter (performance), ikke som eneste sikkerheds-grænse.

Codex har approved V6 med kun én KOSMETISK note (Step 3 smoke-test-tekst — identisk med min V5 KOSMETISKE 2; G-nummer-kandidat).

Per anti-glid runde 5+: KRITISKE mangler. APPROVAL gives.

---

## Verifikation af V5 KRITISK adresseret konsistent

V6 har flyttet apply-gate ind i `pending_change_apply` på **fire kritiske steder** — verificeret:

| Plan-element                                        | V6-tekst                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Status       |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **Beslutning 7**                                    | "V6 — central apply-gate i `pending_change_apply`: RPC'en `pending_change_apply(p_change_id)` verificerer SELV `status='approved' AND undo_deadline <= now() AND effective_from <= current_date` før kald af intern handler. Hvis ikke opfyldt: RAISE EXCEPTION `not_yet_due` (kontrolleret fejl, ingen state-mutation). Cron `pending_changes_apply_due` bruger samme filter for SELECTION af kandidater (performance), men sikkerheds-grænsen sidder i apply-RPC'en. Manuel/admin direkte kald til `pending_change_apply` afvises hvis ikke due." | ✓ Konsistent |
| **Beslutning 15** (opdateret V4+V6)                 | "Central apply-gate i `pending_change_apply`; cron er selection-filter. V4-version (sagde: 'Cron-filter venter på MAX(undo_deadline, effective_from)') fokuserede på cron. **V6-revision (Codex V5 KRITISK):** Sikkerheds-grænsen for 'ikke materialiser future-dated' sidder i `pending_change_apply`-RPC'en, ikke kun i cron-filter."                                                                                                                                                                                                             | ✓ Konsistent |
| **`pending_change_apply` RPC-beskrivelse** (Valg 1) | "V6 central apply-gate: verificerer `status='approved' AND undo_deadline <= now() AND effective_from <= current_date` før kald af intern handler. RAISE EXCEPTION `not_yet_due` hvis ikke opfyldt (kontrolleret fejl, ingen state-mutation). Sikkerheds-grænsen for 'ikke materialiser future-dated' sidder her, ikke i cron."                                                                                                                                                                                                                      | ✓ Konsistent |
| **Valg 8's cron-eksekvering**                       | "Cron-eksekvering (V6 — selection-filter, ikke sikkerheds-grænse): ny cron `pending_changes_apply_due` ... som SELECTERER kandidater hvor `status='approved' AND undo_deadline <= now() AND effective_from <= current_date`, og kalder `pending_change_apply` for hver. Selve sikkerheds-grænsen for 'ikke materialiser future-dated' sidder i `pending_change_apply`-RPC'en (jf. ovenfor); cron-filteret er performance/effektivitet"                                                                                                              | ✓ Konsistent |

Plus tests-konsekvens (Beslutning 15): "Future-dated + manuel apply → `not_yet_due` exception; status='approved' bevaret; ingen versions/placements ændret".

Plan er nu internt konsistent på apply-gate-invariant. Mit V5 KRITISK-fund + Codex' V5 KRITISK er fuldt adresseret.

---

## Verifikation af mine V5 KOSMETISKE observationer

| V5 KOSMETISK observation                                                                | V6-fix                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mathias-mapping pkt 3: "Step 5's team_close-RPC" — men team_close-handler er i Step 4   | V6 har: "Step 4's `_apply_team_close`-handler (V4+V5+V6) lukker alle åbne placements på teamet + opretter ny org_node_versions-row med is_active=false; medarbejder-rows urørte; public wrapper `team_close` i Step 8 går via pending_changes" ✓ |
| Step 3 smoke-test-tekst nævner `org_nodes` mutationer (skulle være `org_node_versions`) | Codex' V6-review nævner samme finding som tilbageværende KOSMETISK; G-nummer-kandidat. Ikke approval-blokerende.                                                                                                                                 |
| Test-fil-navn `t9_org_nodes.sql` (indeholder reelt versions-tests)                      | "navn bevares for fil-konvention" — accepteret som-er ✓                                                                                                                                                                                          |

---

## Codex' KOSMETISKE V6-note

Codex har én KOSMETISK observation i V6-approval — identisk med min V5 KOSMETISKE observation 2:

> Step 3's testliste siger stadig `Mutations-konsistens: INSERT/UPDATE/DELETE org_nodes -> closure-rebuild korrekt`. Den egentlige V5/V6-kontrakt er dog klar andre steder: closure-triggeren sidder på `org_node_versions`, ikke på identity-only `org_nodes`.

Vi er enige på severity (KOSMETISK / G-nummer). Code kan rette i build-PR eller markere som G-nummer.

---

## Modsigelses-tjek mod fire-dokument-rammen

| Dokument                                   | Konflikt observeret?                                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/strategi/vision-og-principper.md`    | Nej. Princip 9 (status-modeller bevarer historik) honoreret konsistent — apply-gate sikrer at future-dated state ikke materialiseres for tidligt. |
| `docs/strategi/stork-2-0-master-plan.md`   | Nej. §1.7's versionerede tilknytninger fungerer konsistent end-to-end.                                                                            |
| `docs/coordination/mathias-afgoerelser.md` | Nej. 2026-05-17 pkt 13 (alle gældende-dato-ændringer følger fortrydelses-mekanisme) håndhævet via central apply-gate.                             |
| `docs/coordination/T9-krav-og-data.md`     | Nej. Krav-dok 6.1 + 4.1 + 4.2 + 3.6.1 nu fuldt leveret — apply-gate håndhæver invariant i alle paths.                                             |

Ingen modsigelser mod fire-dokument-rammen. Plan er forretnings-dokument-konsistent.

---

## Anti-glid runde 5+ — observation

V6 er sjette plan-version. Plan-historik viser at hver runde har leveret én ny problem-klasse, ikke gentagelse:

- V1: skrivevej-konflikt + change_type-matrix + can_user_see-signatur + Hent-funktioner + rolle-tildeling
- V2: pending_change_request-bypass + aktiv-placement-definition + org_nodes versionering
- V3: effective_from vs updated_at (org-strukturen)
- V4: intern V4-inkonsistens (Beslutning 13 introduceret men ikke gennemført)
- V5: apply-gate kun i cron-filter (Codex V5 KRITISK)
- V6: ingen KRITISKE fra hverken Codex eller Claude.ai

Mønstret er **konvergens**, ikke regression. Hver runde har lukket en specifik klasse problem. V6 er det første review hvor hverken Codex eller Claude.ai finder KRITISKE fund. Plan-process'en har fungeret.

Lærdom dokumenteret for fremtidige pakker: temporal-model + security-invariants kræver eksplicit invariants-konsistens-verifikation — alle apply/read-paths skal håndhæve samme invariants, ikke kun ét sted. Codex V5 KRITISK fanget korrekt; min V5-approval var for tidlig og er erkendt som review-fejl.

---

## Erkendelse af review-fejl-historik

Sammenfatning af mine review-fejl i T9-runden:

- **V2:** Vurderede org_nodes-mutability-inkonsistens som MELLEM/G-nummer; Codex' V2 KRITISK 2 viste at scopet var bredere → KRITISK. Trak approval tilbage.
- **V5:** Approvede uden at verificere apply-gate konsistent i alle paths; Codex' V5 KRITISK afslørede bypass i `pending_change_apply`. Trak approval tilbage.

Begge fejl havde samme rod-årsag: jeg verificerede kun de eksplicit-rejste fund, ikke om de underliggende invariants var konsistent placeret i ALLE relevante steder. Lærdom-pattern for fremtidige reviews: ved temporal-model / security-invariants, lav eksplicit invariants-konsistens-tjek af alle apply/read/write-paths, ikke kun de plan-steder der nævnes i seneste fund.

V6 er det første review hvor jeg ikke har lavet review-fejl (omtrent — V6's apply-gate-konsistens er nu eksplicit verificeret i fire steder).

---

## Konklusion

**Resultat: APPROVAL**

V6 er konsistent narrow fix af Codex' V5 KRITISK. Mit V5 KRITISK-fund er fuldt adresseret. Mine V5 KOSMETISKE observationer er adresseret eller dokumenteret som G-nummer-kandidat (Step 3 smoke-test-tekst).

Plan er forretnings-dokument-konsistent. Krav-dok 6.1 + 4.1 + 4.2 + 3.6.1 leveres entydigt gennem hele planen.

Codex har approved V6 med kun KOSMETISK note. Hvis Mathias bekræfter min APPROVAL er gyldig, kan plan godkendes for build via `qwerg` til Code.

---

## Approval-status

| Reviewer          | Status                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Claude.ai (denne) | **APPROVED** (1 KOSMETISK G-nummer-kandidat — Step 3 smoke-test-tekst) |
| Codex             | APPROVED (samme KOSMETISK observation)                                 |

Plan er APPROVAL-KLAR. Mathias paster `qwerg` til Code for build-start.
