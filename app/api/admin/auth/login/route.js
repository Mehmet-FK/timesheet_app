import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "../../../../../lib/auth/session";
import { makeSessionToken, verifyPassword } from "../../../../../lib/auth/password";
import { findAdminByEmail } from "../../../../../lib/repositories/adminsRepository";
import { createAdminSession } from "../../../../../lib/repositories/adminSessionsRepository";

export async function POST(request) {
  const { email, password } = await request.json();
  const admin = await findAdminByEmail(email || "");

  if (!admin || !(await verifyPassword(password || "", admin.password_hash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = makeSessionToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12);
  await createAdminSession(admin.id, token, expiresAt);

  const response = NextResponse.json({ admin: { id: admin.id, email: admin.email } });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return response;
}
