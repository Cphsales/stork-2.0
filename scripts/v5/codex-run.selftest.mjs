#!/usr/bin/env node
// codex-run.selftest.mjs — mock-codex-selvtest af transporten v3 (M-41 Trin A7 · P2-pas 2026-09-09 F-1..F-9).
// En falsk `codex` på PATH afprøver kontrakten uden netværk. Hver case skal KUNNE fejle for
// det den påstår (F-9): argv gemmes PR. KALD, retry-effort kontrolleres på begge kald, PID-filen
// observeres MENS processen lever, det monotone ur skal måle (≥1 s ved hang), og de committede-lås-
// grene udøves uden lås-override (via STORK_V5_REPO til en temp-klon). Kvitteringen og
// verdikt-byg's binding af leverance-bytes testes ende-til-ende.
import { spawnSync, spawn, execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, chmodSync, rmSync, mkdirSync, symlinkSync, copyFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const WRAPPER = join(HERE, "codex-run.sh");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));

const T = mkdtempSync(join(tmpdir(), "v5-codex-run-"));
const BIN = join(T, "bin"); mkdirSync(BIN);
const CALLS = join(T, "calls"); mkdirSync(CALLS);
// falsk codex: nægter at køre hvis stdin ikke er /dev/null · gemmer argv PR. KALD · sidste arg = prompt
// falsk codex som NODE-script (den ægte codex-shim er `#!/usr/bin/env node` — runde-4-regression: wrapperen
// satte PATH=system-PATH og codex døde med rc=127 fordi node ikke fandtes): nægter at køre hvis stdin ikke er
// /dev/null · gemmer argv PR. KALD · sidste arg = prompt
writeFileSync(join(BIN, "codex"), `#!/usr/bin/env node
const fs = require("fs"); const path = require("path");
const args = process.argv.slice(2);
if (args[0] === "--version") { process.stdout.write("codex-cli FAKE\\n"); process.exit(0); }
const n = fs.readdirSync(${JSON.stringify(CALLS)}).length + 1;
fs.writeFileSync(path.join(${JSON.stringify(CALLS)}, "argv." + n), args.join("\\n") + "\\n");
let stdin = ""; try { stdin = fs.readlinkSync("/proc/self/fd/0"); } catch {}
if (stdin !== "/dev/null") process.exit(99);
let out = ""; for (let i = 0; i < args.length; i++) if (args[i] === "-o") out = args[i + 1];
const mode = process.env.FAKE_MODE || "ok";
if (mode === "ok") { fs.writeFileSync(out, "RESULTAT " + n + "\\n"); process.exit(0); }
if (mode === "tom") process.exit(0);
if (mode === "hang") { setTimeout(() => { fs.writeFileSync(out, "for sent\\n"); process.exit(0); }, 30000); }
else if (mode === "fejl") process.exit(7);
else if (mode === "symlink") { fs.symlinkSync("/etc/hostname", out); process.exit(0); }
else if (mode === "tomfil") { fs.writeFileSync(out, ""); process.exit(0); }
else if (mode === "mappe") { fs.mkdirSync(out, { recursive: true }); process.exit(0); }
`);
chmodSync(join(BIN, "codex"), 0o755);
const realLock = JSON.parse(readFileSync(join(HERE, "actors.lock.json"), "utf8"));
const lockPath = join(T, "lock.json"); writeFileSync(lockPath, JSON.stringify(realLock));
const staleLock = structuredClone(realLock); staleLock["codex-angreb"].skill_oid = "0".repeat(40);
const staleLockPath = join(T, "stale.json"); writeFileSync(staleLockPath, JSON.stringify(staleLock));
const promptFil = join(T, "prompt.txt"); writeFileSync(promptFil, "sig OK");
const WORKDIR = mkdtempSync(join(T, "wd-"));
const OUTDIR = mkdtempSync(join(T, "out-"));
const clearCalls = () => { for (const f of execFileSync("ls", [CALLS], { encoding: "utf8" }).split("\n").filter(Boolean)) rmSync(join(CALLS, f)); };
const calls = () => execFileSync("ls", [CALLS], { encoding: "utf8" }).split("\n").filter(Boolean).sort().map((f) => readFileSync(join(CALLS, f), "utf8").split("\n"));
const argOf = (argv, flag) => argv[argv.indexOf(flag) + 1];

