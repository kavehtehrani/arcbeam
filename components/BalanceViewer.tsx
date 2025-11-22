"use client";

export default function BalanceViewer() {
  // Visual-only component - no functionality
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Balances
        </h2>
        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
          Refresh
        </button>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Ethereum Sepolia
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                USDC
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                0.00
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                ETH
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                0.0000
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Base Sepolia
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                USDC
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                0.00
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                ETH
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                0.0000
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Arbitrum Sepolia
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                USDC
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                0.00
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                ETH
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                0.0000
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 opacity-60 dark:border-gray-700 dark:bg-gray-700/50">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"></div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Arc Testnet
            </p>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              (Coming soon)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-500">
                USDC
              </p>
              <p className="text-xl font-semibold text-gray-500 dark:text-gray-500">
                0.00
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-500">
                ETH
              </p>
              <p className="text-xl font-semibold text-gray-500 dark:text-gray-500">
                0.0000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
