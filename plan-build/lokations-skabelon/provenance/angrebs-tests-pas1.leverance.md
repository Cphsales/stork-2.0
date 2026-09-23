**LEVERET-DELVIS — pas 1.** [Indekset]( /tmp/claude-1000/-home-mathias/f959f211-d030-4057-8817-443b2b6f1add/scratchpad/f4/wd-tests/plan-build/lokations-skabelon/angrebs-spec.json) er bundet til blob `dd6cec8da39f3a914b921f077e8146f00cf9723c`.

Input-OID’erne matcher. Alle testfiler består syntakskontrol og `loadTests` med korrekte OID’er, ID’er og covers. Produktkørsler og mutant-kills er **ikke udført**; der findes ingen build.

| Leverance | Antal |
|---|---:|
| Testfiler | 8 |
| Tests | 44 |
| Forpligtelse×form | 59/103 |
| Fuldt dækkede forpligtelser | 29/60 |
| Negativer | 90/127 |
| Delbeviser | 67/150 |
| Designede mutanter | 19 |
| D10-bindinger med måltest | 32/48 |

Manifestets 60 forpligtelser har tilsammen **103 formbindinger**.

Mutanter krediteret pr. K via måltestenes covers: **K-1: 2 · K-2: 1 · K-3: 1 · K-4: 5 · K-5: 3 · K-6: 6 · K-7: 4 · K-8: 4 · K-9: 1**. Krediteringer overlapper; ingen drab er attesteret.

| Eneste-værn | Mutanter |
|---|---:|
| `g.app_dml_revoke` | 6 |
| `g.pii_klassifikation_guard` | 4 |
| `g.mapping_daekning_guard` | 0 |
| `g.lokation_anonymiseret_gate` | 0 |
| `g.w15_ikke_i_gruppen` | 1 |
| `g.nedlagt_guard` | 3 |
| `g.apply_gruppe_laas` | 0 |
| `g.has_permission_write_gate` | 3 |
| `g.r1_read_gate` | 1 |
| `g.kontakt_lukket` | 0 |
| `g.r17_pending_read_gate` | 1 |
| `g.i4_ikke_i_gruppen_genvalidering` | 0 |

| Fil | SHA256 |
|---|---|
| `angrebs-spec.json` | `8d1143d814987b4709038bf5995f7426b6dabebce5f6bb1e263f81b7a9a208fb` |
| `prover.json` — byte-uændret | `cb3b11adef9c45ca28e6abb990fd0fb927d22a679704a7547dffa3f362ac2b7a` |
| `prover-run.mjs` — byte-uændret | `394784f5499bcc05fc7fc107d8eac33ea977d4a7d94a689cd4fdf0903159612e` |

**Validator:** exit **1**, 180 komplethedsudeståender. Sidste 10 linjer ordret:

```text
  - D10: negativ 'K-9/ac-1/neg-1' bæres alene af 'g.has_permission_write_gate' men ingen mutant på det værn har en target-test der dækker netop det negativ
  - D10: negativ 'K-6/ac-2/neg-2' bæres alene af 'g.apply_gruppe_laas' men ingen mutant på det værn har en target-test der dækker netop det negativ
  - D10: negativ 'K-6/ac-10/neg-11' bæres alene af 'g.i4_ikke_i_gruppen_genvalidering' men ingen mutant på det værn har en target-test der dækker netop det negativ
  - D10: negativ 'K-7/ac-2/neg-3' bæres alene af 'g.kontakt_lukket' men ingen mutant på det værn har en target-test der dækker netop det negativ
  - D10: negativ 'K-7/ac-2/neg-4' bæres alene af 'g.kontakt_lukket' men ingen mutant på det værn har en target-test der dækker netop det negativ
  - D10: negativ 'K-7/ac-4/neg-2' bæres alene af 'g.mapping_daekning_guard' men ingen mutant på det værn har en target-test der dækker netop det negativ
  - D10: negativ 'K-7/ac-4/neg-6' bæres alene af 'g.mapping_daekning_guard' men ingen mutant på det værn har en target-test der dækker netop det negativ
  - D10: negativ 'K-7/ac-4/neg-5' bæres alene af 'g.lokation_anonymiseret_gate' men ingen mutant på det værn har en target-test der dækker netop det negativ
  - D10: negativ 'K-7/S/neg-8' bæres alene af 'g.pii_klassifikation_guard' men ingen mutant på det værn har en target-test der dækker netop det negativ
  - D10: negativ 'K-9/ac-3/neg-3' bæres alene af 'g.pii_klassifikation_guard' men ingen mutant på det værn har en target-test der dækker netop det negativ
```

**HALT-FA3:** Følgende tidsforløb står åbne. Ingen pending-status, deadline eller historiske domænerækker er fabrikeret for at dække dem.

