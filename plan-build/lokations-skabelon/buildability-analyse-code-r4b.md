# ANALYSE-r4b — mekanisk evidens-trim af r4-verdiktet (aktør: code)

Pakke: lokations-skabelon · run_id: fase2-buildability-code-r4b · samme gatede input som r4 (commit efc85d5e, krav-blob 9402164d, recon-blob 7fbd3a2f — alle rev-parse-verificeret i dette workdir).

**Hvad dette er:** scope-trim, ikke ny dom. Gate-kernens læsebevis-kontrakt (gates.mjs: evidence-blob_oids ⊆ {krav-doc · recon · anker}, krav-doc obligatorisk) afviser r4-verdiktets to kode-template-citater (t10_tables, r7h) som gate-evidens. De citater er fortsat gyldig ANALYSE (arkiveret i buildability-analyse-code-r4.md / mine ANALYSE-r2/r4-filer) — de flyttes til analyse-sporet og erstattes som LÆSEBEVIS af recon-citater der dokumenterer præcis de samme skabelon-kendsgerninger inden for det gatede input.

**Evidens efter trim (bærer fortsat konklusionen):**
- Krav-doc [9,11] (F-01 gate-bevis-reference), [52,67] (K-3 gruppe-model + F-02-Værdi-linjen), [132,145] (K-7 m. F-03), [179,182] (plan-fase-afgørelser m. alle deklarerede valg/defaults), [405,408] (usikkerheds-dispositioner m. F-04) — de fem delta-bærende spans fra r4, uændret.
- Recon [347,358]: det versionerede placement-mønster + client_node_placements (skabelonen bag K-6's daterede koblinger/opslag) — erstatter det direkte t9/t10-kodecitat som læsebevis.
- Recon [721,729]: fitness-gatens håndhævelser (audit-coverage, FK-coverage, SECDEF-sanktionering, app-write-revoke) — bærer K-7 ac 1/K-8/K-9's mekaniske testbarhed.
- Recon [1361,1407]: bøtte 3 (præcis 11 intet-data-fund → F-04; adresse-som-indirekte-PII-flaget → F-03).

**Konklusion uændret: PASS.** Kode-citater flyttet til analyse-spor; dommen fra r4 (v5-delta'et retter F-01..F-04 ærligt, alle 9 K-krav byggelige med testbare acceptkriterier, ingen nye huller) står ved magt med raw-analyse sha256 355677f641b11a7e5158b1310ba8e6fad6c38a00c3760944ad6c51f2474e9890 (ANALYSE-r4.md i wt-b4-code).
