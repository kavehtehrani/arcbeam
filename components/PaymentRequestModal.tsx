"use client";

import { useState, useMemo, useEffect } from "react";
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
  getChainById,
} from "@/lib/chains";
import { getChainLogoPath } from "@/lib/chainLogos";

interface PaymentRequestData {
  address: string;
  chainId: number;
  chainName: string;
  amount: string;
  token: string;
}

interface PaymentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentRequestModal({
  isOpen,
  onClose,
}: PaymentRequestModalProps) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [selectedChain, setSelectedChain] = useState<ChainConfig>(ARC_CHAIN);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Only use Privy embedded wallet - ignore external wallets like MetaMask
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address;

  // Filter chains that support USDC (exclude chains without USDC)
  const availableChains = SUPPORTED_CHAINS.filter(
    (chain) => chain.usdcAddress && chain.usdcAddress !== ""
  );

  // Parse URL parameters on mount to auto-fill payment request
  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;

    const params = new URLSearchParams(window.location.search);
    const address = params.get("address");
    const chainId = params.get("chainId");
    const amountParam = params.get("amount");

    if (address && chainId && amountParam) {
      const chain = getChainById(parseInt(chainId));
      if (chain) {
        // Defer state updates to avoid cascading renders
        setTimeout(() => {
          setSelectedChain(chain);
          setAmount(amountParam);
        }, 0);
        // Note: We don't set recipientAddress here since this is for requesting payment
        // The address in the URL is the recipient (the person requesting payment)
      }
    }
  }, [isOpen]);

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

  // Generate payment link
  const paymentLink = useMemo(() => {
    if (!paymentRequestData) return "";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      address: paymentRequestData.address,
      chainId: paymentRequestData.chainId.toString(),
      amount: paymentRequestData.amount,
      token: paymentRequestData.token,
    });
    return `${baseUrl}?${params.toString()}`;
  }, [paymentRequestData]);

  const copyToClipboard = async (
    text: string,
    setState: (val: boolean) => void
  ) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setState(true);
      setTimeout(() => setState(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const chainLogoPath = getChainLogoPath(selectedChain.name);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (!ready || !authenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="bg-arcbeam-light-blue-gradient px-6 py-4 dark:bg-arcbeam-light-blue-gradient">
            <h2 className="text-lg font-semibold text-white">
              Request Payment
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connect your wallet to request payments
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-400 shadow-md transition-colors hover:bg-white hover:text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-300"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-arcbeam-light-blue-gradient px-6 py-4 dark:bg-arcbeam-light-blue-gradient">
          <h2 className="text-lg font-semibold text-white">Request Payment</h2>
        </div>

        {/* Content */}
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
                        {walletAddress?.slice(0, 6)}...
                        {walletAddress?.slice(-4)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Share Options */}
                <div className="space-y-2">
                  {/* Copy Payment Link */}
                  <button
                    onClick={() => copyToClipboard(paymentLink, setLinkCopied)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    {linkCopied ? (
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
                        Link Copied!
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
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        Copy Payment Link
                      </span>
                    )}
                  </button>

                  {/* Copy QR Data Button */}
                  <button
                    onClick={() => copyToClipboard(qrCodeData, setCopied)}
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
                        Copy Payment Request (JSON)
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {!paymentRequestData && (
              <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter an amount to generate a payment request QR code and link
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
