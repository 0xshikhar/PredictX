export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  endDate: Date;
  resolutionDate?: Date;
  status: MarketStatus;
  totalVolume: number;
  totalBets: number;
  
  // Core blockchain specific
  contractAddress?: string;
  chainId: number;
  
  // Odds
  yesOdds: number;
  noOdds: number;
  
  // Resolution
  outcome?: boolean;
  resolvedAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface Bet {
  id: string;
  userId: string;
  marketId: string;
  amount: number;
  position: boolean; // true = YES, false = NO
  odds: number;
  potential: number;
  status: BetStatus;
  
  // Blockchain
  txHash?: string;
  blockNumber?: bigint;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSwipe {
  id: string;
  userId: string;
  marketId: string;
  direction: SwipeDirection;
  createdAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  categories: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  notificationsEnabled: boolean;
  swipeNotifications: boolean;
  resultNotifications: boolean;
}

export interface Portfolio {
  totalValue: number;
  totalBets: number;
  activeBets: number;
  winRate: number;
  totalWinnings: number;
  positions: PortfolioPosition[];
}

export interface PortfolioPosition {
  marketId: string;
  market: Market;
  bets: Bet[];
  totalAmount: number;
  potentialPayout: number;
  currentValue: number;
  position: boolean;
}

export enum MarketStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  RESOLVED = 'RESOLVED'
}

export enum BetStatus {
  ACTIVE = 'ACTIVE',
  WON = 'WON',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED'
}

export enum SwipeDirection {
  LEFT = 'LEFT',      // Pass/Not Interested
  RIGHT = 'RIGHT',    // Interested/Add to Watchlist
  UP = 'UP',         // Want to bet YES
  DOWN = 'DOWN'      // Want to bet NO
}

export interface SwipeGesture {
  direction: SwipeDirection;
  velocity: number;
  distance: number;
}

export interface MarketFilters {
  categories?: string[];
  status?: MarketStatus[];
  minVolume?: number;
  maxVolume?: number;
  endDateBefore?: Date;
  endDateAfter?: Date;
  sortBy?: 'volume' | 'endDate' | 'createdAt' | 'totalBets';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMarketRequest {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  endDate: Date;
  resolutionDate: Date;
}

export interface PlaceBetRequest {
  marketId: string;
  amount: number;
  position: boolean;
}