Alle tre leverancer er skrevet, hashet og kontrolleret. Intet udestående — slutbesked følger.

**Leverancer (v3.4, mini-runde efter B6 runde 2 · M-44):**

| fil | sha256 | blob-OID |
| --- | --- | --- |
| `plan-build/lokations-skabelon/plan.md` (v3.4, UDKAST, 1028 linjer) | `5b15259fd98d7f79ea682fd1ba32ee8110ae451aba1e7070ed400b3f471ae802` | `71479b11c6a4346311c2140d43e92b0a1b2f6bf4` |
| `plan-build/lokations-skabelon/fold-ind-rapport-r6.md` | `2e2f87530418d74a273a3d34ac84039c712ebf2fa296f5646e78b81046681cd3` | `580334bc290669a0244250c3322453c0023a0e0e` |
| `plan-build/lokations-skabelon/forventnings-manifest.json` (v3.4; `bindings.plan.oid = "<udfyldes af driveren>"`) | `89ec396ebfe0771584d28c1577a5b79e72b3ccbd322406af88d1c7efc4fafc69` | `b6ce774d64b897714c7bad28e2ef65995b5a5978` |

**Validator** (`node scripts/v5/forventnings-manifest.mjs validate …` @ `64ea01e0`, kørt med 40-hex placeholder, derefter driver-placeholderen genindsat):
```
✓ manifest gyldigt: lokations-skabelon · 9 K · 60 forpligtelser i nu-scope (0 overdraget) · 127 negativer · pr. form {"UT":47,"MH":19,"FS":35,"SA":2} · 12 eneste-værn
```

**Delta-attest:** `diff provenance/plan-v33.md plan.md` = præcis 45 ændrede linjer (alle `c`-hunks på uændret linjenummer, listet i §11.5) + §11.5 indsat efter linje 1008. Ingen linjer indsat eller slettet før §11.5, så §11.4's linjehenvisninger og manifestets `P:`-ankre gælder uændret. Manifest-diff mod `manifest-v33.committet.json` = linjerne 15 · 25 · 29 · 950 · 2982 · 3125 · 3140 · 3155 · 3170 + ny `K-7/S/neg-8`.

**Rettelserne (én tilstand pr. fund, alle i §11.5 med `plan.md:<linje>`):**
- **R4-1 = A5-3** RETTET M. BEVIS: gren (4) i `_pii_klassifikation_guard` er nu en eksplicit kolonne-allowlist (`gruppe_kontakter.{navn,email,telefon}` · `lokationer.{navn,adresse}`); ny `K-7/S/neg-8` (`lokationer.type`→direct → P0001 `pii_direct_uden_anonymiseringsvej: core_identity.lokationer.type`, `sole_guard_ref g.pii_klassifikation_guard`); ny plan-instansieret mutant T7.18 (plan) der tillader det ellers afviste valg og dræbes via registry-effekt; S-46, S-24, D-11 og guard-beskrivelsen omskrevet; anker `15557e93:21-25` tilføjet. Ingen ny strategi for `type` (klasse (b) fravalgt med begrundelse).
- **R4-2** RETTET M. BEVIS: W6's `p_adresse`-semantik bundet (NULL = uændret · tom = ryd → NULL · ellers ny værdi) — assertion (d) holder, ingen manifest-ændring.
- **R4-3** RETTET M. BEVIS: implplan re-pinnet til `75ee9373`; alle 12 citerede linjenumre genlæst og uændrede.
- **A5-2** RETTET M. BEVIS: K-3/ac-5 effekt-step 4.2 → 4.3 i §1, §0.2, bijektion, Bid 4-done og manifest; bid-sum 60 uændret.
- **A5-4** RETTET M. BEVIS: T7.8 splittet i instans-ankre T7.8-a (WHEN → kun `active`, dræbes af neg-2) og T7.8-b (WHEN uden `active`, dræbes af neg-6 med Codex' fulde effekt-sti); ingen mutant pr. statusknap.
- **A5-5** RETTET M. BEVIS: neg-4/neg-5 beskrevet som »upsert mod eksisterende definition« hhv. »første definition«, begge i BEFORE INSERT-stien; påstanden om særskilt bevist UPDATE-gren fjernet i plan + manifest; T7.10's effektkontrol bevaret.
- **A5-7** RETTET M. BEVIS: `prover.json`/`prover-run.mjs` forfattes og fryses af Codex før byg; byggeren kører og leverer kun `bids/`; FA-6, §3 (vi), Step 1.4, Bid 1-done, §8 og BV-5 afstemt.
- **A5-1 · A5-6** DRIVER + synk: FA-5 re-pinnet til kontrakt v4 (`33dd3509` · `05fe45f5` · `82d10149` · `9731beba` · `4c2f7038`); §11.5 henviser til provenance-kopierne og bærer den fulde hunk-liste.
- **claude-ai D' F-2** SYNK: D-11 siger nu »uanset gruppens type«.

**Optælling (alle fund):** 132 = 121 (r5) + 7 (A5) + 3 (R4) + 1 (NF-12, ny K-genlæsning, inden for mandat). RETTET M. BEVIS 114 · INDEN FOR MANDAT 16 · DRIVER 2 · **KRÆVER MATHIAS 0 · ÅBNE 0.** §10-tabellen er gengivet i rapportens §6 (D-11 ændret). Nye ordbogs-entries: ingen.

**HALT-flag: INGEN.**

**Bindinger (alle verificeret med `git hash-object`, ingen afvigelse):** plan v3.3 `414b0ce8` · rapport-r5 `5b57369c` · manifest v3.3 `cbce5c0d` · C' `e4acebad` · A''' `1cd8ff7b` · D' `da9b3eab` · fund-log `890348bb` · krav `9402164d` · kill-list `13b78392` · forventningsliste `2200b76e` · recon2 `2bdbb122` · P-8 `4af07ef4` · ordbog `bcab6b4e` · ledger `05275cef` (M-1..M-44) · implplan `75ee9373` · kildekontrakt v4 `33dd3509`/`05fe45f5`/`82d10149`/`9731beba`/`4c2f7038` · validator `64ea01e0` · provenance `plan-v33.md` = `414b0ce8`, `plan-v32.md` = `fea69661`, `manifest-v33.committet.json` = `cbce5c0d` · pinned `2f71b4ef`. Web ikke brugt; driverens filer urørte; ingen kode i produktzonen.

**Driver-opgaver før gaten:** indsæt `bindings.plan.oid` (`git hash-object plan.md` = `71479b11…` hvis filen committes byte-identisk) og kør validatoren igen; opdatér fund-log (Kilde 19/21 + NF-12); læg `provenance/plan-v34.md` + `manifest-v34.committet.json`; synkronisér fremlæggelses-udkast r2's D-11 med `plan.md:829`; Codex dømmer kun deltaet pr. §11.5.