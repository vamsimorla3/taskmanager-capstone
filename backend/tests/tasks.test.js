const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

describe('Health check', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /metrics', () => {
  it('returns Prometheus-formatted metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('http_requests_total');
  });
});

describe('POST /api/tasks validation', () => {
  it('rejects missing title with 400', async () => {
    const res = await request(app).post('/api/tasks').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it('rejects empty string title with 400', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects title longer than 255 characters', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'a'.repeat(256) });
    expect(res.statusCode).toBe(400);
  });

  it('creates a task with a valid title', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Write tests' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Write tests');
    expect(res.body.done).toBe(false);
  });
});

describe('GET /api/tasks', () => {
  it('returns an array of tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PUT /api/tasks/:id', () => {
  let taskId;

  beforeAll(async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Task to update' });
    taskId = res.body.id;
  });

  it('rejects a non-numeric id with 400', async () => {
    const res = await request(app).put('/api/tasks/abc').send({ done: true });
    expect(res.statusCode).toBe(400);
  });

  it('rejects a non-boolean done value with 400', async () => {
    const res = await request(app).put(`/api/tasks/${taskId}`).send({ done: 'yes' });
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for a task that does not exist', async () => {
    const res = await request(app).put('/api/tasks/999999').send({ done: true });
    expect(res.statusCode).toBe(404);
  });

  it('updates an existing task', async () => {
    const res = await request(app).put(`/api/tasks/${taskId}`).send({ done: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.done).toBe(true);
  });
});

describe('DELETE /api/tasks/:id', () => {
  let taskId;

  beforeAll(async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Task to delete' });
    taskId = res.body.id;
  });

  it('rejects a non-numeric id with 400', async () => {
    const res = await request(app).delete('/api/tasks/abc');
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for a task that does not exist', async () => {
    const res = await request(app).delete('/api/tasks/999999');
    expect(res.statusCode).toBe(404);
  });

  it('deletes an existing task', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`);
    expect(res.statusCode).toBe(204);
  });
});

afterAll(async () => {
  await pool.end();
});
