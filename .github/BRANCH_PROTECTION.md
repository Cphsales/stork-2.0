# Branch-protection — main

Aktiveres på personlig konto med GitHub Pro. To måder: gh CLI eller
UI. Begge skaber samme klassisk branch-protection-regel på `main`.
Verification-step nederst er færdig-kriteriet for A8.

## Beskyttelses-krav

| Setting                                                          | Værdi                                                 |
| ---------------------------------------------------------------- | ----------------------------------------------------- |
| Branch name pattern                                              | `main`                                                |
| Require a pull request before merging                            | ✓                                                     |
| Required approving reviews                                       | 0 (solo — Mathias reviewer egen kode)                 |
| Dismiss stale pull request approvals when new commits are pushed | ✓                                                     |
| Require status checks to pass before merging                     | ✓                                                     |
| Require branches to be up to date before merging                 | ✓                                                     |
| Required status checks                                           | `Lint, typecheck, test, build` (CI workflow job-navn) |
| Require conversation resolution before merging                   | ✓                                                     |
| Require linear history                                           | ✓                                                     |
| Do not allow bypassing the above settings (enforce admins)       | ✓                                                     |
| Allow force pushes                                               | ✗                                                     |
| Allow deletions                                                  | ✗                                                     |

## Metode A — gh CLI (anbefalet)

Forudsætter `gh auth login` er kørt med scope `repo` (admin på
private repos).

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/copenhagensales/stork-2.0/branches/main/protection \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint, typecheck, test, build"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "restrictions": null
}
EOF
```

Succesfuld response ser ud som:

```json
{
  "url": "https://api.github.com/repos/copenhagensales/stork-2.0/branches/main/protection",
  "required_status_checks": { "strict": true, "contexts": ["Lint, typecheck, test, build"], ... },
  "enforce_admins": { "enabled": true, ... },
  ...
}
```

## Metode B — UI

1. Gå til https://github.com/copenhagensales/stork-2.0/settings/branches
2. Under "Branch protection rules" klik **Add classic branch protection rule**
   - (Hvis kun "Add ruleset" vises: brug Metode A i stedet — UI har skiftet til rulesets-only på dit repo. Resultatet er funktionelt identisk)
3. **Branch name pattern:** `main`
4. Tjek følgende bokse:

   **Protect matching branches:**
   - ☑ **Require a pull request before merging**
     - Required approvals: `0` (solo)
     - ☑ Dismiss stale pull request approvals when new commits are pushed
     - ☐ Require review from Code Owners (lad være indtil flere udviklere)
   - ☑ **Require status checks to pass before merging**
     - ☑ Require branches to be up to date before merging
     - Status checks search: tilføj `Lint, typecheck, test, build`
   - ☑ **Require conversation resolution before merging**
   - ☐ Require signed commits (valgfri — kræver GPG-setup)
   - ☑ **Require linear history**
   - ☐ Require deployments to succeed before merging
   - ☐ Lock branch
   - ☑ **Do not allow bypassing the above settings**

   **Rules applied to everyone including administrators:**
   - ☐ Allow force pushes (LAD VÆRE UTJEKKET)
   - ☐ Allow deletions (LAD VÆRE UTJEKKET)

5. Klik **Create** nederst på siden

## Verification — A8-færdig-kriterium

Efter aktivering, kør disse tre tests fra lokal repo. Alle tre SKAL fejle.

### Test 1 — direkte push til main afvises

```bash
git switch main
git pull
git commit --allow-empty -m "branch-protection smoke test"
git push origin main
```

**Forventet output (skal indeholde):**

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
 ! [remote rejected] main -> main (protected branch hook declined)
```

Cleanup (commit'en blev kun lokal):

```bash
git reset --hard HEAD~1
```

### Test 2 — force-push til main afvises

```bash
git switch main
git push origin main --force
```

**Forventet:** `remote rejected` med besked om at force pushes ikke er tilladt.

### Test 3 — branch-deletion afvises

```bash
git push origin --delete main
```

**Forventet:** `remote rejected` med besked om at deletions ikke er tilladt.

### Test 4 (positivt) — protection er aktiv ifølge API

```bash
gh api /repos/copenhagensales/stork-2.0/branches/main/protection \
  | jq '{
      linear_history: .required_linear_history.enabled,
      force_push: .allow_force_pushes.enabled,
      deletions: .allow_deletions.enabled,
      enforce_admins: .enforce_admins.enabled,
      required_checks: .required_status_checks.contexts,
      required_reviews: .required_pull_request_reviews.required_approving_review_count
    }'
```

**Forventet:**

```json
{
  "linear_history": true,
  "force_push": false,
  "deletions": false,
  "enforce_admins": true,
  "required_checks": ["Lint, typecheck, test, build"],
  "required_reviews": 0
}
```

## Hvornår strammer vi op?

- **Når 2. udvikler kommer ind:** sæt `required_approving_review_count` til 1 og aktivér `require_code_owner_reviews: true` (CODEOWNERS er allerede oprettet i `.github/CODEOWNERS`)
- **Når lag B's disciplin-mekanismer lander:** udvid required checks til at inkludere migration-gate, classification-validator, fitness-functions
