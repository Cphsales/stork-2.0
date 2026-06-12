# v6 — Komplet plan: gør workflowet færdigt (UDKAST til Mathias' dialog)

**Status:** UDKAST. Intet valgt (kontrakt §5/§9: valg sker i dialog).
**Grundlag (opslags-tid 2026-06-12T21:3xZ, main @ `554f280`):** faktisk
kode læst — `kaede-regler.json` (109 l.), `dirigent.mjs` decide()+betingelser
(l. 47-330), `tilstand.mjs` parsere (l. 1-55), `code.sh` (58 l.). Krav-dok B
(`v6-krav-og-data.md`) læst fuldt; krav-dok A (`gov-6-forslag-og-udskudte.md`)
læst i denne samtale (H2: ikke gen-åbnet i dette skridt — deklareret).

## Formål (én sætning)

Workflowet gøres v6-komplet: den eksisterende, beviste kæde-motor kobles
på den godkendte ramme + porten, så ÉN workflow dækker begge flader —
uden at bygge nyt dér, hvor motoren allerede virker.

## DEL 1 — Nuværende opsætning mod de to krav-dok (gap-analyse)

**Afgørende kode-fund (modsiger min tidligere "gap"):** Den mekaniske
gate-rækkefølge EKSISTERER allerede i `decide()` + `betingelser`
(`kaede-regler.json:92-98`):

- `build-start` kræver `codex-approval-paa-aktuel-plan-sha` +
  `troskabs-pass-paa-aktuel-plan-sha` + `ingen-aabne-gates` — fail-closed
  (`dirigent.mjs:69-71` default false).
- `krav-dok-merge` kræver `krav-ok-hash-matcher-fil-hash`.
- `slut-merge` kræver `claude-ai-approval` + `slut-ok-registreret`.

Gappet er altså IKKE at bygge motoren. Gappene er:

| Krav (B)                      | Tilstand i koden                                                                                                                            | Gap                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| §6 mekanisk rækkefølge        | FINDES (decide+betingelser)                                                                                                                 | Slukket (service inactive)               |
| §6 nuværende kode respekteres | adapters bærer V5-frame: `code.sh:42` peger på slettet `docs/LÆSEFØLGE.md`; `:17,18,24` på disciplin-§'er; `regler:11` har `qwerg` (udgået) | Repoint til ramme + produktionsregler    |
| §6 begge flader, samme metode | kæden = pakke-flade; porten = uden-om                                                                                                       | De to er ikke forbundet om ÉN ramme      |
| §8 fald 9 / H4 blind-først    | codex-review → troskabs-tjek kører SEKVENTIELT (`regler:39-52`); intet hindrer at troskab ser codex' verdikt                                | Blind-først mangler                      |
| Konvergens (78 runder-arret)  | counter findes (§3.4)                                                                                                                       | Bremsen ikke i regelbogen som betingelse |

**Mod krav-dok A:** dets formål er forældet (V5-gennemgang); dets
indhold (begrebs-hygiejne, docs-renhed, mappestruktur) er separat
docs-arbejde — IKKE workflow-mekanik. Hører i en egen bid, ikke denne.

## DEL 2 — Den rigtige løsning (fra kravene, ikke fra koden)

Tegnet kun fra kontrakten ville formen være: ÉN port på hver handling
(begge flader) · rækkefølge som fysik (dine ord = nøgler, vagt siger nej)
· fangst udefra og BLIND · niveau injiceret fra start · alt versioneret.

**Fund der UDFORDRER egen retning (H3):** Ekstern forskning (2026,
frisk): multi-agent krydsreview er overvurderet — værdien er smal, og
flertalspres undertrykker korrektion; det der virker er BLIND-først +
genuint forskellige roller. Gov-5 brugte 78 runder. Konsekvens: den
rigtige løsning er FÆRRE, blinde, diverse review — ikke mere maskine.
Det taler MOD at genoplive kæden i fuld V5-tyngde, og FOR at det meste
af "den rigtige løsning" allerede står (motoren) og kun skal renses +
gøres blind, ikke udvides.

Sammenfald: den rigtige form (fra kravene) og den eksisterende motor
peger samme vej — motoren ER kontraktens rækkefølge-fysik, bygget. Det
gør koblingen billig, ikke en ombygning.

## DEL 3 — Kobling + patch-først + rækkefølge (komplet)

**Bid 1 — Repoint adapters til v6-rammen.** Patch-først:

- `code.sh:42` NU: `"Følg docs/LÆSEFØLGE.md … PLAN-DIÆT (4b) …"` →
  DIFF: erstat `docs/LÆSEFØLGE.md` med ramme + `v6-produktionsregler.md`;
  bevar plan-diæt-substansen (sektionsvis læsning).
- `code.sh:17,18,24,25` §-referencer (§3.2/§10.2/§10.3/§3.5) → erstat med
  produktionsregel-numre; bevar opgave-substansen ordret.
- `codex.sh` + `claude-ai-rolle.sh`: samme repoint (sås i nattens
  tilbageførte commit — genskabes rent).
  Risiko: lav (tekst i prompt-bygning). Selvtjek: kæde-selftest grøn +
  adapter nævner `faelles-ramme.md`.

**Bid 2 — Genhøst produktionsreglerne** (`v6-produktionsregler.md`):
patch-først, DB-state-først, destruktiv-preflight, m.fl. Kravet §6
"nuværende kode respekteres". Egen fil; ingen kode-ændring.

**Bid 3 — Blind-først i regelbogen.** Patch-først `kaede-regler.json`:

- `gate_ord:11` NU: `[…, "qwerg", …]` → DIFF: fjern `qwerg` (udgået, gov-5).
- `betingelser.build-start:94` → tilføj at codex-review og troskabs-tjek
  dispatches BLINDT: troskabs-tjekket må ikke modtage codex' verdikt-fil
  som kontekst (kun planen + kravet). Mekanik: separat kontekst pr.
  dommer. Risiko: MELLEM (rører dispatch-kontekst) → bryd-test påkrævet.

**Bid 4 — Konvergens-bremse som betingelse** (regel 9): substans-runde-
tæller i regelbogen; >3 → BLOKERET + til Mathias.

**Bid 5 — Aktivér + drifttest.** Service startes; ét rigtigt
masterplan-trin (10b) gennem hele flowet med porten aktiv.
FALSIFICERING (H5 — hvad modbeviser "workflowet virker"): testen er
bestået KUN hvis (a) plantet gate-brud → BLOKERET (byg uden krav OK, byg
med kun codex-approval, forældet plan-SHA, gate-ord fra forkert afsender,
luk uden slut OK — hver skal give BLOKERET), OG (b) Mathias' tid faldt
til ren beslutning. Grøn selvtest alene modbeviser intet (regel 11).

**Hver bid kører selv gennem flowet** (krav → blind godkendelse → byg →
Mathias' luk). Rækkefølge: 1→2→3→4 kan delvist parallelt; 5 sidst.

## Doc-currency (hvad dør — regel 33a)

`disciplin.md` (V5) → ar høstet i bid 2, derefter pensioneres. Døde
gate-issue #126-tilstand afklares. Intet nyt dokument ud over denne plan

- produktionsreglerne.

## Hvad denne plan IKKE er (afgrænsning)

Ikke masterplan-produktion (trin 10b er drifttestens emne, ikke
leverancen). Ikke krav-dok A's docs-renhed (egen pakke). Ikke
line-level patch-først for hver adapter-linje — det er bid 1's eget
første skridt mod live kode (patch-først kræver fuld body-udtræk på
byggetidspunktet, regel 2: maskinelt, ikke fra denne plan).
