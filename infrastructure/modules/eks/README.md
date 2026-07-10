# EKS Module

Provisions an EKS cluster with a managed node group, OIDC provider (for
IRSA), and the necessary IAM roles for both the control plane and worker
nodes.

## Design decisions

- **No hardcoded Kubernetes version** — the module omits `version` on the
  `aws_eks_cluster` resource, letting AWS default to its current latest
  supported version. This avoids the module going stale as AWS deprecates
  old Kubernetes versions on its own schedule (roughly every 14 months).
- **Public API access restricted to a specific IP** — `public_access_cidrs`
  is set via `var.public_access_cidrs` (a `/32` CIDR for the operator's own
  public IP), not `0.0.0.0/0`. This closes the cluster off from the rest of
  the internet while keeping `kubectl` working. **Caveat:** if the
  operator's ISP assigns a dynamic IP, this address may change over time,
  requiring `terraform.tfvars` to be updated and re-applied.
- **Cluster egress restricted to HTTPS (443)** — the control plane only
  needs outbound HTTPS to reach AWS APIs (ECR, STS, CloudWatch, etc.), so
  egress is scoped to TCP/443 rather than all protocols/ports.
- **OIDC provider** enables IRSA (IAM Roles for Service Accounts), needed
  in Phase 5 for the AWS Load Balancer Controller and other cluster
  add-ons that need real AWS permissions.
- **Node IAM role** has exactly three policies: worker node join,
  CNI networking, and read-only ECR pull — nothing broader.
- **RDS connectivity** is wired bidirectionally via security group
  references (not CIDR ranges) between this module and the RDS module.
- **EKS Kubernetes secrets encrypted** with a dedicated customer-managed
  KMS key (`encryption_config` on the cluster resource).

## Known accepted findings (Trivy)

- **Unrestricted egress CIDR** (AWS-0104) — Trivy still flags the egress
  rule's `0.0.0.0/0` CIDR even after restricting to port 443, because AWS
  service endpoints don't have fixed IP ranges. Fully resolving this would
  require VPC Interface Endpoints for each AWS service the cluster touches
  (EC2, ECR, STS, CloudWatch) — a legitimate follow-up hardening step,
  out of scope for this project's current stage.

## Inputs

| Variable | Default |
|---|---|
| `project_name` | (required) |
| `vpc_id` | (required) |
| `private_subnet_ids` | (required) |
| `public_subnet_ids` | (required) |
| `public_access_cidrs` | `["0.0.0.0/0"]` (should be overridden with your own IP) |
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

## If your IP changes

Update `my_ip_cidr` in `infrastructure/environments/dev/terraform.tfvars`,
then run `terraform apply` in that directory.
