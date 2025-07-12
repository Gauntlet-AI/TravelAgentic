/**
 * Duration and Scheduling Utilities for TravelAgentic
 * Handles intelligent scheduling with realistic durations and travel time considerations
 */

import { addMinutes, differenceInMinutes, format } from 'date-fns';

/**
 * Activity type classifications for duration estimation
 */
export enum ActivityType {
  SIGHTSEEING = 'sightseeing',
  MUSEUM = 'museum',
  OUTDOOR = 'outdoor',
  ADVENTURE = 'adventure',
  FOOD = 'food',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  CULTURAL = 'cultural',
  RELAXATION = 'relaxation',
  TRANSPORTATION = 'transportation',
  TOUR = 'tour'
}

/**
 * Location information for distance calculations
 */
export interface LocationInfo {
  name: string;
  address?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: 'hotel' | 'airport' | 'activity' | 'restaurant' | 'transport';
}

/**
 * Duration information for itinerary items
 */
export interface DurationInfo {
  estimated: number; // minutes
  minimum: number;   // minutes
  maximum: number;   // minutes
  description: string;
  flexible: boolean; // can be adjusted for scheduling
}

/**
 * Travel information between locations
 */
export interface TravelInfo {
  distance: number;     // kilometers
  duration: number;     // minutes
  method: 'walking' | 'taxi' | 'public_transport' | 'driving';
  cost?: number;        // estimated cost in USD
}

/**
 * Scheduling constraint information
 */
export interface SchedulingConstraint {
  minBufferTime: number;    // minimum time between activities (minutes)
  maxBufferTime: number;    // maximum reasonable buffer time (minutes)
  travelTime: number;       // estimated travel time (minutes)
  breakTime: number;        // recommended break time (minutes)
  mealTime?: boolean;       // should include meal time
}

/**
 * Scheduled itinerary item with timing information
 */
export interface ScheduledItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
  name: string;
  description: string;
  location: LocationInfo;
  startTime: Date;
  endTime: Date;
  duration: DurationInfo;
  travelToNext?: TravelInfo;
  bufferAfter?: number; // minutes
  metadata?: any;
}

/**
 * Duration estimation based on activity type and characteristics
 */
export class DurationEstimator {
  
  /**
   * Get estimated duration for different activity types
   */
  static getActivityDuration(
    activityType: ActivityType, 
    groupSize: number = 2,
    activitySpecifics?: any
  ): DurationInfo {
    
    const baseDurations: Record<ActivityType, { min: number; typical: number; max: number }> = {
      [ActivityType.SIGHTSEEING]: { min: 60, typical: 120, max: 180 },
      [ActivityType.MUSEUM]: { min: 90, typical: 150, max: 240 },
      [ActivityType.OUTDOOR]: { min: 120, typical: 180, max: 300 },
      [ActivityType.ADVENTURE]: { min: 180, typical: 240, max: 480 },
      [ActivityType.FOOD]: { min: 45, typical: 90, max: 150 },
      [ActivityType.SHOPPING]: { min: 60, typical: 120, max: 240 },
      [ActivityType.ENTERTAINMENT]: { min: 90, typical: 150, max: 240 },
      [ActivityType.CULTURAL]: { min: 90, typical: 135, max: 210 },
      [ActivityType.RELAXATION]: { min: 60, typical: 120, max: 180 },
      [ActivityType.TRANSPORTATION]: { min: 15, typical: 30, max: 90 },
      [ActivityType.TOUR]: { min: 120, typical: 180, max: 300 }
    };

    const base = baseDurations[activityType] || baseDurations[ActivityType.SIGHTSEEING];
    
    // Adjust for group size
    const groupMultiplier = groupSize > 4 ? 1.2 : groupSize > 2 ? 1.1 : 1.0;
    
    // Apply adjustments
    const estimated = Math.round(base.typical * groupMultiplier);
    const minimum = Math.round(base.min * groupMultiplier);
    const maximum = Math.round(base.max * groupMultiplier);
    
    return {
      estimated,
      minimum,
      maximum,
      description: this.getDurationDescription(estimated),
      flexible: activityType !== ActivityType.TRANSPORTATION
    };
  }

  /**
   * Get duration for hotel stays
   */
  static getHotelDuration(checkIn: Date, checkOut: Date): DurationInfo {
    const totalMinutes = differenceInMinutes(checkOut, checkIn);
    
    return {
      estimated: totalMinutes,
      minimum: totalMinutes,
      maximum: totalMinutes,
      description: this.getDurationDescription(totalMinutes),
      flexible: false
    };
  }

  /**
   * Get duration for flights (including airport time)
   */
  static getFlightDuration(flightTimeMinutes: number, isDomestic: boolean = true): DurationInfo {
    // Add airport processing time
    const airportTime = isDomestic ? 120 : 180; // 2-3 hours for airport procedures
    const totalTime = flightTimeMinutes + airportTime;
    
    return {
      estimated: totalTime,
      minimum: flightTimeMinutes + (isDomestic ? 90 : 150),
      maximum: totalTime + 60, // account for delays
      description: `${this.getDurationDescription(flightTimeMinutes)} flight + airport time`,
      flexible: false
    };
  }

