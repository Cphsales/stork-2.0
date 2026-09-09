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
writeFileSync(join(BIN, "codex"), `#!/usr/bin/env bash
if [ "\${1:-}" = "--version" ]; then echo "codex-cli FAKE"; exit 0; fi
n=$(ls "${CALLS}" | wc -l); n=$((n+1))
printf '%s\\n' "$@" > "${CALLS}/argv.$n"
[ "$(readlink /proc/self/fd/0)" = "/dev/null" ] || exit 99
out=""; prev=""; for a in "$@"; do [ "$prev" = "-o" ] && out="$a"; prev="$a"; done
case "\${FAKE_MODE:-ok}" in
  ok) echo "RESULTAT $n" > "$out"; exit 0 ;;
  tom) exit 0 ;;
  hang) sleep 30; echo "for sent" > "$out"; exit 0 ;;
  fejl) exit 7 ;;
  symlink) ln -s /etc/hostname "$out"; exit 0 ;;
esac
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
  const prov = existsSync(out + ".provenance") ? readFileSync(out + ".provenance", "utf8") : "";
  const receipt = existsSync(out + ".receipt.json") ? JSON.parse(readFileSync(out + ".receipt.json", "utf8")) : null;
  return { r, out, prov, receipt, calls: calls(), done: existsSync(out + ".attempt1.done"), done2: existsSync(out + ".attempt2.done"), pid: existsSync(out + ".pid") };
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
  eq("kvittering: status success · lock_mode OVERRIDE(selftest)", x.receipt?.status === "success" && x.receipt?.lock_mode === "OVERRIDE(selftest)", true);
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
}
{
  const x = run(["codex-angreb", "dom", WORKDIR, "0", join(OUTDIR, "t0.md"), promptFil]);
  eq("timeout 0 (= ingen grænse) → BLOKER", x.r.status === 1 && /≥ 1 s/.test(x.prov), true);
  const y = run(["codex-angreb", "dom", WORKDIR, "5s", join(OUTDIR, "t.md"), promptFil]);
  eq("ikke-numerisk timeout → BLOKER", y.r.status === 1 && /heltal-sekunder/.test(y.prov), true);
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

console.log("\ncodex-run.sh v3 — guards uden override (committed-lås-grenen udøves, F-9):");
// temp-KLON af repoet (STORK_V5_REPO under selftest holder lock_mode=committed) — arbejdstræets lås ændres → BLOKER
{
  const CLONE = join(T, "klon"); execFileSync("git", ["clone", "-q", "--no-hardlinks", ROOT, CLONE]);
  copyFileSync(WRAPPER, join(CLONE, "scripts/v5/codex-run.sh")); // klonen skal køre DENNE wrapper-version (arbejdstræ), ikke HEAD's
  const x = run(undefined, { lock: null, env: { STORK_V5_REPO: CLONE } });
  eq("committed lås (klon, ingen override) → kører · kvittering lock_mode=committed", x.r.status === 0 && x.receipt?.lock_mode === "committed", true);
  eq("kvittering: regel_commit = klonens HEAD", x.receipt?.regel_commit, execFileSync("git", ["-C", CLONE, "rev-parse", "HEAD"], { encoding: "utf8" }).trim());
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

console.log("\nverdikt-byg.mjs — kvitterings-binding (F-1/F-2):");
const VB = join(HERE, "verdikt-byg.mjs");
const GATED = execFileSync("git", ["-C", ROOT, "rev-parse", "efc85d5"], { encoding: "utf8" }).trim();
const ART = "docs/sandhed/krav/lokations-skabelon-krav.md";
const vb = (draft, receiptP, levP) => {
  const dp = join(T, `draft${++n}.json`); writeFileSync(dp, JSON.stringify(draft));
  const args = [VB, dp, "krav", GATED, ART]; if (receiptP) args.push(receiptP, levP);
  return spawnSync("node", args, { encoding: "utf8", cwd: ROOT });
};
{
  const x = run(); // gyldig kørsel (override-lås) → kvittering m. lock_mode OVERRIDE
  const lev = readFileSync(x.out);
  const draft = { aktor: "codex", conclusion: "PASS", negative_cases: ["n1"], evidence: [{ path: ART, line_span: [3, 3] }], raw_output_sha256: sha256(lev) };
  const r = vb(draft, x.out + ".receipt.json", x.out);
  eq("kvittering m. lås-override → PROVENANCE-RØD (ikke gate-evidens)", r.status === 1 && /lås-override/.test(r.stderr), true);
  const r2 = vb(draft);
  eq("codex-aktør UDEN kvittering → PROVENANCE-RØD (F-2)", r2.status === 1 && /uden transport-kvittering/.test(r2.stderr), true);
  // fabrikér en 'committed'-kvittering ud fra den ægte (kun lock_mode ændret) → binding af bytes skal stadig holde
  const rec = JSON.parse(readFileSync(x.out + ".receipt.json", "utf8")); rec.lock_mode = "committed";
  const recP = join(T, "rec-ok.json"); writeFileSync(recP, JSON.stringify(rec));
  const r3 = vb(draft, recP, x.out);
  eq("gyldig kvittering + leverance + matchende hash → verdikt bygget (exit 0)", r3.status, 0);
  const v = r3.status === 0 ? JSON.parse(r3.stdout) : {};
  eq("verdikt.run: run_attempt=1 · effort=xhigh · run_id fra kvittering · actor_server_id nævner kvittering", v.run?.run_attempt === 1 && v.run?.effort === "xhigh" && v.run?.run_id === rec.run_id && /kvittering/.test(v.run?.actor_server_id ?? ""), true);
  const r4 = vb({ ...draft, raw_output_sha256: "0".repeat(64) }, recP, x.out);
  eq("draft.raw_output_sha256 ≠ leverance → PROVENANCE-RØD (hashen erklæres ikke)", r4.status === 1 && /raw_output_sha256/.test(r4.stderr), true);
  const levF = join(T, "anden-leverance.md"); writeFileSync(levF, "andet indhold");
  const r5 = vb(draft, recP, levF);
  eq("leverance-fil ≠ kvitteringens output_sha256 → PROVENANCE-RØD", r5.status === 1 && /leverance-fil/.test(r5.stderr), true);
  const r6 = vb({ ...draft, effort: "low" }, recP, x.out);
  eq("draft.effort ≠ kørt effort → PROVENANCE-RØD", r6.status === 1 && /draft\.effort/.test(r6.stderr), true);
  const recF = { ...rec, status: "fejl" }; const recFP = join(T, "rec-fejl.json"); writeFileSync(recFP, JSON.stringify(recF));
  const r7 = vb(draft, recFP, x.out);
  eq("kvittering status=fejl → PROVENANCE-RØD (F-1: intet gyldigt resultat)", r7.status === 1 && /leverede ikke/.test(r7.stderr), true);
  const recM = structuredClone(rec); recM.attempts = [{ ...rec.attempts[0], attempt: 1, effort: "low" }]; const recMP = join(T, "rec-mix.json"); writeFileSync(recMP, JSON.stringify(recM));
  const r8 = vb(draft, recMP, x.out);
  eq("forsøg m. andet effort end kvitteringen → PROVENANCE-RØD (F-1: tavs sænkning)", r8.status === 1 && /anden model\/effort\/sandbox/.test(r8.stderr), true);
  const recA = structuredClone(rec); recA.attempts = [rec.attempts[0], { ...rec.attempts[0], attempt: 3 }]; const recAP = join(T, "rec-999.json"); writeFileSync(recAP, JSON.stringify(recA));
  const r9 = vb(draft, recAP, x.out);
  eq("forsøg ude af rækkefølge (1,3) → PROVENANCE-RØD", r9.status === 1 && /ude af rækkefølge/.test(r9.stderr), true);
  const r10 = vb({ ...draft, aktor: "code", raw_output_sha256: sha256("x") });
  eq("claude-aktør uden kvittering → tilladt men mærket SELV-ERKLÆRET", r10.status === 0 && /SELV-ERKLÆRET/.test(JSON.parse(r10.stdout).run.actor_server_id), true);
}

rmSync(T, { recursive: true, force: true });
console.log("");
if (fail > 0) { console.error(`codex-run: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`codex-run: ${pass} ok`);
