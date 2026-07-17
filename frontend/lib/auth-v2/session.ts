import { createHmac } from "crypto";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/types/auth-v2";

const COOKIE_NAME = "orka_v2_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.AUTH_V2_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_V2_SESSION_SECRET must be set and at least 32 characters");
  }
  return secret;
}

export function signSession(payload: SessionPayload): string {
  const secret = getSecret();
  const data = JSON.stringify(payload);
  const signature = createHmac("sha256", secret).update(data).digest("hex");
  return Buffer.from(data).toString("base64") + "." + signature;
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const secret = getSecret();
    const [dataB64, signature] = token.split(".");
    if (!dataB64 || !signature) return null;

    const data = Buffer.from(dataB64, "base64").toString("utf-8");
    const expected = createHmac("sha256", secret).update(data).digest("hex");

    if (signature !== expected) return null;

    const payload = JSON.parse(data) as SessionPayload;
    if (!payload.wallet_address || !payload.email || !payload.iat) return null;

    return payload;
  } catch {
    return null;
  }
}

export function generateSessionToken(walletAddress: string, email: string): string {
  const payload: SessionPayload = {
    wallet_address: walletAddress,
    email,
    iat: Math.floor(Date.now() / 1000),
  };
  return signSession(payload);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}
