/**
 * Hotel data for mock hotel services
 * Organized by destination with realistic properties and amenities
 */

import { HotelResult } from '../types';

/**
 * Hotel amenities and their categories
 */
export const hotelAmenities = {
  basic: ['WiFi', 'Air Conditioning', 'TV', 'Private Bathroom', 'Daily Housekeeping'],
  comfort: ['Room Service', 'Concierge', 'Laundry Service', 'Safe', 'Minibar'],
  recreation: ['Pool', 'Fitness Center', 'Spa', 'Hot Tub', 'Sauna'],
  business: ['Business Center', 'Meeting Rooms', 'Conference Facilities', 'Printer/Fax'],
  dining: ['Restaurant', 'Bar', 'Breakfast Included', 'Room Service', 'Kitchen/Kitchenette'],
  family: ['Kid-Friendly', 'Babysitting', 'Kids Club', 'Family Rooms', 'Playground'],
  accessibility: ['Wheelchair Accessible', 'Elevator', 'Accessible Bathroom', 'Braille/Audio'],
  transport: ['Airport Shuttle', 'Parking', 'Valet Parking', 'Car Rental', 'Metro Access'],
  pet: ['Pet Friendly', 'Pet Sitting', 'Pet Grooming', 'Dog Park'],
  premium: ['Butler Service', 'Private Beach', 'Golf Course', 'Marina', 'Helicopter Pad']
};

/**
 * Property types for filtering
 */
export const propertyTypes = [
  'Hotel', 'Resort', 'Boutique Hotel', 'Business Hotel', 'Luxury Hotel',
  'Budget Hotel', 'Hostel', 'Bed & Breakfast', 'Apartment', 'Villa',
  'Motel', 'Inn', 'Lodge', 'Guesthouse', 'Extended Stay'
];

/**
 * Sample hotel data organized by major cities
 */
