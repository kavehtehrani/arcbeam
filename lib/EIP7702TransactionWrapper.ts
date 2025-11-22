/**
 * EIP-7702 Transaction Wrapper
 * Converts regular transactions to EIP-7702 UserOperations when gas sponsorship is enabled
 */

import { zeroAddress, type Hex } from "viem";
import {
  createEIP7702SmartAccountClient,
  createPublicClientForChain,
  isEIP7702Supported,
  getSimpleAccountAddress,
  getSponsorshipPolicyId,
} from "./eip7702";
import type { ChainConfig } from "./chains";

interface EIP7702WrapperOptions {
  sourceChain: ChainConfig;
  destinationChain: ChainConfig;
  walletClient: any; // viem WalletClient
  signAuthorization: (params: {
    contractAddress: `0x${string}`;
    chainId?: number;
    nonce?: number;
    executor?: `0x${string}` | "self";
  }) => Promise<any>; // Privy returns an authorization object
  getPublicClientForChain: (chainConfig: ChainConfig) => any; // Function to get public client for a chain
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
  } = options;

  // Cache for smart account clients (one per chain)
  const smartAccountClientCache: Record<number, any> = {};

  return {
    ...originalProvider,
    request: async (args: { method: string; params?: any[] }) => {
      if (args.method !== "eth_sendTransaction" || !args.params?.[0]) {
        return originalProvider.request(args);
      }

      const tx = args.params[0];

      // Detect transaction type to determine which chain we're on
      // Approval: 0x095ea7b3 (approve) or 0x39509351 (increaseAllowance) - source chain
      // Burn: 0xd0d4229a (depositForBurn) - source chain
      // Mint: 0x57ecfd28 (receiveMessage) or 0x8d7f3f70 or long data - destination chain
      const approvalSelectors = ["0x095ea7b3", "0x39509351"];
      const burnSelector = "0xd0d4229a";
      const mintSelectors = ["0x57ecfd28", "0x8d7f3f70"];

      const dataPrefix = tx.data?.slice(0, 10)?.toLowerCase() || "";
      const isApproval = approvalSelectors.some(
        (sel) => dataPrefix === sel.toLowerCase()
      );
      const isBurn = dataPrefix === burnSelector.toLowerCase();
      // Mint can be detected by selector or by long data (mint transactions have complex calldata)
      const isMint =
        mintSelectors.some((sel) => dataPrefix === sel.toLowerCase()) ||
        (tx.data && tx.data.length > 200);

      // Arc chain gas sponsorship logic:
      // - If Arc is source: only sponsor mint (destination chain)
      // - If Arc is destination: only sponsor approval and burn (source chain)
      const ARC_CHAIN_ID = 5042002;
      const isArcSource = sourceChain.chainId === ARC_CHAIN_ID;
      const isArcDestination = destinationChain.chainId === ARC_CHAIN_ID;

      // Determine which chain this transaction is for
      let chainConfig: ChainConfig | null = null;
      if (isApproval || isBurn) {
        chainConfig = sourceChain;
      } else if (isMint) {
        chainConfig = destinationChain;
      } else {
        // Unknown transaction type - pass through to be safe
        console.log(
          "Unknown transaction type - passing through without EIP-7702"
        );
        return originalProvider.request(args);
      }

      // Determine if this transaction should be sponsored based on Arc rules
      let shouldSponsor = false;
      if (isArcSource) {
        // Arc is source: only sponsor mint (destination chain)
        // Approval and burn on Arc should NOT be sponsored
        shouldSponsor = isMint && isEIP7702Supported(destinationChain.chainId);
      } else if (isArcDestination) {
        // Arc is destination: only sponsor approval and burn (source chain)
        // Mint on Arc should NOT be sponsored
        shouldSponsor =
          (isApproval || isBurn) && isEIP7702Supported(sourceChain.chainId);
      } else {
        // No Arc involved: use normal EIP-7702 support check
        shouldSponsor = chainConfig && isEIP7702Supported(chainConfig.chainId);
      }

      // If sponsorship shouldn't be applied, pass through immediately
      // This is critical for Arc - we must NOT try to create smart account clients for Arc
      if (!shouldSponsor) {
        if (isArcSource && (isApproval || isBurn)) {
          console.log(
            `Arc is source: skipping gas sponsorship for ${
              isApproval ? "approval" : "burn"
            } on ${chainConfig.name} - using regular transaction`
          );
        } else if (isArcDestination && isMint) {
          console.log(
            `Arc is destination: skipping gas sponsorship for mint on ${chainConfig.name} - using regular transaction`
          );
        } else if (!chainConfig || !isEIP7702Supported(chainConfig.chainId)) {
          console.log(
            `EIP-7702 not supported on ${
              chainConfig?.name || "unknown chain"
            } - using regular transaction`
          );
        }
        return originalProvider.request(args);
      }

      // Additional safety check: never try to create smart account client for Arc
      if (chainConfig.chainId === ARC_CHAIN_ID) {
        console.warn(
          `Attempted to create EIP-7702 client for Arc Testnet - this should not happen. Passing through.`
        );
        return originalProvider.request(args);
      }

      try {
        // Final safety check: ensure chain supports EIP-7702 before proceeding
        if (!isEIP7702Supported(chainConfig.chainId)) {
          console.warn(
            `Chain ${chainConfig.name} does not support EIP-7702 - passing through to regular transaction`
          );
          return originalProvider.request(args);
        }

        // Get or create smart account client for this chain
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

        // Get fresh nonce for each transaction to ensure it matches
        // This is critical - the authorization nonce must match the account's current nonce
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

        // Sign a fresh authorization for this chain with the current nonce
        // This ensures the nonce matches the account's current state on this chain
        console.log(
          `Signing EIP-7702 authorization for ${chainConfig.name} (chainId: ${chainConfig.chainId}, nonce: ${nonce})`
        );
        const authorizationResult = await signAuthorization({
          contractAddress: simpleAccountAddress as `0x${string}`,
          chainId: chainConfig.chainId,
          nonce,
        });

        // Extract authorization from the result
        let authorization: Hex;
        if (typeof authorizationResult === "string") {
          authorization = authorizationResult as Hex;
        } else if (
          authorizationResult &&
          typeof authorizationResult === "object"
        ) {
          // Try to extract authorization from object (check common property names)
          authorization = (authorizationResult.authorization ||
            authorizationResult.auth ||
            authorizationResult.signature ||
            authorizationResult) as Hex;
        } else {
          throw new Error(
            "Invalid authorization result from signAuthorization"
          );
        }

        // Convert transaction to UserOperation format
        // Handle value conversion - it might be a hex string or number
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

        // Build the transaction object
        // The smart account client will automatically estimate gas prices from the bundler
        const userOpTx: any = {
          to: (tx.to as Hex) || zeroAddress,
          value,
          data: (tx.data as Hex) || ("0x" as Hex),
          authorization,
        };

        // Add paymaster context if sponsorship policy ID is available
        const sponsorshipPolicyId = getSponsorshipPolicyId();
        if (sponsorshipPolicyId) {
          userOpTx.paymasterContext = {
            sponsorshipPolicyId,
          };
        }

        // Send UserOperation via smart account client
        // The sendTransaction method should automatically estimate gas prices using the bundler
        // Permissionless handles gas estimation internally, so we just need to call sendTransaction
        const userOpHash = await smartAccountClient.sendTransaction(userOpTx);
        console.log(
          `EIP-7702 UserOperation sent on ${chainConfig.name}: ${userOpHash}`
        );
        return userOpHash;
      } catch (error: any) {
        console.error(
          `EIP-7702 transaction failed on ${chainConfig.name}:`,
          error
        );
        // Re-throw the error - no fallback when gas sponsorship is enabled
        throw new Error(
          `EIP-7702 gas sponsorship failed on ${chainConfig.name}: ${
            error.message || String(error)
          }`
        );
      }
    },
  };
}
