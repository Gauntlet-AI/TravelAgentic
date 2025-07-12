/**
 * Random Activity Generation API
 * Generates random activities based on selected preferences for real-time updates
 * Provides intelligent activity suggestions with contextual awareness
 */

import { NextRequest, NextResponse } from 'next/server';
import { sortByConfigJSON } from '../../../../lib/utils';

interface ActivityType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'outdoor' | 'cultural' | 'food' | 'entertainment' | 'relaxation' | 'adventure';
  difficulty?: 'easy' | 'moderate' | 'challenging';
  duration?: 'short' | 'medium' | 'long';
  cost?: 'free' | 'budget' | 'moderate' | 'expensive';
  popularity?: number;
  recommendations?: number;
}

interface RandomActivityRequest {
  preferences: ActivityType[];
  destination?: string;
  travelers?: number;
  timeSlot?: 'morning' | 'afternoon' | 'evening' | 'night';
  excludeIds?: string[];
  count?: number;
  maxCost?: 'free' | 'budget' | 'moderate' | 'expensive';
  maxDifficulty?: 'easy' | 'moderate' | 'challenging';
}

const ACTIVITY_POOLS = {
  cultural: [
    { name: 'Historic District Walk', icon: 'historical', difficulty: 'easy', duration: 'medium', cost: 'free', description: 'Explore historic neighborhoods and architecture' },
    { name: 'Local Museum', icon: 'museums', difficulty: 'easy', duration: 'medium', cost: 'moderate', description: 'Discover local history and artifacts' },
    { name: 'Art Gallery Tour', icon: 'art', difficulty: 'easy', duration: 'short', cost: 'budget', description: 'Browse contemporary and traditional art' },
    { name: 'Cultural Workshop', icon: 'cultural', difficulty: 'moderate', duration: 'long', cost: 'expensive', description: 'Learn traditional crafts and skills' },
    { name: 'Heritage Site Visit', icon: 'sightseeing', difficulty: 'easy', duration: 'long', cost: 'moderate', description: 'Visit UNESCO World Heritage locations' },
    { name: 'Local Library/Archives', icon: 'cultural', difficulty: 'easy', duration: 'short', cost: 'free', description: 'Research local history and culture' },
    { name: 'Photography Walk', icon: 'photography', difficulty: 'easy', duration: 'medium', cost: 'free', description: 'Capture architectural and cultural scenes' },
    { name: 'Theater Performance', icon: 'entertainment', difficulty: 'easy', duration: 'long', cost: 'expensive', description: 'Watch local theatrical productions' }
  ],
  food: [
    { name: 'Street Food Market', icon: 'food', difficulty: 'easy', duration: 'short', cost: 'budget', description: 'Sample authentic local street food' },
    { name: 'Cooking Class', icon: 'culinary', difficulty: 'moderate', duration: 'long', cost: 'expensive', description: 'Learn to prepare traditional dishes' },
    { name: 'Wine Tasting', icon: 'wine', difficulty: 'easy', duration: 'medium', cost: 'expensive', description: 'Taste local wines and learn about production' },
    { name: 'Food Tour', icon: 'food', difficulty: 'easy', duration: 'long', cost: 'moderate', description: 'Guided tour of local culinary highlights' },
    { name: 'Local Restaurant', icon: 'dining', difficulty: 'easy', duration: 'medium', cost: 'moderate', description: 'Dine at authentic local establishments' },
    { name: 'Farmers Market', icon: 'food', difficulty: 'easy', duration: 'short', cost: 'budget', description: 'Browse fresh local produce and specialties' },
    { name: 'Coffee Roastery', icon: 'food', difficulty: 'easy', duration: 'short', cost: 'budget', description: 'Learn about local coffee culture' },
    { name: 'Brewery Tour', icon: 'food', difficulty: 'easy', duration: 'medium', cost: 'moderate', description: 'Discover local brewing traditions' }
  ],
  outdoor: [
    { name: 'City Park Exploration', icon: 'nature', difficulty: 'easy', duration: 'medium', cost: 'free', description: 'Explore urban green spaces and gardens' },
    { name: 'Hiking Trail', icon: 'hiking', difficulty: 'moderate', duration: 'long', cost: 'free', description: 'Trek through scenic natural areas' },
    { name: 'Bike Rental', icon: 'cycling', difficulty: 'moderate', duration: 'long', cost: 'budget', description: 'Cycle through city and countryside' },
    { name: 'Water Activities', icon: 'water_sports', difficulty: 'moderate', duration: 'long', cost: 'moderate', description: 'Kayaking, sailing, or swimming' },
    { name: 'Outdoor Market', icon: 'outdoor', difficulty: 'easy', duration: 'short', cost: 'budget', description: 'Browse outdoor markets and vendors' },
    { name: 'Garden Visit', icon: 'nature', difficulty: 'easy', duration: 'medium', cost: 'budget', description: 'Tour botanical gardens and parks' },
    { name: 'Beach/Lake Day', icon: 'water_sports', difficulty: 'easy', duration: 'long', cost: 'free', description: 'Relax at natural water bodies' },
    { name: 'Nature Photography', icon: 'photography', difficulty: 'easy', duration: 'medium', cost: 'free', description: 'Capture natural landscapes and wildlife' }
  ],
  entertainment: [
    { name: 'Live Music Venue', icon: 'music', difficulty: 'easy', duration: 'long', cost: 'moderate', description: 'Experience local music scene' },
    { name: 'Local Cinema', icon: 'entertainment', difficulty: 'easy', duration: 'long', cost: 'budget', description: 'Watch films at unique theaters' },
    { name: 'Shopping District', icon: 'shopping', difficulty: 'easy', duration: 'medium', cost: 'expensive', description: 'Browse local shops and boutiques' },
    { name: 'Comedy Show', icon: 'entertainment', difficulty: 'easy', duration: 'medium', cost: 'moderate', description: 'Enjoy local comedy performances' },
    { name: 'Game Café', icon: 'entertainment', difficulty: 'easy', duration: 'medium', cost: 'budget', description: 'Play games in social settings' },
    { name: 'Escape Room', icon: 'entertainment', difficulty: 'moderate', duration: 'short', cost: 'moderate', description: 'Solve puzzles with friends' },
    { name: 'Night Market', icon: 'shopping', difficulty: 'easy', duration: 'medium', cost: 'budget', description: 'Browse evening markets and stalls' },
    { name: 'Local Bar/Pub', icon: 'nightlife', difficulty: 'easy', duration: 'medium', cost: 'moderate', description: 'Experience local nightlife culture' }
  ],
  relaxation: [
    { name: 'Spa Day', icon: 'spa', difficulty: 'easy', duration: 'long', cost: 'expensive', description: 'Unwind with massage and treatments' },
    { name: 'Meditation Center', icon: 'meditation', difficulty: 'easy', duration: 'short', cost: 'budget', description: 'Practice mindfulness and meditation' },
    { name: 'Hot Springs', icon: 'wellness', difficulty: 'easy', duration: 'long', cost: 'moderate', description: 'Soak in natural thermal waters' },
    { name: 'Yoga Class', icon: 'wellness', difficulty: 'easy', duration: 'medium', cost: 'budget', description: 'Join group yoga sessions' },
    { name: 'Quiet Café', icon: 'relaxation', difficulty: 'easy', duration: 'short', cost: 'budget', description: 'Relax with coffee and quiet atmosphere' },
    { name: 'Beach Lounging', icon: 'relaxation', difficulty: 'easy', duration: 'long', cost: 'free', description: 'Rest and relax by the water' },
    { name: 'Wellness Center', icon: 'wellness', difficulty: 'easy', duration: 'medium', cost: 'moderate', description: 'Holistic health and wellness activities' },
    { name: 'Reading Garden', icon: 'relaxation', difficulty: 'easy', duration: 'medium', cost: 'free', description: 'Peaceful reading in scenic settings' }
  ],
  adventure: [
    { name: 'Adventure Park', icon: 'adventure', difficulty: 'moderate', duration: 'long', cost: 'moderate', description: 'Zip-lining and obstacle courses' },
    { name: 'Rock Climbing', icon: 'adventure', difficulty: 'challenging', duration: 'long', cost: 'expensive', description: 'Indoor or outdoor climbing experiences' },
    { name: 'Extreme Sports', icon: 'adventure', difficulty: 'challenging', duration: 'medium', cost: 'expensive', description: 'Bungee jumping, skydiving, etc.' },
    { name: 'Adventure Tour', icon: 'adventure', difficulty: 'moderate', duration: 'long', cost: 'expensive', description: 'Guided adventure experiences' },
    { name: 'Scuba Diving', icon: 'water_sports', difficulty: 'challenging', duration: 'long', cost: 'expensive', description: 'Underwater exploration and diving' },
    { name: 'Mountain Biking', icon: 'cycling', difficulty: 'challenging', duration: 'long', cost: 'moderate', description: 'Off-road cycling adventures' },
    { name: 'Paragliding', icon: 'adventure', difficulty: 'challenging', duration: 'medium', cost: 'expensive', description: 'Soar through the skies safely' },
    { name: 'Cave Exploration', icon: 'adventure', difficulty: 'moderate', duration: 'long', cost: 'moderate', description: 'Discover underground formations' }
  ]
};

