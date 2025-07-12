/**
 * Test demonstration for Duration and Scheduling functionality
 * Shows how the new intelligent scheduling system works with realistic durations and travel times
 */

import { 
  DurationEstimator, 
  DistanceCalculator, 
  IntelligentScheduler, 
  DurationUtils,
  ActivityType 
} from './duration-scheduling-utils';

/**
 * Test duration estimation for different activity types
 */
export function testDurationEstimation() {
  console.log('🎯 Testing Duration Estimation System');
  console.log('=' .repeat(50));
  
  const activityTypes = [
    ActivityType.SIGHTSEEING,
    ActivityType.MUSEUM,
    ActivityType.OUTDOOR,
    ActivityType.ADVENTURE,
    ActivityType.FOOD,
    ActivityType.SHOPPING
  ];
  
  console.log('Duration estimates for different activity types (group of 2):');
  activityTypes.forEach(type => {
    const duration = DurationEstimator.getActivityDuration(type, 2);
    console.log(`  ${type.padEnd(15)}: ${duration.description} (${duration.minimum}-${duration.maximum} min)`);
  });
  
  console.log('\nDuration adjustment for larger groups:');
  const testType = ActivityType.MUSEUM;
  [2, 4, 6].forEach(groupSize => {
    const duration = DurationEstimator.getActivityDuration(testType, groupSize);
    console.log(`  Group of ${groupSize}: ${duration.description}`);
  });
}

/**
 * Test distance calculation and travel time estimation
 */
export function testDistanceCalculation() {
  console.log('\n🗺️  Testing Distance and Travel Time Calculation');
  console.log('=' .repeat(50));
  
  const locations = [
    { name: 'Times Square', lat: 40.7589, lon: -73.9851 },
    { name: 'Central Park', lat: 40.7829, lon: -73.9654 },
    { name: 'Empire State Building', lat: 40.7484, lon: -73.9857 },
    { name: 'Brooklyn Bridge', lat: 40.7061, lon: -73.9969 }
  ];
  
  console.log('Distances and travel times in New York City:');
  
  for (let i = 0; i < locations.length - 1; i++) {
    const from = locations[i];
    const to = locations[i + 1];
    
    const distance = DistanceCalculator.calculateDistance(
      from.lat, from.lon, to.lat, to.lon
    );
    
    const fromLocation = {
      name: from.name,
      coordinates: { latitude: from.lat, longitude: from.lon },
      type: 'activity' as const
    };
    
    const toLocation = {
      name: to.name,
      coordinates: { latitude: to.lat, longitude: to.lon },
      type: 'activity' as const
    };
    
    const travel = DistanceCalculator.estimateTravel(fromLocation, toLocation);
    
    console.log(`  ${from.name} → ${to.name}:`);
    console.log(`    Distance: ${distance.toFixed(2)} km`);
    console.log(`    Travel: ${travel.duration} min by ${travel.method}`);
    console.log(`    Cost: ${travel.cost ? `$${travel.cost.toFixed(0)}` : 'Free'}`);
  }
}

/**
 * Test intelligent scheduling with a sample itinerary
 */
