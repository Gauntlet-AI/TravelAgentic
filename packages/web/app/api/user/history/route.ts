/**
 * User Trip History API Route
 * Provides user's travel history data
 * Replaces hardcoded trip history in components
 */

import { NextRequest, NextResponse } from 'next/server';
import { sortByConfigJSON } from '../../../../lib/utils';

interface TripHistory {
  id: number;
  destination: string;
  dates: string;
  status: 'Completed' | 'Upcoming' | 'Cancelled';
  total: string;
  image?: string;
  duration?: string;
  travelers?: number;
}

/**
 * Generate realistic trip history based on user data
 */
function generateTripHistory(userId?: string): TripHistory[] {
  // In a real implementation, this would fetch from database
  // For now, generate varied data based on user ID for consistency
  
  const destinations = [
    { name: 'Paris, France', cost: 2840, image: 'paris.jpg' },
    { name: 'Tokyo, Japan', cost: 3220, image: 'tokyo.jpg' },
    { name: 'Barcelona, Spain', cost: 1950, image: 'barcelona.jpg' },
    { name: 'Rome, Italy', cost: 2100, image: 'rome.jpg' },
    { name: 'New York, USA', cost: 1680, image: 'newyork.jpg' },
    { name: 'London, England', cost: 2450, image: 'london.jpg' },
    { name: 'Amsterdam, Netherlands', cost: 1820, image: 'amsterdam.jpg' },
    { name: 'Bali, Indonesia', cost: 1540, image: 'bali.jpg' },
    { name: 'Sydney, Australia', cost: 3850, image: 'sydney.jpg' },
    { name: 'Dubai, UAE', cost: 2780, image: 'dubai.jpg' }
  ];

  const currentYear = new Date().getFullYear();
  const trips: TripHistory[] = [];
  
  // Generate 3-7 trips based on user ID hash (for consistency)
  const tripCount = userId ? 3 + (userId.length % 5) : 5;
  const usedDestinations = new Set<string>();
  
  for (let i = 0; i < tripCount; i++) {
    // Pick a unique destination
    let destination;
    do {
      destination = destinations[Math.floor(Math.random() * destinations.length)];
    } while (usedDestinations.has(destination.name) && usedDestinations.size < destinations.length);
    
    usedDestinations.add(destination.name);
    
    // Generate dates (mix of past and future)
    const monthsAgo = Math.floor(Math.random() * 24) - 6; // -6 to +18 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + monthsAgo);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 10) + 3); // 3-12 day trips
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== currentYear ? 'numeric' : undefined
      });
    };
    
    const status: TripHistory['status'] = monthsAgo < -1 ? 'Completed' : 
                                         monthsAgo > 0 ? 'Upcoming' : 
                                         Math.random() > 0.9 ? 'Cancelled' : 'Completed';
    
    // Add some cost variation
    const baseCost = destination.cost;
    const variation = 0.8 + Math.random() * 0.4; // ±20% variation
    const finalCost = Math.round(baseCost * variation);
    
    trips.push({
      id: i + 1,
      destination: destination.name,
      dates: `${formatDate(startDate)}-${formatDate(endDate)}, ${startDate.getFullYear()}`,
      status,
      total: `$${finalCost.toLocaleString()}`,
      image: destination.image,
      duration: `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days`,
      travelers: Math.floor(Math.random() * 4) + 1
    });
  }
  
  // Sort by date (most recent first) using JSON-based sorting
  const sortedTrips = sortByConfigJSON(trips, [
    { field: 'dates', direction: 'desc', type: 'string' }
  ]);
  
  return sortedTrips;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as TripHistory['status'] | null;
    
    let trips = generateTripHistory(userId || undefined);
    
    // Filter by status if specified
    if (status) {
      trips = trips.filter(trip => trip.status === status);
    }
    
    // Apply limit
    trips = trips.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: trips,
      total: trips.length
    });

  } catch (error) {
    console.error('User history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user history' },
      { status: 500 }
    );
  }
} 