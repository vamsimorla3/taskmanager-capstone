variable "project_name" {
  type = string
}

variable "github_org" {
  description = "GitHub organization or username"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name (without org prefix)"
  type        = string
}

variable "ecr_repository_arns" {
  description = "ECR repository ARNs this role is allowed to push to"
  type        = list(string)
}

variable "eks_cluster_arn" {
  description = "EKS cluster ARN this role is allowed to deploy to"
  type        = string
}
