"use client";

import React, { useState, useEffect } from "react";
import { SwipeInterface } from "@/components/prediction/SwipeInterface";
import { BettingModal } from "@/components/prediction/BettingModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Market, SwipeDirection } from "@/lib/types/prediction";
import { Settings, Filter, TrendingUp, Users, DollarSign } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@/lib/utils";

// Mock data for development
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
];

export default function PredictionsPage() {
  const { user, authenticated } = usePrivy();
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [betPosition, setBetPosition] = useState<boolean>(true);
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [userBalance] = useState(100); // Mock balance
  const [swipeStats, setSwipeStats] = useState({
    totalSwiped: 0,
    interested: 0,
    passed: 0,
    betYes: 0,
    betNo: 0,
  });

  const handleSwipe = async (marketId: string, direction: SwipeDirection) => {
    console.log(`Swiped ${direction} on market ${marketId}`);
    
    // Update swipe stats
    setSwipeStats(prev => ({
      ...prev,
      totalSwiped: prev.totalSwiped + 1,
      [direction === SwipeDirection.RIGHT ? 'interested' : 
       direction === SwipeDirection.LEFT ? 'passed' :
       direction === SwipeDirection.UP ? 'betYes' : 'betNo']: 
       prev[direction === SwipeDirection.RIGHT ? 'interested' : 
           direction === SwipeDirection.LEFT ? 'passed' :
           direction === SwipeDirection.UP ? 'betYes' : 'betNo'] + 1,
    }));

    // TODO: Send to API
    if (authenticated && user) {
      try {
        await fetch('/api/user/swipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            marketId,
            direction,
          }),
        });
      } catch (error) {
        console.error('Failed to record swipe:', error);
      }
    }
  };

  const handleBetYes = (marketId: string) => {
    const market = markets.find(m => m.id === marketId);
    if (market) {
      setSelectedMarket(market);
      setBetPosition(true);
      setShowBettingModal(true);
    }
  };

  const handleBetNo = (marketId: string) => {
    const market = markets.find(m => m.id === marketId);
    if (market) {
      setSelectedMarket(market);
      setBetPosition(false);
      setShowBettingModal(true);
    }
  };

  const handlePlaceBet = async (amount: number, position: boolean) => {
    if (!selectedMarket || !authenticated || !user) {
      throw new Error("Please connect your wallet to place bets");
    }

    console.log(`Placing bet: ${amount} CORE on ${position ? 'YES' : 'NO'} for market ${selectedMarket.id}`);
    
    // TODO: Implement actual betting logic with blockchain
    // For now, just simulate success
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Bet placed successfully!");
  };

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Connect your wallet to start making predictions and earn rewards!
            </p>
            <Button className="w-full prediction-button-primary">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Predictions</h1>
          <p className="text-muted-foreground">
            Swipe through markets and make your predictions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{swipeStats.totalSwiped}</div>
                <div className="text-xs text-muted-foreground">Swiped</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{swipeStats.interested}</div>
                <div className="text-xs text-muted-foreground">Interested</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{swipeStats.betYes + swipeStats.betNo}</div>
                <div className="text-xs text-muted-foreground">Bet Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{userBalance.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">CORE Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Swipe Interface */}
      <div className="flex justify-center">
        <SwipeInterface
          markets={markets}
          onSwipe={handleSwipe}
          onBetYes={handleBetYes}
          onBetNo={handleBetNo}
          className="w-full max-w-sm"
        />
      </div>

      {/* Instructions */}
      <div className="mt-8 max-w-sm mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">←</Badge>
              <span className="text-sm">Swipe left to pass</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">→</Badge>
              <span className="text-sm">Swipe right if interested</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">↑</Badge>
              <span className="text-sm">Swipe up to bet YES</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">↓</Badge>
              <span className="text-sm">Swipe down to bet NO</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Betting Modal */}
      {selectedMarket && (
        <BettingModal
          market={selectedMarket}
          position={betPosition}
          open={showBettingModal}
          onOpenChange={setShowBettingModal}
          onPlaceBet={handlePlaceBet}
          userBalance={userBalance}
        />
      )}
    </div>
  );
}