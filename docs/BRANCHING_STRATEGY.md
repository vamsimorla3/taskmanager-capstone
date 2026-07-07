# Branching Strategy (GitFlow)

## Branches

| Branch | Purpose |
|---|---|
| `main` | Production-ready code only. Protected — no direct pushes, PR + 1 approval required. |
| `develop` | Integration branch. All feature/fix branches merge here first. |
| `feature/<description>` | New features, branched off `develop`. |
| `fix/<description>` | Bug fixes, branched off `develop`. |
| `hotfix/<description>` | Critical production fixes, branched off `main` directly. |
| `release/<version>` | Release preparation/stabilization branches. |

## Workflow

1. Branch off `develop`:
```bash
   git checkout develop
   git pull
   git checkout -b feature/add-task-priority
```
2. Commit using [Conventional Commits](https://www.conventionalcommits.org/).
3. Push and open a PR into `develop`.
4. After review/approval, merge into `develop`.
5. Periodically, `develop` is merged into `main` via a release PR once stable.

## Branch Protection

`main` is protected via a GitHub ruleset requiring:
- Pull request before merging (1 approval)
- Dismissal of stale approvals on new commits
- No force pushes
- No branch deletion

**Documented simplification:** the original spec calls for 2 required reviewers
and signed (GPG) commits. Since this project is currently developed solo, the
reviewer count is set to 1, and commit signing is not yet enforced. Both would
be enabled in a real team setting — see `main` ruleset in repo Settings for the
exact enforced rules today.

## Commit Message Format

Following [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add task priority field`
- `fix: resolve database connection pool leak`
- `ci: add trivy image scan stage`
- `docs: add SLO definitions and runbooks`
- `refactor: split app.js from server.js for testability`
- `test: add PUT/DELETE endpoint coverage`
