# Terraform State Backend (Bootstrap)

This module creates the S3 bucket and DynamoDB table used as the remote
backend for every other Terraform module in this project.

**This module intentionally does NOT use a remote backend itself** — it
creates that backend, so it keeps its own state locally, applied once,
and rarely touched again.

## Usage

```bash
cd infrastructure/bootstrap
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars with your own bucket name (must be globally unique)
terraform init
terraform plan
terraform apply
```

## Resources created

- S3 bucket (versioned, encrypted, private) for Terraform state
- DynamoDB table for state locking

## Note

Do not run `terraform destroy` on this module unless you're certain no
other Terraform module still depends on this backend — doing so would
delete the state for every other module.
