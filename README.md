# Decentralized Escrow & Conditional Payments Agent (x402Escrow)

A trustless, autonomous system for conditional payments built on Base L2. This project enables automated escrow settlements based on predefined conditions without requiring human intervention.

## Core Features

- **Smart Escrow Contracts**: Deploy individual escrow contracts for each agreement
- **Conditional Logic**: Support for different condition types (date, task completion, PR merges, etc.)
- **Autonomous Agent**: Off-chain agent that monitors conditions and settles payments automatically
- **x402pay Integration**: Monetization via x402pay for each successful settlement
- **CDP Wallet Integration**: Leverages programmable wallets for complex financial interactions

## Project Structure

- `/contracts`: Solidity smart contracts for the escrow system
- `/agent`: Off-chain agent built with AgentKit
- `/frontend`: User interface for creating and monitoring agreements
- `/sample`: Sample implementation and demos

## Getting Started

1. Install dependencies: `npm install`
2. Deploy contracts: `npx hardhat deploy --network base-goerli`
3. Start the agent: `cd agent && npm start`
4. Launch the UI: `cd frontend && npm start`

## Architecture

The system consists of three main components:
1. Smart contracts for secure on-chain escrow
2. Off-chain agent for autonomous condition monitoring
3. User interface for agreement creation and management 