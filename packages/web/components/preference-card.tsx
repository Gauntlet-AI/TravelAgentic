'use client';

import { Check } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import type { PreferenceCard } from '@/lib/mock-data';

interface PreferenceCardProps {
  card: PreferenceCard;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PreferenceCardComponent({
  card,
  isSelected,
  onClick,
  className,
}: PreferenceCardProps) {
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
            className="h-48 w-full rounded-t-lg object-cover"
          />
          {isSelected && (
            <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1 text-white">
              <Check size={16} />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="mb-1 text-lg font-semibold">{card.title}</h3>
          <p className="mb-3 text-sm text-gray-600">{card.description}</p>
          {card.priceRange[0] > 0 && (
            <Badge variant="secondary">
              ${card.priceRange[0]} - ${card.priceRange[1]}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
