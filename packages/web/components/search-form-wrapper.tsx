'use client';

import { TravelInputForm } from '@/components/travel-input-form';
import type { TravelDetails } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';

/**
 * Client component wrapper for the travel form to handle user interactions
 * Separates client-side form handling from server-side search page
 */
export function SearchFormWrapper() {
  const router = useRouter();

  const handleSubmit = (details: TravelDetails) => {
    // Handle new search submission by redirecting to search page
    if (!details.startDate || !details.endDate) return;
    
    const params = new URLSearchParams({
      origin: details.departureLocation,
      destination: details.destination,
      departureDate: details.startDate.toISOString().split('T')[0],
      returnDate: details.endDate.toISOString().split('T')[0],
      passengers: details.travelers.toString(),
      cabin: 'economy',
      // Add flag to indicate this should use AI research
      useAI: 'true'
    });
    
    // Use Next.js router for navigation
    router.push(`/search?${params.toString()}`);
  };

  return <TravelInputForm onSubmit={handleSubmit} />;
} 