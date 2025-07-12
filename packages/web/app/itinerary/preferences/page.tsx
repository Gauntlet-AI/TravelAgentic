/**
 * Activity Preferences Page
 * Dedicated page for activity preference selection during itinerary building
 * Integrates seamlessly with the real-time building process
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { ActivityPreferences } from '@/components/itinerary/ActivityPreferences';
import { ActivityType } from '@/components/itinerary/PreferenceCard';
import { useItinerary } from '@/contexts/ItineraryContext';

export default function PreferencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state } = useItinerary();
  
  const [isLoading, setIsLoading] = useState(true);
  const [travelDetails, setTravelDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract travel details from URL params or context
  useEffect(() => {
    try {
      // First try to get from URL params
      const destination = searchParams.get('destination');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const travelers = searchParams.get('travelers');

      if (destination && startDate && endDate && travelers) {
        setTravelDetails({
          destination,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          travelers: parseInt(travelers)
        });
      } else if (state.travelDetails) {
        // Fallback to context
        setTravelDetails(state.travelDetails);
      } else {
        // Try to get from localStorage as last resort
        const savedDetails = localStorage.getItem('travelDetails');
        if (savedDetails) {
          const parsed = JSON.parse(savedDetails);
          setTravelDetails({
            destination: parsed.destination,
            startDate: new Date(parsed.startDate),
            endDate: new Date(parsed.endDate),
            travelers: parsed.travelers
          });
        } else {
          setError('Travel details not found. Please start from the beginning.');
        }
      }
    } catch (err) {
      console.error('Error loading travel details:', err);
      setError('Failed to load travel details.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, state.travelDetails]);

  const handlePreferencesComplete = (preferences: ActivityType[]) => {
    // Store preferences in localStorage for persistence
    localStorage.setItem('selectedPreferences', JSON.stringify(preferences));
    
    // Navigate to review or continue building
    const nextStep = searchParams.get('next') || 'review';
    
    if (nextStep === 'review') {
      router.push('/itinerary/review');
    } else if (nextStep === 'building') {
      router.push('/itinerary/building');
    } else {
      router.push('/itinerary');
    }
  };

  const handleBack = () => {
    const prevStep = searchParams.get('from') || 'building';
    
    if (prevStep === 'building') {
      router.push('/itinerary/building');
    } else {
      router.push('/itinerary');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/itinerary')}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Start Over
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!travelDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <p className="text-gray-600 mb-4">Travel details not available.</p>
          <Button onClick={() => router.push('/')}>
            Start New Trip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ActivityPreferences
            travelDetails={travelDetails}
            onPreferencesComplete={handlePreferencesComplete}
            onBack={handleBack}
            showHeader={true}
            autoApply={true}
          />
        </div>
      </div>
    </div>
  );
} 