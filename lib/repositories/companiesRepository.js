import { query, transaction } from "../db/pool";
import { hashPassword } from "../auth/password";
import { listUsageEvents } from "./usageEventsRepository";

function normalizeDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function mapCompany(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    ownerName: row.owner_name ?? "",
    accountCreationDate: normalizeDate(row.account_creation_date),
    creditBalance: Number(row.credit_balance ?? 0),
    email: row.email,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function listCompanies() {
  const result = await query(
    `
      select id, name, owner_name, account_creation_date, email, is_active, credit_balance, created_at
      from companies
      order by name asc
    `
  );

  const companies = result.rows.map(mapCompany);
  return Promise.all(
    companies.map(async (company) => ({
      ...company,
      usageEvents: await listUsageEvents(company.id),
    }))
  );
}

export async function findCompanyByEmail(email) {
  const result = await query(
    `
      select id, name, owner_name, account_creation_date, email, password_hash, is_active, credit_balance, created_at
      from companies
      where lower(email) = lower($1)
      limit 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function getCompany(id) {
  const result = await query(
    `
      select id, name, owner_name, account_creation_date, email, is_active, credit_balance, created_at
      from companies
      where id = $1
    `,
    [id]
  );

  return mapCompany(result.rows[0]);
}

export async function saveCompany(company) {
  const passwordHash = company.password ? await hashPassword(company.password) : null;

  const result = await query(
    `
      insert into companies (id, name, owner_name, account_creation_date, email, password_hash, is_active, credit_balance)
      values (coalesce($1, gen_random_uuid()), $2, $3, coalesce($4, current_date), $5, coalesce($6, ''), coalesce($7, true), coalesce($8, 0))
      on conflict (id) do update set
        name = excluded.name,
        owner_name = excluded.owner_name,
        account_creation_date = excluded.account_creation_date,
        email = excluded.email,
        password_hash = coalesce($6, companies.password_hash),
        is_active = excluded.is_active,
        credit_balance = coalesce($8, companies.credit_balance)
      returning id, name, owner_name, account_creation_date, email, is_active, credit_balance, created_at
    `,
    [
      company.id || null,
      company.name,
      company.ownerName || null,
      company.accountCreationDate || null,
      company.email,
      passwordHash,
      company.isActive ?? true,
      company.creditBalance === undefined || company.creditBalance === null ? null : Number(company.creditBalance),
    ]
  );

  return mapCompany(result.rows[0]);
}

export async function deleteCompany(id) {
  await query("delete from companies where id = $1", [id]);
}

export async function consumeCompanyCredits(companyId, credits) {
  return transaction(async (client) => {
    const result = await client.query(
      `
        update companies
        set credit_balance = credit_balance - $2
        where id = $1
          and credit_balance >= $2
        returning credit_balance
      `,
      [companyId, credits]
    );

    if (!result.rows[0]) {
      const error = new Error(`Not enough credits. Required: ${credits}.`);
      error.status = 402;
      throw error;
    }

    return Number(result.rows[0].credit_balance);
  });
}
