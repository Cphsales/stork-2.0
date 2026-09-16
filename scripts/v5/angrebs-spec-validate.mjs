#!/usr/bin/env node
// angrebs-spec-validate.mjs — CLI til Fase 4 pkt. 1: validér den maskinlæsbare angrebs-/måle-spec mod manifestet FØR den committes.
//   node scripts/v5/angrebs-spec-validate.mjs plan-build/<pakke>/angrebs-spec.json plan-build/<pakke>/forventnings-manifest.json
// Exit 0 = komplet og gyldig mod manifestet (samme dommer som build-gaten bruger: angrebs-spec.mjs validateAngrebsSpec); exit 1 = fund
// listet; exit 2 = brug. Ikke gate-afhængigt (intet gate-entrypoint importerer det) — et arbejdsværktøj for Codex/driver, ikke en dom.
import { readFileSync } from "node:fs";
import { validateAngrebsSpec } from "./angrebs-spec.mjs";
import { validateManifest, expectedSet } from "./forventnings-manifest.mjs";

const [specFil, manifestFil] = process.argv.slice(2);
if (!specFil || !manifestFil) { console.error("brug: angrebs-spec-validate.mjs <angrebs-spec.json> <forventnings-manifest.json>"); process.exit(2); }
const læs = (f) => { try { return JSON.parse(readFileSync(f, "utf8")); } catch (e) { console.error(`kan ikke læse/parse ${f}: ${e.message}`); process.exit(2); } };
const spec = læs(specFil), manifest = læs(manifestFil);
const vm = validateManifest(manifest);
if (!vm.ok) { console.error(`✗ manifestet er UGYLDIGT (${vm.reasons.length}) — ret manifestet først:`); for (const r of vm.reasons.slice(0, 20)) console.error("  - " + r); process.exit(1); }
const v = validateAngrebsSpec(spec, manifest);
if (!v.ok) { console.error(`✗ angrebs-spec UGYLDIG/UKOMPLET mod manifestet (${v.reasons.length}):`); for (const r of v.reasons) console.error("  - " + r); process.exit(1); }
const F = expectedSet(manifest);
const former = {}; for (const c of spec.cases) former[c.proof_form] = (former[c.proof_form] ?? 0) + 1;
console.log(`✓ angrebs-spec komplet og gyldig mod manifestet: ${spec.cases.length} cases (${Object.entries(former).map(([k, n]) => `${k} ${n}`).join(" · ")}) · ${spec.mutants.length} mutanter · ${spec.bids.length} bids · dækker ${F.obligations.size} forpligtelser · ${F.negatives.size} negativer · ${F.ks.size} K`);
