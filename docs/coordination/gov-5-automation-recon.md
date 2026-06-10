# gov-5-automation — Recon (grundlag for krav-dok)

**Type:** Recon-doc — det sande billede af automation-tilstanden + afdækning af muligheder. Manuel Mathias-bestilling 2026-06-10 (recon-trinnet står ikke i §9 endnu; flow-designet praktiseres her første gang).
**Dato:** 2026-06-10 · **Forfatter:** Code · **Læsere:** Claude.ai (krav-dok-typist) + Mathias (validator)
**Levetid:** pakke-artefakt — git-history ved pakke-luk (§4).

> **Ramme (Mathias' krav, ordret):** Automatikken er transport, aldrig dømmekraft — Mathias' gates og Codex' reviews urørte. Manuelt flow består som dokumenteret fallback.
>
> Alt markeret **[FORSLAG]** i dette dokument er Codes afdækning/anbefaling — ikke beslutninger. Beslutningerne træffes af Mathias i krav-dok-fasen.

---

## A. Automation-virkeligheden NU (verificeret 2026-06-10 aften)

Dagens 11 merged PR'er (#110, #112–#121) flyttede tilstanden. §6.2's mål-tekst er delvist stale: "auto-merge-flow ved grøn CI + godkendelse" står som _skal bygges_, men er nu **aktiv og demonstreret**. §6.2-rettelsen hører til i gov-5's leverance (governance-doc → §8.1-gate), ikke i denne recon.

| Led                                                   | Tilstand                                                                                                                                                                                              | Kilde                                     |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| CI (lint/typecheck/test/build + governance + fitness) | **Kører automatisk** — required check på PR + main                                                                                                                                                    | `.github/workflows/ci.yml`                |
| Migrations-deploy + types-regen                       | **Kører automatisk** ved push til main med migrations                                                                                                                                                 | `.github/workflows/migrations-deploy.yml` |
| PR-drift-advarsel                                     | **Kører automatisk** — main-push → idempotent comment på overlappende åbne PR'er                                                                                                                      | `.github/workflows/pr-drift-warning.yml`  |
| Branch protection                                     | **Aktiv** (gov-4): required CI-check + required code-owner-review (`CODEOWNERS: * @mgrubak`), dismiss-stale, auto-slet merged branches                                                                | gov-4-rapport, `.github/CODEOWNERS`       |
| Auto-merge                                            | **Aktiv konvention, demonstreret i dag**: Code armerer `--auto --rebase` ved PR-oprettelse; mgrubak-approval → merge fyrer uden yderligere klik (#121: approval 19:2x → merge 19:28)                  | PR #112-konvention, PR #121               |
| Codex-review                                          | **Manuel dispatch**: Code kører `scripts/codex-review.sh` i terminal. Codex vækkes ikke selv                                                                                                          | `scripts/codex-review.sh`                 |
| Claude.ai                                             | **Vækkes ikke**: desktop + Filesystem-MCP (læser repo, skriver untracked filer). Mathias paster qwers/qwerr manuelt                                                                                   | disciplin §9.1, §13                       |
| Code                                                  | **Vækkes ikke**: Mathias paster qwers/qwerr/qwerg; Code opdager merges/reviews først ved manuel sync                                                                                                  | disciplin §9.2, §13                       |
| Mathias-notifikation                                  | **Findes ikke**: ingen kanal melder "en gate venter på dig"                                                                                                                                           | —                                         |
| codex-notify + tracker-issue #12                      | **Nedlagt i dag** (#117) — død kanal uden modtager. Trigger-flade-arven (fire events: aktiv-plan-push, seneste-rapport-push, build-branch-push, slut-rapport-PR) ligger i git-history som gov-5-input | PR #117, disciplin §6.2                   |

**Sammenfatning:** GitHub-siden af kæden (CI → approval → merge → deploy) er automatiseret. Alt **mellem aktørerne** — vækning, levering af "din tur", notifikation af Mathias — er manuelt relæ gennem Mathias.

---

## B. Fuld kæde — ambitionen (Mathias-afgørelse 2026-06-10)

**Mathias' ord:** alle tre aktører vækker hinanden; Mathias er ude som transport ALLE steder. Claude.ai-rollen skal også kunne vækkes. Rollernes dømmekraft automatiseres ikke — kun vækning og levering.

**Maj-designets substans (input, ikke live kilde):** aktør-til-aktør-vækning, alle tre paner — `docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md`, `docs/coordination/v4-slettede-docs/overvaagning--codex-overvaagning.md`, `docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md` (V2/V3-æra, 19.–21. maj) + chat-historik 19/5. Det bærende princip: vækningen siger kun _"din tur"_ — aktøren finder selv sin tilstand ved at læse repo-state (pakke-status, plan-version, PR-state). Det princip er transport-rent og **genbruges**. Det der døde, var kanalen (notify uden modtager), ikke princippet. NB: maj-docs'ene indeholder V2/V3-elementer som V5 bevidst har skåret (fire-dok-tabel, forretningsgang-triangulering, tracker-issue) — kun væknings-substansen er input.

**Kædens væknings-punkter** (hvor "din tur" skal leveres automatisk):

| #   | Event                               | Vækker                                                             |
| --- | ----------------------------------- | ------------------------------------------------------------------ |
| 1   | Krav-dok merged                     | → Code + Codex (plan-fase, parallel start)                         |
| 2   | Code committer plan-V\<n\>          | → Codex (review)                                                   |
| 3   | Codex committer feedback            | → Code (V\<n+1\>)                                                  |
| 4   | Codex committer APPROVAL            | → Mathias (qwerg-gate venter) + Claude.ai (qwerg-gate-pakke, §9.1) |
| 5   | qwerg → build; Code committer batch | → Codex (per-batch-review)                                         |
| 6   | Build-PR klar (grøn CI + reviews)   | → Mathias (approval-gate venter)                                   |
| 7   | Merge fyrer                         | → Code (slut-rapport-fase)                                         |
| 8   | Slut-rapport-push                   | → Claude.ai (review FØR merge)                                     |
| 9   | Claude.ai APPROVAL                  | → Mathias (slut OK-gate venter)                                    |

**Vækningsmekanik pr. aktør — fakta + åbne muligheder (afdækkes i plan-fasen):**

- **Codex** — modneste led: `codex exec` kører fra CLI; kan dispatches af en runner (GitHub Actions på branch-push, eller lokal watcher). Driftserfaringerne (stdin-håndtering, parse kun finalt svar) er allerede løst i `codex-review.sh`.
- **Code** — `claude` CLI kan startes/promptes headless af en watcher/hook ved repo-events; alternativt vækkes en stående session. Mekanik-valg er plan-fasens.
- **Claude.ai** — pakkens hårdeste tekniske spørgsmål. Desktop-appen har ingen indgående trigger: en chat-tur kan ikke startes udefra (kendt fra maj-afdækningen). Muligheder til plan-fasen:
  1. **[FORSLAG]** Rollen køres headless via API/Agent SDK når den vækkes (samme rolle-instruks og kilder som §9.1) — desktop-chatten består til det der ER dialog med Mathias (krav-dok-fasen vækkes ikke; den er samtale). Ærlig konsekvens: "Claude.ai" i kæden er da _rollen_, ikke samme chat-instans. Pt. den eneste vej Code ser til "Mathias ude ALLE steder".
  2. Platform-triggere (scheduled/triggered runs) hvis claude.ai-platformen understøtter det — verificeres i plan-fasen.
  3. Fallback: Claude.ai-leddet forbliver manuelt (notifikation til Mathias som relæ KUN her) — reducerer ambitionen; eksplicit Mathias-valg.

**Urørt uanset mekanik:** dømmekraften. Codex' review-indhold, Claude.ai's review-/gate-hjælp-indhold, Codes byggevalg og alle tre Mathias-gates er nøjagtigt som i §2 — kun _hvornår nogen får at vide det er deres tur_ og _hvordan leverancen flyttes_ automatiseres.

---

## C. Mathias' flade (i scope — Mathias-krav 2026-06-10)

**Krav:** notifikation til Mathias (mobil) når en gate venter på hans klik/ord.

Gate-inventar + kanal-fakta:

| Gate                                   | Flade i dag | Notifikations-kandidat                                                                                                                                            |
| -------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR-approval (code-owner)               | GitHub PR   | **GitHub Mobile push ved review-request** — native, nul infra: kæden re-requester review til mgrubak når PR er klar (grøn CI + reviews leveret)                   |
| krav OK / qwerg / slut OK (chat-gates) | Ingen       | Event → workflow → push. Kanal-kandidater: GitHub-issue-mention (→ GitHub Mobile push) eller dedikeret push-tjeneste (ntfy/Pushover). Valg er teknik (plan-fasen) |
| mathias-gate-filer (§6.3)              | Fil i repo  | Samme mekanik som chat-gates                                                                                                                                      |

**Princip [FORSLAG]:** notifikationen indeholder _hvad der venter og hvor_ — aldrig en anbefaling. Transport, ikke dømmekraft.

---

## D. Differentieret approval-flade (afdækning + [FORSLAG] — snittet er Mathias' beslutning i krav-dok)

**Problemet (målt i dag):** CODEOWNERS `* @mgrubak` betyder at ALLE main-merges kræver Mathias-klik — også kædens bogføring (pointer-opdateringer, status-filer, review-fil-commits, fixups). Af dagens 11 PR'er var flere ren bogføring. Fuld automation producerer FLERE små PR'er → uden differentiering skalerer Mathias' klik OP, ikke ned.

**GitHubs fil-baserede mekanik (kandidaten):** CODEOWNERS afgør pr. fil om code-owner-review kræves.

- Mønster: behold `* @mgrubak` som default — **konservativt: ved tvivl beholder filen gaten** (Mathias-krav) — og tilføj ejer-løse undtagelses-linjer for bogførings-stier (sti uden owner efter = ingen code-owner-krav; GitHub-dokumenteret mønster, "sidst-matchende regel vinder" står allerede i vores CODEOWNERS-header).
- Forudsætning der skal verificeres i plan-fasen (admin-API, kræver Mathias-mandat): samspillet med required-approvals-antallet. Hvis protection kræver ≥1 approval generelt, kræver selv ejer-løse PR'er et menneske-klik — differentieringen virker kun hvis code-owner-kravet alene bærer gaten.
- Konsekvens: PR der KUN rører ejer-løse stier merger på grøn CI (+ Codex-disciplin uændret); PR der rører bare ÉN ejet fil kræver Mathias.
- Risiko (ærlig): bogførings-PR'er merger uden menneske-klik. Værn: CI (governance:check, fitness), §8.1-Codex-disciplin på docs, og at beslutnings-indhold pr. definition bor i ejede stier.

**Alternativer afdækket:** (i) Rulesets med bypass-aktører — kan ikke differentiere review-krav pr. sti inden for samme branch; ender reelt i CODEOWNERS-mekanikken. (ii) Workflow-push direkte til main udenom PR — **[FORSLAG: afvises]**: bryder "main er fuldt gated", omgår CI-PR-fladen.

**[FORSLAG] Snit** (Mathias afgør; konservativ default ved tvivl = gate):

| Flade                                | Stier                                                                                                                                                                                | Gate                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| **Beslutning** (Mathias-klik består) | stamme-docs, disciplin, master-plan, LÆSEFØLGE, CODEOWNERS, `.github/**`, `scripts/**`, `supabase/**`, `packages/**`, `apps/**`, `*-krav-og-data.md`, `*-plan.md`, `mathias-gate/**` | mgrubak-approval          |
| **Bogføring** (kandidat: ejer-løs)   | `aktiv-plan.md`, `seneste-rapport.md`, `*-status.md`, `codex-reviews/**`, `plan-feedback/**`                                                                                         | grøn CI + Codex-disciplin |

**Grænse-cases til Mathias' afgørelse:** (1) `rapport-historik/**` — slut-rapporten har "slut OK"-chat-gate FØR merge; er PR-klikket derefter beslutning eller bogføring af en allerede truffet beslutning? (2) arkiv-flytninger ved pakke-luk. (3) `teknisk-gaeld.md`/`huskeliste.md` — G/H-førelse er bogføring, men G-accept er beslutning.

**Note:** chat-gaterne (krav OK / qwerg / slut OK) er ikke PR-klik og berøres ikke af snittet.

---

## E. Dagens målte friktioner (Mathias-input 2026-06-10, med dagens evidens)

1. **Mathias som relæ mellem aktørerne** — hvert tur-skifte krævede qwers/qwerr/qwerg-paste eller cross-paste af leverancer mellem paner.
2. **Re-approval-ping-pong / merge-kø** — dismiss-stale + rebase-auto-merge: hver merge gør den næste køede PR's approval stale → nyt klik. Målt: 11 sekventielle PR'er på én dag.
3. **Codes ventevinduer** — efter PR-armering venter Code på approval/CI uden vækning; død tid eller manuel polling.
4. **Vækning efter Mathias' approval** — auto-merge fyrer, men Code/Codex opdager det først ved næste manuelle sync.
5. **Review-værktøjet har ingen docs-§8.1-mode** (målt under denne recons egne reviews): `codex-review.sh` kender kun faserne plan/build/slut-rapport, så §8.1-klassens reviews af rene docs-ændringer (Review-klassifikation, §8.1) dispatches som plan-reviews → kategori-artefakt-KRITISK'er ("dette er ikke en plan") som en automatiseret runner ville halte på (exit 2). Gov-5's Codex-runner skal kende docs-klassen.

---

## G/H-opslag der rammer pakken (§3.2, manuel bro)

| G/H                                                        | Løses-i                               | Håndtering                                                                                                                                                              |
| ---------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [H028] mekanisk G/H-opslag i recon-doc'en                  | gov-5-automation / partnerskabs-runde | Denne recon udfører opslaget manuelt (broen). Om mekaniseringen leveres i gov-5 eller partnerskabs-runden: krav-dok-afgrænsning                                         |
| [G062] recurring types-drift (månedlige audit-partitioner) | — (durabel løsning udestår)           | Automation-tilstødende: durabel løsning (ekskludér partition-børn fra types-gen eller auto-regen-cron) er automations-arbejde — kandidat til gov-5-scope, Mathias afgør |
| [H029] tekst-staleness-gennemgang                          | dedikeret pakke efter gov-6           | Bevidst udskudt (Mathias 2026-06-10). Men: gov-5 ændrer selv sandheden (§6.2 m.fl.) og skal rette de tekster den selv forælder (§4 udtømt-formål) — ikke vente på H029  |

Øvrige åbne G/H (H012/G039, H025, G063) rammer ikke automation-scope.

---

## Åbne spørgsmål til krav-dok-fasen (Mathias afgør)

1. **Claude.ai-vækning:** accepteres headless rolle-kørsel (B-mulighed 1), platform-trigger (2, hvis muligt), eller forbliver Claude.ai-leddet manuelt i gov-5 (3)?
2. **Approval-snit (D):** valider/justér snit-tabellen + de tre grænse-cases.
3. **Pakke-skala:** skal Mathias-notifikation (C) og differentieret flade (D) leveres i samme pakke som vækningskæden (B), eller splittes? (Step 2's skitse-størrelses-tjek afgør den tekniske side.)
4. **H028/G062:** mekanisk G/H-opslag og types-drift-durabel-løsning — i gov-5 eller senere?

---

> **Ramme-gentagelse:** intet i dette dokument er besluttet. Transport, aldrig dømmekraft; manuelt flow består som fallback. Claude.ai skriver krav-dok-udkast på baggrund af denne recon + Mathias' svar på de åbne spørgsmål.
