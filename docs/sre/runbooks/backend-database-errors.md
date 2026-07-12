# Runbook: Backend Returning 500 Errors (Database Connectivity)

## Symptoms
- `/api/tasks` and related endpoints return `500 {"error":"internal server error"}`
- `/health` still returns `200` (the app itself is up; only DB-dependent
  routes are failing)
- Grafana's "Error Rate (5xx/sec)" panel shows a spike
- AlertManager may fire a warning/critical alert in `#alerts` if the
  error rate crosses a threshold

## Likely causes (in order of how often we've actually hit these)

### 1. Security group misconfiguration
**How to check:**
```bash
kubectl logs -n taskmanager -l app=backend --tail=20 | grep -i error
```
Look for: `connect ETIMEDOUT <ip>:5432`

**This means:** the backend pod's security group isn't allowed to reach
RDS on port 5432. A timeout (not "connection refused") is the specific
signal — RDS's security group is silently dropping the traffic.

**Fix:**
```bash
# Confirm which SG the nodes actually use (not necessarily the one
# Terraform's EKS module explicitly created - EKS auto-generates its
# own cluster security group that nodes actually use)
aws eks describe-cluster --name taskmanager-capstone \
  --query "cluster.resourcesVpcConfig.clusterSecurityGroupId" --region us-east-1

# Confirm RDS's allowed ingress security groups
aws rds describe-db-instances --db-instance-identifier taskmanager-capstone-db \
  --query "DBInstances[0].VpcSecurityGroups" --region us-east-1
```
If they don't match, update `infrastructure/modules/rds/main.tf`'s
`allowed_security_group_ids` to include the correct SG, then
`terraform apply` in `infrastructure/environments/dev`.

### 2. SSL/TLS requirement
**How to check:** same log command as above.
Look for: `no pg_hba.conf entry for host "...", no encryption`

**This means:** the connection reached RDS fine, but RDS is rejecting
it because Postgres wasn't asked to use SSL. RDS Postgres requires
SSL by default.

**Fix:** already resolved in `backend/src/config/db.js` via the
`ssl: { rejectUnauthorized: false }` config, gated by `DB_SSL` env var
(`false` for local Docker Compose, unset/true for RDS). If this
recurs, confirm the `DB_SSL` env var isn't accidentally set to `false`
in the Kubernetes Deployment.

### 3. Missing database schema
**How to check:** same log command.
Look for: `relation "tasks" does not exist`

**This means:** the pod can reach and authenticate to RDS fine, but
the actual `tasks` table was never created on this specific database
instance (e.g., after a fresh RDS create via `terraform apply`).

**Fix:**
```bash
kubectl run psql-migrate --rm -it --image=postgres:15 --namespace=taskmanager \
  --restart=Never --command -- psql \
  "host=<rds-endpoint> port=5432 user=taskadmin password=<from-secrets-manager> dbname=taskmanager sslmode=require" \
  -c "CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, done BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW());"
```
Get the real password with:
```bash
kubectl get secret db-credentials -n taskmanager -o jsonpath='{.data.password}' | base64 -d
```

**Important (Windows Git Bash):** run the `kubectl run ... psql ...`
command as a single line, not with `\` line continuations — Git Bash
can mangle multi-line piped commands into an invalid entrypoint.

## Escalation
If none of the above resolves it within 15 minutes, check:
- `kubectl get pods -n taskmanager` for pod-level crash loops
- RDS instance status in the AWS console (is it actually available,
  not in a maintenance/failover state)
- VPC NAT gateway health (private subnet egress could be affected)
