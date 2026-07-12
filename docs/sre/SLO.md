# Service Level Objectives — Task Manager Backend API

## What this document covers

This defines the reliability targets for the Task Manager backend API,
the Service Level Indicators (SLIs) used to measure them, and the
Prometheus queries that calculate each one in practice. All SLIs are
backed by real metrics already exposed at `/metrics` and scraped by
Prometheus via the `backend` ServiceMonitor (see `k8s/base/`).

## Service Level Indicators (SLIs)

### 1. Availability

**Definition:** the percentage of HTTP requests that complete without
a server error (5xx status code).

**Why this metric:** a 5xx response means the backend itself failed to
handle the request (e.g., a database connection error) — this is the
clearest signal of "is the service actually working," independent of
whether the *client* made a bad request (4xx).

**Prometheus query:**
```promql
sum(rate(http_requests_total{status_code!~"5.."}[30d]))
/
sum(rate(http_requests_total[30d]))
```

### 2. Latency

**Definition:** the percentage of requests served in under 200ms.

**Why this metric:** most endpoints in this API are simple CRUD
operations against a single-table database — 200ms is a generous
threshold that would still catch genuine performance regressions
(e.g., a missing index, a connection pool exhaustion) without being
so tight that normal network jitter counts as a violation.

**Prometheus query:**
```promql
sum(rate(http_request_duration_seconds_bucket{le="0.2"}[30d]))
/
sum(rate(http_request_duration_seconds_count[30d]))
```

### 3. Error Budget Burn Rate

**Definition:** how quickly the service is consuming its allowed
error budget, measured as a short-window rate against the SLO target.

**Prometheus query (1-hour window):**
```promql
sum(rate(http_requests_total{status_code=~"5.."}[1h]))
/
sum(rate(http_requests_total[1h]))
```

## Service Level Objectives (SLOs)

| SLI | Target | Measurement window |
|---|---|---|
| Availability | 99.5% of requests succeed (non-5xx) | Rolling 30 days |
| Latency | 95% of requests complete in <200ms | Rolling 30 days |

### Why these targets, not stricter ones

99.5% availability allows roughly **3.6 hours of full downtime per
month** (or a proportionally larger amount of partial degradation).
This is a deliberately realistic target for a personal capstone
project running on a single (non-multi-AZ) RDS instance and a 2-node
EKS cluster with no redundancy beyond pod replicas — not an
enterprise SLA. A stricter target (e.g., 99.9%) would require
infrastructure this project doesn't have: multi-AZ RDS, cross-region
failover, and a formal on-call rotation.

## Error Budget

At 99.5% availability over 30 days, the error budget is:
- **0.5% of requests may fail** = roughly 3.6 hours of full downtime,
  or equivalently, a larger number of partial-failure minutes spread
  across the month.

**Policy:** if the error budget is exhausted before the end of the
measurement window, new feature work pauses in favor of reliability
work, until the burn rate recovers. (This is a documented policy for
this project; in a solo capstone context, "pausing feature work" means
prioritizing the next debugging/hardening task over new functionality.)

## Alerting tie-in

The `severity=~"critical|warning"` AlertManager routing (see
`k8s/monitoring/alertmanager-values.yaml`) is the operational
mechanism that would catch an SLO-threatening burn rate in practice.
A dedicated burn-rate alert (multi-window, multi-burn-rate, per
Google's SRE workbook pattern) is a documented future enhancement —
the current alerting catches infrastructure-level failures
(pod crashes, node issues) but does not yet have a dedicated
SLO-burn-rate alert rule.
