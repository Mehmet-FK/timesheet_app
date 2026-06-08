import { query } from "../db/pool";
import { hashToken } from "../auth/password";

export async function createAdminSession(adminId, token, expiresAt) {
  await query(
    `
      insert into admin_sessions (admin_id, token_hash, expires_at)
      values ($1, $2, $3)
    `,
    [adminId, hashToken(token), expiresAt]
  );
}

export async function getAdminSession(token) {
  const result = await query(
    `
      select s.id, s.admin_id, s.expires_at, a.email
      from admin_sessions s
      join admins a on a.id = s.admin_id
      where s.token_hash = $1
        and s.expires_at > now()
      limit 1
    `,
    [hashToken(token)]
  );

  return result.rows[0] ?? null;
}

export async function deleteAdminSession(token) {
  await query("delete from admin_sessions where token_hash = $1", [hashToken(token)]);
}
