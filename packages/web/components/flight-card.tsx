'use client';

import { Clock, Plane, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { AmadeusFlightOffer, AmadeusFlightSearchResponse } from '@/lib/amadeus/types';

interface FlightCardProps {
  flightOffer: AmadeusFlightOffer;
  dictionaries: AmadeusFlightSearchResponse['dictionaries'];
  travelers: number;
}

export function FlightCard({ flightOffer, dictionaries, travelers }: FlightCardProps) {
  // Extract the main itinerary (first one)
  const mainItinerary = flightOffer.itineraries[0];
  const segments = mainItinerary.segments;
  
  // First and last segments for departure/arrival info
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  
  // Extract airline info
  const airline = dictionaries.carriers[firstSegment.carrierCode] || firstSegment.carrierCode;
  const flightNumber = `${firstSegment.carrierCode}${firstSegment.number}`;
  const aircraft = dictionaries.aircraft[firstSegment.aircraft.code]?.name || firstSegment.aircraft.code;
  
  // Extract departure info
  const departureTime = new Date(firstSegment.departure.at);
  const departureAirport = firstSegment.departure.iataCode;
  const departureCity = dictionaries.locations[departureAirport]?.cityCode || departureAirport;
  
  // Extract arrival info
  const arrivalTime = new Date(lastSegment.arrival.at);
  const arrivalAirport = lastSegment.arrival.iataCode;
  const arrivalCity = dictionaries.locations[arrivalAirport]?.cityCode || arrivalAirport;
  
  // Format duration from ISO 8601 (PT2H30M)
  const formatDuration = (duration: string): string => {
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (matches) {
      const hours = parseInt(matches[1] || '0');
      const minutes = parseInt(matches[2] || '0');
      return `${hours}h ${minutes}m`;
    }
    return duration;
  };
  
  // Calculate number of stops
  const stops = segments.length - 1;
  
  // Format price
  const price = parseFloat(flightOffer.price.total);
  const totalPrice = price * travelers;
  
  // Get cabin class from traveler pricing
  const cabinClass = flightOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'Economy';
  
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Plane className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{airline}</h3>
              <p className="text-sm text-gray-500">
                {flightNumber} • {aircraft}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${price}</div>
            <div className="text-sm text-gray-500">per person</div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-center">
            <div className="text-xl font-bold">
              {departureTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </div>
            <div className="text-sm text-gray-500">
              {departureAirport}
            </div>
            <div className="text-xs text-gray-400">{departureCity}</div>
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
              {formatDuration(mainItinerary.duration)}
            </div>
            <div className="text-xs text-gray-400">
              {stops === 0
                ? 'Nonstop'
                : `${stops} stop${stops > 1 ? 's' : ''}`}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold">
              {arrivalTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </div>
            <div className="text-sm text-gray-500">
              {arrivalAirport}
            </div>
            <div className="text-xs text-gray-400">{arrivalCity}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{cabinClass}</Badge>
            {stops === 0 && (
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
              <div className="font-semibold">${totalPrice.toFixed(2)} total</div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Select</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
