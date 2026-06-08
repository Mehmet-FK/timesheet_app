async function parseResponse(response) {
  const hasBody = response.status !== 204;
  const body = hasBody ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.error || "Request failed.");
  }

  return body;
}

export async function fetchCoworkers() {
  const body = await parseResponse(await fetch("/api/coworkers"));
  return body.coworkers;
}

export async function persistCoworker(coworker) {
  const body = await parseResponse(
    await fetch(`/api/coworkers/${coworker.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coworker),
    })
  );

  return body.coworker;
}

export async function removeCoworker(id) {
  await parseResponse(
    await fetch(`/api/coworkers/${id}`, {
      method: "DELETE",
    })
  );
}
