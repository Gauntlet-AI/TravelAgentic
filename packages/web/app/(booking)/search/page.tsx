import { Suspense } from 'react';
import { format } from 'date-fns';

import { ActivitySearchResults } from '@/components/ActivitySearchResults';
import { FlightSearchResults } from '@/components/FlightSearchResults';
import { HotelSearchResults } from '@/components/HotelSearchResults';
import { SearchFormWrapper } from '@/components/search-form-wrapper';

/**
 * Search page props from URL search parameters
 */
interface SearchPageProps {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: string;
    cabin?: string;
    useAI?: string;
    roundTrip?: string;
  }>;
}

/**
 * Helper function to parse location string and extract airport code and city
 */
function parseLocation(location: string): { code: string; city: string } {
  if (!location) return { code: 'JFK', city: 'New York' };
  
  // Extract airport code from format like "New York (JFK)" or "JFK"
  const airportMatch = location.match(/\(([A-Z]{3})\)/);
  const airportCode = airportMatch ? airportMatch[1] : location.replace(/[^A-Z]/g, '');
  
  // Extract city name from format like "New York (JFK)"
  const cityMatch = location.match(/^([^(]+)/);
  const cityName = cityMatch ? cityMatch[1].trim() : location;
  
  return {
    code: airportCode || 'JFK',
    city: cityName || 'New York'
  };
}

/**
 * AI-powered search function that uses the research API
 */
async function searchWithAI(params: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: params.destination,
        departureLocation: params.origin,
        startDate: params.departureDate,
        endDate: params.returnDate,
        travelers: parseInt(params.passengers) || 1,
      }),
    });

    const researchData = await response.json();
    
    if (researchData.structured) {
      return {
        flights: generateAIFlights(researchData.flightPreferences, params),
        hotels: generateAIHotels(researchData.hotelPreferences, params),
        activities: generateAIActivities(researchData.activityRecommendations, params),
      };
    }
  } catch (error) {
    console.error('AI search error:', error);
  }
  
  return null;
}

/**
 * Helper function to calculate flight likelihood score
 */
