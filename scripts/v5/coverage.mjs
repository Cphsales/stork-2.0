#!/usr/bin/env node
// coverage.mjs — v5's uafhængige (non-LLM) flade-deriver + komplethed-dommer (plan 2.D).
//
// Den DETERMINISTISKE kilde til "hvilken sandhedsbærende flade findes der" →
// så "gjorde recon rede for X?" er MEKANISK, ikke et LLM-skøn (P3). Deriveren
// GARANTERER ikke at fladen er komplet — ukendt-ukendt-komplethed er en ærlig
// residual (omission-devil + Mathias, plan DEL VII) — men intet DERIVERET
// punkt kan tabes tavst: checkCoverage kræver en disposition for hvert.
//
// Ærlig grænse (rapporteres i `kinds`): deriveren dækker den robust-
// deriverbare, sikkerheds-kritiske flade — migrations · RLS-enable · RLS-
// policy · kendte config-filer. Route/entrypoint-derivation (TS) udvides når
// en pakke med routes reelt mødes; den fabrikeres ikke her.

const CODE_KINDS = Object.freeze(["migration", "rls_enabled", "rls_policy"]);
export const SURFACE_KINDS = Object.freeze([...CODE_KINDS, "config"]);
export const BUCKETS = Object.freeze(["nuvaerende-kode", "dokument", "intet-data"]);
export const DISPOSITIONS = Object.freeze(["behandlet", "udskudt", "ikke-relevant"]);

// Kendte config-stier (til stede-tjek — ikke indholds-parset).
const CONFIG_PATHS = Object.freeze(["turbo.json", "pnpm-workspace.yaml", "supabase/config.toml", "tsconfig.base.json"]);

const MIGRATION_RE = /(^|\/)(supabase\/)?migrations\/[^/]+\.sql$/i;
// Regex-derivation af struktureret SQL er heuristisk; den vejer bevidst mod
// OVER-derivation (en ekstra falsk-flade koster kun en billig disposition),
// ALDRIG mod at MISSE (en misset RLS-flade = tavs udeladelse = falsk-grøn).
// En identifikator: uciteret (a-z0-9_) ELLER citeret med ""-escape.
const IDENT = String.raw`(?:"(?:[^"]|"")+"|[a-z0-9_]+)`;
// evt. skema-kvalificeret: schema.tabel (hver del citeret/uciteret)
const QUALIFIED = `${IDENT}(?:\\.${IDENT})?`;
// CREATE/ALTER POLICY <navn> ON <tabel>  (IF NOT EXISTS tolereret)
const POLICY_RE = new RegExp(
  String.raw`\b(?:create|alter)\s+policy\s+(?:if\s+not\s+exists\s+)?(${IDENT})\s+on\s+(${QUALIFIED})`,
  "gi",
);
// ALTER TABLE [IF EXISTS] <tabel> ... ENABLE ROW LEVEL SECURITY
const RLS_ENABLE_RE = new RegExp(
  String.raw`\balter\s+table\s+(?:if\s+exists\s+)?(${QUALIFIED})[\s\S]*?enable\s+row\s+level\s+security`,
  "gi",
);

// normalisér identifikator: strip citations-tegn + ""-escape → stabilt id.
const normIdent = (raw) =>
  raw
    .split(".")
    .map((part) => (part.startsWith('"') ? part.slice(1, -1).replaceAll('""', '"') : part))
    .join(".");

// fjern SQL-kommentarer (linje -- og block /* */) FØR scanning, så
// udkommenteret DDL ikke tælles og kommentarer mellem tokens ikke skjuler DDL.
const stripSqlComments = (sql) => sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");

const uniqPush = (arr, seen, point) => {
  if (!seen.has(point.id)) {
    seen.add(point.id);
    arr.push(point);
  }
};

