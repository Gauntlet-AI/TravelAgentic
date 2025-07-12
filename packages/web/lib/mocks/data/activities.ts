/**
 * Activity data for mock activity services
 * Organized by destination with various categories and realistic details
 */

import { ActivityResult } from '../types';

/**
 * Activity categories and their descriptions
 */
export const activityCategories = {
  outdoor: {
    name: 'Outdoor & Adventure',
    description: 'Hiking, biking, water sports, and nature activities',
    icon: '🏔️',
    subcategories: ['Hiking', 'Biking', 'Water Sports', 'Rock Climbing', 'Kayaking', 'Skiing']
  },
  culture: {
    name: 'Culture & History',
    description: 'Museums, historical sites, cultural experiences',
    icon: '🏛️',
    subcategories: ['Museums', 'Historical Tours', 'Art Galleries', 'Architecture', 'Local Culture']
  },
  food: {
    name: 'Food & Drink',
    description: 'Food tours, cooking classes, wine tasting',
    icon: '🍽️',
    subcategories: ['Food Tours', 'Cooking Classes', 'Wine Tasting', 'Beer Tours', 'Market Tours']
  },
  entertainment: {
    name: 'Entertainment',
    description: 'Shows, concerts, nightlife, and performances',
    icon: '🎭',
    subcategories: ['Theater', 'Concerts', 'Comedy Shows', 'Nightlife', 'Live Music']
  },
  sightseeing: {
    name: 'Sightseeing',
    description: 'City tours, landmarks, scenic viewpoints',
    icon: '📸',
    subcategories: ['City Tours', 'Landmarks', 'Scenic Views', 'Photography Tours', 'Walking Tours']
  },
  wellness: {
    name: 'Wellness & Spa',
    description: 'Spa treatments, yoga, meditation, wellness retreats',
    icon: '🧘',
    subcategories: ['Spa Treatments', 'Yoga Classes', 'Meditation', 'Wellness Retreats', 'Fitness']
  },
  family: {
    name: 'Family & Kids',
    description: 'Family-friendly activities and attractions',
    icon: '👨‍👩‍👧‍👦',
    subcategories: ['Theme Parks', 'Zoos', 'Aquariums', 'Kids Activities', 'Educational Tours']
  },
  shopping: {
    name: 'Shopping',
    description: 'Shopping tours, markets, boutiques',
    icon: '🛍️',
    subcategories: ['Shopping Tours', 'Local Markets', 'Boutiques', 'Outlet Malls', 'Craft Shops']
  }
};

/**
 * Time of day options for activities
 */
export const timeSlots = [
  { name: 'Morning', value: 'morning', time: '9:00 AM - 12:00 PM' },
  { name: 'Afternoon', value: 'afternoon', time: '1:00 PM - 5:00 PM' },
  { name: 'Evening', value: 'evening', time: '6:00 PM - 9:00 PM' },
  { name: 'Night', value: 'night', time: '9:00 PM - 12:00 AM' },
  { name: 'Full Day', value: 'full-day', time: '9:00 AM - 6:00 PM' }
];

/**
 * Sample activity data organized by major cities
 */
