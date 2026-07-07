# Task Manager — AWS SRE DevOps Capstone

A production-grade, full-stack Task Management application, built to demonstrate
end-to-end DevOps and SRE practices: containerization, CI/CD, infrastructure as
code, Kubernetes orchestration, and observability.

## Architecture
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   React     │─────▶│  Node.js /  │─────▶│  PostgreSQL  │
│  (Nginx)    │      │   Express   │      │              │
└─────────────┘      └─────────────┘      └──────────────┘
*(Full AWS architecture diagram — VPC, EKS, RDS, ECR — to be added in Phase 4.)*

## Project Structure
taskmanager-capstone/
├── frontend/          # React SPA, served via Nginx
├── backend/           # Node.js/Express REST API
├── infrastructure/     # Terraform (Phase 4)
├── k8s/                # Kubernetes manifests (Phase 5)
├── docs/               # Architecture docs, runbooks, postmortems
└── docker-compose.yml  # Local development stack
## Quick Start (Local Development)

Requirements: Docker Desktop.

```bash
git clone <repo-url>
cd taskmanager-capstone
docker compose up -d --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Backend health check: http://localhost:3000/health
- Backend metrics: http://localhost:3000/metrics

See [backend/README.md](backend/README.md) for backend-specific setup and API
documentation.

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React (Vite) + Nginx |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Containerization | Docker (multi-stage builds) |
| CI/CD | GitHub Actions *(Phase 3)* |
| IaC | Terraform *(Phase 4)* |
| Orchestration | Amazon EKS *(Phase 5)* |
| Monitoring | Prometheus + Grafana *(Phase 6)* |

## Development Status

- [x] Phase 1 — Application Development & Containerization
- [ ] Phase 2 — GitHub Governance
- [ ] Phase 3 — CI/CD Pipeline
- [ ] Phase 4 — Infrastructure as Code
- [ ] Phase 5 — Kubernetes Deployment
- [ ] Phase 6 — Monitoring & Observability
- [ ] Phase 7 — SRE Practices
