import { NextRequest, NextResponse } from 'next/server';
import { getActivityService } from '@/lib/mocks';
import { ActivitySearchParams } from '@/lib/mocks/types';

/**
 * POST endpoint for activity search using the new service architecture
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters
    if (!body.destination) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: destination',
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

    // Convert the request body to match our ActivitySearchParams interface
    const searchParams: ActivitySearchParams = {
      destination: body.destination,
      startDate: body.startDate,
      endDate: body.endDate,
      categories: body.categories || body.preferences, // Support both categories and preferences
      duration: body.duration,
      groupSize: body.groupSize,
      accessibility: body.accessibility,
      timeOfDay: body.timeOfDay,
      filters: body.filters,
      excludeIds: body.excludeIds,
      preferences: body.preferences,
      maxResults: body.maxResults,
    };

    // Get the activity service and perform search
    const activityService = getActivityService();
    const result = await activityService.search(searchParams);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Activity search failed',
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

  // Extract and validate search parameters
  const destination = searchParams.get('destination');

  if (!destination) {
    return NextResponse.json(
      {
        error: 'Missing required parameter: destination',
      },
      { status: 400 }
    );
  }

  // Convert URL search params to ActivitySearchParams
  const activitySearchParams: ActivitySearchParams = {
    destination,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    categories: searchParams.get('categories')?.split(','),
    duration: {
      min: searchParams.get('durationMin') ? parseInt(searchParams.get('durationMin')!) : undefined,
      max: searchParams.get('durationMax') ? parseInt(searchParams.get('durationMax')!) : undefined,
    },
    groupSize: searchParams.get('groupSize') ? parseInt(searchParams.get('groupSize')!) : undefined,
    accessibility: searchParams.get('accessibility')?.split(','),
    timeOfDay: searchParams.get('timeOfDay') as any,
  };

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const activityService = getActivityService();

        // Send initial status
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'status',
              message: 'Starting activity search...',
            })}\n\n`
          )
        );

        // Perform search
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