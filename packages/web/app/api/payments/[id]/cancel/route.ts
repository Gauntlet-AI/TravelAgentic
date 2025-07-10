import { NextRequest, NextResponse } from 'next/server';
import { getPaymentService } from '@/lib/mocks';

/**
 * POST endpoint for booking cancellation
 */
export async function POST(
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

    // Get the payment service and cancel booking
    const paymentService = getPaymentService();
    const result = await paymentService.cancelBooking(bookingId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to cancel booking',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Booking cancelled successfully',
      fallbackUsed: result.fallbackUsed,
      responseTime: result.responseTime,
    });

  } catch (error) {
    console.error('Booking cancellation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while cancelling booking',
      },
      { status: 500 }
    );
  }
} 