#!/usr/bin/env node
// prover.mjs — v5's model-frie reel-kør-dommer (plan 2.C/2.D).
//
// Grøn KUN når de committede tests FAKTISK blev kørt, mod den committede
// checkout (ikke arbejdstræet), med >0 tests, uden skips og uden fejl.
// skipped/0-tests/failed/uparsbart = RØD. Dette er liveness-GULVET ("kørte de,
// og var de grønne uden at snyde med skips") — IKKE et dybde-bevis; om testene
// udøver den faktiske logik afgøres af build-proof's effect-harness +
// config-mutant-kill (KERNEN), ikke her.
//
// ERKLÆRET GRÆNSE (ikke prøverens løfte): test-kommandoen kører vilkårlig
// committet kode, så host-isolation (symlink-escape, net, env, læsning uden
// for checkouten) er CI-SANDBOXENS ansvar (plan 2.E + DEL V), ikke proverens.
// Proveren garanterer: reel kør mod den FULDE committede tilstand (git
// worktree — ikke `git archive`, som filtrerer via export-ignore) + at et
// resultat afspejler en FRISK skrivning (committet stale-resultat slettes før
// kør) + fail-closed dom.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, isAbsolute, normalize } from "node:path";
import { isOid } from "./gates.mjs";

// SAFE integer: JSON.parse runder tal > 2^53-1 af → et usikkert 'passed' kunne
// falde sammen med 'total' og narre sum-checket. Kræv safe integers.
const isNonNegInt = (n) => Number.isSafeInteger(n) && n >= 0;
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// judgeTestSummary(summary) — PURE dom over et struktureret test-resultat.
// Fail-closed: manglende/arvet/ikke-heltal/inkonsistent felt = rød.
export function judgeTestSummary(summary) {
  const reasons = [];
  const fail = (r) => reasons.push(r);

  if (summary === null || typeof summary !== "object" || Array.isArray(summary))
    return { ok: false, reasons: ["test-resumé mangler/er ikke et objekt"] };

  // egne felter (ikke arvede): et resumé skal bære sine egne data.
  for (const k of ["total", "passed", "failed", "skipped"])
    if (!hasOwn(summary, k)) fail(`resumé mangler egent felt '${k}' (arvet/manglende = rød)`);
  if (reasons.length) return { ok: false, reasons };

  const { total, passed, failed, skipped } = summary;
  for (const [k, v] of [
    ["total", total],
    ["passed", passed],
    ["failed", failed],
    ["skipped", skipped],
  ])
    if (!isNonNegInt(v)) fail(`${k} er ikke et ikke-negativt heltal (${String(v)})`);
  if (reasons.length) return { ok: false, reasons };

  // konsistens: summen af udfald skal være totalen (ingen skjulte/tabte tests)
  if (passed + failed + skipped !== total)
    fail(`inkonsistent resumé: passed+failed+skipped (${passed + failed + skipped}) ≠ total (${total})`);
  if (total === 0) fail("0 tests kørt — ingen tests beviser intet (rød)");
  if (skipped > 0) fail(`${skipped} skipped — skipped ≠ grøn (historisk falsk-grøn-synd)`);
  if (failed > 0) fail(`${failed} fejlede`);
  if (passed === 0) fail("ingen beståede tests");

  return { ok: reasons.length === 0, reasons };
}

