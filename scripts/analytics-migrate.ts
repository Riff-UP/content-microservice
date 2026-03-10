import 'dotenv/config';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { Pool } from 'pg';
import { analyticsEnv } from '../src/analytics/analytics-env';

async function main() {
  if (!analyticsEnv.dbUrl) {
    throw new Error('ANALYTICS_DB_URL no está configurado');
  }

  const pool = new Pool({
    connectionString: analyticsEnv.dbUrl,
    ssl: analyticsEnv.dbSsl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const baseDir = join(process.cwd(), 'database', 'analytics', 'init');
    const files = (await readdir(baseDir))
      .filter((file) => file.endsWith('.sql'))
      .sort((left, right) => left.localeCompare(right));

    for (const file of files) {
      const sql = await readFile(join(baseDir, file), 'utf8');
      process.stdout.write(`-> Ejecutando ${file}\n`);
      await pool.query(sql);
    }

    process.stdout.write('Analytics migrations ejecutadas correctamente.\n');
  } finally {
    await pool.end();
  }
}

void main().catch((error) => {
  console.error('analytics-migrate falló:', error);
  process.exit(1);
});
