# CLAUDE.md — Stork 2.0

Følg `docs/LÆSEFØLGE.md` ved hver af de fem triggere defineret deri. Git pull før hver trigger.

Denne fil er tynd index. Disciplin og vision står i `docs/`. Kilde-fil pr. emne nedenfor.

---

## Repo-struktur

```
docs/
├── LÆSEFØLGE.md             # navigation (undtagelse til docs/-rod-reglen)
├── strategi/                # autoritative dokumenter
│   ├── vision-og-principper.md
│   ├── stork-2-0-master-plan.md
│   ├── arbejds-disciplin.md
│   ├── bygge-status.md
│   └── arbejdsmetode-og-repo-struktur.md
├── coordination/            # aktiv arbejds-state
│   ├── aktiv-plan.md
│   ├── seneste-rapport.md
│   ├── mathias-afgoerelser.md
│   ├── cutover-checklist.md
│   ├── codex-reviews/
│   ├── rapport-historik/
│   └── arkiv/
├── teknisk/                 # løbende teknisk dokumentation
│   ├── teknisk-gaeld.md
│   ├── permission-matrix.md
│   ├── lag-e-beregningsmotor-krav.md
│   └── lag-e-tidsregistrering-krav.md
└── skabeloner/              # genbrugelige skabeloner
    ├── plan-skabelon.md
    ├── rapport-skabelon.md
    └── codex-review-prompt.md
```

---

## Hvor står hvad

- **Vision og 9 principper:** `docs/strategi/vision-og-principper.md`
- **Master-plan (autoritativ teknisk plan):** `docs/strategi/stork-2-0-master-plan.md`
- **Arbejds-disciplin (trin-cyklus, AI-arbejdsdeling, Codex-fund, formåls-immutabilitet, git-sync, disciplin-tjekliste, plan-leverance er kontrakt, destructive drops, vision-tjek-skabelon, stop-og-spørg, kommandolinje-disciplin):** `docs/strategi/arbejds-disciplin.md`
- **Arbejdsmetode + repo-struktur (denne fils kilde):** `docs/strategi/arbejdsmetode-og-repo-struktur.md`
- **Kendt teknisk gæld (G-numre):** `docs/teknisk/teknisk-gaeld.md`
- **H-numre (sporbar i):** `docs/coordination/mathias-afgoerelser.md` + `docs/coordination/cutover-checklist.md`
- **Permission-matrix (RPC → page/tab/edit):** `docs/teknisk/permission-matrix.md`
- **Bygge-status pr. trin (vision-tjek-historik):** `docs/strategi/bygge-status.md`
- **Lag E krav (beregning + tidsregistrering):** `docs/teknisk/lag-e-beregningsmotor-krav.md` + `docs/teknisk/lag-e-tidsregistrering-krav.md`
- **Aktuel plan (peger på igangværende arbejde):** `docs/coordination/aktiv-plan.md`
- **Seneste rapport (peger på sidste slut-rapport):** `docs/coordination/seneste-rapport.md`
- **Mathias' afgørelser (append-only log):** `docs/coordination/mathias-afgoerelser.md`
- **Cutover-checklist (pre-cutover blockers):** `docs/coordination/cutover-checklist.md`
- **Codex-review-prompt-skabelon (niveau 1-prefix):** `docs/skabeloner/codex-review-prompt.md`
- **Plan + rapport-skabeloner:** `docs/skabeloner/plan-skabelon.md` + `docs/skabeloner/rapport-skabelon.md`

---

## Vision — hvad vi måler mod

Fra master-planens §0:

> "Meget data, styr på data og slette-regler, rettigheder der virker, driftsikkert, anonymisering bevarer audit, alt drift styres i UI."

Fuld vision + 9 principper står i `docs/strategi/vision-og-principper.md`. Disciplin-tjekliste der binder vision til hver migration står i `docs/strategi/arbejds-disciplin.md`.

---

**Sidste opdatering:** H010 — etablering af arbejdsmetode + repo-struktur (samle-commit).
