TrustFlow: Programmable Payments. Powered by Autonomous Agents.
🌟 Overview
TrustFlow is a cutting-edge decentralized escrow platform built on Base Sepolia that redefines conditional payments. It leverages immutable smart contracts and an intelligent autonomous agent to enable secure, transparent, and automated agreements between parties, eliminating the need for traditional intermediaries and the inherent trust issues they present. TrustFlow is not just an application; it's a new financial primitive designed for the decentralized future.

🎯 The Problem TrustFlow Solves
Centralized Trust & Intermediary Risk: Traditional escrow relies on a trusted third party, introducing a single point of failure, potential bias, and high fees. Many blockchain escrows still require manual multisig or manual intervention for fund release.

TrustFlow's Solution: We eliminate the need for a central intermediary. Funds are secured in immutable smart contracts, and fund release is governed by code and an autonomous agent, ensuring trustless execution.

Lack of Automation & Efficiency: Existing systems often involve manual verification of conditions (e.g., "was the task done?"), leading to delays, human error, and prolonged dispute periods.

TrustFlow's Solution: Our autonomous agent continuously monitors pre-defined off-chain conditions (like dates, task completions, GitHub PR merges, API responses, or custom events). When conditions are met, the agent automatically triggers on-chain settlement, ensuring swift and unbiased fund release.

Monetization & Scalability for Web3 Protocols: Building a sustainable Web3 business often struggles with a clear, low-friction monetization model.

TrustFlow's Solution: We've integrated x402pay directly into our protocol. A small, transparent fee (0.0005 ETH) is charged at the point of escrow creation, allowing TrustFlow to generate revenue from every new agreement. This completes the vital "money-in" loop, demonstrating a viable and scalable business model.

Complex UX & Limited Extensibility in dApps: Many dApps sacrifice user experience for functionality, and often provide a narrow scope of use.

TrustFlow's Solution: We deliver a beautiful, intuitive, and mobile-optimized UI/UX that makes complex blockchain interactions simple. Furthermore, our system is designed with composable primitives (diverse condition types) that lay the groundwork for building more complex financial patterns (like recurring payments, milestone-based grants, or dynamic bounties), making TrustFlow a platform for programmable payments.

