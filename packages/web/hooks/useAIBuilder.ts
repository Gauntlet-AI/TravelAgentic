/**
 * AI Builder hook for managing AI-powered itinerary building
 * Provides controls for AI building process and advanced operations
 */

import { useCallback, useState, useRef } from 'react';
import { useItineraryBuilder } from '@/contexts/ItineraryContext';
import { useItineraryOperations } from './useItinerary';

export interface BuildingStep {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export function useAIBuilder() {
  const builder = useItineraryBuilder();
  const operations = useItineraryOperations();
  const [buildingSteps, setBuildingSteps] = useState<BuildingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const abortController = useRef<AbortController | null>(null);

  // Define building steps
  const initializeBuildingSteps = useCallback((includePreferences: boolean = true) => {
    const steps: BuildingStep[] = [
      {
        id: 'initialize',
        name: 'Initialize',
        description: 'Setting up your travel context and preferences',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'analyze-preferences',
        name: 'Analyze Preferences',
        description: 'Understanding your travel style and requirements',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'search-flights',
        name: 'Search Flights',
        description: 'Finding the best flight options for your journey',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'find-accommodation',
        name: 'Find Accommodation',
        description: 'Locating perfect places to stay',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'plan-activities',
        name: 'Plan Activities',
        description: 'Curating experiences based on your interests',
        progress: 0,
        status: 'pending'
      }
    ];

    // Add preference selection step if needed
    if (includePreferences) {
      steps.push({
        id: 'select-preferences',
        name: 'Activity Preferences',
        description: 'Select activities that match your travel interests',
        progress: 0,
        status: 'pending'
      });
    }

    steps.push({
      id: 'optimize-itinerary',
      name: 'Optimize Itinerary',
      description: 'Finalizing your perfect travel schedule',
      progress: 0,
      status: 'pending'
    });
    
    setBuildingSteps(steps);
    setCurrentStepIndex(-1);
    return steps;
  }, []);

