"use client";

import { useState, useEffect, useRef } from "react";
import { usePrivy, useWallets, useSendTransaction } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useSwitchChain } from "wagmi";
import { BrowserProvider } from "ethers";
import {
  bridgeUSDC,
  getUSDCBalance,
  getFormattedAllowance,
  getTokenMessengerAddress,
} from "@/lib/bridge";
import { createPrivyTransactionWrapper } from "@/lib/PrivyTransactionWrapper";
import BridgeProgress from "@/components/BridgeProgress";
import ChainSelect from "@/components/ChainSelect";
import {
  ARC_CHAIN,
  ETHEREUM_SEPOLIA_CHAIN,
  BASE_SEPOLIA_CHAIN,
  ARBITRUM_SEPOLIA_CHAIN,
  ChainConfig,
} from "@/lib/chains";

type BridgeStatus = "idle" | "approving" | "bridging" | "success" | "error";

export default function BridgeForm() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction: privySendTransaction } = useSendTransaction();
  const { setActiveWallet } = useSetActiveWallet();
  const { switchChain } = useSwitchChain();
  const defaultAmount = process.env.NEXT_PUBLIC_DEV_DEFAULT_AMOUNT || "";
  const [amount, setAmount] = useState(defaultAmount);
  const [sourceChain, setSourceChain] = useState<ChainConfig>(ARC_CHAIN);
  const [destinationChain, setDestinationChain] = useState<ChainConfig>(
    ETHEREUM_SEPOLIA_CHAIN
  );
  const [status, setStatus] = useState<BridgeStatus>("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [ethereumSepoliaBalance, setEthereumSepoliaBalance] = useState("0");
  const [baseSepoliaBalance, setBaseSepoliaBalance] = useState("0");
  const [arbitrumSepoliaBalance, setArbitrumSepoliaBalance] = useState("0");
  const [arcBalance, setArcBalance] = useState("0");
  const [currentAllowance, setCurrentAllowance] = useState<string>("0");
  const [spenderAddress, setSpenderAddress] = useState<string>("");
  const [confirmEachStep, setConfirmEachStep] = useState<boolean>(false); // Default: off (skip completion screens)
  const [bridgeSteps, setBridgeSteps] = useState<
    Array<{
      step: string;
      description: string;
      status: "pending" | "waiting" | "processing" | "completed" | "error";
    }>
  >([]);
  const isBridgingRef = useRef(false);
  const hasSetActiveWalletRef = useRef(false);

  // Only use Privy embedded wallet - ignore external wallets like MetaMask
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const wallet = embeddedWallet;

  useEffect(() => {
    if (sourceChain) {
      const tokenMessenger = getTokenMessengerAddress(sourceChain.chainId);
      setSpenderAddress(tokenMessenger);

      if (wallet) {
        getFormattedAllowance(
          wallet.address,
          tokenMessenger,
          sourceChain,
          sourceChain.rpcUrl
        )
          .then((allowance) => {
            setCurrentAllowance(allowance);
          })
          .catch((error) => {
            console.error("Error fetching allowance:", error);
            setCurrentAllowance("0");
          });
      } else {
        setCurrentAllowance("0");
      }
    }
  }, [wallet, sourceChain]);

  useEffect(() => {
    if (
      embeddedWallet &&
      ready &&
      authenticated &&
      !hasSetActiveWalletRef.current
    ) {
      hasSetActiveWalletRef.current = true;
      const timeoutId = setTimeout(async () => {
        try {
          await setActiveWallet(embeddedWallet);
        } catch (error: unknown) {
          hasSetActiveWalletRef.current = false;
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            !errorMessage.includes("timeout") &&
            !errorMessage.includes("400") &&
            !errorMessage.includes("Bad Request")
          ) {
            console.warn("Failed to set active wallet:", errorMessage);
          }
        }
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [embeddedWallet, ready, authenticated, setActiveWallet]);

  useEffect(() => {
    if (ready && authenticated && wallet) {
      fetchBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated, wallet]);

  useEffect(() => {
    if (defaultAmount && !amount && ready && authenticated) {
      setAmount(defaultAmount);
    }
  }, [defaultAmount, amount, ready, authenticated]);

  const fetchBalances = async () => {
    // Only fetch balances for Privy embedded wallet
    if (!wallet || wallet.walletClientType !== "privy") return;
    try {
      const [ethSepoliaBal, baseSepoliaBal, arbitrumSepoliaBal, arcBal] =
        await Promise.all([
          getUSDCBalance(
            wallet.address,
            ETHEREUM_SEPOLIA_CHAIN,
            ETHEREUM_SEPOLIA_CHAIN.rpcUrl
          ),
          getUSDCBalance(
            wallet.address,
            BASE_SEPOLIA_CHAIN,
            BASE_SEPOLIA_CHAIN.rpcUrl
          ),
          getUSDCBalance(
            wallet.address,
            ARBITRUM_SEPOLIA_CHAIN,
            ARBITRUM_SEPOLIA_CHAIN.rpcUrl
          ),
          getUSDCBalance(wallet.address, ARC_CHAIN, ARC_CHAIN.rpcUrl),
        ]);
      setEthereumSepoliaBalance(ethSepoliaBal);
      setBaseSepoliaBalance(baseSepoliaBal);
      setArbitrumSepoliaBalance(arbitrumSepoliaBal);
      setArcBalance(arcBal);

      if (spenderAddress && sourceChain) {
        try {
          const allowance = await getFormattedAllowance(
            wallet.address,
            spenderAddress,
            sourceChain,
            sourceChain.rpcUrl
          );
          setCurrentAllowance(allowance);
        } catch (error) {
          console.error("Error fetching allowance:", error);
          setCurrentAllowance("0");
        }
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const getAvailableBalance = () => {
    if (sourceChain.chainId === ETHEREUM_SEPOLIA_CHAIN.chainId) {
      return ethereumSepoliaBalance;
    } else if (sourceChain.chainId === BASE_SEPOLIA_CHAIN.chainId) {
      return baseSepoliaBalance;
    } else if (sourceChain.chainId === ARBITRUM_SEPOLIA_CHAIN.chainId) {
      return arbitrumSepoliaBalance;
    } else if (sourceChain.chainId === ARC_CHAIN.chainId) {
      return arcBalance;
    }
    return "0";
  };

  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBridgingRef.current) {
      console.warn("Bridge already in progress, ignoring duplicate call");
      return;
    }

    if (
      !ready ||
      !authenticated ||
      !wallet ||
      wallet.walletClientType !== "privy"
    ) {
      setError("Please connect with Privy embedded wallet (email login)");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const availableBalance = getAvailableBalance();
    if (parseFloat(amount) > parseFloat(availableBalance)) {
      setError("Insufficient balance");
      return;
    }

    isBridgingRef.current = true;
    setStatus("bridging");
    setError("");
    setTxHash("");

    // Initialize bridge steps tracking
    setBridgeSteps([
      {
        step: "approval",
        description: "Step 1/3: Approve USDC spending (if needed)",
        status: "pending",
      },
      {
        step: "burn",
        description: "Step 2/3: Burn USDC on source chain",
        status: "pending",
      },
      {
        step: "mint",
        description: "Step 3/3: Mint USDC on destination chain",
        status: "pending",
      },
    ]);

    // Set up callback for progress updates
    if (typeof window !== "undefined") {
      (window as any).bridgeProgressCallback = (progress: {
        step: string;
        description: string;
        status: "pending" | "waiting" | "processing" | "completed" | "error";
      }) => {
        setBridgeSteps((prev) => {
          const updated = [...prev];
          const stepIndex = updated.findIndex((s) => s.step === progress.step);
          if (stepIndex >= 0) {
            updated[stepIndex] = {
              ...updated[stepIndex],
              description: progress.description,
              status: progress.status,
            };
          }
          return updated;
        });
      };
    }

    try {
      if (!wallet || wallet.walletClientType !== "privy") {
        setError(
          "Only Privy embedded wallets are supported. Please use email login."
        );
        setStatus("error");
        isBridgingRef.current = false;
        if (typeof window !== "undefined") {
          delete (window as any).bridgeProgressCallback;
        }
        return;
      }

      // Switch to source chain before creating adapter (following reference implementation pattern)
      // This ensures the chain is active in the provider before the adapter tries to use it
      try {
        console.log(
          `Switching to source chain ${sourceChain.name} (${sourceChain.chainId})...`
        );
        await switchChain({ chainId: sourceChain.chainId });
        // Give it a moment to complete the switch (reference uses 1000ms, we use 1500ms to be safe)
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Chain switch completed");
      } catch (error) {
        console.warn(
          `Could not switch to ${sourceChain.name} via wagmi:`,
          error
        );
        // If switching fails, try to add the chain to the wallet (for Arc Testnet)
        if (sourceChain.chainId === 5042002) {
          try {
            const ethereumProvider = await wallet.getEthereumProvider();
            if (ethereumProvider && ethereumProvider.request) {
              console.log("Attempting to add Arc Testnet to wallet...");
              await ethereumProvider.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${sourceChain.chainId.toString(16)}`,
                    chainName: sourceChain.name,
                    nativeCurrency: {
                      name: "USDC",
                      symbol: "USDC",
                      decimals: 18,
                    },
                    rpcUrls: [sourceChain.rpcUrl],
                    blockExplorerUrls: sourceChain.blockExplorer
                      ? [sourceChain.blockExplorer]
                      : [],
                  },
                ],
              });
              // Try switching again after adding
              await switchChain({ chainId: sourceChain.chainId });
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          } catch (addChainError) {
            console.warn("Could not add Arc Testnet to wallet:", addChainError);
            // Continue anyway - the adapter might still work if chain is already added
          }
        }
      }

      const ethereumProvider = await wallet.getEthereumProvider();
      if (!ethereumProvider) {
        setError("Failed to get Ethereum provider from wallet");
        setStatus("error");
        isBridgingRef.current = false;
        if (typeof window !== "undefined") {
          delete (window as any).bridgeProgressCallback;
        }
        return;
      }

      // Create wrapped provider that intercepts transactions for custom UI messages
      // The wrapper passes through all non-transaction requests (chain switching, etc.)
      // so the adapter can still switch chains and perform other operations
      const finalEip1193Provider = createPrivyTransactionWrapper(
        ethereumProvider,
        privySendTransaction,
        confirmEachStep // Pass the confirmEachStep setting
      );

      const provider = new BrowserProvider(finalEip1193Provider as any);

      console.log("Starting bridge transaction...");
      const result = await bridgeUSDC({
        amount,
        sourceChain,
        destinationChain,
        userAddress: wallet.address,
        provider,
        eip1193Provider: finalEip1193Provider, // Use wrapped provider so transactions are intercepted
      });

      // Update bridge steps based on result
      if (result?.steps && result.steps.length > 0) {
        setBridgeSteps((prev) => {
          const updated = [...prev];
          (result.steps || []).forEach(
            (step: { name: string; state: string; errorMessage?: string }) => {
              const stepMap: Record<string, number> = {
                approve: 0,
                approval: 0,
                burn: 1,
                mint: 2,
              };
              const stepIndex = stepMap[step.name] ?? -1;
              if (stepIndex >= 0 && updated[stepIndex]) {
                updated[stepIndex] = {
                  ...updated[stepIndex],
                  status:
                    step.state === "success"
                      ? "completed"
                      : step.state === "error"
                      ? "error"
                      : step.state === "pending"
                      ? "pending"
                      : "processing",
                  description:
                    step.state === "success"
                      ? `${
                          updated[stepIndex].description.split(" - ")[0]
                        } - ✅ Completed`
                      : step.state === "error"
                      ? `${
                          updated[stepIndex].description.split(" - ")[0]
                        } - ❌ Failed: ${step.errorMessage || "Unknown error"}`
                      : updated[stepIndex].description,
                };
              }
            }
          );
          return updated;
        });
      }

      if (result.state === "success" && result.sourceTxHash) {
        setTxHash(result.sourceTxHash);
        setStatus("success");
        setError("");

        setTimeout(() => {
          fetchBalances();
        }, 3000);
      } else if (result.state === "partial") {
        setTxHash(result.sourceTxHash || "");
        setStatus("error");
        setError(
          "Bridge partially completed: Burn succeeded but mint failed. " +
            "Your funds are in transit. Please try again later."
        );
      } else {
        setStatus("error");
        setError(result.error || "Bridge transaction failed");
      }
    } catch (err: unknown) {
      console.error("Bridge error:", err);

      let displayMessage =
        err instanceof Error ? err.message : "Bridge transaction failed";
      if (displayMessage.includes("timeout")) {
        displayMessage =
          "Transaction approval timed out. Please check if a popup appeared and try again.";
      } else if (
        displayMessage.includes("User rejected") ||
        displayMessage.includes("user rejected")
      ) {
        displayMessage = "Transaction was rejected. Please try again.";
      } else if (displayMessage.includes("popup")) {
        displayMessage =
          "Please check your browser for approval popups. They may be blocked or hidden.";
      }

      setError(displayMessage);
      setStatus("error");
    } finally {
      isBridgingRef.current = false;

      if (typeof window !== "undefined") {
        delete (window as any).bridgeProgressCallback;
      }
    }
  };

  const maxAmount = () => {
    setAmount(getAvailableBalance());
  };

  if (!ready || !authenticated) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Bridge USDC
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Connect your wallet to bridge USDC
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        Bridge USDC
      </h2>
      <form onSubmit={handleBridge} className="space-y-5">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <ChainSelect
              label="Source Chain"
              value={sourceChain}
              onChange={(chain) => {
                setSourceChain(chain);
                if (chain.chainId === destinationChain.chainId) {
                  if (chain.chainId === ARC_CHAIN.chainId) {
                    setDestinationChain(ETHEREUM_SEPOLIA_CHAIN);
                  } else if (chain.chainId === ETHEREUM_SEPOLIA_CHAIN.chainId) {
                    setDestinationChain(ARC_CHAIN);
                  } else if (chain.chainId === BASE_SEPOLIA_CHAIN.chainId) {
                    setDestinationChain(ARC_CHAIN);
                  } else if (chain.chainId === ARBITRUM_SEPOLIA_CHAIN.chainId) {
                    setDestinationChain(ARC_CHAIN);
                  } else {
                    setDestinationChain(ETHEREUM_SEPOLIA_CHAIN);
                  }
                }
              }}
              options={[
                ARC_CHAIN,
                ETHEREUM_SEPOLIA_CHAIN,
                BASE_SEPOLIA_CHAIN,
                ARBITRUM_SEPOLIA_CHAIN,
              ]}
              disabled={status === "bridging" || status === "approving"}
            />
          </div>

          <div className="flex items-center justify-center pb-2">
            <svg
              className="h-6 w-6 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>

          <div className="flex-1">
            <ChainSelect
              label="Destination Chain"
              value={destinationChain}
              onChange={(chain) => {
                if (chain.chainId !== sourceChain.chainId) {
                  setDestinationChain(chain);
                }
              }}
              options={[
                ARC_CHAIN,
                ETHEREUM_SEPOLIA_CHAIN,
                BASE_SEPOLIA_CHAIN,
                ARBITRUM_SEPOLIA_CHAIN,
              ].filter((chain) => chain.chainId !== sourceChain.chainId)}
              disabled={status === "bridging" || status === "approving"}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-gray-400 dark:disabled:bg-gray-800"
              disabled={status === "bridging" || status === "approving"}
            />
            <button
              type="button"
              onClick={maxAmount}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              disabled={status === "bridging" || status === "approving"}
            >
              Max
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Available:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {parseFloat(getAvailableBalance()).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              USDC
            </span>{" "}
            on {sourceChain.name}
          </p>
        </div>

        {sourceChain && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className={`h-4 w-4 ${
                    parseFloat(currentAllowance) >= parseFloat(amount || "0")
                      ? "text-green-600 dark:text-green-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {parseFloat(currentAllowance) >= parseFloat(amount || "0") ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  )}
                </svg>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Approved to spend on {sourceChain.name}:
                </p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  parseFloat(currentAllowance) >= parseFloat(amount || "0")
                    ? "text-green-700 dark:text-green-400"
                    : "text-yellow-700 dark:text-yellow-400"
                }`}
              >
                {parseFloat(currentAllowance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                USDC
              </span>
            </div>
            {parseFloat(currentAllowance) < parseFloat(amount || "0") && (
              <p className="mt-2 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                ⚠️ Approval needed to complete this bridge
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="confirmEachStep"
            checked={confirmEachStep}
            onChange={(e) => setConfirmEachStep(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-gray-400"
            disabled={status === "bridging" || status === "approving"}
          />
          <label
            htmlFor="confirmEachStep"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Confirm each step
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (Show completion screens for each transaction)
          </span>
        </div>

        {/* Bridge Progress Steps */}
        {(status === "bridging" || status === "approving") &&
          bridgeSteps.length > 0 && <BridgeProgress steps={bridgeSteps} />}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "success" && txHash && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                  Bridge successful!
                </p>
                <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                  Transaction:{" "}
                  <a
                    href={`${sourceChain.blockExplorer}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono underline hover:text-green-900 dark:hover:text-green-200"
                  >
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={
            status === "bridging" ||
            status === "approving" ||
            !amount ||
            parseFloat(amount) <= 0
          }
          className="w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          {status === "bridging" || status === "approving" ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Bridge USDC"
          )}
        </button>
      </form>
    </div>
  );
}
