#!/usr/bin/env node
// Mathias-adapter (gov-5 B2, plan V21 step 8) — Mathias' mobilflade.
// TRANSPORT: notifikationer + ordret gate-ord-flade. Tolker/sammenfatter ALDRIG
// indhold; accepterer intet (author-verifikation sker i decide()).
// Kontrakt: exit 0 = flade-handling udført. Kaldes af kuréren (env) ELLER
// manuelt: node mathias.mjs --opret-staaende / --opret-pakke-issue <pakke>
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROD = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
process.chdir(join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".."));
const gh = (...args) => execFileSync("gh", args, { encoding: "utf8" }).trim();
const regler = JSON.parse(readFileSync("scripts/kaede/kaede-regler.json", "utf8"));

function pakkeIssue(spor) {
  const sti = `docs/coordination/${spor}-status.md`;
  if (!existsSync(sti)) return null;
  return readFileSync(sti, "utf8").match(/Kæde-issue:\s*#(\d+)/)?.[1] ?? null;
}
function kommenter(issue, tekst) {
  gh("issue", "comment", String(issue), "--body", tekst);
}

const argv = process.argv.slice(2);
if (argv[0] === "--opret-staaende") {
  // Stående dirigent-issue (V13): oprettes ÉN gang; nummeret skrives manuelt i
  // kaede-regler.json:kaede_issue (Mathias-ejet fil — Codes commit, hans review).
  const url = gh(
    "issue",
    "create",
    "--title",
    "Kæde: stående dirigent-issue (gov-5) — pakke-åbninger",
    "--body",
    "Stående åbningsflade for kæden (gov-5, plan V21).\n\n" +
      "**Mathias åbner en pakke herfra (mobil):** kommentér `qwers <pakke-navn>` — " +
      "kæden igangsætter recon (Code+Codex → Claude.ai-syntese) og melder tilbage.\n" +
      "`stop` pauser kæden øjeblikkeligt (suverænitet).\n\n" +
      "Gate-ord accepteres KUN fra @mgrubak (author-verificeret i kuréren).",
  );
  console.log(url);
  process.exit(0);
}
if (argv[0] === "--opret-pakke-issue") {
  const spor = argv[1];
  const url = gh(
    "issue",
    "create",
    "--title",
    `Kæde: ${spor} — gates og notifikationer`,
    "--body",
    `Pr.-pakke kæde-issue for '${spor}' (plan V21).\n\n` +
      "**Mathias' gate-ord (mobil, kun @mgrubak):** `krav OK <hash>` · `slut OK` · `GODKENDT` · `AFVIST` · `stop`.\n" +
      "Kæden poster notifikationer og hash-anmodninger her. Issue-nummeret bogføres som " +
      "`Kæde-issue: #N` i pakke-status-filen (Codes plan-start-leverance).",
  );
  console.log(url);
  process.exit(0);
}

const OPGAVE = process.env.KAEDE_OPGAVE;
const SPOR = process.env.KAEDE_SPOR;
const FIL = process.env.KAEDE_FIL || "";
const SHA = process.env.KAEDE_SHA || "";
const issue = pakkeIssue(SPOR) ?? regler.kaede_issue;
if (!issue) {
  console.error("Mathias-flade mangler: hverken pakke-issue (status-linje) eller stående issue (regler). Fail-closed.");
  process.exit(64);
}

switch (OPGAVE) {
  case "kvittering":
    kommenter(
      issue,
      `Kæden har modtaget åbningen af **${SPOR}** — recon igangsat (Code + Codex, derefter Claude.ai-syntese). @mgrubak`,
    );
    break;
  case "notifikation":
    kommenter(
      issue,
      `**${SPOR}: recon-fasen er klar.** Recon-docs + oplæg ligger i docs/coordination/. Krav-dok-dialogen (Windows-appen) kan begynde. @mgrubak`,
    );
    break;
  case "hash-post": {
    // Versions-bindingen (V9): indholds-hash af krav-dokket — Mathias validerer
    // med 'krav OK <hash>'; kæden merger KUN ved hash-match (regelbogs-betingelse).
    const hash = execFileSync("git", ["hash-object", FIL], { encoding: "utf8" }).trim();
    kommenter(
      issue,
      `**${SPOR}: krav-dok klar @ \`${hash}\`** (${FIL}).\nValidér med kommentaren: \`krav OK ${hash}\`\nÆndres filen efter dit ord, blokeres merge (hash-mismatch) og ny validering kræves. @mgrubak`,
    );
    break;
  }
  case "gate-anmodning":
    kommenter(
      issue,
      `**${SPOR}: FUND-GATE — afgørelsen er din.** Fund-fil: ${FIL} @ ${SHA}. Gate-pakke (forretningssprog) følger fra Claude.ai-rollen. Svar \`GODKENDT\` eller \`AFVIST\` her. Sporet er pauset til dit ord. @mgrubak`,
    );
    break;
  case "review-request": {
    const pr = gh(
      "pr",
      "list",
      "--head",
      `claude/${SPOR}-build`,
      "--state",
      "open",
      "--json",
      "number",
      "--jq",
      ".[0].number",
    );
    if (pr) gh("pr", "edit", pr, "--add-reviewer", regler.identiteter.gate_author);
    kommenter(
      issue,
      `**${SPOR}: build-PR #${pr} rører dine beslutnings-stier** — review-request sendt (GitHub Mobile). @mgrubak`,
    );
    break;
  }
  default:
    console.error(`Ukendt KAEDE_OPGAVE for mathias-adapter: ${OPGAVE}`);
    process.exit(64);
}
