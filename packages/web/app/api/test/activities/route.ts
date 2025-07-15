import { NextRequest, NextResponse } from 'next/server';
import { LocationService } from '@/lib/amadeus/location-service';

/**
 * POST endpoint for activity search testing using LangGraph orchestrator
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, automation_level = 2 } = body;

    console.log('🎯 [TEST-ACTIVITIES] Received request:', { message, automation_level });

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        processActivitySearch({ message, automation_level }, controller);
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('❌ [TEST-ACTIVITIES] Request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processActivitySearch(params: any, controller: ReadableStreamDefaultController) {
  const sendSSEMessage = (controller: ReadableStreamDefaultController, data: any) => {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(new TextEncoder().encode(message));
  };

  try {
    // Send initial message
    sendSSEMessage(controller, {
      type: 'activity_search_started',
      message: `Searching activities for: ${params.message}...`,
      params: {
        message: params.message,
        automation_level: params.automation_level
      }
    });

    // Parse the message for activity search parameters
    const parsedParams = parseActivityMessage(params.message);
    console.log('🎯 [TEST-ACTIVITIES] Parsed params:', parsedParams);

    // Convert city name to coordinates
    const locationInfo = LocationService.getLocationInfo(parsedParams.location);
    if (!locationInfo || !locationInfo.coordinates) {
      sendSSEMessage(controller, {
        type: 'error',
        message: `Sorry, I don't recognize "${parsedParams.location}" as a city. Please try a major city like "New York", "London", or "Paris"`
      });
      controller.close();
      return;
    }

    // Send update about city conversion
    sendSSEMessage(controller, {
      type: 'city_conversion',
      message: `Converting ${parsedParams.location} → ${locationInfo.coordinates.latitude}, ${locationInfo.coordinates.longitude}`
    });

    // Build the request body for activity search
    const requestBody = {
      latitude: locationInfo.coordinates.latitude,
      longitude: locationInfo.coordinates.longitude,
      destination: parsedParams.location,
      startDate: parsedParams.startDate || '2025-09-15',
      endDate: parsedParams.endDate || '2025-09-20',
      categories: parsedParams.categories || ['cultural', 'food'],
      groupSize: parsedParams.groupSize || 2,
      maxPrice: parsedParams.budget,
      minimumDuration: parsedParams.duration?.min ? `${parsedParams.duration.min}H` : undefined,
      maximumDuration: parsedParams.duration?.max ? `${parsedParams.duration.max}H` : undefined,
      radius: 50
    };

    console.log('📤 [TEST-ACTIVITIES] Request body to /api/activities/search:', requestBody);

    // Call activity search with correct API parameters
    const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/activities/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 [TEST-ACTIVITIES] Search response status:', searchResponse.status, searchResponse.statusText);

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ [TEST-ACTIVITIES] Activity search failed:', searchResponse.status, errorText);
      throw new Error(`Activity search failed: ${searchResponse.status} - ${errorText}`);
    }

    const activityResults = await searchResponse.json();
    console.log('📊 [TEST-ACTIVITIES] Activity search results:', activityResults);
    
    // Process results based on automation level
    const activities = activityResults.data || [];
    const processedActivities = processActivityResults(activities, params.automation_level);
    console.log('⚙️ [TEST-ACTIVITIES] Processed activities:', processedActivities.length, 'activities');

    // Send activity options
    sendSSEMessage(controller, {
      type: 'activity_options_presented',
      message: `Found ${processedActivities.length} activity options. ${processedActivities.length > 0 ? 'Recommended: ' + processedActivities[0]?.name : ''}`,
      activities: processedActivities,
      recommended: processedActivities[0] || null,
      requires_selection: true,
      automation_level: params.automation_level
    });

    controller.close();
  } catch (error) {
    console.error('❌ [TEST-ACTIVITIES] Error:', error);
    sendSSEMessage(controller, {
      type: 'error',
      message: `Error searching activities: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    controller.close();
  }
}

function parseActivityMessage(message: string): any {
  // Simple parsing - in production this would be more sophisticated
  const params: any = {
    location: null,
    startDate: null,
    endDate: null,
    categories: [],
    groupSize: 2,
    budget: null,
    duration: null
  };

  // Extract location
  const locationMatch = message.match(/(?:activities|experiences|things to do)\s+in\s+([^,]+)/i);
  if (locationMatch && locationMatch[1]) {
    params.location = locationMatch[1].trim();
  }

  // Extract dates
  const dateMatch = message.match(/(\w+\s+\d{1,2})\s*-\s*(\w+\s+\d{1,2})/i);
  if (dateMatch) {
    params.startDate = parseDate(dateMatch[1]);
    params.endDate = parseDate(dateMatch[2]);
  }

  // Extract categories/interests
  const categoryKeywords = {
    'museums': ['cultural', 'sightseeing'],
    'food': ['food', 'culinary'],
    'outdoor': ['outdoor', 'adventure'],
    'shopping': ['shopping'],
    'entertainment': ['entertainment'],
    'nightlife': ['entertainment'],
    'cultural': ['cultural', 'sightseeing'],
    'adventure': ['adventure', 'outdoor'],
    'relaxation': ['relaxation', 'wellness']
  };

  const lowerMessage = message.toLowerCase();
  const detectedCategories = [];
  
  for (const [keyword, categories] of Object.entries(categoryKeywords)) {
    if (lowerMessage.includes(keyword)) {
      detectedCategories.push(...categories);
    }
  }

  // Remove duplicates and set categories
  params.categories = [...new Set(detectedCategories)];

  // Extract group size
  const groupMatch = message.match(/(\d+)\s+(?:people|guests|travelers|persons)/i);
  if (groupMatch) {
    params.groupSize = parseInt(groupMatch[1]);
  }

  // Extract budget
  const budgetMatch = message.match(/budget\s+\$(\d+)/i);
  if (budgetMatch) {
    params.budget = parseInt(budgetMatch[1]);
  }

  return params;
}

function parseDate(dateStr: string): string {
  // Simple date parsing - convert "September 15" to "2025-09-15"
  const monthMap: { [key: string]: string } = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12'
  };

  const match = dateStr.match(/(\w+)\s+(\d{1,2})/i);
  if (match) {
    const month = monthMap[match[1].toLowerCase()];
    const day = match[2].padStart(2, '0');
    if (month) {
      return `2025-${month}-${day}`;
    }
  }

  return '2025-09-15'; // Default fallback
}

function processActivityResults(activities: any[], automationLevel: number): any[] {
  if (!activities || activities.length === 0) {
    return [];
  }

  // For automation level 2, present all options but highlight the first as recommended
  return activities.slice(0, 10).map((activity, index) => ({
    id: activity.id || `activity-${index}`,
    name: activity.name || activity.title || `Activity ${index + 1}`,
    description: activity.description || activity.summary || 'No description available',
    price: activity.price || activity.cost || Math.floor(Math.random() * 100) + 20,
    totalPrice: activity.totalPrice || activity.price || activity.cost || Math.floor(Math.random() * 100) + 20,
    location: activity.location || activity.venue || { address: 'City center' },
    rating: activity.rating || { score: Math.floor(Math.random() * 50) + 40 / 10, reviewCount: Math.floor(Math.random() * 500) + 50 },
    duration: activity.duration || `${Math.floor(Math.random() * 4) + 1} hours`,
    category: activity.category || activity.type || 'cultural',
    highlights: activity.highlights || activity.features || ['Popular attraction', 'Great reviews']
  }));
} 