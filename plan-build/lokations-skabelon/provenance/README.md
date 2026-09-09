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
