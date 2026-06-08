import { query } from "../db/pool";
import { hashPassword } from "../auth/password";

export async function findAdminByEmail(email) {
  const result = await query(
    `
      select id, email, password_hash, created_at
      from admins
      where lower(email) = lower($1)
      limit 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function getAdmin(id) {
  const result = await query(
    `
      select id, email, created_at
      from admins
      where id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function saveAdmin({ email, password }) {
  const passwordHash = await hashPassword(password);
  const result = await query(
    `
      insert into admins (email, password_hash)
      values ($1, $2)
      on conflict (email) do update set password_hash = excluded.password_hash
      returning id, email, created_at
    `,
    [email, passwordHash]
  );

  return result.rows[0];
}
