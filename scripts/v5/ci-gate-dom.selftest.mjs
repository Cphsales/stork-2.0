#!/usr/bin/env node
// ci-gate-dom.selftest.mjs — red-team af CI-dommer-entrypointet (C4): nåethed styrer emission (ikke nået = ingen check, aldrig grøn) ·
// frisk dom pr. gate · runner der kaster = failure · mapper fail-closed · emission binder navn/head_sha/conclusion · fejl i emission = kast.
import { doemGates, emitCheckRuns, resume, NAAETHED } from "./ci-gate-dom.mjs";
import { GATE_IDS } from "./gates.mjs";

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));
const SHA = "a".repeat(40);
const gitStub = { bytes: () => Buffer.from(JSON.stringify({ pakke: "pk" })) };
const RES = { "plan-build/pk/krav-gate-resultat.json": { commit_sha: "b".repeat(40) }, "plan-build/pk/plan-gate-resultat.json": { commit_sha: "c".repeat(40) } };
const readJson = (p) => { if (!(p in RES)) throw new Error("findes ikke: " + p); return RES[p]; };
const isAncestor = (anc, desc) => anc === desc || anc === "b".repeat(40) || anc === "c".repeat(40);
const mkRunners = (over = {}) => ({ recon: () => ({ open: true, gate_id: "recon", reasons: [] }), krav: () => ({ open: true, gate_id: "krav", reasons: [] }), plan: () => ({ open: false, gate_id: "plan", reasons: ["approval mangler"] }), build: () => ({ open: false, gate_id: "build", reasons: ["ikke bygget"] }), slut: () => ({ open: false, gate_id: "slut", reasons: ["ikke bygget"] }), ...over });
const existsFor = (set) => (p) => set.includes(p) || p in RES;
const ID_SAMME = () => ({ pakke: "pk", artifact: "f".repeat(40), bindings: { krav: "1".repeat(40), plan: "2".repeat(40) } });
const D = (o) => doemGates({ commitSha: SHA, git: gitStub, readJson, isAncestor, identitet: ID_SAMME, ...o });

