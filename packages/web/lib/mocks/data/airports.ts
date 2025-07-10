/**
 * Airport data for flight mock services
 * Based on real airport codes and locations
 */

import { Location } from '../types';

export const airports: Location[] = [
  // Major US Airports
  {
    code: 'JFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    coordinates: { latitude: 40.6413, longitude: -73.7781 }
  },
  {
    code: 'LAX',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    country: 'United States',
    coordinates: { latitude: 34.0522, longitude: -118.2437 }
  },
  {
    code: 'ORD',
    name: "O'Hare International Airport",
    city: 'Chicago',
    country: 'United States',
    coordinates: { latitude: 41.9742, longitude: -87.9073 }
  },
  {
    code: 'ATL',
    name: 'Hartsfield-Jackson Atlanta International Airport',
    city: 'Atlanta',
    country: 'United States',
    coordinates: { latitude: 33.6407, longitude: -84.4277 }
  },
  {
    code: 'DFW',
    name: 'Dallas/Fort Worth International Airport',
    city: 'Dallas',
    country: 'United States',
    coordinates: { latitude: 32.8998, longitude: -97.0403 }
  },
  {
    code: 'SFO',
    name: 'San Francisco International Airport',
    city: 'San Francisco',
    country: 'United States',
    coordinates: { latitude: 37.6213, longitude: -122.3790 }
  },
  {
    code: 'MIA',
    name: 'Miami International Airport',
    city: 'Miami',
    country: 'United States',
    coordinates: { latitude: 25.7959, longitude: -80.2870 }
  },
  {
    code: 'LAS',
    name: 'McCarran International Airport',
    city: 'Las Vegas',
    country: 'United States',
    coordinates: { latitude: 36.0840, longitude: -115.1537 }
  },
  {
    code: 'SEA',
    name: 'Seattle-Tacoma International Airport',
    city: 'Seattle',
    country: 'United States',
    coordinates: { latitude: 47.4502, longitude: -122.3088 }
  },
  {
    code: 'BOS',
    name: 'Logan International Airport',
    city: 'Boston',
    country: 'United States',
    coordinates: { latitude: 42.3656, longitude: -71.0096 }
  },

  // European Airports
  {
    code: 'LHR',
    name: 'Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    coordinates: { latitude: 51.4700, longitude: -0.4543 }
  },
  {
    code: 'CDG',
    name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    coordinates: { latitude: 49.0097, longitude: 2.5479 }
  },
  {
    code: 'FRA',
    name: 'Frankfurt Airport',
    city: 'Frankfurt',
    country: 'Germany',
    coordinates: { latitude: 50.0379, longitude: 8.5622 }
  },
  {
    code: 'AMS',
    name: 'Amsterdam Airport Schiphol',
    city: 'Amsterdam',
    country: 'Netherlands',
    coordinates: { latitude: 52.3105, longitude: 4.7683 }
  },
  {
    code: 'MAD',
    name: 'Madrid-Barajas Airport',
    city: 'Madrid',
    country: 'Spain',
    coordinates: { latitude: 40.4839, longitude: -3.5680 }
  },
  {
    code: 'FCO',
    name: 'Leonardo da Vinci International Airport',
    city: 'Rome',
    country: 'Italy',
    coordinates: { latitude: 41.8003, longitude: 12.2389 }
  },
  {
    code: 'ZUR',
    name: 'Zurich Airport',
    city: 'Zurich',
    country: 'Switzerland',
    coordinates: { latitude: 47.4647, longitude: 8.5492 }
  },
  {
    code: 'MUC',
    name: 'Munich Airport',
    city: 'Munich',
    country: 'Germany',
    coordinates: { latitude: 48.3537, longitude: 11.7750 }
  },

  // Asian Airports
  {
    code: 'NRT',
    name: 'Narita International Airport',
    city: 'Tokyo',
    country: 'Japan',
    coordinates: { latitude: 35.7720, longitude: 140.3929 }
  },
  {
    code: 'HND',
    name: 'Tokyo Haneda Airport',
    city: 'Tokyo',
    country: 'Japan',
    coordinates: { latitude: 35.5494, longitude: 139.7798 }
  },
  {
    code: 'ICN',
    name: 'Incheon International Airport',
    city: 'Seoul',
    country: 'South Korea',
    coordinates: { latitude: 37.4602, longitude: 126.4407 }
  },
  {
    code: 'PEK',
    name: 'Beijing Capital International Airport',
    city: 'Beijing',
    country: 'China',
    coordinates: { latitude: 40.0799, longitude: 116.6031 }
  },
  {
    code: 'PVG',
    name: 'Shanghai Pudong International Airport',
    city: 'Shanghai',
    country: 'China',
    coordinates: { latitude: 31.1443, longitude: 121.8083 }
  },
  {
    code: 'HKG',
    name: 'Hong Kong International Airport',
    city: 'Hong Kong',
    country: 'Hong Kong',
    coordinates: { latitude: 22.3080, longitude: 113.9185 }
  },
  {
    code: 'SIN',
    name: 'Singapore Changi Airport',
    city: 'Singapore',
    country: 'Singapore',
    coordinates: { latitude: 1.3644, longitude: 103.9915 }
  },
  {
    code: 'BKK',
    name: 'Suvarnabhumi Airport',
    city: 'Bangkok',
    country: 'Thailand',
    coordinates: { latitude: 13.6900, longitude: 100.7501 }
  },

  // Australian/Oceania Airports
  {
    code: 'SYD',
    name: 'Sydney Kingsford Smith Airport',
    city: 'Sydney',
    country: 'Australia',
    coordinates: { latitude: -33.9399, longitude: 151.1753 }
  },
  {
    code: 'MEL',
    name: 'Melbourne Airport',
    city: 'Melbourne',
    country: 'Australia',
    coordinates: { latitude: -37.6690, longitude: 144.8410 }
  },

  // Middle Eastern Airports
  {
    code: 'DXB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'United Arab Emirates',
    coordinates: { latitude: 25.2532, longitude: 55.3657 }
  },
  {
    code: 'DOH',
    name: 'Hamad International Airport',
    city: 'Doha',
    country: 'Qatar',
    coordinates: { latitude: 25.2731, longitude: 51.6080 }
  },

  // Canadian Airports
  {
    code: 'YYZ',
    name: 'Toronto Pearson International Airport',
    city: 'Toronto',
    country: 'Canada',
    coordinates: { latitude: 43.6777, longitude: -79.6248 }
  },
  {
    code: 'YVR',
    name: 'Vancouver International Airport',
    city: 'Vancouver',
    country: 'Canada',
    coordinates: { latitude: 49.1967, longitude: -123.1815 }
  },

  // South American Airports
  {
    code: 'GRU',
    name: 'São Paulo/Guarulhos International Airport',
    city: 'São Paulo',
    country: 'Brazil',
    coordinates: { latitude: -23.4356, longitude: -46.4731 }
  },
  {
    code: 'EZE',
    name: 'Ezeiza International Airport',
    city: 'Buenos Aires',
    country: 'Argentina',
    coordinates: { latitude: -34.8222, longitude: -58.5358 }
  }
];

/**
 * Get airport by code
 */
export function getAirportByCode(code: string): Location | undefined {
  return airports.find(airport => airport.code === code);
}

/**
 * Search airports by city or name
 */
export function searchAirports(query: string): Location[] {
  const searchTerm = query.toLowerCase();
  return airports.filter(airport => 
    airport.city.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.code.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get popular airports for a region
 */
export function getAirportsByRegion(region: 'US' | 'Europe' | 'Asia' | 'Other'): Location[] {
  const regionMap = {
    'US': ['United States'],
    'Europe': ['United Kingdom', 'France', 'Germany', 'Netherlands', 'Spain', 'Italy', 'Switzerland'],
    'Asia': ['Japan', 'South Korea', 'China', 'Hong Kong', 'Singapore', 'Thailand'],
    'Other': ['Australia', 'United Arab Emirates', 'Qatar', 'Canada', 'Brazil', 'Argentina']
  };
  
  return airports.filter(airport => regionMap[region].includes(airport.country));
} 