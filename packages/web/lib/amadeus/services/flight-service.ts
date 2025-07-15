import { AmadeusClient } from '../client';
import { 
  AmadeusFlightOffer, 
  AmadeusFlightSearchParams, 
  AmadeusFlightSearchResponse
} from '../types';

// Simplified flight search parameters (only what we need for Amadeus)
export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  cabin: string;
  directFlightsOnly?: boolean;
  preferredAirlines?: string[];
  maxStops?: number;
  filters?: {
    priceRange?: [number, number];
    sortBy?: 'price' | 'duration';
    sortOrder?: 'asc' | 'desc';
  };
}

// Simplified service response
export interface FlightSearchResult {
  success: boolean;
  data?: AmadeusFlightSearchResponse;
  error?: string;
  fallbackUsed: 'api' | 'fallback';
  responseTime: number;
}

/**
 * Amadeus Flight Service
 * Returns raw Amadeus API responses without transformation
 */
export class AmadeusFlightService {
  private client: AmadeusClient;

  constructor(client: AmadeusClient) {
    this.client = client;
  }

  /**
   * Search for flights using Amadeus API
   * Returns raw Amadeus response format
   */
  async search(params: FlightSearchParams): Promise<FlightSearchResult> {
    const startTime = Date.now();

    try {
      console.log('🚀 [AMADEUS-FLIGHT-SERVICE] Starting search with params:', params);

      // Transform TravelAgentic params to Amadeus params
      const amadeusParams: AmadeusFlightSearchParams = {
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        adults: params.passengers.adults,
        children: params.passengers.children || undefined,
        infants: params.passengers.infants || undefined,
        travelClass: this.mapCabinClass(params.cabin),
        nonStop: params.directFlightsOnly,
        maxPrice: params.filters?.priceRange?.[1],
        max: 10, // Limit results to 10 for better performance
        currencyCode: 'USD',
        includedAirlineCodes: params.preferredAirlines,
      };

      console.log('📡 [AMADEUS-FLIGHT-SERVICE] Amadeus API params:', amadeusParams);

      // Make API call and get raw response
      const response = await this.client.searchFlights(amadeusParams);

      console.log('📥 [AMADEUS-FLIGHT-SERVICE] Raw Amadeus response:', {
        success: !!response.data,
        dataLength: response.data?.length || 0,
        meta: response.meta,
        hasDictionaries: !!response.dictionaries
      });

      // Apply basic filtering if needed
      let filteredData = response.data;
      if (params.filters) {
        filteredData = this.applyFilters(response.data, params.filters);
      }

      // Return raw Amadeus response structure
      return {
        success: true,
        data: {
          ...response,
          data: filteredData
        },
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime,
      };

    } catch (error) {
      console.error('❌ [AMADEUS-FLIGHT-SERVICE] Flight search error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Flight search failed',
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get flight details by ID
   */
  async getDetails(flightId: string): Promise<FlightSearchResult> {
    // For now, return error as Amadeus doesn't have a direct flight details endpoint
    // This would typically be implemented by searching with specific criteria
    return {
      success: false,
      error: 'Flight details not available - use search with specific criteria',
      fallbackUsed: 'api',
      responseTime: 0,
    };
  }

  /**
   * Check flight availability
   */
  async checkAvailability(flightId: string): Promise<{ success: boolean; data?: boolean; error?: string; fallbackUsed: string; responseTime: number }> {
    // This would typically require the flight offer data to confirm pricing
    // For now, return a placeholder response
    return {
      success: true,
      data: true,
      fallbackUsed: 'api',
      responseTime: 100,
    };
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Map TravelAgentic cabin class to Amadeus travel class
   */
  private mapCabinClass(cabin: string): 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST' {
    switch (cabin) {
      case 'economy':
        return 'ECONOMY';
      case 'premium':
        return 'PREMIUM_ECONOMY';
      case 'business':
        return 'BUSINESS';
      case 'first':
        return 'FIRST';
      default:
        return 'ECONOMY';
    }
  }

  /**
   * Apply basic filters to flight offers
   */
  private applyFilters(
    flights: AmadeusFlightOffer[],
    filters: FlightSearchParams['filters']
  ): AmadeusFlightOffer[] {
    if (!filters) return flights;

    let filtered = [...flights];

    // Price range filter
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      filtered = filtered.filter(flight => {
        const price = parseFloat(flight.price.total);
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Sort results
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (filters.sortBy) {
          case 'price':
            aValue = parseFloat(a.price.total);
            bValue = parseFloat(b.price.total);
            break;
          case 'duration':
            aValue = this.parseDuration(a.itineraries[0].duration);
            bValue = this.parseDuration(b.itineraries[0].duration);
            break;
          default:
            return 0;
        }

        const order = filters.sortOrder === 'desc' ? -1 : 1;
        return (aValue - bValue) * order;
      });
    }

    return filtered;
  }

  /**
   * Parse duration string to minutes for sorting
   */
  private parseDuration(duration: string): number {
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (matches) {
      const hours = parseInt(matches[1] || '0');
      const minutes = parseInt(matches[2] || '0');
      return hours * 60 + minutes;
    }
    return 0;
  }
} 