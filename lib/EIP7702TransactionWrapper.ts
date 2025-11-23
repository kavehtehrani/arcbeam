/**
 * EIP-7702 Transaction Wrapper
 * Converts regular transactions to EIP-7702 UserOperations when gas sponsorship is enabled
 */

import { zeroAddress, type Hex } from "viem";
import {
  createEIP7702SmartAccountClient,
  isEIP7702Supported,
  getSimpleAccountAddress,
  getSponsorshipPolicyId,
} from "./eip7702";
import { ChainConfig, ARC_CHAIN } from "./chains";

interface EIP7702WrapperOptions {
  sourceChain: ChainConfig;
  destinationChain: ChainConfig;
  walletClient: any; // viem WalletClient
  signAuthorization: (params: {
    contractAddress: `0x${string}`;
    chainId?: number;
    nonce?: number;
    executor?: `0x${string}` | "self";
  }) => Promise<any>;
  getPublicClientForChain: (chainConfig: ChainConfig) => any;
  confirmEachStep?: boolean;
  originalProvider?: any;
}

/**
 * Create a provider wrapper that converts transactions to EIP-7702 UserOperations
 */
export function createEIP7702TransactionWrapper(
  originalProvider: any,
  options: EIP7702WrapperOptions
): any {
  const {
    sourceChain,
    destinationChain,
    walletClient,
    signAuthorization,
    getPublicClientForChain,
    originalProvider: trueOriginalProvider,
  } = options;

  const updateBridgeProgress = (
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

  const smartAccountClientCache: Record<number, any> = {};

  return {
    ...originalProvider,
    request: async (args: { method: string; params?: any[] }) => {
      if (args.method !== "eth_sendTransaction" || !args.params?.[0]) {
        return originalProvider.request(args);
      }

      const tx = args.params[0];

      const approvalSelectors = ["0x095ea7b3", "0x39509351"];
      const burnSelector = "0xd0d4229a";
      const mintSelectors = ["0x57ecfd28", "0x8d7f3f70"];

      const dataPrefix = tx.data?.slice(0, 10)?.toLowerCase() || "";
      const isApproval = approvalSelectors.some(
        (sel) => dataPrefix === sel.toLowerCase()
      );
      const isBurn = dataPrefix === burnSelector.toLowerCase();
      const isMint =
        mintSelectors.some((sel) => dataPrefix === sel.toLowerCase()) ||
        (tx.data && tx.data.length > 200 && !isApproval && !isBurn);

      if (isApproval) {
        updateBridgeProgress(
          "approval",
          "processing",
          "Step 1/3: Approving USDC spending..."
        );
      } else if (isBurn) {
        updateBridgeProgress(
          "approval",
          "completed",
          "Step 1/3: Approval completed"
        );
        updateBridgeProgress(
          "burn",
          "processing",
          "Step 2/3: Burning USDC on source chain..."
        );
      } else if (isMint) {
        updateBridgeProgress("burn", "completed", "Step 2/3: Burn completed");
        updateBridgeProgress(
          "mint",
          "processing",
          "Step 3/3: Minting USDC on destination chain..."
        );
      }

      const isArcSource = sourceChain.chainId === ARC_CHAIN.chainId;
      const isArcDestination = destinationChain.chainId === ARC_CHAIN.chainId;

      let chainConfig: ChainConfig | null = null;
      if (isApproval || isBurn) {
        chainConfig = sourceChain;
      } else if (isMint) {
        chainConfig = destinationChain;
      } else {
        return originalProvider.request(args);
      }

      let shouldSponsor = false;
      if (isArcSource) {
        shouldSponsor = isMint && isEIP7702Supported(destinationChain.chainId);
      } else if (isArcDestination) {
        shouldSponsor =
          (isApproval || isBurn) && isEIP7702Supported(sourceChain.chainId);
      } else {
        shouldSponsor = chainConfig && isEIP7702Supported(chainConfig.chainId);
      }

      if (!shouldSponsor) {
        const targetProvider = trueOriginalProvider || originalProvider;
        return targetProvider.request(args);
      }

      if (chainConfig.chainId === ARC_CHAIN.chainId) {
        return originalProvider.request(args);
      }

      try {
        if (!isEIP7702Supported(chainConfig.chainId)) {
          return originalProvider.request(args);
        }

        if (!smartAccountClientCache[chainConfig.chainId]) {
          const publicClient = getPublicClientForChain(chainConfig);
          smartAccountClientCache[chainConfig.chainId] =
            await createEIP7702SmartAccountClient(
              chainConfig,
              walletClient,
              publicClient
            );
        }

        const smartAccountClient = smartAccountClientCache[chainConfig.chainId];
        const publicClient = getPublicClientForChain(chainConfig);

        const nonce = await publicClient.getTransactionCount({
          address: walletClient.account.address,
        });

        const simpleAccountAddress = getSimpleAccountAddress(
          chainConfig.chainId
        );
        if (!simpleAccountAddress) {
          throw new Error(
            `Simple Account address not found for chain ${chainConfig.chainId}`
          );
        }

        if (isApproval) {
          updateBridgeProgress(
            "approval",
            "processing",
            "Step 1/3: Signing authorization for gas sponsorship..."
          );
        } else if (isBurn) {
          updateBridgeProgress(
            "burn",
            "processing",
            "Step 2/3: Signing authorization for gas sponsorship..."
          );
        } else if (isMint) {
          updateBridgeProgress(
            "mint",
            "processing",
            "Step 3/3: Signing authorization for gas sponsorship..."
          );
        }

        const authInput = {
          contractAddress: simpleAccountAddress as `0x${string}`,
          chainId: chainConfig.chainId,
          nonce,
        };

        const authOptions: any = { showWalletUIs: false };
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

        let value = BigInt(0);
        if (tx.value) {
          if (typeof tx.value === "string") {
            value = BigInt(tx.value);
          } else if (typeof tx.value === "number") {
            value = BigInt(tx.value);
          } else {
            value = BigInt(tx.value);
          }
        }

        const userOpTx: any = {
          to: (tx.to as Hex) || zeroAddress,
          value,
          data: (tx.data as Hex) || ("0x" as Hex),
          authorization,
        };

        const sponsorshipPolicyId = getSponsorshipPolicyId();
        if (sponsorshipPolicyId) {
          userOpTx.paymasterContext = {
            sponsorshipPolicyId,
          };
        }

        if (isApproval) {
          updateBridgeProgress(
            "approval",
            "processing",
            "Step 1/3: Sending sponsored approval transaction..."
          );
        } else if (isBurn) {
          updateBridgeProgress(
            "burn",
            "processing",
            "Step 2/3: Sending sponsored burn transaction..."
          );
        } else if (isMint) {
          updateBridgeProgress(
            "mint",
            "processing",
            "Step 3/3: Sending sponsored mint transaction..."
          );
        }

        const userOpHash = await smartAccountClient.sendTransaction(userOpTx);

        if (isApproval) {
          updateBridgeProgress(
            "approval",
            "processing",
            "Step 1/3: Approval transaction sent, waiting for confirmation..."
          );
        } else if (isBurn) {
          updateBridgeProgress(
            "burn",
            "processing",
            "Step 2/3: Burn transaction sent, waiting for confirmation..."
          );
        } else if (isMint) {
          updateBridgeProgress(
            "mint",
            "processing",
            "Step 3/3: Mint transaction sent, waiting for confirmation..."
          );
        }

        return userOpHash;
      } catch (error: any) {
        if (isApproval) {
          updateBridgeProgress(
            "approval",
            "error",
            `Step 1/3: Gas sponsorship failed - ${
              error.message || String(error)
            }`
          );
        } else if (isBurn) {
          updateBridgeProgress(
            "burn",
            "error",
            `Step 2/3: Gas sponsorship failed - ${
              error.message || String(error)
            }`
          );
        } else if (isMint) {
          updateBridgeProgress(
            "mint",
            "error",
            `Step 3/3: Gas sponsorship failed - ${
              error.message || String(error)
            }`
          );
        }

        throw new Error(
          `EIP-7702 gas sponsorship failed on ${chainConfig.name}: ${
            error.message || String(error)
          }`
        );
      }
    },
  };
}
