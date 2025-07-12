/**
 * Core types and interfaces for TravelAgentic services
 * These interfaces are implemented by both mock and real API services
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

export interface Location {
  code: string;
  name: string;
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Price {
  amount: number;
  currency: string;
  displayPrice: string;
}

export interface SearchFilters {
  priceRange?: [number, number];
  rating?: number;
  categories?: string[];
  amenities?: string[];
  sortBy?: 'price' | 'rating' | 'duration' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: 'api' | 'browser' | 'voice' | 'manual';
  responseTime?: number;
}

// =============================================================================
// FLIGHT TYPES
// =============================================================================

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabin: 'economy' | 'premium' | 'business' | 'first';
  directFlightsOnly?: boolean;
  maxStops?: number;
  preferredAirlines?: string[];
  filters?: SearchFilters;
}

export interface FlightSegment {
  airline: string;
  flightNumber: string;
  aircraft: string;
  departure: {
    airport: Location;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: Location;
    time: string;
    terminal?: string;
  };
  duration: string;
  cabin: string;
  timezoneInfo?: {
    departureTimezone: string;
    arrivalTimezone: string;
    timezoneChange: number;
    nextDay: boolean;
  };
}

export interface FlightResult {
  id: string;
  segments: FlightSegment[];
  price: Price;
  totalDuration: string;
  stops: number;
  layovers?: Array<{
    airport: Location;
    duration: string;
  }>;
  baggage: {
    carry: string;
    checked: string;
  };
  cancellationPolicy: string;
  source: 'api' | 'browser' | 'voice' | 'manual';
  bookingUrl?: string;
  deepLink?: string;
}

export interface IFlightService {
  search(params: FlightSearchParams): Promise<ServiceResponse<FlightResult[]>>;
  getDetails(flightId: string): Promise<ServiceResponse<FlightResult>>;
  checkAvailability(flightId: string): Promise<ServiceResponse<boolean>>;
}

// =============================================================================
// HOTEL TYPES
// =============================================================================

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  starRating?: number[];
  amenities?: string[];
  propertyTypes?: string[];
  maxDistance?: number; // km from city center
  filters?: SearchFilters;
}

export interface HotelResult {
  id: string;
  name: string;
  starRating: number;
  rating: {
    score: number;
    reviewCount: number;
    reviewSummary: string;
  };
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    distanceFromCenter: number;
  };
  price: Price;
  priceBreakdown: {
    basePrice: number;
    taxes: number;
    fees: number;
    total: number;
  };
  images: string[];
  amenities: string[];
  roomTypes: Array<{
    name: string;
    description: string;
    maxOccupancy: number;
    bedType: string;
    roomSize: string;
    price: Price;
  }>;
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    petPolicy?: string;
  };
  description: string;
  highlights: string[];
  source: 'api' | 'browser' | 'voice' | 'manual';
  bookingUrl?: string;
  deepLink?: string;
}

export interface IHotelService {
  search(params: HotelSearchParams): Promise<ServiceResponse<HotelResult[]>>;
  getDetails(hotelId: string): Promise<ServiceResponse<HotelResult>>;
  checkAvailability(hotelId: string, checkIn: string, checkOut: string): Promise<ServiceResponse<boolean>>;
}

// =============================================================================
// ACTIVITY TYPES
// =============================================================================

export interface ActivitySearchParams {
  destination: string;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  duration?: {
    min?: number; // hours
    max?: number; // hours
  };
  groupSize?: number;
  accessibility?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  filters?: SearchFilters;
}

export interface ActivityResult {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  categories: string[];
  duration: {
    value: number;
    unit: 'hours' | 'days';
    description: string;
  };
  price: Price;
  priceIncludes: string[];
  priceExcludes: string[];
  rating: {
    score: number;
    reviewCount: number;
    reviewSummary: string;
  };
  location: {
    name: string;
    address: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  highlights: string[];
  included: string[];
  requirements: string[];
  restrictions: string[];
  meetingPoint: string;
  cancellationPolicy: string;
  availability: {
    nextAvailable: string;
    schedule: string;
  };
  groupSize: {
    min: number;
    max: number;
  };
  languages: string[];
  accessibility: string[];
  source: 'api' | 'browser' | 'voice' | 'manual';
  bookingUrl?: string;
  deepLink?: string;
}

export interface IActivityService {
  search(params: ActivitySearchParams): Promise<ServiceResponse<ActivityResult[]>>;
  getDetails(activityId: string): Promise<ServiceResponse<ActivityResult>>;
  checkAvailability(activityId: string, date: string): Promise<ServiceResponse<boolean>>;
  getCategories(): Promise<ServiceResponse<string[]>>;
}

// =============================================================================
// PAYMENT TYPES
// =============================================================================

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface BookingItem {
  type: 'flight' | 'hotel' | 'activity';
  id: string;
  name: string;
  price: Price;
  details: any; // Specific to item type
}

export interface BookingRequest {
  items: BookingItem[];
  paymentMethod: PaymentMethod;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
}

export interface BookingResult {
  id: string;
  status: 'confirmed' | 'pending' | 'failed' | 'cancelled';
  confirmationNumber: string;
  totalPrice: Price;
  items: BookingItem[];
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
  source: 'api' | 'browser' | 'voice' | 'manual';
}

export interface IPaymentService {
  processBooking(booking: BookingRequest): Promise<ServiceResponse<BookingResult>>;
  getBookingStatus(bookingId: string): Promise<ServiceResponse<BookingResult>>;
  cancelBooking(bookingId: string): Promise<ServiceResponse<boolean>>;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface MockConfig {
  failureRate: number; // 0-1, percentage of requests that should fail
  responseDelay: {
    min: number; // milliseconds
    max: number; // milliseconds
  };
  enableRealisticData: boolean;
  enablePriceFluctuation: boolean;
}

export interface ServiceFactory {
  getFlightService(): IFlightService;
  getHotelService(): IHotelService;
  getActivityService(): IActivityService;
  getPaymentService(): IPaymentService;
} 