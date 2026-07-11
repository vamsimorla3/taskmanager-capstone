# Monitoring Configuration

Helm values overrides for `kube-prometheus-stack`, layered on top of the
default install via `helm upgrade --reuse-values`.

## Files

- `alertmanager-values.yaml` — committed template with a placeholder for
  the Slack webhook URL. Safe to commit; contains no real secret.
- `alertmanager-values.local.yaml` — **gitignored**. Same file with the
  real Slack webhook URL substituted in. Never committed.

## Applying changes

```bash
cp alertmanager-values.yaml alertmanager-values.local.yaml
sed -i "s|SLACK_WEBHOOK_URL_PLACEHOLDER|<real webhook url>|" alertmanager-values.local.yaml
helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring --reuse-values -f alertmanager-values.local.yaml
```

## Design decisions

- **Slack webhook stored via Helm values, not a mounted Secret file** —
  the chart's `slack_api_url_file` + `alertmanagerSpec.secrets` approach
  has known bugs (secret not reliably mounted; see
  [prometheus-community/helm-charts#1864](https://github.com/prometheus-community/helm-charts/issues/1864)).
  The webhook URL still ends up stored as a Kubernetes Secret either
  way (that's how this chart persists its generated AlertManager
  config) - this approach is just more reliable, not less secure.
- **`kubeControllerManager` and `kubeScheduler` default alert rules
  disabled** — these are permanently, unavoidably in a firing state on
  EKS, since AWS manages the control plane outside the cluster's
  visibility. Prometheus can never successfully scrape these
  components on a managed EKS cluster, so the alerts are not
  actionable and would otherwise create constant noise.
- **`Watchdog` alert left enabled** — deliberately always-firing, used
  to verify the alerting pipeline itself (Prometheus → AlertManager →
  Slack) is genuinely working end to end. If it ever stops appearing
  in Slack, that itself is the signal something in the pipeline broke.

## Testing

```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-alertmanager 9093:9093
curl -XPOST http://localhost:9093/api/v2/alerts -H "Content-Type: application/json" \
  -d '[{"labels":{"alertname":"TestAlert","severity":"warning"},"annotations":{"description":"test"}}]'
```

## Log shipping (Fluent Bit → CloudWatch)

`aws-for-fluent-bit` runs as a DaemonSet, tailing all container logs
across every node and shipping them to a dedicated CloudWatch Log
Group, authenticated via IRSA (no stored credentials).

- Log group: `/aws/eks/taskmanager-capstone/application-logs`
- Log streams named per-container:
  `fluentbit-kube.var.log.containers.<pod>_<namespace>_<container>-<id>.log`
- Retention: 14 days (set in Terraform's `fluentbit-irsa` module)

### Verifying

```bash
kubectl logs -n amazon-cloudwatch -l k8s-app=aws-for-fluent-bit --tail=30
MSYS_NO_PATHCONV=1 aws logs describe-log-streams \
  --log-group-name "/aws/eks/taskmanager-capstone/application-logs" \
  --region us-east-1
```

Note: on Windows Git Bash, AWS CLI commands with leading-slash paths
(like CloudWatch log group names) need `MSYS_NO_PATHCONV=1` prefixed,
otherwise Git Bash mangles the path before it reaches the CLI.
