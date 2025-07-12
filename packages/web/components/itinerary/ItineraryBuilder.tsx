/**
 * Enhanced Itinerary Builder Component
 * Provides real-time AI building visualization with comprehensive progress tracking
 * Integrates with useAIBuilder hook for sophisticated building operations
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Loader2, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Plane, 
  Hotel, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  RefreshCw,
  X
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useAIBuilder, BuildingStep } from '@/hooks/useAIBuilder';
import { useItinerary } from '@/contexts/ItineraryContext';
import { BasicTravelDetails, TravelPreferences } from '@/contexts/ItineraryContext';

interface ItineraryBuilderProps {
  travelDetails: BasicTravelDetails;
  preferences?: TravelPreferences;
  onComplete?: () => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
  showHeader?: boolean;
  showTripSummary?: boolean;
  className?: string;
}

export function ItineraryBuilder({
  travelDetails,
  preferences,
  onComplete,
  onCancel,
  onError,
  autoStart = false,
  showHeader = true,
  showTripSummary = true,
  className = ''
}: ItineraryBuilderProps) {
  const {
    buildingSteps,
    currentStep,
    currentStepIndex,
    buildingStatus,
    buildingProgress,
    currentBuildingStep,
    isBuilding,
    hasFailedSteps,
    canRetry,
    canCancel,
    startAIBuilding,
    cancelBuilding,
    retryFailedStep,
    getBuildingStats
  } = useAIBuilder();

  const { state } = useItinerary();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);

  // Track elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBuilding) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        const stats = getBuildingStats();
        setEstimatedTimeRemaining(Math.ceil(stats.estimatedTimeRemaining / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBuilding, getBuildingStats]);

  // Auto-start building if enabled
  useEffect(() => {
    if (autoStart && !isBuilding && buildingSteps.length === 0) {
      handleStartBuilding();
    }
  }, [autoStart, isBuilding, buildingSteps.length]);

  // Handle building completion
  useEffect(() => {
    if (buildingStatus === 'completed' && onComplete) {
      onComplete();
    }
  }, [buildingStatus, onComplete]);

  // Handle building errors
  useEffect(() => {
    if (buildingStatus === 'error' && onError) {
      onError(currentBuildingStep || 'Unknown error occurred');
    }
  }, [buildingStatus, currentBuildingStep, onError]);

  const handleStartBuilding = useCallback(async () => {
    try {
      await startAIBuilding(travelDetails, preferences);
    } catch (error) {
      console.error('Failed to start building:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to start building');
      }
    }
  }, [startAIBuilding, travelDetails, preferences, onError]);

  const handleCancel = useCallback(() => {
    cancelBuilding();
    if (onCancel) {
      onCancel();
    }
  }, [cancelBuilding, onCancel]);

  const handleRetry = useCallback(async () => {
    try {
      await retryFailedStep();
    } catch (error) {
      console.error('Failed to retry step:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to retry step');
      }
    }
  }, [retryFailedStep, onError]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getStepIcon = (step: BuildingStep, index: number) => {
    const iconMap = {
      'initialize': <Sparkles className="h-5 w-5" />,
      'analyze-preferences': <Activity className="h-5 w-5" />,
      'search-flights': <Plane className="h-5 w-5" />,
      'find-accommodation': <Hotel className="h-5 w-5" />,
      'plan-activities': <Activity className="h-5 w-5" />,
      'optimize-itinerary': <MapPin className="h-5 w-5" />
    };
    
    return iconMap[step.id as keyof typeof iconMap] || <Activity className="h-5 w-5" />;
  };

  const renderStepCard = (step: BuildingStep, index: number) => (
    <Card 
      key={step.id}
      className={`transition-all duration-500 ${
        step.status === 'in-progress' 
          ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md scale-[1.02]' 
          : step.status === 'completed'
          ? 'bg-green-50 border-green-200'
          : step.status === 'error'
          ? 'bg-red-50 border-red-200'
          : 'bg-white hover:bg-gray-50'
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            step.status === 'completed' 
              ? 'bg-green-100 text-green-600'
              : step.status === 'in-progress'
              ? 'bg-blue-100 text-blue-600'
              : step.status === 'error'
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {step.status === 'completed' ? (
              <CheckCircle className="h-6 w-6" />
            ) : step.status === 'in-progress' ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : step.status === 'error' ? (
              <AlertCircle className="h-6 w-6" />
            ) : (
              getStepIcon(step, index)
            )}
          </div>

          {/* Step Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className={`font-semibold transition-colors ${
                step.status === 'completed' 
                  ? 'text-green-900'
                  : step.status === 'in-progress'
                  ? 'text-blue-900'
                  : step.status === 'error'
                  ? 'text-red-900'
                  : 'text-gray-900'
              }`}>
                {step.name}
              </h3>
              
              {step.status === 'completed' && (
                <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              
              {step.status === 'in-progress' && (
                <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                  <Zap className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
              )}
              
              {step.status === 'error' && (
                <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
              
              {step.status === 'pending' && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
            
            <p className={`text-sm mb-2 transition-colors ${
              step.status === 'completed' 
                ? 'text-green-700'
                : step.status === 'in-progress'
                ? 'text-blue-700'
                : step.status === 'error'
                ? 'text-red-700'
                : 'text-gray-600'
            }`}>
              {step.description}
            </p>
            
            {/* Progress bar for current step */}
            {step.status === 'in-progress' && (
              <div className="mt-3">
                <Progress 
                  value={step.progress} 
                  className="h-2 bg-blue-100"
                />
                <p className="text-xs text-blue-600 mt-1">
                  {step.progress}% complete
                </p>
              </div>
            )}
            
            {/* Error message */}
            {step.status === 'error' && step.error && (
              <Alert className="mt-3 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 text-sm">
                  {step.error}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Completion time */}
            {step.status === 'completed' && step.startTime && step.endTime && (
              <p className="text-xs text-green-600 mt-1">
                Completed in {formatTime(Math.floor((step.endTime.getTime() - step.startTime.getTime()) / 1000))}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Building Your Perfect Itinerary
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Our AI agents are working together to create a personalized travel experience for you
          </p>
        </div>
      )}
      
      {/* Trip Summary */}
      {showTripSummary && travelDetails && (
        <div className="text-center">
          <div className="inline-flex items-center gap-6 bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{travelDetails.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {travelDetails.startDate?.toLocaleDateString()} - {travelDetails.endDate?.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{travelDetails.travelers} travelers</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isBuilding ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              ) : buildingStatus === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : buildingStatus === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Sparkles className="h-5 w-5 text-gray-400" />
              )}
              {buildingStatus === 'completed' ? 'Building Complete!' : 'Building Progress'}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                {formatTime(elapsedTime)} elapsed
              </Badge>
              {estimatedTimeRemaining > 0 && isBuilding && (
                <Badge variant="outline" className="text-xs">
                  ~{formatTime(estimatedTimeRemaining)} remaining
                </Badge>
              )}
              <span className={`text-2xl font-bold ${
                buildingStatus === 'completed' ? 'text-green-600' :
                buildingStatus === 'error' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {Math.round(buildingProgress)}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={buildingProgress} 
            className={`h-3 mb-4 ${
              buildingStatus === 'completed' ? 'bg-green-100' :
              buildingStatus === 'error' ? 'bg-red-100' : 'bg-blue-100'
            }`}
          />
          <p className="text-sm text-gray-600">
            {currentBuildingStep || 'Preparing to build your itinerary...'}
          </p>
        </CardContent>
      </Card>

      {/* Building Steps */}
      <div className="grid gap-4">
        {buildingSteps.map((step, index) => renderStepCard(step, index))}
      </div>

      {/* AI Agents Status */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                AI Agents at Work
              </h3>
              <p className="text-sm text-gray-600">
                {isBuilding 
                  ? 'Multiple specialized AI agents are collaborating to research and optimize your travel experience.'
                  : buildingStatus === 'completed'
                  ? 'AI agents have successfully created your personalized itinerary!'
                  : 'AI agents are ready to build your itinerary.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        {!isBuilding && buildingStatus !== 'completed' && (
          <Button 
            onClick={handleStartBuilding}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isBuilding}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Start Building
          </Button>
        )}
        
        {hasFailedSteps && canRetry && (
          <Button 
            onClick={handleRetry}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Failed Steps
          </Button>
        )}
        
        {canCancel && (
          <Button 
            onClick={handleCancel}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Building
          </Button>
        )}
      </div>
    </div>
  );
} 