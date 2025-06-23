require('dotenv').config();

const config = {
  // Agent Configuration
  agentPrivateKey: process.env.AGENT_PRIVATE_KEY || '977b96a03a20b5349efbe1966dea73c44f169baf41e9c1c624a0a85c92e19b6f',
  baseSepolia: {
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    chainId: 84532
  },
  
  // Contract Addresses
  contracts: {
    escrowFactory: process.env.ESCROW_FACTORY_ADDRESS || '0x3F6D14f6F3637755FdbedA4866bA4d5b5948fc6d',
    x402payFeeAddress: process.env.X402PAY_FEE_ADDRESS || '0x4a72B8A18d64a67B0dCc77db012d0Bf7844C3d45',
    authorizedAgent: process.env.AUTHORIZED_AGENT_ADDRESS || '0xDcE892624C1f5e96C7F9b795350ED0F68f4f679a'
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