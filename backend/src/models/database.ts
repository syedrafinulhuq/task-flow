import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  database: process.env.DATABASE_NAME || 'taskflow',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
});

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title       VARCHAR(255) NOT NULL,
      description TEXT,
      status      VARCHAR(20)  NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'completed')),
      priority    VARCHAR(10)  NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high')),
      due_date    DATE,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
  console.log('PostgreSQL connected — tasks table ready');
}

export default pool;
