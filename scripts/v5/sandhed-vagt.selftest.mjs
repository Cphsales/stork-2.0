#!/usr/bin/env node
import { dom } from "./sandhed-vagt.mjs";

let ok = 0, fail = 0;
const t = (navn, cond) => { if (cond) { ok++; console.log(`  ✓ ${navn}`); } else { fail++; console.log(`  ✗ ${navn}`); } };

const V = "docs/strategi/vision-og-principper.md";
const MP = "docs/strategi/stork-2-0-master-plan.md";
const blob = "0123456789abcdef0123456789abcdef01234567";
const ledger = [
  "| M-70 | 2026-09-25 | »ja« | l.5: vision-og-principper.md → blob 0123456789ab |",
  "| M-71 | 2026-09-25 | »ok til planen« | stork-2-0-master-plan.md slettes · code.md → blob 0123456789ab |",
  "| M-72 | 2026-09-25 | »nej« | forretningsforstaaelse.md → blob 0123456789ab |",
].join("\n");

t("ingen ændring → ok", dom([], ledger).length === 0);
t("andet dokument ændret → ok", dom([{ sti: "docs/teknisk/huskeliste.md", status: "M", blob }], "").length === 0);
t("vision ændret med matchende M-række → ok", dom([{ sti: V, status: "M", blob }], ledger).length === 0);
t("vision ændret uden M-række → rød", dom([{ sti: V, status: "M", blob }], "").length === 1);
t("vision ændret med forkert blob → rød", dom([{ sti: V, status: "M", blob: "ffff" + blob.slice(4) }], ledger).length === 1);
t("blob nævnt i en ikke-M-linje tæller ikke", dom([{ sti: V, status: "M", blob }], "vision-og-principper.md 0123456789ab").length === 1);
t("masterplan slettet med »slettes«-række → ok", dom([{ sti: MP, status: "D", blob: null }], ledger).length === 0);
t("forretningsforståelse slettet uden række → rød", dom([{ sti: "docs/strategi/forretningsforstaaelse.md", status: "D", blob: null }], ledger).length === 1);
t("for kort blob → rød", dom([{ sti: V, status: "M", blob: "0123" }], ledger).length === 1);

t("»nej« godkender ikke", dom([{ sti: "docs/strategi/forretningsforstaaelse.md", status: "M", blob }], ledger).length === 1);
t("rolletekst er beskyttet og godkendt med ok-rækken", dom([{ sti: "scripts/v5/roller/code.md", status: "M", blob }], ledger).length === 0);
t("rolletekst uden godkendelse → rød", dom([{ sti: "scripts/v5/roller/fabrik.md", status: "M", blob }], ledger).length === 1);
t("disciplin.md er beskyttet", dom([{ sti: "docs/strategi/disciplin.md", status: "M", blob }], ledger).length === 1);
t("»ja, men …« godkender ikke", dom([{ sti: V, status: "M", blob }], "| M-9 | d | »ja, men ikke til denne ændring« | vision-og-principper.md → blob 0123456789ab |").length === 1);
t("filnavnet parret med et andet dokuments blob tæller ikke", dom([{ sti: V, status: "M", blob }], "| M-9 | d | »ja« | vision-og-principper.md → blob ffffffffffff · forretningsforstaaelse.md → blob 0123456789ab |").length === 1);
t("filnavn og blob uden → blob-par tæller ikke", dom([{ sti: V, status: "M", blob }], "| M-9 | d | »ja« | vision-og-principper.md, 0123456789ab |").length === 1);
t("»slettes« i et andet afsnit end filen tæller ikke", dom([{ sti: MP, status: "D", blob: null }], "| M-9 | d | »ja« | stork-2-0-master-plan.md → blob 0123456789ab · code.md slettes |").length === 1);
t("»ja, ikke denne ændring« godkender ikke", dom([{ sti: V, status: "M", blob }], "| M-9 | d | »ja, ikke denne ændring« | vision-og-principper.md → blob 0123456789ab |").length === 1);
t("»plan ok er ikke givet« godkender ikke", dom([{ sti: V, status: "M", blob }], "| M-9 | d | »plan ok er ikke givet« | vision-og-principper.md → blob 0123456789ab |").length === 1);
t("»ok til planen« og »ja tak.« godkender", dom([{ sti: V, status: "M", blob }], "| M-9 | d | »ok til planen« | vision-og-principper.md → blob 0123456789ab |").length === 0 && dom([{ sti: V, status: "M", blob }], "| M-9 | d | »Ja tak.« | vision-og-principper.md → blob 0123456789ab |").length === 0);
t("betinget godkendelse (»slut ok til pakken hvis …«) godkender ikke", dom([{ sti: V, status: "M", blob }], "| M-9 | d | »ja til pakken hvis fejlen bliver rettet« | vision-og-principper.md → blob 0123456789ab |").length === 1 && dom([{ sti: V, status: "M", blob }], "| M-9 | d | »ok til planen under forudsætning af at vi ændrer den« | vision-og-principper.md → blob 0123456789ab |").length === 1);
t("svar på et nummereret punkt (»1. ja«, »2) plan ok«) godkender", dom([{ sti: V, status: "M", blob }], "| M-9 | d | »1. ja« | vision-og-principper.md → blob 0123456789ab |").length === 0);
t("nummereret svar med forbehold eller nej godkender ikke", dom([{ sti: V, status: "M", blob }], "| M-9 | d | »1. ja, men ikke A3« | vision-og-principper.md → blob 0123456789ab |").length === 1 && dom([{ sti: V, status: "M", blob }], "| M-9 | d | »1. nej« | vision-og-principper.md → blob 0123456789ab |").length === 1);
const M71 = "| M-71 | 2026-09-24 | »ja - ja - ja og har jeg ikke godkendt workflow planen?« | ja 1: vision-og-principper.md → blob 309fc5949ded · forretningsforstaaelse.md → blob cde05276985a · stork-2-0-master-plan.md → blob 0123456789ab |";
t("M-71 godkender præcis sine to l.5-blobs", dom([{ sti: V, status: "M", blob: "309fc5949ded" + "0".repeat(28) }], M71).length === 0);
t("M-71 godkender ikke en tredje fil i samme række", dom([{ sti: MP, status: "M", blob }], M71).length === 1);
t("en anden række med nummeret M-71 arver ikke undtagelsen", dom([{ sti: V, status: "M", blob: "309fc5949ded" + "0".repeat(28) }], "| M-71 | d | »ja, men« | vision-og-principper.md → blob 309fc5949ded |").length === 1);
t("filnavn og blob kun i ord-kolonnen tæller ikke", dom([{ sti: V, status: "M", blob }], "| M-9 | d | »ja vision-og-principper.md 0123456789ab« | — |").length === 1);
console.log(`\nsandhed-vagt: ${ok} ok${fail ? `, ${fail} FEJL` : ""}`);
process.exit(fail ? 1 : 0);