console.log("doemGates — nåethed og frisk dom:");
eq("NAAETHED dækker alle gates i registryet", GATE_IDS.every((g) => typeof NAAETHED[g] === "string"), true);
{ const d = await D({ runners: mkRunners(), exists: existsFor(["recon/recon-coverage-proof.json", "plan-build/pk/krav-approval.json"]) });
  eq("recon + krav nået → dømt; plan/build/slut ikke nået → intet check-run", d.filter((x) => x.naaet).map((x) => x.gate).join(","), "recon,krav");
  eq("ikke-nået gate har checkRun null (ingen emission — aldrig skipped=green)", d.find((x) => x.gate === "plan").checkRun, null);
  eq("nået + åben → success under v5/gate/<id>", d.find((x) => x.gate === "krav").checkRun.name === "v5/gate/krav" && d.find((x) => x.gate === "krav").checkRun.conclusion === "success", true);
  eq("pakke læses fra launch.json i den pinnede commit (<pakke> substitueret i nåetheds-stien)", d.find((x) => x.gate === "krav").fil, "plan-build/pk/krav-approval.json");
  eq("krav dømmes ved kandidat-resultatets pinned commit (b…), recon ved den pushede commit", d.find((x) => x.gate === "krav").pinned === "b".repeat(40) && d.find((x) => x.gate === "recon").pinned === SHA, true);
  eq("check-run-summary bærer pinned + pushed", /pinned bbbbbbbbbbbb · evidens @ pushed aaaaaaaaaaaa/.test(d.find((x) => x.gate === "krav").checkRun.output.summary), true); }
{ const calls = []; await D({ runners: mkRunners({ krav: (pinned, o) => { calls.push([pinned, o.evidenceRef]); return { open: true, gate_id: "krav", reasons: [] }; } }), exists: existsFor(["plan-build/pk/krav-approval.json"]) }); eq("runneren kaldes m. (pinned, {evidenceRef: pushed}) — verdikter/approval læses fra den pushede commit, artefaktet dømmes ved den pinnede", calls[0][0] === "b".repeat(40) && calls[0][1] === SHA, true); }
{ const d = await D({ runners: mkRunners(), exists: (p) => p === "plan-build/pk/krav-approval.json", readJson: () => { throw new Error("x"); } }); eq("approval findes men kandidat-resultatet mangler → failure m. grund (fail-closed)", d[1].checkRun.conclusion === "failure" && /findes ikke i den pushede commit/.test(d[1].result.reasons[0]), true); }
{ const d = await D({ runners: mkRunners(), exists: existsFor(["plan-build/pk/krav-approval.json"]), readJson: () => ({ commit_sha: "HEAD" }) }); eq("kandidat-resultat m. commit_sha der ikke er OID → failure", d[1].checkRun.conclusion === "failure" && /ikke en fuld OID/.test(d[1].result.reasons[0]), true); }
{ const d = await D({ runners: mkRunners(), exists: existsFor(["plan-build/pk/krav-approval.json"]), isAncestor: () => false }); eq("kandidat-resultatets commit er ikke forfader til den pushede → failure (fremmed historik)", d[1].checkRun.conclusion === "failure" && /ikke forfader/.test(d[1].result.reasons[0]), true); }
console.log("\nF-C4-1 — identitetsbinding pinned ↔ pushed:");
{ const calls = []; const d = await D({ runners: mkRunners(), exists: existsFor(["plan-build/pk/plan-approval.json"]), identitet: (gate, sha, pk) => { calls.push([gate, sha.slice(0, 1)]); return sha === SHA ? { pakke: pk, artifact: "9".repeat(40), bindings: { krav: "1".repeat(40), plan: "2".repeat(40) } } : { pakke: pk, artifact: "8".repeat(40), bindings: { krav: "1".repeat(40), plan: "2".repeat(40) } }; } });
  eq("plan.md ændret mellem dømt (pinned c…) og pushed → failure m. 'ÆNDRET siden den dømte commit' (Codex F-C4-1)", d[2].checkRun.conclusion === "failure" && /ÆNDRET siden den dømte commit/.test(d[2].result.reasons[0]) && /artefakt 888888888888 → 999999999999/.test(d[2].result.reasons[0]), true);
  eq("identiteten slås op ved BEGGE commits (pinned og pushed)", calls.some((c) => c[0] === "plan" && c[1] === "c") && calls.some((c) => c[0] === "plan" && c[1] === "a"), true); }
{ const d = await D({ runners: mkRunners(), exists: existsFor(["plan-build/pk/krav-approval.json"]), identitet: (gate, sha, pk) => ({ pakke: pk, artifact: "f".repeat(40), bindings: { recon: sha === SHA ? "3".repeat(40) : "4".repeat(40) } }) }); eq("en BINDING ændret (recon-blob) → failure m. hvilken binding", d[1].checkRun.conclusion === "failure" && /binding recon 444444444444 → 333333333333/.test(d[1].result.reasons[0]), true); }
{ const d = await D({ runners: mkRunners(), exists: existsFor(["plan-build/pk/krav-approval.json"]), identitet: (gate, sha, pk) => ({ pakke: sha === SHA ? "pk" : "other", artifact: "f".repeat(40), bindings: {} }) }); eq("launch.pakke ændret mellem pinned og pushed → failure (Codex' pakke-variant)", d[1].checkRun.conclusion === "failure" && /pakke other → pk/.test(d[1].result.reasons[0]), true); }
{ const d = await D({ runners: mkRunners(), exists: existsFor(["plan-build/pk/krav-approval.json"]), identitet: () => { throw new Error("binding findes ikke ved pushed"); } }); eq("identiteten kan ikke afgøres (binding mangler ved pushed) → failure (fail-closed)", d[1].checkRun.conclusion === "failure" && /identitet kan ikke afgøres/.test(d[1].result.reasons[0]), true); }
{ const d = await D({ runners: mkRunners(), exists: existsFor(["plan-build/pk/krav-approval.json", "plan-build/pk/plan-approval.json"]) }); eq("uændret indhold m. nyere evidens-commit (approval efter dommen) → krav success, plan lukket af runneren (ikke af identiteten)", d[1].checkRun.conclusion === "success" && d[2].checkRun.conclusion === "failure" && /approval mangler/.test(d[2].result.reasons[0]), true); }
{ const calls = []; await D({ runners: mkRunners(), exists: existsFor(["recon/recon-coverage-proof.json"]), identitet: (g) => { calls.push(g); return ID_SAMME(); } }); eq("recon (pinned == pushed) springer identitetsopslaget over", calls.length, 0); }
{ const d = await D({ runners: mkRunners(), exists: existsFor(["plan-build/pk/plan-approval.json"]) });
  eq("nået + lukket → failure m. grundene i summary", d[2].checkRun.conclusion === "failure" && /approval mangler/.test(d[2].checkRun.output.summary), true); }
{ const d = await D({ runners: mkRunners({ krav: () => { throw new Error("git eksploderede"); } }), exists: existsFor(["plan-build/pk/krav-approval.json"]) });
  eq("runner der kaster → failure (fail-closed), aldrig tavshed", d[1].checkRun.conclusion === "failure" && /kastede/.test(d[1].result.reasons[0]), true); }
{ const d = await D({ runners: mkRunners({ krav: () => ({ open: true, gate_id: "plan", reasons: [] }) }), exists: existsFor(["plan-build/pk/krav-approval.json"]) });
  eq("runner returnerer åbent resultat for en ANDEN gate → failure (mapperen afviser omdirigering)", d[1].checkRun.conclusion, "failure"); }
{ const d = await D({ runners: mkRunners({ krav: () => ({ open: true, gate_id: "krav", reasons: ["men…"] }) }), exists: existsFor(["plan-build/pk/krav-approval.json"]) });
  eq("open:true m. ikke-tomme reasons → failure (kernen: tvivl = rød)", d[1].checkRun.conclusion, "failure"); }
{ const d = await D({ runners: mkRunners(), exists: existsFor(["plan-build/pk/build-proof.json"]) });
  eq("build nået → DELEGERET til v5-build-dom (intet check-run herfra — én emitter pr. check-navn); ingen runner kaldt", d[3].naaet === true && d[3].checkRun === null && /v5-build-dom/.test(d[3].delegeret) && d[3].result === null, true); }
{ const d = await D({ runners: mkRunners(), exists: existsFor(["plan-build/pk/chain-proof.json"]) });
  eq("slut nået men udfør-side ikke bygget → failure m. grund (ikke succes, ikke tavs)", d[4].checkRun.conclusion === "failure" && /ikke bygget/.test(d[4].result.reasons[0]), true); }
{ let e = null; try { await doemGates({ commitSha: "HEAD", git: gitStub, runners: mkRunners(), exists: () => true }); } catch (x) { e = x.message; } eq("mutable ref (HEAD) som commit → kast", /pinned/.test(e ?? ""), true); }
{ let e = null; try { await doemGates({ commitSha: SHA, git: { bytes: () => { throw new Error("nope"); } }, runners: mkRunners(), exists: () => true }); } catch (x) { e = x.message; } eq("launch.json ulæselig → kast (ingen pakke = ingen dom)", /launch/.test(e ?? ""), true); }
{ let e = null; try { await D({ runners: mkRunners(), exists: () => true, gates: ["krav", "x"] }); } catch (x) { e = x.message; } eq("ukendt gate → kast", /ukendt gate/.test(e ?? ""), true); }

