// Prediction Market Contract ABIs and addresses
export const PREDICTION_MARKET_ABI = [
  // Market Creation
  {
    "inputs": [
      {"internalType": "string", "name": "question", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "uint256", "name": "resolutionTime", "type": "uint256"}
    ],
    "name": "createMarket",
    "outputs": [{"internalType": "uint256", "name": "marketId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Betting
  {
    "inputs": [
      {"internalType": "uint256", "name": "marketId", "type": "uint256"},
      {"internalType": "bool", "name": "position", "type": "bool"}
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  
  // Market Resolution
  {
    "inputs": [
      {"internalType": "uint256", "name": "marketId", "type": "uint256"},
      {"internalType": "bool", "name": "outcome", "type": "bool"}
    ],
    "name": "resolveMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Claim Winnings
  {
    "inputs": [
      {"internalType": "uint256", "name": "marketId", "type": "uint256"}
    ],
    "name": "claimWinnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // View Functions
  {
    "inputs": [
      {"internalType": "uint256", "name": "marketId", "type": "uint256"}
    ],
    "name": "getMarket",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "question", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "uint256", "name": "endTime", "type": "uint256"},
          {"internalType": "uint256", "name": "resolutionTime", "type": "uint256"},
          {"internalType": "uint256", "name": "totalYesBets", "type": "uint256"},
          {"internalType": "uint256", "name": "totalNoBets", "type": "uint256"},
          {"internalType": "bool", "name": "resolved", "type": "bool"},
          {"internalType": "bool", "name": "outcome", "type": "bool"}
        ],
        "internalType": "struct PredictionMarket.Market",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  {
    "inputs": [
      {"internalType": "uint256", "name": "marketId", "type": "uint256"}
    ],
    "name": "getOdds",
    "outputs": [
      {"internalType": "uint256", "name": "yesOdds", "type": "uint256"},
      {"internalType": "uint256", "name": "noOdds", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "marketId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "question", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256"}
    ],
    "name": "MarketCreated",
    "type": "event"
  },
  
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "marketId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "bettor", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "position", "type": "bool"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "marketId", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "outcome", "type": "bool"}
    ],
    "name": "MarketResolved",
    "type": "event"
  }
] as const;

export const CONTRACT_ADDRESSES = {
  // To be updated with actual deployed addresses
  PREDICTION_MARKET: '0x0000000000000000000000000000000000000000',
  MARKET_FACTORY: '0x0000000000000000000000000000000000000000',
} as const;

export type ContractAddress = typeof CONTRACT_ADDRESSES[keyof typeof CONTRACT_ADDRESSES];