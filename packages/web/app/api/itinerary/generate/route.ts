/**
 * Itinerary Generation API Route
 * Dynamically generates itinerary items based on user input by calling mock services.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MockFlightService } from '../../../../../mocks/services/flight-service';
import { MockHotelService } from '../../../../../mocks/services/hotel-service';
import { MockActivityService } from '../../../../../mocks/services/activity-service';
import { FlightSearchParams, HotelSearchParams, ActivitySearchParams, FlightResult, HotelResult, ActivityResult } from '../../../../../mocks/types';
import { sortItineraryItemsJSON } from '../../../../lib/utils';

interface TravelDetails {
  departureLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  adults: number;
  children: number;
}

interface ItineraryItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  price: number;
  currency: string;
  status: 'suggested' | 'confirmed' | 'booked';
  source: 'ai' | 'api' | 'user';
  metadata?: any;
}

/**
 * Extract airport code from location string safely
 * @param location - Location string that may or may not contain airport code in parentheses
 * @returns Airport code or a default fallback
 */
function extractAirportCode(location: string): string {
  if (!location) return 'JFK'; // Default fallback
  
  // Try to extract airport code from parentheses
  const match = location.match(/\(([A-Z]{3})\)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // If no airport code in parentheses, try to map common cities to airport codes
  const cityToAirport: { [key: string]: string } = {
    'new york': 'JFK',
    'london': 'LHR',
    'paris': 'CDG',
    'tokyo': 'NRT',
    'los angeles': 'LAX',
    'chicago': 'ORD',
    'miami': 'MIA',
    'san francisco': 'SFO',
    'boston': 'BOS',
    'washington': 'DCA'
  };
  
  const cityName = location.toLowerCase().split(',')[0].trim();
  return cityToAirport[cityName] || 'JFK'; // Default to JFK if no match
}

/**
 * Extract destination city name safely
 * @param location - Location string
 * @returns City name
 */
function extractCityName(location: string): string {
  if (!location) return 'Unknown City';
  
  // Remove airport code in parentheses and get the city name
  return location.split('(')[0].split(',')[0].trim();
}

/**
 * Generate dynamic itinerary by fetching data from mock services.
 */
async function generateItinerary(travelDetails: TravelDetails): Promise<ItineraryItem[]> {
  const { destination, departureLocation, startDate, endDate, travelers, adults, children } = travelDetails;
  
  // Validate required data
  if (!destination || !departureLocation || !startDate || !endDate) {
    throw new Error('Missing required travel details');
  }
  
  console.log('Starting itinerary generation with:', {
    destination,
    departureLocation,
    startDate,
    endDate,
    travelers
  });
  
  const flightService = new MockFlightService();
  const hotelService = new MockHotelService();
  const activityService = new MockActivityService();

  const items: ItineraryItem[] = [];
  
  // Parse dates properly - handle both simple date strings and ISO strings
  const parseDate = (dateStr: string) => {
    // Extract just the date part and create a date in local timezone
    const datePart = dateStr.split('T')[0]; // Get "2024-12-20"
    const [year, month, day] = datePart.split('-').map(Number);
    // Create date in local timezone to avoid UTC conversion issues
    return new Date(year, month - 1, day); // month is 0-based in JS
  };
  
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  console.log('Parsed dates:', {
    startDate,
    endDate,
    start: start.toISOString(),
    end: end.toISOString(),
    startValid: !isNaN(start.getTime()),
    endValid: !isNaN(end.getTime()),
    startLocal: start.toLocaleDateString(),
    endLocal: end.toLocaleDateString()
  });
  
  const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  console.log('Duration days:', durationDays);

  try {
    // 1. Fetch Flight with safer airport code extraction
    console.log('1. Fetching outbound flights...');
    const originAirport = extractAirportCode(departureLocation);
    const destinationAirport = extractAirportCode(destination);
    
    console.log('Airport codes:', { originAirport, destinationAirport });
    
  const outboundFlightParams: FlightSearchParams = {
      origin: originAirport,
      destination: destinationAirport,
    departureDate: startDate,
    passengers: { adults, children, infants: 0 },
    cabin: 'economy',
    directFlightsOnly: true,
  };
    
    console.log('Flight search params:', outboundFlightParams);
    
  const outboundFlightResponse = await flightService.search(outboundFlightParams);
    console.log('Flight search response:', {
      success: outboundFlightResponse.success,
      dataLength: outboundFlightResponse.data?.length || 0,
      error: outboundFlightResponse.error
    });
    
  if (outboundFlightResponse.success && outboundFlightResponse.data && outboundFlightResponse.data.length > 0) {
    const flight: FlightResult = outboundFlightResponse.data[0];
      console.log('Adding outbound flight:', {
        id: flight.id,
        departureTime: flight.segments[0].departure.time,
        arrivalTime: flight.segments[0].arrival.time
      });
      
    items.push({
      id: flight.id,
      type: 'flight',
        name: `Flight to ${extractCityName(destination)}`,
      description: `Flight with ${flight.segments[0].airline}`,
      startTime: flight.segments[0].departure.time,
      endTime: flight.segments[0].arrival.time,
      location: flight.segments[0].arrival.airport.name,
      price: flight.price.amount,
      currency: flight.price.currency,
      status: 'suggested',
      source: 'api',
      metadata: flight,
    });
  }

    // 2. Fetch Hotel with safer destination extraction
    console.log('2. Fetching hotels...');
    const destinationCity = extractCityName(destination);
  const hotelParams: HotelSearchParams = {
      destination: destinationCity,
    checkIn: startDate,
    checkOut: endDate,
    guests: { adults, children, rooms: 1 },
  };
    
  const hotelResponse = await hotelService.search(hotelParams);
    console.log('Hotel search response:', {
      success: hotelResponse.success,
      dataLength: hotelResponse.data?.length || 0
    });
    
  if (hotelResponse.success && hotelResponse.data && hotelResponse.data.length > 0) {
    const hotel: HotelResult = hotelResponse.data[0];
      // Use the properly parsed start/end dates to avoid timezone issues
      const checkInTime = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 15, 0, 0, 0).toISOString();
      const checkOutTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 11, 0, 0, 0).toISOString();
      
      console.log('Adding hotel:', {
        id: hotel.id,
        checkIn: checkInTime,
        checkOut: checkOutTime
      });
      
    items.push({
      id: hotel.id,
      type: 'hotel',
      name: `Stay at ${hotel.name}`,
      description: `${hotel.starRating}-star hotel`,
        startTime: checkInTime,
        endTime: checkOutTime,
      location: hotel.location.address,
      price: hotel.price.amount,
      currency: hotel.price.currency,
      status: 'suggested',
      source: 'api',
      metadata: hotel,
    });
  }

    // 3. Fetch Activities with safer destination extraction
    console.log('3. Fetching activities...');
  const activityParams: ActivitySearchParams = {
      destination: destinationCity,
    groupSize: travelers,
  };
    
  const activityResponse = await activityService.search(activityParams);
    console.log('Activity search response:', {
      success: activityResponse.success,
      dataLength: activityResponse.data?.length || 0
    });
    
    if (activityResponse.success && activityResponse.data && activityResponse.data.length > 0) {
    // Calculate desired number of activities (2-3 per day)
    const desiredActivities = Math.min(durationDays * 3, durationDays * 2 + 3); // 2-3 activities per day
    console.log(`Available activities: ${activityResponse.data.length}, Desired: ${desiredActivities}, Duration: ${durationDays} days`);
    
    // Cycle through available activities to fill longer trips
    const activities: ActivityResult[] = [];
    for (let i = 0; i < desiredActivities; i++) {
      const activityIndex = i % activityResponse.data.length; // Cycle through available activities
      const baseActivity = activityResponse.data[activityIndex];
      
      // Create a unique variant for repeated activities
      const variant = Math.floor(i / activityResponse.data.length) + 1;
      const activityCopy = {
        ...baseActivity,
        id: `${baseActivity.id}-${variant}`, // Unique ID for each instance
        name: variant > 1 ? `${baseActivity.name} (Day ${variant})` : baseActivity.name
      };
      
      activities.push(activityCopy);
    }
    
    console.log(`Generated ${activities.length} activities (cycling through ${activityResponse.data.length} unique activities)...`);
    
    // Time slots for better distribution (avoid conflicts)
    const timeSlots = [
      { hour: 9, minute: 0 },   // 9:00 AM
      { hour: 11, minute: 30 }, // 11:30 AM  
      { hour: 14, minute: 0 },  // 2:00 PM
      { hour: 16, minute: 30 }, // 4:30 PM
      { hour: 19, minute: 0 },  // 7:00 PM (dinner/evening)
    ];
    
    activities.forEach((activity, index) => {
      // Distribute activities more evenly across days
      const dayIndex = index % durationDays;
      
      // Count activities per day to calculate proper time slots
      const activityCountOnThisDay = Math.floor(index / durationDays);
      const timeSlotIndex = activityCountOnThisDay % timeSlots.length;
      
      // Create a fresh date object to avoid mutation bugs
      // Parse the start date properly to avoid timezone issues
      const activityDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      activityDate.setDate(activityDate.getDate() + dayIndex);

      const selectedTimeSlot = timeSlots[timeSlotIndex];
      const startTime = new Date(activityDate.setHours(selectedTimeSlot.hour, selectedTimeSlot.minute, 0, 0)).toISOString();
      const endTime = new Date(new Date(startTime).setHours(new Date(startTime).getHours() + 2)).toISOString();

        console.log(`🔍 DEBUGGING Activity ${index}:`, {
          id: activity.id,
          name: activity.name,
          originalStartDate: start.toISOString(),
          durationDays,
          dayIndex,
          activityCountOnThisDay,
          timeSlotIndex,
          selectedTimeSlot,
          activityDateAfterCalculation: activityDate.toISOString(),
          startTime,
          endTime
        });

        items.push({
            id: activity.id,
            type: 'activity',
            name: activity.name,
          description: activity.shortDescription,
          startTime,
          endTime,
          location: activity.location.name,
          price: activity.price?.amount || 0,
          currency: activity.price?.currency || 'USD',
          status: 'suggested',
          source: 'api',
          metadata: activity,
      });
    });
  }
  
    // 4. Fetch Return Flight with safer airport code extraction
    console.log('4. Fetching return flights...');
  const returnFlightParams: FlightSearchParams = {
      origin: destinationAirport,
      destination: originAirport,
    departureDate: endDate,
    passengers: { adults, children, infants: 0 },
    cabin: 'economy',
    directFlightsOnly: true,
  };
    
  const returnFlightResponse = await flightService.search(returnFlightParams);
    console.log('Return flight search response:', {
      success: returnFlightResponse.success,
      dataLength: returnFlightResponse.data?.length || 0
    });
    
  if (returnFlightResponse.success && returnFlightResponse.data && returnFlightResponse.data.length > 0) {
      const flight: FlightResult = returnFlightResponse.data[0];
        console.log('Adding return flight:', {
          id: flight.id,
          departureTime: flight.segments[0].departure.time,
          arrivalTime: flight.segments[0].arrival.time
        });
        
      items.push({
          id: flight.id,
          type: 'flight',
            name: `Return flight to ${extractCityName(departureLocation)}`,
          description: `Flight with ${flight.segments[0].airline}`,
          startTime: flight.segments[0].departure.time,
          endTime: flight.segments[0].arrival.time,
          location: flight.segments[0].arrival.airport.name,
          price: flight.price.amount,
          currency: flight.price.currency,
          status: 'suggested',
          source: 'api',
          metadata: flight,
      });
  }

    console.log(`Total items before sorting: ${items.length}`);

    // Sort items by start time using JSON-based sorting to ensure chronological order
    const sortedItems = sortItineraryItemsJSON(items);
    
    console.log(`Total items after sorting: ${sortedItems.length}`);
    
    return sortedItems;
  } catch (error) {
    console.error('Error in generateItinerary:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    throw error; // Re-throw to be caught by the main handler
  }
}

