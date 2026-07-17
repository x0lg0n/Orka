import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth-v2/session";

export async function POST() {
  try {
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Could not clear session" },
      { status: 500 }
    );
  }
}
