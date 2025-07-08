/**
 * Agentic Travel Context Manager
 * Maintains conversation state and improves AI decision-making for travel planning
 */

export interface TravelSession {
  sessionId: string
  userPreferences: UserTravelPreferences
  searchHistory: SearchHistory[]
  currentItinerary: ItineraryState
  conversationContext: string[]
  lastActivity: Date
}

export interface UserTravelPreferences {
  destinations?: string[]
  travelDates?: {
    flexible: boolean
    startDate?: string
    endDate?: string
    duration?: number
  }
  travelers?: {
    adults: number
    children: number
    infants: number
  }
  budget?: {
    total?: number
    perDay?: number
    currency: string
    flexibility: 'strict' | 'moderate' | 'flexible'
  }
  interests?: string[]
  travelStyle?: 'budget' | 'mid-range' | 'luxury' | 'backpacker' | 'business'
  accommodationPreferences?: string[]
  transportationPreferences?: string[]
  dietaryRestrictions?: string[]
  accessibility?: string[]
}

export interface SearchHistory {
  timestamp: Date
  searchType: 'flights' | 'hotels' | 'activities'
  parameters: any
  results: any
  userFeedback?: 'liked' | 'disliked' | 'neutral'
}

export interface ItineraryState {
  selectedFlights?: any[]
  selectedHotels?: any[]
  selectedActivities?: any[]
  estimatedBudget?: number
  status: 'planning' | 'reviewing' | 'booking' | 'confirmed'
}

/**
 * Travel Context Manager for maintaining AI session state
 */
export class AgenticTravelContextManager {
  private sessions = new Map<string, TravelSession>()
  
  /**
   * Get or create a travel session
   */
  getSession(sessionId: string): TravelSession {
    if (!this.sessions.has(sessionId)) {
             this.sessions.set(sessionId, {
         sessionId,
         userPreferences: {
           travelers: { adults: 1, children: 0, infants: 0 },
           budget: { currency: 'USD', flexibility: 'moderate' }
         },
        searchHistory: [],
        currentItinerary: { status: 'planning' },
        conversationContext: [],
        lastActivity: new Date()
      })
    }
    
    const session = this.sessions.get(sessionId)!
    session.lastActivity = new Date()
    return session
  }
  
  /**
   * Update user preferences based on conversation
   */
  updatePreferences(sessionId: string, preferences: Partial<UserTravelPreferences>): void {
    const session = this.getSession(sessionId)
    session.userPreferences = { ...session.userPreferences, ...preferences }
  }
  
  /**
   * Add search to history and learn from patterns
   */
  recordSearch(sessionId: string, searchType: 'flights' | 'hotels' | 'activities', parameters: any, results: any): void {
    const session = this.getSession(sessionId)
    session.searchHistory.push({
      timestamp: new Date(),
      searchType,
      parameters,
      results
    })
    
    // Keep only last 20 searches
    if (session.searchHistory.length > 20) {
      session.searchHistory = session.searchHistory.slice(-20)
    }
  }
  
  /**
   * Get personalized search suggestions based on history and preferences
   */
  getSearchSuggestions(sessionId: string): {
    suggestedDestinations: string[]
    suggestedBudget: { min: number, max: number }
    suggestedActivities: string[]
    confidence: number
  } {
    const session = this.getSession(sessionId)
    const { userPreferences, searchHistory } = session
    
    // Analyze search patterns
    const searchedDestinations = searchHistory
      .filter(s => s.searchType === 'flights')
      .map(s => s.parameters.destination)
      .filter(Boolean)
    
    const activityInterests = searchHistory
      .filter(s => s.searchType === 'activities')
      .flatMap(s => s.parameters.interests || [])
    
    // Budget analysis from hotel searches
    const budgetData = searchHistory
      .filter(s => s.searchType === 'hotels' && s.results.data)
      .flatMap(s => s.results.data.map((hotel: any) => hotel.pricePerNight))
      .filter(price => typeof price === 'number')
    
    const avgBudget = budgetData.length > 0 
      ? budgetData.reduce((a, b) => a + b, 0) / budgetData.length 
      : 150
    
    return {
      suggestedDestinations: [...new Set(searchedDestinations)].slice(0, 5),
      suggestedBudget: {
        min: Math.max(50, avgBudget * 0.7),
        max: avgBudget * 1.5
      },
      suggestedActivities: [...new Set(activityInterests)].slice(0, 8),
      confidence: Math.min(0.9, searchHistory.length * 0.1)
    }
  }
  
