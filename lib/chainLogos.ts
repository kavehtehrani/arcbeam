import chainLogosMapping from "@/public/logos/chain-logos-mapping.json";

/**
 * Get the logo path for a chain name
 * @param chainName - The name of the chain (e.g., "Ethereum Sepolia", "Arc Testnet")
 * @returns The path to the logo SVG file, or null if not found
 */
export function getChainLogoPath(chainName: string): string | null {
  const chainInfo = chainLogosMapping[chainName as keyof typeof chainLogosMapping];
  return chainInfo?.path || null;
}

/**
 * Get the logo filename for a chain name
 * @param chainName - The name of the chain
 * @returns The filename of the logo SVG, or null if not found
 */
export function getChainLogoFilename(chainName: string): string | null {
  const chainInfo = chainLogosMapping[chainName as keyof typeof chainLogosMapping];
  return chainInfo?.filename || null;
}

