import { createOrkaClient } from "@orka/stellar-sdk";
import { getAddress, requestAccess, isAllowed, signMessage } from "@stellar/freighter-api";

export type OrkaCustodyMode = "orka" | "freighter";

export function buildLoginChallenge(address: string): string {
  return `orka-login|${Date.now()}|${address}`;
}

export async function connectAndSignLogin(): Promise<{ address: string; challenge: string; signature: string }> {
  if (typeof window === "undefined") {
    throw new Error("Browser required");
  }
  // The @stellar/freighter-api package detects the extension itself. Do NOT
  // guard on window.freighter — Freighter injects asynchronously and that
  // check is unreliable (it can be absent even when the extension is installed).
  let allowed = false;
  try {
    allowed = (await isAllowed()).isAllowed;
  } catch {
    allowed = false;
  }
  if (!allowed) {
    try {
      await requestAccess();
    } catch {
      throw new Error("Freighter extension not available");
    }
  }
  const { address } = await getAddress();
  if (!address) throw new Error("No Stellar address in Freighter");
  const challenge = buildLoginChallenge(address);
  const res = await signMessage(challenge);
  const signature = res.signedMessage;
  if (typeof signature !== "string" || !signature) {
    throw new Error("Freighter did not return a signature");
  }
  return { address, challenge, signature };
}

export function orkaClient(mode: OrkaCustodyMode) {
  return createOrkaClient({ baseUrl: process.env.SERVICES_URL ?? "", mode });
}

export async function connectFreighter(): Promise<string> {
  if (typeof window === "undefined" || !window.freighter) {
    throw new Error("Freighter not installed");
  }
  if (!(await window.freighter.isConnected())) {
    throw new Error("Freighter not connected");
  }
  return window.freighter.getPublicKey();
}

export async function submitFreighterXdr(xdr: string): Promise<string> {
  if (typeof window === "undefined" || !window.freighter) {
    throw new Error("Freighter not installed");
  }
  const f = window.freighter;
  if (f.signAndSubmitXdr) {
    const r = await f.signAndSubmitXdr({ xdr });
    return String(r.hash);
  }
  if (f.signTransaction) {
    await f.signTransaction(xdr, {});
    throw new Error("signTransaction path needs a submit endpoint (deferred)");
  }
  throw new Error("Freighter cannot sign");
}
