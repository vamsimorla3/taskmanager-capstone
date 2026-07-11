# Fluent Bit IRSA Module

Creates the IAM role and dedicated CloudWatch Log Group for Fluent Bit
to ship container logs from EKS to CloudWatch.

## Design decisions

- **Trust policy scoped to `system:serviceaccount:amazon-cloudwatch:fluent-bit`**
  — the standard namespace/service-account combination used by AWS's
  own `aws-for-fluent-bit` setup guide.
- **14-day log retention** — reasonable default for a personal project;
  longer retention increases CloudWatch storage cost.
- **Permissions scoped to this one log group** — not account-wide
  CloudWatch Logs access.

## Inputs

| Variable | Required |
|---|---|
| `project_name` | Yes |
| `oidc_provider_arn` | Yes |
| `oidc_issuer_url` | Yes |

## Outputs

- `fluentbit_role_arn`
- `log_group_name`
