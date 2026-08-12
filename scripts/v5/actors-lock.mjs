#!/usr/bin/env node
// actors-lock.mjs — validator for `actors.lock` (plan 2.F: provenance + transport).
//
// `actors.lock` = det LÅSTE registry der pinner HVER workflow-rolle til en eksakt
// aktør + model + skill-OID + værktøjs-sæt + output-schema. Provenance = model +
// skill-bytes, ALDRIG CLI-config og ALDRIG "latest". CI's actor-runner injicerer
// skill-bytes ved skill_oid og returnerer et signeret actor_run.json; denne
// validator sikrer at selve låsen er veldannet, u-drivende og git-forankret FØR
// den bruges.
//
// PAKKE-AGNOSTISK: låsen handler om fabrikkens aktører, ikke om nogen pakke —
// derfor fuldt verificerbar nu (struktur + roller.mjs-konsistens + git-path-
// binding af skill_oid). Det der IKKE kan bevises her (ærlig residual): at den
// FAKTISKE kørsel brugte netop den model/skill — det bæres af actor-runnerens
// signerede actor_run.json ved KØRSEL (transport-laget, senere).
//
// U-forfalskelig kerne: skill_oid re-bindes mod rå git (git rev-parse
// <commit>:<skill_path> === skill_oid) — en aktør kan ikke påstå en skill-version;
// den citeres mod træet, ligesom læsebeviset i verdikt.mjs.

import { ROLLER, ROLLE_IDS, OUTPUT_TYPES } from "./roller.mjs";
import { ACTOR_SLUGS, isOid } from "./gates.mjs";

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const own = (o, k) => (hasOwn(o, k) ? o[k] : undefined);
const isNonEmptyString = (v) => typeof v === "string" && v.length > 0;
const isPlainObject = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};
const isDenseArrayOf = (a, pred) => {
  if (!Array.isArray(a)) return false;
  for (let i = 0; i < a.length; i++) if (!hasOwn(a, i)) return false;
  return a.every(pred);
};

// aktør-slug → provider (vendor). Fast fabrik-faktum: kun codex er cross-vendor
// (OpenAI); resten er Anthropic. Bindes så en lås ikke tavst kan flytte en rolle
// til en forkert vendor (ville bryde P2's cross-vendor-de-korrelation).
export const PROVIDER_OF = Object.freeze({
  code: "anthropic",
  "code-reviewer": "anthropic",
  "claude-ai": "anthropic",
  codex: "openai",
});
export const REASONING_LEVELS = Object.freeze(["low", "medium", "high", "xhigh", "max"]);
// værktøjs-navne der giver web-adgang. En web-forbudt rolle (roller.web=false) må
// ALDRIG have et af disse i sin lås (web skaber nye "sandheder" — kun rådgivende
// forbedring må have det). Match uafhængigt af provider-præfiks.
export const WEB_TOOLS = Object.freeze(["web", "websearch", "web-search", "webfetch", "web-fetch", "browse", "browser"]);
const isWebTool = (t) => typeof t === "string" && WEB_TOOLS.includes(t.toLowerCase());

const skillPathOf = (role) => `scripts/v5/roller/${role}.md`;

const ENTRY_FIELDS = Object.freeze([
  "role",
  "aktoer",
  "provider",
  "model",
  "reasoning",
  "skill_path",
  "skill_oid",
  "allowed_tools",
  "output_schema",
]);

