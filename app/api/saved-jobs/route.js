import { NextResponse } from "next/server";
import { getSavedJobs, removeSavedJob, saveJob } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const email = request.nextUrl.searchParams.get("email") || "";
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  return NextResponse.json({ savedJobs: await getSavedJobs(email) });
}

export async function POST(request) {
  const body = await request.json();
  if (!body.email?.trim() || !body.job?.id || !body.job?.title) {
    return NextResponse.json(
      { error: "Email and job details are required." },
      { status: 400 },
    );
  }
  return NextResponse.json({
    savedJob: await saveJob(body.email, body.job),
  });
}

export async function DELETE(request) {
  const body = await request.json();
  if (!body.email?.trim() || !body.jobId) {
    return NextResponse.json(
      { error: "Email and job ID are required." },
      { status: 400 },
    );
  }
  await removeSavedJob(body.email, body.jobId);
  return NextResponse.json({ success: true });
}
