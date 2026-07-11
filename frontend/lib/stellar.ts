import { createOrkaClient } from "@orka/stellar-sdk";

export type OrkaCustodyMode = "orka" | "freighter";

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