export const hotelsByDestination: Record<string, Partial<HotelResult>[]> = {
  'New York': [
    {
      name: 'The Plaza Hotel',
      starRating: 5,
      rating: { score: 4.6, reviewCount: 3247, reviewSummary: 'Iconic luxury with exceptional service' },
      location: {
        address: '768 5th Ave, New York, NY 10019',
        city: 'New York',
        country: 'United States',
        coordinates: { latitude: 40.7648, longitude: -73.9754 },
        distanceFromCenter: 0.5
      },
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Concierge', 'Restaurant', 'Bar', 'Spa', 'Fitness Center', 'Room Service', 'Valet Parking'],
      description: 'Iconic luxury hotel overlooking Central Park with world-class amenities and timeless elegance.',
      highlights: ['Central Park Views', 'Historic Landmark', 'Michelin Star Dining', 'Luxury Shopping'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Pod Hotels Times Square',
      starRating: 3,
      rating: { score: 4.1, reviewCount: 2156, reviewSummary: 'Modern and efficient with great location' },
      location: {
        address: '400 W 42nd St, New York, NY 10036',
        city: 'New York',
        country: 'United States',
        coordinates: { latitude: 40.7589, longitude: -73.9851 },
        distanceFromCenter: 1.2
      },
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
      ],
      amenities: ['WiFi', 'Fitness Center', 'Restaurant', 'Business Center', 'Pet Friendly'],
      description: 'Modern micro-hotel concept in the heart of Times Square with smart design and tech amenities.',
      highlights: ['Times Square Location', 'Smart Room Design', 'Rooftop Terrace', 'Tech-Forward'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 48 hours before arrival'
      }
    },
    {
      name: 'The High Line Hotel',
      starRating: 4,
      rating: { score: 4.4, reviewCount: 1834, reviewSummary: 'Charming boutique hotel with character' },
      location: {
        address: '180 10th Ave, New York, NY 10011',
        city: 'New York',
        country: 'United States',
        coordinates: { latitude: 40.7441, longitude: -74.0048 },
        distanceFromCenter: 2.1
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Concierge', 'Pet Friendly', 'Fitness Center'],
      description: 'Gothic Revival charm meets modern luxury in Chelsea, near the High Line park.',
      highlights: ['Historic Architecture', 'High Line Access', 'Chelsea Market Nearby', 'Boutique Experience'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival',
        petPolicy: 'Pets welcome with $100 fee'
      }
    }
  ],

  'London': [
    {
      name: 'The Savoy',
      starRating: 5,
      rating: { score: 4.7, reviewCount: 4521, reviewSummary: 'Legendary luxury with impeccable service' },
      location: {
        address: 'Strand, London WC2R 0EZ, UK',
        city: 'London',
        country: 'United Kingdom',
        coordinates: { latitude: 51.5101, longitude: -0.1197 },
        distanceFromCenter: 0.8
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Concierge', 'Restaurant', 'Bar', 'Spa', 'Fitness Center', 'Butler Service', 'Valet Parking'],
      description: 'Legendary Art Deco hotel on the Thames with world-renowned afternoon tea and dining.',
      highlights: ['Thames Views', 'Art Deco Design', 'Afternoon Tea', 'Theater District'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Premier Inn London County Hall',
      starRating: 3,
      rating: { score: 4.2, reviewCount: 3456, reviewSummary: 'Great value with excellent location' },
      location: {
        address: 'Belvedere Rd, London SE1 7PB, UK',
        city: 'London',
        country: 'United Kingdom',
        coordinates: { latitude: 51.5016, longitude: -0.1156 },
        distanceFromCenter: 1.0
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Business Center', 'Accessible'],
      description: 'Modern budget hotel with comfortable rooms and prime South Bank location.',
      highlights: ['London Eye Views', 'South Bank Location', 'Great Value', 'Family Friendly'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'Tokyo': [
    {
      name: 'The Ritz-Carlton Tokyo',
      starRating: 5,
      rating: { score: 4.8, reviewCount: 2987, reviewSummary: 'Exceptional luxury with stunning city views' },
      location: {
        address: '9-7-1 Akasaka, Minato City, Tokyo 107-6245, Japan',
        city: 'Tokyo',
        country: 'Japan',
        coordinates: { latitude: 35.6762, longitude: 139.7381 },
        distanceFromCenter: 2.5
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Concierge', 'Restaurant', 'Bar', 'Spa', 'Fitness Center', 'Pool', 'Butler Service'],
      description: 'Ultra-luxury hotel on the upper floors of Tokyo Midtown with panoramic city views.',
      highlights: ['Panoramic Views', 'Michelin Dining', 'Sky-High Location', 'Traditional Service'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Capsule Hotel Anshin Oyado',
      starRating: 2,
      rating: { score: 3.9, reviewCount: 1234, reviewSummary: 'Clean and efficient capsule experience' },
      location: {
        address: '2-1-1 Kabukicho, Shinjuku City, Tokyo 160-0021, Japan',
        city: 'Tokyo',
        country: 'Japan',
        coordinates: { latitude: 35.6938, longitude: 139.7034 },
        distanceFromCenter: 3.2
      },
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
      ],
      amenities: ['WiFi', 'Shared Bathroom', 'Lounge Area', 'Vending Machines'],
      description: 'Modern capsule hotel experience in the heart of Shinjuku entertainment district.',
      highlights: ['Authentic Experience', 'Shinjuku Location', 'Budget Friendly', 'Modern Capsules'],
      policies: {
        checkIn: '4:00 PM',
        checkOut: '10:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'Paris': [
    {
      name: 'Le Bristol Paris',
      starRating: 5,
      rating: { score: 4.6, reviewCount: 3421, reviewSummary: 'Parisian elegance with exceptional gardens' },
      location: {
        address: '112 Rue du Faubourg Saint-Honoré, 75008 Paris, France',
        city: 'Paris',
        country: 'France',
        coordinates: { latitude: 48.8721, longitude: 2.3165 },
        distanceFromCenter: 1.8
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Concierge', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Garden', 'Pet Friendly'],
      description: 'Palace hotel with French elegance, Michelin-starred dining, and beautiful garden.',
      highlights: ['Palace Classification', 'Michelin Stars', 'Beautiful Garden', 'Luxury Shopping'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival',
        petPolicy: 'Pets welcome with premium amenities'
      }
    },
    {
      name: 'Hotel des Grands Boulevards',
      starRating: 4,
      rating: { score: 4.3, reviewCount: 1876, reviewSummary: 'Stylish boutique with great atmosphere' },
      location: {
        address: '17 Boulevard Poissonnière, 75002 Paris, France',
        city: 'Paris',
        country: 'France',
        coordinates: { latitude: 48.8708, longitude: 2.3428 },
        distanceFromCenter: 1.2
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Concierge', 'Business Center'],
      description: 'Contemporary boutique hotel with vibrant design in the historic Grands Boulevards area.',
      highlights: ['Contemporary Design', 'Historic Area', 'Vibrant Atmosphere', 'Local Experience'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 48 hours before arrival'
      }
    }
  ]
};

/**
 * Room types with descriptions and pricing modifiers
 */
export const roomTypes = [
  {
    name: 'Standard Room',
    description: 'Comfortable room with essential amenities',
    maxOccupancy: 2,
    bedType: 'Queen Bed',
    roomSize: '25 sqm',
    priceMultiplier: 1.0
  },
  {
    name: 'Deluxe Room',
    description: 'Spacious room with enhanced amenities and city views',
    maxOccupancy: 2,
    bedType: 'King Bed',
    roomSize: '35 sqm',
    priceMultiplier: 1.3
  },
  {
    name: 'Junior Suite',
    description: 'Suite with separate living area and premium amenities',
    maxOccupancy: 3,
    bedType: 'King Bed + Sofa Bed',
    roomSize: '45 sqm',
    priceMultiplier: 1.8
  },
  {
    name: 'Executive Suite',
    description: 'Luxury suite with panoramic views and butler service',
    maxOccupancy: 4,
    bedType: 'King Bed + Living Room',
    roomSize: '65 sqm',
    priceMultiplier: 2.5
  },
  {
    name: 'Presidential Suite',
    description: 'Ultimate luxury with private terrace and exclusive amenities',
    maxOccupancy: 6,
    bedType: 'King Bed + Multiple Rooms',
    roomSize: '120 sqm',
    priceMultiplier: 5.0
  }
];

/**
 * Get hotels for a specific destination
 */
export function getHotelsByDestination(destination: string): Partial<HotelResult>[] {
  const destinationKey = Object.keys(hotelsByDestination).find(key => 
    key.toLowerCase().includes(destination.toLowerCase()) ||
    destination.toLowerCase().includes(key.toLowerCase())
  );
  
  return destinationKey ? hotelsByDestination[destinationKey] : [];
}

/**
 * Get all available destinations
 */
export function getAvailableDestinations(): string[] {
  return Object.keys(hotelsByDestination);
}

/**
 * Search hotels by name or location
 */
export function searchHotels(query: string): Partial<HotelResult>[] {
  const searchTerm = query.toLowerCase();
  const results: Partial<HotelResult>[] = [];
  
  Object.values(hotelsByDestination).forEach(hotels => {
    hotels.forEach(hotel => {
      if (
        hotel.name?.toLowerCase().includes(searchTerm) ||
        hotel.location?.city.toLowerCase().includes(searchTerm) ||
        hotel.location?.address.toLowerCase().includes(searchTerm) ||
        hotel.description?.toLowerCase().includes(searchTerm)
      ) {
        results.push(hotel);
      }
    });
  });
  
  return results;
} 