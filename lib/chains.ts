/**
 * Chain configurations - uses viem chains directly, adds only USDC address and Bridge Kit name
 */

import type { Chain } from "viem";
import {
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  lineaSepolia,
  avalancheFuji,
  unichainSepolia,
  plumeTestnet,
  seiTestnet,
  monadTestnet,
  arcTestnet,
} from "viem/chains";
import { getUsdcAddressByChainId } from "./circleUsdcAddresses";

// Bridge Kit chain name mapping (Circle Bridge Kit identifiers)
const BRIDGE_KIT_CHAIN_NAMES: Record<number, string> = {
  11155111: "Ethereum_Sepolia",
  84532: "Base_Sepolia",
  421614: "Arbitrum_Sepolia",
  11155420: "Optimism_Sepolia",
  80002: "Polygon_Amoy_Testnet",
  59141: "Linea_Sepolia",
  43113: "Avalanche_Fuji",
  1301: "Unichain_Sepolia",
  98867: "Plume_Testnet",
  1328: "Sei_Testnet",
  10143: "Monad_Testnet",
  5042002: "Arc_Testnet",
};

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  usdcAddress: string;
  blockExplorer?: string;
  bridgeKitChainName?: string;
}

/**
 * Create ChainConfig from viem Chain by adding USDC address and Bridge Kit name
 */
function createChainConfig(chain: Chain): ChainConfig {
  const usdcAddress = getUsdcAddressByChainId(chain.id) || "";
  const bridgeKitChainName = BRIDGE_KIT_CHAIN_NAMES[chain.id];

  return {
    chainId: chain.id,
    name: chain.name,
    rpcUrl: chain.rpcUrls.default.http[0],
    usdcAddress,
    blockExplorer: chain.blockExplorers?.default?.url,
    bridgeKitChainName,
  };
}

// Export ChainConfig objects built from viem chains
export const ETHEREUM_SEPOLIA_CHAIN = createChainConfig(sepolia);
export const BASE_SEPOLIA_CHAIN = createChainConfig(baseSepolia);
export const ARBITRUM_SEPOLIA_CHAIN = createChainConfig(arbitrumSepolia);
export const OP_SEPOLIA_CHAIN = createChainConfig(optimismSepolia);
export const POLYGON_AMOY_CHAIN = createChainConfig(polygonAmoy);
// Override name for Linea Sepolia to match expected format
// Use same approach as other chains - no special RPC handling
export const LINEA_SEPOLIA_CHAIN = {
  ...createChainConfig(lineaSepolia),
  name: "Linea Sepolia",
};
export const AVALANCHE_FUJI_CHAIN = createChainConfig(avalancheFuji);
export const UNICHAIN_SEPOLIA_CHAIN = createChainConfig(unichainSepolia);
export const PLUME_TESTNET_CHAIN = createChainConfig(plumeTestnet);
export const SEI_TESTNET_CHAIN = createChainConfig(seiTestnet);
export const MONAD_TESTNET_CHAIN = createChainConfig(monadTestnet);
export const ARC_CHAIN = createChainConfig(arcTestnet);

// All supported chains
export const SUPPORTED_CHAINS: ChainConfig[] = [
  ARC_CHAIN,
  ETHEREUM_SEPOLIA_CHAIN,
  BASE_SEPOLIA_CHAIN,
  ARBITRUM_SEPOLIA_CHAIN,
  OP_SEPOLIA_CHAIN,
  POLYGON_AMOY_CHAIN,
  LINEA_SEPOLIA_CHAIN,
  AVALANCHE_FUJI_CHAIN,
  UNICHAIN_SEPOLIA_CHAIN,
  PLUME_TESTNET_CHAIN,
  SEI_TESTNET_CHAIN,
  MONAD_TESTNET_CHAIN,
];

export function getChainById(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId);
}

/**
 * Get bridge kit chain name for a given chain ID
 * Returns undefined if chain is not supported
 */
export function getBridgeKitChainName(chainId: number): string | undefined {
  return BRIDGE_KIT_CHAIN_NAMES[chainId];
}

// Export viem chains for direct use when needed
export {
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  lineaSepolia,
  avalancheFuji,
  unichainSepolia,
  plumeTestnet,
  seiTestnet,
  monadTestnet,
  arcTestnet,
};
