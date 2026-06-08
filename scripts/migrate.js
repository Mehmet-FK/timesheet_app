const fs = require("fs");
const path = require("path");
const { loadEnvConfig } = require("@next/env");
const pg = require("pg");

async function main() {
  loadEnvConfig(process.cwd());

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const migrationsDir = path.join(process.cwd(), "db", "migrations");
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      await pool.query(sql);
      console.log(`Applied ${file}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
