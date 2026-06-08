import { NextResponse } from "next/server";
import { requireCurrentAdmin } from "../../../../../lib/auth/session";
import { deleteCompany, saveCompany } from "../../../../../lib/repositories/companiesRepository";

function handleError(error) {
  console.error(error);
  return NextResponse.json({ error: error.message || "Unexpected server error." }, { status: error.status || 500 });
}

export async function PUT(request, { params }) {
  try {
    await requireCurrentAdmin();
    const { id } = await params;
    const company = await request.json();
    return NextResponse.json({ company: await saveCompany({ ...company, id }) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireCurrentAdmin();
    const { id } = await params;
    await deleteCompany(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
}
