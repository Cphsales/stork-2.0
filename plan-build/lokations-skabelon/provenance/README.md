# provenance — lokations-skabelon Fase 3 (arbejds-spor, arkiveret af driveren)

Arkiveret 2026-09-09 ca. 13:25 af driver-10b (GRUNDPLAN-v2 Trin A1 · arkiverings-reglen,
implplan Fase 1: aktør-output committes som arbejds-spor FØR workdirs ryddes — oprydning uden
arkivering = provenance-tab). Kilde: den døde drivers tmp-mappe (session 61d9c799, »qwers trin
10b«, død 2026-09-09 10:17 af udløbet login):
`/tmp/claude-1000/-home-mathias/61d9c799-0bdc-4346-ac4a-8909ab7d9987/tmp/`.
Alle kopier er byte-identiske med kilden (verificeret med `cmp` + sha256 nedenfor).
Slettes ved lukke-PR (Fase 6); git-historikken bevarer sporet.

## Rå aktør-output (ligger i mappen over denne)

| arkiv (plan-build/lokations-skabelon/) | kilde (under tmp/) | sha256 | blob | aktør · input |
| --- | --- | --- | --- | --- |
| `plan-angreb-r1.md` | `fase3/wt-angreb/OUT-angreb.md` (mtime 09-08 17:29) | `545a30a8715d686218ceea0145a94f15fd522c96c2b61e961d546d75b8849862` | `c5b467db` | codex-angreb (gpt-6-astra · xhigh) mod plan-blob `423d9b20` @ `ec4a3d9` — 15 fund: 8 BLOKER + 7 RET + pr.-K-afledning til revideret kill-list |
| `plan-audit-fresh-eyes-r1.md` | `fase2/audit-fresh-eyes/OUT-audit.md` (mtime 09-08 17:04) | `ed9c455ef388c92ac07a74a30a1703461170c10e2739a8ef555d83f5a32e0e0e` | `cb10e231` | fresh-eyes (claude-ai-instans, samme instans hele runden). Filen bærer instansens HELE historik: krav-auditten runde 2 + addenda v2-v5 (linje 1-192) OG plan-auditten (linje 193-221, afsnit »## Plan-audit (blob 423d9b20)«, 5 fund). Kun plan-afsnittet er nyt spor; krav-delen er allerede committet som `antag-aldrig-audit.md` |
| `p4-plan-kildetjek.md` (allerede committet, 3907705) | `fase3/p4-plan/wt/OUT-p4-plan.md` — **rå fil TABT** (wt ryddet af den gamle driver efter commit) | — | `c50fe1f2` | Codex P-4 (gpt-6-astra · xhigh) — 16 F + 10 U. Byte-identitet mod råfilen kan ikke længere efterprøves; kun prompt/provenance/slutbesked reddes her |

## Prompts · provenance · Codex' slutbeskeder (denne mappe)

| fil | kilde (under tmp/) | sha256 | blob | indhold |
| --- | --- | --- | --- | --- |
| `plan-angreb-r1.prompt.txt` | `fase3/angreb-prompt.txt` | `7ce9f905ffcfd0eaabd4f44c8b2d19305b9388fdf30c205b461432a9db9f1d07` | `239765ed` | prompten til codex-angreb (workdir @ ec4a3d9, plan-blob 423d9b20, 6 angrebsakser) |
| `plan-angreb-r1.provenance.txt` | `fase3/angreb-out/OUT-angreb-log.md.provenance` | `b22bd34697be1c095f4e720f625c77feeb9e8e9dc8e637bebe7d2b7e13241db6` | `342096cc` | codex-run.sh-provenance: start 2026-09-08T17:17:26 · attempt=1 · model=gpt-6-astra · effort=xhigh · timeout 2400 s · rc=0 · varighed 844 s · slut 17:31:30 |
| `plan-angreb-r1.codex-final.md` | `fase3/angreb-out/OUT-angreb-log.md` | `3b5e300f1c32ec83f3eecc107481eb805149c4b70e4a95a20db87651cd46c791` | `bcb8ea19` | Codex' afsluttende besked (`-o`-filen): »ANGREB-STÅR(15): 8 BLOKER, 7 RET« |
| `p4-plan-kildetjek.prompt.txt` | `fase3/p4-plan/prompt.txt` | `830577c836254e8fcf84f76048f300beab37279f121036374fda19203f305446` | `82d5eec6` | prompten til P-4 plan-kildetjek (workdir @ ec4a3d9) |
| `p4-plan-kildetjek.provenance.txt` | `fase3/p4-plan/out.md.provenance` | `9f2c5d937c2486ba0bf62899dc2a814b9089340cd1e1960b367205ed68e712ab` | `eea342ca` | start 2026-09-08T17:08:10 · attempt=1 · gpt-6-astra · xhigh · timeout 1800 s · rc=0 · 1271 s · slut 17:29:21 |
| `p4-plan-kildetjek.codex-final.md` | `fase3/p4-plan/out.md` | `524657e14d7da385fde304a367eacb38a648f7e3bbdadf473ddb76f767b1bab7` | `3a82c6b5` | Codex' afsluttende besked: »Planen kan ikke låses uændret« |

## Ikke arkiveret (deklareret)

- Codex' stderr-streams `fase3/angreb-out/OUT-angreb-log.md.log` (954 432 B, sha256
  `2e9b211ef5120dda1b7cafa18b3ad35f22bc7321e9c670e6605dde9e64c3520e`) og
  `fase3/p4-plan/out.md.log` (1 429 251 B, sha256
  `7c8744205c37874d3063799736eafd050ddcc466b467d94294a258720cc6cac9`) — `*.log` er gitignored;
  ligger i tmp-mappen så længe den lever.
