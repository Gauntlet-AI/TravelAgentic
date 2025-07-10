/**
 * TravelAgentic Langflow Service
 * High-level service for AI-powered travel planning workflows
 * Provides fallback to mock data when Langflow is unavailable
 */
import { type LangflowRunRequest, langflowClient } from './langflow-client';

export interface UserPreferences {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  adults: number;
  children: number;
  budget?: number;
  travelStyle?: string;
  accommodation?: string;
  interests?: string[];
  specialRequirements?: string[];
  travelingWithPets?: boolean;
}

export interface DynamicQuestion {
  id: string;
  question: string;
  options: string[];
  required: boolean;
  category: string;
  help_text?: string;
}

export interface SearchParameters {
  flight_search: {
    origin: string;
    destination: string;
    departure_date: string;
    return_date: string;
    passengers: number;
    cabin: 'economy' | 'premium' | 'business' | 'first';
  };
  hotel_search: {
    destination: string;
    check_in: string;
    check_out: string;
    guests: number;
    price_range: 'budget' | 'mid-range' | 'luxury' | 'any';
  };
  activity_search: {
    destination: string;
    interests: string[];
    duration: 'half-day' | 'full-day' | 'multi-day' | 'any';
  };
}

export interface BookingDecision {
  recommended_flight?: any;
  recommended_hotel?: any;
  recommended_activities?: any[];
  confidence_score: number;
  reasoning: string;
  alternatives?: {
    flights?: any[];
    hotels?: any[];
    activities?: any[];
  };
}

export interface ItineraryContent {
  title: string;
  description: string;
  days: Array<{
    day: number;
    date: string;
    activities: Array<{
      time: string;
      activity: string;
      location: string;
      notes?: string;
    }>;
  }>;
  packing_list: string[];
  local_info: {
    currency: string;
    language: string;
    emergency_numbers: string[];
    cultural_tips: string[];
  };
}

export class TravelLangflowService {
  private isEnabled: boolean;
  private flowIds: Map<string, string> = new Map();
  private healthStatus: boolean = false;

  constructor() {
    this.isEnabled = process.env.ENABLE_LANGFLOW === 'true';
    this.initializeFlowIds();
    this.checkHealth();
  }

  /**
   * Initialize flow IDs mapping
   */
  private initializeFlowIds(): void {
    this.flowIds.set(
      'user_intake',
      process.env.LANGFLOW_USER_INTAKE_FLOW_ID || 'user_intake_flow'
    );
    this.flowIds.set(
      'search_coordination',
      process.env.LANGFLOW_SEARCH_COORDINATION_FLOW_ID ||
        'search_coordination_flow'
    );
    this.flowIds.set(
      'booking_decisions',
      process.env.LANGFLOW_BOOKING_FLOW_ID || 'booking_flow'
    );
    this.flowIds.set(
      'itinerary_generation',
      process.env.LANGFLOW_ITINERARY_FLOW_ID || 'itinerary_generation_flow'
    );
  }

  /**
   * Check Langflow health status
   */
  private async checkHealth(): Promise<void> {
    if (!this.isEnabled) {
      this.healthStatus = false;
      return;
    }

    try {
      this.healthStatus = await langflowClient.healthCheck();
    } catch (error) {
      console.warn('Langflow health check failed:', error);
      this.healthStatus = false;
    }
  }

  /**
   * Generate dynamic preference questions based on initial travel request
   * @param destination - Travel destination
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param travelers - Number of travelers
   * @param budget - Travel budget (optional)
   * @returns Promise<DynamicQuestion[]>
   */
  async generatePreferenceQuestions(
    destination: string,
    startDate: string,
    endDate: string,
    travelers: number,
    budget?: number
  ): Promise<DynamicQuestion[]> {
    if (!this.isEnabled || !this.healthStatus) {
      console.log('Langflow unavailable, using mock preference questions');
      return this.getMockPreferenceQuestions(destination);
    }

    try {
      const flowId = this.flowIds.get('user_intake');
      if (!flowId) {
        throw new Error('User intake flow ID not configured');
      }

      const input = {
        destination,
        start_date: startDate,
        end_date: endDate,
        travelers,
        budget: budget || 5000,
      };

      const response = await langflowClient.runFlow(flowId, {
        input_value: JSON.stringify(input),
        input_type: 'json',
      });

      const data = langflowClient.parseResponseData(response);
      if (data && data.questions) {
        return data.questions;
      }

      throw new Error('Invalid response format from Langflow');
    } catch (error) {
      console.error('Langflow preference generation failed:', error);
      return this.getMockPreferenceQuestions(destination);
    }
  }

