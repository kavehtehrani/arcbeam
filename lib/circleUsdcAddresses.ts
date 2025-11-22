/**
 * Circle USDC Contract Addresses
 * Source: https://developers.circle.com/stablecoins/usdc-contract-addresses
 *
 * This file contains all USDC contract addresses for both mainnet and testnet chains
 * supported by Circle. Addresses are defined once and referenced everywhere.
 */

// ============================================================================
// ADDRESS CONSTANTS - Define each address once
// ============================================================================

// Mainnet addresses
const USDC_ETHEREUM_MAINNET = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_ARBITRUM_MAINNET = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const USDC_AVALANCHE_MAINNET = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_CODEX_MAINNET = "0xd996633a415985DBd7D6D12f4A4343E31f5037cf";
const USDC_CELO_MAINNET = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
const USDC_HYPEREVM_MAINNET = "0xb88339CB7199b77E23DB6E890353E22632Ba630f";
const USDC_INK_MAINNET = "0x2D270e6886d130D724215A266106e6832161EAEd";
const USDC_LINEA_MAINNET = "0x176211869cA2b568f2A7D4EE941E073a821EE1ff";
const USDC_OP_MAINNET = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
const USDC_PLUME_MAINNET = "0x222365EF19F7947e5484218551B56bb3965Aa7aF";
const USDC_POLYGON_MAINNET = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
const USDC_SEI_MAINNET = "0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392";
const USDC_SONIC_MAINNET = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894";

// Testnet addresses
const USDC_ARBITRUM_SEPOLIA = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
const USDC_AVALANCHE_FUJI = "0x5425890298aed601595a70AB815c96711a31Bc65";
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_CELO_SEPOLIA = "0x01C5C0122039549AD1493B8220cABEdD739BC44E";
const USDC_CODEX_TESTNET = "0x6d7f141b6819C2c9CC2f818e6ad549E7Ca090F8f";
const USDC_ETHEREUM_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const USDC_HYPEREVM_TESTNET = "0x2B3370eE501B4a559b57D449569354196457D8Ab";
const USDC_INK_TESTNET = "0xFabab97dCE620294D2B0b0e46C68964e326300Ac";
const USDC_LINEA_SEPOLIA = "0xFEce4462D57bD51A6A552365A011b95f0E16d9B7";
const USDC_MONAD_TESTNET = "0x534b2f3A21130d7a60830c2Df862319e593943A3";
const USDC_OP_SEPOLIA = "0x5fd84259d66Cd46123540766Be93DFE6D43130D7";
const USDC_PLUME_TESTNET = "0xcB5f30e335672893c7eb944B374c196392C19D18";
const USDC_POLYGON_AMOY = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
const USDC_SEI_TESTNET = "0x4fCF1784B31630811181f670Aea7A7bEF803eaED";
const USDC_SONIC_TESTNET = "0x0BA304580ee7c9a980CF72e55f5Ed2E9fd30Bc51";
const USDC_SONIC_BLAZE_TESTNET = "0xA4879Fed32Ecbef99399e5cbC247E533421C4eC6";
const USDC_UNICHAIN_SEPOLIA = "0x31d0220469e10c4E71834a79b1f276d740d3768F";
const USDC_WORLD_CHAIN_SEPOLIA = "0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88";
const USDC_XDC_APOTHEM = "0xb5AB69F7bBada22B28e79C8FFAECe55eF1c771D4";
const USDC_ZKSYNC_ERA_TESTNET = "0xAe045DE5638162fa134807Cb558E15A3F5A7F853";
const USDC_ARC_TESTNET = "0x3600000000000000000000000000000000000000"; // Arc-specific, not in Circle docs

// Non-EVM addresses (kept as strings for reference)
const USDC_ALGORAND_MAINNET = "31566704";
const USDC_APTOS_MAINNET =
  "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b";
const USDC_HEDERA_MAINNET = "0.0.456858";
const USDC_HEDERA_TESTNET = "0.0.429274";
const USDC_NEAR_MAINNET =
  "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1";
const USDC_NEAR_TESTNET =
  "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af";
const USDC_NOBLE_MAINNET = "uusdc";
const USDC_NOBLE_TESTNET = "uusdc";
const USDC_POLKADOT_MAINNET = "1337";
const USDC_POLKADOT_WESTMINT = "Asset ID 31337";
const USDC_SOLANA_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_SOLANA_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_STELLAR_MAINNET =
  "USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const USDC_STELLAR_TESTNET =
  "USDC-GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const USDC_SUI_MAINNET =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
