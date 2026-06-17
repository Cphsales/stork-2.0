// S3 — worklog/ledger v1 + drift-gate. Gør worklog til en PÅLIDELIG state-kilde:
// det mekaniske felt (kravHash) verificeres mod krav-dokkets faktiske indhold — en
// hand-edit der lyver → DRIFT BLOKERET. (j)'s currentFromState læser herfra.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
  if (worklog?.planSha && !new RegExp(schema.planShaFormat).test(worklog.planSha))
    fejl.push("ugyldigPlanSha");
  if (expectedKravHash !== undefined && worklog?.kravHash !== expectedKravHash)
    fejl.push("DRIFT(kravHash)");
  return { ok: fejl.length === 0, fejl };
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
  const res = driftModKravDok(JSON.parse(readFileSync(worklogPath, "utf8")), kravDokPath);
  if (!res.ok) {
    console.error("WORKLOG DRIFT/AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("worklog OK (drift-tjekket mod krav-dok)");
}
