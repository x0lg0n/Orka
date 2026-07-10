import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";

// Completes the Supabase Auth flow initiated by:
//  - Google OAuth (PKCE): lands here with ?code=...
//  - Email confirmation / invite (implicit token): lands here with
//    ?token_hash=...&type=email — exchanged via verifyOtp.
// After establishing the session cookie it redirects to `next`.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "email"
    | "signup"
    | "recovery"
    | "invite"
    | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/signup?error=auth_callback`);
}
