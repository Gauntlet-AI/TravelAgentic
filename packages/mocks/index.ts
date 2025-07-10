/**
 * TravelAgentic Mock Services
 * Main export file for all mock services and utilities
 */

// Export all types
export * from './types';

// Export data sources
export * from './data/airports';

// Export services
export { MockFlightService } from './services/flight-service';
export { MockHotelService } from './services/hotel-service';
export { MockActivityService } from './services/activity-service';
export { MockPaymentService } from './services/payment-service';

// Export factory (explicitly to avoid conflicts)
export { 
  ServiceFactory, 
  getServiceFactory, 
  getFlightService, 
  getHotelService, 
  getActivityService, 
  getPaymentService,
  getPhaseConfig 
} from './factories/service-factory';

// Export utilities
// export * from './utils/mock-helpers';

/**
 * Quick setup function for Phase 1 development
 */
export function setupMockServices() {
  // Set environment variables for Phase 1
  process.env.USE_MOCK_APIS = 'true';
  process.env.DEVELOPMENT_PHASE = '1';
  
  return {
    flightService: require('./factories/service-factory').getFlightService(),
    hotelService: require('./factories/service-factory').getHotelService(),
    activityService: require('./factories/service-factory').getActivityService(),
    paymentService: require('./factories/service-factory').getPaymentService(),
  };
} 