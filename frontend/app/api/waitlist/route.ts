import { NextResponse } from "next/server";
import { getResend } from "../../../lib/resend";
import { getSupabase } from "../../../lib/supabase";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "We could not read that submission. Please refresh and try once more.",
      },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Please enter your email again." },
      { status: 400 }
    );
  }

  const fields = body as { email?: unknown; name?: unknown };
  const email =
    typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";
  const name = typeof fields.name === "string" ? fields.name.trim() : "";

  if (!email) {
    return NextResponse.json(
      { error: "Add your email to get started with ORKA." },
      { status: 400 }
    );
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "That email does not look right. Check it and try again." },
      { status: 400 }
    );
  }

  let supabase: ReturnType<typeof getSupabase>;

  try {
    supabase = getSupabase();
  } catch (configError) {
    console.error("Waitlist Supabase configuration error:", configError);
    return NextResponse.json(
      {
        error:
          "Waitlist is temporarily unavailable. Please try again in a minute.",
      },
      { status: 503 }
    );
  }

  const { error: dbError } = await supabase.from("waitlist").insert({
    email,
    name: name || null,
  });

  if (dbError) {
    if (dbError.code === "23505") {
      return NextResponse.json({
        success: true,
        message: "You're already on the ORKA waitlist.",
      });
    }

    console.error("Supabase insert error:", dbError);
    return NextResponse.json(
      {
        error:
          "We could not save your spot right now. Please try again shortly.",
      },
      { status: 500 }
    );
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const safeName = name ? escapeHtml(name) : "";

  try {
    const resend = getResend();
    const { data, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "You're on the ORKA waitlist!",
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome to the ORKA waitlist${safeName ? `, ${safeName}` : ""}!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thanks for joining. You'll be among the first to know when design partner slots open and early access becomes available.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 24px;">
            We're building the autonomous financial operating system for global service work, and we'll keep you in the loop every step of the way.
          </p>
          <p style="font-size: 14px; color: #999; margin-top: 32px;">
            — The ORKA team
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend email error:", emailError);
    } else {
      console.log("Resend email sent:", data?.id);
    }
  } catch (emailError) {
    console.error("Resend email error:", emailError);
  }

  return NextResponse.json({
    success: true,
    message: "You're on the ORKA waitlist.",
  });
}
