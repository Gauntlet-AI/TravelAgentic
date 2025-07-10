/**
 * Mock Activity Service Implementation
 * Provides realistic activity search functionality with category filtering, availability, and pricing
 */

import { 
  IActivityService, 
  ActivitySearchParams, 
  ActivityResult, 
  ServiceResponse, 
  MockConfig,
  Price
} from '../types';
import { 
  getActivitiesByDestination, 
  searchActivities, 
  getActivitiesByCategory,
  getActivityCategories,
  activityCategories,
  timeSlots
} from '../data/activities';

export class MockActivityService implements IActivityService {
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
   * Search for activities based on parameters
   */
  async search(params: ActivitySearchParams): Promise<ServiceResponse<ActivityResult[]>> {
    const startTime = Date.now();

    try {
      // Simulate API delay
      await this.simulateDelay();

      // Simulate failures for testing fallback mechanisms
      if (this.shouldSimulateFailure()) {
        throw new Error('Mock activity API failure for testing');
      }

      // Get base activity data for destination
      let activities = getActivitiesByDestination(params.destination);

      if (activities.length === 0) {
        // If no specific destination data, generate generic activities
        activities = this.generateGenericActivities(params.destination);
      }

      // Apply filters and generate complete activity results
      const filteredActivities = this.applyFilters(activities, params);
      const completeActivities = filteredActivities.map(activity => 
        this.generateCompleteActivityResult(activity, params)
      );

      // Sort results
      const sortedActivities = this.sortActivities(completeActivities, params.filters?.sortBy, params.filters?.sortOrder);

      return {
        success: true,
        data: sortedActivities,
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
   * Get detailed information about a specific activity
   */
  async getDetails(activityId: string): Promise<ServiceResponse<ActivityResult>> {
    const startTime = Date.now();

    try {
      await this.simulateDelay();

      if (this.shouldSimulateFailure()) {
        throw new Error('Mock activity API failure for testing');
      }

      // Generate a detailed activity result
      const activity = this.generateSampleActivity(activityId);

      return {
        success: true,
        data: activity,
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
   * Check if an activity is available for the specified date
   */
  async checkAvailability(activityId: string, date: string): Promise<ServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      await this.simulateDelay();

      if (this.shouldSimulateFailure()) {
        throw new Error('Mock activity API failure for testing');
      }

      // Calculate days until activity date
      const daysUntilActivity = Math.ceil(
        (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Simulate availability based on various factors
      let availabilityRate = 0.80; // Base 80% availability

      // Reduce availability for last-minute bookings
      if (daysUntilActivity < 3) {
        availabilityRate *= 0.6;
      } else if (daysUntilActivity < 7) {
        availabilityRate *= 0.75;
      }

      // Check if it's weekend (reduce availability for popular activities)
      const activityDate = new Date(date);
      const isWeekend = activityDate.getDay() === 5 || activityDate.getDay() === 6;
      if (isWeekend) {
        availabilityRate *= 0.7;
      }

      // Check for holidays (simplified - just reduce availability randomly)
      if (Math.random() < 0.1) { // 10% chance it's a holiday
        availabilityRate *= 0.5;
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
   * Get all available activity categories
   */
  async getCategories(): Promise<ServiceResponse<string[]>> {
    const startTime = Date.now();

    try {
      await this.simulateDelay();

      if (this.shouldSimulateFailure()) {
        throw new Error('Mock activity API failure for testing');
      }

      const categories = getActivityCategories();

      return {
        success: true,
        data: categories,
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
   * Apply filters to activity results
   */
  private applyFilters(activities: Partial<ActivityResult>[], params: ActivitySearchParams): Partial<ActivityResult>[] {
    let filtered = [...activities];

    // Filter by categories
    if (params.categories && params.categories.length > 0) {
      filtered = filtered.filter(activity => 
        activity.categories && params.categories!.some(category => 
          activity.categories!.includes(category)
        )
      );
    }

    // Filter by duration
    if (params.duration) {
      filtered = filtered.filter(activity => {
        if (!activity.duration) return true;
        
        const activityDurationHours = activity.duration.unit === 'hours' ? 
          activity.duration.value : 
          activity.duration.value * 24;

        if (params.duration!.min && activityDurationHours < params.duration!.min) {
          return false;
        }
        if (params.duration!.max && activityDurationHours > params.duration!.max) {
          return false;
        }
        return true;
      });
    }

    // Filter by group size
    if (params.groupSize) {
      filtered = filtered.filter(activity => 
        !activity.groupSize || 
        (activity.groupSize.min <= params.groupSize! && activity.groupSize.max >= params.groupSize!)
      );
    }

    // Filter by accessibility requirements
    if (params.accessibility && params.accessibility.length > 0) {
      filtered = filtered.filter(activity => 
        activity.accessibility && params.accessibility!.every(requirement => 
          activity.accessibility!.includes(requirement)
        )
      );
    }

    // Filter by time of day
    if (params.timeOfDay) {
      // This is a simplified filter - in reality, you'd check actual schedules
      filtered = filtered.filter(activity => {
        // For now, assume all activities are available at requested times
        // In a real implementation, you'd check actual availability schedules
        return true;
      });
    }

    return filtered;
  }

  /**
   * Generate complete activity result from partial data
   */
  private generateCompleteActivityResult(
    partialActivity: Partial<ActivityResult>, 
    params: ActivitySearchParams
  ): ActivityResult {
    const basePrice = this.calculateBasePrice(partialActivity, params);
    const priceIncludes = partialActivity.priceIncludes || this.generatePriceIncludes(partialActivity.categories || []);
    const priceExcludes = partialActivity.priceExcludes || this.generatePriceExcludes();

    return {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: partialActivity.name || 'Sample Activity',
      description: partialActivity.description || 'Exciting activity with professional guidance and memorable experiences.',
      shortDescription: partialActivity.shortDescription || 'Great activity for travelers',
      categories: partialActivity.categories || ['sightseeing'],
      duration: partialActivity.duration || { value: 2, unit: 'hours', description: '2-hour experience' },
      price: {
        amount: basePrice,
        currency: 'USD',
        displayPrice: `$${basePrice.toLocaleString()}`
      },
      priceIncludes,
      priceExcludes,
      rating: partialActivity.rating || {
        score: Math.round((Math.random() * 2 + 3.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 2000) + 50,
        reviewSummary: 'Great experience with knowledgeable guides'
      },
      location: partialActivity.location || {
        name: 'Activity Location',
        address: '123 Activity Street',
        city: params.destination,
        coordinates: { latitude: 0, longitude: 0 }
      },
      images: partialActivity.images || [
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      ],
      highlights: partialActivity.highlights || ['Professional guide', 'Great views', 'Cultural insights'],
      included: partialActivity.included || ['Professional guide', 'All necessary equipment'],
      requirements: partialActivity.requirements || ['Comfortable walking shoes'],
      restrictions: partialActivity.restrictions || ['Minimum age 12'],
      meetingPoint: partialActivity.meetingPoint || 'Main entrance',
      cancellationPolicy: partialActivity.cancellationPolicy || 'Free cancellation up to 24 hours before activity',
      availability: partialActivity.availability || {
        nextAvailable: this.getNextAvailableDate(),
        schedule: 'Daily at 10:00 AM and 2:00 PM'
      },
      groupSize: partialActivity.groupSize || { min: 1, max: 15 },
      languages: partialActivity.languages || ['English'],
      accessibility: partialActivity.accessibility || ['Walking required'],
      source: 'api',
      bookingUrl: `https://mock-booking.com/activity/${partialActivity.name?.replace(/\s+/g, '-').toLowerCase()}`,
      deepLink: `travelagentic://activity/${partialActivity.name?.replace(/\s+/g, '-').toLowerCase()}`
    };
  }

  /**
   * Calculate base price for an activity
   */
  private calculateBasePrice(activity: Partial<ActivityResult>, params: ActivitySearchParams): number {
    let basePrice = 50; // Base price in USD

    // Duration factor
    const duration = activity.duration;
    if (duration) {
      const hours = duration.unit === 'hours' ? duration.value : duration.value * 8; // Assume 8-hour days
      basePrice = Math.max(25, hours * 20); // $20 per hour, minimum $25
    }

    // Category factor
    const categories = activity.categories || [];
    const categoryMultipliers: Record<string, number> = {
      'outdoor': 1.0,
      'culture': 1.2,
      'food': 1.5,
      'entertainment': 1.8,
      'sightseeing': 1.0,
      'wellness': 1.6,
      'family': 0.9,
      'shopping': 0.8
    };

    const avgMultiplier = categories.reduce((sum, cat) => 
      sum + (categoryMultipliers[cat] || 1.0), 0) / Math.max(categories.length, 1);
    basePrice *= avgMultiplier;

    // Group size factor
    if (params.groupSize) {
      if (params.groupSize === 1) {
        basePrice *= 1.3; // Solo traveler premium
      } else if (params.groupSize > 6) {
        basePrice *= 0.85; // Group discount
      }
    }

    // Date proximity factor
    if (params.startDate) {
      const daysUntilActivity = Math.ceil(
        (new Date(params.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilActivity < 3) {
        basePrice *= 1.4; // 40% increase for last-minute bookings
      } else if (daysUntilActivity < 7) {
        basePrice *= 1.2; // 20% increase
      }
    }

    // Weekend premium
    if (params.startDate) {
      const activityDate = new Date(params.startDate);
      const isWeekend = activityDate.getDay() === 5 || activityDate.getDay() === 6;
      if (isWeekend) {
        basePrice *= 1.15; // 15% weekend premium
      }
    }

    // Add price fluctuation
    if (this.config.enablePriceFluctuation) {
      const fluctuation = (Math.random() - 0.5) * 0.25; // ±12.5%
      basePrice *= (1 + fluctuation);
    }

    return Math.round(basePrice);
  }

  /**
   * Generate what's included in the price
   */
  private generatePriceIncludes(categories: string[]): string[] {
    const baseIncludes = ['Professional guide', 'All necessary equipment'];
    
    if (categories.includes('food')) {
      baseIncludes.push('Food tastings', 'Recipe cards');
    }
    if (categories.includes('culture')) {
      baseIncludes.push('Cultural insights', 'Historical information');
    }
    if (categories.includes('entertainment')) {
      baseIncludes.push('Show tickets', 'Reserved seating');
    }
    if (categories.includes('outdoor')) {
      baseIncludes.push('Safety equipment', 'Water bottle');
    }
    if (categories.includes('wellness')) {
      baseIncludes.push('All materials', 'Refreshments');
    }

    return baseIncludes;
  }

  /**
   * Generate what's excluded from the price
   */
  private generatePriceExcludes(): string[] {
    return [
      'Transportation to meeting point',
      'Personal expenses',
      'Gratuities',
      'Travel insurance'
    ];
  }

  /**
   * Sort activities based on criteria
   */
  private sortActivities(
    activities: ActivityResult[], 
    sortBy?: string, 
    sortOrder: 'asc' | 'desc' = 'asc'
  ): ActivityResult[] {
    const sorted = [...activities];

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
      case 'duration':
        sorted.sort((a, b) => {
          const aDuration = a.duration.unit === 'hours' ? a.duration.value : a.duration.value * 8;
          const bDuration = b.duration.unit === 'hours' ? b.duration.value : b.duration.value * 8;
          return sortOrder === 'asc' ? aDuration - bDuration : bDuration - aDuration;
        });
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
   * Generate generic activities for destinations without specific data
   */
  private generateGenericActivities(destination: string): Partial<ActivityResult>[] {
    const numActivities = Math.floor(Math.random() * 10) + 8; // 8-17 activities
    const activities: Partial<ActivityResult>[] = [];

    const activityTemplates = [
      { name: 'City Walking Tour', categories: ['sightseeing'], duration: { value: 2.5, unit: 'hours' as const } },
      { name: 'Food Tasting Experience', categories: ['food', 'culture'], duration: { value: 3, unit: 'hours' as const } },
      { name: 'Museum Visit', categories: ['culture'], duration: { value: 2, unit: 'hours' as const } },
      { name: 'Outdoor Adventure', categories: ['outdoor'], duration: { value: 4, unit: 'hours' as const } },
      { name: 'Cultural Workshop', categories: ['culture', 'wellness'], duration: { value: 1.5, unit: 'hours' as const } },
      { name: 'Scenic Viewpoint Tour', categories: ['sightseeing', 'outdoor'], duration: { value: 3, unit: 'hours' as const } },
      { name: 'Local Market Tour', categories: ['food', 'shopping'], duration: { value: 2, unit: 'hours' as const } },
      { name: 'Entertainment Show', categories: ['entertainment'], duration: { value: 2.5, unit: 'hours' as const } }
    ];

    for (let i = 0; i < numActivities; i++) {
      const template = activityTemplates[i % activityTemplates.length];
      
      activities.push({
        name: `${template.name} in ${destination}`,
        description: `Experience the best of ${destination} with this ${template.name.toLowerCase()}. Professional guides provide insights into local culture and history.`,
        shortDescription: `${template.name} with local guide`,
        categories: template.categories,
        duration: {
          ...template.duration,
          description: `${template.duration.value}-${template.duration.unit} experience`
        },
        location: {
          name: `${destination} Activity Center`,
          address: `${100 + i} Main Street`,
          city: destination,
          coordinates: { 
            latitude: Math.random() * 180 - 90, 
            longitude: Math.random() * 360 - 180 
          }
        },
        highlights: ['Professional guide', 'Local insights', 'Great photo opportunities'],
        groupSize: { min: 1, max: Math.floor(Math.random() * 15) + 5 },
        languages: ['English']
      });
    }

    return activities;
  }

  /**
   * Generate a sample activity for the details endpoint
   */
  private generateSampleActivity(activityId: string): ActivityResult {
    return {
      id: activityId,
      name: 'Sample City Tour',
      description: 'Explore the highlights of the city with an experienced local guide. This comprehensive tour covers major landmarks, hidden gems, and provides cultural insights.',
      shortDescription: 'Comprehensive city tour with local guide',
      categories: ['sightseeing', 'culture'],
      duration: { value: 3, unit: 'hours', description: '3-hour walking tour' },
      price: {
        amount: 75,
        currency: 'USD',
        displayPrice: '$75'
      },
      priceIncludes: ['Professional guide', 'Cultural insights', 'Map of the city', 'Photo opportunities'],
      priceExcludes: ['Transportation', 'Food and drinks', 'Personal expenses', 'Gratuities'],
      rating: {
        score: 4.5,
        reviewCount: 1247,
        reviewSummary: 'Excellent tour with knowledgeable guide'
      },
      location: {
        name: 'City Center',
        address: '123 Main Square, City Center',
        city: 'Sample City',
        coordinates: { latitude: 40.7128, longitude: -74.0060 }
      },
      images: [
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      ],
      highlights: ['Historic landmarks', 'Local culture', 'Hidden gems', 'Great photo spots'],
      included: ['Professional guide', 'Walking tour', 'Cultural insights', 'City map'],
      requirements: ['Comfortable walking shoes', 'Weather-appropriate clothing'],
      restrictions: ['Moderate walking required', 'Not suitable for wheelchairs'],
      meetingPoint: 'Main Square fountain',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: this.getNextAvailableDate(),
        schedule: 'Daily at 10:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 20 },
      languages: ['English', 'Spanish'],
      accessibility: ['Walking required'],
      source: 'api'
    };
  }

  /**
   * Get next available date for activities
   */
  private getNextAvailableDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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