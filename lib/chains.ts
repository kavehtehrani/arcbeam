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
    "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
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
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
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
    "https://sepolia-rollup.arbitrum.io/rpc",
  usdcAddress:
    process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_USDC_ADDRESS ??
    "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  blockExplorer: "https://sepolia.arbiscan.io",
  bridgeKitChainName: "Arbitrum_Sepolia",
};

// Arc Testnet configuration
export const ARC_CHAIN: ChainConfig = {
  chainId: 5042002,
  name: "Arc Testnet",
  rpcUrl:
    process.env.NEXT_PUBLIC_ARC_RPC_URL ??
    process.env.NEXT_PUBLIC_ARC_RPC_URL_FALLBACK ??
    "",
  usdcAddress:
    process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS ??
    "0x3600000000000000000000000000000000000000",
  blockExplorer: "https://testnet.arcscan.app",
};

export const SUPPORTED_CHAINS = [
  ETHEREUM_SEPOLIA_CHAIN,
  BASE_SEPOLIA_CHAIN,
  ARBITRUM_SEPOLIA_CHAIN,
  ARC_CHAIN,
];

export const getChainById = (chainId: number): ChainConfig | undefined => {
  return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId);
};
