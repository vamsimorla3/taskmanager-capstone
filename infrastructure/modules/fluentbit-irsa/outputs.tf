output "fluentbit_role_arn" {
  value = aws_iam_role.fluentbit.arn
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.cluster_logs.name
}
