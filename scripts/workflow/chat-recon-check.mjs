// Regel-flade klausul (l) — Claude.ai chat-recon-checker (krav 2/6).
// Et chat-recon-fund skal cite med chat/dato/tråd + have en gyldig klassifikation —
// ellers er det en ukildet/usynlig sandhed → afvist.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/chat-recon-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

const tom = (v) => v == null || (typeof v === "string" && v.trim() === "");

// recon = { fund: [{citat, dato, traad, klassifikation}] }
export function validateChatRecon(recon, def = loadDef()) {
  const fejl = [];
  const fund = Array.isArray(recon?.fund) ? recon.fund : [];
  for (const f of fund) {
    const hvor = f?.citat ? `"${String(f.citat).slice(0, 24)}…"` : "(uden citat)";
    for (const felt of def.fundFelter) {
      if (tom(f?.[felt])) fejl.push(`fundUdenKilde(${felt}): ${hvor}`);
    }
    if (f?.klassifikation && !def.klassifikationer.includes(f.klassifikation))
      fejl.push(`ukendtKlassifikation(${f.klassifikation}): ${hvor}`);
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: chat-recon-check.mjs <recon.json>");
    process.exit(2);
  }
  const res = validateChatRecon(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("CHAT-RECON AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("chat-recon OK (kildet + klassificeret)");
}
