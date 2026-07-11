# Kubernetes Manifests

## Known follow-up (Trivy)

- **KSV-0020/KSV-0021** — `runAsUser`/`runAsGroup` should be > 10000.
  Currently backend runs as UID 100, frontend as UID 101 (the actual
  UIDs baked into their respective Docker images by `addgroup`/`adduser`
  and the `nginxinc/nginx-unprivileged` base image). Raising these above
  10000 requires rebuilding both images with an explicit high UID/GID
  set in the Dockerfile (e.g. `adduser -u 10001 ...`), not just a
  manifest change. This is a genuine near-term follow-up, not a
  permanently accepted risk — both UIDs are still non-root and
  non-privileged today, just not above the specific threshold Trivy's
  rule checks for.
