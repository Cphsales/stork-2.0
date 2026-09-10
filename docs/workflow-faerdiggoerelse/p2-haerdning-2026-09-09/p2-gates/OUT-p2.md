**Dom: FAIL(4)** — ét BLOKER-fund og tre RET-fund. Runtime-fundene ligger i eksisterende fælleskode; ændringen gør dem relevante for plan-gatens nye kontrakt.

Ingen filer skrevet. Jeg har læst begge selvtests og kørt målrettede prober samt relevante eksisterende cases i hukommelsen med produktionskernen og verdikt-verifikatoren, men en simuleret git-afhængighed. De komplette selvtests blev ikke kørt, fordi de skriver midlertidige repoer.

**F-1 · Godkendelsesdata beviser ikke godkendelseshændelsen · BLOKER**

[gates.mjs:313](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd/scripts/v5/gates.mjs:313), `gate-eval.mjs:74`, `krav-gate-run.mjs:58,72` · **forfalskning**

**Repro:** Tag `greenPlan()`, ændr et verdikts `run.run_id`, og erstat den gamle approvals `prerequisite_digests` med de nye `verdicts.map(digestOf)`. Resultat: `open:true`, uden nogen ny menneskelig godkendelse.

Digests kan beregnes af enhver. Kernen kontrollerer lighed, men verificerer hverken godkendelsens ophav eller hændelsesrækkefølgen. Det er en dokumenteret tillidsgrænse i `gate-eval.mjs:9–13`; den konkrete fejl er, at den medsendte krav-runner tager approval fra en committet fil og sender den videre uden verifikation af godkendelseshændelsen. En tilsvarende plan-runner er ikke medsendt.

**Konsekvens:** En skriver af evidensfilen kan efterkonstruere »Mathias sidst«. `orderedApproval:true` alene beviser ikke M-41’s hændelseskæde.

**Konkret rettelse:** Kræv en approval-verifikator, og luk ved manglende verifikation:

```js
const verified = deps.verifyApproval?.(a, {
  gate_id: gateId,
  scope_digest: expectedScope,
  prerequisite_digests: verdictDigests,
});
if (verified?.ok !== true)
  fail("approval: autentisk godkendelseshændelse/rækkefølge ubevist");
```

Verifikatoren skal kontrollere en uforanderlig serverkvittering, som forbinder de endelige verdikter, fremlæggelsen og Mathias’ efterfølgende godkendelse. Et nyt selvangivet `verified:true` løser intet.

**F-2 · Layout-alias kan erstatte den hårde killlist-binding · RET**

[gate-eval.mjs:64](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd/scripts/v5/gate-eval.mjs:64) · **fail-open**

**Repro:** Kill-list-filen mangler ved commit. Kald med:

```js
layout: { ...DEFAULT_LAYOUT, killlist: DEFAULT_LAYOUT.recon2 }
```

Lad verdikter og approval binde de resulterende OIDs. Proben gav `open:true`: `recon2` og `killlist` resolver til samme recon2-fil.

**Konsekvens:** Fem bindingsnøgler sikrer ikke fem korrekt adskilte inputroller. Dette kræver et layout-override; standardlayoutet er korrekt.

**Konkret rettelse:** Afvis sammenfaldende, normaliserede stier blandt den aktuelle gates artefakt og bindinger før resolution:

```js
const nodes = [gate.artifact, ...gate.bindings];
const paths = nodes.map(n => posix.normalize(nodePath(n, pakke, layout)));
if (new Set(paths).size !== paths.length)
  throw new Error("gate-eval: sammenfaldende input-stier");
```

Importér `posix` fra `node:path`. Kontrollér pr. gate: den eksisterende globale alias mellem `build` og `build-proof` er legitim. Kræv ikke forskellige OIDs; forskellige filer må gerne have identisk indhold.

**F-3 · Egen iterator omgår prerequisite-arrayets indhold · RET**

[gates.mjs:327](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd/scripts/v5/gates.mjs:327) · **omgåelse**

**Repro på `greenPlan()`:**

```js
const valid = s.approval.prerequisite_digests;
s.approval.prerequisite_digests = [];
s.approval.prerequisite_digests[Symbol.iterator] = function* () {
  yield* valid;
};
```

Resultat: `open:true`, selvom feltets array har længde nul. `[...pd]` læser den brugerdefinerede iterator.

**Konsekvens:** Den krævede liste kan være tom og stadig accepteres. Angrebet gælder direkte JavaScript-input; JSON alene kan ikke bære iteratoren.

**Konkret rettelse:** Læs egne datafelter ved indeks og behold længde- og lighedskontrollen:

```js
const got = Array.from({ length: pd.length }, (_, i) =>
  Object.getOwnPropertyDescriptor(pd, String(i))?.value
).sort();
```

Tilføj reproen som negativ case. Huller og accessors giver dermed ikke gyldige digests.

