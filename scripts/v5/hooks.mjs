#!/usr/bin/env node
// hooks.mjs — hvem må committe hvad (disciplin.md §2 trin 1 og 3, §9).
//
// Rollen sættes pr. session med STORK_V5_ROLLE. Hooken er friktion ved kilden;
// byggetjekket i CI kontrollerer bindingerne blob for blob.

import { isAbsolute, relative, resolve, sep } from "node:path";

export const ROLLER = Object.freeze(["fabrik", "claude-ai", "code", "codex", "code-reviewer"]);

const under = (p, prefix) => p === prefix || p.startsWith(prefix + "/");
const PAKKE = "[a-z][a-z0-9-]*";
const re = (s) => new RegExp(`^${s}$`);

const MAALELAG = [
  re(`scripts/v5/${PAKKE}/tests/.+`),
  re(`plan-build/${PAKKE}/(forventnings-manifest|angrebs-spec|prover|slutproeve)\\.json`),
];
const CODEX_DOM = [re(`plan-build/${PAKKE}/(codex-plan|codex-gennemgang)\\.md`)];
const REVIEWER_DOM = [re(`plan-build/${PAKKE}/daekningsdom\\.json`)];
const LEDGER = ["docs/sandhed/mathias-ord.md", "plan-build/lokations-skabelon/mathias-ord.md"];
const ORDBOG = ["docs/sandhed/ordbog.md", "plan-build/lokations-skabelon/ordbog.md"];
const KRAV = re(`docs/sandhed/krav/${PAKKE}-krav\\.md`);
const PRODUKT = ["supabase/migrations", "supabase/functions", "apps", "packages"];
const WORKFLOW = ["docs/strategi/disciplin.md", "scripts/v5/roller", ".github", ".husky", "scripts"];

// toRepoRel(rawPath, repoRoot) → repo-relativ POSIX-sti, eller null uden for repoet.
export function toRepoRel(rawPath, repoRoot) {
  if (typeof rawPath !== "string" || !rawPath || typeof repoRoot !== "string" || !repoRoot) return null;
  const root = resolve(repoRoot);
  const posix = rawPath.replaceAll("\\", "/");
  const abs = isAbsolute(posix) ? resolve(posix) : resolve(root, posix);
  const rel = relative(root, abs);
  if (rel === "" || rel === ".." || rel.startsWith(".." + sep)) return null;
  return rel.split(sep).join("/");
}

// zone(relPath) → "maalelag" | "codex-dom" | "reviewer-dom" | "ledger" | "ordbog" | "krav" | "sandhed" | "produkt" | "workflow" | "andet"
export function zone(p) {
  if (MAALELAG.some((r) => r.test(p))) return "maalelag";
  if (CODEX_DOM.some((r) => r.test(p))) return "codex-dom";
  if (REVIEWER_DOM.some((r) => r.test(p))) return "reviewer-dom";
  if (LEDGER.includes(p)) return "ledger";
  if (ORDBOG.includes(p)) return "ordbog";
  if (KRAV.test(p)) return "krav";
  if (under(p, "docs/sandhed")) return "sandhed";
  if (PRODUKT.some((x) => under(p, x))) return "produkt";
  if (WORKFLOW.some((x) => under(p, x))) return "workflow";
  return "andet";
}

// Hvilke roller må skrive i hver zone. Codex og code-reviewer kører skrivebeskyttet;
// fabrikken committer deres resultater uændret (§3.5), men byggeren (code) aldrig.
const TILLADT = Object.freeze({
  maalelag: ["codex", "fabrik"],
  "codex-dom": ["codex", "fabrik"],
  "reviewer-dom": ["code-reviewer", "fabrik"],
  ledger: ["fabrik", "claude-ai"],
  ordbog: ["fabrik", "claude-ai", "code"],
  krav: ["fabrik", "claude-ai"],
  sandhed: [],
  produkt: ["code"],
  workflow: ["fabrik"],
  andet: ["fabrik", "claude-ai", "code"],
});

// beslutning({rolle, stier, repoRoot}) → {ok, afviste: [{sti, zone}], grund}
export function beslutning({ rolle, stier, repoRoot } = {}) {
  if (!Array.isArray(stier)) return { ok: false, afviste: [], grund: "ugyldigt input" };
  const afviste = [];
  for (const raw of stier) {
    const p = toRepoRel(raw, repoRoot);
    if (p === null) { afviste.push({ sti: String(raw), zone: "uden for repoet" }); continue; }
    const z = zone(p);
    const ok = rolle === undefined || rolle === ""
      ? !["maalelag", "codex-dom", "reviewer-dom", "ledger", "krav", "sandhed"].includes(z)
      : ROLLER.includes(rolle) && TILLADT[z].includes(rolle);
    if (!ok) afviste.push({ sti: p, zone: z });
  }
  if (rolle && !ROLLER.includes(rolle)) return { ok: false, afviste, grund: `ukendt rolle '${rolle}' (${ROLLER.join(", ")})` };
  return afviste.length
    ? { ok: false, afviste, grund: `rollen '${rolle || "(ikke sat)"}' må ikke skrive i: ${[...new Set(afviste.map((a) => a.zone))].join(", ")}` }
    : { ok: true, afviste: [], grund: "" };
}