✨ Core Features
🎨 UI/UX & Design
Aesthetic Appeal: Beautiful cream background (#EEEFE1), custom fonts (Tilt Warp for logo, Doppio One for interface), TrustFlow logo with olympic-blue (#66ADFF).

Professional Layout: Centered logo, split wallet display, custom button styling with drop shadows and hover effects.

Consistency: Consistent black borders (2px-3px) and rounded corners throughout.

Responsiveness: Fully responsive design, perfect on mobile and desktop.

🌐 Wallet Connection System
Seamless Integration: Beautiful modal popup for wallet selection.

Coinbase Wallet Focused: Robust support for Coinbase Smart Wallet (CDP Wallet), including mobile-optimized connection and deep linking.

User Experience: Wallet address display (formatted as 0x1234...5678), connect/disconnect functionality, advanced error handling with user-friendly messages, "I Don't have a wallet" educational link.

⚡ Core Functionality: Agreement Creation
Comprehensive Form: Payer address (auto-filled), payee address input with validation, amount in ETH with decimal support, rich text agreement description.

Dynamic Condition Types:

Specific Date: Fund release on a chosen date (with date picker).

Task Completion (Simulated): Release on custom task names.

GitHub PR Merged (Simulated): Release upon a specific GitHub PR URL being merged.

External API Call Success (Simulated): Release when an external API returns an expected value.

Custom Event Trigger (Simulated): Release on a custom event name.

Real-time Fee Calculation: Displays escrow amount + 0.0005 ETH x402pay creation fee.

Robust Validation: Form validation with helpful error messages.

🔗 Blockchain Integration
Base Sepolia Testnet: Fully configured for the Base Sepolia network.

Smart Contract Integration: Utilizes a custom EscrowFactory to deploy individual Escrow contracts.

Network Handling: Automatic network detection and switching prompts.

Transaction Management: Comprehensive error parsing, gas fee estimation, insufficient funds detection, transaction confirmation tracking.

💾 Database & Data Management
Firebase Firestore: Integration for off-chain metadata storage.

Real-time Sync: Agreement data stored before blockchain submission, transaction hash updating post-submission, real-time data synchronization.

Dual Data Sources: Combines Firebase metadata with live blockchain contract states for comprehensive, real-time data.

📊 Dashboard & Monitoring
Statistics Overview: Beautiful cards for Total Agreements, On-Chain Contracts, and Total Volume in ETH.

Personalized View: Filters to show only your agreements.

Agreement Status Tracking: Color-coded chips for Pending, Funded, Settled, Disputed.

Detailed View: Condition type display, agreement history with all past agreements.

Responsive Layout: Beautiful, responsive card layout.

🔧 Technical Excellence
Performance: Optimized rendering with React memoization, debounced input handling, loading states with spinners.

Security & Validation: Rigorous address, amount, and network validation. Robust transaction validation and error parsing.

Developer Experience: TypeScript throughout, comprehensive error logging, modular component architecture, clean code.

Mobile-First Design: Touch-friendly interface, mobile wallet detection, responsive breakpoints.

💡 Key Innovations & Differentiation
x402pay Integration: Directly monetizes the protocol by charging a small, transparent fee at both agreement creation and settlement, ensuring a sustainable business model.

Coinbase Smart Wallet (CDP Wallet) First: Built to natively support and highlight the advanced capabilities of Coinbase Smart Wallets (Account Abstraction), offering a modern and streamlined user experience.

Autonomous Agent Driven: The core intelligence that monitors diverse off-chain conditions and automatically triggers on-chain settlements, reducing manual intervention and ensuring trustless execution.

Composable Financial Primitives: The design of distinct condition types allows for the flexible creation of various financial patterns (e.g., milestone payments, subscriptions, bounties).

🛠️ Technical Stack
Frontend: Next.js 15, React 18, TypeScript, Tailwind CSS, Material-UI, Wagmi.

Smart Contracts: Solidity, Hardhat.

Blockchain: Base Sepolia Testnet.

Database: Firebase Firestore.

Agent: Node.js (for autonomous monitoring and execution).

🚀 Getting Started (Local Development)
Prerequisites
Node.js (v18+)

npm (v8+) or yarn

Git

A Coinbase Wallet (browser extension and/or mobile app)

Setup Instructions
Clone the Repository:

git clone [YOUR_REPO_URL_HERE]
cd TrustFlow

Install Dependencies:

# For smart contracts
cd contracts
npm install

# For agent
cd ../agent
npm install

# For frontend
cd ../frontend
npm install

Environment Variables:
Create .env files in contracts/ and agent/, and an .env.local file in frontend/.

contracts/.env:

# Base Sepolia RPC URL (get from Alchemy, Infura, etc.)
BASE_SEPOLIA_RPC_URL="YOUR_BASE_SEPOLIA_RPC_URL"
# Private key of the wallet that will deploy contracts and act as the agent.
# MUST be the private key of your Coinbase Wallet-derived agent address (e.g., from 0xff85...d1B).
PRIVATE_KEY="YOUR_COINBASE_WALLET_DERIVED_AGENT_PRIVATE_KEY"
# Address of the authorized agent (same as above private key's public address)
AUTHORIZED_AGENT_ADDRESS="0xff85A11F295122296B4DcB4D3E8F5da6b8c40d1B"
# Address to collect x402pay fees (e.g., your own wallet address or a dedicated address)
X402PAY_FEE_ADDRESS="0xfB470D35B311C15CFdc3142318eEaB2016c90914"
# Etherscan API Key for contract verification (optional)
ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY"

agent/.env.local:

# Firebase project credentials
FIREBASE_PRIVATE_KEY_ID="YOUR_FIREBASE_PRIVATE_KEY_ID"
FIREBASE_PRIVATE_KEY="YOUR_FIREBASE_PRIVATE_KEY" # Replace \n with actual newlines
FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
FIREBASE_CLIENT_EMAIL="YOUR_FIREBASE_CLIENT_EMAIL"

# Base Sepolia RPC URL (same as contracts/.env)
BASE_SEPOLIA_RPC_URL="YOUR_BASE_SEPOLIA_RPC_URL"
# Private key of the autonomous agent's wallet (MUST be the Coinbase Wallet-derived one)
AGENT_PRIVATE_KEY="YOUR_COINBASE_WALLET_DERIVED_AGENT_PRIVATE_KEY"
# The deployed EscrowFactory contract address (updated after deployment)
ESCROW_FACTORY_ADDRESS="0xe5AA99067EECAA08b4B7A6B6DF3B4DfC95819234"

frontend/.env.local:

NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_WEB_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"

Deploy Smart Contracts (If not already deployed by an agent):

Important: This step requires testnet ETH in the wallet corresponding to the PRIVATE_KEY in contracts/.env.

Navigate to the contracts/ directory.

Run the deployment script:

npx hardhat run scripts/deploy.js --network baseSepolia

SAVE THE DEPLOYED EscrowFactory ADDRESS! You will need to update ESCROW_FACTORY_ADDRESS in agent/.env.local and frontend/src/config/contracts.ts with this new address.

Update Frontend & Agent with New Factory Address:

After deployment, manually update the ESCROW_FACTORY_ADDRESS in:

agent/.env.local

frontend/src/config/contracts.ts (find ESCROW_FACTORY_ADDRESS)

Clean Frontend Cache:

cd frontend
rm -rf .next

How to Run the App
Start the Frontend:

cd frontend
npm run dev
# Access the app at http://localhost:3000

Start the Autonomous Agent:

Open a new terminal window.

  cd agent
  npm start

(Keep this terminal running in the background to monitor agreement settlements)

How to Use TrustFlow
Getting Testnet ETH for Your Coinbase Smart Wallet
Your TrustFlow app is designed to connect with your Coinbase Smart Wallet (CDP Wallet). This wallet type often generates a unique address per dApp (e.g., 0x2841D2953b5d165D18Ba09baa003719B2Fdfa2e1 for your account). You need to fund this specific address from a faucet.

Copy Your Smart Wallet Address: When you connect your Coinbase Wallet to http://localhost:3000, the address displayed in the UI will be your Smart Wallet address (e.g., 0x2841...a2e1). Copy this address.

Go to a Faucet:

Chainlink Faucet: https://faucets.chain.link/

QuickNode Faucet: https://faucet.quicknode.com/base/sepolia

Request ETH: Select "Base Sepolia" and paste your Smart Wallet address (0x2841...a2e1) into the address field. Request ETH.

Creating and Settling an Agreement
Connect Wallet: Go to http://localhost:3000 and click "Connect Wallet." Select Coinbase Wallet. Confirm connection and that your Smart Wallet balance is displayed.

Create Agreement:

Navigate to the "Create Agreement" section.

Fill in the Payee Address (any test address you control, or even your x402pay fee collector address for testing).

Enter an Amount (e.g., 0.01 ETH).

Choose a Condition Type (e.g., "Specific Date" for easy testing, set a date/time a few minutes in the future).

Add a Description.

Observe: Note that the total amount to be sent includes the escrow amount plus the 0.0005 ETH x402pay creation fee.

Submit the transaction and confirm in your Coinbase Wallet.

Verify Creation Fee on BaseScan: Copy the transaction hash from your wallet. Go to BaseScan Sepolia and search for the transaction. Confirm that 0.0005 ETH was sent from your wallet to the x402pay fee address (0xfB470D35B311C15CFdc3142318eEaB2016c90914).

Monitor Dashboard: Your new agreement will appear in the "Active Agreements" dashboard.

Autonomous Settlement: Wait for the condition to be met (e.g., specific date passes). Observe your agent's terminal logs as it detects the condition and initiates the settlement transaction.

Verify Settlement Fee on BaseScan: Find the agent's settlement transaction on BaseScan Sepolia. Confirm that 0.001 ETH was sent from the Escrow contract to the x402pay fee address (0xfB470D35B311C15CFdc3142318eEaB2016c90914). The remaining escrow amount goes to the payee.


🔗 Useful Links
BaseScan Sepolia Testnet: https://sepolia.basescan.org/
Faucet (Base Sepolia): [https://faucets.chain.link/](https://portal.cdp.coinbase.com/products/faucet?projectId=29fd9707-d49f-4dc1-8a79-7818bd26ee66)