  /**
   * Generate context-aware prompt enhancement
   */
  enhancePromptWithContext(sessionId: string, userMessage: string): string {
    const session = this.getSession(sessionId)
    const { userPreferences, searchHistory } = session
    const suggestions = this.getSearchSuggestions(sessionId)
    
    let contextPrompt = userMessage
    
    // Add travel context if available
    if (userPreferences.destinations?.length || userPreferences.travelDates?.startDate) {
      contextPrompt += "\n\nTravel Context:"
      
      if (userPreferences.destinations?.length) {
        contextPrompt += `\n- Interested destinations: ${userPreferences.destinations.join(", ")}`
      }
      
      if (userPreferences.travelDates?.startDate) {
        contextPrompt += `\n- Travel dates: ${userPreferences.travelDates.startDate}`
        if (userPreferences.travelDates.endDate) {
          contextPrompt += ` to ${userPreferences.travelDates.endDate}`
        }
      }
      
      if (userPreferences.travelers) {
        const { adults, children, infants } = userPreferences.travelers
        contextPrompt += `\n- Travelers: ${adults} adult(s)`
        if (children > 0) contextPrompt += `, ${children} child(ren)`
        if (infants > 0) contextPrompt += `, ${infants} infant(s)`
      }
      
      if (userPreferences.budget?.total || userPreferences.budget?.perDay) {
        contextPrompt += `\n- Budget: ${userPreferences.budget.total ? `$${userPreferences.budget.total} total` : `$${userPreferences.budget.perDay}/day`}`
      }
      
      if (userPreferences.interests?.length) {
        contextPrompt += `\n- Interests: ${userPreferences.interests.join(", ")}`
      }
    }
    
    // Add search suggestions if confident enough
    if (suggestions.confidence > 0.3) {
      contextPrompt += "\n\nBased on previous searches:"
      if (suggestions.suggestedDestinations.length > 0) {
        contextPrompt += `\n- Previously searched: ${suggestions.suggestedDestinations.join(", ")}`
      }
      if (suggestions.suggestedActivities.length > 0) {
        contextPrompt += `\n- Activity interests: ${suggestions.suggestedActivities.join(", ")}`
      }
    }
    
    return contextPrompt
  }
  
  /**
   * Clean up old sessions (call periodically)
   */
  cleanupOldSessions(maxAgeHours: number = 24): void {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000)
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < cutoff) {
        this.sessions.delete(sessionId)
      }
    }
  }
}

// Global instance for the application
export const travelContextManager = new AgenticTravelContextManager()

/**
 * Middleware function to enhance AI prompts with travel context
 */
export function enhanceWithTravelContext(sessionId: string, userMessage: string): string {
  return travelContextManager.enhancePromptWithContext(sessionId, userMessage)
}

/**
 * Extract travel preferences from user message using NLP patterns
 */
export function extractTravelPreferencesFromMessage(message: string): Partial<UserTravelPreferences> {
  const preferences: Partial<UserTravelPreferences> = {}
  
  // Extract destinations
  const destinationPatterns = [
    /(?:to|visit|traveling to|going to|trip to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
    /(?:in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
  ]
  
  const destinations = []
  for (const pattern of destinationPatterns) {
    const matches = [...message.matchAll(pattern)]
    destinations.push(...matches.map(m => m[1]))
  }
  
  if (destinations.length > 0) {
    preferences.destinations = [...new Set(destinations)]
  }
  
  // Extract budget
  const budgetMatches = message.match(/\$(\d+(?:,\d{3})*)/g)
  if (budgetMatches) {
    const amounts = budgetMatches.map(b => parseInt(b.replace(/[$,]/g, '')))
    preferences.budget = {
      total: Math.max(...amounts),
      currency: 'USD',
      flexibility: 'moderate'
    }
  }
  
  // Extract traveler count
  const travelerMatches = message.match(/(\d+)\s*(?:people|person|adult|traveler)/gi)
  if (travelerMatches) {
    const count = parseInt(travelerMatches[0])
    preferences.travelers = {
      adults: count,
      children: 0,
      infants: 0
    }
  }
  
  // Extract interests
  const interestKeywords = [
    'beach', 'mountain', 'city', 'culture', 'food', 'adventure', 'relaxation',
    'nightlife', 'museums', 'hiking', 'shopping', 'history', 'art', 'nature',
    'outdoor', 'indoor', 'family', 'romantic', 'business', 'luxury', 'budget'
  ]
  
  const foundInterests = interestKeywords.filter(keyword => 
    message.toLowerCase().includes(keyword)
  )
  
  if (foundInterests.length > 0) {
    preferences.interests = foundInterests
  }
  
  return preferences
} 