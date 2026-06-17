# workflow/-regelflade (Pakke 1)

**Aktør-flade** (teknisk; Mathias læser den ikke — jf. flade-arkitektur). Bygges efter den godkendte plan `workflow-faerdiggoerelse-pakke1-plan @ 94c70eb` (krav-hash `c964826…b79`). ÉN regel-flade, ikke parallelle docs (doc-vægt). Eksekverbare klausuler er autoritative; denne fil dokumenterer.

## Klausul (a) — gate-ord + dispositions-vokabular ✅ bygget

Autoritativ kilde: `workflow/gate-def.json` · checker: `scripts/workflow/gate-check.mjs` · bevis: `scripts/workflow/gate-check.selftest.mjs` (kanariefugl: ukendt gate-ord/disposition → afvist).

- **Gate-ord (eksterne):** `krav OK` · `plan OK` · `build OK` → interne states (`krav-laast` / `plan-laast` / `build-laast`), jf. S12.
- **Dispositions-vokabular:** `BLOCKER` · `FIX-NOW` · `FOLLOW-UP` · `FALSE-POSITIVE-WITH-EVIDENCE` · `MATHIAS-GATE`.

## Klausuler (b)–(m) — bygges gennem Leverance 1

(b) spec-skema · (c) Mathias-kommunikationskontrakt · (d) recon-præsentationskontrakt + recon-output-skema · (e) grundig-recon-kontrakt · (f) krav-troskab-metode (+ kumulativ kæde-troskab) · (g) review-dybde-kontrakt (to faser + proportionel re-validering) · (h) recon-dybde-kontrakt · (i) repo-hygiejne-/klassifikations-kontrakt · (j) aktør-handoff-/læsekanal-kontrakt · (k) djævlens-advokat-kontrakt · (l) Claude.ai chat-recon-kontrakt · (m) self-validerings-kontrakt.

Hver klausul bygges som tekst-der-ER-funktionen med en fejlende test (kanariefugl), gerne eksekverbar (primitiv-først). Codex' bindende fortolkninger fra gate-passet bæres ind: S5-routing letter **bredde/scope**, aldrig S6's fulde recon-dybde af berørt scope.
