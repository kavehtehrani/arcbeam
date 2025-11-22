"use client";

export default function WalletInfo() {
  // Visual-only component - no functionality
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <svg
              className="h-5 w-5 text-gray-600 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Privy Embedded Wallet
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                0x0000...0000
              </p>
              <button
                className="flex items-center justify-center rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:text-gray-500"
                title="Copy address to clipboard"
              >
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
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/30">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs font-medium text-green-700 dark:text-green-400">
            Connected
          </span>
        </div>
      </div>
    </div>
  );
}

