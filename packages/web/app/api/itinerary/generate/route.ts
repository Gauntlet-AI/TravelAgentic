/**
 * AI-Powered Itinerary Generation API Route
 * Uses Langflow AI agent for intelligent itinerary planning with proper logical ordering
 */

import { NextRequest, NextResponse } from 'next/server';
import { MockFlightService } from '../../../../../mocks/services/flight-service';
import { MockHotelService } from '../../../../../mocks/services/hotel-service';
import { MockActivityService } from '../../../../../mocks/services/activity-service';
import { FlightSearchParams, HotelSearchParams, ActivitySearchParams, FlightResult, HotelResult, ActivityResult } from '../../../../../mocks/types';
import { sortItineraryItemsJSON } from '../../../../lib/utils';
import { getAirportTimezone, formatWithTimezone, getTimezoneAbbreviation } from '../../../../lib/timezone-utils';
import { TravelLangflowService } from '../../../../lib/langflow-service';
import { 
  DurationEstimator, 
  DistanceCalculator, 
  IntelligentScheduler, 
  DurationUtils,
  ActivityType,
  type LocationInfo,
  type DurationInfo,
  type TravelInfo 
} from '../../../../lib/duration-scheduling-utils';
import { format, addMinutes, addDays, startOfDay, endOfDay, differenceInDays, isAfter, isBefore } from 'date-fns';

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
  timezoneInfo?: {
    timezone: string;
    abbreviation: string;
    displayTime: string;
    nextDay?: boolean;
  };
  duration?: {
    estimated: number;
    description: string;
    flexible: boolean;
  };
  travelToNext?: {
    distance: number;
    duration: number;
    method: 'walking' | 'taxi' | 'public_transport' | 'driving';
    cost?: number;
  };
  bufferAfter?: number; // minutes
  dayIndex?: number; // Which day this item belongs to
}

interface ItineraryDay {
  date: Date;
  items: ItineraryItem[];
  theme?: string;
  focus?: string;
}

interface DayResponse {
  date: string;
  items: ItineraryItem[];
}

/**
 * Extract airport code from location string safely
 */
function extractAirportCode(location: string): string {
  if (!location) return 'JFK';
  
  const match = location.match(/\(([A-Z]{3})\)/);
  if (match && match[1]) {
    return match[1];
  }
  
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
  return cityToAirport[cityName] || 'JFK';
}

/**
 * Extract destination city name safely
 */
function extractCityName(location: string): string {
  if (!location) return 'Unknown City';
  return location.split('(')[0].split(',')[0].trim();
}

/**
 * Get location information with coordinates for scheduling
 */
