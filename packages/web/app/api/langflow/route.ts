/**
 * Langflow API Route for TravelAgentic
 * Proxy requests to Langflow workflows and handle travel planning actions
 */

import { travelLangflowService } from '@/lib/langflow-service';
import { NextRequest, NextResponse } from 'next/server';

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

    console.log(`🤖 Langflow API: ${action}`, { 
      destination: data?.destination,
      travelers: data?.travelers 
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
          { error: 'Invalid action. Valid actions: generate_questions, generate_search_parameters, process_booking_decisions, generate_itinerary, get_status' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Langflow API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        action: 'fallback_to_mock'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = await travelLangflowService.getServiceStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Langflow status check error:', error);
    
    return NextResponse.json(
      { 
        enabled: false,
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle dynamic question generation
 */
async function handleGenerateQuestions(data: any): Promise<NextResponse> {
  if (!data?.destination || !data?.startDate || !data?.endDate || !data?.travelers) {
    return NextResponse.json(
      { error: 'Missing required fields: destination, startDate, endDate, travelers' },
      { status: 400 }
    );
  }

  try {
    const questions = await travelLangflowService.generatePreferenceQuestions(
      data.destination,
      data.startDate,
      data.endDate,
      data.travelers,
      data.budget
    );

    return NextResponse.json({ 
      success: true,
      questions,
      count: questions.length,
      destination: data.destination
    });
  } catch (error) {
    console.error('Question generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate questions',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      },
      { status: 500 }
    );
  }
}

/**
 * Handle search parameter generation
 */
async function handleGenerateSearchParameters(data: any): Promise<NextResponse> {
  if (!data?.destination || !data?.startDate || !data?.endDate || !data?.travelers) {
    return NextResponse.json(
      { error: 'Missing required preference fields' },
      { status: 400 }
    );
  }

  try {
    const searchParams = await travelLangflowService.generateSearchParameters(data);

    return NextResponse.json({ 
      success: true,
      searchParams,
      preferences_processed: true
    });
  } catch (error) {
    console.error('Search parameter generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate search parameters',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
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
    const decisions = await travelLangflowService.processBookingDecisions(
      data.searchResults,
      data.preferences
    );

    return NextResponse.json({ 
      success: true,
      decisions,
      confidence_score: decisions.confidence_score,
      has_alternatives: !!(decisions.alternatives)
    });
  } catch (error) {
    console.error('Booking decision processing failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process booking decisions',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
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
    const itinerary = await travelLangflowService.generateItinerary(
      data.bookings,
      data.preferences
    );

    return NextResponse.json({ 
      success: true,
      itinerary,
      days_count: itinerary.days.length,
      title: itinerary.title
    });
  } catch (error) {
    console.error('Itinerary generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate itinerary',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
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
    const status = await travelLangflowService.getServiceStatus();
    
    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get service status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 