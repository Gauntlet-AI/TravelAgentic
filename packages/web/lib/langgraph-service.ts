/**
 * TravelAgentic LangGraph Service
 * High-level service for AI-powered travel planning workflows using LangGraph
 * Provides fallback to mock data when LangGraph is unavailable
 */

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
    amenities_priority: string[];
    location_preference: string;
  };
  activity_search: {
    destination: string;
    interests: string[];
    duration: 'half-day' | 'full-day' | 'multi-day' | 'any';
    price_sensitivity: string;
    group_suitability: string;
  };
  search_strategy: {
    priority_order: string[];
    flexibility: {
      dates: string;
      budget: string;
    };
    booking_timing: string;
  };
}

export interface BookingDecision {
  recommended_flight?: any;
  recommended_hotel?: any;
  recommended_activities?: any[];
  confidence_score: number;
  reasoning: string;
  total_estimated_cost?: number;
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
    day_name: string;
    theme: string;
    activities: Array<{
      time: string;
      activity: string;
      location: string;
      duration: string;
      type: string;
      notes?: string;
    }>;
    meals: Array<{
      time: string;
      meal: string;
      restaurant: string;
      cuisine: string;
      location: string;
    }>;
    transportation: string;
    estimated_cost: number;
    energy_level: string;
  }>;
  packing_list: string[];
  local_info: {
    currency: string;
    language: string;
    emergency_numbers: string[];
    cultural_tips: string[];
    transportation_tips?: string[];
  };
}

export class TravelLangGraphService {
  private isEnabled: boolean;
  private baseUrl: string;
  private healthStatus: boolean = false;

  constructor() {
    this.isEnabled = process.env.ENABLE_LANGGRAPH === 'true';
    this.baseUrl = process.env.LANGGRAPH_URL || 'http://localhost:8000';
    this.checkHealth();
  }

  /**
   * Check LangGraph health status
   */
  private async checkHealth(): Promise<void> {
    if (!this.isEnabled) {
      this.healthStatus = false;
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`);
      this.healthStatus = response.ok;
    } catch (error) {
      console.warn('LangGraph health check failed:', error);
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
      console.log('LangGraph unavailable, using mock preference questions');
      return this.getMockPreferenceQuestions(destination);
    }

    try {
      const response = await fetch(`${this.baseUrl}/graphs/user_intake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          start_date: startDate,
          end_date: endDate,
          travelers,
          budget: budget || 5000,
        }),
      });

      if (!response.ok) {
        throw new Error(`LangGraph request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data?.questions) {
        return result.data.questions;
      }

      throw new Error('Invalid response format from LangGraph');
    } catch (error) {
      console.error('LangGraph preference generation failed:', error);
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
      console.log('LangGraph unavailable, using mock search parameters');
      return this.getMockSearchParameters(preferences);
    }

    try {
      const response = await fetch(`${this.baseUrl}/graphs/search_coordination`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error(`LangGraph request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && this.isValidSearchParameters(result.data)) {
        return result.data;
      }

      throw new Error('Invalid search parameters from LangGraph');
    } catch (error) {
      console.error('LangGraph search coordination failed:', error);
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
      console.log('LangGraph unavailable, using mock booking decisions');
      return this.getMockBookingDecisions(searchResults);
    }

    try {
      const response = await fetch(`${this.baseUrl}/graphs/booking_decisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_results: searchResults,
          preferences: preferences,
        }),
      });

      if (!response.ok) {
        throw new Error(`LangGraph request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && typeof result.data.confidence_score === 'number') {
        return result.data;
      }

      throw new Error('Invalid booking decisions from LangGraph');
    } catch (error) {
      console.error('LangGraph booking processing failed:', error);
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
      console.log('LangGraph unavailable, using mock itinerary');
      return this.getMockItinerary(bookings, preferences);
    }

    try {
      const response = await fetch(`${this.baseUrl}/graphs/itinerary_generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookings,
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error(`LangGraph request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data?.title && result.data?.days) {
        return result.data;
      }

      throw new Error('Invalid itinerary from LangGraph');
    } catch (error) {
      console.error('LangGraph itinerary generation failed:', error);
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
    graphs_available: string[];
    version?: string;
  }> {
    const status = {
      enabled: this.isEnabled,
      healthy: this.healthStatus,
      graphs_available: [] as string[],
      version: undefined as string | undefined,
    };

    if (this.isEnabled && this.healthStatus) {
      try {
        const response = await fetch(`${this.baseUrl}/graphs/status`);
        if (response.ok) {
          const statusData = await response.json();
          status.graphs_available = Object.keys(statusData.graphs || {});
        }

        const rootResponse = await fetch(`${this.baseUrl}/`);
        if (rootResponse.ok) {
          const rootData = await rootResponse.json();
          status.version = rootData.version;
        }
      } catch (error) {
        console.error('Failed to get LangGraph status:', error);
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
      data.search_strategy &&
      typeof data.flight_search.passengers === 'number'
    );
  }

  /**
   * Fallback mock methods (same as original langflow service)
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
        amenities_priority: ['wifi', 'breakfast', 'gym'],
        location_preference: 'city_center',
      },
      activity_search: {
        destination: preferences.destination,
        interests: preferences.interests || ['culture', 'sightseeing'],
        duration: 'any',
        price_sensitivity: 'moderate',
        group_suitability: preferences.travelers > 2 ? 'group' : 'couple',
      },
      search_strategy: {
        priority_order: ['flights', 'hotels', 'activities'],
        flexibility: {
          dates: 'moderate',
          budget: 'moderate',
        },
        booking_timing: 'planned',
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
      total_estimated_cost: 2500,
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
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);
        
        return {
          day: i + 1,
          date: dayDate.toISOString().split('T')[0],
          day_name: dayDate.toLocaleDateString('en-US', { weekday: 'long' }),
          theme: i === 0 ? 'Arrival & Exploration' : i === days - 1 ? 'Final Day' : 'Exploration',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Morning exploration',
              location: preferences.destination,
              duration: '3 hours',
              type: 'sightseeing',
              notes: 'Start the day with local landmarks'
            },
            {
              time: '2:00 PM',
              activity: 'Afternoon activities',
              location: preferences.destination,
              duration: '3 hours',
              type: 'culture',
              notes: 'Cultural experiences and local cuisine'
            }
          ],
          meals: [
            {
              time: '12:00 PM',
              meal: 'Lunch',
              restaurant: 'Local Restaurant',
              cuisine: 'Local',
              location: preferences.destination
            },
            {
              time: '7:00 PM',
              meal: 'Dinner',
              restaurant: 'Traditional Restaurant',
              cuisine: 'Local',
              location: preferences.destination
            }
          ],
          transportation: 'Walking, Public transport',
          estimated_cost: 150,
          energy_level: 'moderate'
        };
      }),
      packing_list: [
        'Comfortable walking shoes',
        'Weather-appropriate clothing',
        'Camera',
        'Portable charger',
        'Travel documents',
        'Universal adapter',
        'Sunscreen',
        'Light backpack'
      ],
      local_info: {
        currency: 'Local Currency',
        language: 'Local Language',
        emergency_numbers: ['Emergency Services'],
        cultural_tips: [
          'Respect local customs and traditions',
          'Learn basic phrases in the local language',
          'Dress appropriately for cultural sites',
          'Be patient and polite with locals'
        ],
        transportation_tips: [
          'Use public transportation when possible',
          'Keep transportation cards handy',
          'Download offline maps'
        ]
      }
    };
  }
}

// Singleton instance
export const travelLangGraphService = new TravelLangGraphService(); 