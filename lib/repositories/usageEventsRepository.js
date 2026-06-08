import { query } from "../db/pool";

function normalizeDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function mapUsageEvent(row) {
  return {
    id: row.id,
    companyId: row.company_id,
    eventType: row.event_type,
    coworkerId: row.coworker_id,
    coworkerName: row.coworker_name,
    dateRangeFrom: normalizeDate(row.date_range_from),
    dateRangeTo: normalizeDate(row.date_range_to),
    format: row.format,
    creditsUsed: Number(row.credits_used ?? 0),
    createdAt: row.created_at,
  };
}

export async function logUsageEvent(companyId, event) {
  await query(
    `
      insert into usage_events (
        company_id,
        event_type,
        coworker_id,
        coworker_name,
        date_range_from,
        date_range_to,
        format,
        credits_used
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      companyId,
      event.eventType,
      event.coworkerId || null,
      event.coworkerName || null,
      event.dateRangeFrom || null,
      event.dateRangeTo || null,
      event.format || null,
      Number(event.creditsUsed ?? 0),
    ]
  );
}

export async function listUsageEvents(companyId) {
  const result = await query(
    `
      select id, company_id, event_type, coworker_id, coworker_name, date_range_from, date_range_to, format, credits_used, created_at
      from usage_events
      where company_id = $1
      order by created_at desc
      limit 200
    `,
    [companyId]
  );

  return result.rows.map(mapUsageEvent);
}
