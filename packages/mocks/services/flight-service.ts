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

/**
 * Airlines data for generating realistic flight results
 */
const airlines = [
  // US Airlines
  { code: 'AA', name: 'American Airlines', alliance: 'oneworld', region: 'US' },
  { code: 'DL', name: 'Delta Air Lines', alliance: 'skyteam', region: 'US' },
  { code: 'UA', name: 'United Airlines', alliance: 'star', region: 'US' },
  { code: 'WN', name: 'Southwest Airlines', alliance: 'none', region: 'US' },
  { code: 'B6', name: 'JetBlue Airways', alliance: 'none', region: 'US' },
  { code: 'AS', name: 'Alaska Airlines', alliance: 'oneworld', region: 'US' },
  { code: 'F9', name: 'Frontier Airlines', alliance: 'none', region: 'US' },
  { code: 'NK', name: 'Spirit Airlines', alliance: 'none', region: 'US' },
  { code: 'G4', name: 'Allegiant Air', alliance: 'none', region: 'US' },
  { code: 'SY', name: 'Sun Country Airlines', alliance: 'none', region: 'US' },
  
  // European Airlines
  { code: 'BA', name: 'British Airways', alliance: 'oneworld', region: 'Europe' },
  { code: 'LH', name: 'Lufthansa', alliance: 'star', region: 'Europe' },
  { code: 'AF', name: 'Air France', alliance: 'skyteam', region: 'Europe' },
  { code: 'KL', name: 'KLM', alliance: 'skyteam', region: 'Europe' },
  { code: 'IB', name: 'Iberia', alliance: 'oneworld', region: 'Europe' },
  { code: 'LX', name: 'Swiss International Air Lines', alliance: 'star', region: 'Europe' },
  { code: 'OS', name: 'Austrian Airlines', alliance: 'star', region: 'Europe' },
  { code: 'SN', name: 'Brussels Airlines', alliance: 'star', region: 'Europe' },
  { code: 'AY', name: 'Finnair', alliance: 'oneworld', region: 'Europe' },
  { code: 'SK', name: 'SAS Scandinavian Airlines', alliance: 'star', region: 'Europe' },
  { code: 'DY', name: 'Norwegian Air', alliance: 'none', region: 'Europe' },
  { code: 'FR', name: 'Ryanair', alliance: 'none', region: 'Europe' },
  { code: 'U2', name: 'easyJet', alliance: 'none', region: 'Europe' },
  { code: 'WF', name: 'Widerøe', alliance: 'none', region: 'Europe' },
  { code: 'VY', name: 'Vueling', alliance: 'none', region: 'Europe' },
  { code: 'EI', name: 'Aer Lingus', alliance: 'none', region: 'Europe' },
  { code: 'TP', name: 'TAP Air Portugal', alliance: 'star', region: 'Europe' },
  { code: 'A3', name: 'Aegean Airlines', alliance: 'star', region: 'Europe' },
  { code: 'TK', name: 'Turkish Airlines', alliance: 'star', region: 'Europe' },
  { code: 'AZ', name: 'Alitalia', alliance: 'skyteam', region: 'Europe' },
  { code: 'SU', name: 'Aeroflot', alliance: 'skyteam', region: 'Europe' },
  { code: 'RO', name: 'Tarom', alliance: 'skyteam', region: 'Europe' },
  { code: 'OK', name: 'Czech Airlines', alliance: 'skyteam', region: 'Europe' },
  { code: 'LO', name: 'LOT Polish Airlines', alliance: 'star', region: 'Europe' },
  
  // Asian Airlines
  { code: 'JL', name: 'Japan Airlines', alliance: 'oneworld', region: 'Asia' },
  { code: 'NH', name: 'ANA', alliance: 'star', region: 'Asia' },
  { code: 'CX', name: 'Cathay Pacific', alliance: 'oneworld', region: 'Asia' },
  { code: 'SQ', name: 'Singapore Airlines', alliance: 'star', region: 'Asia' },
  { code: 'KE', name: 'Korean Air', alliance: 'skyteam', region: 'Asia' },
  { code: 'OZ', name: 'Asiana Airlines', alliance: 'star', region: 'Asia' },
  { code: 'TG', name: 'Thai Airways', alliance: 'star', region: 'Asia' },
  { code: 'MH', name: 'Malaysia Airlines', alliance: 'oneworld', region: 'Asia' },
  { code: 'GA', name: 'Garuda Indonesia', alliance: 'skyteam', region: 'Asia' },
  { code: 'PR', name: 'Philippine Airlines', alliance: 'none', region: 'Asia' },
  { code: 'VN', name: 'Vietnam Airlines', alliance: 'skyteam', region: 'Asia' },
  { code: 'AI', name: 'Air India', alliance: 'star', region: 'Asia' },
  { code: '6E', name: 'IndiGo', alliance: 'none', region: 'Asia' },
  { code: 'SG', name: 'SpiceJet', alliance: 'none', region: 'Asia' },
  { code: 'CA', name: 'Air China', alliance: 'star', region: 'Asia' },
  { code: 'MU', name: 'China Eastern Airlines', alliance: 'skyteam', region: 'Asia' },
  { code: 'CZ', name: 'China Southern Airlines', alliance: 'skyteam', region: 'Asia' },
  { code: 'HU', name: 'Hainan Airlines', alliance: 'none', region: 'Asia' },
  { code: 'CI', name: 'China Airlines', alliance: 'skyteam', region: 'Asia' },
  { code: 'BR', name: 'EVA Air', alliance: 'star', region: 'Asia' },
  { code: 'HX', name: 'Hong Kong Airlines', alliance: 'none', region: 'Asia' },
  { code: 'UO', name: 'HK Express', alliance: 'none', region: 'Asia' },
  { code: 'TR', name: 'Scoot', alliance: 'none', region: 'Asia' },
  { code: 'FD', name: 'Thai AirAsia', alliance: 'none', region: 'Asia' },
  { code: 'AK', name: 'AirAsia', alliance: 'none', region: 'Asia' },
  { code: 'JT', name: 'Lion Air', alliance: 'none', region: 'Asia' },
  { code: 'QG', name: 'Citilink', alliance: 'none', region: 'Asia' },
  { code: 'VJ', name: 'VietJet Air', alliance: 'none', region: 'Asia' },
  { code: 'BL', name: 'Jetstar Pacific', alliance: 'none', region: 'Asia' },
  { code: 'JQ', name: 'Jetstar Airways', alliance: 'none', region: 'Asia' },
  { code: 'IT', name: 'Tigerair Taiwan', alliance: 'none', region: 'Asia' },
  { code: 'MM', name: 'Peach Aviation', alliance: 'none', region: 'Asia' },
  { code: 'GK', name: 'Jetstar Japan', alliance: 'none', region: 'Asia' },
  { code: 'BC', name: 'Skymark Airlines', alliance: 'none', region: 'Asia' },
  { code: 'APJ', name: 'Peach Aviation', alliance: 'none', region: 'Asia' },
  { code: 'LJ', name: 'Jin Air', alliance: 'none', region: 'Asia' },
  { code: 'TWB', name: "T'way Air", alliance: 'none', region: 'Asia' },
  { code: 'AAR', name: 'Asiana Airlines', alliance: 'star', region: 'Asia' },
  
  // Middle Eastern Airlines
  { code: 'EK', name: 'Emirates', alliance: 'none', region: 'MiddleEast' },
  { code: 'QR', name: 'Qatar Airways', alliance: 'oneworld', region: 'MiddleEast' },
  { code: 'EY', name: 'Etihad Airways', alliance: 'none', region: 'MiddleEast' },
  { code: 'KU', name: 'Kuwait Airways', alliance: 'none', region: 'MiddleEast' },
  { code: 'GF', name: 'Gulf Air', alliance: 'none', region: 'MiddleEast' },
  { code: 'RJ', name: 'Royal Jordanian', alliance: 'oneworld', region: 'MiddleEast' },
  { code: 'MS', name: 'EgyptAir', alliance: 'star', region: 'MiddleEast' },
  { code: 'AT', name: 'Royal Air Maroc', alliance: 'oneworld', region: 'MiddleEast' },
  { code: 'LY', name: 'El Al', alliance: 'none', region: 'MiddleEast' },
  { code: 'WY', name: 'Oman Air', alliance: 'none', region: 'MiddleEast' },
  { code: 'XY', name: 'Flynas', alliance: 'none', region: 'MiddleEast' },
  { code: 'SV', name: 'Saudi Arabian Airlines', alliance: 'skyteam', region: 'MiddleEast' },
  { code: 'PC', name: 'Pegasus Airlines', alliance: 'none', region: 'MiddleEast' },
  { code: 'TU', name: 'Tunisair', alliance: 'none', region: 'MiddleEast' },
  
  // African Airlines
  { code: 'SA', name: 'South African Airways', alliance: 'star', region: 'Africa' },
  { code: 'ET', name: 'Ethiopian Airlines', alliance: 'star', region: 'Africa' },
  { code: 'KQ', name: 'Kenya Airways', alliance: 'skyteam', region: 'Africa' },
  { code: 'DT', name: 'TAAG Angola Airlines', alliance: 'none', region: 'Africa' },
  { code: 'UU', name: 'Air Austral', alliance: 'none', region: 'Africa' },
  { code: 'MD', name: 'Air Madagascar', alliance: 'none', region: 'Africa' },
  { code: 'MK', name: 'Air Mauritius', alliance: 'none', region: 'Africa' },
  { code: 'SW', name: 'Air Namibia', alliance: 'none', region: 'Africa' },
  { code: 'BP', name: 'Air Botswana', alliance: 'none', region: 'Africa' },
  { code: 'AH', name: 'Air Algérie', alliance: 'none', region: 'Africa' },
  { code: 'HC', name: 'Air Senegal', alliance: 'none', region: 'Africa' },
  { code: 'KP', name: 'ASKY Airlines', alliance: 'none', region: 'Africa' },
  { code: 'FB', name: 'Bulgaria Air', alliance: 'none', region: 'Africa' },
  { code: 'FL', name: 'AirLink', alliance: 'none', region: 'Africa' },
  { code: 'MN', name: 'Kulula', alliance: 'none', region: 'Africa' },
  { code: 'JE', name: 'Mango', alliance: 'none', region: 'Africa' },
  { code: 'FA', name: 'Safair', alliance: 'none', region: 'Africa' },
  
  // Oceania Airlines
  { code: 'QF', name: 'Qantas', alliance: 'oneworld', region: 'Oceania' },
  { code: 'VA', name: 'Virgin Australia', alliance: 'none', region: 'Oceania' },
  { code: 'JQ', name: 'Jetstar Airways', alliance: 'none', region: 'Oceania' },
  { code: 'TT', name: 'Tigerair Australia', alliance: 'none', region: 'Oceania' },
  { code: 'NZ', name: 'Air New Zealand', alliance: 'star', region: 'Oceania' },
  { code: 'DJ', name: 'Virgin Blue', alliance: 'none', region: 'Oceania' },
  { code: 'FJ', name: 'Fiji Airways', alliance: 'oneworld', region: 'Oceania' },
  { code: 'SB', name: 'Air Caledonie', alliance: 'none', region: 'Oceania' },
  { code: 'PX', name: 'Air Niugini', alliance: 'none', region: 'Oceania' },
  { code: 'IE', name: 'Solomon Airlines', alliance: 'none', region: 'Oceania' },
  { code: 'VU', name: 'Air Vanuatu', alliance: 'none', region: 'Oceania' },
  { code: 'HM', name: 'Air Seychelles', alliance: 'none', region: 'Oceania' },
  { code: 'UL', name: 'SriLankan Airlines', alliance: 'oneworld', region: 'Oceania' },
  { code: 'BI', name: 'Royal Brunei Airlines', alliance: 'none', region: 'Oceania' },
  { code: 'PG', name: 'Bangkok Airways', alliance: 'none', region: 'Oceania' },
  { code: 'BG', name: 'Biman Bangladesh Airlines', alliance: 'none', region: 'Oceania' },
  { code: 'KB', name: 'Drukair', alliance: 'none', region: 'Oceania' },
  { code: 'RA', name: 'Nepal Airlines', alliance: 'none', region: 'Oceania' },
  { code: 'QH', name: 'Bamboo Airways', alliance: 'none', region: 'Oceania' },
  { code: 'H9', name: 'Pegasus Asia', alliance: 'none', region: 'Oceania' },
  
  // North American Airlines
  { code: 'AC', name: 'Air Canada', alliance: 'star', region: 'NorthAmerica' },
  { code: 'WS', name: 'WestJet', alliance: 'none', region: 'NorthAmerica' },
  { code: 'PD', name: 'Porter Airlines', alliance: 'none', region: 'NorthAmerica' },
  { code: 'TS', name: 'Air Transat', alliance: 'none', region: 'NorthAmerica' },
  { code: 'AM', name: 'Aeroméxico', alliance: 'skyteam', region: 'NorthAmerica' },
  { code: 'VB', name: 'VivaAerobus', alliance: 'none', region: 'NorthAmerica' },
  { code: 'Y4', name: 'Volaris', alliance: 'none', region: 'NorthAmerica' },
  { code: 'VW', name: 'Aeromar', alliance: 'none', region: 'NorthAmerica' },
  { code: '4O', name: 'Interjet', alliance: 'none', region: 'NorthAmerica' },
  { code: 'QA', name: 'Aeromexico Connect', alliance: 'skyteam', region: 'NorthAmerica' },
  { code: 'VH', name: 'Viva Colombia', alliance: 'none', region: 'NorthAmerica' },
  { code: 'JA', name: 'JetSMART', alliance: 'none', region: 'NorthAmerica' },
  { code: 'LP', name: 'Jetstar Pacific', alliance: 'none', region: 'NorthAmerica' },
  { code: 'VE', name: 'Clic', alliance: 'none', region: 'NorthAmerica' },
  { code: 'MX', name: 'Mexicana', alliance: 'none', region: 'NorthAmerica' },
  { code: 'XE', name: 'JSX', alliance: 'none', region: 'NorthAmerica' },
  { code: 'QK', name: 'Jazz Aviation', alliance: 'none', region: 'NorthAmerica' },
  { code: 'WR', name: 'WestJet Encore', alliance: 'none', region: 'NorthAmerica' },
  { code: 'WG', name: 'Sunwing Airlines', alliance: 'none', region: 'NorthAmerica' },
  { code: 'POE', name: 'Porter Airlines', alliance: 'none', region: 'NorthAmerica' },
  
  // South American Airlines
  { code: 'LA', name: 'LATAM Airlines', alliance: 'oneworld', region: 'SouthAmerica' },
  { code: 'G3', name: 'Gol Linhas Aéreas', alliance: 'none', region: 'SouthAmerica' },
  { code: 'AD', name: 'Azul Brazilian Airlines', alliance: 'none', region: 'SouthAmerica' },
  { code: 'AR', name: 'Aerolíneas Argentinas', alliance: 'skyteam', region: 'SouthAmerica' },
  { code: 'AV', name: 'Avianca', alliance: 'star', region: 'SouthAmerica' },
  { code: 'CM', name: 'Copa Airlines', alliance: 'star', region: 'SouthAmerica' },
  { code: 'P5', name: 'Wingo', alliance: 'none', region: 'SouthAmerica' },
  { code: 'VH', name: 'Viva Air', alliance: 'none', region: 'SouthAmerica' },
  { code: 'WC', name: 'Centurion Air Cargo', alliance: 'none', region: 'SouthAmerica' },
  { code: 'WL', name: 'Aeroperú', alliance: 'none', region: 'SouthAmerica' },
  { code: 'LP', name: 'Aerolíneas Argentinas', alliance: 'skyteam', region: 'SouthAmerica' },
  { code: 'XL', name: 'LATAM Airlines Ecuador', alliance: 'oneworld', region: 'SouthAmerica' },
  { code: 'UC', name: 'LATAM Airlines Chile', alliance: 'oneworld', region: 'SouthAmerica' },
  { code: 'JJ', name: 'TAM Airlines', alliance: 'oneworld', region: 'SouthAmerica' },
  { code: 'O6', name: 'Avianca Brazil', alliance: 'none', region: 'SouthAmerica' },
  { code: 'PZ', name: 'LATAM Airlines Peru', alliance: 'oneworld', region: 'SouthAmerica' },
  { code: 'H2', name: 'Sky Airline', alliance: 'none', region: 'SouthAmerica' },
  { code: 'JA', name: 'JetSMART', alliance: 'none', region: 'SouthAmerica' },
  { code: 'YW', name: 'Air Nostrum', alliance: 'none', region: 'SouthAmerica' },
  { code: 'VE', name: 'Clic', alliance: 'none', region: 'SouthAmerica' },
  
  // Caribbean Airlines
  { code: 'BW', name: 'Caribbean Airlines', alliance: 'none', region: 'Caribbean' },
  { code: 'JY', name: 'Intercaribbean Airways', alliance: 'none', region: 'Caribbean' },
  { code: 'CU', name: 'Cubana', alliance: 'none', region: 'Caribbean' },
  { code: 'BB', name: 'Seaborne Airlines', alliance: 'none', region: 'Caribbean' },
  { code: 'WM', name: 'Windward Islands Airways', alliance: 'none', region: 'Caribbean' },
  { code: 'BF', name: 'French Bee', alliance: 'none', region: 'Caribbean' },
  { code: 'TX', name: 'Air Caraïbes', alliance: 'none', region: 'Caribbean' },
  { code: 'SX', name: 'Skyway Enterprises', alliance: 'none', region: 'Caribbean' },
  { code: 'JU', name: 'Air Serbia', alliance: 'none', region: 'Caribbean' },
  { code: 'DI', name: 'dba', alliance: 'none', region: 'Caribbean' },
  { code: 'WG', name: 'Sunwing Airlines', alliance: 'none', region: 'Caribbean' },
  { code: 'UP', name: 'Bahamasair', alliance: 'none', region: 'Caribbean' },
  { code: 'WU', name: 'Wizz Air', alliance: 'none', region: 'Caribbean' },
  { code: 'PJ', name: 'Air Saint-Pierre', alliance: 'none', region: 'Caribbean' },
  { code: 'LI', name: 'LIAT', alliance: 'none', region: 'Caribbean' },
  { code: 'JN', name: 'Joon', alliance: 'none', region: 'Caribbean' },
  { code: 'WP', name: 'Island Air', alliance: 'none', region: 'Caribbean' },
  { code: 'EW', name: 'Eurowings', alliance: 'none', region: 'Caribbean' },
  { code: 'NU', name: 'Japan Transocean Air', alliance: 'none', region: 'Caribbean' },
  { code: 'BT', name: 'Air Baltic', alliance: 'none', region: 'Caribbean' },
  
  // Central American Airlines
  { code: 'TA', name: 'TACA', alliance: 'star', region: 'CentralAmerica' },
  { code: 'LR', name: 'LACSA', alliance: 'star', region: 'CentralAmerica' },
  { code: 'RZ', name: 'Sansa Regional', alliance: 'none', region: 'CentralAmerica' },
  { code: 'DG', name: 'Tikal Jets', alliance: 'none', region: 'CentralAmerica' },
  { code: 'GU', name: 'Aviateca', alliance: 'none', region: 'CentralAmerica' },
  { code: '5U', name: 'Transportes Aéreos Guatemaltecos', alliance: 'none', region: 'CentralAmerica' },
  { code: 'HR', name: 'Hahn Air', alliance: 'none', region: 'CentralAmerica' },
  { code: 'TG', name: 'Thai Airways', alliance: 'star', region: 'CentralAmerica' },
  { code: 'NI', name: 'Portugália', alliance: 'none', region: 'CentralAmerica' },
  { code: 'OH', name: 'Comair', alliance: 'none', region: 'CentralAmerica' },
  { code: 'LN', name: 'Libyan Airlines', alliance: 'none', region: 'CentralAmerica' },
  { code: 'QG', name: 'Citilink', alliance: 'none', region: 'CentralAmerica' },
  { code: 'RQ', name: 'Kam Air', alliance: 'none', region: 'CentralAmerica' },
  { code: 'ZK', name: 'Great Lakes Airlines', alliance: 'none', region: 'CentralAmerica' },
  { code: 'IS', name: 'Island Air', alliance: 'none', region: 'CentralAmerica' },
  { code: 'ZB', name: 'Monarch Airlines', alliance: 'none', region: 'CentralAmerica' },
  { code: 'WK', name: 'Edelweiss Air', alliance: 'none', region: 'CentralAmerica' },
  { code: 'XQ', name: 'SunExpress', alliance: 'none', region: 'CentralAmerica' },
  { code: 'WE', name: 'Thai Smile', alliance: 'none', region: 'CentralAmerica' },
  { code: 'HV', name: 'Transavia', alliance: 'none', region: 'CentralAmerica' }
];