  /**
   * Convert minutes to human-readable duration description
   */
  private static getDurationDescription(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes < 120) {
      const remainingMins = minutes % 60;
      return remainingMins > 0 ? `1 hour ${remainingMins} minutes` : '1 hour';
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      return remainingMins > 0 ? `${hours} hours ${remainingMins} minutes` : `${hours} hours`;
    }
  }

  /**
   * Classify activity type from categories and description
   */
  static classifyActivity(categories: string[], description: string = ''): ActivityType {
    const categoryMappings: Record<string, ActivityType> = {
      'sightseeing': ActivityType.SIGHTSEEING,
      'museum': ActivityType.MUSEUM,
      'outdoor': ActivityType.OUTDOOR,
      'adventure': ActivityType.ADVENTURE,
      'food': ActivityType.FOOD,
      'dining': ActivityType.FOOD,
      'shopping': ActivityType.SHOPPING,
      'entertainment': ActivityType.ENTERTAINMENT,
      'cultural': ActivityType.CULTURAL,
      'culture': ActivityType.CULTURAL,
      'relaxation': ActivityType.RELAXATION,
      'spa': ActivityType.RELAXATION,
      'tour': ActivityType.TOUR,
      'guided': ActivityType.TOUR
    };

    // Check categories first
    for (const category of categories) {
      const normalized = category.toLowerCase();
      if (categoryMappings[normalized]) {
        return categoryMappings[normalized];
      }
    }

    // Check description for keywords
    const descLower = description.toLowerCase();
    for (const [keyword, type] of Object.entries(categoryMappings)) {
      if (descLower.includes(keyword)) {
        return type;
      }
    }

    // Default to sightseeing
    return ActivityType.SIGHTSEEING;
  }
}

/**
 * Distance and travel time calculator
 */
export class DistanceCalculator {
  
  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Estimate travel time and method based on distance and location types
   */
  static estimateTravel(
    from: LocationInfo,
    to: LocationInfo,
    timeOfDay: 'morning' | 'afternoon' | 'evening' = 'afternoon'
  ): TravelInfo {
    const distance = this.calculateDistance(
      from.coordinates.latitude,
      from.coordinates.longitude,
      to.coordinates.latitude,
      to.coordinates.longitude
    );

    // Determine travel method and time based on distance and location types
    let method: TravelInfo['method'];
    let duration: number;
    let cost: number = 0;

    if (distance < 0.5) {
      // Walking distance
      method = 'walking';
      duration = Math.max(5, Math.round(distance * 12)); // ~12 minutes per km walking
    } else if (distance < 2) {
      // Short taxi/ride distance
      method = 'taxi';
      duration = Math.max(8, Math.round(distance * 8)); // ~8 minutes per km in city
      cost = Math.max(5, distance * 3); // Base fare + distance
    } else if (distance < 10) {
      // Public transport or taxi
      method = 'public_transport';
      duration = Math.max(15, Math.round(distance * 6)); // ~6 minutes per km with stops
      cost = 3; // Average public transport fare
    } else {
      // Longer distance - taxi or rental car
      method = 'driving';
      duration = Math.max(20, Math.round(distance * 4)); // ~4 minutes per km highway
      cost = distance * 2; // Taxi or gas cost
    }

    // Adjust for time of day (traffic)
    const trafficMultiplier = timeOfDay === 'morning' || timeOfDay === 'evening' ? 1.3 : 1.0;
    duration = Math.round(duration * trafficMultiplier);

    // Add buffer for airport/hotel locations
    if (from.type === 'airport' || to.type === 'airport') {
      duration += 15; // Extra airport processing time
    }
    if (from.type === 'hotel' || to.type === 'hotel') {
      duration += 5; // Hotel check-in/out buffer
    }

    return {
      distance,
      duration,
      method,
      cost
    };
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

/**
 * Intelligent scheduling algorithm
 */
export class IntelligentScheduler {
  
  /**
   * Create optimal schedule for a list of items
   */
  static scheduleItems(
    items: Array<{
      id: string;
      type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
      name: string;
      description: string;
      location: LocationInfo;
      categories?: string[];
      fixedTime?: Date; // for flights, hotel check-ins
      preferredTimeSlot?: 'morning' | 'afternoon' | 'evening';
      metadata?: any;
    }>,
    startDate: Date,
    groupSize: number = 2
  ): ScheduledItem[] {
    
    const scheduledItems: ScheduledItem[] = [];
    let currentTime = new Date(startDate);
    
    // Sort items by priority and fixed times
    const sortedItems = this.prioritizeItems(items);
    
    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i];
      const nextItem = sortedItems[i + 1];
      
      // Determine start time
      const startTime = item.fixedTime || currentTime;
      
      // Get duration information
      let duration: DurationInfo;
      
      if (item.type === 'flight') {
        const flightDuration = item.metadata?.totalDuration || 120;
        duration = DurationEstimator.getFlightDuration(flightDuration);
      } else if (item.type === 'hotel') {
        // Hotel stays are handled differently - we'll set a check-in duration
        duration = {
          estimated: 30,
          minimum: 15,
          maximum: 60,
          description: '30 minutes',
          flexible: true
        };
      } else {
        // Activity
        const activityType = DurationEstimator.classifyActivity(
          item.categories || [],
          item.description
        );
        duration = DurationEstimator.getActivityDuration(activityType, groupSize);
      }
      
      const endTime = addMinutes(startTime, duration.estimated);
      
      // Calculate travel to next item
      let travelToNext: TravelInfo | undefined;
      let bufferAfter = 0;
      
      if (nextItem) {
        travelToNext = DistanceCalculator.estimateTravel(
          item.location,
          nextItem.location,
          this.getTimeOfDay(endTime)
        );
        
        // Calculate buffer time
        bufferAfter = this.calculateBufferTime(item, nextItem, travelToNext);
      }
      
      const scheduledItem: ScheduledItem = {
        id: item.id,
        type: item.type,
        name: item.name,
        description: item.description,
        location: item.location,
        startTime,
        endTime,
        duration,
        travelToNext,
        bufferAfter,
        metadata: item.metadata
      };
      
      scheduledItems.push(scheduledItem);
      
      // Update current time for next item
      if (nextItem) {
        currentTime = addMinutes(endTime, bufferAfter + (travelToNext?.duration || 0));
      }
    }
    
    return scheduledItems;
  }

