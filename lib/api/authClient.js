async function parseResponse(response) {
  const body = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const error = new Error(body?.error || "Request failed.");
    error.status = response.status;
    throw error;
  }

  return body;
}

export async function fetchCurrentCompany() {
  const body = await parseResponse(await fetch("/api/auth/me"));
  return body.company;
}

export async function loginCompany(credentials) {
  const body = await parseResponse(
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
  );

  return body.company;
}

export async function logoutCompany() {
  await parseResponse(
    await fetch("/api/auth/logout", {
      method: "POST",
    })
  );
}
