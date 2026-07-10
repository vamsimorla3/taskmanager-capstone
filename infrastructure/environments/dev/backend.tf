terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "taskmanager-capstone-tfstate-381492217656"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "taskmanager-capstone-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}
