#!/usr/bin/env node
// governance-check.mjs — mekanisk lag-1 governance-scanner (gov-2-vagt).
//
// Fanger governance-drift mekanisk. Princip (Codex): owner = DEFINITIONShjem,
// ikke mention-hjem. Semantisk/prosa-modsigelse er Codex-mandatets bord (ikke her).
//
// Checks: dead-doc-paths · junk-files · laesefoelge-targets · pointer-validity ·
//         owns-uniqueness · number-home-uniqueness · H-ref-integrity ·
//         structural-chain (gov-docs-renhed)
//
// Allowlist-split (gov-docs-renhed pkt 9): prosa-docs MÅ referere slettede
// stier (historisk-provenance); aktive scripts MÅ IKKE — medmindre scriptet
// bærer standalone-linjen "# governance: deprecated".
//
// Build-krav (Codex): fenced code blocks strippes FØR alle heading/ref-checks,
// så skabelon-eksempler (fx ### [Hxxx] i ```-blok) ikke tæller som kanoniske.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SELFTEST = process.argv.includes("--selftest");
const violations = [];
const notes = [];
const v = (check, msg) => violations.push(`[${check}] ${msg}`);

// ---------- scope ----------
const DOC_EXCLUDE = [
  "docs/coordination/arkiv",
  "docs/coordination/v4-slettede-docs",
  "docs/coordination/rapport-historik",
  // Rå reviewer-output (ephemeral, slettes ved pakke-luk per §4) — citerer
  // bevidst døde/historiske stier og skal ikke holdes path-rene.
  "docs/coordination/codex-reviews",
];
function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (!DOC_EXCLUDE.some((x) => p === x || p.startsWith(x + "/"))) walk(p, acc);
    } else acc.push(p);
  }
  return acc;
}
const DOC_FILES = walk("docs").filter((f) => f.endsWith(".md"));
const SCRIPT_FILES = readdirSync("scripts")
  .filter((f) => f.endsWith(".sh"))
  .map((f) => join("scripts", f));

// ---------- allowlist for manglende doc-paths {path, klasse, grund} ----------
const MISSING_PATH_ALLOWLIST = [
  { path: "docs/gdpr-compliance.md", klasse: "future-required", grund: "fremtidig leverance, ej bygget endnu" },
  {
    path: "docs/coordination/overvaagning/codex-overvaagning.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet doc, refereret som provenance",
  },
  {
    path: "docs/strategi/arbejds-disciplin.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (konsolideret til disciplin.md)",
  },
  {
    path: "docs/strategi/bygge-status.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (foldet til master-plan §4.1)",
  },
  {
    path: "docs/skabeloner/plan-skabelon.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (inline i disciplin §10.2)",
  },
  {
    path: "docs/skabeloner/rapport-skabelon.md",
    klasse: "historisk-provenance",
    grund:
      "V4-slettet (inline i disciplin §10.3); refereres som provenance i gov-docs-renhed-plan A.12 — prune ved pakke-luk (gov-6)",
  },
  {
    path: "docs/skabeloner/codex-review-prompt.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (inline i disciplin §10.4)",
  },
  {
    path: "docs/coordination/plan-feedback",
    klasse: "runtime-ephemeral",
    grund: "mkdir -p ved pakke-kørsel; slettes ved pakke-luk (disciplin §4)",
  },
  {
    path: "docs/coordination/codex-reviews",
    klasse: "runtime-ephemeral",
    grund: "output-dir ved pakke-kørsel; slettes ved pakke-luk (disciplin §4)",
  },
  {
    path: "docs/coordination/v4-slettede-docs",
    klasse: "scope-excluded-local",
    grund: "lokale midlertidige V4-gennemgangs-kopier; aldrig committet; scope-ekskluderet; foldes/fjernes i gov-6",
  },
];
const ALLOWED = new Set(MISSING_PATH_ALLOWLIST.map((a) => a.path));

// ---------- helpers ----------
function read(f) {
  return existsSync(f) ? readFileSync(f, "utf8") : "";
}
// fjern ```...``` fenced blocks (build-krav) + ~~~-varianten
function stripFenced(text) {
  return text.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
}
// doc-path-refs i en tekst (efter fenced-strip). Skip templates (< >).
// Charclass inkluderer danske bogstaver (gov-docs-renhed: docs/LÆSEFØLGE.md
// ville ellers matche afskåret og give falsk violation).
function docRefs(text) {
  const out = new Set();
  const re = /docs\/[A-Za-z0-9_./<>ÆØÅæøå-]+/g;
  let m;
  while ((m = re.exec(text))) {
    let p = m[0].replace(/[.)\]:,/]+$/, ""); // strip trailing punktuation + slash
    if (p.includes("<") || p.includes(">")) continue; // template
    out.add(p);
  }
  return [...out];
}
function pathExists(p) {
  // accepterer både fil og mappe; mappe-ref kan ende på /
  const clean = p.replace(/\/$/, "");
  return existsSync(clean);
}

