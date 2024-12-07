import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { JupiterConfig, SwapParams, QuoteResponse, SwapResult } from "./types";
import {
  WRAPPED_SOL_MINT,
  DEFAULT_SLIPPAGE_BPS,
  JUPITER_V6_QUOTE_API,
  JUPITER_V6_SWAP_API,
} from "./constants";
import {
  validatePublicKey,
  createConnection,
  deserializeTransaction,
  normalizeAmount,
  fetchWithError,
} from "./utils";

export class JupiterSwap {
  private connection: Connection;
  private slippageBps: number;

  constructor(config: JupiterConfig) {
    this.connection = createConnection(config.rpcUrl);
    this.slippageBps = config.slippageBps || DEFAULT_SLIPPAGE_BPS;
  }

  /**
   * Get a quote for swapping tokens
   * @param params SwapParams object containing swap details
   * @returns Quote response from Jupiter
   */
  async getQuote(params: SwapParams): Promise<QuoteResponse> {
    const inputMint = validatePublicKey(params.inputMint).toString();
    const outputMint = validatePublicKey(params.outputMint).toString();
    const amount = normalizeAmount(params.amount).toString();

    const quoteApi = new URL(JUPITER_V6_QUOTE_API);
    quoteApi.searchParams.append("inputMint", inputMint);
    quoteApi.searchParams.append("outputMint", outputMint);
    quoteApi.searchParams.append("amount", amount);
    quoteApi.searchParams.append("slippageBps", this.slippageBps.toString());

    return await fetchWithError(quoteApi.toString());
  }

  /**
   * Execute a token swap
   * @param params SwapParams object containing swap details
   * @param wallet Keypair for signing the transaction
   * @returns SwapResult containing the transaction signature
   */
  async swap(params: SwapParams, wallet: Keypair): Promise<SwapResult> {
    try {
      // Get quote first
      const quoteResponse = await this.getQuote(params);

      // Get swap transaction
      const swapResponse = await fetchWithError(JUPITER_V6_SWAP_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: wallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
          dynamicSlippage: { maxBps: this.slippageBps },
        }),
      });

      // Deserialize and sign transaction
      const transaction = await deserializeTransaction(
        swapResponse.swapTransaction
      );
      transaction.sign([wallet]);

      // Get latest blockhash and send transaction
      const latestBlockhash = await this.connection.getLatestBlockhash();
      const rawTransaction = transaction.serialize();

      // Send and confirm transaction
      const signature = await this.connection.sendRawTransaction(
        rawTransaction,
        {
          skipPreflight: true,
          maxRetries: 2,
        }
      );

      await this.connection.confirmTransaction({
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature,
      });

      return {
        signature,
        success: true,
      };
    } catch (error: any) {
      return {
        signature: "",
        success: false,
        error: error?.message || "Unknown error occurred during swap",
      };
    }
  }

  /**
   * Helper method to swap SOL to any token
   * @param outputMint The token to swap to
   * @param amount Amount of SOL to swap
   * @param wallet Keypair for signing the transaction
   * @returns SwapResult containing the transaction signature
   */
  async swapFromSol(
    outputMint: string | PublicKey,
    amount: number,
    wallet: Keypair
  ): Promise<SwapResult> {
    return this.swap(
      {
        inputMint: WRAPPED_SOL_MINT,
        outputMint,
        amount,
        walletPublicKey: wallet.publicKey,
      },
      wallet
    );
  }

  /**
   * Helper method to swap any token to SOL
   * @param inputMint The token to swap from
   * @param amount Amount of tokens to swap
   * @param wallet Keypair for signing the transaction
   * @returns SwapResult containing the transaction signature
   */
  async swapToSol(
    inputMint: string | PublicKey,
    amount: number,
    wallet: Keypair
  ): Promise<SwapResult> {
    return this.swap(
      {
        inputMint,
        outputMint: WRAPPED_SOL_MINT,
        amount,
        walletPublicKey: wallet.publicKey,
      },
      wallet
    );
  }
}
