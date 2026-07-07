import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";
import { getResend } from "../../../lib/resend";

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { error: dbError } = await supabase.from("waitlist").insert({
      email: trimmedEmail,
      name: name?.trim() || null,
    });

    if (dbError) {
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "This email is already on the waitlist." },
          { status: 409 }
        );
      }
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    try {
      const resend = getResend();
      const { data, error: emailError } = await resend.emails.send({
        from: fromEmail,
        to: trimmedEmail,
        subject: "You're on the ORKA waitlist!",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome to the ORKA waitlist${name ? `, ${name}` : ""}!</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Thanks for joining. You'll be among the first to know when design partner slots open and early access becomes available.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 24px;">
              We're building the autonomous financial operating system for global service work — and we'll keep you in the loop every step of the way.
            </p>
            <p style="font-size: 14px; color: #999; margin-top: 32px;">
              — The ORKA team
            </p>
          </div>
        `,
      });

      if (emailError) {
        console.error("Resend email error:", emailError);
        return NextResponse.json(
          { error: `Email failed to send: ${emailError.message}` },
          { status: 500 }
        );
      }

      console.log("Resend email sent:", data?.id);
    } catch (emailError) {
      console.error("Resend email error:", emailError);
      return NextResponse.json(
        { error: "Email failed to send. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Please try again." },
      { status: 400 }
    );
  }
}
