/**
 * Itinerary Modification API
 * Processes natural language modification requests and common itinerary changes
 * Supports real-time updates and change tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Types for modification requests
interface ModificationRequest {
  itineraryId: string;
  modificationType: 'natural_language' | 'time_change' | 'replacement' | 'addition' | 'removal';
  request: string; // Natural language request or specific change description
  itemId?: string; // Specific item to modify
  newTime?: string; // For time changes
  replacement?: any; // New item data for replacements
  addition?: any; // New item data for additions
  userId?: string;
  context?: {
    totalDays: number;
    destination: string;
    currentItems: any[];
  };
}

interface ModificationResponse {
  success: boolean;
  modificationId: string;
  changes: ItineraryChange[];
  updatedItinerary: any;
  message: string;
  suggestions?: string[];
  timestamp: string;
}

interface ItineraryChange {
  id: string;
  type: 'modify' | 'add' | 'remove' | 'replace';
  itemId: string;
  before: any;
  after: any;
  timestamp: string;
  reason: string;
}

/**
 * POST /api/itinerary/modify
 * Process itinerary modification requests
 */
export async function POST(request: NextRequest) {
  try {
    const body: ModificationRequest = await request.json();
    
    console.log('Itinerary modify API received request:', body);
    
    // Validate required fields
    if (!body.itineraryId || !body.modificationType || !body.request) {
      console.error('Missing required fields:', { 
        itineraryId: !!body.itineraryId, 
        modificationType: !!body.modificationType, 
        request: !!body.request 
      });
      return NextResponse.json(
        { error: 'Missing required fields: itineraryId, modificationType, request' },
        { status: 400 }
      );
    }

    // For Phase 1, we'll simulate modification processing
    // In later phases, this will integrate with AI services
    const modification = await processModification(body);

    console.log('Itinerary modify API sending response:', modification);

    return NextResponse.json(modification, { status: 200 });
  } catch (error) {
    console.error('Itinerary modification error:', error);
    return NextResponse.json(
      { error: 'Failed to process modification request' },
      { status: 500 }
    );
  }
}

/**
 * Process modification requests using AI and business logic
 */
async function processModification(request: ModificationRequest): Promise<ModificationResponse> {
  const modificationId = generateModificationId();
  const timestamp = new Date().toISOString();

  // Simulate processing time for realistic UX
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  switch (request.modificationType) {
    case 'natural_language':
      return await processNaturalLanguageRequest(request, modificationId, timestamp);
    
    case 'time_change':
      return await processTimeChange(request, modificationId, timestamp);
    
    case 'replacement':
      return await processReplacement(request, modificationId, timestamp);
    
    case 'addition':
      return await processAddition(request, modificationId, timestamp);
    
    case 'removal':
      return await processRemoval(request, modificationId, timestamp);
    
    default:
      throw new Error(`Unsupported modification type: ${request.modificationType}`);
  }
}

/**
 * Process natural language modification requests
 */
