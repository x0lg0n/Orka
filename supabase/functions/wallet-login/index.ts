// Supabase Edge Function: wallet-login
//
// Wallet-first auth verifier. NOT the Rust backend, NOT a Soroban contract.
// Flow:
//   1. Frontend gets the user's public key from Freighter.
//   2. Frontend asks the wallet to sign a server-issued challenge (e.g. the
//      public key + a nonce + expiry). The wallet signs entirely in the browser.
//   3. Frontend POSTs { address, signature, challenge } here.
//   4. We verify the ed25519 signature against the Stellar address.
//   5. On signup, create a user for a new wallet and return its session.
//      On sign-in, return a session only when that wallet already has an account.
//
// The browser then sets the Supabase session cookie (@supabase/ssr) and the
// user lands in /workspaces. No email, no password, no OAuth wall.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Challenge must contain the address and an expiry we issued. We keep it simple:
// the frontend sends the exact message string the wallet signed. We validate it
// is well-formed (contains the address + "orka" + a timestamp) and not expired.
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { address, signature, challenge, intent = "signin" } = await req.json().catch(() => ({}));
  if (!address || !signature || !challenge) {
    return json({ error: "missing_fields" }, 400);
  }
  if (intent !== "signin" && intent !== "signup") {
    return json({ error: "bad_intent" }, 400);
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

  // 2. Verify the Ed25519 signature using Stellar SEP-53. Freighter signs the
  // SHA-256 digest of "Stellar Signed Message:\n" followed by the message,
  // rather than the raw challenge bytes. This uses Deno's built-in Web Crypto
  // rather than stellar-base, which pulls a native sodium addon that cannot
  // run in Supabase Edge Functions.
  let publicKey: Uint8Array;
  try {
    publicKey = stellarPublicKeyBytes(address as string);
  } catch {
    return json({ error: "bad_address" }, 400);
  }
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      publicKey,
      { name: "Ed25519" },
      false,
      ["verify"],
    );
  } catch {
    return json({ error: "verification_unavailable" }, 500);
  }
  let ok = false;
  try {
    const signedPayload = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`Stellar Signed Message:\n${challenge as string}`),
    );
    ok = await crypto.subtle.verify(
      "Ed25519",
      key,
      base64ToBytes(signature as string),
      signedPayload,
    );
  } catch {
    return json({ error: "bad_signature" }, 401);
  }
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
    if (intent === "signin") {
      return json({ error: "wallet_not_registered" }, 404);
    }

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

  // 4. Generate a short-lived Supabase magic-link token. The browser can
  // exchange its hash for a session only after this function has verified the
  // wallet signature. `auth.admin.createSession` is not a Supabase Admin API.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: syntheticEmail,
  });
  const tokenHash = linkData.properties?.hashed_token;
  const verificationType = linkData.properties?.verification_type;
  if (linkErr || !tokenHash || !verificationType) {
    return json({ error: "session_failed", detail: linkErr?.message }, 500);
  }

  return json({
    user: { id: userId, email: syntheticEmail, stellar_address: address },
    created: !existing?.user_id,
    token_hash: tokenHash,
    verification_type: verificationType,
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STELLAR_PUBLIC_KEY_VERSION = 6 << 3;

function stellarPublicKeyBytes(address: string): Uint8Array {
  if (!/^G[A-Z2-7]{55}$/.test(address)) {
    throw new Error("Invalid Stellar public key");
  }

  const decoded = base32Decode(address);
  if (decoded.length !== 35 || decoded[0] !== STELLAR_PUBLIC_KEY_VERSION) {
    throw new Error("Invalid Stellar public key");
  }

  const payload = decoded.slice(0, 33);
  const checksum = crc16Xmodem(payload);
  if (decoded[33] !== (checksum & 0xff) || decoded[34] !== (checksum >> 8)) {
    throw new Error("Invalid Stellar public key checksum");
  }

  return decoded.slice(1, 33);
}

function base32Decode(value: string): Uint8Array {
  let bits = 0;
  let buffer = 0;
  const output: number[] = [];

  for (const character of value) {
    const index = BASE32_ALPHABET.indexOf(character);
    if (index === -1) throw new Error("Invalid base32 input");
    buffer = (buffer << 5) | index;
    bits += 5;
    while (bits >= 8) {
      output.push((buffer >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  if (bits > 0 && (buffer & ((1 << bits) - 1)) !== 0) {
    throw new Error("Invalid base32 padding");
  }
  return Uint8Array.from(output);
}

function crc16Xmodem(bytes: Uint8Array): number {
  let crc = 0;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}
