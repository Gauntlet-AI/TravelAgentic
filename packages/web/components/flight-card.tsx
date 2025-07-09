'use client';

import { Clock, Plane, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { Flight } from '@/lib/mock-data';

interface FlightCardProps {
  flight: Flight;
  travelers: number;
}

export function FlightCard({ flight, travelers }: FlightCardProps) {
  const totalPrice = flight.price * travelers;

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Plane className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{flight.airline}</h3>
              <p className="text-sm text-gray-500">
                {flight.flightNumber} • {flight.aircraft}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${flight.price}</div>
            <div className="text-sm text-gray-500">per person</div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-center">
            <div className="text-xl font-bold">{flight.departure.time}</div>
            <div className="text-sm text-gray-500">
              {flight.departure.airport}
            </div>
            <div className="text-xs text-gray-400">{flight.departure.city}</div>
          </div>

          <div className="mx-4 flex-1 text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>
              <div className="h-px flex-1 bg-gray-300"></div>
              <Plane className="h-4 w-4 text-gray-400" />
              <div className="h-px flex-1 bg-gray-300"></div>
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              {flight.duration}
            </div>
            <div className="text-xs text-gray-400">
              {flight.stops === 0
                ? 'Nonstop'
                : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold">{flight.arrival.time}</div>
            <div className="text-sm text-gray-500">
              {flight.arrival.airport}
            </div>
            <div className="text-xs text-gray-400">{flight.arrival.city}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{flight.class}</Badge>
            {flight.stops === 0 && (
              <Badge
                variant="outline"
                className="border-green-600 text-green-600"
              >
                Nonstop
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users className="h-3 w-3" />
                {travelers} traveler{travelers > 1 ? 's' : ''}
              </div>
              <div className="font-semibold">${totalPrice} total</div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Select</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
