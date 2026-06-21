# Final Plan v5 — implementerings-plan (step 2)

**Type:** Step 2 — implementerings-plan oven på forløb-kortet. Pr. mekanisme: _hvad sker · hvad har vi · hvad bygges · mekanisme-tekst · krav-fodnote._ Bygges lag-for-lag fra `qwers`.
**Status:** UDKAST — lag 1 (`qwers`) fyldt; resten følger lag-for-lag. Intet bygget, intet låst.
**Sprog:** Code/Codex' arbejdsdok — teknisk-præcist til bygning + validering, ikke forretnings-oversat.

## Kilder (det vi bygger MOD — låst sandhed øverst)

- **Løsning (kortet):** [`workflow/forloeb-kortlaegning.md`](./forloeb-kortlaegning.md) — HELE workflowet `qwers`→`slut OK`, mekanisme for mekanisme. Denne plan implementerer det.
- **Krav (rammen):** [`mathias-doks/krav-og-data.md`](../mathias-doks/krav-og-data.md) — de 11 krav `K1`–`K11`. Mathias' bord. Hver plan-sektion fodnoter det/de `K-n` den opfylder.
- **Låst sandhed:** `docs/strategi/vision-og-principper.md` · `docs/strategi/forretningsforstaaelse.md` · `docs/strategi/stork-2-0-master-plan.md`.

## Metode (fast, jf. step-2-beslutninger)

1. **Slet intet endnu** — kondemneret substrat omdøbes `…-slet` (beholdes som recon; brugbare dele høstes ind i det nye). Hard-delete først til allersidst, når det nye dækker.
2. **Byg friskt — behold ikke, lap ikke** — alt gammelt (også det der ser ud til at virke) er **substrat** (recon → `-slet`), ikke fundament. Falsk-grøn lappes aldrig (det gentager opsætningen). Enkelte dele kan **høstes ind i FRISKE mekanismer**, men kun efter forge-filter (bevist u-forfalskeligt) og genbygget — intet gammelt bæres uændret med.
3. **Grøn = reel konsekvens** — hver mekanisme er enten (a) en **deterministisk check der kører mod RIGTIG kæde/artefakt** (kan gå rød på en plantet reel fejl), eller (b) en **per-aktør-skill** (kontekst-levering). Aldrig en selftest der kun beviser egne fixtures.
4. **Krav-sporbarhed, maskin-checkbar begge veje** — hver sektion bærer `[K-n]`-fodnote; et coverage-check kræver: hvert `K-n` refereret af ≥1 sektion (intet krav glemt) **og** hver sektion sporer til et `K-n` (intet rogue-indhold uden krav-hjemmel). Forfalskelig prosa alene tæller ikke.

> **Krav-fodnote-nøgle:** `K1` funktioner grundigt · `K2` kæden hænger sammen · `K3` fejl fanges løbende · `K4` recon-rækkefølge · `K5` fire-aktør-godkendelse · `K6` Mathias' bord · `K7` roller · `K8` docs/repo · `K9` flow/gates · `K10` master-plan styrer retning · `K11` rammen for pakken.

---

## Lag 1 — `qwers` (FASE 0: Åbning)

> Forløb-kort-kilde: FASE 0 (S0.1–S0.3). Mål for laget: Mathias starter workflowet med ÉN prompt; alle tre AI-aktører vågner friske + rolle-korrekte; ankeret binder recon-scopet hash-fast. `[K9, K7, K2, K10]`

### S0.1 — `qwers <anker>` (trigger) `[K9, K2]`

**Hvad sker:** Mathias skriver `qwers <anker>` på issue #126. `<anker>` = masterplan-trin (pakke) **eller** `plan-gaeld-kode/`-doc-navn (gæld / nyt uden for planen). Det åbner Code-terminalen på pakken. Én prompt = hele starten.

**Hvad har vi:**

- `scripts/kaede/kaede-regler.json`: `gate_ord` indeholder `"qwers"`; event `qwers-aabning` findes. **Men** dirigenten er inert (manuelt-flow, ikke kørende), og `qwers-aabning` dispatcher kun `code`+`codex` — claude-ai vækkes først ved `recon-kode-klar` → afviger fra S0.3-målet (alle tre friske ved åbning).
- `scripts/workflow/start-kaede-check.mjs` + `workflow/start-kaede-kontrakt.json`: en **deterministisk state-validator** (author-verificeret · alle tre aktiveret · transport≠dømmekraft · recon+krav-oplæg til stede). Logikken er reel og rammer de rigtige ting. **Men** køres **selftest-only** (`start-kaede-check.selftest.mjs` mod fixtures), aldrig mod den rigtige åbning → falsk-grøn. → høst logikken; substratet `→ -slet` når den fodres rigtig kæde-state.

