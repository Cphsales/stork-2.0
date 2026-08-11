#!/usr/bin/env node
// git.mjs — v5's eneste I/O-kant mod git. Injiceres i de pure verifikatorer,
// så tests kører mod RIGTIGE git-objekter (KERNEN: udøv den faktiske logik).

import { execFileSync } from "node:child_process";

const MAX_BUFFER = 64 * 1024 * 1024;

// makeGit(repoRoot) → git(...args) → trimmet stdout (utf8); kaster på exit ≠ 0
// (fail-closed). `git.bytes(...args)` → RÅ Buffer (ingen trim, ingen lossy
// decode) — brugt til excerpt-hashing, hvor en trailing-newline-trim eller
// lossy string-decode ellers ville gøre citat-bevis upålideligt.
export function makeGit(repoRoot) {
  const exec = (args, encoding) =>
    execFileSync("git", ["-C", repoRoot, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: MAX_BUFFER,
      ...(encoding === null ? {} : { encoding }),
    });
  const git = (...args) => exec(args, "utf8").replace(/\n$/, "");
  git.bytes = (...args) => exec(args, null);
  return git;
}

// resolveRef(git, commitSha, path) → {path, oid, type} | null (findes ikke @ commit).
export function resolveRef(git, commitSha, path) {
  try {
    const oid = git("rev-parse", `${commitSha}:${path}`);
    const type = git("cat-file", "-t", oid);
    return { path, oid, type };
  } catch {
    return null;
  }
}
