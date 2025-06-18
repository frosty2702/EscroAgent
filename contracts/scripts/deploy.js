const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying EscrowFactory contract...");

  // Get deployment parameters from environment variables
  const x402payFeeAddress = process.env.X402PAY_FEE_ADDRESS;
  const authorizedAgentAddress = process.env.AUTHORIZED_AGENT_ADDRESS;
  
  if (!x402payFeeAddress || !authorizedAgentAddress) {
    throw new Error("Missing required environment variables: X402PAY_FEE_ADDRESS or AUTHORIZED_AGENT_ADDRESS");
  }

  // Set fee amount (0.001 ETH in wei)
  const x402payFeeAmount = ethers.parseEther("0.001");

  console.log("Deployment parameters:");
  console.log("- x402pay Fee Address:", x402payFeeAddress);
  console.log("- Authorized Agent Address:", authorizedAgentAddress);
  console.log("- x402pay Fee Amount:", ethers.formatEther(x402payFeeAmount), "ETH");

  // Get the contract factory
  const EscrowFactory = await ethers.getContractFactory("EscrowFactory");

  // Deploy the contract
  const escrowFactory = await EscrowFactory.deploy(
    x402payFeeAddress,
    x402payFeeAmount,
    authorizedAgentAddress
  );

  await escrowFactory.waitForDeployment();

  const factoryAddress = await escrowFactory.getAddress();
  console.log("EscrowFactory deployed to:", factoryAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "baseSepolia",
    factoryAddress: factoryAddress,
    x402payFeeAddress: x402payFeeAddress,
    authorizedAgentAddress: authorizedAgentAddress,
    x402payFeeAmount: x402payFeeAmount.toString(),
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("\nDeployment completed successfully!");
  console.log("Factory Address:", factoryAddress);
  console.log("Block Number:", deploymentInfo.blockNumber);
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 