// S16 (Leverance 3) — handoff-kanaler-wiring. Verificerer at hver gate-aktør har en defineret
// læsekanal (j/kanalFor), så gate-validering kan binde gennem aktørens EGEN kanal. Genbruger (j).
import { kanalFor } from "./handoff-check.mjs";

const GATE_AKTOERER = ["Code", "Codex", "Claude.ai", "Mathias"];

export function validateKanaler(aktoerer = GATE_AKTOERER) {
  const fejl = [];
  for (const a of aktoerer) {
    if (!kanalFor(a)) fejl.push(`manglerKanal(${a})`);
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = validateKanaler();
  if (!res.ok) {
    console.error("HANDOFF-WIRING AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("handoff-wiring OK (alle gate-aktører har en defineret læsekanal)");
}
