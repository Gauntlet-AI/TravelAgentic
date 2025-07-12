/**
 * Itinerary History API
 * Tracks and retrieves modification history for itineraries
 * Supports pagination and filtering of change records
 */

import { NextRequest, NextResponse } from 'next/server';

// Types for history tracking
interface ChangeRecord {
  id: string;
  itineraryId: string;
  modificationId: string;
  userId: string;
  timestamp: string;
  changeType: 'modify' | 'add' | 'remove' | 'replace';
  itemId: string;
  itemType: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
  before: any;
  after: any;
  reason: string;
  naturalLanguageRequest?: string;
  status: 'applied' | 'reverted' | 'pending';
}

interface HistoryResponse {
  success: boolean;
  changes: ChangeRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  summary: {
    totalChanges: number;
    addedItems: number;
    modifiedItems: number;
    removedItems: number;
    lastModified: string;
  };
}

/**
 * GET /api/itinerary/history
 * Retrieve modification history for an itinerary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itineraryId = searchParams.get('itineraryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const changeType = searchParams.get('changeType');
    const itemType = searchParams.get('itemType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (!itineraryId) {
      return NextResponse.json(
        { error: 'Missing itineraryId parameter' },
        { status: 400 }
      );
    }

    // For Phase 1, return mock history data
    const history = await getModificationHistory({
      itineraryId,
      page,
      limit,
      changeType,
      itemType,
      dateFrom,
      dateTo
    });

    return NextResponse.json(history, { status: 200 });
  } catch (error) {
    console.error('History retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve modification history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/itinerary/history
 * Add a new change record to history
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.itineraryId || !body.changeType || !body.itemId) {
      return NextResponse.json(
        { error: 'Missing required fields: itineraryId, changeType, itemId' },
        { status: 400 }
      );
    }

    const changeRecord = await createChangeRecord(body);

    return NextResponse.json({
      success: true,
      changeRecord,
      message: 'Change record created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('History creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create change record' },
      { status: 500 }
    );
  }
}

/**
 * Retrieve modification history with filtering and pagination
 */
async function getModificationHistory(params: {
  itineraryId: string;
  page: number;
  limit: number;
  changeType?: string | null;
  itemType?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}): Promise<HistoryResponse> {
  
  // Mock change records for Phase 1 demo
  const mockChanges: ChangeRecord[] = [
    {
      id: 'change_001',
      itineraryId: params.itineraryId,
      modificationId: 'mod_001',
      userId: 'user_123',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      changeType: 'modify',
      itemId: 'activity_1',
      itemType: 'activity',
      before: { time: '6:00 PM', title: 'Welcome Dinner', type: 'restaurant' },
      after: { time: '12:00 PM', title: 'Welcome Lunch', type: 'restaurant' },
      reason: 'User requested earlier time',
      naturalLanguageRequest: 'Can we move dinner earlier to lunch time?',
      status: 'applied'
    },
    {
      id: 'change_002',
      itineraryId: params.itineraryId,
      modificationId: 'mod_002',
      userId: 'user_123',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      changeType: 'add',
      itemId: 'activity_new_1',
      itemType: 'activity',
      before: null,
      after: { 
        time: '2:00 PM', 
        title: 'Local Museum Visit',
        type: 'activity',
        description: 'Explore local history and culture',
        duration: '2 hours',
        price: '$15'
      },
      reason: 'User requested cultural activities',
      naturalLanguageRequest: 'Add some museums or cultural sites',
      status: 'applied'
    },
    {
      id: 'change_003',
      itineraryId: params.itineraryId,
      modificationId: 'mod_003',
      userId: 'user_123',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      changeType: 'replace',
      itemId: 'hotel_1',
      itemType: 'hotel',
      before: { 
        name: 'Budget Inn', 
        type: 'hotel',
        price: '$89/night',
        rating: '3.2 stars'
      },
      after: { 
        name: 'Luxury Resort', 
        type: 'hotel',
        price: '$249/night',
        rating: '4.8 stars'
      },
      reason: 'User upgraded accommodation preference',
      naturalLanguageRequest: 'Can we upgrade to a nicer hotel?',
      status: 'applied'
    },
    {
      id: 'change_004',
      itineraryId: params.itineraryId,
      modificationId: 'mod_004',
      userId: 'user_123',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      changeType: 'remove',
      itemId: 'activity_old_1',
      itemType: 'activity',
      before: { 
        time: '9:00 AM', 
        title: 'Early Morning Hike',
        type: 'activity',
        difficulty: 'Hard'
      },
      after: null,
      reason: 'User removed strenuous activity',
      naturalLanguageRequest: 'Remove the hiking - too early and difficult',
      status: 'applied'
    },
    {
      id: 'change_005',
      itineraryId: params.itineraryId,
      modificationId: 'mod_005',
      userId: 'user_123',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      changeType: 'modify',
      itemId: 'flight_1',
      itemType: 'flight',
      before: { 
        departure: '6:00 AM',
        airline: 'Budget Air',
        class: 'Economy'
      },
      after: { 
        departure: '10:00 AM',
        airline: 'Premium Airlines',
        class: 'Business'
      },
      reason: 'User upgraded flight and changed time',
      naturalLanguageRequest: 'Change to a later flight with better service',
      status: 'reverted' // This was reverted later
    }
  ];

  // Simple filtering for Phase 1 demo
  const filteredChanges = mockChanges.filter(change => {
    if (params.changeType && change.changeType !== params.changeType) return false;
    if (params.itemType && change.itemType !== params.itemType) return false;
    if (params.dateFrom && change.timestamp < params.dateFrom) return false;
    if (params.dateTo && change.timestamp > params.dateTo) return false;
    return true;
  });

  // Pagination
  const total = filteredChanges.length;
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginatedChanges = filteredChanges.slice(startIndex, endIndex);

  // Calculate summary statistics
  const appliedChanges = filteredChanges.filter(c => c.status === 'applied');
  const summary = {
    totalChanges: appliedChanges.length,
    addedItems: appliedChanges.filter(c => c.changeType === 'add').length,
    modifiedItems: appliedChanges.filter(c => c.changeType === 'modify').length,
    removedItems: appliedChanges.filter(c => c.changeType === 'remove').length,
    lastModified: filteredChanges.length > 0 ? filteredChanges[0].timestamp : new Date().toISOString()
  };

  return {
    success: true,
    changes: paginatedChanges,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      hasMore: endIndex < total
    },
    summary
  };
}

/**
 * Create a new change record
 */
async function createChangeRecord(data: Partial<ChangeRecord>): Promise<ChangeRecord> {
  const changeRecord: ChangeRecord = {
    id: generateChangeId(),
    itineraryId: data.itineraryId!,
    modificationId: data.modificationId || generateModificationId(),
    userId: data.userId || 'user_123',
    timestamp: new Date().toISOString(),
    changeType: data.changeType!,
    itemId: data.itemId!,
    itemType: data.itemType || 'activity',
    before: data.before || null,
    after: data.after || null,
    reason: data.reason || 'User modification',
    naturalLanguageRequest: data.naturalLanguageRequest,
    status: 'applied'
  };

  // In a real implementation, this would save to database
  console.log('Creating change record:', changeRecord);

  return changeRecord;
}

/**
 * DELETE /api/itinerary/history
 * Clear modification history for an itinerary
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itineraryId = searchParams.get('itineraryId');
    const olderThan = searchParams.get('olderThan'); // Delete records older than this date

    if (!itineraryId) {
      return NextResponse.json(
        { error: 'Missing itineraryId parameter' },
        { status: 400 }
      );
    }

    // Simulate deletion
    const deletedCount = olderThan ? 5 : 10; // Mock deletion count

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} history records`,
      deletedCount
    });
  } catch (error) {
    console.error('History deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete history records' },
      { status: 500 }
    );
  }
}

/**
 * Utility functions for ID generation
 */
function generateChangeId(): string {
  return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateModificationId(): string {
  return `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 