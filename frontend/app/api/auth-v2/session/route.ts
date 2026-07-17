import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth-v2/session";

export async function GET() {
  try {
    const session = await getSessionFromCookie();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        wallet_address: session.wallet_address,
        email: session.email,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Session verification failed" },
      { status: 401 }
    );
  }
}