// ---------- check: dead-doc-paths (docs + scripts, klasse-split) ----------
const ALLOW_BY_PATH = new Map(MISSING_PATH_ALLOWLIST.map((a) => [a.path, a]));
const SCRIPT_SET = new Set(SCRIPT_FILES);
function isDeprecated(file) {
  return read(file)
    .split("\n")
    .some((l) => l.trim().startsWith("# governance: deprecated"));
}
function deadDocPaths() {
  const scan = [...DOC_FILES, ...SCRIPT_FILES];
  for (const f of scan) {
    const refs = docRefs(stripFenced(read(f)));
    for (const r of refs) {
      if (pathExists(r)) continue;
      const entry = ALLOW_BY_PATH.get(r);
      if (entry) {
        // Split (gov-docs-renhed): prosa må bære historisk-provenance;
        // aktive scripts må ikke — medmindre scriptet selv er deprecated.
        if (SCRIPT_SET.has(f) && entry.klasse === "historisk-provenance" && !isDeprecated(f)) {
          v(
            "dead-doc-paths",
            `${f}: aktivt script peger på slettet ${r} (historisk-provenance er kun for prosa — markér scriptet '# governance: deprecated' eller fjern referencen)`,
          );
          continue;
        }
        notes.push(`dead-doc-paths: tilladt manglende ${r} (${f})`);
        continue;
      }
      v("dead-doc-paths", `${f}: peger på ikke-eksisterende ${r} (ikke i allowlist)`);
    }
  }
}

// ---------- check: junk-files ----------
function junkFiles() {
  for (const f of DOC_FILES.concat(walk("docs").filter((x) => /(^|\/)~\$|(^|\/)\.~|~\$[^/]*$/.test(x)))) {
    if (/(^|\/)~\$/.test(f) || /\.tmp$/.test(f)) v("junk-files", `junk/lock-fil i docs/: ${f}`);
  }
}

// ---------- check: laesefoelge-targets ----------
function laesefoelgeTargets() {
  const lf = "docs/LÆSEFØLGE.md";
  if (!existsSync(lf)) return v("laesefoelge-targets", "LÆSEFØLGE.md mangler");
  for (const r of docRefs(stripFenced(read(lf)))) {
    if (!pathExists(r) && !ALLOWED.has(r)) v("laesefoelge-targets", `LÆSEFØLGE-mål mangler: ${r}`);
  }
}

// ---------- check: pointer-validity ----------
function pointerValidity() {
  for (const pf of ["docs/coordination/aktiv-plan.md", "docs/coordination/seneste-rapport.md"]) {
    if (!existsSync(pf)) {
      v("pointer-validity", `pointer-fil mangler: ${pf}`);
      continue;
    }
    for (const r of docRefs(stripFenced(read(pf)))) {
      if (!pathExists(r) && !ALLOWED.has(r)) v("pointer-validity", `${pf}: pointer-mål mangler: ${r}`);
    }
  }
}

