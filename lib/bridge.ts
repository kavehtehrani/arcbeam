import { BridgeKit } from "@circle-fin/bridge-kit";
import { createAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  formatUnits,
  getAddress,
} from "ethers";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Chain as ViemChain,
  type PublicClient,
  type WalletClient,
} from "viem";
import { arcTestnet } from "viem/chains";
import { type ChainConfig } from "./chains";

// ERC20 ABI for balance and allowance queries
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)",
] as const;

export interface BridgeParams {
  amount: string;
  sourceChain: ChainConfig;
  destinationChain: ChainConfig;
  userAddress: string;
  provider: BrowserProvider;
  eip1193Provider: any;
  recipientAddress?: string; // Optional recipient address on destination chain
}

export interface BridgeResult {
  state: "success" | "error" | "partial";
  sourceTxHash?: string;
  steps?: Array<{
    name: string;
    state: string;
    txHash?: string;
    errorMessage?: string;
  }>;
  attestation?: {
    attestation: string;
    message: string;
    eventNonce: string;
    cctpVersion: number;
    status: string;
  };
  error?: string;
}

/**
 * Create Viem adapter from EIP-1193 provider for Circle Bridge Kit
 *
 * Note: We need to provide getPublicClient to handle Arc Testnet since viem doesn't
 * recognize it by default. The adapter uses viem internally and needs the chain definition.
 */
async function createViemAdapter(
  eip1193Provider: any,
  sourceChainId?: number,
  destinationChainId?: number
): Promise<Awaited<ReturnType<typeof createAdapterFromProvider>>> {
  if (!eip1193Provider) {
    throw new Error("EIP-1193 provider is required");
  }

  // If Arc Testnet is involved, we need to provide getPublicClient so viem knows about it
  const needsArcConfig =
    sourceChainId === 5042002 || destinationChainId === 5042002;

  if (needsArcConfig) {
    return createAdapterFromProvider({
      provider: eip1193Provider,
      getPublicClient: ({ chain }: { chain: ViemChain }): PublicClient => {
        // If viem asks for Arc Testnet, provide our custom chain definition
        if (chain.id === 5042002) {
          return createPublicClient({
            chain: arcTestnet,
            transport: http(arcTestnet.rpcUrls.default.http[0]),
          });
        }
        // For other chains, use default viem behavior
        return createPublicClient({
          chain,
          transport: http(),
        });
      },
    });
  }

  // For non-Arc chains, use simple approach
  return createAdapterFromProvider({
    provider: eip1193Provider,
  });
}

/**
 * Initialize Bridge Kit
 */
function initializeBridgeKit(): BridgeKit {
  return new BridgeKit();
}

/**
 * Get USDC balance for a given address on a chain
 */
export async function getUSDCBalance(
  address: string,
  chain: ChainConfig,
  provider: BrowserProvider | JsonRpcProvider | string
): Promise<string> {
  try {
    if (!chain.usdcAddress) {
      console.warn(`USDC address not configured for ${chain.name}`);
      return "0";
    }

    if (typeof provider === "string" && !provider) {
      console.error(`RPC URL is empty for ${chain.name}`);
      return "0";
    }

    const usdcAddress = getAddress(chain.usdcAddress);
    const userAddress = getAddress(address);

    let contract: Contract;
    if (typeof provider === "string") {
      const rpcProvider = new JsonRpcProvider(provider, {
        name: chain.name,
        chainId: chain.chainId,
      });
      contract = new Contract(usdcAddress, ERC20_ABI, rpcProvider);
      const balance = await contract.balanceOf.staticCall(userAddress);
      const decimals = await contract.decimals.staticCall();
      const formatted = formatUnits(balance, decimals);
      console.log(
        `USDC balance on ${chain.name}:`,
        formatted,
        "for address",
        userAddress
      );
      return formatted;
    } else {
      contract = new Contract(usdcAddress, ERC20_ABI, provider);
      const balance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      return formatUnits(balance, decimals);
    }
  } catch (error) {
    console.error(`Error fetching USDC balance on ${chain.name}:`, error);
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    return "0";
  }
}