async function processNaturalLanguageRequest(
  request: ModificationRequest, 
  modificationId: string, 
  timestamp: string
): Promise<ModificationResponse> {
  
  const mockChanges: ItineraryChange[] = [];
  const naturalRequest = request.request.toLowerCase();
  const context = request.context;
  let responseMessage = '';
  let suggestions: string[] = [];

  // Enhanced keyword-based processing with contextual understanding
  
  // Handle schedule/time requests
  if (naturalRequest.includes('schedule') || naturalRequest.includes('when') || naturalRequest.includes('time')) {
    if (naturalRequest.includes('show') || naturalRequest.includes('current')) {
      responseMessage = generateScheduleOverview(context);
      suggestions = [
        "Move an activity to a different time",
        "Add a restaurant for lunch",
        "Find me something relaxing for tonight",
        "Make tomorrow less busy"
      ];
    } else {
      responseMessage = "I can help you adjust timing for your activities. Which specific activity would you like to reschedule?";
      suggestions = [
        "Move the museum visit to tomorrow",
        "Make dinner earlier",
        "Add more time between activities"
      ];
    }
  }

  // Handle movement/rescheduling
  else if (naturalRequest.includes('move') || naturalRequest.includes('tomorrow') || naturalRequest.includes('earlier') || naturalRequest.includes('later')) {
    // Parse which activity to move
    const activityKeywords = ['museum', 'dinner', 'lunch', 'tour', 'visit', 'activity', 'restaurant'];
    const foundActivity = activityKeywords.find(keyword => naturalRequest.includes(keyword));
    
    if (foundActivity) {
      mockChanges.push({
        id: generateChangeId(),
        type: 'modify',
        itemId: `activity_${foundActivity}`,
        before: { time: '2:00 PM', title: `${foundActivity} activity` },
        after: { time: '11:00 AM', title: `${foundActivity} activity` },
        timestamp,
        reason: `User requested to reschedule ${foundActivity}`
      });
      
      responseMessage = `I've moved your ${foundActivity} activity to an earlier time. The change has been applied to your itinerary.`;
      suggestions = [
        "Add something after lunch",
        "Find me evening entertainment",
        "Make the afternoon more relaxing"
      ];
    } else {
      responseMessage = "I can help you move activities around. Which specific activity would you like to reschedule?";
      suggestions = [
        "Move the museum visit to tomorrow",
        "Make dinner earlier",
        "Switch the order of activities"
      ];
    }
  }

  // Handle additions
  else if (naturalRequest.includes('add') || naturalRequest.includes('find') || naturalRequest.includes('restaurant') || naturalRequest.includes('museum') || naturalRequest.includes('tour')) {
    const activityType = determineActivityType(naturalRequest);
    
    mockChanges.push({
      id: generateChangeId(),
      type: 'add',
      itemId: `new_${activityType}_${Date.now()}`,
      before: null,
      after: { 
        time: '7:00 PM', 
        title: `${activityType} Experience`,
        type: 'activity',
        description: `Added based on your request: ${activityType} activity`
      },
      timestamp,
      reason: `User requested ${activityType} activity`
    });
    
    responseMessage = `I've found a great ${activityType} experience for you and added it to your itinerary. You can view the details in your schedule.`;
    suggestions = [
      "Find something for tomorrow",
      "Add more outdoor activities",
      "Make a day more relaxing",
      "Add a lunch break"
    ];
  }

  // Handle removals
  else if (naturalRequest.includes('remove') || naturalRequest.includes('delete') || naturalRequest.includes('skip') || naturalRequest.includes('cancel')) {
    const activityToRemove = extractActivityFromRequest(naturalRequest);
    
    mockChanges.push({
      id: generateChangeId(),
      type: 'remove',
      itemId: `activity_${activityToRemove}`,
      before: { time: '3:00 PM', title: `${activityToRemove} activity` },
      after: null,
      timestamp,
      reason: `User requested to remove ${activityToRemove}`
    });
    
    responseMessage = `I've removed the ${activityToRemove} from your itinerary. This gives you more free time to explore on your own.`;
    suggestions = [
      "Add something else for that time",
      "Make the day more relaxing",
      "Find a nearby restaurant"
    ];
  }

  // Handle style/mood changes
  else if (naturalRequest.includes('relax') || naturalRequest.includes('peaceful') || naturalRequest.includes('calm')) {
    mockChanges.push({
      id: generateChangeId(),
      type: 'replace',
      itemId: 'busy_activity',
      before: { time: '2:00 PM', title: 'City Walking Tour' },
      after: { time: '2:00 PM', title: 'Spa & Wellness Experience' },
      timestamp,
      reason: 'User requested more relaxing activities'
    });
    
    responseMessage = "I've replaced some of your more active activities with relaxing alternatives. Your itinerary now has a more peaceful pace.";
    suggestions = [
      "Add a nice restaurant for dinner",
      "Find a scenic spot for sunset",
      "Add some free time for rest"
    ];
  }

  // Handle activity preferences
  else if (naturalRequest.includes('cultural') || naturalRequest.includes('outdoor') || naturalRequest.includes('adventure') || naturalRequest.includes('food')) {
    const preference = extractPreferenceFromRequest(naturalRequest);
    
    mockChanges.push({
      id: generateChangeId(),
      type: 'add',
      itemId: `pref_${preference}_${Date.now()}`,
      before: null,
      after: { 
        time: '4:00 PM', 
        title: `${preference} Experience`,
        type: 'activity',
        description: `Perfect ${preference} activity matching your interests`
      },
      timestamp,
      reason: `User requested more ${preference} activities`
    });
    
    responseMessage = `I've added some great ${preference} experiences to your itinerary. These activities align perfectly with your interests.`;
    suggestions = [
      "Find more of the same type",
      "Balance with different activities",
      "Add dining options nearby"
    ];
  }

  // Default/fallback response
  else {
    responseMessage = "I understand you'd like to modify your itinerary. Could you be more specific about what you'd like to change? For example, you can ask me to:\n\n• Move an activity to a different time\n• Add a restaurant or attraction\n• Remove something from your schedule\n• Make a day more relaxing\n• Find activities based on your interests";
    suggestions = [
      "Show me my current schedule",
      "Add a restaurant for dinner",
      "Move something to tomorrow",
      "Make the afternoon more relaxing",
      "Find outdoor activities"
    ];
  }

  return {
    success: mockChanges.length > 0,
    modificationId,
    changes: mockChanges,
    updatedItinerary: mockChanges.length > 0 ? generateMockUpdatedItinerary(mockChanges) : undefined,
    message: responseMessage,
    suggestions,
    timestamp
  };
}

