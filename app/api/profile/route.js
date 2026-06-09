import { NextResponse } from "next/server";
import { deleteCandidateData, getProfile, upsertProfile } from "@/lib/data";
import { validateProfile } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const email = request.nextUrl.searchParams.get("email") || "";
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  return NextResponse.json({ profile: await getProfile(email) });
}

export async function POST(request) {
  const body = await request.json();
  const error = validateProfile(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const profile = await upsertProfile({
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.phone?.trim() || "",
    headline: body.headline.trim(),
    location: body.location.trim(),
    targetRole: body.targetRole.trim(),
    experienceLevel: body.experienceLevel.trim(),
    skills: body.skills.trim(),
    bio: body.bio.trim(),
    preferredMode: body.preferredMode?.trim() || "Any",
    linkedinUrl: body.linkedinUrl?.trim() || "",
    portfolioUrl: body.portfolioUrl?.trim() || "",
    resumeUrl: body.resumeUrl?.trim() || "",
  });
  return NextResponse.json({ profile });
}

export async function DELETE(request) {
  const body = await request.json();
  if (!body.email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  await deleteCandidateData(body.email);
  return NextResponse.json({ success: true });
}
