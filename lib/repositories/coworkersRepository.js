import { emptyCoworker } from "../../components/timesheetUtils";
import { query, transaction } from "../db/pool";
import { logUsageEvent } from "./usageEventsRepository";

function normalizeDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function normalizeTime(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

function mapRowsToCoworkers(rows) {
  const coworkers = new Map();

  rows.forEach((row) => {
    if (!coworkers.has(row.id)) {
      coworkers.set(row.id, {
        ...emptyCoworker,
        id: row.id,
        name: row.name,
        entryDate: normalizeDate(row.entry_date),
        socialSecurityNumber: row.social_security_number ?? "",
        hoursPerWeek: Number(row.hours_per_week ?? 0),
        weekdays: [],
        dailyTimes: { ...emptyCoworker.dailyTimes },
        absences: [],
        holidayDates: Array.isArray(row.holiday_dates) ? row.holiday_dates : [],
      });
    }

    const coworker = coworkers.get(row.id);

    if (row.weekday !== null && row.weekday !== undefined && !coworker.weekdays.includes(row.weekday)) {
      coworker.weekdays.push(row.weekday);
      coworker.dailyTimes[row.weekday] = {
        from: normalizeTime(row.start_time),
        to: normalizeTime(row.end_time),
      };
    }

    if (row.absence_id && !coworker.absences.some((absence) => absence.id === row.absence_id)) {
      coworker.absences.push({
        id: row.absence_id,
        type: row.absence_type,
        from: normalizeDate(row.from_date),
        to: normalizeDate(row.to_date),
      });
    }
  });

  return Array.from(coworkers.values()).map((coworker) => ({
    ...coworker,
    weekdays: coworker.weekdays.sort((a, b) => a - b),
  }));
}

export async function listCoworkers(companyId) {
  const result = await query(
    `
      select
        c.id,
        c.name,
        c.entry_date,
        c.social_security_number,
        c.hours_per_week,
        c.holiday_dates,
        wd.weekday,
        wd.start_time,
        wd.end_time,
        a.id as absence_id,
        a.type as absence_type,
        a.from_date,
        a.to_date
      from coworkers c
      left join coworker_workdays wd on wd.coworker_id = c.id
      left join coworker_absences a on a.coworker_id = c.id
      where c.company_id = $1
      order by c.name asc, wd.weekday asc, a.from_date asc
    `,
    [companyId]
  );

  return mapRowsToCoworkers(result.rows);
}

export async function getCoworker(companyId, id) {
  const result = await query(
    `
      select
        c.id,
        c.name,
        c.entry_date,
        c.social_security_number,
        c.hours_per_week,
        c.holiday_dates,
        wd.weekday,
        wd.start_time,
        wd.end_time,
        a.id as absence_id,
        a.type as absence_type,
        a.from_date,
        a.to_date
      from coworkers c
      left join coworker_workdays wd on wd.coworker_id = c.id
      left join coworker_absences a on a.coworker_id = c.id
      where c.company_id = $1
        and c.id = $2
      order by wd.weekday asc, a.from_date asc
    `,
    [companyId, id]
  );

  return mapRowsToCoworkers(result.rows)[0] ?? null;
}

async function replaceWorkdays(client, coworker) {
  await client.query("delete from coworker_workdays where coworker_id = $1", [coworker.id]);

  for (const weekday of coworker.weekdays) {
    const dayTimes = coworker.dailyTimes[weekday];
    if (!dayTimes?.from || !dayTimes?.to) continue;

    await client.query(
      `
        insert into coworker_workdays (coworker_id, weekday, start_time, end_time)
        values ($1, $2, $3, $4)
      `,
      [coworker.id, weekday, dayTimes.from, dayTimes.to]
    );
  }
}

async function replaceAbsences(client, coworker) {
  await client.query("delete from coworker_absences where coworker_id = $1", [coworker.id]);

  for (const absence of coworker.absences) {
    if (!absence.from || !absence.to) continue;

    await client.query(
      `
        insert into coworker_absences (id, coworker_id, type, from_date, to_date)
        values ($1, $2, $3, $4, $5)
      `,
      [absence.id, coworker.id, absence.type, absence.from, absence.to]
    );
  }
}

export async function saveCoworker(companyId, coworker) {
  const savedCoworker = await transaction(async (client) => {
    const existing = await client.query("select id from coworkers where company_id = $1 and id = $2", [companyId, coworker.id]);
    const result = await client.query(
      `
        insert into coworkers (id, company_id, name, entry_date, social_security_number, hours_per_week, holiday_dates)
        values ($1, $2, $3, $4, $5, $6, $7::jsonb)
        on conflict (id) do update set
          name = excluded.name,
          entry_date = excluded.entry_date,
          social_security_number = excluded.social_security_number,
          hours_per_week = excluded.hours_per_week,
          holiday_dates = excluded.holiday_dates
        where coworkers.company_id = $2
        returning id
      `,
      [
        coworker.id,
        companyId,
        coworker.name,
        coworker.entryDate || null,
        coworker.socialSecurityNumber || null,
        coworker.hoursPerWeek || 0,
        JSON.stringify(coworker.holidayDates || []),
      ]
    );

    if (!result.rows[0]) {
      const error = new Error("Coworker not found.");
      error.status = 404;
      throw error;
    }

    const nextCoworker = { ...coworker, id: result.rows[0].id };
    await replaceWorkdays(client, nextCoworker);
    await replaceAbsences(client, nextCoworker);
    return { coworker: nextCoworker, isNew: existing.rowCount === 0 };
  });

  if (savedCoworker.isNew) {
    await logUsageEvent(companyId, {
      eventType: "coworker_created",
      coworkerId: savedCoworker.coworker.id,
      coworkerName: savedCoworker.coworker.name,
    });
  }

  return getCoworker(companyId, savedCoworker.coworker.id);
}

export async function deleteCoworker(companyId, id) {
  await query("delete from coworkers where company_id = $1 and id = $2", [companyId, id]);
}
