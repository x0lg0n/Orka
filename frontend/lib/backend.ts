export async function callServices(
  path: string,
  body: unknown,
): Promise<{ tx_hash?: string; tx_xdr?: string }> {
  const base = process.env.SERVICES_URL;
  if (!base) throw new Error("SERVICES_URL not set");
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`services ${path} failed: ${res.status}`);
  return res.json() as Promise<{ tx_hash?: string; tx_xdr?: string }>;
}
