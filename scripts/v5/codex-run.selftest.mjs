#!/usr/bin/env node
// codex-run.selftest.mjs — mock-codex-selvtest af transporten (M-41 Trin A7 / Claude F-3).
// En falsk `codex` på PATH afprøver kontrakten uden netværk: stdin LUKKET · rc=0
// uden output = FEJL · timeout → PRÆCIS ét retry m. SAMME effort · rolle→model/
// effort/sandbox fra låsen · rolletekst-drift → BLOKER før kaldet · PID-fil.
// Kørte tidligere kun mod det rigtige P2-pas (54 min tabt 2026-09-08) — nu her.
import { spawnSync, execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, chmodSync, rmSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const WRAPPER = join(HERE, "codex-run.sh");
let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));

const T = mkdtempSync(join(tmpdir(), "v5-codex-run-"));
const BIN = join(T, "bin"); mkdirSync(BIN);
const FAKE_ARGV = join(T, "argv.txt");
// falsk codex: nægter at køre hvis stdin ikke er /dev/null (beviser lukket stdin)
writeFileSync(join(BIN, "codex"), `#!/usr/bin/env bash
if [ "\${1:-}" = "--version" ]; then echo "codex-cli FAKE"; exit 0; fi
printf '%s\\n' "$@" > "${FAKE_ARGV}"
[ "$(readlink /proc/self/fd/0)" = "/dev/null" ] || exit 99
out=""; prev=""; for a in "$@"; do [ "$prev" = "-o" ] && out="$a"; prev="$a"; done
case "\${FAKE_MODE:-ok}" in
  ok) echo "RESULTAT" > "$out"; exit 0 ;;
  tom) exit 0 ;;
  hang) sleep 30; echo "for sent" > "$out"; exit 0 ;;
  fejl) exit 7 ;;
esac
`);
chmodSync(join(BIN, "codex"), 0o755);
const realLock = JSON.parse(readFileSync(join(HERE, "actors.lock.json"), "utf8"));
const lockPath = join(T, "lock.json");
writeFileSync(lockPath, JSON.stringify(realLock));
const staleLock = structuredClone(realLock);
staleLock["codex-angreb"].skill_oid = "0000000000000000000000000000000000000000";
const staleLockPath = join(T, "stale.json"); writeFileSync(staleLockPath, JSON.stringify(staleLock));
const promptFil = join(T, "prompt.txt"); writeFileSync(promptFil, "sig OK");
const WORKDIR = mkdtempSync(join(T, "wd-"));

let n = 0;
function run(args, { mode = "ok", lock = lockPath, env = {} } = {}) {
  const fullArgs = args ?? ["codex-angreb", "dom", WORKDIR, "5", join(T, `out${++n}.md`), promptFil];
  const out = fullArgs[4]; // provenance/markører læses ALTID fra den output-sti wrapperen fik
  try { rmSync(FAKE_ARGV); } catch {}
  const r = spawnSync("bash", [WRAPPER, ...fullArgs], {
    encoding: "utf8",
    env: { ...process.env, PATH: `${BIN}:${process.env.PATH}`, FAKE_MODE: mode, STORK_V5_LOCK: lock, STORK_V5_REPO: ROOT, STORK_V5_SELFTEST: "1", ...env },
  });
  const prov = existsSync(out + ".provenance") ? readFileSync(out + ".provenance", "utf8") : "";
  const argv = existsSync(FAKE_ARGV) ? readFileSync(FAKE_ARGV, "utf8").split("\n") : null;
  return { r, out, prov, argv, done: existsSync(out + ".attempt1.done"), done2: existsSync(out + ".attempt2.done"), pid: existsSync(out + ".pid") };
}
const attempts = (prov) => (prov.match(/^attempt=\d+ rolle=/gm) ?? []).length;

