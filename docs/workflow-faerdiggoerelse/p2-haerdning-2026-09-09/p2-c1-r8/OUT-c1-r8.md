# C1-runde 8: I FAIL — F-C1-40

**I:** `d22fd59fc7f6c50f80dd0821f4dc7d26680544ad`

**F-C1-39 er rettet med bevis. Ét materielt hul består i den nye fælles ramme-dommer: gamle `LAST_ERROR_*` kan gøre en vellykket kommando til en bundet afvisning.**

## Bevisgrundlag

- Deltaet matcher hele efterbilledet og rekonstruerer runde 7’s I: `93eeb105c8cead8ef2b42ad7aee6a56de8ca9b83`.
- Loggen indeholder **69 grønne checks**. Postgres er **ikke genkørt her**: Docker-socketen afviser adgang.
- Egne prøver eksekverer den faktiske `frame`, `dockerPsql`, `session` og motor med kontrollerede strømme. **Fire kodemutanter dræbt gennem begge transporter og UT-dommeren.**
- Ingen filer skrevet; intet web brugt. Snapshot’et mangler `.git`, så commit-provenance er ikke verificeret.

## F-C1-40 — tidligere fejl genbruges som aktuel afvisning

**Forpligtelse:** K-2/ac-6/neg-1’s bundne afvisning i samme forsøg; F-32’s adskillelse mellem produktdiagnostik og faktisk fejlstatus.

**Locus:** [frame(), linje 96–102, anvendt af session()](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c1-r8/wd/scripts/v5/build-harness.integration.mjs:96).

Når `ERROR=false`, men stderr indeholder en ERROR-lignende linje, vælger koden `LAST_ERROR_SQLSTATE`. I en genbrugt session kan både denne variabel og `LAST_ERROR_MESSAGE` tilhøre **en tidligere ramme**.

### Eksekveret tidsprøve

Samme `session()`-instans modtog:

1. En tidligere reel fejl: `P0001`, primærmeddelelse `min_en_stand`, uden kontraktens routine.
2. Vellykkede mellemkommandoer.
3. En vellykket kommando med denne NOTICE-tekst:

```sql
do $$ begin
  raise notice E'prefix\nERROR:  P0001: not_the_primary_message\nCONTEXT:  PL/pgSQL function f.stand_deaktiver(integer) line 1 at RAISE';
end $$;
```

Den sidste kommandos stdout-ramme:

```text
S false 00000 P0001
M
min_en_stand
E
```

Her er `P0001` og `min_en_stand` gamle værdier. Den aktuelle kommando lykkedes. NOTICE-teksten leverer alene den ERROR-/CONTEXT-lignende blok.

**Faktisk resultat fra den uændrede transportkode:**

```json
{
  "ok": false,
  "code": "P0001",
  "detail": {
    "message": "min_en_stand",
    "routine": "f.stand_deaktiver"
  }
}
```

Med vellykket søsterkald og uændret state gav både `runCase` og separat `judgeObservations` **`opfyldt`**.

Prøven brugte kontrollerede psql-strømme; SQL-sekvensen er ikke kørt mod Postgres her. Den kræver ingen nonce-kendskab, runtime-tricks eller ændring af målekoden.

### Vejning og rettelseskrav

Dette er **et transporthul**, fordi en vellykket kommando klassificeres som afvist. Jeg påstår ikke, at de 69 checks allerede udnytter det, eller at frisk `dockerPsql()` har samme historik på tværs af kald.

**Mindste rettelsesretning:** ERROR-lignende diagnostik sammen med `ERROR=false` må ikke blive en kontraktbundet afvisning via gamle fejlvariable. Protokol-fejl er tilstrækkeligt; setup/apply/restore forbliver dermed fejlede.

En sådan afvisning indsat **kun i hukommelsen** ændrede modprøven fra `opfyldt` til `protokol-fejl`. Det viser rettelsens effekt, men lukker ikke fundet i den vurderede blob.

**Angrebs-spec:** Bevar sekvensen *tidligere fejl → succes → succes med indlejret NOTICE-blok*. Efter rettelsen skal en targeted mutant, der genindfører fallback til gamle fejlvariable, dræbes gennem UT-stien. Positive kontroller skal fortsat acceptere almindelig succes og klassificere en aktuel, korrekt fejl.

## A–D: delta-vurdering

