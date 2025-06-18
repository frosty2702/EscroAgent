const { ethers } = require('ethers');
const axios = require('axios');
const logger = require('./logger');

class ConditionService {
  constructor() {
    this.conditionTypes = {
      0: 'DATE',
      1: 'TASK_COMPLETION',
      2: 'GITHUB_PR',
      3: 'API_CALL',
      4: 'CUSTOM_EVENT'
    };
  }

  /**
   * Check if an escrow's condition has been met
   * @param {Object} escrowDetails - Details from blockchain
   * @param {Object} agreementData - Additional data from Firestore (optional)
   * @returns {Promise<boolean>} - Whether condition is met
   */
  async checkCondition(escrowDetails, agreementData = null) {
    const conditionType = escrowDetails.conditionType;
    const conditionHash = escrowDetails.conditionHash;
    
    logger.agent.condition('Checking condition', {
      escrowAddress: escrowDetails.escrowAddress,
      conditionType,
      conditionTypeName: this.conditionTypes[conditionType]
    });

    try {
      switch (conditionType) {
        case 0: // DATE
          return await this.checkDateCondition(conditionHash, agreementData);
        case 1: // TASK_COMPLETION
          return await this.checkTaskCondition(conditionHash, agreementData);
        case 2: // GITHUB_PR
          return await this.checkGithubPRCondition(conditionHash, agreementData);
        case 3: // API_CALL
          return await this.checkApiCondition(conditionHash, agreementData);
        case 4: // CUSTOM_EVENT
          return await this.checkCustomEventCondition(conditionHash, agreementData);
        default:
          logger.warn('Unknown condition type', { conditionType });
          return false;
      }
    } catch (error) {
      logger.agent.error('Error checking condition', {
        escrowAddress: escrowDetails.escrowAddress,
        conditionType,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check date-based condition
   * For demo: checks if current date >= settlement date
   */
  async checkDateCondition(conditionHash, agreementData) {
    try {
      // For demo purposes, we'll check if the condition was set to be met
      // In a real implementation, you'd decode the condition hash to get the target date
      
      if (agreementData && agreementData.conditionMet) {
        logger.agent.condition('Date condition marked as met in database');
        return true;
      }

      // Simulate: if no specific date data, assume it's met after creation + 2 minutes for demo
      const now = Date.now();
      const createdAt = agreementData?.createdAt || now;
      const isTimeMet = now > (createdAt + 2 * 60 * 1000); // 2 minutes after creation

      logger.agent.condition('Date condition check', {
        currentTime: new Date(now).toISOString(),
        createdAt: new Date(createdAt).toISOString(),
        isTimeMet
      });

      return isTimeMet;
    } catch (error) {
      logger.agent.error('Error checking date condition', { error: error.message });
      return false;
    }
  }

  /**
   * Check task completion condition
   * For demo: checks a flag in the agreement data
   */
  async checkTaskCondition(conditionHash, agreementData) {
    try {
      if (agreementData && agreementData.taskCompleted) {
        logger.agent.condition('Task marked as completed', {
          taskName: agreementData.taskName
        });
        return true;
      }

      // For demo: auto-complete tasks after 3 minutes
      if (agreementData && agreementData.createdAt) {
        const now = Date.now();
        const isAutoComplete = now > (agreementData.createdAt + 3 * 60 * 1000);
        
        if (isAutoComplete) {
          logger.agent.condition('Task auto-completed for demo', {
            taskName: agreementData.taskName
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.agent.error('Error checking task condition', { error: error.message });
      return false;
    }
  }

  /**
   * Check GitHub PR condition
   * For demo: simulates checking if a PR is merged
   */
  async checkGithubPRCondition(conditionHash, agreementData) {
    try {
      if (agreementData && agreementData.prMerged) {
        logger.agent.condition('GitHub PR marked as merged', {
          prUrl: agreementData.githubPrUrl
        });
        return true;
      }

      // For demo: simulate PR check
      if (agreementData && agreementData.githubPrUrl) {
        // In real implementation, you'd call GitHub API
        // For demo, auto-merge after 4 minutes
        const now = Date.now();
        const isAutoMerged = now > ((agreementData.createdAt || now) + 4 * 60 * 1000);
        
        if (isAutoMerged) {
          logger.agent.condition('GitHub PR auto-merged for demo', {
            prUrl: agreementData.githubPrUrl
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.agent.error('Error checking GitHub PR condition', { error: error.message });
      return false;
    }
  }

  /**
   * Check API call condition
   * For demo: simulates external API verification
   */
  async checkApiCondition(conditionHash, agreementData) {
    try {
      if (agreementData && agreementData.apiConditionMet) {
        logger.agent.condition('API condition marked as met', {
          apiEndpoint: agreementData.apiEndpoint,
          expectedValue: agreementData.expectedValue
        });
        return true;
      }

      // For demo: simulate API call
      if (agreementData && agreementData.apiEndpoint) {
        // In real implementation, you'd make actual API calls
        // For demo, auto-succeed after 5 minutes
        const now = Date.now();
        const isAutoSuccess = now > ((agreementData.createdAt || now) + 5 * 60 * 1000);
        
        if (isAutoSuccess) {
          logger.agent.condition('API condition auto-succeeded for demo', {
            apiEndpoint: agreementData.apiEndpoint,
            expectedValue: agreementData.expectedValue
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.agent.error('Error checking API condition', { error: error.message });
      return false;
    }
  }

  /**
   * Check custom event condition
   * For demo: checks if custom event was triggered
   */
  async checkCustomEventCondition(conditionHash, agreementData) {
    try {
      if (agreementData && agreementData.customEventTriggered) {
        logger.agent.condition('Custom event marked as triggered', {
          eventName: agreementData.customEventName
        });
        return true;
      }

      // For demo: auto-trigger after 6 minutes
      if (agreementData && agreementData.customEventName) {
        const now = Date.now();
        const isAutoTriggered = now > ((agreementData.createdAt || now) + 6 * 60 * 1000);
        
        if (isAutoTriggered) {
          logger.agent.condition('Custom event auto-triggered for demo', {
            eventName: agreementData.customEventName
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.agent.error('Error checking custom event condition', { error: error.message });
      return false;
    }
  }

  /**
   * Generate condition hash for verification
   * This should match the frontend's hash generation
   */
  generateConditionHash(conditionData) {
    return ethers.keccak256(ethers.toUtf8Bytes(conditionData));
  }

  /**
   * Get human-readable condition description
   */
  getConditionDescription(conditionType, agreementData) {
    switch (conditionType) {
      case 0:
        return `Settlement date: ${agreementData?.settlementDate || 'Not specified'}`;
      case 1:
        return `Task completion: ${agreementData?.taskName || 'Not specified'}`;
      case 2:
        return `GitHub PR merge: ${agreementData?.githubPrUrl || 'Not specified'}`;
      case 3:
        return `API call: ${agreementData?.apiEndpoint || 'Not specified'} -> ${agreementData?.expectedValue || 'Not specified'}`;
      case 4:
        return `Custom event: ${agreementData?.customEventName || 'Not specified'}`;
      default:
        return 'Unknown condition type';
    }
  }
}

module.exports = ConditionService; 