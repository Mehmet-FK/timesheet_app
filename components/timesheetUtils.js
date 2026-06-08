export const WEEKDAYS = [
  { key: 1, short: "Mo", label: "Montag" },
  { key: 2, short: "Di", label: "Dienstag" },
  { key: 3, short: "Mi", label: "Mittwoch" },
  { key: 4, short: "Do", label: "Donnerstag" },
  { key: 5, short: "Fr", label: "Freitag" },
  { key: 6, short: "Sa", label: "Samstag" },
  { key: 0, short: "So", label: "Sonntag" },
];

export const ABSENCE_TYPES = {
  sick: "krank",
  vacation: "urlaub",
  other: "sonstiges",
};

export const AUSTRIAN_HOLIDAY_DEFINITIONS = [
  { key: "new_year", name: "Neujahr" },
  { key: "epiphany", name: "Heilige Drei Koenige" },
  { key: "easter_monday", name: "Ostermontag" },
  { key: "state_holiday", name: "Staatsfeiertag" },
  { key: "ascension_day", name: "Christi Himmelfahrt" },
  { key: "whit_monday", name: "Pfingstmontag" },
  { key: "corpus_christi", name: "Fronleichnam" },
  { key: "assumption_day", name: "Maria Himmelfahrt" },
  { key: "national_day", name: "Nationalfeiertag" },
  { key: "all_saints", name: "Allerheiligen" },
  { key: "immaculate_conception", name: "Maria Empfaengnis" },
  { key: "christmas_day", name: "Christtag" },
  { key: "st_stephen", name: "Stefanitag" },
];

export const EXPORT_HEADERS = [
  "Datum",
  "Wochentag",
  "Beginn",
  "Ende",
  "Pause Beginn",
  "Pause Ende",
  "Pause Stunden",
  "Arbeitszeit Stunden",
  "Bemerkungen",
];

export const emptyCoworker = {
  id: "",
  name: "",
  entryDate: "",
  socialSecurityNumber: "",
  hoursPerWeek: 40,
  weekdays: [1, 2, 3, 4, 5],
  dailyTimes: {
    1: { from: "08:00", to: "16:30" },
    2: { from: "08:00", to: "16:30" },
    3: { from: "08:00", to: "16:30" },
    4: { from: "08:00", to: "16:30" },
    5: { from: "08:00", to: "16:30" },
    6: { from: "08:00", to: "12:00" },
    0: { from: "08:00", to: "12:00" },
  },
  absences: [],
  holidayDates: [],
};

