/**
 * Booking Status Component
 * Provides real-time progress tracking and status updates for booking processes
 * Supports detailed stage monitoring, error handling, and retry functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  XCircle, 
  PlayCircle,
  PauseCircle,
  RotateCcw,
  ExternalLink,
  Download,
  Info
} from 'lucide-react';

// Types for booking status
interface BookingStatusProps {
  finalizationId?: string;
  itineraryId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onStatusChange?: (status: BookingStatus) => void;
  onComplete?: (result: BookingCompletionResult) => void;
  showDetailedView?: boolean;
}

interface BookingCompletionResult {
  success: boolean;
  finalizationId: string;
  confirmationNumber?: string;
  documentId?: string;
  totalCost: number;
}

interface BookingStatus {
  finalizationId: string;
  status: 'initiated' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bookingProgress: BookingProgress;
  estimatedCompletion: string;
  totalCost: number;
  currency: string;
  bookingResults?: BookingResult[];
  documentId?: string;
  confirmationNumber?: string;
  timestamp: string;
  error?: string;
}

interface BookingProgress {
  overall: number; // 0-100 percentage
  stages: {
    [stageName: string]: StageProgress;
  };
}

interface StageProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100 percentage
  startTime?: string;
  endTime?: string;
  error?: string;
  retryCount?: number;
  details?: any;
}

interface BookingResult {
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
  itemId: string;
  status: 'booked' | 'confirmed' | 'pending' | 'failed';
  confirmationNumber?: string;
  cost: number;
  details: any;
  errors?: string[];
}

/**
 * Main BookingStatus component
 */
