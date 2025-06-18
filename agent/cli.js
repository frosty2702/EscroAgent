#!/usr/bin/env node

const { program } = require('commander');
const AgentService = require('./services/agentService');
const BlockchainService = require('./services/blockchainService');
const logger = require('./services/logger');
const { ethers } = require('ethers');

program
  .name('trustflow-agent-cli')
  .description('TrustFlow Agent Management CLI')
  .version('1.0.0');

// Status command
program
  .command('status')
  .description('Get agent status and deployed escrows')
  .action(async () => {
    try {
      const blockchainService = new BlockchainService();
      await blockchainService.initialize();
      
      const balance = await blockchainService.getAgentBalance();
      const escrows = await blockchainService.getDeployedEscrows();
      
      console.log('\n=== TrustFlow Agent Status ===');
      console.log(`Agent Address: ${blockchainService.wallet.address}`);
      console.log(`Agent Balance: ${balance.eth} ETH`);
      console.log(`Total Escrows: ${escrows.length}`);
      
      if (escrows.length > 0) {
        console.log('\n=== Deployed Escrows ===');
        for (const escrowAddress of escrows) {
          const details = await blockchainService.getEscrowDetails(escrowAddress);
          console.log(`\nEscrow: ${escrowAddress}`);
          console.log(`  Status: ${details.statusText}`);
          console.log(`  Amount: ${ethers.formatEther(details.amount)} ETH`);
          console.log(`  Payer: ${details.payer}`);
          console.log(`  Payee: ${details.payee}`);
          console.log(`  Condition Type: ${details.conditionType}`);
          console.log(`  Balance: ${ethers.formatEther(details.balance)} ETH`);
        }
      }
      
      await blockchainService.cleanup();
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Trigger condition command
program
  .command('trigger')
  .description('Manually trigger a condition for demo purposes')
  .requiredOption('-a, --address <address>', 'Escrow contract address')
  .requiredOption('-t, --type <type>', 'Condition type (0=date, 1=task, 2=github, 3=api, 4=custom)')
  .action(async (options) => {
    try {
      const agentService = new AgentService();
      await agentService.initialize();
      
      const conditionType = parseInt(options.type);
      if (conditionType < 0 || conditionType > 4) {
        throw new Error('Invalid condition type. Must be 0-4');
      }
      
      await agentService.triggerCondition(options.address, conditionType);
      
      console.log(`\n✅ Condition triggered for escrow ${options.address}`);
      console.log(`Condition type: ${conditionType}`);
      console.log('The agent will check this condition in the next monitoring cycle.');
      
      await agentService.stop();
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Monitor command (one-time check)
program
  .command('monitor')
  .description('Run a single monitoring cycle')
  .action(async () => {
    try {
      const agentService = new AgentService();
      await agentService.initialize();
      
      console.log('\n=== Running Monitoring Cycle ===');
      await agentService.monitorAgreements();
      console.log('✅ Monitoring cycle completed');
      
      await agentService.stop();
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Settle command (manual settlement)
program
  .command('settle')
  .description('Manually settle an escrow (bypasses condition check)')
  .requiredOption('-a, --address <address>', 'Escrow contract address')
  .action(async (options) => {
    try {
      const blockchainService = new BlockchainService();
      await blockchainService.initialize();
      
      console.log(`\n=== Settling Escrow ${options.address} ===`);
      
      const details = await blockchainService.getEscrowDetails(options.address);
      console.log(`Amount: ${ethers.formatEther(details.amount)} ETH`);
      console.log(`Payer: ${details.payer}`);
      console.log(`Payee: ${details.payee}`);
      console.log(`Current Status: ${details.statusText}`);
      
      if (details.status !== 1) {
        throw new Error(`Cannot settle escrow. Status must be 'Escrowed', but is '${details.statusText}'`);
      }
      
      const result = await blockchainService.settleEscrow(options.address);
      
      console.log('\n✅ Escrow settled successfully!');
      console.log(`Transaction Hash: ${result.txHash}`);
      console.log(`Block Number: ${result.blockNumber}`);
      console.log(`Gas Used: ${result.gasUsed}`);
      
      await blockchainService.cleanup();
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Demo command
program
  .command('demo')
  .description('Run a complete demo scenario')
  .action(async () => {
    try {
      console.log('\n=== TrustFlow Agent Demo ===');
      console.log('This will demonstrate the agent monitoring and settlement process.');
      console.log('Make sure you have created some escrow agreements first!\n');
      
      const agentService = new AgentService();
      await agentService.initialize();
      
      // Get current escrows
      const blockchainService = new BlockchainService();
      await blockchainService.initialize();
      const escrows = await blockchainService.getDeployedEscrows();
      
      if (escrows.length === 0) {
        console.log('❌ No escrow contracts found. Please create some agreements first.');
        await agentService.stop();
        return;
      }
      
      console.log(`Found ${escrows.length} escrow contract(s). Demonstrating condition triggers...\n`);
      
      // Trigger conditions for all escrows
      for (let i = 0; i < escrows.length; i++) {
        const escrowAddress = escrows[i];
        const details = await blockchainService.getEscrowDetails(escrowAddress);
        
        if (details.status === 1) { // Only for escrowed contracts
          console.log(`Triggering condition for escrow ${i + 1}: ${escrowAddress}`);
          await agentService.triggerCondition(escrowAddress, details.conditionType);
          
          // Wait a bit between triggers
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log('\n✅ All conditions triggered. The agent will settle these in the next monitoring cycle.');
      console.log('You can now run the agent with: npm start');
      
      await agentService.stop();
      await blockchainService.cleanup();
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse(); 