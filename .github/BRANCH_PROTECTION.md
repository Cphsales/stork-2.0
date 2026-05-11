# Branch-protection — main

Skal anvendes manuelt på `main`-branchen via
GitHub Settings → Branches → Add rule, eller via `gh api`.

## Påkrævede settings

| Setting                                                          | Værdi                                                           |
| ---------------------------------------------------------------- | --------------------------------------------------------------- |
| Branch name pattern                                              | `main`                                                          |
| Require a pull request before merging                            | ✓                                                               |
| Required approving reviews                                       | 1                                                               |
| Dismiss stale pull request approvals when new commits are pushed | ✓                                                               |
| Require review from Code Owners                                  | ✓ (når CODEOWNERS udfyldes)                                     |
| Require status checks to pass before merging                     | ✓                                                               |
| Require branches to be up to date before merging                 | ✓                                                               |
| Required status checks                                           | `Lint, typecheck, test, build` (fra `.github/workflows/ci.yml`) |
| Require conversation resolution before merging                   | ✓                                                               |
| Require signed commits                                           | optional                                                        |
| Require linear history                                           | ✓                                                               |
| Do not allow bypassing the above settings                        | ✓                                                               |
| Allow force pushes                                               | ✗                                                               |
| Allow deletions                                                  | ✗                                                               |

## Kommando-baseret opsætning (gh CLI)

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/copenhagensales/stork-2.0/branches/main/protection \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]='Lint, typecheck, test, build' \
  -f enforce_admins=true \
  -f required_pull_request_reviews[required_approving_review_count]=1 \
  -f required_pull_request_reviews[dismiss_stale_reviews]=true \
  -f required_pull_request_reviews[require_code_owner_reviews]=true \
  -f required_linear_history=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f required_conversation_resolution=true \
  -f restrictions=
```

## Validering

Efter aktivering:

1. Forsøg direkte push til `main` lokalt → skal afvises
2. PR uden grøn CI → kan ikke merges
3. PR uden review-approval → kan ikke merges
4. PR med merge-commit fra ikke-aktuel base → kræver rebase

## Lag A-færdig-kriterium

> Tom PR der ændrer ét README.md skal trigge alle CI-checks og passere.

Valideret når `Lint, typecheck, test, build` job kører grønt på PR #1
første gang denne workflow rammer GitHub Actions.