function calculateFlightLikelihood(flight: any, preferences: any, index: number): number {
  let score = 100;
  
  // Price factor (30% weight)
  const priceRange = preferences.cabinClass === 'business' ? 1200 : 
                    preferences.cabinClass === 'premium' ? 600 : 400;
  const priceScore = Math.max(0, 100 - (flight.price / priceRange) * 100);
  score -= (100 - priceScore) * 0.3;
  
  // Stops factor (25% weight)
  const stopsScore = flight.stops === 0 ? 100 : flight.stops === 1 ? 70 : 40;
  score -= (100 - stopsScore) * 0.25;
  
  // Time preference factor (25% weight)
  const timeScores = { morning: 80, afternoon: 100, evening: 60 };
  const timeOfDay = index === 0 ? 'morning' : index === 1 ? 'afternoon' : 'evening';
  const timeScore = timeScores[timeOfDay as keyof typeof timeScores];
  score -= (100 - timeScore) * 0.25;
  
  // Airline preference factor (15% weight)
  const preferredAirlines = preferences.preferredAirlines || [];
  const airlineScore = preferredAirlines.includes(flight.airline) ? 100 : 70;
  score -= (100 - airlineScore) * 0.15;
  
  // Duration bonus (5% weight)
  const durationHours = parseFloat(flight.duration.match(/(\d+)h/)?.[1] || '4');
  const durationScore = Math.max(0, 100 - (durationHours - 3) * 10);
  score -= (100 - durationScore) * 0.05;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Helper function to calculate hotel likelihood score
 */
function calculateHotelLikelihood(hotel: any, preferences: any): number {
  let score = 100;
  
  // Value for money factor (40% weight)
  const valueScore = (hotel.rating / hotel.pricePerNight) * 1000;
  const normalizedValue = Math.min(100, valueScore * 20);
  score -= (100 - normalizedValue) * 0.4;
  
  // Rating factor (25% weight)
  const ratingScore = (hotel.rating / 5) * 100;
  score -= (100 - ratingScore) * 0.25;
  
  // Price range match factor (20% weight)
  const expectedPrice = preferences.priceRange === 'luxury' ? 400 : 
                       preferences.priceRange === 'mid-range' ? 200 : 100;
  const priceMatchScore = Math.max(0, 100 - Math.abs(hotel.pricePerNight - expectedPrice) / expectedPrice * 100);
  score -= (100 - priceMatchScore) * 0.2;
  
  // Hotel type preference factor (15% weight)
  const preferredTypes = preferences.preferredTypes || [];
  const typeScore = preferredTypes.some((type: string) => hotel.name.toLowerCase().includes(type.toLowerCase())) ? 100 : 70;
  score -= (100 - typeScore) * 0.15;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Helper function to calculate activity likelihood score
 */
function calculateActivityLikelihood(activity: any, preferences: any): number {
  let score = 100;
  
  // AI Priority factor (40% weight)
  const priorityScore = preferences.interests?.includes(activity.category) ? 100 : 70;
  score -= (100 - priorityScore) * 0.4;
  
  // Price factor (30% weight)
  const expectedPrice = 75;
  const priceScore = Math.max(0, 100 - Math.abs(activity.price - expectedPrice) / expectedPrice * 100);
  score -= (100 - priceScore) * 0.3;
  
  // Duration factor (20% weight)
  const durationHours = parseFloat(activity.duration.match(/(\d+)/)?.[0] || '2');
  const durationScore = (durationHours >= 2 && durationHours <= 4) ? 100 : 70;
  score -= (100 - durationScore) * 0.2;
  
  // Variety factor (10% weight)
  const varietyScore = 70 + Math.random() * 30;
  score -= (100 - varietyScore) * 0.1;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Helper function to generate AI-informed flights
 */
function generateAIFlights(preferences: any, params: any) {
  const originInfo = parseLocation(params.origin);
  const destinationInfo = parseLocation(params.destination);
  const isRoundTrip = params.roundTrip === 'true';
  
  const airlines = preferences.preferredAirlines || ['Delta Air Lines', 'American Airlines', 'United Airlines'];
  const basePrice = preferences.cabinClass === 'business' ? 800 : 
                   preferences.cabinClass === 'premium' ? 400 : 200;
  
  const aircraftTypes = ['Boeing 737-800', 'Airbus A320', 'Boeing 777-200'];
  const cabinClass = preferences.cabinClass === 'business' ? 'Business' : 
                    preferences.cabinClass === 'premium' ? 'Premium Economy' : 'Economy';
  
  // Generate outbound flights
  const outboundFlights = airlines.slice(0, 3).map((airline: string, index: number) => {
    const departureTime = index === 0 ? '8:30 AM' : index === 1 ? '2:15 PM' : '6:45 PM';
    const arrivalTime = index === 0 ? '12:30 PM' : index === 1 ? '6:15 PM' : '10:45 PM';
    const stops = preferences.stopPreference === 'direct' ? 0 : Math.floor(Math.random() * 2);
    
    return {
      id: `ai-flight-outbound-${index}`,
      airline,
      flightNumber: `${airline.substr(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
      departure: {
        airport: originInfo.code,
        city: originInfo.city,
        time: departureTime,
        date: new Date(params.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      },
      arrival: {
        airport: destinationInfo.code,
        city: destinationInfo.city,
        time: arrivalTime,
        date: new Date(params.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      },
      duration: stops === 0 ? '4h 0m' : '6h 30m',
      price: basePrice + Math.floor(Math.random() * 200),
      stops,
      class: cabinClass,
      aircraft: aircraftTypes[index % aircraftTypes.length],
      source: 'ai' as const,
      direction: 'outbound' as const,
    };
  });

  let flights = [...outboundFlights];

  // Generate return flights if round trip
  if (isRoundTrip && params.returnDate) {
    const returnFlights = airlines.slice(0, 3).map((airline: string, index: number) => {
      const departureTime = index === 0 ? '9:15 AM' : index === 1 ? '3:30 PM' : '7:20 PM';
      const arrivalTime = index === 0 ? '1:15 PM' : index === 1 ? '7:30 PM' : '11:20 PM';
      const stops = preferences.stopPreference === 'direct' ? 0 : Math.floor(Math.random() * 2);
      
      return {
        id: `ai-flight-return-${index}`,
        airline,
        flightNumber: `${airline.substr(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
        departure: {
          airport: destinationInfo.code,
          city: destinationInfo.city,
          time: departureTime,
          date: new Date(params.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        },
        arrival: {
          airport: originInfo.code,
          city: originInfo.city,
          time: arrivalTime,
          date: new Date(params.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        },
        duration: stops === 0 ? '4h 0m' : '6h 30m',
        price: basePrice + Math.floor(Math.random() * 200),
        stops,
        class: cabinClass,
        aircraft: aircraftTypes[index % aircraftTypes.length],
        source: 'ai' as const,
        direction: 'return' as const,
      };
    });

    flights = [...flights, ...returnFlights];
  }

  // Calculate likelihood scores and sort by most likely choice
  const flightsWithScores = flights.map((flight: any) => ({
    ...flight,
    likelihoodScore: calculateFlightLikelihood(flight, preferences, flights.indexOf(flight))
  }));

  // Sort by likelihood score (highest first) and remove the score
  return flightsWithScores
    .sort((a: any, b: any) => b.likelihoodScore - a.likelihoodScore)
    .map(({ likelihoodScore, ...flight }: any) => flight);
}

/**
 * Helper function to generate AI-informed hotels
 */
function generateAIHotels(preferences: any, params: any) {
  const destinationInfo = parseLocation(params.destination);
  const hotelTypes = preferences.preferredTypes || ['luxury', 'boutique', 'business'];
  const basePrice = preferences.priceRange === 'luxury' ? 300 : 
                   preferences.priceRange === 'mid-range' ? 150 : 80;
  
  const descriptions = {
    luxury: 'Elegant luxury hotel with world-class amenities and exceptional service',
    boutique: 'Charming boutique hotel with unique character and personalized attention',
    business: 'Modern business hotel with convenient location and professional facilities',
    'family-friendly': 'Comfortable family hotel with amenities for all ages'
  };
  
  const hotels = hotelTypes.slice(0, 3).map((type: string, index: number) => ({
    id: `ai-hotel-${index}`,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${destinationInfo.city} Hotel`,
    location: `${destinationInfo.city}, ${preferences.locationPreference || 'city center'}`,
    rating: Math.round((4.0 + Math.random() * 1.0) * 10) / 10,
    pricePerNight: basePrice + Math.floor(Math.random() * 100),
    image: '/placeholder.jpg',
    amenities: preferences.amenities || ['WiFi', 'Pool', 'Gym'],
    description: descriptions[type as keyof typeof descriptions] || 'Quality accommodation with modern amenities',
    source: 'ai' as const,
  }));

  // Calculate likelihood scores and sort by most likely choice
  const hotelsWithScores = hotels.map((hotel: any) => ({
    ...hotel,
    likelihoodScore: calculateHotelLikelihood(hotel, preferences)
  }));

  // Sort by likelihood score (highest first) and remove the score
  return hotelsWithScores
    .sort((a: any, b: any) => b.likelihoodScore - a.likelihoodScore)
    .map(({ likelihoodScore, ...hotel }: any) => hotel);
}

/**
 * Helper function to generate AI-informed activities
 */
function generateAIActivities(preferences: any, params: any) {
  const destinationInfo = parseLocation(params.destination);
  const activityTypes = preferences.interests || ['sightseeing', 'culture', 'outdoor'];
  
  const activities = activityTypes.slice(0, 3).map((type: string, index: number) => ({
    id: `ai-activity-${index}`,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Experience in ${destinationInfo.city}`,
    location: `${destinationInfo.city}, ${preferences.locationPreference || 'city center'}`,
    category: [type],
    duration: ['2-3 hours', '3-4 hours', '4-5 hours'][index],
    rating: Math.round((4.0 + Math.random() * 1.0) * 10) / 10,
    reviewCount: Math.floor(Math.random() * 500) + 50,
    price: Math.floor(Math.random() * 100) + 30,
    currency: 'USD',
    image: '/placeholder.jpg',
    description: `Experience the best of ${type} activities in ${destinationInfo.city}`,
    source: 'ai' as const,
  }));

  // Calculate likelihood scores and sort by most likely choice
  const activitiesWithScores = activities.map((activity: any) => ({
    ...activity,
    likelihoodScore: calculateActivityLikelihood(activity, preferences)
  }));

  // Sort by likelihood score (highest first) and remove the score
  return activitiesWithScores
    .sort((a: any, b: any) => b.likelihoodScore - a.likelihoodScore)
    .map(({ likelihoodScore, ...activity }: any) => activity);
}

/**
 * Flight search function (server-side) - Now uses integrated mock APIs
 */
async function searchFlights(params: any): Promise<
  Array<{
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departure: string;
    arrival: string;
    duration: string;
    price: number;
    currency: string;
    stops: number;
    source: 'api' | 'browser' | 'voice' | 'manual';
  }>
> {
  try {
    const originInfo = parseLocation(params.origin);
    const destinationInfo = parseLocation(params.destination);
    
    // Make API call to our integrated mock service
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: originInfo.code,
        destination: destinationInfo.code,
        departureDate: params.departureDate || '2025-12-15',
        returnDate: params.returnDate,
        passengers: parseInt(params.passengers) || 1,
        cabin: params.cabin || 'economy'
      }),
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      // Transform the API response to match the expected format
      return data.data.map((flight: any) => {
        const firstSegment = flight.segments?.[0];
        const lastSegment = flight.segments?.[flight.segments.length - 1];
        
        return {
          id: flight.id,
          airline: firstSegment?.airline || 'Unknown Airline',
          flightNumber: firstSegment?.flightNumber || 'Unknown',
          origin: firstSegment?.departure?.airport?.code || originInfo.code,
          destination: lastSegment?.arrival?.airport?.code || destinationInfo.code,
          departure: firstSegment?.departure?.time || `${params.departureDate || '2025-12-15'}T08:00:00Z`,
          arrival: lastSegment?.arrival?.time || `${params.departureDate || '2025-12-15'}T12:00:00Z`,
          duration: flight.totalDuration || '4h 0m',
          price: flight.price?.amount || 299,
          currency: flight.price?.currency || 'USD',
          stops: flight.segments?.length - 1 || 0,
          source: 'api',
        };
      });
    }
  } catch (error) {
    console.error('Flight search API error:', error);
  }

  // Fallback to empty array if API fails
  return [];
}

/**
 * Hotel search function (server-side) - Now uses integrated mock APIs
 */
async function searchHotels(params: any): Promise<
  Array<{
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
  }>
> {
  try {
    const destinationInfo = parseLocation(params.destination);
    
    // Make API call to our integrated mock service
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/hotels/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: destinationInfo.city,
        checkIn: params.departureDate || '2025-12-15',
        checkOut: params.returnDate || '2025-12-18',
        guests: {
          adults: parseInt(params.passengers) || 2,
          children: 0,
          rooms: 1
        }
      }),
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      // Transform the API response to match the expected format
      return data.data.map((hotel: any) => ({
        id: hotel.id,
        name: hotel.name,
        location: hotel.location?.displayName || hotel.location?.city || destinationInfo.city,
        rating: hotel.rating?.score || hotel.starRating || 4.0,
        reviewCount: hotel.rating?.reviewCount || hotel.reviewCount || 100,
        price: hotel.price?.amount || hotel.pricePerNight || 150,
        currency: hotel.price?.currency || 'USD',
        imageUrl: hotel.images?.[0] || hotel.imageUrl || '/placeholder.jpg',
        amenities: hotel.amenities || ['WiFi'],
        source: 'api',
      }));
    }
  } catch (error) {
    console.error('Hotel search API error:', error);
  }

  // Fallback to empty array if API fails
  return [];
}

