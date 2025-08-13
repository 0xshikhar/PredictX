const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log("Creating sample markets on", network);

  // Load deployment info
  const fs = require("fs");
  const path = require("path");
  const deploymentFile = path.join(__dirname, `../deployments/${network}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`No deployment found for network ${network}`);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deployment.contractAddress;
  
  console.log("Using PredictionMarket contract at:", contractAddress);
  
  // Get contract instance
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = PredictionMarket.attach(contractAddress);
  
  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Creating markets with account:", deployer.address);
  
  // Sample markets to create
  const sampleMarkets = [
    {
      question: "Will Bitcoin reach $100,000 by end of 2024?",
      description: "Bitcoin has been showing strong momentum with institutional adoption. Will it break the $100k barrier before December 31st, 2024?",
      daysFromNow: 60,
      resolutionDaysFromEnd: 7,
    },
    {
      question: "Will Ethereum upgrade to PoS 2.0 succeed in 2024?",
      description: "Ethereum continues to evolve with major upgrades. Will the next major upgrade be successfully implemented this year?",
      daysFromNow: 90,
      resolutionDaysFromEnd: 14,
    },
    {
      question: "Will Core blockchain TVL exceed $1B in 2024?",
      description: "Core blockchain has been gaining traction in DeFi. Will its Total Value Locked exceed $1 billion this year?",
      daysFromNow: 120,
      resolutionDaysFromEnd: 7,
    },
    {
      question: "Will Apple stock hit $200 in Q4 2024?",
      description: "Apple's stock has been volatile with AI developments. Will it reach the $200 mark by the end of Q4 2024?",
      daysFromNow: 45,
      resolutionDaysFromEnd: 5,
    },
    {
      question: "Will AI models pass comprehensive Turing test in 2024?",
      description: "With rapid AI advancement, will any AI model convincingly pass a comprehensive Turing test administered by academic institutions this year?",
      daysFromNow: 75,
      resolutionDaysFromEnd: 10,
    },
  ];
  
  console.log(`Creating ${sampleMarkets.length} sample markets...\n`);
  
  for (let i = 0; i < sampleMarkets.length; i++) {
    const market = sampleMarkets[i];
    
    // Calculate timestamps
    const now = Math.floor(Date.now() / 1000);
    const endTime = now + (market.daysFromNow * 24 * 60 * 60);
    const resolutionTime = endTime + (market.resolutionDaysFromEnd * 24 * 60 * 60);
    
    try {
      console.log(`${i + 1}. Creating market: "${market.question}"`);
      console.log(`   End time: ${new Date(endTime * 1000).toISOString()}`);
      console.log(`   Resolution time: ${new Date(resolutionTime * 1000).toISOString()}`);
      
      const tx = await predictionMarket.createMarket(
        market.question,
        market.description,
        endTime,
        resolutionTime
      );
      
      console.log(`   Transaction hash: ${tx.hash}`);
      
      const receipt = await tx.wait();
      const marketId = receipt.events?.find(e => e.event === "MarketCreated")?.args?.marketId;
      
      console.log(`   ✅ Market created with ID: ${marketId}\n`);
      
      // Add a small delay between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`   ❌ Failed to create market: ${error.message}\n`);
    }
  }
  
  // Get total markets count
  const totalMarkets = await predictionMarket.getTotalMarkets();
  console.log(`Total markets in contract: ${totalMarkets}`);
  
  console.log("\n📊 Sample markets created successfully!");
  console.log("You can now test the prediction marketplace with real data.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });