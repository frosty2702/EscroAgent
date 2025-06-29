**TrustFlow: Programmable Payments. Powered by Autonomous Agents.**


🌟**Overview**
TrustFlow is a decentralized escrow platform on Base Sepolia that redefines conditional payments. It uses immutable smart contracts and an intelligent autonomous agent to enable secure, transparent, and automated agreements, eliminating intermediaries. It's a new financial primitive for the decentralized future.

💡 **The Problem TrustFlow Solves:**
Traditional escrows are slow, expensive, and require trusting a middleman. Existing Web3 solutions often lack true automation and sustainable monetization.

TrustFlow's Solution: We provide trustless, automated conditional payments where funds are locked in smart contracts and released by an autonomous agent based on predefined conditions. We integrate x402pay for sustainable, in-protocol monetization (fees at creation and settlement) and leverage the Coinbase Smart Wallet for a seamless, cutting-edge user experience.

✨ **Core Features:**
Autonomous Agent: 24/7 monitoring and automatic settlement of agreements.

Dynamic Conditions: Supports date, simulated task completion, GitHub PR merge, external API success, and custom event triggers.

x402pay Integration: Transparent 0.0005 ETH creation fee and 0.001 ETH settlement fee for protocol sustainability.

Coinbase Smart Wallet (CDP Wallet) First: Native integration for Account Abstraction, offering enhanced UX.

Real-time Dashboard: Intuitive UI for tracking all agreements.

Blockchain Integration: Built on Base Sepolia for secure, transparent transactions.

Firebase Firestore: Real-time data synchronization for off-chain metadata.

🛠️ **Technical Stack**
Frontend: Next.js, React, TypeScript, Tailwind CSS, Wagmi.

Smart Contracts: Solidity, Hardhat (on Base Sepolia).

Database: Firebase Firestore.

Agent: Node.js.

🗺️ **System Architecture**
TrustFlow seamlessly integrates on-chain and off-chain components. The user interacts with the Frontend, which connects to the Coinbase Smart Wallet. Transactions go through the Base Sepolia Blockchain via EscrowFactory and individual Escrow Contracts. The Autonomous Agent monitors the blockchain and Firebase Firestore (for metadata) to automatically trigger settlements. x402pay fees are collected at key points by a Fee Collector.


🚀 **Getting Started (Local Development)**
Prerequisites
Node.js (v18+), npm/yarn, Git.

A Web3 Wallet (Coinbase Wallet browser extension) with Base Sepolia ETH.

A Firebase Project with Firestore.

Setup Instructions
Clone Repo: git clone [REPO_URL_HERE] then cd TrustFlow.

Install Dependencies: Run npm install in contracts/, agent/, and frontend/ directories.

Environment Variables: Create .env.local files (see full guide for details) for contracts/, agent/, and frontend/ with your private keys, RPC URLs, Firebase config, and deployed addresses. DO NOT COMMIT THESE!

Deploy Contracts: From contracts/, run npx hardhat compile then npx hardhat run scripts/deploy.js --network baseSepolia. Save the deployed EscrowFactory address.

Configure Firebase: Update Firestore Security Rules in Firebase Console (see full guide for rules).

Run Frontend: From frontend/, npm run dev (Access at http://localhost:3000).

Run Agent: From agent/, npm start (Keeps agent running in background).

✍️ **How to Use TrustFlow**
Fund Your Coinbase Smart Wallet: Get Base Sepolia ETH from faucets (e.g., Chainlink, QuickNode) to your dApp-specific Coinbase Smart Wallet address (shown in UI after connecting).

Create Agreement: Connect wallet, fill form (Payee, Amount, Condition), and confirm transaction. Observe the x402pay creation fee (0.0005 ETH) in your wallet.

Autonomous Settlement: The agent will automatically settle the agreement when conditions are met.

Verify Fees: Check BaseScan for the x402pay creation (0.0005 ETH) and settlement (0.001 ETH) fees.



🔗 **Useful Links**
Faucet Testnet: https://portal.cdp.coinbase.com/products/faucet?projectId=29fd9707-d49f-4dc1-8a79-7818bd26ee66
