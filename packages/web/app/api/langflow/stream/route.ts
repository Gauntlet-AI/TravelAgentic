/**
 * Langflow Streaming API Route
 * Provides real-time streaming interface to Langflow AI workflows
 * Supports both direct flow execution and coordinated multi-agent building
 */

import { NextRequest, NextResponse } from 'next/server';

interface LangflowStreamRequest {
  flowId: string;
  inputData: any;
  sessionId?: string;
  streamResponse?: boolean;
}

interface LangflowMessage {
  type: 'start' | 'chunk' | 'end' | 'error';
  data: any;
  timestamp: string;
}

/**
 * POST endpoint for streaming Langflow execution
 */
export async function POST(request: NextRequest) {
  try {
    const body: LangflowStreamRequest = await request.json();
    
    if (!body.flowId) {
      return NextResponse.json(
        { error: 'Flow ID is required' },
        { status: 400 }
      );
    }

    // Check if streaming is requested
    const isStreaming = body.streamResponse !== false;

    if (isStreaming) {
      return handleStreamingLangflow(body);
    } else {
      return handleDirectLangflow(body);
    }

  } catch (error) {
    console.error('Langflow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle streaming Langflow execution
 */
async function handleStreamingLangflow(request: LangflowStreamRequest) {
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    start(controller) {
      executeLangflowWithStreaming(request, controller, encoder);
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * Execute Langflow with streaming responses
 */
async function executeLangflowWithStreaming(
  request: LangflowStreamRequest,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  const sendEvent = (message: LangflowMessage) => {
    const eventData = `data: ${JSON.stringify(message)}\n\n`;
    controller.enqueue(encoder.encode(eventData));
  };

  try {
    // Send start event
    sendEvent({
      type: 'start',
      data: { flowId: request.flowId, sessionId: request.sessionId },
      timestamp: new Date().toISOString(),
    });

    // Execute Langflow
    const result = await callLangflowAPI(request.flowId, request.inputData, request.sessionId);

    // Stream the response in chunks
    if (result.isStreaming) {
      // Handle streaming response from Langflow
      await handleLangflowStreamingResponse(result.stream, sendEvent);
    } else {
      // Send complete response as chunks
      const chunks = chunkLangflowResponse(result.data);
      for (const chunk of chunks) {
        sendEvent({
          type: 'chunk',
          data: chunk,
          timestamp: new Date().toISOString(),
        });
        
        // Add small delay between chunks for realistic streaming
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Send end event
    sendEvent({
      type: 'end',
      data: { completed: true },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Langflow streaming error:', error);
    sendEvent({
      type: 'error',
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: new Date().toISOString(),
    });
  } finally {
    // Send completion signal
    const doneData = `data: [DONE]\n\n`;
    controller.enqueue(encoder.encode(doneData));
    controller.close();
  }
}

/**
 * Handle direct (non-streaming) Langflow execution
 */
async function handleDirectLangflow(request: LangflowStreamRequest) {
  try {
    const result = await callLangflowAPI(request.flowId, request.inputData, request.sessionId);
    
    return NextResponse.json({
      success: true,
      data: result.data,
      sessionId: request.sessionId,
      flowId: request.flowId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Direct Langflow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Langflow execution failed',
      },
      { status: 500 }
    );
  }
}

/**
 * Call Langflow API
 */
async function callLangflowAPI(flowId: string, inputData: any, sessionId?: string): Promise<any> {
  const langflowUrl = process.env.LANGFLOW_URL || 'http://localhost:7860';
  const apiKey = process.env.LANGFLOW_API_KEY || '';

  // Check if Langflow is available
  if (!process.env.LANGFLOW_URL && process.env.NODE_ENV === 'development') {
    console.warn('Langflow URL not configured, using fallback simulation');
    return simulateLangflowResponse(flowId, inputData);
  }

  try {
    const endpoint = `${langflowUrl}/api/v1/run/${flowId}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        ...(sessionId && { 'X-Session-ID': sessionId }),
      },
      body: JSON.stringify({
        input_value: typeof inputData === 'string' ? inputData : JSON.stringify(inputData),
        output_type: 'chat',
        input_type: 'chat',
        tweaks: {},
      }),
    });

    if (!response.ok) {
      throw new Error(`Langflow API error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('text/stream') || contentType?.includes('text/event-stream')) {
      // Handle streaming response
      return {
        isStreaming: true,
        stream: response.body,
      };
    } else {
      // Handle regular JSON response
      const data = await response.json();
      return {
        isStreaming: false,
        data: data,
      };
    }

  } catch (error) {
    console.error('Langflow API call failed:', error);
    
    // Fallback to simulation in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Falling back to Langflow simulation');
      return simulateLangflowResponse(flowId, inputData);
    }
    
    throw error;
  }
}

/**
 * Handle streaming response from Langflow
 */
async function handleLangflowStreamingResponse(
  stream: ReadableStream,
  sendEvent: (message: LangflowMessage) => void
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim() && line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            sendEvent({
              type: 'chunk',
              data: data,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Error parsing Langflow stream chunk:', error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Chunk a large Langflow response for streaming
 */
function chunkLangflowResponse(data: any): any[] {
  if (!data) return [];
  
  // If it's a simple response, return as single chunk
  if (typeof data === 'string' || data.outputs?.[0]?.outputs?.[0]?.results?.message?.text) {
    return [data];
  }
  
  // For complex responses, chunk by logical sections
  const chunks = [];
  
  if (data.outputs && Array.isArray(data.outputs)) {
    for (const output of data.outputs) {
      if (output.outputs && Array.isArray(output.outputs)) {
        for (const subOutput of output.outputs) {
          chunks.push(subOutput);
        }
      } else {
        chunks.push(output);
      }
    }
  } else {
    chunks.push(data);
  }
  
  return chunks;
}

/**
 * Simulate Langflow response for development/fallback
 */
async function simulateLangflowResponse(flowId: string, inputData: any): Promise<any> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const flowSimulations = {
    'user_intake_flow': simulateUserIntakeFlow(inputData),
    'search_coordination_flow': simulateSearchCoordinationFlow(inputData),
    'itinerary_optimization_flow': simulateItineraryOptimizationFlow(inputData),
  };
  
  const simulation = flowSimulations[flowId as keyof typeof flowSimulations] || 
                   simulateGenericFlow(flowId, inputData);
  
  return {
    isStreaming: false,
    data: {
      outputs: [{
        outputs: [{
          results: {
            message: {
              text: simulation.text,
              data: simulation.data,
            },
          },
        }],
      }],
      session_id: `sim_${Date.now()}`,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Simulate user intake flow
 */
function simulateUserIntakeFlow(inputData: any) {
  const preferences = JSON.parse(inputData);
  
  return {
    text: "I've analyzed your travel preferences and identified your travel personality.",
    data: {
      travelPersonality: determineTravelPersonality(preferences.preferences),
      budgetCategory: preferences.preferences?.budget || 'mid-range',
      preferredActivities: preferences.preferences?.activityTypes || [],
      accommodationStyle: preferences.preferences?.accommodationType || 'hotel',
      pacePreference: preferences.preferences?.travelStyle || 'balanced',
      recommendations: generatePersonalityRecommendations(preferences.preferences),
    },
  };
}

/**
 * Simulate search coordination flow
 */
function simulateSearchCoordinationFlow(inputData: any) {
  return {
    text: "Coordinating search across multiple agents for optimal results.",
    data: {
      searchStrategy: 'parallel_multi_agent',
      estimatedResults: {
        flights: Math.floor(Math.random() * 15) + 5,
        hotels: Math.floor(Math.random() * 10) + 3,
        activities: Math.floor(Math.random() * 20) + 10,
      },
      searchPriority: ['budget_optimization', 'preference_matching', 'logistics'],
    },
  };
}

/**
 * Simulate itinerary optimization flow
 */
function simulateItineraryOptimizationFlow(inputData: any) {
  return {
    text: "Optimized your itinerary for the best travel experience.",
    data: {
      optimizations: [
        'Minimized travel time between locations',
        'Balanced activity distribution across days',
        'Optimized for weather conditions',
        'Aligned with budget preferences',
      ],
      score: Math.floor(Math.random() * 20) + 80, // 80-100
      timesSaved: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
    },
  };
}

/**
 * Simulate generic flow
 */
function simulateGenericFlow(flowId: string, inputData: any) {
  return {
    text: `Processed ${flowId} successfully with the provided input.`,
    data: {
      flowId,
      inputReceived: true,
      processingTime: Math.floor(Math.random() * 3000) + 1000,
      result: 'success',
    },
  };
}

/**
 * Determine travel personality from preferences
 */
function determineTravelPersonality(preferences: any) {
  if (!preferences) return 'explorer';
  
  const { tripPurpose, travelStyle, activityTypes } = preferences;
  
  if (tripPurpose === 'relaxation') return 'relaxer';
  if (tripPurpose === 'adventure') return 'adventurer';
  if (tripPurpose === 'culture') return 'culture-seeker';
  if (travelStyle === 'luxury') return 'luxury-traveler';
  if (activityTypes?.includes('outdoor')) return 'nature-lover';
  
  return 'explorer';
}

/**
 * Generate personality-based recommendations
 */
function generatePersonalityRecommendations(preferences: any) {
  const personality = determineTravelPersonality(preferences);
  
  const recommendations = {
    relaxer: [
      'Consider spa treatments and wellness activities',
      'Book accommodations with pool and relaxation amenities',
      'Plan fewer activities per day for a leisurely pace',
    ],
    adventurer: [
      'Include outdoor activities and extreme sports',
      'Consider adventure tours and hiking experiences',
      'Book flexible accommodations for spontaneous activities',
    ],
    'culture-seeker': [
      'Visit museums, historical sites, and cultural landmarks',
      'Include local food tours and cultural experiences',
      'Stay in culturally significant or historic accommodations',
    ],
    'luxury-traveler': [
      'Book premium accommodations and first-class transportation',
      'Include exclusive experiences and private tours',
      'Consider fine dining and luxury shopping opportunities',
    ],
    'nature-lover': [
      'Focus on national parks and natural attractions',
      'Include wildlife viewing and outdoor activities',
      'Consider eco-friendly accommodations',
    ],
    explorer: [
      'Mix of cultural, adventure, and relaxation activities',
      'Balance planned activities with free exploration time',
      'Consider local recommendations and hidden gems',
    ],
  };
  
  return recommendations[personality as keyof typeof recommendations] || recommendations.explorer;
} 