/**
 * Activity search function (server-side) - Now uses integrated mock APIs
 */
async function searchActivities(params: any): Promise<
  Array<{
    id: string;
    name: string;
    location: string;
    category: string;
    duration: string;
    rating: number;
    reviewCount: number;
    price: number;
    currency: string;
    imageUrl: string;
    source: 'api' | 'browser' | 'voice' | 'manual';
  }>
> {
  try {
    const destinationInfo = parseLocation(params.destination);
    
    // Make API call to our integrated mock service
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/activities/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: destinationInfo.city,
        startDate: params.departureDate || '2025-12-15',
        endDate: params.returnDate || '2025-12-18',
        categories: ['outdoor', 'culture', 'sightseeing']
      }),
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      // Transform the API response to match the expected format
      return data.data.map((activity: any) => ({
        id: activity.id,
        name: activity.name,
        location: activity.location?.displayName || activity.location?.city || destinationInfo.city,
        category: activity.categories?.[0] || activity.category || 'Activity',
        duration: activity.duration?.description || activity.duration || '2-3 hours',
        rating: Math.round((activity.rating?.score || activity.rating || 4.0) * 10) / 10,
        reviewCount: activity.rating?.reviewCount || activity.reviewCount || 100,
        price: activity.price?.amount || activity.priceFrom || 50,
        currency: activity.price?.currency || 'USD',
        imageUrl: activity.images?.[0] || activity.imageUrl || '/placeholder.jpg',
        source: 'api',
      }));
    }
  } catch (error) {
    console.error('Activity search API error:', error);
  }

  // Fallback to empty array if API fails
  return [];
}

