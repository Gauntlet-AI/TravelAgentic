/**
 * Itinerary Finalization API
 * Coordinates the booking orchestration process for complete itineraries
 * Handles payments, confirmations, and document generation triggers
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory store for finalization progress (in production, use Redis/Database)
const finalizationStore = new Map<string, FinalizationResponse>();

// Types for finalization process
interface FinalizationRequest {
  itineraryId: string;
  userId?: string;
  paymentMethod?: {
    type: 'stripe' | 'paypal' | 'bank_transfer';
    token?: string;
    details?: any;
  };
  preferences?: {
    generateDocument?: boolean;
    sendNotifications?: boolean;
    autoBook?: boolean;
  };
  contactInfo?: {
    email: string;
    phone?: string;
    emergencyContact?: string;
  };
}

interface FinalizationResponse {
  success: boolean;
  finalizationId: string;
  status: 'initiated' | 'processing' | 'completed' | 'failed';
  bookingProgress: BookingProgress;
  estimatedCompletion: string;
  totalCost: number;
  currency: string;
  bookingResults?: BookingResult[];
  documentId?: string;
  confirmationNumber?: string;
  timestamp: string;
}

interface BookingProgress {
  overall: number; // 0-100 percentage
  stages: {
    validation: { status: 'pending' | 'processing' | 'completed' | 'failed'; progress: number };
    payment: { status: 'pending' | 'processing' | 'completed' | 'failed'; progress: number };
    flights: { status: 'pending' | 'processing' | 'completed' | 'failed'; progress: number };
    hotels: { status: 'pending' | 'processing' | 'completed' | 'failed'; progress: number };
    activities: { status: 'pending' | 'processing' | 'completed' | 'failed'; progress: number };
    documents: { status: 'pending' | 'processing' | 'completed' | 'failed'; progress: number };
    notifications: { status: 'pending' | 'processing' | 'completed' | 'failed'; progress: number };
  };
}

interface BookingResult {
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
  itemId: string;
  status: 'booked' | 'confirmed' | 'pending' | 'failed';
  confirmationNumber?: string;
  cost: number;
  details: any;
  errors?: string[];
}

/**
 * POST /api/itinerary/finalize
 * Initiate the booking orchestration process
 */
export async function POST(request: NextRequest) {
  try {
    const body: FinalizationRequest = await request.json();
    
    // Validate required fields
    if (!body.itineraryId) {
      return NextResponse.json(
        { error: 'Missing required field: itineraryId' },
        { status: 400 }
      );
    }

    // Start the finalization process
    const finalization = await initiateFinalization(body);

    return NextResponse.json(finalization, { status: 200 });
  } catch (error) {
    console.error('Finalization initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate finalization process' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/itinerary/finalize
 * Get finalization status and progress
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const finalizationId = searchParams.get('finalizationId');
    const itineraryId = searchParams.get('itineraryId');

    if (!finalizationId && !itineraryId) {
      return NextResponse.json(
        { error: 'Missing finalizationId or itineraryId parameter' },
        { status: 400 }
      );
    }

    const status = await getFinalizationStatus(finalizationId, itineraryId);

    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error('Finalization status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve finalization status' },
      { status: 500 }
    );
  }
}

/**
 * Initiate the booking orchestration process
 */
async function initiateFinalization(request: FinalizationRequest): Promise<FinalizationResponse> {
  const finalizationId = generateFinalizationId();
  const timestamp = new Date().toISOString();

  // Simulate getting itinerary data (would fetch from database in production)
  const itinerary = await getMockItineraryData(request.itineraryId);
  
  if (!itinerary) {
    throw new Error(`Itinerary not found: ${request.itineraryId}`);
  }

  // Calculate total cost
  const totalCost = calculateTotalCost(itinerary);

  // Initialize booking progress
  const bookingProgress: BookingProgress = {
    overall: 0,
    stages: {
      validation: { status: 'pending', progress: 0 },
      payment: { status: 'pending', progress: 0 },
      flights: { status: 'pending', progress: 0 },
      hotels: { status: 'pending', progress: 0 },
      activities: { status: 'pending', progress: 0 },
      documents: { status: 'pending', progress: 0 },
      notifications: { status: 'pending', progress: 0 }
    }
  };

  // Calculate estimated completion time (based on number of items)
  const itemCount = itinerary.flights.length + itinerary.hotels.length + itinerary.activities.length;
  const estimatedMinutes = Math.max(5, itemCount * 2); // Minimum 5 minutes, 2 minutes per item
  const estimatedCompletion = new Date(Date.now() + estimatedMinutes * 60 * 1000).toISOString();

  const initialResponse: FinalizationResponse = {
    success: true,
    finalizationId,
    status: 'initiated',
    bookingProgress,
    estimatedCompletion,
    totalCost,
    currency: 'USD',
    timestamp
  };

  // Store initial state
  finalizationStore.set(finalizationId, initialResponse);

  // Start background processing (in production, this would be a queue job)
  processFinalizationStages(finalizationId, request, itinerary);

  return initialResponse;
}

