const hre = require("hardhat");

async function main() {
  console.log("Starting deployment to", hre.network.name);
  
  // Get signers
  const [deployer, feeRecipient] = await hre.ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  console.log("Fee recipient address:", feeRecipient.address);
  
  // Check balances
  const deployerBalance = await deployer.getBalance();
  console.log("Deployer balance:", hre.ethers.utils.formatEther(deployerBalance), "CORE");
  
  if (deployerBalance.lt(hre.ethers.utils.parseEther("0.1"))) {
    console.warn("Warning: Deployer balance is low. Consider adding more CORE for gas fees.");
  }

  // Deploy PredictionMarket contract
  console.log("\nDeploying PredictionMarket contract...");
  
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(feeRecipient.address);
  
  await predictionMarket.deployed();
  
  console.log("PredictionMarket deployed to:", predictionMarket.address);
  console.log("Transaction hash:", predictionMarket.deployTransaction.hash);
  
  // Wait for confirmations
  console.log("Waiting for confirmations...");
  await predictionMarket.deployTransaction.wait(3);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractAddress: predictionMarket.address,
    deployerAddress: deployer.address,
    feeRecipientAddress: feeRecipient.address,
    transactionHash: predictionMarket.deployTransaction.hash,
    blockNumber: predictionMarket.deployTransaction.blockNumber,
    gasUsed: predictionMarket.deployTransaction.gasLimit?.toString(),
    timestamp: new Date().toISOString(),
  };
  
  console.log("\nDeployment completed!");
  console.log("Contract Address:", predictionMarket.address);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  
  // Save to file
  const fs = require("fs");
  const path = require("path");
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`Deployment info saved to: ${deploymentFile}`);
  
  // Update contract addresses in web3 config
  const contractsPath = path.join(__dirname, "../lib/web3/contracts.ts");
  if (fs.existsSync(contractsPath)) {
    let contractsContent = fs.readFileSync(contractsPath, "utf8");
    contractsContent = contractsContent.replace(
      /PREDICTION_MARKET: '[^']*'/,
      `PREDICTION_MARKET: '${predictionMarket.address}'`
    );
    fs.writeFileSync(contractsPath, contractsContent);
    console.log("Updated contract address in lib/web3/contracts.ts");
  }
  
  return predictionMarket;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });