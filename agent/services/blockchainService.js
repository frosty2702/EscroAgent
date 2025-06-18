const { ethers } = require('ethers');
const config = require('../config');
const { ESCROW_FACTORY_ABI, ESCROW_ABI } = require('../contracts/abis');
const logger = require('./logger');
const ValidationService = require('./validationService');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.factoryContract = null;
    this.escrowContracts = new Map(); // Cache for escrow contract instances
    this.validationService = new ValidationService();
    this.maxGasPrice = ethers.parseUnits('100', 'gwei'); // 100 gwei max
    this.gasBuffer = 1.2; // 20% gas buffer
  }

  async initialize() {
    try {
      // Setup provider
      this.provider = new ethers.JsonRpcProvider(config.baseSepolia.rpcUrl);
      
      // Setup wallet with agent private key
      this.wallet = new ethers.Wallet(config.agentPrivateKey, this.provider);
      
      // Verify agent address matches configuration
      const agentAddress = await this.wallet.getAddress();
      if (agentAddress.toLowerCase() !== config.contracts.authorizedAgent.toLowerCase()) {
        throw new Error(`Agent address mismatch. Expected: ${config.contracts.authorizedAgent}, Got: ${agentAddress}`);
      }

      // Setup factory contract
      this.factoryContract = new ethers.Contract(
        config.contracts.escrowFactory,
        ESCROW_FACTORY_ABI,
        this.wallet
      );

      logger.info('Blockchain service initialized successfully', {
        agentAddress,
        factoryAddress: config.contracts.escrowFactory,
        network: 'Base Sepolia'
      });

      return true;
    } catch (error) {
      logger.error('Failed to initialize blockchain service', { error: error.message });
      throw error;
    }
  }

  async getDeployedEscrows() {
    try {
      const escrowAddresses = await this.factoryContract.getDeployedEscrows();
      logger.info(`Found ${escrowAddresses.length} deployed escrow contracts`);
      return escrowAddresses;
    } catch (error) {
      logger.error('Failed to get deployed escrows', { error: error.message });
      throw error;
    }
  }

  async getEscrowContract(escrowAddress) {
    if (!this.escrowContracts.has(escrowAddress)) {
      const contract = new ethers.Contract(escrowAddress, ESCROW_ABI, this.wallet);
      this.escrowContracts.set(escrowAddress, contract);
    }
    return this.escrowContracts.get(escrowAddress);
  }

  async getEscrowDetails(escrowAddress) {
    try {
      // Validate input
      this.validationService.validateAddress(escrowAddress, 'escrowAddress');
      
      const contract = await this.getEscrowContract(escrowAddress);
      const details = await contract.getAgreementDetails();
      const status = await contract.getStatus();
      const balance = await contract.getBalance();

      const rawDetails = {
        escrowAddress,
        payer: details[0],
        payee: details[1],
        amount: details[2],
        conditionType: Number(details[3]),
        conditionHash: details[4],
        status: Number(status),
        createdAt: Number(details[6]),
        settledAt: Number(details[7]),
        balance: balance,
        // Status enum: 0=Pending, 1=Escrowed, 2=Settled, 3=Disputed
        statusText: this.getStatusText(Number(status))
      };

      // Validate the retrieved data
      return this.validationService.validateEscrowDetails(rawDetails);
    } catch (error) {
      logger.error('Failed to get escrow details', { 
        escrowAddress, 
        error: error.message 
      });
      throw error;
    }
  }

  async settleEscrow(escrowAddress) {
    try {
      // Validate input
      this.validationService.validateAddress(escrowAddress, 'escrowAddress');
      
      const contract = await this.getEscrowContract(escrowAddress);
      
      // Check current status before settling
      const details = await this.getEscrowDetails(escrowAddress);
      if (details.status !== 1) { // Not in Escrowed state
        throw new Error(`Cannot settle escrow. Current status: ${details.statusText}`);
      }

      logger.info('Initiating escrow settlement', { 
        escrowAddress,
        amount: ethers.formatEther(details.amount),
        payer: details.payer,
        payee: details.payee
      });

      // Pre-flight validation: simulate the transaction
      try {
        await contract.settle.staticCall();
        logger.info('Transaction simulation successful', { escrowAddress });
      } catch (simulationError) {
        logger.error('Transaction simulation failed', { 
          escrowAddress, 
          error: simulationError.message 
        });
        throw new Error(`Settlement would fail: ${simulationError.reason || simulationError.message}`);
      }

      // Check agent balance
      const agentBalance = await this.getAgentBalance();
      const minBalance = ethers.parseEther('0.001'); // Minimum 0.001 ETH required
      if (agentBalance.wei < minBalance) {
        throw new Error(`Insufficient agent balance: ${agentBalance.eth} ETH (minimum 0.001 ETH required)`);
      }

      // Estimate gas with safety checks
      let gasEstimate;
      try {
        gasEstimate = await contract.settle.estimateGas();
        logger.info('Gas estimation successful', { 
          escrowAddress, 
          gasEstimate: gasEstimate.toString() 
        });
      } catch (gasError) {
        logger.error('Gas estimation failed', { 
          escrowAddress, 
          error: gasError.message 
        });
        throw new Error(`Gas estimation failed: ${gasError.reason || gasError.message}`);
      }

      // Apply gas buffer and validate
      const gasLimit = BigInt(Math.floor(Number(gasEstimate) * this.gasBuffer));
      this.validationService.validateGasParams(gasLimit.toString(), null);

      // Get current gas price and validate
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      
      if (gasPrice > this.maxGasPrice) {
        logger.warn('Gas price too high, using maximum allowed', {
          currentGasPrice: ethers.formatUnits(gasPrice, 'gwei'),
          maxGasPrice: ethers.formatUnits(this.maxGasPrice, 'gwei')
        });
      }

      const finalGasPrice = gasPrice > this.maxGasPrice ? this.maxGasPrice : gasPrice;

      // Calculate total transaction cost
      const txCost = gasLimit * finalGasPrice;
      if (agentBalance.wei < txCost) {
        throw new Error(`Insufficient balance for transaction. Required: ${ethers.formatEther(txCost)} ETH, Available: ${agentBalance.eth} ETH`);
      }

      // Execute settlement with validated parameters
      const txParams = {
        gasLimit,
        gasPrice: finalGasPrice
      };

      logger.info('Executing settlement transaction', {
        escrowAddress,
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(finalGasPrice, 'gwei') + ' gwei',
        estimatedCost: ethers.formatEther(txCost) + ' ETH'
      });

      const tx = await contract.settle(txParams);
      
      logger.info('Settlement transaction sent', { 
        escrowAddress,
        txHash: tx.hash,
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(finalGasPrice, 'gwei') + ' gwei'
      });

      // Wait for confirmation with timeout
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout')), 300000) // 5 minute timeout
        )
      ]);
      
      logger.info('Escrow settled successfully', { 
        escrowAddress,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: ethers.formatUnits(receipt.effectiveGasPrice, 'gwei') + ' gwei',
        actualCost: ethers.formatEther(receipt.gasUsed * receipt.effectiveGasPrice) + ' ETH'
      });

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString(),
        actualCost: ethers.formatEther(receipt.gasUsed * receipt.effectiveGasPrice)
      };

    } catch (error) {
      logger.error('Failed to settle escrow', { 
        escrowAddress, 
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async getAgentBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return {
        wei: balance,
        eth: ethers.formatEther(balance)
      };
    } catch (error) {
      logger.error('Failed to get agent balance', { error: error.message });
      throw error;
    }
  }

  getStatusText(status) {
    const statusMap = {
      0: 'Pending',
      1: 'Escrowed',
      2: 'Settled',
      3: 'Disputed'
    };
    return statusMap[status] || 'Unknown';
  }

  // Listen for new escrow creation events
  async setupEventListeners() {
    try {
      this.factoryContract.on('AgreementCreated', (escrowAddress, payer, payee, amount, conditionType, conditionHash, timestamp, event) => {
        logger.info('New agreement created', {
          escrowAddress,
          payer,
          payee,
          amount: ethers.formatEther(amount),
          conditionType: Number(conditionType),
          timestamp: Number(timestamp),
          txHash: event.log.transactionHash
        });
      });

      logger.info('Event listeners setup successfully');
    } catch (error) {
      logger.error('Failed to setup event listeners', { error: error.message });
    }
  }

  async cleanup() {
    if (this.factoryContract) {
      this.factoryContract.removeAllListeners();
    }
    this.escrowContracts.clear();
    logger.info('Blockchain service cleanup completed');
  }
}

module.exports = BlockchainService; 