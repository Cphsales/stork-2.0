#!/usr/bin/env node
import { dom } from "./sandhed-vagt.mjs";

let ok = 0, fail = 0;
const t = (navn, cond) => { if (cond) { ok++; console.log(`  ✓ ${navn}`); } else { fail++; console.log(`  ✗ ${navn}`); } };

const V = "docs/strategi/vision-og-principper.md";
const MP = "docs/strategi/stork-2-0-master-plan.md";
const blob = "0123456789abcdef0123456789abcdef01234567";
const ledger = [
  "| M-70 | 2026-09-25 | »ja« | vision-og-principper.md l.5 → blob 0123456789ab |",
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
t("filnavn og blob kun i ord-kolonnen tæller ikke", dom([{ sti: V, status: "M", blob }], "| M-9 | d | »ja vision-og-principper.md 0123456789ab« | — |").length === 1);
console.log(`\nsandhed-vagt: ${ok} ok${fail ? `, ${fail} FEJL` : ""}`);
process.exit(fail ? 1 : 0);
