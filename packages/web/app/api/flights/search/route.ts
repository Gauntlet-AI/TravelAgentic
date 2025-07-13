import { NextRequest, NextResponse } from 'next/server';
import { createAmadeusClient, AmadeusFlightService } from '@/lib/amadeus';
import { FlightSearchParams } from '@/lib/mocks/types';

/**
 * POST endpoint for flight search using LangGraph orchestrator with Amadeus integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters (using Amadeus parameter names)
    if (!body.originLocationCode || !body.destinationLocationCode || !body.departureDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: originLocationCode, destinationLocationCode, departureDate',
        },
        { status: 400 }
      );
    }

    // Convert Amadeus API parameters to our internal format
    const searchParams: FlightSearchParams = {
      origin: body.originLocationCode,
      destination: body.destinationLocationCode,
      departureDate: body.departureDate,
      returnDate: body.returnDate,
      passengers: {
        adults: body.adults || 1,
        children: body.children || 0,
        infants: body.infants || 0,
      },
      cabin: body.travelClass?.toLowerCase() || 'economy',
      directFlightsOnly: body.nonStop || false,
      maxStops: body.maxStops,
      preferredAirlines: body.includedAirlineCodes,
      filters: {
        priceRange: body.maxPrice ? [0, body.maxPrice] : undefined,
      },
    };

    // Use Amadeus service directly
    const amadeusClient = createAmadeusClient();
    const flightService = new AmadeusFlightService(amadeusClient);
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

  // Extract and validate search parameters (using Amadeus parameter names)
  const originLocationCode = searchParams.get('originLocationCode');
  const destinationLocationCode = searchParams.get('destinationLocationCode');
  const departureDate = searchParams.get('departureDate');

  if (!originLocationCode || !destinationLocationCode || !departureDate) {
    return NextResponse.json(
      {
        error: 'Missing required parameters: originLocationCode, destinationLocationCode, departureDate',
      },
      { status: 400 }
    );
  }

  // Convert Amadeus URL search params to FlightSearchParams
  const flightSearchParams: FlightSearchParams = {
    origin: originLocationCode,
    destination: destinationLocationCode,
    departureDate,
    returnDate: searchParams.get('returnDate') || undefined,
    passengers: {
      adults: parseInt(searchParams.get('adults') || '1'),
      children: parseInt(searchParams.get('children') || '0'),
      infants: parseInt(searchParams.get('infants') || '0'),
    },
    cabin: (searchParams.get('travelClass')?.toLowerCase() as any) || 'economy',
    directFlightsOnly: searchParams.get('nonStop') === 'true',
    maxStops: searchParams.get('maxStops') ? parseInt(searchParams.get('maxStops')!) : undefined,
    preferredAirlines: searchParams.get('includedAirlineCodes')?.split(','),
    filters: {
      priceRange: searchParams.get('maxPrice') ? [0, parseInt(searchParams.get('maxPrice')!)] : undefined,
    },
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
              message: 'Starting flight search with LangGraph orchestrator...',
            })}\n\n`
          )
        );

        // Use Amadeus service directly
        const amadeusClient = createAmadeusClient();
        const flightService = new AmadeusFlightService(amadeusClient);
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
              source: dataSource,
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
