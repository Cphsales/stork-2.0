// Selftest for recon-runtime-check (S6, Leverance 2) — komponerer d/e/h + konsolidering.
import { validateReconRun, konsoliderReconSandhed } from "./recon-runtime-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const fund = [
  {
    kilde: "salgs-tabel",
    kategori: "nuvaerende-kode",
    emne: "a",
    evidensRef: "r",
    aktoer: "Code",
    klassifikation: "k",
    flade: "kode",
  },
];
const god = { punkt: "foer-krav", scope: ["a"], daekningsflade: ["kode"], fund, runde: 1 };

// Positiv evne: gyldig recon-run passerer + giver en recon-sandhed-hash.
const r = validateReconRun(god);
ok("gyldig recon-run passerer", r.ok);
ok("producerer recon-sandhed-hash", typeof r.reconHash === "string" && r.reconHash.length === 64);

// Kanariefugle — fejl fra hvert komponeret led propageres med prefix:
ok("ukendt punkt → FAIL", harFejl(validateReconRun({ ...god, punkt: "midt" }), "ukendtPunkt"));
ok(
  "(e) tidlig stop → grundig-fejl",
  harFejl(validateReconRun({ ...god, stoppedEarly: true }), "grundig:stoppetVedFoersteFund"),
);
ok(
  "(h) manglende dækningsflade → dybde-fejl",
  harFejl(validateReconRun({ ...god, daekningsflade: [] }), "dybde:manglerDaekningsflade"),
);
ok(
  "(d) fund uden felt → præsentation-fejl",
  harFejl(validateReconRun({ ...god, fund: [{ ...fund[0], evidensRef: undefined }] }), "praesentation:fundUdenFelt"),
);

// Konsolidering er deterministisk + dedupliceret.
ok("samme fund → samme hash", konsoliderReconSandhed(fund) === konsoliderReconSandhed(fund));
ok("dubletter ændrer ikke hash", konsoliderReconSandhed([...fund, ...fund]) === konsoliderReconSandhed(fund));
ok("andet fund → anden hash", konsoliderReconSandhed([{ ...fund[0], emne: "b" }]) !== konsoliderReconSandhed(fund));

if (fejl) {
  console.error(`recon-runtime-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("recon-runtime-check selftest: alle checks passed");
