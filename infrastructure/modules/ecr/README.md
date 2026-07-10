# ECR Module

Creates KMS-encrypted ECR repositories for each service (backend, frontend),
with automatic vulnerability scanning on push and a lifecycle policy to
expire old images.

## Design decisions

- **`image_tag_mutability = "IMMUTABLE"`** — once pushed, an image tag can't
  be overwritten. Pairs naturally with tagging images by git SHA (unique
  per commit anyway), and prevents accidental tag reuse.
- **`scan_on_push = true`** — ECR's native vulnerability scanning runs on
  every push, complementing (not replacing) the Trivy scan already in CI.
- **Lifecycle policy** keeps only the 10 most recent images per repo, so
  storage cost doesn't grow unbounded.

## Inputs

| Variable | Default |
|---|---|
| `project_name` | (required) |
| `repository_names` | `["backend", "frontend"]` |
| `image_retention_count` | `10` |

## Outputs

- `repository_urls` — map of repo name to full ECR URL
- `repository_arns` — map of repo name to ARN
