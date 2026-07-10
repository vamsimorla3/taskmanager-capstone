resource "random_password" "db_password" {
  length  = 24
  special = false
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow Postgres access from application security groups only"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_app" {
  for_each = toset(var.allowed_security_group_ids)

  security_group_id            = aws_security_group.rds.id
  referenced_security_group_id = each.value
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "Postgres access from application security group"
}

# Egress restricted to the VPC's own CIDR range rather than the whole
# internet - RDS's own AWS-managed traffic (backups, patching, etc.)
# happens outside this security group's control, so there's no need
# for broad outbound access here.
resource "aws_vpc_security_group_egress_rule" "rds_vpc_outbound" {
  security_group_id = aws_security_group.rds.id
  cidr_ipv4          = var.vpc_cidr
  ip_protocol        = "-1"
  description        = "Allow outbound traffic within the VPC only"
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "15"

  instance_class    = var.db_instance_class
  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  iam_database_authentication_enabled = true
  performance_insights_enabled        = true

  # Not publicly accessible - only reachable from within the VPC
  publicly_accessible = false

  multi_az = false

  backup_retention_period = 7
  skip_final_snapshot     = true

  # Deliberately false for this dev/personal project, to allow easy
  # teardown between work sessions. A production environment should
  # set this to true. See module README for full rationale.
  deletion_protection = false

  tags = {
    Name = "${var.project_name}-db"
  }
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${var.project_name}/db-credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    host     = aws_db_instance.main.address
    port     = 5432
    dbname   = var.db_name
  })
}