export function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function toMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
  const mins = String(normalized % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

export function minutesToHours(minutes) {
  return (minutes / 60).toFixed(2);
}

export function calculateWeeklyHours(coworker) {
  return coworker.weekdays.reduce((sum, weekday) => {
    const dayTimes = coworker.dailyTimes[weekday];
    if (!dayTimes?.from || !dayTimes?.to) return sum;
    return sum + Math.max(0, toMinutes(dayTimes.to) - toMinutes(dayTimes.from));
  }, 0) / 60;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function parseDateInput(value) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function formatDateInput({ year, month, day }) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function dateInputFromUtcTime(time) {
  const date = new Date(time);
  return formatDateInput({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

export function displayDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

export function parseDisplayDate(value) {
  const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return "";

  const [, day, month, year] = match;
  const isoDate = `${year}-${month}-${day}`;
  const parsed = parseDateInput(isoDate);
  const utcDate = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));

  if (
    utcDate.getUTCFullYear() !== parsed.year ||
    utcDate.getUTCMonth() + 1 !== parsed.month ||
    utcDate.getUTCDate() !== parsed.day
  ) {
    return "";
  }

  return isoDate;
}

export function displayDateRange(fromDate, toDate) {
  return `${displayDate(fromDate)}-${displayDate(toDate)}`;
}

export function parseMonthInput(value) {
  const match = value.trim().match(/^(\d{2})\.(\d{4})$/);
  if (!match) return "";

  const [, month, year] = match;
  const monthNumber = Number(month);
  if (monthNumber < 1 || monthNumber > 12) return "";

  return `${year}-${month}`;
}

export function displayMonthInput(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  return `${month}.${year}`;
}

export function monthRangeToDateRange(monthRange) {
  const [fromYear, fromMonth] = monthRange.from.split("-").map(Number);
  const [toYear, toMonth] = monthRange.to.split("-").map(Number);
  const lastDay = new Date(Date.UTC(toYear, toMonth, 0)).getUTCDate();

  return {
    from: `${fromYear}-${String(fromMonth).padStart(2, "0")}-01`,
    to: `${toYear}-${String(toMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function countMonths(monthRange) {
  const [fromYear, fromMonth] = monthRange.from.split("-").map(Number);
  const [toYear, toMonth] = monthRange.to.split("-").map(Number);
  return Math.max(0, (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1);
}

export function displayMonth(value) {
  const [year, month] = value.split("-");
  return `${month}.${year}`;
}

export function safeFilePart(value) {
  return value.replace(/[<>:"/\\|?*]+/g, "-").trim() || "export";
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function stableOffset(seed, salt) {
  return (hashString(`${seed}:${salt}`) % 21) - 10;
}

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return dateInputFromUtcTime(next.getTime());
}

export function getAustrianHolidays(year) {
  const easter = easterSunday(year);
  return [
    { key: "new_year", date: `${year}-01-01`, name: "Neujahr" },
    { key: "epiphany", date: `${year}-01-06`, name: "Heilige Drei Koenige" },
    { key: "easter_monday", date: addDays(easter, 1), name: "Ostermontag" },
    { key: "state_holiday", date: `${year}-05-01`, name: "Staatsfeiertag" },
    { key: "ascension_day", date: addDays(easter, 39), name: "Christi Himmelfahrt" },
    { key: "whit_monday", date: addDays(easter, 50), name: "Pfingstmontag" },
    { key: "corpus_christi", date: addDays(easter, 60), name: "Fronleichnam" },
    { key: "assumption_day", date: `${year}-08-15`, name: "Maria Himmelfahrt" },
    { key: "national_day", date: `${year}-10-26`, name: "Nationalfeiertag" },
    { key: "all_saints", date: `${year}-11-01`, name: "Allerheiligen" },
    { key: "immaculate_conception", date: `${year}-12-08`, name: "Maria Empfaengnis" },
    { key: "christmas_day", date: `${year}-12-25`, name: "Christtag" },
    { key: "st_stephen", date: `${year}-12-26`, name: "Stefanitag" },
  ].sort((a, b) => a.date.localeCompare(b.date));
}

function getAbsenceForDate(coworker, dateValue) {
  return coworker.absences.find((absence) => {
    if (!absence.from || !absence.to) return false;
    return absence.from <= dateValue && absence.to >= dateValue;
  });
}

function getHolidayForDate(dateValue) {
  const year = Number(dateValue.slice(0, 4));
  return getAustrianHolidays(year).find((holiday) => holiday.date === dateValue);
}

export function generateEntries(coworkers, fromDate, toDate, options = {}) {
  const { randomize = true } = options;
  if (!fromDate || !toDate || fromDate > toDate) return [];

  const rows = [];
  const from = parseDateInput(fromDate);
  const to = parseDateInput(toDate);
  const end = Date.UTC(to.year, to.month - 1, to.day);

  for (
    let current = Date.UTC(from.year, from.month - 1, from.day);
    current <= end;
    current += 24 * 60 * 60 * 1000
  ) {
    const dateValue = dateInputFromUtcTime(current);
    const weekday = new Date(current).getUTCDay();

    coworkers.forEach((coworker) => {
      const absence = getAbsenceForDate(coworker, dateValue);
      const worksToday = coworker.weekdays.includes(weekday);
      const holiday = getHolidayForDate(dateValue);
      const selectedHolidays = coworker.holidayDates || [];
      const isHoliday = Boolean(holiday && (selectedHolidays.includes(holiday.key) || selectedHolidays.includes(dateValue)));

      if (absence) {
        rows.push({
          coworkerId: coworker.id,
          coworkerName: coworker.name,
          socialSecurityNumber: coworker.socialSecurityNumber,
          date: dateValue,
          weekday,
          status: ABSENCE_TYPES[absence.type],
          note: ABSENCE_TYPES[absence.type] || absence.type,
          start: "",
          end: "",
          breakStart: "",
          breakEnd: "",
          breakMinutes: 0,
          workMinutes: 0,
        });
        return;
      }

      if (!worksToday) return;

      const dayTimes = coworker.dailyTimes[weekday];
      if (!dayTimes?.from || !dayTimes?.to) return;

      const seed = `${coworker.id}-${dateValue}`;
      const startMinutes = randomize && !isHoliday ? clamp(toMinutes(dayTimes.from) + Math.max(0, stableOffset(seed, "start")), 0, 1439) : toMinutes(dayTimes.from);
      const endMinutes = randomize && !isHoliday ? clamp(toMinutes(dayTimes.to) - Math.max(0, stableOffset(seed, "end")), startMinutes, 1439) : toMinutes(dayTimes.to);
      const spanMinutes = Math.max(0, endMinutes - startMinutes);
      const breakMinutes = isHoliday ? 0 : spanMinutes > 360 ? 30 : 0;
      const breakStart = breakMinutes ? startMinutes + Math.floor((spanMinutes - breakMinutes) / 2) : 0;

      rows.push({
        coworkerId: coworker.id,
        coworkerName: coworker.name,
        socialSecurityNumber: coworker.socialSecurityNumber,
        date: dateValue,
        weekday,
        status: isHoliday ? "feiertag" : "arbeit",
        note: isHoliday ? holiday?.name || "Feiertag" : "",
        start: minutesToTime(startMinutes),
        end: minutesToTime(endMinutes),
        breakStart: breakMinutes ? minutesToTime(breakStart) : "",
        breakEnd: breakMinutes ? minutesToTime(breakStart + breakMinutes) : "",
        breakMinutes,
        workMinutes: Math.max(0, spanMinutes - breakMinutes),
      });
    });
  }

  return rows;
}

export function makeExportRows(rows) {
  return rows.map((row) => [
    displayDate(row.date),
    WEEKDAYS.find((day) => day.key === row.weekday)?.label ?? "",
    row.start,
    row.end,
    row.breakStart,
    row.breakEnd,
    minutesToHours(row.breakMinutes),
    minutesToHours(row.workMinutes),
    row.note || "",
  ]);
}

export function makeCsv(rows) {
  const body = makeExportRows(rows);
  return [EXPORT_HEADERS, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
    .join("\n");
}

export function groupEntriesByMonth(rows) {
  return rows.reduce((groups, row) => {
    const monthKey = row.date.slice(0, 7);
    if (!groups[monthKey]) groups[monthKey] = [];
    groups[monthKey].push(row);
    return groups;
  }, {});
}
