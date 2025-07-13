import { NextRequest, NextResponse } from 'next/server';
import { langGraphService } from '@/lib/langgraph-service';
import { ActivitySearchParams } from '@/lib/mocks/types';

/**
 * POST endpoint for activity search using the new service architecture
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

    // Call LangGraph orchestrator for activity search
    const langGraphRequest = {
      message: `Search for activities near ${body.latitude}, ${body.longitude}`,
      automation_level: 1,
      action: 'continue' as const,
      user_preferences: {
        latitude: body.latitude,
        longitude: body.longitude,
        radius: body.radius || 50,
        destination: searchParams.destination,
        start_date: searchParams.startDate,
        end_date: searchParams.endDate,
        categories: searchParams.categories,
        duration: searchParams.duration,
        group_size: searchParams.groupSize,
        accessibility: searchParams.accessibility,
        time_of_day: searchParams.timeOfDay,
        preferences: searchParams.preferences,
        filters: searchParams.filters,
        max_results: searchParams.maxResults
      }
    };

    const response = await langGraphService.invokeOrchestrator(langGraphRequest);
    
    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.data?.error || 'Activity search failed',
        },
        { status: 500 }
      );
    }

    const activities = response.data?.activities || response.data?.results || [];
    const result = {
      success: true,
      data: activities,
      fallbackUsed: false,
      responseTime: response.execution_time || 0
    };

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
              message: 'Starting activity search with LangGraph...',
            })}\n\n`
          )
        );

        // Call LangGraph orchestrator for activity search
        const langGraphRequest = {
          message: `Search for activities near ${latitude}, ${longitude}`,
          automation_level: 1,
          action: 'continue' as const,
          user_preferences: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 50,
            destination: activitySearchParams.destination,
            start_date: activitySearchParams.startDate,
            end_date: activitySearchParams.endDate,
            categories: activitySearchParams.categories,
            duration: activitySearchParams.duration,
            group_size: activitySearchParams.groupSize,
            accessibility: activitySearchParams.accessibility,
            time_of_day: activitySearchParams.timeOfDay,
            preferences: activitySearchParams.preferences,
            filters: activitySearchParams.filters,
            max_results: activitySearchParams.maxResults
          }
        };

        const response = await langGraphService.invokeOrchestrator(langGraphRequest);
        
        if (!response.success) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: 'error',
                message: response.data?.error || 'Activity search failed',
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        const activities = response.data?.activities || response.data?.results || [];
        const result = {
          success: true,
          data: activities,
          fallbackUsed: false,
          responseTime: response.execution_time || 0
        };

        // Result is always successful at this point since we handled errors above
        // Stream activities back to client

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