function getLocationInfo(location: any, type: LocationInfo['type']): LocationInfo {
  try {
    if (type === 'airport' && typeof location === 'string') {
      const airportCode = extractAirportCode(location);
      const airportCoords: Record<string, { lat: number; lon: number }> = {
        'JFK': { lat: 40.6413, lon: -73.7781 },
        'LAX': { lat: 34.0522, lon: -118.2437 },
        'ORD': { lat: 41.9742, lon: -87.9073 },
        'ATL': { lat: 33.6407, lon: -84.4277 },
        'DFW': { lat: 32.8998, lon: -97.0403 },
        'SFO': { lat: 37.6213, lon: -122.3790 },
        'MIA': { lat: 25.7959, lon: -80.2870 },
        'LAS': { lat: 36.0840, lon: -115.1537 },
        'SEA': { lat: 47.4502, lon: -122.3088 },
        'BOS': { lat: 42.3656, lon: -71.0096 },
        'HNL': { lat: 21.3186, lon: -157.9224 },
        'LHR': { lat: 51.4700, lon: -0.4543 },
        'CDG': { lat: 49.0097, lon: 2.5479 },
        'NRT': { lat: 35.7720, lon: 140.3929 },
        'DXB': { lat: 25.2532, lon: 55.3657 }
      };
      
      const coords = airportCoords[airportCode] || { lat: 0, lon: 0 };
      return {
        name: location,
        coordinates: { latitude: coords.lat, longitude: coords.lon },
        type
      };
    }
    
    if (location && location.coordinates) {
      return {
        name: location.name || location.address || 'Unknown Location',
        address: location.address,
        coordinates: location.coordinates,
        type
      };
    }
    
    const cityCoords: Record<string, { lat: number; lon: number }> = {
      'new york': { lat: 40.7128, lon: -74.0060 },
      'los angeles': { lat: 34.0522, lon: -118.2437 },
      'chicago': { lat: 41.8781, lon: -87.6298 },
      'houston': { lat: 29.7604, lon: -95.3698 },
      'miami': { lat: 25.7617, lon: -80.1918 },
      'san francisco': { lat: 37.7749, lon: -122.4194 },
      'las vegas': { lat: 36.1699, lon: -115.1398 },
      'seattle': { lat: 47.6062, lon: -122.3321 },
      'boston': { lat: 42.3601, lon: -71.0589 },
      'london': { lat: 51.5074, lon: -0.1278 },
      'paris': { lat: 48.8566, lon: 2.3522 },
      'tokyo': { lat: 35.6762, lon: 139.6503 },
      'honolulu': { lat: 21.3099, lon: -157.8581 }
    };
    
    const locationName = typeof location === 'string' ? location : (location?.name || location?.address || 'Unknown');
    const cityName = extractCityName(locationName).toLowerCase();
    const coords = cityCoords[cityName] || { lat: 0, lon: 0 };
    
    return {
      name: locationName,
      address: typeof location === 'object' ? location.address : undefined,
      coordinates: { latitude: coords.lat, longitude: coords.lon },
      type
    };
  } catch (error) {
    console.error('Error in getLocationInfo:', error);
    return {
      name: typeof location === 'string' ? location : 'Unknown Location',
      coordinates: { latitude: 0, longitude: 0 },
      type
    };
  }
}

/**
 * AI-Powered Itinerary Generation with Logical Dependencies
 * Uses Langflow AI agent for intelligent planning decisions
 */