const USDC_SUI_TESTNET =
  "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC";
const USDC_STARKNET_SEPOLIA =
  "0x0512feAc6339Ff7889822cb5aA2a86C848e9D392bB0E3E237C008674feeD8343";
const USDC_XRPL_TESTNET =
  "5553444300000000000000000000000000000000.rHuGNhqTG32mfmAvWA8hUyWRLV3tCSwKQt";

export interface UsdcAddressConfig {
  mainnet?: string;
  testnet?: string;
}

/**
 * USDC addresses for all Circle-supported chains
 * Organized by chain name for easy lookup
 * All addresses reference the constants defined above
 */
export const CIRCLE_USDC_ADDRESSES: Record<string, UsdcAddressConfig> = {
  // Mainnet addresses
  Algorand: {
    mainnet: USDC_ALGORAND_MAINNET,
  },
  Aptos: {
    mainnet: USDC_APTOS_MAINNET,
  },
  Arbitrum: {
    mainnet: USDC_ARBITRUM_MAINNET,
  },
  "Avalanche C-Chain": {
    mainnet: USDC_AVALANCHE_MAINNET,
  },
  Base: {
    mainnet: USDC_BASE_MAINNET,
  },
  Codex: {
    mainnet: USDC_CODEX_MAINNET,
  },
  Celo: {
    mainnet: USDC_CELO_MAINNET,
  },
  Ethereum: {
    mainnet: USDC_ETHEREUM_MAINNET,
  },
  Hedera: {
    mainnet: USDC_HEDERA_MAINNET,
  },
  HyperEVM: {
    mainnet: USDC_HYPEREVM_MAINNET,
  },
  Ink: {
    mainnet: USDC_INK_MAINNET,
  },
  Linea: {
    mainnet: USDC_LINEA_MAINNET,
  },
  NEAR: {
    mainnet: USDC_NEAR_MAINNET,
  },
  Noble: {
    mainnet: USDC_NOBLE_MAINNET,
  },
  "OP Mainnet": {
    mainnet: USDC_OP_MAINNET,
  },
  Plume: {
    mainnet: USDC_PLUME_MAINNET,
  },
  "Polkadot Asset Hub": {
    mainnet: USDC_POLKADOT_MAINNET,
  },
  "Polygon PoS": {
    mainnet: USDC_POLYGON_MAINNET,
  },
  Sei: {
    mainnet: USDC_SEI_MAINNET,
  },
  Solana: {
    mainnet: USDC_SOLANA_MAINNET,
  },
  Sonic: {
    mainnet: USDC_SONIC_MAINNET,
  },
  Stellar: {
    mainnet: USDC_STELLAR_MAINNET,
  },
  Sui: {
    mainnet: USDC_SUI_MAINNET,
  },
  Unichain: {
    mainnet: "0x...", // Address truncated in Circle docs, placeholder
  },
  "World Chain": {
    mainnet: "0x...", // Not listed in mainnet table, placeholder
  },
  XDC: {
    mainnet: "0x...", // Not listed in mainnet table, placeholder
  },
  "ZKsync Era": {
    mainnet: "0x...", // Not listed in mainnet table, placeholder
  },

  // Testnet addresses
  "Arbitrum Sepolia": {
    testnet: USDC_ARBITRUM_SEPOLIA,
  },
  "Avalanche Fuji": {
    testnet: USDC_AVALANCHE_FUJI,
  },
  "Base Sepolia": {
    testnet: USDC_BASE_SEPOLIA,
  },
  "Celo Sepolia": {
    testnet: USDC_CELO_SEPOLIA,
  },
  "Codex Testnet": {
    testnet: USDC_CODEX_TESTNET,
  },
  "Ethereum Sepolia": {
    testnet: USDC_ETHEREUM_SEPOLIA,
  },
  "Hedera Testnet": {
    testnet: USDC_HEDERA_TESTNET,
  },
  "HyperEVM Testnet": {
    testnet: USDC_HYPEREVM_TESTNET,
  },
  "Ink Testnet": {
    testnet: USDC_INK_TESTNET,
  },
  "Linea Sepolia": {
    testnet: USDC_LINEA_SEPOLIA,
  },
  "Monad Testnet": {
    testnet: USDC_MONAD_TESTNET,
  },
  "NEAR Testnet": {
    testnet: USDC_NEAR_TESTNET,
  },
  "Noble Testnet": {
    testnet: USDC_NOBLE_TESTNET,
  },
  "OP Sepolia": {
    testnet: USDC_OP_SEPOLIA,
  },
  "Plume Testnet": {
    testnet: USDC_PLUME_TESTNET,
  },
  "Polkadot Westmint": {
    testnet: USDC_POLKADOT_WESTMINT,
  },
  "Polygon PoS Amoy": {
    testnet: USDC_POLYGON_AMOY,
  },
  "Sei Testnet": {
    testnet: USDC_SEI_TESTNET,
  },
  "Solana Devnet": {
    testnet: USDC_SOLANA_DEVNET,
  },
  "Sonic Testnet": {
    testnet: USDC_SONIC_TESTNET,
  },
  "Sonic Blaze Testnet": {
    testnet: USDC_SONIC_BLAZE_TESTNET,
  },
  "Starknet Sepolia": {
    testnet: USDC_STARKNET_SEPOLIA,
  },
  "Stellar Testnet": {
    testnet: USDC_STELLAR_TESTNET,
  },
  "Sui Testnet": {
    testnet: USDC_SUI_TESTNET,
  },
  "Unichain Sepolia": {
    testnet: USDC_UNICHAIN_SEPOLIA,
  },
  "World Chain Sepolia": {
    testnet: USDC_WORLD_CHAIN_SEPOLIA,
  },
  "XDC Apothem": {
    testnet: USDC_XDC_APOTHEM,
  },
  "XRPL Testnet": {
    testnet: USDC_XRPL_TESTNET,
  },
  "ZKsync Era Testnet": {
    testnet: USDC_ZKSYNC_ERA_TESTNET,
  },
  "Arc Testnet": {
    testnet: USDC_ARC_TESTNET, // Arc-specific, not in Circle docs
  },
};

