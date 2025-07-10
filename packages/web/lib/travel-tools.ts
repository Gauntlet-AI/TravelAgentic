/**
 * Travel Tools for Agentic AI
 * These functions allow the AI to take real actions for travel planning
 * Now integrated with mock API services
 */
import {
  type Activity,
  type Flight,
  type Hotel,
} from '@/lib/mock-data';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers?: number;
  cabin?: 'economy' | 'premium' | 'business' | 'first';
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  priceRange?: 'budget' | 'mid-range' | 'luxury' | 'any';
}

export interface ActivitySearchParams {
  destination: string;
  dates?: string[];
  interests?: string[];
  duration?: 'half-day' | 'full-day' | 'multi-day' | 'any';
}

/**
 * Search for flights between two destinations
 * Now uses integrated mock API service
 */
export async function searchFlights(params: FlightSearchParams): Promise<{
  success: boolean;
  data?: Flight[];
  message: string;
  source: 'mock' | 'api' | 'browser' | 'error';
}> {
  try {
    console.log('🔍 AI is searching for flights:', params);

    // Make API call to our integrated mock service
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        passengers: params.passengers || 1,
        cabin: params.cabin || 'economy'
      }),
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      // Transform API response to match expected Flight interface
      const transformedFlights = data.data.map((flight: any) => ({
        id: flight.id,
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        departure: {
          airport: flight.segments?.[0]?.origin || params.origin,
          city: params.origin,
          time: new Date(flight.segments?.[0]?.departure || Date.now()).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          date: new Date(flight.segments?.[0]?.departure || Date.now()).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
        },
        arrival: {
          airport: flight.segments?.[flight.segments.length - 1]?.destination || params.destination,
          city: params.destination,
          time: new Date(flight.segments?.[flight.segments.length - 1]?.arrival || Date.now()).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          date: new Date(flight.segments?.[flight.segments.length - 1]?.arrival || Date.now()).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
        },
        duration: flight.totalDuration || '4h 0m',
        stops: (flight.segments?.length || 1) - 1,
        price: flight.price?.amount || 299,
        class: params.cabin || 'Economy',
        aircraft: flight.aircraft || 'Boeing 737',
      }));

      return {
        success: true,
        data: transformedFlights,
        message: `Found ${transformedFlights.length} flight options from ${params.origin} to ${params.destination}`,
        source: 'api',
      };
    } else {
      return {
        success: false,
        message: data.error || 'Flight search failed',
        source: 'error',
      };
    }
  } catch (error) {
    console.error('Flight search error:', error);
    return {
      success: false,
      message: `Flight search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      source: 'error',
    };
  }
}

/**
 * Search for hotels in a destination
 * Now uses integrated mock API service
 */
export async function searchHotels(params: HotelSearchParams): Promise<{
  success: boolean;
  data?: Hotel[];
  message: string;
  source: 'mock' | 'api' | 'browser' | 'error';
}> {
  try {
    console.log('🏨 AI is searching for hotels:', params);

    // Make API call to our integrated mock service
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/hotels/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: params.destination,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: {
          adults: params.guests || 2,
          children: 0,
          rooms: 1
        }
      }),
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      // Transform API response to match expected Hotel interface
      const transformedHotels = data.data.map((hotel: any) => ({
        id: hotel.id,
        name: hotel.name,
        rating: hotel.rating?.score || 4.0,
        pricePerNight: hotel.price?.amount || 150,
        image: hotel.images?.[0] || '/placeholder.jpg',
        amenities: hotel.amenities || ['WiFi'],
        location: hotel.location?.city || params.destination,
        description: hotel.description || 'Comfortable hotel with modern amenities',
      }));

      return {
        success: true,
        data: transformedHotels,
        message: `Found ${transformedHotels.length} hotel options in ${params.destination}`,
        source: 'api',
      };
    } else {
      return {
        success: false,
        message: data.error || 'Hotel search failed',
        source: 'error',
      };
    }
  } catch (error) {
    console.error('Hotel search error:', error);
    return {
      success: false,
      message: `Hotel search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      source: 'error',
    };
  }
}

/**
 * Search for activities and attractions in a destination
 * Now uses integrated mock API service
 */
export async function searchActivities(params: ActivitySearchParams): Promise<{
  success: boolean;
  data?: Activity[];
  message: string;
  source: 'mock' | 'api' | 'browser' | 'error';
}> {
  try {
    console.log('🎯 AI is searching for activities:', params);

    // Make API call to our integrated mock service
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/activities/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: params.destination,
        startDate: params.dates?.[0],
        endDate: params.dates?.[1],
        categories: params.interests || ['outdoor', 'culture']
      }),
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      // Transform API response to match expected Activity interface
      const transformedActivities = data.data.map((activity: any) => ({
        id: activity.id,
        name: activity.name,
        description: activity.description || activity.shortDescription || 'Exciting activity',
        category: activity.categories || ['activity'],
        price: activity.price?.amount || 50,
        duration: activity.duration?.description || '2-3 hours',
        rating: activity.rating?.score || 4.0,
        image: activity.images?.[0] || '/placeholder.jpg',
        location: activity.location?.city || params.destination,
      }));

      return {
        success: true,
        data: transformedActivities,
        message: `Found ${transformedActivities.length} activity options in ${params.destination}${params.interests ? ` matching your interests: ${params.interests.join(', ')}` : ''}`,
        source: 'api',
      };
    } else {
      return {
        success: false,
        message: data.error || 'Activity search failed',
        source: 'error',
      };
    }
  } catch (error) {
    console.error('Activity search error:', error);
    return {
      success: false,
      message: `Activity search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      source: 'error',
    };
  }
}

/**
 * Enhanced API with fallback orchestration (Phase 2+)
 * This will implement the 5-layer fallback system:
 * 1. Primary API (3 retries)
 * 2. Secondary API (alternative provider)
 * 3. Browser Automation (Playwright + browser-use)
 * 4. Voice Calling (Twilio + ElevenLabs)
 * 5. User Manual Input (last resort)
 */
export class TravelFallbackOrchestrator {
  private maxRetries = 3;
  private fallbackEnabled = process.env.ENABLE_FALLBACK_SYSTEM === 'true';

  async executeWithFallback<T>(
    primaryFunction: () => Promise<T>,
    fallbackFunction?: () => Promise<T>,
    context?: string
  ): Promise<T> {
    if (!this.fallbackEnabled) {
      return await primaryFunction();
    }

    // Try primary function with retries
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempting ${context} (${attempt}/${this.maxRetries})`);
        return await primaryFunction();
      } catch (error) {
        console.warn(
          `❌ ${context} attempt ${attempt} failed:`,
          error instanceof Error ? error.message : 'Unknown error'
        );

        if (attempt < this.maxRetries) {
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    // Try fallback if available
    if (fallbackFunction) {
      console.log(`🔄 ${context} falling back to alternative method`);
      try {
        return await fallbackFunction();
      } catch (fallbackError) {
        console.error(
          `❌ ${context} fallback also failed:`,
          fallbackError instanceof Error
            ? fallbackError.message
            : 'Unknown error'
        );
        throw new Error(`All ${context} methods failed`);
      }
    }

    throw new Error(`${context} failed after ${this.maxRetries} attempts`);
  }
}

// Export singleton instance
export const fallbackOrchestrator = new TravelFallbackOrchestrator();
