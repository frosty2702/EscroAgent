const cron = require('node-cron');
const { ethers } = require('ethers');
const BlockchainService = require('./blockchainService');
const ConditionService = require('./conditionService');
const logger = require('./logger');
const config = require('../config');

class AgentService {
  constructor() {
    this.blockchainService = new BlockchainService();
    this.conditionService = new ConditionService();
    this.isRunning = false;
    this.monitoringJob = null;
    this.agreementCache = new Map(); // Cache for agreement data
    this.lastProcessedBlock = 0;
  }

  async initialize() {
    try {
      logger.agent.startup('Initializing TrustFlow Agent Service');
      
      // Initialize blockchain service
      await this.blockchainService.initialize();
      
      // Setup event listeners
      await this.blockchainService.setupEventListeners();
      
      // Log agent status
      const balance = await this.blockchainService.getAgentBalance();
      logger.agent.startup('Agent initialized successfully', {
        agentAddress: config.contracts.authorizedAgent,
        balance: balance.eth + ' ETH',
        factoryContract: config.contracts.escrowFactory
      });

      this.isRunning = true;
      return true;
    } catch (error) {
      logger.agent.error('Failed to initialize agent service', { error: error.message });
      throw error;
    }
  }

  async startMonitoring() {
    if (!this.isRunning) {
      throw new Error('Agent service not initialized');
    }

    logger.agent.startup('Starting agreement monitoring');

    // Setup cron job for monitoring (every 30 seconds)
    this.monitoringJob = cron.schedule('*/30 * * * * *', async () => {
      await this.monitorAgreements();
    }, {
      scheduled: false
    });

    // Start the monitoring job
    this.monitoringJob.start();
    
    // Do initial monitoring run
    await this.monitorAgreements();

    logger.agent.startup('Agreement monitoring started successfully');
  }

  async monitorAgreements() {
    try {
      logger.agent.monitoring('Starting monitoring cycle');

      // Get all deployed escrow contracts
      const escrowAddresses = await this.blockchainService.getDeployedEscrows();
      
      if (escrowAddresses.length === 0) {
        logger.agent.monitoring('No escrow contracts found');
        return;
      }

      logger.agent.monitoring(`Monitoring ${escrowAddresses.length} escrow contracts`);

      // Process each escrow contract
      for (const escrowAddress of escrowAddresses) {
        await this.processEscrowContract(escrowAddress);
      }

      logger.agent.monitoring('Monitoring cycle completed');
    } catch (error) {
      logger.agent.error('Error during monitoring cycle', { error: error.message });
    }
  }

  async processEscrowContract(escrowAddress) {
    try {
      // Get escrow details from blockchain
      const escrowDetails = await this.blockchainService.getEscrowDetails(escrowAddress);
      
      logger.agent.monitoring('Processing escrow contract', {
        escrowAddress,
        status: escrowDetails.statusText,
        amount: ethers.formatEther(escrowDetails.amount),
        conditionType: escrowDetails.conditionType
      });

      // Skip if already settled or disputed
      if (escrowDetails.status === 2 || escrowDetails.status === 3) {
        logger.agent.monitoring('Escrow already settled or disputed, skipping', {
          escrowAddress,
          status: escrowDetails.statusText
        });
        return;
      }

      // Skip if not in escrowed state (funds not deposited yet)
      if (escrowDetails.status !== 1) {
        logger.agent.monitoring('Escrow not in escrowed state, skipping', {
          escrowAddress,
          status: escrowDetails.statusText
        });
        return;
      }

      // Get agreement data (in a real app, this would come from Firestore)
      const agreementData = this.getSimulatedAgreementData(escrowDetails);

      // Check if condition is met
      const isConditionMet = await this.conditionService.checkCondition(escrowDetails, agreementData);

      if (isConditionMet) {
        logger.agent.settlement('Condition met, initiating settlement', {
          escrowAddress,
          conditionType: escrowDetails.conditionType,
          amount: ethers.formatEther(escrowDetails.amount)
        });

        await this.settleEscrow(escrowAddress, escrowDetails);
      } else {
        logger.agent.monitoring('Condition not yet met', {
          escrowAddress,
          conditionType: escrowDetails.conditionType,
          conditionDescription: this.conditionService.getConditionDescription(
            escrowDetails.conditionType, 
            agreementData
          )
        });
      }
    } catch (error) {
      logger.agent.error('Error processing escrow contract', {
        escrowAddress,
        error: error.message
      });
    }
  }

