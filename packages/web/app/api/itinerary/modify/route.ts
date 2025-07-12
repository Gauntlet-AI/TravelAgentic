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
}

interface ModificationResponse {
  success: boolean;
  modificationId: string;
  changes: ItineraryChange[];
  updatedItinerary: any;
  message: string;
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
    
    // Validate required fields
    if (!body.itineraryId || !body.modificationType || !body.request) {
      return NextResponse.json(
        { error: 'Missing required fields: itineraryId, modificationType, request' },
        { status: 400 }
      );
    }

    // For Phase 1, we'll simulate modification processing
    // In later phases, this will integrate with AI services
    const modification = await processModification(body);

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
  
  // Mock AI processing for natural language understanding
  const mockChanges: ItineraryChange[] = [];
  const naturalRequest = request.request.toLowerCase();

  // Simple keyword-based processing for Phase 1 demo
  if (naturalRequest.includes('earlier') || naturalRequest.includes('morning')) {
    mockChanges.push({
      id: generateChangeId(),
      type: 'modify',
      itemId: 'activity_1',
      before: { time: '6:00 PM', title: 'Welcome Dinner' },
      after: { time: '12:00 PM', title: 'Welcome Lunch' },
      timestamp,
      reason: 'User requested earlier time'
    });
  }

  if (naturalRequest.includes('museum') || naturalRequest.includes('culture')) {
    mockChanges.push({
      id: generateChangeId(),
      type: 'add',
      itemId: 'activity_new_1',
      before: null,
      after: { 
        time: '2:00 PM', 
        title: 'Local Museum Visit',
        type: 'activity',
        description: 'Explore local history and culture'
      },
      timestamp,
      reason: 'User requested cultural activities'
    });
  }

  if (naturalRequest.includes('remove') || naturalRequest.includes('skip')) {
    mockChanges.push({
      id: generateChangeId(),
      type: 'remove',
      itemId: 'activity_2',
      before: { time: '3:00 PM', title: 'Hotel Check-in' },
      after: null,
      timestamp,
      reason: 'User requested removal'
    });
  }

  return {
    success: true,
    modificationId,
    changes: mockChanges,
    updatedItinerary: generateMockUpdatedItinerary(mockChanges),
    message: `Successfully processed: "${request.request}". ${mockChanges.length} changes made.`,
    timestamp
  };
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