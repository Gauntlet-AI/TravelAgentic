'use client';

import { useEffect, useState, useCallback } from 'react';
import { MessageCircle, Zap, Calendar, MapPin, Clock, DollarSign } from 'lucide-react';

import { ChatInterface } from '@/components/chat-interface';
import { FlightCard } from '@/components/flight-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

import { useLangGraphConversation, type ItinerarySection } from '@/hooks/use-langgraph-conversation';

interface TileData {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  title: string;
  subtitle: string;
  price: number;
  currency: string;
  status: 'pending' | 'selected' | 'booked';
  data: any;
}

export default function TestPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [tripSummary, setTripSummary] = useState({
    destination: '',
    dates: '',
    travelers: 1,
    totalBudget: 0,
    currentSpend: 0
  });

  // Initialize LangGraph conversation with automation level 4
  const {
    conversationId: currentConversationId,
    isConnected,
    isLoading,
    messages,
    currentStep,
    automationLevel,
    shoppingCart,
    progress,
    error,
    itinerarySections,
    overallProgress,
    currentDestination,
    sendMessage,
    startConversation,
    changeAutomationLevel
  } = useLangGraphConversation({
    automationLevel: 4, // Force automation level 4
    enablePersistence: false, // Disable persistence for clean test sessions
    onError: (error) => console.error('LangGraph error:', error),
    onConversationComplete: (id) => console.log('Conversation completed:', id)
  });

  // Update conversation ID when it changes
  useEffect(() => {
    if (currentConversationId && currentConversationId !== conversationId) {
      setConversationId(currentConversationId);
    }
  }, [currentConversationId, conversationId]);

  // Force automation level to 4 if it changes
  useEffect(() => {
    if (automationLevel !== 4 && changeAutomationLevel && conversationId) {
      changeAutomationLevel(4);
    }
  }, [automationLevel, changeAutomationLevel, conversationId]);

  // Update tiles based on shopping cart and itinerary sections
  const updateTilesFromItinerary = useCallback(() => {
    const newTiles: TileData[] = [];

    // Process flights from shopping cart
    if (shoppingCart?.flights) {
      shoppingCart.flights.forEach((flight: any, index: number) => {
        newTiles.push({
          id: `flight-${index}`,
          type: 'flight',
          title: `${flight.airline || 'Flight'} ${flight.flight_number || ''}`,
          subtitle: `${flight.departure_airport || 'Origin'} → ${flight.destination_airport || 'Destination'}`,
          price: flight.price || 0,
          currency: flight.currency || 'USD',
          status: flight.booking_status === 'booked' ? 'booked' : 'selected',
          data: flight
        });
      });
    }

    // Process hotels from shopping cart
    if (shoppingCart?.hotels) {
      shoppingCart.hotels.forEach((hotel: any, index: number) => {
        newTiles.push({
          id: `hotel-${index}`,
          type: 'hotel',
          title: hotel.name || 'Hotel',
          subtitle: `${hotel.location || 'Location'} • ${hotel.rating || 'No'} stars`,
          price: hotel.nightly_rate || hotel.price_per_night || 0,
          currency: hotel.currency || 'USD',
          status: hotel.booking_status === 'booked' ? 'booked' : 'selected',
          data: hotel
        });
      });
    }

    // Process activities from shopping cart
    if (shoppingCart?.activities) {
      shoppingCart.activities.forEach((activity: any, index: number) => {
        newTiles.push({
          id: `activity-${index}`,
          type: 'activity',
          title: activity.name || activity.title || 'Activity',
          subtitle: activity.location || activity.description || 'Activity',
          price: activity.price || 0,
          currency: activity.currency || 'USD',
          status: activity.booking_status === 'booked' ? 'booked' : 'selected',
          data: activity
        });
      });
    }

    setTiles(newTiles);

    // Update trip summary
    const totalSpend = newTiles.reduce((sum, tile) => sum + (tile.price || 0), 0);
    setTripSummary(prev => ({
      ...prev,
      destination: currentDestination || prev.destination,
      currentSpend: totalSpend,
      travelers: shoppingCart?.travelers || prev.travelers
    }));
  }, [shoppingCart, currentDestination]);

  useEffect(() => {
    updateTilesFromItinerary();
  }, [updateTilesFromItinerary]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-green-100 text-green-800 border-green-200';
      case 'selected': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'booked': return '✅';
      case 'selected': return '🎯';
      default: return '⏳';
    }
  };

  const getTileIcon = (type: string) => {
    switch (type) {
      case 'flight': return '✈️';
      case 'hotel': return '🏨';
      case 'activity': return '🎭';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Travel Test Suite
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test automation level 4 ("I'm Feeling Lucky") mode with real-time chat and tile-based itinerary updates
          </p>
          <Badge variant="outline" className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-200">
            <Zap className="h-3 w-3 mr-1" />
            Automation Level 4 - I'm Feeling Lucky
          </Badge>
        </div>

        {/* Connection Status */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <span className="font-medium">Connection Error:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-1">
            <Card className="h-[800px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  AI Travel Assistant
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600">
                    {isConnected ? 'Connected' : 'Disconnected'} • Step: {currentStep || 'waiting'}
                  </span>
                </div>
              </CardHeader>
                              <div className="flex-1 overflow-hidden flex flex-col">
                  {!conversationId ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                      <div className="text-6xl mb-4">🤖</div>
                      <h3 className="text-xl font-semibold mb-2">Start Your AI Trip Planning</h3>
                      <p className="text-gray-600 mb-6 max-w-sm">
                        Click "Start Planning" to begin your automated travel planning experience at automation level 4. 
                        Include origin, destination, dates, travelers, and budget for best results.
                      </p>
                      <Button 
                        onClick={async () => {
                          try {
                            await startConversation({
                              message: "Hello! I'm ready to plan an amazing trip. Please help me create a personalized itinerary with flights, hotels, and activities. I'll provide you with my travel details including origin, destination, dates, number of travelers, and budget.",
                              automation_level: 4,
                              action: 'start'
                            });
                          } catch (error) {
                            console.error('Failed to start conversation:', error);
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            Start Planning
                          </>
                        )}
                      </Button>
                      <div className="mt-6 text-left w-full max-w-sm">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <p className="text-xs font-medium text-blue-800 mb-1">💡 Required Information:</p>
                          <p className="text-xs text-blue-700">
                            Origin city • Destination • Travel dates • Number of travelers • Budget range
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Or try these example prompts:</p>
                        <div className="space-y-2">
                          {[
                            "Plan a 5-day trip to Tokyo from New York, departing September 15th, 2025 for 2 adults with a $4000 budget",
                            "Weekend getaway to Paris from London, September 22-24, 2025 for 2 people, budget $1500, prefer luxury hotels",
                            "Family vacation to Orlando from Chicago, October 5-12, 2025 for 2 adults and 2 children (ages 8,12), budget $3500, Disney World focus"
                          ].map((prompt, index) => (
                            <button
                              key={index}
                              onClick={async () => {
                                try {
                                  await startConversation({
                                    message: prompt,
                                    automation_level: 4,
                                    action: 'start'
                                  });
                                } catch (error) {
                                  console.error('Failed to start conversation:', error);
                                }
                              }}
                              className="w-full text-left p-3 text-xs text-gray-600 hover:bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition-colors leading-tight"
                              disabled={isLoading}
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ChatInterface
                      className="h-full"
                      conversationId={conversationId}
                      hideCard={true}
                      onConversationStart={(id) => setConversationId(id)}
                    />
                  )}
                </div>
            </Card>
          </div>

          {/* Itinerary Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trip Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Destination</span>
                    </div>
                    <div className="font-semibold">{tripSummary.destination || 'Not set'}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Dates</span>
                    </div>
                    <div className="font-semibold">{tripSummary.dates || 'Not set'}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Budget</span>
                    </div>
                    <div className="font-semibold">${tripSummary.totalBudget}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Current</span>
                    </div>
                    <div className="font-semibold">${tripSummary.currentSpend}</div>
                  </div>
                </div>
                {overallProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Progress</span>
                      <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Itinerary Tiles */}
            <Card>
              <CardHeader>
                <CardTitle>Live Itinerary</CardTitle>
                <p className="text-sm text-gray-600">
                  Real-time updates as AI builds your trip automatically
                </p>
              </CardHeader>
              <CardContent>
                {tiles.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-lg font-semibold mb-2">Live Itinerary Building</h3>
                    <p className="text-gray-600">
                      {!conversationId 
                        ? "Start a conversation to begin building your itinerary automatically!"
                        : "AI is analyzing your request and will start building your itinerary..."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tiles.map((tile) => (
                      <Card key={tile.id} className="relative overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getTileIcon(tile.type)}</span>
                              <div>
                                <h4 className="font-semibold text-sm">{tile.title}</h4>
                                <p className="text-xs text-gray-600">{tile.subtitle}</p>
                              </div>
                            </div>
                            <Badge className={`text-xs ${getStatusColor(tile.status)}`}>
                              {getStatusIcon(tile.status)} {tile.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold">
                                ${tile.price.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">
                                {tile.currency}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {tile.type}
                            </Badge>
                          </div>

                          {/* Loading indicator for pending items */}
                          {tile.status === 'pending' && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                                AI is selecting...
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Debug Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs space-y-2">
                    <div><strong>Conversation ID:</strong> {conversationId || 'None'}</div>
                    <div><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</div>
                    <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
                    <div><strong>Current Step:</strong> {currentStep || 'None'}</div>
                    <div><strong>Automation Level:</strong> {automationLevel}</div>
                    <div><strong>Messages:</strong> {messages.length}</div>
                    <div><strong>Cart Items:</strong> {Object.keys(shoppingCart || {}).length}</div>
                    <div><strong>Overall Progress:</strong> {overallProgress}%</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 