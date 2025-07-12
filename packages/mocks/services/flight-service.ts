/**
 * Mock Flight Service Implementation
 * Provides realistic flight search functionality with configurable delays and failures
 */

import { 
  IFlightService, 
  FlightSearchParams, 
  FlightResult, 
  ServiceResponse, 
  FlightSegment,
  MockConfig,
  Price
} from '../types';
import { getAirportByCode, searchAirports } from '../data/airports';
import { calculateFlightArrival, getAirportTimezone, formatWithTimezone, createTimezoneAwareISOString } from '../../web/lib/timezone-utils';

/**
 * Airlines data for generating realistic flight results
 */
const airlines = [
  { code: 'AA', name: 'American Airlines', alliance: 'oneworld' },
  { code: 'DL', name: 'Delta Air Lines', alliance: 'skyteam' },
  { code: 'UA', name: 'United Airlines', alliance: 'star' },
  { code: 'WN', name: 'Southwest Airlines', alliance: 'none' },
  { code: 'B6', name: 'JetBlue Airways', alliance: 'none' },
  { code: 'AS', name: 'Alaska Airlines', alliance: 'oneworld' },
  { code: 'F9', name: 'Frontier Airlines', alliance: 'none' },
  { code: 'NK', name: 'Spirit Airlines', alliance: 'none' },
  { code: 'BA', name: 'British Airways', alliance: 'oneworld' },
  { code: 'LH', name: 'Lufthansa', alliance: 'star' },
  { code: 'AF', name: 'Air France', alliance: 'skyteam' },
  { code: 'KL', name: 'KLM', alliance: 'skyteam' },
  { code: 'EK', name: 'Emirates', alliance: 'none' },
  { code: 'SQ', name: 'Singapore Airlines', alliance: 'star' },
  { code: 'CX', name: 'Cathay Pacific', alliance: 'oneworld' },
  { code: 'JL', name: 'Japan Airlines', alliance: 'oneworld' },
  { code: 'NH', name: 'ANA', alliance: 'star' }
];

/**
 * Aircraft types for realistic flight segments
 */
const aircraftTypes = [
  'Boeing 737-800', 'Boeing 737-900', 'Boeing 757-200', 'Boeing 767-300',
  'Boeing 777-200', 'Boeing 777-300', 'Boeing 787-8', 'Boeing 787-9',
  'Airbus A320', 'Airbus A321', 'Airbus A330-200', 'Airbus A330-300',
  'Airbus A350-900', 'Airbus A380-800', 'Embraer E175', 'Embraer E190'
];

export class MockFlightService implements IFlightService {
  private config: MockConfig;

  constructor(config: MockConfig = {
    failureRate: 0.05,
    responseDelay: { min: 800, max: 2500 },
    enableRealisticData: true,
    enablePriceFluctuation: true
  }) {
    this.config = config;
  }