/**
 * Server Component for Flight Search Results
 */
async function FlightSearchSection({ searchParams }: { searchParams: {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: string;
  cabin?: string;
  useAI?: string;
} }) {
  let flights = [];
  
  if (searchParams.useAI === 'true') {
    // Use AI-powered search
    const aiResults = await searchWithAI(searchParams);
    flights = aiResults?.flights || [];
  } else {
    // Use regular API search
    flights = await searchFlights(searchParams);
  }
  
  return <FlightSearchResults flights={flights} />;
}

/**
 * Server Component for Hotel Search Results
 */
async function HotelSearchSection({ searchParams }: { searchParams: {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: string;
  cabin?: string;
  useAI?: string;
} }) {
  let hotels = [];
  
  if (searchParams.useAI === 'true') {
    // Use AI-powered search
    const aiResults = await searchWithAI(searchParams);
    hotels = aiResults?.hotels || [];
  } else {
    // Use regular API search
    hotels = await searchHotels(searchParams);
  }
  
  return <HotelSearchResults hotels={hotels} />;
}

/**
 * Server Component for Activity Search Results
 */
async function ActivitySearchSection({ searchParams }: { searchParams: {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: string;
  cabin?: string;
  useAI?: string;
} }) {
  let activities = [];
  
  if (searchParams.useAI === 'true') {
    // Use AI-powered search
    const aiResults = await searchWithAI(searchParams);
    activities = aiResults?.activities || [];
  } else {
    // Use regular API search
    activities = await searchActivities(searchParams);
  }
  
  return <ActivitySearchResults activities={activities} />;
}

