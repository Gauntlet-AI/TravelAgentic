import { NextRequest, NextResponse } from 'next/server';
import { getPaymentService } from '@/lib/mocks';

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

    // Get the payment service and fetch booking status
    const paymentService = getPaymentService();
    const result = await paymentService.getBookingStatus(bookingId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Booking not found',
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