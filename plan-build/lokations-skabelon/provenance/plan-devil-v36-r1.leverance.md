DEVIL-DOM: 3 fund

Ingen skjulte spørgsmål. Tre fund rammer tærsklen: ét uforståeligt teknisk afsnit og to problemer med gengivelsen af mulighederne ved stop. Dette er en kontrol af fremlæggelsen, ikke et gate-verdikt.

| post | bord | form | afled | troskab | fund (kort) + FORSLAG til rettet ordlyd (form, aldrig substans) |
|---|---|---|---|---|---|
| Titel, linje 1 | OK | OK | — | OK | Korrekt version og placering før nyt `plan ok`. |
| Indledning, linje 3 | OK | Note | OK, M-45 | F2 | Godkendelsen 21/9 og de tre rettelser er båret. Påstanden om, at tidsstyringen ikke kunne bygges som skrevet, overdriver kilden; se F2. **Forslag:** »Den tredje rettelse beskriver den valgte måde at styre tiden under prøverne.« |
| Punkt 1, linje 5 | OK | **F1** | OK | OK | **F1 — tærskel (d):** »ene-værn«, »skrivepolitik«, »mutations-test« og »dræbt mutant pr. konfigurationsknap« bærer selve forklaringen uden oversættelse. Mathias får ikke en forståelig beskrivelse af den afprøvning, der bortfalder. **Forslag:** »Alle tolv forbud mod ændringer uden om de godkendte handlinger skal stadig afprøves. I otte tilfælde stopper flere spærrer forsøget; her bortfalder kravet om at afprøve én spærre som den eneste. I fire tilfælde er der kun én spærre. Den skal fortsat afprøves ved bevidst at sætte den ud af kraft.« Fordelingen følger plan:672. |
| Punkt 2, linje 7 | OK | OK | OK | OK | K-7/S prøves i Bid 2; faktisk adresseanonymisering i Bid 5. Ingen manifest-forpligtelse eller assertion flyttes. Ingen rettelse nødvendig. |
| Punkt 3, linje 9 | OK | Note | OK som planvalg | **F2** | **F2 — tærskel (b):** »Det kan ikke bygges i CI« er ikke båret. Den oprindelige analyse beskriver udtrykkeligt en mulig løsning med egen systemklokke; M-48 vælger en anden løsning. **Forslag:** »Vi har valgt at lade prøverne stille den klokke frem, som databasen bruger. Produktets tidsregler ændres ikke. Det gør de daterede forløb mulige at afprøve.« |
| Hvad der ikke ændres, linje 11 | OK | Note | OK | OK | Krav, ord, §10 og de øvrige dele af §1–§3 består som angivet. »Alle tests« bør præciseres som foreslået under noter. |
| Stop, linje 13 | OK | OK | — | **F3 + F2** | **F3 — tærskel (b):** Stop til 1/2 fremstilles som en fortsættelse mod den gamle tekst. Kilden kræver netop en ny plan for at kunne opfylde beviskravene; den gamle tekst er ikke et gennemførligt alternativ til rettelserne. **Forslag:** »Siger du stop til punkt 1 eller 2, godkendes rettelsen ikke. De berørte beviser kan ikke færdiggøres efter den gamle tekst; planfejlene skal først løses.« **F2 fortsat:** »intet stop-udfald der kan bygges« og produktets tidsknap som eneste alternativ er en falsk indsnævring. **Forslag:** »Stop til punkt 3 sætter den valgte testløsning i bero; en anden løsning skal fortsat overholde produktets tidsregler.« |
| Betydningen af `plan ok`, linje 15 | OK | OK | OK | OK | Den nye SHA er korrekt. Binding af allerede skrevne tests er beskrevet som kommende handling, ikke som udført bevis. Se note om senere planændringer. |
| Afslutning, linje 17 | OK | OK | — | OK | Kun det ene godkendelsesord efterspørges. |

F2 er bundet til [kontraktbehovsanalysen, linje 39](/tmp/claude-1000/-home-mathias/f959f211-d030-4057-8817-443b2b6f1add/scratchpad/devil36/wd/plan-build/lokations-skabelon/provenance/angrebs-kontraktbehov.leverance.md:39): »Realistisk planmedholdelig afvikling er en disponibel VM med egen OS-klokke«. **MANGLER KILDE** til den kategoriske umulighed og til, at kun en produktændring skulle være alternativet.

F3 er bundet til samme analyses [punkt 6 og 7](/tmp/claude-1000/-home-mathias/f959f211-d030-4057-8817-443b2b6f1add/scratchpad/devil36/wd/plan-build/lokations-skabelon/provenance/angrebs-kontraktbehov.leverance.md:48) samt M-48: fejlene kræver planrettelse; de må ikke omgås i målelaget. De tre fund står åbne i den bedømte blob. Forslagene ovenfor ændrer fremlæggelsen, ikke planen eller kravene.