// validateActorsLock(lock, { git, commitSha, roller }) → {ok, reasons}
//
// lock = plain object map: role → entry. Kræver PRÆCIS ét entry pr. rolle i
// roller-registryet (anti-tavshed: en manglende rolle = et hul; en ukendt rolle
// = rød). git+commitSha valgfrit: gives de, re-bindes skill_oid mod rå git.
export function validateActorsLock(lock, { git, commitSha, roller = ROLLER } = {}) {
  const reasons = [];
  const fail = (r) => reasons.push(r);
  if (!isPlainObject(lock)) return { ok: false, reasons: ["actors.lock er ikke et plain object"] };

  const roleIds = Object.keys(roller);
  const lockKeys = Object.keys(lock);

  // dækning: hver rolle låst, ingen ukendt rolle
  for (const role of roleIds) if (!hasOwn(lock, role)) fail(`rolle '${role}' mangler i actors.lock (anti-tavshed)`);
  for (const key of lockKeys) if (!hasOwn(roller, key)) fail(`ukendt rolle i actors.lock: '${key}' (fail-closed)`);

  for (const role of roleIds) {
    if (!hasOwn(lock, role)) continue;
    const e = lock[role];
    if (!isPlainObject(e)) {
      fail(`${role}: entry er ikke et plain object`);
      continue;
    }
    for (const k of Object.keys(e)) if (!ENTRY_FIELDS.includes(k)) fail(`${role}: ukendt felt '${k}' (fail-closed)`);
    for (const k of ENTRY_FIELDS) if (!hasOwn(e, k)) fail(`${role}: manglende felt '${k}'`);
    if (reasons.some((r) => r.startsWith(`${role}:`))) continue; // strukturelt rådne entries springes over for værdicheck

    const reg = roller[role];

    // role-felt skal spejle nøglen (ingen intern uenighed)
    if (own(e, "role") !== role) fail(`${role}: role-felt (${String(own(e, "role"))}) ≠ nøglen`);

    // aktoer: kendt slug OG === registryets aktør (låsen må ikke flytte rollen)
    const aktoer = own(e, "aktoer");
    if (!ACTOR_SLUGS.includes(aktoer)) fail(`${role}: ukendt aktoer '${String(aktoer)}'`);
    else if (aktoer !== reg.aktoer) fail(`${role}: aktoer '${aktoer}' ≠ roller-registryets '${reg.aktoer}' (drift)`);

    // provider: korrekt vendor for aktøren (P2 cross-vendor bevaret)
    const provider = own(e, "provider");
    if (ACTOR_SLUGS.includes(aktoer) && provider !== PROVIDER_OF[aktoer])
      fail(`${role}: provider '${String(provider)}' ≠ forventet '${PROVIDER_OF[aktoer]}' for ${aktoer}`);

    // model: pinnet, ALDRIG "latest" (provenance = eksakt model)
    const model = own(e, "model");
    if (!isNonEmptyString(model)) fail(`${role}: model mangler/tom`);
    else if (/latest/i.test(model)) fail(`${role}: model '${model}' er 'latest'-agtig (provenance kræver eksakt version)`);

    // reasoning: kendt niveau
    if (!REASONING_LEVELS.includes(own(e, "reasoning"))) fail(`${role}: reasoning '${String(own(e, "reasoning"))}' ukendt`);

    // skill_path: præcis rollens skill-fil
    const skillPath = own(e, "skill_path");
    const expectedPath = skillPathOf(role);
    if (skillPath !== expectedPath) fail(`${role}: skill_path '${String(skillPath)}' ≠ '${expectedPath}'`);

    // skill_oid: gyldig OID, ALDRIG "latest"; hvis git gives → re-bind mod rå git
    const skillOid = own(e, "skill_oid");
    if (!isOid(skillOid)) fail(`${role}: skill_oid mangler/ugyldig (eksakt OID kræves, aldrig 'latest')`);
    else if (typeof git === "function" && isNonEmptyString(commitSha) && skillPath === expectedPath) {
      let atPath;
      try {
        atPath = git("rev-parse", `${commitSha}:${skillPath}`);
      } catch {
        atPath = null;
      }
      if (atPath === null) fail(`${role}: skill_path findes ikke i commit (fail-closed)`);
      else if (atPath !== skillOid) fail(`${role}: skill_oid matcher ikke skill_path i træet (citeret ${skillOid}, reel ${atPath}) — stale/forkert skill`);
    }

    // allowed_tools: ikke-tomt, tæt array af ikke-tomme strenge; web KUN hvis roller.web
    const tools = own(e, "allowed_tools");
    if (!isDenseArrayOf(tools, isNonEmptyString) || tools.length === 0) fail(`${role}: allowed_tools skal være et ikke-tomt, tæt array af strenge`);
    else if (!reg.web && tools.some(isWebTool)) fail(`${role}: web-værktøj i allowed_tools men roller.web=false (web skaber nye 'sandheder' — forbudt)`);

    // output_schema: === registryets producerer (samme mængde, ingen drift)
    const outs = own(e, "output_schema");
    if (!isDenseArrayOf(outs, (o) => OUTPUT_TYPES.includes(o))) fail(`${role}: output_schema er ikke et tæt array af kendte output-typer`);
    else {
      const a = [...outs].sort();
      const b = [...reg.producerer].sort();
      if (a.length !== b.length || !a.every((x, i) => x === b[i]))
        fail(`${role}: output_schema [${outs.join(",")}] ≠ roller.producerer [${reg.producerer.join(",")}] (drift)`);
    }
  }

  return { ok: reasons.length === 0, reasons };
}

// deriveActorsLock({ git, commitSha, policy, roller }) → lock
//
// Bygger en KANDIDAT-lås fra roller-registryet + git (skill_oid pr. rolle) + en
// policy-map (model/reasoning/allowed_tools pr. AKTØR — fabrikkens nuværende
// aktør-politik, opdaterbar). Provider/aktoer/output_schema/skill_path/skill_oid
// udledes; policy leverer kun model/reasoning/allowed_tools. Resultatet SKAL
// stadig bestå validateActorsLock (derive ≠ trust).
export function deriveActorsLock({ git, commitSha, policy, roller = ROLLER } = {}) {
  if (typeof git !== "function" || !isNonEmptyString(commitSha)) throw new Error("deriveActorsLock kræver git + commitSha");
  if (!isPlainObject(policy)) throw new Error("deriveActorsLock kræver en policy-map (aktoer → {model, reasoning, allowed_tools})");
  const lock = {};
  for (const role of Object.keys(roller)) {
    const reg = roller[role];
    const pol = policy[reg.aktoer];
    if (!isPlainObject(pol)) throw new Error(`policy mangler for aktør '${reg.aktoer}' (rolle ${role})`);
    const skillPath = skillPathOf(role);
    const skillOid = git("rev-parse", `${commitSha}:${skillPath}`);
    // web-forbudte roller får web-værktøjer strippet (låsen må ikke give web hvor roller.web=false)
    const tools = (reg.web ? pol.allowed_tools : pol.allowed_tools.filter((t) => !isWebTool(t))).slice();
    lock[role] = {
      role,
      aktoer: reg.aktoer,
      provider: PROVIDER_OF[reg.aktoer],
      model: pol.model,
      reasoning: pol.reasoning,
      skill_path: skillPath,
      skill_oid: skillOid,
      allowed_tools: tools,
      output_schema: [...reg.producerer],
    };
  }
  return lock;
}
