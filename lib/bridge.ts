import { BridgeKit } from "@circle-fin/bridge-kit";
import { createAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  formatUnits,
  parseUnits,
  getAddress,
} from "ethers";
import {
  createPublicClient,
  http,
  type Chain as ViemChain,
  type PublicClient,
  createWalletClient,
  custom,
  encodeFunctionData,
  type Hex,
} from "viem";
import { arcTestnet } from "viem/chains";
import { type ChainConfig, ARC_CHAIN } from "./chains";
import {
  createEIP7702SmartAccountClient,
  createPublicClientForChain,
  getSimpleAccountAddress,
  getSponsorshipPolicyId,
  isEIP7702Supported,
} from "./eip7702";

// ERC20 ABI for balance and allowance queries
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
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

export interface TransferParams {
  amount: string;
  chain: ChainConfig;
  userAddress: string;
  provider: BrowserProvider;
  recipientAddress: string;
  useGasSponsorship?: boolean;
  walletClient?: any; // viem WalletClient
  signAuthorization?: (params: {
    contractAddress: `0x${string}`;
    chainId?: number;
    nonce?: number;
    executor?: `0x${string}` | "self";
  }) => Promise<any>;
  ethereumProvider?: any;
}

export interface TransferResult {
  state: "success" | "error";
  txHash?: string;
  error?: string;
}

/**
 * Create Viem adapter from EIP-1193 provider for Circle Bridge Kit
 */