export const activitiesByDestination: Record<string, Partial<ActivityResult>[]> = {
  'New York': [
    {
      name: 'Central Park Walking Tour',
      description: 'Explore the iconic Central Park with a knowledgeable guide, discovering hidden gems and famous landmarks.',
      shortDescription: 'Guided tour of Central Park\'s highlights and hidden spots',
      categories: ['sightseeing', 'outdoor'],
      duration: { value: 2, unit: 'hours', description: '2-hour guided walk' },
      location: {
        name: 'Central Park',
        address: 'Central Park, New York, NY 10024',
        city: 'New York',
        coordinates: { latitude: 40.7829, longitude: -73.9654 }
      },
      images: [
        'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800',
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'
      ],
      highlights: ['Bethesda Fountain', 'Strawberry Fields', 'The Mall', 'Bow Bridge'],
      included: ['Professional guide', 'Map of Central Park', 'Photo opportunities'],
      requirements: ['Comfortable walking shoes', 'Weather-appropriate clothing'],
      restrictions: ['Not suitable for wheelchairs', 'Minimum age 5'],
      meetingPoint: 'Columbus Circle entrance to Central Park',
      cancellationPolicy: 'Free cancellation up to 24 hours before the tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 10:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 20 },
      languages: ['English', 'Spanish', 'French'],
      accessibility: ['Walking required']
    },
    {
      name: 'Broadway Show Experience',
      description: 'Enjoy a world-class Broadway musical with premium seating and backstage tour.',
      shortDescription: 'Premium Broadway show with backstage access',
      categories: ['entertainment', 'culture'],
      duration: { value: 3, unit: 'hours', description: '3-hour experience including show and tour' },
      location: {
        name: 'Broadway Theater District',
        address: 'Times Square, New York, NY 10036',
        city: 'New York',
        coordinates: { latitude: 40.7590, longitude: -73.9845 }
      },
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800'
      ],
      highlights: ['Premium orchestra seats', 'Backstage tour', 'Meet the cast', 'Souvenir program'],
      included: ['Show tickets', 'Backstage tour', 'Professional guide', 'Souvenir'],
      requirements: ['Smart casual dress code'],
      restrictions: ['Age restrictions vary by show', 'No photography during performance'],
      meetingPoint: 'Theater lobby 30 minutes before showtime',
      cancellationPolicy: 'No refunds within 48 hours of show date',
      availability: {
        nextAvailable: '2024-07-20',
        schedule: 'Show times vary by production'
      },
      groupSize: { min: 1, max: 8 },
      languages: ['English'],
      accessibility: ['Wheelchair accessible theaters available']
    },
    {
      name: 'Food Tour of Little Italy & Chinatown',
      description: 'Taste authentic Italian and Chinese cuisine while learning about the history of these iconic neighborhoods.',
      shortDescription: 'Culinary journey through Little Italy and Chinatown',
      categories: ['food', 'culture', 'sightseeing'],
      duration: { value: 3.5, unit: 'hours', description: '3.5-hour food adventure' },
      location: {
        name: 'Little Italy & Chinatown',
        address: 'Mulberry St & Mott St, New York, NY 10013',
        city: 'New York',
        coordinates: { latitude: 40.7180, longitude: -73.9956 }
      },
      images: [
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
        'https://images.unsplash.com/photo-1563379091339-03246963d7d9?w=800'
      ],
      highlights: ['6 food stops', 'Traditional recipes', 'Cultural history', 'Local markets'],
      included: ['All food tastings', 'Professional guide', 'Cultural insights', 'Recipe cards'],
      requirements: ['Moderate walking', 'Come hungry'],
      restrictions: ['Dietary restrictions accommodated with advance notice', 'Not suitable for severe allergies'],
      meetingPoint: 'Corner of Mulberry and Grand Street',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 11:00 AM and 3:00 PM'
      },
      groupSize: { min: 4, max: 15 },
      languages: ['English', 'Mandarin', 'Italian'],
      accessibility: ['Walking required', 'Some venues not wheelchair accessible']
    },
    {
      name: 'High Line Park & Chelsea Market Walk',
      description: 'Explore the elevated High Line park and browse the vibrant Chelsea Market with local vendors and artisanal foods.',
      shortDescription: 'Elevated park walk with gourmet market exploration',
      categories: ['outdoor', 'food', 'sightseeing'],
      duration: { value: 3, unit: 'hours', description: '3-hour walking tour' },
      location: {
        name: 'High Line Park',
        address: 'High Line, New York, NY 10011',
        city: 'New York',
        coordinates: { latitude: 40.7480, longitude: -74.0048 }
      },
      images: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800'
      ],
      highlights: ['High Line elevated park', 'Chelsea Market vendors', 'Hudson River views', 'Urban gardens'],
      included: ['Professional guide', 'Market tastings', 'Park entrance', 'Walking map'],
      requirements: ['Comfortable walking shoes', 'Weather-appropriate clothing'],
      restrictions: ['Moderate walking required', 'Crowded on weekends'],
      meetingPoint: 'High Line entrance at 14th Street',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 10:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 15 },
      languages: ['English', 'Spanish'],
      accessibility: ['Wheelchair accessible', 'Elevator access available']
    },
    {
      name: 'Brooklyn Bridge & DUMBO Photography Tour',
      description: 'Capture stunning photos of the Brooklyn Bridge and explore the trendy DUMBO neighborhood with a professional photographer.',
      shortDescription: 'Photography tour of iconic bridge and trendy neighborhood',
      categories: ['sightseeing', 'outdoor', 'culture'],
      duration: { value: 2.5, unit: 'hours', description: '2.5-hour photography experience' },
      location: {
        name: 'Brooklyn Bridge',
        address: 'Brooklyn Bridge, New York, NY 10038',
        city: 'New York',
        coordinates: { latitude: 40.7061, longitude: -73.9969 }
      },
      images: [
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800'
      ],
      highlights: ['Brooklyn Bridge walkway', 'Manhattan skyline views', 'DUMBO waterfront', 'Photography tips'],
      included: ['Professional photographer guide', 'Photography instruction', 'Digital photo sharing', 'Location scouting'],
      requirements: ['Camera or smartphone', 'Comfortable walking shoes'],
      restrictions: ['Weather dependent', 'Bridge can be windy'],
      meetingPoint: 'Brooklyn Bridge entrance in City Hall area',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 8:00 AM and 4:00 PM'
      },
      groupSize: { min: 1, max: 8 },
      languages: ['English', 'French'],
      accessibility: ['Moderate walking required', 'Stairs on bridge']
    },
    {
      name: 'Williamsburg Brewery & Rooftop Bar Tour',
      description: 'Discover Brooklyn\'s craft beer scene with visits to local breweries and rooftop bars with Manhattan views.',
      shortDescription: 'Craft beer tour through Brooklyn\'s hip neighborhoods',
      categories: ['food', 'entertainment', 'culture'],
      duration: { value: 4, unit: 'hours', description: '4-hour beer tasting tour' },
      location: {
        name: 'Williamsburg',
        address: 'Williamsburg, Brooklyn, NY 11211',
        city: 'New York',
        coordinates: { latitude: 40.7081, longitude: -73.9571 }
      },
      images: [
        'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800',
        'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800'
      ],
      highlights: ['3 brewery visits', 'Rooftop bar with skyline views', 'Craft beer tastings', 'Local food pairings'],
      included: ['Beer tastings', 'Professional guide', 'Brewery tours', 'Light snacks'],
      requirements: ['Valid ID (21+)', 'Comfortable walking shoes'],
      restrictions: ['Must be 21 or older', 'No pregnant women'],
      meetingPoint: 'Williamsburg waterfront park',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-17',
        schedule: 'Friday-Sunday at 2:00 PM'
      },
      groupSize: { min: 4, max: 12 },
      languages: ['English'],
      accessibility: ['Some venues may have stairs']
    },
    {
      name: 'Statue of Liberty & Ellis Island Audio Tour',
      description: 'Visit the iconic Statue of Liberty and explore the Ellis Island Immigration Museum with self-guided audio tours.',
      shortDescription: 'Self-guided tour of America\'s most famous landmarks',
      categories: ['culture', 'sightseeing'],
      duration: { value: 5, unit: 'hours', description: '5-hour island-hopping experience' },
      location: {
        name: 'Statue of Liberty',
        address: 'Liberty Island, New York, NY 10004',
        city: 'New York',
        coordinates: { latitude: 40.6892, longitude: -74.0445 }
      },
      images: [
        'https://images.unsplash.com/photo-1543739929-6a82b5ee6641?w=800',
        'https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=800'
      ],
      highlights: ['Statue of Liberty crown access', 'Ellis Island museum', 'Harbor views', 'Immigration history'],
      included: ['Ferry transportation', 'Audio guide', 'Museum admission', 'Crown access (if available)'],
      requirements: ['Valid ID', 'Security screening', 'Advance booking for crown'],
      restrictions: ['Weather dependent ferries', 'Security restrictions apply'],
      meetingPoint: 'Castle Clinton National Monument',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily ferries every 30 minutes from 9:00 AM'
      },
      groupSize: { min: 1, max: 100 },
      languages: ['English', 'Spanish', 'French', 'German', 'Italian'],
      accessibility: ['Limited wheelchair access to crown', 'Accessible ferry and museum']
    }
  ],

  'London': [
    {
      name: 'Tower of London & Crown Jewels Tour',
      description: 'Explore the historic Tower of London and marvel at the Crown Jewels with a Yeoman Warder guide.',
      shortDescription: 'Historic tower tour with Crown Jewels viewing',
      categories: ['culture', 'sightseeing'],
      duration: { value: 3, unit: 'hours', description: '3-hour comprehensive tour' },
      location: {
        name: 'Tower of London',
        address: 'St Katharine\'s & Wapping, London EC3N 4AB, UK',
        city: 'London',
        coordinates: { latitude: 51.5081, longitude: -0.0759 }
      },
      images: [
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
        'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800'
      ],
      highlights: ['Crown Jewels exhibition', 'Yeoman Warder tour', 'Medieval architecture', 'Ravens'],
      included: ['Entrance ticket', 'Yeoman Warder guide', 'Crown Jewels access', 'Audio guide'],
      requirements: ['Comfortable walking shoes', 'Security screening'],
      restrictions: ['No photography in Crown Jewels room', 'Large bags not permitted'],
      meetingPoint: 'Tower Hill entrance',
      cancellationPolicy: 'Free cancellation up to 24 hours before visit',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily tours every 30 minutes from 9:00 AM'
      },
      groupSize: { min: 1, max: 25 },
      languages: ['English', 'French', 'German', 'Spanish'],
      accessibility: ['Limited wheelchair access', 'Cobblestone paths']
    },
    {
      name: 'Thames River Cruise with Afternoon Tea',
      description: 'Enjoy traditional afternoon tea while cruising along the Thames, seeing London\'s landmarks from the water.',
      shortDescription: 'Scenic river cruise with traditional afternoon tea',
      categories: ['sightseeing', 'food'],
      duration: { value: 2.5, unit: 'hours', description: '2.5-hour luxury cruise' },
      location: {
        name: 'Westminster Pier',
        address: 'Westminster Pier, Westminster, London SW1A 2JH, UK',
        city: 'London',
        coordinates: { latitude: 51.5007, longitude: -0.1246 }
      },
      images: [
        'https://images.unsplash.com/photo-1520637836862-4d197d17c13a?w=800',
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800'
      ],
      highlights: ['Thames views', 'Traditional afternoon tea', 'London landmarks', 'Live commentary'],
      included: ['River cruise', 'Afternoon tea service', 'Live commentary', 'Reserved seating'],
      requirements: ['Smart casual dress', 'Arrive 15 minutes early'],
      restrictions: ['Dietary requirements with advance notice', 'Weather dependent'],
      meetingPoint: 'Westminster Pier ticket office',
      cancellationPolicy: 'Free cancellation up to 48 hours before cruise',
      availability: {
        nextAvailable: '2024-07-17',
        schedule: 'Daily at 2:00 PM and 4:30 PM'
      },
      groupSize: { min: 2, max: 100 },
      languages: ['English'],
      accessibility: ['Wheelchair accessible', 'Accessible restrooms']
    },
    {
      name: 'Camden Market & Alternative London Tour',
      description: 'Explore London\'s alternative culture in Camden Market, discover street art, vintage shops, and indie music venues.',
      shortDescription: 'Alternative culture tour through Camden\'s vibrant markets',
      categories: ['shopping', 'culture', 'sightseeing'],
      duration: { value: 3, unit: 'hours', description: '3-hour alternative culture experience' },
      location: {
        name: 'Camden Market',
        address: 'Camden Lock Pl, London NW1 8AF, UK',
        city: 'London',
        coordinates: { latitude: 51.5444, longitude: -0.1471 }
      },
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800'
      ],
      highlights: ['Camden Market stalls', 'Street art discoveries', 'Vintage fashion', 'Music venue history'],
      included: ['Professional guide', 'Market map', 'Street art locations', 'Music venue stories'],
      requirements: ['Comfortable walking shoes', 'Weather-appropriate clothing'],
      restrictions: ['Crowded on weekends', 'Some venues age-restricted'],
      meetingPoint: 'Camden Town tube station exit',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 11:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 15 },
      languages: ['English', 'French', 'German'],
      accessibility: ['Moderate walking required', 'Cobblestone areas']
    },
    {
      name: 'Kensington Palace & Gardens Tour',
      description: 'Discover the royal residence of Princess Diana and explore the beautiful Kensington Gardens with expert commentary.',
      shortDescription: 'Royal palace tour with Princess Diana exhibition',
      categories: ['culture', 'sightseeing', 'outdoor'],
      duration: { value: 2.5, unit: 'hours', description: '2.5-hour royal experience' },
      location: {
        name: 'Kensington Palace',
        address: 'Kensington Gardens, London W8 4PX, UK',
        city: 'London',
        coordinates: { latitude: 51.5055, longitude: -0.1876 }
      },
      images: [
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800'
      ],
      highlights: ['Princess Diana exhibition', 'Royal State Apartments', 'Kensington Gardens', 'Albert Memorial'],
      included: ['Palace entrance', 'Expert guide', 'Audio guide', 'Garden access'],
      requirements: ['Valid ID', 'Comfortable walking shoes'],
      restrictions: ['Photography restrictions in palace', 'Security screening'],
      meetingPoint: 'Kensington Palace main entrance',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 10:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 20 },
      languages: ['English', 'French', 'German', 'Spanish'],
      accessibility: ['Wheelchair accessible', 'Accessible restrooms']
    },
    {
      name: 'Covent Garden Street Performance & Shopping',
      description: 'Experience the vibrant street performers of Covent Garden and explore boutique shops, cafes, and market stalls.',
      shortDescription: 'Street performance and shopping in historic market',
      categories: ['entertainment', 'shopping', 'culture'],
      duration: { value: 2, unit: 'hours', description: '2-hour entertainment and shopping experience' },
      location: {
        name: 'Covent Garden',
        address: 'Covent Garden, London WC2E 8RF, UK',
        city: 'London',
        coordinates: { latitude: 51.5118, longitude: -0.1226 }
      },
      images: [
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800',
        'https://images.unsplash.com/photo-1520637836862-4d197d17c13a?w=800'
      ],
      highlights: ['Street performers', 'Market stalls', 'Historic architecture', 'Boutique shopping'],
      included: ['Performance viewing', 'Shopping guide', 'Market map', 'Cafe recommendations'],
      requirements: ['None specific'],
      restrictions: ['Crowded during peak hours', 'Performance times vary'],
      meetingPoint: 'Covent Garden tube station',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 11:00 AM, 2:00 PM, and 4:00 PM'
      },
      groupSize: { min: 1, max: 20 },
      languages: ['English'],
      accessibility: ['Wheelchair accessible', 'Accessible facilities']
    },
    {
      name: 'Notting Hill & Portobello Road Market Walk',
      description: 'Stroll through the charming Notting Hill neighborhood and browse the famous Portobello Road antique market.',
      shortDescription: 'Charming neighborhood walk with famous antique market',
      categories: ['shopping', 'culture', 'sightseeing'],
      duration: { value: 2.5, unit: 'hours', description: '2.5-hour neighborhood exploration' },
      location: {
        name: 'Notting Hill',
        address: 'Portobello Rd, London W11 2DY, UK',
        city: 'London',
        coordinates: { latitude: 51.5154, longitude: -0.2060 }
      },
      images: [
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'
      ],
      highlights: ['Portobello Road market', 'Colorful houses', 'Antique shops', 'Local cafes'],
      included: ['Professional guide', 'Market insights', 'Neighborhood history', 'Photo opportunities'],
      requirements: ['Comfortable walking shoes', 'Cash for market purchases'],
      restrictions: ['Market closed on Sundays', 'Crowded on Saturdays'],
      meetingPoint: 'Notting Hill Gate tube station',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Monday-Saturday at 10:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 15 },
      languages: ['English', 'French'],
      accessibility: ['Moderate walking required', 'Some shops have steps']
    },
    {
      name: 'Jack the Ripper Evening Walking Tour',
      description: 'Explore the dark history of Victorian London with a theatrical guide in the atmospheric East End streets.',
      shortDescription: 'Theatrical evening tour of Victorian crime history',
      categories: ['culture', 'entertainment', 'sightseeing'],
      duration: { value: 2, unit: 'hours', description: '2-hour evening walking tour' },
      location: {
        name: 'Whitechapel',
        address: 'Whitechapel High St, London E1 7QX, UK',
        city: 'London',
        coordinates: { latitude: 51.5196, longitude: -0.0601 }
      },
      images: [
        'https://images.unsplash.com/photo-1520637836862-4d197d17c13a?w=800',
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800'
      ],
      highlights: ['Historic crime scenes', 'Victorian atmosphere', 'Theatrical storytelling', 'East End history'],
      included: ['Professional actor guide', 'Historical props', 'Map of locations', 'Group lantern'],
      requirements: ['Comfortable walking shoes', 'Weather-appropriate clothing'],
      restrictions: ['Not suitable for children under 16', 'Evening tour only'],
      meetingPoint: 'Whitechapel tube station',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 7:00 PM'
      },
      groupSize: { min: 1, max: 25 },
      languages: ['English'],
      accessibility: ['Walking required', 'Cobblestone streets']
    }
  ],

  'Tokyo': [
    {
      name: 'Traditional Tea Ceremony Experience',
      description: 'Learn the ancient art of Japanese tea ceremony in a traditional setting with a tea master.',
      shortDescription: 'Authentic Japanese tea ceremony with tea master',
      categories: ['culture', 'wellness'],
      duration: { value: 1.5, unit: 'hours', description: '90-minute cultural experience' },
      location: {
        name: 'Traditional Tea House',
        address: 'Asakusa, Taito City, Tokyo 111-0032, Japan',
        city: 'Tokyo',
        coordinates: { latitude: 35.7148, longitude: 139.7967 }
      },
      images: [
        'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      highlights: ['Traditional tea ceremony', 'Cultural education', 'Meditation practice', 'Traditional sweets'],
      included: ['Tea ceremony instruction', 'Traditional sweets', 'Cultural explanation', 'Kimono rental option'],
      requirements: ['Remove shoes', 'Sit on floor (cushions provided)'],
      restrictions: ['No photography during ceremony', 'Quiet atmosphere required'],
      meetingPoint: 'Tea house entrance in Asakusa',
      cancellationPolicy: 'Free cancellation up to 24 hours before experience',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 10:00 AM, 2:00 PM, and 4:00 PM'
      },
      groupSize: { min: 1, max: 8 },
      languages: ['Japanese', 'English'],
      accessibility: ['Floor seating required', 'Not suitable for mobility issues']
    },
    {
      name: 'Tsukiji Outer Market Food Tour',
      description: 'Explore the famous Tsukiji Outer Market and taste the freshest sushi, street food, and local delicacies.',
      shortDescription: 'Culinary adventure through Tsukiji\'s famous market',
      categories: ['food', 'culture'],
      duration: { value: 3, unit: 'hours', description: '3-hour food exploration' },
      location: {
        name: 'Tsukiji Outer Market',
        address: 'Tsukiji, Chuo City, Tokyo 104-0045, Japan',
        city: 'Tokyo',
        coordinates: { latitude: 35.6654, longitude: 139.7707 }
      },
      images: [
        'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
        'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800'
      ],
      highlights: ['Fresh sushi tasting', 'Traditional street food', 'Market culture', 'Local vendors'],
      included: ['Food tastings', 'Professional guide', 'Cultural insights', 'Market map'],
      requirements: ['Comfortable walking shoes', 'Come hungry'],
      restrictions: ['Early morning start', 'Closed on Sundays and holidays'],
      meetingPoint: 'Tsukiji Station Exit 1',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-17',
        schedule: 'Tuesday-Saturday at 8:00 AM'
      },
      groupSize: { min: 2, max: 12 },
      languages: ['Japanese', 'English'],
      accessibility: ['Walking required', 'Crowded market conditions']
    },
    {
      name: 'Shibuya Crossing & Harajuku Fashion Tour',
      description: 'Experience the world\'s busiest pedestrian crossing and explore the colorful fashion culture of Harajuku district.',
      shortDescription: 'Iconic crossing and fashion district exploration',
      categories: ['culture', 'sightseeing', 'shopping'],
      duration: { value: 3, unit: 'hours', description: '3-hour urban culture experience' },
      location: {
        name: 'Shibuya Crossing',
        address: 'Shibuya City, Tokyo 150-0043, Japan',
        city: 'Tokyo',
        coordinates: { latitude: 35.6598, longitude: 139.7006 }
      },
      images: [
        'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800'
      ],
      highlights: ['Shibuya Crossing experience', 'Harajuku fashion streets', 'Takeshita Street', 'Youth culture'],
      included: ['Professional guide', 'Fashion insights', 'Photo opportunities', 'Shopping recommendations'],
      requirements: ['Comfortable walking shoes', 'Camera for photos'],
      restrictions: ['Very crowded areas', 'Fast-paced walking'],
      meetingPoint: 'Shibuya Station Hachiko exit',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 10:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 12 },
      languages: ['Japanese', 'English', 'Korean'],
      accessibility: ['Moderate walking required', 'Stairs in some areas']
    },
    {
      name: 'Meiji Shrine & Yoyogi Park Nature Walk',
      description: 'Find tranquility in the heart of Tokyo at the sacred Meiji Shrine and explore the peaceful Yoyogi Park.',
      shortDescription: 'Sacred shrine visit with peaceful park nature walk',
      categories: ['culture', 'outdoor', 'wellness'],
      duration: { value: 2.5, unit: 'hours', description: '2.5-hour spiritual and nature experience' },
      location: {
        name: 'Meiji Shrine',
        address: '1-1 Kamizono-cho, Shibuya City, Tokyo 151-8557, Japan',
        city: 'Tokyo',
        coordinates: { latitude: 35.6764, longitude: 139.6993 }
      },
      images: [
        'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
      ],
      highlights: ['Sacred Meiji Shrine', 'Torii gates', 'Yoyogi Park', 'Urban forest'],
      included: ['Professional guide', 'Shrine etiquette instruction', 'Park access', 'Cultural explanation'],
      requirements: ['Respectful attire', 'Comfortable walking shoes'],
      restrictions: ['Remove hats at shrine', 'No loud talking in shrine areas'],
      meetingPoint: 'JR Harajuku Station East exit',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 9:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 15 },
      languages: ['Japanese', 'English'],
      accessibility: ['Gravel paths', 'Some uphill walking']
    },
    {
      name: 'Ginza Premium Shopping & Dining Experience',
      description: 'Explore Tokyo\'s most luxurious shopping district and enjoy premium dining experiences in upscale restaurants.',
      shortDescription: 'Luxury shopping and fine dining in Tokyo\'s premium district',
      categories: ['shopping', 'food', 'culture'],
      duration: { value: 4, unit: 'hours', description: '4-hour luxury experience' },
      location: {
        name: 'Ginza',
        address: 'Ginza, Chuo City, Tokyo 104-0061, Japan',
        city: 'Tokyo',
        coordinates: { latitude: 35.6717, longitude: 139.7640 }
      },
      images: [
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
        'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800'
      ],
      highlights: ['Luxury department stores', 'Premium dining', 'Traditional crafts', 'High-end fashion'],
      included: ['Personal shopping guide', 'Restaurant reservations', 'Tasting experiences', 'VIP access'],
      requirements: ['Smart casual dress', 'Credit card for purchases'],
      restrictions: ['Expensive area', 'Dress code enforced'],
      meetingPoint: 'Ginza Station A2 exit',
      cancellationPolicy: 'Free cancellation up to 48 hours before experience',
      availability: {
        nextAvailable: '2024-07-17',
        schedule: 'Tuesday-Saturday at 11:00 AM'
      },
      groupSize: { min: 1, max: 6 },
      languages: ['Japanese', 'English', 'Chinese'],
      accessibility: ['Wheelchair accessible', 'Elevator access']
    },
    {
      name: 'Akihabara Electronics & Anime Culture Tour',
      description: 'Dive into Tokyo\'s electronic wonderland and explore the vibrant world of anime, manga, and gaming culture.',
      shortDescription: 'Electronics and anime culture immersion experience',
      categories: ['culture', 'shopping', 'entertainment'],
      duration: { value: 3, unit: 'hours', description: '3-hour otaku culture experience' },
      location: {
        name: 'Akihabara',
        address: 'Akihabara, Chiyoda City, Tokyo 101-0021, Japan',
        city: 'Tokyo',
        coordinates: { latitude: 35.7022, longitude: 139.7745 }
      },
      images: [
        'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      highlights: ['Electronics stores', 'Anime shops', 'Manga cafes', 'Gaming arcades'],
      included: ['Professional guide', 'Shop recommendations', 'Cultural insights', 'Arcade experience'],
      requirements: ['Interest in technology/anime', 'Comfortable walking shoes'],
      restrictions: ['Crowded areas', 'Some shops age-restricted'],
      meetingPoint: 'Akihabara Station Electric Town exit',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 11:00 AM and 3:00 PM'
      },
      groupSize: { min: 1, max: 10 },
      languages: ['Japanese', 'English'],
      accessibility: ['Stairs in some buildings', 'Crowded areas']
    },
    {
      name: 'Sensoji Temple & Asakusa Traditional Crafts Workshop',
      description: 'Visit Tokyo\'s oldest temple and participate in traditional Japanese craft workshops in the historic Asakusa district.',
      shortDescription: 'Ancient temple visit with hands-on craft experience',
      categories: ['culture', 'wellness', 'outdoor'],
      duration: { value: 3.5, unit: 'hours', description: '3.5-hour cultural immersion' },
      location: {
        name: 'Sensoji Temple',
        address: '2-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan',
        city: 'Tokyo',
        coordinates: { latitude: 35.7148, longitude: 139.7967 }
      },
      images: [
        'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
      ],
      highlights: ['Sensoji Temple', 'Thunder Gate', 'Traditional crafts', 'Cultural workshops'],
      included: ['Temple visit', 'Craft workshop', 'Professional guide', 'Materials provided'],
      requirements: ['Remove shoes in temple', 'Respectful behavior'],
      restrictions: ['Workshop requires concentration', 'No photography in some areas'],
      meetingPoint: 'Asakusa Station Exit 1',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 9:00 AM and 1:00 PM'
      },
      groupSize: { min: 1, max: 12 },
      languages: ['Japanese', 'English'],
      accessibility: ['Some temple areas require stairs', 'Sitting for workshop']
    }
  ],

  'Paris': [
    {
      name: 'Louvre Museum Skip-the-Line Tour',
      description: 'Discover the world\'s most famous artworks including the Mona Lisa with an expert art historian guide.',
      shortDescription: 'Expert-guided tour of Louvre\'s masterpieces',
      categories: ['culture', 'sightseeing'],
      duration: { value: 3, unit: 'hours', description: '3-hour comprehensive art tour' },
      location: {
        name: 'Louvre Museum',
        address: 'Rue de Rivoli, 75001 Paris, France',
        city: 'Paris',
        coordinates: { latitude: 48.8606, longitude: 2.3376 }
      },
      images: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
      ],
      highlights: ['Mona Lisa', 'Venus de Milo', 'Winged Victory', 'Egyptian antiquities'],
      included: ['Skip-the-line entry', 'Expert guide', 'Headsets', 'Museum map'],
      requirements: ['Comfortable walking shoes', 'Valid ID'],
      restrictions: ['Large bags not permitted', 'Security screening required'],
      meetingPoint: 'Louvre Pyramid entrance',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily except Tuesday at 9:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 20 },
      languages: ['French', 'English', 'Spanish', 'Italian'],
      accessibility: ['Wheelchair accessible', 'Elevator access']
    },
    {
      name: 'Seine River Evening Cruise with Dinner',
      description: 'Romantic evening cruise along the Seine with gourmet French dinner and views of illuminated landmarks.',
      shortDescription: 'Romantic dinner cruise with Paris landmarks',
      categories: ['sightseeing', 'food', 'entertainment'],
      duration: { value: 2.5, unit: 'hours', description: '2.5-hour dinner cruise' },
      location: {
        name: 'Port de la Bourdonnais',
        address: 'Port de la Bourdonnais, 75007 Paris, France',
        city: 'Paris',
        coordinates: { latitude: 48.8606, longitude: 2.2944 }
      },
      images: [
        'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
        'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800'
      ],
      highlights: ['Eiffel Tower views', 'Notre-Dame Cathedral', 'Gourmet dinner', 'Live music'],
      included: ['3-course dinner', 'Wine pairing', 'Live entertainment', 'Panoramic views'],
      requirements: ['Smart casual dress', 'Arrive 30 minutes early'],
      restrictions: ['Weather dependent', 'Dietary requirements with advance notice'],
      meetingPoint: 'Port de la Bourdonnais pier',
      cancellationPolicy: 'Free cancellation up to 48 hours before cruise',
      availability: {
        nextAvailable: '2024-07-18',
        schedule: 'Daily at 7:30 PM'
      },
      groupSize: { min: 2, max: 200 },
      languages: ['French', 'English'],
      accessibility: ['Wheelchair accessible', 'Accessible restrooms']
    },
    {
      name: 'Montmartre & Sacré-Cœur Artistic Walking Tour',
      description: 'Explore the bohemian Montmartre district, visit the iconic Sacré-Cœur Basilica, and discover the area\'s artistic heritage.',
      shortDescription: 'Bohemian district tour with artistic heritage and basilica visit',
      categories: ['culture', 'sightseeing', 'outdoor'],
      duration: { value: 3, unit: 'hours', description: '3-hour artistic heritage tour' },
      location: {
        name: 'Montmartre',
        address: 'Montmartre, 75018 Paris, France',
        city: 'Paris',
        coordinates: { latitude: 46.8867, longitude: 2.3431 }
      },
      images: [
        'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
        'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800'
      ],
      highlights: ['Sacré-Cœur Basilica', 'Place du Tertre', 'Artist studios', 'Panoramic city views'],
      included: ['Professional guide', 'Basilica visit', 'Artist demonstrations', 'Historical insights'],
      requirements: ['Comfortable walking shoes', 'Uphill walking'],
      restrictions: ['Steep hills', 'Crowded tourist areas'],
      meetingPoint: 'Pigalle Metro Station',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 10:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 20 },
      languages: ['French', 'English', 'Spanish'],
      accessibility: ['Steep cobblestone streets', 'Stairs to basilica']
    },
    {
      name: 'Latin Quarter & Panthéon History Walk',
      description: 'Discover the intellectual heart of Paris in the Latin Quarter and visit the magnificent Panthéon mausoleum.',
      shortDescription: 'Historic Latin Quarter exploration with Panthéon visit',
      categories: ['culture', 'sightseeing', 'outdoor'],
      duration: { value: 2.5, unit: 'hours', description: '2.5-hour historical walking tour' },
      location: {
        name: 'Latin Quarter',
        address: 'Latin Quarter, 75005 Paris, France',
        city: 'Paris',
        coordinates: { latitude: 48.8502, longitude: 2.3439 }
      },
      images: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
      ],
      highlights: ['Panthéon mausoleum', 'Sorbonne University', 'Medieval streets', 'Literary history'],
      included: ['Professional guide', 'Panthéon entrance', 'Historical explanations', 'Map of quarter'],
      requirements: ['Comfortable walking shoes', 'Interest in history'],
      restrictions: ['Moderate walking required', 'Panthéon has stairs'],
      meetingPoint: 'Luxembourg RER station',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 9:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 15 },
      languages: ['French', 'English', 'German'],
      accessibility: ['Cobblestone streets', 'Stairs in Panthéon']
    },
    {
      name: 'Versailles Palace & Gardens Full Day Tour',
      description: 'Explore the opulent Palace of Versailles and its magnificent gardens with skip-the-line access and expert guide.',
      shortDescription: 'Full day royal palace and gardens experience',
      categories: ['culture', 'sightseeing', 'outdoor'],
      duration: { value: 8, unit: 'hours', description: '8-hour complete Versailles experience' },
      location: {
        name: 'Palace of Versailles',
        address: 'Place d\'Armes, 78000 Versailles, France',
        city: 'Paris',
        coordinates: { latitude: 48.8049, longitude: 2.1204 }
      },
      images: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800'
      ],
      highlights: ['Hall of Mirrors', 'Royal apartments', 'Palace gardens', 'Marie Antoinette\'s estate'],
      included: ['Skip-the-line tickets', 'Expert guide', 'Transportation', 'Audio guide'],
      requirements: ['Full day commitment', 'Comfortable walking shoes'],
      restrictions: ['Extensive walking', 'Weather dependent for gardens'],
      meetingPoint: 'Central Paris pickup point',
      cancellationPolicy: 'Free cancellation up to 48 hours before tour',
      availability: {
        nextAvailable: '2024-07-17',
        schedule: 'Tuesday-Sunday at 8:00 AM'
      },
      groupSize: { min: 1, max: 25 },
      languages: ['French', 'English', 'Spanish', 'Italian'],
      accessibility: ['Wheelchair accessible areas', 'Garden paths suitable for mobility aids']
    },
    {
      name: 'Champs-Élysées & Arc de Triomphe Shopping Tour',
      description: 'Shop along the famous Champs-Élysées avenue and visit the Arc de Triomphe with panoramic city views.',
      shortDescription: 'Famous avenue shopping with iconic monument visit',
      categories: ['shopping', 'sightseeing', 'culture'],
      duration: { value: 3, unit: 'hours', description: '3-hour shopping and sightseeing tour' },
      location: {
        name: 'Champs-Élysées',
        address: 'Av. des Champs-Élysées, 75008 Paris, France',
        city: 'Paris',
        coordinates: { latitude: 48.8698, longitude: 2.3076 }
      },
      images: [
        'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
        'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800'
      ],
      highlights: ['Champs-Élysées shopping', 'Arc de Triomphe', 'Luxury boutiques', 'Panoramic views'],
      included: ['Shopping guide', 'Arc de Triomphe tickets', 'Store recommendations', 'City views'],
      requirements: ['Credit card for shopping', 'Comfortable walking shoes'],
      restrictions: ['Expensive shopping area', 'Crowds on weekends'],
      meetingPoint: 'Charles de Gaulle-Étoile Metro',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 10:00 AM and 2:00 PM'
      },
      groupSize: { min: 1, max: 12 },
      languages: ['French', 'English', 'Italian'],
      accessibility: ['Wheelchair accessible', 'Elevator to Arc de Triomphe']
    },
    {
      name: 'Marais District Food & Wine Tasting Tour',
      description: 'Discover the trendy Marais district while tasting French wines, cheeses, and gourmet foods at local establishments.',
      shortDescription: 'Trendy district exploration with gourmet food and wine tastings',
      categories: ['food', 'culture', 'sightseeing'],
      duration: { value: 3.5, unit: 'hours', description: '3.5-hour culinary exploration' },
      location: {
        name: 'Le Marais',
        address: 'Le Marais, 75004 Paris, France',
        city: 'Paris',
        coordinates: { latitude: 48.8566, longitude: 2.3522 }
      },
      images: [
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
        'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800'
      ],
      highlights: ['French wine tasting', 'Artisanal cheeses', 'Local bakeries', 'Historic Jewish quarter'],
      included: ['Food tastings', 'Wine tastings', 'Professional guide', 'Cultural insights'],
      requirements: ['Moderate walking', 'Come hungry'],
      restrictions: ['Must be 18+ for wine', 'Dietary restrictions accommodated'],
      meetingPoint: 'Saint-Paul Metro station',
      cancellationPolicy: 'Free cancellation up to 24 hours before tour',
      availability: {
        nextAvailable: '2024-07-16',
        schedule: 'Daily at 11:00 AM and 3:00 PM'
      },
      groupSize: { min: 4, max: 12 },
      languages: ['French', 'English'],
      accessibility: ['Moderate walking required', 'Some venues have steps']
    }
  ]
};