export function testIntelligentScheduling() {
  console.log('\n🤖 Testing Intelligent Scheduling System');
  console.log('=' .repeat(50));
  
  // Sample activities for a day in New York
  const sampleItems = [
    {
      id: 'arrival-flight',
      type: 'flight' as const,
      name: 'Arrival Flight from LAX',
      description: 'Cross-country flight',
      location: {
        name: 'JFK Airport',
        coordinates: { latitude: 40.6413, longitude: -73.7781 },
        type: 'airport' as const
      },
      fixedTime: new Date('2024-12-20T14:30:00'), // 2:30 PM arrival
      metadata: { totalDuration: 320 } // 5 hours 20 minutes
    },
    {
      id: 'hotel-checkin',
      type: 'hotel' as const,
      name: 'Hotel Check-in',
      description: 'Midtown Manhattan Hotel',
      location: {
        name: 'Times Square Hotel',
        coordinates: { latitude: 40.7589, longitude: -73.9851 },
        type: 'hotel' as const
      },
      metadata: {}
    },
    {
      id: 'times-square',
      type: 'activity' as const,
      name: 'Times Square Exploration',
      description: 'Iconic NYC landmark',
      location: {
        name: 'Times Square',
        coordinates: { latitude: 40.7589, longitude: -73.9851 },
        type: 'activity' as const
      },
      categories: ['sightseeing', 'cultural'],
      metadata: {}
    },
    {
      id: 'central-park',
      type: 'activity' as const,
      name: 'Central Park Visit',
      description: 'Walk through the famous park',
      location: {
        name: 'Central Park',
        coordinates: { latitude: 40.7829, longitude: -73.9654 },
        type: 'activity' as const
      },
      categories: ['outdoor', 'relaxation'],
      metadata: {}
    },
    {
      id: 'dinner',
      type: 'activity' as const,
      name: 'Dinner at Little Italy',
      description: 'Authentic Italian cuisine',
      location: {
        name: 'Little Italy Restaurant',
        coordinates: { latitude: 40.7193, longitude: -73.9969 },
        type: 'activity' as const
      },
      categories: ['food', 'cultural'],
      metadata: {}
    }
  ];
  
  console.log('Scheduling activities with intelligent spacing...');
  
  const scheduledItems = IntelligentScheduler.scheduleItems(
    sampleItems,
    new Date('2024-12-20T08:00:00'),
    2 // group of 2
  );
  
  console.log('\nOptimized Schedule:');
  console.log('─'.repeat(80));
  
  scheduledItems.forEach((item, index) => {
    const startTime = item.startTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = item.endTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    console.log(`${index + 1}. ${item.name}`);
    console.log(`   ⏰ ${startTime} - ${endTime} (${item.duration.description})`);
    console.log(`   📍 ${item.location.name}`);
    
    if (item.travelToNext) {
      const travel = item.travelToNext;
      const method = travel.method === 'walking' ? '🚶' : 
                    travel.method === 'taxi' ? '🚕' : 
                    travel.method === 'public_transport' ? '🚌' : '🚗';
      const cost = travel.cost ? ` ($${travel.cost.toFixed(0)})` : '';
      console.log(`   ${method} ${travel.duration}min to next location (${travel.distance.toFixed(1)}km)${cost}`);
    }
    
    if (item.bufferAfter && item.bufferAfter > 0) {
      console.log(`   ⏱️  ${DurationUtils.formatMinutes(item.bufferAfter)} buffer time`);
    }
    
    console.log('');
  });
  
  const totalDuration = DurationUtils.calculateTotalDuration(scheduledItems);
  console.log(`Total itinerary duration: ${DurationUtils.formatMinutes(totalDuration)}`);
  console.log(`Schedule efficiency: ${((scheduledItems.length * 120) / totalDuration * 100).toFixed(1)}%`);
}

/**
 * Test the hotel buffet scenario mentioned by the user
 */
export function testHotelBuffetScenario() {
  console.log('\n🏨 Testing Hotel-Buffet Scenario (Close Proximity)');
  console.log('=' .repeat(50));
  
  const hotelLocation = {
    name: 'Resort Hotel',
    coordinates: { latitude: 25.7617, longitude: -80.1918 },
    type: 'hotel' as const
  };
  
  const buffetLocation = {
    name: 'Hotel Buffet Restaurant',
    coordinates: { latitude: 25.7620, longitude: -80.1920 }, // Very close - same building
    type: 'activity' as const
  };
  
  const travel = DistanceCalculator.estimateTravel(hotelLocation, buffetLocation);
  
  console.log('Scenario: Hotel check-in followed by buffet at same hotel');
  console.log(`Distance: ${(travel.distance * 1000).toFixed(0)} meters`);
  console.log(`Travel time: ${travel.duration} minutes`);
  console.log(`Method: ${travel.method}`);
  console.log(`Buffer time would be: ${Math.max(5, 15 + travel.duration)} minutes total`);
  
  console.log('\nComparison with distant restaurant:');
  const distantRestaurant = {
    name: 'Downtown Restaurant',
    coordinates: { latitude: 25.7753, longitude: -80.1977 }, // ~2km away
    type: 'activity' as const
  };
  
  const distantTravel = DistanceCalculator.estimateTravel(hotelLocation, distantRestaurant);
  console.log(`Distance: ${distantTravel.distance.toFixed(1)} km`);
  console.log(`Travel time: ${distantTravel.duration} minutes`);
  console.log(`Method: ${distantTravel.method}`);
  console.log(`Buffer time would be: ${Math.max(5, 15 + distantTravel.duration)} minutes total`);
}

/**
 * Run all duration and scheduling tests
 */
export function runDurationSchedulingTests() {
  testDurationEstimation();
  testDistanceCalculation();
  testIntelligentScheduling();
  testHotelBuffetScenario();
  
  console.log('\n✅ Duration and Scheduling testing complete!');
  console.log('The system now provides:');
  console.log('  • Realistic activity durations based on type and group size');
  console.log('  • Distance-based travel time calculations');
  console.log('  • Intelligent scheduling with appropriate buffers');
  console.log('  • Minimal spacing for nearby locations');
  console.log('  • Travel cost estimation and method selection');
} 