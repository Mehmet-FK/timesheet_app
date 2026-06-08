import { NextResponse } from "next/server";
import { requireCurrentCompany } from "../../../../lib/auth/session";
import { consumeCompanyCredits } from "../../../../lib/repositories/companiesRepository";
import { getCoworker } from "../../../../lib/repositories/coworkersRepository";
import { logUsageEvent } from "../../../../lib/repositories/usageEventsRepository";

function handleError(error) {
  console.error(error);
  return NextResponse.json({ error: error.message || "Unexpected server error." }, { status: error.status || 500 });
}

function countMonthsFromDates(fromDate, toDate) {
  const [fromYear, fromMonth] = fromDate.split("-").map(Number);
  const [toYear, toMonth] = toDate.split("-").map(Number);
  return Math.max(0, (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1);
}

export async function POST(request) {
  try {
    const company = await requireCurrentCompany();
    const payload = await request.json();
    const credits = countMonthsFromDates(payload.dateRangeFrom || "", payload.dateRangeTo || "");

    if (!credits || credits < 1) {
      return NextResponse.json({ error: "Invalid credit amount." }, { status: 400 });
    }

    const coworker = await getCoworker(company.id, payload.coworkerId);
    if (!coworker) {
      return NextResponse.json({ error: "Coworker not found." }, { status: 404 });
    }

    const creditBalance = await consumeCompanyCredits(company.id, credits);
    await logUsageEvent(company.id, {
      eventType: "timesheet_generated",
      coworkerId: coworker.id,
      coworkerName: coworker.name,
      dateRangeFrom: payload.dateRangeFrom,
      dateRangeTo: payload.dateRangeTo,
      format: payload.format,
      creditsUsed: credits,
    });

    return NextResponse.json({ creditBalance, creditsUsed: credits });
  } catch (error) {
    return handleError(error);
  }
}