let n = 0;
function run(args, { mode = "ok", lock = lockPath, env = {}, selftest = "1" } = {}) {
  const fullArgs = args ?? ["codex-angreb", "dom", WORKDIR, "5", join(OUTDIR, `out${++n}.md`), promptFil];
  const out = fullArgs[4];
  clearCalls();
  const e = { ...process.env, PATH: `${BIN}:${process.env.PATH}`, FAKE_MODE: mode, STORK_V5_SELFTEST: selftest, ...env };
  if (lock) e.STORK_V5_LOCK = lock; else delete e.STORK_V5_LOCK;
  const r = spawnSync("bash", [WRAPPER, ...fullArgs], { encoding: "utf8", env: e });
  // v4: en BLOKER FØR låsen rører ingen fælles fil (F-7) og står kun på stderr — prov = fil + stderr
  const provFil = existsSync(out + ".provenance") ? readFileSync(out + ".provenance", "utf8") : "";
  const prov = provFil + "\n" + (r.stderr ?? "");
  const receipt = existsSync(out + ".receipt.json") ? JSON.parse(readFileSync(out + ".receipt.json", "utf8")) : null;
  return { r, out, prov, provFil, receipt, calls: calls(), done: existsSync(out + ".attempt1.done"), done2: existsSync(out + ".attempt2.done"), pid: existsSync(out + ".pid") };
}

