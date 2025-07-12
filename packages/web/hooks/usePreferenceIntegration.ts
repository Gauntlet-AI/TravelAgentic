/**
 * Preference Integration Hook
 * Manages real-time application of activity preferences to itineraries
 * Provides seamless integration between preference selection and itinerary updates
 */

import { useState, useCallback, useEffect } from 'react';
import { ActivityType } from '@/components/itinerary/PreferenceCard';
import { useItineraryOperations } from './useItinerary';
import { useItinerary } from '@/contexts/ItineraryContext';

interface PreferenceApplicationState {
  isApplying: boolean;
  progress: number;
  currentStep: string;
  appliedActivities: number;
  totalActivities: number;
  error: string | null;
}

interface PreferenceIntegrationOptions {
  autoApply?: boolean;
  debounceDelay?: number;
  maxRetries?: number;
}

export function usePreferenceIntegration(options: PreferenceIntegrationOptions = {}) {
  const {
    autoApply = true,
    debounceDelay = 1500,
    maxRetries = 3
  } = options;

  const { state } = useItinerary();
  const operations = useItineraryOperations();
  
  const [applicationState, setApplicationState] = useState<PreferenceApplicationState>({
    isApplying: false,
    progress: 0,
    currentStep: '',
    appliedActivities: 0,
    totalActivities: 0,
    error: null
  });

  const [retryCount, setRetryCount] = useState(0);
  const [lastPreferences, setLastPreferences] = useState<ActivityType[]>([]);

  // Apply preferences with comprehensive error handling
  const applyPreferences = useCallback(async (
    preferences: ActivityType[],
    travelDetails?: any,
    options: { force?: boolean } = {}
  ) => {
    if (!preferences || preferences.length === 0) {
      throw new Error('No preferences provided');
    }

    // Avoid duplicate applications unless forced
    if (!options.force && JSON.stringify(preferences) === JSON.stringify(lastPreferences)) {
      return;
    }

    setApplicationState(prev => ({
      ...prev,
      isApplying: true,
      progress: 0,
      currentStep: 'Analyzing your preferences...',
      error: null
    }));

    try {
      // Step 1: Analyze preferences
      await new Promise(resolve => setTimeout(resolve, 800));
      setApplicationState(prev => ({
        ...prev,
        progress: 20,
        currentStep: 'Finding activities that match your interests...'
      }));

      // Step 2: Call API to apply preferences
      const response = await fetch('/api/preferences/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          travelDetails: travelDetails || state.travelDetails,
          currentItinerary: state.days
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const result = await response.json();

      setApplicationState(prev => ({
        ...prev,
        progress: 60,
        currentStep: 'Generating personalized activities...'
      }));

      await new Promise(resolve => setTimeout(resolve, 600));

      // Step 3: Apply activities to itinerary
      setApplicationState(prev => ({
        ...prev,
        progress: 80,
        currentStep: 'Adding activities to your itinerary...'
      }));

      let addedCount = 0;
      if (result.activities && result.activities.length > 0) {
        // Remove existing preference-based activities to avoid duplicates
        const daysToUpdate = new Set<number>();
        
        result.activities.forEach((activity: any) => {
          const dayIndex = activity.dayIndex || Math.floor(addedCount / 3);
          daysToUpdate.add(dayIndex);
          
          operations.addOrAdjustItineraryItem(dayIndex, {
            ...activity,
            id: `pref_${Date.now()}_${addedCount}`,
            status: 'suggested',
            source: 'preference_integration',
            appliedAt: new Date().toISOString()
          });
          
          addedCount++;
        });
      }

      // Step 4: Complete
      setApplicationState({
        isApplying: false,
        progress: 100,
        currentStep: `Successfully added ${addedCount} personalized activities!`,
        appliedActivities: addedCount,
        totalActivities: result.metrics?.totalActivities || preferences.length * 2,
        error: null
      });

      setLastPreferences(preferences);
      setRetryCount(0);

      return {
        success: true,
        activitiesAdded: addedCount,
        metrics: result.metrics,
        activities: result.activities
      };

    } catch (error) {
      console.error('Error applying preferences:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply preferences';
      
      setApplicationState(prev => ({
        ...prev,
        isApplying: false,
        progress: 0,
        currentStep: '',
        error: errorMessage
      }));

      // Retry logic
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          applyPreferences(preferences, travelDetails, options);
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }

      throw error;
    }
  }, [state, operations, lastPreferences, retryCount, maxRetries]);

  // Auto-apply preferences with debouncing
  const autoApplyPreferences = useCallback((
    preferences: ActivityType[],
    travelDetails?: any
  ) => {
    if (!autoApply || preferences.length === 0) return;

    const timeoutId = setTimeout(() => {
      applyPreferences(preferences, travelDetails);
    }, debounceDelay);

    return () => clearTimeout(timeoutId);
  }, [autoApply, debounceDelay, applyPreferences]);

  // Generate random activities from preferences
  const generateRandomActivities = useCallback(async (
    preferences: ActivityType[],
    count: number = 3,
    constraints: any = {}
  ) => {
    if (!preferences || preferences.length === 0) {
      throw new Error('No preferences provided for random generation');
    }

    try {
      const response = await fetch('/api/preferences/random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          count,
          destination: state.travelDetails?.destination,
          travelers: state.travelDetails?.travelers,
          ...constraints
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate random activities');
      }

      const result = await response.json();
      return result.activities || [];
    } catch (error) {
      console.error('Error generating random activities:', error);
      throw error;
    }
  }, [state.travelDetails]);

  // Clear preference-based activities
  const clearPreferenceActivities = useCallback(() => {
    // Find and remove activities that were added via preference integration
    state.days.forEach((day, dayIndex) => {
      const preferenceItems = day.items.filter(item => 
        item.id?.startsWith('pref_')
      );
      
      // Remove preference-based items
      preferenceItems.forEach(item => {
        operations.removeItineraryItem(dayIndex, item.id);
      });
    });

    setLastPreferences([]);
  }, [state.days, operations]);

  // Get preference application statistics
  const getApplicationStats = useCallback(() => {
    const preferenceItems = state.days.flatMap(day => 
      day.items.filter(item => 
        item.id?.startsWith('pref_')
      )
    );

    // Group by type since category isn't available on ItineraryItem
    const preferencesByType = preferenceItems.reduce((acc, item) => {
      const type = item.type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPreferenceItems: preferenceItems.length,
      preferencesByType,
      lastApplied: lastPreferences,
      hasPreferences: preferenceItems.length > 0
    };
  }, [state.days, lastPreferences]);

  // Retry failed application
  const retryApplication = useCallback(() => {
    if (lastPreferences.length > 0) {
      setRetryCount(0);
      return applyPreferences(lastPreferences, undefined, { force: true });
    }
    throw new Error('No previous preferences to retry');
  }, [lastPreferences, applyPreferences]);

  return {
    // State
    applicationState,
    isApplying: applicationState.isApplying,
    canRetry: retryCount < maxRetries && applicationState.error !== null,
    
    // Actions
    applyPreferences,
    autoApplyPreferences,
    generateRandomActivities,
    clearPreferenceActivities,
    retryApplication,
    
    // Statistics
    getApplicationStats,
    
    // Configuration
    retryCount,
    maxRetries
  };
} 