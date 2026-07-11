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

## Autoscaling

Both `backend` and `frontend` have HorizontalPodAutoscalers:

- **backend**: 2-6 replicas, scales on CPU (70%) or memory (80%)
- **frontend**: 2-4 replicas, scales on CPU (70%) only

Requires `metrics-server` (installed cluster-wide, not part of this
repo's manifests — see [metrics-server docs](https://github.com/kubernetes-sigs/metrics-server)
for the install command if setting up a fresh cluster).

Scale-up reacts within 30s; scale-down waits 120s of sustained low usage
to avoid flapping.

## Ingress (ALB)

A single Ingress routes public traffic through one AWS Application Load
Balancer to both services:

- `/api`, `/health`, `/metrics` → backend
- `/` (everything else) → frontend

**HTTPS is not yet configured** — this is currently HTTP-only, since
TLS requires a real domain name and an ACM certificate, neither of
which exist for this project yet. This is a documented near-term
follow-up, not an oversight; a production deployment would add:
- A registered domain (Route 53 or external registrar)
- An ACM certificate for that domain
- `alb.ingress.kubernetes.io/certificate-arn` annotation + HTTPS listener

## Image tags

Deployment manifests currently pin specific image SHA tags. When a new
image is pushed via CI, these manifests need a corresponding update
(`kubectl apply` after editing the tag) to actually deploy the new
version — image tags are not automatically tracked. A GitOps tool
(ArgoCD/Flux) or a CD pipeline step that patches the deployment image
would automate this in a more mature setup.

## Monitoring

A `ServiceMonitor` scrapes the backend's `/metrics` endpoint every 15s.

**Important:** the `backend` Service needs `metadata.labels` (not just
`spec.selector`) matching the ServiceMonitor's `selector.matchLabels` -
these are two genuinely different things. `spec.selector` controls
which pods the Service routes traffic to; `metadata.labels` is what
Prometheus Operator's ServiceMonitor actually matches against to find
the Service object itself. Missing the latter silently results in zero
scrape targets, with no error - only "No targets" in Prometheus's UI.
