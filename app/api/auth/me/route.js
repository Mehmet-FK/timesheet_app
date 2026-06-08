import { NextResponse } from "next/server";
import { getCurrentCompany } from "../../../../lib/auth/session";

export async function GET() {
  const company = await getCurrentCompany();

  if (!company) {
    return NextResponse.json({ company: null }, { status: 401 });
  }

  return NextResponse.json({ company });
}
