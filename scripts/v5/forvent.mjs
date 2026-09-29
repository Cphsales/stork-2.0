#!/usr/bin/env node
// forvent.mjs — hvordan en test sammenligner det den ser med det den forventer (bruges af test-runner.mjs).
// matchExpect(rows, expect): rows|count|scalar|empty|null · grundEffektiv(grund, subst): {token}-substitution i en afvisningsgrund.

const EXPECT_KINDS = Object.freeze(["rows", "count", "scalar", "empty", "null"]);
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const own = (o, k) => { if (o === null || typeof o !== "object") return undefined; const d = Object.getOwnPropertyDescriptor(o, k); return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined; };
const isPlain = (v) => { if (v === null || typeof v !== "object" || Array.isArray(v)) return false; const p = Object.getPrototypeOf(v); return p === Object.prototype || p === null; };
const isDense = (a, pred = () => true) => {
  if (!Array.isArray(a) || Object.getPrototypeOf(a) !== Array.prototype) return false;
  const len = a.length;
  for (const k of Reflect.ownKeys(a)) { if (typeof k === "symbol") return false; if (k === "length") continue; const idx = Number(k); if (!Number.isInteger(idx) || idx < 0 || idx >= len || String(idx) !== k) return false; const d = Object.getOwnPropertyDescriptor(a, k); if (!d || typeof d.get === "function" || typeof d.set === "function" || !d.enumerable) return false; }
  for (let i = 0; i < len; i++) if (!hasOwn(a, i) || !pred(a[i])) return false;
  return true;
};
// kanonisk JSON (sorterede nøgler, egne data-felter). Ikke-endelige tal og undefined er IKKE værdier → kaster (protokol-fejl opstrøms)
export function canon(v) {
  if (v === undefined) throw new Error("undefined er ikke en observérbar værdi");
  if (typeof v === "number" && !Number.isFinite(v)) throw new Error("ikke-endeligt tal er ikke en observérbar værdi");
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(own(v, k))).join(",") + "}";
}
const safeCanon = (v) => { try { return canon(v); } catch { return null; } };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// grundEffektiv(grund, subst) → {grund} | {fejl}: substituér {key}-tokens i kontraktens grund m. casens subst (H2). Alle tokens skal have
// en uuid-værdi; subst uden token er overskydende (protokol) — så subst aldrig kan »forme« en anden grund end kontraktens.
export function grundEffektiv(grund, subst) {
  const tokens = [...String(grund).matchAll(/\{([a-z_][a-z0-9_]*)\}/g)].map((m) => m[1]);
  if (tokens.length === 0) return subst !== undefined && subst !== null ? { fejl: "subst angivet men kontraktens grund har intet {token}" } : { grund: String(grund) };
  if (!isPlain(subst)) return { fejl: `kontraktens grund kræver subst for {${[...new Set(tokens)].join("}, {")}}` };
  const keys = Object.keys(subst); const need = new Set(tokens);
  for (const k of keys) { if (!need.has(k)) return { fejl: `subst.${k} svarer ikke til et {token} i grund` }; if (typeof own(subst, k) !== "string" || !UUID_RE.test(own(subst, k))) return { fejl: `subst.${k} er ikke en uuid` }; }
  for (const t of need) if (!keys.includes(t)) return { fejl: `subst mangler {${t}}` };
  return { grund: String(grund).replace(/\{([a-z_][a-z0-9_]*)\}/g, (_, k) => own(subst, k)) };
}
export function matchExpect(rows, expect) {
  if (!isPlain(expect) || !EXPECT_KINDS.includes(own(expect, "kind"))) return { ok: null, detail: "expect.kind skal være rows|count|scalar|empty|null" };
  if (!isDense(rows, isPlain)) return { ok: null, detail: "manglende rækkesæt (runner leverede ikke rows) — protokol-fejl, ikke et udfald" };
  const kind = own(expect, "kind");
  if (kind !== "empty" && kind !== "null" && !hasOwn(expect, "value")) return { ok: null, detail: `expect.${kind} kræver eksplicit value` };
  const value = own(expect, "value");
  switch (kind) {
    case "empty": return { ok: rows.length === 0, detail: `rows=${rows.length} (forventet 0)` };
    case "count": return Number.isInteger(value) && value >= 0 ? { ok: rows.length === value, detail: `rows=${rows.length} (forventet ${value})` } : { ok: null, detail: "count kræver heltal value" };
    case "scalar": {
      const want = safeCanon(value); if (want === null) return { ok: null, detail: "scalar value er ikke en gyldig endelig værdi" };
      if (rows.length !== 1) return { ok: false, detail: `scalar kræver præcis 1 række, fik ${rows.length}` };
      const cols = Object.keys(rows[0]); if (cols.length !== 1) return { ok: false, detail: `scalar kræver præcis 1 kolonne, fik ${cols.length}` };
      const got = safeCanon(own(rows[0], cols[0])); if (got === null) return { ok: null, detail: "observeret værdi er ikke endelig/gyldig" };
      return { ok: got === want, detail: `fik ${got}, forventet ${want}` };
    }
    case "null": { if (rows.length !== 1) return { ok: false, detail: `null kræver præcis 1 række, fik ${rows.length}` }; const cols = Object.keys(rows[0]); if (cols.length !== 1) return { ok: false, detail: "null kræver præcis 1 kolonne" }; return { ok: own(rows[0], cols[0]) === null, detail: `fik ${safeCanon(own(rows[0], cols[0]))}` }; }
    case "rows": {
      if (!isDense(value, isPlain)) return { ok: null, detail: "rows kræver value = tæt array af rækker" };
      const ordered = own(expect, "ordered") === true;
      const a = rows.map(safeCanon), b = value.map(safeCanon); if (a.includes(null) || b.includes(null)) return { ok: null, detail: "ugyldig værdi i rækkesæt" };
      const A = ordered ? a : [...a].sort(), B = ordered ? b : [...b].sort();
      return { ok: A.length === B.length && A.every((x, i) => x === B[i]), detail: `fik ${rows.length} rækker (forventet ${value.length}); ${ordered ? "ordnet" : "mængde"}-sammenligning` };
    }
  }
  return { ok: null, detail: "ukendt" };
}

