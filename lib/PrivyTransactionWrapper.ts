/**
 * Wrapper for Privy provider to add custom UI messages to transaction popups
 * This intercepts eth_sendTransaction calls and adds uiOptions with descriptive messages
 */

import { ARC_CHAIN } from "./chains";

export function createPrivyTransactionWrapper(
  originalProvider: any,
  sendTransactionFn: any,
  confirmEachStep: boolean = false,
  gasSponsorshipEnabled: boolean = false
): any {
  return {
    ...originalProvider,
    request: async (args: { method: string; params?: any[] }) => {
      if (args.method === "wallet_switchChain") {
        try {
          return await originalProvider.request(args);
        } catch (error: any) {
          const chainId = args.params?.[0]?.chainId;
          const arcChainIdHex = `0x${ARC_CHAIN.chainId.toString(16)}`;
          const isArcTestnet =
            chainId === arcChainIdHex ||
            chainId === ARC_CHAIN.chainId ||
            (typeof chainId === "string" &&
              parseInt(chainId, 16) === ARC_CHAIN.chainId);

          if (isArcTestnet) {
            try {
              await originalProvider.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId:
                      typeof chainId === "number"
                        ? `0x${chainId.toString(16)}`
                        : chainId,
                    chainName: "Arc Testnet",
                    nativeCurrency: {
                      name: "USDC",
                      symbol: "USDC",
                      decimals: 18,
                    },
                    rpcUrls: ["https://rpc.testnet.arc.network"],
                    blockExplorerUrls: ["https://testnet.arcscan.app"],
                  },
                ],
              });
              return await originalProvider.request(args);
            } catch {
              throw error;
            }
          }
          throw error;
        }
      }

      if (args.method === "wallet_addEthereumChain") {
        return originalProvider.request(args);
      }

      if (args.method !== "eth_sendTransaction") {
        return originalProvider.request(args);
      }

      if (args.method === "eth_sendTransaction" && args.params?.[0]) {
        const tx = args.params[0];

        if (gasSponsorshipEnabled) {
          const updateBridgeProgress = (
            step: "approval" | "burn" | "mint",
            status:
              | "pending"
              | "waiting"
              | "processing"
              | "completed"
              | "error",
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

          const approvalSelectors = ["0x095ea7b3", "0x39509351"];
          const dataPrefix = tx.data?.slice(0, 10)?.toLowerCase() || "";
          const isApproval = approvalSelectors.some(
            (sel) => dataPrefix === sel.toLowerCase()
          );
          const isBurn = dataPrefix === "0xd0d4229a";
          const isMint =
            dataPrefix === "0x8d7f3f70" ||
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
            updateBridgeProgress(
              "burn",
              "completed",
              "Step 2/3: Burn completed"
            );
            updateBridgeProgress(
              "mint",
              "processing",
              "Step 3/3: Minting USDC on destination chain..."
            );
          }
        }

        let uiOptions: any = {};

        const approvalSelectors = ["0x095ea7b3", "0x39509351"];
        const dataPrefix = tx.data?.slice(0, 10).toLowerCase();
        const isApprovalTransaction =
          tx.data &&
          tx.data.startsWith("0x") &&
          tx.data.length >= 10 &&
          approvalSelectors.some((selector) => dataPrefix === selector);

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

        if (isApprovalTransaction) {
          updateBridgeProgress(
            "approval",
            "processing",
            "Step 1/3: Approving USDC spending..."
          );
          uiOptions = {
            header: "Step 1/3: Approve USDC Spending",
            description:
              "This allows the bridge contract to spend your USDC tokens. You'll need to approve this before the bridge can transfer your funds.",
            buttonText: "Approve USDC",
            showWalletUIs: confirmEachStep,
          };
        } else if (tx.data && tx.data.startsWith("0xd0d4229a")) {
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
          uiOptions = {
            header: "Step 2/3: Burn USDC on Source Chain",
            description:
              "This burns your USDC on the source chain. Your USDC will be locked and an attestation will be generated for minting on the destination chain.",
            buttonText: "Confirm Burn",
            showWalletUIs: confirmEachStep,
          };
        } else if (
          tx.data &&
          (tx.data.startsWith("0x8d7f3f70") || tx.data.length > 200)
        ) {
          updateBridgeProgress("burn", "completed", "Step 2/3: Burn completed");
          updateBridgeProgress(
            "mint",
            "processing",
            "Step 3/3: Minting USDC on destination chain..."
          );
          uiOptions = {
            header: "Step 3/3: Mint USDC on Destination Chain",
            description:
              "This mints your USDC on the destination chain. Your USDC will be available in your wallet on the destination chain after this completes.",
            buttonText: "Confirm Mint",
            showWalletUIs: confirmEachStep,
          };
        }

        const shouldIntercept =
          Object.keys(uiOptions).length > 0 &&
          sendTransactionFn &&
          !gasSponsorshipEnabled;

        if (shouldIntercept) {
          try {
            const transaction: any = {
              to: tx.to,
              value: tx.value || "0x0",
              data: tx.data || "0x",
            };

            if (tx.gas) transaction.gas = tx.gas;
            if (tx.gasPrice) transaction.gasPrice = tx.gasPrice;
            if (tx.maxFeePerGas) transaction.maxFeePerGas = tx.maxFeePerGas;
            if (tx.maxPriorityFeePerGas)
              transaction.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
            if (tx.nonce !== undefined) transaction.nonce = tx.nonce;
            if (tx.from) transaction.from = tx.from;

            const result = await sendTransactionFn(transaction, { uiOptions });

            let hashString: string | null = null;
            if (typeof result === "string") {
              hashString = result;
            } else if (result && typeof result === "object") {
              hashString =
                result.hash || result.transactionHash || result.txHash || "";

              if (!hashString) {
                for (const key in result) {
                  const value = result[key];
                  if (
                    typeof value === "string" &&
                    value.startsWith("0x") &&
                    value.length === 66
                  ) {
                    hashString = value;
                    break;
                  }
                }
              }
            }

            if (
              !hashString ||
              !hashString.startsWith("0x") ||
              hashString.length !== 66
            ) {
              console.warn(
                `Invalid transaction result from Privy sendTransaction:`,
                typeof result === "object"
                  ? JSON.stringify(result, (key, value) =>
                      typeof value === "bigint" ? value.toString() : value
                    )
                  : result
              );
              return originalProvider.request(args);
            }

            if (isApprovalTransaction) {
              updateBridgeProgress(
                "approval",
                "processing",
                "Step 1/3: Approval transaction sent, waiting for confirmation..."
              );
            } else if (tx.data && tx.data.startsWith("0xd0d4229a")) {
              updateBridgeProgress(
                "burn",
                "processing",
                "Step 2/3: Burn transaction sent, waiting for confirmation..."
              );
            } else if (
              tx.data &&
              (tx.data.startsWith("0x8d7f3f70") || tx.data.length > 200)
            ) {
              updateBridgeProgress(
                "mint",
                "processing",
                "Step 3/3: Mint transaction sent, waiting for confirmation..."
              );
            }

            return hashString;
          } catch (error: any) {
            console.error(
              "Failed to use Privy sendTransaction with uiOptions:",
              error
            );
            return originalProvider.request(args);
          }
        }
      }

      return originalProvider.request(args);
    },
  };
}
