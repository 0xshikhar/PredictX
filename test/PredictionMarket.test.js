const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PredictionMarket", function () {
  let PredictionMarket;
  let predictionMarket;
  let owner;
  let feeRecipient;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, feeRecipient, user1, user2] = await ethers.getSigners();

    PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    predictionMarket = await PredictionMarket.deploy(feeRecipient.address);
    await predictionMarket.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct fee recipient", async function () {
      expect(await predictionMarket.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("Should set the correct owner", async function () {
      expect(await predictionMarket.owner()).to.equal(owner.address);
    });

    it("Should have zero markets initially", async function () {
      expect(await predictionMarket.getTotalMarkets()).to.equal(0);
    });

    it("Should have correct platform fee", async function () {
      expect(await predictionMarket.platformFee()).to.equal(250); // 2.5%
    });
  });

  describe("Market Creation", function () {
    const question = "Will Bitcoin reach $100k by end of 2024?";
    const description = "Bitcoin market prediction";
    let endTime;
    let resolutionTime;

    beforeEach(function () {
      const now = Math.floor(Date.now() / 1000);
      endTime = now + (7 * 24 * 60 * 60); // 7 days from now
      resolutionTime = endTime + (24 * 60 * 60); // 1 day after end
    });

    it("Should create a market successfully", async function () {
      const tx = await predictionMarket.createMarket(
        question,
        description,
        endTime,
        resolutionTime
      );

      await expect(tx)
        .to.emit(predictionMarket, "MarketCreated")
        .withArgs(1, question, endTime, resolutionTime, owner.address);

      expect(await predictionMarket.getTotalMarkets()).to.equal(1);

      const market = await predictionMarket.getMarket(1);
      expect(market.question).to.equal(question);
      expect(market.description).to.equal(description);
      expect(market.endTime).to.equal(endTime);
      expect(market.resolutionTime).to.equal(resolutionTime);
      expect(market.resolved).to.be.false;
      expect(market.creator).to.equal(owner.address);
    });

    it("Should reject empty question", async function () {
      await expect(
        predictionMarket.createMarket("", description, endTime, resolutionTime)
      ).to.be.revertedWith("Question cannot be empty");
    });

    it("Should reject past end time", async function () {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        predictionMarket.createMarket(question, description, pastTime, resolutionTime)
      ).to.be.revertedWith("End time must be in the future");
    });

    it("Should reject resolution time before end time", async function () {
      await expect(
        predictionMarket.createMarket(question, description, endTime, endTime - 3600)
      ).to.be.revertedWith("Resolution time must be after end time");
    });
  });

  describe("Betting", function () {
    let marketId = 1;
    let endTime;
    let resolutionTime;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      endTime = now + (7 * 24 * 60 * 60);
      resolutionTime = endTime + (24 * 60 * 60);

      await predictionMarket.createMarket(
        "Test Market",
        "Test Description",
        endTime,
        resolutionTime
      );
    });

    it("Should place a YES bet successfully", async function () {
      const betAmount = ethers.utils.parseEther("1");

      const tx = await predictionMarket.connect(user1).placeBet(marketId, true, {
        value: betAmount,
      });

      await expect(tx)
        .to.emit(predictionMarket, "BetPlaced")
        .withArgs(marketId, 1, user1.address, true, betAmount, await getTimestamp());

      const market = await predictionMarket.getMarket(marketId);
      expect(market.totalYesBets).to.equal(betAmount);
      expect(market.totalNoBets).to.equal(0);
    });

    it("Should place a NO bet successfully", async function () {
      const betAmount = ethers.utils.parseEther("0.5");

      await predictionMarket.connect(user1).placeBet(marketId, false, {
        value: betAmount,
      });

      const market = await predictionMarket.getMarket(marketId);
      expect(market.totalNoBets).to.equal(betAmount);
      expect(market.totalYesBets).to.equal(0);
    });

    it("Should reject bets below minimum", async function () {
      const betAmount = ethers.utils.parseEther("0.005"); // Below MIN_BET

      await expect(
        predictionMarket.connect(user1).placeBet(marketId, true, {
          value: betAmount,
        })
      ).to.be.revertedWith("Bet amount too small");
    });

    it("Should reject bets above maximum", async function () {
      const betAmount = ethers.utils.parseEther("1001"); // Above MAX_BET

      await expect(
        predictionMarket.connect(user1).placeBet(marketId, true, {
          value: betAmount,
        })
      ).to.be.revertedWith("Bet amount too large");
    });

    it("Should reject bets on ended markets", async function () {
      // Fast forward time to after market end
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]); // 8 days
      await ethers.provider.send("evm_mine");

      const betAmount = ethers.utils.parseEther("1");

      await expect(
        predictionMarket.connect(user1).placeBet(marketId, true, {
          value: betAmount,
        })
      ).to.be.revertedWith("Market has ended");
    });

    it("Should calculate odds correctly", async function () {
      // Place initial bets
      await predictionMarket.connect(user1).placeBet(marketId, true, {
        value: ethers.utils.parseEther("3"), // 3 CORE on YES
      });

      await predictionMarket.connect(user2).placeBet(marketId, false, {
        value: ethers.utils.parseEther("1"), // 1 CORE on NO
      });

      const [yesOdds, noOdds] = await predictionMarket.getOdds(marketId);
      
      // Total pool = 4 CORE
      // YES pool = 3 CORE = 75%
      // NO pool = 1 CORE = 25%
      expect(yesOdds).to.equal(7500); // 75% in basis points
      expect(noOdds).to.equal(2500);  // 25% in basis points
    });
  });

  describe("Market Resolution", function () {
    let marketId = 1;
    let endTime;
    let resolutionTime;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      endTime = now + (7 * 24 * 60 * 60);
      resolutionTime = endTime + (24 * 60 * 60);

      await predictionMarket.createMarket(
        "Test Market",
        "Test Description",
        endTime,
        resolutionTime
      );

      // Place some bets
      await predictionMarket.connect(user1).placeBet(marketId, true, {
        value: ethers.utils.parseEther("2"),
      });

      await predictionMarket.connect(user2).placeBet(marketId, false, {
        value: ethers.utils.parseEther("1"),
      });

      // Fast forward to after market end
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
    });

    it("Should resolve market successfully", async function () {
      const tx = await predictionMarket.resolveMarket(marketId, true); // YES wins

      await expect(tx)
        .to.emit(predictionMarket, "MarketResolved")
        .withArgs(
          marketId,
          true,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("1")
        );

      const market = await predictionMarket.getMarket(marketId);
      expect(market.resolved).to.be.true;
      expect(market.outcome).to.be.true;
    });

    it("Should reject resolution by non-owner", async function () {
      await expect(
        predictionMarket.connect(user1).resolveMarket(marketId, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject resolution before market end", async function () {
      // Create a new market that hasn't ended
      const now = Math.floor(Date.now() / 1000);
      const futureEndTime = now + (7 * 24 * 60 * 60);
      const futureResolutionTime = futureEndTime + (24 * 60 * 60);

      await predictionMarket.createMarket(
        "Future Market",
        "Future Description",
        futureEndTime,
        futureResolutionTime
      );

      await expect(
        predictionMarket.resolveMarket(2, true)
      ).to.be.revertedWith("Market still active");
    });
  });

  describe("Claims", function () {
    let marketId = 1;
    let endTime;
    let resolutionTime;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      endTime = now + (7 * 24 * 60 * 60);
      resolutionTime = endTime + (24 * 60 * 60);

      await predictionMarket.createMarket(
        "Test Market",
        "Test Description",
        endTime,
        resolutionTime
      );

      // Place bets
      await predictionMarket.connect(user1).placeBet(marketId, true, {
        value: ethers.utils.parseEther("2"),
      });

      await predictionMarket.connect(user2).placeBet(marketId, false, {
        value: ethers.utils.parseEther("1"),
      });

      // Fast forward and resolve
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await predictionMarket.resolveMarket(marketId, true); // YES wins
    });

    it("Should allow winners to claim", async function () {
      const initialBalance = await user1.getBalance();

      const tx = await predictionMarket.connect(user1).claimWinnings(marketId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await user1.getBalance();

      // User1 should receive their 2 CORE back plus winnings from user2's 1 CORE (minus fees)
      const expectedWinnings = await predictionMarket.calculateWinnings(
        marketId,
        ethers.utils.parseEther("2"),
        true
      );

      expect(finalBalance.add(gasUsed)).to.be.closeTo(
        initialBalance.add(expectedWinnings),
        ethers.utils.parseEther("0.01") // Small tolerance for gas variations
      );
    });

    it("Should reject claims from losers", async function () {
      await expect(
        predictionMarket.connect(user2).claimWinnings(marketId)
      ).to.be.revertedWith("No winnings to claim");
    });

    it("Should reject claims from unresolved markets", async function () {
      // Create new unresolved market
      const now = Math.floor(Date.now() / 1000);
      await predictionMarket.createMarket(
        "Unresolved Market",
        "Description",
        now + (7 * 24 * 60 * 60),
        now + (8 * 24 * 60 * 60)
      );

      await expect(
        predictionMarket.connect(user1).claimWinnings(2)
      ).to.be.revertedWith("Market not resolved");
    });
  });

  describe("Platform Fees", function () {
    it("Should update platform fee", async function () {
      const newFee = 500; // 5%

      await predictionMarket.updatePlatformFee(newFee);

      expect(await predictionMarket.platformFee()).to.equal(newFee);
    });

    it("Should reject fee above maximum", async function () {
      await expect(
        predictionMarket.updatePlatformFee(1100) // 11%, above MAX_FEE
      ).to.be.revertedWith("Fee too high");
    });

    it("Should reject fee update from non-owner", async function () {
      await expect(
        predictionMarket.connect(user1).updatePlatformFee(500)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  // Helper function to get current block timestamp
  async function getTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
});