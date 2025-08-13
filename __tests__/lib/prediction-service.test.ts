import { PredictionService } from '@/lib/web3/prediction-service';
import { createPublicClient } from 'viem';

// Mock viem
jest.mock('viem', () => ({
  createPublicClient: jest.fn(),
  createWalletClient: jest.fn(),
  custom: jest.fn(),
  formatEther: jest.fn((value) => (Number(value) / 1e18).toString()),
  parseEther: jest.fn((value) => BigInt(Number(value) * 1e18)),
}));

// Mock the contract addresses
jest.mock('@/lib/web3/contracts', () => ({
  CONTRACT_ADDRESSES: {
    PREDICTION_MARKET: '0x1234567890123456789012345678901234567890',
  },
  PREDICTION_MARKET_ABI: [
    {
      name: 'getMarket',
      type: 'function',
      inputs: [{ name: 'marketId', type: 'uint256' }],
      outputs: [{ name: '', type: 'tuple' }],
    },
    {
      name: 'getOdds',
      type: 'function',
      inputs: [{ name: 'marketId', type: 'uint256' }],
      outputs: [
        { name: 'yesOdds', type: 'uint256' },
        { name: 'noOdds', type: 'uint256' },
      ],
    },
  ],
}));

describe('PredictionService', () => {
  let predictionService: PredictionService;
  let mockPublicClient: any;

  beforeEach(() => {
    mockPublicClient = {
      readContract: jest.fn(),
    };

    (createPublicClient as jest.Mock).mockReturnValue(mockPublicClient);
    
    predictionService = new PredictionService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMarketOdds', () => {
    it('should fetch and format market odds correctly', async () => {
      const mockOdds = [BigInt(6500), BigInt(3500)]; // 65% YES, 35% NO
      mockPublicClient.readContract.mockResolvedValue(mockOdds);

      const result = await predictionService.getMarketOdds('1');

      expect(result).toEqual({
        yesOdds: 65,
        noOdds: 35,
      });

      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.any(Array),
        functionName: 'getOdds',
        args: [BigInt(1)],
      });
    });

    it('should handle contract read errors', async () => {
      mockPublicClient.readContract.mockRejectedValue(new Error('Contract error'));

      await expect(predictionService.getMarketOdds('1')).rejects.toThrow('Contract error');
    });
  });

  describe('calculatePayout', () => {
    it('should calculate payout correctly', () => {
      const amount = 100;
      const odds = 65; // 65%

      const payout = predictionService.calculatePayout(amount, odds);

      expect(payout).toBe(65); // 100 * (65/100)
    });

    it('should handle zero odds', () => {
      const amount = 100;
      const odds = 0;

      const payout = predictionService.calculatePayout(amount, odds);

      expect(payout).toBe(0);
    });
  });

  describe('formatCoreAmount', () => {
    it('should format CORE amounts correctly', () => {
      const amount = BigInt('1000000000000000000'); // 1 CORE in wei

      const formatted = predictionService.formatCoreAmount(amount);

      expect(formatted).toBe('1');
    });
  });

  describe('parseCoreAmount', () => {
    it('should parse CORE amounts correctly', () => {
      const amount = '1.5';

      const parsed = predictionService.parseCoreAmount(amount);

      expect(parsed).toBe(BigInt('1500000000000000000')); // 1.5 CORE in wei
    });
  });

  describe('placeBet', () => {
    it('should throw error when wallet client not initialized', async () => {
      const betRequest = {
        marketId: '1',
        amount: 100,
        position: true,
        userAddress: '0x1234567890123456789012345678901234567890',
      };

      await expect(predictionService.placeBet(betRequest)).rejects.toThrow(
        'Wallet client not initialized'
      );
    });
  });

  describe('getMarketFromChain', () => {
    it('should fetch market data from blockchain', async () => {
      const mockMarketData = {
        question: 'Test market?',
        description: 'Test description',
        endTime: BigInt(Math.floor(Date.now() / 1000) + 86400),
        resolved: false,
      };

      mockPublicClient.readContract.mockResolvedValue(mockMarketData);

      const result = await predictionService.getMarketFromChain('1');

      expect(result).toEqual(mockMarketData);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.any(Array),
        functionName: 'getMarket',
        args: [BigInt(1)],
      });
    });
  });
});