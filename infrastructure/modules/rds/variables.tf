variable "project_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "db_name" {
  type    = string
  default = "taskmanager"
}

variable "db_username" {
  type    = string
  default = "taskadmin"
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "allowed_security_group_ids" {
  description = "Security groups allowed to connect to RDS (e.g. EKS node security group)"
  type        = list(string)
  default     = []
}

variable "vpc_cidr" {
  description = "VPC CIDR block, used to scope RDS security group egress"
  type        = string
  default     = "10.0.0.0/16"
}
