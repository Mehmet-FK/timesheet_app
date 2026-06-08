export async function authorizeTimesheetGeneration({ coworker, range, format, credits }) {
  const response = await fetch("/api/timesheet/authorize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      coworkerId: coworker.id,
      coworkerName: coworker.name,
      dateRangeFrom: range.from,
      dateRangeTo: range.to,
      format,
      credits,
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error || "Timesheet generation was not authorized.");
  }

  return body;
}
