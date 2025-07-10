/**
 * Mock Hotel Service Implementation
 * Provides realistic hotel search functionality with filtering, availability, and pricing
 */

import { 
  IHotelService, 
  HotelSearchParams, 
  HotelResult, 
  ServiceResponse, 
  MockConfig,
  Price
} from '../types';
import { 
  getHotelsByDestination, 
  searchHotels, 
  hotelAmenities, 
  roomTypes,
  propertyTypes 
} from '../data/hotels';

export class MockHotelService implements IHotelService {
  private config: MockConfig;

  constructor(config: MockConfig = {
    failureRate: 0.05,
    responseDelay: { min: 800, max: 2500 },
    enableRealisticData: true,
    enablePriceFluctuation: true
  }) {
    this.config = config;
  }

  /**
   * Search for hotels based on parameters
   */
  async search(params: HotelSearchParams): Promise<ServiceResponse<HotelResult[]>> {
    const startTime = Date.now();

    try {
      // Simulate API delay
      await this.simulateDelay();

      // Simulate failures for testing fallback mechanisms
      if (this.shouldSimulateFailure()) {
        throw new Error('Mock hotel API failure for testing');
      }

      // Get base hotel data for destination
      let hotels = getHotelsByDestination(params.destination);

      if (hotels.length === 0) {
        // If no specific destination data, generate generic hotels
        hotels = this.generateGenericHotels(params.destination);
      }

      // Apply filters and generate complete hotel results
      const filteredHotels = this.applyFilters(hotels, params);
      const completeHotels = filteredHotels.map(hotel => 
        this.generateCompleteHotelResult(hotel, params)
      );

      // Sort results
      const sortedHotels = this.sortHotels(completeHotels, params.filters?.sortBy, params.filters?.sortOrder);

      return {
        success: true,
        data: sortedHotels,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get detailed information about a specific hotel
   */
  async getDetails(hotelId: string): Promise<ServiceResponse<HotelResult>> {
    const startTime = Date.now();

    try {
      await this.simulateDelay();

      if (this.shouldSimulateFailure()) {
        throw new Error('Mock hotel API failure for testing');
      }

      // Generate a detailed hotel result
      const hotel = this.generateSampleHotel(hotelId);

      return {
        success: true,
        data: hotel,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check if a hotel is available for the specified dates
   */
  async checkAvailability(hotelId: string, checkIn: string, checkOut: string): Promise<ServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      await this.simulateDelay();

      if (this.shouldSimulateFailure()) {
        throw new Error('Mock hotel API failure for testing');
      }

      // Calculate days until check-in
      const daysUntilCheckIn = Math.ceil(
        (new Date(checkIn).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Calculate stay duration
      const stayDuration = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Simulate availability based on various factors
      let availabilityRate = 0.85; // Base 85% availability

      // Reduce availability for last-minute bookings
      if (daysUntilCheckIn < 7) {
        availabilityRate *= 0.7;
      } else if (daysUntilCheckIn < 14) {
        availabilityRate *= 0.85;
      }

      // Reduce availability for longer stays
      if (stayDuration > 7) {
        availabilityRate *= 0.9;
      }

      // Check if it's weekend (reduce availability)
      const checkInDate = new Date(checkIn);
      const isWeekend = checkInDate.getDay() === 5 || checkInDate.getDay() === 6;
      if (isWeekend) {
        availabilityRate *= 0.8;
      }

      const isAvailable = Math.random() < availabilityRate;

      return {
        success: true,
        data: isAvailable,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Apply filters to hotel results
   */
  private applyFilters(hotels: Partial<HotelResult>[], params: HotelSearchParams): Partial<HotelResult>[] {
    let filtered = [...hotels];

    // Filter by star rating
    if (params.starRating && params.starRating.length > 0) {
      filtered = filtered.filter(hotel => 
        hotel.starRating && params.starRating!.includes(hotel.starRating)
      );
    }

    // Filter by amenities
    if (params.amenities && params.amenities.length > 0) {
      filtered = filtered.filter(hotel => 
        hotel.amenities && params.amenities!.some(amenity => 
          hotel.amenities!.includes(amenity)
        )
      );
    }

    // Filter by property types
    if (params.propertyTypes && params.propertyTypes.length > 0) {
      filtered = filtered.filter(hotel => {
        // Determine property type based on hotel characteristics
        const propertyType = this.determinePropertyType(hotel);
        return params.propertyTypes!.includes(propertyType);
      });
    }

    // Filter by distance from center
    if (params.maxDistance) {
      filtered = filtered.filter(hotel => 
        !hotel.location?.distanceFromCenter || 
        hotel.location.distanceFromCenter <= params.maxDistance!
      );
    }

    // Filter by price range
    if (params.filters?.priceRange) {
      const [minPrice, maxPrice] = params.filters.priceRange;
      filtered = filtered.filter(hotel => {
        // We'll calculate price during generation, so for now include all
        return true; // Price filtering will be applied during generation
      });
    }

    return filtered;
  }

  /**
   * Generate complete hotel result from partial data
   */
  private generateCompleteHotelResult(
    partialHotel: Partial<HotelResult>, 
    params: HotelSearchParams
  ): HotelResult {
    const basePrice = this.calculateBasePrice(partialHotel, params);
    const priceBreakdown = this.calculatePriceBreakdown(basePrice);
    const generatedRoomTypes = this.generateRoomTypes(basePrice);

    return {
      id: `hotel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: partialHotel.name || 'Sample Hotel',
      starRating: partialHotel.starRating || Math.floor(Math.random() * 3) + 3,
      rating: partialHotel.rating || {
        score: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 5000) + 100,
        reviewSummary: 'Great location and service'
      },
      location: partialHotel.location || {
        address: '123 Main St',
        city: params.destination,
        country: 'Unknown',
        coordinates: { latitude: 0, longitude: 0 },
        distanceFromCenter: Math.round(Math.random() * 10 * 10) / 10
      },
      price: {
        amount: basePrice,
        currency: 'USD',
        displayPrice: `$${basePrice.toLocaleString()}`
      },
      priceBreakdown,
      images: partialHotel.images || [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
      ],
      amenities: partialHotel.amenities || this.generateRandomAmenities(),
      roomTypes: generatedRoomTypes,
      policies: partialHotel.policies || {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      },
      description: partialHotel.description || 'Comfortable hotel with modern amenities and excellent service.',
      highlights: partialHotel.highlights || ['Great Location', 'Modern Amenities', 'Excellent Service'],
      source: 'api',
      bookingUrl: `https://mock-booking.com/hotel/${partialHotel.name?.replace(/\s+/g, '-').toLowerCase()}`,
      deepLink: `travelagentic://hotel/${partialHotel.name?.replace(/\s+/g, '-').toLowerCase()}`
    };
  }

  /**
   * Calculate base price for a hotel
   */
  private calculateBasePrice(hotel: Partial<HotelResult>, params: HotelSearchParams): number {
    let basePrice = 100; // Base price in USD

    // Star rating multiplier
    const starRating = hotel.starRating || 3;
    basePrice *= (starRating * 0.4 + 0.6); // 1x for 1-star, 2.6x for 5-star

    // Location factor (distance from center)
    const distanceFromCenter = hotel.location?.distanceFromCenter || 5;
    if (distanceFromCenter < 2) {
      basePrice *= 1.5; // Premium for central location
    } else if (distanceFromCenter > 10) {
      basePrice *= 0.7; // Discount for distant location
    }

    // Calculate stay duration
    const stayDuration = Math.ceil(
      (new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Longer stay discount
    if (stayDuration > 7) {
      basePrice *= 0.9; // 10% discount for week+ stays
    } else if (stayDuration > 14) {
      basePrice *= 0.85; // 15% discount for 2+ week stays
    }

    // Date proximity factor
    const daysUntilCheckIn = Math.ceil(
      (new Date(params.checkIn).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilCheckIn < 7) {
      basePrice *= 1.3; // 30% increase for last-minute bookings
    } else if (daysUntilCheckIn < 14) {
      basePrice *= 1.15; // 15% increase
    }

    // Weekend premium
    const checkInDate = new Date(params.checkIn);
    const isWeekend = checkInDate.getDay() === 5 || checkInDate.getDay() === 6;
    if (isWeekend) {
      basePrice *= 1.2; // 20% weekend premium
    }

    // Room count factor
    if (params.guests.rooms > 1) {
      basePrice *= params.guests.rooms * 0.95; // Slight discount for multiple rooms
    }

    // Add price fluctuation
    if (this.config.enablePriceFluctuation) {
      const fluctuation = (Math.random() - 0.5) * 0.2; // ±10%
      basePrice *= (1 + fluctuation);
    }

    return Math.round(basePrice);
  }

  /**
   * Calculate price breakdown
   */
  private calculatePriceBreakdown(basePrice: number): { basePrice: number; taxes: number; fees: number; total: number } {
    const taxes = Math.round(basePrice * 0.12); // 12% taxes
    const fees = Math.round(basePrice * 0.05); // 5% fees
    const total = basePrice + taxes + fees;

    return {
      basePrice,
      taxes,
      fees,
      total
    };
  }

  /**
   * Generate room types for a hotel
   */
  private generateRoomTypes(basePrice: number): HotelResult['roomTypes'] {
    const numRoomTypes = Math.floor(Math.random() * 3) + 2; // 2-4 room types
    const selectedRoomTypes = roomTypes.slice(0, numRoomTypes);

    return selectedRoomTypes.map(roomType => ({
      ...roomType,
      price: {
        amount: Math.round(basePrice * roomType.priceMultiplier),
        currency: 'USD',
        displayPrice: `$${Math.round(basePrice * roomType.priceMultiplier).toLocaleString()}`
      }
    }));
  }

  /**
   * Generate random amenities for a hotel
   */
  private generateRandomAmenities(): string[] {
    const allAmenities = [
      ...hotelAmenities.basic,
      ...hotelAmenities.comfort,
      ...hotelAmenities.recreation,
      ...hotelAmenities.dining
    ];

    const numAmenities = Math.floor(Math.random() * 8) + 4; // 4-11 amenities
    const shuffled = allAmenities.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numAmenities);
  }

  /**
   * Determine property type based on hotel characteristics
   */
  private determinePropertyType(hotel: Partial<HotelResult>): string {
    const starRating = hotel.starRating || 3;
    const amenities = hotel.amenities || [];

    if (starRating >= 5) return 'Luxury Hotel';
    if (starRating >= 4) return 'Hotel';
    if (starRating <= 2) return 'Budget Hotel';
    if (amenities.includes('Spa') || amenities.includes('Pool')) return 'Resort';
    
    return 'Hotel';
  }

  /**
   * Sort hotels based on criteria
   */
  private sortHotels(
    hotels: HotelResult[], 
    sortBy?: string, 
    sortOrder: 'asc' | 'desc' = 'asc'
  ): HotelResult[] {
    const sorted = [...hotels];

    switch (sortBy) {
      case 'price':
        sorted.sort((a, b) => sortOrder === 'asc' ? 
          a.price.amount - b.price.amount : 
          b.price.amount - a.price.amount
        );
        break;
      case 'rating':
        sorted.sort((a, b) => sortOrder === 'asc' ? 
          a.rating.score - b.rating.score : 
          b.rating.score - a.rating.score
        );
        break;
      case 'popularity':
        sorted.sort((a, b) => sortOrder === 'asc' ? 
          a.rating.reviewCount - b.rating.reviewCount : 
          b.rating.reviewCount - a.rating.reviewCount
        );
        break;
      default:
        // Default sort by price
        sorted.sort((a, b) => a.price.amount - b.price.amount);
    }

    return sorted;
  }

  /**
   * Generate generic hotels for destinations without specific data
   */
  private generateGenericHotels(destination: string): Partial<HotelResult>[] {
    const numHotels = Math.floor(Math.random() * 8) + 5; // 5-12 hotels
    const hotels: Partial<HotelResult>[] = [];

    for (let i = 0; i < numHotels; i++) {
      const starRating = Math.floor(Math.random() * 5) + 1;
      const hotelNames = [
        'Grand Hotel', 'City Center Inn', 'Plaza Hotel', 'Royal Suite',
        'Modern Lodge', 'Boutique Hotel', 'Business Center', 'Comfort Inn',
        'Luxury Resort', 'Budget Stay', 'Premium Hotel', 'Downtown Hotel'
      ];

      hotels.push({
        name: `${hotelNames[i % hotelNames.length]} ${destination}`,
        starRating,
        rating: {
          score: Math.round((Math.random() * 2 + 3) * 10) / 10,
          reviewCount: Math.floor(Math.random() * 3000) + 100,
          reviewSummary: 'Good location and service'
        },
        location: {
          address: `${100 + i} Main Street`,
          city: destination,
          country: 'Unknown',
          coordinates: { 
            latitude: Math.random() * 180 - 90, 
            longitude: Math.random() * 360 - 180 
          },
          distanceFromCenter: Math.round(Math.random() * 15 * 10) / 10
        },
        amenities: this.generateRandomAmenities(),
        description: `Comfortable ${starRating}-star hotel in ${destination} with modern amenities.`,
        highlights: ['Great Location', 'Modern Amenities', 'Excellent Service']
      });
    }

    return hotels;
  }

  /**
   * Generate a sample hotel for the details endpoint
   */
  private generateSampleHotel(hotelId: string): HotelResult {
    return {
      id: hotelId,
      name: 'Sample Grand Hotel',
      starRating: 4,
      rating: {
        score: 4.3,
        reviewCount: 2156,
        reviewSummary: 'Excellent location with great amenities'
      },
      location: {
        address: '123 Main Street, City Center',
        city: 'Sample City',
        country: 'Sample Country',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        distanceFromCenter: 0.5
      },
      price: {
        amount: 250,
        currency: 'USD',
        displayPrice: '$250'
      },
      priceBreakdown: {
        basePrice: 220,
        taxes: 26,
        fees: 11,
        total: 257
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
      ],
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Fitness Center', 'Room Service'],
      roomTypes: [
        {
          name: 'Standard Room',
          description: 'Comfortable room with city views',
          maxOccupancy: 2,
          bedType: 'Queen Bed',
          roomSize: '30 sqm',
          price: { amount: 250, currency: 'USD', displayPrice: '$250' }
        }
      ],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      },
      description: 'Elegant hotel in the heart of the city with modern amenities and exceptional service.',
      highlights: ['City Center Location', 'Modern Amenities', 'Excellent Service', 'Great Reviews'],
      source: 'api'
    };
  }

  /**
   * Simulate API delay
   */
  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * (this.config.responseDelay.max - this.config.responseDelay.min) + this.config.responseDelay.min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Check if we should simulate a failure
   */
  private shouldSimulateFailure(): boolean {
    return Math.random() < this.config.failureRate;
  }
} 