console.log("\nemitCheckRuns — binding og fail-closed:");
const domme = await D({ runners: mkRunners(), exists: existsFor(["recon/recon-coverage-proof.json", "plan-build/pk/krav-approval.json", "plan-build/pk/plan-approval.json"]) });
{ const calls = []; const fetchFn = async (url, init) => { calls.push({ url, body: JSON.parse(init.body), auth: init.headers.Authorization }); return { status: 201, json: async () => ({ id: calls.length }), text: async () => "" }; };
  const em = await emitCheckRuns({ repo: "Cphsales/stork-2.0", headSha: SHA, domme, token: "tok", fetchFn });
  eq("kun nåede gates emitteres (3 af 5)", em.length, 3);
  eq("payload: navn v5/gate/<id> · head_sha = commit · status completed · conclusion fra mapperen", calls.every((c) => c.body.head_sha === SHA && c.body.status === "completed" && /^v5\/gate\/(recon|krav|plan)$/.test(c.body.name)) && calls[2].body.conclusion === "failure", true);
  eq("URL og token bundet (repo i stien, Bearer-token)", calls[0].url === "https://api.github.com/repos/Cphsales/stork-2.0/check-runs" && calls[0].auth === "Bearer tok", true);
  eq("external_id binder gate + commit", calls[1].body.external_id, `v5:krav:${SHA.slice(0, 12)}`); }
{ let e = null; try { await emitCheckRuns({ repo: "Cphsales/stork-2.0", headSha: SHA, domme, token: "tok", fetchFn: async () => ({ status: 403, text: async () => "Resource not accessible" }) }); } catch (x) { e = x.message; } eq("HTTP 403 (mangler checks:write) → kast, aldrig stille", /HTTP 403/.test(e ?? ""), true); }
{ let e = null; try { await emitCheckRuns({ repo: "Cphsales/stork-2.0", headSha: SHA, domme, token: "", fetchFn: async () => ({ status: 201 }) }); } catch (x) { e = x.message; } eq("uden token → kast før nogen emission", /GITHUB_TOKEN mangler/.test(e ?? ""), true); }
{ let e = null; try { await emitCheckRuns({ repo: "ikke-et-repo", headSha: SHA, domme, token: "tok", fetchFn: async () => ({ status: 201 }) }); } catch (x) { e = x.message; } eq("ugyldigt repo-navn → kast", /owner\/navn/.test(e ?? ""), true); }
{ let e = null; try { await emitCheckRuns({ repo: "a/b", headSha: "abc", domme, token: "tok", fetchFn: async () => ({ status: 201 }) }); } catch (x) { e = x.message; } eq("ugyldig head_sha → kast", /headSha/.test(e ?? ""), true); }
{ const forfalsket = domme.map((d) => (d.gate === "krav" ? { ...d, checkRun: { ...d.checkRun, name: "v5/gate/plan" } } : d)); let e = null; try { await emitCheckRuns({ repo: "a/b", headSha: SHA, domme: forfalsket, token: "tok", fetchFn: async () => ({ status: 201, json: async () => ({}) }) }); } catch (x) { e = x.message; } eq("check-run-navn der ikke matcher gaten → kast (ingen omdirigering til et andet required check)", /omdirigere/.test(e ?? ""), true); }
{ const md = resume(domme, [{ name: "v5/gate/recon", conclusion: "success" }]); eq("resumé: ikke-nået gate står som »ikke grøn«, lukket gate lister grunde, emitteret markeres", /ikke nået = ikke grøn/.test(md) && /plan lukket/.test(md) && /\(emitteret\)/.test(md) && /IKKE emitteret/.test(md), true); }

console.log("");
if (fail > 0) { console.error(`ci-gate-dom: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`ci-gate-dom red-team: alle ${pass} cases passed`);
