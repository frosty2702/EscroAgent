# TrustFlow Autonomous Agent 🤖

The **TrustFlow Autonomous Agent** is the intelligent, off-chain component that brings automation to the TrustFlow escrow system. It continuously monitors escrow agreements and autonomously executes settlements when conditions are met.

## 🚀 Features

- **Real-time Monitoring**: Continuously monitors all deployed escrow contracts
- **Autonomous Settlement**: Automatically settles escrows when conditions are verified
- **Multi-Condition Support**: Handles 5 different condition types:
  - 📅 **Date-based**: Time-triggered settlements
  - ✅ **Task Completion**: Manual task verification
  - 🔀 **GitHub PR Merge**: Integration with GitHub workflows
  - 🌐 **API Call Success**: External API verification
  - 🎯 **Custom Events**: Flexible custom triggers
- **Robust Logging**: Comprehensive logging with Winston
- **CLI Management**: Command-line tools for monitoring and control
- **Error Handling**: Graceful error handling and recovery
- **Gas Optimization**: Smart gas estimation and management

## 📋 Prerequisites

- Node.js 18+ 
- Agent wallet with ETH for gas fees on Base Sepolia
- Access to deployed EscrowFactory contract

## 🛠️ Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configuration**:
   The agent uses the configuration in `config.js` with the following settings:
   - Agent Private Key: `977b96a03a20b5349efbe1966dea73c44f169baf41e9c1c624a0a85c92e19b6f`
   - Agent Address: `0xDcE892624C1f5e96C7F9b795350ED0F68f4f679a`
   - Factory Address: `0x3f052A6793818DBAB89449874CAb0b119Ea7Ec82`
   - Network: Base Sepolia

## 🎯 Usage

### Start the Agent

```bash
# Production mode
npm start

# Development mode (with auto-restart)
npm run dev
```

### CLI Commands

```bash
# Check agent status and view all escrows
npm run status

# Run a single monitoring cycle
npm run monitor

# Trigger a condition manually (for demo)
node cli.js trigger -a <escrow_address> -t <condition_type>

# Manually settle an escrow
node cli.js settle -a <escrow_address>

# Run complete demo scenario
npm run demo
```

## 🔧 How It Works

### 1. **Initialization**
- Connects to Base Sepolia network
- Verifies agent wallet and permissions
- Sets up blockchain event listeners
- Starts monitoring loops

### 2. **Monitoring Loop**
The agent runs a monitoring cycle every 30 seconds:

```javascript
// Pseudocode
for each deployed escrow {
  1. Get escrow details from blockchain
  2. Skip if already settled/disputed
  3. Skip if not in "Escrowed" state (no funds)
  4. Check if condition is met
  5. If condition met → trigger settlement
}
```

### 3. **Condition Verification**
Each condition type has specific verification logic:

- **Date (Type 0)**: Checks if current time >= target date
- **Task (Type 1)**: Checks completion flag (demo: auto-complete after 3 min)
- **GitHub (Type 2)**: Verifies PR merge status (demo: auto-merge after 4 min)
- **API (Type 3)**: Calls external API (demo: auto-succeed after 5 min)
- **Custom (Type 4)**: Checks custom event trigger (demo: auto-trigger after 6 min)

### 4. **Autonomous Settlement**
When a condition is met:
1. Validates escrow is in correct state
2. Estimates gas requirements
3. Calls `settle()` function on escrow contract
4. Waits for transaction confirmation
5. Logs settlement details

## 📊 Logging

The agent provides comprehensive logging:

```bash
# View real-time logs
tail -f logs/combined.log

# View error logs only
tail -f logs/error.log
```

Log categories:
- `[STARTUP]` - Initialization and shutdown
- `[MONITORING]` - Monitoring cycle activities
- `[CONDITION]` - Condition checking results
- `[SETTLEMENT]` - Settlement transactions
- `[BLOCKCHAIN]` - Blockchain interactions
- `[ERROR]` - Error conditions

## 🎮 Demo Mode

For demonstration purposes, the agent includes automatic condition triggering:

```bash
# Run complete demo
npm run demo
```

This will:
1. Find all deployed escrow contracts
2. Automatically trigger their conditions
3. Show the agent settling them in real-time

## 🏗️ Architecture

```
TrustFlow Agent
├── services/
│   ├── agentService.js      # Main orchestration
│   ├── blockchainService.js # Web3 interactions
│   ├── conditionService.js  # Condition verification
│   └── logger.js           # Logging system
├── contracts/
│   └── abis.js             # Contract ABIs
├── config.js               # Configuration
├── index.js               # Main entry point
└── cli.js                 # CLI management tool
```

## 🔐 Security Features

- **Private Key Management**: Secure handling of agent wallet
- **Access Control**: Only authorized agent can settle escrows
- **Gas Management**: Smart gas estimation with buffers
- **Error Recovery**: Graceful handling of network issues
- **Monitoring**: Continuous health checks

## 📈 Monitoring & Metrics

The agent provides real-time status information:

```bash
npm run status
```

Shows:
- Agent wallet address and balance
- Total number of escrow contracts
- Individual escrow statuses
- Last monitoring cycle time

## 🚨 Error Handling

The agent handles various error scenarios:
- Network connectivity issues
- Insufficient gas fees
- Contract interaction failures
- Invalid escrow states
- Blockchain reorganizations

## 🔄 Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic restarts on code changes.

### Testing Conditions

```bash
# Trigger specific condition types
node cli.js trigger -a 0x1234... -t 0  # Date condition
node cli.js trigger -a 0x1234... -t 1  # Task condition
node cli.js trigger -a 0x1234... -t 2  # GitHub PR condition
node cli.js trigger -a 0x1234... -t 3  # API condition
node cli.js trigger -a 0x1234... -t 4  # Custom event condition
```

## 📝 Configuration Options

Key configuration parameters in `config.js`:

```javascript
{
  agentPrivateKey: "...",           // Agent wallet private key
  baseSepolia: {
    rpcUrl: "https://sepolia.base.org",
    chainId: 84532
  },
  contracts: {
    escrowFactory: "0x3f052A6793818DBAB89449874CAb0b119Ea7Ec82",
    authorizedAgent: "0xDcE892624C1f5e96C7F9b795350ED0F68f4f679a"
  },
  monitoring: {
    intervalMs: 30000,              // 30 second monitoring cycle
    settlementCheckMs: 60000        // 1 minute settlement checks
  }
}
```

## 🎯 Next Steps

For production deployment:

1. **Firestore Integration**: Replace simulated data with real Firestore
2. **Real API Integrations**: Implement actual GitHub/API verifications
3. **Enhanced Security**: Add multi-sig requirements
4. **Scaling**: Support multiple agent instances
5. **Monitoring**: Add Prometheus/Grafana metrics
6. **Alerting**: Slack/email notifications for settlements

## 🤝 Contributing

The agent is designed to be modular and extensible. Key extension points:

- **New Condition Types**: Add to `ConditionService`
- **Different Networks**: Update provider configuration
- **Custom Logging**: Extend Winston configuration
- **Additional CLI Commands**: Add to `cli.js`

---

**TrustFlow Agent** - Bringing autonomous intelligence to decentralized escrow! 🚀 