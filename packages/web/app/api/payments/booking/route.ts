import { NextRequest, NextResponse } from 'next/server';

interface BookingRequest {
  items: Array<{
    id: string;
    type: string;
    details: any;
    price: number;
  }>;
  paymentMethod: {
    type: string;
    details: any;
  };
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  specialRequests?: string;
}

/**
 * POST endpoint for processing travel bookings with payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking must contain at least one item',
        },
        { status: 400 }
      );
    }

    if (!body.paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment method is required',
        },
        { status: 400 }
      );
    }

    if (!body.customerInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer information is required',
        },
        { status: 400 }
      );
    }

    // Validate customer info
    const { customerInfo } = body;
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer name and email are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address',
        },
        { status: 400 }
      );
    }

    // Convert the request body to match our BookingRequest interface
    const bookingRequest: BookingRequest = {
      items: body.items,
      paymentMethod: body.paymentMethod,
      customerInfo: body.customerInfo,
      specialRequests: body.specialRequests,
    };

    // Payment processing not implemented in current phase
    return NextResponse.json(
      {
        success: false,
        error: 'Payment processing not implemented. Please contact support for booking assistance.',
        supportEmail: 'support@travelagentic.com',
        estimatedImplementation: 'Phase 3 development'
      },
      { status: 501 } // Not Implemented
    );

  } catch (error) {
    console.error('Payment processing error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during payment processing',
      },
      { status: 500 }
    );
  }
} 