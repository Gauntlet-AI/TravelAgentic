import { NextRequest, NextResponse } from 'next/server';
import { getActivityService } from '@/lib/mocks';

/**
 * GET endpoint for checking activity availability
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id;
    const { searchParams } = new URL(request.url);
    
    const date = searchParams.get('date');
    const timeSlot = searchParams.get('timeSlot');
    const groupSize = searchParams.get('groupSize');

    if (!activityId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Activity ID is required',
        },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date is required for availability check',
        },
        { status: 400 }
      );
    }

    // Validate date
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date cannot be in the past',
        },
        { status: 400 }
      );
    }

    // Get the activity service and check availability
    const activityService = getActivityService();
    const result = await activityService.checkAvailability(activityId, date);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to check activity availability',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      available: result.data,
      fallbackUsed: result.fallbackUsed,
      responseTime: result.responseTime,
    });

  } catch (error) {
    console.error('Activity availability check error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while checking activity availability',
      },
      { status: 500 }
    );
  }
} 