**F-4 · Mutant e overlever selvtestene · RET**

[gate-kerne.selftest.mjs:234](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-gates/wd/scripts/v5/gate-kerne.selftest.mjs:234) · **test-kan-ikke-fejle**

**Repro:** Erstat multiset-sammenligningen med sætlighed. De relevante eksisterende cases består stadig. Derefter accepterer mutanten `[d1,d2,d3,d1]`, hvor produktionskoden korrekt lukker.

**Konsekvens:** Testene beskytter ikke kravet om præcis én digestreference pr. endeligt verdikt. Dette er en testmangel; den nuværende længdekontrol er korrekt.

**Konkret rettelse:**

```js
plantClosed("plan approval med ekstra digest-dublet",
  "plan", greenPlan, c => {
    const pd = c.snapshot.approval.prerequisite_digests;
    pd.push(pd[0]);
  }, "orderedApproval");
```

Mutant-tabellen bruger **K** = `gate-kerne.selftest.mjs`, **E** = `gate-eval.selftest.mjs`.

| mutant | fanget af case? |
|---|---|
| **a:** Fjern `killlist` fra registry | **Ja:** grøn plan-case K:227 og bindings-/nøglesætskontroller E:120,123. K:230 alene dræber ikke mutanten; verdikternes ekstra binding holder stadig gaten lukket. |
| **b:** `orderedApproval:false` | **Ja:** K:233 åbner fejlagtigt uden prerequisites. Grøn plan-case K:227 fejler også, fordi prerequisites nu afvises som uventede. |
| **c:** `DEFAULT_LAYOUT.killlist = recon2` | **Ja:** eksakt sti E:120 og manglende-fil-case E:135. |
| **d:** `sameOidMap` accepterer delmængder | **Ja:** K:237 åbner fejlagtigt; casen genberegner approval-digests, så stale approval ikke skjuler fejlen. |
| **e:** Prerequisites sammenlignes som sæt | **Nej:** manglende digests og helt forkerte digests testes; et komplet sæt med ekstra dublet testes ikke. |

Det øvrige er korrekt eller afgrænset således:

- **Manglende/null binding:** `resolveRef` returnerer `null` (`git.mjs:38`). `isRef(null)` er falsk; `gates.mjs:212,215` returnerer straks lukket med `binding 'killlist' mangler/ugyldig`. Ingen verdikt-/approval-kontrol kan ophæve fejlen.
- **Alle fem OIDs:** `sameOidMap` kræver eksakte nøgler og værdier (`gates.mjs:154–159,280`). Delmængde, ekstra nøgle og omdøbning blev afvist.
- **Genbrug fra krav:** `scopeDigest` inkluderer `gate_id` (`gates.mjs:121–122`); krav-scope med ellers identiske plan-OIDs afvises. Krav-verdikt-digests afvises også. Dette beskytter mod genbrug, men ikke F-1’s efterkonstruktion.
- **Tre aktører:** Ukendt aktør, aktørdublet og manglende aktør blokerer (`gates.mjs:249–267`). Ombytning af lister accepteres korrekt. For almindelige arrays afvises både en gentaget digest, der erstatter den tredje, og en ekstra dublet (`gates.mjs:326–331`).
- **Forgænger:** Manglende predecessor, forkert gate, ikke-`success` og forkert krav-OID blokerer (`gates.mjs:347–359`). Resuméets autenticitet/friskhed er kalderens ansvar; kernen slår ikke check-run’et op.
- **Pakke/layout:** Traversal, shelltegn, kolon og afsluttende newline blev afvist (`gate-eval.mjs:59`). Git bruger argumentarray, ikke shell (`git.mjs:15`). Standardlayoutet dækker præcis registryets samlede nøgler. Manglende anvendt layoutnøgle kaster; ekstra layoutnøgler ignoreres (`gate-eval.mjs:39–42,66`). Ukendte *snapshot*-bindinger afvises derimod.
- **Andre gater:** Ingen ændrede bindingssæt eller generelle antagelser om fem bindinger. Snapshot-opbygningen læser kun den valgte gates nøgler (`gate-eval.mjs:64–66`). Krav-/recon-runnerne efterspørger derfor ikke de nye filer. `predecessorBinding` er uændret.
- **Fixture:** `greenPlan()` har tre aktører, fem bindings-OIDs, erklæret læsning af alle input og verificeret citat fra planens linje 3 (`K:149–175`). Den er strukturelt egnet til kernetesten; den beviser ikke blind produktionshistorik eller en faktisk menneskelig hændelse.
- **Tom kill-list:** En eksisterende nul-byte-blob accepteres; manglende fil afvises. Det er ikke et fund efter vejnings-reglen, når tomhed kan være legitim. Behold den hårde eksistens-/OID-binding. Et generelt krav om »ikke-tom« ville afvise legitime tomme resultater og kan stadig opfyldes af en meningsløs overskrift.