/**
 * Generate a schedule overview for the user
 */
function generateScheduleOverview(context: any): string {
  if (!context || !context.currentItems) {
    return "I don't have access to your current schedule. Please try refreshing the page.";
  }

  const totalDays = context.totalDays || 0;
  const totalActivities = context.currentItems.length || 0;
  const destination = context.destination || 'your destination';

  return `Here's your current itinerary overview:\n\n🗓️ **${totalDays} days** in ${destination}\n🎯 **${totalActivities} activities** planned\n\nYour schedule includes flights, accommodation, and various activities. Would you like me to help you adjust any specific parts of your itinerary?`;
}

/**
 * Determine activity type from natural language request
 */
function determineActivityType(request: string): string {
  const typeMap = {
    'restaurant': ['restaurant', 'food', 'eat', 'dining', 'lunch', 'dinner', 'breakfast'],
    'museum': ['museum', 'gallery', 'art', 'history', 'culture', 'cultural'],
    'tour': ['tour', 'guide', 'walking', 'sightseeing', 'explore'],
    'outdoor': ['outdoor', 'nature', 'park', 'hiking', 'adventure', 'activity'],
    'entertainment': ['show', 'theater', 'music', 'concert', 'entertainment', 'nightlife'],
    'relaxation': ['spa', 'relax', 'massage', 'peaceful', 'calm', 'wellness']
  };

  for (const [type, keywords] of Object.entries(typeMap)) {
    if (keywords.some(keyword => request.includes(keyword))) {
      return type;
    }
  }

  return 'activity';
}

/**
 * Extract activity name from removal request
 */
function extractActivityFromRequest(request: string): string {
  const activities = ['museum', 'tour', 'restaurant', 'dinner', 'lunch', 'visit', 'activity', 'show'];
  const found = activities.find(activity => request.includes(activity));
  return found || 'activity';
}

/**
 * Extract preference from request
 */
function extractPreferenceFromRequest(request: string): string {
  const preferences = ['cultural', 'outdoor', 'adventure', 'food', 'relaxing', 'nature'];
  const found = preferences.find(pref => request.includes(pref));
  return found || 'cultural';
}

/**
 * Process time change requests
 */
