export type CustodyMode = 'orka' | 'freighter';

/**
 * Result of a fund/release call.
 * - Mode A (`orka`): the backend signs with the ORKA operator key and returns a
 *   transaction hash once submitted.
 * - Mode B (`freighter`): the backend returns a signed tx XDR that the browser
 *   hands to the Freighter wallet for the user to sign/broadcast.
 */
export type FundResult = { txHash: string } | { txXdr: string };

/**
 * Result of a createEscrow call.
 * - Mode A (`orka`): returns the deployed contract address.
 * - Mode B (`freighter`): returns the unsigned XDR for browser signing.
 */
export type CreateEscrowResult = { contractId: string } | { txXdr: string };

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

export interface MilestoneArgs {
  contractId: string;
  milestoneId: number;
}

/** One milestone's on-chain init data (amount + off-chain description for mapping). */
export interface MilestoneInitItem {
  amount: number;
  description: string;
}

/** Arguments to create/deploy a new escrow contract via the factory. */
export interface CreateEscrowArgs {
  orgId: string;
  projectId: string;
  /** Client's Stellar account strkey (G...). */
  client: string;
  /** Freelancer/agency Stellar account strkey (G...). */
  freelancer: string;
  /** Soroban token contract address (C...). */
  asset: string;
  /** Milestone amounts and descriptions, in order. */
  milestones: MilestoneInitItem[];
  /** DB uuids of each milestone, parallel to `milestones` by index. */
  milestoneIds: string[];
  /** Optional dispute split basis points (defaults to contract's built-in rule). */
  disputeRules?: number;
  /** Optional operator address (defaults to backend-configured operator). */
  operator?: string;
}
