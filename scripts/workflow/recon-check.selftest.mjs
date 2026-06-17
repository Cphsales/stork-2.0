// Selftest for recon-check (regel-flade klausul d) — krav 6 / S1d.
import { validateRecon } from "./recon-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const fuldtFund = {
  kilde: "salgs-tabel",
  kategori: "nuvaerende-kode",
  emne: "x bygget sådan",
  evidensRef: "supabase/migrations/...",
  aktoer: "Code",
  klassifikation: "korrekt?",
};

// Positiv evne: et fuldt struktureret fund i gyldig kategori passerer.
ok("fuldt fund passerer", validateRecon({ fund: [fuldtFund] }).ok);

// Kanariefugle: ufuldstændigt/ukategoriseret fund SKAL afvises (ellers kan transport ikke flette mekanisk).
ok("fund uden evidensRef → FAIL", harFejl(validateRecon({ fund: [{ ...fuldtFund, evidensRef: undefined }] }), "fundUdenFelt(evidensRef)"));
ok("fund uden kilde → FAIL", harFejl(validateRecon({ fund: [{ ...fuldtFund, kilde: undefined }] }), "fundUdenFelt(kilde)"));
ok("ukendt kategori → FAIL", harFejl(validateRecon({ fund: [{ ...fuldtFund, kategori: "andet" }] }), "ukendtKategori"));

if (fejl) {
  console.error(`recon-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("recon-check selftest: alle checks passed");
