/* eslint-disable @typescript-eslint/no-explicit-any */
/* The `wallet_users` table is not in Supabase generated types, so `.from()`
   infers `never`. This module wraps the call and re-types the chain. */

import { getWalletUsersClient } from "@/lib/auth-v2/db";

export interface WalletUserRow {
  id: string;
  wallet_address: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface TypedResult {
  data: WalletUserRow | null;
  error: unknown;
}

export async function walletSelect(
  columns: string,
): Promise<TypedResult> {
  const supabase: any = getWalletUsersClient();
  const result: any = await supabase.from("wallet_users").select(columns).single();
  return result as TypedResult;
}

export async function walletSelectByCol(
  columns: string,
  col: string,
  val: string,
): Promise<TypedResult> {
  const supabase: any = getWalletUsersClient();
  const result: any = await supabase
    .from("wallet_users")
    .select(columns)
    .eq(col, val)
    .single();
  return result as TypedResult;
}

export async function walletInsert(
  row: { wallet_address: string; email: string },
  selectColumns: string,
): Promise<TypedResult> {
  const supabase: any = getWalletUsersClient();
  const result: any = await supabase
    .from("wallet_users")
    .insert(row)
    .select(selectColumns)
    .single();
  return result as TypedResult;
}
