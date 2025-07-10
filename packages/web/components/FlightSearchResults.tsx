import type { Flight } from '@/lib/mock-data';

import { FlightCard } from './flight-card';

/**
 * Flight result interface for server component data
 */
interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  origin?: string; // Legacy API format
  destination?: string; // Legacy API format
  departure: string | {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: string | {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  currency?: string;
  stops: number;
  class?: string;
  aircraft?: string;
  source: 'api' | 'browser' | 'voice' | 'manual' | 'ai';
}

/**
 * Props for FlightSearchResults component
 */
interface FlightSearchResultsProps {
  flights: FlightResult[];
  travelers?: number;
}

/**
 * Convert FlightResult to Flight interface
 */
function convertToFlight(flightResult: FlightResult): Flight {
  // Check if this is already in the proper format (AI-generated)
  if (typeof flightResult.departure === 'object' && typeof flightResult.arrival === 'object') {
    return {
      id: flightResult.id,
      airline: flightResult.airline,
      flightNumber: flightResult.flightNumber,
      departure: flightResult.departure,
      arrival: flightResult.arrival,
      duration: flightResult.duration,
      stops: flightResult.stops,
      price: flightResult.price,
      class: flightResult.class || 'Economy',
      aircraft: flightResult.aircraft || 'Commercial Aircraft',
    };
  }

  // Legacy API format conversion
  const departureDate = new Date(flightResult.departure as string);
  const arrivalDate = new Date(flightResult.arrival as string);

  return {
    id: flightResult.id,
    airline: flightResult.airline,
    flightNumber: flightResult.flightNumber,
    departure: {
      airport: flightResult.origin || 'ATL',
      city: flightResult.origin || 'Atlanta',
      time: departureDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      date: departureDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    },
    arrival: {
      airport: flightResult.destination || 'JFK',
      city: flightResult.destination || 'New York',
      time: arrivalDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      date: arrivalDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    },
    duration: flightResult.duration,
    stops: flightResult.stops,
    price: flightResult.price,
    class: flightResult.class || 'Economy',
    aircraft: flightResult.aircraft || 'Commercial Aircraft',
  };
}

/**
 * FlightSearchResults component
 * Displays a list of flight search results using the existing FlightCard component
 */
export function FlightSearchResults({
  flights,
  travelers = 1,
}: FlightSearchResultsProps) {
  if (flights.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow">
        <div className="mb-2 text-4xl">✈️</div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No Flights Found
        </h3>
        <p className="text-sm text-gray-600">
          Try adjusting your search criteria or dates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flights.map((flightResult) => (
        <FlightCard
          key={flightResult.id}
          flight={convertToFlight(flightResult)}
          travelers={travelers}
        />
      ))}

      {/* AI indicator */}
      {flights.length > 0 && flights[0]?.source === 'ai' && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
          <div className="flex items-center">
            <span className="text-sm text-purple-600">
              🤖 Flights selected by AI based on your preferences
            </span>
          </div>
        </div>
      )}

      {/* Fallback indicator */}
      {flights.length > 0 && flights[0]?.source !== 'api' && flights[0]?.source !== 'ai' && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-center">
            <span className="text-sm text-yellow-600">
              ⚠️ Results from{' '}
              {flights[0]?.source === 'manual'
                ? 'manual search'
                : 'fallback system'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