const COST_ORDER = { free: 0, budget: 1, moderate: 2, expensive: 3 };
const DIFFICULTY_ORDER = { easy: 0, moderate: 1, challenging: 2 };

function filterActivitiesByConstraints(activities: any[], constraints: {
  maxCost?: string;
  maxDifficulty?: string;
  timeSlot?: string;
  excludeIds?: string[];
}) {
  return activities.filter(activity => {
    // Cost filter
    if (constraints.maxCost) {
      const activityCostLevel = COST_ORDER[activity.cost as keyof typeof COST_ORDER] || 2;
      const maxCostLevel = COST_ORDER[constraints.maxCost as keyof typeof COST_ORDER] || 3;
      if (activityCostLevel > maxCostLevel) return false;
    }

    // Difficulty filter
    if (constraints.maxDifficulty) {
      const activityDifficultyLevel = DIFFICULTY_ORDER[activity.difficulty as keyof typeof DIFFICULTY_ORDER] || 1;
      const maxDifficultyLevel = DIFFICULTY_ORDER[constraints.maxDifficulty as keyof typeof DIFFICULTY_ORDER] || 2;
      if (activityDifficultyLevel > maxDifficultyLevel) return false;
    }

    // Exclude specific IDs
    if (constraints.excludeIds && constraints.excludeIds.includes(activity.id)) {
      return false;
    }

    return true;
  });
}

