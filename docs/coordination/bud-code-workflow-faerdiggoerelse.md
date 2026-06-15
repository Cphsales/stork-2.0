# Bud (Code) — workflow-færdiggørelse

**Type:** Konkurrence-bud fra Code — MIT eget bud, ikke en konsensus
**Dato:** 2026-06-15 · **Forfatter:** Code (`stork-code-bot`) · **Status:** BUD til Mathias-afgørelse
**Grundlag:** kontrakt `workflow-faerdiggoerelse-krav-og-data.md` + begge recons læst ordret (Code-recon `7f2dfae`, Codex-recon `f423d6b`).
**Framing:** dette er IKKE en afpudsning af V5/kæden. Det nuværende er kun inspiration. Hvert valg er prøvet mod spørgsmålet: _er det her det rigtige — eller bare det nærmeste på i dag?_
**Codex-afgrænsning:** Codex' eget udstyr reciteres ikke; hans side er taget fra hans recon på rolle-niveau.
**Modsvar:** alle afgørende opsætninger i §8 er **terminal-testede i vores setup** (rå output vist), ikke påstået.

---

## Kernetese — fire ambitiøse skift fra "i dag"

Den rigtige løsning er ikke "krav→plan→byg→slut med gates" pudset af. Den er bygget på fire skift:

1. **Specen er eksekverbar, ikke prosa.** Krav får stabile ID'er + acceptkriterier. _Dækning_ (er hvert krav adresseret i plan + bevist i test?) bliver **mekanisk og fail-closed**. _Mening_ (er kravet rigtigt forstået?) forbliver dømmekraft. → "intet bygges uden krav" er ikke en regel man husker; det er en gate der blokerer (§8E, testet).
2. **Verifikation er den knappe ressource — ikke generering.** Feltet er entydigt: _"the bottleneck is verification, not generation."_ Hele systemet er en **tragt** der maksimerer hvor meget billig, parallel, adversariel verifikation der sker FØR noget når en dyr verifikator (Codex) eller den dyreste (Mathias). Generering er billig og konkurrerende; verifikation afgør.
3. **Git + hændelser ER kædens tilstandsmaskine — ikke en bespoke daemon.** Tilstanden (spec, plan, verdikter, gate-ord) lever som author-verificerede git-objekter; flowet skrider frem på hændelser (GitHub-events/Actions/hooks). Ingen poll-kurér som primær (dens fulde e2e er ubevist; §7). Det giver immutabelt, author-verificeret spor gratis (§8B, testet).
4. **Mathias ser kun what-forks — aldrig mekanik.** Systemets job ved hvert lag er at _reducere_ hvad der når ham til de få ægte hvad-valg, i forretnings-sprog. Hans friskhed er en system-ressource, ikke en bekvemmelighed.

Tværgående: **konkurrence er standard-generatoren ved forks, aldrig afgøreren** (§8F). Og **ankret skrives kun af mennesker** (§7, felt-evidens).

---

## 1) STRUKTUR — step for step (en verifikations-tragt, ikke en lineær kæde)

Generering er bred og billig til venstre; verifikation strammer til højre; Mathias rammes kun af det destillerede.

| Step                                                                        | Hvad                                                                                                        | Transport (auto)                                                                | Dømmekraft (aktør)                                                                                                         |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **0. Åbning**                                                               | Mathias åbner pakken (forretnings-sprog)                                                                    | Hændelse vækker recon headless                                                  | Mathias: hvad-niveau                                                                                                       |
| **1. Bred recon (parallel, isoleret, konkurrerende)**                       | Code+Codex+Claude.ai laver hver sin recon i eget worktree                                                   | Lås hver via commit (immutabel, author)                                         | Hver aktør: uafhængige fund — divergens er signal                                                                          |
| **2. Spec-forfatning** ← **GATE 1 "krav OK \<hash\>"**                      | Mathias dikterer hvad; Claude.ai skriver **eksekverbar spec** (krav-ID + acceptkriterie, forretnings-sprog) | Mekanisk: spec-lint (hvert krav har ID+accept)                                  | **Mathias:** kravene = hans hvad. Eneste intentions-dømmekraft                                                             |
| **3. Konkurrerende planer**                                                 | Code+Codex bygger hver en plan-kandidat der mapper hvert krav-ID → plan-item → test                         | Mekanisk **dæknings-gate**: umappet krav-ID = FAIL (§8E)                        | Hver plan bærer sine to modsvar pr. afgørende valg                                                                         |
| **4. Adversariel verifikation → 4-aktør** ← **GATE 2 (betinget fund-gate)** | Multi-lens refutering af hver plan-kandidat; kun det der overlever når frem                                 | Saml verdikter; destillér til what-forks; fund-gate KUN hvis fundet er Mathias' | **Codex:** uafhængig kode-review · **Claude.ai:** krav-_mening_-PASS · **Code:** forsvar · **Mathias:** kun ægte what-valg |
| **5. Build (batches, isoleret)**                                            | Code bygger den vindende, verificerede plan                                                                 | Hooks(før)+selvtjek(frys)+CI(push) fail-closed; per-batch                       | Codex per-batch; Code teknik                                                                                               |
| **6. Luk** ← **GATE 3 "slut OK"**                                           | Slut-rapport; spec-dækning bevist grøn; repo-renhed                                                         | Merge→main = sporet; slette-plan kører                                          | Claude.ai: slut-review mod spec+vision · **Mathias:** slut OK                                                              |

