import type {
  CustodyMode,
  FundArgs,
  FundResult,
  OrkaClientOptions,
  ReleaseArgs,
} from './types';

// Per root ROADMAP §Auth & Custody Model:
//  - Mode A (orka): the backend signs with the ORKA operator key; the route
//    returns a tx hash once the tx is submitted.
//  - Mode B (freighter): the backend returns a signed tx XDR that the browser
//    hands to the Freighter wallet for the user to sign/broadcast.
// This client NEVER holds ORKA_OPERATOR_SECRET — it only forwards `mode`;
// signing happens server-side (Mode A) or inside Freighter (Mode B).

export function createOrkaClient(opts: OrkaClientOptions) {
  const baseUrl = opts.baseUrl.replace(/\/$/, '');

  async function escrowPost(
    path: string,
    body: Record<string, unknown>,
  ): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, mode: opts.mode }),
    });
  }

  function toFundResult(data: Record<string, unknown>): FundResult {
    if (opts.mode === 'freighter') {
      return { txXdr: String(data.txXdr) };
    }
    return { txHash: String(data.txHash) };
  }

  async function fundEscrow(args: FundArgs): Promise<FundResult> {
    const res = await escrowPost('/escrow/fund', {
      contractId: args.contractId,
      milestoneIds: args.milestoneIds,
    });
    if (!res.ok) throw new Error(`fundEscrow failed: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return toFundResult(data);
  }

  async function releaseMilestone(args: ReleaseArgs): Promise<FundResult> {
    const res = await escrowPost('/escrow/release', {
      contractId: args.contractId,
      milestoneId: args.milestoneId,
    });
    if (!res.ok) throw new Error(`releaseMilestone failed: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return toFundResult(data);
  }

  async function getContractState(args: {
    contractId: string;
  }): Promise<unknown> {
    const url = `${baseUrl}/escrow/state?contract_id=${encodeURIComponent(args.contractId)}`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`getContractState failed: ${res.status}`);
    return res.json();
  }

  return { fundEscrow, releaseMilestone, getContractState };
}

export type OrkaClient = ReturnType<typeof createOrkaClient>;
