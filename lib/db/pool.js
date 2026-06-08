import pg from "pg";

const { Pool } = pg;

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

const globalForPg = globalThis;

export function getPool() {
  if (!globalForPg.pgPool) {
    globalForPg.pgPool = createPool();
  }

  return globalForPg.pgPool;
}

export function query(text, params) {
  return getPool().query(text, params);
}

export async function transaction(callback) {
  const client = await getPool().connect();

  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
