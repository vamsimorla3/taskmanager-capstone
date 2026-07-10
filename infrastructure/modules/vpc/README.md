# VPC Module

Creates the networking foundation: a VPC with public and private subnets
across 2 availability zones, an internet gateway, a single NAT gateway,
and route tables.

## Design decisions

- **Single NAT gateway** (not one per AZ) — a cost-conscious choice for a
  personal project. A production setup would typically use one NAT per AZ
  for high availability; this project accepts a single point of failure
  in exchange for roughly 2-3x lower monthly cost.
- **EKS subnet tags** (`kubernetes.io/role/elb`, `kubernetes.io/cluster/*`)
  are pre-applied so the AWS Load Balancer Controller (Phase 5) can
  automatically discover the correct subnets without manual configuration.

## Inputs

| Variable | Default |
|---|---|
| `project_name` | (required) |
| `vpc_cidr` | `10.0.0.0/16` |
| `azs` | `["us-east-1a", "us-east-1b"]` |
| `public_subnet_cidrs` | `["10.0.1.0/24", "10.0.2.0/24"]` |
| `private_subnet_cidrs` | `["10.0.11.0/24", "10.0.12.0/24"]` |

## Outputs

- `vpc_id`
- `public_subnet_ids`
- `private_subnet_ids`
