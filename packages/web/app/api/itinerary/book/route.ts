/**
 * Itinerary Booking Execution API
 * Handles individual booking execution for flights, hotels, activities, and restaurants
 * Supports retry logic, fallback providers, and detailed booking confirmations
 */

import { NextRequest, NextResponse } from 'next/server';

// Types for booking execution
interface BookingRequest {
  finalizationId: string;
  itemId: string;
  itemType: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
  bookingDetails: any;
  paymentInfo?: {
    method: string;
    token?: string;
    amount: number;
    currency: string;
  };
  retryCount?: number;
  useAlternativeProvider?: boolean;
}

interface BookingResponse {
  success: boolean;
  bookingId: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  confirmationNumber?: string;
  providerResponse: ProviderResponse;
  bookingDetails: BookingDetails;
  cost: {
    amount: number;
    currency: string;
    breakdown?: CostBreakdown;
  };
  vouchers?: VoucherInfo[];
  cancellationPolicy?: CancellationPolicy;
  timestamp: string;
  errors?: string[];
}

interface ProviderResponse {
  provider: string;
  providerId: string;
  responseTime: number;
  status: 'success' | 'failure' | 'timeout';
  rawResponse?: any;
  fallbackUsed?: boolean;
}

interface BookingDetails {
  itemId: string;
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
  title: string;
  description: string;
  dateTime: string;
  location?: string;
  duration?: string;
  capacity?: number;
  specialRequests?: string[];
}

interface CostBreakdown {
  basePrice: number;
  taxes: number;
  fees: number;
  discounts?: number;
  total: number;
}

interface VoucherInfo {
  type: 'eticket' | 'voucher' | 'confirmation';
  format: 'pdf' | 'qr' | 'text';
  content: string;
  validUntil?: string;
}

interface CancellationPolicy {
  cancellable: boolean;
  refundable: boolean;
  deadlineHours: number;
  refundPercentage: number;
  penalties?: string[];
}

/**
 * POST /api/itinerary/book
 * Execute booking for a specific itinerary item
 */
export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();
    
    // Validate required fields
    if (!body.finalizationId || !body.itemId || !body.itemType) {
      return NextResponse.json(
        { error: 'Missing required fields: finalizationId, itemId, itemType' },
        { status: 400 }
      );
    }

    // Execute the booking
    const booking = await executeBooking(body);

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    console.error('Booking execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute booking' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/itinerary/book
 * Get booking status and details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const itemId = searchParams.get('itemId');

    if (!bookingId && !itemId) {
      return NextResponse.json(
        { error: 'Missing bookingId or itemId parameter' },
        { status: 400 }
      );
    }

    const bookingStatus = await getBookingStatus(bookingId, itemId);

    return NextResponse.json(bookingStatus, { status: 200 });
  } catch (error) {
    console.error('Booking status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve booking status' },
      { status: 500 }
    );
  }
}

/**
 * Execute booking for a specific item
 */
async function executeBooking(request: BookingRequest): Promise<BookingResponse> {
  const bookingId = generateBookingId();
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  try {
    // Simulate provider-specific booking logic
    const providerResponse = await bookWithProvider(request);
    const responseTime = Date.now() - startTime;

    // Generate booking confirmation based on item type
    const bookingDetails = await generateBookingDetails(request);
    const cost = await calculateBookingCost(request);
    const vouchers = await generateVouchers(request, bookingId);
    const cancellationPolicy = getCancellationPolicy(request.itemType);

    return {
      success: true,
      bookingId,
      status: 'confirmed',
      confirmationNumber: generateConfirmationNumber(request.itemType),
      providerResponse: {
        ...providerResponse,
        responseTime
      },
      bookingDetails,
      cost,
      vouchers,
      cancellationPolicy,
      timestamp
    };

  } catch (error) {
    // Handle booking failures with retry logic
    if ((request.retryCount || 0) < 3) {
      console.log(`Booking failed, retrying... (attempt ${(request.retryCount || 0) + 1})`);
      return await executeBooking({
        ...request,
        retryCount: (request.retryCount || 0) + 1,
        useAlternativeProvider: true
      });
    }

    return {
      success: false,
      bookingId,
      status: 'failed',
      providerResponse: {
        provider: 'unknown',
        providerId: '',
        responseTime: Date.now() - startTime,
        status: 'failure'
      },
      bookingDetails: await generateBookingDetails(request),
      cost: await calculateBookingCost(request),
      timestamp,
      errors: [error instanceof Error ? error.message : 'Unknown booking error']
    };
  }
}

/**
 * Book with specific provider based on item type
 */
async function bookWithProvider(request: BookingRequest): Promise<Omit<ProviderResponse, 'responseTime'>> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 3000));

  const providers = getProvidersByType(request.itemType, request.useAlternativeProvider);
  const selectedProvider = providers[0];

  // Simulate provider-specific booking logic
  switch (request.itemType) {
    case 'flight':
      return await bookFlight(request, selectedProvider);
    case 'hotel':
      return await bookHotel(request, selectedProvider);
    case 'activity':
      return await bookActivity(request, selectedProvider);
    case 'restaurant':
      return await bookRestaurant(request, selectedProvider);
    case 'transport':
      return await bookTransport(request, selectedProvider);
    default:
      throw new Error(`Unsupported item type: ${request.itemType}`);
  }
}

