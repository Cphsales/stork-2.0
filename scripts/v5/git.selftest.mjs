#!/usr/bin/env node
// git.selftest.mjs — dækning af I/O-kanten (Codex-fund: git.mjs manglede en
// dedikeret selftest). Load-bearing for gate-eval · coverage · verdikt · prover.
// Beviser de egenskaber de afhænger af: rå bytes vs. trimmet utf8, fail-closed
// på git-fejl, og resolveRef's blob/tree/missing/brudt-repo-semantik (missing
// path = null; brudt repo / ukendt commit = KAST, ikke maskeret som null).

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { makeGit, resolveRef } from "./git.mjs";

let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const throws = (n, fn) => {
  try {
    fn();
    bad(n, "kastede ikke (forventet fail-closed)");
  } catch {
    ok(n);
  }
};

const ROOT = mkdtempSync(join(tmpdir(), "v5-git-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const git = makeGit(ROOT);
git("config", "user.name", "selftest");
git("config", "user.email", "selftest@local");

const FILES = {
  "a.txt": "one\n\n", // to trailing newlines → afslører trim-forskel
  "dir/b.txt": "indhold\n",
  "bin.dat": null, // binær, skrives særskilt
};
for (const [p, c] of Object.entries(FILES)) {
  if (c === null) continue;
  mkdirSync(join(ROOT, dirname(p)), { recursive: true });
  writeFileSync(join(ROOT, p), c);
}
writeFileSync(join(ROOT, "bin.dat"), Buffer.from([0xff, 0xfe, 0x00, 0x01]));
git("add", "-A");
git("commit", "-qm", "fixture");
const COMMIT = git("rev-parse", "HEAD");

console.log("git() vs git.bytes() — trim vs. rå:");
{
  const oid = git("rev-parse", `${COMMIT}:a.txt`);
  const trimmed = git("show", `${COMMIT}:a.txt`);
  const raw = git.bytes("show", `${COMMIT}:a.txt`).toString("utf8");
  trimmed === "one\n"
    ? ok("git() trimmer trailing newline(s) til én linje-form")
    : bad("trim", JSON.stringify(trimmed));
  raw === "one\n\n" ? ok("git.bytes() bevarer eksakt indhold (ingen trim)") : bad("raw", JSON.stringify(raw));
  Buffer.isBuffer(git.bytes("cat-file", "-p", oid)) ? ok("git.bytes returnerer Buffer") : bad("buffer", "ikke buffer");
}

console.log("\nfail-closed: git() kaster på fejl (exit ≠ 0):");
throws("ukendt objekt → kast", () => git("cat-file", "-p", "0".repeat(40)));
throws("ugyldig kommando → kast", () => git("this-is-not-a-git-command"));

console.log("\nresolveRef — blob / tree / missing / brudt:");
{
  const r = resolveRef(git, COMMIT, "a.txt");
  r && r.type === "blob" && r.path === "a.txt" && /^[0-9a-f]{40}$/.test(r.oid)
    ? ok("blob → {path, oid, type:'blob'}")
    : bad("blob", JSON.stringify(r));
}
{
  const r = resolveRef(git, COMMIT, "dir");
  r && r.type === "tree" ? ok("mappe → type:'tree' (kalderen kan afvise)") : bad("tree", JSON.stringify(r));
}
{
  const r = resolveRef(git, COMMIT, "findes-ikke.txt");
  r === null ? ok("manglende sti @ gyldig commit → null (forventet fail-closed)") : bad("missing", JSON.stringify(r));
}
// KERNEN i Codex-fund 3: brudt repo / ukendt commit må IKKE maskeres som null
throws("ukendt commit → KAST (ikke null — skelnes fra manglende sti)", () => resolveRef(git, "0".repeat(40), "a.txt"));
throws("brudt repo (ikke et git-repo) → KAST", () => {
  const notRepo = mkdtempSync(join(tmpdir(), "v5-notgit-"));
  try {
    resolveRef(makeGit(notRepo), COMMIT, "a.txt");
  } finally {
    rmSync(notRepo, { recursive: true, force: true });
  }
});

console.log("");
if (failed > 0) {
  console.error(`git red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("git red-team: alle cases passed");
