# Plan — Build 1.1 (M2 runtime/acceptance) + Build 1.2 (S1l app-chat-recon)

> **Scope-lås (Mathias 2026-06-18 — split):** **Build 1.1 = M2 runtime/acceptance UDEN Claude.ai app-chat-recon** — **IKKE** fuld Plan 1-front-halvdel. **Build 1.2 = S1l Claude.ai app-chat-recon** (den rigtige kanal), før Build 2/Plan 2. "Den rigtige løsning vinder over den hurtige": S1l løses ikke med løs copy/paste-bro.
>
> **Done-kriterier:**
>
> - **Build 1.1 (M2):** grøn når en **reel, committet testpakke** kan køres gennem front-halvdelen **uden fixtures** (trigger → aktører → recon-sandhed → krav-oplæg → gates) — **uden app-chat-recon**. Grøn for **M2**, ikke fuld Plan 1.
> - **Build 1.2 (S1l):** grøn når **reel Claude.ai app-chat-recon** kører (se Build 1.2-sektion).
> - **STOP-REGEL (bindende):** **Plan 2 / Build 2 må IKKE starte før BÅDE (a) Build 1.1 M2-acceptance er grøn OG (b) Build 1.2 S1l-acceptance er grøn** — hvis Plan 2 skal være fuld Plan-1-front-halvdel-test.

**Pakke:** workflow-færdiggørelse · **Del:** Build 1.1 (fix-pakke for Pakke 1's front-halvdel) · **Forfatter:** Code · **Status:** UDKAST (ingen commit/build før Mathias godkender)

**Grundlag:**

- Build 1 `origin/main @ 97a650d` · Plan 1 v26 `@ 87652387`.
- Konsolideret funktionstest (Code + Codex, 2026-06-18): strukturel kontraktlogik **stærk** (**S8/S9 = strukturelt PASS / runtime DELVIS**); runtime front-halvdel **RØD**; S14 acceptance **syntetisk**; **S15-full RØD**; `scripts/kaede` har **reel** transport, men er **ikke koblet** til `workflow/`.
- **Eksisterende infra (verificeret):** `scripts/kaede/adapters/codex.sh` (`codex exec … < /dev/null`, frossen @ SHA), `code.sh` + `claude-ai-rolle.sh` (`claude -p … < /dev/null`); `codex` CLI på PATH. → **Code kan køre Codex headless fra sin terminal nu.**
- Build 1.1 laves **manuelt**, ikke gennem den brudte front-halvdel.

## Formål

> **Anker-note (H-pakke-pragmatik):** Build 1.1 er ren intern tooling med Mathias som eneste stakeholder → **ingen separat låst krav-dok**. Dette `## Formål` + `Done-kriterier` + `Scope-lås` (øverst) **ER det låste anker** (Mathias-låst 2026-06-18). Skabelonens "Formål 1:1 fra krav-dok" gælder ikke, fordi der bevidst ikke er en krav-dok.

Gør Pakke 1's front-halvdel til et **reelt runtime/acceptance-substrat (M2)**: trigger → aktører → recon-sandhed → krav-oplæg → gates skal kunne køres som en **committet testpakke uden fixtures** og **uden app-chat-recon** (→ Build 1.2), gennem de reelle CLI-aktørkanaler (Code/Codex/`claude -p`). **Mål-tilstand:** ingen rød eller syntetisk test kan længere give "færdig"; acceptance er runtime-bevist på committet pakke (F01–F26). Build 1.1-grøn = **M2**, ikke fuld Plan 1.

## Preconditions (§3.2 + §3.3)

### Verificerede DB-objekter

**N/A** — Build 1.1 er workflow/CLI-runtime (`scripts/kaede` + `workflow/`-JSON-state + git-committede aktør-artefakter). **Ingen Supabase/DB-objekter, RPC'er eller policies i scope** → intet DB-state-dump. Front-kæden persisterer state i git/JSON, ikke i DB.

### End-to-end-spor (§3.3)

**N/A som write-RPC-spor** — ingen write-RPC/DB-vej. Det reelle end-to-end-spor er **trigger → aktør → committet artefakt (`computedArtifactSha`) → gate** og bevises eksplicit af **A10 / F01–F26** (én pakke gennem hele kæden uden fixtures).

### G/H-opslag (§3.2 — manuel bro, jf. H028)

Åbne G/H filtreret på Løses-i mod dette scope:

| G/H | Løses-i | Rører Build 1.1-scope? | Håndtering |
| --- | ------- | ---------------------- | ---------- |
| **G063** (LAV) — midlertidig governance-check-allowlist for `v4-slettede-docs` | gov-6 | Nej — governance-check-housekeeping, ikke front-runtime/acceptance | **Bevidst udskudt** (gov-6 folder dir'en → fjern allowlist). Ingen berøring med A1–A10. |
| **H028** (åben) — mekanisk G/H-opslag i recon-mekanismen | gov-5-automation / partnerskabs-runde | Delvist — A5 (reel recon) er beslægtet | **Bevidst udskudt** til mekanisering; Build 1.1's A5 bruger reel CLI-recon, og §3.2's **MANUELLE** G/H-opslag (denne tabel) ER broen indtil da. Ingen mekaniseret opslag bygges i 1.1. |

Ingen øvrige åbne G/H rammer dette scope.

## Grundprincip (bindende)

En test der ikke virker bliver præcist ÉN af fire: **A)** bygget i 1.1 (rød runtime-test) · **B)** omklassificeret som unit/structural og fjernet fra acceptance (syntetisk falsk-grøn) · **C)** hærdet mod papirgrøn (semantisk felt-tjek) · **D)** eksplicit udskudt med ejer + begrundelse (ikke færdig). **Ingen rød eller syntetisk test må længere give "færdig".**

