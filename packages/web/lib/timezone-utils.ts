/**
 * Timezone Utilities for TravelAgentic
 * Handles timezone conversions for flights and itinerary generation
 * Maps airports to their respective timezones and provides conversion utilities
 */

import { addHours, format, parseISO } from 'date-fns';

/**
 * Airport to timezone mapping
 * Using IANA timezone identifiers for accurate timezone handling
 */
export const AIRPORT_TIMEZONES: Record<string, string> = {
  // United States
  'JFK': 'America/New_York',      // UTC-5/-4
  'LGA': 'America/New_York',      // UTC-5/-4
  'EWR': 'America/New_York',      // UTC-5/-4
  'BOS': 'America/New_York',      // UTC-5/-4
  'DCA': 'America/New_York',      // UTC-5/-4
  'BWI': 'America/New_York',      // UTC-5/-4
  'IAD': 'America/New_York',      // UTC-5/-4
  'PHL': 'America/New_York',      // UTC-5/-4
  'ATL': 'America/New_York',      // UTC-5/-4
  'CLT': 'America/New_York',      // UTC-5/-4
  'MIA': 'America/New_York',      // UTC-5/-4
  'FLL': 'America/New_York',      // UTC-5/-4
  'MCO': 'America/New_York',      // UTC-5/-4
  'TPA': 'America/New_York',      // UTC-5/-4
  'BNA': 'America/Chicago',       // UTC-6/-5
  'ORD': 'America/Chicago',       // UTC-6/-5
  'MDW': 'America/Chicago',       // UTC-6/-5
  'MSP': 'America/Chicago',       // UTC-6/-5
  'DTW': 'America/New_York',      // UTC-5/-4
  'STL': 'America/Chicago',       // UTC-6/-5
  'MCI': 'America/Chicago',       // UTC-6/-5
  'OKC': 'America/Chicago',       // UTC-6/-5
  'MSY': 'America/Chicago',       // UTC-6/-5
  'HOU': 'America/Chicago',       // UTC-6/-5
  'IAH': 'America/Chicago',       // UTC-6/-5
  'DFW': 'America/Chicago',       // UTC-6/-5
  'SAT': 'America/Chicago',       // UTC-6/-5
  'AUS': 'America/Chicago',       // UTC-6/-5
  'DEN': 'America/Denver',        // UTC-7/-6
  'SLC': 'America/Denver',        // UTC-7/-6
  'PHX': 'America/Phoenix',       // UTC-7 (no DST)
  'TUS': 'America/Phoenix',       // UTC-7 (no DST)
  'LAS': 'America/Los_Angeles',   // UTC-8/-7
  'LAX': 'America/Los_Angeles',   // UTC-8/-7
  'SFO': 'America/Los_Angeles',   // UTC-8/-7
  'SJC': 'America/Los_Angeles',   // UTC-8/-7
  'OAK': 'America/Los_Angeles',   // UTC-8/-7
  'SAN': 'America/Los_Angeles',   // UTC-8/-7
  'PDX': 'America/Los_Angeles',   // UTC-8/-7
  'SEA': 'America/Los_Angeles',   // UTC-8/-7
  'ANC': 'America/Anchorage',     // UTC-9/-8
  'HNL': 'Pacific/Honolulu',      // UTC-10 (no DST)
  
  // Canada
  'YYZ': 'America/Toronto',       // UTC-5/-4
  'YOW': 'America/Toronto',       // UTC-5/-4
  'YUL': 'America/Montreal',      // UTC-5/-4
  'YHZ': 'America/Halifax',       // UTC-4/-3
  'YWG': 'America/Winnipeg',      // UTC-6/-5
  'YQR': 'America/Regina',        // UTC-6 (no DST)
  'YYC': 'America/Edmonton',      // UTC-7/-6
  'YEG': 'America/Edmonton',      // UTC-7/-6
  'YVR': 'America/Vancouver',     // UTC-8/-7
  
  // Europe
  'LHR': 'Europe/London',         // UTC+0/+1
  'LGW': 'Europe/London',         // UTC+0/+1
  'STN': 'Europe/London',         // UTC+0/+1
  'CDG': 'Europe/Paris',          // UTC+1/+2
  'ORY': 'Europe/Paris',          // UTC+1/+2
  'FRA': 'Europe/Berlin',         // UTC+1/+2
  'MUC': 'Europe/Berlin',         // UTC+1/+2
  'TXL': 'Europe/Berlin',         // UTC+1/+2
  'AMS': 'Europe/Amsterdam',      // UTC+1/+2
  'MAD': 'Europe/Madrid',         // UTC+1/+2
  'BCN': 'Europe/Madrid',         // UTC+1/+2
  'FCO': 'Europe/Rome',           // UTC+1/+2
  'MXP': 'Europe/Rome',           // UTC+1/+2
  'ZUR': 'Europe/Zurich',         // UTC+1/+2
  'VIE': 'Europe/Vienna',         // UTC+1/+2
  'CPH': 'Europe/Copenhagen',     // UTC+1/+2
  'ARN': 'Europe/Stockholm',      // UTC+1/+2
  'OSL': 'Europe/Oslo',           // UTC+1/+2
  'HEL': 'Europe/Helsinki',       // UTC+2/+3
  'ATH': 'Europe/Athens',         // UTC+2/+3
  'IST': 'Europe/Istanbul',       // UTC+3
  'SVO': 'Europe/Moscow',         // UTC+3
  
  // Asia
  'NRT': 'Asia/Tokyo',            // UTC+9
  'HND': 'Asia/Tokyo',            // UTC+9
  'KIX': 'Asia/Tokyo',            // UTC+9
  'ICN': 'Asia/Seoul',            // UTC+9
  'PEK': 'Asia/Shanghai',         // UTC+8
  'PVG': 'Asia/Shanghai',         // UTC+8
  'CAN': 'Asia/Shanghai',         // UTC+8
  'HKG': 'Asia/Hong_Kong',        // UTC+8
  'TPE': 'Asia/Taipei',           // UTC+8
  'SIN': 'Asia/Singapore',        // UTC+8
  'KUL': 'Asia/Kuala_Lumpur',     // UTC+8
  'BKK': 'Asia/Bangkok',          // UTC+7
  'CGK': 'Asia/Jakarta',          // UTC+7
  'MNL': 'Asia/Manila',           // UTC+8
  'DEL': 'Asia/Kolkata',          // UTC+5:30
  'BOM': 'Asia/Kolkata',          // UTC+5:30
  'MAA': 'Asia/Kolkata',          // UTC+5:30
  'BLR': 'Asia/Kolkata',          // UTC+5:30
  'DXB': 'Asia/Dubai',            // UTC+4
  'DOH': 'Asia/Qatar',            // UTC+3
  'KWI': 'Asia/Kuwait',           // UTC+3
  'RUH': 'Asia/Riyadh',           // UTC+3
  'CAI': 'Africa/Cairo',          // UTC+2
  'JED': 'Asia/Riyadh',           // UTC+3
  
  // Australia & Oceania
  'SYD': 'Australia/Sydney',      // UTC+10/+11
  'MEL': 'Australia/Melbourne',   // UTC+10/+11
  'BNE': 'Australia/Brisbane',    // UTC+10
  'PER': 'Australia/Perth',       // UTC+8
  'ADL': 'Australia/Adelaide',    // UTC+9:30/+10:30
  'DRW': 'Australia/Darwin',      // UTC+9:30
  'AKL': 'Pacific/Auckland',      // UTC+12/+13
  'CHC': 'Pacific/Auckland',      // UTC+12/+13
  'NOU': 'Pacific/Noumea',        // UTC+11
  'PPT': 'Pacific/Tahiti',        // UTC-10
  'NAN': 'Pacific/Fiji',          // UTC+12/+13
  
  // South America
  'GRU': 'America/Sao_Paulo',     // UTC-3
  'GIG': 'America/Sao_Paulo',     // UTC-3
  'BSB': 'America/Sao_Paulo',     // UTC-3
  'EZE': 'America/Argentina/Buenos_Aires', // UTC-3
  'SCL': 'America/Santiago',      // UTC-4/-3
  'LIM': 'America/Lima',          // UTC-5
  'BOG': 'America/Bogota',        // UTC-5
  'CCS': 'America/Caracas',       // UTC-4
  'UIO': 'America/Guayaquil',     // UTC-5
  
  // Africa
  'JNB': 'Africa/Johannesburg',   // UTC+2
  'CPT': 'Africa/Johannesburg',   // UTC+2
  'LOS': 'Africa/Lagos',          // UTC+1
  'ACC': 'Africa/Accra',          // UTC+0
  'CAS': 'Africa/Casablanca',     // UTC+1
  'ALG': 'Africa/Algiers',        // UTC+1
  'TUN': 'Africa/Tunis',          // UTC+1
  'ADD': 'Africa/Addis_Ababa',    // UTC+3
  'NBO': 'Africa/Nairobi',        // UTC+3
  
  // Mexico & Central America
  'MEX': 'America/Mexico_City',   // UTC-6/-5
  'CUN': 'America/Cancun',        // UTC-5
  'GDL': 'America/Mexico_City',   // UTC-6/-5
  'SJO': 'America/Costa_Rica',    // UTC-6
  'GUA': 'America/Guatemala',     // UTC-6
  'PTY': 'America/Panama',        // UTC-5
};

