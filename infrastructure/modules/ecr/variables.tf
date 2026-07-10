variable "project_name" {
  type = string
}

variable "repository_names" {
  description = "List of ECR repository names to create (e.g. backend, frontend)"
  type        = list(string)
  default     = ["backend", "frontend"]
}

variable "image_retention_count" {
  description = "Number of most recent images to keep per repository"
  type        = number
  default     = 10
}