/**
 * Provider-specific booking implementations
 */
async function bookFlight(request: BookingRequest, provider: string): Promise<Omit<ProviderResponse, 'responseTime'>> {
  // Mock flight booking with different providers
  const flightProviders = {
    'amadeus': { success: 0.95, providerId: 'AM-' },
    'sabre': { success: 0.90, providerId: 'SB-' },
    'travelport': { success: 0.85, providerId: 'TP-' }
  };

  const config = flightProviders[provider as keyof typeof flightProviders] || flightProviders.amadeus;
  
  if (Math.random() > config.success) {
    throw new Error(`Flight booking failed with ${provider}`);
  }

  return {
    provider,
    providerId: config.providerId + generateId(),
    status: 'success',
    rawResponse: {
      pnr: 'ABC123',
      tickets: ['123-4567890123'],
      status: 'confirmed'
    },
    fallbackUsed: request.useAlternativeProvider
  };
}

async function bookHotel(request: BookingRequest, provider: string): Promise<Omit<ProviderResponse, 'responseTime'>> {
  const hotelProviders = {
    'booking': { success: 0.92, providerId: 'BK-' },
    'expedia': { success: 0.88, providerId: 'EX-' },
    'hotels': { success: 0.85, providerId: 'HT-' }
  };

  const config = hotelProviders[provider as keyof typeof hotelProviders] || hotelProviders.booking;
  
  if (Math.random() > config.success) {
    throw new Error(`Hotel booking failed with ${provider}`);
  }

  return {
    provider,
    providerId: config.providerId + generateId(),
    status: 'success',
    rawResponse: {
      reservationId: 'HTL789',
      roomNumbers: ['1205'],
      status: 'guaranteed'
    },
    fallbackUsed: request.useAlternativeProvider
  };
}

async function bookActivity(request: BookingRequest, provider: string): Promise<Omit<ProviderResponse, 'responseTime'>> {
  const activityProviders = {
    'viator': { success: 0.90, providerId: 'VT-' },
    'getyourguide': { success: 0.88, providerId: 'GG-' },
    'klook': { success: 0.85, providerId: 'KL-' }
  };

  const config = activityProviders[provider as keyof typeof activityProviders] || activityProviders.viator;
  
  if (Math.random() > config.success) {
    throw new Error(`Activity booking failed with ${provider}`);
  }

  return {
    provider,
    providerId: config.providerId + generateId(),
    status: 'success',
    rawResponse: {
      bookingRef: 'ACT456',
      vouchers: ['voucher123.pdf'],
      status: 'confirmed'
    },
    fallbackUsed: request.useAlternativeProvider
  };
}

async function bookRestaurant(request: BookingRequest, provider: string): Promise<Omit<ProviderResponse, 'responseTime'>> {
  const restaurantProviders = {
    'opentable': { success: 0.95, providerId: 'OT-' },
    'resy': { success: 0.90, providerId: 'RS-' },
    'direct': { success: 0.80, providerId: 'DR-' }
  };

  const config = restaurantProviders[provider as keyof typeof restaurantProviders] || restaurantProviders.opentable;
  
  if (Math.random() > config.success) {
    throw new Error(`Restaurant booking failed with ${provider}`);
  }

  return {
    provider,
    providerId: config.providerId + generateId(),
    status: 'success',
    rawResponse: {
      reservationId: 'RST789',
      tableNumber: '12',
      status: 'confirmed'
    },
    fallbackUsed: request.useAlternativeProvider
  };
}

async function bookTransport(request: BookingRequest, provider: string): Promise<Omit<ProviderResponse, 'responseTime'>> {
  const transportProviders = {
    'uber': { success: 0.90, providerId: 'UB-' },
    'lyft': { success: 0.88, providerId: 'LF-' },
    'taxi': { success: 0.85, providerId: 'TX-' }
  };

  const config = transportProviders[provider as keyof typeof transportProviders] || transportProviders.uber;
  
  if (Math.random() > config.success) {
    throw new Error(`Transport booking failed with ${provider}`);
  }

  return {
    provider,
    providerId: config.providerId + generateId(),
    status: 'success',
    rawResponse: {
      rideId: 'TRP123',
      driverInfo: { name: 'John Doe', vehicle: 'Toyota Prius' },
      status: 'confirmed'
    },
    fallbackUsed: request.useAlternativeProvider
  };
}

/**
 * Get providers by item type with fallback options
 */
function getProvidersByType(itemType: string, useAlternative?: boolean): string[] {
  const providerConfig = {
    flight: ['amadeus', 'sabre', 'travelport'],
    hotel: ['booking', 'expedia', 'hotels'],
    activity: ['viator', 'getyourguide', 'klook'],
    restaurant: ['opentable', 'resy', 'direct'],
    transport: ['uber', 'lyft', 'taxi']
  };

  const providers = providerConfig[itemType as keyof typeof providerConfig] || ['default'];
  
  return useAlternative ? providers.slice(1) : providers;
}

/**
 * Generate booking details
 */
async function generateBookingDetails(request: BookingRequest): Promise<BookingDetails> {
  // Mock booking details based on item type
  const baseDetails = {
    itemId: request.itemId,
    type: request.itemType,
    title: `${request.itemType.charAt(0).toUpperCase() + request.itemType.slice(1)} Booking`,
    description: `Confirmed ${request.itemType} booking`,
    dateTime: new Date().toISOString(),
    location: 'Destination Location',
    duration: '2 hours',
    capacity: 2,
    specialRequests: []
  };

  return baseDetails;
}

/**
 * Calculate booking cost
 */
async function calculateBookingCost(request: BookingRequest): Promise<{
  amount: number;
  currency: string;
  breakdown?: CostBreakdown;
}> {
  
  // Mock cost calculation based on item type
  const baseCosts = {
    flight: 450,
    hotel: 200, // per night
    activity: 75,
    restaurant: 65,
    transport: 25
  };

  const basePrice = baseCosts[request.itemType as keyof typeof baseCosts] || 100;
  const taxes = Math.round(basePrice * 0.12);
  const fees = Math.round(basePrice * 0.05);
  const total = basePrice + taxes + fees;

  return {
    amount: total,
    currency: 'USD',
    breakdown: {
      basePrice,
      taxes,
      fees,
      total
    }
  };
}

/**
 * Generate vouchers and confirmations
 */
async function generateVouchers(request: BookingRequest, bookingId: string): Promise<VoucherInfo[]> {
  const vouchers: VoucherInfo[] = [];

  // Generate vouchers based on item type
  switch (request.itemType) {
    case 'flight':
      vouchers.push({
        type: 'eticket',
        format: 'pdf',
        content: `e-ticket-${bookingId}.pdf`,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });
      break;
    
    case 'hotel':
      vouchers.push({
        type: 'confirmation',
        format: 'pdf',
        content: `hotel-confirmation-${bookingId}.pdf`
      });
      break;
    
    case 'activity':
      vouchers.push({
        type: 'voucher',
        format: 'qr',
        content: `QR_${bookingId}`,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      break;
    
    default:
      vouchers.push({
        type: 'confirmation',
        format: 'text',
        content: `Confirmation: ${generateConfirmationNumber(request.itemType)}`
      });
  }

  return vouchers;
}

/**
 * Get cancellation policy by item type
 */
function getCancellationPolicy(itemType: string): CancellationPolicy {
  const policies = {
    flight: {
      cancellable: true,
      refundable: false,
      deadlineHours: 24,
      refundPercentage: 0,
      penalties: ['Change fee may apply']
    },
    hotel: {
      cancellable: true,
      refundable: true,
      deadlineHours: 48,
      refundPercentage: 100,
      penalties: []
    },
    activity: {
      cancellable: true,
      refundable: true,
      deadlineHours: 24,
      refundPercentage: 90,
      penalties: ['10% cancellation fee']
    },
    restaurant: {
      cancellable: true,
      refundable: true,
      deadlineHours: 4,
      refundPercentage: 100,
      penalties: []
    },
    transport: {
      cancellable: true,
      refundable: true,
      deadlineHours: 1,
      refundPercentage: 100,
      penalties: []
    }
  };

  return policies[itemType as keyof typeof policies] || policies.activity;
}

/**
 * Get booking status
 */
async function getBookingStatus(bookingId?: string | null, itemId?: string | null): Promise<BookingResponse> {
  // Mock booking status response
  return {
    success: true,
    bookingId: bookingId || `book_${Date.now()}`,
    status: 'confirmed',
    confirmationNumber: 'ABC123',
    providerResponse: {
      provider: 'amadeus',
      providerId: 'AM-12345',
      responseTime: 2500,
      status: 'success'
    },
    bookingDetails: {
      itemId: itemId || 'item_123',
      type: 'flight',
      title: 'Flight Booking',
      description: 'Confirmed flight booking',
      dateTime: new Date().toISOString(),
      location: 'Airport',
      duration: '3h 45m',
      capacity: 1
    },
    cost: {
      amount: 503,
      currency: 'USD',
      breakdown: {
        basePrice: 450,
        taxes: 54,
        fees: 23,
        total: 503
      }
    },
    vouchers: [
      {
        type: 'eticket',
        format: 'pdf',
        content: 'e-ticket-abc123.pdf'
      }
    ],
    cancellationPolicy: getCancellationPolicy('flight'),
    timestamp: new Date().toISOString()
  };
}

/**
 * Utility functions
 */
function generateBookingId(): string {
  return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateConfirmationNumber(itemType: string): string {
  const prefixes = {
    flight: 'FL',
    hotel: 'HT',
    activity: 'AC',
    restaurant: 'RS',
    transport: 'TR'
  };
  
  const prefix = prefixes[itemType as keyof typeof prefixes] || 'BK';
  const number = Math.random().toString(36).substr(2, 6).toUpperCase();
  
  return `${prefix}-${number}`;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
} 