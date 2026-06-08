import { cookies } from "next/headers";
import { getSession } from "../repositories/sessionsRepository";
import { getAdminSession } from "../repositories/adminSessionsRepository";

export const SESSION_COOKIE = "timesheet_session";
export const ADMIN_SESSION_COOKIE = "timesheet_admin_session";

export function shouldUseSecureCookies() {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  return process.env.NODE_ENV === "production";
}

export async function getCurrentCompany() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await getSession(token);
  if (!session?.is_active) return null;

  return {
    id: session.company_id,
    name: session.name,
    email: session.email,
    creditBalance: Number(session.credit_balance ?? 0),
  };
}

export async function requireCurrentCompany() {
  const company = await getCurrentCompany();
  if (!company) {
    const error = new Error("Authentication required.");
    error.status = 401;
    throw error;
  }

  return company;
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await getAdminSession(token);
  if (!session) return null;

  return {
    id: session.admin_id,
    email: session.email,
  };
}

export async function requireCurrentAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    const error = new Error("Admin authentication required.");
    error.status = 401;
    throw error;
  }

  return admin;
}
