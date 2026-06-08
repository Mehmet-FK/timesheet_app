#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not configured."
  exit 1
fi

echo "Waiting for PostgreSQL..."
node - <<'NODE'
const pg = require("pg");

async function waitForDatabase() {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    try {
      await pool.query("select 1");
      await pool.end();
      return;
    } catch (error) {
      await pool.end().catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error("PostgreSQL was not ready after 60 seconds.");
}

waitForDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
NODE

echo "Running database migrations..."
node scripts/migrate.js

echo "Starting application..."
exec "$@"
