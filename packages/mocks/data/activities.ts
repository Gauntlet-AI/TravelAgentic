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