/**
 * Get native ETH balance for a given address on a chain
 */
export async function getETHBalance(
  address: string,
  chain: ChainConfig,
  provider: BrowserProvider | JsonRpcProvider | string
): Promise<string> {
  try {
    if (typeof provider === "string" && !provider) {
      console.error(`RPC URL is empty for ${chain.name}`);
      return "0";
    }

    const userAddress = getAddress(address);

    if (typeof provider === "string") {
      const rpcProvider = new JsonRpcProvider(provider, {
        name: chain.name,
        chainId: chain.chainId,
      });
      const balance = await rpcProvider.getBalance(userAddress);
      const formatted = formatUnits(balance, 18);
      console.log(
        `ETH balance on ${chain.name}:`,
        formatted,
        "for address",
        userAddress
      );
      return formatted;
    } else if (provider instanceof JsonRpcProvider) {
      const balance = await provider.getBalance(userAddress);
      return formatUnits(balance, 18);
    } else {
      const balance = await provider.getBalance(userAddress);
      return formatUnits(balance, 18);
    }
  } catch (error) {
    console.error(`Error fetching ETH balance on ${chain.name}:`, error);
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    return "0";
  }
}

/**
 * Get the TokenMessenger contract address for a chain
 * This is the spender address that needs approval for USDC transfers
 */
export function getTokenMessengerAddress(chainId: number): string {
  // TokenMessenger contract addresses for CCTP testnets
  if (chainId === 11155111 || chainId === 84532 || chainId === 421614) {
    return "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5";
  }
  return "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5";
}

/**
 * Get formatted allowance string (human-readable)
 */
export async function getFormattedAllowance(
  userAddress: string,
  spenderAddress: string,
  chain: ChainConfig,
  provider: BrowserProvider | JsonRpcProvider | string
): Promise<string> {
  try {
    const usdcAddress = getAddress(chain.usdcAddress);
    const userAddr = getAddress(userAddress);
    const spenderAddr = getAddress(spenderAddress);

    let contract: Contract;
    let decimals: number;

    if (typeof provider === "string") {
      const rpcProvider = new JsonRpcProvider(provider, {
        name: chain.name,
        chainId: chain.chainId,
      });
      contract = new Contract(usdcAddress, ERC20_ABI, rpcProvider);
      const allowance = await contract.allowance.staticCall(
        userAddr,
        spenderAddr
      );
      decimals = await contract.decimals.staticCall();
      return formatUnits(allowance, decimals);
    } else {
      contract = new Contract(usdcAddress, ERC20_ABI, provider);
      const allowance = await contract.allowance(userAddr, spenderAddr);
      decimals = await contract.decimals();
      return formatUnits(allowance, decimals);
    }
  } catch (error) {
    console.error("Error getting formatted allowance:", error);
    return "0";
  }
}

/**
 * Build and execute bridge transaction using Circle Bridge Kit
 */
