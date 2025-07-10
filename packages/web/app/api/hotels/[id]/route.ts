import { NextRequest, NextResponse } from 'next/server';
import { getHotelService } from '@/lib/mocks';

/**
 * GET endpoint for hotel details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotelId = params.id;

    if (!hotelId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hotel ID is required',
        },
        { status: 400 }
      );
    }

    // Get the hotel service and fetch details
    const hotelService = getHotelService();
    const result = await hotelService.getDetails(hotelId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Hotel details not found',
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
    console.error('Hotel details error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while fetching hotel details',
      },
      { status: 500 }
    );
  }
} 