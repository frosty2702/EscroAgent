require('dotenv').config();

const config = {
  // Agent Configuration - Using your Smart Wallet address for monitoring
  agentPrivateKey: process.env.AGENT_PRIVATE_KEY || '1ba4f06131a9fafe420eb48252589de2382128222056c4ec14d46d6013867750',
  baseSepolia: {
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    chainId: 84532
  },
  
  // Contract Addresses - Updated to use your wallets
  contracts: {
    escrowFactory: process.env.ESCROW_FACTORY_ADDRESS || '0x77925a92943432B596233759DAEC424b3BAf22c1', // Your new factory contract
    x402payFeeAddress: process.env.X402PAY_FEE_ADDRESS || '0xfB470D35B311C15CFdc3142318eEaB2016c90914', // Your fee collector wallet
    authorizedAgent: process.env.AUTHORIZED_AGENT_ADDRESS || '0xff85A11F295122296B4DcB4D3E8F5da6b8c40d1B' // Your agent wallet
  },
  
  // Monitoring Settings
  monitoring: {
    intervalMs: parseInt(process.env.MONITORING_INTERVAL_MS) || 30000, // 30 seconds
    settlementCheckMs: parseInt(process.env.SETTLEMENT_CHECK_INTERVAL_MS) || 60000 // 1 minute
  },
  
  // Firebase Configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config; 