// deriveSurface({git, commitSha}) → {points:[{id, kind, ref, detail}], kinds}
// Læser KUN den committede tree (git ls-tree/show) — aldrig arbejdstræet.
export function deriveSurface({ git, commitSha }) {
  if (typeof git !== "function") throw new Error("deriveSurface: git-dep mangler");
  const files = git("ls-tree", "-r", "--name-only", commitSha)
    .split("\n")
    .filter((f) => f.length > 0);

  const points = [];
  const seen = new Set();

  for (const path of files) {
    if (CONFIG_PATHS.includes(path))
      uniqPush(points, seen, { id: `config:${path}`, kind: "config", ref: path, detail: path });

    if (MIGRATION_RE.test(path)) {
      uniqPush(points, seen, { id: `migration:${path}`, kind: "migration", ref: path, detail: path });
      // fail-closed: kan migrationen ikke læses fuldt, må vi ikke fortsætte med
      // tom SQL (ville tavst misse RLS-fladen) — kast, så gaten går rød.
      let sql;
      try {
        sql = git("show", `${commitSha}:${path}`);
      } catch (e) {
        throw new Error(`deriveSurface: kan ikke læse migration ${path} (fail-closed): ${e?.message ?? e}`);
      }
      const stripped = stripSqlComments(sql);
      for (const m of stripped.matchAll(RLS_ENABLE_RE)) {
        const table = normIdent(m[1]);
        uniqPush(points, seen, { id: `rls_enabled:${table}`, kind: "rls_enabled", ref: path, detail: table });
      }
      for (const m of stripped.matchAll(POLICY_RE)) {
        const name = normIdent(m[1]);
        const table = normIdent(m[2]);
        uniqPush(points, seen, {
          id: `rls_policy:${table}:${name}`,
          kind: "rls_policy",
          ref: path,
          detail: `${table} · ${name}`,
        });
      }
    }
  }

  points.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)); // deterministisk orden
  return { points, kinds: [...SURFACE_KINDS] };
}

// checkCoverage(surface, dispositions) → {ok, reasons, uncovered}
// PURE komplethed-dom: hvert deriveret flade-punkt SKAL have en gyldig
// disposition, og et EKSISTERENDE kode-punkt må aldrig klassificeres
// "intet-data" (koden findes → der ER data). Fail-closed.
export function checkCoverage(surface, dispositions) {
  const reasons = [];
  const uncovered = [];
  const fail = (r) => reasons.push(r);

  const points = surface?.points;
  if (!Array.isArray(points)) return { ok: false, reasons: ["surface.points mangler/ugyldig"], uncovered };
  if (dispositions === null || typeof dispositions !== "object" || Array.isArray(dispositions))
    return { ok: false, reasons: ["dispositions mangler/er ikke et objekt"], uncovered };

  for (const p of points) {
    const d = Object.prototype.hasOwnProperty.call(dispositions, p.id) ? dispositions[p.id] : undefined;
    if (d === undefined) {
      uncovered.push(p.id);
      fail(`flade-punkt uden disposition: ${p.id} (tavs udeladelse forbudt)`);
      continue;
    }
    if (d === null || typeof d !== "object" || Array.isArray(d)) {
      fail(`disposition for ${p.id} er ikke et objekt`);
      continue;
    }
    // egne felter (ikke arvede): en disposition skal bære sine egne data.
    if (!Object.prototype.hasOwnProperty.call(d, "bøtte") || !Object.prototype.hasOwnProperty.call(d, "disposition")) {
      fail(`${p.id}: disposition mangler egne felter bøtte/disposition (arvet/manglende = rød)`);
      continue;
    }
    if (!BUCKETS.includes(d.bøtte)) fail(`${p.id}: ugyldig bøtte '${String(d.bøtte)}'`);
    if (!DISPOSITIONS.includes(d.disposition)) fail(`${p.id}: ugyldig disposition '${String(d.disposition)}'`);
    if (CODE_KINDS.includes(p.kind) && d.bøtte === "intet-data")
      fail(`${p.id}: kode-punkt klassificeret 'intet-data' (koden findes → der ER data)`);
  }
  // en disposition for et ikke-derivat punkt er ikke i sig selv en fejl (recon
  // må dække mere end den mekaniske flade), men et ukendt id der PÅSTÅS at være
  // et flade-punkt fanges ikke her — kun manglende dækning af de DERIVEREDE.

  return { ok: reasons.length === 0, reasons, uncovered };
}

export { CODE_KINDS };
