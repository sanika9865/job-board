import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("resume");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Select a resume file." }, { status: 400 });
  }
  if (!["application/pdf"].includes(file.type)) {
    return NextResponse.json(
      { error: "Resume must be a PDF file." },
      { status: 400 },
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Resume must be smaller than 5 MB." },
      { status: 400 },
    );
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}.pdf`;
  await fs.writeFile(
    path.join(uploadDirectory, filename),
    Buffer.from(await file.arrayBuffer()),
  );

  return NextResponse.json({ url: `/uploads/${filename}` });
}
