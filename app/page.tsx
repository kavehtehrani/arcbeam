"use client";

import { useState } from "react";
import Image from "next/image";
import BalanceViewer from "@/components/BalanceViewer";
import BridgeForm from "@/components/BridgeForm";
import WalletInfo from "@/components/WalletInfo";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Home() {
  const [authenticated] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("0x0000000000000000000000000000000000000000");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

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
              style={{ background: 'transparent' }}
            />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                arcbeam
              </h1>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Bridge USDC between Arc and Sepolia with gasless transactions
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
            <ThemeSwitcher />
            {authenticated && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Wallet Connected
                </p>
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    0x0000...0000
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
            {authenticated ? (
              <button className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                Disconnect
              </button>
            ) : (
              <button className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {authenticated && (
          <div className="mb-8">
            <WalletInfo />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BalanceViewer />
          <BridgeForm />
        </div>

        {authenticated && (
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-start gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
                <svg
                  className="h-3 w-3 text-white"
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
              </div>
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-300">
                  Gasless transactions enabled
                </p>
                <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                  All transactions are sponsored via Privy - no gas fees for
                  users
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
