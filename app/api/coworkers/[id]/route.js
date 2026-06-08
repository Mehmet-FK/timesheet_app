import { NextResponse } from "next/server";
import { deleteCoworker, getCoworker, saveCoworker } from "../../../../lib/repositories/coworkersRepository";
import { requireCurrentCompany } from "../../../../lib/auth/session";

function handleError(error) {
  console.error(error);
  return NextResponse.json({ error: error.message || "Unexpected server error." }, { status: error.status || 500 });
}

export async function GET(_request, { params }) {
  try {
    const company = await requireCurrentCompany();
    const { id } = await params;
    const coworker = await getCoworker(company.id, id);

    if (!coworker) {
      return NextResponse.json({ error: "Coworker not found." }, { status: 404 });
    }

    return NextResponse.json({ coworker });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const company = await requireCurrentCompany();
    const { id } = await params;
    const coworker = await request.json();
    const saved = await saveCoworker(company.id, { ...coworker, id });
    return NextResponse.json({ coworker: saved });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const company = await requireCurrentCompany();
    const { id } = await params;
    await deleteCoworker(company.id, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
}
