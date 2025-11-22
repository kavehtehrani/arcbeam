"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { http } from "viem";
import { sepolia, baseSepolia, arbitrumSepolia } from "viem/chains";

interface PrivyProviderWrapperProps {
  children: ReactNode;
}

export default function PrivyProviderWrapper({
  children,
}: PrivyProviderWrapperProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const [queryClient] = useState(() => new QueryClient());

  // Suppress non-critical errors from Privy's internal components
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const message = args[0];
      const errorString = JSON.stringify(args);

      if (
        typeof message === "string" &&
        (message.includes("cannot be a descendant of <p>") ||
          message.includes("cannot contain a nested <div>") ||
          message.includes("HelpTextContainer"))
      ) {
        return;
      }

      if (
        (typeof message === "string" && message.includes("CORS policy")) ||
        errorString.includes("analytics_events") ||
        errorString.includes("auth.privy.io/api/v1/analytics_events") ||
        errorString.includes("Unable to submit event")
      ) {
        return;
      }

      if (
        typeof message === "string" &&
        (message.includes("React does not recognize") ||
          message.includes("on a DOM element") ||
          (message.includes("isActive") && message.includes("prop")) ||
          (message.includes("isactive") && message.includes("prop")))
      ) {
        return;
      }

      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args[0];
      const warnString = JSON.stringify(args);

      if (
        (typeof message === "string" &&
          message.includes("Unable to submit event")) ||
        warnString.includes("analytics_events") ||
        warnString.includes("auth.privy.io")
      ) {
        return;
      }

      if (
        typeof message === "string" &&
        (message.includes("unknown prop") ||
          message.includes("isActive") ||
          message.includes("isactive") ||
          message.includes("styled-components") ||
          message.includes("shouldForwardProp") ||
          message.includes("transient props"))
      ) {
        return;
      }

      if (
        typeof message === "string" &&
        (message.includes("React does not recognize") ||
          message.includes("on a DOM element") ||
          (message.includes("isActive") && message.includes("prop")))
      ) {
        return;
      }

      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (!appId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <h2 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-300">
            Configuration Error
          </h2>
          <p className="text-red-700 dark:text-red-400">
            NEXT_PUBLIC_PRIVY_APP_ID is not set in your environment variables.
          </p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            Please create a{" "}
            <code className="rounded bg-red-100 px-1 dark:bg-red-900/50">
              .env.local
            </code>{" "}
            file with:
          </p>
          <pre className="mt-2 rounded bg-red-100 p-2 text-xs dark:bg-red-900/50">
            NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here
          </pre>
        </div>
      </div>
    );
  }

  const wagmiConfig = createConfig({
    chains: [sepolia, baseSepolia, arbitrumSepolia],
    transports: {
      [sepolia.id]: http(),
      [baseSepolia.id]: http(),
      [arbitrumSepolia.id]: http(),
    },
  });

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
          showWalletUIs: true,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
