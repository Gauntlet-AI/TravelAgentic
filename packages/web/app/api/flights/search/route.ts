import { NextRequest, NextResponse } from 'next/server';
import { getFlightService } from '@/lib/mocks';
import { FlightSearchParams } from '@/lib/mocks/types';

/**
 * POST endpoint for flight search using the new service architecture
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters
    if (!body.origin || !body.destination || !body.departureDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: origin, destination, departureDate',
        },
        { status: 400 }
      );
    }

    // Convert the request body to match our FlightSearchParams interface
    const searchParams: FlightSearchParams = {
      origin: body.origin,
      destination: body.destination,
      departureDate: body.departureDate,
      returnDate: body.returnDate,
      passengers: {
        adults: body.passengers?.adults || body.passengers || 1,
        children: body.passengers?.children || 0,
        infants: body.passengers?.infants || 0,
      },
      cabin: body.cabin || 'economy',
      directFlightsOnly: body.directFlightsOnly,
      maxStops: body.maxStops,
      preferredAirlines: body.preferredAirlines,
      filters: body.filters,
    };

    // Get the flight service and perform search
    const flightService = getFlightService();
    const result = await flightService.search(searchParams);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Flight search failed',
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
    console.error('Flight search error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during flight search',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for streaming flight search results
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
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      {
        error: 'Missing required parameters: origin, destination, departureDate',
      },
      { status: 400 }
    );
  }

  // Convert URL search params to FlightSearchParams
  const flightSearchParams: FlightSearchParams = {
    origin,
    destination,
    departureDate,
    returnDate: searchParams.get('returnDate') || undefined,
    passengers: {
      adults: parseInt(searchParams.get('adults') || '1'),
      children: parseInt(searchParams.get('children') || '0'),
      infants: parseInt(searchParams.get('infants') || '0'),
    },
    cabin: (searchParams.get('cabin') as any) || 'economy',
    directFlightsOnly: searchParams.get('directFlightsOnly') === 'true',
    maxStops: searchParams.get('maxStops') ? parseInt(searchParams.get('maxStops')!) : undefined,
  };

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const flightService = getFlightService();

        // Send initial status
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'status',
              message: 'Starting flight search...',
            })}\n\n`
          )
        );

        // Perform search
        const result = await flightService.search(flightSearchParams);

        if (!result.success) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: 'error',
                message: result.error || 'Flight search failed',
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // Stream each flight result
        if (result.data) {
          for (const flight of result.data) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  type: 'flight',
                  data: flight,
                })}\n\n`
              )
            );

            // Small delay to simulate real-time results
            await new Promise((resolve) => setTimeout(resolve, 300));
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
        console.error('Streaming flight search error:', error);

        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'error',
              message: 'Flight search failed',
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
