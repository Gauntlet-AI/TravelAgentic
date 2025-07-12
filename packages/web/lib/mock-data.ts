export interface TravelDetails {
  departureLocation: string;
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  travelers: number;
  adults: number;
  children: number;
}

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
  location: string;
  description: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: string[];
  price: number;
  duration: string;
  rating: number;
  image: string;
  location: string;
}

export interface ActivityTypeCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  category: string;
}

export interface PreferenceCard {
  id: string;
  title: string;
  description: string;
  image?: string;
  priceRange: [number, number];
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  price: number;
  class: string;
  aircraft: string;
}

/**
 * @deprecated Use /api/activities/categories instead
 * These hardcoded activity types have been replaced with dynamic API calls
 */
export const activityTypes: ActivityTypeCard[] = [
  {
    id: 'outdoor',
    title: 'Outdoor Activities',
    description: 'Hiking, parks, nature experiences',
    icon: '🏔️',
    image:
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'outdoor',
  },
  {
    id: 'indoor',
    title: 'Indoor Activities',
    description: 'Museums, galleries, shopping',
    icon: '🏛️',
    image:
      'https://images.unsplash.com/photo-1723974897013-4bf20b00731d?q=80&w=2488&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'indoor',
  },
  {
    id: 'nightlife',
    title: 'Nightlife & Drinking',
    description: 'Bars, clubs, cocktail lounges',
    icon: '🍸',
    image:
      'https://images.unsplash.com/photo-1546171753-97d7676e4602?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'nightlife',
  },
  {
    id: 'dancing',
    title: 'Dancing & Music',
    description: 'Dance clubs, live music venues',
    icon: '💃',
    image:
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'dancing',
  },
  {
    id: 'sightseeing',
    title: 'Sightseeing',
    description: 'Landmarks, tours, viewpoints',
    icon: '📸',
    image:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'sightseeing',
  },
  {
    id: 'culture',
    title: 'Culture & History',
    description: 'Museums, historical sites, art',
    icon: '🎭',
    image:
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'culture',
  },
  {
    id: 'food',
    title: 'Food & Dining',
    description: 'Restaurants, food tours, cooking',
    icon: '🍽️',
    image:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'food',
  },
  {
    id: 'adventure',
    title: 'Adventure Sports',
    description: 'Extreme sports, water activities',
    icon: '🏄',
    image:
      'https://images.unsplash.com/photo-1711066444236-c39552fea54e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'adventure',
  },
];

/**
 * @deprecated Use /api/hotels/search instead  
 * These hardcoded hotels have been replaced with dynamic API calls
 */
// Mock hotel data
export const mockHotels: Hotel[] = [
  {
    id: 'hotel-1',
    name: 'Grand Plaza Hotel',
    rating: 4.5,
    pricePerNight: 250,
    image:
      'https://images.unsplash.com/photo-1455587734955-081b22074882?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
    location: 'Downtown',
    description: 'Luxury hotel in the heart of the city',
  },
  {
    id: 'hotel-2',
    name: 'Boutique Inn',
    rating: 4.2,
    pricePerNight: 180,
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    amenities: ['WiFi', 'Breakfast', 'Pet Friendly'],
    location: 'Arts District',
    description: 'Charming boutique hotel with local character',
  },
  {
    id: 'hotel-3',
    name: 'Budget Stay',
    rating: 3.8,
    pricePerNight: 95,
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    amenities: ['WiFi', 'Parking'],
    location: 'Near Airport',
    description: 'Clean and comfortable budget accommodation',
  },
  {
    id: 'hotel-4',
    name: 'Oceanview Resort',
    rating: 4.7,
    pricePerNight: 320,
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    amenities: ['WiFi', 'Pool', 'Spa', 'Beach Access', 'Pet Friendly'],
    location: 'Waterfront',
    description: 'Stunning oceanfront resort with world-class amenities',
  },
  {
    id: 'hotel-5',
    name: 'Historic Manor',
    rating: 4.3,
    pricePerNight: 195,
    image:
      'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    amenities: ['WiFi', 'Restaurant', 'Valet Parking', 'Concierge'],
    location: 'Historic District',
    description: 'Elegant historic hotel with timeless charm',
  },
  {
    id: 'hotel-6',
    name: 'Modern Suites',
    rating: 4.1,
    pricePerNight: 165,
    image:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    amenities: ['WiFi', 'Kitchenette', 'Gym', 'Pet Friendly'],
    location: 'Business District',
    description: 'Contemporary suites perfect for extended stays',
  },
  {
    id: 'hotel-7',
    name: 'Mountain Lodge',
    rating: 4.6,
    pricePerNight: 275,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    amenities: ['WiFi', 'Fireplace', 'Hiking Trails', 'Restaurant'],
    location: 'Mountain View',
    description: 'Rustic lodge with breathtaking mountain views',
  },
  {
    id: 'hotel-8',
    name: 'City Center Hotel',
    rating: 4.0,
    pricePerNight: 145,
    image:
      'https://images.unsplash.com/photo-1517840901100-8179e982acb7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    amenities: ['WiFi', 'Business Center', 'Parking'],
    location: 'City Center',
    description: 'Convenient location with modern amenities',
  },
];

