import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "../../../../lib/auth/session";
import { makeSessionToken, verifyPassword } from "../../../../lib/auth/password";
import { findCompanyByEmail, getCompany } from "../../../../lib/repositories/companiesRepository";
import { createSession } from "../../../../lib/repositories/sessionsRepository";

export async function POST(request) {
  const { email, password } = await request.json();
  const company = await findCompanyByEmail(email || "");

  if (!company?.is_active || !(await verifyPassword(password || "", company.password_hash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = makeSessionToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  await createSession(company.id, token, expiresAt);

  const response = NextResponse.json({ company: await getCompany(company.id) });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return response;
}