export async function bridgeUSDC(params: BridgeParams): Promise<BridgeResult> {
  const { amount, sourceChain, destinationChain, eip1193Provider } = params;

  try {
    const bridgeKit = initializeBridgeKit();

    if (!eip1193Provider) {
      return {
        state: "error",
        error: "EIP-1193 provider is required for adapter creation",
      };
    }

    if (
      !sourceChain.bridgeKitChainName ||
      !destinationChain.bridgeKitChainName
    ) {
      return {
        state: "error",
        error:
          `Bridge not supported: ${sourceChain.name} → ${destinationChain.name}. ` +
          `Please use Arc Testnet, Sepolia, Base Sepolia, or Arbitrum Sepolia.`,
      };
    }

    console.log("Creating Viem adapter for Circle Bridge Kit...");
    const adapter = await createViemAdapter(
      eip1193Provider,
      sourceChain.chainId,
      destinationChain.chainId
    );
    console.log("Viem adapter created");

    // Helper function to update bridge progress
    const updateProgress = (
      step: "approval" | "burn" | "mint",
      status: "pending" | "waiting" | "processing" | "completed" | "error",
      description?: string
    ) => {
      if (
        typeof window !== "undefined" &&
        (window as any).bridgeProgressCallback
      ) {
        (window as any).bridgeProgressCallback({
          step,
          description,
          status,
        });
      }
    };

    updateProgress(
      "approval",
      "processing",
      "Step 1/3: Starting approval process..."
    );

    console.log("BridgeKit: Calling bridge() method...");

    // Build the 'to' parameter with optional recipient address
    const toParam: any = {
      adapter: adapter,
      chain: destinationChain.bridgeKitChainName as any,
    };

    // Add recipient address if provided and different from user address
    if (
      params.recipientAddress &&
      params.recipientAddress !== params.userAddress
    ) {
      toParam.recipientAddress = params.recipientAddress;
      console.log(
        "BridgeKit: Using recipient address:",
        params.recipientAddress
      );
    }

    const result = await bridgeKit.bridge({
      from: {
        adapter: adapter,
        chain: sourceChain.bridgeKitChainName as any,
      },
      to: toParam,
      amount: amount,
    });

    console.log("BridgeKit: Bridge result:", result);

    if (result && typeof result === "object") {
      const bridgeResult: BridgeResult = {
        state: (result as any).state || "success",
        steps: (result as any).steps || [],
      };

      // Extract source transaction hash from steps
      const burnStep = bridgeResult.steps?.find((s) => s.name === "burn");
      if (burnStep?.txHash) {
        bridgeResult.sourceTxHash = burnStep.txHash;
      }

      // Extract attestation data if available
      const attestationStep = bridgeResult.steps?.find(
        (s) => s.name === "fetchAttestation"
      );
      if (attestationStep && (attestationStep as any).data) {
        bridgeResult.attestation = (attestationStep as any).data;
      }

      // Check if mint failed
      const mintStep = bridgeResult.steps?.find((s) => s.name === "mint");
      if (mintStep?.state === "error") {
        bridgeResult.state = "partial";
        bridgeResult.error = mintStep.errorMessage || "Mint step failed";
      }

      // Check if all steps succeeded
      const allStepsSucceeded = bridgeResult.steps?.every(
        (s) => s.state === "success"
      );

      const txHash =
        (result as any).sourceTransactionHash ||
        (result as any).transactionHash ||
        (result as any).hash ||
        bridgeResult.sourceTxHash ||
        "";

      if (txHash) {
        bridgeResult.sourceTxHash = txHash;
        if (allStepsSucceeded) {
          bridgeResult.state = "success";
          return bridgeResult;
        }

        if (burnStep?.state === "success") {
          if (mintStep?.state === "error") {
            bridgeResult.state = "partial";
            bridgeResult.error = mintStep.errorMessage || "Mint step failed";
          } else if (mintStep?.state === "success" || !mintStep) {
            bridgeResult.state = "success";
          }
        } else {
          bridgeResult.state = "success";
        }

        return bridgeResult;
      }

      if (allStepsSucceeded && bridgeResult.sourceTxHash) {
        bridgeResult.state = "success";
        return bridgeResult;
      }

      if (bridgeResult.state === "partial") {
        return bridgeResult;
      }

      if (bridgeResult.steps && bridgeResult.steps.length > 0) {
        const failedSteps = bridgeResult.steps.filter(
          (s) => s.state === "error"
        );
        if (failedSteps.length > 0) {
          bridgeResult.state = "error";
          bridgeResult.error = failedSteps
            .map((s) => s.errorMessage || s.name + " failed")
            .join(", ");
        }
      }
    }

    if (typeof result === "string") {
      return {
        state: "success",
        sourceTxHash: result,
      };
    }

    // Return error result instead of throwing
    return {
      state: "error",
      error: "Invalid bridge result format - no transaction hash found",
    };
  } catch (error: any) {
    console.error("Error bridging USDC:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Bridge transaction failed";
    // Return error result instead of throwing
    return {
      state: "error",
      error: errorMessage,
    };
  }
}
