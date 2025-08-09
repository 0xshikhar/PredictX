"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Users, DollarSign } from "lucide-react";
import { Market } from "@/lib/types/prediction";
import { cn } from "@/lib/utils";

interface PredictionCardProps {
  market: Market;
  className?: string;
  onBetYes?: () => void;
  onBetNo?: () => void;
  onAddToWatchlist?: () => void;
  showActions?: boolean;
  variant?: "default" | "compact" | "swipe";
}

export function PredictionCard({
  market,
  className,
  onBetYes,
  onBetNo,
  onAddToWatchlist,
  showActions = true,
  variant = "default",
}: PredictionCardProps) {
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
        return "bg-primary/10 text-primary border-primary/20";
      case "CLOSED":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "RESOLVED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const isSwipeVariant = variant === "swipe";
  const isCompact = variant === "compact";

  return (
    <Card
      className={cn(
        "prediction-card overflow-hidden",
        {
          "h-full": isSwipeVariant,
          "min-h-[200px]": isCompact,
        },
        className
      )}
    >
      {/* Market Image */}
      {market.imageUrl && (
        <div className={cn("relative", isSwipeVariant ? "h-48" : "h-32")}>
          <img
            src={market.imageUrl}
            alt={market.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Status Badge */}
          <Badge
            className={cn(
              "absolute top-3 left-3",
              getStatusColor(market.status)
            )}
          >
            {market.status}
          </Badge>
          
          {/* Category */}
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 bg-white/90 text-gray-700"
          >
            {market.category}
          </Badge>
        </div>
      )}

      <CardHeader className={cn("pb-3", isCompact && "pb-2")}>
        <div className="space-y-2">
          <h3 className={cn(
            "font-semibold leading-tight",
            isSwipeVariant ? "text-xl" : "text-lg",
            isCompact && "text-base"
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
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {market.yesOdds.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">YES</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">
              {market.noOdds.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">NO</div>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatTimeRemaining(market.endDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="w-3 h-3" />
            <span>{formatVolume(market.totalVolume)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{market.totalBets}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onBetYes}
                className="prediction-button-primary"
                size={isCompact ? "sm" : "default"}
              >
                Bet YES
              </Button>
              <Button
                onClick={onBetNo}
                variant="destructive"
                size={isCompact ? "sm" : "default"}
              >
                Bet NO
              </Button>
            </div>
            
            {!isCompact && (
              <Button
                onClick={onAddToWatchlist}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Add to Watchlist
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}