/**
 * Process finalization stages in background
 */
async function processFinalizationStages(
  finalizationId: string, 
  request: FinalizationRequest, 
  itinerary: any
) {
  // This would be implemented as a background job in production
  console.log(`Starting finalization process for ${finalizationId}`);
  
  // Simulate progressive processing with realistic timing
  setTimeout(() => updateStageProgress(finalizationId, 'validation', 'completed', 100), 2000);
  setTimeout(() => updateStageProgress(finalizationId, 'payment', 'processing', 50), 3000);
  setTimeout(() => updateStageProgress(finalizationId, 'payment', 'completed', 100), 5000);
  setTimeout(() => updateStageProgress(finalizationId, 'flights', 'processing', 30), 6000);
  setTimeout(() => updateStageProgress(finalizationId, 'flights', 'completed', 100), 10000);
  setTimeout(() => updateStageProgress(finalizationId, 'hotels', 'processing', 40), 11000);
  setTimeout(() => updateStageProgress(finalizationId, 'hotels', 'completed', 100), 15000);
  setTimeout(() => updateStageProgress(finalizationId, 'activities', 'processing', 60), 16000);
  setTimeout(() => updateStageProgress(finalizationId, 'activities', 'completed', 100), 20000);
  setTimeout(() => updateStageProgress(finalizationId, 'documents', 'processing', 80), 21000);
  setTimeout(() => updateStageProgress(finalizationId, 'documents', 'completed', 100), 25000);
  setTimeout(() => updateStageProgress(finalizationId, 'notifications', 'completed', 100), 26000);
}

/**
 * Update stage progress (stores actual progress in memory)
 */
function updateStageProgress(
  finalizationId: string, 
  stage: string, 
  status: string, 
  progress: number
) {
  console.log(`Finalization ${finalizationId}: ${stage} ${status} (${progress}%)`);
  
  const storedFinalization = finalizationStore.get(finalizationId);
  if (!storedFinalization) {
    console.error(`Finalization ${finalizationId} not found in store`);
    return;
  }

  // Update the specific stage
  const stageKey = stage as keyof typeof storedFinalization.bookingProgress.stages;
  if (storedFinalization.bookingProgress.stages[stageKey]) {
    storedFinalization.bookingProgress.stages[stageKey] = {
      status: status as any,
      progress: progress
    };
  }

  // Calculate overall progress
  const stages = storedFinalization.bookingProgress.stages;
  const stageValues = Object.values(stages);
  const totalProgress = stageValues.reduce((sum, s) => sum + s.progress, 0);
  const overallProgress = Math.round(totalProgress / stageValues.length);
  
  storedFinalization.bookingProgress.overall = overallProgress;
  
  // Update status based on overall progress
  if (overallProgress === 100) {
    storedFinalization.status = 'completed';
  } else if (overallProgress > 0) {
    storedFinalization.status = 'processing';
  }

  // Update timestamp
  storedFinalization.timestamp = new Date().toISOString();

  // Store updated finalization
  finalizationStore.set(finalizationId, storedFinalization);
}

/**
 * Get finalization status
 */
