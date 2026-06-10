# gov-docs-renhed — Slut-rapport

**Dato:** 2026-06-10 · **Branch:** claude/gov-docs-renhed-build · **Merge-commit:** `2aae50d`
**Krav-dok:** docs/coordination/arkiv/gov-docs-renhed-krav-og-data.md · **Plan:** docs/coordination/arkiv/gov-docs-renhed-plan.md (V4, Codex-approved runde 4)

## Formål (genfremlagt fra krav-dok)

> Denne pakke leverer: et docs-repo hvor ingen doc eller script modsiger
> virkeligheden — plus de mekaniske værn der holder det rent — så fælles
> forståelse og workflow ikke kan brydes af drift.

## Leverancer (mod krav-dok §I scope)

| #   | Krav-dok-leverance                                  | Status | Hvor                                                                                                                                                                                                                                | Evidens                                                                                         |
| --- | --------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | Aktiverings-scripts: virker under V5 ELLER fjernes  | ✓      | codex-review.sh repareret (V5-prompt fra §10.4, bracket-tolerant + runde-aware parsing, `--parse-test`, stdin-fix, final-answer-ekstraktion); claude-ai-prompt.sh + data-grundlag.sh + krav-afklar.sh `git rm` (batch 1, `ddc72db`) | parse-test 14/14 grøn; repareret script kørte selv build-reviews runde 5–9 live                 |
| 2   | disciplin.md doc-currency (Forudsætninger/Gjort)    | ✓      | CI-blocker-linje synkroniseret; Gjort-listen + gov-3b-2/3a/3b (batch 2)                                                                                                                                                             | governance:check grøn                                                                           |
| 3   | Forretningsforståelse LÅST-AUTORITATIV (doc-niveau) | ✓      | LÅST-banner; LÆSEFØLGE pkt 2; §8-tabel-række; §8.1 stamme-doc-regel; + afledte rettelser i §8-pointen, SKILL.md, master-plan-hierarkiet, vision-banner-undtagelsen (batch 2+6, fund R2-4/R3-1/R7)                                   | Codex §8.1-SVAR: INGEN-MODSIGELSE (runde 8+9); fuld grep: ingen tanke-data-rester i aktive docs |
| 4   | Git-reglen branch-bevidst                           | ✓      | disciplin §13, LÆSEFØLGE pkt 0, CLAUDE.md (batch 2)                                                                                                                                                                                 | —                                                                                               |
| 5   | Døde reference-rester repointet                     | ✓      | rapport-historik/README → §10.3; disciplin §2/§6.2 H020 → gov-5 (batch 2)                                                                                                                                                           | governance:check grøn                                                                           |
| 6   | §7 invariant #4 ærlig label                         | ✓      | "(lint)" → "(Codex + Claude.ai-tjek — lint bygges i senere spor)" (batch 2)                                                                                                                                                         | —                                                                                               |
| 7   | Claude.ai-skill: én kanonisk kilde i repoet         | ✓      | SKILL.md kanonisk-deklaration + sync-instruktion (batch 2)                                                                                                                                                                          | **Mathias-handling: kopiér SKILL.md til platform-skill**                                        |
| 8   | fundament-samlet.md slettet                         | ✓      | Allerede udført 2026-06-08 (D5)                                                                                                                                                                                                     | —                                                                                               |
| 9   | Allowlist-split (prosa må, scripts må ikke)         | ✓      | deadDocPaths klasse-skel + `# governance: deprecated`-flugtvej; 2 entries prunet (batch 3)                                                                                                                                          | selftest: script-dead-path rød, deprecated-positiv grøn — ville have fanget pkt 1-tilstanden    |
| 10  | Strukturelt kæde-tjek                               | ✓      | structural-chain: aktiv-pakke-markør, eksistens, krydspeg begge veje, mekanisk Formål-immutabilitet (§3.0), fase:rapport (batch 3)                                                                                                  | selftest: 7 chain-cases røde, baseline grøn                                                     |
| 11  | §8.1-svar som fast markør                           | ✓      | Markør-format i §8.1 + §10.3-felt + §10.4-instruktion (batch 2); håndhævet i scriptets prompt                                                                                                                                       | Brugt i alle 9 runder; fangede D4-modsigelser i runde 1+2+7                                     |

Ekstra (Code-fund under pakken, inden for formål): danske bogstaver i scannerens sti-regex (docs/LÆSEFØLGE.md gav falsk match) · codex-reviews/ scope-ekskluderet (ephemeral rå-output, §4) · `codex exec` stdin-fix.

## Stork-invariant-tjek

| Invariant              | Status | Evidens                                                                                                                                                |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vision-overholdelse    | ✓      | Rigtig løsning, ikke workaround: værn er mekaniske + selvtestede; D4-konsistens lukket på alle aktive steder. 0 migrations                             |
| Permission-matrix      | N/A    | Ingen RPC'er/policies berørt (ren docs+scripts-pakke)                                                                                                  |
| Audit-trigger          | N/A    | Ingen nye tabeller                                                                                                                                     |
| Konfiguration-i-data   | ✓      | Ingen hardkodede satser/lønarter introduceret; invariant-label gjort ærlig (pkt 6)                                                                     |
| End-to-end-flow        | ✓      | governance:selftest: planted overtrædelse → scanner rød → fix → grøn (baseline + 13 plantede + deprecated-positiv). parse-test 14/14. Ikke schema-only |
| Anonymisering-bevaring | N/A    | Ingen data berørt                                                                                                                                      |

