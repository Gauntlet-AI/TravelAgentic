import { NextRequest, NextResponse } from 'next/server';
import { getActivityService } from '@/lib/mocks';

/**
 * GET endpoint for activity categories
 */
export async function GET(request: NextRequest) {
  try {
    // Get the activity service and fetch categories
    const activityService = getActivityService();
    const result = await activityService.getCategories();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch activity categories',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      fallbackUsed: result.fallbackUsed,
      responseTime: result.responseTime,
    });

  } catch (error) {
    console.error('Activity categories error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while fetching activity categories',
      },
      { status: 500 }
    );
  }
} 