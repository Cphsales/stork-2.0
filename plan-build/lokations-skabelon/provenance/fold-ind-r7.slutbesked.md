Færdig — v3.5 er skrevet, verificeret og valideret. Alt gik igennem uden afvigelser.

**Leverancer (sha256):**

| fil | sha256 |
| --- | --- |
| `plan-build/lokations-skabelon/plan.md` (v3.5, 1039 linjer, status UDKAST) | `749bcad0fec586dbebcbbdc418be4300c720bb3b2309f0a212eea716fbd13f90` |
| `plan-build/lokations-skabelon/fold-ind-rapport-r7.md` | `e4e21d02feaf483c95196c17f1499060584210e6f3483bb07d6178926429b859` |
| `plan-build/lokations-skabelon/forventnings-manifest.json` (v3.5 = v3.4 indholdsmæssigt; `bindings.plan.oid = "<udfyldes af driveren>"`) | `89ec396ebfe0771584d28c1577a5b79e72b3ccbd322406af88d1c7efc4fafc69` |

**De to rettelser (§11.6, `plan.md:1029-1038`):**
- **A6-1 (= R5-2), RETTET M. BEVIS.** Runneren er bundet til `scripts/v5/lokations-skabelon/prover-run.mjs` i FA-6 (`:37`), §3 (vi)(a) `cmd` (`:391`), Step 1.4 (`:436`), Bid 1 done (`:438`) og §8 (`:790`); `prover.json` bliver på `plan-build/lokations-skabelon/` (pkt. 39's filform). Zonen er verificeret i kilden, ikke kun Codex' probe: `scripts/v5/hooks.mjs:23-24,56-61,251-255 @ 295e81a7` klassificerer `scripts/v5/**` som måle-lag (builder deny · Codex allow) og `plan-build/**` som produkt. Forfatterskab, frys og byggerens kørsel er uændrede. Historiske omtaler i §11.4 (`:1004`) og §11.5 (`:1022`) er markeret som rettet.
- **A6-2 (= R5-1), RETTET M. BEVIS.** `:235 · :599` med strategi-ankeret `15557e93:21-25` (blank = `'[anonymized]'`) er føjet til R4-1/A5-3-rækken (`:1016`), så §11.5:1012's påstand om fuld fund-binding nu er sand.

**Delta-attest:** `diff provenance/plan-v34.md plan.md` = præcis 11 `c`-hunks på plads (1 · 11 · 13 · 37 · 391 · 436 · 438 · 790 · 1004 · 1016 · 1022) + `1027a1028,1038` (§11.6). §1 har ingen hunk; §1-§3 er byte-identiske med v3.4 uden for 391/436/438. Manifest-diff mod `provenance/manifest-v34.committet.json` = alene linje 15.

**Validator (kørt, exit 0):**
```
✓ manifest gyldigt: lokations-skabelon · 9 K · 60 forpligtelser i nu-scope (0 overdraget) · 127 negativer · pr. form {"UT":47,"MH":19,"FS":35,"SA":2} · 12 eneste-værn
```

**Optælling (alle fund):** 134 = RETTET M. BEVIS 116 · INDEN FOR MANDAT 16 · DRIVER 2 · KRÆVER MATHIAS 0 · ÅBNE 0. Ingen nyt NF (ingen K/ac berørt). Ingen nye ordbogs-entries. §10 ikke gengivet (ingen post ændret).

**HALT: ingen.**

**Bindinger (alle verificeret med `git hash-object`, én pr. kald):** plan v3.4 `71479b11` · rapport-r6 `580334bc` · manifest v3.4 `a2128907` · `provenance/plan-v34.md` `71479b11` · angreb-r6 `529be398` · slutlæsning-r5 `bcd6691b` · claude-ai-r3 `fcf0e8fc` · fund-log `35455b1d` · ledger `05275cef` · krav `9402164d` · kill-list `13b78392` · forventningsliste `2200b76e` · recon2 `2bdbb122` · P-8 `4af07ef4` · ordbog `bcab6b4e` · kildekontrakt v4 `33dd3509` · validator `64ea01e0` · implplan (workdir) `c0763fb5` (henvist m. sti @ P-commit `2e8e12bf`, ikke re-pinnet) · hooks `295e81a7`. Web ikke brugt; ingen driver-filer rørt.

**Driver-opgaver før gaten:** indsæt `bindings.plan.oid` med `git hash-object plan.md` og genkør validatoren; opdatér fund-log Kilde 23/24 (R5-1 · R5-2 · A6-1 · A6-2 → RETTET M. BEVIS, OID = v3.5-blob); læg `provenance/plan-v35.md` + `manifest-v35.committet.json` ved; delta-dommere kører `diff provenance/plan-v34.md plan.md` selv.