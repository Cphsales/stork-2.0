---
name: stork-2-0-forretnings-reviewer
description: Stork 2.0 Claude.ai — app-adapter (ren glue, intet rolle-indhold). Rollen er defineret i disciplin.md §9.1; denne fil bærer kun aktivering, adgangsvej og den kanoniske platform-pointer. Læses via GitHub-connectoren.
---

# Stork 2.0 — Claude.ai (app-adapter)

Denne fil er REN ADAPTER for app-fladen — parallellen til kæde-fladens
`scripts/kaede/claude-ai-rolle-instruks.md`. Rolle, pligter, MÅ/MÅ IKKE,
triggers og læseliste ejes af `docs/strategi/disciplin.md` §9.1 (+ §13 for
adgang/sync) og gentages IKKE her — intet rolle-indhold i adapteren betyder
intet der kan drifte (slanket 2026-06-11 på Mathias-ord; før-gov-5-rollen i den
gamle version var præcis den drift-klasse).

## Aktivering (app-glue)

**`qwers` / `qwers <pakke>` / `qwerr`:** hent `docs/strategi/disciplin.md` fra
Cphsales/stork-2.0 (main) via GitHub-connectoren, læs §9.1 og følg DEN —
inklusive triggers-linjen dér. Bekræft kort med friskheds-bevis:

> "Rolle bekræftet som Claude.ai. Læst nu: §9.1 i disciplin.md @ \<commit/dato\>. Klar."

**Review-targets (`qwerr`):** eksplicit Mathias-besked (typisk PR-link), ellers
`docs/coordination/seneste-rapport.md` + `docs/coordination/aktiv-plan.md`.
Slut-rapport-review læser PR-BRANCHEN (§13).

## Adgangsvej

GitHub-connector (Mathias-valgt 2026-06-11) — main er sandheden; detaljer og
fallback ejes af disciplin §13. Er repoet utilgængeligt: sig det — gæt aldrig
fra hukommelse.

## Kanonisk platform-pointer (genskabes herfra ved drift)

```
Stork 2.0-rolle — POINTER, intet indhold. Ved `qwers`/`qwerr` eller
Stork-kontekst: hent docs/claude-ai/SKILL.md fra Cphsales/stork-2.0 via
GitHub-connectoren og følg DEN. Selve skill-filen læses altid fra main;
hvilke filer/branches rollen derefter læser, styrer skill'en + disciplin
§13 (fx PR-branchen ved slut-rapport-review). Er filen utilgængelig: sig
det — gæt aldrig rollen fra hukommelse.
```

Platform-skill'en bærer ALDRIG indhold. Takt-garantien er strukturel: ét
indhold (disciplin §9.1), to adaptere (denne fil + kæde-instruksen), nul
kopi-sync.
