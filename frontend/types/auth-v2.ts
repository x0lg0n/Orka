export interface WalletUser {
  id: string;
  wallet_address: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface SessionPayload {
  wallet_address: string;
  email: string;
  iat: number;
}

export type AuthV2Error =
  | { type: "freighter_not_installed"; message: string }
  | { type: "freighter_rejected"; message: string }
  | { type: "duplicate_wallet"; message: string }
  | { type: "duplicate_email"; message: string }
  | { type: "wallet_not_found"; message: string }
  | { type: "invalid_email"; message: string }
  | { type: "session_failed"; message: string }
  | { type: "unknown"; message: string };
