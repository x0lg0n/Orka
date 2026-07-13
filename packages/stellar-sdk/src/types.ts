export type CustodyMode = 'orka' | 'freighter';

/**
 * Result of a fund/release call.
 * - Mode A (`orka`): the backend signs with the ORKA operator key and returns a
 *   transaction hash once submitted.
 * - Mode B (`freighter`): the backend returns a signed tx XDR that the browser
 *   hands to the Freighter wallet for the user to sign/broadcast.
 */
export type FundResult = { txHash: string } | { txXdr: string };

export interface OrkaClientOptions {
  /** Base URL of the Rust `services/` API, e.g. `http://localhost:3000`. */
  baseUrl: string;
  /** Custody mode this client operates in. */
  mode: CustodyMode;
}

export interface FundArgs {
  contractId: string;
  milestoneIds: number[];
}

export interface ReleaseArgs {
  contractId: string;
  milestoneId: number;
}