/**
 * Get USDC address for a chain by name and network type
 * @param chainName - Name of the chain (e.g., "Ethereum Sepolia", "Base Sepolia")
 * @param isTestnet - Whether to get testnet or mainnet address
 * @returns USDC contract address or undefined if not found
 */
export function getCircleUsdcAddress(
  chainName: string,
  isTestnet: boolean = true
): string | undefined {
  const config = CIRCLE_USDC_ADDRESSES[chainName];
  if (!config) return undefined;

  return isTestnet ? config.testnet : config.mainnet;
}

/**
 * Get USDC address by chain ID (for EVM chains)
 * Maps common chain IDs to their USDC addresses
 */
export const CHAIN_ID_TO_USDC_ADDRESS: Record<number, string> = {
  // Mainnet
  1: USDC_ETHEREUM_MAINNET, // Ethereum
  42161: USDC_ARBITRUM_MAINNET, // Arbitrum
  43114: USDC_AVALANCHE_MAINNET, // Avalanche C-Chain
  8453: USDC_BASE_MAINNET, // Base
  59144: USDC_LINEA_MAINNET, // Linea
  10: USDC_OP_MAINNET, // OP Mainnet
  137: USDC_POLYGON_MAINNET, // Polygon PoS
  1329: USDC_SEI_MAINNET, // Sei
  146: USDC_SONIC_MAINNET, // Sonic
  // Testnet
  11155111: USDC_ETHEREUM_SEPOLIA, // Ethereum Sepolia
  421614: USDC_ARBITRUM_SEPOLIA, // Arbitrum Sepolia
  43113: USDC_AVALANCHE_FUJI, // Avalanche Fuji
  84532: USDC_BASE_SEPOLIA, // Base Sepolia
  59141: USDC_LINEA_SEPOLIA, // Linea Sepolia
  11155420: USDC_OP_SEPOLIA, // OP Sepolia
  80002: USDC_POLYGON_AMOY, // Polygon PoS Amoy
  1328: USDC_SEI_TESTNET, // Sei Testnet
  10143: USDC_MONAD_TESTNET, // Monad Testnet
  1301: USDC_UNICHAIN_SEPOLIA, // Unichain Sepolia
  98867: USDC_PLUME_TESTNET, // Plume Testnet
  5042002: USDC_ARC_TESTNET, // Arc Testnet (not in Circle docs)
};

/**
 * Get USDC address by chain ID
 * @param chainId - Chain ID number
 * @returns USDC contract address or undefined if not found
 */
export function getUsdcAddressByChainId(chainId: number): string | undefined {
  return CHAIN_ID_TO_USDC_ADDRESS[chainId];
}