async function getFinalizationStatus(
  finalizationId?: string | null, 
  itineraryId?: string | null
): Promise<FinalizationResponse> {
  
  // Try to get stored finalization first
  if (finalizationId) {
    const storedFinalization = finalizationStore.get(finalizationId);
    if (storedFinalization) {
      // Add mock booking results for demonstration
      storedFinalization.bookingResults = [
        {
          type: 'flight',
          itemId: 'flight_1',
          status: 'confirmed',
          confirmationNumber: 'FL-ABC123',
          cost: 450,
          details: {
            airline: 'Premium Airways',
            flightNumber: 'PA 1234',
            departure: '10:00 AM',
            arrival: '1:45 PM'
          }
        },
        {
          type: 'hotel',
          itemId: 'hotel_1',
          status: 'confirmed',
          confirmationNumber: 'HT-XYZ789',
          cost: 600,
          details: {
            name: 'Luxury Resort',
            checkIn: '3:00 PM',
            checkOut: '11:00 AM',
            nights: 3
          }
        },
        {
          type: 'activity',
          itemId: 'activity_1',
          status: storedFinalization.bookingProgress.stages.activities.status === 'completed' ? 'confirmed' : 'pending',
          confirmationNumber: storedFinalization.bookingProgress.stages.activities.status === 'completed' ? 'AC-DEF456' : undefined,
          cost: 75,
          details: {
            name: 'Welcome Dinner',
            time: '6:00 PM',
            restaurant: 'Skyline Bistro'
          }
        }
      ];

      // Add document and confirmation info when completed
      if (storedFinalization.status === 'completed') {
        storedFinalization.documentId = 'doc_abc123';
        storedFinalization.confirmationNumber = 'TR-2024-001';
      }

      return storedFinalization;
    }
  }

  // Fallback: create default response if not found in store
  const mockProgress: BookingProgress = {
    overall: 0,
    stages: {
      validation: { status: 'pending', progress: 0 },
      payment: { status: 'pending', progress: 0 },
      flights: { status: 'pending', progress: 0 },
      hotels: { status: 'pending', progress: 0 },
      activities: { status: 'pending', progress: 0 },
      documents: { status: 'pending', progress: 0 },
      notifications: { status: 'pending', progress: 0 }
    }
  };

  return {
    success: true,
    finalizationId: finalizationId || `fin_${Date.now()}`,
    status: 'initiated',
    bookingProgress: mockProgress,
    estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    totalCost: 1125,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };
}

/**
 * Get mock itinerary data
 */
async function getMockItineraryData(itineraryId: string) {
  // Mock itinerary data structure
  return {
    id: itineraryId,
    flights: [
      { id: 'flight_1', cost: 450, details: { airline: 'Premium Airways' } }
    ],
    hotels: [
      { id: 'hotel_1', cost: 600, details: { name: 'Luxury Resort', nights: 3 } }
    ],
    activities: [
      { id: 'activity_1', cost: 75, details: { name: 'Welcome Dinner' } }
    ]
  };
}

/**
 * Calculate total cost from itinerary items
 */
function calculateTotalCost(itinerary: any): number {
  const flightCosts = itinerary.flights.reduce((sum: number, flight: any) => sum + flight.cost, 0);
  const hotelCosts = itinerary.hotels.reduce((sum: number, hotel: any) => sum + hotel.cost, 0);
  const activityCosts = itinerary.activities.reduce((sum: number, activity: any) => sum + activity.cost, 0);
  
  return flightCosts + hotelCosts + activityCosts;
}

/**
 * PUT /api/itinerary/finalize
 * Update finalization preferences or payment information
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.finalizationId) {
      return NextResponse.json(
        { error: 'Missing finalizationId' },
        { status: 400 }
      );
    }

    // Simulate updating finalization details
    return NextResponse.json({
      success: true,
      message: 'Finalization details updated successfully',
      finalizationId: body.finalizationId
    });
  } catch (error) {
    console.error('Finalization update error:', error);
    return NextResponse.json(
      { error: 'Failed to update finalization' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/itinerary/finalize
 * Cancel finalization process
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const finalizationId = searchParams.get('finalizationId');
    
    if (!finalizationId) {
      return NextResponse.json(
        { error: 'Missing finalizationId parameter' },
        { status: 400 }
      );
    }

    // Simulate cancellation
    return NextResponse.json({
      success: true,
      message: 'Finalization process cancelled successfully',
      finalizationId,
      refundInfo: {
        amount: 0, // No charges if cancelled early
        currency: 'USD',
        refundId: `ref_${Date.now()}`
      }
    });
  } catch (error) {
    console.error('Finalization cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel finalization' },
      { status: 500 }
    );
  }
}

/**
 * Utility functions for ID generation
 */
function generateFinalizationId(): string {
  return `fin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 