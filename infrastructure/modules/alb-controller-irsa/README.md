# ALB Controller IRSA Module

Creates the IAM policy and role that the AWS Load Balancer Controller
assumes (via IRSA) to provision and manage real ALBs on behalf of
Kubernetes Ingress resources.

## Design decisions

- **`iam_policy.json`** is the official, unmodified policy published by
  the `kubernetes-sigs/aws-load-balancer-controller` project (v3.3.0).
  Kept as a literal file rather than retyped into `jsonencode()`, to
  avoid transcription drift from the upstream source and make future
  updates a simple file swap.
- **Trust policy scoped to one exact service account** —
  `system:serviceaccount:kube-system:aws-load-balancer-controller`.

## Inputs

| Variable | Required |
|---|---|
| `project_name` | Yes |
| `oidc_provider_arn` | Yes |
| `oidc_issuer_url` | Yes |

## Outputs

- `alb_controller_role_arn`
