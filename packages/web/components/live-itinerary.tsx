'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plane, 
  Hotel, 
  MapPin, 
  Calendar, 
  DollarSign,
  Clock,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit3,
  Sparkles,
  RefreshCw,
  Play,
  Pause,
  Star,
  Utensils,
  Camera,
  Car,
  Wifi,
  Coffee
} from 'lucide-react';

// Import LangGraph hooks
import { 
  useLangGraphConversation, 
  type ItinerarySection as LangGraphItinerarySection 
} from '@/hooks/use-langgraph-conversation';
import { getAutomationLevelDescription } from '@/lib/langgraph-service';

interface LiveItineraryProps {
  conversationId?: string;
  automationLevel?: number;
  isActive?: boolean;
  onSectionModify?: (sectionId: string, sectionType: string) => void;
  onAutomationLevelChange?: (level: number) => void;
  onAutomationPause?: () => void;
  onAutomationResume?: () => void;
  onAutomationReset?: () => void;
  onConversationStart?: (conversationId: string) => void;
  className?: string;
  travelDetails?: any; // Travel details to start conversation with
}

const SECTION_ICONS = {
  flights: Plane,
  accommodation: Hotel,
  activities: MapPin,
  logistics: Calendar,
  booking: DollarSign
};

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-600',
  loading: 'bg-blue-100 text-blue-600',
  complete: 'bg-green-100 text-green-600',
  error: 'bg-red-100 text-red-600'
};

