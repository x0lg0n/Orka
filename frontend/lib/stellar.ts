import { createOrkaClient } from "@orka/stellar-sdk";
import { getAddress, requestAccess, isAllowed, signMessage } from "@stellar/freighter-api";

export type OrkaCustodyMode = "orka" | "freighter";

export function buildLoginChallenge(address: string): string {
  return `orka-login|${Date.now()}|${address}`;
}

export async function connectAndSignLogin(): Promise<{ address: string; challenge: string; signature: string }> {
  if (typeof window === "undefined" || !window.freighter) {
    throw new Error("Freighter not installed");
  }
  if (!(await isAllowed())) await requestAccess();
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
