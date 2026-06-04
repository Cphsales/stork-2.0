# gov-1-paritet-groen — Plan V1

**Branch:** claude/gov-1-paritet-groen-plan
**Krav-dok:** governance-vagt (ét dok over 6 pakker — Claude.ai's bord; denne pakke = leverance "repo↔DB-paritet + types grøn")
**Forfatter:** Code · **Dato:** 2026-06-04
**Type:** migration-history-reconciliation (ikke skema/data-migration)

## Formål

Bring repo og live-DB's migration-registre i overensstemmelse, så CI bliver grøn mod live — forudsætningen for at gov-4 (branch protection) kan kræve CI-checks uden at bricke main. Retning fastlagt af Mathias: **(1) align registry → repo-stamps + forward-port orphan** (afgjort herunder: orphan er subsumeret, ingen forward-port nødvendig).

**Formålet er IKKE** at ændre live-skemaet. Live-skemaet er korrekt; kun migration-_registret_ og de committede types er ude af sync med repo.

---

## Recon-grundlag (verificeret, ikke hukommelse)

Divergensens årsag: t9_supplement / t10 / t9_supplement_2-batchen blev anvendt manuelt på live af en kollega-konto (`km@…`, jf. registry `created_by`) uden om repo→push-automationen, med wall-clock-timestamps der afviger fra repo-filernes planlagte sekventielle stamps. Samme logiske migrations (navne-match), repo committet separat (PR #64 m.fl.), aldrig re-deployet (H020-deploy-gap).

---

## §3.2 Verificerede DB-objekter (DB-state-dump)

`supabase_migrations.schema_migrations` (live, projekt `imtxvrymaqbgcvsarlib`):

- **117 registry-rækker** vs **116 repo-migration-filer**.
- **created_by-fordeling:** 79 `null` (automation, 20260514120000–20260519000000) · 38 kollega-konto (manuel; inkl. hele divergens-batchen).
- **Divergens:** 24 repo-stamps ej i registry · 25 registry-stamps ej i repo · 92 fælles.

**KRITISK metode-fund:** registry-kolonnen `statements` er en **upålidelig indholds-orakel**. Bevist: for `t10_client_node_placements_fk` mangler registry-bodyen `comment on constraint …`-statementen der står i repo-filen (registry stopper ved `alter table … restrict;`). Registry'et er lossy (dropper kommentarer + visse statements). **Derfor kan indholds-paritet IKKE bevises via registry — den autoritative orakel er live-skema-objekter (pg_get_functiondef / pg_constraint / pg_policies / kolonner / grants).**

---

## Par-for-par-verifikation af alle 24 (registry-tekst + dybde-stikprøver)

Normaliseret fingerprint (lower → strip blok/linje-kommentar → strip whitespace), repo-fil mod registry-body:

| Resultat                                         | Antal | Fortolkning               |
| ------------------------------------------------ | ----- | ------------------------- |
| Byte-identisk (efter kommentar/comment-on-strip) | 11    | Ren timestamp-omstempling |
| Afviger kun i kosmetik/metadata                  | 13    | Se dybde-stikprøver       |

**Dybde-stikprøver (autoritativ, mod live-skema / fuld body):**

1. **`client_node_placements_fk`** — repo har `comment on constraint … is '…'`; live: constraintet eksisterer, men `obj_description = NULL` → den `comment on` blev aldrig anvendt på live. **Reel, men kosmetisk delta** (PR-polish ej re-deployet).
2. **`remove_legacy_permissions`** — eneste forskel er `change_reason`-strengen (`'…(M1-test refactored **til grant-modellen**)'` i repo vs `'…(M1-test refactored)'` i live). DDL (DELETE) identisk. `change_reason` er session-lokal `set_config`-arg konsumeret af audit-trigger ved apply-tid — **ingen skema/data-effekt.**
3. **`audit_filter_values` (orphan-relateret)** — se nedenfor.

**Konklusion:** de 24 migrations er **skema-effekt-identiske** mellem repo og live. De 13 deltas er udelukkende: kildekommentarer · `comment on`-statements · `change_reason`-strengformulering. Ingen skema-substantiel forskel fundet i stikprøverne.

⚠️ **Ærlig afgrænsning:** 3 af 13 er dybde-verificeret; de øvrige 10 er mønster-formodet kosmetiske, **ikke individuelt skema-verificeret.** Build-fasens pre-flight-gate (nedenfor) lukker dette ved at verificere alle 24 mod live-skema FØR repair eksekverer. Ingen repair uden grøn pre-flight.

---

## Orphan-afgørelse (Mathias' eksplicitte plan-beslutning)

DB `20260521102809 t10_audit_filter_values_null_guard` har intet repo-filnavn-match. Fuld body trukket: det er en **bug-fix** der redefinerer `core_compliance.audit_filter_values` til at springe NULL-værdier over (`jsonb_set` med NULL-value → hele resultat NULL; fx `clients.logo_bytes=null`).

**Afgørelse: orphan'en er SUBSUMERET af repo — ingen forward-port nødvendig.** Repo `…000004_t10_audit_filter_values.sql` indeholder allerede null-guarden (`is distinct from 'null'`, ×2, med kommentar "BUG-FIX (V12 post-build): skip NULL-værdier"). Repo har foldet live's to migrations (base `004116` + hotfix `102809`) ind i ÉN fil med guarden allerede merged. Live's slut-tilstand (post-`102809`) == repo `…000004`.

**Konsekvens for repair:** `102809` revertes fra registry (dens effekt er allerede i live OG repræsenteret af repo `…000004`). Build-pre-flight verificerer `pg_get_functiondef(audit_filter_values)` (live) matcher repo `…000004` semantisk før revert.

---

## Reconciliation-procedure (build-fase)

**Sikkerhedsgaranti (Supabase-docs, citeret):** `migration repair` opdaterer KUN tracking-tabellen — kører/ruller ikke SQL. `reverted` sletter en registry-række; `applied` indsætter en. Live-skema/data røres ikke.

### Step 0 — Pre-flight (§3.9 + safe-to-repair-gate) — BLOKERENDE

1. **Snapshot** hele `schema_migrations` (version, name, statements, created_by) → gemt artefakt = rollback-kilde.
2. **Row-count-kvittering:** 25 revert + 24 apply, registry 117 → 116.
3. **Skema-objekt-verifikation, alle 24:** for hver repo-migration, bekræft dens definerede objekter findes i live med matchende definition (pg_get_functiondef / pg_constraint / pg_policies / pg_attribute / grants). Metode: `supabase db diff --linked` skal vise **kun** kosmetiske comment-residualer (ingen tabel/kolonne/funktions-logik-diff). Enhver skema-substantiel diff → **STOP, eskalér** (ikke ren omstempling — antagelsen brudt).

### Step 1 — Revert 25 divergerende registry-stamps

`supabase migration repair --status reverted <stamp>` for: `20260519125710`, `20260521004003 004027 004051 004116 004130 004145 004154 004231 004250 004311 004330 004346 004746`, `20260521102809` (orphan), `20260521113653`, `20260522000919 000934 001016 001116 001141 001153 001221 001255 001313`.

### Step 2 — Apply 24 repo-stamps

`supabase migration repair --status applied <stamp>` for: `20260520000000`, `20260521000001…000014`, `20260521100000…100008`.

### Step 3 — Verificér registry-paritet

`supabase migration list` → LOCAL og REMOTE identiske (116 = 116, ingen huller).

### Step 4 — types grøn

`pnpm types:generate` (fra live) → commit `packages/types/src/database.ts` → `pnpm types:check` exit 0. (Repair ændrer ikke live, så types regenereres fra det korrekte live-skema; den nuværende `types:check`-fejl er stale committede types.)

### Step 5 — Residual-håndtering (kosmetiske comment-on-deltas)

Hvis Step 0's `db diff` viser manglende `comment on`-objekter i live (PR-polish ej deployet): **én lille opsamlings-migration** der anvender de manglende `comment on`-statements, ELLER accepter + dokumentér som kosmetisk G-nummer. Afgøres når db diff'ens eksakte residual kendes (kan ikke gættes nu). Anbefaling: opsamlings-migration — så repo↔live er 100% også kosmetisk, og fremtidig `db push` er ren.

---

## §3.9 Destructive-drops-preflight + rollback

Repair Step 1 sletter 25 registry-rækker (destructive på registry, ikke på data).

- **Rollback:** Step 0's snapshot indeholder (version, name) for alle 25. Ved fejl: `supabase migration repair --status applied <db-stamp>` gen-indsætter dem → registry tilbage til udgangspunkt. Ingen data berørt på noget tidspunkt.
- **Tom-/reference-check:** ikke relevant for data (registry-only); row-count-kvittering i Step 0.2 er ækvivalenten.

---

## End-to-end-test-design (leverings-kriterium, §3.6)

Dette er en registry/CI-pakke, ikke en write-vej — "end-to-end" = CI grøn mod live:

1. `supabase migration list` → 0 divergens (LOCAL == REMOTE).
2. `supabase db diff --linked` → ingen skema-substantiel diff (kun evt. accepteret kosmetik).
3. `pnpm types:check` → exit 0.
4. `pnpm fitness` + `pnpm migration:check` → uændret grønne (ingen regression).
5. `supabase db push --dry-run` → "remote database is up to date" (ingen pending migrations).

Bevis-artefakt i slut-rapport: output af 1–5.

---

## Oprydnings- og opdaterings-strategi

- `aktiv-plan.md` opdateres (gov-1 under arbejde → afsluttet).
- Ingen ændring til vision/forretningsforstaaelse/master-plan (ren teknisk paritet).
- Evt. residual-G-nummer i `teknisk-gaeld.md` hvis Step 5 vælger accept-retning.

---

## Risici + åbne punkter (til Codex)

1. **Pre-flight-gatens fuldstændighed:** er `supabase db diff --linked` en tilstrækkelig autoritativ orakel for "alle 24 objekter findes i live", eller skal jeg eksplicit pg_get_functiondef-diffe hver af de ~10 ikke-dybde-verificerede? (Codex: er der en objekt-klasse db diff misser — fx grants, der ikke altid fanges?)
2. **Rækkefølge revert-vs-apply:** er der en registry-constraint der kræver apply før revert eller omvendt? (migration list tåler huller, så rækkefølge bør være ligegyldig — bekræft.)
3. **`db push --dry-run`-semantik efter repair** med repo-filer der har comment-on/change_reason som live mangler: vil push se dem som "allerede applied" (registry-match på version) og IKKE forsøge at køre dem? (Det er hele pointen — version-match, ikke indholds-match, styrer push. Bekræft.)
4. **Step 5-beslutning:** opsamlings-migration vs. accept — Codex' anbefaling?
5. **types:check-årsag:** er den nuværende fejl udelukkende stale committede types, eller bidrager orphan/divergens? (Hvis live har objekter ingen repo-migration producerer ud over de verificerede, ville regen alene ikke gøre den stabil.)
