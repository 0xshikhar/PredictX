"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { PredictionCard } from "./PredictionCard";
import { Market, SwipeDirection } from "@/lib/types/prediction";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Heart, TrendingUp, TrendingDown } from "lucide-react";

interface SwipeInterfaceProps {
  markets: Market[];
  onSwipe: (marketId: string, direction: SwipeDirection) => void;
  onBetYes: (marketId: string) => void;
  onBetNo: (marketId: string) => void;
  className?: string;
}

interface CardState {
  id: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  scale: number;
  zIndex: number;
}

export function SwipeInterface({
  markets,
  onSwipe,
  onBetYes,
  onBetNo,
  className,
}: SwipeInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardStates, setCardStates] = useState<Map<string, CardState>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Initialize card states
  useEffect(() => {
    const initialStates = new Map<string, CardState>();
    markets.slice(0, 4).forEach((market, index) => {
      initialStates.set(market.id, {
        id: market.id,
        x: 0,
        y: index * 4,
        rotation: 0,
        opacity: 1 - (index * 0.1),
        scale: 1 - (index * 0.05),
        zIndex: markets.length - index,
      });
    });
    setCardStates(initialStates);
  }, [markets]);

  const handleSwipeComplete = useCallback((direction: SwipeDirection) => {
    const currentMarket = markets[currentIndex];
    if (!currentMarket) return;

    onSwipe(currentMarket.id, direction);
    
    // Move to next card
    setCurrentIndex(prev => prev + 1);
    
    // Update card states
    setCardStates(prev => {
      const newStates = new Map(prev);
      
      // Remove the swiped card
      newStates.delete(currentMarket.id);
      
      // Add new card if available
      const nextCardIndex = currentIndex + 4;
      if (nextCardIndex < markets.length) {
        const nextMarket = markets[nextCardIndex];
        newStates.set(nextMarket.id, {
          id: nextMarket.id,
          x: 0,
          y: 12,
          rotation: 0,
          opacity: 0.7,
          scale: 0.85,
          zIndex: 1,
        });
      }
      
      // Update positions of remaining cards
      Array.from(newStates.values()).forEach((state, index) => {
        newStates.set(state.id, {
          ...state,
          y: index * 4,
          opacity: 1 - (index * 0.1),
          scale: 1 - (index * 0.05),
          zIndex: newStates.size - index,
        });
      });
      
      return newStates;
    });
    
    setSwipeDirection(null);
  }, [currentIndex, markets, onSwipe]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || currentIndex >= markets.length) return;
    
    const touch = e.touches[0];
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    const x = touch.clientX - (containerRect.left + containerRect.width / 2);
    const y = touch.clientY - (containerRect.top + containerRect.height / 2);
    
    const rotation = x * 0.1;
    const opacity = Math.max(0.5, 1 - Math.abs(x) / 200);
    
    // Determine swipe direction
    let direction: SwipeDirection | null = null;
    if (Math.abs(x) > 50) {
      direction = x > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
    } else if (Math.abs(y) > 50) {
      direction = y > 0 ? SwipeDirection.DOWN : SwipeDirection.UP;
    }
    
    setSwipeDirection(direction);
    
    const currentMarket = markets[currentIndex];
    if (currentMarket) {
      setCardStates(prev => {
        const newStates = new Map(prev);
        const currentState = newStates.get(currentMarket.id);
        if (currentState) {
          newStates.set(currentMarket.id, {
            ...currentState,
            x,
            y: y + currentState.y,
            rotation,
            opacity,
          });
        }
        return newStates;
      });
    }
  }, [isDragging, currentIndex, markets]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging || currentIndex >= markets.length) return;
    
    const currentMarket = markets[currentIndex];
    const currentState = cardStates.get(currentMarket.id);
    
    if (!currentState) return;
    
    const swipeThreshold = 100;
    const shouldSwipe = Math.abs(currentState.x) > swipeThreshold || Math.abs(currentState.y) > swipeThreshold;
    
    if (shouldSwipe && swipeDirection) {
      // Complete the swipe
      const exitX = currentState.x > 0 ? 400 : -400;
      const exitY = currentState.y > 0 ? 400 : -400;
      
      setCardStates(prev => {
        const newStates = new Map(prev);
        newStates.set(currentMarket.id, {
          ...currentState,
          x: Math.abs(currentState.x) > Math.abs(currentState.y) ? exitX : currentState.x,
          y: Math.abs(currentState.y) > Math.abs(currentState.x) ? exitY : currentState.y,
          opacity: 0,
          rotation: exitX * 0.2,
        });
        return newStates;
      });
      
      setTimeout(() => handleSwipeComplete(swipeDirection), 200);
    } else {
      // Snap back to center
      setCardStates(prev => {
        const newStates = new Map(prev);
        newStates.set(currentMarket.id, {
          ...currentState,
          x: 0,
          y: currentState.y - currentState.y,
          rotation: 0,
          opacity: 1,
        });
        return newStates;
      });
    }
    
    setIsDragging(false);
    setSwipeDirection(null);
  }, [isDragging, currentIndex, markets, cardStates, swipeDirection, handleSwipeComplete]);

  const handleButtonSwipe = useCallback((direction: SwipeDirection) => {
    if (currentIndex >= markets.length) return;
    
    const currentMarket = markets[currentIndex];
    const currentState = cardStates.get(currentMarket.id);
    if (!currentState) return;
    
    const exitX = direction === SwipeDirection.RIGHT ? 400 : direction === SwipeDirection.LEFT ? -400 : 0;
    const exitY = direction === SwipeDirection.UP ? -400 : direction === SwipeDirection.DOWN ? 400 : 0;
    
    setCardStates(prev => {
      const newStates = new Map(prev);
      newStates.set(currentMarket.id, {
        ...currentState,
        x: exitX,
        y: exitY,
        opacity: 0,
        rotation: exitX * 0.2,
      });
      return newStates;
    });
    
    setTimeout(() => handleSwipeComplete(direction), 200);
  }, [currentIndex, markets, cardStates, handleSwipeComplete]);

  const visibleMarkets = markets.slice(currentIndex, currentIndex + 4);

  if (currentIndex >= markets.length) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h3 className="text-xl font-semibold">All caught up!</h3>
          <p className="text-muted-foreground">
            You've seen all available predictions. Check back later for more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full max-w-sm mx-auto", className)}>
      {/* Card Stack */}
      <div
        ref={containerRef}
        className="swipe-card-stack h-[600px] relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {visibleMarkets.map((market, index) => {
          const state = cardStates.get(market.id);
          if (!state) return null;
          
          return (
            <div
              key={market.id}
              ref={(el) => {
                if (el) cardRefs.current.set(market.id, el);
              }}
              className="absolute inset-0 transition-all duration-200 ease-out"
              style={{
                transform: `translate(${state.x}px, ${state.y}px) rotate(${state.rotation}deg) scale(${state.scale})`,
                opacity: state.opacity,
                zIndex: state.zIndex,
              }}
            >
              {/* Swipe Indicators */}
              <div
                className={cn(
                  "swipe-indicator-yes",
                  swipeDirection === SwipeDirection.RIGHT && "opacity-100"
                )}
              >
                INTERESTED
              </div>
              <div
                className={cn(
                  "swipe-indicator-no",
                  swipeDirection === SwipeDirection.LEFT && "opacity-100"
                )}
              >
                PASS
              </div>
              <div
                className={cn(
                  "absolute top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-lg opacity-0 transition-opacity duration-200",
                  swipeDirection === SwipeDirection.UP && "opacity-100"
                )}
              >
                BET YES
              </div>
              <div
                className={cn(
                  "absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-6 py-3 rounded-2xl font-bold text-lg opacity-0 transition-opacity duration-200",
                  swipeDirection === SwipeDirection.DOWN && "opacity-100"
                )}
              >
                BET NO
              </div>
              
              <PredictionCard
                market={market}
                variant="swipe"
                showActions={false}
                className="h-full"
              />
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <Button
          size="icon"
          variant="outline"
          className="w-14 h-14 rounded-full bg-white shadow-lg border-2"
          onClick={() => handleButtonSwipe(SwipeDirection.LEFT)}
        >
          <X className="w-6 h-6 text-gray-600" />
        </Button>
        
        <Button
          size="icon"
          variant="outline"
          className="w-14 h-14 rounded-full bg-white shadow-lg border-2"
          onClick={() => handleButtonSwipe(SwipeDirection.RIGHT)}
        >
          <Heart className="w-6 h-6 text-primary" />
        </Button>
        
        <Button
          size="icon"
          className="w-14 h-14 rounded-full prediction-button-primary shadow-lg"
          onClick={() => {
            const currentMarket = markets[currentIndex];
            if (currentMarket) onBetYes(currentMarket.id);
          }}
        >
          <TrendingUp className="w-6 h-6" />
        </Button>
        
        <Button
          size="icon"
          variant="destructive"
          className="w-14 h-14 rounded-full shadow-lg"
          onClick={() => {
            const currentMarket = markets[currentIndex];
            if (currentMarket) onBetNo(currentMarket.id);
          }}
        >
          <TrendingDown className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}