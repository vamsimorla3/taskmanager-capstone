# GitHub Actions OIDC Module

Establishes a keyless trust relationship between GitHub Actions and AWS,
using OIDC (OpenID Connect) instead of long-lived access keys stored as
GitHub Secrets.

## Design decisions

- **No stored AWS credentials in GitHub** — the trust policy allows
  GitHub's own OIDC token service to vouch for workflow runs, and AWS STS
  issues short-lived, automatically-expiring credentials for each run.
- **Trust policy scoped to this exact repository** (`repo:org/repo:*`) —
  a workflow running in any other GitHub repo, even in the same account,
  cannot assume this role.
- **ECR permissions scoped to this project's two repositories** — not
  account-wide ECR access. The one exception is `ecr:GetAuthorizationToken`,
  which AWS's ECR API only supports at the account level (a genuine AWS
  limitation, not a scoping oversight).
- **EKS permission is minimal** (`eks:DescribeCluster` only) — sufficient
  for `aws eks update-kubeconfig`. Actual in-cluster deployment
  permissions are controlled by Kubernetes RBAC (Phase 5), not IAM,
  keeping AWS-level and cluster-level access control cleanly separated.

## Inputs

| Variable | Required |
|---|---|
| `project_name` | Yes |
| `github_org` | Yes |
| `github_repo` | Yes |
| `ecr_repository_arns` | Yes |
| `eks_cluster_arn` | Yes |

## Outputs

- `github_actions_role_arn` — add this as a GitHub Actions secret/variable
  to let `aws-actions/configure-aws-credentials` assume this role
