const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying EscrowFactory contract...");

  // Get deployment parameters from environment variables
  const x402payFeeAddress = process.env.X402PAY_FEE_ADDRESS;
  const authorizedAgentAddress = process.env.AUTHORIZED_AGENT_ADDRESS;
  
  if (!x402payFeeAddress || !authorizedAgentAddress) {
    throw new Error("Missing required environment variables: X402PAY_FEE_ADDRESS or AUTHORIZED_AGENT_ADDRESS");
  }

  // Set fee amounts
  const x402payFeeAmount = ethers.parseEther("0.001"); // Settlement fee
  
  // Get creation fee from environment variable or use default
  const creationFeeEth = process.env.X402PAY_CREATION_FEE_ETH || "0.0005";
  const x402payCreationFee = ethers.parseEther(creationFeeEth);

  console.log("Deployment parameters:");
  console.log("- x402pay Fee Address:", x402payFeeAddress);
  console.log("- Authorized Agent Address:", authorizedAgentAddress);
  console.log("- x402pay Settlement Fee Amount:", ethers.formatEther(x402payFeeAmount), "ETH");
  console.log("- x402pay Creation Fee Amount:", ethers.formatEther(x402payCreationFee), "ETH");

  // Get the contract factory
  const EscrowFactory = await ethers.getContractFactory("EscrowFactory");

  // Deploy the contract with the new creation fee parameter
  const escrowFactory = await EscrowFactory.deploy(
    x402payFeeAddress,
    x402payFeeAmount,
    authorizedAgentAddress,
    x402payCreationFee
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
    x402payCreationFee: x402payCreationFee.toString(),
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("\nDeployment completed successfully!");
  console.log("Factory Address:", factoryAddress);
  console.log("Settlement Fee:", ethers.formatEther(x402payFeeAmount), "ETH");
  console.log("Creation Fee:", ethers.formatEther(x402payCreationFee), "ETH");
  console.log("Block Number:", deploymentInfo.blockNumber);
  
  // Prepare constructor arguments for verification
  const constructorArguments = [
    x402payFeeAddress,
    x402payFeeAmount,
    authorizedAgentAddress,
    x402payCreationFee
  ];

  console.log("\nFor contract verification, use these constructor arguments:");
  console.log(JSON.stringify(constructorArguments, null, 2));
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 