const { ethers } = require('ethers');
const logger = require('./logger');

class ValidationService {
  constructor() {
    this.maxAmount = ethers.parseEther('1000'); // 1000 ETH max for security
    this.minAmount = ethers.parseEther('0.001'); // 0.001 ETH minimum
  }

  /**
   * Validates Ethereum addresses
   */
  validateAddress(address, fieldName = 'address') {
    if (!address) {
      throw new Error(`${fieldName} is required`);
    }

    if (typeof address !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    if (!ethers.isAddress(address)) {
      throw new Error(`${fieldName} is not a valid Ethereum address`);
    }

    return address.toLowerCase();
  }

  /**
   * Validates amounts (in wei)
   */
  validateAmount(amount, fieldName = 'amount') {
    if (!amount) {
      throw new Error(`${fieldName} is required`);
    }

    let amountBigInt;
    try {
      amountBigInt = BigInt(amount);
    } catch (error) {
      throw new Error(`${fieldName} must be a valid number`);
    }

    if (amountBigInt <= 0n) {
      throw new Error(`${fieldName} must be greater than 0`);
    }

    if (amountBigInt < this.minAmount) {
      throw new Error(`${fieldName} must be at least 0.001 ETH`);
    }

    if (amountBigInt > this.maxAmount) {
      throw new Error(`${fieldName} cannot exceed 1000 ETH for security`);
    }

    return amountBigInt;
  }

  /**
   * Validates condition types
   */
  validateConditionType(conditionType, fieldName = 'conditionType') {
    if (conditionType === undefined || conditionType === null) {
      throw new Error(`${fieldName} is required`);
    }

    const numType = Number(conditionType);
    if (isNaN(numType) || !Number.isInteger(numType)) {
      throw new Error(`${fieldName} must be an integer`);
    }

    if (numType < 0 || numType > 4) {
      throw new Error(`${fieldName} must be between 0 and 4`);
    }

    return numType;
  }

  /**
   * Validates timestamps
   */
  validateTimestamp(timestamp, fieldName = 'timestamp') {
    if (!timestamp) {
      throw new Error(`${fieldName} is required`);
    }

    const numTimestamp = Number(timestamp);
    if (isNaN(numTimestamp)) {
      throw new Error(`${fieldName} must be a valid number`);
    }

    // Check if timestamp is reasonable (not too far in past or future)
    const now = Math.floor(Date.now() / 1000);
    const oneYearAgo = now - (365 * 24 * 60 * 60);
    const oneYearFromNow = now + (365 * 24 * 60 * 60);

    if (numTimestamp < oneYearAgo) {
      throw new Error(`${fieldName} is too far in the past`);
    }

    if (numTimestamp > oneYearFromNow) {
      throw new Error(`${fieldName} is too far in the future`);
    }

    return numTimestamp;
  }

  /**
   * Validates status values
   */
  validateStatus(status, fieldName = 'status') {
    if (status === undefined || status === null) {
      throw new Error(`${fieldName} is required`);
    }

    const numStatus = Number(status);
    if (isNaN(numStatus) || !Number.isInteger(numStatus)) {
      throw new Error(`${fieldName} must be an integer`);
    }

    if (numStatus < 0 || numStatus > 3) {
      throw new Error(`${fieldName} must be between 0 and 3 (Pending, Escrowed, Settled, Disputed)`);
    }

    return numStatus;
  }

  /**
   * Validates condition hash
   */
  validateConditionHash(hash, fieldName = 'conditionHash') {
    if (!hash) {
      throw new Error(`${fieldName} is required`);
    }

    if (typeof hash !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    // Check if it's a valid bytes32 hash
    const hashPattern = /^0x[a-fA-F0-9]{64}$/;
    if (!hashPattern.test(hash)) {
      throw new Error(`${fieldName} must be a valid bytes32 hash`);
    }

    return hash;
  }

  /**
   * Validates transaction hash
   */
  validateTxHash(hash, fieldName = 'txHash') {
    if (!hash) {
      throw new Error(`${fieldName} is required`);
    }

    if (typeof hash !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    const txHashPattern = /^0x[a-fA-F0-9]{64}$/;
    if (!txHashPattern.test(hash)) {
      throw new Error(`${fieldName} must be a valid transaction hash`);
    }

    return hash;
  }

  /**
   * Validates string fields with length limits
   */
  validateString(value, fieldName, minLength = 1, maxLength = 1000) {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }

    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    const trimmed = value.trim();
    if (trimmed.length < minLength) {
      throw new Error(`${fieldName} must be at least ${minLength} characters`);
    }

    if (trimmed.length > maxLength) {
      throw new Error(`${fieldName} cannot exceed ${maxLength} characters`);
    }

    // Basic XSS prevention
    if (trimmed.includes('<') || trimmed.includes('>')) {
      throw new Error(`${fieldName} contains invalid characters`);
    }

    return trimmed;
  }

  /**
   * Validates URL fields
   */
  validateUrl(url, fieldName = 'url') {
    if (!url) {
      throw new Error(`${fieldName} is required`);
    }

    try {
      const urlObj = new URL(url);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error(`${fieldName} must use HTTP or HTTPS protocol`);
      }

      // Prevent localhost/internal network access
      if (urlObj.hostname === 'localhost' || 
          urlObj.hostname === '127.0.0.1' || 
          urlObj.hostname.startsWith('192.168.') ||
          urlObj.hostname.startsWith('10.') ||
          urlObj.hostname.startsWith('172.')) {
        throw new Error(`${fieldName} cannot point to internal networks`);
      }

      return url;
    } catch (error) {
      if (error.message.includes('Invalid URL')) {
        throw new Error(`${fieldName} is not a valid URL`);
      }
      throw error;
    }
  }

  /**
   * Validates escrow details from blockchain
   */
  validateEscrowDetails(details) {
    try {
      const validated = {
        escrowAddress: this.validateAddress(details.escrowAddress, 'escrowAddress'),
        payer: this.validateAddress(details.payer, 'payer'),
        payee: this.validateAddress(details.payee, 'payee'),
        amount: this.validateAmount(details.amount, 'amount'),
        conditionType: this.validateConditionType(details.conditionType, 'conditionType'),
        conditionHash: this.validateConditionHash(details.conditionHash, 'conditionHash'),
        status: this.validateStatus(details.status, 'status'),
        createdAt: this.validateTimestamp(details.createdAt, 'createdAt'),
        settledAt: details.settledAt ? this.validateTimestamp(details.settledAt, 'settledAt') : 0,
        balance: this.validateAmount(details.balance, 'balance')
      };

      // Additional business logic validation
      if (validated.payer === validated.payee) {
        throw new Error('Payer and payee cannot be the same address');
      }

      if (validated.status === 2 && validated.settledAt === 0) {
        throw new Error('Settled escrow must have a settlement timestamp');
      }

      return validated;
    } catch (error) {
      logger.agent.error('Escrow details validation failed', {
        escrowAddress: details.escrowAddress,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validates agreement data from Firestore
   */
  validateAgreementData(data) {
    try {
      const validated = {
        escrowAddress: this.validateAddress(data.escrowAddress, 'escrowAddress'),
        createdAt: this.validateTimestamp(data.createdAt, 'createdAt'),
        conditionType: this.validateConditionType(data.conditionType, 'conditionType')
      };

      // Validate condition-specific fields
      switch (validated.conditionType) {
        case 0: // Date condition
          if (data.settlementDate) {
            validated.settlementDate = this.validateString(data.settlementDate, 'settlementDate', 1, 50);
          }
          break;

        case 1: // Task completion
          if (data.taskName) {
            validated.taskName = this.validateString(data.taskName, 'taskName', 3, 200);
          }
          break;

        case 2: // GitHub PR
          if (data.githubPrUrl) {
            validated.githubPrUrl = this.validateUrl(data.githubPrUrl, 'githubPrUrl');
            // Additional GitHub URL validation
            const url = new URL(data.githubPrUrl);
            if (url.hostname !== 'github.com') {
              throw new Error('GitHub PR URL must be from github.com');
            }
          }
          break;

        case 3: // API call
          if (data.apiEndpoint) {
            validated.apiEndpoint = this.validateUrl(data.apiEndpoint, 'apiEndpoint');
          }
          if (data.expectedValue) {
            validated.expectedValue = this.validateString(data.expectedValue, 'expectedValue', 1, 500);
          }
          break;

        case 4: // Custom event
          if (data.customEventName) {
            validated.customEventName = this.validateString(data.customEventName, 'customEventName', 3, 100);
            // Only allow alphanumeric, spaces, underscores, and hyphens
            const validPattern = /^[a-zA-Z0-9\s_-]+$/;
            if (!validPattern.test(validated.customEventName)) {
              throw new Error('Custom event name contains invalid characters');
            }
          }
          break;
      }

      // Validate optional boolean flags
      if (data.conditionMet !== undefined) {
        validated.conditionMet = Boolean(data.conditionMet);
      }
      if (data.taskCompleted !== undefined) {
        validated.taskCompleted = Boolean(data.taskCompleted);
      }
      if (data.prMerged !== undefined) {
        validated.prMerged = Boolean(data.prMerged);
      }
      if (data.apiConditionMet !== undefined) {
        validated.apiConditionMet = Boolean(data.apiConditionMet);
      }
      if (data.customEventTriggered !== undefined) {
        validated.customEventTriggered = Boolean(data.customEventTriggered);
      }

      return validated;
    } catch (error) {
      logger.agent.error('Agreement data validation failed', {
        escrowAddress: data.escrowAddress,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Sanitizes user input to prevent injection attacks
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .trim(); // Remove leading/trailing whitespace
  }

  /**
   * Validates gas parameters
   */
  validateGasParams(gasLimit, gasPrice) {
    if (gasLimit) {
      const gasLimitBigInt = BigInt(gasLimit);
      if (gasLimitBigInt <= 0n) {
        throw new Error('Gas limit must be greater than 0');
      }
      if (gasLimitBigInt > 10000000n) { // 10M gas limit max
        throw new Error('Gas limit too high');
      }
    }

    if (gasPrice) {
      const gasPriceBigInt = BigInt(gasPrice);
      if (gasPriceBigInt <= 0n) {
        throw new Error('Gas price must be greater than 0');
      }
      if (gasPriceBigInt > ethers.parseUnits('1000', 'gwei')) { // 1000 gwei max
        throw new Error('Gas price too high');
      }
    }

    return { gasLimit, gasPrice };
  }
}

module.exports = ValidationService; 