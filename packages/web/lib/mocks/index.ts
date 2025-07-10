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