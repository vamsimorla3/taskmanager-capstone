module "vpc" {
  source = "../../modules/vpc"
  project_name = var.project_name
}

module "eks" {
  source = "../../modules/eks"
  project_name       = var.project_name
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids
  rds_security_group_id = module.rds.db_security_group_id
  public_access_cidrs    = [var.my_ip_cidr]
}

module "rds" {
  source = "../../modules/rds"
  project_name       = var.project_name
  vpc_id             = module.vpc.vpc_id
  vpc_cidr           = module.vpc.vpc_cidr
  private_subnet_ids = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.eks.cluster_security_group_id]
}

module "ecr" {
  source = "../../modules/ecr"
  project_name = var.project_name
}

module "github_oidc" {
  source = "../../modules/github-oidc"
  project_name = var.project_name
  github_org   = "vamsimorla3"
  github_repo  = "taskmanager-capstone"

  ecr_repository_arns = values(module.ecr.repository_arns)
  eks_cluster_arn      = module.eks.cluster_arn
}
