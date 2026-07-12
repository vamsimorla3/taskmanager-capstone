# Chaos Experiment: Backend Pod Termination

## Hypothesis

If a backend pod is forcefully terminated, the service should remain
available (via the remaining replica) with no user-visible downtime,
and Kubernetes should automatically replace the terminated pod within
seconds.

## Steady state (before the experiment)

```bash
kubectl get pods -n taskmanager -l app=backend
curl -s -o /dev/null -w "%{http_code}\n" http://<alb-url>/health
```
Expected: 2 pods `Running`, health check returns `200`.

## The experiment

```bash
# Identify one backend pod
kubectl get pods -n taskmanager -l app=backend

# Delete it directly (simulates a node failure / OOM kill / crash)
kubectl delete pod <pod-name> -n taskmanager

# Immediately start polling the real public endpoint
while true; do
  curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" http://<alb-url>/health
  sleep 1
done
```

## What to observe

- Does the ALB continue routing traffic successfully during the
  disruption? (Watch the curl loop for any non-200 or elevated latency)
- How long until `kubectl get pods` shows a replacement pod `Running`?
- Does Grafana's "Request Rate by Endpoint" panel show any gap or
  error spike during the event?
- Does an alert fire in Slack? (It shouldn't for a single pod
  replacement under normal HPA/replica-count operation - that's
  expected, healthy self-healing, not an incident)

## Results

*(Fill in after running the experiment)*

- Time to new pod `Running`:
- Any failed health checks during the window:
- Any Slack alert fired:
- Conclusion: did the hypothesis hold?

## Rollback / cleanup

No cleanup needed - Kubernetes' own reconciliation is the recovery
mechanism being tested. If the deployment doesn't self-heal within a
reasonable window (~60s), investigate via `kubectl describe deployment
backend -n taskmanager` before manually intervening.
