# ArcBeam

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?logo=tailwind-css)
![Privy](https://img.shields.io/badge/Privy-3.7-6366f1)
![Circle Bridge Kit](https://img.shields.io/badge/Circle_Bridge_Kit-1.1-000000?logo=circle)
![viem](https://img.shields.io/badge/viem-2.39-6366f1)
![wagmi](https://img.shields.io/badge/wagmi-2.19-6366f1)
![EIP-7702](https://img.shields.io/badge/EIP--7702-Enabled-ff6b6b)

<img src="public/logo.png" alt="ArcBeam Logo" width="250" />

**Send USDC to anyone, anywhere. No native token needed!**

ArcBeam is a cross-chain USDC payment application that enables seamless transfers of USDC between multiple blockchain networks without requiring users to hold native tokens for gas fees. ArcBeam leverages Circle's Bridge Kit, Privy's embedded wallet with gas sponsorship, and EIP-7702 authorization to deliver a frictionless cross-chain payment experience where no native token is needed. USDC is all you'll need!

![screenshot-send](public/screenshots/screenshot-send.png)
![screenshot-receive](public/screenshots/screenshot-receive-qr.png)

## Features

- **Gasless Cross-Chain Transfers**: Bridge USDC across chains without holding native tokens, powered by Privy + Pimlico gas sponsorship
- **Multi-Chain Support**: Transfer USDC between Arc Testnet, Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia, Optimism Sepolia, Polygon Amoy, Ink Testnet, and more
- **Embedded Wallet**: Automatic wallet creation via Privy with no popups or external wallet requirements
- **EIP-7702 Support**: Advanced transaction authorization for enhanced gasless operations
- **Payment Requests**: Generate shareable payment links and QR codes for receiving USDC on any supported chain
- **Unified Balance View**: View your USDC balances across all supported chains in one place
- **Real-Time Bridge Progress**: Track your cross-chain transfers with detailed step-by-step progress indicators

## How It Works

ArcBeam uses Circle's [Cross-Chain Transfer Protocol (CCTP)](https://developers.circle.com/cctp#fast-and-secure-crosschain-rebalancing) via the Bridge Kit to enable secure USDC transfers:

1. **User initiates transfer**: Select amount, source chain, and destination chain
2. **Gasless approval**: Privy sponsors the gas for token approval (if needed)
3. **Bridge execution**: USDC is burned on the source chain via Circle's TokenMessenger
4. **Cross-chain mint**: Circle's infrastructure mints USDC on the destination chain
5. **Completion**: Recipient receives USDC on their chosen chain

The entire process is gasless for users thanks to Privy's embedded wallet and gas sponsorship system, making it accessible even for users new to Web3. As long you can login using familiar Web2 interfaces into Privy, you're sorted out to send and receive USDC.

## Tech Stack

- **Frontend**: Next.js 16, Tailwind CSS
- **Wallet & Auth**: Privy (embedded wallet, gas sponsorship)
- **Blockchain**: viem, wagmi, ethers.js
- **Bridge Protocol**: Circle Bridge Kit (CCTP)

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key
NEXT_PUBLIC_SPONSORSHIP_POLICY_ID=your_pimlico_sponsorship_policy_id
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supported Chains

- Arc Testnet
- Ethereum Sepolia
- Base Sepolia
- Arbitrum Sepolia
- Optimism Sepolia
- Polygon Amoy
- Ink Testnet

More chains can be added as long as they're supported by [CCTP](https://developers.circle.com/cctp/cctp-supported-blockchains).

## Learn More

- [Circle Bridge Kit](https://developers.circle.com/bridge-kit)
- [Privy Documentation](https://docs.privy.io)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
- [CCTP Supported Chains](https://developers.circle.com/cctp/cctp-supported-blockchains)

## ETHGlobal Submission Description

ArcBeam is a cross-chain USDC payment app that solves the biggest friction point in multi-chain payments: needing native tokens for gas. I built it using Circle's Bridge Kit for secure USDC transfers via CCTP, Privy's embedded wallet system for seamless onboarding, and Pimlico's gas sponsorship so users never need ETH, MATIC, or any other native token. The whole flow is gasless - you just need USDC.

Here's what makes it work: when you want to send USDC from Arc to Base (or any supported chain), the app handles everything. Privy creates an embedded wallet automatically (no MetaMask popups), sponsors the gas for token approvals and bridge transactions through Pimlico, and Circle's CCTP protocol burns USDC on the source chain and mints it on the destination. I also integrated EIP-7702 authorization for more advanced gasless operations.

Beyond basic bridging, I added payment requests - you can generate shareable links or QR codes to request USDC on any chain. There's a unified balance viewer to see your USDC across all chains, and real-time progress tracking so you know exactly what's happening during each bridge step. The goal is making cross-chain payments as simple as sending a Venmo request - no crypto knowledge required, just login and go.

## Technical Implementation

The stack is Next.js 16 with TypeScript on the frontend, using Privy for embedded wallet creation and authentication. Circle's Bridge Kit handles the actual CCTP bridging logic - it's a clean abstraction over their TokenMessenger contracts that burn USDC on source chains and mint on destinations. The tricky part was making everything gasless.

Here's how I wired it together: Privy provides an EIP-1193 provider from their embedded wallet, which I wrap with custom transaction wrappers. The EIP-7702 wrapper intercepts `eth_sendTransaction` calls and detects transaction types by function selectors (0x095ea7b3 for approvals, 0xd0d4229a for burns, etc.). When gas sponsorship is enabled, it converts these regular transactions into EIP-7702 UserOperations by signing an authorization for a Simple Account contract, then routing through Pimlico's paymaster with sponsorship policies.

The hackiest part is the provider wrapping chain. Circle Bridge Kit expects a standard EIP-1193 provider, but I needed to inject gas sponsorship transparently. So I created two wrapper layers: `PrivyTransactionWrapper` for basic Privy gas sponsorship, and `EIP7702TransactionWrapper` that sits on top and converts transactions to UserOperations when EIP-7702 is supported. The wrapper caches smart account clients per chain to avoid recreating them, and handles conditional sponsorship logic for Arc Testnet (only sponsors mint when Arc is source, only sponsors approval/burn when Arc is destination).

For the bridge flow itself, I use viem and wagmi for chain interactions, with ethers.js for contract calls since Circle's Bridge Kit uses ethers internally. The Bridge Kit's adapter system needed custom configuration for Arc Testnet's RPC, so I built a custom `getPublicClient` function that handles Arc's specific chain config. Payment requests use URL parameters to encode recipient, chain, and amount, with QR code generation via qrcode.react. Balance fetching happens in parallel across all chains using Promise.all, with error handling that gracefully degrades if a chain is unavailable.

Partner tech benefits: Privy's embedded wallet means zero wallet setup friction - users just login with email/social. Pimlico's sponsorship policies let me sponsor gas without managing paymaster contracts. Circle's Bridge Kit abstracts away all the CCTP complexity (attestation waiting, message passing) into a simple bridge() call. EIP-7702 is the secret sauce - it lets me turn regular EOAs into smart accounts temporarily via authorization signatures, so I can use account abstraction features without deploying contracts.

## License

This project was hacked as part of ETHGlobal Buenos Aires 2025 hackathon.
