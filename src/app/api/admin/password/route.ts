import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { checkAdminPassword, setAdminPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
    }

    if (!checkAdminPassword(currentPassword)) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: "New password must be at least 4 characters" }, { status: 400 });
    }

    setAdminPassword(newPassword);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Password change error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
