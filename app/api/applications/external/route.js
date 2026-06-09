import { NextResponse } from "next/server";
import { trackExternalApplication } from "@/lib/data";

export async function POST(request) {
  const body = await request.json();
  if (!body.email?.trim() || !body.name?.trim() || !body.job?.id) {
    return NextResponse.json(
      { error: "Create a profile before tracking this application." },
      { status: 400 },
    );
  }
  const application = await trackExternalApplication(body);
  return NextResponse.json({ application });
}