/**
 * @deprecated Use /api/activities/search instead
 * These hardcoded activities have been replaced with dynamic API calls  
 */
// Mock activities data
export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    name: 'Mountain Hiking Trail',
    description: 'Scenic 3-hour hike with breathtaking views',
    category: ['outdoor', 'adventure'],
    price: 45,
    duration: '3 hours',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Mountain Ridge',
  },
  {
    id: 'activity-2',
    name: 'Art Museum Tour',
    description: 'Guided tour of contemporary art collections',
    category: ['indoor', 'culture'],
    price: 25,
    duration: '2 hours',
    rating: 4.3,
    image:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Museum District',
  },
  {
    id: 'activity-3',
    name: 'Rooftop Bar Experience',
    description: 'Craft cocktails with city skyline views',
    category: ['nightlife', 'sightseeing'],
    price: 60,
    duration: '2-3 hours',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Downtown',
  },
  {
    id: 'activity-4',
    name: 'Salsa Dancing Class',
    description: 'Learn salsa with professional instructors',
    category: ['dancing', 'culture'],
    price: 35,
    duration: '1.5 hours',
    rating: 4.4,
    image:
      'https://images.unsplash.com/photo-1731596152971-26fb19c427bf?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    location: 'Dance Studio',
  },
  {
    id: 'activity-5',
    name: 'Food Walking Tour',
    description: 'Taste local cuisine at 5 different stops',
    category: ['food', 'culture', 'sightseeing'],
    price: 75,
    duration: '3 hours',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Historic Quarter',
  },
  {
    id: 'activity-6',
    name: 'Kayak Adventure',
    description: 'Paddle through scenic waterways',
    category: ['outdoor', 'adventure'],
    price: 55,
    duration: '2.5 hours',
    rating: 4.5,
    image:
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Riverside Park',
  },
  {
    id: 'activity-7',
    name: 'Wine Tasting Experience',
    description: 'Sample local wines with expert sommelier',
    category: ['food', 'indoor'],
    price: 85,
    duration: '2 hours',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Wine District',
  },
  {
    id: 'activity-8',
    name: 'Historic Walking Tour',
    description: "Explore the city's rich history and architecture",
    category: ['culture', 'sightseeing'],
    price: 30,
    duration: '2.5 hours',
    rating: 4.2,
    image:
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Old Town',
  },
  {
    id: 'activity-9',
    name: 'Cooking Class',
    description: 'Learn to cook authentic local dishes',
    category: ['food', 'culture', 'indoor'],
    price: 95,
    duration: '3 hours',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Culinary School',
  },
  {
    id: 'activity-10',
    name: 'Sunset Photography Tour',
    description: 'Capture stunning sunset shots at scenic locations',
    category: ['outdoor', 'sightseeing'],
    price: 65,
    duration: '2 hours',
    rating: 4.4,
    image:
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Scenic Overlook',
  },
  {
    id: 'activity-11',
    name: 'Jazz Club Night',
    description: 'Live jazz performances in intimate setting',
    category: ['nightlife', 'culture'],
    price: 40,
    duration: '3 hours',
    rating: 4.5,
    image:
      'https://images.unsplash.com/photo-1559752067-f30e5f277930?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Jazz District',
  },
  {
    id: 'activity-12',
    name: 'Bike City Tour',
    description: 'Explore the city on two wheels with local guide',
    category: ['outdoor', 'sightseeing'],
    price: 50,
    duration: '3 hours',
    rating: 4.3,
    image:
      'https://images.unsplash.com/photo-1684284994249-935f478cc127?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'City Center',
  },
];