**Vinderen mellem konkurrerende planer afgøres af verifikation mod spec** (dæknings-gate grøn + adversariel overlevelse + Codex-APPROVAL) — aldrig af hvilken plan der er mest overbevisende.

---

## 2) KOBLING — tråden der gør kæden stærk

- **Krav-ID'et er tråden gennem alt:** spec-ID → plan-item → test → slut-evidens. Et brud (umappet ID, test mangler) er mekanisk synligt ved _hvert_ led, ikke kun til sidst. Det er koblingen, ikke delene.
- **Git er samlingspunktet:** hvert led's leverance er et immutabelt, author-verificeret objekt; hand-off = commit/PR; forudsætning mellem led = required check (fail-closed), ikke hukommelse.
- **Verifikations-kapacitet er gennemløbs-grænsen:** tragten er designet så billig AI-verifikation filtrerer maksimalt før Codex/Mathias. Det kobler "beskyt friskhed" til arkitekturen, ikke til god vilje.
- **Isolation + lås gør konkurrence sikker:** eget worktree pr. aktør (ingen clobber — lært i denne pakke, §8B) + commit-lås. Uden den kobling kolliderer parallelle bud (det skete os).

---

## 3) AUTOMATISERING — transport vs. dømmekraft; fejl fanges undervejs

**Den skarpe grænse — og det nye snit _inden i_ validering:**

