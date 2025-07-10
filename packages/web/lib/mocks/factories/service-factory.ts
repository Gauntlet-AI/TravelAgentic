/**
 * Service Factory for TravelAgentic
 * Provides environment-based service selection between mock and real APIs
 */

import { 
  IFlightService, 
  IHotelService, 
  IActivityService, 
  IPaymentService,
  MockConfig 
} from '../types';
import { MockFlightService } from '../services/flight-service';
import { MockHotelService } from '../services/hotel-service';
import { MockActivityService } from '../services/activity-service';
import { MockPaymentService } from '../services/payment-service';

// Real API services (to be implemented in Phase 2)
// import { TequilaFlightService } from '../../real-apis/tequila-flight-service';
// import { BookingHotelService } from '../../real-apis/booking-hotel-service';
// import { ViatorActivityService } from '../../real-apis/viator-activity-service';
// import { StripePaymentService } from '../../real-apis/stripe-payment-service';

/**
 * Configuration for the service factory
 */
interface ServiceFactoryConfig {
  useMockApis: boolean;
  developmentPhase: number;
  mockConfig: MockConfig;
}

/**
 * Service Factory class that provides service instances based on configuration
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private config: ServiceFactoryConfig;

  private constructor(config: ServiceFactoryConfig) {
    this.config = config;
  }

  /**
   * Get singleton instance of ServiceFactory
   */
  public static getInstance(config?: ServiceFactoryConfig): ServiceFactory {
    if (!ServiceFactory.instance) {
      const defaultConfig: ServiceFactoryConfig = {
        useMockApis: process.env.USE_MOCK_APIS === 'true',
        developmentPhase: parseInt(process.env.DEVELOPMENT_PHASE || '1'),
        mockConfig: {
          failureRate: parseFloat(process.env.MOCK_FAILURE_RATE || '0.05'),
          responseDelay: {
            min: parseInt(process.env.MOCK_DELAY_MIN || '800'),
            max: parseInt(process.env.MOCK_DELAY_MAX || '2500')
          },
          enableRealisticData: process.env.MOCK_REALISTIC_DATA !== 'false',
          enablePriceFluctuation: process.env.MOCK_PRICE_FLUCTUATION !== 'false'
        }
      };

      ServiceFactory.instance = new ServiceFactory(config || defaultConfig);
    }
    return ServiceFactory.instance;
  }

  /**
   * Get flight service instance based on configuration
   */
  public getFlightService(): IFlightService {
    if (this.config.useMockApis || this.config.developmentPhase === 1) {
      return new MockFlightService(this.config.mockConfig);
    }

    // Phase 2: Real flight API (Tequila)
    // if (this.config.developmentPhase >= 2) {
    //   return new TequilaFlightService();
    // }

    // Fallback to mock service
    return new MockFlightService(this.config.mockConfig);
  }

  /**
   * Get hotel service instance based on configuration
   */
  public getHotelService(): IHotelService {
    if (this.config.useMockApis || this.config.developmentPhase === 1) {
      return new MockHotelService(this.config.mockConfig);
    }

    // Phase 2: Real hotel API (Booking.com)
    // if (this.config.developmentPhase >= 2) {
    //   return new BookingHotelService();
    // }

    // Fallback to mock service
    return new MockHotelService(this.config.mockConfig);
  }

  /**
   * Get activity service instance based on configuration
   */
  public getActivityService(): IActivityService {
    if (this.config.useMockApis || this.config.developmentPhase === 1) {
      return new MockActivityService(this.config.mockConfig);
    }

    // Phase 2: Real activity API (Viator)
    // if (this.config.developmentPhase >= 2) {
    //   return new ViatorActivityService();
    // }

    // Fallback to mock service
    return new MockActivityService(this.config.mockConfig);
  }

  /**
   * Get payment service instance based on configuration
   */
  public getPaymentService(): IPaymentService {
    if (this.config.useMockApis || this.config.developmentPhase <= 2) {
      return new MockPaymentService(this.config.mockConfig);
    }

    // Phase 3: Real payment API (Stripe)
    // if (this.config.developmentPhase >= 3) {
    //   return new StripePaymentService();
    // }

    // Fallback to mock service
    return new MockPaymentService(this.config.mockConfig);
  }

  /**
   * Update configuration (useful for testing)
   */
  public updateConfig(config: Partial<ServiceFactoryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): ServiceFactoryConfig {
    return { ...this.config };
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  public static reset(): void {
    ServiceFactory.instance = null as any;
  }
}

/**
 * Convenience function to get service factory instance
 */
export function getServiceFactory(config?: ServiceFactoryConfig): ServiceFactory {
  return ServiceFactory.getInstance(config);
}

/**
 * Convenience functions to get individual services
 */
export function getFlightService(): IFlightService {
  return ServiceFactory.getInstance().getFlightService();
}

export function getHotelService(): IHotelService {
  return ServiceFactory.getInstance().getHotelService();
}

export function getActivityService(): IActivityService {
  return ServiceFactory.getInstance().getActivityService();
}

export function getPaymentService(): IPaymentService {
  return ServiceFactory.getInstance().getPaymentService();
}

/**
 * Phase-based configuration helper
 */
export function getPhaseConfig(phase: number): ServiceFactoryConfig {
  const phaseConfigs = {
    1: { 
      useMockApis: true, 
      developmentPhase: 1,
      mockConfig: {
        failureRate: 0.05,
        responseDelay: { min: 800, max: 2500 },
        enableRealisticData: true,
        enablePriceFluctuation: true
      }
    },
    2: { 
      useMockApis: false, 
      developmentPhase: 2,
      mockConfig: {
        failureRate: 0.02,
        responseDelay: { min: 500, max: 1500 },
        enableRealisticData: true,
        enablePriceFluctuation: true
      }
    },
    3: { 
      useMockApis: false, 
      developmentPhase: 3,
      mockConfig: {
        failureRate: 0.01,
        responseDelay: { min: 300, max: 1000 },
        enableRealisticData: true,
        enablePriceFluctuation: false
      }
    }
  };
  
  return phaseConfigs[phase as keyof typeof phaseConfigs] || phaseConfigs[1];
} 