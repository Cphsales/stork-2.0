#!/usr/bin/env node
// governance-check.mjs — mekanisk lag-1 governance-scanner (gov-2-vagt).
//
// Fanger governance-drift mekanisk. Princip (Codex): owner = DEFINITIONShjem,
// ikke mention-hjem. Semantisk/prosa-modsigelse er Codex-mandatets bord (ikke her).
//
// Checks: dead-doc-paths · junk-files · laesefoelge-targets · pointer-validity ·
//         owns-uniqueness · number-home-uniqueness · H-ref-integrity
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
    path: "docs/coordination/overvaagning/claude-ai-overvaagning.md",
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
    path: "docs/skabeloner/codex-review-prompt.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (inline i disciplin §10.4)",
  },
  {
    path: "docs/skabeloner/rapport-skabelon.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (inline i disciplin §10.3)",
  },
  {
    path: "docs/coordination/mathias-afgoerelser.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (arkiv/mathias-afgoerelser-historik.md)",
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
function docRefs(text) {
  const out = new Set();
  const re = /docs\/[A-Za-z0-9_./<>-]+/g;
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

// ---------- check: dead-doc-paths (docs + scripts) ----------
function deadDocPaths() {
  const scan = [...DOC_FILES, ...SCRIPT_FILES];
  for (const f of scan) {
    const refs = docRefs(stripFenced(read(f)));
    for (const r of refs) {
      if (pathExists(r)) continue;
      if (ALLOWED.has(r)) {
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

// ---------- run ----------
const CHECKS = [
  ["dead-doc-paths", deadDocPaths],
  ["junk-files", junkFiles],
  ["laesefoelge-targets", laesefoelgeTargets],
  ["pointer-validity", pointerValidity],
  ["owns-uniqueness", ownsUniqueness],
  ["number-home-uniqueness", numberHomeUniqueness],
  ["H-ref-integrity", hRefIntegrity],
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
