'use client';

import { Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import type { Hotel } from '@/lib/mock-data';

interface HotelCardProps {
  hotel: Hotel;
  nights: number;
}

export function HotelCard({ hotel, nights }: HotelCardProps) {
  const totalPrice = hotel.pricePerNight * nights;

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        <img
          src={hotel.image || '/placeholder.svg'}
          alt={hotel.name}
          className="h-48 w-full rounded-t-lg object-cover"
        />
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-lg font-semibold">{hotel.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{hotel.rating}</span>
            </div>
          </div>
          <p className="mb-2 text-sm text-gray-600">{hotel.description}</p>
          <p className="mb-3 text-sm text-gray-500">{hotel.location}</p>

          <div className="mb-3 flex flex-wrap gap-1">
            {hotel.amenities.map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold">${hotel.pricePerNight}</span>
              <span className="text-sm text-gray-500">/night</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">{nights} nights</div>
              <div className="font-semibold">${totalPrice} total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
