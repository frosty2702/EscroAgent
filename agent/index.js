#!/usr/bin/env node

const AgentService = require('./services/agentService');
const logger = require('./services/logger');
const config = require('./config');

class TrustFlowAgent {
  constructor() {
    this.agentService = new AgentService();
    this.isShuttingDown = false;
  }

  async start() {
    try {
      logger.info('='.repeat(60));
      logger.info('🤖 TrustFlow Autonomous Agent Starting...');
      logger.info('='.repeat(60));
      
      logger.info('Agent Configuration:', {
        agentAddress: config.contracts.authorizedAgent,
        factoryAddress: config.contracts.escrowFactory,
        network: 'Base Sepolia',
        monitoringInterval: `${config.monitoring.intervalMs / 1000}s`
      });

      // Initialize the agent service
      await this.agentService.initialize();
      
      // Start monitoring
      await this.agentService.startMonitoring();
      
      logger.info('='.repeat(60));
      logger.info('✅ TrustFlow Agent is now running!');
      logger.info('='.repeat(60));
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
      // Keep the process alive
      this.keepAlive();
      
    } catch (error) {
      logger.error('❌ Failed to start TrustFlow Agent', { error: error.message });
      process.exit(1);
    }
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      try {
        await this.agentService.stop();
        logger.info('TrustFlow Agent stopped successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error: error.message });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon
  }

  keepAlive() {
    // Log status every 5 minutes
    setInterval(async () => {
      try {
        const status = await this.agentService.getStatus();
        logger.info('Agent Status Check', {
          isRunning: status.isRunning,
          balance: status.balance + ' ETH',
          totalEscrows: status.totalEscrows,
          uptime: process.uptime() + 's'
        });
      } catch (error) {
        logger.error('Error getting agent status', { error: error.message });
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Start the agent if this file is run directly
if (require.main === module) {
  const agent = new TrustFlowAgent();
  agent.start();
}

module.exports = TrustFlowAgent;