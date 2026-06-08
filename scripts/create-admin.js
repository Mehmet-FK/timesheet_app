const crypto = require("crypto");
const pg = require("pg");
const { loadEnvConfig } = require("@next/env");

const KEY_LENGTH = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`scrypt:${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function main() {
  loadEnvConfig(process.cwd());

  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Usage: npm run admin:create -- admin@example.com password");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const passwordHash = await hashPassword(password);

  try {
    const result = await pool.query(
      `
        insert into admins (email, password_hash)
        values ($1, $2)
        on conflict (email) do update set password_hash = excluded.password_hash
        returning email
      `,
      [email, passwordHash]
    );

    console.log(`Admin saved: ${result.rows[0].email}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
