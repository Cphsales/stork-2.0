// S14 (Leverance 4) — kæde-uafhængig e2e. Tråder en SYNTETISK pakke gennem hele front-
// halvdelen og beviser at den producerer en godkendt plan UDEN hånd-syning, OG at hver
// kanariefugl fanges af sin station. Komponerer S4–S9 (ingen parallel logik).
import { validateStartKaede } from "./start-kaede-check.mjs";
import { decideRute } from "./scale-check.mjs";
import { validateReconRun } from "./recon-runtime-check.mjs";
import { validateKravspecRun } from "./kravspec-runtime-check.mjs";
import { validateKravGate } from "./krav-gate-check.mjs";
import { validatePlanGate } from "./plan-gate-check.mjs";

const spec = { krav: [{ id: "K-1", acceptkriterie: "x", step: "S1", test: "t" }], planSteps: ["S1"] };
const djaevelPass = {
  krav: [
    {
      id: "K-1",
      minLaesning: "m",
      maxLaesning: "M",
      snydevejTilGroen: "s",
      kanariefuglDerLukker: "k",
      evneIkkeFaerdig: "e",
      ikkeGemtBagBuildRecon: "i",
    },
  ],
  approval: true,
};
const reconFund = [
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

// Standard-scenarie (alt gyldigt). overrides muterer ét trins input → kanariefugl.
function byg(overrides = {}) {
  const o = overrides;
  return {
    startKaede: {
      authorVerificeret: true,
      aktiverede: ["Code", "Codex", "Claude.ai"],
      reconSamlet: true,
      kravOplaegFremlagt: true,
      ...o.startKaede,
    },
    scale: o.scale ?? 9,
    reconFoerKrav: {
      punkt: "foer-krav",
      scope: ["a"],
      daekningsflade: ["kode"],
      fund: reconFund,
      runde: 1,
      ...o.reconFoerKrav,
    },
    reconFoerPlan: {
      punkt: "foer-plan",
      scope: ["a"],
      daekningsflade: ["kode"],
      fund: reconFund,
      runde: 1,
      ...o.reconFoerPlan,
    },
    cur: o.cur ?? { planSha: "ps0", kravHash: "kh0" },
    o,
  };
}

export function runFrontHalvdel(overrides = {}) {
  const s = byg(overrides);
  const trin = [];
  const fejl = [];
  const note = (navn, res) => {
    trin.push(navn);
    if (!res.ok) fejl.push(...res.fejl.map((f) => `${navn}:${f}`));
    return res;
  };

  note("start-kaede", validateStartKaede(s.startKaede));
  trin.push(`scale=${decideRute(s.scale)}`);
  const r1 = note("recon-foer-krav", validateReconRun(s.reconFoerKrav));
  const kravspecRun = {
    reconHash: s.o.fakeReconHash ?? r1.reconHash,
    spec,
    medforfatterBidrag: "b",
    buildVsOensker: "b",
    kravModVision: "v",
  };
  note("kravspec", validateKravspecRun(kravspecRun, { expectedReconHash: r1.reconHash }));
  const ai = (aktoer) => ({ aktoer, planSha: s.cur.planSha, kravHash: s.cur.kravHash });
  note(
    "krav-gate",
    validateKravGate({
      kravTroskab: {
        spec,
        verdikt: { planSha: "p", kravHash: "k", meningsGate: "PASS" },
        current: { planSha: "p", kravHash: "k" },
        kaedeTroskab: { kravModVision: "v" },
      },
      djaevelPass,
      kravspecRun,
      currentReconHash: r1.reconHash,
      current: s.cur,
      aiVerdikter: s.o.kravGateUdenAlle ? [ai("Code"), ai("Codex")] : [ai("Code"), ai("Codex"), ai("Claude.ai")],
      mathiasVerdikt: { aktoer: "Mathias", ...s.cur },
    }),
  );
  note("recon-foer-plan", validateReconRun(s.reconFoerPlan));
  note(
    "plan-gate",
    validatePlanGate({
      kravGateRen: !s.o.kravGateIkkeRen,
      djaevelPass,
      planTroskab: { planModVisionOgKrav: "plan⊨vision+krav" },
      current: s.cur,
      aiVerdikter: [ai("Code"), ai("Codex"), ai("Claude.ai")],
      mathiasVerdikt: { aktoer: "Mathias", ...s.cur },
    }),
  );
  return { ok: fejl.length === 0, fejl, trin };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = runFrontHalvdel();
  if (!res.ok) {
    console.error("E2E AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log(`e2e OK — front-halvdelen producerer godkendt plan (${res.trin.join(" → ")})`);
}