| Automatiseres (transport + _dækning_)       | Automatiseres ALDRIG (_mening_ + dømmekraft) |
| ------------------------------------------- | -------------------------------------------- |
| Flyt/lås artefakter (commit/PR)             | Er kravet det rigtige? (Mathias' hvad)       |
| Spec-lint + **krav-ID-dæknings-gate** (§8E) | Er kravet rigtigt _forstået_? (krav-mening)  |
| Hooks/CI/required checks (fail-closed)      | Kode-review-verdikt (Codex)                  |
| Væk aktører på hændelse; overvåg gates      | Plan-design + de to modsvar                  |
| Destillér verdikter til what-forks          | "Vinder"-valg = verifikation, ikke transport |

Det er det afgørende: **dækning** (mekanisk: er hvert krav adresseret?) skilles fra **mening** (dømmekraft: er det rigtigt?). Mekanikken tager dækningen; aktørerne beholder fuld mening.

**Fejl fanges i fire lag undervejs:** (1) hook FØR handling (fail-closed, §8A testet) · (2) selvtjek ved frys · (3) CI/dæknings-gate ved push (§8A+§8E testet) · (4) uafhængig aktør-verifikation ved led. Fail-closed på divergens/ukendt/åben-gate/stale.

---

## 4) KONTROLPOSTER — Mathias ser kun what-forks

**Tre author-verificerede gates (kun mgrubak):** GATE 1 "krav OK \<hash\>" · GATE 2 betinget fund-gate (kun hvis fundet er hans) · GATE 3 "slut OK".

**Hvad holder ham ude af det mekaniske (system-invariant, ikke disciplin):**

- Hvert lag _destillerer_: han præsenteres kun for ægte hvad-valg, i forretnings-sprog, som et valg — aldrig mekanik, aldrig kode.
- Aldrig hvordan-spørgsmål; rolle-validerede PR'er merger på grøn CI uden hans klik.
- Gaten er **ordet** (author-verificeret), ikke klikket.
- Hvis et lag ikke kan reducere noget til et hvad-valg, er det en bug i tragten — ikke noget Mathias skal bære.

**Fire-aktør-godkendelse ved tre led:** krav (Mathias hvad + Claude.ai spec-typist + Code/Codex recon) · plan (Codex APPROVAL + Claude.ai krav-mening-PASS + Code forsvar + Mathias kun hans-fund) · slut (Code rapport + Claude.ai review + Codex + Mathias slut OK).

---

## 5) ROLLE-OPSÆTNING — generator vs. verifikator; aldrig selv-verificér

**To rolle-typer pr. AI** (skift via `--agents`/`--agent`, `--permission-mode`, skills):

| Aktør         | WORKFLOW-rolle (headless, kontrakt-output, i kæden)    | ALMINDELIG rolle (interaktiv, bred) |
| ------------- | ------------------------------------------------------ | ----------------------------------- |
| **Claude.ai** | spec-typist, krav-mening-PASS, slut-review, gate-pakke | Mathias-dialog, sparring            |
| **Code**      | scriptet build/transport, struktureret status          | interaktiv fejlsøgning              |
| **Codex**     | uafhængig read-only review-verdikt (kontrakt)          | kode-recon-sparring                 |

Workflow-rollen er transport-parsbar (§8C testet); den almindelige bærer dømmekraft/dialog.

**Strukturel uafhængighed (nyt):** den aktør der _genererer_ noget, _verificerer_ det aldrig selv. Generator-mode og verifikator-mode er adskilte; verifikation kommer altid fra en anden aktør/lens. Det er det der gør "aktørerne løfter hinanden" til en garanti, ikke en venlighed.

**Kræfter hvor de giver mest værdi:** dyr dømmekraft på kapabel model/høj effort; mekanik billigt/scriptet (felt: per-rolle model/effort). **Max 3-5 parallelle spor** — fordi verifikation, ikke generering, er flaskehalsen.

---

## 6) DOKUMENT-OPSÆTNING

**Én sandhed:** den **eksekverbare spec** (krav-ID'er) pr. pakke; vision+forretning er det LÅSTE anker. **Idé-docs MÅ modsige** — kandidater, ikke sandhed; fysisk adskilt mappe så modsigelse ≠ drift.

**Ankret skrives kun af mennesker** (§7): AI må udkaste forslag til menneske-godkendelse, aldrig auto-forfatte/-opdatere spec/vision/governance.

**Workflow-docs (kører kæden) vs. udenom (reference):**

```
docs/
  strategi/      ← vision + forretning (LÅST anker, kun menneske-forfattet)
  workflow/      ← rolle-instrukser, regelbog, gate-defs, spec-skema (kører kæden)
  coordination/  ← eksekverbar spec + plan + status pr. aktiv pakke
    arkiv/       ← lukkede pakke-artefakter (læsbar reference)
  reference/     ← kataloger, teknik, historik, idé-docs (må modsige)
```

**Ingen dubletter:** owns-register + `governance-check` håndhæver mekanisk (§8A testet: 6 checks). **Slette-plan (kandidater, afgøres ved luk):** recon/bud-filer → arkiv; `claude-code-egenskaber.md` (recon-input, formål udtømt) → arkiv; idé-/gov-tråde → foldes ind i `workflow/` eller arkiv. Princippet er buddet; den konkrete sletning er en luk-beslutning.

---

## 7) FRAVALG (velbegrundet — det dristige fravalg er pointen)

- **Prosa-spec læst af et menneske** — FRAVALGT til fordel for eksekverbar spec m. mekanisk dækning. En menneske-læsning skalerer ikke og misser udeladelser (§8E testet fanger dem).
- **Poll-kurér/daemon som primær drift** — FRAVALGT: gov-5 viser den er bygget men fuldt e2e ubevist; git+hændelser er enklere, immutabelt og uden race. Daemon = nød-fallback.
- **Én reviewer pr. fund** — FRAVALGT: adversariel multi-lens fanger "plausibelt-men-forkert" som én reviewer misser (felt + Code-recon).
- **AI-forfattet/auto-opdateret anker (CLAUDE.md/governance)** — FRAVALGT: felt-evidens, AI-genereret kontekst kan _sænke_ succes (~3%); menneske-skrevet hjælper.
- **Delt arbejdstræ som kanal** — FRAVALGT: clobber-bevist (§8B).
- **Cowork/desktop/cloud som gate** — FRAVALGT: author-verifikation kan ikke flyttes til en lokal fil (begge recons).
- **Bredt fan-out (>5)** — FRAVALGT: verifikations-flaskehalsen er grænsen, ikke agent-antal.
- **Stående konkurrence som afgører** — FRAVALGT (§8F): belønner det overbevisende.
- **`/goal` som gate** — FRAVALGT: evaluator kan ikke kalde værktøjer (transcript-only).

---

## 8) MODSVAR — afgørende opsætninger, TESTEDE mod TO alternativer hver

### 8A — Enforcement: hook(før)+CI(efter) · vs. prosa · vs. CI-only

- **Testet hook (før):** armet lås → Bash med blokeret mønster **hård-blokeret** (`exit 2`, kørte aldrig); lås fjernet → kører.
- **Testet CI (efter):** `node scripts/governance-check.mjs` → 6 checks (`laesefoelge-targets, pointer-validity, owns-uniqueness, number-home-uniqueness, H-ref-integrity, structural-chain`) `alle passed (28 docs, 3 scripts)`, exit 0.
- **Modsvar:** prosa fanger intet pålideligt; CI-only fanger først efter push (allerede i historik). Lagdeling slår begge.

### 8B — Tilstand/kanal: git commit/PR · vs. delt-FS-untracked · vs. kæde-daemon

- **Testet (mit):** `git show 7f2dfae` → `author=stork-code-bot … hash=7f2dfaef614…` (author + immutabel).
- **Testet Modsvar 1 (delt-FS):** skrev `v1` → overskrev `v2`; `cat`→`v2`; git-author for untracked: **[ingen]**. Reel evidens: min recon blev overskrevet in-place (→ PR #160-lås).
- **Testet Modsvar 2 (daemon):** `systemctl --user is-active stork-kaede` → **`inactive`**. → kun git giver immutabelt author-spor som "main = sporet" kræver.

### 8C — Workflow-rolle-output: custom-agent-kontrakt · vs. generalist-prosa · vs. manuel session

- **Testet (mit):** `claude -p --agents '{"verdikt":…}' --agent verdikt …` → `{"verdikt":"PASS"}`; `jq -r .verdikt` → `PASS`.
- **Testet Modsvar 1 (prosa):** → `Ja. 2+2=4 holder.`; `jq .verdikt` → **parse error** (transport kan ikke bære det).
- **Modsvar 2 (manuel session):** ikke headless-deterministisk → egner sig til den _almindelige_ rolle, ikke kædens substrat.

### 8D — Drift åbning→luk: hændelses-drevet · vs. poll-daemon · vs. cloud-routine

- **Testet (mit):** background-task → `<task-notification>` ved exit; Monitor → 3 per-event-notifikationer + stream-end (hændelse, ikke poll).
- **Modsvar 1 (daemon):** `inactive`, e2e ubevist (§8B/begge recons), poll → stale/race.
- **Modsvar 2 (cloud):** maskine-uafhængig men mister lokal working-copy + connector-scope (begge recons). → hændelses-drevet giver lokal write-flade OG immutabelt spor.

### 8E — Eksekverbar spec: mekanisk krav-ID-dæknings-gate · vs. prosa-læsning · vs. ingen dækningskrav

- **Testet (mit):** spec med `K1/K2/K3` + plan der kun mapper `K1/K2` → gate: `✗ K3 UMAPPET — gate FAIL`, `GATE BLOKERER (intet bygges uden krav bag)`. Tilføj `K3` → `umappede krav: 0 → GATE GRØN`.
- **Modsvar 1 (prosa-læsning):** et menneske/AI der læser krav-dok sætning-for-sætning misser udeladelser under træthed (felt: kontekst-degradering); ingen fail-closed.
- **Modsvar 2 (intet dækningskrav):** "intet bygges uden krav" bliver en hensigt, ikke en gate. → mekanisk ID-mapping er det eneste af de tre der _blokerer_ et umappet krav.
- (Mening forbliver dømmekraft — gaten beviser dækning, ikke korrekthed; derfor stadig Codex+Claude.ai.)

### 8F — Konkurrence: generator JA · afgører NEJ (din idé, vurderet)

- **Løfter (adopteret, Step 1+3):** uafhængige konkurrerende forslag bryder første-løsning-svagheden og afdækker blinde vinkler — kontraktens to-modsvar + feltets debate/judge-panel.
- **Skader (fravalgt som afgører):** en konkurrence belønner det mest overbevisende lige så meget som det mest korrekte (din pointe); for konvergent/mekanisk arbejde er den rent spild; den kan gøre "modspil der løfter" til rivalisering.
- **Min løsning:** konkurrence genererer; **verifikation mod spec afgør** (8A–8C+8E er afgørelses-mekanikken — det der virker bevist, ikke det der lyder bedst).

---

## Bilag — kravsdækning (kontraktens "Workflowet skal kunne")

Vision/krav/plan/slut-sammenhæng → eksekverbar spec som tråd (§1,§2). Intet uden krav / intet lukket uden validering → dæknings-gate+gates (§3,§8E). Sammenhæng med kode → kode-recon+Codex (§1,§4). Forretnings-recon 100% dækkende → Step 1+2 (§1). Kode-recon fanger misforståelser → Step 4 (§4). Fire-aktør-godkendelse → §4. Fang brud undervejs → fire lag (§3). Transport ikke dømmekraft → §3 (dækning vs. mening). Aktører løfter hinanden → strukturel uafhængighed (§5). Test hvor det skaber værdi → §3+§8. Repo-renhed → §6. Main=sporet → git-tilstand (§2,§8B). Kræfter hvor mest værdi → §5. Auto åbning→luk + beskyt friskhed → §3,§4 (destillation). Mathias ude af mekanik → §4. To rolle-typer → §5. Fordel roller (grundighed+effektivitet) → §5 (model/effort+3-5 cap). To modsvar pr. funktion → §8 (testet).
