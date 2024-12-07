# Jupiverse Kit

A lightweight TypeScript SDK for interacting with all things Jupiter on Solana. This SDK provides an easy-to-use interface for developers to perform all things Jupiter.

Created and maintained by [Dann](https://github.com/dannweeeee)

## Features

- Jupiter V6 Swap API Service
  - Easy token swaps using Jupiter V6 API
  - Custom RPC endpoint configuration
  - Configurable slippage tolerance
  - Helper methods for common swap patterns (SOL to Token, Token to SOL)

**_more features coming soon!_**

## Installation

```bash
npm install jupiverse-kit
```

## Usage

### Basic Setup

```typescript
import { JupiterSwap } from "jupiverse-kit";
import { Keypair } from "@solana/web3.js";

// Initialize the SDK
const jupiter = new JupiterSwap({
  rpcUrl: "YOUR_SOLANA_RPC_URL",
  slippageBps: 100, // optional, defaults to 100 (1%)
});

// Your wallet keypair
const wallet = Keypair.fromSecretKey(/* your wallet secret key */);
```

### Get Quote

```typescript
const quote = await jupiter.getQuote({
  inputMint: "TOKEN_1_MINT_ADDRESS",
  outputMint: "TOKEN_2_MINT_ADDRESS",
  amount: 1.0, // amount in SOL
  walletPublicKey: wallet.publicKey,
});

console.log("Quote:", quote);
```

### Perform Swap

```typescript
const result = await jupiter.swap(
  {
    inputMint: "TOKEN_1_MINT_ADDRESS",
    outputMint: "TOKEN_2_MINT_ADDRESS",
    amount: 1.0,
    walletPublicKey: wallet.publicKey,
  },
  wallet
);

if (result.success) {
  console.log("Swap successful! Transaction signature:", result.signature);
} else {
  console.error("Swap failed:", result.error);
}
```

### Helper Methods

#### Swap SOL to Token

```typescript
const result = await jupiter.swapFromSol(
  "TOKEN_MINT_ADDRESS",
  1.0, // amount in SOL
  wallet
);
```

#### Swap Token to SOL

```typescript
const result = await jupiter.swapToSol(
  "TOKEN_MINT_ADDRESS",
  100.0, // amount of tokens
  wallet
);
```

## API Reference

### Jupiverse Kit

#### Constructor

```typescript
constructor(config: JupiterConfig)
```

Configuration options:

- `rpcUrl` (required): Solana RPC endpoint URL
- `slippageBps` (optional): Slippage tolerance in basis points (default: 100)

#### Methods

##### getQuote

```typescript
async getQuote(params: SwapParams): Promise<QuoteResponse>
```

Get a quote for swapping tokens.

Parameters:

- `inputMint`: Input token mint address
- `outputMint`: Output token mint address
- `amount`: Amount to swap
- `walletPublicKey`: Wallet public key

##### swap

```typescript
async swap(params: SwapParams, wallet: Keypair): Promise<SwapResult>
```

Execute a token swap.

Parameters:

- `params`: SwapParams object (same as getQuote)
- `wallet`: Keypair for signing the transaction

Returns:

- `signature`: Transaction signature
- `success`: Boolean indicating success
- `error`: Error message if swap failed

##### swapFromSol

```typescript
async swapFromSol(outputMint: string | PublicKey, amount: number, wallet: Keypair): Promise<SwapResult>
```

Helper method to swap SOL to any token.

##### swapToSol

```typescript
async swapToSol(inputMint: string | PublicKey, amount: number, wallet: Keypair): Promise<SwapResult>
```

Helper method to swap any token to SOL.

## Error Handling

The SDK includes comprehensive error handling. All methods return detailed error messages when something goes wrong. The `SwapResult` interface includes an `error` field that will contain any error messages if the swap fails.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