## Fremgangsmåde for Build 1.1 (arbejdsmetode — rolle-adskilt)

Planen valideres ikke bare efter build; den **forbedres løbende** af Code/Codex uden at blande roller. Cyklus: **Code skriver/indarbejder → Codex reviewer (finder huller, må levere konkret forbedringstekst) → Code indarbejder → Codex reviewer igen → Mathias låser beslutninger/gates sidst.**

1. Recon-/funktionstest-fund omsættes til **konkrete planændringer**, ikke kun accept/afvisning.
2. Reviewer må levere **forbedringstekst**, men **committer aldrig som forfatter** (rolle-adskillelse; Code er forfatter).
3. Hver forbedring **spores til et fund eller en rød/delvis funktion** (ingen anonyme ændringer).
4. Ingen funktion kaldes færdig, før dens **acceptance viser samme type effekt som funktionen lover** (runtime-effekt, ikke form).
5. Structural tests må bevares, men **tæller aldrig som acceptance**.
6. **Acceptance-registeret er state-of-record** for hvad der kræves for grøn.
7. **Mathias får beslutningsfladen** (kondenseret, beslutningsklar), ikke teknisk støj.

## Håndhævelse — acceptance-register

`workflow/acceptance-register.json` (ny) er **state-of-record**. Den tagger hver test `acceptance` | `structural` | `deferred{ejer, begrundelse}`, og mapper hver kanariefugl (F-ID nedenfor):

```
{ id, class: "acceptance", station, seed, expectedFailure, runtimeProof }
```

- **"Færdig"/acceptance-grøn kan KUN gives** når alle `acceptance`-tests er **runtime-grønne på en committet pakke** (A10).
- **Ingen acceptance må stå "covered" uden `runtimeProof`** på committet testpakke.
- En `structural`/syntetisk test **kan aldrig** bidrage til acceptance.
- En `acceptance`-test uden runtime-impl = **rød gap**, vist åbent (ingen exit-0-rapport-snyd).
- CI adskiller eksplicit **structural selftests** (kontraktlogik) fra **acceptance run** (runtime på committet pakke).

## Aktør-artefakt-format (kanonisk — A2/A7/C)

Hvert reelt aktør-output (Codex recon/review/verdikt; senere de øvrige) committes som artefakt i dette format:

```
{ actor, packageId, role, sourceSha, targetSha, coverage, evidenceRefs[], verdict, notVerified, generatedAt }
```

