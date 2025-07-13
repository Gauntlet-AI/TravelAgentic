import { AmadeusClient } from '../client';
import {
  IActivityService,
  ActivitySearchParams,
  ActivityResult,
  ServiceResponse,
  Location,
  Price,
} from '@/lib/mocks/types';
import {
  AmadeusActivitySearchParams,
  AmadeusToursActivitiesParams,
  AmadeusPointOfInterest,
  AmadeusActivity,
} from '../types';

/**
 * Amadeus Activity Service
 * Implements IActivityService interface using Amadeus API
 */
export class AmadeusActivityService implements IActivityService {
  private client: AmadeusClient;

  constructor(client: AmadeusClient) {
    this.client = client;
  }

  /**
   * Search for activities using Amadeus API
   */
  async search(params: ActivitySearchParams): Promise<ServiceResponse<ActivityResult[]>> {
    const startTime = Date.now();

    try {
      // Get coordinates for destination
      const coordinates = await this.getDestinationCoordinates(params.destination);

      // Search for both points of interest and tours/activities
      const [poisResponse, activitiesResponse] = await Promise.allSettled([
        this.searchPointsOfInterest(coordinates, params),
        this.searchToursAndActivities(coordinates, params),
      ]);

      // Combine results
      const activities: ActivityResult[] = [];

      // Process POIs
      if (poisResponse.status === 'fulfilled') {
        const poiActivities = poisResponse.value.data.map(poi =>
          this.transformPointOfInterest(poi)
        );
        activities.push(...poiActivities);
      }

      // Process tours and activities
      if (activitiesResponse.status === 'fulfilled') {
        const tourActivities = activitiesResponse.value.data.map(activity =>
          this.transformActivity(activity)
        );
        activities.push(...tourActivities);
      }

      // Apply filters and sorting
      const filteredResults = this.applyFilters(activities, params);

      return {
        success: true,
        data: filteredResults,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime,
      };

    } catch (error) {
      console.error('Amadeus activity search error:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Activity search failed',
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get activity details by ID
   */
  async getDetails(activityId: string): Promise<ServiceResponse<ActivityResult>> {
    // For now, return error as this would require specific activity lookup
    return {
      success: false,
      error: 'Activity details not available - use search with specific criteria',
      fallbackUsed: 'api',
      responseTime: 0,
    };
  }

  /**
   * Check activity availability for a specific date
   */
  async checkAvailability(activityId: string, date: string): Promise<ServiceResponse<boolean>> {
    // For now, return placeholder response
    return {
      success: true,
      data: true,
      fallbackUsed: 'api',
      responseTime: 100,
    };
  }

  /**
   * Get available activity categories
   */
  async getCategories(): Promise<ServiceResponse<string[]>> {
    const categories = [
      'SIGHTSEEING',
      'ACTIVITIES',
      'NIGHTLIFE',
      'RESTAURANT',
      'SHOPPING',
      'OUTDOOR',
      'ENTERTAINMENT',
      'CULTURAL',
      'ADVENTURE',
      'FOOD_AND_DRINK',
      'TOURS',
      'SPORTS',
      'WELLNESS',
      'HISTORICAL',
      'NATURE',
    ];

    return {
      success: true,
      data: categories,
      fallbackUsed: 'api',
      responseTime: 50,
    };
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Get coordinates for destination
   */
  private async getDestinationCoordinates(destination: string): Promise<{
    latitude: number;
    longitude: number;
  }> {
    // Simple city coordinate mapping - in production, would use a geocoding service
    const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
      'New York': { latitude: 40.7128, longitude: -74.0060 },
      'London': { latitude: 51.5074, longitude: -0.1278 },
      'Paris': { latitude: 48.8566, longitude: 2.3522 },
      'Tokyo': { latitude: 35.6762, longitude: 139.6503 },
      'Sydney': { latitude: -33.8688, longitude: 151.2093 },
      'Dubai': { latitude: 25.2048, longitude: 55.2708 },
      'Singapore': { latitude: 1.3521, longitude: 103.8198 },
      'Hong Kong': { latitude: 22.3193, longitude: 114.1694 },
      'Bangkok': { latitude: 13.7563, longitude: 100.5018 },
      'Seoul': { latitude: 37.5665, longitude: 126.9780 },
    };

    const normalizedDestination = destination.trim();
    return cityCoordinates[normalizedDestination] || { latitude: 0, longitude: 0 };
  }

  /**
   * Search for points of interest
   */
  private async searchPointsOfInterest(
    coordinates: { latitude: number; longitude: number },
    params: ActivitySearchParams
  ) {
    const poiParams: AmadeusActivitySearchParams = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      radius: 50, // 50km radius
      categories: params.categories,
      source: 'FOURSQUARE',
    };

    return this.client.searchPointsOfInterest(poiParams);
  }

  /**
   * Search for tours and activities
   */
  private async searchToursAndActivities(
    coordinates: { latitude: number; longitude: number },
    params: ActivitySearchParams
  ) {
    const activityParams: AmadeusToursActivitiesParams = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      radius: 50, // 50km radius
      currencyCode: 'USD',
      minimumDuration: params.duration?.min ? `${params.duration.min}H` : undefined,
      maximumDuration: params.duration?.max ? `${params.duration.max}H` : undefined,
      startDate: params.startDate,
      endDate: params.endDate,
      limit: params.maxResults || 20,
    };

    return this.client.searchToursAndActivities(activityParams);
  }

  /**
   * Transform Amadeus point of interest to TravelAgentic format
   */
  private transformPointOfInterest(poi: AmadeusPointOfInterest): ActivityResult {
    return {
      id: poi.id,
      name: poi.name,
      description: `Explore ${poi.name}, a popular ${poi.category.toLowerCase()} attraction.`,
      shortDescription: poi.name,
      categories: [poi.category],
      duration: {
        value: 2,
        unit: 'hours',
        description: '2 hours',
      },
      price: {
        amount: 0,
        currency: 'USD',
        displayPrice: 'Free',
      },
      priceIncludes: ['Entry'],
      priceExcludes: ['Transportation', 'Food'],
      rating: {
        score: poi.rank * 2, // Convert to 10-point scale
        reviewCount: 0,
        reviewSummary: 'No reviews available',
      },
      location: {
        name: poi.name,
        address: poi.name,
        city: poi.name,
        coordinates: {
          latitude: poi.geoCode.latitude,
          longitude: poi.geoCode.longitude,
        },
      },
      images: [],
      highlights: poi.tags || [],
      included: ['Entry'],
      requirements: [],
      restrictions: [],
      meetingPoint: poi.name,
      cancellationPolicy: 'Free cancellation',
      availability: {
        nextAvailable: 'Today',
        schedule: 'Daily',
      },
      groupSize: {
        min: 1,
        max: 50,
      },
      languages: ['English'],
      accessibility: [],
      source: 'api',
      bookingUrl: poi.self.href,
      deepLink: poi.id,
    };
  }

  /**
   * Transform Amadeus activity to TravelAgentic format
   */
  private transformActivity(activity: AmadeusActivity): ActivityResult {
    return {
      id: activity.id,
      name: activity.name,
      description: activity.description,
      shortDescription: activity.shortDescription,
      categories: [activity.categoryCode],
      duration: {
        value: this.parseDuration(activity.minimumDuration),
        unit: 'hours',
        description: `${activity.minimumDuration} - ${activity.maximumDuration}`,
      },
      price: {
        amount: parseFloat(activity.price.amount),
        currency: activity.price.currencyCode,
        displayPrice: `${activity.price.currencyCode} ${activity.price.amount}`,
      },
      priceIncludes: ['Activity', 'Guide'],
      priceExcludes: ['Transportation', 'Meals'],
      rating: {
        score: activity.rating * 2, // Convert to 10-point scale
        reviewCount: 0,
        reviewSummary: 'No reviews available',
      },
      location: {
        name: activity.name,
        address: activity.name,
        city: activity.name,
        coordinates: {
          latitude: activity.geoCode.latitude,
          longitude: activity.geoCode.longitude,
        },
      },
      images: activity.pictures || [],
      highlights: [activity.subcategoryCode],
      included: ['Activity', 'Guide'],
      requirements: [],
      restrictions: [],
      meetingPoint: activity.name,
      cancellationPolicy: 'Standard cancellation policy',
      availability: {
        nextAvailable: activity.availabilityDateFrom,
        schedule: `Available ${activity.availabilityDateFrom} - ${activity.availabilityDateTo}`,
      },
      groupSize: {
        min: 1,
        max: 20,
      },
      languages: ['English'],
      accessibility: [],
      source: 'api',
      bookingUrl: activity.bookingLink,
      deepLink: activity.id,
    };
  }

  /**
   * Parse duration string to hours
   */
  private parseDuration(duration: string): number {
    // Parse duration like "PT2H" or "2H"
    const match = duration.match(/(\d+)H/);
    return match ? parseInt(match[1]) : 2;
  }

  /**
   * Apply filters to activity results
   */
  private applyFilters(
    activities: ActivityResult[],
    params: ActivitySearchParams
  ): ActivityResult[] {
    let filtered = [...activities];

    // Price range filter
    if (params.filters?.priceRange) {
      const [minPrice, maxPrice] = params.filters.priceRange;
      filtered = filtered.filter(activity =>
        activity.price.amount >= minPrice && activity.price.amount <= maxPrice
      );
    }

    // Categories filter
    if (params.categories?.length) {
      filtered = filtered.filter(activity =>
        params.categories!.some(category =>
          activity.categories.includes(category)
        )
      );
    }

    // Duration filter
    if (params.duration) {
      filtered = filtered.filter(activity => {
        const activityDuration = activity.duration.value;
        const meetsMin = !params.duration!.min || activityDuration >= params.duration!.min;
        const meetsMax = !params.duration!.max || activityDuration <= params.duration!.max;
        return meetsMin && meetsMax;
      });
    }

    // Time of day filter
    if (params.timeOfDay) {
      // This would require more sophisticated scheduling logic
      // For now, just return all activities
    }

    // Exclude IDs filter
    if (params.excludeIds?.length) {
      filtered = filtered.filter(activity =>
        !params.excludeIds!.includes(activity.id)
      );
    }

    // Apply preference matching
    if (params.preferences?.length) {
      filtered = filtered.filter(activity =>
        params.preferences!.some(preference =>
          activity.categories.some(category =>
            category.toLowerCase().includes(preference.toLowerCase())
          ) ||
          activity.highlights.some(highlight =>
            highlight.toLowerCase().includes(preference.toLowerCase())
          )
        )
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
          case 'duration':
            aValue = a.duration.value;
            bValue = b.duration.value;
            break;
          case 'popularity':
            aValue = a.rating.reviewCount;
            bValue = b.rating.reviewCount;
            break;
          default:
            return 0;
        }

        const order = params.filters!.sortOrder === 'desc' ? -1 : 1;
        return (aValue - bValue) * order;
      });
    }

    // Limit results
    if (params.maxResults) {
      filtered = filtered.slice(0, params.maxResults);
    }

    return filtered;
  }
} 