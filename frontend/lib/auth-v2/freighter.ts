import { getAddress, isAllowed, requestAccess } from "@stellar/freighter-api";

export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await isAllowed();
    return result.isAllowed;
  } catch {
    return false;
  }
}

export async function connectFreighter(): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Browser required");
  }

  let allowed = false;
  try {
    const result = await isAllowed();
    allowed = result.isAllowed;
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

  return address;
}

export function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
