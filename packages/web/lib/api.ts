import type { Activity, Hotel, TravelDetails } from './mock-data';

// Hotel search API using mock service
export async function searchHotels(
  travelDetails: TravelDetails
): Promise<Hotel[]> {
  try {
    const response = await fetch('/api/hotels/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: travelDetails.destination,
        checkIn: travelDetails.startDate ? travelDetails.startDate.toISOString().split('T')[0] : '',
        checkOut: travelDetails.endDate ? travelDetails.endDate.toISOString().split('T')[0] : '',
        guests: travelDetails.travelers,
        rooms: 1
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
    }
    
    throw new Error('Hotel search API failed');
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
}

// Activity research function using mock service
export async function researchActivities(
  travelDetails: TravelDetails
): Promise<Activity[]> {
  try {
    const response = await fetch('/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: travelDetails.destination,
        startDate: travelDetails.startDate ? travelDetails.startDate.toISOString().split('T')[0] : '',
        endDate: travelDetails.endDate ? travelDetails.endDate.toISOString().split('T')[0] : '',
        travelers: travelDetails.travelers
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
    }
    
    throw new Error('Activity search API failed');
  } catch (error) {
    console.error('Error searching activities:', error);
    throw error;
  }
}

// Filter activities based on selected types
export function filterActivitiesByTypes(
  activities: Activity[],
  selectedTypes: string[]
): Activity[] {
  if (selectedTypes.length === 0) return activities;

  return activities.filter((activity) =>
    activity.category.some((cat: string) => selectedTypes.includes(cat))
  );
}
