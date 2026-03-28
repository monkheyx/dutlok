import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { checkAdminPassword } from "@/lib/auth";

// POST /api/news/upload — upload an image, returns a base64 data URI
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get("password") as string;

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only PNG, JPEG, GIF, and WebP images are allowed" }, { status: 400 });
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  return NextResponse.json({ url: dataUri });
}
