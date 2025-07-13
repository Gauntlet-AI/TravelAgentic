import { NextRequest, NextResponse } from 'next/server';

/**
 * GET endpoint for booking status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking ID is required',
        },
        { status: 400 }
      );
    }

    // Payment system not implemented in current phase
    return NextResponse.json(
      {
        success: false,
        error: 'Payment system not implemented. Please contact support for booking status.',
        supportEmail: 'support@travelagentic.com',
        estimatedImplementation: 'Phase 3 development'
      },
      { status: 501 } // Not Implemented
    );

  } catch (error) {
    console.error('Booking status error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while fetching booking status',
      },
      { status: 500 }
    );
  }
} 