console.log("codex-run.sh — kontrakt (mock-codex):");
{
  const x = run();
  eq("dom/ok → exit 0", x.r.status, 0);
  eq("output leveret", existsSync(x.out) && readFileSync(x.out, "utf8").trim(), "RESULTAT");
  eq(".attempt1.done sat", x.done, true);
  eq("PID-fil fjernet efter succes", x.pid, false);
  eq("stdin var /dev/null (fake ville ellers exite 99)", /rc=0/.test(x.prov), true);
  eq("rolle → model fra låsen", x.argv?.includes("gpt-6-astra"), true);
  eq("rolle → effort fra låsen (aldrig argument)", x.argv?.includes("model_reasoning_effort=xhigh"), true);
  eq("dom → sandbox read-only", x.argv?.[x.argv.indexOf("--sandbox") + 1], "read-only");
  eq("provenance bærer rolle/model/effort/sandbox", /rolle=codex-angreb model=gpt-6-astra effort=xhigh sandbox=read-only/.test(x.prov), true);
  eq("provenance bærer regel-commit + lock-blob + skill-oid", /regel_commit=[0-9a-f]{40} lock=\S+ lock_blob=[0-9a-f]{40} skill=scripts\/v5\/roller\/codex-angreb\.md@[0-9a-f]{12}/.test(x.prov), true);
  eq("provenance bærer codex-version + service_tier", /service_tier=default codex=codex-cli FAKE/.test(x.prov), true);
}
{
  const x = run(["recon-codex", "produktion", WORKDIR, "5", join(T, "p.md"), promptFil]);
  eq("produktion → sandbox workspace-write", x.argv?.[x.argv.indexOf("--sandbox") + 1], "workspace-write");
  eq("produktion/ok → exit 0", x.r.status, 0);
}
{
  const x = run(undefined, { mode: "tom" });
  eq("rc=0 uden output → exit 1 (fail-closed)", x.r.status, 1);
  eq("præcis 2 forsøg", attempts(x.prov), 2);
  eq("ingen .done ved tom output", x.done || x.done2, false);
  eq("begge forsøg SAMME effort (ingen tavs sænkning)", (x.prov.match(/effort=xhigh/g) ?? []).length >= 3, true);
  eq("TOM/MANGLENDE markeret i provenance", /TOM\/MANGLENDE output-fil/.test(x.prov), true);
}
{
  const out = join(T, "hang.md");
  const x = run(["codex-angreb", "dom", WORKDIR, "1", out, promptFil], { mode: "hang" });
  eq("timeout → exit 1", x.r.status, 1);
  eq("timeout → præcis ét genforsøg (2 forsøg)", attempts(x.prov), 2);
  eq("timeout-drab logget (rc=137)", (x.prov.match(/rc=137/g) ?? []).length, 2);
  eq("monotont ur logget", /varighed_mono_s=\d+/.test(x.prov), true);
  eq("PID-fil fjernet efter BLOKER", existsSync(out + ".pid"), false);
}
{
  const x = run(undefined, { mode: "fejl" });
  eq("codex rc≠0 → exit 1 efter 2 forsøg", x.r.status === 1 && attempts(x.prov) === 2, true);
}
console.log("\ncodex-run.sh — BLOKER FØR kaldet (rollen bestemmer kaldet · fabrik-frys):");
{
  const x = run(["findes-ikke", "dom", WORKDIR, "5", join(T, "u.md"), promptFil]);
  eq("ukendt rolle → exit 1", x.r.status, 1);
  eq("ukendt rolle → codex ALDRIG kaldt", x.argv, null);
  eq("ukendt rolle → BLOKER i provenance", /BLOKER: rolle 'findes-ikke' findes ikke/.test(x.prov), true);
}
{
  const x = run(["planner-code", "dom", WORKDIR, "5", join(T, "c.md"), promptFil]);
  eq("claude-rolle gennem codex-transport → BLOKER", x.r.status === 1 && /ikke en codex-rolle/.test(x.prov) && x.argv === null, true);
}
{
  const x = run(undefined, { lock: staleLockPath });
  eq("rolletekst-drift (lock ≠ HEAD) → BLOKER før kaldet", x.r.status === 1 && /rolletekst-drift/.test(x.prov) && x.argv === null, true);
}
{
  const x = run(["codex-angreb", "skriv", WORKDIR, "5", join(T, "a.md"), promptFil]);
  eq("ukendt aktivitet → BLOKER", x.r.status === 1 && /ukendt aktivitet/.test(x.prov), true);
}
{
  const x = run(["codex-angreb", "dom", WORKDIR, "5s", join(T, "t.md"), promptFil]);
  eq("ikke-numerisk timeout → BLOKER", x.r.status === 1 && /heltal-sekunder/.test(x.prov), true);
}
{
  const x = run(["codex-angreb", "dom", WORKDIR, "5", join(T, "m.md"), join(T, "mangler.txt")]);
  eq("manglende prompt-fil → BLOKER", x.r.status === 1 && /prompt-fil findes ikke/.test(x.prov), true);
}
{
  const r = spawnSync("bash", [WRAPPER, "a", "b"], { encoding: "utf8" });
  eq("forkert antal argumenter → exit 2", r.status, 2);
}
console.log("\ncodex-run.sh — override-guards (fabrik-frys må ikke kunne omgås via env):");
{
  const r = spawnSync("bash", [WRAPPER, "codex-angreb", "dom", WORKDIR, "5", join(T, "g1.md"), promptFil], {
    encoding: "utf8", env: { ...process.env, PATH: `${BIN}:${process.env.PATH}`, STORK_V5_LOCK: staleLockPath, STORK_V5_SELFTEST: "" },
  });
  const prov = existsSync(join(T, "g1.md.provenance")) ? readFileSync(join(T, "g1.md.provenance"), "utf8") : "";
  eq("STORK_V5_LOCK uden STORK_V5_SELFTEST=1 → BLOKER (ingen omgåelse af låsen)", r.status === 1 && /uden STORK_V5_SELFTEST=1/.test(prov) && !existsSync(FAKE_ARGV), true);
}
{
  const x = run();
  eq("under selftest markeres provenance lock=OVERRIDE(selftest)", /lock=OVERRIDE\(selftest\)/.test(x.prov), true);
  // verdikt-byg AFVISER en override-provenance som gate-evidens — tidligt, før git/draft
  const r = spawnSync("node", [join(HERE, "verdikt-byg.mjs"), join(T, "ingen.json"), "krav", "0".repeat(40), "x", x.out + ".provenance"], { encoding: "utf8" });
  eq("verdikt-byg afviser override-provenance (PROVENANCE-RØD, exit 1)", r.status === 1 && /PROVENANCE-RØD.*override/.test(r.stderr), true);
}
{
  const x = run(["findes-ikke", "dom", WORKDIR, "5", join(T, "g3.md"), promptFil]);
  const r = spawnSync("node", [join(HERE, "verdikt-byg.mjs"), join(T, "ingen.json"), "krav", "0".repeat(40), "x", x.out + ".provenance"], { encoding: "utf8" });
  eq("verdikt-byg afviser BLOKER-provenance (intet gyldigt resultat)", r.status === 1 && /PROVENANCE-RØD/.test(r.stderr), true);
}
// gammel v1-signatur (workdir model effort …) må IKKE stille accepteres
{
  const x = run([WORKDIR, "gpt-6-astra", "xhigh", "5", join(T, "v1.md"), promptFil]);
  eq("v1-signatur (model som argument) → BLOKER, aldrig kørt", x.r.status !== 0 && x.argv === null, true);
}

rmSync(T, { recursive: true, force: true });
console.log("");
if (fail > 0) { console.error(`codex-run: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`codex-run: ${pass} ok`);