/**
 * Get timezone for an airport code
 * @param airportCode - IATA airport code
 * @returns IANA timezone identifier or null if not found
 */
export function getAirportTimezone(airportCode: string): string | null {
  return AIRPORT_TIMEZONES[airportCode.toUpperCase()] || null;
}

/**
 * Get timezone offset in hours from UTC
 * @param timezone - IANA timezone identifier
 * @param date - Date to get offset for (considers DST)
 * @returns Offset in hours (negative for behind UTC, positive for ahead)
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): number {
  try {
    // Create date in UTC and in the specified timezone
    const utcDate = new Date(date.toISOString().slice(0, -1) + 'Z');
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    
    // Calculate the difference in minutes, then convert to hours
    const offsetMinutes = (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
    return -offsetMinutes / 60; // Negative because we want the offset from UTC
  } catch (error) {
    console.error(`Error calculating timezone offset for ${timezone}:`, error);
    return 0;
  }
}

/**
 * Convert a datetime from one timezone to another
 * @param dateTime - ISO datetime string or Date object
 * @param fromTimezone - Source timezone (IANA identifier)
 * @param toTimezone - Target timezone (IANA identifier)
 * @returns Date object in the target timezone
 */
export function convertTimezone(
  dateTime: string | Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  try {
    const date = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime;
    
    // Get offset differences
    const fromOffset = getTimezoneOffset(fromTimezone, date);
    const toOffset = getTimezoneOffset(toTimezone, date);
    
    // Calculate the difference in hours
    const hoursDiff = toOffset - fromOffset;
    
    // Add the difference to the date
    return addHours(date, hoursDiff);
  } catch (error) {
    console.error('Error converting timezone:', error);
    return typeof dateTime === 'string' ? parseISO(dateTime) : dateTime;
  }
}

