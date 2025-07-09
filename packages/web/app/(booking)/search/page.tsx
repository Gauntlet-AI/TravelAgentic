import { Suspense } from 'react'
import { FlightSearchResults } from '@/components/FlightSearchResults'
import { HotelSearchResults } from '@/components/HotelSearchResults'
import { ActivitySearchResults } from '@/components/ActivitySearchResults'
import { TravelInputForm } from '@/components/travel-input-form'

/**
 * Search page props from URL search parameters
 */
interface SearchPageProps {
  searchParams: {
    origin?: string
    destination?: string
    departureDate?: string
    returnDate?: string
    passengers?: string
    cabin?: string
  }
}

/**
 * Flight search function (server-side)
 */
async function searchFlights(params: any): Promise<Array<{
  id: string
  airline: string
  flightNumber: string
  origin: string
  destination: string
  departure: string
  arrival: string
  duration: string
  price: number
  currency: string
  stops: number
  source: 'api' | 'browser' | 'voice' | 'manual'
}>> {
  // In Phase 1, use mock data. In Phase 2+, call real APIs
  if (process.env.USE_MOCK_APIS === 'true') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return [
      {
        id: '1',
        airline: 'American Airlines',
        flightNumber: 'AA1234',
        origin: params.origin || 'NYC',
        destination: params.destination || 'LAX',
        departure: `${params.departureDate || '2025-08-01'}T08:00:00Z`,
        arrival: `${params.departureDate || '2025-08-01'}T12:00:00Z`,
        duration: '4h 0m',
        price: 299,
        currency: 'USD',
        stops: 0,
        source: 'api'
      },
      {
        id: '2',
        airline: 'Delta Air Lines',
        flightNumber: 'DL5678',
        origin: params.origin || 'NYC',
        destination: params.destination || 'LAX',
        departure: `${params.departureDate || '2025-08-01'}T14:00:00Z`,
        arrival: `${params.departureDate || '2025-08-01'}T18:30:00Z`,
        duration: '4h 30m',
        price: 359,
        currency: 'USD',
        stops: 1,
        source: 'api'
      }
    ]
  }
  
  // TODO: Implement real API calls for Phase 2+
  return []
}

/**
 * Hotel search function (server-side)
 */
async function searchHotels(params: any): Promise<Array<{
  id: string
  name: string
  location: string
  rating: number
  reviewCount: number
  price: number
  currency: string
  imageUrl: string
  amenities: string[]
  source: 'api' | 'browser' | 'voice' | 'manual'
}>> {
  if (process.env.USE_MOCK_APIS === 'true') {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return [
      {
        id: '1',
        name: 'Grand Hotel Downtown',
        location: params.destination || 'Los Angeles',
        rating: 4.5,
        reviewCount: 1247,
        price: 159,
        currency: 'USD',
        imageUrl: '/placeholder.jpg',
        amenities: ['WiFi', 'Pool', 'Gym', 'Spa'],
        source: 'api'
      },
      {
        id: '2',
        name: 'Boutique Inn & Suites',
        location: params.destination || 'Los Angeles',
        rating: 4.2,
        reviewCount: 892,
        price: 129,
        currency: 'USD',
        imageUrl: '/placeholder.jpg',
        amenities: ['WiFi', 'Breakfast', 'Parking'],
        source: 'api'
      }
    ]
  }
  
  return []
}

/**
 * Activity search function (server-side)
 */
async function searchActivities(params: any): Promise<Array<{
  id: string
  name: string
  location: string
  category: string
  duration: string
  rating: number
  reviewCount: number
  price: number
  currency: string
  imageUrl: string
  source: 'api' | 'browser' | 'voice' | 'manual'
}>> {
  if (process.env.USE_MOCK_APIS === 'true') {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    return [
      {
        id: '1',
        name: 'Hollywood & Celebrity Homes Tour',
        location: params.destination || 'Los Angeles',
        category: 'Sightseeing',
        duration: '3 hours',
        rating: 4.6,
        reviewCount: 2156,
        price: 89,
        currency: 'USD',
        imageUrl: '/placeholder.jpg',
        source: 'api'
      },
      {
        id: '2',
        name: 'Griffith Observatory & Hollywood Sign',
        location: params.destination || 'Los Angeles',
        category: 'Adventure',
        duration: '4 hours',
        rating: 4.8,
        reviewCount: 1823,
        price: 65,
        currency: 'USD',
        imageUrl: '/placeholder.jpg',
        source: 'api'
      }
    ]
  }
  
  return []
}

/**
 * Server Component for Flight Search Results
 */
async function FlightSearchSection({ searchParams }: { searchParams: any }) {
  const flights = await searchFlights(searchParams)
  return <FlightSearchResults flights={flights} />
}

/**
 * Server Component for Hotel Search Results
 */
async function HotelSearchSection({ searchParams }: { searchParams: any }) {
  const hotels = await searchHotels(searchParams)
  return <HotelSearchResults hotels={hotels} />
}

/**
 * Server Component for Activity Search Results
 */
async function ActivitySearchSection({ searchParams }: { searchParams: any }) {
  const activities = await searchActivities(searchParams)
  return <ActivitySearchResults activities={activities} />
}

/**
 * Main Search Page Server Component
 * Renders search form and fetches travel data on the server
 */
export default function SearchPage({ searchParams }: SearchPageProps) {
  const hasSearchParams = searchParams.origin && searchParams.destination && searchParams.departureDate

  return (
    <div className="space-y-8">
      {/* Search Form - Always visible */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Travel</h1>
        <TravelInputForm onSubmit={() => {}} />
      </div>

      {/* Search Results - Only show if search parameters exist */}
      {hasSearchParams && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flight Results */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✈️</span>
              <h2 className="text-lg font-semibold text-gray-900">Flights</h2>
            </div>
            <Suspense fallback={<FlightSearchSkeleton />}>
              <FlightSearchSection searchParams={searchParams} />
            </Suspense>
          </div>

          {/* Hotel Results */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏨</span>
              <h2 className="text-lg font-semibold text-gray-900">Hotels</h2>
            </div>
            <Suspense fallback={<HotelSearchSkeleton />}>
              <HotelSearchSection searchParams={searchParams} />
            </Suspense>
          </div>

          {/* Activity Results */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <h2 className="text-lg font-semibold text-gray-900">Activities</h2>
            </div>
            <Suspense fallback={<ActivitySearchSkeleton />}>
              <ActivitySearchSection searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      )}

      {/* No search message */}
      {!hasSearchParams && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Start Your Travel Search
          </h2>
          <p className="text-gray-600">
            Enter your travel details above to search for flights, hotels, and activities.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Loading skeleton components
 */
function FlightSearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <div className="animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-blue-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function HotelSearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <div className="animate-pulse">
            <div className="w-full h-32 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="flex justify-between items-center mt-3">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivitySearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <div className="animate-pulse">
            <div className="w-full h-24 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="flex justify-between items-center mt-3">
                <div className="h-3 bg-gray-200 rounded w-12"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 