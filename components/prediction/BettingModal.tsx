"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Market } from "@/lib/types/prediction";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertCircle } from "lucide-react";

interface BettingModalProps {
  market: Market;
  position: boolean; // true = YES, false = NO
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlaceBet: (amount: number, position: boolean) => Promise<void>;
  userBalance?: number;
  trigger?: React.ReactNode;
}

export function BettingModal({
  market,
  position,
  open,
  onOpenChange,
  onPlaceBet,
  userBalance = 0,
  trigger,
}: BettingModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const numericAmount = parseFloat(amount) || 0;
  const currentOdds = position ? market.yesOdds : market.noOdds;
  const potentialPayout = numericAmount * (currentOdds / 100);
  const potentialProfit = potentialPayout - numericAmount;

  // Quick bet amounts
  const quickAmounts = [1, 5, 10, 25, 50, 100];

  // Time remaining
  const timeRemaining = () => {
    const now = new Date();
    const diff = market.endDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Market ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m remaining`;
  };

  const validateAmount = (value: number): string => {
    if (value <= 0) return "Amount must be greater than 0";
    if (value > userBalance) return "Insufficient balance";
    if (value < 0.01) return "Minimum bet is 0.01 CORE";
    if (value > 1000) return "Maximum bet is 1000 CORE";
    return "";
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError(validateAmount(parseFloat(value) || 0));
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    setError(validateAmount(quickAmount));
  };

  const handleSliderChange = (values: number[]) => {
    const value = values[0];
    const percentage = value / 100;
    const sliderAmount = Math.min(userBalance * percentage, 1000);
    setAmount(sliderAmount.toFixed(2));
    setError(validateAmount(sliderAmount));
  };

  const handlePlaceBet = async () => {
    const validationError = validateAmount(numericAmount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onPlaceBet(numericAmount, position);
      onOpenChange(false);
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bet");
    } finally {
      setIsLoading(false);
    }
  };

  const canPlaceBet = numericAmount > 0 && !error && !isLoading && market.status === "ACTIVE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {position ? (
              <TrendingUp className="w-5 h-5 text-primary" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            Bet {position ? "YES" : "NO"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Market Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm line-clamp-2">{market.title}</h4>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{timeRemaining()}</span>
              </div>
              <Badge variant="outline">{market.category}</Badge>
            </div>
          </div>

          {/* Position and Odds */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/30">
              <div className="text-sm text-muted-foreground">Your Position</div>
              <div className={cn(
                "text-2xl font-bold",
                position ? "text-primary" : "text-destructive"
              )}>
                {position ? "YES" : "NO"}
              </div>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-muted/30">
              <div className="text-sm text-muted-foreground">Current Odds</div>
              <div className="text-2xl font-bold">
                {currentOdds.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Bet Amount */}
          <div className="space-y-3">
            <Label htmlFor="amount">Bet Amount (CORE)</Label>
            
            <div className="space-y-3">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="pl-9 prediction-input"
                  step="0.01"
                  min="0.01"
                  max="1000"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(quickAmount)}
                    disabled={quickAmount > userBalance}
                    className="text-xs"
                  >
                    ${quickAmount}
                  </Button>
                ))}
              </div>

              {/* Balance Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Use % of balance</span>
                  <span>Balance: {userBalance.toFixed(2)} CORE</span>
                </div>
                <Slider
                  value={[userBalance > 0 ? (numericAmount / userBalance) * 100 : 0]}
                  onValueChange={handleSliderChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Payout Calculation */}
          {numericAmount > 0 && (
            <div className="space-y-2 p-4 rounded-xl bg-muted/30">
              <div className="flex justify-between text-sm">
                <span>Bet Amount:</span>
                <span>{numericAmount.toFixed(2)} CORE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Potential Payout:</span>
                <span className="font-medium">{potentialPayout.toFixed(2)} CORE</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Potential Profit:</span>
                <span className={cn(
                  potentialProfit > 0 ? "text-primary" : "text-destructive"
                )}>
                  +{potentialProfit.toFixed(2)} CORE
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlaceBet}
              disabled={!canPlaceBet}
              className={cn(
                "flex-1",
                position ? "prediction-button-primary" : "bg-destructive hover:bg-destructive/90"
              )}
            >
              {isLoading ? "Placing Bet..." : `Place Bet`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}