/**
 * Get activities for a specific destination
 */
export function getActivitiesByDestination(destination: string): Partial<ActivityResult>[] {
  const destinationKey = Object.keys(activitiesByDestination).find(key => 
    key.toLowerCase().includes(destination.toLowerCase()) ||
    destination.toLowerCase().includes(key.toLowerCase())
  );
  
  return destinationKey ? activitiesByDestination[destinationKey] : [];
}

/**
 * Get all available destinations for activities
 */
export function getAvailableActivityDestinations(): string[] {
  return Object.keys(activitiesByDestination);
}

/**
 * Search activities by name, description, or category
 */
export function searchActivities(query: string): Partial<ActivityResult>[] {
  const searchTerm = query.toLowerCase();
  const results: Partial<ActivityResult>[] = [];
  
  Object.values(activitiesByDestination).forEach(activities => {
    activities.forEach(activity => {
      if (
        activity.name?.toLowerCase().includes(searchTerm) ||
        activity.description?.toLowerCase().includes(searchTerm) ||
        activity.shortDescription?.toLowerCase().includes(searchTerm) ||
        activity.categories?.some(cat => cat.toLowerCase().includes(searchTerm)) ||
        activity.location?.city.toLowerCase().includes(searchTerm)
      ) {
        results.push(activity);
      }
    });
  });
  
  return results;
}

/**
 * Get activities by category
 */
export function getActivitiesByCategory(category: string): Partial<ActivityResult>[] {
  const results: Partial<ActivityResult>[] = [];
  
  Object.values(activitiesByDestination).forEach(activities => {
    activities.forEach(activity => {
      if (activity.categories?.includes(category)) {
        results.push(activity);
      }
    });
  });
  
  return results;
}

/**
 * Get all available activity categories
 */
export function getActivityCategories(): string[] {
  return Object.keys(activityCategories);
} 