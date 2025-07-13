/**
 * Amadeus API TypeScript Types
 * Based on Amadeus Test API documentation
 */

// ==============================================================================
// AUTHENTICATION TYPES
// ==============================================================================

export interface AmadeusAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  state: string;
  application_name: string;
}

export interface AmadeusError {
  status: number;
  code: number;
  title: string;
  detail: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
}

export interface AmadeusApiError {
  errors: AmadeusError[];
}

// ==============================================================================
// FLIGHT TYPES
// ==============================================================================

export interface AmadeusFlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  includedAirlineCodes?: string[];
  excludedAirlineCodes?: string[];
  nonStop?: boolean;
  maxPrice?: number;
  max?: number;
  currencyCode?: string;
}

export interface AmadeusFlightOffer {
  type: 'flight-offer';
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  lastTicketingDateTime: string;
  numberOfBookableSeats: number;
  itineraries: AmadeusItinerary[];
  price: AmadeusPrice;
  pricingOptions: AmadeusPricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: AmadeusTravelerPricing[];
}

export interface AmadeusItinerary {
  duration: string;
  segments: AmadeusSegment[];
}

export interface AmadeusSegment {
  departure: AmadeusFlightPoint;
  arrival: AmadeusFlightPoint;
  carrierCode: string;
  number: string;
  aircraft: AmadeusAircraft;
  operating?: AmadeusOperating;
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface AmadeusFlightPoint {
  iataCode: string;
  terminal?: string;
  at: string;
}

export interface AmadeusAircraft {
  code: string;
}

export interface AmadeusOperating {
  carrierCode: string;
}

export interface AmadeusPrice {
  currency: string;
  total: string;
  base: string;
  fees: AmadeusFee[];
  grandTotal: string;
}

export interface AmadeusFee {
  amount: string;
  type: string;
}

export interface AmadeusPricingOptions {
  fareType: string[];
  includedCheckedBagsOnly: boolean;
}

export interface AmadeusTravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: AmadeusPrice;
  fareDetailsBySegment: AmadeusFareDetails[];
}

export interface AmadeusFareDetails {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  class: string;
  includedCheckedBags: AmadeusCheckedBags;
}

export interface AmadeusCheckedBags {
  weight?: number;
  weightUnit?: string;
  quantity?: number;
}

export interface AmadeusFlightSearchResponse {
  meta: {
    count: number;
    links?: {
      self: string;
      next?: string;
    };
  };
  data: AmadeusFlightOffer[];
  dictionaries: {
    locations: Record<string, AmadeusLocation>;
    aircraft: Record<string, AmadeusAircraftInfo>;
    currencies: Record<string, string>;
    carriers: Record<string, string>;
  };
}

export interface AmadeusLocation {
  cityCode: string;
  countryCode: string;
}

export interface AmadeusAircraftInfo {
  code: string;
  name: string;
}

// ==============================================================================
// HOTEL TYPES
// ==============================================================================

export interface AmadeusHotelSearchParams {
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  radiusUnit?: 'KM' | 'MI';
  chainCodes?: string[];
  amenities?: string[];
  ratings?: number[];
  hotelSource?: 'ALL' | 'BEDBANK' | 'DIRECTCHAIN';
}

export interface AmadeusHotelOffersParams {
  hotelIds: string[];
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  childAges?: number[];
  roomQuantity?: number;
  priceRange?: string;
  currency?: string;
  lang?: string;
  bestRateOnly?: boolean;
  view?: 'FULL' | 'FULL_ALL_RATES';
}

export interface AmadeusHotel {
  type: 'hotel';
  hotelId: string;
  chainCode: string;
  dupeId: string;
  name: string;
  rating: number;
  cityCode: string;
  latitude: number;
  longitude: number;
  hotelDistance: {
    distance: number;
    distanceUnit: string;
  };
  address: AmadeusAddress;
  contact: AmadeusContact;
  description: {
    lang: string;
    text: string;
  };
  amenities: string[];
  media: AmadeusMedia[];
}

export interface AmadeusAddress {
  lines: string[];
  postalCode: string;
  cityName: string;
  countryCode: string;
  stateCode?: string;
}

