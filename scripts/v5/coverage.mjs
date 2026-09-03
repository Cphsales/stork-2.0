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
// En identifikator: citeret ("..." med ""-escape) ELLER uciteret. Uciteret
// tillader unicode-bogstaver (PostgreSQL-lovligt) via \p{L}; case-folding
// sker i normIdent (uciteret → lowercase, citeret → bevaret).
const IDENT = String.raw`(?:"(?:[^"]|"")+"|[\p{L}_][\p{L}\p{N}_$]*)`;
// evt. skema-kvalificeret: schema.tabel (hver del citeret/uciteret)
const QUALIFIED = `${IDENT}(?:\\.${IDENT})?`;
// CREATE/ALTER POLICY <navn> ON <tabel>  (IF NOT EXISTS tolereret)
const POLICY_RE = new RegExp(
  String.raw`\b(?:create|alter)\s+policy\s+(?:if\s+not\s+exists\s+)?(${IDENT})\s+on\s+(${QUALIFIED})`,
  "giu",
);
// ALTER TABLE [IF EXISTS] [ONLY] <tabel> [*] ENABLE ROW LEVEL SECURITY
// [^;]*? (ikke [\s\S]*?) → må ALDRIG spænde over en statement-grænse (;), så
// 'alter table A add col; alter table B enable rls' ikke fejltilskriver A.
const RLS_ENABLE_RE = new RegExp(
  String.raw`\balter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?(${QUALIFIED})[^;]*?enable\s+row\s+level\s+security`,
  "giu",
);

// normIdent — normalisér en (evt. skema-kvalificeret) identifikator til et
// STABILT id: split på top-level '.' (respektér "..."), un-escape "", og
// case-fold UCITEREDE dele til lowercase (PostgreSQL-semantik) mens CITEREDE
// dele bevarer deres case. En '.' inde i et citeret navn er en del af navnet.
function normIdent(raw) {
  const parts = [];
  let cur = "";
  let inQuote = false;
  let wasQuoted = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '"') {
      if (inQuote && raw[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      } // "" → literal "
      if (!inQuote) wasQuoted = true;
      inQuote = !inQuote;
      continue;
    }
    if (ch === "." && !inQuote) {
      parts.push(wasQuoted ? cur : cur.toLowerCase());
      cur = "";
      wasQuoted = false;
      continue;
    }
    cur += ch;
  }
  parts.push(wasQuoted ? cur : cur.toLowerCase());
  return parts.join(".");
}

// normalizeForScan — gør SQL sikker for de top-level DDL-regexer ved en
// KONTEKST-AWARE lineær scanner. Reglen: kun TOP-LEVEL DDL skal kunne matche.
// - kommentarer (linje --, NESTEDE block /* */) → mellemrum.
// - string-literals ('...' med ''-escape) OG E-strenge (E'...' med \-escape)
//   → NEUTRALISERES til '' (indhold fjernet): kommentar-/DDL-syntaks inde i en
//   streng må hverken sluge efterfølgende DDL (miss) eller matche som flade
//   (falsk-positiv).
// - dollar-quotes ($tag$...$tag$) → NEUTRALISERES: en funktions-krop er en
//   definition, ikke top-level migration-flade (funktions-intern/dynamisk RLS
//   er en ærlig residual — recon/omission-devil/menneske fanger den, ikke en
//   statisk regex).
// - quoted identifiers ("..." med ""-escape) → BEVARES: de ER tabel-/policy-
//   navne (top-level flade).
// Codex-fund lukket her: string-literal-skjul, E-string-escape-miss,
// dollar-quote-over-derivation.
function normalizeForScan(sql) {
  let out = "";
  let i = 0;
  const n = sql.length;
  const skipString = () => {
    // i peger på tegnet EFTER åbnings-quote; standard '' -escape
    while (i < n) {
      if (sql[i] === "'" && sql[i + 1] === "'") {
        i += 2;
        continue;
      }
      if (sql[i] === "'") {
        i++;
        return;
      }
      i++;
    }
  };
  const skipEString = () => {
    // E-streng: backslash escaper næste tegn; '' -escape gælder også
    while (i < n) {
      if (sql[i] === "\\") {
        i += 2;
        continue;
      }
      if (sql[i] === "'" && sql[i + 1] === "'") {
        i += 2;
        continue;
      }
      if (sql[i] === "'") {
        i++;
        return;
      }
      i++;
    }
  };
  while (i < n) {
    const c = sql[i];
    const c2 = sql[i + 1];
    if (c === "-" && c2 === "-") {
      i += 2;
      while (i < n && sql[i] !== "\n") i++;
      out += " ";
    } else if (c === "/" && c2 === "*") {
      let depth = 1;
      i += 2;
      while (i < n && depth > 0) {
        if (sql[i] === "/" && sql[i + 1] === "*") ((depth += 1), (i += 2));
        else if (sql[i] === "*" && sql[i + 1] === "/") ((depth -= 1), (i += 2));
        else i++;
      }
      out += " ";
    } else if ((c === "E" || c === "e") && c2 === "'") {
      i += 2;
      skipEString();
      out += "''"; // neutraliseret
    } else if (c === "'") {
      i++;
      skipString();
      out += "''"; // neutraliseret
    } else if (c === '"') {
      // quoted identifier — BEVARES (flade-navn)
      out += c;
      i++;
      while (i < n) {
        if (sql[i] === '"' && sql[i + 1] === '"') {
          out += '""';
          i += 2;
          continue;
        }
        if (sql[i] === '"') {
          out += '"';
          i++;
          break;
        }
        out += sql[i];
        i++;
      }
    } else {
      const dq = /^\$([A-Za-z_][A-Za-z0-9_]*|)\$/.exec(sql.slice(i));
      if (dq) {
        const tag = dq[0];
        const end = sql.indexOf(tag, i + tag.length);
        i = end === -1 ? n : end + tag.length;
        out += " "; // dollar-quote-krop neutraliseret
      } else {
        out += c;
        i++;
      }
    }
  }
  return out;
}

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
      // git.bytes (rå Buffer, ingen trailing-newline-trim) → eksakt indhold.
      let sql;
      try {
        sql = git.bytes("show", `${commitSha}:${path}`).toString("utf8");
      } catch (e) {
        throw new Error(`deriveSurface: kan ikke læse migration ${path} (fail-closed): ${e?.message ?? e}`);
      }
      const stripped = normalizeForScan(sql);
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