export default function BookingStatus({
  finalizationId,
  itineraryId,
  autoRefresh = true,
  refreshInterval = 3000,
  onStatusChange,
  onComplete,
  showDetailedView = false
}: BookingStatusProps) {
  const [status, setStatus] = useState<BookingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(autoRefresh);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  /**
   * Fetch booking status
   */
  const fetchStatus = async () => {
    if (!finalizationId && !itineraryId) return;

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (finalizationId) queryParams.set('finalizationId', finalizationId);
      if (itineraryId) queryParams.set('itineraryId', itineraryId);

      const response = await fetch(`/api/itinerary/finalize?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking status');
      }

      const newStatus = await response.json();
      setStatus(newStatus);
      setLastUpdate(new Date());

      // Notify parent component
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      // Check if booking is complete
      if (newStatus.status === 'completed' && onComplete) {
        onComplete({
          success: true,
          finalizationId: newStatus.finalizationId,
          confirmationNumber: newStatus.confirmationNumber,
          documentId: newStatus.documentId,
          totalCost: newStatus.totalCost
        });
      }

      // Stop polling if process is complete or failed
      if (newStatus.status === 'completed' || newStatus.status === 'failed') {
        setIsPolling(false);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsPolling(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effect for polling status updates
   */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPolling && (finalizationId || itineraryId)) {
      // Initial fetch
      fetchStatus();

      // Set up polling
      interval = setInterval(fetchStatus, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [finalizationId, itineraryId, isPolling, refreshInterval]);

  /**
   * Toggle polling
   */
  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  /**
   * Manual refresh
   */
  const handleRefresh = () => {
    fetchStatus();
  };

  /**
   * Retry failed stage
   */
  const retryStage = async (stageName: string) => {
    if (!status) return;

    try {
      const response = await fetch('/api/itinerary/finalize', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalizationId: status.finalizationId,
          action: 'retry_stage',
          stage: stageName
        })
      });

      if (response.ok) {
        // Restart polling to track retry progress
        setIsPolling(true);
        fetchStatus();
      }
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!status && isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading booking status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No booking data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(status.status)}
              Booking Status
              <Badge variant={getStatusVariant(status.status)}>
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePolling}
                className="flex items-center gap-1"
              >
                {isPolling ? (
                  <>
                    <PauseCircle className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    Resume
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Overall Progress */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">
                  {status.bookingProgress.overall}%
                </span>
              </div>
              <Progress value={status.bookingProgress.overall} className="h-3" />
            </div>

            {/* Status Information */}
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmation:</span>
                  <span className="font-medium">
                    {status.confirmationNumber || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="font-medium">
                    {status.currency} {status.totalCost}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium">
                    {new Date(status.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Completion:</span>
                  <span className="font-medium">
                    {new Date(status.estimatedCompletion).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {lastUpdate && (
              <div className="text-xs text-gray-500 text-center">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(status.bookingProgress.stages).map(([stageName, stage]) => (
              <StageProgressItem
                key={stageName}
                stageName={stageName}
                stage={stage}
                onRetry={() => retryStage(stageName)}
                showDetails={showDetailedView}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Results */}
      {status.bookingResults && status.bookingResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status.bookingResults.map((result, index) => (
                <BookingResultItem key={index} result={result} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document & Actions */}
      {status.status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status.documentId && (
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Travel Documents
                </Button>
              )}
              
              <Button className="w-full" variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Booking Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Stage Progress Item Component
 */
function StageProgressItem({
  stageName,
  stage,
  onRetry,
  showDetails
}: {
  stageName: string;
  stage: StageProgress;
  onRetry: () => void;
  showDetails: boolean;
}) {
  const [showStageDetails, setShowStageDetails] = useState(false);

  const formatStageName = (name: string) => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStageVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStageIcon(stage.status)}
          <div>
            <span className="font-medium">{formatStageName(stageName)}</span>
            {stage.retryCount && stage.retryCount > 0 && (
              <span className="text-xs text-gray-500 ml-2">
                (Retry {stage.retryCount})
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={getStageVariant(stage.status)}>
            {stage.status}
          </Badge>
          
          {stage.status === 'failed' && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RotateCcw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
          
          {showDetails && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowStageDetails(!showStageDetails)}
            >
              <Info className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span>{stage.progress}%</span>
        </div>
        <Progress value={stage.progress} className="h-2" />
      </div>

      {/* Stage Error */}
      {stage.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {stage.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Stage Details */}
      {showStageDetails && showDetails && (
        <div className="mt-3 p-3 bg-gray-50 rounded text-xs space-y-1">
          {stage.startTime && (
            <div className="flex justify-between">
              <span>Started:</span>
              <span>{new Date(stage.startTime).toLocaleString()}</span>
            </div>
          )}
          {stage.endTime && (
            <div className="flex justify-between">
              <span>Completed:</span>
              <span>{new Date(stage.endTime).toLocaleString()}</span>
            </div>
          )}
          {stage.details && (
            <div className="mt-2">
              <span className="font-medium">Details:</span>
              <pre className="mt-1 text-xs overflow-x-auto">
                {JSON.stringify(stage.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Booking Result Item Component
 */
function BookingResultItem({ result }: { result: BookingResult }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return '✈️';
      case 'hotel':
        return '🏨';
      case 'activity':
        return '🎯';
      case 'restaurant':
        return '🍽️';
      case 'transport':
        return '🚗';
      default:
        return '📋';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'booked':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-xl">{getTypeIcon(result.type)}</span>
        <div>
          <div className="font-medium">
            {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Booking
          </div>
          {result.confirmationNumber && (
            <div className="text-xs text-gray-600">
              Confirmation: {result.confirmationNumber}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <Badge variant={getStatusVariant(result.status)}>
          {result.status}
        </Badge>
        <div className="text-sm text-gray-600 mt-1">
          ${result.cost}
        </div>
      </div>
    </div>
  );
}

/**
 * Utility functions
 */
function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'processing':
      return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'cancelled':
      return <XCircle className="w-5 h-5 text-gray-600" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'completed':
      return 'default' as const;
    case 'processing':
      return 'secondary' as const;
    case 'failed':
      return 'destructive' as const;
    case 'cancelled':
      return 'outline' as const;
    default:
      return 'outline' as const;
  }
} 