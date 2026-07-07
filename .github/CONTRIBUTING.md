# Contributing

## Branching Strategy
See [docs/BRANCHING_STRATEGY.md](../docs/BRANCHING_STRATEGY.md).

## Making a Change
1. Create a branch off `develop`: `feature/<description>` or `fix/<description>`
2. Make your changes, commit using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: ...` for new features
   - `fix: ...` for bug fixes
   - `docs: ...` for documentation
   - `ci: ...` for CI/CD changes
3. Push your branch and open a PR into `develop`
4. Ensure all checks pass and the PR template is filled out
5. Request review; address feedback
6. Once approved, merge

## Running Tests Locally
```bash
cd backend
npm test
```

## Local Development
```bash
docker compose up -d --build
```