- Attempt-markører (`.attempt1.started` / `.attempt1.done`, tomme filer) — tidsstemplerne står i
  provenance-filerne.

## Fresh-eyes plan-audit — REKONSTRUERET provenance (ikke rå aktør-output)

Skrevet af driver-10b ud fra filsystemet i `fase2/audit-fresh-eyes/`; deklareret som
rekonstruktion, ikke måling:

- **Ingen prompt- eller provenance-fil findes.** Instansen blev kørt interaktivt af den gamle
  driver; prompten er tabt med sessionen (kun i dens transkript — ikke autoritet).
- **Input-kopier** i mappen (alle mtime 2026-09-08 16:53) hasher (`git hash-object`) til:
  `plan-udkast.md` = `423d9b20` (plan v1 @ ec4a3d9) · `krav-doc.md` = `9402164d` ·
  `recon2.md` = `2bdbb122` · `ordbog.md` = `bcab6b4e` · `mathias-ord.md` = `e0b5933e`
  (= ledger @ 8b47693, M-1..M-40). Auditten skriver selv »mathias-ord.md (M-1..M-40)« — konsistent.
- **Output** `OUT-audit.md` mtime 2026-09-08 17:04:13.
- **Model/effort:** ikke logget. Claude-rolle-pinnen ved pinnen var claude-fable-5-1 · xhigh
  (M-33, actors.lock) — det er pinnen, ikke en måling af hvad der kørte.

## Tidslinje (u-arkiveret periode)

Plan-audit færdig 09-08 17:04 · angreb færdig 09-08 17:31 · den gamle driver døde 09-09 10:17
uden at arkivere (≈17 t u-arkiveret i driverens levetid) · sikkerhedskopi taget af mathias-9b
09-09 12:31 (`backup-fase3-fund/`, sha256-identiske) · arkiveret her 09-09 ca. 13:25
(≈20 t efter produktion).

## B2 — Codex' måle-adapter-tjek (dom, read-only, IKKE gate-verdikt) — arkiveret 2026-09-10 ~10:30 af driver-10b (session de4474)

