const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Check for connection string in DATABASE_URL or accidentally in PGHOST
const rawConn = process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGHOST.startsWith('postgres') ? process.env.PGHOST : null);

const poolConfig = rawConn
  ? {
      connectionString: rawConn,
      ssl: rawConn.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'admin',
      database: process.env.PGDATABASE || 'market_hypothesis_lab',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;