// ---------- check: owns-uniqueness ----------
// kun standalone-linjer: ^<!-- governance-owns: ... -->$  (robust mod inline-eksempler)
function parseOwns(text) {
  const concepts = [];
  for (const line of text.split("\n")) {
    const m = line.trim().match(/^<!--\s*governance-owns:\s*(.+?)\s*-->$/);
    if (m)
      concepts.push(
        ...m[1]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
  }
  return concepts;
}
function ownsUniqueness() {
  const byConcept = new Map();
  for (const f of DOC_FILES) {
    for (const c of parseOwns(stripFenced(read(f)))) {
      if (!byConcept.has(c)) byConcept.set(c, []);
      byConcept.get(c).push(f);
    }
  }
  for (const [c, files] of byConcept) {
    if (files.length > 1) v("owns-uniqueness", `begreb "${c}" ejet af ${files.length} docs: ${files.join(", ")}`);
  }
}

// ---------- check: number-home-uniqueness (kun ### [Xxxx]-entries) ----------
function numberHomeUniqueness() {
  const byNum = new Map();
  for (const f of DOC_FILES) {
    const text = stripFenced(read(f));
    const re = /^###\s*\[([GH]\d{3})\]/gm;
    let m;
    while ((m = re.exec(text))) {
      if (!byNum.has(m[1])) byNum.set(m[1], new Set());
      byNum.get(m[1]).add(f);
    }
  }
  for (const [num, files] of byNum) {
    if (files.size > 1)
      v("number-home-uniqueness", `${num} har kanonisk entry i ${files.size} docs: ${[...files].join(", ")}`);
  }
}

// ---------- check: H-ref-integrity ----------
function hRefIntegrity() {
  const husk = "docs/teknisk/huskeliste.md";
  const text = stripFenced(read(husk));
  const open = new Set();
  let m;
  const reOpen = /^###\s*\[(H\d{3})\]/gm;
  while ((m = reOpen.exec(text))) open.add(m[1]);
  // historisk-marker (standalone-linje, source of truth)
  const hist = new Set();
  for (const line of text.split("\n")) {
    const hm = line.trim().match(/^<!--\s*gov-historical-codes:\s*(.+?)\s*-->$/);
    if (hm)
      hm[1]
        .split(",")
        .map((s) => s.trim())
        .forEach((c) => /^H\d{3}$/.test(c) && hist.add(c));
  }
  const known = new Set([...open, ...hist]);
  if (known.size === 0) v("H-ref-integrity", "ingen H-entries/historiske koder fundet i huskeliste.md");
  // scan alle docs + scripts for H-refs (efter fenced-strip), suffix -> parent
  for (const f of [...DOC_FILES, ...SCRIPT_FILES]) {
    const t = stripFenced(read(f));
    const re = /\bH(\d{3})\b/g;
    let mm;
    const seen = new Set();
    while ((mm = re.exec(t))) {
      const parent = "H" + mm[1];
      if (known.has(parent) || seen.has(parent)) continue;
      seen.add(parent);
      v("H-ref-integrity", `${f}: H-ref ${parent} har hverken åben entry eller historisk-kode i huskeliste.md`);
    }
  }
}

// ---------- check: structural-chain (gov-docs-renhed pkt 10) ----------
// Strukturelt + string-match — ingen semantik. Formåls-immutabilitet (§3.0) mekanisk.
function normFormaal(text) {
  const lines = text.split("\n");
  const i = lines.findIndex((l) => l.trim().startsWith("> Denne pakke leverer:"));
  if (i === -1) return null;
  const out = [];
  for (let j = i; j < lines.length && lines[j].trim().startsWith(">"); j++) {
    out.push(lines[j].replace(/^\s*>\s?/, ""));
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}
function structuralChain() {
  const ap = read("docs/coordination/aktiv-plan.md");
  let marker = null;
  for (const line of ap.split("\n")) {
    const m = line.trim().match(/^<!--\s*aktiv-pakke:\s*(\S+)(?:\s+fase:\s*(plan|build|rapport))?\s*-->$/);
    if (m) marker = { pakke: m[1], fase: m[2] ?? "plan" };
  }
  if (!marker)
    return v(
      "structural-chain",
      "aktiv-plan.md mangler standalone-markør <!-- aktiv-pakke: <navn|ingen> [fase: plan|build|rapport] -->",
    );
  if (marker.pakke === "ingen") return;
  const base = "docs/coordination";
  const krav = `${base}/${marker.pakke}-krav-og-data.md`;
  const plan = `${base}/${marker.pakke}-plan.md`;
  const status = `${base}/${marker.pakke}-status.md`;
  for (const f of [krav, plan, status]) {
    if (!existsSync(f)) v("structural-chain", `aktiv pakke '${marker.pakke}': mangler ${f}`);
  }
  if (!existsSync(krav) || !existsSync(plan)) return;
  if (!read(plan).includes(krav)) v("structural-chain", `${plan}: krydspeger ikke ${krav}`);
  if (!read(plan).includes(status)) v("structural-chain", `${plan}: krydspeger ikke ${status}`);
  if (existsSync(status) && !read(status).includes(marker.pakke))
    v("structural-chain", `${status}: nævner ikke pakken '${marker.pakke}'`);
  const fk = normFormaal(read(krav));
  const fp = normFormaal(stripFenced(read(plan)));
  if (!fk) v("structural-chain", `${krav}: ingen "> Denne pakke leverer:"-blok`);
  if (!fp) v("structural-chain", `${plan}: ingen "> Denne pakke leverer:"-blok`);
  if (fk && fp && fk !== fp) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${plan} (§3.0)`);
  if (marker.fase === "rapport") {
    const dir = "docs/coordination/rapport-historik";
    const rapporter = existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith(`-${marker.pakke}.md`)) : [];
    if (!rapporter.length)
      return v("structural-chain", `fase: rapport men ingen rapport-historik/*-${marker.pakke}.md`);
    const nyeste = rapporter.sort().at(-1);
    const fr = normFormaal(read(join(dir, nyeste)));
    if (!fr) v("structural-chain", `${dir}/${nyeste}: ingen "> Denne pakke leverer:"-blok`);
    else if (fk && fk !== fr) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${dir}/${nyeste} (§3.0)`);
  }
}

// ---------- run ----------
const CHECKS = [
  ["dead-doc-paths", deadDocPaths],
  ["junk-files", junkFiles],
  ["laesefoelge-targets", laesefoelgeTargets],
  ["pointer-validity", pointerValidity],
  ["owns-uniqueness", ownsUniqueness],
  ["number-home-uniqueness", numberHomeUniqueness],
  ["H-ref-integrity", hRefIntegrity],
  ["structural-chain", structuralChain],
];
for (const [name, fn] of CHECKS) {
  const before = violations.length;
  try {
    fn();
  } catch (e) {
    v(name, `scanner-fejl: ${e.message}`);
  }
  if (violations.length === before) console.log(`✓ ${name}`);
  else console.log(`✗ ${name}`);
}

if (violations.length) {
  console.error("\nGovernance-check FEJLEDE:");
  for (const x of violations) console.error("  " + x);
  process.exit(1);
}
console.log(`\nGovernance-check: alle checks passed (${DOC_FILES.length} docs, ${SCRIPT_FILES.length} scripts)`);
if (notes.length && process.env.GOV_VERBOSE) notes.forEach((n) => console.log("  · " + n));
