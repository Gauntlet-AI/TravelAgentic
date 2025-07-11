import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get user's current location based on IP address
 * Uses ipapi.co free service for geolocation
 */
export async function getCurrentLocation(): Promise<{
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
} | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    
    const data = await response.json();
    
    // Check if we got valid data
    if (data.error) {
      console.warn('IP geolocation error:', data.error);
      return null;
    }
    
    return {
      city: data.city || '',
      region: data.region || '',
      country: data.country_name || '',
      latitude: parseFloat(data.latitude) || 0,
      longitude: parseFloat(data.longitude) || 0,
      timezone: data.timezone || '',
    };
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
}

/**
 * Format location for display (e.g., "New York, NY" or "London, UK")
 */
export function formatLocationDisplay(location: {
  city: string;
  region: string;
  country: string;
}): string {
  if (!location.city && !location.region) {
    return location.country || 'Unknown Location';
  }
  
  if (location.city && location.region) {
    return `${location.city}, ${location.region}`;
  }
  
  return location.city || location.region || location.country || 'Unknown Location';
}
