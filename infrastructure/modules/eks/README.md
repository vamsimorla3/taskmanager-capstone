# EKS Module

Provisions an EKS cluster with a managed node group, OIDC provider (for
IRSA), and the necessary IAM roles for both the control plane and worker
nodes.

## Design decisions

- **No hardcoded Kubernetes version** — the module omits `version` on the
  `aws_eks_cluster` resource, letting AWS default to its current latest
  supported version. This avoids the module going stale as AWS deprecates
  old Kubernetes versions on its own schedule (roughly every 14 months).
- **`endpoint_public_access = true`, `public_access_cidrs = ["0.0.0.0/0"]`**
  — makes the Kubernetes API reachable from anywhere with valid IAM
  credentials, so `kubectl` works from a personal laptop without a
  VPN/bastion setup. A stricter production environment would either
  disable public access entirely (VPN/bastion only) or restrict
  `public_access_cidrs` to specific known IPs.
- **OIDC provider** enables IRSA (IAM Roles for Service Accounts), needed
  in Phase 5 for the AWS Load Balancer Controller and other cluster
  add-ons that need real AWS permissions.
- **Node IAM role** has exactly three policies: worker node join,
  CNI networking, and read-only ECR pull — nothing broader.
- **RDS connectivity** is wired bidirectionally via security group
  references (not CIDR ranges) between this module and the RDS module.

## Inputs

| Variable | Default |
|---|---|
| `project_name` | (required) |
| `vpc_id` | (required) |
| `private_subnet_ids` | (required) |
| `public_subnet_ids` | (required) |
| `node_instance_types` | `["t3.medium"]` |
| `node_desired_size` | `2` |
| `node_min_size` | `1` |
| `node_max_size` | `3` |
| `rds_security_group_id` | `null` |

## Outputs

- `cluster_name`
- `cluster_endpoint`
- `cluster_certificate_authority_data`
- `cluster_security_group_id`
- `oidc_issuer_url`

## Connecting with kubectl

```bash
aws eks update-kubeconfig --region us-east-1 --name <project_name>
kubectl get nodes
```

## Known accepted findings (Trivy)

- **Unrestricted security group egress** (AWS-0104) — the cluster
  security group needs outbound internet access (via NAT gateway) to
  reach AWS API endpoints (EC2, ECR, STS, CloudWatch) for normal control
  plane operation. Properly restricting this would require VPC Interface
  Endpoints for every AWS service the cluster touches — a legitimate
  hardening step, but out of scope for this project's current stage.
- **Public endpoint access enabled, open CIDR** (AWS-0040, AWS-0041) —
  already documented above under Design Decisions. Enables `kubectl`
  access from a personal laptop without a VPN/bastion host. A production
  environment should disable public access entirely or restrict
  `public_access_cidrs` to specific known IPs.
