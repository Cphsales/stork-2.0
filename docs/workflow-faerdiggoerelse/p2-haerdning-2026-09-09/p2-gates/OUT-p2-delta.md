**Dom: FAIL(4) — F-1 består delvist; nye F-5–F-7 blokerer PASS.** Dette er P2-input til gaten, ikke den endelige menneskedom.

Dom­men er bundet til disse verificerede Git-blob-OID’er. Udtrækket mangler `.git`, så en samlet commit-OID kan ikke verificeres.

| Modul | Blob-OID |
|---|---|
| gates.mjs | `623851bcd79dbabc5f1bf599702c07a77ee7c133` |
| gate-eval.mjs | `1f9934570739d2b14b7ab27833f9084fbf15fe5b` |
| kvittering.mjs | `7f599e9835bde2086f23a77555f4f866e75737ab` |
| plan-gate-run.mjs | `f994805664dd6d455e15ccc2bc3e3da938a25f2f` |
| krav-gate-run.mjs | `c55317a4156c598e53f80518d131331ced1ddab8` |

Ingen filer skrevet; intet web. **82 kernecases og 42 kvitteringscases består med Git/FS modelleret i hukommelsen.** Mutanterne nedenfor er eksekveret dér. Det er ikke en kørsel mod temp-Git-repoer. Fuld runner-kørsel er desuden hindret af manglende `coverage.mjs`/`build-proof.mjs` i udtrækket.

| Fund | Lukket? | Fil:linje · efterprøvning |
|---|---|---|
| F-1 | **DELVIST; fortsat BLOKER** | [gates.mjs:363](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd2/scripts/v5/gates.mjs:363), [kvittering.mjs:113](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd2/scripts/v5/kvittering.mjs:113). Frisk verifikation kræves, men commit-rækkefølge autentificerer ikke Mathias’ handling. |
| F-2 | **LUKKET med afgrænset kørselsbevis** | [gate-eval.mjs:68](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd2/scripts/v5/gate-eval.mjs:68). Direkte og normaliseret alias afvises. Fjernet kollisionsværn gav `open:true` gennem kernen. |
| F-3 | **LUKKET via eksplicit D14-mandat; ingen kernerettelse** | [gates.mjs:340](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd2/scripts/v5/gates.mjs:340), [plan-gate-run.mjs:38](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd2/scripts/v5/plan-gate-run.mjs:38). JSON.parse kan ikke levere den egne `Symbol.iterator`. D14 er ærligt anvendt. |
| F-4 | **LUKKET med dræbt mutant** | [gate-kerne.selftest.mjs:246](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd2/scripts/v5/gate-kerne.selftest.mjs:246). Sæt-mutanten genåbner på ekstra digest-dublet; casen fejler. |

**F-1’s rest:** To commits med selvskrevet kvittering og approval åbner fortsat uden en verificeret menneskehændelse. Ny serialisering af approval kan skabe en senere berøringscommit uden ny godkendelse. Residualen er navngivet, men kommentarernes »beviser … godkendelsen« overdriver kontrollen. Desuden er M-38-undtagelsen ubetinget i [gates.mjs:60](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd2/scripts/v5/gates.mjs:60): proben accepterer helt nye krav-run-ID’er med genberegnet approval uden kvittering. En historisk undtagelse er ikke mekanisk afgrænset til den historiske godkendelse.

Lukning kræver autentisk hændelsesbevis eller **Mathias’ udtrykkelige mandat til den svagere kontrakt og undtagelsens omfang**. En residual-deklaration lukker ikke fundet.

**F-5 · Modstridende devil-dom accepteres · BLOKER**  
[kvittering.mjs:71](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd2/scripts/v5/kvittering.mjs:71), linje 108 · **klasse: forkert kilde til dom**.