  /**
   * Generate search parameters based on user preferences
   * @param preferences - User travel preferences
   * @returns Promise<SearchParameters>
   */
  async generateSearchParameters(
    preferences: UserPreferences
  ): Promise<SearchParameters> {
    if (!this.isEnabled || !this.healthStatus) {
      console.log('Langflow unavailable, using mock search parameters');
      return this.getMockSearchParameters(preferences);
    }

    try {
      const flowId = this.flowIds.get('search_coordination');
      if (!flowId) {
        throw new Error('Search coordination flow ID not configured');
      }

      const response = await langflowClient.runFlow(flowId, {
        input_value: JSON.stringify(preferences),
        input_type: 'json',
      });

      const data = langflowClient.parseResponseData(response);
      if (data && this.isValidSearchParameters(data)) {
        return data;
      }

      throw new Error('Invalid search parameters from Langflow');
    } catch (error) {
      console.error('Langflow search coordination failed:', error);
      return this.getMockSearchParameters(preferences);
    }
  }

  /**
   * Process booking decisions with AI logic
   * @param searchResults - Results from flight/hotel/activity searches
   * @param preferences - User preferences
   * @returns Promise<BookingDecision>
   */
  async processBookingDecisions(
    searchResults: any,
    preferences: UserPreferences
  ): Promise<BookingDecision> {
    if (!this.isEnabled || !this.healthStatus) {
      console.log('Langflow unavailable, using mock booking decisions');
      return this.getMockBookingDecisions(searchResults);
    }

    try {
      const flowId = this.flowIds.get('booking_decisions');
      if (!flowId) {
        throw new Error('Booking decisions flow ID not configured');
      }

      const input = {
        search_results: searchResults,
        preferences: preferences,
      };

      const response = await langflowClient.runFlow(flowId, {
        input_value: JSON.stringify(input),
        input_type: 'json',
      });

      const data = langflowClient.parseResponseData(response);
      if (data && typeof data.confidence_score === 'number') {
        return data;
      }

      throw new Error('Invalid booking decisions from Langflow');
    } catch (error) {
      console.error('Langflow booking processing failed:', error);
      return this.getMockBookingDecisions(searchResults);
    }
  }

  /**
   * Generate personalized itinerary
   * @param bookings - Selected bookings
   * @param preferences - User preferences
   * @returns Promise<ItineraryContent>
   */
  async generateItinerary(
    bookings: any,
    preferences: UserPreferences
  ): Promise<ItineraryContent> {
    if (!this.isEnabled || !this.healthStatus) {
      console.log('Langflow unavailable, using mock itinerary');
      return this.getMockItinerary(bookings, preferences);
    }

    try {
      const flowId = this.flowIds.get('itinerary_generation');
      if (!flowId) {
        throw new Error('Itinerary generation flow ID not configured');
      }

      const input = {
        bookings,
        preferences,
      };

      const response = await langflowClient.runFlow(flowId, {
        input_value: JSON.stringify(input),
        input_type: 'json',
      });

      const data = langflowClient.parseResponseData(response);
      if (data && data.title && data.days) {
        return data;
      }

      throw new Error('Invalid itinerary from Langflow');
    } catch (error) {
      console.error('Langflow itinerary generation failed:', error);
      return this.getMockItinerary(bookings, preferences);
    }
  }

  /**
   * Get service status
   * @returns Service status information
   */
  async getServiceStatus(): Promise<{
    enabled: boolean;
    healthy: boolean;
    flows_available: string[];
    version?: string;
  }> {
    const status = {
      enabled: this.isEnabled,
      healthy: this.healthStatus,
      flows_available: [] as string[],
      version: undefined as string | undefined,
    };

    if (this.isEnabled && this.healthStatus) {
      try {
        const flows = await langflowClient.getFlows();
        status.flows_available = flows.map((f) => f.name);

        const versionInfo = await langflowClient.getStatus();
        status.version = versionInfo.version;
      } catch (error) {
        console.error('Failed to get Langflow status:', error);
        status.healthy = false;
      }
    }

    return status;
  }

  /**
   * Validate search parameters structure
   */
  private isValidSearchParameters(data: any): data is SearchParameters {
    return (
      data &&
      data.flight_search &&
      data.hotel_search &&
      data.activity_search &&
      typeof data.flight_search.passengers === 'number'
    );
  }

