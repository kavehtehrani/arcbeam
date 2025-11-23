// Chain logo mapping - matches the structure in public/logos/chain-logos-mapping.json
const chainLogosMapping: Record<
  string,
  { filename: string; icon_id: string; path: string }
> = {
  "Arc Testnet": {
    filename: "arc-testnet.svg",
    icon_id: "icon-blockchain/arc",
    path: "/logos/arc-testnet.svg",
  },
  Sepolia: {
    filename: "ethereum-sepolia.svg",
    icon_id: "icon-eth",
    path: "/logos/ethereum-sepolia.svg",
  },
  "Base Sepolia": {
    filename: "base-sepolia.svg",
    icon_id: "icon-base",
    path: "/logos/base-sepolia.svg",
  },
  "Arbitrum Sepolia": {
    filename: "arbitrum-sepolia.svg",
    icon_id: "icon-arb",
    path: "/logos/arbitrum-sepolia.svg",
  },
  "OP Sepolia": {
    filename: "op-sepolia.svg",
    icon_id: "icon-op",
    path: "/logos/op-sepolia.svg",
  },
  "Polygon Amoy": {
    filename: "polygon-pos-amoy.svg",
    icon_id: "icon-poly",
    path: "/logos/polygon-pos-amoy.svg",
  },
  "Polygon PoS Amoy": {
    filename: "polygon-pos-amoy.svg",
    icon_id: "icon-poly",
    path: "/logos/polygon-pos-amoy.svg",
  },
  "Ink Sepolia": {
    filename: "ink-sepolia.svg",
    icon_id: "icon-ink",
    path: "/logos/ink-sepolia.svg",
  },
};

/**
 * Get the logo path for a chain name
 * @param chainName - The name of the chain (e.g., "Sepolia", "Arc Testnet")
 * @returns The path to the logo SVG file, or null if not found
 */
export function getChainLogoPath(chainName: string): string | null {
  const chainInfo = chainLogosMapping[chainName];
  return chainInfo?.path || null;
}

/**
 * Get the logo filename for a chain name
 * @param chainName - The name of the chain
 * @returns The filename of the logo SVG, or null if not found
 */
export function getChainLogoFilename(chainName: string): string | null {
  const chainInfo = chainLogosMapping[chainName];
  return chainInfo?.filename || null;
}
