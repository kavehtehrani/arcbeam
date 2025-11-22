"use client";

import { useState } from "react";

export default function BridgeForm() {
  // Visual-only component - no functionality
  const [amount, setAmount] = useState("");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Bridge USDC</h2>
      <form className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Source Chain
          </label>
          <select className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
            <option value="11155111">Ethereum Sepolia</option>
            <option value="84532">Base Sepolia</option>
            <option value="421614">Arbitrum Sepolia</option>
            <option value="arc" disabled>
              Arc Testnet (Coming soon)
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
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
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Max
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Available:{" "}
            <span className="font-medium text-gray-700">0.00 USDC</span> on
            Ethereum Sepolia
          </p>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700">
                Approved to spend on Ethereum Sepolia:
              </p>
            </div>
            <span className="text-sm font-semibold text-yellow-700">0.00 USDC</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <input
            type="checkbox"
            id="gasSponsorship"
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-1 focus:ring-gray-900"
          />
          <label
            htmlFor="gasSponsorship"
            className="flex-1 text-sm font-medium text-gray-700"
          >
            <span className="font-medium">Enable Gas Sponsorship</span>
            <span className="ml-2 text-xs text-gray-500">
              (Experimental - uses Pimlico smart accounts)
            </span>
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Destination Chain
          </label>
          <select className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
            <option value="84532">Base Sepolia</option>
            <option value="421614">Arbitrum Sepolia</option>
            <option value="arc" disabled>
              Arc Testnet (Coming soon)
            </option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Bridge USDC
        </button>
      </form>
    </div>
  );
}