- **SHA-integritet (bindende):** `artifactSha` er **IKKE** et selvrapporteret felt. Gaten beregner selv **`computedArtifactSha`** fra den committede fil (git blob/commit-SHA) og binder den til state/register. Påstår en aktør-rapport selv en SHA, er det **kun metadata — aldrig autoritativt**. Et aktør-artefakt kan dermed ikke lyve om sin identitet (samme værn som mod fixtures).
- **antiPaperGreen (bindende):** tomme felter, `"x"`, placeholders eller generisk tekst (coverage uden konkret flade, evidenceRefs uden reel reference) = **FAIL**.
- **Tre aktør-artefakter (bindende — Codex-fund):** gaten kræver ÉT committet artefakt pr. AI-aktør — **Code, Codex, Claude.ai** — hver i dette format og gate-SHA-bundet. **Code-workflow-aktøren producerer sit EGET artefakt, adskilt fra Code-transport/orkestrator** (A1). Manglende aktør-artefakt eller orkestrator-fabrikeret verdikt → **BLOKER (F23)**.

---

## Patch-først pr. ændret flade (§3.1)

A1/A2/A7 **genbruger** eksisterende flader som transport-MOTOR; de **bevares 1:1** (intet gate/kommentar/spor fjernes). Tilføjelsen er **kobling til `workflow/`-runtime-facit + reel aktør-fødning**, ikke omskrivning. Nuværende bodies (ankre):

- **`scripts/kaede/dirigent.mjs`** — qwers-aktivering (l.62–72, bindende format), dispatch-log (l.34 `.dispatch-log.jsonl`; idempotens i `udfoer()` l.332+), fail-closed (l.48/70/253/353/395/448/525/615), transport-commit (l.359/425), parallel dispatch (l.180–184). **Bevares uændret som motor.** A1 tilføjer kun kobling: kaede-state ↔ `workflow/`-runtime-facit; **divergens → BLOKER**.
- **`scripts/kaede/kaede-regler.json`** — author-check (l.8–10: `gate_author:"mgrubak"`, `bot:"stork-code-bot"`). **Bevares.**
- **`scripts/kaede/adapters/codex.sh`** — headless-mønster (l.61–63: `codex exec --skip-git-repo-check … < /dev/null`, frossen @ SHA). **A2 genbruger mønstret 1:1**; intet ændres i adapteren.
- **`workflow/gate-def.json`** — gate-ord + dispositioner (l.7–16). **Definitionen bevares (ejet af `disciplin.md`, `governance-owns` disciplin.md:3).** A7 ændrer IKKE gate-ord/dispositioner; den tilføjer kun **runtime-fødning** fra reelle aktør-artefakter.
- **`workflow/acceptance-register.json`** — **NET-NY fil** (findes ikke i dag) → ingen eksisterende body at bevare; ren tilføjelse. State-of-record for **runtime-acceptance-facit** (ikke definitioner).
- **Læseflade** — `CLAUDE.md` (l.6–7 → LÆSEFØLGE), `docs/LÆSEFØLGE.md` (l.1–44, 6-kilders orden), `docs/coordination/aktiv-plan.md` (l.1–6, pointer-doc, i dag `aktiv-pakke: ingen`). **Trigger-/kilde-strukturen bevares;** A1 tilføjer kun en peger til ÉN runtime-sandhed (Build-1-flowet), så frisk aktør finder kæden uden gæt.

---

## A — Røde runtime-tests (bygges i 1.1)

_Afhængigheds-ordnet; hvert step kræver **runtime-effekt**, ikke selftest._

