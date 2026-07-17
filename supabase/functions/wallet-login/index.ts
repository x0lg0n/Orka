// Supabase Edge Function: wallet-login
//
// Wallet-first auth verifier. NOT the Rust backend, NOT a Soroban contract.
// Flow:
//   1. Frontend gets the user's public key from Freighter.
//   2. Frontend asks the wallet to sign a server-issued challenge (e.g. the
//      public key + a nonce + expiry). The wallet signs entirely in the browser.
//   3. Frontend POSTs { address, signature, challenge } here.
//   4. We verify the ed25519 signature against the Stellar address.
//   5. If the address already maps to a user -> return that user's session.
//      Else -> create a user with a synthetic email (<address>@wallet.orka.so),
//      password login DISABLED, custody_mode='freighter', and return a session.
//
// The browser then sets the Supabase session cookie (@supabase/ssr) and the
// user lands in /workspaces. No email, no password, no OAuth wall.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Keypair } from "https://esm.sh/@stellar/stellar-base@12";

// Challenge must contain the address and an expiry we issued. We keep it simple:
// the frontend sends the exact message string the wallet signed. We validate it
// is well-formed (contains the address + "orka" + a timestamp) and not expired.
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { address, signature, challenge } = await req.json().catch(() => ({}));
  if (!address || !signature || !challenge) {
    return json({ error: "missing_fields" }, 400);
  }

  // 1. Challenge shape + expiry check.
  const m = /orka-login\|([0-9]+)/.exec(challenge as string);
  if (!m || !challenge.includes(address)) {
    return json({ error: "bad_challenge" }, 400);
  }
  const issued = Number(m[1]);
  if (!Number.isFinite(issued) || Date.now() - issued > CHALLENGE_TTL_MS) {
    return json({ error: "challenge_expired" }, 400);
  }

  // 2. Verify the ed25519 signature over the challenge.
  let kp: Keypair;
  try {
    kp = Keypair.fromPublicKey(address as string);
  } catch {
    return json({ error: "bad_address" }, 400);
  }
  const ok = kp.verify(
    new TextEncoder().encode(challenge as string),
    base64ToBytes(signature as string),
  );
  if (!ok) {
    return json({ error: "bad_signature" }, 401);
  }

  // 3. Find or create the user.
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const syntheticEmail = `${(address as string).toLowerCase()}@wallet.orka.so`;

  const { data: existing } = await admin
    .from("wallets")
    .select("user_id")
    .eq("address", address)
    .maybeSingle();

  let userId: string;

  if (existing?.user_id) {
    userId = existing.user_id as string;
  } else {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: syntheticEmail,
      email_confirm: true,
      // Password login disabled for wallet accounts: no password set.
      user_metadata: {
        stellar_address: address,
        custody_mode: "freighter",
      },
      app_metadata: { provider: "freighter" },
    });
    if (createErr || !created.user) {
      return json({ error: "create_failed", detail: createErr?.message }, 500);
    }
    userId = created.user.id;

    // Record the wallet + profile custody mode.
    await admin.from("wallets").insert({
      user_id: userId,
      network: "testnet",
      address,
      wallet_type: "freighter",
      is_primary: true,
    });
    await admin
      .from("profiles")
      .update({ stellar_address: address, custody_mode: "freighter" })
      .eq("id", userId);
  }

  // 4. Issue a session for the user.
  const { data: sessionData, error: sessionErr } = await admin.auth.admin
    .createSession(userId);
  if (sessionErr || !sessionData.session) {
    return json({ error: "session_failed", detail: sessionErr?.message }, 500);
  }

  return json({
    user: { id: userId, email: syntheticEmail, stellar_address: address },
    session: sessionData.session,
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
