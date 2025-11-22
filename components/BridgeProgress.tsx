"use client";

interface BridgeStep {
  step: string;
  description: string;
  status: "pending" | "waiting" | "processing" | "completed" | "error";
  txType?: string;
}

interface BridgeProgressProps {
  steps: BridgeStep[];
  useGasSponsorship?: boolean;
}

export default function BridgeProgress({
  steps,
  useGasSponsorship = false,
}: BridgeProgressProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
      <h3 className="mb-3 text-sm font-semibold text-indigo-900 dark:text-indigo-300">
        Bridge Progress
      </h3>
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.step}
            className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
              step.status === "completed"
                ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20"
                : step.status === "waiting" || step.status === "processing"
                ? "border-indigo-300 bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/30"
                : step.status === "error"
                ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            }`}
          >
            {/* Step Number/Icon */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
              {step.status === "completed" ? (
                <svg
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
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
              ) : step.status === "waiting" || step.status === "processing" ? (
                <svg
                  className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400"
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
              ) : step.status === "error" ? (
                <svg
                  className="h-5 w-5 text-red-600 dark:text-red-400"
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
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"></div>
              )}
            </div>
            {/* Step Description */}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  step.status === "completed"
                    ? "text-emerald-900 dark:text-emerald-300"
                    : step.status === "waiting" || step.status === "processing"
                    ? "text-indigo-900 dark:text-indigo-300"
                    : step.status === "error"
                    ? "text-red-900 dark:text-red-300"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {step.description}
              </p>
              {step.status === "waiting" && (
                <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-400">
                  ⏳ Waiting for your approval in Privy popup...
                </p>
              )}
              {step.status === "processing" && (
                <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-400">
                  ⚙️ Processing transaction on-chain...
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {useGasSponsorship && (
        <p className="mt-3 text-xs text-indigo-700 dark:text-indigo-400">
          💡 Each step requires an EIP-7702 authorization signature for gas
          sponsorship. You&apos;ll see 3 Privy popups - one for each step.
        </p>
      )}
    </div>
  );
}