async function createViemAdapter(
  eip1193Provider: any,
  sourceChainId?: number,
  destinationChainId?: number
): Promise<Awaited<ReturnType<typeof createAdapterFromProvider>>> {
  if (!eip1193Provider) {
    throw new Error("EIP-1193 provider is required");
  }

  const needsArcConfig =
    sourceChainId === ARC_CHAIN.chainId ||
    destinationChainId === ARC_CHAIN.chainId;

  if (needsArcConfig) {
    return createAdapterFromProvider({
      provider: eip1193Provider,
      getPublicClient: ({ chain }: { chain: ViemChain }): PublicClient => {
        if (chain.id === ARC_CHAIN.chainId) {
          return createPublicClient({
            chain: arcTestnet,
            transport: http(arcTestnet.rpcUrls.default.http[0]),
          });
        }
        return createPublicClient({
          chain,
          transport: http(),
        });
      },
    });
  }

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
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getTokenMessengerAddress(_chainId: number): string {
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
 * Transfer USDC directly on the same chain (ERC20 transfer)
 * Uses gas sponsorship via EIP-7702 if enabled and supported
 */
export async function transferUSDC(
  params: TransferParams
): Promise<TransferResult> {
  const {
    amount,
    chain,
    userAddress,
    provider,
    recipientAddress,
    useGasSponsorship = false,
    walletClient,
    signAuthorization,
    ethereumProvider,
  } = params;

  try {
    if (!chain.usdcAddress) {
      return {
        state: "error",
        error: `USDC address not configured for ${chain.name}`,
      };
    }

    const usdcAddress = getAddress(chain.usdcAddress);
    const recipientAddr = getAddress(recipientAddress);
    const senderAddr = getAddress(userAddress);

    // Get USDC contract to get decimals
    const usdcContract = new Contract(usdcAddress, ERC20_ABI, provider);
    const decimals = await usdcContract.decimals();
    const amountInWei = parseUnits(amount, decimals);

    // Use gas sponsorship if enabled, supported, and not Arc chain
    const shouldUseGasSponsorship =
      useGasSponsorship &&
      isEIP7702Supported(chain.chainId) &&
      chain.chainId !== ARC_CHAIN.chainId &&
      walletClient &&
      signAuthorization &&
      ethereumProvider;

    if (shouldUseGasSponsorship && signAuthorization) {
      // Use smart account client for gasless transfer (following privyGaslessPayment.ts pattern)
      try {
        const publicClient = createPublicClientForChain(chain);

        // Create smart account client
        const smartAccountClient = await createEIP7702SmartAccountClient(
          chain,
          walletClient,
          publicClient
        );

        // Get nonce for authorization
        const nonce = await publicClient.getTransactionCount({
          address: walletClient.account.address,
        });

        // Get simple account address
        const simpleAccountAddress = getSimpleAccountAddress(chain.chainId);
        if (!simpleAccountAddress) {
          throw new Error(
            `Simple Account address not found for chain ${chain.chainId}`
          );
        }

        // Sign EIP-7702 authorization
        const authInput = {
          contractAddress: simpleAccountAddress as `0x${string}`,
          chainId: chain.chainId,
          nonce,
        };

        const authOptions: any = { showWalletUIs: false };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const authorizationResult = await (signAuthorization as any)(
          authInput,
          authOptions
        );

        let authorization: Hex;
        if (typeof authorizationResult === "string") {
          authorization = authorizationResult as Hex;
        } else if (
          authorizationResult &&
          typeof authorizationResult === "object"
        ) {
          authorization = (authorizationResult.authorization ||
            authorizationResult.auth ||
            authorizationResult.signature ||
            authorizationResult) as Hex;
        } else {
          throw new Error(
            "Invalid authorization result from signAuthorization"
          );
        }

        // Encode transfer function call
        const transferData = encodeFunctionData({
          abi: [
            {
              inputs: [
                { internalType: "address", name: "to", type: "address" },
                { internalType: "uint256", name: "amount", type: "uint256" },
              ],
              name: "transfer",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "transfer",
          args: [
            recipientAddr as `0x${string}`,
            BigInt(amountInWei.toString()),
          ],
        });

        // Prepare transaction with EIP-7702 factory
        const sponsorshipPolicyId = getSponsorshipPolicyId();
        const txParams: any = {
          to: usdcAddress as `0x${string}`,
          data: transferData,
          value: BigInt(0),
          factory: "0x7702" as Hex,
          factoryData: "0x" as Hex,
          authorization,
        };

        if (sponsorshipPolicyId) {
          txParams.paymasterContext = {
            sponsorshipPolicyId,
          };
        }

        // Send sponsored transaction
        const hash = await smartAccountClient.sendTransaction(txParams);

        return {
          state: "success",
          txHash: hash,
        };
      } catch (gaslessError: any) {
        console.error(
          "Gasless transfer failed, falling back to regular transfer:",
          gaslessError
        );
        // Fall through to regular transfer
      }
    }

    // Regular transfer (no gas sponsorship or fallback)
    const signer = await provider.getSigner();
    const usdcContractWithSigner = new Contract(usdcAddress, ERC20_ABI, signer);

    // Execute transfer
    const tx = await (usdcContractWithSigner as any).transfer(
      recipientAddr,
      amountInWei
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    if (receipt && receipt.hash) {
      return {
        state: "success",
        txHash: receipt.hash,
      };
    }

    return {
      state: "error",
      error: "Transaction completed but no hash found",
    };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "Transfer failed";
    return {
      state: "error",
      error: errorMessage,
    };
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
          `Please use Arc Testnet, Sepolia, Base Sepolia, Arbitrum Sepolia, OP Sepolia, Polygon Amoy, or Ink Testnet.`,
      };
    }

    const adapter = await createViemAdapter(
      eip1193Provider,
      sourceChain.chainId,
      destinationChain.chainId
    );

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

    const toParam: any = {
      adapter: adapter,
      chain: destinationChain.bridgeKitChainName as any,
    };

    if (
      params.recipientAddress &&
      params.recipientAddress !== params.userAddress
    ) {
      toParam.recipientAddress = params.recipientAddress;
    }

    const bridgeParams = {
      from: {
        adapter: adapter,
        chain: sourceChain.bridgeKitChainName as any,
      },
      to: toParam,
      amount: amount,
    };

    let result;
    try {
      result = await bridgeKit.bridge(bridgeParams);
    } catch (error: any) {
      throw error;
    }

    if (result && typeof result === "object") {
      const bridgeResult: BridgeResult = {
        state: (result as any).state || "success",
        steps: (result as any).steps || [],
      };

      const burnStep = bridgeResult.steps?.find((s) => s.name === "burn");
      if (burnStep?.txHash) {
        bridgeResult.sourceTxHash = burnStep.txHash;
      }

      const attestationStep = bridgeResult.steps?.find(
        (s) => s.name === "fetchAttestation"
      );
      if (attestationStep && (attestationStep as any).data) {
        bridgeResult.attestation = (attestationStep as any).data;
      }

      const mintStep = bridgeResult.steps?.find((s) => s.name === "mint");
      if (mintStep?.state === "error") {
        bridgeResult.state = "partial";
        bridgeResult.error = mintStep.errorMessage || "Mint step failed";
      }

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

    return {
      state: "error",
      error: "Invalid bridge result format - no transaction hash found",
    };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "Bridge transaction failed";
    return {
      state: "error",
      error: errorMessage,
    };
  }
}
