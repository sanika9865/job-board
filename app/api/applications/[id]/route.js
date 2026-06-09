import { NextResponse } from "next/server";
import { updateApplicationStatus } from "@/lib/data";
import { applicationStatuses } from "@/lib/validation";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  if (!applicationStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: "Select a valid application status." },
      { status: 400 },
    );
  }

  const application = await updateApplicationStatus(id, body.status);

  if (!application) {
    return NextResponse.json(
      { error: "Application not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ application });
}
