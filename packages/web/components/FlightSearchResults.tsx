import { FlightCard } from './flight-card'
import type { Flight } from '@/lib/mock-data'

/**
 * Flight result interface for server component data
 */
interface FlightResult {
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
}

/**
 * Props for FlightSearchResults component
 */
interface FlightSearchResultsProps {
  flights: FlightResult[]
  travelers?: number
}

/**
 * Convert FlightResult to Flight interface
 */
function convertToFlight(flightResult: FlightResult): Flight {
  // Parse departure and arrival times
  const departureDate = new Date(flightResult.departure)
  const arrivalDate = new Date(flightResult.arrival)
  
  return {
    id: flightResult.id,
    airline: flightResult.airline,
    flightNumber: flightResult.flightNumber,
    departure: {
      airport: flightResult.origin,
      city: flightResult.origin,
      time: departureDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      date: departureDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
    },
    arrival: {
      airport: flightResult.destination,
      city: flightResult.destination,
      time: arrivalDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      date: arrivalDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
    },
    duration: flightResult.duration,
    stops: flightResult.stops,
    price: flightResult.price,
    class: 'Economy',
    aircraft: 'Commercial Aircraft'
  }
}

/**
 * FlightSearchResults component
 * Displays a list of flight search results using the existing FlightCard component
 */
export function FlightSearchResults({ flights, travelers = 1 }: FlightSearchResultsProps) {
  if (flights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-4xl mb-2">✈️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Flights Found</h3>
        <p className="text-gray-600 text-sm">
          Try adjusting your search criteria or dates.
        </p>
      </div>
    )
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
      
      {/* Fallback indicator */}
      {flights.length > 0 && flights[0]?.source !== 'api' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <span className="text-yellow-600 text-sm">
              ⚠️ Results from {flights[0]?.source === 'manual' ? 'manual search' : 'fallback system'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
} 