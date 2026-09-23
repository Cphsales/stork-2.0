# fold-ind-rapport r9 — lokations-skabelon (plan v3.6 `807fdf93` → plan v3.7 `93429178`) — KUN delta: ÉN rettelse, DRIVER-MEKANISK efter B6 runde 5's domme

**Forfatter:** driveren (mathias-5f) — IKKE planner-code. **Grundlag:** fabrik-armens vilkår 23/9 (mathias-c5): »driver-mekanisk rettelse er OK — byte-præcist efter A8-1/R-1/R-2's anvisning (ingen egen formulering ud over det de tre dommere har skrevet), dokumenteret her, §11.8 nævner det, og de tre delta-domme (runde 6) dømmer resultatet«. Instruks-udkastet `fold-ind-instruks-v36.md`'s efterfølger `fold-ind-instruks-v37.md` blev skrevet FØR dommernes præcise anvisning var læst og talte to fjernelser; anvisningen er ÉN fjernelse + én pinning + én afgrænsning — den følges (instruks-filen står som spor, ikke som facit).

## 1. Dommerne (runde 5 @ `0264a291`, v3.6)
- **Codex A8** (`plan-angreb-r8.md`, receipt 20260923T111733-819102-24122): FAIL 1 — **A8-1 (klasse a)**: K-1/S/neg-1's sole-binding holder ikke: »`plan.md:312,314,520` monterer AFTER INSERT-triggere, som skriver til `pris_historik` og `lokation_gruppe_historik`. Historikfunktionerne er ikke specificeret som `SECURITY DEFINER`; den beskrevne SECDEF-kontekst kommer fra RPC-vejen. Direkte INSERT som `authenticated` får ikke denne RPC-ejerkontekst« → grant-mutanten kan ikke frembringe den lovede lagrede lokation. K-2/ac-1/neg-5: BEHOLD ja (»INSERT af en gyldig stand med `dagspris=NULL` udløser ingen prislog-INSERT«). K-8/ac-1/neg-1: BEHOLD »ja, for repræsentanten … den brede generalisering rammes dog af A8-1«. KB-#7 · FA-3: lukket.
- **code-reviewer C5** (`plan-slutlaesning-r7.md`): FAIL 2 — **R-1** = A8-1 · **R-2**: »#3's sole er kun sand i `dagspris IS NULL`-formen (arv). Pin ligheden i `:672` og manifest`«; hunk-tabel: »246c246 · 253c253 … ›INSERT/UPDATE på de 6‹-generaliseringen rammes af R-1/R-2« · »672c672 … R-1/R-2 rammer teksten«. Øvrige 10 afgørelser rigtige; validator/diff grønne.
- **claude-ai D5** (`plan-verdikt-claude-ai-r5.md`): PASS — ingen forretningsændring; §10 byte-identisk m. det Mathias godkendte (M-45).

## 2. Rettelsen (tabel × operation × værn-lag)
| negativ | tabel × op | v3.6 | v3.7 | grund (dommernes ord) |
| --- | --- | --- | --- | --- |
| K-1/S/neg-1 | INSERT `lokationer` | BEHOLD sole | **FJERN sole** (negativet består, 42501 i normalen) | A8-1/R-1: invoker-historiktriggere (`_pris_historik_lokation` · `_lokation_gruppe_historik`) kaskaderer INSERT'en til logs uden write-policy → RLS default-deny stopper effekten |
| K-2/ac-1/neg-5 | INSERT `stande` | BEHOLD sole (uspecificeret form) | **BEHOLD sole, lighed pinnet til `dagspris IS NULL`** | R-2 / A8: kun i NULL-formen fyrer `_pris_historik_stand` ikke; m. dagspris sat er negativet dobbelt-dækket |
| K-8/ac-1/neg-1 | UPDATE `grupper` (repræsentant) | BEHOLD sole + generalisering »6 master-/relationstabeller« | **BEHOLD sole for repræsentanten ALENE**; generaliseringen fjernet | A8/C5: generaliseringen rammes af A8-1/R-1/R-2. Fabrik-vilkår: runde 6's Codex-delta dømmer om UPDATE `grupper` selv kaskaderer ind i en log uden write-policy — falder den, fjernes sole også dér |

**Tal:** `g.app_dml_revoke`-bindinger 4 → 3 · sole-bindinger 40 → 39 · eneste-værn 12 → 12 · forpligtelser/negativer/assertions 60/127/150 uændrede · validator: gyldigt.

## 3. Hunks (`diff provenance/plan-v36.md plan.md`)
`1c1` (v3.7 + `plan_v36_oid`/`manifest_v36_oid`) · `11c11` (indledning) · `13c13` (pinned = worktree-commit) · `104c104` (§0.2 AK-DIREKTE-DML værn-lag) · `246c246` (K-8/ac-1 T8.1-tekst) · `253c253` (kill-list-binding K-8) · `672c672` (S-29) · `1046c1046` (§11.7-note) · `1051a1052,1064` (§11.8). I §1-§3 KUN 246 og 253. Manifest: K-1/S/neg-1 (sole fjernet + beskrivelse) · K-2/ac-1/neg-5 (beskrivelse, pinning) · K-8/ac-1/neg-1 (beskrivelse, repræsentanten) · `g.app_dml_revoke`-beskrivelse · `bindings.plan.oid` = `934291780be93ec7353d7a9f777b4661e79a0158`.

## 4. KRÆVER MATHIAS: 0 · HALT: ingen · ÅBNE: 0 (runde 6 dømmer; fabrik-vilkåret om UPDATE `grupper`-kaskaden er runde 6's Codex-opgave).
