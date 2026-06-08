export async function parseResponse(response) {
  const body = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const error = new Error(body?.error || "Request failed.");
    error.status = response.status;
    throw error;
  }

  return body;
}

export async function fetchAdminCompanies() {
  const body = await parseResponse(await fetch("/api/admin/companies"));
  return body.companies;
}

export async function saveAdminCompany(company) {
  const isExisting = Boolean(company.id);
  const body = await parseResponse(
    await fetch(isExisting ? `/api/admin/companies/${company.id}` : "/api/admin/companies", {
      method: isExisting ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(company),
    })
  );
  return body.company;
}

export async function deleteAdminCompany(id) {
  await parseResponse(
    await fetch(`/api/admin/companies/${id}`, {
      method: "DELETE",
    })
  );
}
