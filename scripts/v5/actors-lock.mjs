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
//
// RESIDUAL (ærlig, delt af HELE v5-substratet): MUTATION af Node's globale
// built-in prototyper (Array.prototype.some, Object.prototype.<felt>, String.
// prototype.split …) er fuld runtime-kompromittering — den defeater lige så vel
// git.mjs, JSON, og gate-kernen selv, og kan IKKE nås af data en bygger/driver
// leverer (den kræver kode-eksekvering i CI, hvorefter gaten alligevel er tabt).
// Object-/array-NIVEAU tricks (egne accessors/symboler/ikke-enumerable, custom
// prototype, egne metode-overrides) ER lukket her via own-data + prototype-pin +
// index-loops. Den globale prototype-mutation er en runtime-integritets-antagelse,
// ikke en validator-fejl.

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
// checkPureDenseArrayOf: som isDenseArrayOf, men STOL IKKE på arrayets egne
// metoder — en egen `some`/`every`-override eller custom Symbol.iterator kunne
// ellers forfalske checket. Kræv: kun egne nøgler = length + indices 0..len-1
// (alle enumerable data), ingen huller, ingen symbol-nøgler; iterér via index-loop.
const checkPureDenseArrayOf = (a, pred, label, fail) => {
  if (!Array.isArray(a)) {
    fail(`${label}: ikke et array`);
    return false;
  }
  // prototypen SKAL være Array.prototype — en custom prototype kunne ARVE en
  // some/every/Symbol.iterator-override som index-loopet ikke ser, men som en
  // efterfølgende .some()/spread ville bruge (Codex-fund). Ejer-nøgle-tjekket
  // nedenfor fanger kun EGNE overrides.
  if (Object.getPrototypeOf(a) !== Array.prototype) {
    fail(`${label}: array har ikke-standard prototype (arvet metode-override forbudt)`);
    return false;
  }
  const len = a.length;
  for (const k of Reflect.ownKeys(a)) {
    if (typeof k === "symbol") {
      fail(`${label}: symbol-nøgle på array forbudt (fx egen Symbol.iterator)`);
      return false;
    }
    if (k === "length") continue;
    const idx = Number(k);
    if (!Number.isInteger(idx) || idx < 0 || idx >= len) {
      fail(`${label}: uventet egen array-property '${k}' (fx some/every-override)`);
      return false;
    }
    const d = Object.getOwnPropertyDescriptor(a, k);
    if (!d || typeof d.get === "function" || typeof d.set === "function" || !d.enumerable) {
      fail(`${label}: accessor/ikke-enumerable indeks '${k}'`);
      return false;
    }
  }
  for (let i = 0; i < len; i++) {
    if (!hasOwn(a, i)) {
      fail(`${label}: hul ved indeks ${i}`);
      return false;
    }
    if (!pred(a[i])) {
      fail(`${label}: element ${i} ugyldig`);
      return false;
    }
  }
  return true;
};
// checkPureDataKeys: Reflect.ownKeys fanger symbol-nøgler + ikke-enumerable + egne
// nøgler som Object.keys ignorerer; descriptor-tjek afviser accessor-felter (en
// getter kunne validere som "pinned" og eksponere "latest" bagefter). Kun rene,
// enumerable data-felter fra `allowedKeys` tillades (fail-closed).
const checkPureDataKeys = (obj, allowedKeys, label, fail, noun = "felt") => {
  for (const k of Reflect.ownKeys(obj)) {
    if (typeof k === "symbol") {
      fail(`${label}: symbol-nøgle forbudt (fail-closed)`);
      continue;
    }
    const d = Object.getOwnPropertyDescriptor(obj, k);
    if (!d || typeof d.get === "function" || typeof d.set === "function") {
      fail(`${label}: accessor/dynamisk ${noun} '${k}' forbudt (rent data-felt kræves)`);
      continue;
    }
    if (!d.enumerable) {
      fail(`${label}: ikke-enumerable ${noun} '${k}' forbudt (fail-closed)`);
      continue;
    }
    if (!allowedKeys.includes(k)) fail(`${label}: ukendt ${noun} '${k}' (fail-closed)`);
  }
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
// web-adgangs-TOKENS. Et værktøjsnavn giver web hvis NOGEN af dets tokens (splittet
// på alle separatorer: '_' '-' '.' ':' '/' '__' …) er et web-token. Fanger alias/
// præfiks robust: web_search · web-search · web.fetch · web:run · provider:web ·
// anthropic:web-search · mcp__web__search · browse. En web-forbudt rolle
// (roller.web=false) må ALDRIG have et sådant værktøj (web skaber nye "sandheder").
export const WEB_TOKENS = Object.freeze(["web", "websearch", "webfetch", "webrun", "browse", "browser"]);
const isWebTool = (t) => {
  if (typeof t !== "string") return false;
  // camelCase-grænse FØR lowercase, så 'browserSearch'/'webSearch' tokeniseres til
  // browser/web (ikke ét ord der undslipper). Så split på separatorer.
  return t
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .some((tok) => WEB_TOKENS.includes(tok));
};

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

  // dækning + rene data-nøgler (Reflect.ownKeys fanger symbol/ikke-enumerable/
  // accessor rolle-nøgler; ukendt rolle = rød).
  checkPureDataKeys(lock, roleIds, "actors.lock", fail, "rolle");
  for (const role of roleIds) if (!hasOwn(lock, role)) fail(`rolle '${role}' mangler i actors.lock (anti-tavshed)`);

  for (const role of roleIds) {
    if (!hasOwn(lock, role)) continue;
    const e = lock[role];
    if (!isPlainObject(e)) {
      fail(`${role}: entry er ikke et plain object`);
      continue;
    }
    // rene data-felter: symbol/ikke-enumerable/accessor/ukendte felter → rød
    checkPureDataKeys(e, ENTRY_FIELDS, role, fail);
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

    // allowed_tools: REN, ikke-tomt, tæt array af ikke-tomme strenge; web KUN hvis
    // roller.web. (checkPureDenseArrayOf: ingen egen some/every/iterator-override.)
    const tools = own(e, "allowed_tools");
    // NB: index-loops (ikke .some/.every/spread) så en GLOBAL Array.prototype-
    // metode-override ikke kan forfalske checket. (Global built-in-prototype-
    // MUTATION er dog fuld runtime-kompromittering — se residual-noten i headeren;
    // den er uden for enhver ren validators rækkevidde.)
    if (!checkPureDenseArrayOf(tools, isNonEmptyString, `${role}.allowed_tools`, fail)) {
      // fejl allerede rapporteret af helperen
    } else if (tools.length === 0) {
      fail(`${role}: allowed_tools er tomt`);
    } else if (!reg.web) {
      let hasWeb = false;
      for (let i = 0; i < tools.length; i++) if (isWebTool(tools[i])) hasWeb = true;
      if (hasWeb) fail(`${role}: web-værktøj i allowed_tools men roller.web=false (web skaber nye 'sandheder' — forbudt)`);
    }

    // output_schema: REN array === registryets producerer (samme MULTISET, ingen
    // drift) — bidirektionel index-loop-sammenligning (ingen .sort/.every/spread).
    const outs = own(e, "output_schema");
    if (!checkPureDenseArrayOf(outs, (o) => OUTPUT_TYPES.includes(o), `${role}.output_schema`, fail)) {
      // fejl allerede rapporteret
    } else {
      const prod = reg.producerer;
      const contains = (arr, needle) => {
        for (let i = 0; i < arr.length; i++) if (arr[i] === needle) return true;
        return false;
      };
      let drift = outs.length !== prod.length;
      for (let i = 0; !drift && i < outs.length; i++) if (!contains(prod, outs[i])) drift = true;
      for (let i = 0; !drift && i < prod.length; i++) if (!contains(outs, prod[i])) drift = true;
      if (drift) fail(`${role}: output_schema ≠ roller.producerer (drift)`);
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
