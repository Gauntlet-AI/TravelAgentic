'use client';

import { Clock, MapPin, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import type { Activity } from '@/lib/mock-data';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        <img
          src={activity.image || '/placeholder.svg'}
          alt={activity.name}
          className="h-48 w-full rounded-t-lg object-cover"
        />
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-lg font-semibold">{activity.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{activity.rating}</span>
            </div>
          </div>

          <p className="mb-3 text-sm text-gray-600">{activity.description}</p>

          <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{activity.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{activity.location}</span>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-1">
            {activity.category.map((cat) => (
              <Badge key={cat} variant="outline" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">${activity.price}</span>
            <span className="text-sm text-gray-500">per person</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
