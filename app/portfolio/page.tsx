"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Portfolio, PortfolioPosition, Bet, BetStatus } from "@/lib/types/prediction";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Clock, 
  Trophy,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@/lib/utils";

// Mock portfolio data
const mockPortfolio: Portfolio = {
  totalValue: 125.50,
  totalBets: 12,
  activeBets: 8,
  winRate: 66.7,
  totalWinnings: 45.75,
  positions: [
    {
      marketId: "1",
      market: {
        id: "1",
        title: "Will Bitcoin reach $100k by end of 2024?",
        description: "Bitcoin market prediction",
        category: "Crypto",
        imageUrl: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=300&fit=crop",
        endDate: new Date("2024-12-31"),
        status: "ACTIVE" as const,
        totalVolume: 25000,
        totalBets: 156,
        chainId: 1116,
        yesOdds: 67,
        noOdds: 33,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      bets: [],
      totalAmount: 25,
      potentialPayout: 42.5,
      currentValue: 40.2,
      position: true,
    },
    {
      marketId: "2",
      market: {
        id: "2",
        title: "Will Ethereum ETF be approved in 2024?",
        description: "Ethereum ETF prediction",
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
      bets: [],
      totalAmount: 15,
      potentialPayout: 22.5,
      currentValue: 18.8,
      position: false,
    },
  ],
};

const mockRecentActivity = [
  {
    id: "1",
    marketId: "1",
    marketTitle: "Will Bitcoin reach $100k by end of 2024?",
    amount: 25,
    position: true,
    status: "ACTIVE" as BetStatus,
    createdAt: new Date("2024-01-15"),
    potential: 42.5,
  },
  {
    id: "2",
    marketId: "2",
    marketTitle: "Will Ethereum ETF be approved in 2024?",
    amount: 15,
    position: false,
    status: "ACTIVE" as BetStatus,
    createdAt: new Date("2024-01-12"),
    potential: 22.5,
  },
];

export default function PortfolioPage() {
  const { user, authenticated } = usePrivy();
  const [portfolio, setPortfolio] = useState<Portfolio>(mockPortfolio);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m`;
  };

  const getPositionPnL = (position: PortfolioPosition) => {
    return position.currentValue - position.totalAmount;
  };

  const getPositionPnLPercentage = (position: PortfolioPosition) => {
    return ((position.currentValue - position.totalAmount) / position.totalAmount) * 100;
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
              Connect your wallet to view your portfolio and track your predictions!
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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">
            Track your predictions and performance
          </p>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{portfolio.activeBets}</div>
                <div className="text-sm text-muted-foreground">Active Bets</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{portfolio.winRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(portfolio.totalWinnings)}</div>
                <div className="text-sm text-muted-foreground">Total Winnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Positions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Active Positions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolio.positions.slice(0, 3).map((position) => {
                  const pnl = getPositionPnL(position);
                  const pnlPercentage = getPositionPnLPercentage(position);
                  
                  return (
                    <div key={position.marketId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {position.market.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                position.position ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                              )}
                            >
                              {position.position ? "YES" : "NO"}
                            </Badge>
                            <span>{formatCurrency(position.totalAmount)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formatCurrency(position.currentValue)}
                          </div>
                          <div className={cn(
                            "text-xs",
                            pnl >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {pnl >= 0 ? "+" : ""}{pnlPercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={(position.currentValue / position.potentialPayout) * 100} 
                        className="h-2"
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.slice(0, 3).map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {bet.marketTitle}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            bet.position ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {bet.position ? "YES" : "NO"}
                        </Badge>
                        <span>{bet.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(bet.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Potential: {formatCurrency(bet.potential)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {portfolio.positions.map((position) => {
              const pnl = getPositionPnL(position);
              const pnlPercentage = getPositionPnLPercentage(position);
              
              return (
                <Card key={position.marketId} className="prediction-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-2 mb-2">
                          {position.market.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {position.market.category}
                          </Badge>
                          <Badge 
                            className={cn(
                              "text-xs",
                              position.position ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20"
                            )}
                          >
                            {position.position ? "YES" : "NO"}
                          </Badge>
                        </div>
                      </div>
                      {position.market.imageUrl && (
                        <img 
                          src={position.market.imageUrl}
                          alt={position.market.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Amount Bet</div>
                        <div className="font-semibold">{formatCurrency(position.totalAmount)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Current Value</div>
                        <div className="font-semibold">{formatCurrency(position.currentValue)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>P&L</span>
                        <span className={cn(
                          "font-medium",
                          pnl >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)} ({pnlPercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress 
                        value={Math.max(0, Math.min(100, ((position.currentValue / position.potentialPayout) * 100)))} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeRemaining(position.market.endDate)}</span>
                      </div>
                      <span>Max: {formatCurrency(position.potentialPayout)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Betting History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-medium">{bet.marketTitle}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            bet.position ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {bet.position ? "YES" : "NO"}
                        </Badge>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          bet.status === "ACTIVE" ? "bg-blue-50 text-blue-700" :
                          bet.status === "WON" ? "bg-green-50 text-green-700" :
                          bet.status === "LOST" ? "bg-red-50 text-red-700" :
                          "bg-gray-50 text-gray-700"
                        )}>
                          {bet.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {bet.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(bet.amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        Max: {formatCurrency(bet.potential)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                    <span className="font-medium">{portfolio.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Bets</span>
                    <span className="font-medium">{portfolio.totalBets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Positions</span>
                    <span className="font-medium">{portfolio.activeBets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Winnings</span>
                    <span className="font-medium text-green-600">{formatCurrency(portfolio.totalWinnings)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Betting Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">YES Positions</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: "65%" }}
                        />
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">NO Positions</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-destructive rounded-full" 
                          style={{ width: "35%" }}
                        />
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}