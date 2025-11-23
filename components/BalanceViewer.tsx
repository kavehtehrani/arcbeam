"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { getUSDCBalance, getETHBalance } from "@/lib/bridge";
import {
  ARC_CHAIN,
  ETHEREUM_SEPOLIA_CHAIN,
  BASE_SEPOLIA_CHAIN,
  ARBITRUM_SEPOLIA_CHAIN,
  OP_SEPOLIA_CHAIN,
  POLYGON_AMOY_CHAIN,
  INK_TESTNET_CHAIN,
} from "@/lib/chains";
import { getChainLogoPath } from "@/lib/chainLogos";
import Image from "next/image";

interface ChainBalances {
  usdc: string;
  eth: string;
}

export default function BalanceViewer() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [balances, setBalances] = useState<{
    sepolia: ChainBalances;
    baseSepolia: ChainBalances;
    arbitrumSepolia: ChainBalances;
    opSepolia: ChainBalances;
    polygonAmoy: ChainBalances;
    inkTestnet: ChainBalances;
    arc: ChainBalances;
  }>({
    sepolia: { usdc: "0", eth: "0" },
    baseSepolia: { usdc: "0", eth: "0" },
    arbitrumSepolia: { usdc: "0", eth: "0" },
    opSepolia: { usdc: "0", eth: "0" },
    polygonAmoy: { usdc: "0", eth: "0" },
    inkTestnet: { usdc: "0", eth: "0" },
    arc: { usdc: "0", eth: "0" },
  });
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const fetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // Only use Privy embedded wallet - ignore external wallets like MetaMask
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address;

  const fetchBalances = useCallback(
    async (force = false) => {
      if (fetchingRef.current && !force) return;

      // Only fetch balances for Privy embedded wallet - ignore external wallets like MetaMask
      if (
        !embeddedWallet ||
        !walletAddress ||
        embeddedWallet.walletClientType !== "privy"
      ) {
        setBalances({
          sepolia: { usdc: "0", eth: "0" },
          baseSepolia: { usdc: "0", eth: "0" },
          arbitrumSepolia: { usdc: "0", eth: "0" },
          opSepolia: { usdc: "0", eth: "0" },
          polygonAmoy: { usdc: "0", eth: "0" },
          inkTestnet: { usdc: "0", eth: "0" },
          arc: { usdc: "0", eth: "0" },
        });
        setLoading(false);
        return;
      }

      // Double-check we're using the correct wallet address
      if (embeddedWallet.address !== walletAddress) {
        console.warn("Wallet address mismatch - using embedded wallet address");
        return;
      }

      // Log which wallet we're using for debugging
      console.log("Fetching balances for Privy embedded wallet:", {
        address: walletAddress,
        walletType: embeddedWallet.walletClientType,
        allWallets: wallets.map((w) => ({
          address: w.address,
          type: w.walletClientType,
        })),
      });

      fetchingRef.current = true;
      setLoading(true);

      try {
        const [
          arcUSDC,
          sepoliaUSDC,
          sepoliaETH,
          baseSepoliaUSDC,
          baseSepoliaETH,
          arbitrumSepoliaUSDC,
          arbitrumSepoliaETH,
          opSepoliaUSDC,
          opSepoliaETH,
          polygonAmoyUSDC,
          polygonAmoyETH,
          inkTestnetUSDC,
          inkTestnetETH,
        ] = await Promise.all([
          getUSDCBalance(walletAddress, ARC_CHAIN, ARC_CHAIN.rpcUrl),
          getUSDCBalance(
            walletAddress,
            ETHEREUM_SEPOLIA_CHAIN,
            ETHEREUM_SEPOLIA_CHAIN.rpcUrl
          ),
          getETHBalance(
            walletAddress,
            ETHEREUM_SEPOLIA_CHAIN,
            ETHEREUM_SEPOLIA_CHAIN.rpcUrl
          ),
          getUSDCBalance(
            walletAddress,
            BASE_SEPOLIA_CHAIN,
            BASE_SEPOLIA_CHAIN.rpcUrl
          ),
          getETHBalance(
            walletAddress,
            BASE_SEPOLIA_CHAIN,
            BASE_SEPOLIA_CHAIN.rpcUrl
          ),
          getUSDCBalance(
            walletAddress,
            ARBITRUM_SEPOLIA_CHAIN,
            ARBITRUM_SEPOLIA_CHAIN.rpcUrl
          ),
          getETHBalance(
            walletAddress,
            ARBITRUM_SEPOLIA_CHAIN,
            ARBITRUM_SEPOLIA_CHAIN.rpcUrl
          ),
          getUSDCBalance(
            walletAddress,
            OP_SEPOLIA_CHAIN,
            OP_SEPOLIA_CHAIN.rpcUrl
          ),
          getETHBalance(
            walletAddress,
            OP_SEPOLIA_CHAIN,
            OP_SEPOLIA_CHAIN.rpcUrl
          ),
          getUSDCBalance(
            walletAddress,
            POLYGON_AMOY_CHAIN,
            POLYGON_AMOY_CHAIN.rpcUrl
          ),
          getETHBalance(
            walletAddress,
            POLYGON_AMOY_CHAIN,
            POLYGON_AMOY_CHAIN.rpcUrl
          ),
          getUSDCBalance(
            walletAddress,
            INK_TESTNET_CHAIN,
            INK_TESTNET_CHAIN.rpcUrl
          ),
          getETHBalance(
            walletAddress,
            INK_TESTNET_CHAIN,
            INK_TESTNET_CHAIN.rpcUrl
          ),
        ]);

        setBalances({
          arc: {
            usdc: arcUSDC,
            eth: "0",
          },
          sepolia: {
            usdc: sepoliaUSDC,
            eth: sepoliaETH,
          },
          baseSepolia: {
            usdc: baseSepoliaUSDC,
            eth: baseSepoliaETH,
          },
          arbitrumSepolia: {
            usdc: arbitrumSepoliaUSDC,
            eth: arbitrumSepoliaETH,
          },
          opSepolia: {
            usdc: opSepoliaUSDC,
            eth: opSepoliaETH,
          },
          polygonAmoy: {
            usdc: polygonAmoyUSDC,
            eth: polygonAmoyETH,
          },
          inkTestnet: {
            usdc: inkTestnetUSDC,
            eth: inkTestnetETH,
          },
        });
        hasFetchedRef.current = true;
        console.log("Balances fetched successfully:", {
          arc: {
            usdc: arcUSDC,
            eth: "0",
          },
          sepolia: {
            usdc: sepoliaUSDC,
            eth: sepoliaETH,
          },
          baseSepolia: { usdc: baseSepoliaUSDC, eth: baseSepoliaETH },
          arbitrumSepolia: {
            usdc: arbitrumSepoliaUSDC,
            eth: arbitrumSepoliaETH,
          },
          opSepolia: {
            usdc: opSepoliaUSDC,
            eth: opSepoliaETH,
          },
          polygonAmoy: {
            usdc: polygonAmoyUSDC,
            eth: polygonAmoyETH,
          },
          inkTestnet: {
            usdc: inkTestnetUSDC,
            eth: inkTestnetETH,
          },
          walletAddress,
        });
      } catch (error) {
        console.error("Error fetching balances:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          walletAddress,
          rpcUrls: {
            sepolia: ETHEREUM_SEPOLIA_CHAIN.rpcUrl,
            baseSepolia: BASE_SEPOLIA_CHAIN.rpcUrl,
          },
        });
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [walletAddress, embeddedWallet, wallets]
  );

  useEffect(() => {
    // Only fetch if we have a Privy embedded wallet (not external wallets)
    if (
      ready &&
      authenticated &&
      embeddedWallet &&
      walletAddress &&
      !hasFetchedRef.current
    ) {
      const timeoutId = setTimeout(() => {
        fetchBalances();
      }, 100);
      return () => clearTimeout(timeoutId);
    } else if (!ready || !authenticated || !embeddedWallet || !walletAddress) {
      setBalances({
        sepolia: { usdc: "0", eth: "0" },
        baseSepolia: { usdc: "0", eth: "0" },
        arbitrumSepolia: { usdc: "0", eth: "0" },
        opSepolia: { usdc: "0", eth: "0" },
        polygonAmoy: { usdc: "0", eth: "0" },
        inkTestnet: { usdc: "0", eth: "0" },
        arc: { usdc: "0", eth: "0" },
      });
      setLoading(false);
      hasFetchedRef.current = false;
      fetchingRef.current = false;
    }
  }, [ready, authenticated, embeddedWallet, walletAddress, fetchBalances]);

  // Listen for balance refresh events from BridgeForm
  useEffect(() => {
    const handleRefresh = () => {
      fetchBalances(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("refreshBalances", handleRefresh);
      return () => {
        window.removeEventListener("refreshBalances", handleRefresh);
      };
    }
  }, [fetchBalances]);

  const handleRefresh = useCallback(() => {
    fetchBalances(true);
  }, [fetchBalances]);

  if (!ready || !authenticated) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Balances
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Connect your wallet to view balances
        </p>
      </div>
    );
  }

  // Helper function to check if balance is greater than zero
  const isBalanceGreaterThanZero = (balance: string): boolean => {
    return parseFloat(balance) > 0;
  };

  // Create network items grouped by chain
  const networkItems = [
    {
      chain: "Arc Testnet",
      tokens: [
        {
          symbol: "USDC",
          balance: balances.arc.usdc,
          decimals: 2,
        },
      ],
    },
    {
      chain: "Sepolia",
      tokens: [
        {
          symbol: "USDC",
          balance: balances.sepolia.usdc,
          decimals: 2,
        },
        {
          symbol: "ETH",
          balance: balances.sepolia.eth,
          decimals: 4,
        },
      ],
    },
    {
      chain: "Base Sepolia",
      tokens: [
        {
          symbol: "USDC",
          balance: balances.baseSepolia.usdc,
          decimals: 2,
        },
        {
          symbol: "ETH",
          balance: balances.baseSepolia.eth,
          decimals: 4,
        },
      ],
    },
    {
      chain: "Arbitrum Sepolia",
      tokens: [
        {
          symbol: "USDC",
          balance: balances.arbitrumSepolia.usdc,
          decimals: 2,
        },
        {
          symbol: "ETH",
          balance: balances.arbitrumSepolia.eth,
          decimals: 4,
        },
      ],
    },
    {
      chain: "OP Sepolia",
      tokens: [
        {
          symbol: "USDC",
          balance: balances.opSepolia.usdc,
          decimals: 2,
        },
        {
          symbol: "ETH",
          balance: balances.opSepolia.eth,
          decimals: 4,
        },
      ],
    },
    {
      chain: "Polygon Amoy",
      tokens: [
        {
          symbol: "USDC",
          balance: balances.polygonAmoy.usdc,
          decimals: 2,
        },
        {
          symbol: "ETH",
          balance: balances.polygonAmoy.eth,
          decimals: 4,
        },
      ],
    },
    {
      chain: "Ink Sepolia",
      tokens: [
        {
          symbol: "USDC",
          balance: balances.inkTestnet.usdc,
          decimals: 2,
        },
        {
          symbol: "ETH",
          balance: balances.inkTestnet.eth,
          decimals: 4,
        },
      ],
    },
  ]
    .map((network) => ({
      ...network,
      logoPath: getChainLogoPath(network.chain),
      tokens: network.tokens.filter((token) =>
        isBalanceGreaterThanZero(token.balance)
      ),
    }))
    .filter((network) => network.tokens.length > 0);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="bg-arcbeam-light-blue-gradient px-6 py-4 dark:bg-arcbeam-light-blue-gradient min-h-[4.5rem]">
        <div className="flex items-center justify-between h-full">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-left hover:opacity-90 transition-all group"
          >
            <h2 className="text-lg font-semibold text-white whitespace-nowrap transition-transform group-hover:scale-105">
              Balances
            </h2>
            <svg
              className={`h-5 w-5 text-white transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
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
                Loading
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </span>
            )}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="p-6">
          {networkItems.length === 0 && !loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No balances found. All balances are zero.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {networkItems.map((network, index) => {
                // Filter out tokens with zero balance
                const nonZeroTokens = network.tokens.filter((token) => {
                  const balanceStr = String(token.balance).trim();
                  if (!balanceStr || balanceStr === "0" || balanceStr === "") {
                    return false;
                  }
                  const balanceNum = parseFloat(balanceStr);
                  return !isNaN(balanceNum) && balanceNum > 0;
                });

                return (
                  <div
                    key={`${network.chain}-${index}`}
                    className="flex min-h-[100px] flex-col rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50"
                  >
                    {/* Card Header */}
                    <div className="flex min-h-[3.5rem] items-center border-b border-gray-200 px-4 py-3 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        {network.logoPath ? (
                          <Image
                            src={network.logoPath}
                            alt={network.chain}
                            width={20}
                            height={20}
                            className="shrink-0 rounded-full"
                          />
                        ) : (
                          <div className="h-5 w-5 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        )}
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                          {network.chain}
                        </p>
                      </div>
                    </div>
                    {/* Balances Section */}
                    <div className="flex flex-1 flex-col space-y-2 p-4">
                      {nonZeroTokens.length === 0 && !loading ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No balances
                        </p>
                      ) : (
                        nonZeroTokens.map((token) => (
                          <div
                            key={token.symbol}
                            className="flex items-center justify-between gap-2 flex-shrink-0"
                          >
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {token.symbol}
                            </p>
                            {loading ? (
                              <div className="h-5 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-600" />
                            ) : (
                              <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white text-right whitespace-nowrap">
                                {(() => {
                                  // Parse the balance string directly to avoid precision issues
                                  const balanceStr = String(
                                    token.balance
                                  ).trim();

                                  // Debug logging for Arc Testnet USDC
                                  if (
                                    token.symbol === "USDC" &&
                                    network.chain === "Arc Testnet"
                                  ) {
                                    console.log("Arc USDC Balance Debug:", {
                                      rawBalance: token.balance,
                                      balanceStr,
                                      balanceType: typeof token.balance,
                                    });
                                  }

                                  if (
                                    !balanceStr ||
                                    balanceStr === "0" ||
                                    balanceStr === ""
                                  ) {
                                    return "0.00";
                                  }
                                  const balanceNum = parseFloat(balanceStr);
                                  if (isNaN(balanceNum)) {
                                    console.warn(
                                      `Invalid balance for ${token.symbol}:`,
                                      token.balance,
                                      "raw string:",
                                      balanceStr
                                    );
                                    return "0.00";
                                  }
                                  // Format with fixed decimal places
                                  const formatted = balanceNum.toFixed(
                                    token.decimals
                                  );

                                  // Debug logging for Arc Testnet USDC
                                  if (
                                    token.symbol === "USDC" &&
                                    network.chain === "Arc Testnet"
                                  ) {
                                    console.log("Arc USDC Balance Formatted:", {
                                      balanceNum,
                                      formatted,
                                    });
                                  }

                                  return formatted;
                                })()}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