// filterSurface(surface, filter) → surface (evt. indsnævret til pakke-fladen)
//
// Pakke-flade-filter (Mathias 2026-08-13: recon-dækning KUN på pakkens flade).
// filter = { punkt_ids: [<flade-punkt-id>...] } — en EKSPLICIT, committet og
// dermed reviewbar id-liste (ingen mønster-magi; listen ER pakke-flade-
// deklarationen og står i det OID-bundne bundle).
//
// Fail-closed hele vejen (eksplicit deklaration > default):
// - filter fraværende (null/undefined) → kast — en glemt deklaration må ALDRIG
//   tavst blive til fuld-flade-krav eller intet krav; kalderen (recon-gaten)
//   KRÆVER eksplicit filter (Mathias 2026-08-13: klar struktur i workflowet)
// - malformet filter → kast (opstrøms gate går rød — aldrig tavst fuld/ingen flade)
// - id i filteret som IKKE findes i den deriverede flade → kast (typo-værn:
//   et fejlstavet id ville ellers tavst udelade et punkt man TROEDE var krævet)
export function filterSurface(surface, filter) {
  const points = surface?.points;
  if (!Array.isArray(points)) throw new Error("filterSurface: surface.points mangler/ugyldig");
  if (filter === null || filter === undefined)
    throw new Error("filterSurface: flade_filter mangler (pakke-scope skal deklareres eksplicit — fravær = rød)");
  if (typeof filter !== "object" || Array.isArray(filter)) throw new Error("filterSurface: filter er ikke et objekt");
  // EGET DATA-felt (Codex-fund 2026-09-03): et arvet/accessor punkt_ids må ikke
  // indsnævre fladen — kun et committet, eget datafelt tæller (fail-closed).
  const d = Object.getOwnPropertyDescriptor(filter, "punkt_ids");
  if (!d || typeof d.get === "function" || typeof d.set === "function")
    throw new Error("filterSurface: punkt_ids skal være et EGET datafelt (arvet/accessor = fail-closed)");
  const ids = filter.punkt_ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((x) => typeof x === "string" && x.length > 0))
    throw new Error("filterSurface: filter.punkt_ids skal være en ikke-tom liste af strenge");
  const want = new Set(ids);
  if (want.size !== ids.length) throw new Error("filterSurface: dublet-id i punkt_ids");
  const known = new Set(points.map((p) => p.id));
  for (const id of want) if (!known.has(id)) throw new Error(`filterSurface: ukendt punkt-id i filter: ${id} (typo-værn, fail-closed)`);
  return { points: points.filter((p) => want.has(p.id)), kinds: surface.kinds };
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

// checkBucketCoverage(surface, bucketMap) → {ok, reasons, uncovered}
// Recon-fasens variant: hvert deriveret flade-punkt SKAL være klassificeret i
// én af de 3 bøtter (dispositioner hører til krav-fasen, ikke her). Kode-punkter
// ≠ intet-data. Fail-closed. bucketMap: {<flade_punkt_id>: <bøtte>}.
export function checkBucketCoverage(surface, bucketMap) {
  const reasons = [];
  const uncovered = [];
  const fail = (r) => reasons.push(r);

  const points = surface?.points;
  if (!Array.isArray(points)) return { ok: false, reasons: ["surface.points mangler/ugyldig"], uncovered };
  if (bucketMap === null || typeof bucketMap !== "object" || Array.isArray(bucketMap))
    return { ok: false, reasons: ["bucketMap mangler/er ikke et objekt"], uncovered };

  for (const p of points) {
    if (!Object.prototype.hasOwnProperty.call(bucketMap, p.id)) {
      uncovered.push(p.id);
      fail(`flade-punkt uklassificeret i recon: ${p.id} (tavs udeladelse forbudt)`);
      continue;
    }
    const b = bucketMap[p.id];
    if (!BUCKETS.includes(b)) fail(`${p.id}: ugyldig bøtte '${String(b)}'`);
    else if (CODE_KINDS.includes(p.kind) && b === "intet-data")
      fail(`${p.id}: kode-punkt klassificeret 'intet-data' (koden findes → der ER data)`);
  }

  return { ok: reasons.length === 0, reasons, uncovered };
}

export { CODE_KINDS };