/**
 * @deprecated Use /api/preferences/cards instead
 * These hardcoded preference cards have been replaced with dynamic API calls
 */
export const mockPreferenceCards: PreferenceCard[] = [
  {
    id: 'card-1',
    title: 'Beaches & Sun',
    description: 'Relax on sandy beaches and soak up the sun.',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    priceRange: [0, 0],
  },
  {
    id: 'card-2',
    title: 'City Exploration',
    description: 'Discover vibrant cities and cultural landmarks.',
    image:
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    priceRange: [50, 200],
  },
  {
    id: 'card-3',
    title: 'Mountain Adventures',
    description: 'Hike scenic trails and enjoy breathtaking views.',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    priceRange: [20, 80],
  },
];

/**
 * @deprecated Use /api/flights/search instead
 * These hardcoded flights have been replaced with dynamic API calls
 */
export const mockFlights: Flight[] = [
  {
    id: 'flight-1',
    airline: 'Delta Air Lines',
    flightNumber: 'DL 1234',
    departure: {
      airport: 'ATL',
      city: 'Atlanta',
      time: '8:30 AM',
      date: 'Jul 16',
    },
    arrival: {
      airport: 'SFO',
      city: 'San Francisco',
      time: '11:45 AM',
      date: 'Jul 16',
    },
    duration: '5h 15m',
    stops: 0,
    price: 425,
    class: 'Economy',
    aircraft: 'Boeing 737-800',
  },
  {
    id: 'flight-2',
    airline: 'United Airlines',
    flightNumber: 'UA 567',
    departure: {
      airport: 'ATL',
      city: 'Atlanta',
      time: '2:15 PM',
      date: 'Jul 16',
    },
    arrival: {
      airport: 'SFO',
      city: 'San Francisco',
      time: '5:30 PM',
      date: 'Jul 16',
    },
    duration: '5h 15m',
    stops: 0,
    price: 389,
    class: 'Economy',
    aircraft: 'Airbus A320',
  },
  {
    id: 'flight-3',
    airline: 'American Airlines',
    flightNumber: 'AA 890',
    departure: {
      airport: 'ATL',
      city: 'Atlanta',
      time: '6:45 PM',
      date: 'Jul 16',
    },
    arrival: {
      airport: 'SFO',
      city: 'San Francisco',
      time: '10:00 PM',
      date: 'Jul 16',
    },
    duration: '5h 15m',
    stops: 0,
    price: 456,
    class: 'Economy',
    aircraft: 'Boeing 777-200',
  },
  {
    id: 'flight-4',
    airline: 'Southwest Airlines',
    flightNumber: 'WN 123',
    departure: {
      airport: 'ATL',
      city: 'Atlanta',
      time: '10:30 AM',
      date: 'Jul 16',
    },
    arrival: {
      airport: 'SFO',
      city: 'San Francisco',
      time: '3:45 PM',
      date: 'Jul 16',
    },
    duration: '7h 15m',
    stops: 1,
    price: 298,
    class: 'Economy',
    aircraft: 'Boeing 737-700',
  },
];

// Keep the existing array data for now to avoid breaking changes
// Components should migrate to use the new API endpoints:
// - /api/airports/search - for airport autocomplete  
// - /api/activities/categories - for activity types
// - /api/user/history - for user trip history
// - /api/itinerary/generate - for dynamic itinerary building
// - /api/hotels/search - for hotel search
// - /api/activities/search - for activity search  
// - /api/flights/search - for flight search
