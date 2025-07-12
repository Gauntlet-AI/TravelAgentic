/**
 * Preference Applier Component
 * Handles real-time application of activity preferences to itineraries
 * Provides intelligent activity matching and distribution across days
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Zap,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Clock,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { ActivityType } from './PreferenceCard';
import { useItinerary } from '@/contexts/ItineraryContext';
import { useItineraryOperations } from '@/hooks/useItinerary';

interface PreferenceApplierProps {
  preferences: ActivityType[];
  travelDetails: {
    destination: string;
    startDate: Date;
    endDate: Date;
    travelers: number;
  };
  onApplicationComplete?: (results: ApplicationResults) => void;
  onApplicationError?: (error: string) => void;
  autoApply?: boolean;
  showProgress?: boolean;
  className?: string;
}

interface ApplicationResults {
  appliedActivities: number;
  totalActivities: number;
  activitiesByDay: { [day: number]: any[] };
  preferences: ActivityType[];
  duration: number;
}

interface ApplicationState {
  status: 'idle' | 'applying' | 'completed' | 'error';
  progress: number;
  currentStep: string;
  results?: ApplicationResults;
  error?: string;
}

export function PreferenceApplier({
  preferences,
  travelDetails,
  onApplicationComplete,
  onApplicationError,
  autoApply = true,
  showProgress = true,
  className = ''
}: PreferenceApplierProps) {
  const { state } = useItinerary();
  const operations = useItineraryOperations();
  
  const [applicationState, setApplicationState] = useState<ApplicationState>({
    status: 'idle',
    progress: 0,
    currentStep: ''
  });

  const tripDuration = Math.ceil((travelDetails.endDate.getTime() - travelDetails.startDate.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    if (autoApply && preferences.length > 0 && applicationState.status === 'idle') {
      const delayedApply = setTimeout(() => {
        applyPreferences();
      }, 1500);

      return () => clearTimeout(delayedApply);
    }
  }, [preferences, autoApply, applicationState.status]);

  const applyPreferences = useCallback(async () => {
    if (preferences.length === 0) return;

    setApplicationState({
      status: 'applying',
      progress: 0,
      currentStep: 'Analyzing your preferences...'
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setApplicationState(prev => ({
        ...prev,
        progress: 25,
        currentStep: 'Finding matching activities...'
      }));

      const response = await fetch('/api/preferences/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          travelDetails: {
            ...travelDetails,
            startDate: travelDetails.startDate.toISOString(),
            endDate: travelDetails.endDate.toISOString(),
          },
          currentItinerary: state.days
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply preferences');
      }

      const result = await response.json();
      
      setApplicationState(prev => ({
        ...prev,
        progress: 75,
        currentStep: 'Adding personalized activities to your itinerary...'
      }));

      if (result.success && result.activities) {
        result.activities.forEach((activity: any) => {
          operations.addOrAdjustItineraryItem(activity.dayIndex, {
            ...activity,
            startTime: activity.startTime ? new Date(activity.startTime) : undefined,
            endTime: activity.endTime ? new Date(activity.endTime) : undefined,
          });
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const results: ApplicationResults = {
        appliedActivities: result.metrics.totalActivities,
        totalActivities: result.metrics.totalActivities,
        activitiesByDay: result.activitiesByDay,
        preferences: result.preferences,
        duration: tripDuration
      };

      setApplicationState({
        status: 'completed',
        progress: 100,
        currentStep: `Successfully added ${result.metrics.totalActivities} personalized activities!`,
        results
      });

      onApplicationComplete?.(results);

    } catch (error) {
      console.error('Failed to apply preferences:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      
      setApplicationState({
        status: 'error',
        progress: 0,
        currentStep: '',
        error: errorMessage
      });

      onApplicationError?.(errorMessage);
    }
  }, [preferences, travelDetails, state.days, operations, tripDuration, onApplicationComplete, onApplicationError]);

  const handleRetry = () => {
    setApplicationState({ status: 'idle', progress: 0, currentStep: '' });
  };

  const handleApply = () => {
    applyPreferences();
  };

  if (applicationState.status === 'completed' && applicationState.results) {
    return (
      <Card className={`bg-green-50 border-green-200 ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">
                  Preferences Applied!
                </h3>
                <p className="text-sm text-green-700">
                  {applicationState.results.appliedActivities} activities added across {tripDuration} days.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {preferences.map(pref => (
                <Badge key={pref.id} className="bg-green-100 text-green-800 text-xs">
                  {pref.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applicationState.status === 'error') {
    return (
      <Alert className={`bg-red-50 border-red-200 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="space-y-2">
            <p>{applicationState.error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (applicationState.status === 'applying') {
    return (
      <Card className={`bg-blue-50 border-blue-200 ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-medium text-blue-900">
                  Applying Activity Preferences
                </h3>
                <p className="text-sm text-blue-700">
                  {applicationState.currentStep}
                </p>
              </div>
            </div>

            {showProgress && (
              <>
                <Progress value={applicationState.progress} className="h-2 bg-blue-100" />
                <div className="text-xs text-blue-600 text-center">
                  {applicationState.progress}% complete
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <Sparkles className="h-4 w-4" />
                <span>{preferences.length} preferences selected</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <Clock className="h-4 w-4" />
                <span>{tripDuration} days to optimize</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (preferences.length > 0 && !autoApply) {
    return (
      <Card className={`border-purple-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Ready to Apply Preferences
                </h3>
                <p className="text-sm text-gray-600">
                  {preferences.length} activity preferences selected
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleApply}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Apply Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
} 