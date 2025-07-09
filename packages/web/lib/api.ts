import type { Activity, Hotel, TravelDetails } from './mock-data';
import { mockActivities, mockHotels } from './mock-data';

// Mock hotel search API
export async function searchHotels(
  travelDetails: TravelDetails
): Promise<Hotel[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Return mock hotels with price adjusted for number of travelers
  return mockHotels.map((hotel) => ({
    ...hotel,
    pricePerNight: hotel.pricePerNight + (travelDetails.travelers - 1) * 20,
  }));
}

// Mock activity research function
export async function researchActivities(
  travelDetails: TravelDetails
): Promise<Activity[]> {
  // Simulate longer research delay
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Return mock activities (in real app, this would use LLM to research)
  return mockActivities;
}

// Filter activities based on selected types
export function filterActivitiesByTypes(
  activities: Activity[],
  selectedTypes: string[]
): Activity[] {
  if (selectedTypes.length === 0) return activities;

  return activities.filter((activity) =>
    activity.category.some((cat) => selectedTypes.includes(cat))
  );
}
