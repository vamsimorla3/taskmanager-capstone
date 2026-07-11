variable "project_name" {
  type = string
}

variable "oidc_provider_arn" {
  description = "ARN of the EKS cluster's OIDC provider"
  type        = string
}

variable "oidc_issuer_url" {
  description = "OIDC issuer URL, without the https:// prefix"
  type        = string
}

variable "secret_arns" {
  description = "Secrets Manager ARNs this role is allowed to read"
  type        = list(string)
}

variable "namespace" {
  type    = string
  default = "external-secrets"
}

variable "service_account_name" {
  type    = string
  default = "external-secrets"
}
