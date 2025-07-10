import { NextRequest, NextResponse } from 'next/server';
import { getHotelService } from '@/lib/mocks';
import { HotelSearchParams } from '@/lib/mocks/types';

/**
 * POST endpoint for hotel search using the new service architecture
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters
    if (!body.destination || !body.checkIn || !body.checkOut) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: destination, checkIn, checkOut',
        },
        { status: 400 }
      );
    }

    // Validate date logic
    const checkInDate = new Date(body.checkIn);
    const checkOutDate = new Date(body.checkOut);
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

    // Convert the request body to match our HotelSearchParams interface
    const searchParams: HotelSearchParams = {
      destination: body.destination,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: {
        adults: body.guests?.adults || body.adults || 2,
        children: body.guests?.children || body.children || 0,
        rooms: body.guests?.rooms || body.rooms || 1,
      },
      starRating: body.starRating,
      amenities: body.amenities,
      propertyTypes: body.propertyTypes,
      maxDistance: body.maxDistance,
      filters: body.filters,
    };

    // Get the hotel service and perform search
    const hotelService = getHotelService();
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

  // Extract and validate search parameters
  const destination = searchParams.get('destination');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  if (!destination || !checkIn || !checkOut) {
    return NextResponse.json(
      {
        error: 'Missing required parameters: destination, checkIn, checkOut',
      },
      { status: 400 }
    );
  }

  // Convert URL search params to HotelSearchParams
  const hotelSearchParams: HotelSearchParams = {
    destination,
    checkIn,
    checkOut,
    guests: {
      adults: parseInt(searchParams.get('adults') || '2'),
      children: parseInt(searchParams.get('children') || '0'),
      rooms: parseInt(searchParams.get('rooms') || '1'),
    },
    starRating: searchParams.get('starRating')?.split(',').map(Number),
    amenities: searchParams.get('amenities')?.split(','),
    propertyTypes: searchParams.get('propertyTypes')?.split(','),
    maxDistance: searchParams.get('maxDistance') ? parseFloat(searchParams.get('maxDistance')!) : undefined,
  };

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const hotelService = getHotelService();

        // Send initial status
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'status',
              message: 'Starting hotel search...',
            })}\n\n`
          )
        );

        // Perform search
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