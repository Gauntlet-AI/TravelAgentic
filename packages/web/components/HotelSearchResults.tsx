import { HotelCard } from './hotel-card';

/**
 * Hotel result interface for server component data
 */
interface HotelResult {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  imageUrl: string;
  amenities: string[];
  source: 'api' | 'browser' | 'voice' | 'manual';
}

/**
 * Props for HotelSearchResults component
 */
interface HotelSearchResultsProps {
  hotels: HotelResult[];
  nights?: number;
}

/**
 * HotelSearchResults component
 * Displays a list of hotel search results
 */
export function HotelSearchResults({
  hotels,
  nights = 1,
}: HotelSearchResultsProps) {
  if (hotels.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow">
        <div className="mb-2 text-4xl">🏨</div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No Hotels Found
        </h3>
        <p className="text-sm text-gray-600">
          Try adjusting your location or dates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={{
            id: hotel.id,
            name: hotel.name,
            rating: hotel.rating,
            pricePerNight: hotel.price,
            image: hotel.imageUrl,
            amenities: hotel.amenities,
            location: hotel.location,
            description: `Rated ${hotel.rating}/5 by ${hotel.reviewCount} guests`,
          }}
          nights={nights}
        />
      ))}

      {/* Fallback indicator */}
      {hotels.length > 0 && hotels[0]?.source !== 'api' && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-center">
            <span className="text-sm text-yellow-600">
              ⚠️ Results from{' '}
              {hotels[0]?.source === 'manual'
                ? 'manual search'
                : 'fallback system'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
