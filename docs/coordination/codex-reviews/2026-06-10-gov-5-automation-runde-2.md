# Codex review — gov-5-automation runde 2

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 495f29d
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 2 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] Codex-adapter får commit-ansvar trods read-only rolle  
Konkret afvigelse: [gov-5-automation-plan.md](/home/mathias/stork-2.0/docs/coordination/gov-5-automation-plan.md:122) siger `codex.sh` kører `codex-review.sh → commit output`, mens samme plan siger Code-adapter committer Codex-output og Codex-adapter ikke må committe ([linje 89](/home/mathias/stork-2.0/docs/coordination/gov-5-automation-plan.md:89), [108](/home/mathias/stork-2.0/docs/coordination/gov-5-automation-plan.md:108)). Det bryder §9.3 read-only-grænsen og krav 6 om transport uden rolleændring.  
Anbefalet handling: V3-rettelse.

[KRITISK] Branch-protection-state er stadig ikke verificeret  
Konkret afvigelse: V2 siger selv at planen ikke er qwerg-klar uden 13a-dump ([linje 131](/home/mathias/stork-2.0/docs/coordination/gov-5-automation-plan.md:131), [217](/home/mathias/stork-2.0/docs/coordination/gov-5-automation-plan.md:217)). Læsbart branch-summary viser kun `required_status_checks`, ikke `required_pull_request_reviews`; admin protection endpoint giver 403 for bot-token. Planen må derfor ikke bygge på `require_code_owner_reviews=true` som bevaret state endnu.  
Anbefalet handling: V3-rettelse.

[KRITISK] Lokal systemd-forudsætning matcher ikke faktisk state  
Konkret afvigelse: planen angiver “systemd user-instans `running`” som verificeret afhængighed ([linje 62](/home/mathias/stork-2.0/docs/coordination/gov-5-automation-plan.md:62)), men aktuel read-only verifikation giver `systemctl --user`: `Failed to connect to bus`, `Linger=no`. Step 10’s service-hosting kan derfor ikke stå som lav risiko uden preflight/fallback.  
Anbefalet handling: V3-rettelse.

§8.1-SVAR: INGEN-MODSIGELSE
