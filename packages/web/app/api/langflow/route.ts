/**
 * LangGraph API Route for TravelAgentic
 * Proxy requests to LangGraph workflows and handle travel planning actions
 */
import { NextRequest, NextResponse } from 'next/server';

import { langGraphService } from '@/lib/langgraph-service';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    console.log(`🤖 LangGraph API: ${action}`, {
      destination: data?.destination,
      travelers: data?.travelers,
    });

    switch (action) {
      case 'generate_questions':
        return await handleGenerateQuestions(data);

      case 'generate_search_parameters':
        return await handleGenerateSearchParameters(data);

      case 'process_booking_decisions':
        return await handleProcessBookingDecisions(data);

      case 'generate_itinerary':
        return await handleGenerateItinerary(data);

      case 'get_status':
        return await handleGetStatus();

      default:
        return NextResponse.json(
          {
            error:
              'Invalid action. Valid actions: generate_questions, generate_search_parameters, process_booking_decisions, generate_itinerary, get_status',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Langflow API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        action: 'fallback_to_mock',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const isHealthy = await langGraphService.healthCheck();
    const status = {
      enabled: isHealthy,
      service: 'langgraph',
      status: isHealthy ? 'operational' : 'error'
    };
    return NextResponse.json(status);
  } catch (error) {
    console.error('LangGraph status check error:', error);

    return NextResponse.json(
      {
        enabled: false,
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle dynamic question generation
 */
async function handleGenerateQuestions(data: any): Promise<NextResponse> {
  if (
    !data?.destination ||
    !data?.startDate ||
    !data?.endDate ||
    !data?.travelers
  ) {
    return NextResponse.json(
      {
        error:
          'Missing required fields: destination, startDate, endDate, travelers',
      },
      { status: 400 }
    );
  }

  try {
    // Call LangGraph orchestrator to generate preference questions
    const request = {
      message: `Generate preference questions for travel to ${data.destination} from ${data.startDate} to ${data.endDate} for ${data.travelers} travelers with budget $${data.budget}`,
      automation_level: 1,
      action: 'start' as const,
      destination: data.destination,
      start_date: data.startDate,
      end_date: data.endDate,
      travelers: data.travelers,
      budget: data.budget
    };

    const response = await langGraphService.invokeOrchestrator(request);
    
    if (!response.success) {
      throw new Error(response.data?.error || 'Failed to generate preference questions');
    }

    const questions = response.data?.questions || [];
    
    return NextResponse.json({
      success: true,
      questions,
      count: questions.length,
      destination: data.destination,
    });
  } catch (error) {
    console.error('Question generation failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate questions',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle search parameter generation
 */
async function handleGenerateSearchParameters(
  data: any
): Promise<NextResponse> {
  if (
    !data?.destination ||
    !data?.startDate ||
    !data?.endDate ||
    !data?.travelers
  ) {
    return NextResponse.json(
      { error: 'Missing required preference fields' },
      { status: 400 }
    );
  }

  try {
    // Call LangGraph orchestrator to process preferences and generate search parameters
    const request = {
      message: `Process travel preferences and generate search parameters for ${data.destination}`,
      automation_level: data.automation_level || 1,
      action: 'continue' as const,
      user_preferences: data.preferences || data,
      destination: data.destination,
      start_date: data.startDate,
      end_date: data.endDate,
      travelers: data.travelers,
      budget: data.budget
    };

    const response = await langGraphService.invokeOrchestrator(request);
    
    if (!response.success) {
      throw new Error(response.data?.error || 'Failed to generate search parameters');
    }

    const searchParams = response.data?.search_parameters || response.data;
    
    return NextResponse.json({
      success: true,
      searchParams,
      preferences_processed: true,
    });
  } catch (error) {
    console.error('Search parameter generation failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate search parameters',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle booking decision processing
 */
async function handleProcessBookingDecisions(data: any): Promise<NextResponse> {
  if (!data?.searchResults || !data?.preferences) {
    return NextResponse.json(
      { error: 'Missing searchResults or preferences' },
      { status: 400 }
    );
  }

  try {
    // Call LangGraph orchestrator to process booking decisions
    const request = {
      message: `Process search results and make booking recommendations based on user preferences`,
      automation_level: data.automation_level || 1,
      action: 'continue' as const,
      user_preferences: {
        search_results: data.searchResults,
        preferences: data.preferences,
        budget: data.budget
      }
    };

    const response = await langGraphService.invokeOrchestrator(request);
    
    if (!response.success) {
      throw new Error(response.data?.error || 'Failed to process booking decisions');
    }

    const decisions = response.data?.booking_decisions || response.data;
    
    return NextResponse.json({
      success: true,
      decisions,
      confidence_score: decisions.confidence_score || 0,
      has_alternatives: !!decisions.alternatives,
    });
  } catch (error) {
    console.error('Booking decision processing failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to process booking decisions',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle itinerary generation
 */
async function handleGenerateItinerary(data: any): Promise<NextResponse> {
  if (!data?.bookings || !data?.preferences) {
    return NextResponse.json(
      { error: 'Missing bookings or preferences' },
      { status: 400 }
    );
  }

  try {
    // Call LangGraph orchestrator to generate detailed itinerary
    const request = {
      message: `Generate detailed travel itinerary based on confirmed bookings and preferences`,
      automation_level: data.automation_level || 1,
      action: 'continue' as const,
      user_preferences: {
        bookings: data.bookings,
        preferences: data.preferences,
        destination: data.bookings.destination,
        start_date: data.bookings.startDate,
        end_date: data.bookings.endDate
      }
    };

    const response = await langGraphService.invokeOrchestrator(request);
    
    if (!response.success) {
      throw new Error(response.data?.error || 'Failed to generate itinerary');
    }

    const itinerary = response.data?.itinerary || response.data;
    
    return NextResponse.json({
      success: true,
      itinerary,
      days_count: itinerary.days?.length || 0,
      title: itinerary.title || `Trip to ${data.bookings.destination}`,
    });
  } catch (error) {
    console.error('Itinerary generation failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate itinerary',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle service status check
 */
async function handleGetStatus(): Promise<NextResponse> {
  try {
    const isHealthy = await langGraphService.healthCheck();
    const status = {
      enabled: isHealthy,
      service: 'langgraph',
      status: isHealthy ? 'operational' : 'error',
      components: {
        orchestrator: isHealthy ? 'healthy' : 'unhealthy',
        api: 'healthy'
      }
    };

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Status check failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get service status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
