# gov-5-automation — Slut-rapport (v1 — pakke-luk afventer gov-6-beviset, krav 8)

**Dato:** 2026-06-11 (natbyg på Mathias' V21-mandat) · **Branch:** claude/gov-5-automation-build · **Merge-commit:** `ba6f4e54` (PR #125, 2026-06-11 14:35Z — mgrubak-approval → auto-merge (rebase) fyrede selv; konventionen bevist)

_Bogførings-opdatering (gov-6-perioden, bid 1 — Mathias-mandat 2026-06-11): merge-hash ført · selftest-tal → 111 (målt) · runde 44/46-observationerne indarbejdet · konvergens-historie ført til runde 52. Krav 8-sektionen står bevidst tom — udfyldes af gov-6-gennemløbet før pakke-luk._

## Formål (genfremlagt fra krav-dok)

> Denne pakke leverer: workflowet kørende automatisk fra start til slut — Mathias åbner, og Mathias lukker. Undervejs har han én fast kontrolpost — krav-dokket, forretningen, som kun han kan validere. Plan og byg valideres af rollerne; Mathias kaldes kun ind når der findes en afgørelse der er hans. Det vi bygger er grundstenen under alle fremtidige Stork 2.0-pakker, og målet er klart: sammen kan vi opnå greatness.

## Leverancer (mod krav-dok, sætning for sætning)

| Krav                                                                                            | Status                        | Leverance                                                                                                                                                                                                                                                                                                                                                             | Evidens                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1. Fuld kæde lokalt; aktørerne vækker hinanden, også Claude.ai-rollen; ingen venter på Mathias  | ✓ bygget / ⌛ bevises i gov-6 | Kurér (dirigent.mjs, poll + parallel dispatch + transport-commit) · regelbog (kaede-regler.json: typer/afsendere/events/betingelser/selvtjek) · 4 adapters inkl. claude-ai-rolle.sh (headless, Windows-appen består til dialog) · vækningsret hos aktørerne (→NÆSTE + type-inferens) · kæde-start ved qwers (åbnings-anker før markør-flip)                           | 111 selftest-cases (målt — runde 46's kørsel: 111 grønne) · live led grønt (codex-adapter end-to-end) · online dry-run · headless-auth bevist (claude -p exit 0) |
| 2. Mathias' flade: åbning/krav-validering/lukning + hans fund, mobilt; klik kun på beslutninger | ✓                             | Stående dirigent-issue #126 (qwers fra mobil) · pr.-pakke kæde-issue (gate-ord, author-verificeret) · hash-post (krav OK \<indholds-hash\> — versions-bindingen) · notifikationer/gate-anmodninger m. @mgrubak-mention · CODEOWNERS P3 (9 bogførings-mønstre, default-own består) · 13b applied (count 0; code-owner-review bærer hans stier — read-back-verificeret) | mathias.mjs · CODEOWNERS-diff (rent additiv) · 13b-dump i plan + apply-log                                                 |
| 3. Friskhed som systemkrav                                                                      | ✓                             | Gate-model: ordene er gaterne, klik er bogføring; fund-gates pauser spor til hans ord; ramme-tilladelses-mønstret (mekanik uden hans ord) praktiseret gennem V11–V21 + build-runderne                                                                                                                                                                                 | 52 review-runder m. counter bogført (ført til build-luk)                                                                   |
| 4. Løbende kvalitet — fejl fanges ved leddet, aldrig videre                                     | ✓                             | Marker-/exit-routing · betingelser → BLOKERET (aldrig advarsel) · selvtjek FØR frys (ordret-diff/tal-mod-virkelighed/konsistens-grep) · divergens-STOP · fail-closed på ukendt type/modtager/event/betingelse · baseline-guard · halvskrevet-/AFVENTER-COMMIT-værn                                                                                                    | selftest-suiten + Codex-verificerede negative cases (runde 33)                                                             |
| 5. Spille hinanden bedre — fund deles, ventetid bruges, modspil pligt                           | ✓                             | Alle §5-mekanismer filbårne m. routing MID-FASE (SPARRING, FLAG→LØS, KODE-FUND, OPTIMERING) · parallel start (qwers → Code+Codex; krav-dok-merged → plan+research) · parallel eksekvering bevist (overlap-måling)                                                                                                                                                     | regelbog + selftest                                                                                                        |
| 6. Transport, aldrig dømmekraft; gate-beskrivelsen rettes ærligt                                | ✓                             | Kuréren læser KUN tilstande/deklarationer; transport-commit ordret m. --only-isolation (tmp-repo-bevist) · disciplin §2/§6.2/Step 3/§9/topnote/footer + CLAUDE.md rettet (ratificeret indhold)                                                                                                                                                                        | Codex docs-§8.1: runde 41 fangede rest-staleness → rettet → runde 42 APPROVAL + INGEN-MODSIGELSE                           |
| 7. Fallback — manuelt flow består                                                               | ✓                             | Stop kuréren = manuelt flow (tilstandslæsning, intet mistes) · alle STOP-klasser lander i manuelt flow · preflight fail-closed (værts-krav FØR baseline)                                                                                                                                                                                                              | preflight kørt grøn (Linger=yes aktiveret)                                                                                 |
| 8. Beviset: gov-6 kører kæden; slut-rapporten bærer gennemløbet; pakke-luk efter                | ⌛ UDESTÅR                    | Denne rapport er v1 — gov-6-gennemløbs-sektionen nedenfor udfyldes med dispatch-loggen led-for-led FØR pakke-luk                                                                                                                                                                                                                                                      | —                                                                                                                          |
| 9. Den rigtige løsning — tavlen viskes ren; Mathias' billeder er retning                        | ✓                             | qwers-kædestart, ord-gates m. hash-binding, regelbogs-håndhævelse, selvtjek — alle designet fra formålet gennem 52 review-runder; Mathias' billeder (én prompt — alle i gang) er retningen, realiseret som qwers → parallel recon                                                                                                                                     | plan V1–V21-konvergenshistorien                                                                                            |

**Grundlags-deklaration (TILLÆG 1-metoden):** tabellens "✓ bygget" hviler på egen læsning af koden + selftest-kørsler; "Codex-verificeret" hviler på rollernes leverancer med præcis klasse-skelnen (runde 44-fund, rettet): eksplicit APPROVAL-leverance = runde 33, 42, 43; runde 36 og 40 er reviews m. ét status-stale-MELLEM hver (lukket i efterfølgende fixup-commits) — deres `Verificeret:`-linjer bærer den tekniske verifikation, ikke en APPROVAL-verdikt; krav 1's fulde end-to-end-virkelighed hviler på gov-6 (udestår). Ingen fuldstændigheds-garanti — dette er hvad der er holdt mod hvad.

## Stork-invariant-tjek (§7)

| Invariant              | Status                     | Evidens                                                                                                                                                                           |
| ---------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vision-overholdelse    | ✓                          | Princip 1 (én sandhed): divergens-STOP, tilstand fra rå kilder · princip 5-ånden (lifecycle): betingelser før dispatch · "Default = intet": ingen regel = ingen vej (fail-closed) |
| Permission-matrix      | n/a                        | Ingen RPC'er/DB-flader berørt (0 migrations)                                                                                                                                      |
| Audit-trigger          | n/a (kæde-pendant: ✓)      | Ingen nye tabeller; dispatch-loggen er kædens audit-spor (tilstand → regel → handling)                                                                                            |
| Konfiguration-i-data   | ✓                          | HELE kædens adfærd er deklarativ data (kaede-regler.json — Mathias-ejet fil); algoritme i kode, værdier i data                                                                    |
| End-to-end-flow        | ✓ komponent/led · ⌛ fuldt | Selftest + live led + dry-run; fuldt gennemløb = gov-6 (krav 8)                                                                                                                   |
| Anonymisering-bevaring | n/a                        | Ingen persondata berørt                                                                                                                                                           |

## Plan-afvigelser (alle flagget undervejs)

1. Selftest-mønster (`*.selftest.mjs`) frem for vitest (repo-standard; teknisk vej, Codes domæne).
2. Build-review-nummerering: runde 8–16 og 31–42 er build-runder i den globale sekvens (Mathias' "runde 8" = semantisk plan-runde; kollision dokumenteret).
3. gov-5 selv byggedes under GAMMELT flow (overgangs-klarhed, ratificeret): qwerg/re-qwerg manuelle; recon-trinnet praktiseret manuelt (Mathias-bestilling) — kædens recon-typer er leverancen, ikke processen bag den.
4. Selvtjek-mekanismen tilføjet under build (Mathias-forslag, eksplicit ord + ratificeret i V15/V16-skærpelsen).
5. Status-stale-recidiv (4× fanget af Codex): manuel status-førelse mellem runder — G-kandidat nedenfor; lukkes strukturelt når kæden selv fører status (counter-sync-selvtjekket findes allerede).

## G-numre rejst

- **G-kandidat (status-stale-klassen):** manuel pakke-status-førelse drifter under hurtig iteration; mekanisk lukning = Code-adapterens status-pligt + counter-sync-selvtjek (begge leveret) — bevises i gov-6. Føres i teknisk-gaeld ved pakke-luk hvis gov-6 ikke lukker den.

## §8.1-svar (governance-docs berørt)

Disciplin + CLAUDE.md-diff: runde 41 `§8.1-SVAR: MODSIGELSE` (notify-only-rest i topnote/footer — docs-fasen fangede den) → rettet m. tilstands-skelnen (bygget → aktiveres → bevises) → **runde 42 `§8.1-SVAR: INGEN-MODSIGELSE` + APPROVAL.**

## Konvergens-historie (sammendrag)

Plan: V1–V7 (runde 1–7, qwerg) → plan-afvigelses-fund under build (Mathias) → V8–V21 (runde 17–30, re-qwerg; 5 TILLÆG; counter 21, V11+ under ramme-tilladelse). Build: B1 runde 8–16 + 31–33 (kerne, 9+3 fund) · B2 runde 34–36 (adapters, 3 fund inkl. klippet-rapporterings-lektion) · B3 runde 37–38 (live led: runde 37 misklassificeret docs-dispatch — den live-dispatchede review selv — + runde 38 status-dump vs. runtime; fangede manglende docs-fase) · B4 runde 39–40 (preflight-trust-anchor) · B5 runde 41–42 (§8.1-MODSIGELSE → APPROVAL). Slut-rapport-lag: runde 43 (drifts-evidens, §8.1-APPROVAL) · runde 44 claude-ai FEEDBACK (APPROVAL-klasse-bogføring) → rettet → runde 45 §8.1-APPROVAL → runde 46 claude-ai APPROVAL (+ Mathias' kontinuitets-linse-APPROVAL i app-chatten). Post-slut-OK-bogføring: runde 47–51 (5 state-konsistens-fund, alle ACCEPT — læren: docs foregriber aldrig kilden) → runde 52 APPROVAL + INGEN-MODSIGELSE (konvergens ved build-luk). Hvert fund: ACCEPT m. mekanisk værn frem for tekst-pligt.

## Drifts-evidens: ukontrolleret værts-nedlukning (nat 11/6)

Værten lukkede ukontrolleret ned efter natbyggets sidste commit+push (2d5158a, 05:13). Morgen-recon i ny session (= manuelt flow, krav 7) fandt:

- **0 tab:** arbejdstræ rent, HEAD = origin, ingen halvskrevne filer (0 filskrivninger i repoet efter sidste commit), ingen efterladte git-locks/merge-state, `git fsck` ren. Commit+push-pr.-led-disciplinen betød at værts-tabet hverken kostede arbejde eller efterlod tvetydig state (krav 4: ingen delvist betroet state).
- **Fail-closed bekræftet på reel hændelse:** dispatch-loggen (runtime-state, gitignored) findes ikke efter reboot → live-guarden (runde 32-værnet) nægter kørsel indtil frisk `--baseline` via preflight (runde 39-rækkefølgen). Loggen er IKKE re-seedet under recon — aktivering er morgen-tjeklistens punkt 3 (Mathias' flade).
- **Ærlig grænse:** kæden var ikke aktiveret (systemd afventer aktivering); evidensen gælder artefakt-disciplinen og guard-mekanikken under en reel afbrydelse — ikke daemon-drift (det er gov-6, krav 8).

_(Tilføjet under morgen-recon 2026-06-11 på Mathias-forslag — en afbrudt kørsel er relevant data for kædens fail-closed-adfærd.)_

## gov-6-gennemløbet (krav 8 — UDFYLDES FØR PAKKE-LUK)

⌛ Afventer. Målekriterier (plan V21, TILLÆG 4): qwers → recon automatisk · recon-klar-notifikation uden relæ · krav-dok-dialog manuel (0 automatiserede krav-dok-skrivninger i dispatch-log) · Codex-APPROVAL → troskabs-tjek → build uden Mathias-klik · alle vækninger automatiske · Mathias' handlinger = åbning, krav OK \<hash\>, slut OK + evt. fund-gates ALENE · 0 relæ · 0 bogførings-klik. Dispatch-loggen vedlægges led-for-led.

## Morgen-tjekliste (Mathias' flade + aktivering)

_(Historisk pr. slut OK 2026-06-11 — punkt 1 effektueret (MERGED @ `ba6f4e54`); punkt 2-4: status føres i gov-5-automation-status.md; krav 8-evidensen (inkl. 11b-read-backs) bogføres i gov-6-gennemløbs-sektionen.)_

1. Build-PR **#125** — din approval (sidste klik af gammel klasse; CODEOWNERS P3 + alt ovenstående får effekt ved merge).
2. **11b's fem bevis-cases** (efter merge): governance-doc → review-krav · værn-fil → review-krav · bogførings-sti → merge på grøn CI · krav-og-data → ingen code-owner-krav · arkiv → merge på grøn CI.
3. **Aktivering:** `bash scripts/kaede/preflight.sh` → systemd-unit (install-note i unit-headeren).
4. **Denne rapport:** Claude.ai-rolle-review → dit slut OK → gov-6 åbnes fra mobilen (`qwers gov-6-arkiv-fold` på #126) → gennemløbet udfylder krav 8-sektionen → pakke-luk.

## Vision-tjek

- **Rigtig løsning eller workaround?** Rigtig: deklarativ regelbog, fail-closed overalt, ord-gates med kryptografisk binding, dømmekraft urørt hos rollerne. Ingen workarounds introduceret uden gate.
- **Vision-styrkelser:** "forretningslogik som data" anvendt på selve processen (regelbogen); én sandhed håndhævet mekanisk (divergens-STOP); Mathias' kontrol ØGET mens hans klik faldt (hash-bindingen beviser hvad han validerede).
- **Konklusion:** forsvarligt — med den ærlige grænse at fuldt bevis er gov-6 (krav 8), og pakken lukker først dér.

→NÆSTE: claude-ai-rolle [slut-rapport]
