#!/usr/bin/env node
// pg-runner.selftest.mjs — database-runnerens fejltolkning (rene funktioner; runneren selv køres af byggetjekket i CI).
import { parseErr, frame, makePgRunner } from "./pg-runner.mjs";

let ok = 0, fail = 0;
const t = (navn, c) => { if (c) { ok++; console.log(`  ✓ ${navn}`); } else { fail++; console.log(`  ✗ ${navn}`); } };

const pe = parseErr("NOTICE:  00000: prefix\nERROR:  P0001: min_en_stand\nCONTEXT:  PL/pgSQL function f.stand_deaktiver(int) line 1 at RAISE\nERROR:  P0001: unrelated_failure\nCONTEXT:  PL/pgSQL function f.other(int) line 2 at RAISE\n");
t("to fejlblokke med samme SQLSTATE → flertydig, ingen kode", pe.code === null && pe.routine === null && !!pe.flertydig);
const pe0 = parseErr("NOTICE:  00000: prefix\nERROR:  P0001: min_en_stand\nCONTEXT:  PL/pgSQL function f.stand_deaktiver(int) line 1 at RAISE\nLOCATION:  exec_stmt_raise, pl_exec.c:3894\n");
t("én fejl med NOTICE foran → entydig kode og funktion", pe0.code === "P0001" && pe0.routine === "f.stand_deaktiver");
const pe2 = parseErr("CONTEXT:  PL/pgSQL function f.stand_deaktiver(int) line 1 at RAISE\nERROR:  P0001: andet\n");
t("CONTEXT før fejlen → flertydig", pe2.code === null && !!pe2.flertydig);
const pe4 = parseErr("ERROR:  P0001: unrelated_failure\nDETAIL:  user text\nERROR:  P0001: min_en_stand\nCONTEXT:  PL/pgSQL function f.stand_deaktiver(int) line 1 at RAISE\nCONTEXT:  PL/pgSQL function f.other(int) line 2 at RAISE\n");
t("fejltekst der indlejrer ERROR/CONTEXT-linjer → flertydig, aldrig et valg", pe4.code === null && pe4.routine === null);
t("ingen fejl → ingen kode", parseErr("NOTICE:  00000: x\n").code === null);

const S = "V5S-1", M = "V5M-1", E = "V5E-1";
t("manglende statusramme → protokol", !!frame("noget", "", S, M, E).protokol);
t("dobbelt statusramme → protokol", !!frame(`${S} false 00000 00000\n${S} false 00000 00000\n${M}\n\n${E}\n`, "", S, M, E).protokol);
const fr = frame(`${S} true P0001 P0001\n${M}\nmin_en_stand\n${E}\n`, "ERROR:  P0001: min_en_stand\nCONTEXT:  PL/pgSQL function f.x(int) line 1 at RAISE\n", S, M, E);
t("én reel fejl → ikke ok med SQLSTATE", fr.ok === false && fr.code === "P0001");
const fr2 = frame(`${S} false 00000 P0001\n${M}\nmin_en_stand\n${E}\n`, "ERROR:  P0001: min_en_stand\n", S, M, E);
t("status ok men en ERROR-linje på stderr (tidligere sætning fejlede) → protokol", !!fr2.protokol);

let kast = null; try { makePgRunner({ argv: ["psql"], env: { PATH: "/usr/bin", GITHUB_TOKEN: "x" } }); } catch (e) { kast = e.message; }
t("runneren afviser et miljø med credentials", /credential/.test(kast ?? ""));

console.log(`\npg-runner: ${ok} ok${fail ? `, ${fail} FEJL` : ""}`);
process.exit(fail ? 1 : 0);