| Akse | Vurdering |
|---|---|
| **A — primærmeddelelse / SQLSTATE** | **F-39 lukket:** hele `min_en_stand\nHINT:  wrong_reason` bevares i begge transporter og giver `brudt`; stderr-mutanten gør samme prøve falsk grøn. `\echo`-variabelværdien bruges som argumentdata; backslash, kolonreferencer og anførselstegn giver ikke i sig selv en ny psql-kommando. Jeg har ikke særskilt genkørt psql-interpolationen her. Den påviste kanal er i stedet **gamle værdier**, F-40. |
| **Markører** | En ekstra identisk S/M/E-markør i den indsamlede ramme giver protokol-fejl. Meddelelsesprøver og 35 opdelinger af stdout-strømmen bevarede resultatet. Intet yderligere materielt fund. |
| **B — ON_ERROR_STOP=0** | En reel tidligere fejl i et frisk setup/apply/restore-script bliver fortsat `ok:false`. Fortsat, delvis udførelse er **en skærpelse om transaktioner og oprydning**, ikke dette falsk-grøn-hul. |
| **C — CONTEXT** | En ekstra genkendelig CONTEXT efter den virkelige giver flertydighed. Feltlignende linjer, som ikke genkendes, overtager heller ikke routine. Intet selvstændigt fund i denne substitutionsvej. F-40 har derimod ingen aktuel reel fejl-CONTEXT at kollidere med. |
| **D — overlap / invariant / tom mængde** | Intet nyt materielt deltafund. Vidnet indhentes før commit uafhængigt af produktlåsen. Fejlet eller manglende invariantmåling giver protokol-fejl. `[]` accepteres; tomt, null, objekt og ugyldigt JSON afvises som manglende rækkesæt. |

## Krævet mutant-tabel

Alle fire er **DRÆBT**, hver gennem både `dockerPsql` og `session` videre til UT-dommeren. Mutanterne eksisterede kun i hukommelsen.

| Kodemutant | Effektvektor | Original → mutant |
|---|---|---|
| Tag meddelelsen fra stderr | Token efterfulgt af indlejret `HINT:` | `brudt` → **`opfyldt`** |
| Fjern `LAST_ERROR_SQLSTATE`-krydstjek | `true P0001 22012`, stderr `P0001` | protokol → **`opfyldt`** |
| Tillad CONTEXT før ERROR | Kontraktens routine før fejl-linjen | protokol → **`opfyldt`** |
| Tillad flere markører | Ekstra END-markør | protokol → **`opfyldt`** |

Mutant-OID’er i tabelrækkefølge:

```text
192530544ffdd6b89147f295e02b5b92cb6990c1
2813fdc643ee172181b68f07d9a7835e18da3e4c
c7f06c467d48dc42de0fafa1f0d41bb81f6d76c7
7c99e13c8e4d246cedf2900b586c8a4446b203b1
```

## Navngivne residualer til C4b

- **R-RUNNER-UDFØRELSE:** Bind faktisk build/store, offentlig indgang, rolle, bypass-status og aktør-settings til observationerne.
- **R-RUNNER-LIVSCYKLUS:** Indsaml komplette strømme og procesafslutning; timeout, signal og afbrudt måling må ikke ligne gyldige udfald.
- **R-RUNNER-ATOMARITET:** Vælg transaktions- og oprydningsstrategi ved delvist gennemførte scripts. **Skærpelse**, jf. B.
- **R-RUNNER-OVERLAP:** Bevar faktisk sessionsidentitet, uafhængigt vidne før afslutning og invariantmåling efter afslutning.
- **R-SPEC-LEGITIMITET / R-PREDECESSOR-WIRING / R-CI-AUTENTICITET:** Beskyt målelaget og bind autoriseret, frosset spec samt frisk plan-dom til CI-kørslen.

**F-C1-40 er et rettelseskrav, ikke en residual.** Rettelsen er fabrik-mekanik og kræver intet nyt Mathias-ord.

## Uændrede moduler — ingen ny dom

Alle matcher runde 7 og register-pas:

```text
H  500dfbfd819fb8762d194a01f7734ed835160e2f
V  8c1f97189e0d2d8080d18d05dbbf14f293ce8957
M  64ea01e0bbacbc00ceb1e4da6d484b715e899b1d
A  e768060dc551e347fcc82362e1fc716251e9022e
G  7210d6d63f227a90f9774278516e78a0db69fce3
E  227ab027396821817e0b5d2e6fa53d1b84b0db95
P  c121b9fc0321d6a87e2dc22dd9d12f7c4c520bd3
```

**Samlet: F-39 lukket; I FAIL alene på F-C1-40. I står ikke i registret; dommen ændrer ingen af de syv eksisterende pas.**