- **A1 — Integrér `scripts/kaede` ↔ `workflow/` til ÉN runtime-sandhed; Code = runtime-orkestrator/transport.** Genbrug qwers, author-check, dispatch-log, fail-closed, transport-commit, parallel dispatch. **Ejer-afgrænsning (§8.1):** `scripts/kaede` er transport-MOTOR. **`disciplin.md` forbliver DEFINITIONS-HJEM for gates, test-klassifikation og severities** (`governance-owns`, disciplin.md:3 — "eneste rolle- og proces-hjem"). **`workflow/` er den AUTORITATIVE RUNTIME-FACIT** — det committede state-register for hvad der faktisk er bestået/klassificeret på committet state — **IKKE et andet definitions-hjem.** Ikke to parallelle systemer. Divergerer kaede-state og workflow-state → **BLOKER**. Opdatér læsefladen (CLAUDE.md / LÆSEFØLGE / aktiv-plan / disciplin) → frisk aktør finder Build 1-flowet (én sandhed). Code orkestrerer **kun transport** (opgave/SHA), aldrig dømmekraft. **Skarp rolle-adskillelse (Codex-fund):** Code-**transport/orkestrator** må ALDRIG skrive eller ændre actor-verdikter — den flytter kun opgave/SHA. Code-**workflow-aktøren** er en separat rolle, der producerer sit eget committede actor-artefakt (A7/M2) på samme vilkår som Codex/Claude.ai. _Bevis:_ `qwers <pakke>` → aktivering deterministisk; kaede↔workflow-state-divergens → BLOKER; orkestrator-fabrikeret Code-verdikt → BLOKER (F23).

- **A2 — Code→Codex CLI = første reelle aktørkanal (broen fra substrat til levende workflow).** Code starter Codex **headless** (`codex exec … < /dev/null`, frossen @ SHA — `codex.sh`-mønsteret) med **committet prompt + committet expected-output-format**. Codex' svar gemmes som **reelt, committet aktør-artefakt** i det kanoniske format; **gaten beregner selv `computedArtifactSha` fra den committede fil** og binder den til state — aldrig selvrapporteret SHA eller håndlavet fixture/literal. Build 1.1 beskriver IKKE længere Codex-verdikter som JSON-literals. _Gate-kanariefugle:_ F03 · F04 · F05 · F06 (se F-ID-liste).

- **A3 — Claude.ai-kanal (BESLUTTET, Mathias 2026-06-18).** Headless `claude -p` (`claude-ai-rolle.sh`, findes allerede) **tæller som Claude.ai-workflow-aktør for gate-verdikter** → alle tre aktørers verdikt-kanal reel (M2), ingen afvigelse fra "alle tre". **Afgrænsning (bindende):** dette tæller **IKKE** som **S1l chat-recon** fra Claude.ai Windows-app'ens chathistorik — den forbliver **uløst og app-bundet → løses i Build 1.2** (reel kanal). `claude -p` må aldrig bruges til at påstå S1l dækket. _Bevis:_ Claude.ai-verdikt committet som gate-SHA-bundet artefakt via egen kanal; S1l løses i Build 1.2.

- **A4 — S15 minimum-inventory grøn FØR reel recon.** Recon (A5) læser aktive sandheder, én pr. emne. _Bevis:_ min.-scope grøn; konkurrerende sandhed → BLOKER før recon (F09/F20).

- **A5 — S6 reel recon.** Faktisk recon på begge punkter (forretnings-recon før krav; kode-recon før plan) + dokument-recon, via de reelle CLI-kanaler (A2/A3) → **committet, hash'et recon-sandhed**. **S1l chat-recon (claude.ai-app) er IKKE inkluderet (→ Build 1.2, markeret åben — aldrig faket grøn).** _Bevis:_ recon-sandhed-1/2 committet; krav/plan bygges FRA hash'en; F07/F08/F10.

- **A6 — S7 kravspec fra reel recon-hash.** _Bevis:_ krav-hash bundet mod committet recon-hash-1; F11/F12/F13.

- **A7 — S8/S9 gates fra reelle aktør-artefakter (tre AI + Mathias sidst).** Gaterne fodres af **tre committede AI-aktør-artefakter — Code, Codex, Claude.ai** — hver med **gate-beregnet `computedArtifactSha`**, **ikke testdata/literals/selvrapporteret SHA**. Code-aktør-artefaktet er adskilt fra Code-transport (A1). Strukturen er hård (PASS); kun runtime-fødningen tilføjes. _Bevis:_ fire-aktør (F14) inkl. Mathias sidst (F16), dual-hash/ikke-stale (F17) på gate-SHA-bundne artefakter; manglende/orkestrator-fabrikeret Code-verdikt → BLOKER (F23); F15.

- **A8 — S11 reel master-plan snapshot/diff** (ikke flags). _Bevis:_ reel ændring/modsigelse → Mathias-gate mekanisk (F21).

