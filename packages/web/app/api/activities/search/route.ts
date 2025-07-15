import { NextRequest, NextResponse } from 'next/server';
import { createAmadeusClient, AmadeusActivityService } from '@/lib/amadeus';
import { ActivitySearchParams } from '@/lib/mocks/types';

/**
 * POST endpoint for activity search using direct Amadeus API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters (using Amadeus parameter names)
    if (!body.latitude || !body.longitude) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: latitude, longitude',
        },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (body.startDate && body.endDate) {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);

      if (endDate <= startDate) {
        return NextResponse.json(
          {
            success: false,
            error: 'End date must be after start date',
          },
          { status: 400 }
        );
      }
    }

    // Convert Amadeus API parameters to our internal format
    const searchParams: ActivitySearchParams = {
      destination: body.destination || `${body.latitude},${body.longitude}`,
      startDate: body.startDate,
      endDate: body.endDate,
      categories: body.categories || body.preferences,
      duration: body.minimumDuration && body.maximumDuration ? {
        min: parseInt(body.minimumDuration.replace('H', '')),
        max: parseInt(body.maximumDuration.replace('H', ''))
      } : undefined,
      groupSize: body.groupSize,
      accessibility: body.accessibility,
      timeOfDay: body.timeOfDay,
      filters: {
        priceRange: body.minimumPrice && body.maximumPrice ? [body.minimumPrice, body.maximumPrice] : undefined,
        ...body.filters
      },
      excludeIds: body.excludeIds,
      preferences: body.preferences,
      maxResults: body.limit || body.maxResults,
    };

    // Use Amadeus service directly
    const amadeusClient = createAmadeusClient();
    const activityService = new AmadeusActivityService(amadeusClient);
    const result = await activityService.search(searchParams);

    return NextResponse.json({
      success: true,
      data: result.data,
      fallbackUsed: result.fallbackUsed,
      responseTime: result.responseTime,
    });

  } catch (error) {
    console.error('Activity search error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during activity search',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for streaming activity search results
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
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');

  if (!latitude || !longitude) {
    return NextResponse.json(
      {
        error: 'Missing required parameters: latitude, longitude',
      },
      { status: 400 }
    );
  }

  // Convert Amadeus URL search params to ActivitySearchParams
  const activitySearchParams: ActivitySearchParams = {
    destination: searchParams.get('destination') || `${latitude},${longitude}`,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    categories: searchParams.get('categories')?.split(','),
    duration: {
      min: searchParams.get('minimumDuration') ? parseInt(searchParams.get('minimumDuration')!.replace('H', '')) : undefined,
      max: searchParams.get('maximumDuration') ? parseInt(searchParams.get('maximumDuration')!.replace('H', '')) : undefined,
    },
    groupSize: searchParams.get('groupSize') ? parseInt(searchParams.get('groupSize')!) : undefined,
    accessibility: searchParams.get('accessibility')?.split(','),
    timeOfDay: searchParams.get('timeOfDay') as any,
    filters: {
      priceRange: searchParams.get('minimumPrice') && searchParams.get('maximumPrice') ? 
        [parseInt(searchParams.get('minimumPrice')!), parseInt(searchParams.get('maximumPrice')!)] : undefined,
    },
    maxResults: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
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
              message: 'Starting activity search with Amadeus API...',
            })}\n\n`
          )
        );

        // Use Amadeus service directly
        const amadeusClient = createAmadeusClient();
        const activityService = new AmadeusActivityService(amadeusClient);
        const result = await activityService.search(activitySearchParams);

        if (!result.success) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: 'error',
                message: result.error || 'Activity search failed',
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // Send source information
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'info',
              message: `Using Amadeus API`,
              source: 'api',
              fallbackUsed: result.fallbackUsed,
            })}\n\n`
          )
        );

        // Stream each activity result
        if (result.data) {
          for (const activity of result.data) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  type: 'activity',
                  data: activity,
                })}\n\n`
              )
            );

            // Small delay to simulate real-time results
            await new Promise((resolve) => setTimeout(resolve, 350));
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
        console.error('Streaming activity search error:', error);

        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'error',
              message: 'Activity search failed',
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