Kørsel via `codex-run.sh codex-angreb dom` @ PIN `c843eb0` (regel_commit), run_id
`20260910T101827-1260310-4098`, gpt-6-astra · xhigh · sandbox read-only (banner: ingen network-linje =
offline), codex-cli 0.154.0, `gate_input: null`, `STORK_V5_GATE_INPUT` ikke sat. Workdir = fuldt
arkiv @ PIN uden `.git` (ikke blind — B2 må se plan og forventningsliste). Konklusion: **»KAN IKKE —
adapter-krav-liste følger«** — bogført som »adapter-krav-liste modtaget« (kontrakt-input til
fabrik-armens C1), IKKE som PASS. Alle kopier byte-identiske (`cmp`).

| fil | kilde (job-tmp `870c5b0e/tmp/b2/`) | sha256 | indhold |
| --- | --- | --- | --- |
| `b2-adapter-tjek.leverance.md` | `out/OUT-b2-adapter.md` (`-o`, 24 662 B) | `6cdac2c7a33c58d92c648c87f3cdeec461855873e966e5c7a94663e2d481b490` | Codex' dom: tabel 1 pr. bevisform · tabel 2 pr. K · reject-kontrakt · D10/D11/D12-kontrakt · frit pas (manifest-fund) · binding (7 blobs) |
| `b2-adapter-tjek.prompt.txt` | `prompt-b2.txt` (opgave-delen; rolleteksten @ skill_oid f6e64979 injiceres af wrapperen) | `4b0f7ffc134747f5f41d8ab6e5876e5c84419daa994fd5f0ea791dc4a034de7d` | prompten m. PIN + blobs udfyldt |
| `b2-adapter-tjek.provenance.txt` | `out/OUT-b2-adapter.md.provenance` | `e11e6e68f7414ff45818739584aba40c8db42347824e90d2cc154c3fc7721505` | wrapper-provenance (start · attempt 1 rc=0 · 453 s) |
| `b2-adapter-tjek.receipt.json` | `out/OUT-b2-adapter.md.receipt.json` | `83d88b90a54feaac88a8c10bfdb568f63d541843e98b1a90ebf84bc1af9f60f1` | transport-kvittering v2 (status success · binaries · attempts · prompt_sha256 12c989fc…) |
| `b2-adapter-tjek.codex-banner.txt` | første 14 linjer af `out/OUT-b2-adapter.md.stderr.log` | `9978f6871468edadfc39e8bf106a60de02181558b06675cf6d2e9f6ceb059c77` | Codex' banner = bevis for faktisk kørt politik (sandbox read-only, xhigh, session-id) |
| `b2-adapter-tjek.workdir-blobs.txt` | `provenance/workdir-blobs.txt` | `153438000d9becc62ca41169e39f28bdc9f4d331649a203e9534a595a9874753` | hash-object af de 6 input-filer i workdir'en før spawn |

Ikke arkiveret (deklareret): fuld stderr-strøm `out/OUT-b2-adapter.md.stderr.log` (`*.log` er gitignored)
— sha256 `2ea3457c072aeb298abceb30924663e5c748b8ca1b9956a5abc83cec179d5352`; ligger i job-tmp så længe
jobbet lever.

## B1 — Codex' BLINDE kill-list-udkast (produktion) — arkiveret 2026-09-10 ~10:40 af driver-10b (session de4474)

Kørsel via `codex-run.sh codex-angreb produktion` @ PIN `fe24947` (regel_commit), run_id
`20260910T101453-1257166-23934`, gpt-6-astra · xhigh · sandbox workspace-write, codex-cli 0.154.0,
`gate_input: null` (produktion — ingen VERDIKT-DRAFT-kontrakt), attempt 1 rc=0, 1372 s. **Blind
workdir** = arkiv @ PIN uden `.git` minus `plan-build/lokations-skabelon/` (alt), minus
`docs/workflow-faerdiggoerelse/{analyser-2026-09-08,p2-haerdning-2026-09-09}/`; kun krav · recon2 ·
P-8 · ledger @ PIN · ordbog @ 04e5cfb (før-plan) · bilag lagt tilbage ved blob — se
`kill-list-udkast.blind-workdir-verifikation.txt`. Blindhedens bevis = commit-orden: denne fil er
committet FØR planneren (B3) ser den. Leverancen `kill-list-udkast.md` ligger i mappen over denne
(gate-bundet navn, `DEFAULT_LAYOUT.killlist`; blob `13b78392`). Alle kopier byte-identiske (`cmp`).