  // Update step progress
  const updateStepProgress = useCallback((stepId: string, progress: number, status?: BuildingStep['status'], error?: string) => {
    setBuildingSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const updatedStep = {
          ...step,
          progress,
          ...(status && { status }),
          ...(error && { error }),
          ...(status === 'in-progress' && !step.startTime && { startTime: new Date() }),
          ...(status === 'completed' && { endTime: new Date() })
        };
        return updatedStep;
      }
      return step;
    }));
  }, []);

  // Start AI building process
  const startAIBuilding = useCallback(async (travelDetails: any, preferences: any) => {
    try {
      // Initialize steps
      const steps = initializeBuildingSteps();
      
      // Start building in context
      builder.startBuilding();
      
      // Create abort controller for cancellation
      abortController.current = new AbortController();
      
      // Start first step
      setCurrentStepIndex(0);
      updateStepProgress('initialize', 0, 'in-progress');
      
      // Call streaming API
      const response = await fetch('/api/itinerary/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          travelDetails,
          preferences,
          stream: true
        }),
        signal: abortController.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              await handleStreamingUpdate(data);
            } catch (error) {
              console.error('Error parsing streaming data:', error);
            }
          }
        }
      }
      
      // Complete building
      builder.completeBuilding();
      
    } catch (error) {
      console.error('Error in AI building:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        // Building was cancelled
        updateCurrentStepError('Building cancelled by user');
      } else {
        // Other error
        updateCurrentStepError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
      
      builder.updateBuildingProgress(0, 'Building failed');
    }
  }, [builder, initializeBuildingSteps, updateStepProgress]);

  // Handle streaming updates
  const handleStreamingUpdate = useCallback(async (data: any) => {
    const { type, step, progress, message, items } = data;
    
    switch (type) {
      case 'step_start':
        const stepIndex = buildingSteps.findIndex(s => s.id === step);
        if (stepIndex !== -1) {
          setCurrentStepIndex(stepIndex);
          updateStepProgress(step, 0, 'in-progress');
          builder.updateBuildingProgress(stepIndex * 16.67, message);
        }
        break;
        
      case 'step_progress':
        updateStepProgress(step, progress);
        const currentIndex = buildingSteps.findIndex(s => s.id === step);
        const totalProgress = (currentIndex * 16.67) + (progress * 0.1667);
        builder.updateBuildingProgress(totalProgress, message);
        break;
        
      case 'step_complete':
        updateStepProgress(step, 100, 'completed');
        if (items && items.length > 0) {
          // Add items to itinerary
          for (const item of items) {
            const dayIndex = item.dayIndex || 0;
            operations.addOrAdjustItineraryItem(dayIndex, item);
          }
        }
        break;
        
      case 'step_error':
        updateStepProgress(step, 0, 'error', message);
        break;
        
      case 'building_complete':
        // Mark all remaining steps as completed
        setBuildingSteps(prev => prev.map(step => ({ 
          ...step, 
          status: step.status === 'pending' ? 'completed' : step.status,
          progress: step.progress < 100 ? 100 : step.progress
        })));
        builder.updateBuildingProgress(100, 'Itinerary building completed!');
        break;
    }
  }, [buildingSteps, updateStepProgress, builder, operations]);

  // Cancel building process
  const cancelBuilding = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    updateCurrentStepError('Building cancelled');
  }, []);

  // Update current step with error
  const updateCurrentStepError = useCallback((error: string) => {
    if (currentStepIndex >= 0 && buildingSteps[currentStepIndex]) {
      updateStepProgress(buildingSteps[currentStepIndex].id, 0, 'error', error);
    }
  }, [currentStepIndex, buildingSteps, updateStepProgress]);

  // Retry failed step
  const retryFailedStep = useCallback(async () => {
    const failedStep = buildingSteps.find(step => step.status === 'error');
    if (failedStep) {
      updateStepProgress(failedStep.id, 0, 'pending');
      // Could implement specific retry logic here
    }
  }, [buildingSteps, updateStepProgress]);

  // Get building statistics
  const getBuildingStats = useCallback(() => {
    const totalSteps = buildingSteps.length;
    const completedSteps = buildingSteps.filter(step => step.status === 'completed').length;
    const failedSteps = buildingSteps.filter(step => step.status === 'error').length;
    const inProgressSteps = buildingSteps.filter(step => step.status === 'in-progress').length;
    
    const startTime = buildingSteps.find(step => step.startTime)?.startTime;
    const endTime = buildingSteps.filter(step => step.endTime).pop()?.endTime;
    const duration = startTime && endTime ? endTime.getTime() - startTime.getTime() : 0;
    
    return {
      totalSteps,
      completedSteps,
      failedSteps,
      inProgressSteps,
      completionRate: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
      duration,
      estimatedTimeRemaining: calculateEstimatedTime()
    };
  }, [buildingSteps]);

  // Calculate estimated time remaining
  const calculateEstimatedTime = useCallback(() => {
    const completedSteps = buildingSteps.filter(step => step.status === 'completed');
    const remainingSteps = buildingSteps.filter(step => step.status === 'pending').length;
    
    if (completedSteps.length === 0) return 60000; // Default 60 seconds
    
    const averageStepTime = completedSteps.reduce((total, step) => {
      if (step.startTime && step.endTime) {
        return total + (step.endTime.getTime() - step.startTime.getTime());
      }
      return total;
    }, 0) / completedSteps.length;
    
    return remainingSteps * averageStepTime;
  }, [buildingSteps]);

  // Start preference selection step
  const startPreferenceSelection = useCallback(() => {
    const preferenceStep = buildingSteps.find(step => step.id === 'select-preferences');
    if (preferenceStep) {
      updateStepProgress('select-preferences', 0, 'in-progress');
      const stepIndex = buildingSteps.findIndex(s => s.id === 'select-preferences');
      setCurrentStepIndex(stepIndex);
      
      // Update overall progress
      const progressPerStep = 100 / buildingSteps.length;
      const currentProgress = stepIndex * progressPerStep;
      builder.updateBuildingProgress(currentProgress, 'Select your activity preferences to personalize your itinerary');
    }
  }, [buildingSteps, updateStepProgress, builder]);

  // Complete preference selection
  const completePreferenceSelection = useCallback(async (preferences: any[]) => {
    try {
      updateStepProgress('select-preferences', 50, 'in-progress', undefined);
      builder.updateBuildingProgress(
        builder.buildingProgress + 25, 
        'Applying your preferences to the itinerary...'
      );

      // Apply preferences via API
      const response = await fetch('/api/preferences/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          travelDetails: {}, // This should come from context
          currentItinerary: []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to apply preferences');
      }

      const result = await response.json();
      
      // Add generated activities to itinerary
      if (result.activities && result.activities.length > 0) {
        result.activities.forEach((activity: any, index: number) => {
          const dayIndex = activity.dayIndex || Math.floor(index / 3);
          operations.addOrAdjustItineraryItem(dayIndex, activity);
        });
      }

      // Complete the step
      updateStepProgress('select-preferences', 100, 'completed');
      builder.updateBuildingProgress(
        builder.buildingProgress + 25, 
        `Added ${result.activities?.length || 0} personalized activities!`
      );

      return result;
    } catch (error) {
      console.error('Error applying preferences:', error);
      updateStepProgress('select-preferences', 0, 'error', 
        error instanceof Error ? error.message : 'Failed to apply preferences');
      throw error;
    }
  }, [updateStepProgress, builder, operations]);

  // Skip preference selection
  const skipPreferenceSelection = useCallback(() => {
    updateStepProgress('select-preferences', 100, 'completed');
    const stepIndex = buildingSteps.findIndex(s => s.id === 'select-preferences');
    const progressPerStep = 100 / buildingSteps.length;
    const currentProgress = (stepIndex + 1) * progressPerStep;
    builder.updateBuildingProgress(currentProgress, 'Preference selection skipped');
  }, [buildingSteps, updateStepProgress, builder]);

  // Check if ready for preferences
  const isReadyForPreferences = useCallback(() => {
    const coreSteps = ['initialize', 'analyze-preferences', 'search-flights', 'find-accommodation', 'plan-activities'];
    return coreSteps.every(stepId => {
      const step = buildingSteps.find(s => s.id === stepId);
      return step && step.status === 'completed';
    });
  }, [buildingSteps]);

  // Check if preferences step exists and is pending
  const needsPreferenceSelection = useCallback(() => {
    const preferenceStep = buildingSteps.find(step => step.id === 'select-preferences');
    return preferenceStep && preferenceStep.status === 'pending' && isReadyForPreferences();
  }, [buildingSteps, isReadyForPreferences]);

  return {
    // Builder state
    ...builder,
    buildingSteps,
    currentStepIndex,
    currentStep: currentStepIndex >= 0 ? buildingSteps[currentStepIndex] : null,
    
    // Actions
    startAIBuilding,
    cancelBuilding,
    retryFailedStep,
    
    // Preference actions
    startPreferenceSelection,
    completePreferenceSelection,
    skipPreferenceSelection,
    
    // Step management
    updateStepProgress,
    
    // Statistics
    getBuildingStats,
    
    // Computed state
    isInitialized: buildingSteps.length > 0,
    hasFailedSteps: buildingSteps.some(step => step.status === 'error'),
    canRetry: buildingSteps.some(step => step.status === 'error'),
    canCancel: builder.isBuilding,
    isReadyForPreferences,
    needsPreferenceSelection
  };
} 