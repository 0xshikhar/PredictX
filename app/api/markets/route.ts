import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MarketStatus, MarketFilters } from "@/lib/types/prediction";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const category = searchParams.get("category");
    const status = searchParams.get("status") as MarketStatus | null;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.market.count({ where });

    // Get markets
    const markets = await prisma.market.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            bets: true,
            userSwipes: true,
          },
        },
      },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      markets: markets.map(market => ({
        ...market,
        totalBets: market._count.bets,
        totalSwipes: market._count.userSwipes,
      })),
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
    console.error("Error fetching markets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      imageUrl,
      endDate,
      resolutionDate,
    } = body;

    // Validate required fields
    if (!title || !description || !category || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const end = new Date(endDate);
    const resolution = resolutionDate ? new Date(resolutionDate) : null;
    
    if (end <= new Date()) {
      return NextResponse.json(
        { error: "End date must be in the future" },
        { status: 400 }
      );
    }

    if (resolution && resolution <= end) {
      return NextResponse.json(
        { error: "Resolution date must be after end date" },
        { status: 400 }
      );
    }

    // Create market
    const market = await prisma.market.create({
      data: {
        title,
        description,
        category,
        imageUrl,
        endDate: end,
        resolutionDate: resolution,
        status: MarketStatus.ACTIVE,
        yesOdds: 50,
        noOdds: 50,
      },
    });

    return NextResponse.json(market, { status: 201 });
  } catch (error) {
    console.error("Error creating market:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}