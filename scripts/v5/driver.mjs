#!/usr/bin/env node
// driver.mjs — v5's orkestrerings-DECIDE (plan 2.F, ren halvdel).
//
// decide/udfoer-split: dette er den PURE beslutning "hvad er næste milepæl i
// kæden, og afbryder den for Mathias?". udfoer (aktør-invokation via
// claude -p / codex exec + GitHub-trigger) + mikro-orkestreringen inden for en
// fase hører til fase-wiring; her er kun den deterministiske flow-beslutning.
//
// Krav 9's kerne AFLEDES af registryet: en gate afbryder for mennesket ⟺ den
// har approver ≠ null (krav · plan · slut). recon + build kører auto. Ingen
// separat "menneske-gate"-liste der kan divergere fra gate-topologien.

import { GATE_REGISTRY } from "./gates.mjs";

// kæde-orden fra registryet (recon → krav → plan → build → slut)
const CHAIN = GATE_REGISTRY.map((g) => g.id);
export const HUMAN_GATES = Object.freeze(GATE_REGISTRY.filter((g) => g.approver !== null).map((g) => g.id));
const isHuman = (gateId) => HUMAN_GATES.includes(gateId);

// decideNext(state) → {action, gate?, reason}
// state = {
//   launched: bool,              // qwers givet + launch.json committet
//   halt: bool,                  // durabelt HALT-flag sat (rød proof / modsigelse)
//   open: { <gate_id>: bool },   // gatens v5/gate/<id> check-run er success
// }
// actions:
//   "halt"          — durabelt HALT; bygger ikke videre
//   "await-qwers"   — venter på Mathias' åbning
//   "advance-auto"  — næste ulukkede gate er auto (recon/build); driveren kører
//   "await-human"   — næste ulukkede gate kræver Mathias (krav/plan/slut)
//   "done"          — hele kæden åben
//   "inconsistent"  — en gate er åben uden at forgængeren er (stale/manipuleret
//                     check-runs) → fail-closed
export function decideNext(state) {
  if (state === null || typeof state !== "object") return { action: "inconsistent", reason: "state mangler" };
  const open = state.open ?? {};
  const isOpen = (id) => open[id] === true;

  if (state.halt === true) return { action: "halt", reason: "durabelt HALT-flag sat — kæden bygger ikke videre" };
  if (state.launched !== true) return { action: "await-qwers", reason: "ikke åbnet (afventer qwers)" };

  // kæde-monotonicitet: ingen gate må være åben uden at ALLE forgængere er.
  // (evaluateGate håndhæver det pr. gate; her fanger vi en stale/manipuleret
  // samling check-runs, fail-closed.)
  let sawClosed = false;
  for (const id of CHAIN) {
    if (!isOpen(id)) sawClosed = true;
    else if (sawClosed)
      return {
        action: "inconsistent",
        gate: id,
        reason: `gate '${id}' er åben mens en forgænger er lukket (stale/manipuleret check-runs)`,
      };
  }

  // find den første ulukkede gate i kæde-orden = næste milepæl
  const next = CHAIN.find((id) => !isOpen(id));
  if (next === undefined) return { action: "done", reason: "hele kæden åben (slut OK givet)" };

  return isHuman(next)
    ? { action: "await-human", gate: next, reason: `næste gate '${next}' kræver Mathias' godkendelse (krav 9)` }
    : { action: "advance-auto", gate: next, reason: `næste gate '${next}' er auto — driveren kører uden afbrydelse` };
}

export { CHAIN };
