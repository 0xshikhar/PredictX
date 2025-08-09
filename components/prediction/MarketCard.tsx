"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Users, DollarSign, Eye, Star } from "lucide-react";
import { Market } from "@/lib/types/prediction";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  market: Market;
  className?: string;
  onView?: () => void;
  onBet?: () => void;
  onAddToWatchlist?: () => void;
  isWatchlisted?: boolean;
  variant?: "default" | "compact" | "featured";
}

export function MarketCard({
  market,
  className,
  onView,
  onBet,
  onAddToWatchlist,
  isWatchlisted = false,
  variant = "default",
}: MarketCardProps) {
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

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "market-status-active";
      case "CLOSED":
        return "market-status-closed";
      case "RESOLVED":
        return "market-status-resolved";
      default:
        return "market-status-closed";
    }
  };

  const getVolumeIndicator = (volume: number) => {
    if (volume >= 100000) return "🔥";
    if (volume >= 10000) return "📈";
    if (volume >= 1000) return "💰";
    return "";
  };

  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  return (
    <Card
      className={cn(
        "prediction-card group cursor-pointer",
        isFeatured && "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent",
        className
      )}
      onClick={onView}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-primary text-primary-foreground">
            Featured
          </Badge>
        </div>
      )}

      {/* Market Image */}
      {market.imageUrl && !isCompact && (
        <div className="relative h-40 overflow-hidden rounded-t-xl">
          <img
            src={market.imageUrl}
            alt={market.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Status and Category Overlays */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={getStatusColor(market.status)}>
              {market.status}
            </Badge>
            {getVolumeIndicator(market.totalVolume) && (
              <span className="text-xl">{getVolumeIndicator(market.totalVolume)}</span>
            )}
          </div>
          
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 bg-white/90 text-gray-700"
          >
            {market.category}
          </Badge>

          {/* Watchlist Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute bottom-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWatchlist?.();
            }}
          >
            <Star
              className={cn(
                "w-4 h-4",
                isWatchlisted ? "fill-yellow-400 text-yellow-400" : "text-white"
              )}
            />
          </Button>
        </div>
      )}

      <CardHeader className={cn("pb-3", isCompact && "pb-2")}>
        <div className="space-y-2">
          {/* Category and Status for compact variant */}
          {isCompact && (
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {market.category}
              </Badge>
              <Badge className={cn("text-xs", getStatusColor(market.status))}>
                {market.status}
              </Badge>
            </div>
          )}

          <h3 className={cn(
            "font-semibold leading-tight line-clamp-2",
            isCompact ? "text-sm" : "text-base lg:text-lg"
          )}>
            {market.title}
          </h3>
          
          {!isCompact && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {market.description}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Odds Display */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className={cn(
              "font-bold text-primary",
              isCompact ? "text-lg" : "text-xl"
            )}>
              {market.yesOdds.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground font-medium">YES</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-destructive/5 border border-destructive/10">
            <div className={cn(
              "font-bold text-destructive",
              isCompact ? "text-lg" : "text-xl"
            )}>
              {market.noOdds.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground font-medium">NO</div>
          </div>
        </div>

        {/* Market Stats */}
        <div className={cn(
          "grid gap-3 text-xs",
          isCompact ? "grid-cols-2" : "grid-cols-3"
        )}>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{formatTimeRemaining(market.endDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{formatVolume(market.totalVolume)}</span>
          </div>
          {!isCompact && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3 flex-shrink-0" />
              <span>{market.totalBets}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={cn(
          "grid gap-2",
          isCompact ? "grid-cols-1" : "grid-cols-2"
        )}>
          {!isCompact && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView?.();
              }}
              className="flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              View
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBet?.();
            }}
            className="prediction-button-primary flex items-center gap-1"
            disabled={market.status !== "ACTIVE"}
          >
            <TrendingUp className="w-3 h-3" />
            Place Bet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}