**Hvad bygges:**

- Reel issue-event-trigger på #126 med **author-verificering (kun `mgrubak`)** — forkert author → IGNORÉR (fail-closed, ikke en fejlmeddelelse, ikke en kæde).
- Triggeren åbner Code-terminal-miljøet bundet til `<anker>` (deterministisk, ikke gæt).

**Mekanisme (deterministisk):** issue-event → author-tjek mod `mgrubak`. Match → dispatch åbning. Mismatch → ingen kæde (intet sker). Kører mod den RIGTIGE issue-event, ikke en fixture. **Anti-snyd:** forkert author → ingen åbning; fabrikeret/format-gyldig event uden ægte author → ingen åbning.

### S0.2 — Dispatcher + anker-binding (BRO 0→1) `[K9, K10, K4]`

**Hvad sker:** #126-eventet dispatcher i **Code-terminalen** (samme miljø for åbning FASE 0 **og** recon FASE 1 — ingen separat transport imellem). Ankeret bindes til et **hash-bundet udgangspunkt** (masterplan-trin eller `plan-gaeld-kode/`-doc), og **read-only recon-mode** sættes. Ankeret ER broen til recon: FASE 1 digger FRA ankeret + låst vision/forretning + nuværende kode — ikke fra et gæt.

**Hvad har vi:**

- `kaede-regler.json` `qwers-aabning`-routing (`code: recon-kode`, `codex: recon-research`) — data findes, men inert + ufuldstændig (claude-ai mangler).
- Ingen eksisterende hash-binding af ankeret til masterplan-trin/`plan-gaeld-kode/`-doc — det er nyt.

**Hvad bygges:**

- Anker-binding: `<anker>` → hash-bundet masterplan-trin **eller** `plan-gaeld-kode/`-doc. Forkert/manglende anker → **integrations-canary** fanger (recon må aldrig køre på vilkårlig flade).
- Read-only recon-mode sættes deterministisk ved åbning (default-deny hook: skrive-/byg-værktøjer blokeret i recon-fasen).

**Mekanisme (deterministisk):** ankeret opslås mod masterplan-/`plan-gaeld-kode/`-inventory → hash bindes → recon-scope = ankeret. **Anti-snyd:** anker uden gyldigt mål → BLOKER (integrations-canary); værktøjs-kald der skriver i recon-mode → hook BLOKERER.

### S0.3 — Aktørerne vågner friske + rolle-korrekte `[K7, K9]`

**Hvad sker:** Code · Codex (`--ephemeral`) · Claude.ai (`claude -p`) vågner hver **frisk/statsløs**. To rolle-typer pr. AI (workflow vs. almindelig); Mathias skifter aktiv rolle via ÉN simpel prompt → loader den rette skill.

**Hvad har vi:**

- `scripts/kaede/adapters/code.sh` (+ `codex.sh`, `claude-ai-rolle.sh`): spawner aktørerne headless. **Men** `code.sh` kører `--dangerously-skip-permissions` (intet scope-hegn) → erstattes friskt med default-deny + scope; `→ -slet` ved erstatning.
- Intet rolle-skill-substrat i repoet (`.claude/skills/` findes ikke) — rolle-skift via skill er **nyt**.

**Hvad bygges:**

- **Rolle-skift-skill** pr. AI (workflow vs. almindelig) — ÉN prompt loader den rette skill. Per-aktør levering (ikke en read-once doc).
- **Capability-tjek ved session-start** (`/skills` / `/doctor`) — manglende capability → fejl højt (ikke stille videre).
- **Freshness-/rolle-hook:** garanterer rigtig rolle + frisk session; **forkert-rolle-kanariefugl** (forkert rolle → afvis/fejl højt, deterministisk).
- **Luk divergensen:** `qwers-aabning` skal vække ALLE tre friske (også claude-ai-rollen), ikke først ved recon-syntese.

**Mekanisme (deterministisk):** rolle-ord → skill-load; hook verificerer rolle + freshness mod forventet; capability-probe ved start. **Anti-snyd:** forkert rolle → kanariefugl afviser; manglende skill/capability → fejl højt; ikke-alle-tre-aktiveret → FAIL.

---

## Næste lag (ikke fyldt endnu)

`FASE 1` (Recon) → `FASE 2` (Krav) → `FASE 3` (Krav-godkendelse) → `FASE 4` (Plan) → `FASE 5` (Plan-gate) → `FASE 6` (Build) → `FASE 8` (Acceptance) → `FASE 9` (Doc-spor). Fyldes lag-for-lag efter samme skabelon, når lag 1 er valideret (Codex completeness → Codex djævel → Mathias).