- **A9 — S15 final docs-handling grøn FØR acceptance.** Fuld `docs/`-klassifikation + handling (behold/fold/arkivér/slet) + `s15-full --gate` **hard-wired**. _Bevis:_ exit 0 på rent repo-sæt; F19/F20.

- **A10 — S14 reel acceptance uden fixtures** (se nederst).

## B — Syntetiske tests omklassificeret (ud af acceptance)

- **`e2e-check.mjs` → omdøbes** (fx `kontrakt-kompositions-check.mjs`); det er **ikke** e2e (tråder fixtures); tagges `structural`. Den rigtige e2e er A10.
- **Alle `*-check.selftest.mjs`** beviser kun kontraktlogik → `structural`; må aldrig tælle som acceptance.
- **Strukturelt-grønne validatorer** (gate-ord, spec-matrix, scale-router, review-dybde, recon-dybde, repo-hygiejne, handoff-binding, worklog-drift) forbliver `structural`.

## C — Semantiske tests hærdet (mod papirgrøn)

Gælder **S1c, S1d, S1e, S1f (menings-gate), S1k (djævel), S1m, S6/S7 (krav⊨vision + build-vs-ønsker)**. Hvert gate kræver en **durabel aktør-rapport i det kanoniske artefakt-format** (gate-SHA-bundet) + antiPaperGreen-reglen. Ikke automatisk "AI-dommer" — men felt-tilstedeværelse alene er ikke nok.

## D — Eksplicit udskudt (ejer + begrundelse — IKKE færdig)

_Mathias-accepteret 2026-06-18 som **"ikke færdige, uden for Build 1.1" — IKKE som løst.** Tagges `deferred`; må aldrig fremstå som leveret._

| Test                              | Ejer          | Begrundelse                                                                                                                 |
| --------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| S10 reel PR-review-runner         | Pakke 2       | Gate-integritet dækket af A7+C; review-eksekvering blokerer ikke front-bevis.                                               |
| build-tids cost-levers            | Pakke 2       | Byg-fase, ikke front-halvdel.                                                                                               |
| multi-schema ledger               | Pakke 2       | Worklog v1 rækker; kun hvis Plan 2 beviser behov.                                                                           |
| S5 cost-synlighed                 | Pakke 2       | Blokerer ikke front-bevis.                                                                                                  |
| S5 livscyklus (prov.→signal→lock) | Pakke 2       | **BESLUTTET udskudt:** resolved scale (routeren, grøn) er nok for front-proof; fuld livscyklus-state ikke runtime-critical. |
| S1l chat-recon (claude.ai-app)    | **Build 1.2** | **IKKE løs M3:** egen build (Build 1.2) med reel kanal — se Build 1.2-sektion. Blokerer fuld Plan-1-test til den er grøn.   |

## Rækkefølge

A1 → A2 → A3 → A4 → A5 → A6 (C hærder A5–A7) → A7 → A8 → A9 → **A10 acceptance**.

## A10 — Acceptance-test (erstatter syntetisk e2e)

**Reel, committet testpakke gennem hele kæden uden fixtures** (trigger → aktører → recon-sandhed → krav-oplæg → gates). Acceptance-grøn = front-halvdelen producerer godkendt plan uden hånd-syning, **og hver kanariefugl (F-ID) fanges af sin station med `runtimeProof`**. Dette er **M2-acceptance** (Build 1.1) — **Plan 2 først efter M2 OG Build 1.2 S1l (stop-reglen).**

**Afgrænsning (bindende):** A10 er den **fulde M2-runtime-suite (F01–F26)** — **ikke** "fuld Plan 1-suite". **S1l chat-recon** (claude.ai-app) er **ikke en løs M3-udskydelse**: den er **Build 1.2** (egen build, reel kanal, før Build 2/Plan 2) og tæller **ikke som løst** før Build 1.2-acceptance er grøn.

**Kanariefugl-suite (eksplicit F01–F26 — ingen "~20"; hver mappes i acceptance-register):**

