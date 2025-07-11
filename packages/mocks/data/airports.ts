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
  {
    code: 'MCO',
    name: 'Orlando International Airport',
    city: 'Orlando',
    country: 'United States',
    coordinates: { latitude: 28.4312, longitude: -81.3081 }
  },
  {
    code: 'PHX',
    name: 'Phoenix Sky Harbor International Airport',
    city: 'Phoenix',
    country: 'United States',
    coordinates: { latitude: 33.4342, longitude: -112.0080 }
  },
  {
    code: 'DEN',
    name: 'Denver International Airport',
    city: 'Denver',
    country: 'United States',
    coordinates: { latitude: 39.8617, longitude: -104.6732 }
  },
  {
    code: 'HNL',
    name: 'Daniel K. Inouye International Airport',
    city: 'Honolulu',
    country: 'United States',
    coordinates: { latitude: 21.3099, longitude: -157.8581 }
  },
  {
    code: 'ANC',
    name: 'Ted Stevens Anchorage International Airport',
    city: 'Anchorage',
    country: 'United States',
    coordinates: { latitude: 61.1744, longitude: -149.9970 }
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
    code: 'LGW',
    name: 'Gatwick Airport',
    city: 'London',
    country: 'United Kingdom',
    coordinates: { latitude: 51.1537, longitude: -0.1821 }
  },
  {
    code: 'CDG',
    name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    coordinates: { latitude: 49.0097, longitude: 2.5479 }
  },
  {
    code: 'ORY',
    name: 'Orly Airport',
    city: 'Paris',
    country: 'France',
    coordinates: { latitude: 48.7233, longitude: 2.3792 }
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
    code: 'BCN',
    name: 'Barcelona-El Prat Airport',
    city: 'Barcelona',
    country: 'Spain',
    coordinates: { latitude: 41.2974, longitude: 2.0833 }
  },
  {
    code: 'FCO',
    name: 'Leonardo da Vinci International Airport',
    city: 'Rome',
    country: 'Italy',
    coordinates: { latitude: 41.8003, longitude: 12.2389 }
  },
  {
    code: 'MXP',
    name: 'Milan Malpensa Airport',
    city: 'Milan',
    country: 'Italy',
    coordinates: { latitude: 45.6306, longitude: 8.7231 }
  },
  {
    code: 'VCE',
    name: 'Venice Marco Polo Airport',
    city: 'Venice',
    country: 'Italy',
    coordinates: { latitude: 45.5053, longitude: 12.3519 }
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
  {
    code: 'VIE',
    name: 'Vienna International Airport',
    city: 'Vienna',
    country: 'Austria',
    coordinates: { latitude: 48.1103, longitude: 16.5697 }
  },
  {
    code: 'CPH',
    name: 'Copenhagen Airport',
    city: 'Copenhagen',
    country: 'Denmark',
    coordinates: { latitude: 55.6181, longitude: 12.6561 }
  },
  {
    code: 'ARN',
    name: 'Stockholm Arlanda Airport',
    city: 'Stockholm',
    country: 'Sweden',
    coordinates: { latitude: 59.6519, longitude: 17.9186 }
  },
  {
    code: 'OSL',
    name: 'Oslo Airport',
    city: 'Oslo',
    country: 'Norway',
    coordinates: { latitude: 60.1939, longitude: 11.1004 }
  },
  {
    code: 'HEL',
    name: 'Helsinki Airport',
    city: 'Helsinki',
    country: 'Finland',
    coordinates: { latitude: 60.3172, longitude: 24.9633 }
  },
  {
    code: 'ATH',
    name: 'Athens International Airport',
    city: 'Athens',
    country: 'Greece',
    coordinates: { latitude: 37.9364, longitude: 23.9445 }
  },
  {
    code: 'IST',
    name: 'Istanbul Airport',
    city: 'Istanbul',
    country: 'Turkey',
    coordinates: { latitude: 41.2753, longitude: 28.7519 }
  },
  {
    code: 'LIS',
    name: 'Lisbon Airport',
    city: 'Lisbon',
    country: 'Portugal',
    coordinates: { latitude: 38.7813, longitude: -9.1363 }
  },
  {
    code: 'DUB',
    name: 'Dublin Airport',
    city: 'Dublin',
    country: 'Ireland',
    coordinates: { latitude: 53.4213, longitude: -6.2701 }
  },
  {
    code: 'EDI',
    name: 'Edinburgh Airport',
    city: 'Edinburgh',
    country: 'United Kingdom',
    coordinates: { latitude: 55.9500, longitude: -3.3725 }
  },
  {
    code: 'PRG',
    name: 'Václav Havel Airport Prague',
    city: 'Prague',
    country: 'Czech Republic',
    coordinates: { latitude: 50.1008, longitude: 14.2632 }
  },
  {
    code: 'BUD',
    name: 'Budapest Ferenc Liszt International Airport',
    city: 'Budapest',
    country: 'Hungary',
    coordinates: { latitude: 47.4394, longitude: 19.2608 }
  },
  {
    code: 'WAW',
    name: 'Warsaw Chopin Airport',
    city: 'Warsaw',
    country: 'Poland',
    coordinates: { latitude: 52.1657, longitude: 20.9671 }
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
    code: 'KIX',
    name: 'Kansai International Airport',
    city: 'Osaka',
    country: 'Japan',
    coordinates: { latitude: 34.4347, longitude: 135.2440 }
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
    code: 'CAN',
    name: 'Guangzhou Baiyun International Airport',
    city: 'Guangzhou',
    country: 'China',
    coordinates: { latitude: 23.3924, longitude: 113.2988 }
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
  {
    code: 'DMK',
    name: 'Don Mueang International Airport',
    city: 'Bangkok',
    country: 'Thailand',
    coordinates: { latitude: 13.9126, longitude: 100.6043 }
  },
  {
    code: 'HKT',
    name: 'Phuket International Airport',
    city: 'Phuket',
    country: 'Thailand',
    coordinates: { latitude: 8.1132, longitude: 98.3169 }
  },
  {
    code: 'KUL',
    name: 'Kuala Lumpur International Airport',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    coordinates: { latitude: 2.7456, longitude: 101.7072 }
  },
  {
    code: 'CGK',
    name: 'Soekarno-Hatta International Airport',
    city: 'Jakarta',
    country: 'Indonesia',
    coordinates: { latitude: -6.1256, longitude: 106.6559 }
  },
  {
    code: 'DPS',
    name: 'Ngurah Rai International Airport',
    city: 'Denpasar',
    country: 'Indonesia',
    coordinates: { latitude: -8.7468, longitude: 115.1671 }
  },
  {
    code: 'MNL',
    name: 'Ninoy Aquino International Airport',
    city: 'Manila',
    country: 'Philippines',
    coordinates: { latitude: 14.5086, longitude: 121.0194 }
  },
  {
    code: 'SGN',
    name: 'Tan Son Nhat International Airport',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    coordinates: { latitude: 10.8187, longitude: 106.6519 }
  },
  {
    code: 'HAN',
    name: 'Noi Bai International Airport',
    city: 'Hanoi',
    country: 'Vietnam',
    coordinates: { latitude: 21.2212, longitude: 105.8071 }
  },
  {
    code: 'BOM',
    name: 'Chhatrapati Shivaji Maharaj International Airport',
    city: 'Mumbai',
    country: 'India',
    coordinates: { latitude: 19.0896, longitude: 72.8656 }
  },
  {
    code: 'DEL',
    name: 'Indira Gandhi International Airport',
    city: 'New Delhi',
    country: 'India',
    coordinates: { latitude: 28.5562, longitude: 77.1000 }
  },
  {
    code: 'BLR',
    name: 'Kempegowda International Airport',
    city: 'Bangalore',
    country: 'India',
    coordinates: { latitude: 13.1979, longitude: 77.7063 }
  },
  {
    code: 'TPE',
    name: 'Taiwan Taoyuan International Airport',
    city: 'Taipei',
    country: 'Taiwan',
    coordinates: { latitude: 25.0797, longitude: 121.2342 }
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
  {
    code: 'BNE',
    name: 'Brisbane Airport',
    city: 'Brisbane',
    country: 'Australia',
    coordinates: { latitude: -27.3842, longitude: 153.1175 }
  },
  {
    code: 'PER',
    name: 'Perth Airport',
    city: 'Perth',
    country: 'Australia',
    coordinates: { latitude: -31.9385, longitude: 115.9672 }
  },
  {
    code: 'AKL',
    name: 'Auckland Airport',
    city: 'Auckland',
    country: 'New Zealand',
    coordinates: { latitude: -37.0082, longitude: 174.7850 }
  },
  {
    code: 'CHC',
    name: 'Christchurch Airport',
    city: 'Christchurch',
    country: 'New Zealand',
    coordinates: { latitude: -43.4894, longitude: 172.5320 }
  },
  {
    code: 'NAN',
    name: 'Nadi International Airport',
    city: 'Nadi',
    country: 'Fiji',
    coordinates: { latitude: -17.7553, longitude: 177.4431 }
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
    code: 'DWC',
    name: 'Al Maktoum International Airport',
    city: 'Dubai',
    country: 'United Arab Emirates',
    coordinates: { latitude: 24.8967, longitude: 55.1611 }
  },
  {
    code: 'AUH',
    name: 'Abu Dhabi International Airport',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    coordinates: { latitude: 24.4330, longitude: 54.6511 }
  },
  {
    code: 'DOH',
    name: 'Hamad International Airport',
    city: 'Doha',
    country: 'Qatar',
    coordinates: { latitude: 25.2731, longitude: 51.6080 }
  },
  {
    code: 'KWI',
    name: 'Kuwait International Airport',
    city: 'Kuwait City',
    country: 'Kuwait',
    coordinates: { latitude: 29.2267, longitude: 47.9689 }
  },
  {
    code: 'TLV',
    name: 'Ben Gurion Airport',
    city: 'Tel Aviv',
    country: 'Israel',
    coordinates: { latitude: 32.0114, longitude: 34.8867 }
  },
  {
    code: 'CAI',
    name: 'Cairo International Airport',
    city: 'Cairo',
    country: 'Egypt',
    coordinates: { latitude: 30.1219, longitude: 31.4056 }
  },
  {
    code: 'CMN',
    name: 'Mohammed V International Airport',
    city: 'Casablanca',
    country: 'Morocco',
    coordinates: { latitude: 33.3675, longitude: -7.5900 }
  },
  {
    code: 'JNB',
    name: 'O.R. Tambo International Airport',
    city: 'Johannesburg',
    country: 'South Africa',
    coordinates: { latitude: -26.1367, longitude: 28.2411 }
  },
  {
    code: 'CPT',
    name: 'Cape Town International Airport',
    city: 'Cape Town',
    country: 'South Africa',
    coordinates: { latitude: -33.9649, longitude: 18.6017 }
  },
  {
    code: 'ADD',
    name: 'Addis Ababa Bole International Airport',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    coordinates: { latitude: 8.9806, longitude: 38.7994 }
  },
  {
    code: 'NBO',
    name: 'Jomo Kenyatta International Airport',
    city: 'Nairobi',
    country: 'Kenya',
    coordinates: { latitude: -1.3192, longitude: 36.9278 }
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
  {
    code: 'YUL',
    name: 'Montréal-Pierre Elliott Trudeau International Airport',
    city: 'Montreal',
    country: 'Canada',
    coordinates: { latitude: 45.4706, longitude: -73.7408 }
  },
  {
    code: 'YYC',
    name: 'Calgary International Airport',
    city: 'Calgary',
    country: 'Canada',
    coordinates: { latitude: 51.1315, longitude: -114.0197 }
  },
  {
    code: 'YOW',
    name: 'Ottawa Macdonald-Cartier International Airport',
    city: 'Ottawa',
    country: 'Canada',
    coordinates: { latitude: 45.3225, longitude: -75.6692 }
  },
  {
    code: 'YWG',
    name: 'Winnipeg James Armstrong Richardson International Airport',
    city: 'Winnipeg',
    country: 'Canada',
    coordinates: { latitude: 49.9100, longitude: -97.2398 }
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
    code: 'GIG',
    name: 'Rio de Janeiro/Galeão International Airport',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    coordinates: { latitude: -22.8099, longitude: -43.2505 }
  },
  {
    code: 'BSB',
    name: 'Brasília International Airport',
    city: 'Brasília',
    country: 'Brazil',
    coordinates: { latitude: -15.8711, longitude: -47.9172 }
  },
  {
    code: 'EZE',
    name: 'Ezeiza International Airport',
    city: 'Buenos Aires',
    country: 'Argentina',
    coordinates: { latitude: -34.8222, longitude: -58.5358 }
  },
  {
    code: 'SCL',
    name: 'Arturo Merino Benítez International Airport',
    city: 'Santiago',
    country: 'Chile',
    coordinates: { latitude: -33.3930, longitude: -70.7858 }
  },
  {
    code: 'LIM',
    name: 'Jorge Chávez International Airport',
    city: 'Lima',
    country: 'Peru',
    coordinates: { latitude: -12.0219, longitude: -77.1143 }
  },
  {
    code: 'BOG',
    name: 'El Dorado International Airport',
    city: 'Bogotá',
    country: 'Colombia',
    coordinates: { latitude: 4.7016, longitude: -74.1469 }
  },
  {
    code: 'UIO',
    name: 'Mariscal Sucre International Airport',
    city: 'Quito',
    country: 'Ecuador',
    coordinates: { latitude: -0.1292, longitude: -78.3575 }
  },
  {
    code: 'CCS',
    name: 'Simón Bolívar International Airport',
    city: 'Caracas',
    country: 'Venezuela',
    coordinates: { latitude: 10.6013, longitude: -66.9844 }
  },
  {
    code: 'MVD',
    name: 'Carrasco International Airport',
    city: 'Montevideo',
    country: 'Uruguay',
    coordinates: { latitude: -34.8384, longitude: -56.0308 }
  },
  {
    code: 'ASU',
    name: 'Silvio Pettirossi International Airport',
    city: 'Asunción',
    country: 'Paraguay',
    coordinates: { latitude: -25.2400, longitude: -57.5194 }
  },
  {
    code: 'LPB',
    name: 'El Alto International Airport',
    city: 'La Paz',
    country: 'Bolivia',
    coordinates: { latitude: -16.5133, longitude: -68.1925 }
  },

  // Caribbean Airports
  {
    code: 'CUN',
    name: 'Cancún International Airport',
    city: 'Cancún',
    country: 'Mexico',
    coordinates: { latitude: 21.0365, longitude: -86.8771 }
  },
  {
    code: 'MEX',
    name: 'Mexico City International Airport',
    city: 'Mexico City',
    country: 'Mexico',
    coordinates: { latitude: 19.4363, longitude: -99.0721 }
  },
  {
    code: 'GDL',
    name: 'Guadalajara International Airport',
    city: 'Guadalajara',
    country: 'Mexico',
    coordinates: { latitude: 20.5218, longitude: -103.3106 }
  },
  {
    code: 'PVR',
    name: 'Licenciado Gustavo Díaz Ordaz International Airport',
    city: 'Puerto Vallarta',
    country: 'Mexico',
    coordinates: { latitude: 20.6801, longitude: -105.2544 }
  },
  {
    code: 'SJU',
    name: 'Luis Muñoz Marín International Airport',
    city: 'San Juan',
    country: 'Puerto Rico',
    coordinates: { latitude: 18.4394, longitude: -66.0018 }
  },
  {
    code: 'BDA',
    name: 'L.F. Wade International Airport',
    city: 'Hamilton',
    country: 'Bermuda',
    coordinates: { latitude: 32.3640, longitude: -64.6787 }
  },
  {
    code: 'NAS',
    name: 'Lynden Pindling International Airport',
    city: 'Nassau',
    country: 'Bahamas',
    coordinates: { latitude: 25.0390, longitude: -77.4660 }
  },
  {
    code: 'BGI',
    name: 'Grantley Adams International Airport',
    city: 'Bridgetown',
    country: 'Barbados',
    coordinates: { latitude: 13.0746, longitude: -59.4925 }
  },
  {
    code: 'KIN',
    name: 'Norman Manley International Airport',
    city: 'Kingston',
    country: 'Jamaica',
    coordinates: { latitude: 17.9357, longitude: -76.7875 }
  },
  {
    code: 'MBJ',
    name: 'Sangster International Airport',
    city: 'Montego Bay',
    country: 'Jamaica',
    coordinates: { latitude: 18.5037, longitude: -77.9134 }
  },
  {
    code: 'SDQ',
    name: 'Las Américas International Airport',
    city: 'Santo Domingo',
    country: 'Dominican Republic',
    coordinates: { latitude: 18.4297, longitude: -69.6689 }
  },
  {
    code: 'PUJ',
    name: 'Punta Cana International Airport',
    city: 'Punta Cana',
    country: 'Dominican Republic',
    coordinates: { latitude: 18.5674, longitude: -68.3634 }
  },
  {
    code: 'HAV',
    name: 'José Martí International Airport',
    city: 'Havana',
    country: 'Cuba',
    coordinates: { latitude: 22.9892, longitude: -82.4091 }
  },
  {
    code: 'CUR',
    name: 'Hato International Airport',
    city: 'Willemstad',
    country: 'Curaçao',
    coordinates: { latitude: 12.1889, longitude: -68.9598 }
  },
  {
    code: 'AUA',
    name: 'Queen Beatrix International Airport',
    city: 'Oranjestad',
    country: 'Aruba',
    coordinates: { latitude: 12.5014, longitude: -70.0152 }
  },

  // Central American Airports
  {
    code: 'SJO',
    name: 'Juan Santamaría International Airport',
    city: 'San José',
    country: 'Costa Rica',
    coordinates: { latitude: 9.9939, longitude: -84.2088 }
  },
  {
    code: 'PTY',
    name: 'Tocumen International Airport',
    city: 'Panama City',
    country: 'Panama',
    coordinates: { latitude: 9.0714, longitude: -79.3834 }
  },
  {
    code: 'GUA',
    name: 'La Aurora International Airport',
    city: 'Guatemala City',
    country: 'Guatemala',
    coordinates: { latitude: 14.5833, longitude: -90.5275 }
  },
  {
    code: 'SAL',
    name: 'Monseñor Óscar Arnulfo Romero International Airport',
    city: 'San Salvador',
    country: 'El Salvador',
    coordinates: { latitude: 13.4406, longitude: -89.0557 }
  },
  {
    code: 'TGU',
    name: 'Toncontín International Airport',
    city: 'Tegucigalpa',
    country: 'Honduras',
    coordinates: { latitude: 14.0608, longitude: -87.2172 }
  },
  {
    code: 'MGA',
    name: 'Augusto C. Sandino International Airport',
    city: 'Managua',
    country: 'Nicaragua',
    coordinates: { latitude: 12.1415, longitude: -86.1682 }
  },
  {
    code: 'BZE',
    name: 'Philip S. W. Goldson International Airport',
    city: 'Belize City',
    country: 'Belize',
    coordinates: { latitude: 17.5392, longitude: -88.3083 }
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
export function getAirportsByRegion(region: 'US' | 'Europe' | 'Asia' | 'Oceania' | 'MiddleEast' | 'Africa' | 'NorthAmerica' | 'SouthAmerica' | 'Caribbean' | 'CentralAmerica'): Location[] {
  const regionMap = {
    'US': ['United States'],
    'Europe': ['United Kingdom', 'France', 'Germany', 'Netherlands', 'Spain', 'Italy', 'Switzerland', 'Austria', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Greece', 'Turkey', 'Portugal', 'Ireland', 'Czech Republic', 'Hungary', 'Poland'],
    'Asia': ['Japan', 'South Korea', 'China', 'Hong Kong', 'Singapore', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'India', 'Taiwan'],
    'Oceania': ['Australia', 'New Zealand', 'Fiji'],
    'MiddleEast': ['United Arab Emirates', 'Qatar', 'Kuwait', 'Israel'],
    'Africa': ['Egypt', 'Morocco', 'South Africa', 'Ethiopia', 'Kenya'],
    'NorthAmerica': ['Canada', 'Mexico'],
    'SouthAmerica': ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Ecuador', 'Venezuela', 'Uruguay', 'Paraguay', 'Bolivia'],
    'Caribbean': ['Puerto Rico', 'Bermuda', 'Bahamas', 'Barbados', 'Jamaica', 'Dominican Republic', 'Cuba', 'Curaçao', 'Aruba'],
    'CentralAmerica': ['Costa Rica', 'Panama', 'Guatemala', 'El Salvador', 'Honduras', 'Nicaragua', 'Belize']
  };
  
  return airports.filter(airport => regionMap[region].includes(airport.country));
} 