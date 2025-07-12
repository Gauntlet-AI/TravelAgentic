/**
 * Itinerary Revert API
 * Handles reverting modifications to restore previous itinerary states
 * Supports single change reversion and batch operations
 */

import { NextRequest, NextResponse } from 'next/server';

// Types for revert operations
interface RevertRequest {
  itineraryId: string;
  changeId?: string; // Specific change to revert
  modificationId?: string; // All changes from a modification
  revertToTimestamp?: string; // Revert to specific point in time
  userId?: string;
}

interface RevertResponse {
  success: boolean;
  revertId: string;
  revertedChanges: RevertedChange[];
  updatedItinerary: any;
  message: string;
  timestamp: string;
}

interface RevertedChange {
  changeId: string;
  originalChange: any;
  revertAction: 'restore' | 'remove_addition' | 'undo_modification' | 'undo_removal';
  restoredState: any;
  timestamp: string;
}

/**
 * POST /api/itinerary/revert
 * Revert specific changes or modifications
 */
export async function POST(request: NextRequest) {
  try {
    const body: RevertRequest = await request.json();
    
    // Validate required fields
    if (!body.itineraryId) {
      return NextResponse.json(
        { error: 'Missing required field: itineraryId' },
        { status: 400 }
      );
    }

    // Must specify at least one revert criterion
    if (!body.changeId && !body.modificationId && !body.revertToTimestamp) {
      return NextResponse.json(
        { error: 'Must specify changeId, modificationId, or revertToTimestamp' },
        { status: 400 }
      );
    }

    const revertResult = await processRevertRequest(body);

    return NextResponse.json(revertResult, { status: 200 });
  } catch (error) {
    console.error('Revert operation error:', error);
    return NextResponse.json(
      { error: 'Failed to process revert request' },
      { status: 500 }
    );
  }
}

/**
 * Process revert requests based on different criteria
 */
async function processRevertRequest(request: RevertRequest): Promise<RevertResponse> {
  const revertId = generateRevertId();
  const timestamp = new Date().toISOString();

  // Simulate processing time for realistic UX
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  if (request.changeId) {
    return await revertSingleChange(request, revertId, timestamp);
  } else if (request.modificationId) {
    return await revertModification(request, revertId, timestamp);
  } else if (request.revertToTimestamp) {
    return await revertToTimestamp(request, revertId, timestamp);
  }

  throw new Error('Invalid revert request parameters');
}

/**
 * Revert a single specific change
 */
async function revertSingleChange(
  request: RevertRequest, 
  revertId: string, 
  timestamp: string
): Promise<RevertResponse> {
  
  // Mock fetching the original change record
  const originalChange = await getMockChangeRecord(request.changeId!);
  
  if (!originalChange) {
    throw new Error(`Change not found: ${request.changeId}`);
  }

  if (originalChange.status === 'reverted') {
    throw new Error(`Change ${request.changeId} has already been reverted`);
  }

  // Determine revert action based on original change type
  let revertAction: RevertedChange['revertAction'];
  let restoredState: any;

  switch (originalChange.changeType) {
    case 'add':
      revertAction = 'remove_addition';
      restoredState = null; // Remove the added item
      break;
    
    case 'remove':
      revertAction = 'restore';
      restoredState = originalChange.before; // Restore the removed item
      break;
    
    case 'modify':
    case 'replace':
      revertAction = 'undo_modification';
      restoredState = originalChange.before; // Restore original state
      break;
    
    default:
      throw new Error(`Cannot revert change type: ${originalChange.changeType}`);
  }

  const revertedChange: RevertedChange = {
    changeId: request.changeId!,
    originalChange,
    revertAction,
    restoredState,
    timestamp
  };

  return {
    success: true,
    revertId,
    revertedChanges: [revertedChange],
    updatedItinerary: generateMockRevertedItinerary([revertedChange]),
    message: `Successfully reverted change: ${originalChange.reason}`,
    timestamp
  };
}

/**
 * Revert all changes from a specific modification
 */
async function revertModification(
  request: RevertRequest, 
  revertId: string, 
  timestamp: string
): Promise<RevertResponse> {
  
  // Mock fetching all changes from the modification
  const modificationChanges = await getMockModificationChanges(request.modificationId!);
  
  if (modificationChanges.length === 0) {
    throw new Error(`No changes found for modification: ${request.modificationId}`);
  }

  const revertedChanges: RevertedChange[] = [];

  // Process each change in reverse order (newest first)
  for (const change of modificationChanges.reverse()) {
    if (change.status === 'reverted') {
      continue; // Skip already reverted changes
    }

    let revertAction: RevertedChange['revertAction'];
    let restoredState: any;

    switch (change.changeType) {
      case 'add':
        revertAction = 'remove_addition';
        restoredState = null;
        break;
      case 'remove':
        revertAction = 'restore';
        restoredState = change.before;
        break;
      case 'modify':
      case 'replace':
        revertAction = 'undo_modification';
        restoredState = change.before;
        break;
      default:
        continue; // Skip unknown change types
    }

    revertedChanges.push({
      changeId: change.id,
      originalChange: change,
      revertAction,
      restoredState,
      timestamp
    });
  }

  return {
    success: true,
    revertId,
    revertedChanges,
    updatedItinerary: generateMockRevertedItinerary(revertedChanges),
    message: `Successfully reverted ${revertedChanges.length} changes from modification`,
    timestamp
  };
}