function generateRandomActivity(preference: ActivityType, destination: string = 'Your destination', constraints: any = {}) {
  const categoryPool = ACTIVITY_POOLS[preference.category] || ACTIVITY_POOLS.cultural;
  const filteredPool = filterActivitiesByConstraints(categoryPool, constraints);
  
  if (filteredPool.length === 0) {
    // Fallback to all activities if filters are too restrictive
    const fallbackActivity = categoryPool[Math.floor(Math.random() * categoryPool.length)];
    return createActivityFromTemplate(fallbackActivity, preference, destination, constraints);
  }

  const selectedTemplate = filteredPool[Math.floor(Math.random() * filteredPool.length)];
  return createActivityFromTemplate(selectedTemplate, preference, destination, constraints);
}

function createActivityFromTemplate(template: any, preference: ActivityType, destination: string, constraints: any) {
  const timeSlot = constraints.timeSlot || getDefaultTimeSlot(preference.category);
  
  return {
    id: `random_${preference.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: template.name,
    description: template.description,
    type: 'activity',
    category: preference.category,
    preferenceSource: preference.name,
    icon: template.icon,
    difficulty: template.difficulty,
    duration: template.duration,
    cost: template.cost,
    timeSlot,
    location: destination,
    status: 'suggested',
    source: 'random_preference',
    confidence: 0.75 + (Math.random() * 0.15), // 0.75-0.90
    popularity: preference.popularity || (3 + Math.random() * 2), // 3-5
    aiGenerated: true,
    randomized: true,
    generatedAt: new Date().toISOString(),
    metadata: {
      generatedFrom: preference.id,
      preferenceCategory: preference.category,
      isFiltered: Object.keys(constraints).length > 0
    }
  };
}

function getDefaultTimeSlot(category: string) {
  const timeSlotPreferences = {
    cultural: 'morning',
    food: 'lunch',
    outdoor: 'morning',
    entertainment: 'evening',
    relaxation: 'afternoon',
    adventure: 'morning'
  };
  
  return timeSlotPreferences[category as keyof typeof timeSlotPreferences] || 'afternoon';
}

export async function POST(request: NextRequest) {
  try {
    const body: RandomActivityRequest = await request.json();
    const { 
      preferences, 
      destination = 'Your destination',
      travelers = 1,
      timeSlot,
      excludeIds = [],
      count = 1,
      maxCost,
      maxDifficulty
    } = body;

    // Validate input
    if (!preferences || preferences.length === 0) {
      return NextResponse.json(
        { error: 'No preferences provided' },
        { status: 400 }
      );
    }

    if (count > 10) {
      return NextResponse.json(
        { error: 'Cannot generate more than 10 activities at once' },
        { status: 400 }
      );
    }

    const constraints = {
      timeSlot,
      excludeIds,
      maxCost,
      maxDifficulty
    };

    const generatedActivities: any[] = [];

    // Generate requested number of activities
    for (let i = 0; i < count; i++) {
      // Select random preference for this activity
      const randomPreference = preferences[Math.floor(Math.random() * preferences.length)];
      
      // Generate activity based on preference
      const activity = generateRandomActivity(randomPreference, destination, {
        ...constraints,
        excludeIds: [...excludeIds, ...generatedActivities.map(a => a.id)]
      });
      
      generatedActivities.push(activity);
    }

    const response = {
      success: true,
      activities: generatedActivities,
      metadata: {
        totalGenerated: generatedActivities.length,
        preferencesUsed: preferences.length,
        constraints: constraints,
        destination,
        travelers,
        generatedAt: new Date().toISOString()
      },
      preferences: preferences.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        used: generatedActivities.filter(a => a.preferenceSource === p.name).length
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating random activities:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate random activities',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const count = parseInt(searchParams.get('count') || '3');

  try {
    if (category && ACTIVITY_POOLS[category as keyof typeof ACTIVITY_POOLS]) {
      const pool = ACTIVITY_POOLS[category as keyof typeof ACTIVITY_POOLS];
      const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
      const randomActivities = shuffledPool.slice(0, Math.min(count, pool.length));

      return NextResponse.json({
        category,
        activities: randomActivities,
        totalAvailable: pool.length
      });
    }

    // Return sample from all categories using JSON-based sorting
    const allActivities: any[] = [];
    Object.entries(ACTIVITY_POOLS).forEach(([cat, activities]) => {
      const sample = activities
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map(a => ({ ...a, category: cat }));
      allActivities.push(...sample);
    });

    const sortedActivities = sortByConfigJSON(allActivities, [
      { field: 'name', direction: 'asc', type: 'string' }
    ]);

    return NextResponse.json({
      activities: sortedActivities.slice(0, count),
      categories: Object.keys(ACTIVITY_POOLS),
      totalAvailable: Object.values(ACTIVITY_POOLS).reduce((sum, pool) => sum + pool.length, 0)
    });

  } catch (error) {
    console.error('Error fetching random activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random activities' },
      { status: 500 }
    );
  }
} 