import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { walletAddress: '0x1234567890123456789012345678901234567890' },
      update: {},
      create: {
        walletAddress: '0x1234567890123456789012345678901234567890',
        username: 'alice_predictor',
        email: 'alice@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9a0c0ce?w=150&h=150&fit=crop&crop=face',
        bio: 'Professional crypto trader and prediction market enthusiast',
        totalBets: 25,
        totalWinnings: 1250.50,
        winRate: 68.2,
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: '0x0987654321098765432109876543210987654321' },
      update: {},
      create: {
        walletAddress: '0x0987654321098765432109876543210987654321',
        username: 'bob_analyzer',
        email: 'bob@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Data scientist specializing in market predictions',
        totalBets: 18,
        totalWinnings: 890.25,
        winRate: 55.6,
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: '0x1111222233334444555566667777888899990000' },
      update: {},
      create: {
        walletAddress: '0x1111222233334444555566667777888899990000',
        username: 'charlie_whale',
        email: 'charlie@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'High-volume trader with focus on long-term predictions',
        totalBets: 42,
        totalWinnings: 3200.75,
        winRate: 71.4,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create user preferences
  for (const user of users) {
    await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        categories: ['Crypto', 'Technology', 'Sports'],
        riskTolerance: 'MEDIUM',
        notificationsEnabled: true,
        swipeNotifications: true,
        resultNotifications: true,
      },
    });
  }

  console.log('✅ Created user preferences');

  // Create sample markets
  const markets = await Promise.all([
    prisma.market.upsert({
      where: { id: 'btc-100k-2024' },
      update: {},
      create: {
        id: 'btc-100k-2024',
        title: 'Will Bitcoin reach $100k by end of 2024?',
        description: 'Bitcoin has been showing strong momentum with institutional adoption increasing. Will it break the $100k barrier before December 31st, 2024?',
        category: 'Crypto',
        imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=300&fit=crop',
        endDate: new Date('2024-12-31'),
        resolutionDate: new Date('2025-01-07'),
        status: 'ACTIVE',
        totalVolume: 25000.50,
        totalBets: 156,
        yesOdds: 67.3,
        noOdds: 32.7,
        contractAddress: '0x1234567890123456789012345678901234567890',
      },
    }),
    prisma.market.upsert({
      where: { id: 'eth-etf-2024' },
      update: {},
      create: {
        id: 'eth-etf-2024',
        title: 'Will Ethereum ETF be approved in 2024?',
        description: 'Following the Bitcoin ETF approval, will the SEC approve an Ethereum ETF this year? Multiple applications are pending review.',
        category: 'Crypto',
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
        endDate: new Date('2024-12-31'),
        resolutionDate: new Date('2025-01-07'),
        status: 'ACTIVE',
        totalVolume: 18500.25,
        totalBets: 89,
        yesOdds: 45.8,
        noOdds: 54.2,
        contractAddress: '0x2345678901234567890123456789012345678901',
      },
    }),
    prisma.market.upsert({
      where: { id: 'apple-200-q4' },
      update: {},
      create: {
        id: 'apple-200-q4',
        title: 'Will Apple stock hit $200 in Q4 2024?',
        description: 'Apple stock has been volatile with AI developments and iPhone sales changes. Will it reach the $200 mark by the end of Q4 2024?',
        category: 'Stocks',
        imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
        endDate: new Date('2024-12-31'),
        resolutionDate: new Date('2025-01-07'),
        status: 'ACTIVE',
        totalVolume: 12300.75,
        totalBets: 67,
        yesOdds: 52.1,
        noOdds: 47.9,
        contractAddress: '0x3456789012345678901234567890123456789012',
      },
    }),
    prisma.market.upsert({
      where: { id: 'ai-turing-2024' },
      update: {},
      create: {
        id: 'ai-turing-2024',
        title: 'Will AI models pass comprehensive Turing test in 2024?',
        description: 'With rapid AI advancement, will any AI model convincingly pass a comprehensive Turing test administered by academic institutions this year?',
        category: 'Technology',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
        endDate: new Date('2024-12-31'),
        resolutionDate: new Date('2025-01-07'),
        status: 'ACTIVE',
        totalVolume: 8900.50,
        totalBets: 43,
        yesOdds: 38.2,
        noOdds: 61.8,
        contractAddress: '0x4567890123456789012345678901234567890123',
      },
    }),
    prisma.market.upsert({
      where: { id: 'spacex-mars-2024' },
      update: {},
      create: {
        id: 'spacex-mars-2024',
        title: 'Will SpaceX successfully land on Mars in 2024?',
        description: 'SpaceX has ambitious plans for Mars missions. Will they achieve a successful unmanned landing this year?',
        category: 'Space',
        imageUrl: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop',
        endDate: new Date('2024-12-31'),
        resolutionDate: new Date('2025-01-07'),
        status: 'ACTIVE',
        totalVolume: 15600.25,
        totalBets: 78,
        yesOdds: 23.4,
        noOdds: 76.6,
        contractAddress: '0x5678901234567890123456789012345678901234',
      },
    }),
    prisma.market.upsert({
      where: { id: 'core-tvl-1b' },
      update: {},
      create: {
        id: 'core-tvl-1b',
        title: 'Will Core blockchain TVL exceed $1B in 2024?',
        description: 'Core blockchain has been gaining traction in DeFi. Will its Total Value Locked exceed $1 billion this year?',
        category: 'Crypto',
        imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=300&fit=crop',
        endDate: new Date('2024-12-31'),
        resolutionDate: new Date('2025-01-07'),
        status: 'ACTIVE',
        totalVolume: 7200.80,
        totalBets: 34,
        yesOdds: 41.7,
        noOdds: 58.3,
        contractAddress: '0x6789012345678901234567890123456789012345',
      },
    }),
  ]);

  console.log(`✅ Created ${markets.length} markets`);

  // Create sample bets
  const bets = [];
  const betData = [
    { userId: users[0].id, marketId: markets[0].id, amount: 100, position: true, odds: 67.3 },
    { userId: users[0].id, marketId: markets[1].id, amount: 50, position: false, odds: 54.2 },
    { userId: users[1].id, marketId: markets[0].id, amount: 200, position: true, odds: 67.3 },
    { userId: users[1].id, marketId: markets[2].id, amount: 75, position: true, odds: 52.1 },
    { userId: users[2].id, marketId: markets[3].id, amount: 500, position: false, odds: 61.8 },
    { userId: users[2].id, marketId: markets[4].id, amount: 300, position: false, odds: 76.6 },
  ];

  for (const bet of betData) {
    const potential = bet.amount * (bet.odds / 100);
    await prisma.bet.create({
      data: {
        userId: bet.userId,
        marketId: bet.marketId,
        amount: bet.amount,
        position: bet.position,
        odds: bet.odds,
        potential: potential,
        status: 'ACTIVE',
        txHash: `0x${Math.random().toString(16).slice(2)}`,
      },
    });
    bets.push(bet);
  }

  console.log(`✅ Created ${bets.length} bets`);

  // Create sample swipes
  const swipes = [];
  const swipeData = [
    { userId: users[0].id, marketId: markets[0].id, direction: 'UP' },
    { userId: users[0].id, marketId: markets[1].id, direction: 'DOWN' },
    { userId: users[0].id, marketId: markets[2].id, direction: 'RIGHT' },
    { userId: users[1].id, marketId: markets[0].id, direction: 'UP' },
    { userId: users[1].id, marketId: markets[3].id, direction: 'LEFT' },
    { userId: users[2].id, marketId: markets[4].id, direction: 'DOWN' },
  ];

  for (const swipe of swipeData) {
    await prisma.userSwipe.create({
      data: swipe,
    });
    swipes.push(swipe);
  }

  console.log(`✅ Created ${swipes.length} swipes`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${users.length}`);
  console.log(`- Markets: ${markets.length}`);
  console.log(`- Bets: ${bets.length}`);
  console.log(`- Swipes: ${swipes.length}`);
  console.log('\n🚀 Your prediction marketplace is ready to go!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });