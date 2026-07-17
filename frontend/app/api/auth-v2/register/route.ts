import { NextResponse } from "next/server";
import { generateSessionToken } from "@/lib/auth-v2/session";
import { walletSelectByCol, walletInsert } from "@/lib/auth-v2/queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet_address, email } = body;

    if (!wallet_address || typeof wallet_address !== "string") {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Check for duplicate wallet
    const { data: existingWallet } = await walletSelectByCol(
      "id",
      "wallet_address",
      wallet_address,
    );

    if (existingWallet) {
      return NextResponse.json(
        { error: "Wallet already registered. Please sign in instead." },
        { status: 409 }
      );
    }

    // Check for duplicate email
    const { data: existingEmail } = await walletSelectByCol(
      "id",
      "email",
      email.toLowerCase().trim(),
    );

    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Insert new user
    const { data: newUser, error: insertError } = await walletInsert(
      {
        wallet_address,
        email: email.toLowerCase().trim(),
      },
      "id, wallet_address, email, created_at, updated_at",
    );

    if (insertError || !newUser) {
      console.error("auth-v2 register insert error:", insertError);
      return NextResponse.json(
        { error: "Could not create account. Try again." },
        { status: 500 }
      );
    }

    // Create session cookie
    const token = generateSessionToken(wallet_address, email.toLowerCase().trim());

    const response = NextResponse.json(
      { user: newUser },
      { status: 201 }
    );

    response.cookies.set("orka_v2_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (e) {
    console.error("auth-v2 register error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