| F-ID | Seedet fejl                                                                                               | Station | Forventet      |
| ---- | --------------------------------------------------------------------------------------------------------- | ------- | -------------- |
| F01  | forkert author                                                                                            | A1      | IGNORER/BLOKER |
| F02  | qwers aktiverer ikke alle krævede aktører                                                                 | A1      | FAIL           |
| F03  | aktør kører ikke                                                                                          | A2      | FAIL           |
| F04  | aktør-output ikke committet                                                                               | A2      | FAIL           |
| F05  | actor-artefakt ikke gate-SHA-bundet                                                                       | A2      | FAIL           |
| F06  | actor-rapport placeholder/tom/"x"                                                                         | A2/C    | FAIL           |
| F07  | recon stopper for tidligt                                                                                 | A5      | FAIL           |
| F08  | recon uden dokument-recon                                                                                 | A5      | FAIL           |
| F09  | recon uden S15-inventory-grundlag                                                                         | A4/A5   | FAIL           |
| F10  | divergerende/u-konsolideret recon                                                                         | A5      | BLOKER         |
| F11  | kravspec ikke bygget fra recon-hash                                                                       | A6      | FAIL           |
| F12  | kravspec uden reel medforfatterrapport                                                                    | A6      | FAIL           |
| F13  | krav driver fra vision/forretning uden FEEDBACK                                                           | A6      | FAIL           |
| F14  | S8/S9 bruger literal/fixture i stedet for actor-artefakt                                                  | A7      | FAIL           |
| F15  | approval uden djævlens-advokatrapport                                                                     | A7      | FAIL           |
| F16  | Mathias ikke sidst                                                                                        | A7      | FAIL           |
| F17  | stale planSha/kravHash                                                                                    | A7      | BLOKER         |
| F18  | plan modsiger vision/krav uden FEEDBACK                                                                   | A7      | FAIL           |
| F19  | S15-full rød                                                                                              | A9      | BLOKER         |
| F20  | konkurrerende aktiv sandhed i docs/                                                                       | A4/A9   | BLOKER         |
| F21  | master-plan ændret uden snapshot/diff/Mathias-gate                                                        | A8      | BLOKER         |
| F22  | cost/runaway el. hele-historik-recon hvor inventory skulle bruges                                         | A5      | FLAG/BLOKER    |
| F23  | transport/orkestrator auto-validerer/muterer actor-verdikt · el. manglende/fabrikeret Code-aktør-artefakt | A1/A7   | BLOKER         |
| F24  | Mathias-flade indeholder hvordan/kode/kommando i stedet for beslutningsflade                              | A6/C    | FAIL           |
| F25  | invalid kravspec-matrix (K-ID uden step/test · plan-step uden krav · Pakke-2 uden begrundelse)            | A6      | BLOKER         |
| F26  | handoff uden self-valideringsrapport bundet til artefakt/SHA                                              | A7/C    | FAIL           |

**Milepæls-fasing:** (M1) **Code↔Codex** reel kæde uden fixtures = første sande bevis på broen. (M2 = Build 1.1) **alle tre** verdikt-kanaler reelle (Code + Codex + `claude -p`, jf. A3). (**Build 1.2 = S1l**) reel claude.ai-app-chat-recon-kanal — egen build før Build 2/Plan 2. **Build 1.1 acceptance-grøn = M2** (ikke fuld Plan 1).

## Beslutninger (LÅST — Mathias 2026-06-18)

1. **A3:** headless `claude -p` (claude-ai-rolle.sh) tæller som **Claude.ai-workflow-aktør for gate-verdikter** → alle tre reelle (M2). Ingen afvigelse fra "alle tre".
2. **Afgrænsning:** `claude -p` tæller **IKKE** som S1l chat-recon fra Claude.ai Windows-app'ens chathistorik.
3. **S5 livscyklus:** eksplicit udskudt; resolved scale er nok for Build 1.1 front-proof.
4. **C/D:** accepteret som **"ikke færdige, uden for Build 1.1" — ikke som løst.**
5. **Split (den rigtige løsning vinder over den hurtige):** S1l er **ikke** løs M3 — den er **Build 1.2** (reel kanal). **Build 1.1 = M2 uden app-chat-recon; Build 1.2 = S1l; Plan 2 først efter begge** (stop-reglen øverst).

