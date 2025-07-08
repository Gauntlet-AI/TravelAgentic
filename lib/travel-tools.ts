/**
 * Travel Tools for Agentic AI
 * These functions allow the AI to take real actions for travel planning
 */

import { mockFlights, mockHotels, mockActivities, type Flight, type Hotel, type Activity } from "@/lib/mock-data"

export interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers?: number
  cabin?: "economy" | "premium" | "business" | "first"
}

export interface HotelSearchParams {
  destination: string
  checkIn: string
  checkOut: string
  guests?: number
  priceRange?: "budget" | "mid-range" | "luxury" | "any"
}

export interface ActivitySearchParams {
  destination: string
  dates?: string[]
  interests?: string[]
  duration?: "half-day" | "full-day" | "multi-day" | "any"
}

/**
 * Search for flights between two destinations
 * In Phase 1: Uses mock data, Phase 2+: Real APIs with fallback
 */
export async function searchFlights(params: FlightSearchParams): Promise<{
  success: boolean
  data?: Flight[]
  message: string
  source: "mock" | "api" | "browser" | "error"
}> {
  try {
    console.log("🔍 AI is searching for flights:", params)
    
    // Simulate API delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
    
    // Phase 1: Use mock data (USE_MOCK_APIS=true)
    if (process.env.USE_MOCK_APIS !== "false") {
             // Filter mock flights based on search criteria
       const filteredFlights = mockFlights.filter(flight => {
         const matchesRoute = flight.departure.city.toLowerCase().includes(params.origin.toLowerCase()) ||
                             flight.arrival.city.toLowerCase().includes(params.destination.toLowerCase())
         const matchesCabin = !params.cabin || flight.class.toLowerCase() === params.cabin
         return matchesRoute && matchesCabin
       }).slice(0, 5) // Limit to 5 results
      
      // Simulate occasional API failures for testing fallback
      if (Math.random() < 0.1) {
        return {
          success: false,
          message: "Mock API timeout - testing fallback system",
          source: "error"
        }
      }
      
      return {
        success: true,
        data: filteredFlights,
        message: `Found ${filteredFlights.length} flight options from ${params.origin} to ${params.destination}`,
        source: "mock"
      }
    }
    
    // Phase 2+: Real API integration would go here
    // For now, return mock data even when USE_MOCK_APIS=false
    return {
      success: true,
      data: mockFlights.slice(0, 3),
      message: "Flight search completed (real API integration pending)",
      source: "api"
    }
    
     } catch (error) {
     console.error("Flight search error:", error)
     return {
       success: false,
       message: `Flight search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
       source: "error"
     }
   }
}

/**
 * Search for hotels in a destination
 * In Phase 1: Uses mock data, Phase 2+: Real APIs with fallback
 */
export async function searchHotels(params: HotelSearchParams): Promise<{
  success: boolean
  data?: Hotel[]
  message: string
  source: "mock" | "api" | "browser" | "error"
}> {
  try {
    console.log("🏨 AI is searching for hotels:", params)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500))
    
    // Phase 1: Use mock data
    if (process.env.USE_MOCK_APIS !== "false") {
      // Filter hotels based on destination and price range
      let filteredHotels = mockHotels.filter(hotel => 
        hotel.location.toLowerCase().includes(params.destination.toLowerCase())
      )
      
      // Filter by price range if specified
      if (params.priceRange && params.priceRange !== "any") {
        filteredHotels = filteredHotels.filter(hotel => {
          if (params.priceRange === "budget") return hotel.pricePerNight < 150
          if (params.priceRange === "mid-range") return hotel.pricePerNight >= 150 && hotel.pricePerNight <= 300
          if (params.priceRange === "luxury") return hotel.pricePerNight > 300
          return true
        })
      }
      
      // Adjust pricing based on number of guests
      const adjustedHotels = filteredHotels.map(hotel => ({
        ...hotel,
        pricePerNight: hotel.pricePerNight + ((params.guests || 1) - 1) * 25
      })).slice(0, 5)
      
      return {
        success: true,
        data: adjustedHotels,
        message: `Found ${adjustedHotels.length} hotel options in ${params.destination}`,
        source: "mock"
      }
    }
    
    // Phase 2+: Real API integration would go here
    return {
      success: true,
      data: mockHotels.slice(0, 4),
      message: "Hotel search completed (real API integration pending)",
      source: "api"
    }
    
     } catch (error) {
     console.error("Hotel search error:", error)
     return {
       success: false,
       message: `Hotel search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
       source: "error"
     }
   }
}

/**
 * Search for activities and attractions in a destination
 * In Phase 1: Uses mock data, Phase 2+: Real APIs with fallback
 */
export async function searchActivities(params: ActivitySearchParams): Promise<{
  success: boolean
  data?: Activity[]
  message: string
  source: "mock" | "api" | "browser" | "error"
}> {
  try {
    console.log("🎯 AI is searching for activities:", params)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1800 + Math.random() * 1200))
    
    // Phase 1: Use mock data
    if (process.env.USE_MOCK_APIS !== "false") {
      let filteredActivities = mockActivities
      
      // Filter by interests if specified
      if (params.interests && params.interests.length > 0) {
        filteredActivities = mockActivities.filter(activity =>
          activity.category.some(cat => 
            params.interests!.some(interest => 
              cat.toLowerCase().includes(interest.toLowerCase()) ||
              interest.toLowerCase().includes(cat.toLowerCase())
            )
          )
        )
      }
      
      // Limit results
      const selectedActivities = filteredActivities.slice(0, 6)
      
      return {
        success: true,
        data: selectedActivities,
        message: `Found ${selectedActivities.length} activity options in ${params.destination}${params.interests ? ` matching your interests: ${params.interests.join(", ")}` : ""}`,
        source: "mock"
      }
    }
    
    // Phase 2+: Real API integration would go here
    return {
      success: true,
      data: mockActivities.slice(0, 5),
      message: "Activity search completed (real API integration pending)",
      source: "api"
    }
    
     } catch (error) {
     console.error("Activity search error:", error)
     return {
       success: false,
       message: `Activity search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
       source: "error"
     }
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
  private maxRetries = 3
  private fallbackEnabled = process.env.ENABLE_FALLBACK_SYSTEM === "true"
  
  async executeWithFallback<T>(
    primaryFunction: () => Promise<T>,
    fallbackFunction?: () => Promise<T>,
    context?: string
  ): Promise<T> {
    if (!this.fallbackEnabled) {
      return await primaryFunction()
    }
    
    // Try primary function with retries
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempting ${context} (${attempt}/${this.maxRetries})`)
        return await primaryFunction()
             } catch (error) {
         console.warn(`❌ ${context} attempt ${attempt} failed:`, error instanceof Error ? error.message : 'Unknown error')
        
        if (attempt < this.maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }
    
    // Try fallback if available
    if (fallbackFunction) {
      console.log(`🔄 ${context} falling back to alternative method`)
      try {
        return await fallbackFunction()
             } catch (fallbackError) {
         console.error(`❌ ${context} fallback also failed:`, fallbackError instanceof Error ? fallbackError.message : 'Unknown error')
         throw new Error(`All ${context} methods failed`)
       }
    }
    
    throw new Error(`${context} failed after ${this.maxRetries} attempts`)
  }
}

// Export singleton instance
export const fallbackOrchestrator = new TravelFallbackOrchestrator() 