import type { AmadeusFlightOffer, AmadeusFlightSearchResponse } from '@/lib/amadeus/types';

import { FlightCard } from './flight-card';

/**
 * Props for FlightSearchResults component
 */
interface FlightSearchResultsProps {
  flightOffers: AmadeusFlightOffer[];
  dictionaries: AmadeusFlightSearchResponse['dictionaries'];
  travelers?: number;
  source?: 'api' | 'browser' | 'voice' | 'manual' | 'ai';
}

/**
 * FlightSearchResults component
 * Displays a list of flight search results using AmadeusFlightOffer data
 */
export function FlightSearchResults({
  flightOffers,
  dictionaries,
  travelers = 1,
  source = 'api',
}: FlightSearchResultsProps) {
  if (flightOffers.length === 0) {
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
      {flightOffers.map((flightOffer) => (
        <FlightCard
          key={flightOffer.id}
          flightOffer={flightOffer}
          dictionaries={dictionaries}
          travelers={travelers}
        />
      ))}

      {/* AI indicator */}
      {flightOffers.length > 0 && source === 'ai' && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
          <div className="flex items-center">
            <span className="text-sm text-purple-600">
              🤖 Flights selected by AI based on your preferences
            </span>
          </div>
        </div>
      )}

      {/* Fallback indicator */}
      {flightOffers.length > 0 && source !== 'api' && source !== 'ai' && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-center">
            <span className="text-sm text-yellow-600">
              ⚠️ Results from{' '}
              {source === 'manual'
                ? 'manual search'
                : 'fallback system'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
