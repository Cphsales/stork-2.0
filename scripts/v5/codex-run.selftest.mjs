#!/usr/bin/env node
// codex-run.selftest.mjs — indpakningen afviser forkerte kald, og kaldet bærer isolationen.
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SH = new URL("./codex-run.sh", import.meta.url).pathname;
const src = readFileSync(SH, "utf8");
let ok = 0, fail = 0;
const t = (navn, c) => { if (c) { ok++; console.log(`  ✓ ${navn}`); } else { fail++; console.log(`  ✗ ${navn}`); } };
const kald = (args, env = {}) => spawnSync("bash", [SH, ...args], { encoding: "utf8", env: { ...process.env, ...env } });

const d = mkdtempSync(join(tmpdir(), "codex-run-st-"));
const prompt = join(d, "p.md"); writeFileSync(prompt, "x");
t("forkert antal argumenter → exit 2", kald([]).status === 2);
t("ukendt aktivitet → afvist", kald(["codex-review", "angreb", d, "10", join(d, "o"), prompt]).status !== 0);
t("ugyldigt rollenavn → afvist", kald(["../x", "dom", d, "10", join(d, "o"), prompt]).status !== 0);
t("ukendt rolle (ingen rolletekst) → afvist", kald(["findes-ikke", "dom", d, "10", join(d, "o"), prompt]).status !== 0);
t("timeout 0 → afvist", kald(["codex-review", "dom", d, "0", join(d, "o"), prompt]).status !== 0);
t("dom kører kun-læse", /dom\) SANDBOX=read-only/.test(src));
t("netværk slået fra", src.includes("sandbox_workspace_write.network_access=false"));
t("privat Codex-hjem uden brugerens config", src.includes('CODEX_HOME="$RUNDIR/codex-home"') && !/config\.toml"/.test(src.replace(/#.*$/gm, "")));
t("miljøet er en allowlist (env -i)", src.includes("env -i PATH="));
t("stdin lukket", src.includes("< /dev/null"));
console.log(`\ncodex-run: ${ok} ok${fail ? `, ${fail} FEJL` : ""}`);
process.exit(fail ? 1 : 0);
