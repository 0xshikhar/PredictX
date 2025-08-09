import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SwipeDirection } from "@/lib/types/prediction";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      marketId,
      direction,
    } = body;

    // Validate required fields
    if (!userId || !marketId || !direction) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate direction
    if (!Object.values(SwipeDirection).includes(direction)) {
      return NextResponse.json(
        { error: "Invalid swipe direction" },
        { status: 400 }
      );
    }

    // Check if market exists
    const market = await prisma.market.findUnique({
      where: { id: marketId },
    });

    if (!market) {
      return NextResponse.json(
        { error: "Market not found" },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create or update swipe record
    const swipe = await prisma.userSwipe.upsert({
      where: {
        userId_marketId: {
          userId,
          marketId,
        },
      },
      update: {
        direction,
      },
      create: {
        userId,
        marketId,
        direction,
      },
      include: {
        market: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(swipe, { status: 201 });
  } catch (error) {
    console.error("Error recording swipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const direction = searchParams.get("direction") as SwipeDirection | null;
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

    if (direction) {
      where.direction = direction;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.userSwipe.count({ where });

    // Get swipes
    const swipes = await prisma.userSwipe.findMany({
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

    // Group swipes by direction for analytics
    const swipesByDirection = await prisma.userSwipe.groupBy({
      by: ["direction"],
      where: { userId },
      _count: {
        direction: true,
      },
    });

    const analytics = {
      total: totalCount,
      byDirection: swipesByDirection.reduce((acc, item) => {
        acc[item.direction] = item._count.direction;
        return acc;
      }, {} as Record<SwipeDirection, number>),
    };

    return NextResponse.json({
      swipes,
      analytics,
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
    console.error("Error fetching user swipes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}