/**
 * Format a date with timezone information
 * @param date - Date to format
 * @param timezone - IANA timezone identifier
 * @param formatStr - Format string (date-fns format)
 * @returns Formatted date string with timezone
 */
export function formatWithTimezone(
  date: Date,
  timezone: string,
  formatStr: string = 'yyyy-MM-dd HH:mm'
): string {
  try {
    // Convert to the specified timezone
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return format(localDate, formatStr);
  } catch (error) {
    console.error('Error formatting date with timezone:', error);
    return format(date, formatStr);
  }
}

/**
 * Calculate flight arrival time considering timezone differences
 * @param departureTime - Departure time in departure timezone
 * @param flightDurationMinutes - Flight duration in minutes
 * @param originAirport - Departure airport code
 * @param destinationAirport - Arrival airport code
 * @returns Object with arrival time and timezone information
 */
export function calculateFlightArrival(
  departureTime: string | Date,
  flightDurationMinutes: number,
  originAirport: string,
  destinationAirport: string
): {
  arrivalTime: Date;
  arrivalTimezone: string;
  departureTimezone: string;
  timezoneChange: number;
  nextDay: boolean;
} {
  const departureTimezone = getAirportTimezone(originAirport);
  const arrivalTimezone = getAirportTimezone(destinationAirport);
  
  if (!departureTimezone || !arrivalTimezone) {
    throw new Error(`Timezone not found for airports: ${originAirport} or ${destinationAirport}`);
  }
  
  const depTime = typeof departureTime === 'string' ? parseISO(departureTime) : departureTime;
  
  // Add flight duration to departure time
  const arrivalInDepartureTimezone = addHours(depTime, flightDurationMinutes / 60);
  
  // Convert to arrival timezone
  const arrivalTime = convertTimezone(arrivalInDepartureTimezone, departureTimezone, arrivalTimezone);
  
  // Calculate timezone change
  const depOffset = getTimezoneOffset(departureTimezone, depTime);
  const arrOffset = getTimezoneOffset(arrivalTimezone, arrivalTime);
  const timezoneChange = arrOffset - depOffset;
  
  // Check if arrival is next day compared to departure
  const depDate = new Date(depTime.toDateString());
  const arrDate = new Date(arrivalTime.toDateString());
  const nextDay = arrDate.getTime() > depDate.getTime();
  
  return {
    arrivalTime,
    arrivalTimezone,
    departureTimezone,
    timezoneChange,
    nextDay
  };
}

