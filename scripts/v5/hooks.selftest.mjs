#!/usr/bin/env node
// hooks.selftest.mjs — hvem må committe hvad.
import { beslutning, zone, toRepoRel } from "./hooks.mjs";

const ROOT = "/repo";
let ok = 0, fail = 0;
const t = (navn, c) => { if (c) { ok++; console.log(`  ✓ ${navn}`); } else { fail++; console.log(`  ✗ ${navn}`); } };
const må = (rolle, sti) => beslutning({ rolle, stier: [sti], repoRoot: ROOT }).ok;

// zoner
t("test er målelag", zone("scripts/v5/pakke-2/tests/k1.test.mjs") === "maalelag");
t("manifest, testindeks, testvalg og slutprøve er målelag", ["forventnings-manifest", "angrebs-spec", "prover", "slutproeve"].every((f) => zone(`plan-build/pakke-2/${f}.json`) === "maalelag"));
t("Codex' domme har egen zone", zone("plan-build/pakke-2/codex-plan.md") === "codex-dom" && zone("plan-build/pakke-2/codex-gennemgang.md") === "codex-dom");
t("dækningsdommen har egen zone", zone("plan-build/pakke-2/daekningsdom.json") === "reviewer-dom");
t("ledgeren (ny og gammel sti)", zone("docs/sandhed/mathias-ord.md") === "ledger" && zone("plan-build/lokations-skabelon/mathias-ord.md") === "ledger");
t("krav", zone("docs/sandhed/krav/pakke-2-krav.md") === "krav");
t("øvrig docs/sandhed", zone("docs/sandhed/andet.md") === "sandhed");
t("migrationer er produkt", zone("supabase/migrations/2026_x.sql") === "produkt");
t("disciplin og roller er workflow", zone("docs/strategi/disciplin.md") === "workflow" && zone("scripts/v5/roller/code.md") === "workflow");
t("plan er andet", zone("plan-build/pakke-2/plan.md") === "andet");
t("segment-sikker (scripts/v5x er ikke scripts/v5/roller)", zone("apps2/x") === "andet");

// roller
t("byggeren må bygge produkt", må("code", "supabase/migrations/2026_x.sql"));
t("byggeren må skrive planen", må("code", "plan-build/pakke-2/plan.md"));
t("byggeren må ALDRIG skrive testene", !må("code", "scripts/v5/pakke-2/tests/k1.test.mjs"));
t("byggeren må ALDRIG skrive manifestet", !må("code", "plan-build/pakke-2/forventnings-manifest.json"));
t("byggeren må ALDRIG skrive en dom", !må("code", "plan-build/pakke-2/daekningsdom.json") && !må("code", "plan-build/pakke-2/codex-plan.md"));
t("byggeren må ikke skrive i ledgeren", !må("code", "docs/sandhed/mathias-ord.md"));
t("byggeren må ikke ændre workflowet", !må("code", "docs/strategi/disciplin.md") && !må("code", ".github/workflows/ci.yml"));
t("codex må skrive målelaget og sine domme", må("codex", "plan-build/pakke-2/prover.json") && må("codex", "plan-build/pakke-2/codex-gennemgang.md"));
t("codex må ikke skrive dækningsdommen", !må("codex", "plan-build/pakke-2/daekningsdom.json"));
t("codex må ikke bygge produkt", !må("codex", "apps/web/x.ts"));
t("code-reviewer må kun skrive dækningsdommen", må("code-reviewer", "plan-build/pakke-2/daekningsdom.json") && !må("code-reviewer", "scripts/v5/pakke-2/tests/k1.test.mjs"));
t("fabrikken må committe domme og målelag uændret", må("fabrik", "plan-build/pakke-2/codex-plan.md") && må("fabrik", "scripts/v5/pakke-2/tests/k1.test.mjs"));
t("fabrikken må ikke bygge produkt", !må("fabrik", "supabase/migrations/2026_x.sql"));
t("fabrikken og krav-rollen må skrive i ledgeren og flytte kravet", må("fabrik", "docs/sandhed/mathias-ord.md") && må("claude-ai", "docs/sandhed/krav/pakke-2-krav.md"));
t("ingen rolle må skrive anden docs/sandhed", ["fabrik", "claude-ai", "code", "codex", "code-reviewer"].every((r) => !må(r, "docs/sandhed/andet.md")));
t("ukendt rolle afvises", !beslutning({ rolle: "builder-code", stier: ["x.md"], repoRoot: ROOT }).ok);
t("uden rolle: beskyttede zoner afvises", !må(undefined, "docs/sandhed/mathias-ord.md") && !må(undefined, "plan-build/p/prover.json"));
t("uden rolle: almindelige filer tillades", må(undefined, "apps/web/x.ts"));
t("sti uden for repoet afvises", !må("fabrik", "/etc/passwd") && toRepoRel("../x", ROOT) === null);
t("backslash normaliseres", zone(toRepoRel("scripts\\v5\\roller\\code.md", ROOT)) === "workflow");

console.log(`\nhooks: ${ok} ok${fail ? `, ${fail} FEJL` : ""}`);
process.exit(fail ? 1 : 0);
