import { NextResponse } from "next/server";
import { requireCurrentAdmin } from "../../../../lib/auth/session";
import { listCompanies, saveCompany } from "../../../../lib/repositories/companiesRepository";

function handleError(error) {
  console.error(error);
  return NextResponse.json({ error: error.message || "Unexpected server error." }, { status: error.status || 500 });
}

export async function GET(request) {
  try {
    await requireCurrentAdmin();
    return NextResponse.json({ companies: await listCompanies() });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request) {
  try {
    await requireCurrentAdmin();
    const company = await request.json();
    return NextResponse.json({ company: await saveCompany(company) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
