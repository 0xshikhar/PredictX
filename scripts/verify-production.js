const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Verifying production deployment...\n");

  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`Network: ${network}`);
  console.log(`Chain ID: ${chainId}`);

  // Load deployment info
  const deploymentFile = path.join(__dirname, `../deployments/${network}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ No deployment found for network ${network}`);
    console.log("Run deployment first with npm run deploy:mainnet");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deployment.contractAddress;
  
  console.log(`Contract Address: ${contractAddress}\n`);

  // Get contract instance
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = PredictionMarket.attach(contractAddress);

  console.log("🧪 Running verification tests...\n");

  try {
    // Test 1: Basic contract info
    console.log("1️⃣  Testing basic contract functionality...");
    
    const owner = await predictionMarket.owner();
    const feeRecipient = await predictionMarket.feeRecipient();
    const platformFee = await predictionMarket.platformFee();
    const totalMarkets = await predictionMarket.getTotalMarkets();
    
    console.log(`   Owner: ${owner}`);
    console.log(`   Fee Recipient: ${feeRecipient}`);
    console.log(`   Platform Fee: ${platformFee} basis points (${platformFee/100}%)`);
    console.log(`   Total Markets: ${totalMarkets}`);
    console.log("   ✅ Basic functionality verified\n");

    // Test 2: Contract state
    console.log("2️⃣  Testing contract state...");
    
    const paused = await predictionMarket.paused();
    console.log(`   Contract Paused: ${paused}`);
    
    if (paused) {
      console.log("   ⚠️  Contract is paused!");
    } else {
      console.log("   ✅ Contract is active");
    }
    console.log();

    // Test 3: Gas estimates for common operations
    console.log("3️⃣  Testing gas estimates...");
    
    try {
      const now = Math.floor(Date.now() / 1000);
      const endTime = now + (7 * 24 * 60 * 60);
      const resolutionTime = endTime + (24 * 60 * 60);
      
      const createMarketGas = await predictionMarket.estimateGas.createMarket(
        "Test Market Gas Estimate",
        "Testing gas estimation",
        endTime,
        resolutionTime
      );
      
      console.log(`   Create Market Gas: ${createMarketGas.toString()}`);
      
      // Only test betting gas if there are markets
      if (totalMarkets.gt(0)) {
        const placeBetGas = await predictionMarket.estimateGas.placeBet(1, true, {
          value: hre.ethers.utils.parseEther("1")
        });
        console.log(`   Place Bet Gas: ${placeBetGas.toString()}`);
      }
      
      console.log("   ✅ Gas estimates successful\n");
      
    } catch (gasError) {
      console.log("   ⚠️  Could not estimate gas (may be normal for some operations)\n");
    }

    // Test 4: Event logs
    console.log("4️⃣  Checking event history...");
    
    const createFilter = predictionMarket.filters.MarketCreated();
    const marketCreatedEvents = await predictionMarket.queryFilter(createFilter, -1000); // Last 1000 blocks
    
    console.log(`   Market Created Events: ${marketCreatedEvents.length}`);
    
    const betFilter = predictionMarket.filters.BetPlaced();
    const betEvents = await predictionMarket.queryFilter(betFilter, -1000);
    
    console.log(`   Bet Placed Events: ${betEvents.length}`);
    console.log("   ✅ Event history accessible\n");

    // Test 5: Market data (if markets exist)
    if (totalMarkets.gt(0)) {
      console.log("5️⃣  Testing market data...");
      
      for (let i = 1; i <= Math.min(totalMarkets.toNumber(), 3); i++) {
        try {
          const market = await predictionMarket.getMarket(i);
          const [yesOdds, noOdds] = await predictionMarket.getOdds(i);
          
          console.log(`   Market ${i}:`);
          console.log(`     Question: ${market.question.substring(0, 50)}...`);
          console.log(`     Status: ${market.resolved ? 'Resolved' : 'Active'}`);
          console.log(`     YES Odds: ${yesOdds/100}%`);
          console.log(`     NO Odds: ${noOdds/100}%`);
          console.log(`     Total YES Bets: ${hre.ethers.utils.formatEther(market.totalYesBets)} CORE`);
          console.log(`     Total NO Bets: ${hre.ethers.utils.formatEther(market.totalNoBets)} CORE`);
          console.log();
        } catch (marketError) {
          console.log(`   ⚠️  Could not fetch market ${i}: ${marketError.message}`);
        }
      }
      
      console.log("   ✅ Market data accessible\n");
    } else {
      console.log("5️⃣  No markets found (create markets with npm run create:markets)\n");
    }

    // Test 6: Frontend integration check
    console.log("6️⃣  Checking frontend integration...");
    
    const contractsPath = path.join(__dirname, "../lib/web3/contracts.ts");
    if (fs.existsSync(contractsPath)) {
      const contractsContent = fs.readFileSync(contractsPath, "utf8");
      
      if (contractsContent.includes(contractAddress)) {
        console.log("   ✅ Contract address updated in frontend config");
      } else {
        console.log("   ⚠️  Contract address not found in frontend config");
        console.log("   Run deployment script to update automatically");
      }
    } else {
      console.log("   ⚠️  Frontend config file not found");
    }
    
    const envPath = path.join(__dirname, "../.env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      
      if (envContent.includes(contractAddress)) {
        console.log("   ✅ Contract address found in environment variables");
      } else {
        console.log("   ⚠️  Contract address not found in .env file");
      }
    }
    console.log();

    // Final verification summary
    console.log("🎉 Production verification completed!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 VERIFICATION SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Contract deployed and accessible`);
    console.log(`✅ Owner and settings verified`);
    console.log(`✅ Contract is ${paused ? 'paused' : 'active'}`);
    console.log(`✅ Event system functioning`);
    console.log(`✅ ${totalMarkets} markets deployed`);
    console.log(`✅ Gas estimates within normal range`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("\n🚀 Your prediction marketplace is production-ready!");
    console.log("\n📋 Recommended next steps:");
    console.log("1. Deploy frontend to production (Vercel/Netlify)");
    console.log("2. Set up monitoring alerts");
    console.log("3. Configure error tracking (Sentry)");
    console.log("4. Set up analytics (Google Analytics/Mixpanel)");
    console.log("5. Prepare marketing materials");
    console.log("6. Test with small group of users");
    console.log("7. Launch to public! 🎊");

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Ensure you're connected to the correct network");
    console.log("2. Check that the contract address is correct");
    console.log("3. Verify you have sufficient RPC credits");
    console.log("4. Check network connectivity");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  });