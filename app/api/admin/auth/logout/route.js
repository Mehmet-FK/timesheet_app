import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "../../../../../lib/auth/session";
import { deleteAdminSession } from "../../../../../lib/repositories/adminSessionsRepository";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) await deleteAdminSession(token);

  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
