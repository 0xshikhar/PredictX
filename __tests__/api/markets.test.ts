import { GET, POST } from '@/app/api/markets/route';
import { NextRequest } from 'next/server';
import { jest } from '@jest/globals';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    market: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

describe('/api/markets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/markets', () => {
    it('should return markets with pagination', async () => {
      const mockMarkets = [
        {
          id: '1',
          title: 'Test Market',
          description: 'Test Description',
          category: 'Crypto',
          status: 'ACTIVE',
          totalVolume: 1000,
          totalBets: 10,
          yesOdds: 60,
          noOdds: 40,
          endDate: new Date('2024-12-31'),
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { bets: 10, userSwipes: 5 },
        },
      ];

      (prisma.market.count as jest.Mock).mockResolvedValue(1);
      (prisma.market.findMany as jest.Mock).mockResolvedValue(mockMarkets);

      const request = new NextRequest('http://localhost:3000/api/markets');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.markets).toHaveLength(1);
      expect(data.markets[0].title).toBe('Test Market');
      expect(data.pagination.totalCount).toBe(1);
    });

    it('should filter markets by category', async () => {
      const mockMarkets = [
        {
          id: '1',
          title: 'Crypto Market',
          category: 'Crypto',
          _count: { bets: 5, userSwipes: 2 },
        },
      ];

      (prisma.market.count as jest.Mock).mockResolvedValue(1);
      (prisma.market.findMany as jest.Mock).mockResolvedValue(mockMarkets);

      const request = new NextRequest('http://localhost:3000/api/markets?category=Crypto');
      const response = await GET(request);

      expect(prisma.market.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: 'Crypto' },
        })
      );
    });

    it('should search markets by title and description', async () => {
      const request = new NextRequest('http://localhost:3000/api/markets?search=Bitcoin');
      await GET(request);

      expect(prisma.market.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'Bitcoin', mode: 'insensitive' } },
              { description: { contains: 'Bitcoin', mode: 'insensitive' } },
            ],
          },
        })
      );
    });
  });

  describe('POST /api/markets', () => {
    it('should create a new market', async () => {
      const mockMarket = {
        id: '1',
        title: 'New Market',
        description: 'New Description',
        category: 'Crypto',
        endDate: new Date('2024-12-31'),
        status: 'ACTIVE',
      };

      (prisma.market.create as jest.Mock).mockResolvedValue(mockMarket);

      const request = new NextRequest('http://localhost:3000/api/markets', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Market',
          description: 'New Description',
          category: 'Crypto',
          endDate: '2024-12-31',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('New Market');
      expect(prisma.market.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Market',
            description: 'New Description',
            category: 'Crypto',
          }),
        })
      );
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/markets', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Missing title',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('should validate end date is in the future', async () => {
      const request = new NextRequest('http://localhost:3000/api/markets', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Market',
          description: 'Test Description',
          category: 'Crypto',
          endDate: '2020-01-01', // Past date
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('End date must be in the future');
    });
  });
});