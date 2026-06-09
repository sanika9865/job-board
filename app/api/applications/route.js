import { NextResponse } from "next/server";
import { createApplication, getApplications } from "@/lib/data";
import { validateApplication } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const email = request.nextUrl.searchParams.get("email") || "";
  const applications = await getApplications(email);
  return NextResponse.json({ applications });
}

export async function POST(request) {
  const body = await request.json();
  const error = validateApplication(body);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const result = await createApplication({
    jobId: body.jobId.trim(),
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone.trim(),
    resumeUrl: body.resumeUrl.trim(),
    coverLetter: body.coverLetter.trim(),
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(
    { application: result.application },
    { status: result.status },
  );
}
