---
type: handoff-prompt
status: klar til frisk session
formaal: paste dette i ny terminal-session for at forsætte PR #42 disciplin-fundament-merge med friske øjne
forrige-session: ~12 timer (Lag 1 V5.3 workflow-stabilisering bygget; PR #42-analyse afsluttet)
---

# Disciplin-fundament merge fra PR #42 — handoff til frisk session

Hej Code. Sidste session etablerede Lag 1's workflow-spec (V5.3 marker-protokol + 9 scripts/automation). Sidste skridt er at merge **PR #42's disciplin-fundament** ind på main så Lag 1's "phantom dependencies" lukkes.

## Det er en MIKRO-pakke

Dette er **ikke en fuld 7-step pakke** — det er målrettet doc-merge fra en allerede-Mathias-godkendt PR. Skip-kriterier for step 0+1 opfyldt:

- PR #42 er fra Mathias selv (forretnings-niveau allerede godkendt af forfatter)
- Indholdet er kendt + analyseret af både Code og Codex
- Krav-dok er denne fil (handoff)

Step-cyklus: **direkte build → PR → review → merge**.

## Kontekst-tjek inden start

Læs disse filer for at synkronisere kontekst:

1. `docs/coordination/Lag1-plan.md` — V5.3 workflow-spec (NB: arkiveret efter slut-rapport)
   - Hvis flyttet til `docs/coordination/arkiv/Lag1-plan.md`: brug arkiv-stien
2. `docs/skabeloner/workflow-skabelon.md` — V5.3 marker-protokol + 7-step flow
3. `docs/coordination/rapport-historik/2026-05-20-Lag1.md` — Lag 1 slut-rapport (kontekst)
4. Denne fil (handoff)

Verificér også at PR #42 er ÅBEN:

```bash
gh pr view 42 --json state,headRefName --jq .
```

Hvis state = MERGED eller CLOSED: tjek hvad der skete; muligvis allerede løst.

## Forensisk analyse af PR #42 (allerede gennemført)

PR #42 har 6 commits, 19 filer i diff:

### Unikke commits (skal med — selektivt)

| Commit    | Tidspunkt  | Indhold                                                                                                                                              | Status                                                                           |
| --------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `2cab851` | 18/5 20:49 | Stor: forretningsspoergsmaal-fase + krav-dok-disciplin + krav-dok-review-rolle + arbejds-disciplin-udvidelse + ny skabelon-fil + mathias-afg-entries | INKLUDER (men skip "Tre Claude.ai-roller"-sektion)                               |
| `7fbf984` | 18/5 20:51 | `.gitignore` `~$*.md` + slet lock-fil                                                                                                                | INKLUDER kun `.gitignore`-linjen (lock-fil findes ikke)                          |
| `4a9f329` | 18/5 21:13 | FJERN "Tre Claude.ai-roller" sektion (Mathias' fortrydelse)                                                                                          | INKLUDER fjernelsen                                                              |
| `88b4457` | 18/5 21:22 | qwers triggerer Filesystem-MCP self-read                                                                                                             | INKLUDER — main har stadig gammel qwers-formulering (Codex bekræftet 2026-05-20) |

### Duplikat-commits (DROP — allerede på main via PR #41/#44)

| Commit    | Indhold                                                                                                | Status på main                 |
| --------- | ------------------------------------------------------------------------------------------------------ | ------------------------------ |
| `8a2a830` | T9 post-merge doc-updates (bygge-status, teknisk-gaeld, aktiv-plan, slut-rapport, codex-reviews-arkiv) | ✅ Merged via PR #41 (f1c6043) |
| `17f22aa` | T9 post-merge fakta-rettelser                                                                          | ✅ Merged via PR #41           |

## Codex' review af merge-plan (allerede inkorporeret)

Codex' fund fra dogfood-test 2026-05-20:

- **HUL:** Konsultations-fil mangler `## Formål`-sektion — fikset i scripts/codex-review.sh phase-aware FORMAAL_LINE (commit a3d521a)
- **MELLEM 1:** PR #42 har 6 commits, ikke 4 — denne handoff erkender begge T9-duplikater eksplicit
- **MELLEM 2:** 88b4457 IKKE redundant — main har stadig gammel qwers-formulering. INKLUDER i merge.
- **G-nummer-kandidat:** Brug `git diff --name-status origin/main...origin/mathias/disciplin-output-kvalitet` som acceptance-checkliste

## Konkret merge-plan (10 filer)

| #   | Fil                                                        | Aktion                                                                                                                                                                                         | Kompleksitet          |
| --- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1   | `.gitignore`                                               | Tilføj `~$*.md` linje fra `7fbf984`                                                                                                                                                            | Trivial               |
| 2   | `docs/coordination/mathias-afgoerelser.md`                 | Append 2 entries fra `2cab851` (2026-05-18)                                                                                                                                                    | Trivial (append-only) |
| 3   | `docs/skabeloner/forretningsspoergsmaal-skabelon.md`       | NY verbatim fra `2cab851`                                                                                                                                                                      | Trivial               |
| 4   | `docs/skabeloner/codex-review-prompt.md`                   | Merge: PR #42's +13 linjer + Lag 1's marker-protokol                                                                                                                                           | Lille                 |
| 5   | `docs/skabeloner/plan-skabelon.md`                         | Merge: PR #42's Fundament-tjek-passeret + step-detalje-format + Lag 1's V5.3 sektioner                                                                                                         | Medium                |
| 6   | `docs/coordination/overvaagning/code-overvaagning.md`      | Merge: PR #42's qwerg-protokol-uddybning + qwers-self-read + Lag 1's svar-typer                                                                                                                | Medium                |
| 7   | `docs/coordination/overvaagning/codex-overvaagning.md`     | Merge: PR #42's OPGRADERING-detalje + qwers-self-read + Lag 1's svar-typer                                                                                                                     | Medium                |
| 8   | `docs/strategi/arbejds-disciplin.md`                       | Merge: PR #42's +94 linjer fire-dok-disciplin + Lag 1's spm 5 (halt-marker-tjek)                                                                                                               | Stor                  |
| 9   | `docs/strategi/arbejdsmetode-og-repo-struktur.md`          | Merge: PR #42's +70 linjer flow-disciplin + qwers-self-read + Lag 1's workflow-skabelon-ref (skip 3-roller-noter per 4a9f329)                                                                  | Stor                  |
| 10  | `docs/coordination/overvaagning/claude-ai-overvaagning.md` | **STØRSTE merge:** PR #42's 3 nye sektioner (forretningsspm + krav-disciplin + krav-review) + qwers-self-read + Lag 1's Cadence-sektion. **SKIP "Tre Claude.ai-roller"-sektion** per `4a9f329` | Stor                  |

## Eksekvering

### Anbefalet rækkefølge

1. **Pull main + opret branch:**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b claude/PR42-disciplin-fundament-merge
   ```

2. **Trivielle først (3 filer, 1 commit):**
   - `.gitignore`
   - `mathias-afgoerelser.md` (append entries fra `git show 2cab851:docs/coordination/mathias-afgoerelser.md`)
   - `forretningsspoergsmaal-skabelon.md` (kopier fra `git show 2cab851:docs/skabeloner/forretningsspoergsmaal-skabelon.md`)

3. **Lille merge (1 fil, 1 commit):**
   - `codex-review-prompt.md`

4. **Medium merges (3 filer, 3 commits):**
   - `plan-skabelon.md`
   - `code-overvaagning.md`
   - `codex-overvaagning.md`

5. **Store merges (3 filer, 3 commits):**
   - `arbejds-disciplin.md`
   - `arbejdsmetode-og-repo-struktur.md`
   - `claude-ai-overvaagning.md`

6. **Push + PR:**

   ```bash
   git push -u origin claude/PR42-disciplin-fundament-merge
   gh pr create --title "Disciplin-fundament merge fra PR #42 (selektiv)" --body "..."
   ```

7. **Når merget: luk PR #42**
   ```bash
   gh pr close 42 --comment "Erstattet af PR #XX som selektivt merger PR #42's disciplin-værdi uden tre-rolle-struktur (Mathias' fortrydelse 4a9f329) og uden T9-duplikat-commits (allerede på main via PR #41)."
   ```

### Hentemetode for PR #42's indhold

```bash
# Specifikt commit's diff for én fil:
git show 2cab851 -- docs/coordination/overvaagning/claude-ai-overvaagning.md

# Hel fil-version fra commit:
git show 2cab851:docs/skabeloner/forretningsspoergsmaal-skabelon.md

# Sammenlign mod main:
git diff origin/main..2cab851 -- <fil>
```

## Kritiske regler under merge

1. **SKIP "Tre Claude.ai-roller"-sektion** (i `2cab851` claude-ai-overvaagning + arbejdsmetode-og-repo-struktur). Mathias fortrød via `4a9f329` 24 min senere. Roller er IMPLICIT per chat.
2. **INKLUDER 88b4457's qwers-self-read** ændringer i alle 3 overvaagning-filer + arbejdsmetode-og-repo-struktur.
3. **BEVAR Lag 1's V5.3-tilføjelser:** Cadence-sektion, marker-protokol, svar-typer, halt-håndtering. Disse er på main fra PR #48-#50.
4. **DROP T9-duplikat-commits** (`8a2a830`, `17f22aa`). Deres filer er allerede på main.
5. **TJEK afterstate:** kør `git diff origin/main...HEAD -- <fil>` på hver commit for at verificere kun additions/forventede ændringer.

## Codex-review under build (anbefales)

Brug `scripts/codex-review.sh --quick` mellem batches:

```bash
# Efter trivielle (1 commit):
scripts/codex-review.sh docs/coordination/PR42-disciplin-fundament-merge.md 1 --quick --phase=build

# Efter store merges:
scripts/codex-review.sh docs/coordination/PR42-disciplin-fundament-merge.md 2 --phase=build
```

Marker-parser fortæller om der er BRUD-PAA-KRAV / PLAN-AFVIGELSE / etc. — exit-koder per V5.3 routing-tabel.

## Estimat

1-2 timer fokuseret arbejde. Resultat: clean main hvor Lag 1's workflow-spec har sit disciplin-fundament.

## Verifikation før push

```bash
# Alle 10 filer ændret:
git diff --stat origin/main..HEAD -- docs/

# Ingen "tre roller"-rest:
grep -rn "Tre Claude.ai-roller\|tre Claude.ai-roller" docs/ && echo "ERROR: tre-rolle-sektion stadig der" || echo "OK"

# qwers self-read tilstede i alle 3 overvaagning-filer:
for f in claude-ai code codex; do
  grep -l "via Filesystem-MCP" docs/coordination/overvaagning/${f}-overvaagning.md || echo "MISSING: ${f}"
done

# forretningsspoergsmaal-skabelon eksisterer:
test -f docs/skabeloner/forretningsspoergsmaal-skabelon.md && echo "OK skabelon-fil" || echo "MISSING"

# Bash-syntax på husky:
bash -n .husky/pre-commit
```

## Hvis du støder på noget uventet

Per V5.3 STOP-FOR-CLARIFICATION: stop og spørg Mathias hvis:

- PR #42 er allerede merget eller lukket (situation ændret)
- Filer på main er anderledes end forventet (måske en anden PR har merget overlap-indhold)
- Mathias har valgt at gå en helt anden retning siden sidste session

## Slut-bemærkning

Sidste session ramte 12+ timer. Denne pakke er bevidst lille og fokuseret — under 2 timer. Hvis du finder dig selv i at gøre BIG re-arbejde (rewriting whole files, omstrukturering), så STOP og spørg. Vi merger, vi rebuilder ikke.

Good luck. Hilsen Code (sidste session).
