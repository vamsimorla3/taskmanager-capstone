# Runbook: Application Metrics Missing from Prometheus

## Symptoms
- Grafana dashboard panels for the application show "No data"
- `http://localhost:9090/targets` (Prometheus UI) shows the relevant
  `serviceMonitor/<namespace>/<name>/0` pool as "No targets" (not an
  error — genuinely zero discovered targets)

## Root cause (the one we've actually hit)

The `ServiceMonitor`'s `selector.matchLabels` must match labels on the
**Service object's own `metadata.labels`** — not `spec.selector`.
These are two different things:
- `spec.selector` controls which *pods* the Service routes traffic to
- `metadata.labels` is what a `ServiceMonitor` actually searches
  against to find the Service in the first place

Missing `metadata.labels` on the Service produces zero scrape targets,
silently, with no error anywhere - only "No targets" in Prometheus's
UI is any hint of the deviation.

## How to check
```bash
kubectl get service <service-name> -n <namespace> --show-labels
```
If `LABELS` shows `<none>`, that's the problem.

## Fix
Add `metadata.labels` to the Service manifest, matching the
ServiceMonitor's `selector.matchLabels`:
```yaml
metadata:
  name: backend
  namespace: taskmanager
  labels:
    app: backend   # <- this line is what was missing
```
Apply, then wait ~30s for Prometheus's next discovery cycle and check
`http://localhost:9090/targets` again (or `Show empty pools` if it's
still hidden as an empty pool).

## Also verify
The `ServiceMonitor` itself needs the label matching your
`kube-prometheus-stack` Helm release name (default selector):
```yaml
metadata:
  labels:
    release: kube-prometheus-stack
```
Without this, the Prometheus Operator ignores the ServiceMonitor
entirely, regardless of whether the Service's labels are correct.
