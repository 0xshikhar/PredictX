const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer, feeRecipient } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying PredictionMarket contract...");
  log("Network:", network.name);
  log("Deployer:", deployer);
  log("Fee Recipient:", feeRecipient);

  const args = [feeRecipient];

  const predictionMarket = await deploy("PredictionMarket", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log(`PredictionMarket deployed at ${predictionMarket.address}`);
  
  // Verify on Core scan if not on hardhat network
  if (network.name !== "hardhat" && process.env.CORE_SCAN_API_KEY) {
    log("Waiting for block confirmations...");
    await predictionMarket.deployTransaction.wait(6);
    await verify(predictionMarket.address, args);
  }

  log("----------------------------------------------------");
};

async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
}

module.exports.tags = ["all", "prediction-market"];