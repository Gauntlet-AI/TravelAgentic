import { AmadeusClient } from '../client';
import { 
  IFlightService, 
  FlightSearchParams, 
  FlightResult, 
  ServiceResponse, 
  FlightSegment, 
  Location, 
  Price 
} from '@/lib/mocks/types';
import { 
  AmadeusFlightOffer, 
  AmadeusFlightSearchParams, 
  AmadeusSegment, 
  AmadeusLocation 
} from '../types';

/**
 * Amadeus Flight Service
 * Implements IFlightService interface using Amadeus API
 */
export class AmadeusFlightService implements IFlightService {
  private client: AmadeusClient;

  constructor(client: AmadeusClient) {
    this.client = client;
  }

  /**
   * Search for flights using Amadeus API
   */
  async search(params: FlightSearchParams): Promise<ServiceResponse<FlightResult[]>> {
    const startTime = Date.now();

    try {
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
        max: 50, // Limit results
        currencyCode: 'USD',
        includedAirlineCodes: params.preferredAirlines,
      };

      // Make API call
      const response = await this.client.searchFlights(amadeusParams);

      // Transform response
      const flightResults = response.data.map(offer => 
        this.transformFlightOffer(offer, response.dictionaries)
      );

      // Apply filters
      const filteredResults = this.applyFilters(flightResults, params);

      return {
        success: true,
        data: filteredResults,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime,
      };

    } catch (error) {
      console.error('Amadeus flight search error:', error);
      
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
  async getDetails(flightId: string): Promise<ServiceResponse<FlightResult>> {
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
  async checkAvailability(flightId: string): Promise<ServiceResponse<boolean>> {
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
   * Transform Amadeus flight offer to TravelAgentic format
   */
  private transformFlightOffer(
    offer: AmadeusFlightOffer,
    dictionaries: any
  ): FlightResult {
    const itinerary = offer.itineraries[0]; // Use first itinerary
    
    // Transform segments
    const segments: FlightSegment[] = itinerary.segments.map(segment => 
      this.transformSegment(segment, dictionaries)
    );

    // Calculate layovers
    const layovers = this.calculateLayovers(itinerary.segments, dictionaries);

    return {
      id: offer.id,
      segments,
      price: this.transformPrice(offer.price),
      totalDuration: this.formatDuration(itinerary.duration),
      stops: segments.length - 1,
      layovers,
      baggage: {
        carry: '1 carry-on bag',
        checked: offer.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags?.quantity 
          ? `${offer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity} checked bag(s)`
          : 'No checked bags included',
      },
      cancellationPolicy: 'Standard cancellation policy applies',
      source: 'api',
      bookingUrl: `https://test.api.amadeus.com/v1/booking/flight-orders`,
      deepLink: offer.id,
    };
  }

  /**
   * Transform Amadeus segment to TravelAgentic format
   */
  private transformSegment(
    segment: AmadeusSegment,
    dictionaries: any
  ): FlightSegment {
    const departureLocation = this.transformLocation(
      segment.departure.iataCode,
      dictionaries.locations
    );
    
    const arrivalLocation = this.transformLocation(
      segment.arrival.iataCode,
      dictionaries.locations
    );

    return {
      airline: dictionaries.carriers[segment.carrierCode] || segment.carrierCode,
      flightNumber: `${segment.carrierCode}${segment.number}`,
      aircraft: dictionaries.aircraft[segment.aircraft.code]?.name || segment.aircraft.code,
      departure: {
        airport: departureLocation,
        time: segment.departure.at,
        terminal: segment.departure.terminal,
      },
      arrival: {
        airport: arrivalLocation,
        time: segment.arrival.at,
        terminal: segment.arrival.terminal,
      },
      duration: this.formatDuration(segment.duration),
      cabin: 'Economy', // Default - could be enhanced with actual cabin mapping
      timezoneInfo: {
        departureTimezone: 'UTC', // Would need timezone service for accurate data
        arrivalTimezone: 'UTC',
        timezoneChange: 0,
        nextDay: false,
      },
    };
  }

  /**
   * Transform Amadeus location to TravelAgentic format
   */
  private transformLocation(
    iataCode: string,
    locations: Record<string, AmadeusLocation>
  ): Location {
    const location = locations[iataCode];
    
    return {
      code: iataCode,
      name: iataCode, // Amadeus doesn't provide airport names in this response
      city: location?.cityCode || iataCode,
      country: location?.countryCode || 'Unknown',
      coordinates: {
        latitude: 0, // Not available in flight search response
        longitude: 0,
      },
    };
  }

  /**
   * Transform Amadeus price to TravelAgentic format
   */
  private transformPrice(price: any): Price {
    return {
      amount: parseFloat(price.total),
      currency: price.currency,
      displayPrice: `${price.currency} ${price.total}`,
    };
  }

  /**
   * Calculate layovers between segments
   */
  private calculateLayovers(
    segments: AmadeusSegment[],
    dictionaries: any
  ): Array<{ airport: Location; duration: string }> {
    const layovers = [];

    for (let i = 0; i < segments.length - 1; i++) {
      const currentSegment = segments[i];
      const nextSegment = segments[i + 1];

      // Calculate layover duration
      const arrivalTime = new Date(currentSegment.arrival.at);
      const departureTime = new Date(nextSegment.departure.at);
      const layoverDuration = departureTime.getTime() - arrivalTime.getTime();

      layovers.push({
        airport: this.transformLocation(
          currentSegment.arrival.iataCode,
          dictionaries.locations
        ),
        duration: this.formatDuration(layoverDuration),
      });
    }

    return layovers;
  }

  /**
   * Format duration from ISO 8601 or milliseconds to human-readable format
   */
  private formatDuration(duration: string | number): string {
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }

    // Parse ISO 8601 duration (PT2H30M)
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (matches) {
      const hours = parseInt(matches[1] || '0');
      const minutes = parseInt(matches[2] || '0');
      return `${hours}h ${minutes}m`;
    }

    return duration;
  }

  /**
   * Apply filters to flight results
   */
  private applyFilters(
    flights: FlightResult[],
    params: FlightSearchParams
  ): FlightResult[] {
    let filtered = [...flights];

    // Price range filter
    if (params.filters?.priceRange) {
      const [minPrice, maxPrice] = params.filters.priceRange;
      filtered = filtered.filter(flight => 
        flight.price.amount >= minPrice && flight.price.amount <= maxPrice
      );
    }

    // Direct flights only
    if (params.directFlightsOnly) {
      filtered = filtered.filter(flight => flight.stops === 0);
    }

    // Max stops filter
    if (params.maxStops !== undefined) {
      filtered = filtered.filter(flight => flight.stops <= params.maxStops!);
    }

    // Sort results
    if (params.filters?.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (params.filters!.sortBy) {
          case 'price':
            aValue = a.price.amount;
            bValue = b.price.amount;
            break;
          case 'duration':
            aValue = this.parseDuration(a.totalDuration);
            bValue = this.parseDuration(b.totalDuration);
            break;
          default:
            return 0;
        }

        const order = params.filters!.sortOrder === 'desc' ? -1 : 1;
        return (aValue - bValue) * order;
      });
    }

    return filtered;
  }

  /**
   * Parse duration string to minutes for sorting
   */
  private parseDuration(duration: string): number {
    const matches = duration.match(/(\d+)h\s*(\d+)m/);
    if (matches) {
      return parseInt(matches[1]) * 60 + parseInt(matches[2]);
    }
    return 0;
  }
} 