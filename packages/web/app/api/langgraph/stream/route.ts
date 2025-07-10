import { NextRequest, NextResponse } from 'next/server';

interface StreamingSearchRequest {
  destination: string;
  start_date: string;
  end_date: string;
  travelers: number;
  budget?: number;
  automation_level: number;
  user_preferences?: Record<string, any>;
}

interface StreamingUpdate {
  type: string;
  message: string;
  section?: string;
  data?: any;
  progress?: number;
  timestamp: number;
  agent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: StreamingSearchRequest = await request.json();
    
    // Validate required fields
    if (!body.destination || !body.start_date || !body.end_date || !body.travelers) {
      return NextResponse.json(
        { error: 'Missing required fields: destination, start_date, end_date, travelers' },
        { status: 400 }
      );
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Start the streaming search process
        startStreamingSearch(body, controller, encoder);
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Streaming API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function startStreamingSearch(
  request: StreamingSearchRequest,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  try {
    // Send initial status
    sendSSE(controller, encoder, {
      type: 'search_started',
      message: 'Starting parallel search...',
      timestamp: Date.now(),
    });

    // Call LangGraph orchestrator
    const langGraphResponse = await fetch(`${process.env.LANGGRAPH_URL}/orchestrator/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: request.destination,
        start_date: request.start_date,
        end_date: request.end_date,
        travelers: request.travelers,
        budget: request.budget,
        automation_level: request.automation_level,
        user_preferences: request.user_preferences,
      }),
    });

    if (!langGraphResponse.ok) {
      throw new Error(`LangGraph request failed: ${langGraphResponse.statusText}`);
    }

    // If LangGraph supports streaming, we'd read the stream here
    // For now, we'll simulate the streaming process
    await simulateStreamingProcess(request, controller, encoder);

    // Send completion
    sendSSE(controller, encoder, {
      type: 'search_complete',
      message: 'Search completed successfully',
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('Streaming search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    sendSSE(controller, encoder, {
      type: 'error',
      message: `Search failed: ${errorMessage}`,
      timestamp: Date.now(),
    });
  } finally {
    controller.close();
  }
}

async function simulateStreamingProcess(
  request: StreamingSearchRequest,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  // Simulate parallel search phases
  const phases = [
    {
      type: 'parallel_search_start',
      message: 'Launching parallel search agents...',
      progress: 0,
    },
    {
      type: 'flight_search',
      message: 'Searching for flights...',
      section: 'flights',
      agent: 'flight_agent',
      progress: 10,
    },
    {
      type: 'hotel_search',
      message: 'Finding accommodations...',
      section: 'accommodation',
      agent: 'lodging_agent',
      progress: 10,
    },
    {
      type: 'activity_search',
      message: 'Discovering activities...',
      section: 'activities',
      agent: 'activities_agent',
      progress: 10,
    },
    {
      type: 'parallel_agent_complete',
      message: 'Flight search completed',
      agent: 'flight_agent',
      progress: 33,
      data: {
        results_count: 5,
        best_option: {
          airline: 'United Airlines',
          price: 450,
          duration: '5h 30m',
        },
      },
    },
    {
      type: 'parallel_agent_complete',
      message: 'Hotel search completed',
      agent: 'lodging_agent',
      progress: 66,
      data: {
        results_count: 8,
        best_option: {
          name: 'Downtown Hotel',
          price: 120,
          rating: 4.5,
        },
      },
    },
    {
      type: 'parallel_agent_complete',
      message: 'Activity search completed',
      agent: 'activities_agent',
      progress: 100,
      data: {
        results_count: 12,
        best_activities: [
          { name: 'City Tour', price: 45, rating: 4.7 },
          { name: 'Museum Visit', price: 25, rating: 4.3 },
        ],
      },
    },
    {
      type: 'progressive_filter_complete',
      message: 'Applied intelligent filtering',
      progress: 100,
      data: {
        filtered_counts: {
          flights: 3,
          hotels: 5,
          activities: 8,
        },
      },
    },
    {
      type: 'results_aggregation_complete',
      message: 'Created optimal travel combinations',
      progress: 100,
      data: {
        combinations: [
          {
            total_cost: 1200,
            compatibility_score: 0.92,
            flight: { airline: 'United Airlines', price: 450 },
            hotel: { name: 'Downtown Hotel', price: 120 },
            activities: [
              { name: 'City Tour', price: 45 },
              { name: 'Museum Visit', price: 25 },
            ],
          },
        ],
      },
    },
  ];

  // Send updates with realistic delays
  for (const phase of phases) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    
    sendSSE(controller, encoder, {
      ...phase,
      timestamp: Date.now(),
    });
  }
}

function sendSSE(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  data: StreamingUpdate
) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(encoder.encode(message));
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 