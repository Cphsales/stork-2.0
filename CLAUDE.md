# Stork 2.0

Læs `docs/LÆSEFØLGE.md` ved hver af de fem triggere defineret deri.
Branch-bevidst git-sync før hver trigger (disciplin §13).

## Identiteter (gov-4, 2026-06-10)

- Commits/PR'er: forfattes som `stork-code-bot` (aktiv gh-konto, write — aldrig admin).
- Approvals/code owner: `@mgrubak` (Mathias' personlige konto — kun browser/hans hånd).
- Merge (gov-5-gate-model, Mathias-ratificeret 2026-06-11): mgrubak-approval er
  gaten på BESLUTNINGS-STI-PR'er (CODEOWNERS default-own); rolle-validerede
  PR'er (de ni bogførings-mønstre) merger på grøn CI + kædens discipliner —
  Mathias' gates er ORDENE (krav OK <hash>/slut OK, author-verificeret), ikke
  klikkene; kæden merger aldrig før ordet er registreret. Protection: required
  CI + code-owner-review (gov-4) består; approvals-count 0 (gov-5/13b).
- Protection-/admin-API-kald: det fælles admin-login, KUN på eksplicit Mathias-mandat,
  switch tilbage til bot umiddelbart efter.
- Tjek aktiv konto med `gh auth status` ved tvivl; antag bot som default.

## Kig ikke i (medmindre eksplicit autoriseret af Mathias)

- `/home/mathias/sales-commission-hub/` (stork 1.0 — anti-mønstre, jf. forretningsforstaaelse §15)
- `copenhagensales/*` GitHub-repos (samme grund)
- `docs/coordination/arkiv/` (lukkede pakke-artefakter — kun læsbar reference, ikke aktiv kilde)
- `docs/coordination/rapport-historik/<dato>-<pakke>.md` (historisk; konsulter kun hvis krav-dok refererer)

Hooks i `~/.claude/settings.json` håndhæver de første to + arkiv/. Toggle via lock-filer hvis Mathias autoriserer adgang.
