// Selftest for worklog-check (S3) — drift-gate + pålidelig state-kilde.
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { validateWorklog, driftModKravDok, computeKravHash, planShaFindesIGit } from "./worklog-check.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const kravIndhold = "krav-dok indhold (fixture)";
const kravHash = computeKravHash(kravIndhold);
const planSha = "94c70eb5450ec5323dd4e25b5f213af070f23495";
const godWorklog = {
  schemaVersion: 1,
  packageId: "p1",
  kravHash,
  planSha,
  planRef: "claude/plan1-udkast",
  gateState: { kravOK: true, planOK: true, buildOK: false },
  gateRecord: {
    kravOK: { kravHash, af: "Mathias" },
    planOK: { planSha, af: "Mathias" },
  },
  scale: 9,
  artefaktRef: "branch @ sha",
};

// Positiv evne: korrekt worklog passerer.
ok("korrekt worklog passerer", validateWorklog(godWorklog, kravHash).ok);

// HÅRD planSha-eksistens (Codex-lukning): fabrikeret-men-format-gyldig SHA findes ikke → afvist.
const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot }).toString().trim();
ok("eksisterende commit (HEAD) findes i git", planShaFindesIGit(head, { cwd: repoRoot }));
ok(
  "fabrikeret SHA findes IKKE (hård afvisning, ingen planRef → ingen fetch)",
  !planShaFindesIGit("a".repeat(40), { cwd: repoRoot }),
);

// Kanariefugle:
ok(
  "hand-edited krav-hash → DRIFT",
  harFejl(validateWorklog({ ...godWorklog, kravHash: "lognet" }, kravHash), "DRIFT(kravHash)"),
);
ok(
  "manglende felt → FAIL",
  harFejl(validateWorklog({ ...godWorklog, planSha: undefined }, kravHash), "manglerFelt(planSha)"),
);
ok("ugyldig plan-SHA → FAIL", harFejl(validateWorklog({ ...godWorklog, planSha: "xyz!" }, kravHash), "ugyldigPlanSha"));
ok(
  "forkert schemaVersion → FAIL",
  harFejl(validateWorklog({ ...godWorklog, schemaVersion: 99 }, kravHash), "schemaVersionMismatch"),
);

// Gate-state-løgn (point 2 — drift fejler på løgn i gate-state, ikke kun krav-hash):
ok(
  "planOK uden kravOK → FAIL",
  harFejl(
    validateWorklog({ ...godWorklog, gateState: { kravOK: false, planOK: true, buildOK: false } }, kravHash),
    "gateStateLoegn(planOK uden kravOK)",
  ),
);
ok(
  "buildOK uden planOK → FAIL",
  harFejl(
    validateWorklog({ ...godWorklog, gateState: { kravOK: true, planOK: false, buildOK: true } }, kravHash),
    "gateStateLoegn(buildOK uden planOK)",
  ),
);
ok(
  "planOK uden planSha → FAIL",
  harFejl(
    validateWorklog(
      { ...godWorklog, planSha: undefined, gateState: { kravOK: true, planOK: true, buildOK: false } },
      kravHash,
    ),
    "gateStateLoegn(planOK uden planSha)",
  ),
);

// Eksplicit gate-record (Claude.ai-fund 2 — bogføring kan ikke mangle eller lyve):
ok(
  "kravOK gatet men gateRecord mangler → FAIL",
  harFejl(validateWorklog({ ...godWorklog, gateRecord: { planOK: { planSha, af: "Mathias" } } }, kravHash), "manglerGateRecord(kravOK)"),
);
ok(
  "gateRecord lyver om krav-hash → FAIL",
  harFejl(
    validateWorklog(
      { ...godWorklog, gateRecord: { ...godWorklog.gateRecord, kravOK: { kravHash: "LOEGN", af: "Mathias" } } },
      kravHash,
    ),
    "gateRecordLoegn(kravOK.kravHash)",
  ),
);
ok(
  "gateRecord lyver om plan-SHA → FAIL",
  harFejl(
    validateWorklog(
      { ...godWorklog, gateRecord: { ...godWorklog.gateRecord, planOK: { planSha: "deadbeef", af: "Mathias" } } },
      kravHash,
    ),
    "gateRecordLoegn(planOK.planSha)",
  ),
);

// Real-fil drift-gate: gen-beregner krav-hash fra fil.
const dir = mkdtempSync(join(tmpdir(), "wf-worklog-"));
try {
  const kravPath = join(dir, "krav.md");
  writeFileSync(kravPath, kravIndhold);
  ok("drift mod krav-dok: match passerer", driftModKravDok(godWorklog, kravPath).ok);
  writeFileSync(kravPath, kravIndhold + " ÆNDRET");
  ok("drift mod krav-dok: ændret kilde → DRIFT", harFejl(driftModKravDok(godWorklog, kravPath), "DRIFT(kravHash)"));
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (fejl) {
  console.error(`worklog-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("worklog-check selftest: alle checks passed");
