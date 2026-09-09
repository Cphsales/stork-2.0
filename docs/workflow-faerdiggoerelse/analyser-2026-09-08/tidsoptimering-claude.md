# Tidsoptimering af v5-fabrikken — analyse (Claude-agent, læse-adgang, 2026-09-08, ~16 min, 65 værktøjskald)

**Kilder læst:** hele planen (321 linjer), 9 rolletekster, actors.lock, gates/verdikt/hooks/driver/preflight/gate-eval, alle 25 filer i `plan-build/lokations-skabelon/`, `recon/`, driverens `tmp/fase2/` (INSTRUKS, verdikt-byg, audit-, devil-output), og driverens to session-transkripter (Fase 1 13/8 og Fase 2 2/9–8/9) for de faktiske aktør-kald med tidsstempler.

**Fire fakta fra briefen efterprøvet:**
- **Code ∥ Codex inden for en runde: JA, allerede parallelt.** Code startes som Agent, Codex som baggrunds-Bash, inden for 5–6 sekunder af hinanden (r1 18:30:27/18:30:32; r2 13:58:17/13:58:23). Devil, r3, P-2, P-4 og P-5 kørte også oveni hinanden 14:15–14:33.
- **Timeout på driverens Codex-kald: NEJ.** 13 `codex exec`-kald 8/9, ingen med `timeout` — undtagen den manuelle genkørsel 15:03:20 (`timeout 300`). `scripts/codex-review.sh:329` og `scripts/kaede/adapters/codex.sh:61,72` har `timeout --signal=KILL 480/240`; driveren genbruger ikke mønstret.
- **»10–15 min pr. devil-pas« er hæng, ikke tænketid.** Målt: 3,5 · ≤8 · ~4 · 1,8 min for de fire pas der afsluttede (xhigh); 45 s for genkørslen (high). De to der ikke afsluttede (13:28, 14:48) blev dræbt 15:00–15:03 sammen med to spøgelsesprocesser (9 t 34 m og 1,5 t gamle, begge forældede delta-pas).
- **Fase 2 lukkede kl. 15:12 i dag** (M-38 `krav ok` 15:06, gate åben @ 03ac5e1); recon-2 startede 15:14.

---

## 1. Hvor tiden går i dag

1. **Fase 2 elapsed: 6 dage 3 t** (2/9 11:48 → 8/9 15:12). Heraf **venten på Mathias/kalender ≈ 5 dage 18 t** (2/9 17:35→3/9 18:01 = 24,5 t; 3/9 19:24→8/9 13:23 = 114 t). Aktive bursts ≈ 9 t.
2. **Af de 9 aktive timer er ≈ 6,5 t fabrik-/struktur-arbejde** på Mathias' workflow-doms (M-5..M-10 hele 2/9; M-31..M-35 = 34 min 8/9 før kæden overhovedet startede), **≈ 2,5 t er kæde-arbejde** (udkast, audit, upload, buildability, fremlæggelse, devil, P-2/4/5).
3. **Aktør-tid målt 8/9:** buildability r2 12–13 min (fuld læsning, xhigh) · r3 3,1 min · r4 3,9 min (delta, codex på high) · devil 1,8–8 min · P-2 ≈ 19 min · P-4 ≈ 20 min · P-5 ≈ 9 min · fresh-eyes første pas 11 min (3/9), addenda 3–4 min hver.
4. **Hæng: 2 af 13 Codex-kald i dag** (15 %) + 2 spøgelser fra tidligere → 15 min direkte på kritisk vej (14:48→15:03) + 30 min spildt opmærksomhed (13:28-passet, aldrig færdigt) + kø-forsinkelse for alle passes indtil 15:00.
5. **Kæde-overhead pr. tekst-ændring:** addendum 3–4 + upload 1 + buildability-re-bind 4–5 ≈ **9–10 min pr. ny blob**. I dag 3 blobs (v3→v4→v5) = ~28 min, hvoraf r3 og r4 var buildability-neutrale (0 fund) — de var *beviset*, ikke fund.
6. **Rækkefølge-fejl kostede én Mathias-tur:** P-4 kørte efter upload+r2 (14:21 på v4) → v5 → r4 → berørte-linjer → M-37 holdt → M-38. 22 min + én tur.
7. **Git er ikke flaskehalsen:** 20 commits 8/9, median 2 s (selftest-commits 10–13 s). Driveren er én seriel session: 145 værktøjskald på 112 min.
8. **Fase 1 (13/8, 67 min):** 3 blinde recon-aktører parallelt 14:14→~14:53 (inkl. codex-re-bind fordi `flade_filter` blev tilføjet mid-flight — nu lukket som struktur), konsolidering + devil-loop 14:56→15:13 (1 fund, 1 iteration). Wiring-kode blev bygget *mens* aktørerne kørte — godt mønster.

**Hvad hvert tjek fandt i første pakke (talt i filerne):**

| Tjek | Kørsler | Fund | Konsekvens |
|---|---|---|---|
| Omission-devil (recon) | 2 | 1 (p0-filterhul) | loop → PASS begge akser |
| Fresh-eyes-audit | 1 + re-audit + 3 addenda | 10 (8 afledninger + 2 fejl-citater) · 0 · 0 · 0 · 0 | r1 fangede også en driver-fejl (stale ledger), v4 en ufuldstændig patch-bestilling |
| Buildability code+codex | 8 verdikter | 8 PASS, 0 FAIL/HALT; r1 code 3 spørgsmål, r2 code 4 noter (N1 citat-fejl, N2 jsonb-kendsgerning), r2 codex 2 skabelon-fakta; r3/r4: 0 | noter → plan-fase-listen; r4 codex: »open:true @ afcf408« ikke reproducerbar med nuværende runner (provenance) |
| Spørgsmåls-devil | 7 kald (5 afsluttede) | 7 · 5 · 6 på første pas af hver ny tekst; 0 · 0 på re-pas/kort gengivelse | 18 rettelser før Mathias så teksten |
| P-2 divergens | 1 (19 min) | 77 → 50 ordlyd · 26 teknisk · 0 forretnings-forks · 1 rest | 0 Mathias-konsekvens; plan-føde |
| P-4 kildetjek | 1 (20 min) | 377 rækker → 4 fund, 2 materielle (F-02, F-03) | F-03 var »uafmærket afledning der slap gennem runde 1« hos Claude-auditen → cross-vendor-værdi bevist |
| P-5 dokument-akse | 1 (9 min) | 0 materielle | — |

---

## 2. Forslag

### T-1 · Timeout + automatisk genstart på alle Codex-kald
**Hvad:** Wrap hvert `codex exec` i `timeout --signal=KILL <300–480 s>`, skriv output via `-o`, marker `.started/.done`, ét automatisk retry ved timeout (samme effort — dagens manuelle genkørsel sænkede tavst xhigh→high), log hæng-rate i provenance.
**Hvor:** driverens kald (transkript 8/9 11:25:37Z–13:03:20Z, 0 af 13 med timeout) · mønstret findes i `scripts/codex-review.sh:329` og `scripts/kaede/adapters/codex.sh:61,72` · plan DEL I anti-tavshed `:42` · 2.F `:124–126`.
**Besparelse:** i dag 15 min direkte kritisk vej + 30 min spildt opmærksomhed + køforsinkelse → ≈ 20–25 min af 109 min (≈ 20 %). Med 300 s + 1 retry: maks. tab pr. hæng ≈ 5–6 min.
**Pris i beskyttelse:** ingen. Timeout = manglende verdikt = BLOKER (fail-closed uændret). Retry er en ny kørsel med egen provenance.
**Forudsætning:** kode (driver-wrapper; 20 linjer).
**Anbefaling:** **gør nu.**

### T-2 · Ét delta-batch pr. runde: alle tekst-ændrende tjek på SAMME blob, én fold-ind, én re-bind
**Hvad:** Kør P-4-kildetjek og buildability samtidig på samme udkast/upload-blob; fold buildability-noter og P-4-fund ind i ÉN ny version; én audit-addendum, én upload, én re-bind; fremlæg først den *endelige* blob.
**Hvor:** plan Fase 2 pkt. 3 `:163` placerer allerede P-4 »før upload OG før plan-lås« — i dag kørte den retroaktivt efter upload+r2 (transkript 12:21:55Z, worktree @ d5fa4be) fordi M-35 kom mid-flight.
**Besparelse:** 8/9 havde 3 blobs og 3 runder (r2, r3, r4) + ekstra ok-tur. Med P-4 ∥ r2 på v3: én v4, ét addendum, én upload, én re-bind. Sparer r4 (5 min) + addendum/upload v5 (4 min) + berørte-linjer-runden (3–5 min uden hæng, 16 med) + **én Mathias-tur**. ≈ 12–25 min pr. runde-cyklus.
**Pris i beskyttelse:** ingen — samme dommere, samme tjek, anden rækkefølge. P-4 og Claude-audit læser samme blob uafhængigt (tilsigtet de-korrelation).
**Forudsætning:** driver-disciplin; planens ord står allerede.
**Anbefaling:** **gør nu** (fra første runde i pakke 2).

