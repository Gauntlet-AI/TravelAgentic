/**
 * Amadeus API Integration
 * 
 * This module provides comprehensive integration with the Amadeus Travel API
 * including flight search, hotel search, and activity search capabilities.
 * 
 * Features:
 * - OAuth2 authentication with automatic token refresh
 * - Rate limiting (10 TPS for test environment, 40 TPS for production)
 * - Comprehensive error handling with retry logic
 * - Service interfaces compatible with TravelAgentic mock services
 * - Support for both test and production environments
 * 
 * Usage:
 * ```typescript
 * import { createAmadeusClient, AmadeusFlightService } from '@/lib/amadeus';
 * 
 * const client = createAmadeusClient();
 * const flightService = new AmadeusFlightService(client);
 * 
 * const results = await flightService.search({
 *   origin: 'NYC',
 *   destination: 'LAX',
 *   departureDate: '2024-06-01',
 *   passengers: { adults: 1, children: 0, infants: 0 },
 *   cabin: 'economy'
 * });
 * ```
 */

// Core client and types
export { AmadeusClient, createAmadeusClient } from './client';
export * from './types';

// Service implementations
export { AmadeusFlightService } from './services/flight-service';
export { AmadeusHotelService } from './services/hotel-service';
export { AmadeusActivityService } from './services/activity-service';

// Re-export common interfaces for convenience
export type {
  IFlightService,
  IHotelService,
  IActivityService,
  FlightSearchParams,
  HotelSearchParams,
  ActivitySearchParams,
  FlightResult,
  HotelResult,
  ActivityResult,
  ServiceResponse,
} from '@/lib/mocks/types';

/**
 * Environment configuration helper
 */
export function getAmadeusConfig() {
  return {
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,
    environment: process.env.AMADEUS_ENVIRONMENT || 'test',
    isProduction: process.env.AMADEUS_ENVIRONMENT === 'production',
    isConfigured: !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET),
  };
}

/**
 * Validation helper to check if Amadeus is properly configured
 */
export function validateAmadeusConfig(): boolean {
  const config = getAmadeusConfig();
  
  if (!config.isConfigured) {
    console.warn('Amadeus API is not configured. Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET environment variables.');
    return false;
  }
  
  return true;
} 