"use client";

import React, { useState, useEffect } from "react";
import { MarketCard } from "@/components/prediction/MarketCard";
import { BettingModal } from "@/components/prediction/BettingModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Market, MarketFilters, MarketStatus } from "@/lib/types/prediction";
import { Search, Filter, SortAsc, TrendingUp, Clock, DollarSign, Users } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@/lib/utils";

// Mock data - same as predictions page
const mockMarkets: Market[] = [
  {
    id: "1",
    title: "Will Bitcoin reach $100k by end of 2024?",
    description: "Bitcoin has been showing strong momentum. Will it break the $100k barrier before December 31st, 2024?",
    category: "Crypto",
    imageUrl: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=300&fit=crop",
    endDate: new Date("2024-12-31"),
    resolutionDate: new Date("2025-01-01"),
    status: "ACTIVE" as const,
    totalVolume: 25000,
    totalBets: 156,
    chainId: 1116,
    yesOdds: 67,
    noOdds: 33,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Will Ethereum ETF be approved in 2024?",
    description: "Following the Bitcoin ETF approval, will the SEC approve an Ethereum ETF this year?",
    category: "Crypto",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
    endDate: new Date("2024-12-31"),
    status: "ACTIVE" as const,
    totalVolume: 18500,
    totalBets: 89,
    chainId: 1116,
    yesOdds: 45,
    noOdds: 55,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Will Apple stock hit $200 in Q4 2024?",
    description: "Apple's stock has been volatile. Will it reach the $200 mark by the end of Q4 2024?",
    category: "Stocks",
    imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop",
    endDate: new Date("2024-12-31"),
    status: "ACTIVE" as const,
    totalVolume: 12300,
    totalBets: 67,
    chainId: 1116,
    yesOdds: 52,
    noOdds: 48,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "Will AI models pass the Turing test in 2024?",
    description: "With rapid AI advancement, will any AI model convincingly pass the Turing test this year?",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
    endDate: new Date("2024-12-31"),
    status: "ACTIVE" as const,
    totalVolume: 8900,
    totalBets: 43,
    chainId: 1116,
    yesOdds: 38,
    noOdds: 62,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    title: "Will SpaceX successfully land on Mars in 2024?",
    description: "SpaceX has ambitious plans for Mars missions. Will they achieve a successful landing this year?",
    category: "Space",
    imageUrl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop",
    endDate: new Date("2024-12-31"),
    status: "ACTIVE" as const,
    totalVolume: 15600,
    totalBets: 78,
    chainId: 1116,
    yesOdds: 23,
    noOdds: 77,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    title: "Will Tesla stock double in value by 2025?",
    description: "Tesla has been innovative in the EV space. Will its stock price double from current levels by end of 2025?",
    category: "Stocks",
    status: "ACTIVE" as const,
    endDate: new Date("2025-12-31"),
    totalVolume: 9800,
    totalBets: 54,
    chainId: 1116,
    yesOdds: 34,
    noOdds: 66,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const categories = ["All", "Crypto", "Stocks", "Technology", "Space", "Sports", "Politics"];

export default function MarketsPage() {
  const { user, authenticated } = usePrivy();
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>(mockMarkets);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("volume");
  const [activeTab, setActiveTab] = useState("all");
  const [userBalance] = useState(100); // Mock balance
  const [watchlistedMarkets, setWatchlistedMarkets] = useState<Set<string>>(new Set());

  // Filter and sort markets
  useEffect(() => {
    let filtered = [...markets];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(market =>
        market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(market => market.category === selectedCategory);
    }

    // Filter by tab (status)
    if (activeTab === "trending") {
      filtered = filtered.filter(market => market.totalVolume > 10000);
    } else if (activeTab === "ending-soon") {
      const now = new Date();
      filtered = filtered.filter(market => {
        const hoursRemaining = (market.endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursRemaining > 0 && hoursRemaining <= 24;
      });
    }

    // Sort markets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "volume":
          return b.totalVolume - a.totalVolume;
        case "bets":
          return b.totalBets - a.totalBets;
        case "ending":
          return a.endDate.getTime() - b.endDate.getTime();
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

    setFilteredMarkets(filtered);
  }, [markets, searchQuery, selectedCategory, sortBy, activeTab]);

  const handleViewMarket = (market: Market) => {
    // TODO: Navigate to market detail page
    console.log("Viewing market:", market.id);
  };

  const handleBetOnMarket = (market: Market) => {
    setSelectedMarket(market);
    setShowBettingModal(true);
  };

  const handleWatchlist = (marketId: string) => {
    setWatchlistedMarkets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(marketId)) {
        newSet.delete(marketId);
      } else {
        newSet.add(marketId);
      }
      return newSet;
    });
  };

  const handlePlaceBet = async (amount: number, position: boolean) => {
    if (!selectedMarket || !authenticated || !user) {
      throw new Error("Please connect your wallet to place bets");
    }

    console.log(`Placing bet: ${amount} CORE on ${position ? 'YES' : 'NO'} for market ${selectedMarket.id}`);
    
    // TODO: Implement actual betting logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Bet placed successfully!");
  };

  const getMarketStats = () => {
    const totalVolume = markets.reduce((sum, market) => sum + market.totalVolume, 0);
    const totalBets = markets.reduce((sum, market) => sum + market.totalBets, 0);
    const activeMarkets = markets.filter(market => market.status === "ACTIVE").length;
    
    return { totalVolume, totalBets, activeMarkets };
  };

  const stats = getMarketStats();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Prediction Markets</h1>
          <p className="text-muted-foreground">
            Browse and bet on prediction markets
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.activeMarkets}</div>
                <div className="text-sm text-muted-foreground">Active Markets</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  ${(stats.totalVolume / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalBets}</div>
                <div className="text-sm text-muted-foreground">Total Bets</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 prediction-input"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="bets">Most Bets</SelectItem>
              <SelectItem value="ending">Ending Soon</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Markets</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="ending-soon">Ending Soon</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMarkets.map((market, index) => (
          <MarketCard
            key={market.id}
            market={market}
            onView={() => handleViewMarket(market)}
            onBet={() => handleBetOnMarket(market)}
            onAddToWatchlist={() => handleWatchlist(market.id)}
            isWatchlisted={watchlistedMarkets.has(market.id)}
            variant={index === 0 && activeTab === "trending" ? "featured" : "default"}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredMarkets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No markets found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Betting Modal */}
      {selectedMarket && (
        <BettingModal
          market={selectedMarket}
          position={true} // Default to YES, user can change in modal
          open={showBettingModal}
          onOpenChange={setShowBettingModal}
          onPlaceBet={handlePlaceBet}
          userBalance={userBalance}
        />
      )}
    </div>
  );
}