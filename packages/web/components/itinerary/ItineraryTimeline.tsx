/**
 * Itinerary Timeline Component
 * Provides a visual timeline representation of the itinerary building process
 * Shows progress, status, and timeline of each building step
 */

'use client';

import React from 'react';
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Timer,
  Play,
  Pause,
  Square
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { BuildingStep } from '@/hooks/useAIBuilder';

interface ItineraryTimelineProps {
  steps: BuildingStep[];
  currentStepIndex: number;
  totalElapsedTime: number;
  estimatedTimeRemaining: number;
  isActive: boolean;
  className?: string;
}

interface TimelineItemProps {
  step: BuildingStep;
  index: number;
  isActive: boolean;
  isCurrent: boolean;
  isLast: boolean;
  totalElapsedTime: number;
}

function TimelineItem({ 
  step, 
  index, 
  isActive, 
  isCurrent, 
  isLast,
  totalElapsedTime 
}: TimelineItemProps) {
  const getStatusColor = () => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-400 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTimeInfo = () => {
    if (step.startTime && step.endTime) {
      const duration = Math.floor((step.endTime.getTime() - step.startTime.getTime()) / 1000);
      return `${duration}s`;
    }
    if (step.startTime && step.status === 'in-progress') {
      const elapsed = Math.floor((Date.now() - step.startTime.getTime()) / 1000);
      return `${elapsed}s`;
    }
    return null;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className="relative flex items-start gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className={`absolute left-6 top-12 w-0.5 h-16 ${
          step.status === 'completed' ? 'bg-green-300' : 
          step.status === 'in-progress' ? 'bg-blue-300' : 'bg-gray-200'
        }`} />
      )}
      
      {/* Status indicator */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        getStatusColor()
      } ${isCurrent ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : ''}`}>
        {getStatusIcon()}
      </div>
      
      {/* Step content */}
      <div className="flex-1 min-w-0 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <h3 className={`font-medium text-sm ${
            step.status === 'completed' ? 'text-green-900' :
            step.status === 'in-progress' ? 'text-blue-900' :
            step.status === 'error' ? 'text-red-900' : 'text-gray-600'
          }`}>
            {step.name}
          </h3>
          
          {/* Time badge */}
          {getTimeInfo() && (
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-0.5 ${
                step.status === 'completed' ? 'border-green-300 text-green-700' :
                step.status === 'in-progress' ? 'border-blue-300 text-blue-700' :
                'border-gray-300 text-gray-600'
              }`}
            >
              <Timer className="h-3 w-3 mr-1" />
              {getTimeInfo()}
            </Badge>
          )}
          
          {/* Status badge */}
          <Badge 
            className={`text-xs px-2 py-0.5 ${
              step.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
              step.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              step.status === 'error' ? 'bg-red-100 text-red-800 border-red-200' :
              'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            {step.status === 'completed' && '✓ Done'}
            {step.status === 'in-progress' && '⚡ Active'}
            {step.status === 'error' && '✗ Failed'}
            {step.status === 'pending' && '⏳ Pending'}
          </Badge>
        </div>
        
        <p className={`text-xs mb-3 ${
          step.status === 'completed' ? 'text-green-700' :
          step.status === 'in-progress' ? 'text-blue-700' :
          step.status === 'error' ? 'text-red-700' : 'text-gray-500'
        }`}>
          {step.description}
        </p>
        
        {/* Progress for current step */}
        {step.status === 'in-progress' && (
          <div className="space-y-2">
            <Progress 
              value={step.progress} 
              className="h-1.5 bg-blue-100"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-600">
                {step.progress}% complete
              </span>
              {step.startTime && (
                <span className="text-xs text-gray-500">
                  Started {formatTime(Math.floor((Date.now() - step.startTime.getTime()) / 1000))} ago
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Error message */}
        {step.status === 'error' && step.error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {step.error}
          </div>
        )}
        
        {/* Completion details */}
        {step.status === 'completed' && step.startTime && step.endTime && (
          <div className="flex items-center gap-4 mt-2 text-xs text-green-600">
            <span>
              Completed at {step.endTime.toLocaleTimeString()}
            </span>
            <span>
              Duration: {formatTime(Math.floor((step.endTime.getTime() - step.startTime.getTime()) / 1000))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ItineraryTimeline({
  steps,
  currentStepIndex,
  totalElapsedTime,
  estimatedTimeRemaining,
  isActive,
  className = ''
}: ItineraryTimelineProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getOverallStatus = () => {
    if (steps.some(step => step.status === 'error')) return 'error';
    if (steps.every(step => step.status === 'completed')) return 'completed';
    if (steps.some(step => step.status === 'in-progress')) return 'in-progress';
    return 'pending';
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const overallProgress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        {/* Timeline Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {isActive ? (
                <Play className="h-4 w-4" />
              ) : getOverallStatus() === 'completed' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : getOverallStatus() === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Building Timeline</h3>
              <p className="text-sm text-gray-600">
                {completedSteps} of {steps.length} steps completed
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-4 mb-1">
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {formatTime(totalElapsedTime)} elapsed
              </Badge>
              {estimatedTimeRemaining > 0 && isActive && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  ~{formatTime(estimatedTimeRemaining)} remaining
                </Badge>
              )}
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${
                getOverallStatus() === 'completed' ? 'text-green-600' :
                getOverallStatus() === 'error' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {Math.round(overallProgress)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Overall Progress */}
        <div className="mb-6">
          <Progress 
            value={overallProgress} 
            className={`h-2 ${
              getOverallStatus() === 'completed' ? 'bg-green-100' :
              getOverallStatus() === 'error' ? 'bg-red-100' : 'bg-blue-100'
            }`}
          />
        </div>
        
        {/* Timeline Steps */}
        <div className="space-y-0">
          {steps.map((step, index) => (
            <TimelineItem
              key={step.id}
              step={step}
              index={index}
              isActive={isActive}
              isCurrent={index === currentStepIndex}
              isLast={index === steps.length - 1}
              totalElapsedTime={totalElapsedTime}
            />
          ))}
        </div>
        
        {/* Timeline Footer */}
        {steps.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                Started at {steps.find(s => s.startTime)?.startTime?.toLocaleTimeString() || 'N/A'}
              </span>
              {getOverallStatus() === 'completed' && (
                <span>
                  Total duration: {formatTime(totalElapsedTime)}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 