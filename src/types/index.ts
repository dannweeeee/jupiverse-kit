import { PublicKey } from "@solana/web3.js";

export interface JupiterConfig {
  rpcUrl: string;
  slippageBps?: number;
}

export interface SwapParams {
  inputMint: string | PublicKey;
  outputMint: string | PublicKey;
  amount: number;
  walletPublicKey: string | PublicKey;
}

export interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  amount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: unknown;
  priceImpactPct: string;
  routePlan: Array<unknown>;
  contextSlot: number;
  timeTaken: number;
}

export interface SwapResult {
  signature: string;
  success: boolean;
  error?: string;
}

export class JupiterError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'JupiterError';
  }
}
