# Codex review — gov-5-automation runde 17

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 073190d
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 17 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[MANGLENDE-EKSISTERENDE-BEVARELSE] V8 mangler patch-først for eksisterende B1-kædekode  
Konkret afvigelse: Planen genåbner `scripts/kaede/kaede-regler.json` events, `afledEvents` og event-fixtures under qwers-start (plan linje 331-344), og implementations-rækkefølgen ændrer kædekerne/routing/tests (linje 213-219). Men patch-først-sektionen dækker kun P1-P6: `disciplin.md`, CODEOWNERS, `codex-review.sh`, CLAUDE.md m.m. (linje 244-272). Der er ingen nuværende body 1:1 + eksplicit diff for de B1-værn, der allerede findes og skal bevares/reworkes. Det er præcis M-E-B-risiko: gate-deadlock-fix, transport-commit-isolation, exit-0-idempotens og event-idempotens kan tabes uden planlagt diff.  
Anbefalet handling: V9-rettelse.

[KRITISK] Recon-oplæggets routing er internt modstridende  
Konkret afvigelse: Leverance-tabellen siger `recon-oplaeg` kører “ved qwers — parallel” (linje 110), men kæde-starten kræver Code+Codex recon først og Claude.ai syntese bagefter (linje 115), og regelbogs-håndhævelsen kræver begge kode-recon-docs før `claude-ai-syntese-dispatch` (linje 175). Hvis linje 110 bliver implementeret ordret, kan Claude.ai køre uden input og bryde krav 9’s anti-tunnelsyn/recon-begrundelse.  
Anbefalet handling: V9-rettelse.

B1-verifikation: generiske B1-dele kan bevares; event-fladen (`qwers-aabning`, `krav-dok-merged`, fixtures) skal reåbnes som planen selv markerer. `afledEvents` holder kun betinget; den skal patch-først-behandles i V9.

§8.1-SVAR: INGEN-MODSIGELSE
