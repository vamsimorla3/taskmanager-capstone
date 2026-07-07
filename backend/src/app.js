require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require('prom-client');
const pool = require('./config/db');
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();

app.use(cors());

client.collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
});

app.use(express.json());
app.use(requestLogger);

app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;
    const labels = { method: req.method, path: req.path, status_code: res.statusCode };
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
  });
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id');
    res.status(200).json(result.rows);
  } catch (err) {
    logger.error('failed to fetch tasks', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'internal server error' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }
  if (title.length > 255) {
    return res.status(400).json({ error: 'title must be 255 characters or fewer' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('failed to create task', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'internal server error' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { title, done } = req.body;
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }
  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return res.status(400).json({ error: 'title must be a non-empty string' });
  }
  if (done !== undefined && typeof done !== 'boolean') {
    return res.status(400).json({ error: 'done must be a boolean' });
  }
  try {
    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        done = COALESCE($2, done)
       WHERE id = $3 RETURNING *`,
      [title, done, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'task not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    logger.error('failed to update task', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'internal server error' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'task not found' });
    }
    res.status(204).send();
  } catch (err) {
    logger.error('failed to delete task', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'internal server error' });
  }
});

module.exports = app;