console.log("codex-run.sh v3 — kontrakt (mock-codex):");
{
  const x = run();
  eq("dom/ok → exit 0", x.r.status, 0);
  eq("leverance publiceret til OUT", existsSync(x.out) && readFileSync(x.out, "utf8").trim(), "RESULTAT 1");
  eq(".attempt1.done sat · PID-fil fjernet", x.done && !x.pid, true);
  eq("præcis ét codex-kald", x.calls.length, 1);
  eq("stdin var /dev/null (fake exiter ellers 99)", x.receipt?.attempts?.[0]?.rc, 0);
  eq("rolle → model fra låsen", argOf(x.calls[0], "-m"), "gpt-6-astra");
  eq("rolle → effort fra låsen", x.calls[0].includes("model_reasoning_effort=xhigh"), true);
  eq("dom → sandbox read-only", argOf(x.calls[0], "--sandbox"), "read-only");
  const prompt = x.calls[0].slice(x.calls[0].indexOf("-o") + 2).join("\n").replace(/\n$/, ""); // printf tilføjer én hale-newline
  eq("prompten STARTER med rolleteksten (F-5: rollen sendes faktisk)", prompt.startsWith("# Rolle: codex-angreb"), true);
  eq("prompten SLUTTER med opgaven", prompt.trim().endsWith("sig OK"), true);
  eq("kvittering: status success · lock_mode OVERRIDE(selftest) · schema v2 · selftest=true (F-11)", x.receipt?.status === "success" && x.receipt?.lock_mode === "OVERRIDE(selftest)" && x.receipt?.schema_version === 2 && x.receipt?.selftest === true, true);
  eq("forsøgs-output ligger IKKE i OUT-navnerummet (privat kørselsmappe, F-7)", existsSync(x.out + ".attempt1.out"), false);
  eq("privat kørselsmappe ryddet efter kørsel", execFileSync("ls", ["-a", OUTDIR], { encoding: "utf8" }).split("\n").some((f) => f.startsWith(".run-")), false);
  eq("kvittering: model/effort/sandbox/rolle", [x.receipt?.model, x.receipt?.effort, x.receipt?.sandbox, x.receipt?.rolle].join("|"), "gpt-6-astra|xhigh|read-only|codex-angreb");
  eq("kvittering: regel_commit + skill_oid + prompt_sha256 er OID/sha", /^[0-9a-f]{40}$/.test(x.receipt?.regel_commit) && /^[0-9a-f]{40}$/.test(x.receipt?.skill_oid) && /^[0-9a-f]{64}$/.test(x.receipt?.prompt_sha256), true);
  eq("kvittering: prompt_sha256 == sha256(faktisk sendt prompt)", x.receipt?.prompt_sha256, sha256(prompt));
  eq("kvittering: leverance-sha == sha256(OUT-bytes)", x.receipt?.attempts?.[0]?.output_sha256, sha256(readFileSync(x.out)));
  eq("kvittering: binaries m. realpath+sha256 for codex/git/node/timeout", ["codex", "git", "node", "timeout"].every((b) => /^\//.test(x.receipt?.binaries?.[b]?.path) && /^[0-9a-f]{64}$/.test(x.receipt?.binaries?.[b]?.sha256)), true);
  eq("kvittering: codex-binær = den falske (realpath under selftest-bin)", x.receipt?.binaries?.codex?.path, join(BIN, "codex"));
}
{
  const x = run(["recon-codex", "produktion", WORKDIR, "5", join(OUTDIR, "p.md"), promptFil]);
  eq("produktion → sandbox workspace-write · exit 0", argOf(x.calls[0], "--sandbox") === "workspace-write" && x.r.status === 0, true);
}
{
  const x = run(undefined, { mode: "tom" });
  eq("rc=0 uden output → exit 1 · 2 forsøg · ingen .done", x.r.status === 1 && x.calls.length === 2 && !x.done && !x.done2, true);
  eq("retry: BEGGE kald bar effort=xhigh (argv, ikke log)", x.calls.every((c) => c.includes("model_reasoning_effort=xhigh")), true);
  eq("retry: BEGGE kald bar samme model + sandbox", x.calls.every((c) => argOf(c, "-m") === "gpt-6-astra" && argOf(c, "--sandbox") === "read-only"), true);
  eq("kvittering: status fejl · 2 forsøg · sidste output_sha256 null", x.receipt?.status === "fejl" && x.receipt?.attempts?.length === 2 && x.receipt.attempts[1].output_sha256 === null, true);
}
{
  const x = run(undefined, { mode: "tomfil" });
  eq("tom EKSISTERENDE fil som leverance → afvist (-s alene)", x.r.status === 1 && !x.done && !existsSync(x.out), true);
  const y = run(undefined, { mode: "mappe" });
  eq("mappe som leverance → afvist (-f alene)", y.r.status === 1 && !y.done && !existsSync(y.out), true);
}
{
  // eksisterende men FORKERT rolleblob i låsen (recon-codex' tekst under codex-angreb) → frys-BLOKER (ikke git-show-fejl)
  const wrong = structuredClone(realLock); wrong["codex-angreb"].skill_oid = realLock["recon-codex"].skill_oid;
  const wp = join(T, "wrong.json"); writeFileSync(wp, JSON.stringify(wrong));
  const x = run(undefined, { lock: wp });
  eq("eksisterende forkert rolleblob i låsen → rolletekst-drift BLOKER (mutant c: frys-check)", x.r.status === 1 && /rolletekst-drift/.test(x.prov) && x.calls.length === 0, true);
}
{
  // anden model/effort i låsen SKAL nå argv (mutant g: hardkodede værdier)
  const alt = structuredClone(realLock); alt["codex-angreb"].model = "gpt-alt-model"; alt["codex-angreb"].reasoning = "medium";
  const ap = join(T, "alt.json"); writeFileSync(ap, JSON.stringify(alt));
  const x = run(undefined, { lock: ap });
  eq("lås m. anden model/effort → argv bærer PRÆCIS dem (ingen hardkodning)", x.r.status === 0 && argOf(x.calls[0], "-m") === "gpt-alt-model" && x.calls[0].includes("model_reasoning_effort=medium") && x.receipt?.model === "gpt-alt-model" && x.receipt?.effort === "medium", true);
}
{
  const x = run(undefined, { mode: "symlink" });
  eq("symlink som leverance → afvist (ikke almindelig fil)", x.r.status === 1 && !x.done && !existsSync(x.out), true);
}
{
  const x = run(undefined, { mode: "fejl" });
  eq("codex rc≠0 → exit 1 efter 2 forsøg (rc=7 begge)", x.r.status === 1 && x.receipt?.attempts?.map((a) => a.rc).join(",") === "7,7", true);
}
// hang: timeout → KILL, PID-fil observeres MENS processen lever (F-9)
await (async () => {
  const out = join(OUTDIR, "hang.md"); clearCalls();
  const e = { ...process.env, PATH: `${BIN}:${process.env.PATH}`, FAKE_MODE: "hang", STORK_V5_SELFTEST: "1", STORK_V5_LOCK: lockPath };
  const child = spawn("bash", [WRAPPER, "codex-angreb", "dom", WORKDIR, "1", out, promptFil], { env: e, stdio: "ignore" });
  let sawPid = false, pidAlive = false;
  for (let i = 0; i < 40 && !sawPid; i++) { await new Promise((r) => setTimeout(r, 50)); if (existsSync(out + ".pid")) { sawPid = true; try { process.kill(Number(readFileSync(out + ".pid", "utf8")), 0); pidAlive = true; } catch {} } }
  const status = await new Promise((r) => child.on("exit", r));
  const receipt = JSON.parse(readFileSync(out + ".receipt.json", "utf8"));
  eq("hang: PID-fil fandtes MENS kørslen levede og pegede på levende proces", sawPid && pidAlive, true);
  eq("hang: timeout → exit 1 · præcis ét genforsøg", status === 1 && receipt.attempts.length === 2, true);
  eq("hang: begge forsøg dræbt (rc=137)", receipt.attempts.map((a) => a.rc).join(","), "137,137");
  eq("hang: monotont ur MÅLER (≥1 s pr. forsøg)", receipt.attempts.every((a) => a.varighed_mono_s >= 1), true);
  eq("hang: PID-fil fjernet efter BLOKER", existsSync(out + ".pid"), false);
})();

console.log("\ncodex-run.sh v3 — BLOKER FØR kaldet (rollen bestemmer kaldet · fabrik-frys):");
{
  const x = run(["findes-ikke", "dom", WORKDIR, "5", join(OUTDIR, "u.md"), promptFil]);
  eq("ukendt rolle → exit 1 · codex ALDRIG kaldt · kvittering blokeret", x.r.status === 1 && x.calls.length === 0 && x.receipt?.status === "blokeret" && /findes ikke/.test(x.receipt?.reason), true);
}
{
  const x = run(["planner-code", "dom", WORKDIR, "5", join(OUTDIR, "c.md"), promptFil]);
  eq("claude-rolle gennem codex-transport → BLOKER", x.r.status === 1 && /ikke en codex-rolle/.test(x.prov) && x.calls.length === 0, true);
}
{
  const x = run(undefined, { lock: staleLockPath });
  eq("rolletekst-drift (lock ≠ pinned commit) → BLOKER før kaldet", x.r.status === 1 && /rolletekst-drift/.test(x.prov) && x.calls.length === 0, true);
}
{
  const x = run(["codex-angreb", "skriv", WORKDIR, "5", join(OUTDIR, "a.md"), promptFil]);
  eq("ukendt aktivitet → BLOKER", x.r.status === 1 && /ukendt aktivitet/.test(x.prov), true);
  eq("BLOKER før låsen rører INGEN fælles fil (ingen provenance/kvittering, F-7)", x.provFil === "" && x.receipt === null, true);
}
{
  const x = run(["codex-angreb", "dom", WORKDIR, "0", join(OUTDIR, "t0.md"), promptFil]);
  eq("timeout 0 (= ingen grænse) → BLOKER", x.r.status === 1 && /≥ 1 s/.test(x.prov), true);
  const y = run(["codex-angreb", "dom", WORKDIR, "5s", join(OUTDIR, "t.md"), promptFil]);
  eq("ikke-numerisk timeout → BLOKER", y.r.status === 1 && /heltal-sekunder/.test(y.prov), true);
}
{
  const d = join(OUTDIR, "er-mappe.md"); mkdirSync(d);
  const x = run(["codex-angreb", "dom", WORKDIR, "5", d, promptFil]);
  eq("OUT er en mappe → BLOKER før kaldet (F-12)", x.r.status === 1 && /MAPPE/.test(x.prov) && x.calls.length === 0, true);
}
{
  const x = run(undefined, { env: { STORK_V5_GATE_INPUT: `krav:${"a".repeat(40)}:docs/sandhed/krav/x-krav.md` } });
  eq("gate_input bindes i kvitteringen (F-10)", x.receipt?.gate_input?.gate_id === "krav" && x.receipt?.gate_input?.gated_commit === "a".repeat(40) && x.receipt?.gate_input?.artifact_path === "docs/sandhed/krav/x-krav.md", true);
  const y = run(["recon-codex", "produktion", WORKDIR, "5", join(OUTDIR, "gp.md"), promptFil], { env: { STORK_V5_GATE_INPUT: `krav:${"a".repeat(40)}:x.md` } });
  eq("gate_input + produktion → BLOKER (en gate-dom kommer aldrig fra en produktions-kørsel)", y.r.status === 1 && /kræver aktivitet=dom/.test(y.prov), true);
  const z = run(undefined, { env: { STORK_V5_GATE_INPUT: "krav:kort:x.md" } });
  eq("gate_input m. ugyldig commit → BLOKER", z.r.status === 1 && /40-hex/.test(z.prov), true);
}
{
  const x = run(["codex-angreb", "dom", WORKDIR, "5", join(WORKDIR, "inde.md"), promptFil]);
  eq("OUT inde i workdir → BLOKER (aktøren kunne skrive den, F-7)", x.r.status === 1 && /må IKKE ligge i workdir/.test(x.prov) && x.calls.length === 0, true);
}
{
  const x = run(["codex-angreb", "dom", WORKDIR, "5", join(OUTDIR, "m.md"), join(T, "mangler.txt")]);
  eq("manglende prompt-fil → BLOKER", x.r.status === 1 && /prompt-fil findes ikke/.test(x.prov), true);
}
{
  // prompt-fil der hedder '--help' (F-5: `cat --`) — skal læses som fil, ikke som option
  const hd = mkdtempSync(join(T, "help-")); writeFileSync(join(hd, "--help"), "opgave fra fil kaldet --help");
  const x = run(["codex-angreb", "dom", WORKDIR, "5", join(OUTDIR, "h.md"), join(hd, "--help")]);
  const prompt = x.calls[0]?.slice(x.calls[0].indexOf("-o") + 2).join("\n") ?? "";
  eq("prompt-fil kaldet '--help' læses som fil (ikke cat --help)", x.r.status === 0 && prompt.trim().endsWith("opgave fra fil kaldet --help"), true);
}
{
  const r = spawnSync("bash", [WRAPPER, "a", "b"], { encoding: "utf8" });
  eq("forkert antal argumenter → exit 2", r.status, 2);
  const x = run([WORKDIR, "gpt-6-astra", "xhigh", "5", join(OUTDIR, "v1.md"), promptFil]);
  eq("v1-signatur (model som argument) → BLOKER, aldrig kørt", x.r.status !== 0 && x.calls.length === 0, true);
}

{
  // T-F3: falsk `cat` på kalderens PATH må IKKE kunne bytte rolleteksten efter hash-kontrollen (system-PATH for værktøjer)
  const FAKEBIN2 = join(T, "bin2"); mkdirSync(FAKEBIN2);
  writeFileSync(join(FAKEBIN2, "cat"), "#!/usr/bin/env bash\necho 'INJICERET ROLLETEKST'\n"); chmodSync(join(FAKEBIN2, "cat"), 0o755);
  const x = run(undefined, { env: { PATH: `${FAKEBIN2}:${BIN}:${process.env.PATH}` } });
  const prompt = x.calls[0]?.slice(x.calls[0].indexOf("-o") + 2).join("\n") ?? "";
  eq("falsk `cat` på kalderens PATH ignoreres — rolleteksten er den ægte (T-F3)", x.r.status === 0 && prompt.startsWith("# Rolle: codex-angreb") && !prompt.includes("INJICERET"), true);
}
{
  // T-F7: OUT må ikke bruge et reserveret suffix (fx en anden kørsels låsefil)
  for (const navn of ["a.lock", "b.receipt.json", "c.provenance", "d.pid", "e.log", "f.attempt1.out", ".run-x"]) {
    const x = run(["codex-angreb", "dom", WORKDIR, "5", join(OUTDIR, navn), promptFil]);
    eq(`OUT='${navn}' (reserveret navnerum) → BLOKER før kaldet (T-F7)`, x.r.status === 1 && /reserveret/.test(x.prov) && x.calls.length === 0, true);
  }
}

console.log("\ncodex-run.sh v3 — guards uden override (committed-lås-grenen udøves, F-9):");
// temp-KLON af repoet (STORK_V5_REPO under selftest holder lock_mode=committed) — arbejdstræets lås ændres → BLOKER
{
  const CLONE = join(T, "klon"); execFileSync("git", ["clone", "-q", "--no-hardlinks", ROOT, CLONE]);
  const CLONE_HEAD0 = execFileSync("git", ["-C", CLONE, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  copyFileSync(WRAPPER, join(CLONE, "scripts/v5/codex-run.sh")); // klonen skal køre DENNE wrapper-version (arbejdstræ), ikke HEAD's
  const x = run(undefined, { lock: null, env: { STORK_V5_REPO: CLONE } });
  eq("committed lås (klon, ingen override) → kører · kvittering lock_mode=committed", x.r.status === 0 && x.receipt?.lock_mode === "committed", true);
  eq("… men kvittering.selftest=true — STORK_V5_REPO er en selvtest-lempelse (F-11)", x.receipt?.selftest, true);
  {
    // F-17: binaries.lock-pinnen NÅS (FORCE_BINCHECK) — klonens lås matcher ikke den falske codex → BLOKER; matcher → kører
    const w = run(undefined, { lock: null, env: { STORK_V5_REPO: CLONE, STORK_V5_SELFTEST_FORCE_BINCHECK: "1" } });
    eq("binaries.lock-pin ≠ faktisk codex-entry → BLOKER (F-3 nået, ikke kun læst)", w.r.status === 1 && /binaries\.lock/.test(w.prov) && w.calls.length === 0, true);
    const fakeSha = sha256(readFileSync(join(BIN, "codex")));
    const bl = JSON.parse(readFileSync(join(CLONE, "scripts/v5/binaries.lock.json"), "utf8")); bl.codex.sha256 = fakeSha;
    writeFileSync(join(CLONE, "scripts/v5/binaries.lock.json"), JSON.stringify(bl, null, 1) + "\n");
    execFileSync("git", ["-C", CLONE, "-c", "user.name=t", "-c", "user.email=t@l", "commit", "-qam", "pin falsk codex"]);
    const w2 = run(undefined, { lock: null, env: { STORK_V5_REPO: CLONE, STORK_V5_SELFTEST_FORCE_BINCHECK: "1" } });
    eq("binaries.lock-pin == codex-entry → kører", w2.r.status, 0);
  }
  {
    // F-13: `git replace` af rolleblobben i klonen må IKKE ændre den tekst der sendes (--no-replace-objects + hash-verifikation)
    const skill = realLock["codex-angreb"].skill_oid; const anden = realLock["recon-codex"].skill_oid;
    execFileSync("git", ["-C", CLONE, "replace", skill, anden]);
    const z = run(undefined, { lock: null, env: { STORK_V5_REPO: CLONE } });
    const prompt = z.calls[0]?.slice(z.calls[0].indexOf("-o") + 2).join("\n") ?? "";
    eq("git replace på rolleblobben ignoreres — original rolletekst sendes, kørslen grøn (F-13)", z.r.status === 0 && prompt.startsWith("# Rolle: codex-angreb"), true);
    execFileSync("git", ["-C", CLONE, "replace", "-d", skill]);
  }
  eq("kvittering: regel_commit = klonens HEAD (ved kørslen)", x.receipt?.regel_commit, CLONE_HEAD0);
  writeFileSync(join(CLONE, "scripts/v5/actors.lock.json"), JSON.stringify(realLock) + "\n// ændret lokalt\n");
  const y = run(undefined, { lock: null, env: { STORK_V5_REPO: CLONE } });
  eq("arbejdstræets lås ≠ pinned commit → BLOKER (fabrik-frys uden override)", y.r.status === 1 && /≠ pinned/.test(y.prov) && y.calls.length === 0, true);
  execFileSync("git", ["-C", CLONE, "checkout", "-q", "--", "scripts/v5/actors.lock.json"]);
  // symlink til wrapperen fra et fremmed sted → realpath → stadig DET RIGTIGE repo (F-4)
  const FREMMED = mkdtempSync(join(T, "fremmed-")); mkdirSync(join(FREMMED, "scripts/v5"), { recursive: true });
  symlinkSync(join(CLONE, "scripts/v5/codex-run.sh"), join(FREMMED, "scripts/v5/codex-run.sh"));
  clearCalls();
  const r = spawnSync("bash", [join(FREMMED, "scripts/v5/codex-run.sh"), "codex-angreb", "dom", WORKDIR, "5", join(OUTDIR, "sym.md"), promptFil], { encoding: "utf8", env: { ...process.env, PATH: `${BIN}:${process.env.PATH}`, STORK_V5_SELFTEST: "1" } });
  const rec = JSON.parse(readFileSync(join(OUTDIR, "sym.md.receipt.json"), "utf8"));
  eq("symlink til wrapperen → frys mod wrapperens RIGTIGE repo (realpath), ikke symlinkets", r.status === 0 && rec.regel_commit === execFileSync("git", ["-C", CLONE, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(), true);
  // GIT_DIR i miljøet må ikke flytte opslag (F-4)
  clearCalls();
  const g = spawnSync("bash", [join(CLONE, "scripts/v5/codex-run.sh"), "codex-angreb", "dom", WORKDIR, "5", join(OUTDIR, "gitdir.md"), promptFil], { encoding: "utf8", env: { ...process.env, PATH: `${BIN}:${process.env.PATH}`, STORK_V5_SELFTEST: "1", GIT_DIR: join(T, "ingen.git") } });
  eq("GIT_DIR i miljøet ignoreres (renses før første git-kald)", g.status, 0);
}
{
  // uden STORK_V5_SELFTEST: falsk codex på PATH (uden for pinnet prefix) → BLOKER (F-3)
  const x = run(undefined, { lock: null, selftest: "" });
  eq("PATH-injiceret codex uden for pinnet prefix + ingen selftest → BLOKER", x.r.status === 1 && /uden for pinnet prefix/.test(x.prov) && x.calls.length === 0, true);
  const y = run(undefined, { selftest: "" });
  eq("STORK_V5_LOCK uden STORK_V5_SELFTEST=1 → BLOKER", y.r.status === 1 && /uden STORK_V5_SELFTEST=1|pinnet prefix/.test(y.prov) && y.calls.length === 0, true);
}
{
  // gammel .done fra en tidligere kørsel må ikke overleve en BLOKER (F-6)
  const out = join(OUTDIR, "stale.md"); writeFileSync(out + ".attempt1.done", ""); writeFileSync(out, "gammel leverance");
  const x = run(["findes-ikke", "dom", WORKDIR, "5", out, promptFil]);
  eq("gammel .done ryddes FØR validering — BLOKER efterlader ingen grøn markør", x.r.status === 1 && !existsSync(out + ".attempt1.done") && !existsSync(out + ".receipt.json.tmp"), true);
}

console.log("\nverdikt-byg.mjs — kvitterings-binding v4 (F-1/F-2/F-10/F-11):");
const VB = join(HERE, "verdikt-byg.mjs");
const GATED = execFileSync("git", ["-C", ROOT, "rev-parse", "efc85d5"], { encoding: "utf8" }).trim();
const HEADC = execFileSync("git", ["-C", ROOT, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const ART = "docs/sandhed/krav/lokations-skabelon-krav.md";
const draftObj = { aktor: "codex", conclusion: "PASS", negative_cases: ["n1"], evidence: [{ path: ART, line_span: [3, 3] }] };
const levTekst = (d) => `# Analyse\n\nTekst.\n\nVERDIKT-DRAFT: ${Buffer.from(JSON.stringify(d)).toString("base64")}\n`;
const b64 = (d) => Buffer.from(JSON.stringify(d)).toString("base64");
const mkReceipt = (lev, over = {}) => ({ schema_version: 2, status: "success", run_id: "run-x", rolle: "codex-angreb", aktivitet: "dom", model: "gpt-6-astra", effort: "xhigh", sandbox: "read-only",
  regel_commit: HEADC, lock_mode: "committed", lock_blob: "0".repeat(40), skill_path: "scripts/v5/roller/codex-angreb.md", skill_oid: realLock["codex-angreb"].skill_oid, prompt_sha256: "0".repeat(64),
  gate_input: { gate_id: "krav", gated_commit: GATED, artifact_path: ART }, selftest: false, attempts: [{ attempt: 1, rc: 0, model: "gpt-6-astra", effort: "xhigh", sandbox: "read-only", output_sha256: sha256(lev), output_bytes: Buffer.byteLength(lev) }], ...over });
const vb = (draftArg, receipt, lev) => {
  const rp = join(T, `rec${++n}.json`); writeFileSync(rp, JSON.stringify(receipt));
  const lp = join(T, `lev${n}.md`); writeFileSync(lp, lev);
  let dp = "-"; if (draftArg !== "-") { dp = join(T, `draft${n}.json`); writeFileSync(dp, JSON.stringify(draftArg)); }
  return spawnSync("node", [VB, dp, "krav", GATED, ART, rp, lp], { encoding: "utf8", cwd: ROOT });
};
{
  const lev = levTekst(draftObj);
  const r = vb("-", mkReceipt(lev), lev);
  eq("gyldig v4-kvittering + leverance m. verdikt-draft-blok → verdikt bygget (exit 0)", r.status, 0);
  const v = r.status === 0 ? JSON.parse(r.stdout) : {};
  eq("verdikt.run: run_attempt=1 · effort=xhigh · run_id · receipt_sha256 · raw_output_sha256 = sha256(leverance)", v.run?.run_attempt === 1 && v.run?.effort === "xhigh" && v.run?.run_id === "run-x" && /^[0-9a-f]{64}$/.test(v.run?.receipt_sha256 ?? "") && v.run?.raw_output_sha256 === sha256(lev), true);
  const r2 = vb(draftObj, mkReceipt(lev), lev);
  eq("separat draft identisk m. blokken → ok", r2.status, 0);
  const r3 = vb({ ...draftObj, conclusion: "FAIL" }, mkReceipt(lev), lev);
  eq("separat draft ≠ blokken (dom forsøgt byttet) → PROVENANCE-RØD (F-10)", r3.status === 1 && /byttet/.test(r3.stderr), true);
  const r4 = vb("-", mkReceipt(lev), "# Analyse uden marker\n");
  eq("leverance uden VERDIKT-DRAFT-linje → RØD (hash matcher ikke først; ellers marker-krav)", r4.status, 1);
  const lev2 = "Eksempel:\n```\nVERDIKT-DRAFT: " + b64(draftObj) + "\n```\n" + levTekst(draftObj);
  const r5 = vb("-", mkReceipt(lev2), lev2);
  eq("to VERDIKT-DRAFT-linjer (citeret + ægte) → RØD", r5.status === 1 && /PRÆCIS én linje/.test(r5.stderr), true);
  const lev3 = "Dom: FAIL\n\nEksempel:\n```\nVERDIKT-DRAFT: " + b64(draftObj) + "\n```\n";
  const r5b = vb("-", mkReceipt(lev3), lev3);
  eq("kun et citeret eksempel, ikke sidste ikke-tomme linje → RØD", r5b.status === 1 && /SIDSTE ikke-tomme linje/.test(r5b.stderr), true);
  const lev4 = "Dom: FAIL\n\n- ```\n  ```\n```\n```json verdikt-draft\n{}\n```\n" + "VERDIKT-DRAFT: " + b64(draftObj) + "\n";
  const r5c = vb("-", mkReceipt(lev4), lev4);
  eq("Markdown-containere/fences i leverancen er irrelevante — kun marker-linjen tæller → OK", r5c.status, 0);
  const lev5 = "x\nVERDIKT-DRAFT: " + b64(draftObj).replace(/=+$/, "") + "\n";
  const r5d = vb("-", mkReceipt(lev5), lev5);
  eq("ikke-kanonisk base64 → RØD", r5d.status === 1 && /kanonisk/.test(r5d.stderr), true);
  const treeOid = execFileSync("git", ["-C", ROOT, "rev-parse", "HEAD^{tree}"], { encoding: "utf8" }).trim();
  const rTree = vb("-", mkReceipt(lev, { regel_commit: treeOid }), lev);
  eq("kvittering m. regel_commit = tree-OID → RØD (F-18: git-type commit)", rTree.status === 1 && /ikke en commit/.test(rTree.stderr), true);
  const rHead = vb("-", mkReceipt(lev, { regel_commit: "HEAD" }), lev);
  eq("kvittering m. regel_commit='HEAD' → RØD (F-18: flytbar ref)", rHead.status === 1 && /fast commit-OID/.test(rHead.stderr), true);
  const rRolle = vb("-", mkReceipt(lev, { rolle: "codex-forbedring", skill_oid: realLock["codex-forbedring"].skill_oid }), lev);
  eq("kvitteringens rolle er ikke gatens codex-rolle → RØD (F-15)", rRolle.status === 1 && /gatens codex-rolle/.test(rRolle.stderr), true);
  const r6 = vb("-", mkReceipt(lev, { selftest: true }), lev);
  eq("kvittering m. selftest=true → RØD (F-11)", r6.status === 1 && /SELVTEST/.test(r6.stderr), true);
  const r7 = vb("-", mkReceipt(lev, { gate_input: { gate_id: "plan", gated_commit: GATED, artifact_path: ART } }), lev);
  eq("kvittering m. andet gate_input → RØD (F-10: dommen skrevet på andet input)", r7.status === 1 && /gate_input/.test(r7.stderr), true);
  const r8 = vb("-", mkReceipt(lev, { aktivitet: "produktion", sandbox: "workspace-write", attempts: [{ attempt: 1, rc: 0, model: "gpt-6-astra", effort: "xhigh", sandbox: "workspace-write", output_sha256: sha256(lev), output_bytes: 1 }] }), lev);
  eq("kvittering fra produktions-kørsel → RØD (F-10)", r8.status === 1 && /≠ dom/.test(r8.stderr), true);
  const r9 = vb("-", mkReceipt(lev, { rolle: "codex-forbedring" }), lev);
  eq("kvitteringens rolle er en anden codex-rolle (forbedring m. angrebs skill_oid) → RØD (F-15 gatens rolle / F-10 lås-binding)", r9.status === 1 && /gatens codex-rolle|matcher ikke låsen/.test(r9.stderr), true);
  const r10 = vb("-", mkReceipt(lev, { lock_mode: "OVERRIDE(selftest)" }), lev);
  eq("lås-override → RØD", r10.status === 1 && /lås-override/.test(r10.stderr), true);
  const r11 = vb("-", mkReceipt(lev, { status: "fejl" }), lev);
  eq("status=fejl → RØD (F-1)", r11.status === 1 && /leverede ikke/.test(r11.stderr), true);
  const r12 = vb("-", mkReceipt(lev, { attempts: [{ attempt: 1, rc: 0, model: "gpt-6-astra", effort: "low", sandbox: "read-only", output_sha256: sha256(lev), output_bytes: 1 }] }), lev);
  eq("forsøg m. andet effort end kvitteringen → RØD (tavs sænkning)", r12.status === 1 && /anden model\/effort\/sandbox/.test(r12.stderr), true);
  const r13 = vb("-", mkReceipt(lev, { schema_version: 1 }), lev);
  eq("kvittering schema v1 (gammel wrapper) → RØD", r13.status === 1 && /schema/.test(r13.stderr), true);
  const rp = join(T, "d-only.json"); writeFileSync(rp, JSON.stringify({ ...draftObj, raw_output_sha256: sha256("x") }));
  const r14 = spawnSync("node", [VB, rp, "krav", GATED, ART], { encoding: "utf8", cwd: ROOT });
  eq("codex-aktør UDEN kvittering → RØD (F-2)", r14.status === 1 && /uden transport-kvittering/.test(r14.stderr), true);
  const cp = join(T, "claude.json"); writeFileSync(cp, JSON.stringify({ ...draftObj, aktor: "code", raw_output_sha256: sha256("x") }));
  const r15 = spawnSync("node", [VB, cp, "krav", GATED, ART], { encoding: "utf8", cwd: ROOT });
  eq("claude-aktør uden kvittering → tilladt, mærket SELV-ERKLÆRET, ingen receipt_sha256", r15.status === 0 && /SELV-ERKLÆRET/.test(JSON.parse(r15.stdout).run.actor_server_id) && JSON.parse(r15.stdout).run.receipt_sha256 === undefined, true);
  // ægte selvtest-kvittering fra wrapperen (STORK_V5_REPO=ROOT, ingen lås-override) → lock_mode committed men selftest=true → RØD
  const x = run(undefined, { lock: null, env: { STORK_V5_REPO: ROOT } });
  const r16 = spawnSync("node", [VB, "-", "krav", GATED, ART, x.out + ".receipt.json", x.out], { encoding: "utf8", cwd: ROOT });
  eq("ÆGTE wrapper-kvittering fra selvtest (committed lås, selftest=true) → RØD i verdikt-byg (F-11 lukket e2e)", x.receipt?.lock_mode === "committed" && x.receipt?.selftest === true && r16.status === 1 && /SELVTEST/.test(r16.stderr), true);
}

rmSync(T, { recursive: true, force: true });
console.log("");
if (fail > 0) { console.error(`codex-run: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`codex-run: ${pass} ok`);