## Noter (tæller ikke)

- Linje 3/11: Skriv »Alle krav til udfald og afvisninger består« frem for »alle tests«. Det skelner tydeligere fra den ændrede pligt til at afprøve bevidste fejl.
- Linje 15: Tilføj gerne den allerede gældende regel: »Senere ændringer kræver en ny plan-SHA og et nyt `plan ok`.«
- Brug »prøvesystemet« og »oversigten over dine ord« frem for »CI« og »ledgeren«. Skriv »Resten af §1–§3 er uændret« frem for »byte-identiske«.
- M-45 kan tilføjes ved datoen for den tidligere godkendelse. Teksten fremsætter ikke et falsk ordret citat.

**Komplethed**

- **3/3 rettelser medtaget:** KB-#6, KB-#7 og FA-3 inklusive S-35. Stop-udfaldene består ikke kontrollen.
- Manifestet bevarer **60 forpligtelser, 127 negativer og 150 assertions**. Ingen ID’er, bevisformer eller `effekt_bid` flyttes. `g.app_dml_revoke` går **12 → 4** bindinger; samlet **48 → 40**.
- §1–§3 ændres kun på linjerne **221, 238, 240, 246, 253 og 526**. Resten er byte-identisk. §9 og §10 er byte-identiske.
- Alle §10-valg består, inklusive S-3 og de kendte grænser. S-3 og overdragelserne til trin 24, trin 29 og lag F er dækket af den godkendte v3.5-fremlæggelse og skal ikke gentages i deltaet.
- De tre JSON-verdikter siger **PASS til v3.5**. Deltaet påstår ikke, at de er nye vurderinger af v3.6.
- Tidligere rettelser er kontrolleret mod den godkendte v3.5-fremlæggelse. Ingen tidligere fund genåbnes.

**Binding**

Kontrolleret lokalt med `git hash-object`, plandiff og strukturel manifestdiff. Alle opgivne målhashes matcher. Ingen web eller skrivning anvendt. Commit `0264a2912e519b1ac9a179e1000030802abe59a3` er driverens pin; uden `.git` er commit-medlemskab ikke selvstændigt verificeret.

`P/` nedenfor betyder `plan-build/lokations-skabelon/`.

| artefakt | verificeret blob |
|---|---|
| P/fremlaeggelse-plan-v36.md | `f9ff70be730e46a95602bbe4e25e3a0432233830` |
| P/plan.md | `807fdf93056180c766d23f93c4137ded98b78e3b` |
| P/provenance/plan-v35.md | `289b87616750a1a1180a8ec5f7a639cd43f07a29` |
| P/fremlaeggelse-plan.md | `c4757b3cdff8d6668f2724718cdde1525f90c5ff` |
| docs/sandhed/krav/lokations-skabelon-krav.md | `9402164d87a35fb939661058bea77c1a052493d0` |
| P/mathias-ord.md | `de22e405707012c7a4bce32899b35c212857f309` |
| P/ordbog.md | `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` |
| P/p8-kildekontrakt.md | `33dd3509c17a8fa176f91b9d6072c0c1cd1f001a` |
| P/forventnings-manifest.json | `6111747df50432655a8d5aabaea8bb0ef1d1f1ef` |
| P/provenance/manifest-v35.committet.json | `ab4c8501253cbc9310f9875c0ab5c672f1ad23dd` |
| P/fold-ind-rapport-r8.md | `84e0e0ac862c26194334a254d0092d78106e73b9` |
| P/verdikt-code-reviewer-plan.json | `17624938b302c38024c4e71c979b721bb6bbbb94` |
| P/verdikt-codex-plan.json | `f08186d5985fd09a3fcda349b39b077d62667f21` |
| P/verdikt-claude-ai-plan.json | `d433ab93907f8da38f018eebf4228cd9ffd011d5` |
| scripts/v5/roller/claude-ai.md | `946284944deeb73bb62063f2892308c3502e8591` |
| docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md | `8138afa86ead6a227fdc460434fbccf10f3d4494` |
| P/provenance/angrebs-kontraktbehov.leverance.md | `5ea32424b8ddd5ccc8f7244a00a8e448d59d3087` |
| P/provenance/angrebs-tests-pas1.leverance.md | `c1d67af77ae07b85a16ca610b3ae09fe85694645` |
| P/provenance/plan-devil-r1.leverance.md | `c9bd5b41dbc77a8b5a99c05e92ef7254cd68714a` |
| P/provenance/plan-devil-r2.leverance.md | `65a108d6e6f6c732e9f660ded3aac1459e995b2c` |
| P/provenance/plan-devil-r3.leverance.md | `645170a2798b06f5a693c315c5a370dd61b1a012` |

DEVIL-JSON: {"konklusion":"FAIL","fremlaeggelse_blob":"f9ff70be730e46a95602bbe4e25e3a0432233830","fund":3}