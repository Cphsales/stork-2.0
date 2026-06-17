// S4 (Leverance 2) — start-kæde-funktion. Validerer den samlede transport-kæde fra qwers
// til krav-oplæg, og at grænsen holdes: kun transport kører af sig selv, dømmekraft aldrig.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DEF_PATH = resolve(here, "../../workflow/start-kaede-kontrakt.json");
export const loadDef = (path = DEF_PATH) => JSON.parse(readFileSync(path, "utf8"));

// state = { authorVerificeret, aktiverede:[...], reconSamlet, kravOplaegFremlagt, autoValideret? }
export function validateStartKaede(state, def = loadDef()) {
  const fejl = [];
  // Forkert author → åbningen IGNORERES (ikke en kæde overhovedet).
  if (!state?.authorVerificeret) fejl.push("forkertAuthorIgnoreret");
  // qwers skal aktivere ALLE tre AI-aktører.
  for (const a of def.aktoerer) {
    if (!(state?.aktiverede ?? []).includes(a)) fejl.push(`ikkeAlleAktiveret(${a})`);
  }
  // Grænse: transport må ikke krydse ind i dømmekraft.
  if (state?.autoValideret) fejl.push("transportAutoValiderede");
  // Krav-oplæg må ikke fremlægges uden samlet recon.
  if (state?.kravOplaegFremlagt && !state?.reconSamlet) fejl.push("kravOplaegUdenRecon");
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: start-kaede-check.mjs <state.json>");
    process.exit(2);
  }
  const res = validateStartKaede(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("START-KÆDE AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("start-kæde OK (qwers → aktivering → recon → krav-oplæg, transport-grænse holdt)");
}
