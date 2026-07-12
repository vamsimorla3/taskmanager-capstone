# Runbook: Pod Stuck in CreateContainerConfigError

## Symptoms
```bash
kubectl get pods -n taskmanager
# NAME                       READY   STATUS                       RESTARTS
# backend-xxxxx-xxxxx        0/1     CreateContainerConfigError   0
```

## How to check the real reason
```bash
kubectl get events -n taskmanager --sort-by='.lastTimestamp' | tail -20
```

## Cause 1: `runAsNonRoot` can't verify a named user

**Look for:**
Error: container has runAsNonRoot and image has non-numeric user
(appuser), cannot verify user is non-root
**This means:** the Dockerfile sets the container user by *name*
(`USER appuser`), which Docker resolves fine at runtime, but
Kubernetes' `runAsNonRoot: true` check can't resolve a name to a
number by inspecting the image - it needs a numeric UID explicitly.

**Fix:** find the actual UID baked into the image:
```bash
docker run --rm <image> id <username>
```
Then add `runAsUser: <that-number>` to the pod's `securityContext` in
the Deployment manifest.

## Cause 2: `readOnlyRootFilesystem` breaks a process needing to write

**Look for (in pod logs, not events):**
mkdir() "/tmp/proxy_temp" failed (30: Read-only file system)
(Nginx-specific example; other runtimes have their own equivalent.)

**This means:** the container's process needs to write to a specific
directory at runtime (temp files, caches, sockets) that now lives on
a read-only filesystem.

**Fix:** do NOT disable `readOnlyRootFilesystem` - instead, mount a
narrow `emptyDir` volume at exactly the path that needs write access:
```yaml
volumeMounts:
  - name: nginx-tmp
    mountPath: /tmp
volumes:
  - name: nginx-tmp
    emptyDir: {}
```
This keeps the rest of the image genuinely read-only while giving the
one specific directory a writable, ephemeral scratch space.

## General diagnostic approach
1. `kubectl get events` first - not `kubectl logs`, since a
   `CreateContainerConfigError` pod often has no logs yet (the
   container never actually started)
2. Once the container does start but crashes, switch to
   `kubectl logs <pod> -n <namespace>` for the real runtime error
3. Never disable a security hardening setting to "fix" the symptom -
   find the specific narrow accommodation (numeric UID, targeted
   volume mount) instead