  /**
   * Fallback mock methods
   */
  private getMockPreferenceQuestions(destination: string): DynamicQuestion[] {
    const destinationSpecific = destination.toLowerCase();
    const questions: DynamicQuestion[] = [
      {
        id: 'travel_style',
        question: "What's your primary travel style?",
        options: ['Adventure', 'Relaxation', 'Cultural', 'Business', 'Mixed'],
        required: true,
        category: 'general',
      },
      {
        id: 'accommodation',
        question: 'What type of accommodation do you prefer?',
        options: ['Hotel', 'Airbnb', 'Hostel', 'Resort', 'Boutique Hotel'],
        required: true,
        category: 'accommodation',
      },
      {
        id: 'budget_priority',
        question: 'How would you like to allocate your budget?',
        options: [
          'Luxury accommodations',
          'Unique experiences',
          'Fine dining',
          'Balanced approach',
        ],
        required: false,
        category: 'budget',
      },
    ];

    // Add destination-specific questions
    if (
      destinationSpecific.includes('tokyo') ||
      destinationSpecific.includes('japan')
    ) {
      questions.push({
        id: 'japan_interests',
        question: 'What aspects of Japan interest you most?',
        options: [
          'Traditional culture',
          'Modern technology',
          'Cuisine',
          'Pop culture',
          'Nature',
        ],
        required: false,
        category: 'destination_specific',
      });
    }

    if (
      destinationSpecific.includes('paris') ||
      destinationSpecific.includes('france')
    ) {
      questions.push({
        id: 'paris_interests',
        question: 'What draws you to Paris?',
        options: [
          'Art and museums',
          'Fashion and shopping',
          'Cuisine',
          'History',
          'Romance',
        ],
        required: false,
        category: 'destination_specific',
      });
    }

    return questions;
  }

  private getMockSearchParameters(
    preferences: UserPreferences
  ): SearchParameters {
    return {
      flight_search: {
        origin: 'NYC', // This would be determined from user location
        destination: preferences.destination,
        departure_date: preferences.startDate,
        return_date: preferences.endDate,
        passengers: preferences.travelers,
        cabin:
          preferences.budget && preferences.budget > 5000
            ? 'business'
            : 'economy',
      },
      hotel_search: {
        destination: preferences.destination,
        check_in: preferences.startDate,
        check_out: preferences.endDate,
        guests: preferences.travelers,
        price_range:
          preferences.budget && preferences.budget > 3000
            ? 'luxury'
            : preferences.budget && preferences.budget > 1500
              ? 'mid-range'
              : 'budget',
      },
      activity_search: {
        destination: preferences.destination,
        interests: preferences.interests || ['culture', 'sightseeing'],
        duration: 'any',
      },
    };
  }

  private getMockBookingDecisions(searchResults: any): BookingDecision {
    return {
      recommended_flight: searchResults.flights?.[0],
      recommended_hotel: searchResults.hotels?.[0],
      recommended_activities: searchResults.activities?.slice(0, 3),
      confidence_score: 0.85,
      reasoning:
        'Selected based on optimal balance of price, rating, and user preferences. Flight offers good timing with reasonable cost. Hotel provides excellent amenities in central location. Activities align with stated interests in culture and sightseeing.',
      alternatives: {
        flights: searchResults.flights?.slice(1, 3),
        hotels: searchResults.hotels?.slice(1, 3),
        activities: searchResults.activities?.slice(3, 6),
      },
    };
  }

  private getMockItinerary(
    bookings: any,
    preferences: UserPreferences
  ): ItineraryContent {
    const startDate = new Date(preferences.startDate);
    const endDate = new Date(preferences.endDate);
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      title: `${preferences.destination} Adventure`,
      description: `A personalized ${days}-day itinerary for ${preferences.travelers} travelers exploring the best of ${preferences.destination}.`,
      days: Array.from({ length: days }, (_, i) => {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        return {
          day: i + 1,
          date: currentDate.toISOString().split('T')[0],
          activities: [
            {
              time: '09:00',
              activity:
                i === 0 ? 'Arrival and hotel check-in' : 'Morning exploration',
              location: bookings.hotel?.name || 'Hotel',
              notes:
                i === 0
                  ? 'Take time to rest and acclimate'
                  : 'Start early to avoid crowds',
            },
            {
              time: '12:00',
              activity: 'Lunch at local restaurant',
              location: 'City center',
              notes: 'Try local specialties',
            },
            {
              time: '14:00',
              activity: bookings.activities?.[i % 3]?.name || 'Sightseeing',
              location:
                bookings.activities?.[i % 3]?.location || 'Main attractions',
              notes: 'Book tickets in advance if needed',
            },
            {
              time: '18:00',
              activity: 'Dinner and evening leisure',
              location: 'Local neighborhood',
              notes: 'Explore nightlife and local culture',
            },
          ],
        };
      }),
      packing_list: [
        'Comfortable walking shoes',
        'Weather-appropriate clothing',
        'Travel documents and copies',
        'Portable charger',
        'Camera',
        'Sunscreen and sunglasses',
        'Small daypack for excursions',
        'Local currency or travel card',
      ],
      local_info: {
        currency: 'Local currency', // This would be destination-specific
        language: 'Local language',
        emergency_numbers: ['Emergency: 911', 'Tourist Hotline: 555-0123'],
        cultural_tips: [
          'Research local customs and etiquette',
          'Learn basic phrases in the local language',
          'Respect local dress codes at religious sites',
          'Be aware of tipping customs',
          'Keep important documents secure',
        ],
      },
    };
  }
}

// Singleton instance
export const travelLangflowService = new TravelLangflowService();