/**
 * Aircraft types for realistic flight segments
 */
const aircraftTypes = [
  // Boeing Aircraft
  'Boeing 737-700', 'Boeing 737-800', 'Boeing 737-900', 'Boeing 737 MAX 8', 'Boeing 737 MAX 9',
  'Boeing 757-200', 'Boeing 757-300', 'Boeing 767-200', 'Boeing 767-300', 'Boeing 767-400',
  'Boeing 777-200', 'Boeing 777-200ER', 'Boeing 777-300', 'Boeing 777-300ER', 'Boeing 777-8', 'Boeing 777-9',
  'Boeing 787-8', 'Boeing 787-9', 'Boeing 787-10',
  'Boeing 747-400', 'Boeing 747-8',
  
  // Airbus Aircraft
  'Airbus A319', 'Airbus A320', 'Airbus A321', 'Airbus A321neo', 'Airbus A320neo',
  'Airbus A330-200', 'Airbus A330-300', 'Airbus A330-800neo', 'Airbus A330-900neo',
  'Airbus A340-200', 'Airbus A340-300', 'Airbus A340-500', 'Airbus A340-600',
  'Airbus A350-900', 'Airbus A350-1000',
  'Airbus A380-800',
  
  // Regional Aircraft
  'Embraer E170', 'Embraer E175', 'Embraer E190', 'Embraer E195',
  'Bombardier CRJ-200', 'Bombardier CRJ-700', 'Bombardier CRJ-900', 'Bombardier CRJ-1000',
  'ATR 42', 'ATR 72',
  'Saab 340', 'Dash 8-100', 'Dash 8-200', 'Dash 8-300', 'Dash 8-400',
  
  // Other Aircraft
  'McDonnell Douglas MD-80', 'McDonnell Douglas MD-90', 'McDonnell Douglas MD-11',
  'Lockheed L-1011', 'Concorde', 'Tupolev Tu-154', 'Sukhoi Superjet 100',
  'Mitsubishi Regional Jet', 'Comac C919', 'Irkut MC-21'
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

      // Simulate realistic availability scenarios
      const isAvailable = this.simulateFlightAvailability(flightId);

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
   * Simulate realistic flight availability scenarios
   */
  private simulateFlightAvailability(flightId: string): boolean {
    // Create deterministic but varied availability based on flight ID
    const hash = this.hashString(flightId);
    const availability = hash % 100;

    // Different availability rates for different scenarios:
    // 85% - Normal availability
    // 10% - High demand/sold out
    // 5% - Maintenance/cancellation
    
    if (availability < 85) {
      return true; // Available
    } else if (availability < 95) {
      return false; // Sold out due to high demand
    } else {
      return false; // Cancelled due to maintenance or weather
    }
  }

     /**
    * Simple hash function for consistent pseudo-random behavior
    */
   private hashString(str: string): number {
     let hash = 0;
     for (let i = 0; i < str.length; i++) {
       const char = str.charCodeAt(i);
       hash = ((hash << 5) - hash) + char;
       hash = hash & hash; // Convert to 32-bit integer
     }
     return Math.abs(hash);
   }

   /**
    * Add edge case properties for testing scenarios
    */
   private addEdgeCaseProperties(flightId: string, airlineCode: string): any {
     const hash = this.hashString(flightId);
     const edgeCase = hash % 100;

     const edgeProperties: any = {};

     // Add edge case flags for testing
     if (edgeCase < 5) {
       // 5% chance of sold out flights
       edgeProperties.availability = 'sold_out';
       edgeProperties.availableSeats = 0;
       edgeProperties.waitlistAvailable = true;
     } else if (edgeCase < 8) {
       // 3% chance of cancelled flights
       edgeProperties.status = 'cancelled';
       edgeProperties.cancellationReason = 'Weather conditions';
       edgeProperties.rebookingOptions = true;
     } else if (edgeCase < 12) {
       // 4% chance of delayed flights
       edgeProperties.status = 'delayed';
       edgeProperties.delayMinutes = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
       edgeProperties.delayReason = ['Weather', 'Technical', 'Air traffic', 'Crew'][Math.floor(Math.random() * 4)];
     } else if (edgeCase < 15) {
       // 3% chance of very low availability
       edgeProperties.availability = 'limited';
       edgeProperties.availableSeats = Math.floor(Math.random() * 3) + 1; // 1-3 seats
       edgeProperties.highDemand = true;
     } else if (edgeCase < 18) {
       // 3% chance of price alerts
       edgeProperties.priceAlert = {
         type: 'price_drop',
         previousPrice: edgeProperties.price?.amount ? edgeProperties.price.amount * 1.2 : 500,
         savingsAmount: Math.floor(Math.random() * 100) + 50
       };
     } else if (edgeCase < 20) {
       // 2% chance of gate change
       edgeProperties.gateChange = {
         originalGate: 'A12',
         newGate: 'B07',
         changeTime: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
       };
     }

     // Add random seat availability for non-edge cases
     if (!edgeProperties.availableSeats && !edgeProperties.status) {
       edgeProperties.availableSeats = Math.floor(Math.random() * 200) + 50; // 50-250 seats
     }

     return edgeProperties;
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
      
      const flightId = `flight-${i + 1}-${Date.now()}`;
      const flightData = {
        id: flightId,
        segments,
        price,
        totalDuration: this.calculateTotalDuration(segments),
        stops: segments.length - 1,
        layovers: this.generateLayovers(segments),
        baggage: this.generateBaggageInfo(airline.code, params.cabin),
        cancellationPolicy: this.generateCancellationPolicy(airline.code),
        source: 'api',
        bookingUrl: `https://mock-booking.com/flight/${i + 1}`,
        deepLink: `travelagentic://flight/${i + 1}`,
        ...this.addEdgeCaseProperties(flightId, airline.code)
      };

      flights.push(flightData);
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
   * Create a single flight segment
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
    const arrTime = this.addMinutes(depTime, duration);

    return {
      airline: airline.name,
      flightNumber,
      aircraft,
      departure: {
        airport: origin,
        time: `${date}T${depTime}:00Z`,
        terminal: this.generateTerminal()
      },
      arrival: {
        airport: destination,
        time: `${date}T${arrTime}:00Z`,
        terminal: this.generateTerminal()
      },
      duration: this.formatDuration(duration),
      cabin
    };
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

    // Seasonal pricing adjustments
    const departureDate = new Date(params.departureDate);
    const seasonMultiplier = this.getSeasonalPriceMultiplier(departureDate, segments[0].departure.airport, segments[segments.length - 1].arrival.airport);
    basePrice *= seasonMultiplier;

    // Day of week pricing (weekends more expensive)
    const dayOfWeek = departureDate.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
      basePrice *= 1.15; // 15% weekend premium
    }

    // Holiday period adjustments
    const holidayMultiplier = this.getHolidayPriceMultiplier(departureDate);
    basePrice *= holidayMultiplier;

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
   * Calculate seasonal price multipliers based on destination and time of year
   */
  private getSeasonalPriceMultiplier(date: Date, origin: any, destination: any): number {
    const month = date.getMonth(); // 0-11
    const isNorthernHemisphere = (destination.coordinates?.latitude || 0) > 0;
    
    // Summer months (June-August) vs Winter months (December-February)
    const isSummer = month >= 5 && month <= 7;
    const isWinter = month === 11 || month <= 1;
    
    // Tourist destination seasonal adjustments
    const touristDestinations = ['Paris', 'London', 'Barcelona', 'Rome', 'Tokyo', 'New York', 'Sydney'];
    const isTouristDestination = touristDestinations.some(city => 
      destination.city.includes(city) || origin.city.includes(city)
    );
    
    // Beach destination adjustments (higher in summer)
    const beachDestinations = ['Miami', 'Los Angeles', 'Barcelona', 'Sydney', 'Dubai', 'Bangkok', 'Singapore'];
    const isBeachDestination = beachDestinations.some(city => 
      destination.city.includes(city) || origin.city.includes(city)
    );
    
    // Ski destination adjustments (higher in winter)
    const skiDestinations = ['Denver', 'Zurich', 'Munich', 'Oslo', 'Stockholm'];
    const isSkiDestination = skiDestinations.some(city => 
      destination.city.includes(city) || origin.city.includes(city)
    );
    
    let multiplier = 1.0;
    
    if (isTouristDestination) {
      if (isSummer) multiplier *= 1.3; // 30% summer premium
      if (isWinter) multiplier *= 0.85; // 15% winter discount
    }
    
    if (isBeachDestination && isSummer) {
      multiplier *= 1.4; // 40% beach summer premium
    }
    
    if (isSkiDestination && isWinter) {
      multiplier *= 1.5; // 50% ski winter premium
    }
    
    // Shoulder season adjustments (spring/fall)
    const isShoulderSeason = (month >= 2 && month <= 4) || (month >= 8 && month <= 10);
    if (isShoulderSeason && isTouristDestination) {
      multiplier *= 1.1; // 10% shoulder season premium
    }
    
    return multiplier;
  }

  /**
   * Calculate holiday period price multipliers
   */
  private getHolidayPriceMultiplier(date: Date): number {
    const month = date.getMonth();
    const day = date.getDate();
    
    // Major holiday periods with higher demand
    const holidayPeriods = [
      // Christmas/New Year
      { startMonth: 11, startDay: 15, endMonth: 0, endDay: 15, multiplier: 1.8 },
      // Thanksgiving week (US)
      { startMonth: 10, startDay: 20, endMonth: 10, endDay: 30, multiplier: 1.6 },
      // Summer vacation (June-August)
      { startMonth: 5, startDay: 15, endMonth: 7, endDay: 31, multiplier: 1.4 },
      // Spring break (March)
      { startMonth: 2, startDay: 1, endMonth: 2, endDay: 31, multiplier: 1.3 },
      // Easter period (varies, but approximate)
      { startMonth: 3, startDay: 1, endMonth: 3, endDay: 30, multiplier: 1.2 }
    ];
    
    for (const period of holidayPeriods) {
      const isInPeriod = this.isDateInPeriod(date, period);
      if (isInPeriod) {
        return period.multiplier;
      }
    }
    
    return 1.0; // No holiday adjustment
  }

  /**
   * Check if a date falls within a holiday period
   */
  private isDateInPeriod(date: Date, period: any): boolean {
    const month = date.getMonth();
    const day = date.getDate();
    
    // Handle periods that cross year boundary
    if (period.startMonth > period.endMonth) {
      return (month === period.startMonth && day >= period.startDay) ||
             (month === period.endMonth && day <= period.endDay) ||
             (month > period.startMonth || month < period.endMonth);
    } else {
      return (month === period.startMonth && day >= period.startDay && 
              (month < period.endMonth || (month === period.endMonth && day <= period.endDay))) ||
             (month > period.startMonth && month < period.endMonth) ||
             (month === period.endMonth && day <= period.endDay);
    }
  }

  /**
   * Generate realistic baggage information
   */
  private generateBaggageInfo(airlineCode: string, cabin: string): { carry: string; checked: string } {
    const budgetAirlines = [
      'WN', 'F9', 'NK', 'G4', 'SY', // US Budget
      'FR', 'U2', 'DY', 'VY', // European Budget
      'AK', 'FD', 'TR', 'JT', 'QG', 'VJ', 'BL', 'JQ', 'IT', 'MM', 'GK', 'BC', 'LJ', // Asian Budget
      'VB', 'Y4', '4O', 'VH', 'JA', 'VE', // North American Budget
      'G3', 'AD', 'P5', 'VH', 'H2', 'JA', // South American Budget
      'TT', 'DJ', // Oceania Budget
      'PC', 'XY', 'FL', 'MN', 'JE', 'FA' // Other Regional Budget
    ];
    const isBudget = budgetAirlines.includes(airlineCode);
    
    if (isBudget) {
      return {
        carry: '1 personal item included',
        checked: 'First bag $35-$45'
      };
    }

    const cabinBaggage = {
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