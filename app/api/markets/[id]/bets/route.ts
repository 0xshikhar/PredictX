import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BetStatus } from "@/lib/types/prediction";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const position = searchParams.get("position"); // "true" or "false"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: any = {
      marketId: params.id,
    };

    if (userId) {
      where.userId = userId;
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
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            walletAddress: true,
          },
        },
        market: {
          select: {
            id: true,
            title: true,
            status: true,
            outcome: true,
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

    return NextResponse.json({
      bets,
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
    console.error("Error fetching market bets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json();
    const {
      userId,
      amount,
      position,
      txHash,
    } = body;

    // Validate required fields
    if (!userId || !amount || position === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if market exists and is active
    const market = await prisma.market.findUnique({
      where: { id: params.id },
    });

    if (!market) {
      return NextResponse.json(
        { error: "Market not found" },
        { status: 404 }
      );
    }

    if (market.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Market is not active" },
        { status: 400 }
      );
    }

    if (new Date() >= market.endDate) {
      return NextResponse.json(
        { error: "Market has ended" },
        { status: 400 }
      );
    }

    // Validate amount
    const betAmount = parseFloat(amount);
    if (betAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (betAmount > 1000) {
      return NextResponse.json(
        { error: "Amount exceeds maximum bet limit" },
        { status: 400 }
      );
    }

    // Calculate current odds and potential payout
    const allBets = await prisma.bet.findMany({
      where: {
        marketId: params.id,
        status: BetStatus.ACTIVE,
      },
    });

    const yesBets = allBets.filter(bet => bet.position === true);
    const noBets = allBets.filter(bet => bet.position === false);
    
    const totalYesAmount = yesBets.reduce((sum, bet) => sum + Number(bet.amount), 0);
    const totalNoAmount = noBets.reduce((sum, bet) => sum + Number(bet.amount), 0);
    const totalVolume = totalYesAmount + totalNoAmount;

    // Calculate odds for this bet
    let odds = 50; // Default 50/50
    if (totalVolume > 0) {
      if (position) {
        odds = ((totalYesAmount + betAmount) / (totalVolume + betAmount)) * 100;
      } else {
        odds = ((totalNoAmount + betAmount) / (totalVolume + betAmount)) * 100;
      }
    }

    const potential = betAmount * (odds / 100);

    // Create the bet
    const bet = await prisma.bet.create({
      data: {
        userId,
        marketId: params.id,
        amount: betAmount,
        position,
        odds,
        potential,
        status: BetStatus.ACTIVE,
        txHash,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        market: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    // Update market totals
    await prisma.market.update({
      where: { id: params.id },
      data: {
        totalVolume: totalVolume + betAmount,
        totalBets: {
          increment: 1,
        },
        yesOdds: position ? odds : ((totalYesAmount / (totalVolume + betAmount)) * 100),
        noOdds: !position ? odds : ((totalNoAmount / (totalVolume + betAmount)) * 100),
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalBets: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(bet, { status: 201 });
  } catch (error) {
    console.error("Error creating bet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}