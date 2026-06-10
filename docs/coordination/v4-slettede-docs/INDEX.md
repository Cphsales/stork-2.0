# V4-slettede docs — gennemgangs-kopier (midlertidig)

Genskrevet fra git-history så Claude.ai kan læse dem via Filesystem. **Midlertidig mappe — slettes efter gennemgang.** Disse er IKKE genindførte permanente docs.

V4-vinduet = omlægnings-commits dateret **2026-05-22** (disciplin.md-footer: "V4 etableret 2026-05-22"). Alt før (05-14/05-15 H010-oprydning, H020/H024/T9/Lag1/trin-10 pakke-arkivering, PR42) er tidligere pakke-arbejde, ikke V4-omlægningen.

## A. Genskrevet i denne mappe (reelt konsolideret/slettet — kun i git-history ellers)

| Fil her                                          | Oprindelig sti                                                  | Slette-commit | Dato       | Commit-besked                                                                           |
| ------------------------------------------------ | --------------------------------------------------------------- | ------------- | ---------- | --------------------------------------------------------------------------------------- |
| `lag-e-beregningsmotor-krav.md`                  | docs/teknisk/lag-e-beregningsmotor-krav.md                      | `1a88d7fa96`  | 2026-05-22 | V4 doc #1: konsolidér tanke-data — lag-e-beregning + lag-e-tid → forretningsforstaaelse |
| `lag-e-tidsregistrering-krav.md`                 | docs/teknisk/lag-e-tidsregistrering-krav.md                     | `1a88d7fa96`  | 2026-05-22 | V4 doc #1: konsolidér tanke-data → forretningsforstaaelse                               |
| `bygge-status.md`                                | docs/strategi/bygge-status.md                                   | `c1c1b1bb4d`  | 2026-05-22 | V4 doc #2: koble bygge-status ind i master-plan §4.1 + §4.2                             |
| `arbejds-disciplin.md`                           | docs/strategi/arbejds-disciplin.md                              | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
| `arbejdsmetode-og-repo-struktur.md`              | docs/strategi/arbejdsmetode-og-repo-struktur.md                 | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
| `overvaagning--claude-ai-overvaagning.md`        | docs/coordination/overvaagning/claude-ai-overvaagning.md        | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
| `overvaagning--code-overvaagning.md`             | docs/coordination/overvaagning/code-overvaagning.md             | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
| `overvaagning--codex-overvaagning.md`            | docs/coordination/overvaagning/codex-overvaagning.md            | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
| `skabelon--codex-review-prompt.md`               | docs/skabeloner/codex-review-prompt.md                          | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
| `skabelon--plan-skabelon.md`                     | docs/skabeloner/plan-skabelon.md                                | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
| `skabelon--rapport-skabelon.md`                  | docs/skabeloner/rapport-skabelon.md                             | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
| `skabelon--workflow-skabelon.md`                 | docs/skabeloner/workflow-skabelon.md                            | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
| `T9-supplement-skitse.md`                        | docs/coordination/T9-supplement-skitse.md                       | `56c017a967`  | 2026-05-22 | V4 doc #5: arkivér forældede filer + slet rod                                           |
| `afdaekning--g043-g044-data-code-2026-05-16.md`  | docs/coordination/afdaekning/g043-g044-data-code-2026-05-16.md  | `56c017a967`  | 2026-05-22 | V4 doc #5: arkivér forældede filer + slet rod                                           |
| `afdaekning--g043-g044-data-codex-2026-05-16.md` | docs/coordination/afdaekning/g043-g044-data-codex-2026-05-16.md | `56c017a967`  | 2026-05-22 | V4 doc #5: arkivér forældede filer + slet rod                                           |
| `mathias-afgoerelser--slettet-version.md`        | docs/coordination/mathias-afgoerelser.md                        | `56c017a967`  | 2026-05-22 | V4 doc #5: arkivér forældede filer + slet rod                                           |

**NB om `mathias-afgoerelser`:** den slettede version (`docs/coordination/mathias-afgoerelser.md`) er gengivet her. En arkiveret variant lever desuden i `docs/coordination/arkiv/mathias-afgoerelser-historik.md` (kan læses direkte) — de to er ikke verificeret identiske.

## B. V4-vinduet, men IKKE genskrevet — flyttet/arkiveret, læsbart i nuværende tree

| Oprindelig sti                                                                                                                                                                  | Nuværende sti (læs her)                                      | Commit                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| docs/coordination/cutover-checklist.md                                                                                                                                          | docs/teknisk/cutover-checklist.md                            | `f8a5a15a7d` (V4 doc #7)  |
| docs/coordination/v4-automation-krav-og-data.md                                                                                                                                 | docs/coordination/arkiv/v4-automation-krav-og-data.md        | `f37afe85f5`              |
| docs/coordination/I001-krav-og-data.md                                                                                                                                          | docs/coordination/arkiv/I001-krav-og-data.md                 | `56c017a967` (V4 doc #5)  |
| docs/coordination/t9-supplement-2-krav-og-data.md                                                                                                                               | docs/coordination/arkiv/t9-supplement-2-krav-og-data.md      | `7ddb54b085`/`27f461d61e` |
| docs/coordination/t9-supplement-2-forretningsgang-{konsolideret,claude-ai,code,codex}.md                                                                                        | docs/coordination/arkiv/ (samme navne)                       | `7ddb54b085`/`27f461d61e` |
| docs/coordination/rapport-historik/2026-05-{15-h010,15-h020-1,15-h022,16-h020,16-h024,20-Lag1,20-Lag1-disciplin-fundament,20-trin-10-workflow-fund,22-v4-automation}.md (9 stk) | docs/coordination/arkiv/rapport-historik-meta/ (samme navne) | `851a9eae2f`              |

## C. V4-vinduet, men IKKE genskrevet — iterations-artefakter slettet pr. bevarelses-disciplin §4 (kun i git-history)

Commit `2ae1a37962` "V4 doc #6: slet iterations-mapper indhold (bevarelse-disciplin §4)" slettede ~40 filer under `docs/coordination/codex-reviews/` (review-runder for h020/h024/t9/t9-supplement/Lag1/trin-10/workflow-skabelon) + `docs/coordination/plan-feedback/` (Lag1-feedback/-prompt/-slut-rapport-filer) + de to mappers `README.md`. Disse er per-runde proces-artefakter; ikke genskrevet her. Sig til hvis de også skal materialiseres.

## D. Uden for V4-vinduet (tidligere oprydninger — ikke en del af V4-omlægningen)

`f40453babc` (2026-05-14, fase-0-spor), `70487e0027` (2026-05-15, H010 flyt af vision/master-plan/teknisk-gaeld/permission-matrix/arbejds-disciplin/bygge-status fra docs/-rod), samt pakke-arkiveringer for H020/H024/T9/Lag1/trin-10/PR42/forretningsspoergsmaal-skabelon (05-16 → 05-21). Ikke genskrevet — uden for det specificerede V4-vindue.