export async function POST(request: NextRequest) {
  try {
    const travelDetails: TravelDetails = await request.json();
    
    console.log('Received itinerary generation request:', {
      destination: travelDetails.destination,
      departureLocation: travelDetails.departureLocation,
      startDate: travelDetails.startDate,
      endDate: travelDetails.endDate,
      travelers: travelDetails.travelers
    });
    
    if (!travelDetails.destination || !travelDetails.startDate || !travelDetails.endDate) {
      const missingFields = [];
      if (!travelDetails.destination) missingFields.push('destination');
      if (!travelDetails.startDate) missingFields.push('startDate');
      if (!travelDetails.endDate) missingFields.push('endDate');
      
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          success: false,
          error: `Missing required travel details: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    const items = await generateItinerary(travelDetails);
    
    const totalCost = items.reduce((sum, item) => sum + item.price, 0);
    
    console.log('Successfully generated itinerary:', {
      itemsGenerated: items.length,
      totalCost,
      destination: travelDetails.destination
    });
    
    return NextResponse.json({
      success: true,
      data: {
        items,
        totalCost,
        currency: 'USD',
        destination: travelDetails.destination,
        duration: Math.ceil((new Date(travelDetails.endDate).getTime() - new Date(travelDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)),
        travelers: travelDetails.travelers
      }
    });

  } catch (error) {
    console.error('Itinerary generation error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate itinerary';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 