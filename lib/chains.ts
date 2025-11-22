import { defineChain } from "viem";

// Chain configurations for supported networks
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  usdcAddress: string;
  blockExplorer?: string;
  bridgeKitChainName?: string; // Circle Bridge Kit chain identifier
}

// Ethereum Sepolia Testnet configuration
export const ETHEREUM_SEPOLIA_CHAIN: ChainConfig = {
  chainId: 11155111,
  name: "Ethereum Sepolia",
  rpcUrl:
    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL_FALLBACK ??
    "https://eth-sepolia.api.onfinality.io/public",
  usdcAddress:
    process.env.NEXT_PUBLIC_SEPOLIA_USDC_ADDRESS ??
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  blockExplorer: "https://sepolia.etherscan.io",
  bridgeKitChainName: "Ethereum_Sepolia",
};

// Base Sepolia Testnet configuration
export const BASE_SEPOLIA_CHAIN: ChainConfig = {
  chainId: 84532,
  name: "Base Sepolia",
  rpcUrl:
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ??
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL_FALLBACK ??
    "https://sepolia.base.org",
  usdcAddress:
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_USDC_ADDRESS ??
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  blockExplorer: "https://sepolia.basescan.org",
  bridgeKitChainName: "Base_Sepolia",
};

// Arbitrum Sepolia Testnet configuration
export const ARBITRUM_SEPOLIA_CHAIN: ChainConfig = {
  chainId: 421614,
  name: "Arbitrum Sepolia",
  rpcUrl:
    process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ??
    process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL_FALLBACK ??
    "https://sepolia-rollup.arbitrum.io/rpc",
  usdcAddress:
    process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_USDC_ADDRESS ??
    "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  blockExplorer: "https://sepolia.arbiscan.io",
  bridgeKitChainName: "Arbitrum_Sepolia",
};

// Arc Testnet configuration
// RPC URL: https://rpc.testnet.arc.network (from Arc docs)
// Bridge Kit chain name follows pattern: ChainName_NetworkName
export const ARC_CHAIN: ChainConfig = {
  chainId: 5042002,
  name: "Arc Testnet",
  rpcUrl:
    process.env.NEXT_PUBLIC_ARC_RPC_URL ??
    process.env.NEXT_PUBLIC_ARC_RPC_URL_FALLBACK ??
    "https://rpc.testnet.arc.network",
  usdcAddress:
    process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS ??
    "0x3600000000000000000000000000000000000000",
  blockExplorer: "https://testnet.arcscan.app",
  bridgeKitChainName: "Arc_Testnet", // Circle Bridge Kit chain identifier (verify with Circle docs)
};

export const SUPPORTED_CHAINS = [
  ARC_CHAIN,
  ETHEREUM_SEPOLIA_CHAIN,
  BASE_SEPOLIA_CHAIN,
  ARBITRUM_SEPOLIA_CHAIN,
];

export const getChainById = (chainId: number): ChainConfig | undefined => {
  return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId);
};

// Viem chain definitions for Wagmi/Privy integration
// Arc Testnet as a custom viem chain
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_ARC_RPC_URL ??
          "https://rpc.testnet.arc.network",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Arcscan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});
