/**
 * Itinerary Building Page
 * Shows real-time AI progress as the itinerary is being built
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Plane, 
  Hotel, 
  Activity,
  CheckCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { useItinerary, useItineraryBuilder } from '@/contexts/ItineraryContext';
import { featureFlags } from '@/lib/feature-flags';

interface BuildingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  icon: React.ReactNode;
  estimatedTime?: string;
  details?: string[];
}

export default function ItineraryBuildingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch } = useItinerary();
  const { 
    buildingStatus, 
    buildingProgress, 
    currentBuildingStep, 
    isBuilding,
    startBuilding,
    updateBuildingProgress,
    completeBuilding
  } = useItineraryBuilder();
  
  const { setTravelDetails, addOrAdjustItineraryItem } = useItinerary();

  const [buildingSteps, setBuildingSteps] = useState<BuildingStep[]>([
    {
      id: 'initialize',
      name: 'Initializing AI Agents',
      description: 'Setting up personalized travel planning agents',
      status: 'pending',
      icon: <Sparkles className="h-5 w-5" />,
      estimatedTime: '5s',
    },
    {
      id: 'analyze',
      name: 'Analyzing Preferences',
      description: 'Understanding your travel style and preferences',
      status: 'pending',
      icon: <Activity className="h-5 w-5" />,
      estimatedTime: '10s',
    },
    {
      id: 'flights',
      name: 'Finding Flights',
      description: 'Searching for optimal flight options',
      status: 'pending',
      icon: <Plane className="h-5 w-5" />,
      estimatedTime: '15s',
    },
    {
      id: 'accommodation',
      name: 'Selecting Accommodation',
      description: 'Finding perfect places to stay',
      status: 'pending',
      icon: <Hotel className="h-5 w-5" />,
      estimatedTime: '12s',
    },
    {
      id: 'activities',
      name: 'Planning Activities',
      description: 'Curating experiences based on your interests',
      status: 'pending',
      icon: <Activity className="h-5 w-5" />,
      estimatedTime: '20s',
    },
    {
      id: 'optimize',
      name: 'Optimizing Itinerary',
      description: 'Fine-tuning schedule and logistics',
      status: 'pending',
      icon: <MapPin className="h-5 w-5" />,
      estimatedTime: '8s',
    },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [hasGeneratedItinerary, setHasGeneratedItinerary] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // New lock state
  const buildingInitialized = useRef(false); // Prevent React Strict Mode double execution

  // Generate dynamic itinerary data when building completes
  const addMockItineraryData = async () => {
    // Prevent duplicate generation
    if (hasGeneratedItinerary || isGenerating) {
      console.log('🔒 Itinerary generation locked, skipping...');
      return;
    }

    console.log('🚀 Starting itinerary generation...');
    setIsGenerating(true); // Lock
    
    try {
      // Clear existing days before generating new ones
      dispatch({ type: 'RESET_ITINERARY' });

      // Set travel details from URL params if available
      const urlParams = Object.fromEntries(searchParams.entries());
      let travelDetails = state.travelDetails;
      
      if (urlParams.destination && urlParams.startDate) {
        travelDetails = {
          departureLocation: urlParams.departureLocation || 'New York, United States (JFK)',
          destination: urlParams.destination || 'Paris, France (CDG)',
          startDate: new Date(urlParams.startDate || '2025-08-01'),
          endDate: new Date(urlParams.endDate || '2025-08-05'),
          adults: parseInt(urlParams.adults || '2'),
          children: parseInt(urlParams.children || '0'),
          travelers: parseInt(urlParams.travelers || '2'),
        };
        setTravelDetails(travelDetails);
      }

      if (!travelDetails) {
        console.error('No travel details available for itinerary generation');
        return;
      }

      // Call API to generate dynamic itinerary based on user's actual travel details
      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departureLocation: travelDetails.departureLocation,
          destination: travelDetails.destination,
          startDate: travelDetails.startDate?.toISOString(),
          endDate: travelDetails.endDate?.toISOString(),
          travelers: travelDetails.travelers,
          adults: travelDetails.adults,
          children: travelDetails.children
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate itinerary');
      }

      console.log('Generated dynamic itinerary for:', {
        destination: travelDetails.destination,
        duration: result.data.duration,
        totalItems: result.data.items.length
      });

      // Add dynamic items to the itinerary context
      const dynamicItems = result.data.items.map((item: any) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        description: item.description,
        startTime: new Date(item.startTime),
        endTime: new Date(item.endTime),
        location: item.location,
        price: item.price,
        currency: item.currency,
        status: item.status,
        source: item.source,
      }));

      // Add items to appropriate days based on their dates
      console.log('📅 Adding items to context:', dynamicItems.length, 'items');
      dynamicItems.forEach((item: any, index: number) => {
        const itemDate = new Date(item.startTime);
        const startDate = new Date(travelDetails!.startDate!);
        const dayIndex = Math.floor((itemDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        addOrAdjustItineraryItem(Math.max(0, dayIndex), item);
      });

      console.log('Added dynamic itinerary items:', dynamicItems.length, 'items');
      setHasGeneratedItinerary(true);
    } catch (error) {
      console.error('Failed to generate dynamic itinerary:', error);
      
      // Minimal fallback - just show basic structure
      const fallbackItem = {
        id: 'fallback-item',
        type: 'activity' as const,
        name: `Explore ${state.travelDetails?.destination || 'your destination'}`,
        description: 'Custom itinerary item - API generation failed',
        startTime: new Date(),
        endTime: new Date(),
        location: state.travelDetails?.destination || 'Unknown',
        price: 0,
        currency: 'USD',
        status: 'suggested' as const,
        source: 'ai' as const,
      };
      addOrAdjustItineraryItem(0, fallbackItem);
      setHasGeneratedItinerary(true); // Mark as generated even for fallback
    } finally {
      setIsGenerating(false); // Unlock
    }
  };

  // Start building process on page load
  useEffect(() => {
    if (buildingStatus === 'idle' && !isSimulationRunning && !hasGeneratedItinerary && !buildingInitialized.current) {
      console.log('🎬 Starting building process (first time)...');
      buildingInitialized.current = true;
      setIsSimulationRunning(true);
      startBuilding();
      simulateBuildingProcess();
    }

    // Cleanup function to reset states on unmount
    return () => {
      console.log('🧹 Cleaning up building process...');
      // Note: Don't reset buildingInitialized.current here to prevent re-execution
      setIsSimulationRunning(false);
      setHasGeneratedItinerary(false);
    };
  }, [buildingStatus, hasGeneratedItinerary]); // Removed isSimulationRunning from deps to prevent loops

  // Track elapsed time
  useEffect(() => {
    if (isBuilding) {
      const interval = setInterval(() => {
        setTotalElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBuilding]);

  // Update step status based on building progress
  useEffect(() => {
    if (buildingProgress > 0) {
      const newStepIndex = Math.floor((buildingProgress / 100) * buildingSteps.length);
      setCurrentStepIndex(Math.min(newStepIndex, buildingSteps.length - 1));
      
      setBuildingSteps(prev => prev.map((step, index) => {
        if (index < newStepIndex) {
          return { ...step, status: 'completed' };
        } else if (index === newStepIndex) {
          return { ...step, status: 'in_progress' };
        } else {
          return { ...step, status: 'pending' };
        }
      }));
    }
  }, [buildingProgress, buildingSteps.length]);

  const simulateBuildingProcess = async () => {
    const steps = buildingSteps;
    let totalProgress = 0;
    const progressPerStep = 100 / steps.length;

    for (let i = 0; i < steps.length; i++) {
      const currentStep = steps[i];
      
      // Update local step status
      setBuildingSteps(prev => prev.map((step, index) => {
        if (index === i) {
          return { ...step, status: 'in_progress' };
        }
        return step;
      }));

      // Update context progress
      updateBuildingProgress(
        Math.round((i / steps.length) * 100), 
        `${currentStep.name}: ${currentStep.description}`
      );

      // Simulate step duration
      const stepDuration = parseInt(currentStep.estimatedTime?.replace('s', '') || '10') * 1000;
      const progressInterval = 200; // Update every 200ms
      const progressIncrement = progressPerStep / (stepDuration / progressInterval);

      await new Promise(resolve => {
        const interval = setInterval(() => {
          totalProgress += progressIncrement;
          const currentProgress = Math.min(totalProgress, (i + 1) * progressPerStep);
          
          // Update context with current progress
          updateBuildingProgress(
            Math.round(currentProgress), 
            `${currentStep.name}: ${currentStep.description}`
          );
          
          if (totalProgress >= (i + 1) * progressPerStep) {
            clearInterval(interval);
            
            // Mark step as completed
            setBuildingSteps(prev => prev.map((step, index) => {
              if (index === i) {
                return { ...step, status: 'completed' };
              }
              return step;
            }));
            
            resolve(void 0);
          }
        }, progressInterval);
      });
    }

    // Building complete
    completeBuilding();
    
    // Generate dynamic itinerary based on user's travel details
    await addMockItineraryData();
    
    setTimeout(() => {
      setIsSimulationRunning(false);
      router.push('/itinerary/view');
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Handle completed status - redirect immediately
  useEffect(() => {
    if (buildingStatus === 'completed' && buildingProgress === 100) {
      setTimeout(() => {
        router.push('/itinerary/view');
      }, 1000);
    }
  }, [buildingStatus, buildingProgress, router]);

  // Show error state if building failed
  if (buildingStatus === 'error') {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6">
        <div className="text-red-500">
          <Activity className="h-16 w-16 mx-auto mb-4" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Building Error
          </h2>
          <p className="text-gray-600 mb-6">
            {currentBuildingStep || 'Something went wrong while building your itinerary.'}
          </p>
          <div className="space-x-4">
            <Button 
              onClick={() => router.push('/itinerary/building')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
            >
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Building Your Perfect Itinerary
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Our AI agents are working together to create a personalized travel experience for you
        </p>
        
        {/* Trip Summary */}
        {state.travelDetails && (
          <div className="inline-flex items-center gap-6 bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{state.travelDetails.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {state.travelDetails.startDate?.toLocaleDateString()} - {state.travelDetails.endDate?.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{state.travelDetails.travelers} travelers</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Building Progress
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                {formatTime(totalElapsedTime)} elapsed
              </Badge>
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(buildingProgress)}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={buildingProgress} 
            className="h-3 mb-4"
          />
          <p className="text-sm text-gray-600">
            {currentBuildingStep || 'Preparing to build your itinerary...'}
          </p>
        </CardContent>
      </Card>

      {/* Building Steps */}
      <div className="grid gap-4">
        {buildingSteps.map((step, index) => (
          <Card 
            key={step.id}
            className={`transition-all duration-300 ${
              step.status === 'in_progress' 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : step.status === 'completed'
                ? 'bg-green-50'
                : 'bg-white'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* Status Icon */}
                <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                  step.status === 'completed' 
                    ? 'bg-green-100 text-green-600'
                    : step.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : step.status === 'in_progress' ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-semibold ${
                      step.status === 'completed' 
                        ? 'text-green-900'
                        : step.status === 'in_progress'
                        ? 'text-blue-900'
                        : 'text-gray-900'
                    }`}>
                      {step.name}
                    </h3>
                    {step.estimatedTime && step.status === 'pending' && (
                      <Badge variant="outline" className="text-xs">
                        ~{step.estimatedTime}
                      </Badge>
                    )}
                    {step.status === 'completed' && (
                      <Badge className="text-xs bg-green-100 text-green-800">
                        ✓ Completed
                      </Badge>
                    )}
                    {step.status === 'in_progress' && (
                      <Badge className="text-xs bg-blue-100 text-blue-800">
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${
                    step.status === 'completed' 
                      ? 'text-green-700'
                      : step.status === 'in_progress'
                      ? 'text-blue-700'
                      : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                  
                  {/* Show details for current step */}
                  {step.status === 'in_progress' && step.details && (
                    <div className="mt-3 space-y-1">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="text-xs text-blue-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Agents Working */}
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
                Multiple specialized AI agents are collaborating to research flights, accommodations, activities, and create the optimal itinerary structure for your trip.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Option */}
      <div className="text-center">
        <Button 
          variant="outline"
          onClick={() => router.push('/')}
          className="text-gray-600 hover:text-gray-900"
        >
          Cancel and Start Over
        </Button>
      </div>
    </div>
  );
} 