// S3 — worklog/ledger v1 + drift-gate. Gør worklog til en PÅLIDELIG state-kilde:
// det mekaniske felt (kravHash) verificeres mod krav-dokkets faktiske indhold — en
// hand-edit der lyver → DRIFT BLOKERET. (j)'s currentFromState læser herfra.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(here, "../../workflow/worklog.schema.json");
export const loadSchema = (path = SCHEMA_PATH) => JSON.parse(readFileSync(path, "utf8"));
export const computeKravHash = (indhold) => createHash("sha256").update(indhold).digest("hex");

// Hermetisk kerne: validér worklog mod skema + (valgfri) forventet krav-hash.
export function validateWorklog(worklog, expectedKravHash, schema = loadSchema()) {
  const fejl = [];
  if (worklog?.schemaVersion !== schema.schemaVersion) fejl.push("schemaVersionMismatch");
  for (const felt of schema.stabileFelter) {
    if (worklog?.[felt] === undefined) fejl.push(`manglerFelt(${felt})`);
  }
  if (worklog?.planSha && !new RegExp(schema.planShaFormat).test(worklog.planSha)) fejl.push("ugyldigPlanSha");
  if (expectedKravHash !== undefined && worklog?.kravHash !== expectedKravHash) fejl.push("DRIFT(kravHash)");
  // Gate-state-konsistens: en gate kan ikke være sand uden sin forudsætning (fanger gate-state-løgn).
  const g = worklog?.gateState ?? {};
  if (g.kravOK && !worklog?.kravHash) fejl.push("gateStateLoegn(kravOK uden kravHash)");
  if (g.planOK && !g.kravOK) fejl.push("gateStateLoegn(planOK uden kravOK)");
  if (g.planOK && !worklog?.planSha) fejl.push("gateStateLoegn(planOK uden planSha)");
  if (g.buildOK && !g.planOK) fejl.push("gateStateLoegn(buildOK uden planOK)");
  // Eksplicit gate-record (bogføring på main): en gatet worklog SKAL bære den, og den kan ikke
  // lyve om hvilken hash gaten blev givet på. Lukker Claude.ai-fund 2 uden at røre den hash-bundne
  // krav-body: gate-state-of-record lever her (S3-design), ikke i krav-dokkets status-linje.
  const gr = worklog?.gateRecord;
  if (g.kravOK && !gr?.kravOK) fejl.push("manglerGateRecord(kravOK)");
  if (gr?.kravOK && gr.kravOK.kravHash !== worklog?.kravHash) fejl.push("gateRecordLoegn(kravOK.kravHash)");
  if (g.planOK && !gr?.planOK) fejl.push("manglerGateRecord(planOK)");
  if (gr?.planOK && gr.planOK.planSha !== worklog?.planSha) fejl.push("gateRecordLoegn(planOK.planSha)");
  return { ok: fejl.length === 0, fejl };
}

// Real-kilde: planSha skal være et FAKTISK commit i git (HÅRD; ikke kun format).
// planSha er ofte cross-branch (plan-branchen) → ikke i en lavvandet CI-checkout. Derfor
// hentes den autoritative plan-ref FØRST hvis objektet mangler, og så verificeres hårdt.
// En fabrikeret-men-format-gyldig SHA findes heller ikke efter fetch → afvist.
export function planShaFindesIGit(planSha, { planRef, cwd } = {}) {
  const findes = () => {
    try {
      execFileSync("git", ["cat-file", "-e", `${planSha}^{commit}`], { cwd, stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  };
  if (findes()) return true;
  if (planRef) {
    try {
      execFileSync("git", ["fetch", "--quiet", "origin", planRef], { cwd, stdio: "ignore" });
    } catch {
      /* netværk/ref-fejl → falder igennem til hård fejl nedenfor */
    }
    return findes();
  }
  return false;
}

// Real-fil: gen-beregn krav-hash fra krav-dokket og drift-tjek worklog mod den.
export function driftModKravDok(worklog, kravDokPath, schema = loadSchema()) {
  const expected = computeKravHash(readFileSync(kravDokPath, "utf8"));
  return validateWorklog(worklog, expected, schema);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const worklogPath = process.argv[2] ?? resolve(here, "../../workflow/worklog.json");
  const kravDokPath =
    process.argv[3] ?? resolve(here, "../../docs/coordination/workflow-faerdiggoerelse-krav-og-data.md");
  const worklog = JSON.parse(readFileSync(worklogPath, "utf8"));
  const res = driftModKravDok(worklog, kravDokPath);
  // HÅRD planSha-eksistens: hent den autoritative plan-ref først hvis objektet mangler i checkout'en.
  // En fabrikeret-men-format-gyldig planSha findes heller ikke efter fetch → afvist (ingen warning-snyd).
  if (
    worklog?.planSha &&
    !planShaFindesIGit(worklog.planSha, { planRef: worklog.planRef, cwd: resolve(here, "../..") })
  )
    res.fejl.push(
      `planShaIkkeIGit(${worklog.planSha}) — heller ikke efter fetch af planRef=${worklog.planRef ?? "(mangler)"}`,
    );
  if (res.fejl.length) {
    console.error("WORKLOG DRIFT/AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("worklog OK (krav-hash drift + planSha findes i git (evt. via fetch af planRef) + gate-state)");
}