  /**
   * Prioritize items by type and constraints
   */
  private static prioritizeItems(items: any[]): any[] {
    return items.sort((a, b) => {
      // Fixed time items (flights, hotel check-ins) come first
      if (a.fixedTime && !b.fixedTime) return -1;
      if (!a.fixedTime && b.fixedTime) return 1;
      if (a.fixedTime && b.fixedTime) {
        return a.fixedTime.getTime() - b.fixedTime.getTime();
      }
      
      // Prioritize by type
      const typePriority: Record<string, number> = { flight: 1, hotel: 2, activity: 3, restaurant: 4, transport: 5 };
      const aPriority = typePriority[a.type] || 6;
      const bPriority = typePriority[b.type] || 6;
      
      return aPriority - bPriority;
    });
  }

  /**
   * Calculate appropriate buffer time between activities
   */
  private static calculateBufferTime(
    current: any,
    next: any,
    travel: TravelInfo
  ): number {
    let baseBuffer = 15; // minimum 15 minutes
    
    // Add travel time
    baseBuffer += travel.duration;
    
    // Adjust based on activity types
    if (current.type === 'activity' && next.type === 'activity') {
      baseBuffer += 15; // break between activities
    }
    
    if (current.type === 'restaurant' || next.type === 'restaurant') {
      baseBuffer += 10; // meal transition time
    }
    
    // Adjust for distance
    if (travel.distance > 5) {
      baseBuffer += 20; // longer distance buffer
    } else if (travel.distance < 0.5) {
      baseBuffer = Math.max(5, baseBuffer - 10); // reduce for very close items
    }
    
    // Add buffer for check-in/check-out procedures
    if (current.type === 'hotel' || next.type === 'hotel') {
      baseBuffer += 15;
    }
    
    // Cap the buffer time
    return Math.min(baseBuffer, 90); // max 1.5 hours buffer
  }

  /**
   * Determine time of day from a date
   */
  private static getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' {
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  /**
   * Format scheduled items for display
   */
  static formatSchedule(scheduledItems: ScheduledItem[]): any[] {
    return scheduledItems.map(item => ({
      ...item,
      startTimeFormatted: format(item.startTime, 'h:mm a'),
      endTimeFormatted: format(item.endTime, 'h:mm a'),
      durationFormatted: item.duration.description,
      travelInfo: item.travelToNext ? {
        duration: item.travelToNext.duration,
        method: item.travelToNext.method,
        distance: `${item.travelToNext.distance.toFixed(1)} km`,
        cost: item.travelToNext.cost ? `$${item.travelToNext.cost.toFixed(0)}` : undefined
      } : undefined
    }));
  }
}

/**
 * Utility functions for duration and time formatting
 */
export const DurationUtils = {
  /**
   * Format minutes into human-readable duration
   */
  formatMinutes: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  },

  /**
   * Calculate total itinerary duration
   */
  calculateTotalDuration: (items: ScheduledItem[]): number => {
    if (items.length === 0) return 0;
    const start = items[0].startTime;
    const end = items[items.length - 1].endTime;
    return differenceInMinutes(end, start);
  },

  /**
   * Get time until next item
   */
  getTimeUntilNext: (current: ScheduledItem, next: ScheduledItem): number => {
    return differenceInMinutes(next.startTime, current.endTime);
  }
}; 