export interface AmadeusContact {
  phone: string;
  fax?: string;
  email?: string;
}

export interface AmadeusMedia {
  uri: string;
  category: string;
}

export interface AmadeusHotelOffer {
  type: 'hotel-offer';
  hotel: AmadeusHotel;
  available: boolean;
  offers: AmadeusRoomOffer[];
  self: string;
}

export interface AmadeusRoomOffer {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  rateCode: string;
  rateFamilyEstimated: {
    code: string;
    type: string;
  };
  room: AmadeusRoom;
  guests: AmadeusGuests;
  price: AmadeusPrice;
  policies: AmadeusPolicies;
  self: string;
}

export interface AmadeusRoom {
  type: string;
  typeEstimated: {
    category: string;
    beds: number;
    bedType: string;
  };
  description: {
    text: string;
    lang: string;
  };
}

export interface AmadeusGuests {
  adults: number;
  childAges?: number[];
}

export interface AmadeusPolicies {
  paymentType: string;
  guarantee?: {
    acceptedPayments: {
      creditCards: string[];
      methods: string[];
    };
  };
  deposit?: {
    acceptedPayments: {
      creditCards: string[];
      methods: string[];
    };
    amount: string;
  };
  prepay?: {
    acceptedPayments: {
      creditCards: string[];
      methods: string[];
    };
    amount: string;
  };
  holdTime?: {
    deadline: string;
  };
  cancellation?: {
    deadline: string;
    amount: string;
    type: string;
  };
}

export interface AmadeusHotelSearchResponse {
  data: AmadeusHotel[];
  meta: {
    count: number;
    links?: {
      self: string;
      next?: string;
    };
  };
}

export interface AmadeusHotelOffersResponse {
  data: AmadeusHotelOffer[];
  meta: {
    count: number;
    links?: {
      self: string;
      next?: string;
    };
  };
}

// ==============================================================================
// ACTIVITIES/POI TYPES
// ==============================================================================

export interface AmadeusActivitySearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number;
  north?: number;
  west?: number;
  south?: number;
  east?: number;
  categories?: string[];
  source?: 'FOURSQUARE' | 'POIS';
}

export interface AmadeusToursActivitiesParams {
  latitude?: number;
  longitude?: number;
  radius?: number;
  categoryCode?: string;
  subcategoryCode?: string;
  currencyCode?: string;
  destination?: string;
  minimumDuration?: string;
  maximumDuration?: string;
  minimumPrice?: number;
  maximumPrice?: number;
  availabilityDateFrom?: string;
  availabilityDateTo?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AmadeusPointOfInterest {
  type: 'location';
  subType: 'POINT_OF_INTEREST';
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  geoCode: {
    latitude: number;
    longitude: number;
  };
  name: string;
  category: string;
  rank: number;
  tags: string[];
}

export interface AmadeusActivity {
  type: 'activity';
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  name: string;
  shortDescription: string;
  description: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  pictures: string[];
  bookingLink: string;
  price: {
    currencyCode: string;
    amount: string;
  };
  minimumDuration: string;
  maximumDuration: string;
  categoryCode: string;
  subcategoryCode: string;
  availabilityDateFrom: string;
  availabilityDateTo: string;
}

export interface AmadeusActivitySearchResponse {
  data: AmadeusPointOfInterest[];
  meta: {
    count: number;
    links?: {
      self: string;
      next?: string;
    };
  };
}

export interface AmadeusToursActivitiesResponse {
  data: AmadeusActivity[];
  meta: {
    count: number;
    links?: {
      self: string;
      next?: string;
    };
  };
}

// ==============================================================================
// UTILITY TYPES
// ==============================================================================

export interface AmadeusApiResponse<T> {
  data: T;
  meta: {
    count: number;
    links?: {
      self: string;
      next?: string;
    };
  };
}

export interface AmadeusClientConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  rateLimitDelay?: number;
}

export interface AmadeusRateLimitState {
  requestCount: number;
  resetTime: number;
  lastRequestTime: number;
} 