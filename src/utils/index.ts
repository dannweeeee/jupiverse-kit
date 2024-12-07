import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { JupiterError } from "../types";

export function validatePublicKey(key: string | PublicKey): PublicKey {
  try {
    return key instanceof PublicKey ? key : new PublicKey(key);
  } catch (error: any) {
    throw new JupiterError(`Invalid public key: ${error?.message || 'Unknown error'}`, 'INVALID_PUBLIC_KEY');
  }
}

export function createConnection(rpcUrl: string): Connection {
  try {
    return new Connection(rpcUrl, "confirmed");
  } catch (error: any) {
    throw new JupiterError(`Failed to create connection: ${error?.message || 'Unknown error'}`, 'CONNECTION_ERROR');
  }
}

export async function deserializeTransaction(transactionBase64: string): Promise<VersionedTransaction> {
  try {
    const transactionBuffer = Buffer.from(transactionBase64, 'base64');
    return VersionedTransaction.deserialize(transactionBuffer);
  } catch (error: any) {
    throw new JupiterError(`Failed to deserialize transaction: ${error?.message || 'Unknown error'}`, 'TRANSACTION_ERROR');
  }
}

export function normalizeAmount(amount: number, decimals: number = 9): number {
  return amount * Math.pow(10, decimals);
}

export async function fetchWithError(url: string, options?: RequestInit): Promise<any> {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new JupiterError(
        `API request failed: ${data.error || response.statusText}`,
        'API_ERROR'
      );
    }
    
    return data;
  } catch (error: any) {
    if (error instanceof JupiterError) throw error;
    throw new JupiterError(`Network request failed: ${error?.message || 'Unknown error'}`, 'NETWORK_ERROR');
  }
}
