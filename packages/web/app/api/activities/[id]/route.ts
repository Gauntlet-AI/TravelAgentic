import { NextRequest, NextResponse } from 'next/server';
import { getActivityService } from '@/lib/mocks';

/**
 * GET endpoint for activity details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id;

    if (!activityId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Activity ID is required',
        },
        { status: 400 }
      );
    }

    // Get the activity service and fetch details
    const activityService = getActivityService();
    const result = await activityService.getDetails(activityId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Activity details not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      fallbackUsed: result.fallbackUsed,
      responseTime: result.responseTime,
    });

  } catch (error) {
    console.error('Activity details error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while fetching activity details',
      },
      { status: 500 }
    );
  }
} 