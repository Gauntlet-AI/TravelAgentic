'use client';

import { Heart, X } from 'lucide-react';

import type React from 'react';
import { useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';

import type { PreferenceCard } from '@/lib/mock-data';

interface MobileSwipeCardProps {
  card: PreferenceCard;
  onSwipe: (direction: 'left' | 'right') => void;
}

export function MobileSwipeCard({ card, onSwipe }: MobileSwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const offset = touch.clientX - rect.left - rect.width / 2;
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragOffset) > 100) {
      onSwipe(dragOffset > 0 ? 'right' : 'left');
    }
    setDragOffset(0);
  };

  const swipeLeft = () => onSwipe('left');
  const swipeRight = () => onSwipe('right');

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        ref={cardRef}
        className={`overflow-hidden rounded-xl bg-white shadow-lg transition-transform ${
          isDragging ? 'scale-105' : ''
        }`}
        style={{
          transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={card.image || '/placeholder.svg'}
          alt={card.title}
          className="h-64 w-full object-cover"
        />
        <div className="p-6">
          <h3 className="mb-2 text-xl font-bold">{card.title}</h3>
          <p className="mb-4 text-gray-600">{card.description}</p>
          {card.priceRange[0] > 0 && (
            <Badge variant="secondary" className="text-sm">
              ${card.priceRange[0]} - ${card.priceRange[1]}
            </Badge>
          )}
        </div>
      </div>

      {/* Swipe indicators */}
      <div className="mt-6 flex justify-center gap-8">
        <button
          onClick={swipeLeft}
          className="rounded-full bg-red-500 p-4 text-white shadow-lg transition-colors hover:bg-red-600"
        >
          <X size={24} />
        </button>
        <button
          onClick={swipeRight}
          className="rounded-full bg-green-500 p-4 text-white shadow-lg transition-colors hover:bg-green-600"
        >
          <Heart size={24} />
        </button>
      </div>

      {/* Swipe hint */}
      <p className="mt-4 text-center text-sm text-gray-500">
        Swipe right to like, left to pass
      </p>
    </div>
  );
}
