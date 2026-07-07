# Task Manager — Backend API

A RESTful API for managing tasks, built with Node.js, Express, and PostgreSQL.

## Requirements

- Node.js 18+
- Docker (for running PostgreSQL locally)

## Setup

1. Install dependencies:
```bash
   npm install
```

2. Copy `.env.example` to `.env` and fill in your database credentials.

3. Start PostgreSQL (via Docker):
```bash
   docker run --name taskmanager-db \
     -e POSTGRES_USER=taskadmin \
     -e POSTGRES_PASSWORD=devpassword123 \
     -e POSTGRES_DB=taskmanager \
     -p 5432:5432 \
     -d postgres:15
```

4. Run the migration to create the tasks table:
```bash
   docker exec -i taskmanager-db psql -U taskadmin -d taskmanager < migrations/001_create_tasks_table.sql
```

5. Start the server:
```bash
   node src/server.js
```

## API Endpoints

| Method | Endpoint          | Description             |
|--------|-------------------|--------------------------|
| GET    | /health           | Health check             |
| GET    | /metrics          | Prometheus metrics       |
| GET    | /api/tasks        | List all tasks           |
| POST   | /api/tasks        | Create a task            |
| PUT    | /api/tasks/:id    | Update a task            |
| DELETE | /api/tasks/:id    | Delete a task            |

### Example: Create a task

Request:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Kubernetes"}'
```

Response (201):
```json
{"id":1,"title":"Learn Kubernetes","done":false,"created_at":"2026-07-06T06:50:11.767Z"}
```

### Example: Update a task

Request:
```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"done":true}'
```

Response (200):
```json
{"id":1,"title":"Learn Kubernetes","done":true,"created_at":"2026-07-06T06:50:11.767Z"}
```

## Running Tests

```bash
npm test
```

Runs the Jest test suite with coverage reporting.

## Environment Variables

| Variable      | Description                  |
|---------------|-------------------------------|
| PORT          | Port the server listens on   |
| DB_HOST       | PostgreSQL host               |
| DB_PORT       | PostgreSQL port                |
| DB_USER       | PostgreSQL username           |
| DB_PASSWORD   | PostgreSQL password            |
| DB_NAME       | PostgreSQL database name       |