async function processTimeChange(
  request: ModificationRequest, 
  modificationId: string, 
  timestamp: string
): Promise<ModificationResponse> {
  
  if (!request.itemId || !request.newTime) {
    throw new Error('Time change requires itemId and newTime');
  }

  const change: ItineraryChange = {
    id: generateChangeId(),
    type: 'modify',
    itemId: request.itemId,
    before: { time: 'Original Time' }, // Would fetch from database
    after: { time: request.newTime },
    timestamp,
    reason: 'User requested time change'
  };

  return {
    success: true,
    modificationId,
    changes: [change],
    updatedItinerary: generateMockUpdatedItinerary([change]),
    message: `Time updated successfully for item ${request.itemId}`,
    timestamp
  };
}

/**
 * Process item replacement requests
 */
async function processReplacement(
  request: ModificationRequest, 
  modificationId: string, 
  timestamp: string
): Promise<ModificationResponse> {
  
  if (!request.itemId || !request.replacement) {
    throw new Error('Replacement requires itemId and replacement data');
  }

  const change: ItineraryChange = {
    id: generateChangeId(),
    type: 'replace',
    itemId: request.itemId,
    before: { title: 'Original Item' }, // Would fetch from database
    after: request.replacement,
    timestamp,
    reason: 'User requested item replacement'
  };

  return {
    success: true,
    modificationId,
    changes: [change],
    updatedItinerary: generateMockUpdatedItinerary([change]),
    message: `Item replaced successfully`,
    timestamp
  };
}

/**
 * Process item addition requests
 */
async function processAddition(
  request: ModificationRequest, 
  modificationId: string, 
  timestamp: string
): Promise<ModificationResponse> {
  
  if (!request.addition) {
    throw new Error('Addition requires addition data');
  }

  const change: ItineraryChange = {
    id: generateChangeId(),
    type: 'add',
    itemId: generateItemId(),
    before: null,
    after: request.addition,
    timestamp,
    reason: 'User requested item addition'
  };

  return {
    success: true,
    modificationId,
    changes: [change],
    updatedItinerary: generateMockUpdatedItinerary([change]),
    message: `Item added successfully`,
    timestamp
  };
}

/**
 * Process item removal requests
 */
async function processRemoval(
  request: ModificationRequest, 
  modificationId: string, 
  timestamp: string
): Promise<ModificationResponse> {
  
  if (!request.itemId) {
    throw new Error('Removal requires itemId');
  }

  const change: ItineraryChange = {
    id: generateChangeId(),
    type: 'remove',
    itemId: request.itemId,
    before: { title: 'Item to Remove' }, // Would fetch from database
    after: null,
    timestamp,
    reason: 'User requested item removal'
  };

  return {
    success: true,
    modificationId,
    changes: [change],
    updatedItinerary: generateMockUpdatedItinerary([change]),
    message: `Item removed successfully`,
    timestamp
  };
}

/**
 * Generate mock updated itinerary for Phase 1 demo
 */
function generateMockUpdatedItinerary(changes: ItineraryChange[]) {
  return {
    id: 'itinerary_1',
    lastModified: new Date().toISOString(),
    changeCount: changes.length,
    days: [
      {
        date: new Date().toISOString(),
        dayNumber: 1,
        title: "Updated Day",
        items: changes.map(change => change.after).filter(Boolean)
      }
    ]
  };
}

/**
 * Utility functions for ID generation
 */
function generateModificationId(): string {
  return `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateChangeId(): string {
  return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * PUT /api/itinerary/modify
 * Update an existing modification
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simulate modification update
    return NextResponse.json({
      success: true,
      message: 'Modification updated successfully',
      modificationId: body.modificationId
    });
  } catch (error) {
    console.error('Modification update error:', error);
    return NextResponse.json(
      { error: 'Failed to update modification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/itinerary/modify
 * Cancel a modification
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modificationId = searchParams.get('modificationId');
    
    if (!modificationId) {
      return NextResponse.json(
        { error: 'Missing modificationId parameter' },
        { status: 400 }
      );
    }

    // Simulate modification cancellation
    return NextResponse.json({
      success: true,
      message: 'Modification cancelled successfully',
      modificationId
    });
  } catch (error) {
    console.error('Modification cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel modification' },
      { status: 500 }
    );
  }
} 