| Forpligtelse | Berørt forløb/assertion |
|---|---|
| K-1/ac-3 | P1@D1→P2@D2; alle `k-1.ac-3.fs.*` |
| K-2/ac-2 | `k-2.ac-2.fs.null-arver-lokationens-pris-paa-samme-dato` efter dagsskift |
| K-3/ac-6, K-6/ac-5 | Fravalg D3→ophævelse D4, bevaret historik/søsterfravalg og de fulde MH-kæder |
| K-4/ac-4 | `k-4.ac-4.fs.status-paa-for-hvert-tidligere-d-uaendret-ved-c10` |
| K-4/ac-5 | `k-4.ac-5.fs.forloeb-aktiv-dvale-ophoer-d5-afledt-aktiv-d5-nedlagt-d6-aktiv-d8` og hele forløbets timezone-sammenligning |
| K-4/ac-6 | Frakobl-/ophæv-delene af `k-4.ac-6.mh.pending-flow-request-approve-apply-gennemfoert-i-dvale` og efterfølgende FS |
| K-4/ac-9, K-6/ac-9 | D6→D8, historisk genlæsning og genåbning med da gældende klienter |
| K-5/ac-2 | `k-5.ac-2.fs.senere-opslag-d-foer-stop-fortsat-dvale` |
| K-6/ac-6 | Normal/forsinket frakobling; alle seks FS-assertioner |
| K-6/ac-7 | Tre daterede led, historisk genlæsning og ejerskifte D9 |
| K-6/ac-10 | 24-timers due-passagen; `…datestyle-dmy-request-mdy-apply-samme-dato-2026-04-03-ingen-drift`; neg-11’s D+2→D+5 |
| K-7/ac-4 | De tre `k-7.ac-4.fs.e-*` retention-assertioner |

Planens åbne transaktion hen over UTC-midnat (§3:526/534) er også udestående. Nulsekundsindstillingen bruges gennem produktets RPC i andre prøver og gendannes; den krediteres ikke som 24-timersbevis.

**Inkonsistens #6/#7 — fortsat åbne på fabrik-armens/Mathias’ bord:**

- **#6:** Direkte berørt er `b2.pris-immutabel` / `t8.1-grant-pris_historik`, `b3.status-dedikeret` og `b3.status-historik` / `t8.1-grant-lokation_status_skift`, samt historikinstanserne i `b5.ni-tabeller-fire-dml`. DELETE-grenen i `b3.stande-bevares` / `t8.1-grant-stande` har samme redundansproblem. Mutanterne fjerner kun grants-værnet; øvrige værn er bevaret. Ændret afvisning dokumenterer ikke i sig selv en forbudt domæneeffekt.
- **#7:** `K-7/S/neg-8` og **T7.18** er ikke leveret. Den krævede positive søsterkontrol omfatter W18/lifecycle/faktisk adresseanonymisering fra Bid 5, mens effektbindingen står i Bid 2. Ingen registry-only prøve er krediteret som denne kontrol.

**Rest til pas 2:** 44 formbindinger, 37 negativer, 83 delbeviser og 16 D10-bindinger. Ud over HALT-FA3 omfatter resten især begge races, CI-exitprøverne, anonymisering/lifecycle/replay/delta, resterende adgangs- og auditfamilier, permission-tildeling, hele API-handlingskæden, OpenAPI-sentinels og otte breddeprøver over 1000 elementer. Planloci uden tilladt guard-reference, bl.a. T3.2, kræver kontraktrettelsen nedenfor.

**Fund i lib/kontrakt:**

- **LIB-RACE:** Reproduceret: `lib.race` kaster `Afvist runner leverede ikke {ok:boolean}`, fordi runneren returnerer `protocolOk`. FA-2’s konkrete `wait_event`/låseobjekt mangler desuden i resultatet.
- **LIB-HTTP:** Reproduceret uden netværk: scalar-/objektbody tabes, og `headers.Accept` ignoreres. Det blokerer svarvalidering og OpenAPI-sentinels.
- **LIB-EXIT:** Reproduceret: `forvent.afvist` afviser exit-kontrakter; lib eksponerer heller ingen check-/exec-flade. Berører K-1/ac-4/neg-1..3 og K-7/ac-1/neg-1.
- **LIB-MUTATION-LOCI:** Indeksvalidatoren kræver et af manifestets 12 guard-ID’er. Separate planloci som T3.2 kan derfor ikke bindes sandfærdigt uden kontraktændring.

LEVERANCE-JSON: {"status":"LEVERET-DELVIS","validator_exit":1,"testfiler":8,"tests":44,"mutants":19,"daekning":{"former":59,"negativer":90,"delbeviser":67},"halt_fa3":["K-1/ac-3","K-2/ac-2","K-3/ac-6","K-4/ac-4","K-4/ac-5","K-4/ac-6","K-4/ac-9","K-5/ac-2","K-6/ac-5","K-6/ac-6","K-6/ac-7","K-6/ac-9","K-6/ac-10:24t-due-og-DateStyle","K-6/ac-10/neg-11","K-7/ac-4:e-retention","plan:526/534-midnatstransaktion"],"rest":["44 formbindinger; 37 negativer; 83 delbeviser; 16 D10-bindinger","FA3-forloeb og begge races","CI-exitproever og planloci uden guard-reference","Anonymisering, lifecycle, replay og delta","Resterende adgangs-, audit- og permission-proever","Fuld API-kaede, OpenAPI og otte breddeproever","Inkonsistens #6/#7 kraever afgoerelse"],"lib_fund":["LIB-RACE","LIB-HTTP","LIB-EXIT","LIB-MUTATION-LOCI"]}