/**
 * Main Search Page Server Component
 * Renders search form and fetches travel data on the server
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const hasSearchParams =
    resolvedSearchParams.origin &&
    resolvedSearchParams.destination &&
    resolvedSearchParams.departureDate;
  
  const isAIPowered = resolvedSearchParams.useAI === 'true';

  return (
    <div className="space-y-8">
      {/* Search Form - Always visible */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Search Travel</h1>
          {isAIPowered && (
            <div className="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
              <span className="text-base">🧠</span>
              AI-Powered Search
            </div>
          )}
        </div>
        <SearchFormWrapper />
      </div>

      {/* Search Results - Only show if search parameters exist */}
      {hasSearchParams && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Flight Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✈️</span>
                <h2 className="text-lg font-semibold text-gray-900">Flights</h2>
              </div>
              {isAIPowered && (
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <span>🤖</span>
                  <span>AI Selected</span>
                </div>
              )}
            </div>
            <Suspense fallback={<FlightSearchSkeleton />}>
              <FlightSearchSection searchParams={resolvedSearchParams} />
            </Suspense>
          </div>

          {/* Hotel Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏨</span>
                <h2 className="text-lg font-semibold text-gray-900">Hotels</h2>
              </div>
              {isAIPowered && (
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <span>🤖</span>
                  <span>AI Selected</span>
                </div>
              )}
            </div>
            <Suspense fallback={<HotelSearchSkeleton />}>
              <HotelSearchSection searchParams={resolvedSearchParams} />
            </Suspense>
          </div>

          {/* Activity Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <h2 className="text-lg font-semibold text-gray-900">
                  Activities
                </h2>
              </div>
              {isAIPowered && (
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <span>🤖</span>
                  <span>AI Curated</span>
                </div>
              )}
            </div>
            <Suspense fallback={<ActivitySearchSkeleton />}>
              <ActivitySearchSection searchParams={resolvedSearchParams} />
            </Suspense>
          </div>
        </div>
      )}

      {/* No search message */}
      {!hasSearchParams && (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">🌍</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Start Your Travel Search
          </h2>
          <p className="text-gray-600">
            Enter your travel details above to search for flights, hotels, and
            activities.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            💡 Tip: Use our AI-powered search from the home page for personalized recommendations
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton components
 */
function FlightSearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-lg bg-white p-4 shadow">
          <div className="animate-pulse">
            <div className="mb-3 flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-3 w-16 rounded bg-gray-200"></div>
              </div>
              <div className="h-6 w-16 rounded bg-gray-200"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-32 rounded bg-gray-200"></div>
              <div className="h-8 w-20 rounded bg-blue-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HotelSearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-lg bg-white p-4 shadow">
          <div className="animate-pulse">
            <div className="mb-3 h-32 w-full rounded bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              <div className="mt-3 flex items-center justify-between">
                <div className="h-3 w-16 rounded bg-gray-200"></div>
                <div className="h-6 w-20 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivitySearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-lg bg-white p-4 shadow">
          <div className="animate-pulse">
            <div className="mb-3 h-24 w-full rounded bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-5/6 rounded bg-gray-200"></div>
              <div className="h-3 w-1/3 rounded bg-gray-200"></div>
              <div className="mt-3 flex items-center justify-between">
                <div className="h-3 w-12 rounded bg-gray-200"></div>
                <div className="h-6 w-16 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
