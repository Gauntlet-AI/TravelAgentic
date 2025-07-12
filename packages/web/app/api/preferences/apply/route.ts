/**
 * Activity Preferences Application API
 * Applies user activity preferences to itineraries by fetching suggestions from the mock activity service.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MockActivityService } from '../../../../../mocks/services/activity-service';
import { ActivityResult, ActivitySearchParams } from '../../../../../mocks/types';

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

interface TravelDetails {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
}

interface PreferenceApplicationRequest {
  preferences: ActivityType[];
  travelDetails: TravelDetails;
  currentItinerary?: any[];
}

const timeSlotMap: { [key: string]: string[] } = {
  morning: ['sightseeing', 'outdoor', 'cultural', 'adventure'],
  afternoon: ['sightseeing', 'outdoor', 'cultural', 'adventure', 'shopping', 'relaxation'],
  evening: ['food', 'entertainment', 'relaxation'],
  night: ['entertainment'],
};


async function generatePersonalizedActivities(preferences: ActivityType[], travelDetails: TravelDetails): Promise<any[]> {
  const activityService = new MockActivityService();
  const { destination, startDate, endDate, travelers } = travelDetails;

  const tripDuration = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));

  const searchParams: ActivitySearchParams = {
    destination: destination,
    categories: preferences.map(p => p.category),
    groupSize: travelers,
  };

  const serviceResponse = await activityService.search(searchParams);

  if (!serviceResponse.success || !serviceResponse.data) {
    return [];
  }

  const allActivities = serviceResponse.data;
  const generatedActivities: any[] = [];
  const activitiesPerDay: { [key: number]: number } = {};

  allActivities.forEach((activity: ActivityResult, index: number) => {
    const dayIndex = index % tripDuration;
    activitiesPerDay[dayIndex] = (activitiesPerDay[dayIndex] || 0) + 1;

    let timeSlot = 'afternoon';
    for (const slot in timeSlotMap) {
      if (activity.categories?.some((cat: string) => timeSlotMap[slot].includes(cat))) {
        timeSlot = slot;
        break;
      }
    }
    
    const activityDate = new Date(startDate);
    activityDate.setDate(activityDate.getDate() + dayIndex);

    generatedActivities.push({
      ...activity,
      id: `pref_${activity.id}_${dayIndex}`,
      dayIndex,
      timeSlot,
      date: activityDate.toISOString().split('T')[0],
      source: 'preference_ai',
      preferenceSource: preferences.find(p => activity.categories?.includes(p.category))?.name,
    });
  });

  return generatedActivities;
}

function calculatePersonalizationScore(preferences: ActivityType[], activities: any[]) {
    const totalPossibleActivities = preferences.length * 3; 
    const actualActivities = activities.length;
    const preferencesCovered = new Set(activities.map(a => a.preferenceSource)).size;
    
    return {
      coverage: (preferencesCovered / preferences.length) * 100,
      density: (actualActivities / totalPossibleActivities) * 100,
      overall: Math.min(95, ((preferencesCovered / preferences.length) * 60) + ((actualActivities / totalPossibleActivities) * 40))
    };
  }
  
  export async function POST(request: NextRequest) {
    try {
      const body: PreferenceApplicationRequest = await request.json();
      const { preferences, travelDetails } = body;
  
      if (!preferences || preferences.length === 0) {
        return NextResponse.json({ error: 'No preferences provided' }, { status: 400 });
      }
  
      if (!travelDetails || !travelDetails.destination) {
        return NextResponse.json({ error: 'Travel details required' }, { status: 400 });
      }
  
      const activities = await generatePersonalizedActivities(preferences, travelDetails);
      
      const personalizationScore = calculatePersonalizationScore(preferences, activities);
      
      const activitiesByDay: { [day: number]: any[] } = {};
      activities.forEach(activity => {
        const day = activity.dayIndex;
        if (!activitiesByDay[day]) {
          activitiesByDay[day] = [];
        }
        activitiesByDay[day].push(activity);
      });
  
      const response = {
        success: true,
        activities,
        activitiesByDay,
        metrics: {
          totalActivities: activities.length,
          preferencesApplied: preferences.length,
          daysOptimized: Object.keys(activitiesByDay).length,
          personalizationScore: Math.round(personalizationScore.overall),
          coverage: Math.round(personalizationScore.coverage),
          averageConfidence: activities.reduce((sum, a) => sum + (a.confidence || 0), 0) / (activities.length || 1)
        },
        preferences: preferences.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          applied: activities.filter(a => a.preferenceSource === p.name).length
        })),
        travelContext: {
          destination: travelDetails.destination,
          duration: Math.ceil((new Date(travelDetails.endDate).getTime() - new Date(travelDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)),
          travelers: travelDetails.travelers
        }
      };
  
      return NextResponse.json(response);
  
    } catch (error) {
      console.error('Error applying preferences:', error);
      return NextResponse.json(
        { 
          error: 'Failed to apply preferences',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
  
  export async function GET(request: NextRequest) {
    try {
      const activityService = new MockActivityService();
      const categoriesResponse = await activityService.getCategories();
  
      if (!categoriesResponse.success || !categoriesResponse.data) {
        return NextResponse.json(
          { error: 'Failed to fetch activity categories from service' },
          { status: 500 }
        );
      }
  
      return NextResponse.json({
        categories: categoriesResponse.data,
      });
  
    } catch (error) {
      console.error('Error fetching activity templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity templates' },
        { status: 500 }
      );
    }
  } 