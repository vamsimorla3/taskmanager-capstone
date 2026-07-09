# CI/CD Secrets

This documents every secret used or planned for this project's GitHub Actions
workflows — both what's configured today and what Phase 4/5 will require.

## Currently configured

| Secret | Used by | Purpose |
|---|---|---|
| `SONAR_TOKEN` | `ci.yml` (test job) | Authenticates SonarCloud Quality Gate scans |
| `GITHUB_TOKEN` | `ci.yml` (test job, SARIF uploads) | Auto-provided by GitHub Actions; posts PR comments, uploads Security tab findings. No manual setup needed. |

## Planned (added once Phase 4 infrastructure exists)

| Secret | Will be used by | Purpose |
|---|---|---|
| `AWS_ACCOUNT_ID` | `cd.yml` | Constructs the ECR repository URI |
| `AWS_REGION` | `cd.yml` | Target AWS region for ECR/EKS |
| (OIDC role, not a secret) | `cd.yml` | Authenticates to AWS via GitHub's OIDC provider — no long-lived AWS keys stored in GitHub at all |
| `SLACK_WEBHOOK_URL` | `cd.yml` | Posts deployment success/failure notifications |

## Why OIDC instead of AWS access keys

Rather than storing a long-lived `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` pair
as GitHub Secrets, this project will use GitHub's OIDC (OpenID Connect) identity
provider once Phase 4 provisions the IAM role. This means:
- No AWS credentials are ever stored in GitHub, even encrypted
- Each workflow run gets a short-lived, automatically-expiring token
- The IAM role's trust policy restricts exactly which repo/branch can assume it

## Adding a new secret

1. Go to Settings → Secrets and variables → Actions → New repository secret
2. Add the name and value
3. Reference it in a workflow as `${{ secrets.SECRET_NAME }}`
4. Update this file

## Action pinning status

Per governance requirements, third-party GitHub Actions should be pinned to a
full commit SHA rather than a moving tag. Current status:

| Action | Pinned to |
|---|---|
| `actions/checkout` | Full SHA ✅ |
| `actions/setup-node` | Full SHA ✅ |
| `actions/upload-artifact` | Full SHA ✅ |
| `SonarSource/sonarqube-scan-action` | Full SHA ✅ |
| `aquasecurity/trivy-action` | Full SHA ✅ |
| `github/codeql-action/upload-sarif` | Major version tag only (`@v3`) — full SHA not yet verified |
| `docker/setup-buildx-action` | Major version tag only (`@v3`) — full SHA not yet verified |
| `docker/build-push-action` | Major version tag only (`@v6`) — full SHA not yet verified |

The three unpinned actions are maintained directly by GitHub and Docker
(not third-party publishers), which somewhat reduces supply-chain risk
compared to a random community action — but full SHA pinning remains the
goal and should be completed in a follow-up PR.
