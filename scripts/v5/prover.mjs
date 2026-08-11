#!/usr/bin/env node
// prover.mjs — v5's model-frie reel-kør-dommer (plan 2.C/2.D).
//
// Grøn KUN når de committede tests FAKTISK blev kørt, mod den committede
// checkout (ikke arbejdstræet), med >0 tests, uden skips og uden fejl.
// skipped/0-tests/failed/uparsbart = RØD. Dette er liveness-GULVET ("kørte de,
// og var de grønne uden at snyde med skips") — IKKE et dybde-bevis; om testene
// udøver den faktiske logik afgøres af build-proof's effect-harness +
// config-mutant-kill (KERNEN), ikke her.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const isNonNegInt = (n) => Number.isInteger(n) && n >= 0;

// judgeTestSummary(summary) — PURE dom over et struktureret test-resultat.
// Fail-closed: manglende/ikke-heltal/inkonsistent felt = rød.
export function judgeTestSummary(summary) {
  const reasons = [];
  const fail = (r) => reasons.push(r);

  if (summary === null || typeof summary !== "object" || Array.isArray(summary))
    return { ok: false, reasons: ["test-resumé mangler/er ikke et objekt"] };

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
// Arkiverer den COMMITTEDE træ-tilstand til en frisk temp-workdir og kører cmd
// DÉR — så et grønt arbejdstræ aldrig kan snige en ucommittet sandhed ind.
// cmd forventes at skrive et JSON-resumé {total,passed,failed,skipped} til
// resultRelPath (relativ til workdir). Returnerer {ok, reasons, summary}.
export function runProver({ repoRoot, commitSha, cmd, resultRelPath, git, env }) {
  if (typeof git !== "function" || typeof git.bytes !== "function")
    return { ok: false, reasons: ["git-dep mangler/ufuldstændig (fail-closed)"], summary: null };
  if (!Array.isArray(cmd) || cmd.length === 0 || !cmd.every((s) => typeof s === "string" && s.length > 0))
    return { ok: false, reasons: ["cmd skal være et ikke-tomt array af strenge"], summary: null };
  if (typeof resultRelPath !== "string" || resultRelPath.length === 0)
    return { ok: false, reasons: ["resultRelPath mangler"], summary: null };

  const work = mkdtempSync(join(tmpdir(), "v5-prover-"));
  try {
    // git archive <sha> | tar -x -C work  → nøjagtig den committede tilstand
    let tarball;
    try {
      tarball = git.bytes("archive", commitSha);
    } catch (e) {
      return {
        ok: false,
        reasons: [`kan ikke arkivere commit ${String(commitSha)}: ${e?.message ?? e}`],
        summary: null,
      };
    }
    execFileSync("tar", ["-x", "-C", work], { input: tarball, stdio: ["pipe", "ignore", "pipe"] });

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
      summary = JSON.parse(readFileSync(join(work, resultRelPath), "utf8"));
    } catch {
      return {
        ok: false,
        reasons: [`test-resumé kunne ikke læses/parses fra ${resultRelPath} (kørte testene reelt?)`],
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
    rmSync(work, { recursive: true, force: true });
  }
}

// makeProver(deps) → dom-form der kan plugges ind hvor en reel-kør kræves.
export const makeProver =
  ({ git }) =>
  (spec) =>
    runProver({ ...spec, git });