// runProver({repoRoot, commitSha, cmd, resultRelPath, git, env}) — reel kør.
// Checker den COMMITTEDE tilstand ud til en frisk temp-worktree og kører cmd
// DÉR — så et grønt arbejdstræ aldrig kan snige en ucommittet sandhed ind.
// git worktree (ikke `git archive`) bruges bevidst: archive filtrerer filer
// via `.gitattributes export-ignore`, så en committet fejlende test kunne
// mangle → falsk-grøn. worktree giver den FULDE committede tree.
// cmd forventes at skrive et JSON-resumé {total,passed,failed,skipped} til
// resultRelPath (relativ til worktree). Returnerer {ok, reasons, summary}.
export function runProver({ repoRoot, commitSha, cmd, resultRelPath, git, env }) {
  if (typeof git !== "function") return { ok: false, reasons: ["git-dep mangler (fail-closed)"], summary: null };
  if (typeof repoRoot !== "string" || repoRoot.length === 0)
    return { ok: false, reasons: ["repoRoot mangler"], summary: null };
  // pinned commit-OID kræves — dommen skal bindes til én commit, ikke 'HEAD'/
  // et branch-navn (som ændrer sig og gør reel-kør-resultatet ikke-deterministisk).
  if (!isOid(commitSha))
    return {
      ok: false,
      reasons: [`commitSha skal være en pinned commit-OID (fik '${String(commitSha)}')`],
      summary: null,
    };
  if (!Array.isArray(cmd) || cmd.length === 0 || !cmd.every((s) => typeof s === "string" && s.length > 0))
    return { ok: false, reasons: ["cmd skal være et ikke-tomt array af strenge"], summary: null };
  if (typeof resultRelPath !== "string" || resultRelPath.length === 0)
    return { ok: false, reasons: ["resultRelPath mangler"], summary: null };
  // resultRelPath må ikke escape worktree (intern config, men fail-closed).
  if (isAbsolute(resultRelPath) || normalize(resultRelPath).split(/[\\/]/).includes(".."))
    return { ok: false, reasons: ["resultRelPath skal være en relativ sti inde i worktree"], summary: null };

  // submodules: worktree tager ikke submodule-INDHOLD med → committet testflade
  // ville være ufuldstændig. Fail-closed frem for falsk-grøn.
  try {
    git("cat-file", "-e", `${commitSha}:.gitmodules`);
    return {
      ok: false,
      reasons: [".gitmodules findes — submodules understøttes ikke (ufuldstændig committet testflade, fail-closed)"],
      summary: null,
    };
  } catch {
    /* ingen submodules — forventet */
  }

  const parent = mkdtempSync(join(tmpdir(), "v5-prover-"));
  const work = join(parent, "wt"); // git worktree add opretter selv stien
  let added = false;
  try {
    try {
      execFileSync("git", ["-C", repoRoot, "worktree", "add", "--detach", "--force", work, commitSha], {
        stdio: ["ignore", "ignore", "pipe"],
      });
      added = true;
    } catch (e) {
      return {
        ok: false,
        reasons: [`kan ikke checke commit ${String(commitSha)} ud: ${e?.message ?? e}`],
        summary: null,
      };
    }

    // committet/stale resultat-fil må ALDRIG tælle: fjern den før kør, så kun
    // en frisk skrivning fra denne kør kan læses.
    const resultAbs = join(work, resultRelPath);
    rmSync(resultAbs, { force: true });

    const reasons = [];
    let cmdExit = 0;
    try {
      execFileSync(cmd[0], cmd.slice(1), {
        cwd: work,
        stdio: ["ignore", "ignore", "pipe"],
        env: { ...process.env, ...(env ?? {}) },
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch (e) {
      cmdExit = e?.status ?? 1;
    }

    let summary = null;
    try {
      summary = JSON.parse(readFileSync(resultAbs, "utf8"));
    } catch {
      return {
        ok: false,
        reasons: [
          `test-resumé kunne ikke læses/parses fra ${resultRelPath} (kørte testene reelt + skrev friskt resultat?)`,
        ],
        summary: null,
      };
    }

    const judged = judgeTestSummary(summary);
    if (!judged.ok) reasons.push(...judged.reasons);
    // exit-koden er en uafhængig liveness-kilde: en grøn opsummering med
    // ikke-nul exit (crash efter skrivning) er stadig rød.
    if (cmdExit !== 0) reasons.push(`test-kommando afsluttede med exit ${cmdExit}`);

    return { ok: reasons.length === 0, reasons, summary };
  } finally {
    if (added) {
      try {
        execFileSync("git", ["-C", repoRoot, "worktree", "remove", "--force", work], { stdio: "ignore" });
      } catch {
        /* remove kan fejle hvis worktree er dirty; prune + rmSync rydder op */
      }
    }
    rmSync(parent, { recursive: true, force: true });
    try {
      execFileSync("git", ["-C", repoRoot, "worktree", "prune"], { stdio: "ignore" });
    } catch {
      /* best-effort oprydning af worktree-metadata */
    }
  }
}

// makeProver(deps) → dom-form der kan plugges ind hvor en reel-kør kræves.
export const makeProver =
  ({ git }) =>
  (spec) =>
    runProver({ ...spec, git });
