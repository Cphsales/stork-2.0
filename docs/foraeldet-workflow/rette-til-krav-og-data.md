# Byg-bestilling: kæde-fix-leverancen (rette-til før gov-6)

**Mandat:** Mathias-go 2026-06-11 (Option A i rette-til-oplægget). Bestillingen er
skrevet af Code (disciplin-vagt-terminalen) og startes ved at paste denne fil til
en frisk Code-terminal i `/home/mathias/stork-2.0`. Følg LÆSEFØLGE.md +
disciplin.md V5. Branch fra origin/main; kode-PR'er er beslutnings-sti
(Mathias-review). HEGN: intet kvalitets-kompromis · Codex-gaten urørt ·
konservativ klassifikation · selftest UDVIDES FØR hvert fix implementeres.

## Kontekst (evidens)

Første kæde-åbning (`qwers gov-6`, 2026-06-11 17:14) endte i KAEDE-STOP ved
første transport. Evidens: `/home/mathias/stork-arkiv/gov-6-aabning-2026-06-11/`
(dispatch-log-kopi + recon-leverancer). Fund-detaljer i memory/chat-bogføring og
dispatch-loggen selv.

## Leverancer (i rækkefølge — selftest først pr. punkt)

1. **Transport → PR-vej (GH006-fundet).** Kuréren pusher i dag transport-commits
   direkte til main → afvist af gov-4-protection. Fix: transport-commit på
   branch → PR → `gh pr merge --auto --rebase` (bogførings-sti-mønstret, bevist
   af #130/#132). Selftest: transport-vej producerer aldrig direkte main-push.
   **KRITISK FORUDSÆTNING (fundet 2026-06-11 sen aften):** recon-leverancernes
   mønstre (`docs/coordination/*-recon-kode.md`, `*-recon-research.md`,
   `*-recon-oplaeg.md`) matcher INGEN af CODEOWNERS' ni ejer-løse
   bogførings-mønstre → uden CODEOWNERS-udvidelse kræver hver transport-PR et
   Mathias-review-klik, og krav 8's 0-bogførings-klik-kriterium falder ved
   første recon-transport. Fix: føj de tre recon-mønstre til P3-blokken
   (CODEOWNERS-PR — Mathias' klik på dén ene PR er gaten; konservativt: KUN
   disse tre mønstre, alt andet ejes fortsat af default).
2. **Transport bundet til adapter-exit 0 (race-fundet).** Kuréren fyrede på
   fil-EKSISTENS mens Codex streamede (frøs 0-byte fil). Adapter-kontrakten
   siger allerede "exit 0 = leverance klar" — dirigenten skal binde transport
   til adapter-completion, ikke fil-scan. Selftest: ingen transport af fil hvis
   afsender-adapterens kørsel stadig er i gang.
3. **Atomisk adapter-skrivning (3c).** codex.sh streamer stdout direkte til
   målfilen → den findes tom fra start. Fix: tmp-fil + `mv` ved succes.
4. **Spor-attribution.** Transport-committen løb med `spor: "ingen"` trods
   qwers-anker `gov-6` → (aktoer, spor)-låsen matchede ikke. Find roden
   (tilstand.mjs's åbnings-anker anvendes ikke på transport-vejen?) og ret +
   selftest.
5. **systemd-PATH (5c).** Unit'en pinner `v24.15.0` — afled af `.nvmrc` eller
   stabil symlink, så nvm-opgradering ikke dræber kæden midt i natlig drift.
6. **0a kæde-halvdel.** Dispatch-log-entries får varighed pr. DISPATCH
   (adapter-kørselstid) — biprodukt, ingen ny ceremoni. (Manuel halvdel er
   leveret: PR #135.)
7. **4b plan-diæt + 4f opgave-klasse-læselister.** Code-adapter-prompten: under
   build læses plan SEKTIONSVIS (rækkefølge + aktuel batch); mekanik-opgaver
   (krav-dok-merge, slut-merge) får minimal læseliste i stedet for fuld
   LÆSEFØLGE. Konservativ default: fuld læsning ved recon/plan/fund.
8. **Recon-FORM-reglen (Mathias-ord, bindende).** Ind i code-adapterens
   recon-prompt + claude-ai-rolle-instruksens recon-syntese: recon leverer KUN
   findings + forretnings-spørgsmål — ALDRIG løsninger/valg-alternativer
   (løsninger hører plan-fasen).
9. **Preflight-udvidelse:** (a) mobil-MODTAGE-siden — dokumentér GitHub
   Mobile-kravet som preflight-tjekliste-punkt (Mathias bekræfter manuelt);
   (b) **issue-write-proben** (NYT FUND 2026-06-11 aften): bot-PAT'en fik 403 på
   issue-kommentar — kædens notifikations-led ville fejle ved recon-klar.
   Preflight skal VERIFICERE skrive-adgang til kæde-issuet (verificér-før-tillid),
   fail-closed hvis 403. Token-scope-fixet selv er Mathias' admin-flade.

10. **UDGÅET (Mathias-ord 2026-06-12).** 1a-koblingen i dispatch-vejen bygges
    IKKE: den automatiserer test af et prosa-doc-landskab, gov-6 udskifter
    (docs→kode/data) — ingen tråd til vision/byg. selvtjek-docs.mjs består som
    manuelt værktøj; gov-6 dømmer dens fremtid.

11. **Stale-dispatch-værnet (fund 2026-06-11 aften).** Efter KAEDE-STOP fortsatte
    dirigent-processen og dispatchede STALE leverancer (opgave `naeste-version`
    på gamle plan-runder, troskabs-tjek for pakke "ingen") — aktør-værnene
    fangede det (gate-filer + nægtede kørsler, arkiveret i evidens-mappen), men
    kuréren burde aldrig have dispatchet. Fix: (a) KAEDE-STOP dræber PROCESSEN
    (ikke kun cyklussen), (b) dispatch-validering: aldrig dispatch med spor
    "ingen" på pakke-bundne opgave-typer, (c) dispatch-loggen skal bære ALLE
    dispatches — aften-kørslerne stod ikke i loggen. Selftest pr. delpunkt,
    HERUNDER eksplicit: et allerede-behandlet åbnings-ord (fx det stående
    `qwers gov-6` på #126) genfyrer ALDRIG efter dirigent-genstart —
    behandlede-staten skal bevises mekanisk, ikke antages.
    **RODÅRSAG FUNDET (nat til 12/6, gate-PR #147 "pause-svigt"):** systemd-
    unit'en var startet og stod i auto-restart-loop — KAEDE-STOP afslutter kun
    PROCESSEN (exit 2), hvorefter `Restart=on-failure` genopliver den hvert 30.
    sekund; preflight var grøn hver gang og forhindrede intet. Fix-krav:
    KAEDE-STOP skal være PERSISTENT på tværs af genstarter (stop-fil som
    preflight/dirigent nægter at køre forbi, og/eller Restart-politik der ikke
    genopliver verdikt-exits). Selftest: stoppet kæde forbliver stoppet gennem
    service-genstart. Evidens: dispatch-loggens divergens-STOP-hale + #136/
    #138/#147 (lukket m. bogføring; gate-filer i evidens-mappen).

## Afgrænsning

- 2a model-tiering, 3a timeouts→regelbog: IKKE i denne leverance (bogført i
  `docs/coordination/gov-6-forslag-og-udskudte.md`, PR #133).
- Dirigenten genstartes IKKE efter leverancen — genåbning af gov-6 er Mathias'
  ord; preflight + selftest er beviset på leverancen.
- `qwers gov-6`-kommentaren på #126 røres ikke (gate-flade = Mathias).

## Slut-kriterium

Alle 11 punkter: selftest grøn (dirigent.selftest.mjs udvidet) + preflight grøn +
Codex-APPROVAL pr. batch + Mathias-review på PR'erne. Status føres i en
`rette-til-status.md` efter §3.5-mønstret.
