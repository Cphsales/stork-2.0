# governance-vagt — Krav-og-data

**Type:** Kontrakt for governance-vagt-pakke-familien (ét dok over de 6 pakker)
**Dato:** 2026-06-05

> **Ærlig note om dokumentets natur.** En normal krav-dok sourcer hver påstand
> til Mathias' ord (§10.1). Denne er anderledes: governance-vagtens formål og
> 6-pakke-split blev besluttet på tværs af sessioner, og gov-1 + gov-2 er
> allerede bygget. Dokumentet er derfor **retroaktiv + fremadrettet kontrakt** —
> det sourcer til besluttede artefakter (slut-rapporter, v5-workflow-bud,
> disciplin.md), ikke til frisk diktat. Det giver gov-1/gov-2's slut-rapporter
> den kontrakt de mangler at blive reviewet mod (§9.1), og gov-3→6 deres hjem.

## Formål

> Denne pakke-familie leverer: et V5-workflow der er **mekanisk håndhævet** — så
> den røde tråd ikke hviler på at nogen husker disciplinen, men fanges af
> mekanisme, Codex og Mathias.

_Kilde: v5-workflow-bud §1 ("Fangsten kom altid udefra ... selv-disciplin er det
svageste lag og må aldrig være bærende værn"); disciplin.md "Forudsætninger"._

## Hvad pakke-familien skal sikre (workflow-niveau, ikke Stork-forretning)

Governance-vagt bygger ikke løn, salg eller klienter. Den bygger **måden** de
andre pakker bygges på, så fejl fanges før de rammer produktion.

- Workflowet skal kunne fange "samme begreb defineret to steder" mekanisk —
  root-cause-klassen der startede V5. _(v5-bud §2; gov-2 slut-rapport)_
- Workflowet skal kunne forhindre at noget merges uden om processen. _(v5-bud §7)_
- Workflowet skal kunne køre uden at hvile på menneske-hukommelse. _(v5-bud §1)_
- Workflowet skal kunne holde repo og live-DB i overensstemmelse, så CI er
  pålidelig. _(gov-1 slut-rapport)_

## I scope — de 6 pakker, sekventeret

Rækkefølgen er sekventeret efter **Codes tekniske fund** (hans bord): branch
protection (gov-4) før grøn CI ville bricke main. Code afgør den faktiske
bygge-rækkefølge og split i plan-fasen; krav-dok'en fastlåser den ikke.

1. **gov-1 — paritet-grøn** · LEVERET 2026-06-04. Repo↔live-DB migration-registre
   bragt i overensstemmelse; CI grøn mod live. _(gov-1 slut-rapport)_
2. **gov-2 — vagt** · LEVERET 2026-06-05, slut-rapport afventer Claude.ai-review
   før merge. Mekanisk lag-1 governance-scanner + owns-register + Codex-mandat
   (§8.1) + H-hjem (huskeliste.md). _(gov-2 slut-rapport)_
3. **gov-3 — CI-blockers** · Færdiggør fitness-laget: de af master-plan §3's 20
   checks der mangler. Hvilke der mangler afgøres af Codes live-dump, ikke af
   doc'en. _(aktiv-plan; disciplin "Forudsætninger")_
4. **gov-4 — branch protection** · Gør gates bindende — CI + `governance:check`
   bliver required, så intet merges uden om processen. _(aktiv-plan; v5-bud §7)_
5. **gov-5 — automation** · Codex-runner + auto-merge ved grøn CI + godkendelse +
   plan-branch-trigger (H020). _(disciplin §6.2; "Forudsætninger")_
6. **gov-6 — arkiv-fold** · Fold arkivet til git-history; én bevarings-politik
   (§4). Inkl. `v4-slettede-docs/` der stadig ligger untracked. _(disciplin §4)_

## IKKE i scope

- Stork-forretningsfeatures (løn, salg, vagter, provision) — governance-vagt er
  workflow-infrastruktur, ikke domæne-byggeri.
- Zone-disciplin (rød/gul/grøn) — 1.0-arv, aldrig godkendt til 2.0. Den stale
  zone-paragraf i master-plan §3 (linje 1500-1502) fjernes som doc-fix i gov-3a.
  _(Mathias' beslutning bekræftet 2026-06-05.)_
- Performance-benchmarks (master-plan §3 "Performance-disciplin": subtree-RLS,
  lock-pipeline-SLA, dashboard-refresh). De måler Stork's ydeevne — ikke hvordan
  vi bygger. Produkt-kvalitet hører i et separat spor, ikke i workflow-vagten.
  _(Mathias 2026-06-05: "hvad har det at gøre med workflowet?")_

## End-to-end-test-design

Hver pakke leverer mindst ét mekanisk bevis den virker. Mønster etableret i
gov-2: `governance:selftest` — baseline grøn + plantede overtrædelser fanges.
_(gov-2 slut-rapport; §3.6)_

## Afgjort

- **Dækning:** hele familien (gov-1→6), så gov-1/gov-2's slut-rapporter har en
  kontrakt at reviewes mod. _(Mathias 2026-06-05.)_
- **Benchmarks:** ude — ikke workflow (se IKKE i scope).
- **Zone-§3-fjernelse:** afgjort UDE; verificeres når gov-3a fjerner paragraffen
  gennem §8.1-gaten.

## Oprydnings- og opdaterings-strategi

Ved familiens luk: denne krav-dok → `arkiv/governance-vagt-krav-og-data.md`.
Per-pakke plan/status/feedback lever i git-history (§4). disciplin.md's
"Forudsætninger"-sektion opdateres så leverede pakker (gov-1, gov-2) ikke står
som udestående — gennem §8.1-gaten.
