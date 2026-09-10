**FAIL(3) — G-F1, rest-F-16 og nyt F-18; F-15’s afhængige rest tælles ikke dobbelt.**

Ingen filer skrevet; intet web. Deltaets syv før-/efter-versioner rekonstruerer de angivne blob-OID’er; de fem uændrede moduler matcher runde 3. `.git` mangler, så commit-tilhørsforhold kan ikke attesteres.

**Kørselsgrundlag:** 99 kvitteringsassertioner og 87 kerneassertioner består med Git/FS modelleret i hukommelsen. Produktionskernen, verifikatorerne og hjælperen er udøvet; Bash-prober er afgrænsede kodesnit. Fuld wrapper-/runnerkørsel er ikke udført; udtrækket mangler også `coverage.mjs`/`build-proof.mjs`.

| Fund | Dom | Fil:linje |
|---|---|---|
| T-F3 | **LUKKET**, afgrænset effektbevis: ægte rolle bevares; fjernet PATH-skift giver injiceret rolle efter bestået hashkontrol | `codex-run.sh:66,189` |
| T-F7 | **LUKKET**: 11 reserverede navne afvises før låsen; normalt navn passerer | `codex-run.sh:105` |
| T-F8 | **LUKKET**: slettet, stadig refereret rolle giver exit 2; fjernet reference giver exit 0 | `pre-commit-zone.mjs:57` |
| F-14 | **LUKKET**: FAIL-leverance + PASS-verdikt lukker gaten; fjernet genudledning åbner den | `kvittering.mjs:261` |
| F-15 | **DELVIST**: rolle, kørselsfelter og forskellige faste låse håndhæves; flytbar regelref omgår bindingen, F-18 | `kvittering.mjs:249,254` |
| F-16 | **DELVIST**: annoncerede backtick-cases rettet; andre citerede blokke bliver stadig autoritative | `kvittering.mjs:288` |
| F-17 | **LUKKET for de annoncerede målehuller**: type-, ref- og replacement-mutanter dræbes; binærpinnens mismatch/match-grene er nået | `kvittering.selftest.mjs:134,151,169`; `codex-run.selftest.mjs:241` |
| G-F1 | **IKKE — HALT, kræver Mathias’ ord**. For dette fund er alene mandatet udestående; historiske digests matcher | `gates.mjs:38,386` |

**Rest-F-16:** En leverance med »Dom: FAIL« og en PASS-draft som eksempel inde i `~~~markdown … ~~~` giver **hjælper exit 0/PASS og gate `open:true`**. Det samme gælder en ydre fire-backtick-fence indrykket to mellemrum. Begge ignoreres som ydre fences. Den annoncerede uindrykkede fire-backtick-case afvises korrekt. Kræv effektcases for begge rester og mutanter, der ophæver deres citeringsværn.

**F-18 — regelref genopslås efter lighedskontrollen.**  
`regel_commit` kræves kun som ikke-tom streng (`kvittering.mjs:191`; `verdikt-byg.mjs:73`). Med `"HEAD"` kan OID-opslagene se den gældende **xhigh-lås**, hvorefter HEAD flyttes til en **low-lås** før indholdslæsningen. En konsistent low-kvittering accepteres da: **hjælper exit 0/PASS/low og gate `open:true`**. Uden refskift bliver samme input rødt.

Loci: `kvittering.mjs:254–259`, `verdikt-byg.mjs:144–150`. Bind regelcommit til en fast commit-OID og læs den låseblob, der blev sammenlignet. Kræv refskift-casen gennem begge effektveje; en ældre fast commit med identisk låseblob skal fortsat bestå.

E = eksekveret med ovenstående afgrænsning; K = vurderet fra leveret testkode.

| Mutant | Fanges af leverede selvtests? |
|---|---|
| a · drop system-PATH-skift | **K: ja**, falsk `cat`; egen snitprobe dræber også |
| b · drop reserveret-navnecheck | **K: ja**, syv navne; egen snitprobe dræber også |
| c · drop slettet-rolle-check | **Nej, men redundant:** index-opslaget afviser stadig. Ingen leveret hook-fixture. Egen meningsfuld mutant, som også genindfører HEAD-fallback, dræbes |
| d · drop leverance-genudledning | **E: ja**, tre assertions |
| e · drop `codexRolle`-check | **E: ja**, konsistent forbedringsrolle accepteres fejlagtigt |
| f · drop låselighed | **E: ja**, konsistent low-kvittering accepteres fejlagtigt |
| g · accepter fire-backtick-åbner | **E: ja**, fire-fence-casen |
| h · drop approval-indholdsbinding | **E: ja**, ændret approval-indhold accepteres fejlagtigt |

Tree-mutanten dræbes nu på den krævede fejltekst; verifieren forbliver rød på fixturets anden devil-binding. Det er ikke et grønt-til-rødt effektbevis for typen alene, men mutanten overlever ikke længere testen.

Det rigtige er også:

- **CODEX_PATH genåbner ikke den konkrete T-F3-vej:** kun Codex-processen får node-mappen; wrapperens værktøjer beholder system-PATH. Alle nødvendige værktøjer findes her i `/usr/bin` og er ikke UID-skrivbare. Nvm-mappen er UID-ejet; prefixkontrol beviser ikke binærintegritet.
- Identiske leverancebytes under to navne ændrer ikke domsindholdet. Canon-sorteringen er rekursiv. Forkert evidensblob/uddrag afvises af kernens læsebevis.
- r4b’s faktiske rolle kan ikke udledes af artefaktet; den præcise digest-undtagelse består. Fremtidige krav-verdikter kræver nu `codex-angreb`.
- Ældre commit med **samme låseblob** accepteres korrekt; F-18 gælder genopslag af en flytbar ref.

Dømte blob-OID’er, uden commit-attestation:

```text
codex-run.sh      24ef8499f390ddca460cee1f90f11ec9353e5309
verdikt-byg.mjs   69cadd34d55c7d49e5fe1a0799b659bfe091e508
verdikt.mjs       4d80c7b05f01540d6a3a65438fb07ad172e334b7
git.mjs           9bc53ebfd7ea1a4e56906a567f276638297620cb
gates.mjs         9c94efde403d26312f72557b3bfb5dcf1a223429
gate-eval.mjs     1f9934570739d2b14b7ab27833f9084fbf15fe5b
kvittering.mjs    2bfbc06cd4e74da043be59ced09bd009e65b7cd8
plan-gate-run.mjs 8b4f60f529262e353a9f8f3a89c72819a3aee5f3
krav-gate-run.mjs a8723a5321e733b4b5fc385559087ad2195daf9f
```