import { parseResponse } from "./adminCompaniesClient";

export async function fetchCurrentAdmin() {
  const body = await parseResponse(await fetch("/api/admin/auth/me"));
  return body.admin;
}

export async function loginAdmin(credentials) {
  const body = await parseResponse(
    await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
  );

  return body.admin;
}

export async function logoutAdmin() {
  await parseResponse(
    await fetch("/api/admin/auth/logout", {
      method: "POST",
    })
  );
}
