/**
 * Building Progress Component
 * Provides comprehensive progress indicators and status updates for AI building process
 * Includes animated progress bars, status indicators, and detailed statistics
 */

'use client';

import React, { useEffect, useState } from 'react';
import { 
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  Target,
  BarChart3,
  Timer
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface BuildingProgressProps {
  overallProgress: number;
  currentStep: string;
  stepProgress: number;
  status: 'idle' | 'building' | 'completed' | 'error';
  elapsedTime: number;
  estimatedTimeRemaining: number;
  completedSteps: number;
  totalSteps: number;
  stepStats?: {
    fastest: number;
    slowest: number;
    average: number;
  };
  className?: string;
  showDetailed?: boolean;
  animated?: boolean;
}

export function BuildingProgress({
  overallProgress,
  currentStep,
  stepProgress,
  status,
  elapsedTime,
  estimatedTimeRemaining,
  completedSteps,
  totalSteps,
  stepStats,
  className = '',
  showDetailed = true,
  animated = true
}: BuildingProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [displayStepProgress, setDisplayStepProgress] = useState(0);

  // Animate progress changes
  useEffect(() => {
    if (animated) {
      const progressInterval = setInterval(() => {
        setDisplayProgress(prev => {
          const diff = overallProgress - prev;
          if (Math.abs(diff) < 0.1) return overallProgress;
          return prev + diff * 0.1;
        });
        
        setDisplayStepProgress(prev => {
          const diff = stepProgress - prev;
          if (Math.abs(diff) < 0.1) return stepProgress;
          return prev + diff * 0.1;
        });
      }, 16);
      
      return () => clearInterval(progressInterval);
    } else {
      setDisplayProgress(overallProgress);
      setDisplayStepProgress(stepProgress);
    }
  }, [overallProgress, stepProgress, animated]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'building':
        return 'text-blue-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'building':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'building':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getCompletionRate = () => {
    if (totalSteps === 0) return 0;
    return (completedSteps / totalSteps) * 100;
  };

  const getEstimatedCompletion = () => {
    if (estimatedTimeRemaining <= 0) return null;
    const completionTime = new Date(Date.now() + estimatedTimeRemaining * 1000);
    return completionTime.toLocaleTimeString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              Overall Progress
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                <Timer className="h-3 w-3 mr-1" />
                {formatTime(elapsedTime)}
              </Badge>
              <span className={`text-2xl font-bold ${getStatusColor()}`}>
                {Math.round(displayProgress)}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={displayProgress} 
                className={`h-4 ${animated ? 'transition-all duration-300' : ''}`}
              />
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{currentStep}</span>
                <span>{completedSteps} of {totalSteps} steps completed</span>
              </div>
            </div>

            {/* Time Information */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-500">Elapsed:</span>
                  <span className="font-medium ml-1">{formatTime(elapsedTime)}</span>
                </div>
                {estimatedTimeRemaining > 0 && status === 'building' && (
                  <div className="text-sm">
                    <span className="text-gray-500">Remaining:</span>
                    <span className="font-medium ml-1">~{formatTime(estimatedTimeRemaining)}</span>
                  </div>
                )}
                {getEstimatedCompletion() && (
                  <div className="text-sm">
                    <span className="text-gray-500">ETA:</span>
                    <span className="font-medium ml-1">{getEstimatedCompletion()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Progress */}
      {status === 'building' && stepProgress > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-blue-600" />
              Current Step Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{currentStep}</span>
                <span className="text-sm text-blue-600 font-medium">
                  {Math.round(displayStepProgress)}%
                </span>
              </div>
              <Progress 
                value={displayStepProgress} 
                className={`h-2 bg-blue-100 ${animated ? 'transition-all duration-200' : ''}`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Statistics */}
      {showDetailed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Completion Rate */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-xl font-bold text-green-600">
                    {Math.round(getCompletionRate())}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Speed */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Processing Speed</p>
                  <p className="text-xl font-bold text-blue-600">
                    {completedSteps > 0 && elapsedTime > 0 
                      ? `${((completedSteps / elapsedTime) * 60).toFixed(1)}/min`
                      : '...'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Score */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Efficiency</p>
                  <p className="text-xl font-bold text-purple-600">
                    {status === 'error' ? 'Error' : 
                     status === 'completed' ? 'Excellent' :
                     overallProgress > 75 ? 'High' :
                     overallProgress > 50 ? 'Good' :
                     overallProgress > 25 ? 'Fair' : 'Starting'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step Statistics */}
      {stepStats && showDetailed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Step Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Fastest</p>
                <p className="text-sm font-bold text-green-600">
                  {formatTime(stepStats.fastest)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Average</p>
                <p className="text-sm font-bold text-blue-600">
                  {formatTime(stepStats.average)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Slowest</p>
                <p className="text-sm font-bold text-orange-600">
                  {formatTime(stepStats.slowest)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {status === 'completed' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Building Complete!</p>
                <p className="text-sm text-green-700">
                  Your itinerary has been successfully created in {formatTime(elapsedTime)}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'error' && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Building Error</p>
                <p className="text-sm text-red-700">
                  There was an issue building your itinerary. Please try again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 