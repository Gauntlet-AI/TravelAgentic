import { NextRequest, NextResponse } from 'next/server';
import { LocationService } from '@/lib/amadeus/location-service';

/**
 * POST endpoint for hotel search testing using LangGraph orchestrator
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, automation_level = 2 } = body;

    console.log('🏨 [TEST-HOTELS] Received request:', { message, automation_level });

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        processHotelSearch({ message, automation_level }, controller);
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('❌ [TEST-HOTELS] Request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processHotelSearch(params: any, controller: ReadableStreamDefaultController) {
  const sendSSEMessage = (controller: ReadableStreamDefaultController, data: any) => {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(new TextEncoder().encode(message));
  };

  try {
    // Send initial message
    sendSSEMessage(controller, {
      type: 'hotel_search_started',
      message: `Searching hotels for: ${params.message}...`,
      params: {
        message: params.message,
        automation_level: params.automation_level
      }
    });

    // Parse the message for hotel search parameters
    const parsedParams = parseHotelMessage(params.message);
    console.log('🏨 [TEST-HOTELS] Parsed params:', parsedParams);

    // Convert city name to city code
    const cityCode = LocationService.cityToCityCode(parsedParams.location);
    if (!cityCode) {
      sendSSEMessage(controller, {
        type: 'error',
        message: `Sorry, I don't recognize "${parsedParams.location}" as a city. Please try a major city like "New York", "London", or "Paris"`
      });
      controller.close();
      return;
    }

    // Send update about city conversion
    sendSSEMessage(controller, {
      type: 'city_conversion',
      message: `Converting ${parsedParams.location} → ${cityCode}`
    });

    // Build the request body for hotel search
    const requestBody = {
      cityCode: cityCode,
      checkInDate: parsedParams.checkInDate || '2025-09-15',
      checkOutDate: parsedParams.checkOutDate || '2025-09-20',
      adults: parsedParams.guests || 2,
      roomQuantity: 1,
      maxPrice: parsedParams.budget
    };

    console.log('📤 [TEST-HOTELS] Request body to /api/hotels/search:', requestBody);

    // Call hotel search with correct API parameters
    const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/hotels/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 [TEST-HOTELS] Search response status:', searchResponse.status, searchResponse.statusText);

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ [TEST-HOTELS] Hotel search failed:', searchResponse.status, errorText);
      throw new Error(`Hotel search failed: ${searchResponse.status} - ${errorText}`);
    }

    const hotelResults = await searchResponse.json();
    console.log('📊 [TEST-HOTELS] Hotel search results:', hotelResults);
    
    // Process results based on automation level
    const hotels = hotelResults.data || [];
    const processedHotels = processHotelResults(hotels, params.automation_level);
    console.log('⚙️ [TEST-HOTELS] Processed hotels:', processedHotels.length, 'hotels');

    // Send hotel options
    sendSSEMessage(controller, {
      type: 'hotel_options_presented',
      message: `Found ${processedHotels.length} hotel options. ${processedHotels.length > 0 ? 'Recommended: ' + processedHotels[0]?.name : ''}`,
      hotels: processedHotels,
      recommended: processedHotels[0] || null,
      requires_selection: true,
      automation_level: params.automation_level
    });

    controller.close();
  } catch (error) {
    console.error('❌ [TEST-HOTELS] Error:', error);
    sendSSEMessage(controller, {
      type: 'error',
      message: `Error searching hotels: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    controller.close();
  }
}

function parseHotelMessage(message: string): any {
  // Simple parsing - in production this would be more sophisticated
  const params: any = {
    location: null,
    checkInDate: null,
    checkOutDate: null,
    guests: 2,
    budget: null
  };

  // Extract location
  const locationMatch = message.match(/(?:hotel|stay|accommodation)\s+in\s+([^,]+)/i);
  if (locationMatch && locationMatch[1]) {
    params.location = locationMatch[1].trim();
  }

  // Extract dates - handle different formats
  const dateMatch = message.match(/(\w+\s+\d{1,2}[-–]\d{1,2})/i);
  if (dateMatch && dateMatch[1]) {
    const dateParts = dateMatch[1].split(/[-–]/);
    if (dateParts.length >= 2) {
      // Convert to proper date format
      const year = new Date().getFullYear();
      const month = getMonthNumber(dateParts[0].trim());
      const startDay = dateParts[1].trim();
      
      if (month && startDay) {
        params.checkInDate = `${year}-${month.toString().padStart(2, '0')}-${startDay.padStart(2, '0')}`;
        // Assume 5 night stay if no end date
        const endDay = parseInt(startDay) + 5;
        params.checkOutDate = `${year}-${month.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}`;
      }
    }
  }

  // Extract guests
  const guestsMatch = message.match(/(\d+)\s+guests?/i);
  if (guestsMatch && guestsMatch[1]) {
    params.guests = parseInt(guestsMatch[1]);
  }

  // Extract budget
  const budgetMatch = message.match(/budget\s+\$?(\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    params.budget = parseInt(budgetMatch[1]);
  }

  return params;
}

function getMonthNumber(monthName: string): number | null {
  const months = {
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12
  };
  
  return months[monthName.toLowerCase() as keyof typeof months] || null;
}

function processHotelResults(hotels: any[], automationLevel: number): any[] {
  if (!hotels || hotels.length === 0) {
    return [];
  }

  // Deduplicate hotels by ID
  const seenIds = new Set<string>();
  const deduplicatedHotels = hotels.filter(hotel => {
    if (hotel.id && seenIds.has(hotel.id)) {
      console.log(`🔍 [TEST-HOTELS] Removing duplicate hotel with ID: ${hotel.id}`);
      return false;
    }
    if (hotel.id) {
      seenIds.add(hotel.id);
    }
    return true;
  });

  console.log(`🔍 [TEST-HOTELS] Deduplication: ${hotels.length} → ${deduplicatedHotels.length} hotels`);

  // Sort hotels by rating and price
  const sortedHotels = deduplicatedHotels.sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    const priceA = a.price?.total || a.totalPrice || 0;
    const priceB = b.price?.total || b.totalPrice || 0;
    
    // Sort by rating first, then by price
    if (ratingA !== ratingB) {
      return ratingB - ratingA; // Higher rating first
    }
    return priceA - priceB; // Lower price first
  });

  // Return top 5 hotels for automation level 2
  return sortedHotels.slice(0, 5);
} 