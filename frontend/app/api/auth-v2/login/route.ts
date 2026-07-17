import { NextResponse } from "next/server";
import { generateSessionToken } from "@/lib/auth-v2/session";
import { walletSelectByCol } from "@/lib/auth-v2/queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet_address } = body;

    if (!wallet_address || typeof wallet_address !== "string") {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Lookup wallet
    const { data: user, error: lookupError } = await walletSelectByCol(
      "id, wallet_address, email, created_at, updated_at",
      "wallet_address",
      wallet_address,
    );

    if (lookupError || !user) {
      return NextResponse.json(
        { error: "No account found. Please create an account first." },
        { status: 404 }
      );
    }

    // Create session cookie
    const token = generateSessionToken(user.wallet_address, user.email);

    const response = NextResponse.json({ user });

    response.cookies.set("orka_v2_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (e) {
    console.error("auth-v2 login error:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? String(e) : "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
