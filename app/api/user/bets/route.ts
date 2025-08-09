import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BetStatus } from "@/lib/types/prediction";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") as BetStatus | null;
    const position = searchParams.get("position"); // "true" or "false"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (position !== null) {
      where.position = position === "true";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.bet.count({ where });

    // Get bets
    const bets = await prisma.bet.findMany({
      where,
      include: {
        market: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            imageUrl: true,
            endDate: true,
            resolutionDate: true,
            outcome: true,
            yesOdds: true,
            noOdds: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Calculate user betting statistics
    const allUserBets = await prisma.bet.findMany({
      where: { userId },
      include: {
        market: true,
      },
    });

    const activeBets = allUserBets.filter(bet => bet.status === BetStatus.ACTIVE);
    const wonBets = allUserBets.filter(bet => bet.status === BetStatus.WON);
    const lostBets = allUserBets.filter(bet => bet.status === BetStatus.LOST);

    const totalInvested = allUserBets.reduce((sum, bet) => sum + Number(bet.amount), 0);
    const totalWinnings = wonBets.reduce((sum, bet) => sum + Number(bet.potential), 0);
    const totalLosses = lostBets.reduce((sum, bet) => sum + Number(bet.amount), 0);
    const activeBetsValue = activeBets.reduce((sum, bet) => sum + Number(bet.amount), 0);
    const potentialWinnings = activeBets.reduce((sum, bet) => sum + Number(bet.potential), 0);

    const winRate = allUserBets.length > 0 ? (wonBets.length / allUserBets.length) * 100 : 0;
    const netPnL = totalWinnings - totalLosses;

    const statistics = {
      totalBets: allUserBets.length,
      activeBets: activeBets.length,
      wonBets: wonBets.length,
      lostBets: lostBets.length,
      totalInvested,
      totalWinnings,
      totalLosses,
      activeBetsValue,
      potentialWinnings,
      netPnL,
      winRate,
    };

    // Group bets by status for quick overview
    const betsByStatus = await prisma.bet.groupBy({
      by: ["status"],
      where: { userId },
      _count: {
        status: true,
      },
      _sum: {
        amount: true,
        potential: true,
      },
    });

    const statusSummary = betsByStatus.reduce((acc, item) => {
      acc[item.status] = {
        count: item._count.status,
        totalAmount: Number(item._sum.amount || 0),
        totalPotential: Number(item._sum.potential || 0),
      };
      return acc;
    }, {} as Record<BetStatus, { count: number; totalAmount: number; totalPotential: number }>);

    return NextResponse.json({
      bets,
      statistics,
      statusSummary,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching user bets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}