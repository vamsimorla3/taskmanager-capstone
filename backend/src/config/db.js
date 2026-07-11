const { Pool } = require('pg');

// RDS requires SSL/TLS by default. We enable SSL but skip certificate
// verification (rejectUnauthorized: false) - traffic is encrypted, but
// we don't verify RDS's certificate against a trusted CA. This traffic
// never leaves the private VPC, so the realistic risk is low; full
// certificate verification (mounting AWS's RDS CA bundle) is a
// documented follow-up rather than done now.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
});

module.exports = pool;
