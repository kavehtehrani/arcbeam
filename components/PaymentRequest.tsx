"use client";

import { useState, useMemo } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { QRCodeSVG } from "qrcode.react";
import ChainSelect from "@/components/ChainSelect";
import Image from "next/image";
import {
  ARC_CHAIN,
  ETHEREUM_SEPOLIA_CHAIN,
  BASE_SEPOLIA_CHAIN,
  ARBITRUM_SEPOLIA_CHAIN,
  OP_SEPOLIA_CHAIN,
  POLYGON_AMOY_CHAIN,
  INK_TESTNET_CHAIN,
  ChainConfig,
  SUPPORTED_CHAINS,
} from "@/lib/chains";
import { getChainLogoPath } from "@/lib/chainLogos";

interface PaymentRequestData {
  address: string;
  chainId: number;
  chainName: string;
  amount: string;
  token: string;
}

export default function PaymentRequest() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [selectedChain, setSelectedChain] = useState<ChainConfig>(ARC_CHAIN);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  // Only use Privy embedded wallet - ignore external wallets like MetaMask
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address;

  // Filter chains that support USDC (exclude chains without USDC)
  const availableChains = SUPPORTED_CHAINS.filter(
    (chain) => chain.usdcAddress && chain.usdcAddress !== ""
  );

  // Generate payment request data
  const paymentRequestData: PaymentRequestData | null = useMemo(() => {
    if (!walletAddress || !amount || parseFloat(amount) <= 0) {
      return null;
    }

    return {
      address: walletAddress,
      chainId: selectedChain.chainId,
      chainName: selectedChain.name,
      amount: amount,
      token: "USDC",
    };
  }, [walletAddress, selectedChain, amount]);

  // Generate QR code data as JSON string
  const qrCodeData = paymentRequestData
    ? JSON.stringify(paymentRequestData)
    : "";

  const copyToClipboard = async () => {
    if (!qrCodeData) return;
    try {
      await navigator.clipboard.writeText(qrCodeData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy QR data:", err);
    }
  };

  const chainLogoPath = getChainLogoPath(selectedChain.name);

  if (!ready || !authenticated) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Request Payment
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Connect your wallet to request payments
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="bg-arcbeam-light-blue-gradient px-6 py-4 dark:bg-arcbeam-light-blue-gradient min-h-[4.5rem]">
        <h2 className="text-lg font-semibold text-white">Request Payment</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {/* Chain Selection */}
          <div>
            <ChainSelect
              value={selectedChain}
              onChange={setSelectedChain}
              options={availableChains}
              label="Chain"
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount (USDC)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-gray-400"
            />
          </div>

          {/* QR Code Display */}
          {paymentRequestData && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-700/50">
                <QRCodeSVG
                  value={qrCodeData}
                  size={256}
                  level="M"
                  includeMargin={true}
                  className="rounded-lg"
                />
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Scan to pay
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {selectedChain.name} • {amount} USDC
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Chain
                    </span>
                    <div className="flex items-center gap-2">
                      {chainLogoPath ? (
                        <Image
                          src={chainLogoPath}
                          alt={selectedChain.name}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      ) : null}
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selectedChain.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Amount
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {amount} USDC
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Recipient
                    </span>
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                      {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Copy QR Data Button */}
              <button
                onClick={copyToClipboard}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {copied ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 text-green-600"
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
                    Copied!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Payment Request
                  </span>
                )}
              </button>
            </div>
          )}

          {!paymentRequestData && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-700/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter an amount to generate a payment request QR code
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