## Build 1.2 — S1l Claude.ai app chat-recon (den rigtige kanal, før Build 2/Plan 2)

S1l-chat-recon-**kontrakten** (citat/dato/tråd + klassifikation) findes allerede som validator (Build 1). Build 1.2 tilføjer den manglende **reelle KILDE-kanal** + binding. Recon-fund (autoritativt, citeret, 2026-06-18):

**Kanal-muligheder (rangeret — afgøres af konto-tier):**

- **(A) Compliance API — den rigtige, automatiserede kanal · KRÆVER Claude Enterprise.** `/v1/compliance/apps/chats` + `/messages`; Compliance Access Key (`read:compliance_user_data`). Kilde-ankret (chat-id, title, created_at, stabil `https://claude.ai/chat/…`-href, project_id), dato-filtrerbar, inkrementel. **Findes ikke på Free/Pro/Max.**
- **(B) Struktureret eksport-reader — reel, semi-manuel · virker på Pro/Max.** claude.ai → Settings → Privacy → Export → ZIP m. JSON (chat-id, title, timestamps, tråde, **stabil chat-URL pr. samtale**). Struktureret + kilde-markeret + reproducerbar (≠ copy/paste). Begrænsning: manuel trigger, fuldt snapshot. Privatliv: rå-arkiv **lokalt**; kun kilde-ankrede fund + content-hash committes.
- **Afvist:** `/remote-control`, `/teleport` (kun Claude Code-session), løs copy/paste (ingen kildeanker).
- **ÅBEN FAKTA (Mathias):** Er jeres claude.ai **Enterprise** (→ A) eller **Pro/Max** (→ B)? Afgør den rigtige kanal.

**Build 1.2 acceptance (grøn kræver):**

- reel Claude.ai app/export/MCP/connector-kanal (A eller B) — ikke løs relay.
- kilde/dato/tråd (eller tilsvarende stabil reference, fx chat-href) pr. fund.
- committet S1l actor-artefakt (kanonisk format), gate-SHA-bundet.
- **Kanariefugle:** ukildet chat-påstand → **FAIL** · chat-beslutning ignoreret → **FEEDBACK/FAIL** · modsigelse mod låst doc uden `tilMathias` → **FAIL** · fund ikke bundet til den reelle kilde (paraphrase/hukommelse) → **FAIL** (relay-snyd).

## Review-spor (forbedringer → fund)

- **Codex runde 1 (paste):** F01–F22 + computedArtifactSha + én runtime-sandhed + rolle-adskilt fremgangsmåde.
- **Codex runde 2 (egen git-læsning, PR #172):** Code-aktør-artefakt adskilt fra Code-orkestrator (F23) · F24–F26 tilføjet · A10/S1l-ordlyd præciseret.
- **Mathias-split (2026-06-18):** S1l flyttet fra løs M3 → **Build 1.2** (egen build, reel kanal); Build 1.1 omdøbt **M2 uden app-chat-recon** (ikke fuld Plan 1); **stop-regel** tilføjet (Plan 2 efter 1.1 M2 + 1.2 S1l). Autoritativt recon-fund: Compliance API (Enterprise) vs struktureret eksport (Pro/Max).
- **Codex runde 1 på split-PR #173 (egen git-læsning, 2026-06-18):** KRITISK ×3 + MANGLENDE-EKSISTERENDE-BEVARELSE → **V2** tilføjer `## Formål`-anker (H-pakke-pragmatik: ingen separat krav-dok, Mathias eneste stakeholder), `## Preconditions` (DB N/A · §3.3 N/A · G063/H028-opslag), `## Patch-først pr. ændret flade` (kaede/workflow/læseflade-ankre), og **afgrænser gate-ejerskab** (disciplin.md = definitions-hjem · workflow/ = runtime-facit; §8.1 MODSIGELSE → INGEN). Gate-ejerskab Mathias-bekræftet 2026-06-18 (option A: reglen bliver i disciplin.md).

## Doc-currency

Build 1 `@97a650d` · Plan 1 v26 `@87652387` — current. Bootstrap-/fix-artefakt; arkiveres når Build 1.1 er leveret og acceptance er sand.