/**
 * Get timezone abbreviation for display
 * @param timezone - IANA timezone identifier
 * @param date - Date to get abbreviation for (considers DST)
 * @returns Timezone abbreviation (e.g., 'EST', 'PST', 'GMT')
 */
export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName');
    return timeZoneName?.value || timezone;
  } catch (error) {
    console.error(`Error getting timezone abbreviation for ${timezone}:`, error);
    return timezone;
  }
}

/**
 * Create a timezone-aware datetime string for API responses
 * @param date - Date object
 * @param timezone - IANA timezone identifier
 * @returns ISO string with timezone offset
 */
export function createTimezoneAwareISOString(date: Date, timezone: string): string {
  try {
    const offset = getTimezoneOffset(timezone, date);
    const offsetHours = Math.floor(Math.abs(offset));
    const offsetMinutes = Math.abs(offset) % 1 * 60;
    const offsetSign = offset >= 0 ? '+' : '-';
    
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const isoString = localDate.toISOString().slice(0, -1); // Remove the Z
    
    return `${isoString}${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error creating timezone-aware ISO string:', error);
    return date.toISOString();
  }
}

/**
 * Example usage demonstrating Hawaii to Texas flight calculation
 */
export function exampleHawaiiToTexas(): void {
  // Hawaii (GMT-10) at 12:00 PM, 10 hour flight to Texas (GMT-5)
  const departureTime = new Date('2024-12-20T12:00:00'); // 12:00 PM in Hawaii
  const flightDuration = 10 * 60; // 10 hours in minutes
  
  const result = calculateFlightArrival(departureTime, flightDuration, 'HNL', 'DFW');
  
  console.log('Hawaii to Texas Flight Example:');
  console.log(`Departure: ${formatWithTimezone(departureTime, 'Pacific/Honolulu', 'yyyy-MM-dd HH:mm')} HST`);
  console.log(`Arrival: ${formatWithTimezone(result.arrivalTime, 'America/Chicago', 'yyyy-MM-dd HH:mm')} CST`);
  console.log(`Next day arrival: ${result.nextDay}`);
  console.log(`Timezone change: ${result.timezoneChange} hours`);
} 