/**
 * Revert all changes back to a specific timestamp
 */
async function revertToTimestamp(
  request: RevertRequest, 
  revertId: string, 
  timestamp: string
): Promise<RevertResponse> {
  
  // Mock fetching all changes after the specified timestamp
  const changesToRevert = await getMockChangesAfterTimestamp(
    request.itineraryId, 
    request.revertToTimestamp!
  );
  
  const revertedChanges: RevertedChange[] = [];

  // Process changes in reverse chronological order
  for (const change of changesToRevert.reverse()) {
    if (change.status === 'reverted') {
      continue;
    }

    let revertAction: RevertedChange['revertAction'];
    let restoredState: any;

    switch (change.changeType) {
      case 'add':
        revertAction = 'remove_addition';
        restoredState = null;
        break;
      case 'remove':
        revertAction = 'restore';
        restoredState = change.before;
        break;
      case 'modify':
      case 'replace':
        revertAction = 'undo_modification';
        restoredState = change.before;
        break;
      default:
        continue; // Skip unknown change types
    }

    revertedChanges.push({
      changeId: change.id,
      originalChange: change,
      revertAction,
      restoredState,
      timestamp
    });
  }

  return {
    success: true,
    revertId,
    revertedChanges,
    updatedItinerary: generateMockRevertedItinerary(revertedChanges),
    message: `Successfully reverted to state at ${request.revertToTimestamp}`,
    timestamp
  };
}

/**
 * GET /api/itinerary/revert
 * Get information about potential revert operations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itineraryId = searchParams.get('itineraryId');
    const previewOnly = searchParams.get('preview') === 'true';

    if (!itineraryId) {
      return NextResponse.json(
        { error: 'Missing itineraryId parameter' },
        { status: 400 }
      );
    }

    // Get revertible changes
    const revertableChanges = await getRevertableChanges(itineraryId);

    return NextResponse.json({
      success: true,
      revertableChanges,
      canRevert: revertableChanges.length > 0,
      lastRevertableTimestamp: revertableChanges.length > 0 
        ? revertableChanges[revertableChanges.length - 1].timestamp 
        : null
    });
  } catch (error) {
    console.error('Revert info error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve revert information' },
      { status: 500 }
    );
  }
}

/**
 * Mock data functions for Phase 1 demo
 */
async function getMockChangeRecord(changeId: string) {
  // Mock change records
  const mockChanges = {
    'change_001': {
      id: 'change_001',
      itineraryId: 'itinerary_1',
      modificationId: 'mod_001',
      changeType: 'modify',
      itemId: 'activity_1',
      before: { time: '6:00 PM', title: 'Welcome Dinner' },
      after: { time: '12:00 PM', title: 'Welcome Lunch' },
      reason: 'User requested earlier time',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'applied'
    },
    'change_002': {
      id: 'change_002',
      itineraryId: 'itinerary_1',
      modificationId: 'mod_002',
      changeType: 'add',
      itemId: 'activity_new_1',
      before: null,
      after: { time: '2:00 PM', title: 'Local Museum Visit' },
      reason: 'User requested cultural activities',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: 'applied'
    }
  };

  return mockChanges[changeId as keyof typeof mockChanges] || null;
}

async function getMockModificationChanges(modificationId: string) {
  // Mock returning changes from a specific modification
  return [
    {
      id: 'change_001',
      changeType: 'modify',
      before: { time: '6:00 PM', title: 'Welcome Dinner' },
      after: { time: '12:00 PM', title: 'Welcome Lunch' },
      status: 'applied'
    },
    {
      id: 'change_002',
      changeType: 'add',
      before: null,
      after: { time: '2:00 PM', title: 'Local Museum Visit' },
      status: 'applied'
    }
  ];
}

async function getMockChangesAfterTimestamp(itineraryId: string, timestamp: string) {
  // Mock returning changes after a specific timestamp
  return [
    {
      id: 'change_001',
      changeType: 'modify',
      before: { time: '6:00 PM', title: 'Welcome Dinner' },
      after: { time: '12:00 PM', title: 'Welcome Lunch' },
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'applied'
    }
  ];
}

async function getRevertableChanges(itineraryId: string) {
  // Mock returning all revertable changes
  return [
    {
      id: 'change_001',
      type: 'modify',
      description: 'Changed dinner to lunch time',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      canRevert: true
    },
    {
      id: 'change_002',
      type: 'add',
      description: 'Added museum visit',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      canRevert: true
    }
  ];
}

function generateMockRevertedItinerary(revertedChanges: RevertedChange[]) {
  return {
    id: 'itinerary_1',
    lastModified: new Date().toISOString(),
    revertCount: revertedChanges.length,
    status: 'reverted',
    days: [
      {
        date: new Date().toISOString(),
        dayNumber: 1,
        title: "Reverted Day",
        items: revertedChanges
          .map(change => change.restoredState)
          .filter(Boolean)
      }
    ]
  };
}

/**
 * Utility functions for ID generation
 */
function generateRevertId(): string {
  return `revert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 