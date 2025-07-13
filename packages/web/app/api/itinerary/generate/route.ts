import { NextRequest, NextResponse } from 'next/server';
import { langGraphService } from '@/lib/langgraph-service';

interface TravelDetails {
  departureLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  adults: number;
  children: number;
  budget?: number;
  preferences?: any;
  activities?: any[];
  accommodation?: any;
  flights?: any;
}

/**
 * POST endpoint for itinerary generation
 * Uses LangGraph orchestrator for intelligent travel planning
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.destination || !body.startDate || !body.endDate) {
      const missingFields = [];
      if (!body.destination) missingFields.push('destination');
      if (!body.startDate) missingFields.push('startDate');
      if (!body.endDate) missingFields.push('endDate');
      
      return NextResponse.json(
        {
          success: false,
          error: `Missing required travel details: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate dates
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

    // Validate travelers
    if (body.travelers && body.travelers < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Number of travelers must be at least 1',
        },
        { status: 400 }
      );
    }

    console.log('Received itinerary generation request:', {
      destination: body.destination,
      departureLocation: body.departureLocation,
      startDate: body.startDate,
      endDate: body.endDate,
      travelers: body.travelers
    });

    // Call LangGraph orchestrator to generate itinerary
    const langGraphRequest = {
      message: `Generate comprehensive travel itinerary from ${body.departureLocation || 'departure location'} to ${body.destination}`,
      automation_level: body.automationLevel || 2,
      action: 'start' as const,
      destination: body.destination,
      start_date: body.startDate,
      end_date: body.endDate,
      travelers: body.travelers || 1,
      budget: body.budget,
      user_preferences: {
        departure_location: body.departureLocation,
        destination: body.destination,
        start_date: body.startDate,
        end_date: body.endDate,
        travelers: body.travelers || 1,
        adults: body.adults || 1,
        children: body.children || 0,
        budget: body.budget,
        preferences: body.preferences || {},
        activities: body.activities || [],
        accommodation: body.accommodation || {},
        flights: body.flights || {}
      }
    };

    const response = await langGraphService.invokeOrchestrator(langGraphRequest);
    
    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.data?.error || 'Failed to generate itinerary',
        },
        { status: 500 }
      );
    }

    const itinerary = response.data?.itinerary || response.data?.items || response.data?.days || [];
    
    // Calculate duration in days
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Format response
    const itineraryResponse = {
      success: true,
      itinerary: itinerary,
      destination: body.destination,
      departureLocation: body.departureLocation,
      startDate: body.startDate,
      endDate: body.endDate,
      totalItems: Array.isArray(itinerary) ? itinerary.length : (itinerary.days?.length || 0),
      totalDays: durationDays,
      generatedAt: new Date().toISOString(),
      executionTime: response.execution_time || 0
    };

    console.log('Successfully generated AI-powered itinerary:', {
      itemsGenerated: itineraryResponse.totalItems,
      totalDays: itineraryResponse.totalDays,
      destination: body.destination,
      executionTime: response.execution_time
    });

    return NextResponse.json(itineraryResponse);

  } catch (error) {
    console.error('Itinerary generation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate itinerary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 