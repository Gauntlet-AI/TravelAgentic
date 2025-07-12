/**
 * Itinerary View Page - Phase 4
 * Complete review and customization interface for itineraries
 * Supports natural language modifications, quick controls, and change tracking
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useItinerary } from '@/contexts/ItineraryContext';
import ItineraryReview from '@/components/itinerary/ItineraryReview';

export default function ItineraryViewPage() {
  const router = useRouter();
  const { state } = useItinerary();

  // Redirect if no itinerary data
  useEffect(() => {
    if (!state.travelDetails) {
      router.push('/');
    }
  }, [state.travelDetails, router]);

  // Phase 4: Use the comprehensive ItineraryReview component
  return <ItineraryReview />;
} 