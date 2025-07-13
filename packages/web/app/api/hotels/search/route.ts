import { NextRequest, NextResponse } from 'next/server';
import { createAmadeusClient, AmadeusHotelService } from '@/lib/amadeus';
import { HotelSearchParams } from '@/lib/mocks/types';

/**
 * POST endpoint for hotel search using LangGraph orchestrator with Amadeus integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters (using Amadeus parameter names)
    if (!body.cityCode || !body.checkInDate || !body.checkOutDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: cityCode, checkInDate, checkOutDate',
        },
        { status: 400 }
      );
    }

    // Validate date logic
    const checkInDate = new Date(body.checkInDate);
    const checkOutDate = new Date(body.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-in date cannot be in the past',
        },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-out date must be after check-in date',
        },
        { status: 400 }
      );
    }

    // Convert Amadeus API parameters to our internal format
    const searchParams: HotelSearchParams = {
      destination: body.cityCode,
      checkIn: body.checkInDate,
      checkOut: body.checkOutDate,
      guests: {
        adults: body.adults || 2,
        children: body.childAges ? body.childAges.length : 0,
        rooms: body.roomQuantity || 1,
      },
      starRating: body.ratings,
      amenities: body.amenities,
      propertyTypes: body.propertyTypes,
      maxDistance: body.radius,
    };

    // Use Amadeus service directly
    const amadeusClient = createAmadeusClient();
    const hotelService = new AmadeusHotelService(amadeusClient);
    const result = await hotelService.search(searchParams);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Hotel search failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      fallbackUsed: result.fallbackUsed,
      responseTime: result.responseTime,
    });

  } catch (error) {
    console.error('Hotel search error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during hotel search',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for streaming hotel search results
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Check if streaming is requested
  if (searchParams.get('stream') !== 'true') {
    return NextResponse.json(
      {
        error: 'This endpoint requires streaming. Add ?stream=true',
      },
      { status: 400 }
    );
  }

  // Extract and validate search parameters (using Amadeus parameter names)
  const cityCode = searchParams.get('cityCode');
  const checkInDate = searchParams.get('checkInDate');
  const checkOutDate = searchParams.get('checkOutDate');

  if (!cityCode || !checkInDate || !checkOutDate) {
    return NextResponse.json(
      {
        error: 'Missing required parameters: cityCode, checkInDate, checkOutDate',
      },
      { status: 400 }
    );
  }

  // Convert Amadeus URL search params to HotelSearchParams
  const hotelSearchParams: HotelSearchParams = {
    destination: cityCode,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: {
      adults: parseInt(searchParams.get('adults') || '2'),
      children: searchParams.get('childAges') ? searchParams.get('childAges')!.split(',').length : 0,
      rooms: parseInt(searchParams.get('roomQuantity') || '1'),
    },
    starRating: searchParams.get('ratings')?.split(',').map(Number),
    amenities: searchParams.get('amenities')?.split(','),
    propertyTypes: searchParams.get('propertyTypes')?.split(','),
    maxDistance: searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : undefined,
  };

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial status
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'status',
              message: 'Starting hotel search with LangGraph orchestrator...',
            })}\n\n`
          )
        );

        // Use Amadeus service directly
        const amadeusClient = createAmadeusClient();
        const hotelService = new AmadeusHotelService(amadeusClient);
        const result = await hotelService.search(hotelSearchParams);

        if (!result.success) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: 'error',
                message: result.error || 'Hotel search failed',
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // Send source information
        const dataSource = result.data && result.data.length > 0 ? result.data[0].source : 'api';
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'info',
              message: `Using ${dataSource === 'api' ? 'Amadeus API' : 'fallback data'}`,
              source: dataSource,
              fallbackUsed: result.fallbackUsed,
            })}\n\n`
          )
        );

        // Stream each hotel result
        if (result.data) {
          for (const hotel of result.data) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  type: 'hotel',
                  data: hotel,
                })}\n\n`
              )
            );

            // Small delay to simulate real-time results
            await new Promise((resolve) => setTimeout(resolve, 400));
          }
        }

        // Send completion status
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'complete',
              totalResults: result.data?.length || 0,
              source: dataSource,
              fallbackUsed: result.fallbackUsed,
              responseTime: result.responseTime,
            })}\n\n`
          )
        );

        controller.close();
      } catch (error) {
        console.error('Streaming hotel search error:', error);

        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'error',
              message: 'Hotel search failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            })}\n\n`
          )
        );

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
} 