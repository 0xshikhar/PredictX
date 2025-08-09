import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BetStatus, Portfolio, PortfolioPosition } from "@/lib/types/prediction";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all user bets with market data
    const userBets = await prisma.bet.findMany({
      where: { userId },
      include: {
        market: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (userBets.length === 0) {
      const emptyPortfolio: Portfolio = {
        totalValue: 0,
        totalBets: 0,
        activeBets: 0,
        winRate: 0,
        totalWinnings: 0,
        positions: [],
      };
      return NextResponse.json(emptyPortfolio);
    }

    // Group bets by market to create positions
    const positionMap = new Map<string, PortfolioPosition>();

    userBets.forEach(bet => {
      const marketId = bet.marketId;
      
      if (!positionMap.has(marketId)) {
        positionMap.set(marketId, {
          marketId,
          market: bet.market,
          bets: [],
          totalAmount: 0,
          potentialPayout: 0,
          currentValue: 0,
          position: bet.position,
        });
      }

      const position = positionMap.get(marketId)!;
      position.bets.push(bet);
      position.totalAmount += Number(bet.amount);
      
      // Calculate current value based on bet status
      if (bet.status === BetStatus.ACTIVE) {
        position.potentialPayout += Number(bet.potential);
        // For current value, we could use current market odds
        // For now, using the original potential
        position.currentValue += Number(bet.potential);
      } else if (bet.status === BetStatus.WON) {
        position.currentValue += Number(bet.potential);
        position.potentialPayout += Number(bet.potential);
      } else if (bet.status === BetStatus.LOST) {
        // Lost bets have 0 current value
        position.currentValue += 0;
      }
    });

    const positions = Array.from(positionMap.values());

    // Calculate portfolio totals
    const activeBets = userBets.filter(bet => bet.status === BetStatus.ACTIVE);
    const wonBets = userBets.filter(bet => bet.status === BetStatus.WON);
    const lostBets = userBets.filter(bet => bet.status === BetStatus.LOST);

    const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
    const totalWinnings = wonBets.reduce((sum, bet) => sum + Number(bet.potential), 0);
    const totalLosses = lostBets.reduce((sum, bet) => sum + Number(bet.amount), 0);
    
    const winRate = userBets.length > 0 ? (wonBets.length / userBets.length) * 100 : 0;

    // Get trending positions (active bets in markets ending soon)
    const trendingPositions = positions
      .filter(pos => pos.bets.some(bet => bet.status === BetStatus.ACTIVE))
      .filter(pos => {
        const now = new Date();
        const endDate = new Date(pos.market.endDate);
        const hoursRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursRemaining > 0 && hoursRemaining <= 24; // Ending within 24 hours
      })
      .sort((a, b) => new Date(a.market.endDate).getTime() - new Date(b.market.endDate).getTime())
      .slice(0, 5);

    // Get recent activity (last 10 bets)
    const recentActivity = userBets.slice(0, 10).map(bet => ({
      id: bet.id,
      marketId: bet.marketId,
      marketTitle: bet.market.title,
      amount: bet.amount,
      position: bet.position,
      status: bet.status,
      createdAt: bet.createdAt,
      potential: bet.potential,
    }));

    // Performance metrics
    const performanceMetrics = {
      totalInvested: userBets.reduce((sum, bet) => sum + Number(bet.amount), 0),
      totalReturns: totalWinnings,
      netPnL: totalWinnings - totalLosses,
      winRate,
      averageBetSize: userBets.length > 0 ? 
        userBets.reduce((sum, bet) => sum + Number(bet.amount), 0) / userBets.length : 0,
      biggestWin: wonBets.length > 0 ? 
        Math.max(...wonBets.map(bet => Number(bet.potential) - Number(bet.amount))) : 0,
      biggestLoss: lostBets.length > 0 ? 
        Math.max(...lostBets.map(bet => Number(bet.amount))) : 0,
    };

    const portfolio: Portfolio = {
      totalValue,
      totalBets: userBets.length,
      activeBets: activeBets.length,
      winRate,
      totalWinnings,
      positions,
    };

    return NextResponse.json({
      portfolio,
      performanceMetrics,
      trendingPositions,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching user portfolio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}