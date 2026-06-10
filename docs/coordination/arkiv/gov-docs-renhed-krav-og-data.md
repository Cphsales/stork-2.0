# gov-docs-renhed — Krav-og-data

**Type:** Kontrakt for gov-docs-renhed-pakken (docs-renhed + selvvedligeholdende værn)
**Dato:** 2026-06-08

> **Ærlig note om dokumentets natur + bord.** §10.1 lægger krav-dok-typist-rollen
> hos Claude.ai, og Mathias dikterer. Denne er Code-draftet, fordi indholdet er
> Mathias' dikterede afgørelser (D1–D6 + renheds-princippet + løftet af
> forretningsforståelse) sammen med Code- og Codex-verificerede fund — ikke
> forretnings-tanker der kræver en typist. **Ingen forretnings-afgørelse er
> truffet af Code.** Hver påstand sources nedenfor. Vil Mathias hellere have
> Claude.ai til at type den for cadence-konsistens, omdirigeres den — flag rejst,
> ikke afgjort.

## Formål

> Denne pakke leverer: et docs-repo hvor ingen doc eller script modsiger
> virkeligheden — plus de mekaniske værn der holder det rent — så fælles
> forståelse og workflow ikke kan brydes af drift.

_Kilde: Mathias 2026-06-08 ("urent docs = brudt fælles forståelse = brudt
workflow; hold det rent ER workflowet, ikke oprydning ved siden af");
Code-analyse H-1…H-8; Codex-analyse C-1…C-8 (branch-protection-fund
API-verificeret)._

## Hvad pakken skal sikre (workflow-/renheds-niveau, ikke Stork-forretning)

Pakken bygger ikke løn, salg eller klienter. Den retter **måden** repoet bærer
fælles forståelse på, så en aktør aldrig fejlledes af en doc/script der lyver.

- Et docs-repo eksisterer for at skabe fælles forståelse og sikre workflowet. En
  doc der modsiger virkeligheden, en død reference eller en pointer der peger
  forkert undergraver præcis det repoet er til for. Renhed **er** workflowet.
  _(Mathias 2026-06-08.)_
- Kun filer der tjener et reelt formål overlever i repoet. Alt andet ud — doc
  eller script, V5.3-rest eller ej. _(Mathias D3.)_
- De to stamme-docs — `vision-og-principper.md` og `forretningsforstaaelse.md` —
  er begge LÅST-AUTORITATIVE og **må aldrig være indbyrdes uenige**. En
  modsigelse mellem dem er et hul der skal lukkes, ikke en præcedens hvor den ene
  trumfer den anden. _(Mathias D4 + afgørelse: forretningsforståelse hæves til
  samme beskyttelse som vision.)_
- Et script der ligner fungerende automation men er brudt er værre end intet
  script — det fejlleder aktøren. _(Codex C-3; Code H-1.)_
- Renheden må ikke hvile på menneske-hukommelse: det der kan fanges mekanisk skal
  fanges mekanisk; resten falder til Codex + Mathias. _(v5-bud §1; arvet fra
  gov-2.)_

## I scope

Code afgør faktisk bygge-rækkefølge, batch-split og repair-vs-slet-verdikt pr.
script i plan-fasen (hans bord, jf. D1). Krav-dok'en fastlåser ikke det tekniske
hvordan — kun hvad der skal være sandt til sidst.

### A. Reconcile — docs og scripts der modsiger virkeligheden i dag

1. **Aktiverings-scripts bringes til at virke under V5 ELLER fjernes** — verdikt
   pr. script, styret af "tjener et reelt formål" (D3): `codex-review.sh` (dør på
   `exit 64`; kræver slettet `docs/skabeloner/codex-review-prompt.md`),
   `claude-ai-prompt.sh` (peger på slettede `mathias-afgoerelser.md` +
   `overvaagning/claude-ai-overvaagning.md`; indlejrer fjernet fire-dok-ramme),
   `data-grundlag.sh` (V5.3 "Step 0"), `krav-afklar.sh` (V5.3 "Step 2"). _(D1+D3;
   H-1/H-2; C-3/C-4.)_
2. **`disciplin.md` doc-currency** — "Forudsætninger"- og "Gjort"-sektionerne
   (`§ Forudsætninger`) lister gov-3b-2 #10/#18 som udestående; de er merged
   (PR #101/#103/#105). Bringes i sync med faktisk gov-state. _(C-8.)_
3. **Forretningsforståelse løftes til LÅST-AUTORITATIV (doc-niveau)** — (a)
   LÅST-banner i header som `vision-og-principper.md`; (b) `LÆSEFØLGE.md` pkt. 2
   "TANKE-DATA — ikke kontrakt" → låst-status; (c) ny række i `disciplin.md §8`
   som **LÅST → STOP**; (d) `§8.1` udvides så ændring af én stamme-doc tvinger et
   konsistens-tjek mod den anden (modsigelse = hul → STOP → Mathias lukker).
   CODEOWNERS dækker den allerede. _Mekanisk håndhævelse (code-owner-review
   required) lander i gov-4 — her er det doc-niveau-løftet._ \_(Mathias-afgørelse
   - D4; C-2/H-5.)\_
4. **Git-reglen rettes** — "git pull origin main" ved hver trigger er forkert når
   arbejdet sker på plan/build/mergehash-branches. Erstattes med branch-bevidst
   "fetch + verificér branch/base/remote + pull relevant branch; uventede commits
   → STOP". I `LÆSEFØLGE.md` pkt. 0, `disciplin.md §13`, `CLAUDE.md`. _(C-7.)_
5. **Døde reference-rester repointes** — `rapport-historik/README.md` peger på
   slettet `rapport-skabelon.md`; `disciplin.md §2/§6.2` peger på H020-tombstone
   i stedet for det levende gov-5-arbejde. _(H-3/H-7.)_
6. **`disciplin.md §7` invariant #4 gøres ærlig** — mærket "(lint)", men ingen
   sats/lønart-lint findes. Relabel til Codex/Claude.ai-tjek (lint bygges først i
   et senere spor). _(H-5.)_
7. **Claude.ai-aktivering: én kanonisk kilde i repoet** — repoets
   `docs/claude-ai/SKILL.md` gøres til den autoritative skill; platform-skill'en
   peger på / genereres fra den, så aktiveringen er versioneret og synlig for
   alle aktører. Forudsætter at `claude-ai-prompt.sh`-konflikten (pkt. 1) er
   lukket, så der ikke er to borde. _(Mathias-afgørelse: skill ud af platform,
   ind i repo; H-2.)_
8. **`fundament-samlet.md` slettet** — utracked working-tree-fil, fjernet som
   oprydning (ikke en tracked commit). _(Mathias D5. Allerede udført
   2026-06-08.)_

### B. Mekaniske værn — så renheden holder sig selv

9. **Governance-check-allowlisten splittes i to klasser** — prosa-docs _må_ nævne
   slettede stier (historisk-provenance); aktive scripts _må ikke_ pege på
   slettede stier, medmindre scriptet selv er markeret `deprecated`.
   Allowlisten har allerede et `klasse`-felt — checken bruger det bare ikke til
   at skelne doc vs. script. **Dette er fixet der automatisk ville have fanget
   pkt. 1.** _(H-3/C-5.)_
10. **Strukturel kæde-tjek** — for en aktiv pakke: krav-dok + plan + status +
    slut-rapport eksisterer og krydspeger konsistent, og `## Formål`-strengen er
    identisk på tværs af krav-dok/plan/rapport (formåls-immutabilitet §3.0
    mekanisk). **Strukturel, ikke semantisk** — existence + string-match, ingen
    betydnings-vurdering. _(H-4/C-6; Codex' eksplicitte råd "start strukturelt".)_
11. **§8.1 Codex-svar som fast review-marker** — den lovede "modsiger dette
    prosa-mæssigt et begreb en anden doc ejer?"-gate er i dag kun en instruktion;
    intet kræver at svaret blev givet. Gøres til en fast marker der kan tjekkes i
    PR/rapport, ikke kun huskes i chat. _(Codex-forbedring.)_

## IKKE i scope

- **gov-4 (branch protection)** — `required_status_checks` + `require_code_owner_reviews`
  - `required_approving_review_count ≥ 1`. Selvvedligeholds-checkene fra denne
    pakke (pkt. 9–10) gøres _required_ DÉR, ikke her. _(D2; sekvens.)_
- **gov-5 (automation)** — Codex-runner + auto-merge + plan-branch-trigger (H020).
  _(D6: bevidst udskudt hertil.)_
- **gov-6 (arkiv-fold)** — arkiv → git-history + `v4-slettede-docs/` (untracked) +
  G063-allowlist-fjernelse. _(disciplin §4; G063.)_
- **P3-spor** — Code-rolle-binding i `CLAUDE.md`, decision-packet-format ved
  gates, sats/lønart-lint. Følger efter; tages kun med her hvis plan-fasen finder
  dem billige. _(Code H-6; Codex-forbedring.)_
- **Semantisk modsigelses-detektion mellem stamme-docs som lag-1-check** — kan
  ikke gøres mekanisk; det er §8.1 Codex (lag 2). Pkt. 3(d) leverer _udløseren_
  (ændring → tjek-krav), ikke en prosa-modsigelses-scanner. Ærlig grænse. _(D4.)_
- **Stork-forretningsfeatures.**

## End-to-end-test-design

Mønster fra gov-2: `governance:selftest` — baseline grøn + plantede overtrædelser
fanges. Mindst tre nye negativ-cases i `scripts/governance-check.selftest.mjs`:

1. Et aktivt script der peger på en slettet sti (uden `deprecated`-markør) →
   allowlist-split-checken fejler (rød). _(beviser pkt. 9.)_
2. En aktiv pakke uden plan, eller med `## Formål`-streng-mismatch mellem
   krav-dok og plan → kæde-tjekket fejler (rød). _(beviser pkt. 10.)_
3. Baseline (alt rent) → grøn.

Skema-only ("checken findes") accepteres ikke (§3.6).

## Afgjort (Mathias D1–D6 + afgørelser, 2026-06-08)

- **D1:** Scripts repareres hvis de kan virke under V5 og tjener et formål; ellers
  slettes. Repair-vs-slet-verdikt pr. script = Code+Codex' bord i plan.
- **D2:** gov-4 kræver **både** CI-status **og** code-owner-review (næste pakke).
- **D3:** Kun filer der tjener et reelt formål overlever.
- **D4:** Vision + forretningsforståelse holdes konsistente; modsigelse = hul der
  lukkes, ikke afgøres.
- **D5:** `fundament-samlet.md` slettet.
- **D6:** Plan-branch-trigger/runner udskudt til gov-5.
- **Afgørelse:** Forretningsforståelse hæves til samme beskyttelse som vision.
- **Afgørelse:** Claude.ai-skill ud af platform-miljøet, ind i repoet (kanonisk +
  versioneret + synlig for alle aktører).

## Åbne spørgsmål

- _(Code+Codex i plan — ikke Mathias)_ Hvilke af de fire scripts tjener et reelt
  formål under V5 (repair) vs. er V5.3-rester (slet)? Foreløbig læsning:
  `data-grundlag.sh` + `krav-afklar.sh` er V5.3-step-rester hvis substans nu
  ligger i §9.1 proaktiv recon (V5 §0 footer) → slet-kandidater; `codex-review.sh`
  har værdi (severity-exit-routing) hvis V5-rettet; `claude-ai-prompt.sh` kan være
  overflødig efter SKILL.md + MCP + skill-i-repo-afgørelsen.
- _(Code+Codex i plan)_ Skal kæde-tjekket (pkt. 10) køre i CI så det bider efter
  gov-4, eller kun on-demand? Foreløbig: CI, så det faktisk blokerer.

## Oprydnings- og opdaterings-strategi

Ved pakke-luk: denne krav-dok → `arkiv/gov-docs-renhed-krav-og-data.md`;
plan/status/feedback i git-history (§4). Pakken redigerer governance-docs
(`disciplin.md`, `LÆSEFØLGE.md`, `forretningsforstaaelse.md`, evt. owns-register),
så den går gennem §8.1-gaten: `governance:check` grøn + Codex' eksplicitte
prosa-modsigelses-svar før merge.
