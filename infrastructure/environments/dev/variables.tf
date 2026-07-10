variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "taskmanager-capstone"
}

variable "my_ip_cidr" {
  description = "Your public IP in CIDR notation, for restricting EKS API access"
  type        = string
}