## Plan-afvigelser (alle tekniske, inden for formål — §3.0 intakt)

1. **rapport-skabelon-allowlist-entry beholdt** (plan sagde prune) — planens egen A.12-provenance-tekst er levende prosa-referent; prune ved pakke-luk/gov-6.
2. **v4-slettede-docs/ kortvarigt tracked i batch 2** (Code-fejl: `git add -A`) — fanget af Codex runde 5; untracked igen + .gitignore-værn i batch 4. Aldrig på main.
3. **MANGLENDE-EKSISTERENDE-BEVARELSE-routing** tilføjet parseren (runde 5-fund) — §5-semantik, ikke i plan-diffen.
4. **codex-reviews/ i DOC_EXCLUDE** (batch 4b) — first-time-situation: reviews var aldrig før committet som filer.
5. **MELLEM runde-aware routing** (runde 6-fund) — §5 runde-trapper var kollapset i parseren.
6. **Final-answer-ekstraktion i parseren** (batch 7, Code-eget fund) — transcript-citater gav false-positive routing (runde 8: APPROVAL → exit 2).

Ingen krævede Mathias-gate: alle er implementations-detaljer inden for godkendt formål; ingen ændrer leverancer eller scope.

## G-numre rejst

Ingen. (G063 forbliver åben → gov-6, som planlagt.)

## §8.1-svar (governance-docs berørt)

`§8.1-SVAR: INGEN-MODSIGELSE` — Codex runde 8 + runde 9 (efter at runderne 1, 2 og 7 fangede og fik lukket D4-modsigelser i hhv. vision-banner, master-plan og disciplin §8-pointe/SKILL.md).

## Konvergens-historie

| Runde | Fase            | Fund                                                     | Outcome                                             |
| ----- | --------------- | -------------------------------------------------------- | --------------------------------------------------- |
| 1     | plan            | 2 KRITISK + 3 MELLEM + §8.1-MODSIGELSE                   | V2 (alle ACCEPT)                                    |
| 2     | plan            | 1 KRITISK + 3 MELLEM + §8.1-MODSIGELSE                   | V3 (alle ACCEPT/rettet)                             |
| 3     | plan            | 1 KRITISK + 1 G-kandidat                                 | V4 (ACCEPT + ADOPT). §3.4-alert rejst ved counter 4 |
| 4     | plan            | **APPROVAL + INGEN NYE FUND**                            | qwerg-klar                                          |
| 5     | build           | 3 KRITISK                                                | batch 4 + 4b                                        |
| 6     | build           | 2 KRITISK                                                | batch 5                                             |
| 7     | build           | 2 KRITISK + §8.1-MODSIGELSE                              | batch 6                                             |
| 8     | build           | **APPROVAL + INGEN-MODSIGELSE** (routing-støj → batch 7) | batch 7                                             |
| 9     | build (--quick) | **APPROVAL + INGEN-MODSIGELSE**, routing exit 0          | build lukket                                        |

## Vision-tjek

- **Rigtig løsning eller workaround?** Rigtig: værnene er mekaniske, selvtestede og bider i CI; renheden hviler ikke på hukommelse.
- **Styrkelser:** dobbelt-lags-værnet beviste sig selv under pakken — Codex fangede 7 reelle KRITISK i Codes eget arbejde (inkl. at pakken selv fejl-committede gov-6-filer og at status-filen modsagde virkeligheden — præcis den klasse pakken bekæmper).
- **Lærepunkt (Code):** D4-løftet krævede konsistens 7 steder; batch 2 fangede 5. En fuld begrebs-grep burde være batch-disciplin fra start ved status-løft af en doc — taget med som arbejdsform fremover.
- **Konklusion:** forsvarligt. Ingen kompromiser, ingen drift; 0 G-numre.

## Step 5-gate

Claude.ai-review: **APPROVAL** (2026-06-10, relæet af Mathias) — formåls-kæden 1:1, alle 11 leverancer sporbare, afvigelser vurderet lovlige §3.0-bevægelser. Mathias: **slut OK** 2026-06-10.

## Mathias-handlinger ved/efter merge

1. **slut OK** efter Claude.ai-review af denne rapport.
2. **Merge** (vision-og-principper.md-ændringen kræver din CODEOWNERS-approval).
3. **Platform-skill-sync:** kopiér `docs/claude-ai/SKILL.md` til claude.ai-platform-skill'en (pkt 7).
4. Ved pakke-luk (doc-currency, merge-commit): aktiv-plan-markør → `ingen` + Aktuel-linje; seneste-rapport-pointer hertil; krav-dok+plan → arkiv/; status + codex-reviews/ + plan-feedback slettes (§4).

Batch-hashes: 1 `ddc72db` · 2 `42bfb55` · 3 `00c1ebd` · 4 `1b87753` · 4b `821e1b3` · 5 `2fdc9f0` · 6 `869fa87` · 7 `4ceeca6`.
