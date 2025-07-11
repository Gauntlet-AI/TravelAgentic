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
    },
    {
      name: 'The Zetter Townhouse Piccadilly',
      starRating: 4,
      rating: { score: 4.4, reviewCount: 2156, reviewSummary: 'Charming boutique with quirky character' },
      location: {
        address: '3 Dover St, London W1S 4LD, UK',
        city: 'London',
        country: 'United Kingdom',
        coordinates: { latitude: 51.5079, longitude: -0.1407 },
        distanceFromCenter: 0.5
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Concierge', 'Pet Friendly'],
      description: 'Quirky boutique hotel in Mayfair with unique decor and intimate atmosphere.',
      highlights: ['Mayfair Location', 'Boutique Experience', 'Unique Decor', 'Intimate Atmosphere'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival',
        petPolicy: 'Pets welcome with fee'
      }
    },
    {
      name: 'YHA London Central',
      starRating: 2,
      rating: { score: 3.8, reviewCount: 1876, reviewSummary: 'Clean hostel with great facilities' },
      location: {
        address: '104 Bolsover St, London W1W 5NU, UK',
        city: 'London',
        country: 'United Kingdom',
        coordinates: { latitude: 51.5205, longitude: -0.1421 },
        distanceFromCenter: 1.5
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area', 'Luggage Storage', 'Cafe'],
      description: 'Modern hostel near Oxford Street with excellent facilities and social atmosphere.',
      highlights: ['Oxford Street', 'Budget Friendly', 'Social Atmosphere', 'Great Facilities'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '10:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Shangri-La Hotel at The Shard',
      starRating: 5,
      rating: { score: 4.8, reviewCount: 3987, reviewSummary: 'Sky-high luxury with stunning views' },
      location: {
        address: '31 St Thomas St, London SE1 9QU, UK',
        city: 'London',
        country: 'United Kingdom',
        coordinates: { latitude: 51.5045, longitude: -0.0865 },
        distanceFromCenter: 1.2
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'City Views'],
      description: 'Ultra-luxury hotel occupying floors 34-52 of The Shard with panoramic city views.',
      highlights: ['The Shard', 'Panoramic Views', 'Ultra Luxury', 'Sky-high Location'],
      policies: {
        checkIn: '3:00 PM',
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
    },
    {
      name: 'Aman Tokyo',
      starRating: 5,
      rating: { score: 4.9, reviewCount: 2341, reviewSummary: 'Serene luxury with Japanese minimalism' },
      location: {
        address: '1-5-6 Otemachi, Chiyoda City, Tokyo 100-0004, Japan',
        city: 'Tokyo',
        country: 'Japan',
        coordinates: { latitude: 35.6847, longitude: 139.7670 },
        distanceFromCenter: 1.5
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'Garden'],
      description: 'Ultra-luxury hotel with Japanese minimalist design and serene atmosphere.',
      highlights: ['Japanese Minimalism', 'Serene Atmosphere', 'Imperial Palace Views', 'Zen Design'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Hotel Gracery Shinjuku',
      starRating: 4,
      rating: { score: 4.3, reviewCount: 3456, reviewSummary: 'Modern business hotel with Godzilla' },
      location: {
        address: '1-19-1 Kabukicho, Shinjuku City, Tokyo 160-8330, Japan',
        city: 'Tokyo',
        country: 'Japan',
        coordinates: { latitude: 35.6938, longitude: 139.7016 },
        distanceFromCenter: 3.0
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Business Center', 'Fitness Center', 'Meeting Rooms'],
      description: 'Modern business hotel famous for its giant Godzilla head on the building.',
      highlights: ['Godzilla Head', 'Business Friendly', 'Modern Amenities', 'Shinjuku Location'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Hostel Komatsu Ueno Station',
      starRating: 2,
      rating: { score: 4.0, reviewCount: 1654, reviewSummary: 'Clean hostel near major attractions' },
      location: {
        address: '5-11-6 Ueno, Taito City, Tokyo 110-0005, Japan',
        city: 'Tokyo',
        country: 'Japan',
        coordinates: { latitude: 35.7081, longitude: 139.7753 },
        distanceFromCenter: 4.0
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area', 'Luggage Storage', 'Bicycle Rental'],
      description: 'Budget-friendly hostel near Ueno Park and major museums with good facilities.',
      highlights: ['Ueno Park', 'Budget Friendly', 'Museum District', 'Cultural Area'],
      policies: {
        checkIn: '3:00 PM',
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
    },
    {
      name: 'Hotel Malte Opera',
      starRating: 3,
      rating: { score: 4.0, reviewCount: 2341, reviewSummary: 'Central location with comfortable rooms' },
      location: {
        address: '63 Rue de Richelieu, 75002 Paris, France',
        city: 'Paris',
        country: 'France',
        coordinates: { latitude: 48.8698, longitude: 2.3392 },
        distanceFromCenter: 0.8
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Breakfast', 'Bar', 'Business Center', 'Concierge'],
      description: 'Charming hotel near the Opera with classic Parisian charm and modern amenities.',
      highlights: ['Opera District', 'Shopping Nearby', 'Classic Decor', 'Great Value'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'Barcelona': [
    {
      name: 'Hotel Casa Fuster',
      starRating: 5,
      rating: { score: 4.5, reviewCount: 2876, reviewSummary: 'Modernist luxury with stunning city views' },
      location: {
        address: 'Passeig de Gràcia, 132, 08008 Barcelona, Spain',
        city: 'Barcelona',
        country: 'Spain',
        coordinates: { latitude: 41.3984, longitude: 2.1615 },
        distanceFromCenter: 1.5
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Business Center'],
      description: 'Iconic modernist building turned luxury hotel on prestigious Passeig de Gràcia.',
      highlights: ['Modernist Architecture', 'Gaudí Nearby', 'Luxury Shopping', 'Rooftop Views'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Hotel Praktik Bakery',
      starRating: 3,
      rating: { score: 4.2, reviewCount: 1654, reviewSummary: 'Unique concept hotel with amazing breakfast' },
      location: {
        address: 'Carrer de Provença, 279, 08008 Barcelona, Spain',
        city: 'Barcelona',
        country: 'Spain',
        coordinates: { latitude: 41.3935, longitude: 2.1621 },
        distanceFromCenter: 1.2
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Bakery', 'Bar', 'Business Center', 'Pet Friendly'],
      description: 'Boutique hotel with an on-site bakery offering fresh pastries and unique atmosphere.',
      highlights: ['On-site Bakery', 'Unique Concept', 'Fresh Pastries', 'Boutique Experience'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival',
        petPolicy: 'Small pets welcome'
      }
    },
    {
      name: 'W Barcelona',
      starRating: 5,
      rating: { score: 4.6, reviewCount: 3421, reviewSummary: 'Beachfront luxury with modern design' },
      location: {
        address: 'Plaça de la Rosa dels Vents, 1, 08039 Barcelona, Spain',
        city: 'Barcelona',
        country: 'Spain',
        coordinates: { latitude: 41.3688, longitude: 2.1968 },
        distanceFromCenter: 3.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Beach Access', 'Fitness Center', 'Pet Friendly'],
      description: 'Sail-shaped luxury hotel directly on Barceloneta Beach with stunning sea views.',
      highlights: ['Beachfront', 'Iconic Design', 'Sea Views', 'Beach Access'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival',
        petPolicy: 'Pets welcome'
      }
    },
    {
      name: 'Generator Barcelona',
      starRating: 2,
      rating: { score: 4.1, reviewCount: 2456, reviewSummary: 'Stylish hostel with great atmosphere' },
      location: {
        address: 'Carrer de Còrsega, 377, 08037 Barcelona, Spain',
        city: 'Barcelona',
        country: 'Spain',
        coordinates: { latitude: 41.3969, longitude: 2.1640 },
        distanceFromCenter: 2.0
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Kitchen', 'Laundry', 'Common Area', 'Luggage Storage'],
      description: 'Trendy hostel with industrial design and vibrant social atmosphere.',
      highlights: ['Trendy Design', 'Social Atmosphere', 'Budget Friendly', 'Great Location'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Hotel Barcelona 1882',
      starRating: 4,
      rating: { score: 4.3, reviewCount: 1876, reviewSummary: 'Boutique hotel with classic elegance' },
      location: {
        address: 'Carrer de Pau Claris, 85, 08010 Barcelona, Spain',
        city: 'Barcelona',
        country: 'Spain',
        coordinates: { latitude: 41.3910, longitude: 2.1654 },
        distanceFromCenter: 1.0
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Business Center', 'Concierge', 'Fitness Center'],
      description: 'Elegant boutique hotel combining classic architecture with modern amenities.',
      highlights: ['Classic Architecture', 'Boutique Experience', 'Central Location', 'Elegant Design'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'Berlin': [
    {
      name: 'Hotel Adlon Kempinski',
      starRating: 5,
      rating: { score: 4.7, reviewCount: 4521, reviewSummary: 'Legendary luxury at Brandenburg Gate' },
      location: {
        address: 'Unter den Linden 77, 10117 Berlin, Germany',
        city: 'Berlin',
        country: 'Germany',
        coordinates: { latitude: 52.5159, longitude: 13.3777 },
        distanceFromCenter: 0.2
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service'],
      description: 'Iconic luxury hotel at Brandenburg Gate with legendary service and historic charm.',
      highlights: ['Brandenburg Gate', 'Historic Luxury', 'Michelin Dining', 'Presidential Suite'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Meininger Hotel Berlin Hauptbahnhof',
      starRating: 3,
      rating: { score: 4.1, reviewCount: 3456, reviewSummary: 'Modern budget hotel with great location' },
      location: {
        address: 'Ella-Trebe-Straße 9, 10557 Berlin, Germany',
        city: 'Berlin',
        country: 'Germany',
        coordinates: { latitude: 52.5248, longitude: 13.3693 },
        distanceFromCenter: 1.0
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Business Center', 'Luggage Storage'],
      description: 'Contemporary hotel near main train station with modern amenities and competitive rates.',
      highlights: ['Central Station', 'Modern Design', 'Great Value', 'Business Friendly'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'The Ritz-Carlton Berlin',
      starRating: 5,
      rating: { score: 4.8, reviewCount: 3217, reviewSummary: 'Modern luxury with exceptional service' },
      location: {
        address: 'Potsdamer Platz 3, 10785 Berlin, Germany',
        city: 'Berlin',
        country: 'Germany',
        coordinates: { latitude: 52.5096, longitude: 13.3738 },
        distanceFromCenter: 0.5
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'Business Center'],
      description: 'Contemporary luxury hotel at Potsdamer Platz with world-class amenities and service.',
      highlights: ['Potsdamer Platz', 'Modern Luxury', 'Business District', 'Exceptional Service'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Circus Hotel',
      starRating: 4,
      rating: { score: 4.4, reviewCount: 2876, reviewSummary: 'Hip boutique hotel in trendy Mitte' },
      location: {
        address: 'Weinbergsweg 1a, 10119 Berlin, Germany',
        city: 'Berlin',
        country: 'Germany',
        coordinates: { latitude: 52.5274, longitude: 13.3967 },
        distanceFromCenter: 1.5
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Fitness Center', 'Business Center', 'Pet Friendly'],
      description: 'Stylish boutique hotel in trendy Mitte district with modern design and local atmosphere.',
      highlights: ['Trendy Mitte', 'Modern Design', 'Local Atmosphere', 'Boutique Experience'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival',
        petPolicy: 'Pets welcome'
      }
    },
    {
      name: 'EastSeven Berlin Hostel',
      starRating: 2,
      rating: { score: 4.2, reviewCount: 1654, reviewSummary: 'Cozy hostel with homely atmosphere' },
      location: {
        address: 'Schwedter Str. 7, 10119 Berlin, Germany',
        city: 'Berlin',
        country: 'Germany',
        coordinates: { latitude: 52.5329, longitude: 13.4016 },
        distanceFromCenter: 2.0
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area', 'Garden', 'Luggage Storage'],
      description: 'Cozy hostel in Prenzlauer Berg with homely atmosphere and beautiful garden.',
      highlights: ['Prenzlauer Berg', 'Garden', 'Homely Atmosphere', 'Budget Friendly'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'Rome': [
    {
      name: 'Hotel de Russie',
      starRating: 5,
      rating: { score: 4.6, reviewCount: 3987, reviewSummary: 'Elegant luxury with stunning gardens' },
      location: {
        address: 'Via del Babuino, 9, 00187 Rome, Italy',
        city: 'Rome',
        country: 'Italy',
        coordinates: { latitude: 41.9109, longitude: 12.4760 },
        distanceFromCenter: 0.5
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Garden', 'Fitness Center', 'Pet Friendly'],
      description: 'Luxury hotel between Spanish Steps and Piazza del Popolo with beautiful terraced gardens.',
      highlights: ['Spanish Steps', 'Secret Gardens', 'Luxury Spa', 'Historic Center'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival',
        petPolicy: 'Pets welcome with amenities'
      }
    },
    {
      name: 'The First Roma Dolce',
      starRating: 4,
      rating: { score: 4.3, reviewCount: 2156, reviewSummary: 'Stylish boutique near Vatican' },
      location: {
        address: 'Via di Porta Castello, 44, 00193 Rome, Italy',
        city: 'Rome',
        country: 'Italy',
        coordinates: { latitude: 41.9069, longitude: 12.4635 },
        distanceFromCenter: 1.2
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Fitness Center', 'Business Center'],
      description: 'Contemporary boutique hotel near Vatican City with modern design and amenities.',
      highlights: ['Vatican Nearby', 'Modern Design', 'Boutique Experience', 'Great Location'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Rome Cavalieri Waldorf Astoria',
      starRating: 5,
      rating: { score: 4.7, reviewCount: 4521, reviewSummary: 'Palatial luxury with panoramic views' },
      location: {
        address: 'Via Alberto Cadlolo, 101, 00136 Rome, Italy',
        city: 'Rome',
        country: 'Italy',
        coordinates: { latitude: 41.9320, longitude: 12.4407 },
        distanceFromCenter: 3.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'Art Collection'],
      description: 'Palatial hotel on Monte Mario with panoramic city views and world-class art collection.',
      highlights: ['Panoramic Views', 'Art Collection', 'Palatial Setting', 'Michelin Dining'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Hotel Artemide',
      starRating: 4,
      rating: { score: 4.4, reviewCount: 2876, reviewSummary: 'Central location with classic elegance' },
      location: {
        address: 'Via Nazionale, 22, 00184 Rome, Italy',
        city: 'Rome',
        country: 'Italy',
        coordinates: { latitude: 41.9004, longitude: 12.4929 },
        distanceFromCenter: 0.8
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Fitness Center', 'Business Center', 'Rooftop Terrace'],
      description: 'Elegant hotel near Termini Station with classic Roman style and modern amenities.',
      highlights: ['Central Location', 'Classic Style', 'Rooftop Terrace', 'Historic District'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'The RomeHello',
      starRating: 2,
      rating: { score: 4.0, reviewCount: 1876, reviewSummary: 'Modern hostel with great facilities' },
      location: {
        address: 'Via Palestro, 51, 00185 Rome, Italy',
        city: 'Rome',
        country: 'Italy',
        coordinates: { latitude: 41.8953, longitude: 12.5015 },
        distanceFromCenter: 1.5
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area', 'Rooftop Terrace', 'Tours'],
      description: 'Modern hostel near Termini Station with excellent facilities and social atmosphere.',
      highlights: ['Modern Facilities', 'Social Atmosphere', 'Budget Friendly', 'Great Location'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'Sydney': [
    {
      name: 'Park Hyatt Sydney',
      starRating: 5,
      rating: { score: 4.8, reviewCount: 4321, reviewSummary: 'Unparalleled harbour views and luxury' },
      location: {
        address: '7 Hickson Rd, The Rocks NSW 2000, Australia',
        city: 'Sydney',
        country: 'Australia',
        coordinates: { latitude: -33.8599, longitude: 151.2099 },
        distanceFromCenter: 0.5
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service'],
      description: 'Iconic luxury hotel with spectacular views of Sydney Opera House and Harbour Bridge.',
      highlights: ['Opera House Views', 'Harbour Bridge', 'Luxury Spa', 'Fine Dining'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'YHA Sydney Harbour',
      starRating: 3,
      rating: { score: 4.0, reviewCount: 2876, reviewSummary: 'Budget-friendly with harbour views' },
      location: {
        address: '110 Cumberland St, The Rocks NSW 2000, Australia',
        city: 'Sydney',
        country: 'Australia',
        coordinates: { latitude: -33.8587, longitude: 151.2065 },
        distanceFromCenter: 0.8
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area', 'Rooftop Terrace'],
      description: 'Modern hostel in historic Rocks area with stunning harbour views and great facilities.',
      highlights: ['Budget Friendly', 'Harbour Views', 'Historic Location', 'Social Atmosphere'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '10:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Shangri-La Hotel Sydney',
      starRating: 5,
      rating: { score: 4.7, reviewCount: 3987, reviewSummary: 'Luxury with stunning harbour panorama' },
      location: {
        address: '176 Cumberland St, The Rocks NSW 2000, Australia',
        city: 'Sydney',
        country: 'Australia',
        coordinates: { latitude: -33.8578, longitude: 151.2056 },
        distanceFromCenter: 0.6
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'Harbour Views'],
      description: 'Luxury hotel in Circular Quay with panoramic harbour views and world-class service.',
      highlights: ['Harbour Views', 'Circular Quay', 'Luxury Service', 'Premium Location'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'The Langham Sydney',
      starRating: 5,
      rating: { score: 4.6, reviewCount: 3456, reviewSummary: 'Observatory luxury with heritage charm' },
      location: {
        address: '89-113 Kent St, Millers Point NSW 2000, Australia',
        city: 'Sydney',
        country: 'Australia',
        coordinates: { latitude: -33.8590, longitude: 151.2032 },
        distanceFromCenter: 0.7
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'Observatory'],
      description: 'Historic luxury hotel housed in former Observatory with heritage charm and modern luxury.',
      highlights: ['Historic Building', 'Observatory', 'Heritage Charm', 'Luxury Amenities'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Adina Apartment Hotel Sydney Central',
      starRating: 4,
      rating: { score: 4.2, reviewCount: 2341, reviewSummary: 'Spacious apartments with kitchenettes' },
      location: {
        address: '2 Lee St, Sydney NSW 2000, Australia',
        city: 'Sydney',
        country: 'Australia',
        coordinates: { latitude: -33.8797, longitude: 151.2052 },
        distanceFromCenter: 2.0
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Fitness Center', 'Pool', 'Business Center'],
      description: 'Modern apartment hotel with fully equipped kitchenettes and spacious living areas.',
      highlights: ['Apartment Style', 'Kitchen Facilities', 'Spacious Rooms', 'Good Value'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Mad Monkey Hostel Sydney',
      starRating: 2,
      rating: { score: 3.9, reviewCount: 1654, reviewSummary: 'Backpacker hostel with social vibe' },
      location: {
        address: '1/50 Hereford St, Glebe NSW 2037, Australia',
        city: 'Sydney',
        country: 'Australia',
        coordinates: { latitude: -33.8817, longitude: 151.1896 },
        distanceFromCenter: 3.0
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area', 'Bar', 'Games Room'],
      description: 'Lively backpacker hostel in trendy Glebe with great social atmosphere and facilities.',
      highlights: ['Backpacker Friendly', 'Social Atmosphere', 'Trendy Area', 'Budget Option'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '10:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'Dubai': [
    {
      name: 'Burj Al Arab Jumeirah',
      starRating: 5,
      rating: { score: 4.9, reviewCount: 3456, reviewSummary: 'Ultimate luxury and iconic architecture' },
      location: {
        address: 'Jumeirah Beach Rd, Dubai, UAE',
        city: 'Dubai',
        country: 'United Arab Emirates',
        coordinates: { latitude: 25.1411, longitude: 55.1855 },
        distanceFromCenter: 15.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Beach Access', 'Butler Service', 'Helicopter Service'],
      description: "World's most luxurious hotel with sail-shaped architecture and unparalleled service.",
      highlights: ['Iconic Architecture', 'Ultra Luxury', 'Private Beach', 'Michelin Dining'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Rove Downtown Dubai',
      starRating: 4,
      rating: { score: 4.2, reviewCount: 1987, reviewSummary: 'Contemporary hotel in downtown core' },
      location: {
        address: 'Sheikh Mohammed bin Rashid Blvd, Dubai, UAE',
        city: 'Dubai',
        country: 'United Arab Emirates',
        coordinates: { latitude: 25.1972, longitude: 55.2744 },
        distanceFromCenter: 2.0
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Pool', 'Fitness Center', 'Business Center'],
      description: 'Modern lifestyle hotel in downtown Dubai with contemporary design and amenities.',
      highlights: ['Downtown Location', 'Modern Design', 'Burj Khalifa Views', 'Great Value'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Atlantis The Palm',
      starRating: 5,
      rating: { score: 4.6, reviewCount: 5432, reviewSummary: 'Iconic resort with aquatic adventures' },
      location: {
        address: 'Crescent Road, The Palm Jumeirah, Dubai, UAE',
        city: 'Dubai',
        country: 'United Arab Emirates',
        coordinates: { latitude: 25.1306, longitude: 55.1185 },
        distanceFromCenter: 20.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Beach Access', 'Water Park', 'Aquarium'],
      description: 'Iconic resort on Palm Jumeirah with water park, aquarium, and luxury amenities.',
      highlights: ['Water Park', 'Aquarium', 'Palm Jumeirah', 'Family Friendly'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Citymax Hotel Bur Dubai',
      starRating: 3,
      rating: { score: 4.0, reviewCount: 2341, reviewSummary: 'Budget-friendly with good amenities' },
      location: {
        address: 'Al Mankhool Road, Bur Dubai, UAE',
        city: 'Dubai',
        country: 'United Arab Emirates',
        coordinates: { latitude: 25.2532, longitude: 55.2972 },
        distanceFromCenter: 5.0
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Pool', 'Fitness Center', 'Business Center', 'Laundry'],
      description: 'Budget-friendly hotel in historic Bur Dubai with modern amenities and good location.',
      highlights: ['Budget Friendly', 'Historic Area', 'Good Amenities', 'Central Location'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Zona Madinat Jumeirah',
      starRating: 4,
      rating: { score: 4.3, reviewCount: 1876, reviewSummary: 'Boutique hotel with Arabian charm' },
      location: {
        address: 'Madinat Jumeirah, Jumeirah Beach Rd, Dubai, UAE',
        city: 'Dubai',
        country: 'United Arab Emirates',
        coordinates: { latitude: 25.1320, longitude: 55.1853 },
        distanceFromCenter: 18.0
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Pool', 'Spa', 'Beach Access', 'Souk Access'],
      description: 'Boutique hotel within Madinat Jumeirah complex with Arabian architecture and design.',
      highlights: ['Arabian Architecture', 'Souk Access', 'Boutique Experience', 'Beach Access'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'Bangkok': [
    {
      name: 'Mandarin Oriental Bangkok',
      starRating: 5,
      rating: { score: 4.7, reviewCount: 4321, reviewSummary: 'Legendary luxury on the Chao Phraya' },
      location: {
        address: '48 Oriental Ave, Bang Rak, Bangkok 10500, Thailand',
        city: 'Bangkok',
        country: 'Thailand',
        coordinates: { latitude: 13.7244, longitude: 100.5154 },
        distanceFromCenter: 2.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'River Views'],
      description: 'Historic luxury hotel on the Chao Phraya River with legendary service and elegance.',
      highlights: ['River Views', 'Historic Luxury', 'Legendary Service', 'Award-winning Spa'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Lub d Bangkok Siam',
      starRating: 3,
      rating: { score: 4.0, reviewCount: 2345, reviewSummary: 'Stylish hostel in shopping district' },
      location: {
        address: '925/9 Rama 1 Rd, Pathumwan, Bangkok 10330, Thailand',
        city: 'Bangkok',
        country: 'Thailand',
        coordinates: { latitude: 13.7465, longitude: 100.5332 },
        distanceFromCenter: 1.5
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Laundry', 'Common Area', 'Luggage Storage'],
      description: 'Modern boutique hostel in Siam area with stylish design and great location.',
      highlights: ['Shopping District', 'Modern Design', 'Social Atmosphere', 'Great Value'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'The Siam Bangkok',
      starRating: 5,
      rating: { score: 4.8, reviewCount: 3456, reviewSummary: 'Art deco luxury with river views' },
      location: {
        address: '3/2 Thanon Khao, Vachirapayabal, Dusit, Bangkok 10300, Thailand',
        city: 'Bangkok',
        country: 'Thailand',
        coordinates: { latitude: 13.7878, longitude: 100.5155 },
        distanceFromCenter: 3.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Private Pier', 'Butler Service', 'Art Collection'],
      description: 'Luxurious art deco hotel on the Chao Phraya River with private pier and exceptional service.',
      highlights: ['Art Deco Design', 'Private Pier', 'River Views', 'Art Collection'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Chatrium Hotel Riverside Bangkok',
      starRating: 4,
      rating: { score: 4.3, reviewCount: 2876, reviewSummary: 'Modern riverside hotel with great amenities' },
      location: {
        address: '28 Charoenkrung Rd, Wat Phraya Krai, Bang Kho Laem, Bangkok 10120, Thailand',
        city: 'Bangkok',
        country: 'Thailand',
        coordinates: { latitude: 13.7076, longitude: 100.5087 },
        distanceFromCenter: 4.0
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Pool', 'Spa', 'Fitness Center', 'River Shuttle', 'Business Center'],
      description: 'Modern riverside hotel with comprehensive amenities and complimentary river shuttle.',
      highlights: ['River Shuttle', 'Modern Amenities', 'Good Value', 'Riverside Location'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'HI Bangkok City Hostel',
      starRating: 2,
      rating: { score: 4.1, reviewCount: 1654, reviewSummary: 'Clean budget hostel with good facilities' },
      location: {
        address: '2125/2 Charoen Krung Rd, Wat Phraya Krai, Bang Kho Laem, Bangkok 10120, Thailand',
        city: 'Bangkok',
        country: 'Thailand',
        coordinates: { latitude: 13.7089, longitude: 100.5123 },
        distanceFromCenter: 4.5
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area', 'Tours', 'Luggage Storage'],
      description: 'Budget-friendly hostel with clean facilities and helpful staff near river attractions.',
      highlights: ['Budget Friendly', 'Clean Facilities', 'Helpful Staff', 'River Access'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'Singapore': [
    {
      name: 'Marina Bay Sands',
      starRating: 5,
      rating: { score: 4.6, reviewCount: 5432, reviewSummary: 'Iconic luxury with infinity pool' },
      location: {
        address: '10 Bayfront Ave, Singapore 018956',
        city: 'Singapore',
        country: 'Singapore',
        coordinates: { latitude: 1.2834, longitude: 103.8607 },
        distanceFromCenter: 1.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Casino', 'Shopping', 'Observatory'],
      description: 'Iconic integrated resort with world-famous infinity pool and unparalleled facilities.',
      highlights: ['Infinity Pool', 'Skypark', 'Luxury Shopping', 'World-class Dining'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Pod Boutique Capsule Hotel',
      starRating: 3,
      rating: { score: 4.1, reviewCount: 1876, reviewSummary: 'Modern capsule hotel experience' },
      location: {
        address: '289 Beach Rd, Singapore 199552',
        city: 'Singapore',
        country: 'Singapore',
        coordinates: { latitude: 1.3006, longitude: 103.8616 },
        distanceFromCenter: 2.0
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Shared Bathroom', 'Lounge', 'Luggage Storage', 'Common Area'],
      description: 'Modern capsule hotel with high-tech pods and efficient design in Beach Road area.',
      highlights: ['Capsule Experience', 'High-tech Design', 'Budget Friendly', 'Central Location'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Raffles Singapore',
      starRating: 5,
      rating: { score: 4.8, reviewCount: 4321, reviewSummary: 'Colonial luxury with legendary service' },
      location: {
        address: '1 Beach Rd, Singapore 189673',
        city: 'Singapore',
        country: 'Singapore',
        coordinates: { latitude: 1.2951, longitude: 103.8578 },
        distanceFromCenter: 1.5
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Butler Service', 'Shopping Arcade', 'Museum'],
      description: 'Legendary colonial hotel with timeless elegance and world-class service since 1887.',
      highlights: ['Colonial Heritage', 'Long Bar', 'Luxury Shopping', 'Historic Elegance'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Hotel Boss',
      starRating: 3,
      rating: { score: 4.0, reviewCount: 2876, reviewSummary: 'Budget hotel with good amenities' },
      location: {
        address: '500 Jalan Sultan, Singapore 199020',
        city: 'Singapore',
        country: 'Singapore',
        coordinates: { latitude: 1.3030, longitude: 103.8579 },
        distanceFromCenter: 2.5
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Business Center', 'Luggage Storage', 'Tour Desk'],
      description: 'Budget-friendly hotel in Lavender area with modern amenities and convenient location.',
      highlights: ['Budget Friendly', 'Modern Rooms', 'Good Location', 'Business Facilities'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'The Fullerton Hotel Singapore',
      starRating: 5,
      rating: { score: 4.7, reviewCount: 3654, reviewSummary: 'Heritage luxury with modern amenities' },
      location: {
        address: '1 Fullerton Square, Singapore 049178',
        city: 'Singapore',
        country: 'Singapore',
        coordinates: { latitude: 1.2861, longitude: 103.8544 },
        distanceFromCenter: 1.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'River Views'],
      description: 'Heritage luxury hotel in historic former General Post Office building with river views.',
      highlights: ['Heritage Building', 'River Views', 'Historic Luxury', 'Central Location'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'Mumbai': [
    {
      name: 'The Taj Mahal Palace',
      starRating: 5,
      rating: { score: 4.8, reviewCount: 4987, reviewSummary: 'Legendary luxury and heritage' },
      location: {
        address: 'Apollo Bunder, Colaba, Mumbai 400001, India',
        city: 'Mumbai',
        country: 'India',
        coordinates: { latitude: 18.9220, longitude: 72.8332 },
        distanceFromCenter: 1.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'Heritage Tours'],
      description: 'Iconic heritage hotel overlooking Gateway of India with legendary hospitality.',
      highlights: ['Gateway of India', 'Heritage Property', 'Legendary Service', 'Historic Luxury'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'FabHotel Prime Royal Heritage',
      starRating: 3,
      rating: { score: 4.0, reviewCount: 1654, reviewSummary: 'Modern comfort with heritage charm' },
      location: {
        address: 'Strand Cinema Building, Colaba Causeway, Mumbai 400005, India',
        city: 'Mumbai',
        country: 'India',
        coordinates: { latitude: 18.9067, longitude: 72.8147 },
        distanceFromCenter: 1.5
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Room Service', 'Business Center', 'Laundry'],
      description: 'Modern hotel in historic Colaba area with comfortable rooms and good amenities.',
      highlights: ['Colaba Location', 'Modern Amenities', 'Good Value', 'Shopping Nearby'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'The Oberoi Mumbai',
      starRating: 5,
      rating: { score: 4.7, reviewCount: 3987, reviewSummary: 'Modern luxury with ocean views' },
      location: {
        address: 'Nariman Point, Mumbai 400021, India',
        city: 'Mumbai',
        country: 'India',
        coordinates: { latitude: 18.9259, longitude: 72.8236 },
        distanceFromCenter: 2.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'Ocean Views'],
      description: 'Contemporary luxury hotel in business district with stunning ocean views.',
      highlights: ['Ocean Views', 'Business District', 'Modern Luxury', 'Fine Dining'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'The Residency Hotel',
      starRating: 4,
      rating: { score: 4.2, reviewCount: 2341, reviewSummary: 'Business hotel with good amenities' },
      location: {
        address: '49, Rustom Sidhwa Marg, Fort, Mumbai 400001, India',
        city: 'Mumbai',
        country: 'India',
        coordinates: { latitude: 18.9321, longitude: 72.8347 },
        distanceFromCenter: 1.2
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Business Center', 'Fitness Center', 'Meeting Rooms'],
      description: 'Business hotel in Fort area with modern amenities and professional service.',
      highlights: ['Business District', 'Modern Amenities', 'Professional Service', 'Central Location'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Backpacker Panda Mumbai',
      starRating: 2,
      rating: { score: 3.8, reviewCount: 1456, reviewSummary: 'Budget hostel with social atmosphere' },
      location: {
        address: 'Colaba Causeway, Mumbai 400005, India',
        city: 'Mumbai',
        country: 'India',
        coordinates: { latitude: 18.9089, longitude: 72.8134 },
        distanceFromCenter: 1.8
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area', 'Tours', 'Luggage Storage'],
      description: 'Budget-friendly hostel in Colaba with social atmosphere and local experiences.',
      highlights: ['Budget Friendly', 'Social Atmosphere', 'Local Tours', 'Colaba Location'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'Istanbul': [
    {
      name: 'Four Seasons Hotel Istanbul at Sultanahmet',
      starRating: 5,
      rating: { score: 4.7, reviewCount: 3456, reviewSummary: 'Luxury in historic Ottoman prison' },
      location: {
        address: 'Tevkifhane Sk. No:1, Sultanahmet, Istanbul 34110, Turkey',
        city: 'Istanbul',
        country: 'Turkey',
        coordinates: { latitude: 41.0058, longitude: 28.9784 },
        distanceFromCenter: 0.5
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Fitness Center', 'Butler Service', 'Historic Tours'],
      description: 'Luxury hotel in converted Ottoman prison with stunning views of Hagia Sophia.',
      highlights: ['Hagia Sophia Views', 'Historic Building', 'Luxury Amenities', 'Perfect Location'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Sultanahmet Palace Hotel',
      starRating: 4,
      rating: { score: 4.2, reviewCount: 2341, reviewSummary: 'Ottoman elegance near Blue Mosque' },
      location: {
        address: 'Torun Sk. No:19, Sultanahmet, Istanbul 34122, Turkey',
        city: 'Istanbul',
        country: 'Turkey',
        coordinates: { latitude: 41.0054, longitude: 28.9769 },
        distanceFromCenter: 0.8
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Turkish Bath', 'Terrace'],
      description: 'Boutique hotel with Ottoman design elements near major historic attractions.',
      highlights: ['Blue Mosque Nearby', 'Ottoman Design', 'Historic District', 'Turkish Bath'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Pera Palace Hotel',
      starRating: 5,
      rating: { score: 4.6, reviewCount: 2876, reviewSummary: 'Historic luxury with Orient Express legacy' },
      location: {
        address: 'Meşrutiyet Cd. No:52, Tepebaşı, Beyoğlu, Istanbul 34430, Turkey',
        city: 'Istanbul',
        country: 'Turkey',
        coordinates: { latitude: 41.0321, longitude: 28.9744 },
        distanceFromCenter: 2.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Fitness Center', 'Butler Service', 'Museum'],
      description: 'Historic luxury hotel with Orient Express heritage and legendary Agatha Christie connection.',
      highlights: ['Orient Express Legacy', 'Historic Luxury', 'Agatha Christie', 'Beyoğlu Location'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Swissotel The Bosphorus',
      starRating: 5,
      rating: { score: 4.5, reviewCount: 3654, reviewSummary: 'Modern luxury with Bosphorus views' },
      location: {
        address: 'Vişnezade Mh., Acısu Sk. No:19, Beşiktaş, Istanbul 34357, Turkey',
        city: 'Istanbul',
        country: 'Turkey',
        coordinates: { latitude: 41.0473, longitude: 29.0114 },
        distanceFromCenter: 3.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'Bosphorus Views'],
      description: 'Modern luxury hotel with stunning Bosphorus views and comprehensive amenities.',
      highlights: ['Bosphorus Views', 'Modern Luxury', 'Comprehensive Amenities', 'Business District'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Cheers Hostel',
      starRating: 2,
      rating: { score: 4.0, reviewCount: 1654, reviewSummary: 'Budget hostel with great atmosphere' },
      location: {
        address: 'Akbıyık Cd. No:21, Sultanahmet, Istanbul 34122, Turkey',
        city: 'Istanbul',
        country: 'Turkey',
        coordinates: { latitude: 41.0045, longitude: 28.9765 },
        distanceFromCenter: 1.0
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area', 'Tours', 'Rooftop Terrace'],
      description: 'Budget-friendly hostel in Sultanahmet with great atmosphere and rooftop views.',
      highlights: ['Budget Friendly', 'Rooftop Views', 'Social Atmosphere', 'Historic District'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    }
  ],

  'São Paulo': [
    {
      name: 'Copacabana Palace',
      starRating: 5,
      rating: { score: 4.6, reviewCount: 3987, reviewSummary: 'Iconic luxury on famous beach' },
      location: {
        address: 'Av. Atlântica, 1702, Copacabana, São Paulo, Brazil',
        city: 'São Paulo',
        country: 'Brazil',
        coordinates: { latitude: -23.5505, longitude: -46.6333 },
        distanceFromCenter: 5.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Beach Access', 'Butler Service'],
      description: 'Legendary luxury hotel on Copacabana Beach with timeless elegance and service.',
      highlights: ['Copacabana Beach', 'Iconic Luxury', 'Beach Access', 'Historic Glamour'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Selina Lapa Rio',
      starRating: 3,
      rating: { score: 4.0, reviewCount: 1876, reviewSummary: 'Hip hostel in bohemian neighborhood' },
      location: {
        address: 'Rua do Riachuelo, 45, Lapa, São Paulo, Brazil',
        city: 'São Paulo',
        country: 'Brazil',
        coordinates: { latitude: -23.5475, longitude: -46.6361 },
        distanceFromCenter: 3.0
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Coworking Space', 'Common Area', 'Tours'],
      description: 'Modern hostel in vibrant Lapa district with great atmosphere and facilities.',
      highlights: ['Bohemian Lapa', 'Social Atmosphere', 'Great Value', 'Local Experience'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Hotel Fasano São Paulo',
      starRating: 5,
      rating: { score: 4.7, reviewCount: 2876, reviewSummary: 'Sophisticated luxury in Jardins' },
      location: {
        address: 'Rua Vittorio Fasano, 88, Jardins, São Paulo, Brazil',
        city: 'São Paulo',
        country: 'Brazil',
        coordinates: { latitude: -23.5616, longitude: -46.6562 },
        distanceFromCenter: 2.0
      },
      images: [
        'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Pool', 'Fitness Center', 'Butler Service', 'Rooftop'],
      description: 'Sophisticated luxury hotel in upscale Jardins district with renowned dining.',
      highlights: ['Jardins District', 'Sophisticated Luxury', 'Renowned Dining', 'Upscale Location'],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'Mercure São Paulo Paulista',
      starRating: 4,
      rating: { score: 4.2, reviewCount: 2341, reviewSummary: 'Business hotel on famous avenue' },
      location: {
        address: 'Av. Paulista, 2355, Bela Vista, São Paulo, Brazil',
        city: 'São Paulo',
        country: 'Brazil',
        coordinates: { latitude: -23.5558, longitude: -46.6607 },
        distanceFromCenter: 1.0
      },
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800'
      ],
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Fitness Center', 'Business Center', 'Meeting Rooms'],
      description: 'Modern business hotel on iconic Paulista Avenue with good amenities.',
      highlights: ['Paulista Avenue', 'Business Friendly', 'Modern Amenities', 'Central Location'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
      }
    },
    {
      name: 'The Hostel SP',
      starRating: 2,
      rating: { score: 4.1, reviewCount: 1654, reviewSummary: 'Modern hostel in Vila Madalena' },
      location: {
        address: 'Rua Harmonia, 251, Vila Madalena, São Paulo, Brazil',
        city: 'São Paulo',
        country: 'Brazil',
        coordinates: { latitude: -23.5536, longitude: -46.6929 },
        distanceFromCenter: 4.0
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      ],
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area', 'Bar', 'Tours'],
      description: 'Modern hostel in trendy Vila Madalena with great nightlife and cultural scene.',
      highlights: ['Vila Madalena', 'Trendy Area', 'Great Nightlife', 'Cultural Scene'],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before arrival'
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