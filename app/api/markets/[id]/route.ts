import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const market = await prisma.market.findUnique({
      where: { id: params.id },
      include: {
        bets: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Latest 10 bets for activity feed
        },
        _count: {
          select: {
            bets: true,
            userSwipes: true,
          },
        },
      },
    });

    if (!market) {
      return NextResponse.json(
        { error: "Market not found" },
        { status: 404 }
      );
    }

    // Calculate additional stats
    const yesBets = market.bets.filter(bet => bet.position === true);
    const noBets = market.bets.filter(bet => bet.position === false);
    
    const totalYesAmount = yesBets.reduce((sum, bet) => sum + Number(bet.amount), 0);
    const totalNoAmount = noBets.reduce((sum, bet) => sum + Number(bet.amount), 0);
    const totalVolume = totalYesAmount + totalNoAmount;

    // Calculate odds based on actual betting volume
    let yesOdds = 50;
    let noOdds = 50;
    
    if (totalVolume > 0) {
      yesOdds = (totalYesAmount / totalVolume) * 100;
      noOdds = (totalNoAmount / totalVolume) * 100;
    }

    const marketWithStats = {
      ...market,
      totalBets: market._count.bets,
      totalSwipes: market._count.userSwipes,
      totalVolume,
      yesOdds,
      noOdds,
      yesBetsCount: yesBets.length,
      noBetsCount: noBets.length,
      totalYesAmount,
      totalNoAmount,
    };

    return NextResponse.json(marketWithStats);
  } catch (error) {
    console.error("Error fetching market:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      imageUrl,
      endDate,
      resolutionDate,
      status,
      outcome,
    } = body;

    const market = await prisma.market.findUnique({
      where: { id: params.id },
    });

    if (!market) {
      return NextResponse.json(
        { error: "Market not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (resolutionDate !== undefined) updateData.resolutionDate = new Date(resolutionDate);
    if (status !== undefined) updateData.status = status;
    
    // Handle market resolution
    if (outcome !== undefined && status === "RESOLVED") {
      updateData.outcome = outcome;
      updateData.resolvedAt = new Date();
      
      // Update all active bets to won/lost status
      await prisma.bet.updateMany({
        where: {
          marketId: params.id,
          status: "ACTIVE",
        },
        data: {
          status: outcome === true ? "WON" : "LOST", // This is simplified, needs proper logic
        },
      });
    }

    const updatedMarket = await prisma.market.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedMarket);
  } catch (error) {
    console.error("Error updating market:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const market = await prisma.market.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            bets: true,
          },
        },
      },
    });

    if (!market) {
      return NextResponse.json(
        { error: "Market not found" },
        { status: 404 }
      );
    }

    // Prevent deletion if there are active bets
    if (market._count.bets > 0) {
      return NextResponse.json(
        { error: "Cannot delete market with existing bets" },
        { status: 400 }
      );
    }

    await prisma.market.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Market deleted successfully" });
  } catch (error) {
    console.error("Error deleting market:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}