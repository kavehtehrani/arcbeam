/**
 * Wrapper for Privy provider to add custom UI messages to transaction popups
 * This intercepts eth_sendTransaction calls and adds uiOptions with descriptive messages
 */

export function createPrivyTransactionWrapper(
  originalProvider: any,
  sendTransactionFn: any
): any {
  return {
    ...originalProvider,
    request: async (args: { method: string; params?: any[] }) => {
      if (args.method === "eth_sendTransaction" && args.params?.[0]) {
        const tx = args.params[0];

        // Identify transaction type from the transaction data
        let uiOptions: any = {};

        // USDC approval function selectors
        const approvalSelectors = ["0x095ea7b3", "0x39509351"];
        const dataPrefix = tx.data?.slice(0, 10).toLowerCase();
        const isApprovalTransaction =
          tx.data &&
          tx.data.startsWith("0x") &&
          tx.data.length >= 10 &&
          approvalSelectors.some((selector) => dataPrefix === selector);

        // Helper function to update bridge progress
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
          };
        } else if (tx.data && tx.data.startsWith("0xd0d4229a")) {
          // Bridge burn: depositForBurn
          updateBridgeProgress("approval", "completed", "Step 1/3: Approval completed ✅");
          updateBridgeProgress("burn", "processing", "Step 2/3: Burning USDC on source chain...");
          uiOptions = {
            header: "Step 2/3: Burn USDC on Source Chain",
            description:
              "This burns your USDC on the source chain. Your USDC will be locked and an attestation will be generated for minting on the destination chain.",
            buttonText: "Confirm Burn",
          };
        } else if (
          tx.data &&
          (tx.data.startsWith("0x8d7f3f70") || tx.data.length > 200)
        ) {
          // Bridge mint: receiveMessage
          updateBridgeProgress("burn", "completed", "Step 2/3: Burn completed ✅");
          updateBridgeProgress("mint", "processing", "Step 3/3: Minting USDC on destination chain...");
          uiOptions = {
            header: "Step 3/3: Mint USDC on Destination Chain",
            description:
              "This mints your USDC on the destination chain. Your USDC will be available in your wallet on the destination chain after this completes.",
            buttonText: "Confirm Mint",
          };
        }

        // Use Privy's sendTransaction with custom UI if available
        if (Object.keys(uiOptions).length > 0 && sendTransactionFn) {
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

            let hashString: string;
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

              if (!hashString) {
                throw new Error(
                  `Could not extract transaction hash from result: ${JSON.stringify(
                    result,
                    (key, value) =>
                      typeof value === "bigint" ? value.toString() : value
                  )}`
                );
              }
            } else {
              throw new Error(
                `Unexpected result type from sendTransaction: ${typeof result}`
              );
            }

            if (
              !hashString ||
              !hashString.startsWith("0x") ||
              hashString.length !== 66
            ) {
              throw new Error(
                `Invalid transaction hash extracted: ${hashString}`
              );
            }

            // Update progress when transaction is successfully sent
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

