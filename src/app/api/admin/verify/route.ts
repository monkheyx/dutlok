import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (checkAdminPassword(password)) {
    return NextResponse.json({ valid: true });
  }
  return NextResponse.json({ valid: false }, { status: 401 });
}
