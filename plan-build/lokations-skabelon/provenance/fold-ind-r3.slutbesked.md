Slutbesked (plan v2 → v3, fold-ind runde 2 — lokations-skabelon)

**Leverancer (alle i workdir `plan-build/lokations-skabelon/`, skrevet med Write/Edit, intet uden for pakke-mappen):**

| fil | sha256 | omfang |
| --- | --- | --- |
| `plan.md` (v3, status UDKAST) | `fc004f112f58b459a27ce54060f45b755df8cbdc6b307f6463c89a4341b4add8` | 871 linjer · blob i dette workdir `0237be9d58e64953e03535c0a499762c616e1b1d` |
| `fold-ind-rapport-r3.md` | `50e3dd7a1615a2325f999b03850ae71bb391de3efb7f0e5789eccda02820ada5` | 192 linjer · 77 fund-rækker m. `plan.md:<linje>` + ID |
| `forventnings-manifest.json` | `a951365adb79192b5fa6feb39f3d68823df8f2d90c735b0723e65aecddc37d66` | 198 linjer · `bindings.plan.oid = "<udfyldes af driveren>"` |

**Optælling manifest (node-valideret: JSON parser, UT ⇔ ≥1 negativ 0 brud, sqlstate-mængde {22023, P0001, P0002, 42501} + `exit`, guards/aliases konsistente, ingen dublet-ID):** obligations **60** (53 ac + 7 struktur) · negatives **115** · guards **10** · aliases **11** (5 ac-genbrug + 6 S-genbrug) · exit-kanal 2 (K-7/ac-1 + K-1/ac-4 — validator-note i rapporten §7).

**Optælling fund (77):** RETTET M. BEVIS 34 · INDEN FOR MANDAT 6 · KRÆVER MATHIAS 8 (S-1 · S-2 = A2-1/FUND2-3/NF-2/A-4/FUND-1/F03/U06) · BÅRET (v2, kvitteret) 27 · DRIVER 2 (R2-5, R2-6) · **ÅBNE 0**. Alle 21 kill-list-poster gen-disponeret (rapport §5). Nye fund fra K-genlæsning: NF-3..NF-6, alle inden for mandat (ingen ac svækket).

**HALT: ingen.** To spørgsmål KRÆVER MATHIAS med begge udfald bygbare fra v3 uden ny plan-runde (S-1 feltliste → variant S-1-B; S-2 persondata → variant S-2-B); B-3 udgår; den samlede Mathias-liste (S-1, S-2, B-1, B-2, B-4, B-5, D-1..D-10) står i plan §10 og rapport §6.

**Driver-opgaver før plan-lås:** FA-5-kildekontrakt (`p8-kildekontrakt.md`, A2-14) · `bindings.plan.oid` · fund-log (77 rækker) · Mathias-listen via spørgsmåls-devil · evt. manifest-tilføjelser efter S-1/S-2-svar (negativ-ID'er navngivet i §10) · ordbogs-entry »felt« kun ved S-1 = »selv i UI«.

**Bindinger (verificeret `git hash-object`, alle matcher instruksen):** plan v2 `2069aa16` · rapport-r2 `39936c64` · angreb-r2 `0b2a36ca` · audit-r2 `417d96b6` · slutlæsning-r2 `9f13a7cb` · fund-log `a9d53a44` · krav `9402164d` · kill-list `13b78392` · forventningsliste `2200b76e` · recon2 `2bdbb122` · P-8 `4af07ef4` · ledger `14722b4c` · ordbog `bcab6b4e` · implplan `0fdd5b1e` (re-pinnet) · adapter-liste `460a9b26` · pinned commit `3d4c7da7`. Web ikke brugt; ingen driver-filer, krav, recon, P-8, ordbog eller ledger ændret; ingen kode i produktzonen.