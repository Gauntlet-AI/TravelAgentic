import { NextRequest, NextResponse } from 'next/server';
import { createAmadeusClient, AmadeusHotelService } from '@/lib/amadeus';

/**
 * GET endpoint for checking hotel availability
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotelId = params.id;
    const { searchParams } = new URL(request.url);
    
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    if (!hotelId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hotel ID is required',
        },
        { status: 400 }
      );
    }

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-in and check-out dates are required',
        },
        { status: 400 }
      );
    }

    // Validate date logic
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-in date cannot be in the past',
        },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-out date must be after check-in date',
        },
        { status: 400 }
      );
    }

    // Get hotel availability using Amadeus service
    const amadeusClient = createAmadeusClient();
    const hotelService = new AmadeusHotelService(amadeusClient);
    const result = await hotelService.checkAvailability(hotelId, checkIn, checkOut);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to check hotel availability',
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
    console.error('Hotel availability check error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while checking hotel availability',
      },
      { status: 500 }
    );
  }
} 