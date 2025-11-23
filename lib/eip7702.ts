/**
 * EIP-7702 Gas Sponsorship Utilities
 * Enables gasless transactions using EIP-7702 authorization and Pimlico paymaster
 */

import { createPublicClient, http, type PublicClient } from "viem";
import {
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  inkSepolia,
  avalancheFuji,
  unichainSepolia,
  plumeTestnet,
  seiTestnet,
  monadTestnet,
} from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { to7702SimpleSmartAccount } from "permissionless/accounts";
import type { Chain } from "viem";
import {
  ChainConfig,
  ETHEREUM_SEPOLIA_CHAIN,
  BASE_SEPOLIA_CHAIN,
  ARBITRUM_SEPOLIA_CHAIN,
  OP_SEPOLIA_CHAIN,
  POLYGON_AMOY_CHAIN,
  INK_TESTNET_CHAIN,
  AVALANCHE_FUJI_CHAIN,
  UNICHAIN_SEPOLIA_CHAIN,
  PLUME_TESTNET_CHAIN,
  SEI_TESTNET_CHAIN,
} from "./chains";

// Simple Account implementation addresses for different chains
// These are the contract addresses that will be authorized via EIP-7702
// Note: Arc Testnet (5042002) uses conditional gas sponsorship:
// - If Arc is source: only mint step (on destination) is sponsored
// - If Arc is destination: only approval/burn steps (on source) are sponsored
const SIMPLE_ACCOUNT_ADDRESS = "0xe6Cae83BdE06E4c305530e199D7217f42808555B";

// Build SIMPLE_ACCOUNT_ADDRESSES from chain configs (single source of truth)
const SIMPLE_ACCOUNT_ADDRESSES: Record<number, string> = {
  [ETHEREUM_SEPOLIA_CHAIN.chainId]: SIMPLE_ACCOUNT_ADDRESS,
  [BASE_SEPOLIA_CHAIN.chainId]: SIMPLE_ACCOUNT_ADDRESS,
  [ARBITRUM_SEPOLIA_CHAIN.chainId]: SIMPLE_ACCOUNT_ADDRESS,
  [OP_SEPOLIA_CHAIN.chainId]: SIMPLE_ACCOUNT_ADDRESS,
  [POLYGON_AMOY_CHAIN.chainId]: SIMPLE_ACCOUNT_ADDRESS,
  [POLYGON_AMOY_CHAIN.chainId]: SIMPLE_ACCOUNT_ADDRESS,
  [INK_TESTNET_CHAIN.chainId]: SIMPLE_ACCOUNT_ADDRESS,
  [AVALANCHE_FUJI_CHAIN.chainId]: SIMPLE_ACCOUNT_ADDRESS,
  [UNICHAIN_SEPOLIA_CHAIN.chainId]: SIMPLE_ACCOUNT_ADDRESS,
  [PLUME_TESTNET_CHAIN.chainId]: SIMPLE_ACCOUNT_ADDRESS,
  [SEI_TESTNET_CHAIN.chainId]: SIMPLE_ACCOUNT_ADDRESS,
  // Arc Testnet (5042002) is not listed here but supports conditional sponsorship
};

// Map ChainConfig to viem Chain using chain configs from chains.ts
function getViemChain(chainConfig: ChainConfig): Chain {
  // Use chain configs as single source of truth
  if (chainConfig.chainId === ETHEREUM_SEPOLIA_CHAIN.chainId) return sepolia;
  if (chainConfig.chainId === BASE_SEPOLIA_CHAIN.chainId) return baseSepolia;
  if (chainConfig.chainId === ARBITRUM_SEPOLIA_CHAIN.chainId)
    return arbitrumSepolia;
  if (chainConfig.chainId === OP_SEPOLIA_CHAIN.chainId) return optimismSepolia;
  if (chainConfig.chainId === POLYGON_AMOY_CHAIN.chainId) return polygonAmoy;
  if (chainConfig.chainId === INK_TESTNET_CHAIN.chainId) return inkSepolia;
  if (chainConfig.chainId === AVALANCHE_FUJI_CHAIN.chainId)
    return avalancheFuji;
  if (chainConfig.chainId === UNICHAIN_SEPOLIA_CHAIN.chainId)
    return unichainSepolia;
  if (chainConfig.chainId === PLUME_TESTNET_CHAIN.chainId) return plumeTestnet;
  if (chainConfig.chainId === SEI_TESTNET_CHAIN.chainId) return seiTestnet;

  // For unsupported chains, return sepolia as fallback
  return sepolia;
}

/**
 * Check if a chain supports EIP-7702 gas sponsorship
 */
export function isEIP7702Supported(chainId: number): boolean {
  return chainId in SIMPLE_ACCOUNT_ADDRESSES;
}

/**
 * Get the Simple Account implementation address for a chain
 */
export function getSimpleAccountAddress(chainId: number): string | null {
  return SIMPLE_ACCOUNT_ADDRESSES[chainId] || null;
}

/**
 * Create a Pimlico client for a given chain
 */
export function createPimlicoClientForChain(chainConfig: ChainConfig) {
  const pimlicoApiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
  if (!pimlicoApiKey) {
    throw new Error("NEXT_PUBLIC_PIMLICO_API_KEY is not set");
  }

  const viemChain = getViemChain(chainConfig);
  const pimlicoUrl = `https://api.pimlico.io/v2/${chainConfig.chainId}/rpc?apikey=${pimlicoApiKey}`;

  return createPimlicoClient({
    chain: viemChain,
    transport: http(pimlicoUrl),
  });
}

/**
 * Create a public client for a given chain
 */
export function createPublicClientForChain(
  chainConfig: ChainConfig
): PublicClient {
  const viemChain = getViemChain(chainConfig);
  return createPublicClient({
    chain: viemChain,
    transport: http(chainConfig.rpcUrl),
  });
}

/**
 * Create an EIP-7702 smart account client
 */
export async function createEIP7702SmartAccountClient(
  chainConfig: ChainConfig,
  walletClient: any, // viem WalletClient
  publicClient?: PublicClient
) {
  if (!isEIP7702Supported(chainConfig.chainId)) {
    throw new Error(`EIP-7702 is not supported on ${chainConfig.name}`);
  }

  const pimlicoApiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
  if (!pimlicoApiKey) {
    throw new Error("NEXT_PUBLIC_PIMLICO_API_KEY is not set");
  }

  const viemChain = getViemChain(chainConfig);
  const pimlicoUrl = `https://api.pimlico.io/v2/${chainConfig.chainId}/rpc?apikey=${pimlicoApiKey}`;

  // Create public client if not provided
  const client = publicClient || createPublicClientForChain(chainConfig);

  // Create Pimlico client
  const pimlicoClient = createPimlicoClient({
    chain: viemChain,
    transport: http(pimlicoUrl),
  });

  // Create 7702 simple smart account
  const simple7702Account = await to7702SimpleSmartAccount({
    client,
    owner: walletClient,
  });

  // Create the smart account client
  // Following the working implementation pattern from privyGaslessPayment.ts
  const smartAccountClient = createSmartAccountClient({
    client,
    chain: viemChain,
    account: simple7702Account,
    paymaster: pimlicoClient,
    bundlerTransport: http(pimlicoUrl),
    // Explicitly configure gas price estimation using Pimlico's API
    // This is critical - without this, maxPriorityFeePerGas will be 0
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      },
    },
  });

  return smartAccountClient;
}

/**
 * Get the sponsorship policy ID from environment variables
 */
export function getSponsorshipPolicyId(): string | undefined {
  return process.env.NEXT_PUBLIC_SPONSORSHIP_POLICY_ID;
}
