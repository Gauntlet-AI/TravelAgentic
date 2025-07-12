import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * JSON-based sorting utility for itinerary items
 * Sorts items chronologically by startTime using JSON serialization approach
 * @param items - Array of items to sort
 * @returns Sorted array of items
 */
export function sortItineraryItemsJSON<T extends { startTime: string | Date }>(items: T[]): T[] {
  // Create a copy of items to avoid modifying the original array
  const itemsCopy = [...items];
  
  // Sort using JSON comparison for consistent ordering
  return itemsCopy.sort((a, b) => {
    try {
      // Normalize startTime to ISO string for consistent comparison
      let aTime: string;
      let bTime: string;
      
      if (typeof a.startTime === 'string') {
        const dateA = new Date(a.startTime);
        if (isNaN(dateA.getTime())) {
          console.warn('Invalid date found in item A:', a);
          aTime = '1900-01-01T00:00:00.000Z'; // Use a very early date as fallback
        } else {
          aTime = dateA.toISOString();
        }
      } else {
        if (isNaN(a.startTime.getTime())) {
          console.warn('Invalid date object found in item A:', a);
          aTime = '1900-01-01T00:00:00.000Z'; // Use a very early date as fallback
        } else {
          aTime = a.startTime.toISOString();
        }
      }
      
      if (typeof b.startTime === 'string') {
        const dateB = new Date(b.startTime);
        if (isNaN(dateB.getTime())) {
          console.warn('Invalid date found in item B:', b);
          bTime = '1900-01-01T00:00:00.000Z'; // Use a very early date as fallback
        } else {
          bTime = dateB.toISOString();
        }
      } else {
        if (isNaN(b.startTime.getTime())) {
          console.warn('Invalid date object found in item B:', b);
          bTime = '1900-01-01T00:00:00.000Z'; // Use a very early date as fallback
        } else {
          bTime = b.startTime.toISOString();
        }
      }
      
      // Use JSON.stringify for consistent comparison
      const aKey = JSON.stringify(aTime);
      const bKey = JSON.stringify(bTime);
      
      if (aKey < bKey) return -1;
      if (aKey > bKey) return 1;
      return 0;
    } catch (error) {
      console.error('Error in sortItineraryItemsJSON:', error);
      console.error('Problem items:', { a, b });
      // Return 0 to maintain relative order if sorting fails
      return 0;
    }
  });
}

/**
 * JSON-based sorting configuration for complex sorting scenarios
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  type: 'string' | 'number' | 'date';
}

/**
 * Advanced JSON-based sorting with multiple criteria
 * @param items - Array of items to sort
 * @param sortConfig - Sorting configuration
 * @returns Sorted array of items
 */
export function sortByConfigJSON<T extends Record<string, any>>(
  items: T[], 
  sortConfig: SortConfig[]
): T[] {
  return items.sort((a, b) => {
    for (const config of sortConfig) {
      const aValue = a[config.field];
      const bValue = b[config.field];
      
      let comparison = 0;
      
      // Use JSON serialization for consistent comparison
      if (config.type === 'date') {
        const aDate = new Date(aValue).toISOString();
        const bDate = new Date(bValue).toISOString();
        const aJson = JSON.stringify(aDate);
        const bJson = JSON.stringify(bDate);
        
        if (aJson < bJson) comparison = -1;
        else if (aJson > bJson) comparison = 1;
      } else {
        const aJson = JSON.stringify(aValue);
        const bJson = JSON.stringify(bValue);
        
        if (aJson < bJson) comparison = -1;
        else if (aJson > bJson) comparison = 1;
      }
      
      if (comparison !== 0) {
        return config.direction === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
}
