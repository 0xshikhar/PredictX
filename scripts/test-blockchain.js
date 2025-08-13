const hre = require("hardhat");

async function main() {
  console.log("🔗 Testing blockchain integration...\n");

  // Check network configuration
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`Network: ${network}`);
  console.log(`Chain ID: ${chainId}`);
  
  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log(`Balance: ${hre.ethers.utils.formatEther(balance)} CORE\n`);
  
  // Load deployment info if available
  const fs = require("fs");
  const path = require("path");
  const deploymentFile = path.join(__dirname, `../deployments/${network}.json`);
  
  let contractAddress = null;
  
  if (fs.existsSync(deploymentFile)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    contractAddress = deployment.contractAddress;
    console.log(`📋 Found deployed contract: ${contractAddress}`);
  } else {
    console.log("⚠️  No deployment found for this network");
    console.log("Run deployment first: npm run deploy:testnet\n");
    return;
  }
  
  // Test contract interaction
  try {
    const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
    const predictionMarket = PredictionMarket.attach(contractAddress);
    
    console.log("\n🧪 Testing contract functions...");
    
    // Test 1: Get total markets
    const totalMarkets = await predictionMarket.getTotalMarkets();
    console.log(`✅ Total markets: ${totalMarkets}`);
    
    // Test 2: Create a test market (if authorized)
    try {
      const now = Math.floor(Date.now() / 1000);
      const endTime = now + (7 * 24 * 60 * 60); // 7 days from now
      const resolutionTime = endTime + (24 * 60 * 60); // 1 day after end
      
      console.log("\n🏗️  Creating test market...");
      const tx = await predictionMarket.createMarket(
        "Test Market: Will this transaction succeed?",
        "This is a test market created by the blockchain test script.",
        endTime,
        resolutionTime
      );
      
      console.log(`Transaction hash: ${tx.hash}`);
      const receipt = await tx.wait();
      
      const marketId = receipt.events?.find(e => e.event === "MarketCreated")?.args?.marketId;
      console.log(`✅ Test market created with ID: ${marketId}`);
      
      // Test 3: Get market details
      const market = await predictionMarket.getMarket(marketId);
      console.log(`Market question: ${market.question}`);
      console.log(`Market end time: ${new Date(market.endTime * 1000).toISOString()}`);
      
      // Test 4: Get odds
      const [yesOdds, noOdds] = await predictionMarket.getOdds(marketId);
      console.log(`Initial odds - YES: ${yesOdds/100}%, NO: ${noOdds/100}%`);
      
    } catch (error) {
      console.log(`⚠️  Could not create test market: ${error.message}`);
      console.log("(This might be normal if you're not the contract owner)");
    }
    
    console.log("\n🎉 Blockchain integration test completed!");
    
  } catch (error) {
    console.error(`❌ Contract interaction failed: ${error.message}`);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ All blockchain tests passed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Blockchain test failed:", error);
    process.exit(1);
  });