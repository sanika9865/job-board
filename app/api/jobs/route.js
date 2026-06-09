import { NextResponse } from "next/server";
import { createJob, getJobs } from "@/lib/data";
import { validateJob } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ jobs: await getJobs() });
}

export async function POST(request) {
  const body = await request.json();
  const error = validateJob(body);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const job = await createJob({
    title: body.title.trim(),
    company: body.company.trim(),
    location: body.location.trim(),
    salary: body.salary.trim(),
    type: body.type.trim(),
    mode: body.mode.trim(),
    description: body.description.trim(),
    requirements: body.requirements.trim(),
    contactEmail: body.contactEmail.trim().toLowerCase(),
  });

  return NextResponse.json({ job }, { status: 201 });
}
