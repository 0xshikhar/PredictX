const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting production deployment...\n");

  // Verify we're on the correct network
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`Network: ${network}`);
  console.log(`Chain ID: ${chainId}`);
  
  if (network !== "core_mainnet") {
    console.error("❌ This script should only be run on Core mainnet!");
    console.log("Use: npm run deploy:mainnet");
    process.exit(1);
  }

  // Get deployment configuration
  const [deployer, feeRecipient] = await hre.ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  console.log("Fee recipient address:", feeRecipient.address);
  
  // Check balances
  const deployerBalance = await deployer.getBalance();
  console.log("Deployer balance:", hre.ethers.utils.formatEther(deployerBalance), "CORE");
  
  if (deployerBalance.lt(hre.ethers.utils.parseEther("1"))) {
    console.error("❌ Insufficient balance for deployment!");
    console.log("Minimum required: 1 CORE for gas fees");
    process.exit(1);
  }

  // Pre-deployment checks
  console.log("\n🔍 Running pre-deployment checks...");
  
  // Check if contract is already deployed
  const deploymentFile = path.join(__dirname, "../deployments/core_mainnet.json");
  if (fs.existsSync(deploymentFile)) {
    console.log("⚠️  Existing deployment found!");
    const existing = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    console.log("Existing contract:", existing.contractAddress);
    
    const proceed = process.env.FORCE_REDEPLOY === "true";
    if (!proceed) {
      console.log("Set FORCE_REDEPLOY=true to redeploy");
      process.exit(1);
    }
  }

  // Deploy PredictionMarket contract
  console.log("\n📋 Deploying PredictionMarket contract...");
  
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  
  // Calculate gas estimate
  const deploymentData = PredictionMarket.getDeployTransaction(feeRecipient.address);
  const gasEstimate = await hre.ethers.provider.estimateGas(deploymentData);
  const gasPrice = await hre.ethers.provider.getGasPrice();
  const deploymentCost = gasEstimate.mul(gasPrice);
  
  console.log("Estimated gas:", gasEstimate.toString());
  console.log("Gas price:", hre.ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");
  console.log("Estimated cost:", hre.ethers.utils.formatEther(deploymentCost), "CORE");
  
  // Deploy with explicit gas settings
  const predictionMarket = await PredictionMarket.deploy(feeRecipient.address, {
    gasLimit: gasEstimate.mul(120).div(100), // 20% buffer
    gasPrice: gasPrice,
  });
  
  console.log("Transaction hash:", predictionMarket.deployTransaction.hash);
  console.log("Waiting for deployment...");
  
  await predictionMarket.deployed();
  
  console.log("✅ PredictionMarket deployed to:", predictionMarket.address);
  
  // Wait for confirmations
  console.log("Waiting for block confirmations...");
  await predictionMarket.deployTransaction.wait(6);
  
  // Verify contract ownership and settings
  console.log("\n🔧 Verifying contract settings...");
  
  const owner = await predictionMarket.owner();
  const contractFeeRecipient = await predictionMarket.feeRecipient();
  const platformFee = await predictionMarket.platformFee();
  
  console.log("Contract owner:", owner);
  console.log("Fee recipient:", contractFeeRecipient);
  console.log("Platform fee:", platformFee.toString(), "basis points");
  
  if (owner !== deployer.address) {
    console.error("❌ Contract owner mismatch!");
    process.exit(1);
  }
  
  if (contractFeeRecipient !== feeRecipient.address) {
    console.error("❌ Fee recipient mismatch!");
    process.exit(1);
  }

  // Save deployment info
  const deploymentInfo = {
    network: network,
    chainId: chainId,
    contractAddress: predictionMarket.address,
    deployerAddress: deployer.address,
    feeRecipientAddress: feeRecipient.address,
    transactionHash: predictionMarket.deployTransaction.hash,
    blockNumber: predictionMarket.deployTransaction.blockNumber,
    gasUsed: gasEstimate.toString(),
    gasCost: hre.ethers.utils.formatEther(deploymentCost),
    platformFee: platformFee.toString(),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);
  
  // Update contract addresses in web3 config
  const contractsPath = path.join(__dirname, "../lib/web3/contracts.ts");
  if (fs.existsSync(contractsPath)) {
    let contractsContent = fs.readFileSync(contractsPath, "utf8");
    contractsContent = contractsContent.replace(
      /PREDICTION_MARKET: '[^']*'/,
      `PREDICTION_MARKET: '${predictionMarket.address}'`
    );
    fs.writeFileSync(contractsPath, contractsContent);
    console.log("✅ Updated contract address in lib/web3/contracts.ts");
  }
  
  // Update environment variables
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Update or add contract address
    if (envContent.includes("NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT=.*/,
        `NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT="${predictionMarket.address}"`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_PREDICTION_MARKET_CONTRACT="${predictionMarket.address}"\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Updated .env with contract address");
  }
  
  // Contract verification
  if (process.env.CORE_SCAN_API_KEY) {
    console.log("\n🔍 Verifying contract on CoreScan...");
    try {
      await hre.run("verify:verify", {
        address: predictionMarket.address,
        constructorArguments: [feeRecipient.address],
      });
      console.log("✅ Contract verified on CoreScan");
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error.message);
      console.log("You can manually verify later on CoreScan");
    }
  } else {
    console.log("⚠️  Skipping contract verification (no API key)");
  }
  
  // Final summary
  console.log("\n🎉 Production deployment completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Network:         ${network} (${chainId})`);
  console.log(`Contract:        ${predictionMarket.address}`);
  console.log(`Transaction:     ${predictionMarket.deployTransaction.hash}`);
  console.log(`Gas Cost:        ${hre.ethers.utils.formatEther(deploymentCost)} CORE`);
  console.log(`Owner:           ${deployer.address}`);
  console.log(`Fee Recipient:   ${feeRecipient.address}`);
  console.log(`Platform Fee:    ${platformFee.toString()} basis points (${platformFee/100}%)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Create initial markets: npm run create:markets");
  console.log("2. Test contract: npm run test:blockchain");
  console.log("3. Deploy frontend to production");
  console.log("4. Set up monitoring and alerts");
  console.log("5. Announce launch! 🚀");
  
  return predictionMarket;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Production deployment failed:", error);
    process.exit(1);
  });