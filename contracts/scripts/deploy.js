const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const EscrowFactory = await hre.ethers.getContractFactory("EscrowFactory");

  // Deploy parameters
  const x402payFeeAddress = process.env.X402PAY_FEE_ADDRESS;
  const x402payFeeAmount = hre.ethers.parseEther("0.001"); // 0.001 ETH fee
  const authorizedAgent = process.env.AUTHORIZED_AGENT_ADDRESS;

  // Deploy the contract
  const escrowFactory = await EscrowFactory.deploy(
    x402payFeeAddress,
    x402payFeeAmount,
    authorizedAgent
  );

  // Wait for deployment to finish
  await escrowFactory.waitForDeployment();

  console.log("EscrowFactory deployed to:", await escrowFactory.getAddress());
  console.log("x402payFeeAddress:", x402payFeeAddress);
  console.log("x402payFeeAmount:", x402payFeeAmount.toString());
  console.log("authorizedAgent:", authorizedAgent);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 