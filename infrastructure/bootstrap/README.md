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

## Known accepted findings (Trivy)

Two low-severity Trivy findings are intentionally not addressed:

- **S3 bucket logging disabled** (AWS-0089) — would require a separate
  log-destination bucket solely to hold access logs for this one bucket.
  Given this bucket only stores Terraform state (not user-facing data),
  the operational overhead isn't justified for this project's scale.
- **DynamoDB CMK encryption** (AWS-0025) — the table already uses
  AWS-managed encryption at rest; a customer-managed key adds cost and
  complexity without meaningful additional protection for a lock table
  containing no sensitive data itself (only lock metadata).

Both are documented here as deliberate scope decisions, not oversights.
