import { NextResponse } from "next/server";
import { listCoworkers, saveCoworker } from "../../../lib/repositories/coworkersRepository";
import { requireCurrentCompany } from "../../../lib/auth/session";

function handleError(error) {
  console.error(error);
  return NextResponse.json({ error: error.message || "Unexpected server error." }, { status: error.status || 500 });
}

export async function GET() {
  try {
    const company = await requireCurrentCompany();
    const coworkers = await listCoworkers(company.id);
    return NextResponse.json({ coworkers });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request) {
  try {
    const company = await requireCurrentCompany();
    const coworker = await request.json();
    const saved = await saveCoworker(company.id, coworker);
    return NextResponse.json({ coworker: saved }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
