# RDS Module

Provisions a private, encrypted PostgreSQL RDS instance, with generated
credentials stored in AWS Secrets Manager (never in Terraform state as
plaintext-only, never typed into any file).

## Design decisions

- **`publicly_accessible = false`** — reachable only from within the VPC
- **Security group uses `allowed_security_group_ids`** (referenced security
  groups) rather than CIDR ranges — access is granted to *specific*
  resources (e.g. EKS worker nodes, wired in once the EKS module exists),
  not to an IP range
- **`random_password` + Secrets Manager** — no hardcoded credentials
  anywhere in code or state
- **`skip_final_snapshot = true`, `deletion_protection = false`** —
  deliberately permissive for a dev/personal project to allow easy
  teardown; a production environment should flip both

## Inputs

| Variable | Default |
|---|---|
| `project_name` | (required) |
| `vpc_id` | (required) |
| `private_subnet_ids` | (required) |
| `db_name` | `taskmanager` |
| `db_username` | `taskadmin` |
| `db_instance_class` | `db.t3.micro` |
| `allowed_security_group_ids` | `[]` |

## Outputs

- `db_endpoint`
- `db_security_group_id`
- `db_secret_arn`
