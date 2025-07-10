"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plane, Hotel, MapPin, Clock, DollarSign, Star, Users, Calendar } from 'lucide-react';

interface StreamingUpdate {
  type: string;
  message: string;
  section?: string;
  data?: any;
  progress?: number;
  timestamp: number;
  agent?: string;
}

interface SearchParams {
  destination: string;
  start_date: string;
  end_date: string;
  travelers: number;
  budget?: number;
  automation_level: number;
  user_preferences?: Record<string, any>;
}

interface SearchResults {
  flights: {
    status: 'loading' | 'complete' | 'error';
    data?: any[];
    progress: number;
    message?: string;
  };
  hotels: {
    status: 'loading' | 'complete' | 'error';
    data?: any[];
    progress: number;
    message?: string;
  };
  activities: {
    status: 'loading' | 'complete' | 'error';
    data?: any[];
    progress: number;
    message?: string;
  };
  combinations?: any[];
  overallProgress: number;
}

export default function RealTimeItinerary({ searchParams }: { searchParams: SearchParams }) {
  const [results, setResults] = useState<SearchResults>({
    flights: { status: 'loading', progress: 0 },
    hotels: { status: 'loading', progress: 0 },
    activities: { status: 'loading', progress: 0 },
    overallProgress: 0,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updates, setUpdates] = useState<StreamingUpdate[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Start streaming search
  const startSearch = async () => {
    if (isSearching) return;
    
    setIsSearching(true);
    setError(null);
    setUpdates([]);

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Start streaming search
      const response = await fetch('/api/langgraph/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create EventSource from response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      // Process streaming data
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const update: StreamingUpdate = JSON.parse(line.slice(6));
                  handleStreamingUpdate(update);
                } catch (e) {
                  console.error('Error parsing streaming data:', e);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          setIsSearching(false);
        }
      };

      processStream();

    } catch (err) {
      console.error('Streaming error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsSearching(false);
    }
  };

  // Handle streaming updates
  const handleStreamingUpdate = (update: StreamingUpdate) => {
    setUpdates(prev => [...prev, update]);

    // Update results based on update type
    setResults(prev => {
      const newResults = { ...prev };

      switch (update.type) {
        case 'flight_search':
          newResults.flights = {
            ...newResults.flights,
            status: 'loading',
            message: update.message,
            progress: update.progress || 0,
          };
          break;

        case 'hotel_search':
          newResults.hotels = {
            ...newResults.hotels,
            status: 'loading',
            message: update.message,
            progress: update.progress || 0,
          };
          break;

        case 'activity_search':
          newResults.activities = {
            ...newResults.activities,
            status: 'loading',
            message: update.message,
            progress: update.progress || 0,
          };
          break;

        case 'parallel_agent_complete':
          if (update.agent === 'flight_agent') {
            newResults.flights = {
              status: 'complete',
              data: update.data ? [update.data.best_option] : [],
              progress: 100,
              message: update.message,
            };
          } else if (update.agent === 'lodging_agent') {
            newResults.hotels = {
              status: 'complete',
              data: update.data ? [update.data.best_option] : [],
              progress: 100,
              message: update.message,
            };
          } else if (update.agent === 'activities_agent') {
            newResults.activities = {
              status: 'complete',
              data: update.data ? update.data.best_activities : [],
              progress: 100,
              message: update.message,
            };
          }
          break;

        case 'results_aggregation_complete':
          newResults.combinations = update.data?.combinations || [];
          break;

        case 'error':
          setError(update.message);
          break;
      }

      // Calculate overall progress
      const totalProgress = (newResults.flights.progress + newResults.hotels.progress + newResults.activities.progress) / 3;
      newResults.overallProgress = totalProgress;

      return newResults;
    });
  };

  // Auto-start search when component mounts
  useEffect(() => {
    startSearch();
    
    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Planning Your Trip</h2>
          <p className="text-gray-600">
            {searchParams.destination} • {searchParams.start_date} to {searchParams.end_date} • {searchParams.travelers} traveler{searchParams.travelers > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isSearching ? "default" : "secondary"}>
            {isSearching ? 'Searching...' : 'Complete'}
          </Badge>
          <Button
            onClick={startSearch}
            disabled={isSearching}
            variant="outline"
            size="sm"
          >
            {isSearching ? 'Searching...' : 'Retry Search'}
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Progress</span>
          <span>{Math.round(results.overallProgress)}%</span>
        </div>
        <Progress value={results.overallProgress} className="h-2" />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flights Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plane className="h-5 w-5" />
              <span>Flights</span>
              <Badge variant="outline">
                {results.flights.status === 'loading' ? 'Searching' : 'Complete'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.flights.status === 'loading' ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{results.flights.message || 'Searching flights...'}</span>
                  <span>{results.flights.progress}%</span>
                </div>
                <Progress value={results.flights.progress} className="h-1" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ) : results.flights.data?.length ? (
              <div className="space-y-4">
                {results.flights.data.map((flight, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{flight.airline}</h4>
                        <p className="text-sm text-gray-600">{flight.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${flight.price}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm">{flight.rating || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No flights found</p>
            )}
          </CardContent>
        </Card>

        {/* Hotels Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hotel className="h-5 w-5" />
              <span>Hotels</span>
              <Badge variant="outline">
                {results.hotels.status === 'loading' ? 'Searching' : 'Complete'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.hotels.status === 'loading' ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{results.hotels.message || 'Finding hotels...'}</span>
                  <span>{results.hotels.progress}%</span>
                </div>
                <Progress value={results.hotels.progress} className="h-1" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ) : results.hotels.data?.length ? (
              <div className="space-y-4">
                {results.hotels.data.map((hotel, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{hotel.name}</h4>
                        <p className="text-sm text-gray-600">Per night</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${hotel.price}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm">{hotel.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hotels found</p>
            )}
          </CardContent>
        </Card>

        {/* Activities Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Activities</span>
              <Badge variant="outline">
                {results.activities.status === 'loading' ? 'Searching' : 'Complete'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.activities.status === 'loading' ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{results.activities.message || 'Finding activities...'}</span>
                  <span>{results.activities.progress}%</span>
                </div>
                <Progress value={results.activities.progress} className="h-1" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ) : results.activities.data?.length ? (
              <div className="space-y-4">
                {results.activities.data.map((activity, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{activity.name}</h4>
                        <p className="text-sm text-gray-600">Activity</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${activity.price}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm">{activity.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No activities found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Optimal Combinations */}
      {results.combinations && results.combinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Recommended Combinations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.combinations.slice(0, 3).map((combo, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">Option {idx + 1}</h4>
                    <div className="text-right">
                      <p className="font-bold text-lg">${combo.total_cost}</p>
                      <p className="text-sm text-gray-600">Total Cost</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="font-medium">Flight</p>
                      <p>{combo.flight?.airline}</p>
                      <p className="text-gray-600">${combo.flight?.price}</p>
                    </div>
                    <div>
                      <p className="font-medium">Hotel</p>
                      <p>{combo.hotel?.name}</p>
                      <p className="text-gray-600">${combo.hotel?.price}/night</p>
                    </div>
                    <div>
                      <p className="font-medium">Activities</p>
                      <p>{combo.activities?.length || 0} activities</p>
                      <p className="text-gray-600">
                        ${combo.activities?.reduce((sum: number, act: any) => sum + act.price, 0) || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <Badge variant="outline">
                      {Math.round(combo.compatibility_score * 100)}% Match
                    </Badge>
                    <Button size="sm">
                      Select This Option
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Updates Stream */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Live Updates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {updates.slice(-10).reverse().map((update, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>{update.message}</span>
                <span className="text-gray-500">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {updates.length === 0 && (
              <p className="text-gray-500">No updates yet...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 