async function generateItinerary(travelDetails: TravelDetails): Promise<ItineraryItem[]> {
  const { destination, departureLocation, startDate, endDate, travelers, adults, children } = travelDetails;
  
  // Validate required data
  if (!destination || !departureLocation || !startDate || !endDate) {
    throw new Error('Missing required travel details');
  }
  
  console.log('🤖 Starting AI-powered itinerary generation with:', {
    destination,
    departureLocation,
    startDate,
    endDate,
    travelers
  });
  
  // Initialize AI service
  const aiService = new TravelLangflowService();
  
  // Parse dates properly
  const parseDate = (dateStr: string) => {
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const durationDays = differenceInDays(end, start) + 1;
  
  console.log('📅 Trip duration:', {
    startDate,
    endDate,
    start: start.toISOString(),
    end: end.toISOString(),
    durationDays
  });
  
  // Configure mock services
  const mockConfig = { 
    failureRate: 0.01,
    responseDelay: { min: 200, max: 800 },
    enableRealisticData: true,
    enablePriceFluctuation: true
  };
  
  const flightService = new MockFlightService(mockConfig);
  const hotelService = new MockHotelService(mockConfig);
  const activityService = new MockActivityService(mockConfig);
  
  // Extract airport/city information
  const originAirport = extractAirportCode(departureLocation);
  const destinationAirport = extractAirportCode(destination);
  const destinationCity = extractCityName(destination);
  
  // Get timezone information
  const originTimezone = getAirportTimezone(originAirport);
  const destinationTimezone = getAirportTimezone(destinationAirport);
  
  console.log('🌍 Location info:', { 
    originAirport, 
    destinationAirport, 
    destinationCity,
    originTimezone, 
    destinationTimezone 
  });
  
  try {
    // Phase 1: Fetch Core Travel Components
    console.log('🔄 Phase 1: Fetching core travel components...');
    
    // 1. Outbound Flight
    const outboundFlightParams: FlightSearchParams = {
      origin: originAirport,
      destination: destinationAirport,
      departureDate: startDate,
      passengers: { adults, children, infants: 0 },
      cabin: 'economy',
      directFlightsOnly: true,
    };
    
    const outboundFlightResponse = await flightService.search(outboundFlightParams);
    let outboundFlight: FlightResult | null = null;
    let arrivalTime: Date | null = null;
    
    if (outboundFlightResponse.success && outboundFlightResponse.data && outboundFlightResponse.data.length > 0) {
      outboundFlight = outboundFlightResponse.data[0];
      arrivalTime = new Date(outboundFlight.segments[0].arrival.time);
      console.log('✈️ Outbound flight found:', {
        departure: outboundFlight.segments[0].departure.time,
        arrival: outboundFlight.segments[0].arrival.time,
        airline: outboundFlight.segments[0].airline
      });
    }
    
    // 2. Return Flight
    const returnFlightParams: FlightSearchParams = {
      origin: destinationAirport,
      destination: originAirport,
      departureDate: endDate,
      passengers: { adults, children, infants: 0 },
      cabin: 'economy',
      directFlightsOnly: true,
    };
    
    const returnFlightResponse = await flightService.search(returnFlightParams);
    let returnFlight: FlightResult | null = null;
    let departureTime: Date | null = null;
    
    if (returnFlightResponse.success && returnFlightResponse.data && returnFlightResponse.data.length > 0) {
      returnFlight = returnFlightResponse.data[0];
      departureTime = new Date(returnFlight.segments[0].departure.time);
      console.log('🔄 Return flight found:', {
        departure: returnFlight.segments[0].departure.time,
        arrival: returnFlight.segments[0].arrival.time,
        airline: returnFlight.segments[0].airline
      });
    }
    
    // 3. Hotel Accommodation
    const hotelParams: HotelSearchParams = {
      destination: destinationCity,
      checkIn: startDate,
      checkOut: endDate,
      guests: { adults, children, rooms: 1 },
    };
    
    const hotelResponse = await hotelService.search(hotelParams);
    let hotel: HotelResult | null = null;
    
    if (hotelResponse.success && hotelResponse.data && hotelResponse.data.length > 0) {
      hotel = hotelResponse.data[0];
      console.log('🏨 Hotel found:', {
        name: hotel.name,
        location: hotel.location.address,
        starRating: hotel.starRating
      });
    }
    
    // 4. Activities
    const activityParams: ActivitySearchParams = {
      destination: destinationCity,
      groupSize: travelers,
    };
    
    const activityResponse = await activityService.search(activityParams);
    let activities: ActivityResult[] = [];
    
    if (activityResponse.success && activityResponse.data && activityResponse.data.length > 0) {
      activities = activityResponse.data;
      console.log('🎯 Activities found:', activities.length);
    }
    
    // Phase 2: AI-Powered Itinerary Planning
    console.log('🧠 Phase 2: AI-powered itinerary planning...');
    
    // Create user preferences for AI
    const userPreferences = {
      destination,
      startDate,
      endDate,
      travelers,
      adults,
      children,
      travelStyle: 'mixed',
      interests: activities.map(a => a.categories).flat().filter(Boolean).slice(0, 5)
    };
    
    // Generate AI-powered itinerary structure
    const aiItinerary = await aiService.generateItinerary(
      {
        outbound_flight: outboundFlight,
        return_flight: returnFlight,
        hotel: hotel,
        activities: activities.slice(0, 15) // Limit for AI processing
      },
      userPreferences
    );
    
    console.log('🤖 AI itinerary generated:', {
      title: aiItinerary.title,
      days: aiItinerary.days.length,
      totalActivities: aiItinerary.days.reduce((sum, day) => sum + day.activities.length, 0)
    });
    
    // Phase 3: Create Structured Itinerary with Logical Dependencies
    console.log('📋 Phase 3: Creating structured itinerary...');
    
    const itineraryItems: ItineraryItem[] = [];
    const itineraryDays: ItineraryDay[] = [];
    
    // Initialize days
    for (let i = 0; i < durationDays; i++) {
      const dayDate = addDays(start, i);
      itineraryDays.push({
        date: dayDate,
        items: [],
        theme: aiItinerary.days[i]?.activities[0]?.activity || 'Exploration',
        focus: `Day ${i + 1}`
      });
    }
    
    // Add outbound flight (Day 1, earliest)
    if (outboundFlight && arrivalTime) {
      const departureTimezoneInfo = originTimezone ? {
        timezone: originTimezone,
        abbreviation: getTimezoneAbbreviation(originTimezone, new Date(outboundFlight.segments[0].departure.time)),
        displayTime: formatWithTimezone(new Date(outboundFlight.segments[0].departure.time), originTimezone, 'MMM d, h:mm a'),
        nextDay: false
      } : undefined;
      
      const arrivalTimezoneInfo = destinationTimezone ? {
        timezone: destinationTimezone,
        abbreviation: getTimezoneAbbreviation(destinationTimezone, arrivalTime),
        displayTime: formatWithTimezone(arrivalTime, destinationTimezone, 'MMM d, h:mm a'),
        nextDay: outboundFlight.segments[0].timezoneInfo?.nextDay || false
      } : undefined;
      
      const flightItem: ItineraryItem = {
        id: outboundFlight.id,
        type: 'flight',
        name: `Flight to ${extractCityName(destination)}`,
        description: `Departure flight with ${outboundFlight.segments[0].airline}`,
        startTime: outboundFlight.segments[0].departure.time,
        endTime: outboundFlight.segments[0].arrival.time,
        location: outboundFlight.segments[0].arrival.airport.name,
        price: outboundFlight.price.amount,
        currency: outboundFlight.price.currency,
        status: 'suggested',
        source: 'ai',
        metadata: outboundFlight,
        timezoneInfo: arrivalTimezoneInfo,
        dayIndex: 0
      };
      
      
      
      itineraryItems.push(flightItem);
      itineraryDays[0].items.push(flightItem);
    }
    
    // Add hotel check-in (Day 1, after flight arrival + buffer)
    if (hotel && arrivalTime) {
      // Hotel check-in should be after flight arrival with minimum 2-hour buffer
      const earliestCheckIn = addMinutes(arrivalTime, 120);
      const standardCheckIn = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 15, 0, 0);
      const checkInTime = isAfter(earliestCheckIn, standardCheckIn) ? earliestCheckIn : standardCheckIn;
      const checkOutTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 11, 0, 0);
      
      const hotelTimezoneInfo = destinationTimezone ? {
        timezone: destinationTimezone,
        abbreviation: getTimezoneAbbreviation(destinationTimezone, checkInTime),
        displayTime: formatWithTimezone(checkInTime, destinationTimezone, 'MMM d, h:mm a'),
        nextDay: false
      } : undefined;
      
      const hotelItem: ItineraryItem = {
        id: hotel.id,
        type: 'hotel',
        name: `Check-in at ${hotel.name}`,
        description: `${hotel.starRating}-star accommodation`,
        startTime: checkInTime.toISOString(),
        endTime: checkOutTime.toISOString(),
        location: hotel.location.address,
        price: hotel.price.amount,
        currency: hotel.price.currency,
        status: 'suggested',
        source: 'ai',
        metadata: hotel,
        timezoneInfo: hotelTimezoneInfo,
        dayIndex: 0
      };
      
      
      
      itineraryItems.push(hotelItem);
      itineraryDays[0].items.push(hotelItem);
    }
    
    // Add return flight (Last day)
    if (returnFlight && departureTime) {
      const returnDepartureTimezoneInfo = destinationTimezone ? {
        timezone: destinationTimezone,
        abbreviation: getTimezoneAbbreviation(destinationTimezone, departureTime),
        displayTime: formatWithTimezone(departureTime, destinationTimezone, 'MMM d, h:mm a'),
        nextDay: false
      } : undefined;
      
      const returnArrivalTimezoneInfo = originTimezone ? {
        timezone: originTimezone,
        abbreviation: getTimezoneAbbreviation(originTimezone, new Date(returnFlight.segments[0].arrival.time)),
        displayTime: formatWithTimezone(new Date(returnFlight.segments[0].arrival.time), originTimezone, 'MMM d, h:mm a'),
        nextDay: returnFlight.segments[0].timezoneInfo?.nextDay || false
      } : undefined;
      
      const returnFlightItem: ItineraryItem = {
        id: returnFlight.id,
        type: 'flight',
        name: `Return flight to ${extractCityName(departureLocation)}`,
        description: `Return flight with ${returnFlight.segments[0].airline}`,
        startTime: returnFlight.segments[0].departure.time,
        endTime: returnFlight.segments[0].arrival.time,
        location: returnFlight.segments[0].arrival.airport.name,
        price: returnFlight.price.amount,
        currency: returnFlight.price.currency,
        status: 'suggested',
        source: 'ai',
        metadata: returnFlight,
        timezoneInfo: returnArrivalTimezoneInfo,
        dayIndex: durationDays - 1
      };
      
      
      
      itineraryItems.push(returnFlightItem);
      itineraryDays[durationDays - 1].items.push(returnFlightItem);
    }
    
    // Phase 4: Distribute Activities Across All Days
    console.log('🎯 Phase 4: Distributing activities across all days...');
    
    // Calculate activities per day (focus on middle days)
    const middleDays = Math.max(0, durationDays - 2); // Exclude first and last day
    const activitiesPerDay = Math.max(2, Math.min(4, Math.floor(activities.length / Math.max(1, durationDays))));
    
    console.log('📊 Activity distribution:', {
      totalActivities: activities.length,
      durationDays,
      middleDays,
      activitiesPerDay
    });
    
    // Distribute activities with AI guidance
    let activityIndex = 0;
    for (let dayIndex = 0; dayIndex < durationDays; dayIndex++) {
      const currentDay = itineraryDays[dayIndex];
      const isFirstDay = dayIndex === 0;
      const isLastDay = dayIndex === durationDays - 1;
      
      // Determine how many activities for this day
      let dayActivities = 0;
      if (isFirstDay) {
        dayActivities = arrivalTime && isAfter(arrivalTime, new Date(start.getTime() + 14 * 60 * 60 * 1000)) ? 0 : 1; // If arriving late, no activities
      } else if (isLastDay) {
        dayActivities = departureTime && isBefore(departureTime, new Date(end.getTime() + 10 * 60 * 60 * 1000)) ? 1 : 2; // If departing early, fewer activities
      } else {
        dayActivities = activitiesPerDay;
      }
      
      // Add activities for this day
      for (let i = 0; i < dayActivities && activityIndex < activities.length; i++) {
        const activity = activities[activityIndex];
        
                 // Calculate activity timing
         const baseTime = isFirstDay && arrivalTime ? 
           addMinutes(arrivalTime, 180) : // 3 hours after arrival
           new Date(currentDay.date.getTime() + (9 + i * 3) * 60 * 60 * 1000); // 9 AM, 12 PM, 3 PM, etc.
         
         // Extract duration from activity object (convert to minutes)
         const activityDurationMinutes = activity.duration ? 
           (activity.duration.unit === 'hours' ? activity.duration.value * 60 : activity.duration.value * 60 * 24) : 
           180; // 3 hours default
         const endTime = addMinutes(baseTime, activityDurationMinutes);
        
        const activityTimezoneInfo = destinationTimezone ? {
          timezone: destinationTimezone,
          abbreviation: getTimezoneAbbreviation(destinationTimezone, baseTime),
          displayTime: formatWithTimezone(baseTime, destinationTimezone, 'MMM d, h:mm a'),
          nextDay: false
        } : undefined;
        
        const activityItem: ItineraryItem = {
          id: `${activity.id}-day${dayIndex}`,
          type: 'activity',
          name: activity.name,
          description: activity.shortDescription || 'Recommended activity',
          startTime: baseTime.toISOString(),
          endTime: endTime.toISOString(),
          location: activity.location?.address || destinationCity,
          price: activity.price?.amount || 0,
          currency: activity.price?.currency || 'USD',
          status: 'suggested',
          source: 'ai',
          metadata: activity,
          timezoneInfo: activityTimezoneInfo,
          dayIndex
        };
        

        
        itineraryItems.push(activityItem);
        currentDay.items.push(activityItem);
        activityIndex++;
      }
      

    }
    
    // Phase 5: Final Sorting and Validation
    console.log('✅ Phase 5: Final sorting and validation...');
    
    // Sort all items by start time to ensure chronological order
    const sortedItems = sortItineraryItemsJSON(itineraryItems);
    
    // Validate logical dependencies
    let previousFlightArrival: Date | null = null;
    let hotelCheckIn: Date | null = null;
    
    for (const item of sortedItems) {
      const itemStartTime = new Date(item.startTime);
      
      if (item.type === 'flight' && item.name.includes('to ')) {
        previousFlightArrival = new Date(item.endTime);
      } else if (item.type === 'hotel' && previousFlightArrival) {
        hotelCheckIn = itemStartTime;
        if (isBefore(hotelCheckIn, previousFlightArrival)) {
          console.warn('⚠️ Hotel check-in scheduled before flight arrival - this should not happen');
        }
      }
    }
    
    console.log('🎉 AI-powered itinerary generation completed:', {
      totalItems: sortedItems.length,
      daysPopulated: new Set(sortedItems.map(item => item.dayIndex)).size,
      totalCost: sortedItems.reduce((sum, item) => sum + item.price, 0)
    });
    
    return sortedItems;
    
  } catch (error) {
    console.error('Error in AI itinerary generation:', error);
    throw error;
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
    
    // Group items by day index to create day-by-day structure
    const durationDays = Math.ceil((new Date(travelDetails.endDate).getTime() - new Date(travelDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const days: DayResponse[] = [];
    
    // Initialize days array
    for (let i = 0; i < durationDays; i++) {
      const dayDate = new Date(travelDetails.startDate);
      dayDate.setDate(dayDate.getDate() + i);
      
      days.push({
        date: dayDate.toISOString().split('T')[0],
        items: items.filter(item => item.dayIndex === i).sort((a: ItineraryItem, b: ItineraryItem) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
      });
    }
    
    // Add any items without dayIndex to the appropriate day based on startTime
    const itemsWithoutDayIndex = items.filter(item => item.dayIndex === undefined);
    itemsWithoutDayIndex.forEach((item: ItineraryItem) => {
      const itemDate = new Date(item.startTime);
      const startDate = new Date(travelDetails.startDate);
      const dayIndex = Math.floor((itemDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayIndex >= 0 && dayIndex < days.length) {
        days[dayIndex].items.push(item);
        days[dayIndex].items.sort((a: ItineraryItem, b: ItineraryItem) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      }
    });
    
    const totalCost = items.reduce((sum, item) => sum + item.price, 0);
    
    console.log('Successfully generated AI-powered itinerary:', {
      itemsGenerated: items.length,
      daysPopulated: days.filter(day => day.items.length > 0).length,
      totalDays: days.length,
      totalCost,
      destination: travelDetails.destination
    });
    

    
    return NextResponse.json({
      success: true,
      data: {
        items, // Keep flat list for backward compatibility
        days, // New day-by-day structure
        totalCost,
        currency: 'USD',
        destination: travelDetails.destination,
        duration: durationDays,
        travelers: travelDetails.travelers,
        aiGenerated: true // Flag to indicate AI-powered generation
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