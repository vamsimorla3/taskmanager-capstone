# ESO IRSA Module

Creates the IAM role that External Secrets Operator (ESO) pods assume to
read the database credentials from AWS Secrets Manager, using IRSA
(IAM Roles for Service Accounts).

## Design decisions

- **Trust policy scoped to one exact service account** —
  `system:serviceaccount:external-secrets:external-secrets`. No other
  pod in the cluster, even in the same namespace, can assume this role.
- **Permissions limited to `GetSecretValue`/`DescribeSecret`** on exactly
  one secret ARN — the DB credentials created in the RDS module. Nothing
  broader.

## Inputs

| Variable | Required |
|---|---|
| `project_name` | Yes |
| `oidc_provider_arn` | Yes |
| `oidc_issuer_url` | Yes |
| `secret_arns` | Yes |
| `namespace` | No (default `external-secrets`) |
| `service_account_name` | No (default `external-secrets`) |

## Outputs

- `eso_role_arn`
