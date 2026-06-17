// Selftest for handoff-check (regel-flade klausul j) — SHA-binding (krav 2/5/9).
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateBinding, kanalFor, currentFromState } from "./handoff-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const current = { planSha: "94c70eb", kravHash: "c964826" };

// Positiv evne: verdikt bundet til aktuel SHA + hash passerer.
ok("korrekt binding passerer", validateBinding({ planSha: "94c70eb", kravHash: "c964826" }, current).ok);
ok("aktør har defineret kanal", kanalFor("Claude.ai") !== null);

// Kanariefugle: stale/forkert/manglende binding SKAL afvises.
ok(
  "stale plan-SHA → FAIL",
  harFejl(validateBinding({ planSha: "570c9e6", kravHash: "c964826" }, current), "stale(planSha)"),
);
ok(
  "forkert krav-hash → FAIL",
  harFejl(validateBinding({ planSha: "94c70eb", kravHash: "DEADBEEF" }, current), "stale(kravHash)"),
);
ok("manglende krav-hash → FAIL", harFejl(validateBinding({ planSha: "94c70eb" }, current), "bindingMangler(kravHash)"));
ok("ukendt aktør har ingen kanal", kanalFor("Ukendt") === null);

// Generel mismatch (ikke kun "kendt gammel SHA"): en vilkårlig anden SHA afvises også.
ok(
  "vilkårlig SHA-mismatch → FAIL",
  harFejl(validateBinding({ planSha: "ZZZ99919", kravHash: "c964826" }, current), "stale(planSha)"),
);

// State-drevet: current hentes fra pakke-state (S3 worklog), ikke hardcodet.
const dir = mkdtempSync(join(tmpdir(), "wf-handoff-"));
try {
  writeFileSync(join(dir, "state.json"), JSON.stringify({ planSha: "abc123", kravHash: "def456" }));
  const fraState = currentFromState(join(dir, "state.json"));
  ok("currentFromState læser pakke-state", fraState.planSha === "abc123" && fraState.kravHash === "def456");
  ok("binding mod state passerer ved match", validateBinding({ planSha: "abc123", kravHash: "def456" }, fraState).ok);
  ok(
    "binding mod state afviser mismatch",
    harFejl(validateBinding({ planSha: "94c70eb", kravHash: "def456" }, fraState), "stale(planSha)"),
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (fejl) {
  console.error(`handoff-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("handoff-check selftest: alle checks passed");
