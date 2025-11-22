"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { getUSDCBalance, getETHBalance } from "@/lib/bridge";
import {
  ARC_CHAIN,
  ETHEREUM_SEPOLIA_CHAIN,
  BASE_SEPOLIA_CHAIN,
  ARBITRUM_SEPOLIA_CHAIN,
} from "@/lib/chains";

interface ChainBalances {
  usdc: string;
  eth: string;
}

export default function BalanceViewer() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [balances, setBalances] = useState<{
    ethereumSepolia: ChainBalances;
    baseSepolia: ChainBalances;
    arbitrumSepolia: ChainBalances;
    arc: ChainBalances;
  }>({
    ethereumSepolia: { usdc: "0", eth: "0" },
    baseSepolia: { usdc: "0", eth: "0" },
    arbitrumSepolia: { usdc: "0", eth: "0" },
    arc: { usdc: "0", eth: "0" },
  });
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const wallet = embeddedWallet || wallets[0];
  const walletAddress = wallet?.address;

  const fetchBalances = useCallback(
    async (force = false) => {
      if (fetchingRef.current && !force) return;

      if (!walletAddress) {
        setBalances({
          ethereumSepolia: { usdc: "0", eth: "0" },
          baseSepolia: { usdc: "0", eth: "0" },
          arbitrumSepolia: { usdc: "0", eth: "0" },
          arc: { usdc: "0", eth: "0" },
        });
        setLoading(false);
        return;
      }

      fetchingRef.current = true;
      setLoading(true);

      try {
        const [
          arcUSDC,
          ethereumSepoliaUSDC,
          ethereumSepoliaETH,
          baseSepoliaUSDC,
          baseSepoliaETH,
          arbitrumSepoliaUSDC,
          arbitrumSepoliaETH,
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
        ]);

        setBalances({
          arc: {
            usdc: arcUSDC,
            eth: "0",
          },
          ethereumSepolia: {
            usdc: ethereumSepoliaUSDC,
            eth: ethereumSepoliaETH,
          },
          baseSepolia: {
            usdc: baseSepoliaUSDC,
            eth: baseSepoliaETH,
          },
          arbitrumSepolia: {
            usdc: arbitrumSepoliaUSDC,
            eth: arbitrumSepoliaETH,
          },
        });
        hasFetchedRef.current = true;
        console.log("Balances fetched successfully:", {
          ethereumSepolia: {
            usdc: ethereumSepoliaUSDC,
            eth: ethereumSepoliaETH,
          },
          baseSepolia: { usdc: baseSepoliaUSDC, eth: baseSepoliaETH },
          walletAddress,
        });
      } catch (error) {
        console.error("Error fetching balances:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          walletAddress,
          rpcUrls: {
            ethereumSepolia: ETHEREUM_SEPOLIA_CHAIN.rpcUrl,
            baseSepolia: BASE_SEPOLIA_CHAIN.rpcUrl,
          },
        });
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [walletAddress]
  );

  useEffect(() => {
    if (ready && authenticated && walletAddress && !hasFetchedRef.current) {
      const timeoutId = setTimeout(() => {
        fetchBalances();
      }, 100);
      return () => clearTimeout(timeoutId);
    } else if (!ready || !authenticated || !walletAddress) {
      setBalances({
        ethereumSepolia: { usdc: "0", eth: "0" },
        baseSepolia: { usdc: "0", eth: "0" },
        arbitrumSepolia: { usdc: "0", eth: "0" },
        arc: { usdc: "0", eth: "0" },
      });
      setLoading(false);
      hasFetchedRef.current = false;
      fetchingRef.current = false;
    }
  }, [ready, authenticated, walletAddress, fetchBalances]);

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

  // Create an array of balance items to display
  const balanceItems = [
    {
      chain: "Arc Testnet",
      token: "USDC",
      balance: balances.arc.usdc,
      color: "bg-green-500",
      decimals: 2,
    },
    {
      chain: "Ethereum Sepolia",
      token: "USDC",
      balance: balances.ethereumSepolia.usdc,
      color: "bg-blue-500",
      decimals: 2,
    },
    {
      chain: "Ethereum Sepolia",
      token: "ETH",
      balance: balances.ethereumSepolia.eth,
      color: "bg-blue-500",
      decimals: 4,
    },
    {
      chain: "Base Sepolia",
      token: "USDC",
      balance: balances.baseSepolia.usdc,
      color: "bg-purple-500",
      decimals: 2,
    },
    {
      chain: "Base Sepolia",
      token: "ETH",
      balance: balances.baseSepolia.eth,
      color: "bg-purple-500",
      decimals: 4,
    },
    {
      chain: "Arbitrum Sepolia",
      token: "USDC",
      balance: balances.arbitrumSepolia.usdc,
      color: "bg-cyan-500",
      decimals: 2,
    },
    {
      chain: "Arbitrum Sepolia",
      token: "ETH",
      balance: balances.arbitrumSepolia.eth,
      color: "bg-cyan-500",
      decimals: 4,
    },
  ].filter((item) => isBalanceGreaterThanZero(item.balance));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Balances
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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
            "Refresh"
          )}
        </button>
      </div>
      {balanceItems.length === 0 && !loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No balances found. All balances are zero.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {balanceItems.map((item, index) => (
            <div
              key={`${item.chain}-${item.token}-${index}`}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${item.color}`}></div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.chain}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {item.token}
                </p>
                {loading ? (
                  <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-600" />
                ) : (
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {parseFloat(item.balance).toLocaleString(undefined, {
                      minimumFractionDigits: item.decimals,
                      maximumFractionDigits: item.decimals,
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
