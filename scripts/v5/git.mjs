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

// resolveRef(git, commitSha, path) → {path, oid, type} | null.
// Returnerer null KUN når stien ikke findes @ commit (forventet fail-closed).
// En BRUDT git (ugyldigt repo, ukendt commit) kastes videre — den skal ikke
// maskeres som "findes ikke" (diagnostik + så en I/O-fejl ikke tavst bliver
// til en lukket gate af forkert årsag).
export function resolveRef(git, commitSha, path) {
  // verificér at commit'en selv findes FØR sti-opslaget → skeln "brudt repo/
  // ukendt commit" (kast) fra "sti findes ikke" (null).
  git("rev-parse", "--verify", "--quiet", `${commitSha}^{commit}`); // kaster hvis commit ukendt/repo brudt
  let oid;
  try {
    oid = git("rev-parse", "--verify", "--quiet", `${commitSha}:${path}`);
  } catch {
    return null; // sti findes ikke @ commit
  }
  const type = git("cat-file", "-t", oid);
  return { path, oid, type };
}