  /**
   * Search for flights based on parameters
   */
  async search(params: FlightSearchParams): Promise<ServiceResponse<FlightResult[]>> {
    const startTime = Date.now();

    try {
      // Simulate API delay
      await this.simulateDelay();

      // Simulate failures for testing fallback mechanisms
      if (this.shouldSimulateFailure()) {
        throw new Error('Mock API failure for testing');
      }

      // Validate airports
      const originAirport = getAirportByCode(params.origin);
      const destinationAirport = getAirportByCode(params.destination);

      if (!originAirport || !destinationAirport) {
        return {
          success: false,
          error: 'Invalid airport codes provided',
          responseTime: Date.now() - startTime
        };
      }

      // Generate flight results
      const flights = this.generateFlightResults(params, originAirport, destinationAirport);

      return {
        success: true,
        data: flights,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get detailed information about a specific flight
   */
  async getDetails(flightId: string): Promise<ServiceResponse<FlightResult>> {
    const startTime = Date.now();

    try {
      await this.simulateDelay();

      if (this.shouldSimulateFailure()) {
        throw new Error('Mock API failure for testing');
      }

      // In a real implementation, this would fetch from a database
      // For now, we'll generate a sample flight
      const flight = this.generateSampleFlight(flightId);

      return {
        success: true,
        data: flight,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check if a flight is still available for booking
   */
  async checkAvailability(flightId: string): Promise<ServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      await this.simulateDelay();

      if (this.shouldSimulateFailure()) {
        throw new Error('Mock API failure for testing');
      }

      // Simulate 85% availability rate
      const isAvailable = Math.random() > 0.15;

      return {
        success: true,
        data: isAvailable,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generate realistic flight results based on search parameters
   */
  private generateFlightResults(
    params: FlightSearchParams, 
    origin: any, 
    destination: any
  ): FlightResult[] {
    const flights: FlightResult[] = [];
    const numResults = Math.floor(Math.random() * 8) + 5; // 5-12 results

    for (let i = 0; i < numResults; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const aircraft = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
      
      // Generate flight segments (direct or with stops)
      const segments = this.generateFlightSegments(params, origin, destination, airline, aircraft);
      
      // Calculate pricing based on various factors
      const price = this.calculatePrice(params, segments);
      
      flights.push({
        id: `flight-${i + 1}-${Date.now()}`,
        segments,
        price,
        totalDuration: this.calculateTotalDuration(segments),
        stops: segments.length - 1,
        layovers: this.generateLayovers(segments),
        baggage: this.generateBaggageInfo(airline.code, params.cabin),
        cancellationPolicy: this.generateCancellationPolicy(airline.code),
        source: 'api',
        bookingUrl: `https://mock-booking.com/flight/${i + 1}`,
        deepLink: `travelagentic://flight/${i + 1}`
      });
    }

    // Sort by price by default
    return flights.sort((a, b) => a.price.amount - b.price.amount);
  }

  /**
   * Generate flight segments (handles direct flights and connections)
   */
  private generateFlightSegments(
    params: FlightSearchParams,
    origin: any,
    destination: any,
    airline: any,
    aircraft: string
  ): FlightSegment[] {
    const segments: FlightSegment[] = [];
    
    // Determine if this should be a direct flight or have stops
    const isDirect = params.directFlightsOnly || Math.random() > 0.4;
    
    if (isDirect) {
      // Direct flight
      segments.push(this.createFlightSegment(
        origin, destination, airline, aircraft, params.departureDate, params.cabin
      ));
    } else {
      // Flight with connection
      const connectionAirport = this.selectConnectionAirport(origin, destination);
      
      // First segment
      segments.push(this.createFlightSegment(
        origin, connectionAirport, airline, aircraft, params.departureDate, params.cabin
      ));
      
      // Second segment (with appropriate layover time)
      const layoverTime = Math.floor(Math.random() * 180) + 60; // 1-4 hours
      const secondSegmentTime = this.addMinutes(
        this.parseTime(segments[0].arrival.time), 
        layoverTime
      );
      
      segments.push(this.createFlightSegment(
        connectionAirport, destination, airline, aircraft, 
        params.departureDate, params.cabin, secondSegmentTime
      ));
    }

    return segments;
  }

  /**
   * Create a single flight segment with timezone-aware calculations
   */
  private createFlightSegment(
    origin: any, 
    destination: any, 
    airline: any, 
    aircraft: string, 
    date: string, 
    cabin: string,
    departureTime?: string
  ): FlightSegment {
    const flightNumber = `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`;
    const depTime = departureTime || this.generateRandomTime();
    const duration = this.calculateFlightDuration(origin, destination);

    // Extract just the date part - handle both "2024-12-20" and "2024-12-20T00:00:00.000Z" formats
    const departureDateStr = date.split('T')[0]; // Get just "2024-12-20"
    
    // Create departure datetime
    const departureDateTime = new Date(`${departureDateStr}T${depTime}:00`);

    try {
      // Calculate timezone-aware arrival time
      const flightCalc = calculateFlightArrival(
        departureDateTime,
        duration,
        origin.code,
        destination.code
      );

      // Get timezone abbreviations for display
      const departureTimezone = getAirportTimezone(origin.code);
      const arrivalTimezone = getAirportTimezone(destination.code);

      return {
        airline: airline.name,
        flightNumber,
        aircraft,
        departure: {
          airport: origin,
          time: departureTimezone ? 
            createTimezoneAwareISOString(departureDateTime, departureTimezone) : 
            departureDateTime.toISOString(),
          terminal: this.generateTerminal()
        },
        arrival: {
          airport: destination,
          time: arrivalTimezone ? 
            createTimezoneAwareISOString(flightCalc.arrivalTime, arrivalTimezone) : 
            flightCalc.arrivalTime.toISOString(),
          terminal: this.generateTerminal()
        },
        duration: this.formatDuration(duration),
        cabin,
        // Add timezone metadata for enhanced display
        timezoneInfo: {
          departureTimezone: flightCalc.departureTimezone,
          arrivalTimezone: flightCalc.arrivalTimezone,
          timezoneChange: flightCalc.timezoneChange,
          nextDay: flightCalc.nextDay
        }
      };
    } catch (error) {
      // Fallback to simple time calculation if timezone lookup fails
      console.warn('Timezone calculation failed, using simple time calculation:', error);
      const arrTime = this.addMinutes(depTime, duration);
      
      return {
        airline: airline.name,
        flightNumber,
        aircraft,
        departure: {
          airport: origin,
          time: `${departureDateStr}T${depTime}:00Z`,
          terminal: this.generateTerminal()
        },
        arrival: {
          airport: destination,
          time: `${departureDateStr}T${arrTime}:00Z`,
          terminal: this.generateTerminal()
        },
        duration: this.formatDuration(duration),
        cabin
      };
    }
  }

  /**
   * Calculate realistic flight duration based on distance
   */
  private calculateFlightDuration(origin: any, destination: any): number {
    if (!origin.coordinates || !destination.coordinates) {
      return 240; // Default 4 hours
    }

    const distance = this.calculateDistance(
      origin.coordinates.latitude, origin.coordinates.longitude,
      destination.coordinates.latitude, destination.coordinates.longitude
    );

    // Approximate flight time: distance / average speed + taxi time
    const averageSpeed = 850; // km/h
    const taxiTime = 30; // minutes
    const flightTime = (distance / averageSpeed) * 60; // convert to minutes
    
    return Math.round(flightTime + taxiTime);
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate flight price based on various factors
   */
  private calculatePrice(params: FlightSearchParams, segments: FlightSegment[]): Price {
    let basePrice = 200; // Base price in USD

    // Distance factor
    const totalDistance = segments.reduce((total, segment) => {
      const origin = segment.departure.airport;
      const destination = segment.arrival.airport;
      if (origin.coordinates && destination.coordinates) {
        return total + this.calculateDistance(
          origin.coordinates.latitude, origin.coordinates.longitude,
          destination.coordinates.latitude, destination.coordinates.longitude
        );
      }
      return total + 1000; // Default distance
    }, 0);

    basePrice += totalDistance * 0.1; // $0.10 per km

    // Cabin class multiplier
    const cabinMultipliers = {
      economy: 1.0,
      premium: 1.8,
      business: 3.5,
      first: 6.0
    };
    basePrice *= cabinMultipliers[params.cabin];

    // Stops penalty/bonus
    if (segments.length > 1) {
      basePrice *= 0.8; // 20% discount for connections
    }

    // Date proximity factor (closer dates are more expensive)
    const daysUntilDeparture = Math.ceil(
      (new Date(params.departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDeparture < 7) {
      basePrice *= 1.5; // 50% increase for last-minute bookings
    } else if (daysUntilDeparture < 14) {
      basePrice *= 1.2; // 20% increase
    }

    // Add some randomness for price fluctuation
    if (this.config.enablePriceFluctuation) {
      const fluctuation = (Math.random() - 0.5) * 0.3; // ±15%
      basePrice *= (1 + fluctuation);
    }

    const finalPrice = Math.round(basePrice);
    
    return {
      amount: finalPrice,
      currency: 'USD',
      displayPrice: `$${finalPrice.toLocaleString()}`
    };
  }

  /**
   * Generate realistic baggage information
   */
  private generateBaggageInfo(airlineCode: string, cabin: string): { carry: string; checked: string } {
    const budgetAirlines = ['WN', 'F9', 'NK'];
    const isBudget = budgetAirlines.includes(airlineCode);
    
    if (isBudget) {
      return {
        carry: '1 personal item included',
        checked: 'First bag $35-$45'
      };
    }

    const cabinBaggage: Record<string, { carry: string; checked: string }> = {
      economy: { carry: '1 carry-on + 1 personal item', checked: 'First bag $30' },
      premium: { carry: '1 carry-on + 1 personal item', checked: 'First bag included' },
      business: { carry: '2 carry-on + 1 personal item', checked: '2 bags included' },
      first: { carry: '2 carry-on + 1 personal item', checked: '3 bags included' }
    };

    return cabinBaggage[cabin] || cabinBaggage.economy;
  }

  /**
   * Generate cancellation policy
   */
  private generateCancellationPolicy(airlineCode: string): string {
    const policies = [
      'Free cancellation within 24 hours',
      'Cancellation fee applies',
      'Non-refundable ticket',
      'Refundable with fee',
      'Flexible cancellation'
    ];
    
    return policies[Math.floor(Math.random() * policies.length)];
  }

  /**
   * Helper methods for time and date manipulation
   */
  private generateRandomTime(): string {
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private parseTime(timeStr: string): string {
    // Extract time from ISO string
    return timeStr.split('T')[1].split(':').slice(0, 2).join(':');
  }

  private addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  private calculateTotalDuration(segments: FlightSegment[]): string {
    // Calculate total travel time including layovers
    const firstDeparture = new Date(segments[0].departure.time);
    const lastArrival = new Date(segments[segments.length - 1].arrival.time);
    const totalMinutes = Math.round((lastArrival.getTime() - firstDeparture.getTime()) / 60000);
    return this.formatDuration(totalMinutes);
  }

  private generateLayovers(segments: FlightSegment[]): Array<{ airport: any; duration: string }> {
    if (segments.length <= 1) return [];

    const layovers: Array<{ airport: any; duration: string }> = [];
    for (let i = 0; i < segments.length - 1; i++) {
      const arrivalTime = new Date(segments[i].arrival.time);
      const departureTime = new Date(segments[i + 1].departure.time);
      const layoverMinutes = Math.round((departureTime.getTime() - arrivalTime.getTime()) / 60000);
      
      layovers.push({
        airport: segments[i].arrival.airport,
        duration: this.formatDuration(layoverMinutes)
      });
    }
    
    return layovers;
  }

  private generateTerminal(): string {
    const terminals = ['1', '2', '3', '4', '5', 'A', 'B', 'C', 'D', 'E'];
    return Math.random() > 0.3 ? terminals[Math.floor(Math.random() * terminals.length)] : '';
  }

  private selectConnectionAirport(origin: any, destination: any): any {
    // Select a realistic connection airport (simplified logic)
    const majorHubs = ['ATL', 'ORD', 'DFW', 'LAX', 'JFK', 'SFO', 'LHR', 'CDG', 'FRA', 'AMS'];
    const hubCode = majorHubs[Math.floor(Math.random() * majorHubs.length)];
    return getAirportByCode(hubCode) || origin;
  }

  private generateSampleFlight(flightId: string): FlightResult {
    // Generate a sample flight for the details endpoint
    const airline = airlines[0];
    const aircraft = aircraftTypes[0];
    
    return {
      id: flightId,
      segments: [{
        airline: airline.name,
        flightNumber: `${airline.code}1234`,
        aircraft,
        departure: {
          airport: getAirportByCode('JFK')!,
          time: '2024-07-16T08:00:00Z',
          terminal: '4'
        },
        arrival: {
          airport: getAirportByCode('LAX')!,
          time: '2024-07-16T14:30:00Z',
          terminal: '1'
        },
        duration: '6h 30m',
        cabin: 'economy'
      }],
      price: { amount: 425, currency: 'USD', displayPrice: '$425' },
      totalDuration: '6h 30m',
      stops: 0,
      baggage: { carry: '1 carry-on + 1 personal item', checked: 'First bag $30' },
      cancellationPolicy: 'Free cancellation within 24 hours',
      source: 'api'
    };
  }

  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * (this.config.responseDelay.max - this.config.responseDelay.min) + this.config.responseDelay.min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private shouldSimulateFailure(): boolean {
    return Math.random() < this.config.failureRate;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
} 