Repro: Devil-blobben indeholder allerede `FAIL\n`; kvitteringen binder dens korrekte OID, men skriver `dom:"PASS"`. Produktionsverifikator + kerne giver **`open:true`**. Testen med *efterfølgende* ændring til FAIL dækker ikke dette. Rettelse: Læs et entydigt devil-verdikt fra blobben; kræv PASS og binding til fremlæggelsen/gatescope. Targeted mutant: accepter kvitteringens PASS uden denne indholdskontrol.

**F-6 · »blob_oid« må være et tree · RET**  
[kvittering.mjs:108](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd2/scripts/v5/kvittering.mjs:108) · **klasse: manglende objekt­typekontrol**.

Repro: Sæt fremlæggelsens path til en mappe og `blob_oid` til mappens tree-OID. Resultat: **`open:true`**, selvom ingen fremlæggelsesfil foreligger. `rev-parse` beviser eksistens/OID, ikke blobtype. Rettelse: Kræv `cat-file -t === "blob"` for begge referencer. Targeted mutant: udelad typeværnet; tree-casen skal dræbe den.

**F-7 · Flytbart HEAD blander to ugyldige evidenstilstande · BLOKER**  
[plan-gate-run.mjs:38](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd2/scripts/v5/plan-gate-run.mjs:38), linje 46/58; [kvittering.mjs:113](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd2/scripts/v5/kvittering.mjs:113) · **klasse: tid/rækkefølge**.

Repro: H1 har approval til en endnu ikke committet kvittering. Læs approval. Flyt HEAD til H2, hvor kvitteringen er tilføjet og approval derefter slettet. Verifikatoren bruger sletningscommitten som `cA`. **H1 afvises for digest-mismatch; H2 mangler approval; blandingen giver `open:true`.**

Rettelse: Opløs evidensreferencen én gang til commit-OID **E**, og brug samme E gennem begge runnere og verifikatoren. HEAD kan være indledende vælger; E skal ikke automatisk være artefaktcommitten, eftersom evidensen kommer senere. Targeted mutant: genindfør gentagne HEAD-læsninger under kontrolleret refskift.

| Mutant | Dræbt i den afgrænsede kørsel? |
|---|---|
| a · Fjern ancestor-kald | **Ja** — kvittering efter approval, kvitteringstest:78/98 |
| b · Tillad `cK===cA` | **Ja** — samme commit, kvitteringstest:92 |
| c · Fjern fremlæggelses-OID-check | **Ja** — ændret tekst, kvitteringstest:86 |
| d · Brug `[...pd]` | **Ja** — eksisterende iterator-case:55–56; ingen ny D14-vektor |
| e · Ignorer verifier-resultatet | **Ja** — kerne:251–252 |
| f · Plan `approvalReceipt:false` | **Ja** — approval uden kvittering åbner, kerne:249 |
| g · Udelad `ctx.verdictDigests` | **Ja** — grøn plan-kontrol fejler, kerne:235/179 |

Det øvrige er rigtigt eller afgrænset således:

- Ens `cK/cA` og ikke-forfædre afvises. Rebase/amend/squash, der giver begge filer samme berøringscommit, bliver derfor rødt. Mergehistorik er ikke eksekveret her; `git log -- path` historiesimplificerer og beviser ikke hændelsen. En merge, der ændrer approvalbytes, kan skabe ny `cA` uden nyt menneske-ok: F-1.
- Rename følges ikke med `--follow`. Manglende approval ved en **stabil** evidensreference stopper runnerens læsning; verifikatoren alene kontrollerer ikke filens aktuelle eksistens.
- En anden sti med identiske bytes er ikke et indholdshul. Git-objektopslag følger ikke symlinkmålet ud på filsystemet. Null-prototype giver heller ikke en ny DATA-nåelig omgåelse.
- Senere krav-evidens kan påvirke en frisk plan-genkørsel; det er ikke alene et fund. E skal fastholdes for reproducerbarhed. Tilsvarende er sen commit af fremlæggelsesbytes ikke et selvstændigt fund, når kvitteringen allerede fastlåser deres hash; den ubeviste fremlæggelseshændelse hører under F-1.