**Deklareret afvig (A5):** Codex' banner viser `sandbox: workspace-write [workdir, /tmp, $TMPDIR]
(network access enabled)` — produktions-sandboxen havde netværk slået TIL (arv fra
`~/.codex/config.toml`); prompt-reglen »Web forbudt« var eneste værn i denne kørsel. Rettes af
fabrik-armen i wrapper-runde 10 (eksplicit `network_access=false` + tmp-ekskludering på alle kald).

| fil | kilde (job-tmp `870c5b0e/tmp/b1/`) | sha256 | indhold |
| --- | --- | --- | --- |
| `../kill-list-udkast.md` | `blind/kill-list-udkast.md` (92 795 B, 256 linjer) | `07b4e90f72e6676680e7aeaad8d5b45126043656813a3bb43f007959e9693f30` | leverancen: læseregel · K-1..K-9 tabeller (Tn.m targeted kandidater · Sn.m schema-kontroller · SL skal-leveres · overdragelser) · frit helhedspas · optælling (82 · 5 · 20 · 2 to-sessions) · binding |
| `kill-list-udkast.prompt.txt` | `prompt-b1.txt` (opgave-delen; rolleteksten @ skill_oid f6e64979 injiceres af wrapperen; samlet prompt_sha256 i kvitteringen = 9d07e701…) | `0d1156dd0ce77fde01c28062a343bf9401445ae2f5d1288ffc1a1a2fd22013c5` | prompten m. PIN + ledger-blob udfyldt (4536 B) |
| `kill-list-udkast.provenance.txt` | `out/OUT-killlist.md.provenance` | `3eb48874d2801f06d38c9bb863022ca4b32c5c3ea85ad985a6e9f61b2d4b169b` | wrapper-provenance (start · attempt 1 rc=0 · 1372 s) |
| `kill-list-udkast.codex-final.md` | `out/OUT-killlist.md` (`-o`, 770 B) | `3ea76df2b431f9f3c50008ae3a4d18227908277cc5346dfee7daebecb51d475e` | Codex' slutbesked: filnavn + sha256 + optælling + bindinger |
| `kill-list-udkast.receipt.json` | `out/OUT-killlist.md.receipt.json` | `3a188205f8955227f9eb30637bb3f664ee94b0cdd9e8fbfdeae54e2a26c6ceb7` | transport-kvittering v2 (status success · binaries · attempts) |
| `kill-list-udkast.codex-banner.txt` | første 14 linjer af `out/OUT-killlist.md.stderr.log` | `045973580559331a3a3b7b18e186efc9e7aba6378fc0a3fd068bb580e4e2904f` | banner = bevis for faktisk kørt politik (workspace-write m. netværk TIL · xhigh · session-id) |
| `kill-list-udkast.blind-workdir-verifikation.txt` | driverens verifikations-output før spawn | `ea568ef80122f6abdd4f285a841161a67d5c9f8390978e3a29136c73a162776a` | 6 blobs · bindende grep tomt · ledger-kontrol · informativt grep (6 forventede) · eneste ny fil efter kørsel |

Ikke arkiveret (deklareret): fuld stderr-strøm `out/OUT-killlist.md.stderr.log` (1 440 155 B, `*.log` er
gitignored) — sha256 `7ec0b1760ddfb1d7670dfd57ccc28fcb08b5972403c38f8d1bc1d01f3cada07c`; ligger i job-tmp
så længe jobbet lever.

## B3 — planner-code fold-ind → plan v2 (Claude-aktør via `claude -p`, produktion) — arkiveret 2026-09-10 ~16:55 af driver-10b (session de4474)

Ingen wrapper for Claude-aktører (deklareret residual): kald, model/effort (fra `actors.lock[planner-code]`
= claude-fable-5-1 · xhigh), PIN `d7972a1`, prompt-sha, input-blobs, forløb og afvig står i
`fold-ind-r2.provenance.txt`; CLI'ens result-JSON er kvitteringen (selv-erklæret). **To deklarerede
afvig:** (A) workdir'en lå under `~/.claude/jobs/…` → Claude Code nægtede al skrivning dér (»sensitive
file«) → planneren skrev til `/tmp/b3-planner/` (recept rettet); (B) sessionen blev afbrudt af »org's
monthly spend limit« 11:36:20 — ét sekund efter rapporten blev skrevet (sidste handling); slutbesked
og egen slutkontrol nåede planneren ikke (`is_error: true`, 100 ture, 48 min, 31,8 USD).
Fuldstændigheden dømmes af B4. Alle kopier byte-identiske (`cmp`).

| fil | kilde | sha256 | blob | indhold |
| --- | --- | --- | --- | --- |
| `../plan.md` (v2) | `/tmp/b3-planner/plan.md` (mtime 11:32:58; 158 265 B, 795 linjer) | `abd3f5866f84479b8b45309dc121bafafe7259433676a9a0e3ef948b294c3aca` | `2069aa16` | plan v2, status UDKAST: §0 bindinger · §1 krav-ID-matrix m. ID-regler (53 `K-n/ac-m` · 7 `K-n/S`) · §2 funktions-/tabel-register · §3 bids · §4 afgørelser V1-V13/S-1..S-32 · §5 ordbogs-arv · §6-§9 · §10 HALT (ingen) + bekræftelser B-1..B-3 + BV-1..BV-5 · §11 ændringslog pr. fund |
| `../fold-ind-rapport-r2.md` | `/tmp/b3-planner/fold-ind-rapport-r2.md` (mtime 11:36:19; 27 174 B, 107 linjer) | `f3d4fa4f34e93374260c693798c96cb44d1a8d608882a3dca0a159f0b31430cc` | `39936c64` | 46/46 fund RETTET M. BEVIS · 0 inden for mandat · 0 kræver Mathias · 0 åbne · NF-1/NF-2 (K-genlæsning, inden for mandat + B-1/B-3) · HALT: ingen · kill-list-disposition I/R/S pr. K · arv-noter |
| `fold-ind-r2.prompt.txt` | job-tmp `b3/prompt-b3.txt` | `862ac19504e8ecb990d6498722035e85de3db4703615bc7fa05c82bd5134d814` | — | rolletekst `planner-code.md` @ eb190c08 (byte-identisk) + separator + fold-ind-instruks m. PIN (20 449 B) |
| `fold-ind-r2.claude-result.json` | job-tmp `b3/out/OUT-b3.json` | `eddcac32f66429542c7cf2953193c42b0f9dfc58a2e0d66b2c8d6ae193232f36` | — | CLI result-JSON: session_id 548845d6 · model · usage · num_turns 100 · is_error true (spend limit) |
| `fold-ind-r2.settings.json` | job-tmp `b3/settings-b3.json` | `491be0c6c45901074abba755652d6a0858aafdcf502469d877b4f52ba6421335` | — | permissions allow (Read/Grep/Glob/Write/Edit + læse-Bash) / deny (web · curl · wget · rm · commit · push) |
| `fold-ind-r2.workdir-blobs.txt` | job-tmp `b3/provenance/workdir-blobs.txt` | `cc5a603b28d71e9f73754c25302c22ce0bd5f45812bb74c38632d8020b2bed30` | — | hash-object af 11 input-filer i workdir'en før spawn |
| `fold-ind-r2.provenance.txt` | skrevet af driveren | (denne commit) | — | fuld driver-provenance inkl. afvig A/B, transkript-sha, driver-observation D-1 (formålsblok-påstand) |

Ikke arkiveret (deklareret): session-transkriptet
`~/.claude/projects/-home-mathias--claude-jobs-870c5b0e-tmp-b3-wd/548845d6-e87a-4777-a278-96da49ed43f8.jsonl`
(2,9 MB; 74 Read · 15 Bash · 7 Write · 6 Edit) — sha256
`901ce0907ebb6f4244b6d8836a4c07baf0d70cfb8afbe5a71021f4adc94c1268`; ligger i Claude Codes projektmappe.
