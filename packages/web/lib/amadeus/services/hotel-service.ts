import { AmadeusClient } from '../client';
import {
  IHotelService,
  HotelSearchParams,
  HotelResult,
  ServiceResponse,
  Location,
  Price,
} from '@/lib/mocks/types';
import {
  AmadeusHotelSearchParams,
  AmadeusHotelOffersParams,
  AmadeusHotel,
  AmadeusHotelOffer,
  AmadeusRoomOffer,
} from '../types';

/**
 * Amadeus Hotel Service
 * Implements IHotelService interface using Amadeus API
 */
export class AmadeusHotelService implements IHotelService {
  private client: AmadeusClient;

  constructor(client: AmadeusClient) {
    this.client = client;
  }

  /**
   * Search for hotels using Amadeus API
   */
  async search(params: HotelSearchParams): Promise<ServiceResponse<HotelResult[]>> {
    const startTime = Date.now();

    try {
      // Step 1: Search for hotels in the destination
      const hotelSearchParams: AmadeusHotelSearchParams = {
        cityCode: this.extractCityCode(params.destination),
        radius: params.maxDistance || 50,
        radiusUnit: 'KM',
        ratings: params.starRating,
        amenities: params.amenities,
        hotelSource: 'ALL',
      };

      const hotelSearchResponse = await this.client.searchHotels(hotelSearchParams);

      if (!hotelSearchResponse.data.length) {
        return {
          success: true,
          data: [],
          fallbackUsed: 'api',
          responseTime: Date.now() - startTime,
        };
      }

      // Step 2: Get hotel offers for available hotels
      const hotelIds = hotelSearchResponse.data
        .slice(0, 20) // Limit to first 20 hotels to avoid rate limits
        .map(hotel => hotel.hotelId);

      const hotelOffersParams: AmadeusHotelOffersParams = {
        hotelIds,
        checkInDate: params.checkIn,
        checkOutDate: params.checkOut,
        adults: params.guests.adults,
        childAges: params.guests.children > 0 ? [10] : undefined, // Default child age
        roomQuantity: params.guests.rooms,
        currency: 'USD',
        bestRateOnly: true,
        view: 'FULL',
      };

      const hotelOffersResponse = await this.client.getHotelOffers(hotelOffersParams);

      // Step 3: Transform and combine hotel data with offers
      const hotelResults = hotelOffersResponse.data.map(hotelOffer =>
        this.transformHotelOffer(hotelOffer)
      );

      // Apply filters
      const filteredResults = this.applyFilters(hotelResults, params);

      return {
        success: true,
        data: filteredResults,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime,
      };

    } catch (error) {
      console.error('Amadeus hotel search error:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Hotel search failed',
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get hotel details by ID
   */
  async getDetails(hotelId: string): Promise<ServiceResponse<HotelResult>> {
    // For now, return error as this would require specific hotel lookup
    return {
      success: false,
      error: 'Hotel details not available - use search with specific criteria',
      fallbackUsed: 'api',
      responseTime: 0,
    };
  }

  /**
   * Check hotel availability
   */
  async checkAvailability(
    hotelId: string,
    checkIn: string,
    checkOut: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const hotelOffersParams: AmadeusHotelOffersParams = {
        hotelIds: [hotelId],
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: 2, // Default
        roomQuantity: 1, // Default
        currency: 'USD',
        bestRateOnly: true,
      };

      const response = await this.client.getHotelOffers(hotelOffersParams);
      const isAvailable = response.data.length > 0 && response.data[0].available;

      return {
        success: true,
        data: isAvailable,
        fallbackUsed: 'api',
        responseTime: 200,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Availability check failed',
        fallbackUsed: 'api',
        responseTime: 200,
      };
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Extract city code from destination string
   */
  private extractCityCode(destination: string): string {
    // Simple implementation - in production, would use a city lookup service
    const cityMappings: Record<string, string> = {
      'New York': 'NYC',
      'London': 'LON',
      'Paris': 'PAR',
      'Tokyo': 'TYO',
      'Sydney': 'SYD',
      'Dubai': 'DXB',
      'Singapore': 'SIN',
      'Hong Kong': 'HKG',
      'Bangkok': 'BKK',
      'Seoul': 'SEL',
    };

    const normalizedDestination = destination.trim();
    return cityMappings[normalizedDestination] || normalizedDestination.slice(0, 3).toUpperCase();
  }

  /**
   * Transform Amadeus hotel offer to TravelAgentic format
   */
  private transformHotelOffer(hotelOffer: AmadeusHotelOffer): HotelResult {
    const hotel = hotelOffer.hotel;
    const offer = hotelOffer.offers[0]; // Use first offer
    
    return {
      id: hotel.hotelId,
      name: hotel.name,
      starRating: hotel.rating,
      rating: {
        score: hotel.rating * 2, // Convert to 10-point scale
        reviewCount: 0, // Not available in Amadeus response
        reviewSummary: 'No reviews available',
      },
      location: {
        address: hotel.address.lines.join(', '),
        city: hotel.address.cityName,
        country: hotel.address.countryCode,
        coordinates: {
          latitude: hotel.latitude,
          longitude: hotel.longitude,
        },
        distanceFromCenter: hotel.hotelDistance?.distance || 0,
      },
      price: this.transformPrice(offer.price),
      priceBreakdown: {
        basePrice: parseFloat(offer.price.base),
        taxes: parseFloat(offer.price.total) - parseFloat(offer.price.base),
        fees: 0, // Not detailed in Amadeus response
        total: parseFloat(offer.price.total),
      },
      images: hotel.media?.map(media => media.uri) || [],
      amenities: hotel.amenities || [],
      roomTypes: this.transformRoomTypes(hotelOffer.offers),
      policies: {
        checkIn: offer.checkInDate,
        checkOut: offer.checkOutDate,
        cancellation: offer.policies?.cancellation
          ? `Cancel by ${offer.policies.cancellation.deadline}`
          : 'Standard cancellation policy',
        petPolicy: 'Please contact hotel for pet policy',
      },
      description: hotel.description?.text || 'No description available',
      highlights: this.extractHighlights(hotel),
      source: 'api',
      bookingUrl: hotelOffer.self,
      deepLink: hotel.hotelId,
    };
  }

  /**
   * Transform room offers to room types
   */
  private transformRoomTypes(offers: AmadeusRoomOffer[]): Array<{
    name: string;
    description: string;
    maxOccupancy: number;
    bedType: string;
    roomSize: string;
    price: Price;
  }> {
    return offers.map(offer => ({
      name: offer.room.type,
      description: offer.room.description?.text || 'No description available',
      maxOccupancy: offer.guests.adults + (offer.guests.childAges?.length || 0),
      bedType: offer.room.typeEstimated?.bedType || 'Unknown',
      roomSize: 'Standard',
      price: this.transformPrice(offer.price),
    }));
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
   * Extract highlights from hotel data
   */
  private extractHighlights(hotel: AmadeusHotel): string[] {
    const highlights: string[] = [];

    if (hotel.rating >= 4) {
      highlights.push(`${hotel.rating}-star luxury hotel`);
    }

    if (hotel.amenities?.includes('WIFI')) {
      highlights.push('Free WiFi');
    }

    if (hotel.amenities?.includes('PARKING')) {
      highlights.push('Parking available');
    }

    if (hotel.amenities?.includes('RESTAURANT')) {
      highlights.push('On-site restaurant');
    }

    if (hotel.amenities?.includes('FITNESS_CENTER')) {
      highlights.push('Fitness center');
    }

    if (hotel.amenities?.includes('POOL')) {
      highlights.push('Swimming pool');
    }

    if (hotel.hotelDistance && hotel.hotelDistance.distance < 5) {
      highlights.push('Close to city center');
    }

    return highlights;
  }

  /**
   * Apply filters to hotel results
   */
  private applyFilters(
    hotels: HotelResult[],
    params: HotelSearchParams
  ): HotelResult[] {
    let filtered = [...hotels];

    // Price range filter
    if (params.filters?.priceRange) {
      const [minPrice, maxPrice] = params.filters.priceRange;
      filtered = filtered.filter(hotel =>
        hotel.price.amount >= minPrice && hotel.price.amount <= maxPrice
      );
    }

    // Star rating filter
    if (params.starRating?.length) {
      filtered = filtered.filter(hotel =>
        params.starRating!.includes(hotel.starRating)
      );
    }

    // Amenities filter
    if (params.amenities?.length) {
      filtered = filtered.filter(hotel =>
        params.amenities!.some(amenity =>
          hotel.amenities.includes(amenity)
        )
      );
    }

    // Distance filter
    if (params.maxDistance) {
      filtered = filtered.filter(hotel =>
        hotel.location.distanceFromCenter <= params.maxDistance!
      );
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
          case 'rating':
            aValue = a.rating.score;
            bValue = b.rating.score;
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
} 