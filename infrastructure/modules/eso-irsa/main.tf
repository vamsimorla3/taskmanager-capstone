# Trust policy: only the external-secrets service account, in its
# specific namespace, running in this specific cluster, can assume
# this role - not just any pod in the cluster
resource "aws_iam_role" "eso" {
  name = "${var.project_name}-eso-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = var.oidc_provider_arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${var.oidc_issuer_url}:aud" = "sts.amazonaws.com"
          "${var.oidc_issuer_url}:sub" = "system:serviceaccount:${var.namespace}:${var.service_account_name}"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "eso_secrets_read" {
  name = "${var.project_name}-eso-secrets-read"
  role = aws_iam_role.eso.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
      Resource = var.secret_arns
    }]
  })
}
