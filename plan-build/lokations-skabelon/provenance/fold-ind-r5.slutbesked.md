Alle tre leverancer er skrevet og verificeret. Slutbesked:

**Leverancer (workdir @ `e0033bc4`, `plan-build/lokations-skabelon/`):**

| fil | sha256 |
| --- | --- |
| `plan.md` (v3.3, 1009 linjer, status UDKAST) | `cf71cb2b31a505b66011d1c64f7eb07045f09a7b91fd4317cd1a050469b35551` |
| `fold-ind-rapport-r5.md` | `e9f913c11e55bb03d6921dd818d4522b94c93c3cb2b0db9ad8e5ccf61edb01b0` |
| `forventnings-manifest.json` (v3.3, `bindings.plan.oid = "<udfyldes af driveren>"`) | `76e8778a4279673400d9c938bf0af1fb9003e4ebbf1f7eefb95b1d46ad2d560e` |

Plan-blob til driverens `bindings.plan.oid`: `414b0ce89621ccfd66464801b6304692c061a040` (`git hash-object` af den leverede plan.md).

**Validator (kørt her, plan.oid midlertidigt 40×`0`, derefter placeholder genindsat):**

```
✓ manifest gyldigt: lokations-skabelon · 9 K · 60 forpligtelser i nu-scope (0 overdraget) · 126 negativer · pr. form {"UT":47,"MH":19,"FS":35,"SA":2} · 12 eneste-værn
```

150 assertions (alle id'er ≤ 80 tegn). Effekt_bid-fordeling 1+12+13+22+12 = 60 stemmer med §1's bijektion.

**Optælling pr. tilstand (alle fund, rapport §5):** RETTET M. BEVIS 104 (inkl. R3-1..R3-4, A4-1 som driver+synk, A4-2..A4-6) · INDEN FOR MANDAT 15 (inkl. nye NF-9..NF-11 fra K-genlæsning) · DRIVER 2 (R2-5 · R2-6) · KRÆVER MATHIAS 0 · **ÅBNE 0** · i alt 121 (instruksens 118 + 3 nye NF). V32-1 og F-1 er driverens rækker uden for plannerens tal.

**HALT-flag: INGEN.** A4-6 er planlagt i pakken uden krav-ændring: gren (4) i `_pii_klassifikation_guard` gør `direct` uden udførende vej urepræsenterbar ved markeringen (S-46), og delta-triggeren `_mapping_delta_apply` plus union-reglen i I6/I8 giver senere direct-valg en udførende vej og replay-dækning (S-47). Ny §10-orientering D-11 består bord-testen. Øvrige nøglevalg: T8.2-repræsentant = W12 (ÉN sandhed), K-7/S → 2.1 med neg-4 (UPDATE) og neg-5 (INSERT) splittet, K-8/ac-5 → 4.2, K-4/ac-6 · K-6/ac-3 · K-6/ac-10 → 4.3, T6.16 bundet til nyt `K-6/ac-10/neg-11`, plan-instansieret `T8.11 (plan)` for R17's adgangsgate, tre exit-klasser for K-1/ac-4, `prover.json`/`prover-run.mjs` + `bids/`/`reviews/` som pkt. 39-leverancer i alle fem bids' done.

**Bindinger (alle `git hash-object`-verificeret, ingen afvigelse):** plan v3.2 `fea69661` · rapport-r4 `1aa91bbe` · manifest v3.2 `3ab9cf9b` · slutlæsning-r3 `513e7b76` · angreb-r4 `a81f71ee` · claude-ai `431a2e84` · fund-log `f3b139fe` · krav `9402164d` · kill-list `13b78392` · forventningsliste `2200b76e` · recon2 `2bdbb122` · P-8 `4af07ef4` · ordbog `bcab6b4e` · ledger `5f4425d1` · implplan `8300216c` · kildekontrakt v3 `9da12d2d` · `77825773` · `82d10149` · `9731beba` · `94d161bb` · validator `64ea01e0`.

Web ikke brugt; ingen af driverens filer rørt; `sed -i`/`perl -i` blev afvist og erstattet af Edit-værktøjet, ingen hjælperfiler. Driver-opgaver før gaten står i rapport §8 (plan.oid, validator igen, fund-log, D-11 gennem devilen, A'''/C/claude-ai som B6 runde 2).