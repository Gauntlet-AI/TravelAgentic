/**
 * Activity Preferences Component
 * Main orchestrator for activity preference selection during itinerary building
 * Integrates with real-time building process and provides smooth transitions
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Clock,
  Users,
  MapPin,
  Calendar,
  Zap
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { PreferenceSelector } from './PreferenceSelector';
import { ActivityType } from './PreferenceCard';
import { useItinerary } from '@/contexts/ItineraryContext';
import { useItineraryOperations } from '@/hooks/useItinerary';

interface ActivityPreferencesProps {
  travelDetails: {
    destination: string;
    startDate: Date;
    endDate: Date;
    travelers: number;
  };
  initialPreferences?: ActivityType[];
  onPreferencesComplete: (preferences: ActivityType[]) => void;
  onBack?: () => void;
  showHeader?: boolean;
  autoApply?: boolean;
  className?: string;
}

interface PreferenceApplication {
  status: 'idle' | 'applying' | 'completed' | 'error';
  progress: number;
  message: string;
  appliedActivities?: number;
  totalActivities?: number;
}

export function ActivityPreferences({
  travelDetails,
  initialPreferences = [],
  onPreferencesComplete,
  onBack,
  showHeader = true,
  autoApply = true,
  className = ''
}: ActivityPreferencesProps) {
  const { state } = useItinerary();
  const operations = useItineraryOperations();
  
  const [selectedPreferences, setSelectedPreferences] = useState<ActivityType[]>(initialPreferences);
  const [application, setApplication] = useState<PreferenceApplication>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [showResults, setShowResults] = useState(false);

  // Calculate trip duration and context
  const tripDuration = Math.ceil((travelDetails.endDate.getTime() - travelDetails.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const canContinue = selectedPreferences.length >= 2;

  // Auto-apply preferences when they change (if enabled)
  useEffect(() => {
    if (autoApply && selectedPreferences.length > 0 && application.status === 'idle') {
      const delayedApply = setTimeout(() => {
        applyPreferences();
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(delayedApply);
    }
  }, [selectedPreferences, autoApply, application.status]);

  // Apply preferences to itinerary
  const applyPreferences = useCallback(async () => {
    if (selectedPreferences.length === 0) return;

    setApplication({
      status: 'applying',
      progress: 0,
      message: 'Analyzing your preferences...'
    });

    try {
      // Step 1: Analyze preferences
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApplication(prev => ({
        ...prev,
        progress: 20,
        message: 'Finding activities that match your interests...'
      }));

      // Step 2: Call preference application API
      const response = await fetch('/api/preferences/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: selectedPreferences,
          travelDetails,
          currentItinerary: state.days
        })
      });

      if (!response.ok) {
        throw new Error('Failed to apply preferences');
      }

      const result = await response.json();
      
      setApplication(prev => ({
        ...prev,
        progress: 60,
        message: 'Generating personalized activities...'
      }));

      // Step 3: Add activities to itinerary
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (result.activities && result.activities.length > 0) {
        // Add activities to appropriate days
        result.activities.forEach((activity: any, index: number) => {
          const dayIndex = Math.floor(index / 3); // Distribute across days
          operations.addOrAdjustItineraryItem(dayIndex, {
            ...activity,
            id: `pref_${Date.now()}_${index}`,
            status: 'suggested',
            source: 'ai'
          });
        });

        setApplication(prev => ({
          ...prev,
          progress: 100,
          message: `Added ${result.activities.length} personalized activities to your itinerary!`,
          status: 'completed',
          appliedActivities: result.activities.length,
          totalActivities: selectedPreferences.length * 2 // Estimate
        }));
      } else {
        setApplication(prev => ({
          ...prev,
          progress: 100,
          message: 'Preferences applied successfully!',
          status: 'completed',
          appliedActivities: 0,
          totalActivities: 0
        }));
      }

      setShowResults(true);

    } catch (error) {
      console.error('Failed to apply preferences:', error);
      setApplication({
        status: 'error',
        progress: 0,
        message: 'Failed to apply preferences. Please try again.',
        appliedActivities: 0,
        totalActivities: 0
      });
    }
  }, [selectedPreferences, travelDetails, state.days, operations]);

  // Manual application trigger
  const handleApplyPreferences = () => {
    applyPreferences();
  };

  // Continue to next step
  const handleContinue = () => {
    onPreferencesComplete(selectedPreferences);
  };

  // Retry application
  const handleRetry = () => {
    setApplication({
      status: 'idle',
      progress: 0,
      message: ''
    });
    setShowResults(false);
  };

  // Get personalized recommendations based on trip context
  const getContextualRecommendations = () => {
    const recommendations = [];

    if (tripDuration <= 3) {
      recommendations.push('For short trips, focus on must-see attractions and local experiences');
    } else if (tripDuration >= 7) {
      recommendations.push('Perfect for a mix of relaxation and adventure activities');
    }

    if (travelDetails.travelers > 2) {
      recommendations.push('Group-friendly activities and experiences work well');
    }

    const month = travelDetails.startDate.getMonth();
    if (month >= 5 && month <= 8) { // Summer months
      recommendations.push('Great weather for outdoor and adventure activities');
    } else if (month >= 11 || month <= 2) { // Winter months
      recommendations.push('Perfect time for cultural experiences and indoor activities');
    }

    return recommendations;
  };

  if (showResults && application.status === 'completed') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Success Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Preferences Applied Successfully!
          </h2>
          <p className="text-gray-600">
            Your itinerary has been personalized based on your activity preferences
          </p>
        </div>

        {/* Results Summary */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {application.appliedActivities || 0}
                </div>
                <div className="text-sm text-green-700">
                  Activities Added
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {selectedPreferences.length}
                </div>
                <div className="text-sm text-green-700">
                  Preferences Applied
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {tripDuration}
                </div>
                <div className="text-sm text-green-700">
                  Days Optimized
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applied Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Your Selected Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedPreferences.map(pref => (
                <Badge key={pref.id} className="bg-purple-100 text-purple-800 border-purple-200">
                  {pref.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleRetry}
            className="text-gray-600 border-gray-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Modify Preferences
          </Button>
          
          <Button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continue to Review
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Customize Your Experience
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Select activities that match your interests for a personalized itinerary
          </p>
          
          {/* Trip Context */}
          <div className="inline-flex items-center gap-6 bg-white rounded-lg p-4 shadow-sm border mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{travelDetails.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{tripDuration} days</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{travelDetails.travelers} travelers</span>
            </div>
          </div>
        </div>
      )}

      {/* Contextual Recommendations */}
      {getContextualRecommendations().length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-1">
              {getContextualRecommendations().map((rec, index) => (
                <div key={index} className="text-sm">• {rec}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Preference Selector */}
      <PreferenceSelector
        selectedActivities={selectedPreferences}
        onSelectionChange={setSelectedPreferences}
        maxSelections={6}
        minSelections={2}
        showRecommendations={true}
        variant="default"
      />

      {/* Application Progress */}
      {application.status === 'applying' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    Applying Your Preferences
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {application.message}
                  </p>
                </div>
              </div>
              
              <Progress 
                value={application.progress} 
                className="h-2 bg-blue-100"
              />
              
              <div className="text-xs text-blue-600 text-center">
                {application.progress}% complete
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {application.status === 'error' && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            {application.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="text-gray-600 border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Building
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          {!autoApply && selectedPreferences.length > 0 && application.status === 'idle' && (
            <Button
              variant="outline"
              onClick={handleApplyPreferences}
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Apply Preferences
            </Button>
          )}
          
          <Button
            onClick={handleContinue}
            disabled={!canContinue || application.status === 'applying'}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {application.status === 'applying' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                Continue to Review
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            This step typically takes 2-3 minutes to personalize your {tripDuration}-day itinerary
          </span>
        </div>
      </div>
    </div>
  );
} 