  async settleEscrow(escrowAddress, escrowDetails) {
    try {
      logger.agent.settlement('Attempting to settle escrow', {
        escrowAddress,
        payer: escrowDetails.payer,
        payee: escrowDetails.payee,
        amount: ethers.formatEther(escrowDetails.amount)
      });

      // Execute settlement on blockchain
      const result = await this.blockchainService.settleEscrow(escrowAddress);

      if (result.success) {
        logger.agent.settlement('Escrow settled successfully', {
          escrowAddress,
          txHash: result.txHash,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed
        });

        // In a real app, you'd update Firestore here
        this.updateAgreementStatus(escrowAddress, 'settled', result);
      }
    } catch (error) {
      logger.agent.error('Failed to settle escrow', {
        escrowAddress,
        error: error.message
      });
    }
  }

  // Simulate agreement data (in real app, this would come from Firestore)
  getSimulatedAgreementData(escrowDetails) {
    const cacheKey = escrowDetails.escrowAddress;
    
    if (!this.agreementCache.has(cacheKey)) {
      // Create simulated agreement data
      const agreementData = {
        escrowAddress: escrowDetails.escrowAddress,
        createdAt: escrowDetails.createdAt * 1000, // Convert to milliseconds
        conditionType: escrowDetails.conditionType,
        // Simulate condition-specific data
        taskName: `Task for ${escrowDetails.escrowAddress.slice(-6)}`,
        githubPrUrl: `https://github.com/trustflow/demo/pull/${Math.floor(Math.random() * 100)}`,
        apiEndpoint: 'weather-api.com/temp',
        expectedValue: 'temperature > 25',
        customEventName: `Event_${escrowDetails.escrowAddress.slice(-6)}`,
        // Flags for manual condition setting (for demo)
        conditionMet: false,
        taskCompleted: false,
        prMerged: false,
        apiConditionMet: false,
        customEventTriggered: false
      };
      
      this.agreementCache.set(cacheKey, agreementData);
    }
    
    return this.agreementCache.get(cacheKey);
  }

  // Update agreement status (in real app, this would update Firestore)
  updateAgreementStatus(escrowAddress, status, settlementData = null) {
    const cacheKey = escrowAddress;
    if (this.agreementCache.has(cacheKey)) {
      const agreementData = this.agreementCache.get(cacheKey);
      agreementData.status = status;
      agreementData.settledAt = Date.now();
      if (settlementData) {
        agreementData.settlementTx = settlementData.txHash;
        agreementData.settlementBlock = settlementData.blockNumber;
      }
      this.agreementCache.set(cacheKey, agreementData);
    }
  }

  // Manual condition trigger methods (for demo purposes)
  async triggerCondition(escrowAddress, conditionType) {
    const agreementData = this.getSimulatedAgreementData({ escrowAddress, conditionType });
    
    switch (conditionType) {
      case 0:
        agreementData.conditionMet = true;
        break;
      case 1:
        agreementData.taskCompleted = true;
        break;
      case 2:
        agreementData.prMerged = true;
        break;
      case 3:
        agreementData.apiConditionMet = true;
        break;
      case 4:
        agreementData.customEventTriggered = true;
        break;
    }
    
    this.agreementCache.set(escrowAddress, agreementData);
    
    logger.agent.condition('Condition manually triggered', {
      escrowAddress,
      conditionType
    });
  }

  async getStatus() {
    try {
      const balance = await this.blockchainService.getAgentBalance();
      const escrowAddresses = await this.blockchainService.getDeployedEscrows();
      
      return {
        isRunning: this.isRunning,
        agentAddress: config.contracts.authorizedAgent,
        balance: balance.eth,
        totalEscrows: escrowAddresses.length,
        monitoringInterval: config.monitoring.intervalMs,
        lastMonitoringCycle: new Date().toISOString()
      };
    } catch (error) {
      logger.agent.error('Error getting agent status', { error: error.message });
      throw error;
    }
  }

  async stop() {
    logger.agent.startup('Stopping agent service');
    
    this.isRunning = false;
    
    if (this.monitoringJob) {
      this.monitoringJob.stop();
      this.monitoringJob = null;
    }
    
    await this.blockchainService.cleanup();
    this.agreementCache.clear();
    
    logger.agent.startup('Agent service stopped');
  }
}

module.exports = AgentService; 