### T-3 · Brug ventetiden på Mathias: spekulativ recon-2 + alt AI-internt (P-2)
**Hvad:** Når buildability er PASS og fremlæggelsen er sendt (kun Mathias' ord udestår), start recon-2 (code ∥ codex) og P-2 mod den fremlagte blob. Efter `krav ok`: delta-re-bind mod endelig krav-OID (som r3/r4: 3–5 min).
**Hvor:** plan Fase 3 pkt. 1 `:179` (recon-2 startet 15:14 i dag, 2 min efter gate-åbning) · gates.mjs `:57–60` (plan-gaten binder `krav` + `recon2` — bindingen sker ved plan-gaten, ikke ved start) · Fase 1 `:151` (P-2 aftager = plan/recon-2).
**Besparelse:** recon-1 kostede ~42 min aktør + 21 min konsolidering. Recon-2 skønnet 30–60 min kritisk vej efter ok → spares næsten helt (re-bind 3–5 min). Ventetiden i pakke 1 var 114 t — rigelig. **25–55 min pr. pakke.**
**Pris i beskyttelse:** ingen — recon-2 bindes og re-dømmes ved plan-gaten. Risiko = spildt compute hvis kravet skifter substans (som v1→v2 gruppe-modellen); derfor først efter fremlæggelse.
**Forudsætning:** driver-proces.
**Anbefaling:** **gør ved næste pakke.**

### T-4 · Fabrik-bygger-session adskilt fra driver/postkontor
**Hvad:** Workflow-rettelser (plan, rolletekster, actors.lock, scripts) laves i en separat session; driveren kører kun kæden. Rolletekst+lock skal stadig lande FØR aktør-spawn (skill_oid-pin).
**Hvor:** transkript 8/9 13:23–13:57: 7 struktur-commits før første kæde-skridt (audit v3 13:52); hele 2/9 (11:48–17:35, 8 commits) var struktur mens krav-sessionen ventede · plan DEL I `:56` (rolle-sessioner implementerer aldrig mekanik — driveren gør, og det blokerer) · hooks.mjs `commitZoneDecision` (zone »fabrik«).
**Besparelse:** 20–25 min pr. dag med Mathias-doms (kun M-32/M-33-formen var reelt kæde-blokerende ≈ 10 min af de 34).
**Pris i beskyttelse:** lav — to sessioner i fabrik-zonen kan kollidere på plan-fil/rolletekst; kræver at driveren kun committer `plan-build/**` + upload-ruten, og at rolletekst-ændring midt i en aktør-kørsel afvises (driveren gjorde det korrekt i dag: 50c6823 før r3).
**Forudsætning:** kode (ny commit-zone »driver« ⊂ »fabrik« i hooks.mjs) — ikke Mathias' ord (ét vindue/postkontor bevares).
**Anbefaling:** **gør ved næste pakke.**

### T-5 · Effort pr. opgavetype — og log effort i provenance · *kræver Mathias' ord*
**Hvad:** xhigh for første substans-pas og angreb (buildability r1/r2, devil på ny tekst, P-4, kill-list); high for delta-re-binds og form-pas på beskeder der genbruger godkendt tekst. Effort skrives i actors.lock pr. opgavetype og i run-provenance.
**Hvor:** `actors.lock.json:7,27,42,…` reasoning »xhigh« (M-31/M-33) · 2.G `:134` · **faktisk kørt i dag:** codex r3/r4 = `model_reasoning_effort="high"` (12:20:23Z, 12:47:35Z), recon-codex-re-binds 13/8 = high, genkørsel 15:03 = high · `verdikt.mjs:48` RUN_KEYS har intet effort-felt → afvigelsen fra pinnen er usynlig i evidensen i dag.
**Besparelse:** codex delta-re-bind på high 3,1–3,9 min; devil-genkørsel high 45 s vs xhigh 1,8–8 min. Skøn 2–5 min pr. forekomst × 6–8 forekomster = **15–30 min pr. fase**.
**Pris i beskyttelse:** lav–mellem. Troskabs-aksen (P-3) fandt 6 fund ved xhigh på en tekst forfatteren mente var færdig — ukendt om high havde fundet dem. Derfor kun re-binds og form-re-pas på high, aldrig første angreb.
**Forudsætning:** Mathias' ord (pinnen er hans) + kode (effort i lock og RUN_KEYS/actor_run). Mathias-9b har allerede fremlagt forslaget (transkript 13:00:37Z).
**Anbefaling:** **gør nu — spørg én gang; log effort uanset svar** (lukker et ærlighedshul i provenance).

### T-6 · Skip devil-pas på beskeder uden ny påstand · *kræver Mathias' ord (A1)*
**Hvad:** Undlad devil på beskeder der kun gengiver allerede PASS'et tekst byte-identisk.
**Hvor:** plan 2.F `:126` pkt. (2), Fase 2 pkt. 2 `:162`, `roller/claude-ai.md:160`.
**Besparelse:** kun 2 af 7 pas var »gengivelse« (1,8 min + 45 s uden hæng) → 5–10 min pr. fase. Lille når T-1 er på plads.
**Pris i beskyttelse:** mellem. »Kort« ≠ »ufarlig«: v2-fremlæggelsen tabte 6 forbehold. Empirien for »0 fund på gengivelse« er N=2.
**Anbefaling:** **lad være.** Kør T-1 + T-5 (high + timeout) i stedet. Eneste forsvarlige variant: mekanisk skip når teksten er byte-lig en PASS'et tekst (ingen dom).

### T-7 · Buildability starter på udkast-blobben parallelt med audit-addendum; parametrisér verdikt-byg
**Hvad:** Da upload er byte-identisk (hook-mandat), kan buildability dømme udkast-blobben mens addendum kører; ved upload re-stamples `commit_sha/path` (excerpt_sha uændret) med deklareret provenance »dømt @ udkast-commit X, bundet til upload Y«. Samtidig: GATED_COMMIT/ARTIFACT_OID som args/env i stedet for hånd-redigering.
**Hvor:** kæden i dag audit → upload → buildability (`:163–164`) · `verdikt.mjs:210` kræver commit == gated commit · `gate-eval.mjs:26` sti `docs/sandhed/…` · `hooks.mjs:69–110` byte-identitet · `tmp/fase2/verdikt-byg.mjs:13–15` hardkodet pr. runde (redigeret 4×; codex r2 ramte import-fejl → lokal loader-workaround, se `buildability-analyse-codex-r2.md` sidste afsnit).
**Besparelse:** 4–5 min pr. runde fra kritisk vej + 2–4 min manuel rettelse/fejlkilde → **10–15 min pr. fase**.
**Pris i beskyttelse:** lav — aktøren dømte bit-identisk indhold, men ved anden commit/sti end den gatede; re-stamp er mekanisk, men SKAL deklareres, ellers lyver evidensen lidt. Finder audit noget, spildes kørslen (compute, ikke beskyttelse).
**Forudsætning:** kode.
**Anbefaling:** **gør ved næste pakke** (T-2 giver mere for mindre).

### T-8 · P-5 dokument-aksen som tredje akse i omission-devil-passet, ikke separat kørsel
**Hvad:** Planen `:150` siger allerede »+ DOKUMENT-akse« i omission-devilen. Kør den i samme pass (tre akser), ikke som egen 9-min Codex-kørsel.
**Besparelse:** ≈ 9 min i Fase 1 pr. pakke. **Pris:** ingen (samme dommer, samme input). **Forudsætning:** prompt-ændring. **Anbefaling:** gør ved næste pakke.

### T-9 · Flere pakker samtidig
**Hvad:** To pakker i kæden parallelt.
**Hvor:** `launch/launch.json` og `recon/` er ikke pakke-navngivne (gate-eval `:21–31` bruger `<pakke>` kun for krav/plan/build) → kollision; DEL I »ét Mathias-vindue pr. fase«.
**Besparelse:** gennemløb, ikke latenstid — Mathias' ventetid pr. pakke stiger (to krav-vinduer). **Pris:** mellem (hans opmærksomhed deles; workflowet ændrede sig 30+ gange i pakke 1). **Anbefaling:** **lad være** indtil pakke 2 er kørt rent; teknisk forudsætning: pakke-stier for launch/recon.

**Overset, uden målbar gevinst (noteret):** dubleret læsning — hver Codex-kørsel læser recon.md (220 KB) + krav (58 KB) fra bunden; allerede afbødet med »læs din egen forhistorie« (r3/r4, audit-addenda). Audit-input er allerede minimeret (5 filer). Fresh-eyes-addenda køres af SAMME agent-instans siden 3/9 (SendMessage a3be71d…) — hurtigt (3–4 min), men auditor dømmer egne lukninger; P-4 fandt netop F-03, som slap gennem hos den. Behold hurtig addendum til deltas, lad P-4 være den friske kilde-dommer én gang pr. substansrunde (T-2). Mathias-ture: M-32/M-33/M-34 er nok til *antal* spørgsmål (fremlæggelse-2 havde 0 spørgsmål, 2 bekræftelser); den ekstra ok-tur var rækkefølge (T-2), ikke form.

---

## 3. Hvad der IKKE bør skæres

- **3-blind recon + omission-devil med filter-akse** — fandt det ene reelle hul (p0), og filteret er driver-forfattet scope-krympning der skal have en dommer.
- **Fresh-eyes første pas OG P-4 første pas** — 10 og 4 fund, forskellige fund (F-03 slap gennem Claude); de de-korrelerer. Skær ikke den ene for den anden; batch dem (T-2).
- **Spørgsmåls-devil på første version af hver Mathias-vendt tekst** — 18 fund i 3 pas; M-32-klagen kom af ufiltrerede beskeder.
- **OID-binding, orderedApproval og re-bind efter hver blob** — r3/r4 fandt intet, men de *er* beviset for at dommen gælder præcis den blob Mathias skriver ok på. Gør re-bind billig (T-2/T-5/T-7), fjern den ikke.
- **Cross-vendor buildability** — 0 FAIL i 8 verdikter, men codex leverede 2 skabelon-fakta planen skal bruge og ét provenance-fund (r4). Værdien ligger i plan-føden, ikke i gate-resultatet.
- **Fail-closed ved timeout/tavshed** — T-1 forstærker det, må aldrig blive fail-open (»intet output = ok«).
- **Ledger verbatim + fremlæggelse som fil** — 0 aktør-tid, høj værdi.

---

## 4. Rangliste (besparelse/pris)

| T-id | Hvad | Besparelse | Pris | Anbefaling |
|---|---|---|---|---|
| T-1 | Timeout + auto-genstart på Codex-kald | 20–25 min pr. aktiv dag (≈ 20 %), ren kø | ingen | gør nu |
| T-2 | Ét delta-batch (P-4 ∥ buildability på samme blob) | 12–25 min pr. runde + 1 Mathias-tur | ingen | gør nu |
| T-3 | Spekulativ recon-2 + P-2 i ventetiden | 25–55 min kritisk vej pr. pakke | ingen (compute-risiko) | næste pakke |
| T-5 | Effort pr. opgavetype + log effort | 15–30 min pr. fase | lav–mellem | gør nu — kræver Mathias' ord |
| T-4 | Fabrik-bygger ≠ driver-session | 20–25 min pr. doms-dag | lav | næste pakke |
| T-7 | Buildability på udkast-blob + parametriseret verdikt-byg | 10–15 min pr. fase | lav | næste pakke |
| T-8 | P-5 ind i omission-devil-passet | ≈ 9 min pr. pakke | ingen | næste pakke |
| T-6 | Skip devil på gengivelses-beskeder | 5–10 min pr. fase | mellem | lad være |
| T-9 | Flere pakker samtidig | gennemløb, ikke latenstid | mellem | lad være (indtil pakke 2) |

**Samlet:** T-1 + T-2 + T-5 ville have gjort dagens 109-minutters burst til ≈ 55–60 min og sparet én Mathias-tur — uden at fjerne et eneste tjek. Den store post (5,8 af 6 dage) er Mathias' kalender; den kan kun udnyttes (T-3), ikke skæres.