export default function LiveItinerary({
  conversationId: externalConversationId,
  automationLevel: externalAutomationLevel = 1,
  isActive = false,
  onSectionModify,
  onAutomationLevelChange,
  onAutomationPause,
  onAutomationResume,
  onAutomationReset,
  onConversationStart,
  className = '',
  travelDetails
}: LiveItineraryProps) {
  // Use LangGraph conversation hook
  const {
    conversationId,
    isConnected,
    isLoading,
    messages,
    automationLevel,
    itinerarySections,
    overallProgress,
    currentDestination,
    error,
    startFromTravelDetails,
    sendMessage,
    modifySection,
    changeAutomationLevel,
    disconnect,
    isActive: isConversationActive,
    completedSections,
    totalSections
  } = useLangGraphConversation({
    automationLevel: externalAutomationLevel,
    onError: (error) => {
      console.error('LangGraph conversation error:', error);
    },
    onConversationComplete: (id) => {
      console.log('Conversation completed:', id);
    }
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Start conversation when travel details are provided and isActive becomes true
  useEffect(() => {
    if (isActive && travelDetails && !conversationId && !isLoading) {
      startFromTravelDetails(travelDetails)
        .then((newConversationId) => {
          onConversationStart?.(newConversationId);
        })
        .catch((error) => {
          console.error('Failed to start conversation:', error);
        });
    }
  }, [isActive, travelDetails, conversationId, isLoading, startFromTravelDetails, onConversationStart]);

  // Handle external automation level changes
  useEffect(() => {
    if (externalAutomationLevel !== automationLevel && conversationId) {
      changeAutomationLevel(externalAutomationLevel)
        .catch((error) => {
          console.error('Failed to change automation level:', error);
        });
    }
  }, [externalAutomationLevel, automationLevel, conversationId, changeAutomationLevel]);

  // Handle section modification
  const handleSectionModify = (sectionId: string, sectionType: string) => {
    if (conversationId) {
      // You can customize this based on the section type
      const modifications = {
        action: 'modify',
        preferences: {} // Could be filled with user preferences
      };
      
      modifySection(sectionId, modifications)
        .catch((error) => {
          console.error('Failed to modify section:', error);
        });
    }
    
    onSectionModify?.(sectionId, sectionType);
  };

  // Handle automation level changes
  const handleAutomationLevelChange = (newLevel: number) => {
    if (conversationId) {
      changeAutomationLevel(newLevel)
        .then(() => {
          onAutomationLevelChange?.(newLevel);
        })
        .catch((error) => {
          console.error('Failed to change automation level:', error);
        });
    }
  };

  // Calculate total cost from booking section
  const getTotalCost = () => {
    const bookingSection = itinerarySections.find(s => s.id === 'booking');
    return bookingSection?.data?.total || 0;
  };

  // Get current destination from travel details or conversation state
  const displayDestination = currentDestination || travelDetails?.destination || '';

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Live Itinerary</h1>
            {displayDestination && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {displayDestination}
              </Badge>
            )}
            {error && (
              <Badge variant="destructive" className="bg-red-50 text-red-700">
                Error: {error}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAutomationLevelChange(automationLevel === 4 ? 1 : automationLevel + 1)}
              disabled={!conversationId || isLoading}
              title={getAutomationLevelDescription(automationLevel)}
            >
              Level {automationLevel}
            </Button>
            
            <Badge variant={isConversationActive ? "default" : "outline"} className={isConversationActive ? "bg-green-500" : ""}>
              {isConversationActive ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  Planning
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                  {conversationId ? "Ready" : "Waiting"}
                </>
              )}
            </Badge>

            {/* Control buttons */}
            <div className="flex gap-1">
              {isConversationActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAutomationPause}
                  title="Pause automation"
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              
              {!isConversationActive && conversationId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAutomationResume}
                  title="Resume automation"
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  disconnect();
                  onAutomationReset?.();
                }}
                title="Reset conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {overallProgress > 0 && (
          <div className="space-y-2">
            <Progress value={overallProgress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>AI agents working on your itinerary...</span>
              <span>{completedSections}/{totalSections} sections complete</span>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {!isConnected && conversationId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Reconnecting to LangGraph service...</span>
            </div>
          </div>
        )}
      </div>

      {/* Itinerary Content */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {/* Welcome message when no conversation is active */}
          {!conversationId && !isLoading && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-700 mb-2">
                  Ready to Plan Your Perfect Trip
                </h3>
                <p className="text-blue-600 mb-4">
                  {travelDetails 
                    ? "Click 'Start Planning' to begin building your itinerary with AI agents"
                    : "Fill out your travel details and start planning to see live itinerary updates here"
                  }
                </p>
                {travelDetails && (
                  <div className="text-sm text-blue-500">
                    <p><strong>Destination:</strong> {travelDetails.destination}</p>
                    <p><strong>Automation Level:</strong> {getAutomationLevelDescription(automationLevel)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Itinerary sections */}
          {itinerarySections.map((section, index) => (
            <div key={section.id} id={`section-${section.id}`}>
              <ItinerarySection
                section={section}
                onModify={() => handleSectionModify(section.id, section.type)}
                automationLevel={automationLevel}
                isConnected={isConnected}
              />
              
              {index < itinerarySections.length - 1 && <Separator className="my-6" />}
            </div>
          ))}
        </div>

        {/* Trip Summary */}
        {completedSections > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Trip Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{completedSections} of {totalSections} sections ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span>Total: ${getTotalCost().toLocaleString()}</span>
                </div>
              </div>
              
              {conversationId && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Conversation ID: {conversationId.slice(0, 8)}...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent messages from AI agents */}
        {messages.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Agent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {messages.slice(-3).map((message, index) => (
                  <div key={index} className="text-sm p-2 rounded bg-gray-50">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-700">{message.content}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.role}
                      </Badge>
                    </div>
                    {message.metadata?.section && (
                      <div className="text-xs text-gray-500 mt-1">
                        Section: {message.metadata.section}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </ScrollArea>
    </div>
  );
}

function ItinerarySection({ 
  section, 
  onModify, 
  automationLevel,
  isConnected 
}: { 
  section: LangGraphItinerarySection;
  onModify: () => void;
  automationLevel: number;
  isConnected: boolean;
}) {
  const IconComponent = SECTION_ICONS[section.type as keyof typeof SECTION_ICONS];
  const isLoading = section.status === 'loading';
  const isComplete = section.status === 'complete';
  const hasError = section.status === 'error';

  return (
    <Card className={`transition-all duration-300 ${
      isLoading ? 'ring-2 ring-blue-200 bg-blue-50' : ''
    } ${isComplete ? 'ring-2 ring-green-200 bg-green-50' : ''} ${
      hasError ? 'ring-2 ring-red-200 bg-red-50' : ''
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isLoading ? 'bg-blue-500' : 
              isComplete ? 'bg-green-500' : 
              hasError ? 'bg-red-500' : 'bg-gray-400'
            }`}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <IconComponent className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              {section.agentMessage && (
                <p className="text-sm text-gray-600">{section.agentMessage}</p>
              )}
              {!isConnected && section.status === 'loading' && (
                <p className="text-xs text-yellow-600">⚠️ Connection lost - will retry automatically</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[section.status as keyof typeof STATUS_COLORS]}>
              {section.status}
            </Badge>
            
            {section.canModify && (isComplete || hasError) && (
              <Button 
                onClick={onModify}
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
                title="Modify this section"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Section Content - render actual data from LangGraph */}
          {section.data && (
            <div className="rounded-lg bg-white p-4 border">
              <SectionContent 
                type={section.type}
                data={section.data}
                automationLevel={automationLevel}
              />
            </div>
          )}

          {/* Empty state */}
          {!section.data && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <IconComponent className="h-8 w-8 text-gray-400" />
              </div>
              <p>Waiting for AI agents to generate {section.title.toLowerCase()}...</p>
              {!isConnected && (
                <p className="text-sm text-yellow-600 mt-2">
                  Connection to LangGraph service lost. Attempting to reconnect...
                </p>
              )}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
              <p className="text-blue-600 font-medium">AI agents are working on this section...</p>
              <p className="text-sm text-gray-500 mt-1">{section.agentMessage}</p>
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">Error generating {section.title.toLowerCase()}</p>
              <p className="text-sm text-gray-500 mt-1">{section.agentMessage}</p>
              <Button 
                onClick={onModify} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                Retry Section
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Keep the existing SectionContent component for rendering section data
function SectionContent({ 
  type, 
  data, 
  automationLevel 
}: { 
  type: string;
  data: any;
  automationLevel: number;
}) {
  // This component will render the actual data from LangGraph
  // For now, we'll keep a simplified version that can handle various data formats
  
  if (!data) return null;

  // Handle different data formats that might come from LangGraph
  switch (type) {
    case 'flights':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-4">
              <Plane className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-semibold text-lg">
                  {data.airline || 'Flight'} {data.flightNumber || ''}
                </p>
                <p className="text-sm text-gray-600">{data.aircraft || ''}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {data.departure || ''} → {data.arrival || ''}
                  </span>
                  {data.stops !== undefined && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {data.stops === 0 ? 'Direct' : `${data.stops} stop${data.stops !== 1 ? 's' : ''}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                ${data.price || 0}
              </p>
              <p className="text-sm text-gray-600">{data.duration || ''}</p>
            </div>
          </div>
        </div>
      );

    case 'accommodation':
      return (
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-start gap-4">
              <Hotel className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <p className="font-semibold text-lg">{data.name || 'Hotel'}</p>
                <p className="text-sm text-gray-600 mb-2">{data.location || ''}</p>
                {data.rating && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{data.rating}</span>
                    </div>
                  </div>
                )}
                {data.amenities && Array.isArray(data.amenities) && (
                  <div className="flex flex-wrap gap-2">
                    {data.amenities.slice(0, 3).map((amenity: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ${data.pricePerNight || data.price || 0}
              </p>
              <p className="text-sm text-gray-600">per night</p>
            </div>
          </div>
        </div>
      );

    case 'activities':
      const activities = Array.isArray(data) ? data : [data];
      return (
        <div className="space-y-3">
          {activities.map((activity: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-200 rounded-full">
                  <MapPin className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">{activity.name || activity.title || 'Activity'}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {activity.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.duration}
                      </span>
                    )}
                    {activity.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        {activity.rating}
                      </span>
                    )}
                    {activity.category && (
                      <Badge variant="outline" className="text-xs">
                        {activity.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-purple-600">
                  ${activity.price || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      );

    default:
      // Generic data renderer for other section types
      return (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      );
  }
} 