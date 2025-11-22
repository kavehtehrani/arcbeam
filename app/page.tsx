"use client";

import { useState } from "react";
import Image from "next/image";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import BalanceViewer from "@/components/BalanceViewer";
import BridgeForm from "@/components/BridgeForm";
import WalletInfo from "@/components/WalletInfo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useTheme } from "@/components/ThemeProvider";

export default function Home() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { mounted } = useTheme();
  const [copied, setCopied] = useState(false);

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const wallet = embeddedWallet || wallets[0];
  const walletAddress = wallet?.address;

  const copyToClipboard = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const handleConnect = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const displayAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "0x0000...0000";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="arcbeam"
              width={48}
              height={48}
              className="h-12 w-12 bg-transparent"
              style={{ background: "transparent" }}
            />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                ArcBeam
              </h1>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Bridge USDC across chains
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
            {mounted && <ThemeSwitcher />}
            {ready && authenticated && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Wallet Connected
                </p>
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {displayAddress}
                  </p>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center justify-center rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:text-gray-500"
                    title="Copy address to clipboard"
                  >
                    {copied ? (
                      <svg
                        className="h-3.5 w-3.5 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
            {ready && authenticated ? (
              <button
                onClick={handleDisconnect}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={!ready}
                className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {ready && authenticated && (
          <div className="mb-8">
            <WalletInfo />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BalanceViewer />
          <BridgeForm />
        </div>
      </main>
    </div>
  );
}
