import { query } from "../db/pool";
import { hashToken } from "../auth/password";

export async function createSession(companyId, token, expiresAt) {
  await query(
    `
      insert into company_sessions (company_id, token_hash, expires_at)
      values ($1, $2, $3)
    `,
    [companyId, hashToken(token), expiresAt]
  );
}

export async function getSession(token) {
  const result = await query(
    `
      select
        s.id,
        s.company_id,
        s.expires_at,
        c.name,
        c.email,
        c.credit_balance,
        c.is_active
      from company_sessions s
      join companies c on c.id = s.company_id
      where s.token_hash = $1
        and s.expires_at > now()
      limit 1
    `,
    [hashToken(token)]
  );

  return result.rows[0] ?? null;
}

export async function deleteSession(token) {
  await query("delete from company_sessions where token_hash = $1", [hashToken(token)]);
}
