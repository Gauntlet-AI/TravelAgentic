/**
 * Activity Categories API Route
 * Provides activity categories and types for preference selection
 * Replaces hardcoded activity types in components
 */

import { NextRequest, NextResponse } from 'next/server';

// Activity type interface
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

/**
 * Generate activity types based on destination and preferences
 */
function generateActivityTypes(destination?: string): ActivityType[] {
  const baseActivities: ActivityType[] = [
    {
      id: 'sightseeing',
      name: 'Sightseeing',
      description: 'Explore iconic landmarks and beautiful viewpoints',
      icon: 'sightseeing',
      category: 'cultural',
      difficulty: 'easy',
      duration: 'medium',
      cost: 'budget',
      popularity: 5,
      recommendations: 24
    },
    {
      id: 'food-tours',
      name: 'Food Tours',
      description: 'Discover local cuisine and culinary traditions',
      icon: 'food',
      category: 'food',
      difficulty: 'easy',
      duration: 'medium',
      cost: 'moderate',
      popularity: 4,
      recommendations: 18
    },
    {
      id: 'outdoor-adventures',
      name: 'Outdoor Adventures',
      description: 'Hiking, cycling, and nature exploration',
      icon: 'outdoor',
      category: 'outdoor',
      difficulty: 'moderate',
      duration: 'long',
      cost: 'budget',
      popularity: 4,
      recommendations: 15
    },
    {
      id: 'cultural-experiences',
      name: 'Cultural Experiences',
      description: 'Museums, galleries, and historical sites',
      icon: 'cultural',
      category: 'cultural',
      difficulty: 'easy',
      duration: 'medium',
      cost: 'moderate',
      popularity: 4,
      recommendations: 20
    },
    {
      id: 'nightlife',
      name: 'Nightlife',
      description: 'Bars, clubs, and evening entertainment',
      icon: 'nightlife',
      category: 'entertainment',
      difficulty: 'easy',
      duration: 'long',
      cost: 'moderate',
      popularity: 3,
      recommendations: 12
    },
    {
      id: 'shopping',
      name: 'Shopping',
      description: 'Local markets, boutiques, and shopping districts',
      icon: 'shopping',
      category: 'entertainment',
      difficulty: 'easy',
      duration: 'medium',
      cost: 'expensive',
      popularity: 3,
      recommendations: 8
    },
    {
      id: 'wellness',
      name: 'Wellness & Spa',
      description: 'Relaxation, spa treatments, and wellness activities',
      icon: 'wellness',
      category: 'relaxation',
      difficulty: 'easy',
      duration: 'medium',
      cost: 'expensive',
      popularity: 4,
      recommendations: 11
    },
    {
      id: 'adventure-sports',
      name: 'Adventure Sports',
      description: 'Extreme sports and adrenaline activities',
      icon: 'adventure',
      category: 'adventure',
      difficulty: 'challenging',
      duration: 'long',
      cost: 'expensive',
      popularity: 3,
      recommendations: 9
    }
  ];

  // Customize based on destination
  if (destination) {
    const destLower = destination.toLowerCase();
    
    // Beach destinations
    if (destLower.includes('miami') || destLower.includes('hawaii') || destLower.includes('bali')) {
      baseActivities.push({
        id: 'beach-activities',
        name: 'Beach Activities',
        description: 'Swimming, surfing, and beach sports',
        icon: 'beach',
        category: 'outdoor',
        difficulty: 'easy',
        duration: 'medium',
        cost: 'budget',
        popularity: 5,
        recommendations: 20
      });
    }
    
    // Mountain destinations
    if (destLower.includes('denver') || destLower.includes('colorado') || destLower.includes('alps')) {
      baseActivities.push({
        id: 'mountain-activities',
        name: 'Mountain Activities',
        description: 'Skiing, snowboarding, and mountain climbing',
        icon: 'mountain',
        category: 'adventure',
        difficulty: 'challenging',
        duration: 'long',
        cost: 'expensive',
        popularity: 4,
        recommendations: 16
      });
    }
    
    // City destinations
    if (destLower.includes('new york') || destLower.includes('london') || destLower.includes('tokyo')) {
      baseActivities.find(a => a.id === 'cultural-experiences')!.popularity = 5;
      baseActivities.find(a => a.id === 'cultural-experiences')!.recommendations = 30;
    }
  }

  return baseActivities;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    const category = searchParams.get('category');
    
    let activities = generateActivityTypes(destination || undefined);
    
    // Filter by category if specified
    if (category) {
      activities = activities.filter(activity => activity.category === category);
    }
    
    return NextResponse.json({
      success: true,
      data: activities,
      total: activities.length
    });

  } catch (error) {
    console.error('Activity categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { destination, preferences } = await request.json();
    
    const activities = generateActivityTypes(destination);
    
    // Apply additional filtering based on preferences
    let filteredActivities = activities;
    
    if (preferences?.budget) {
      const budgetMap = { budget: ['free', 'budget'], midrange: ['budget', 'moderate'], luxury: ['moderate', 'expensive'] };
      const allowedCosts = budgetMap[preferences.budget as keyof typeof budgetMap] || ['budget', 'moderate'];
      filteredActivities = filteredActivities.filter(a => allowedCosts.includes(a.cost || 'moderate'));
    }
    
    if (preferences?.difficulty) {
      filteredActivities = filteredActivities.filter(a => a.difficulty === preferences.difficulty);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredActivities,
      total: filteredActivities.length
    });

  } catch (error) {
    console.error('Activity categories error:', error);
    return NextResponse.json(
      { error: 'Failed to process activity categories request' },
      { status: 500 }
    );
  }
} 