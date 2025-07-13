import { NextRequest, NextResponse } from 'next/server';

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

    // Activity availability not implemented in current phase
    return NextResponse.json(
      {
        success: false,
        error: 'Activity availability checking not implemented. Please contact support.',
        supportEmail: 'support@travelagentic.com',
        estimatedImplementation: 'Phase 2 development'
      },
      { status: 501 } // Not Implemented
    );

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