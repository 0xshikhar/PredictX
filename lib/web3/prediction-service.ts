import { createPublicClient, createWalletClient, custom, formatEther, parseEther } from 'viem';
import { coreChain, defaultChain } from './core-config';
import { PREDICTION_MARKET_ABI, CONTRACT_ADDRESSES } from './contracts';
import { Market, PlaceBetRequest } from '@/lib/types/prediction';

export class PredictionService {
  private publicClient;
  private walletClient;

  constructor(walletClient?: any) {
    this.publicClient = createPublicClient({
      chain: defaultChain,
      transport: custom(window.ethereum || {}),
    });

    if (walletClient) {
      this.walletClient = walletClient;
    }
  }

  /**
   * Get market data from blockchain
   */
  async getMarketFromChain(marketId: string) {
    try {
      const result = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getMarket',
        args: [BigInt(marketId)],
      });

      return result;
    } catch (error) {
      console.error('Error fetching market from chain:', error);
      throw error;
    }
  }

  /**
   * Get current odds for a market
   */
  async getMarketOdds(marketId: string): Promise<{ yesOdds: number; noOdds: number }> {
    try {
      const result = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getOdds',
        args: [BigInt(marketId)],
      });

      const [yesOdds, noOdds] = result as [bigint, bigint];
      
      return {
        yesOdds: Number(yesOdds) / 100, // Convert from basis points
        noOdds: Number(noOdds) / 100,
      };
    } catch (error) {
      console.error('Error fetching market odds:', error);
      throw error;
    }
  }

  /**
   * Place a bet on a market
   */
  async placeBet(request: PlaceBetRequest & { userAddress: string }) {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      const { hash } = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'placeBet',
        args: [BigInt(request.marketId), request.position],
        value: parseEther(request.amount.toString()),
        account: request.userAddress as `0x${string}`,
      });

      return hash;
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  }

  /**
   * Create a new market (admin function)
   */
  async createMarket(
    question: string,
    description: string,
    endTime: Date,
    resolutionTime: Date,
    userAddress: string
  ) {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      const { hash } = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'createMarket',
        args: [
          question,
          description,
          BigInt(Math.floor(endTime.getTime() / 1000)),
          BigInt(Math.floor(resolutionTime.getTime() / 1000)),
        ],
        account: userAddress as `0x${string}`,
      });

      return hash;
    } catch (error) {
      console.error('Error creating market:', error);
      throw error;
    }
  }

  /**
   * Resolve a market (admin function)
   */
  async resolveMarket(marketId: string, outcome: boolean, userAddress: string) {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      const { hash } = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'resolveMarket',
        args: [BigInt(marketId), outcome],
        account: userAddress as `0x${string}`,
      });

      return hash;
    } catch (error) {
      console.error('Error resolving market:', error);
      throw error;
    }
  }

  /**
   * Claim winnings from a resolved market
   */
  async claimWinnings(marketId: string, userAddress: string) {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      const { hash } = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'claimWinnings',
        args: [BigInt(marketId)],
        account: userAddress as `0x${string}`,
      });

      return hash;
    } catch (error) {
      console.error('Error claiming winnings:', error);
      throw error;
    }
  }

  /**
   * Calculate potential payout for a bet
   */
  calculatePayout(amount: number, odds: number): number {
    return amount * (odds / 100);
  }

  /**
   * Format CORE amount for display
   */
  formatCoreAmount(amount: bigint): string {
    return formatEther(amount);
  }

  /**
   * Parse CORE amount from string
   */
  parseCoreAmount(amount: string): bigint {
    return parseEther(amount);
  }
}

// Export singleton instance
export const predictionService = new PredictionService();