/**
 * Test script demonstrating timezone-aware flight calculations
 * Example: Hawaii (GMT-10) to Texas (GMT-5) flight
 */

import { calculateFlightArrival, formatWithTimezone, getTimezoneAbbreviation } from './timezone-utils';

/**
 * Test the Hawaii to Texas example from the user's request
 */
export function testHawaiiToTexas() {
  console.log('🛫 Testing Hawaii to Texas Flight Timezone Calculation');
  console.log('=' .repeat(60));
  
  // Hawaii (HNL) at 12:00 PM, 10 hour flight to Texas (DFW)
  const departureTime = new Date('2024-12-20T12:00:00'); // 12:00 PM
  const flightDuration = 10 * 60; // 10 hours in minutes
  
  try {
    const result = calculateFlightArrival(
      departureTime, 
      flightDuration, 
      'HNL', // Hawaii - Honolulu
      'DFW'  // Texas - Dallas/Fort Worth
    );
    
    console.log('Flight Details:');
    console.log(`  Origin: Honolulu, Hawaii (HNL)`);
    console.log(`  Destination: Dallas, Texas (DFW)`);
    console.log(`  Flight Duration: ${flightDuration / 60} hours`);
    console.log('');
    
    console.log('Departure Information:');
    console.log(`  Local Time: ${formatWithTimezone(departureTime, 'Pacific/Honolulu', 'EEEE, MMMM d, yyyy \'at\' h:mm a')}`);
    console.log(`  Timezone: ${getTimezoneAbbreviation('Pacific/Honolulu', departureTime)} (GMT-10)`);
    console.log(`  UTC Time: ${departureTime.toISOString()}`);
    console.log('');
    
    console.log('Arrival Information:');
    console.log(`  Local Time: ${formatWithTimezone(result.arrivalTime, 'America/Chicago', 'EEEE, MMMM d, yyyy \'at\' h:mm a')}`);
    console.log(`  Timezone: ${getTimezoneAbbreviation('America/Chicago', result.arrivalTime)} (GMT-5)`);
    console.log(`  UTC Time: ${result.arrivalTime.toISOString()}`);
    console.log(`  Next Day Arrival: ${result.nextDay ? 'Yes' : 'No'}`);
    console.log('');
    
    console.log('Timezone Analysis:');
    console.log(`  Departure Timezone: ${result.departureTimezone}`);
    console.log(`  Arrival Timezone: ${result.arrivalTimezone}`);
    console.log(`  Timezone Difference: ${result.timezoneChange} hours`);
    console.log('');
    
    // Verify the calculation manually
    const expectedArrival = 'December 21, 2024 at 3:00 AM'; // Expected from user's example
    const actualArrival = formatWithTimezone(result.arrivalTime, 'America/Chicago', 'MMMM d, yyyy \'at\' h:mm a');
    
    console.log('Verification:');
    console.log(`  Expected (from user example): ${expectedArrival}`);
    console.log(`  Calculated: ${actualArrival}`);
    console.log(`  ✅ Calculation ${actualArrival.includes('3:00 AM') && result.nextDay ? 'CORRECT' : 'INCORRECT'}`);
    
  } catch (error) {
    console.error('❌ Error calculating flight arrival:', error);
  }
}

/**
 * Test additional timezone scenarios
 */
export function testAdditionalScenarios() {
  console.log('\n' + '🌍 Testing Additional Timezone Scenarios');
  console.log('=' .repeat(60));
  
  const scenarios = [
    {
      name: 'New York to London',
      origin: 'JFK',
      destination: 'LHR',
      departureTime: new Date('2024-12-20T14:00:00'), // 2:00 PM
      duration: 7 * 60, // 7 hours
    },
    {
      name: 'Los Angeles to Tokyo',
      origin: 'LAX',
      destination: 'NRT',
      departureTime: new Date('2024-12-20T11:00:00'), // 11:00 AM
      duration: 11 * 60, // 11 hours
    },
    {
      name: 'London to New York',
      origin: 'LHR',
      destination: 'JFK',
      departureTime: new Date('2024-12-20T10:00:00'), // 10:00 AM
      duration: 8 * 60, // 8 hours
    }
  ];
  
  scenarios.forEach((scenario, index) => {
    console.log(`\n${index + 1}. ${scenario.name}`);
    console.log('-' .repeat(40));
    
    try {
      const result = calculateFlightArrival(
        scenario.departureTime,
        scenario.duration,
        scenario.origin,
        scenario.destination
      );
      
      console.log(`   Departure: ${formatWithTimezone(scenario.departureTime, result.departureTimezone, 'MMM d, h:mm a')} (${getTimezoneAbbreviation(result.departureTimezone, scenario.departureTime)})`);
      console.log(`   Arrival: ${formatWithTimezone(result.arrivalTime, result.arrivalTimezone, 'MMM d, h:mm a')} (${getTimezoneAbbreviation(result.arrivalTimezone, result.arrivalTime)})`);
      console.log(`   Next Day: ${result.nextDay ? 'Yes' : 'No'}`);
      console.log(`   Timezone Change: ${result.timezoneChange > 0 ? '+' : ''}${result.timezoneChange} hours`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}

/**
 * Run all timezone tests
 */
export function runTimezoneTests() {
  testHawaiiToTexas();
  testAdditionalScenarios();
  
  console.log('\n' + '✅ Timezone testing complete!');
  console.log('You can now use these timezone utilities in your itinerary generation.');
} 