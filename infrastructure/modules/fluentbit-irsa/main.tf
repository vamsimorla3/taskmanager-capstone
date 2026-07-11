resource "aws_cloudwatch_log_group" "cluster_logs" {
  name              = "/aws/eks/${var.project_name}/application-logs"
  retention_in_days = 14
}

resource "aws_iam_role" "fluentbit" {
  name = "${var.project_name}-fluentbit-role"

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
          "${var.oidc_issuer_url}:sub" = "system:serviceaccount:amazon-cloudwatch:fluent-bit"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "fluentbit_cloudwatch" {
  name = "${var.project_name}-fluentbit-cloudwatch"
  role = aws_iam_role.fluentbit.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
      ]
      Resource = "${aws_cloudwatch_log_group.cluster_logs.arn}:*"
    }]
  })
}
