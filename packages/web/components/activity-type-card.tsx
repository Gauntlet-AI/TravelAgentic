'use client';

import { Check } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import type { ActivityTypeCard } from '@/lib/mock-data';

interface ActivityTypeCardProps {
  card: ActivityTypeCard;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ActivityTypeCardComponent({
  card,
  isSelected,
  onClick,
  className,
}: ActivityTypeCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : ''
      } ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={card.image || '/placeholder.svg'}
            alt={card.title}
            className="h-32 w-full rounded-t-lg object-cover"
          />
          {isSelected && (
            <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1 text-white">
              <Check size={16} />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">{card.icon}</span>
            <h3 className="text-lg font-semibold">{card.title}</h3>
          </div>
          <p className="text-sm text-gray-600">{card.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
