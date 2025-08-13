// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PredictionMarket
 * @dev A decentralized prediction market contract for Core blockchain
 */
contract PredictionMarket is Ownable, ReentrancyGuard, Pausable {
    struct Market {
        uint256 id;
        string question;
        string description;
        uint256 endTime;
        uint256 resolutionTime;
        uint256 totalYesBets;
        uint256 totalNoBets;
        bool resolved;
        bool outcome;
        address creator;
        uint256 createdAt;
    }

    struct Bet {
        uint256 marketId;
        address bettor;
        bool position; // true = YES, false = NO
        uint256 amount;
        uint256 timestamp;
        bool claimed;
    }

    // State variables
    uint256 private _marketCounter;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Bet[]) public marketBets;
    mapping(address => mapping(uint256 => uint256[])) public userBets; // user => marketId => betIds
    mapping(uint256 => uint256) public betIdToMarketId;
    
    uint256 public platformFee = 250; // 2.5% (in basis points)
    uint256 public constant MAX_FEE = 1000; // 10% max fee
    uint256 public constant MIN_BET = 0.01 ether;
    uint256 public constant MAX_BET = 1000 ether;
    
    address public feeRecipient;
    uint256 private _betCounter;

    // Events
    event MarketCreated(
        uint256 indexed marketId,
        string question,
        uint256 endTime,
        uint256 resolutionTime,
        address indexed creator
    );
    
    event BetPlaced(
        uint256 indexed marketId,
        uint256 indexed betId,
        address indexed bettor,
        bool position,
        uint256 amount,
        uint256 timestamp
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        bool outcome,
        uint256 totalYesBets,
        uint256 totalNoBets
    );
    
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed winner,
        uint256 amount
    );
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);

    modifier validMarket(uint256 marketId) {
        require(marketId > 0 && marketId <= _marketCounter, "Invalid market ID");
        _;
    }

    modifier marketActive(uint256 marketId) {
        require(block.timestamp < markets[marketId].endTime, "Market has ended");
        require(!markets[marketId].resolved, "Market already resolved");
        _;
    }

    modifier marketResolvable(uint256 marketId) {
        require(block.timestamp >= markets[marketId].endTime, "Market still active");
        require(!markets[marketId].resolved, "Market already resolved");
        _;
    }

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Create a new prediction market
     */
    function createMarket(
        string memory question,
        string memory description,
        uint256 endTime,
        uint256 resolutionTime
    ) external whenNotPaused returns (uint256) {
        require(bytes(question).length > 0, "Question cannot be empty");
        require(endTime > block.timestamp, "End time must be in the future");
        require(resolutionTime > endTime, "Resolution time must be after end time");
        require(endTime <= block.timestamp + 365 days, "End time too far in future");

        _marketCounter++;
        uint256 marketId = _marketCounter;

        markets[marketId] = Market({
            id: marketId,
            question: question,
            description: description,
            endTime: endTime,
            resolutionTime: resolutionTime,
            totalYesBets: 0,
            totalNoBets: 0,
            resolved: false,
            outcome: false,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        emit MarketCreated(marketId, question, endTime, resolutionTime, msg.sender);
        return marketId;
    }

    /**
     * @dev Place a bet on a market
     */
    function placeBet(uint256 marketId, bool position) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validMarket(marketId) 
        marketActive(marketId) 
    {
        require(msg.value >= MIN_BET, "Bet amount too small");
        require(msg.value <= MAX_BET, "Bet amount too large");

        _betCounter++;
        uint256 betId = _betCounter;

        // Create bet
        Bet memory newBet = Bet({
            marketId: marketId,
            bettor: msg.sender,
            position: position,
            amount: msg.value,
            timestamp: block.timestamp,
            claimed: false
        });

        marketBets[marketId].push(newBet);
        userBets[msg.sender][marketId].push(betId);
        betIdToMarketId[betId] = marketId;

        // Update market totals
        if (position) {
            markets[marketId].totalYesBets += msg.value;
        } else {
            markets[marketId].totalNoBets += msg.value;
        }

        emit BetPlaced(marketId, betId, msg.sender, position, msg.value, block.timestamp);
    }

    /**
     * @dev Resolve a market (only owner)
     */
    function resolveMarket(uint256 marketId, bool outcome) 
        external 
        onlyOwner 
        validMarket(marketId) 
        marketResolvable(marketId) 
    {
        markets[marketId].resolved = true;
        markets[marketId].outcome = outcome;

        emit MarketResolved(
            marketId,
            outcome,
            markets[marketId].totalYesBets,
            markets[marketId].totalNoBets
        );
    }

    /**
     * @dev Claim winnings from a resolved market
     */
    function claimWinnings(uint256 marketId) 
        external 
        nonReentrant 
        validMarket(marketId) 
    {
        require(markets[marketId].resolved, "Market not resolved");
        
        uint256 totalWinnings = 0;
        Bet[] storage bets = marketBets[marketId];
        
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].bettor == msg.sender && 
                bets[i].position == markets[marketId].outcome && 
                !bets[i].claimed) {
                
                bets[i].claimed = true;
                uint256 winnings = calculateWinnings(marketId, bets[i].amount, bets[i].position);
                totalWinnings += winnings;
            }
        }

        require(totalWinnings > 0, "No winnings to claim");

        // Transfer winnings
        (bool success, ) = payable(msg.sender).call{value: totalWinnings}("");
        require(success, "Transfer failed");

        emit WinningsClaimed(marketId, msg.sender, totalWinnings);
    }

    /**
     * @dev Calculate winnings for a bet
     */
    function calculateWinnings(uint256 marketId, uint256 betAmount, bool position) 
        public 
        view 
        returns (uint256) 
    {
        Market memory market = markets[marketId];
        uint256 totalPool = market.totalYesBets + market.totalNoBets;
        uint256 winningPool = position ? market.totalYesBets : market.totalNoBets;
        uint256 losingPool = position ? market.totalNoBets : market.totalYesBets;

        if (winningPool == 0 || totalPool == 0) return 0;

        // Calculate winnings: (betAmount / winningPool) * losingPool + betAmount
        uint256 profit = (betAmount * losingPool) / winningPool;
        uint256 grossWinnings = betAmount + profit;
        
        // Deduct platform fee from profit only
        uint256 fee = (profit * platformFee) / 10000;
        return grossWinnings - fee;
    }

    /**
     * @dev Get market odds (returns percentage for YES and NO)
     */
    function getOdds(uint256 marketId) 
        external 
        view 
        validMarket(marketId) 
        returns (uint256 yesOdds, uint256 noOdds) 
    {
        Market memory market = markets[marketId];
        uint256 totalPool = market.totalYesBets + market.totalNoBets;
        
        if (totalPool == 0) {
            return (5000, 5000); // 50/50 if no bets
        }
        
        yesOdds = (market.totalYesBets * 10000) / totalPool;
        noOdds = (market.totalNoBets * 10000) / totalPool;
    }

    /**
     * @dev Get market details
     */
    function getMarket(uint256 marketId) 
        external 
        view 
        validMarket(marketId) 
        returns (Market memory) 
    {
        return markets[marketId];
    }

    /**
     * @dev Get user bets for a market
     */
    function getUserBets(address user, uint256 marketId) 
        external 
        view 
        returns (Bet[] memory) 
    {
        uint256[] memory betIds = userBets[user][marketId];
        Bet[] memory bets = new Bet[](betIds.length);
        
        for (uint256 i = 0; i < betIds.length; i++) {
            // Find bet in marketBets array
            Bet[] memory marketBetArray = marketBets[marketId];
            for (uint256 j = 0; j < marketBetArray.length; j++) {
                if (marketBetArray[j].bettor == user) {
                    bets[i] = marketBetArray[j];
                    break;
                }
            }
        }
        
        return bets;
    }

    /**
     * @dev Get total markets count
     */
    function getTotalMarkets() external view returns (uint256) {
        return _marketCounter;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdraw failed");
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        uint256 oldFee = platformFee;
        platformFee = newFee;
        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw platform fees (only fee recipient)
     */
    function withdrawFees() external {
        require(msg.sender == feeRecipient, "Not fee recipient");
        // Implementation would track fees separately in production
        // For now, this is a placeholder
    }

    /**
     * @dev Fallback function to reject direct payments
     */
    receive() external payable {
        revert("Direct payments not accepted");
    }
}