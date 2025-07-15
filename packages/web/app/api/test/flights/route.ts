import { NextRequest, NextResponse } from 'next/server';
import { FlightParameterMapper } from '@/lib/amadeus/parameter-mapper';
import { LocationService } from '@/lib/amadeus/location-service';

interface FlightSearchRequest {
  message?: string;
  origin?: string;
  destination?: string;
  departure_date?: string;
  return_date?: string;
  travelers?: number;
  budget?: number;
  automation_level?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: FlightSearchRequest = await request.json();
    
    console.log('🚀 [TEST-FLIGHTS] Initial request:', body);

    // Extract flight search parameters from message if provided
    let flightParams = {
      origin: body.origin || '',
      destination: body.destination || '',
      departure_date: body.departure_date || '',
      return_date: body.return_date || '',
      travelers: body.travelers || 2,
      budget: body.budget || 5000,
      automation_level: body.automation_level || 2
    };

    console.log('📋 [TEST-FLIGHTS] Default params:', flightParams);

    // Simple message parsing for flight details
    if (body.message) {
      const message = body.message.toLowerCase();
      console.log('🔍 [TEST-FLIGHTS] Parsing message:', message);
      
      // Extract origin and destination
      const fromMatch = message.match(/from\s+([a-zA-Z\s]+?)(?:\s+to|\s+→|$)/);
      const toMatch = message.match(/to\s+([a-zA-Z\s]+?)(?:\s+|,|$)/);
      
      console.log('📍 [TEST-FLIGHTS] Location matches:', { fromMatch, toMatch });
      
      if (fromMatch) {
        flightParams.origin = fromMatch[1].trim();
        console.log('✈️ [TEST-FLIGHTS] Origin extracted:', flightParams.origin);
      }
      if (toMatch) {
        flightParams.destination = toMatch[1].trim();
        console.log('🎯 [TEST-FLIGHTS] Destination extracted:', flightParams.destination);
      }
      
      // Extract dates
      const dateMatch = message.match(/(?:depart|leaving|on)\s+([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)/);
      if (dateMatch) {
        flightParams.departure_date = dateMatch[1].trim();
        console.log('📅 [TEST-FLIGHTS] Date extracted:', flightParams.departure_date);
      }
      
      // Extract travelers
      const travelersMatch = message.match(/(\d+)\s+(?:people|person|adult|traveler)/);
      if (travelersMatch) {
        flightParams.travelers = parseInt(travelersMatch[1]);
        console.log('👥 [TEST-FLIGHTS] Travelers extracted:', flightParams.travelers);
      }
      
      // Extract budget
      const budgetMatch = message.match(/budget\s+(?:around\s+)?[$]?(\d+)/);
      if (budgetMatch) {
        flightParams.budget = parseInt(budgetMatch[1]);
        console.log('💰 [TEST-FLIGHTS] Budget extracted:', flightParams.budget);
      }
    }

    console.log('📄 [TEST-FLIGHTS] Final parsed params:', flightParams);

    // Create readable stream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        processFlightSearch(flightParams, controller);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Flight test endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processFlightSearch(params: any, controller: ReadableStreamDefaultController) {
  try {
    console.log('🔄 [TEST-FLIGHTS] Starting flight search with params:', params);
    
    // Send initial message
    sendSSEMessage(controller, {
      type: 'flight_search_started',
      message: `Searching flights from ${params.origin} to ${params.destination}...`,
      params: params
    });

    // Convert city names to airport codes using unified location service
    const originCode = LocationService.cityToAirportCode(params.origin);
    const destinationCode = LocationService.cityToAirportCode(params.destination);

    console.log('🌍 [TEST-FLIGHTS] City conversion:', {
      originalOrigin: params.origin,
      convertedOrigin: originCode,
      originalDestination: params.destination,
      convertedDestination: destinationCode
    });

    // Validate required parameters
    if (!params.origin || !params.destination) {
      sendSSEMessage(controller, {
        type: 'error',
        message: 'Please provide both origin and destination cities'
      });
      controller.close();
      return;
    }

    // Check if we could convert to airport codes
    if (originCode === params.origin && params.origin.length !== 3) {
      sendSSEMessage(controller, {
        type: 'error',
        message: `Sorry, I don't recognize "${params.origin}" as a city. Please try a major city like "New York", "London", or "Tokyo"`
      });
      controller.close();
      return;
    }

    if (destinationCode === params.destination && params.destination.length !== 3) {
      sendSSEMessage(controller, {
        type: 'error',
        message: `Sorry, I don't recognize "${params.destination}" as a city. Please try a major city like "New York", "London", or "Tokyo"`
      });
      controller.close();
      return;
    }

    // Send update about city conversion
    sendSSEMessage(controller, {
      type: 'city_conversion',
      message: `Converting ${params.origin} → ${originCode}, ${params.destination} → ${destinationCode}`
    });

    // Build the request body
    const requestBody = {
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: params.departure_date || '2025-09-15',
      returnDate: params.return_date || '2025-09-22',
      adults: params.travelers,
      maxPrice: params.budget,
      max: 10  // Set max results to get more flight options
    };

    console.log('📤 [TEST-FLIGHTS] Request body to /api/flights/search:', requestBody);

    // Call flight search with correct API parameters
    const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/flights/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 [TEST-FLIGHTS] Search response status:', searchResponse.status, searchResponse.statusText);

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ [TEST-FLIGHTS] Flight search failed:', searchResponse.status, errorText);
      throw new Error(`Flight search failed: ${searchResponse.status} - ${errorText}`);
    }

    const flightResults = await searchResponse.json();
    console.log('📊 [TEST-FLIGHTS] Flight search results:', flightResults);
    
    // Process results based on automation level
    // After refactoring, flight offers are at flightResults.data.data
    const flightOffers = flightResults.data?.data || [];
    const processedFlights = processFlightResults(flightOffers, params.automation_level);
    console.log('⚙️ [TEST-FLIGHTS] Processed flights:', processedFlights.length, 'flights');
    console.log('🔍 [TEST-FLIGHTS] Raw flight results structure:', {
      hasData: !!flightResults.data,
      hasFlightOffers: !!flightResults.data?.data,
      dataLength: flightResults.data?.data?.length,
      hasDictionaries: !!flightResults.data?.dictionaries
    });

    // Send flight results
    if (params.automation_level === 2) {
      // Level 2: Present options with recommendation
      const recommendedFlight = processedFlights[0];
      
      sendSSEMessage(controller, {
        type: 'flight_options_presented',
        message: `Found ${processedFlights.length} flight options. Recommended: ${recommendedFlight?.airline || 'Flight'} ${recommendedFlight?.flight_number || ''}`,
        flights: processedFlights,
        recommended: recommendedFlight,
        requires_selection: true,
        automation_level: params.automation_level
      });
    } else {
      // Other automation levels
      sendSSEMessage(controller, {
        type: 'flight_results',
        message: `Found ${processedFlights.length} flight options`,
        flights: processedFlights,
        automation_level: params.automation_level
      });
    }

    // Send completion message
    sendSSEMessage(controller, {
      type: 'flight_search_complete',
      message: 'Flight search completed successfully'
    });

  } catch (error) {
    console.error('Flight search error:', error);
    sendSSEMessage(controller, {
      type: 'error',
      message: `Flight search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  } finally {
    controller.close();
  }
}

function processFlightResults(flights: any[], automationLevel: number): any[] {
  if (!flights || flights.length === 0) {
    return [];
  }

  // Deduplicate flights by ID
  const seenIds = new Set<string>();
  const deduplicatedFlights = flights.filter(flight => {
    if (flight.id && seenIds.has(flight.id)) {
      console.log(`🔍 [TEST-FLIGHTS] Removing duplicate flight with ID: ${flight.id}`);
      return false;
    }
    if (flight.id) {
      seenIds.add(flight.id);
    }
    return true;
  });

  console.log(`🔍 [TEST-FLIGHTS] Deduplication: ${flights.length} → ${deduplicatedFlights.length} flights`);

  // Sort flights by price and duration
  const sortedFlights = deduplicatedFlights.sort((a, b) => {
    const priceA = a.price?.total || a.totalPrice || 0;
    const priceB = b.price?.total || b.totalPrice || 0;
    return priceA - priceB;
  });

  // Return based on automation level
  switch (automationLevel) {
    case 1:
      return sortedFlights.slice(0, 10); // Many options for manual selection
    case 2:
      return sortedFlights.slice(0, 5); // Fewer options with recommendation
    case 3:
    case 4:
      return sortedFlights.slice(0, 3); // Few options for auto-selection
    default:
      return sortedFlights.slice(0, 5);
  }
}

function sendSSEMessage(controller: ReadableStreamDefaultController, data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 