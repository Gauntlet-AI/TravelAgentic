import { NextRequest, NextResponse } from 'next/server'

/**
 * Flight search parameters interface
 */
interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
  cabin: 'economy' | 'premium' | 'business' | 'first'
}

/**
 * Flight result interface
 */
interface FlightResult {
  id: string
  airline: string
  flightNumber: string
  origin: string
  destination: string
  departure: string
  arrival: string
  duration: string
  price: number
  currency: string
  stops: number
  source: 'api' | 'browser' | 'voice' | 'manual'
}

/**
 * 5-Layer Fallback System for Flight Search
 */
class FlightSearchOrchestrator {
  async search(params: FlightSearchParams): Promise<FlightResult[]> {
    try {
      // Layer 1: Primary API (3 retries)
      return await this.primaryApiSearch(params)
    } catch (error) {
      console.log('Primary API failed, trying secondary API')
      
      try {
        // Layer 2: Secondary API
        return await this.secondaryApiSearch(params)
      } catch (error) {
        console.log('Secondary API failed, trying browser automation')
        
        try {
          // Layer 3: Browser Automation
          return await this.browserSearch(params)
        } catch (error) {
          console.log('Browser automation failed, trying voice calling')
          
          try {
            // Layer 4: Voice Calling (if enabled)
            return await this.voiceSearch(params)
          } catch (error) {
            console.log('Voice calling failed, requesting manual input')
            
            // Layer 5: Manual Input
            return await this.manualSearch(params)
          }
        }
      }
    }
  }

  private async primaryApiSearch(params: FlightSearchParams): Promise<FlightResult[]> {
    // Mock implementation for Phase 1
    if (process.env.USE_MOCK_APIS === 'true') {
      return this.mockFlightSearch(params)
    }
    
    // TODO: Implement Tequila API integration in Phase 2
    throw new Error('Primary API not implemented yet')
  }

  private async secondaryApiSearch(params: FlightSearchParams): Promise<FlightResult[]> {
    // TODO: Implement alternative flight API
    throw new Error('Secondary API not implemented yet')
  }

  private async browserSearch(params: FlightSearchParams): Promise<FlightResult[]> {
    // TODO: Implement browser automation with Playwright + browser-use
    throw new Error('Browser automation not implemented yet')
  }

  private async voiceSearch(params: FlightSearchParams): Promise<FlightResult[]> {
    // TODO: Implement voice calling with Twilio + ElevenLabs
    throw new Error('Voice calling not implemented yet')
  }

  private async manualSearch(params: FlightSearchParams): Promise<FlightResult[]> {
    // Return guidance for manual booking
    return [{
      id: 'manual-booking',
      airline: 'Manual Booking Required',
      flightNumber: '',
      origin: params.origin,
      destination: params.destination,
      departure: params.departureDate,
      arrival: params.departureDate,
      duration: '',
      price: 0,
      currency: 'USD',
      stops: 0,
      source: 'manual'
    }]
  }

  private async mockFlightSearch(params: FlightSearchParams): Promise<FlightResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return [
      {
        id: '1',
        airline: 'American Airlines',
        flightNumber: 'AA1234',
        origin: params.origin,
        destination: params.destination,
        departure: `${params.departureDate}T08:00:00Z`,
        arrival: `${params.departureDate}T12:00:00Z`,
        duration: '4h 0m',
        price: 299,
        currency: 'USD',
        stops: 0,
        source: 'api'
      },
      {
        id: '2',
        airline: 'Delta Air Lines',
        flightNumber: 'DL5678',
        origin: params.origin,
        destination: params.destination,
        departure: `${params.departureDate}T14:00:00Z`,
        arrival: `${params.departureDate}T18:30:00Z`,
        duration: '4h 30m',
        price: 359,
        currency: 'USD',
        stops: 1,
        source: 'api'
      }
    ]
  }
}

/**
 * Standard POST endpoint for flight search
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FlightSearchParams
    
    // Validate required parameters
    if (!body.origin || !body.destination || !body.departureDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: origin, destination, departureDate'
      }, { status: 400 })
    }

    const orchestrator = new FlightSearchOrchestrator()
    const flights = await orchestrator.search(body)
    
    return NextResponse.json({
      success: true,
      data: flights,
      fallbackUsed: flights[0]?.source || 'api'
    })
  } catch (error) {
    console.error('Flight search error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error during flight search'
    }, { status: 500 })
  }
}

/**
 * Streaming endpoint for real-time flight search results
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Check if streaming is requested
  if (searchParams.get('stream') !== 'true') {
    return NextResponse.json({
      error: 'This endpoint requires streaming. Add ?stream=true'
    }, { status: 400 })
  }

  // Extract search parameters
  const params: FlightSearchParams = {
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    departureDate: searchParams.get('departureDate') || '',
    returnDate: searchParams.get('returnDate') || undefined,
    passengers: parseInt(searchParams.get('passengers') || '1'),
    cabin: (searchParams.get('cabin') as any) || 'economy'
  }

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const orchestrator = new FlightSearchOrchestrator()
        
        // Send initial status
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ 
            type: 'status', 
            message: 'Starting flight search...' 
          })}\n\n`)
        )

        // Get flights (in real implementation, this would stream results as they come)
        const flights = await orchestrator.search(params)
        
        // Stream each flight result
        for (const flight of flights) {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ 
              type: 'flight', 
              data: flight 
            })}\n\n`)
          )
          
          // Small delay to simulate real-time results
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        // Send completion status
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ 
            type: 'complete', 
            totalResults: flights.length,
            fallbackUsed: flights[0]?.source || 'api'
          })}\n\n`)
        )
        
        controller.close()
      } catch (error) {
        console.error('Streaming flight search error:', error)
        
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ 
            type: 'error', 
            message: 'Flight search failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`)
        )
        
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
} 