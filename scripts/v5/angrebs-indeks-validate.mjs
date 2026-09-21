#!/usr/bin/env node
// angrebs-indeks-validate.mjs — CLI (hurtigt spor): validér Codex' test-indeks (angrebs-spec.json skema 2) mod manifestet OG mod testfilerne
// på disk (id'er, covers, blob-oids) med samme dommer som build-gaten. Exit 0 = komplet og frosset-konsistent.
//   node scripts/v5/angrebs-indeks-validate.mjs plan-build/<pakke>/angrebs-spec.json plan-build/<pakke>/forventnings-manifest.json [repo-rod]
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateAngrebsIndeks } from "./angrebs-indeks.mjs";
import { loadTests } from "./test-runner.mjs";
const [idxFil, manFil, rootArg] = process.argv.slice(2);
if (!idxFil || !manFil) { console.error("brug: angrebs-indeks-validate.mjs <angrebs-spec.json> <forventnings-manifest.json> [repo-rod]"); process.exit(2); }
const læs = (f) => { try { return JSON.parse(readFileSync(f, "utf8")); } catch (e) { console.error(`kan ikke læse/parse ${f}: ${e.message}`); process.exit(2); } };
const idx = læs(idxFil), manifest = læs(manFil); const root = resolve(rootArg ?? process.cwd());
const v = validateAngrebsIndeks(idx, manifest);
if (!v.ok) { console.error(`✗ indekset er UGYLDIGT/UKOMPLET mod manifestet (${v.reasons.length}):`); for (const r of v.reasons) console.error("  - " + r); process.exit(1); }
try { const t = await loadTests(idx, root); console.log(`✓ indeks komplet mod manifestet og konsistent m. ${t.size} testfunktioner på disk · ${idx.tests.length} tests · ${idx.mutants.length} mutanter · ${idx.bids.length} bids`); }
catch (e) { console.error(`✗ testfilerne matcher ikke indekset: ${e.message}`); process.exit(1); }
