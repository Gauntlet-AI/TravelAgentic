/**
 * ItineraryReview Component
 * Main review interface for Phase 4 - allows users to review and customize their complete itinerary
 * Supports natural language modifications, common edits, and change tracking
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Plane,
  Hotel,
  Activity,
  Edit,
  Share,
  Download,
  History,
  MessageCircle,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Bot,
  Plus
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useItinerary } from '@/contexts/ItineraryContext';
import { useRouter } from 'next/navigation';
import { sortItineraryItemsJSON } from '@/lib/utils';
import { ActivityEditDialog } from './ActivityEditDialog';
import { AddActivityDialog } from './AddActivityDialog';
import { ChatInterface } from '@/components/chat-interface';
import { MobileChatBubble } from '@/components/mobile-chat-bubble';
import { useIsMobile } from '@/hooks/use-mobile';

interface ItineraryItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
  time: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'suggested' | 'confirmed' | 'modified' | 'user_added';
  details?: any;
  price?: string;
  duration?: string;
  location?: string;
  lastModified?: string;
  timezoneInfo?: {
    timezone: string;
    abbreviation: string;
    displayTime: string;
    nextDay?: boolean;
  };
  travelToNext?: {
    distance: number;
    duration: number;
    method: 'walking' | 'taxi' | 'public_transport' | 'driving';
    cost?: number;
  };
  bufferAfter?: number;
}

interface ItineraryDay {
  date: Date;
  dayNumber: number;
  title: string;
  items: ItineraryItem[];
  totalCost?: number;
  totalDuration?: string;
}

export default function ItineraryReview() {
  const { state, removeItineraryItem, updateItineraryItem, addItineraryItem } = useItinerary();
  const router = useRouter();
  const [isModifying, setIsModifying] = useState(false);
  const [modifications, setModifications] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{ item: any; dayIndex: number } | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addingToDayIndex, setAddingToDayIndex] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  // Handle scroll to adjust chat panel position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Adjust based on header height (140px = 64px header + 76px progress)
      setIsScrolled(scrollPosition > 140);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /**
   * Handle opening the edit dialog for an activity
   */
  function handleActivityEdit(item: any, dayIndex: number) {
    setEditingActivity({ item, dayIndex });
    setEditDialogOpen(true);
  }

  /**
   * Handle removing an activity from the itinerary
   */
  async function handleRemoveActivity(activityId: string, dayIndex: number) {
    try {
      removeItineraryItem(dayIndex, activityId);
      handleModification({
        type: 'removal',
        description: `Removed activity from Day ${dayIndex + 1}`,
        itemId: activityId
      });
    } catch (error) {
      console.error('Failed to remove activity:', error);
      throw error;
    }
  }

  /**
   * Handle moving an activity to another day
   */
  async function handleMoveActivity(activityId: string, fromDayIndex: number, toDayIndex: number) {
    try {
      // Find the activity in the current day
      const currentDay = state.days[fromDayIndex];
      const activityToMove = currentDay?.items.find(item => item.id === activityId);
      
      if (!activityToMove) {
        throw new Error('Activity not found');
      }

      // Remove from current day
      removeItineraryItem(fromDayIndex, activityId);
      
      // Add to new day
      addItineraryItem(toDayIndex, activityToMove);
      
      handleModification({
        type: 'move',
        description: `Moved activity from Day ${fromDayIndex + 1} to Day ${toDayIndex + 1}`,
        itemId: activityId
      });
    } catch (error) {
      console.error('Failed to move activity:', error);
      throw error;
    }
  }

  /**
   * Handle adding a new activity to a specific day
   */
  function handleAddActivity(dayIndex: number) {
    setAddingToDayIndex(dayIndex);
    setAddDialogOpen(true);
  }

  /**
   * Handle actually adding the activity from the dialog
   */
  function handleActivityAdded(dayIndex: number, activity: any) {
    // Add the activity to the itinerary
    addItineraryItem(dayIndex, activity);
    
    // Track the modification
    handleModification({
      type: 'addition',
      description: `Added activity to Day ${dayIndex + 1}`,
      itemId: activity.id
    });
  }

  /**
   * Handle replacing an activity with a new one
   */
  async function handleReplaceActivity(activityId: string, dayIndex: number, newActivity: any) {
    try {
      // Find the original activity to get its timing
      const currentDay = state.days[dayIndex];
      const originalActivity = currentDay?.items.find(item => item.id === activityId);
      
      if (!originalActivity) {
        throw new Error('Original activity not found');
      }

      // Create new activity with proper formatting
      const replacementActivity = {
        id: newActivity.id || `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'activity' as const,
        name: newActivity.name,
        description: newActivity.shortDescription || newActivity.description,
        startTime: originalActivity.startTime,
        endTime: originalActivity.endTime,
        location: newActivity.location?.address || newActivity.location,
        price: newActivity.price?.amount || 0,
        currency: newActivity.price?.currency || 'USD',
        status: 'suggested' as const,
        source: 'ai' as const,
        metadata: newActivity
      };

      // Remove old activity
      removeItineraryItem(dayIndex, activityId);
      
      // Add new activity
      addItineraryItem(dayIndex, replacementActivity);
      
      handleModification({
        type: 'replacement',
        description: `Replaced activity on Day ${dayIndex + 1}`,
        itemId: activityId,
        newItemId: replacementActivity.id
      });
    } catch (error) {
      console.error('Failed to replace activity:', error);
      throw error;
    }
  }

  // Use real itinerary data from context instead of hardcoded mock data
  const itinerary = useMemo(() => {
    if (!state.days || state.days.length === 0) {
      return {
        id: 'itinerary_1',
        lastModified: new Date().toISOString(),
        status: 'reviewing' as const,
        totalCost: 0,
        destination: state.travelDetails?.destination || '',
        days: [],
        removedDuplicates: 0
      };
    }

    // Track seen activities to prevent duplicates across all days
    const seenActivities = new Set<string>();
    let removedDuplicates = 0;

    // Collect all activities across all days for proper redistribution
    const allActivities = state.days
      .filter((day): day is NonNullable<typeof day> => day != null)
      .flatMap((day, dayIndex) => {
        const dayItems = Array.isArray(day.items) ? day.items : [];
        return dayItems
          .filter((item): item is typeof item & { startTime: Date } => 
            item != null && item.startTime !== undefined
          )
          .map(item => ({ ...item, originalDayIndex: dayIndex }));
      });

    // Separate arrival flights, return flights, and hotel check-ins
    const arrivalFlights = allActivities.filter(item => 
      item.type === 'flight' && (
        item.name?.toLowerCase().includes('to ' + (state.travelDetails?.destination || '').toLowerCase()) ||
        item.description?.toLowerCase().includes('to ' + (state.travelDetails?.destination || '').toLowerCase()) ||
        (!item.name?.toLowerCase().includes('return') && !item.description?.toLowerCase().includes('return'))
      )
    );
    
    const returnFlights = allActivities.filter(item => 
      item.type === 'flight' && (
        item.name?.toLowerCase().includes('return') ||
        item.description?.toLowerCase().includes('return') ||
        item.name?.toLowerCase().includes('to austin') ||
        item.name?.toLowerCase().includes('to home') ||
        item.description?.toLowerCase().includes('to austin') ||
        item.description?.toLowerCase().includes('to home')
      )
    );
    
    const hotelCheckins = allActivities.filter(item => 
      item.type === 'hotel' && (
        item.name?.toLowerCase().includes('check-in') || 
        item.name?.toLowerCase().includes('check in') ||
        item.description?.toLowerCase().includes('check-in') ||
        item.description?.toLowerCase().includes('check in')
      )
    );
    
    const otherActivities = allActivities.filter(item => 
      item.type !== 'flight' && !(item.type === 'hotel' && (
        item.name?.toLowerCase().includes('check-in') || 
        item.name?.toLowerCase().includes('check in') ||
        item.description?.toLowerCase().includes('check-in') ||
        item.description?.toLowerCase().includes('check in')
      ))
    );

    // Debug logging
    console.log('Total activities found:', allActivities.length);
    console.log('Arrival flights:', arrivalFlights.length, arrivalFlights.map((a: any) => a.name));
    console.log('Return flights:', returnFlights.length, returnFlights.map((a: any) => a.name));
    console.log('Hotel check-ins:', hotelCheckins.length, hotelCheckins.map((a: any) => a.name));
    console.log('Other activities:', otherActivities.length, otherActivities.map((a: any) => a.name));

    // Convert context data to display format with proper null checks
    const convertedDays = state.days
      .filter((day): day is NonNullable<typeof day> => day != null) // Filter out null/undefined days
      .map((day, dayIndex) => {
        const dayDate = new Date(state.travelDetails?.startDate || new Date());
        dayDate.setDate(dayDate.getDate() + dayIndex);
        
        const dayTitle = dayIndex === 0 ? "Arrival Day" : 
                         dayIndex === state.days.length - 1 ? "Departure Day" :
                         "";

        // Determine which activities belong to this day
        let dayActivities: any[] = [];
        
        if (dayIndex === 0) {
          // Day 1: Include arrival flights and hotel check-ins
          dayActivities = [...arrivalFlights, ...hotelCheckins];
          
          // Also include any other activities that were originally assigned to Day 1
          const originalDay1Activities = otherActivities.filter(item => item.originalDayIndex === 0);
          dayActivities = [...dayActivities, ...originalDay1Activities];
          
          console.log(`Day ${dayIndex + 1}: Adding ${arrivalFlights.length} arrival flights, ${hotelCheckins.length} hotel check-ins, and ${originalDay1Activities.length} original Day 1 activities`);
        } else if (dayIndex === state.days.length - 1) {
          // Last day: Include return flights and activities originally assigned to this day
          dayActivities = [...returnFlights];
          
          const originalLastDayActivities = otherActivities.filter(item => item.originalDayIndex === dayIndex);
          dayActivities = [...dayActivities, ...originalLastDayActivities];
          
          console.log(`Day ${dayIndex + 1}: Adding ${returnFlights.length} return flights and ${originalLastDayActivities.length} original activities`);
        } else {
          // Other days: Include activities originally assigned to this day (excluding arrival/return flights)
          dayActivities = otherActivities.filter(item => item.originalDayIndex === dayIndex);
          
          console.log(`Day ${dayIndex + 1}: Adding ${dayActivities.length} activities originally assigned to this day`);
        }

        // Sort activities by time using JSON-based sorting
        const sortedItems = sortItineraryItemsJSON(dayActivities);

        // Filter out duplicates based on activity name/title
        const uniqueItems = sortedItems.filter((item: any) => {
          const activityKey = `${item.type}-${item.name}`.toLowerCase();
          
          // Always allow flights and hotels (they can be repeated legitimately)
          if (item.type === 'flight' || item.type === 'hotel') {
            return true;
          }
          
          // For activities and restaurants, check for duplicates
          if (seenActivities.has(activityKey)) {
            removedDuplicates++;
            console.log(`Removed duplicate activity: ${item.name} on Day ${dayIndex + 1}`);
            return false;
          }
          
          seenActivities.add(activityKey);
          return true;
        });

        const items = uniqueItems.map((item: any) => {
          // Use timezone-aware time display if available
          const timeDisplay = item.timezoneInfo?.displayTime 
            ? `${new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${item.timezoneInfo.abbreviation}`
            : item.startTime 
            ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '9:00 AM';
          
          // Enhanced description with duration and travel info
          let enhancedDescription = item.description || '';
          if (item.type === 'flight' && item.timezoneInfo?.nextDay) {
            enhancedDescription += ` (arrives next day in ${item.timezoneInfo.abbreviation})`;
          }
          
          // Add duration information to description if available
          if (item.duration?.description) {
            enhancedDescription += ` • Duration: ${item.duration.description}`;
          }
          
          // Add travel information to description if available
          if (item.travelToNext) {
            const travelMethod = item.travelToNext.method === 'walking' ? '🚶' : 
                                item.travelToNext.method === 'taxi' ? '🚕' : 
                                item.travelToNext.method === 'public_transport' ? '🚌' : '🚗';
            const travelCost = item.travelToNext.cost ? ` ($${item.travelToNext.cost})` : '';
            enhancedDescription += ` • ${travelMethod} ${item.travelToNext.duration}min to next${travelCost}`;
          }
          
          // Calculate price based on item type
          let displayPrice;
          if (item.price) {
            if (item.type === 'hotel') {
              // For hotels, multiply per-night rate by number of nights
              // Use the actual number of days from the itinerary - 1 for nights
              const nights = Math.max(1, state.days.length - 1);
              const totalHotelCost = item.price * nights;
              displayPrice = `$${totalHotelCost} (${nights} nights)`;
            } else {
              displayPrice = `$${item.price}`;
            }
          }
          
          return {
            id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: item.type || 'activity',
            time: timeDisplay,
            title: item.name || 'Untitled Item',
            description: enhancedDescription,
            icon: item.type === 'flight' ? <Plane className="h-4 w-4" /> :
                  item.type === 'hotel' ? <Hotel className="h-4 w-4" /> :
                  <Activity className="h-4 w-4" />,
            status: item.status || 'suggested',
            price: displayPrice,
            duration: item.duration?.description || 
              (item.startTime && item.endTime ? 
                `${Math.round((new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / (1000 * 60))}m` : 
                undefined),
            location: item.location,
            lastModified: item.lastModified,
            timezoneInfo: item.timezoneInfo,
            travelToNext: item.travelToNext,
            bufferAfter: item.bufferAfter
          };
        });

        const totalCost = uniqueItems.reduce((sum: number, item: any) => {
          if (!item?.price) return sum;
          
          // Calculate actual cost for hotels (multiply by nights)
          if (item.type === 'hotel') {
            const nights = Math.max(1, state.days.length - 1);
            return sum + (item.price * nights);
          }
          
          return sum + item.price;
        }, 0);
        
        return {
          date: dayDate,
          dayNumber: dayIndex + 1,
          title: dayTitle,
          totalCost,
          totalDuration: `${items.length * 2} hours`,
          items
        };
      });

    const totalCost = convertedDays.reduce((sum, day) => sum + (day.totalCost || 0), 0);

    return {
      id: 'itinerary_1',
      lastModified: new Date().toISOString(),
      status: 'reviewing' as const,
      totalCost,
      destination: state.travelDetails?.destination || '',
      days: convertedDays,
      removedDuplicates
         };
   }, [state.days, state.travelDetails]);

  /**
   * Handle modification requests from various sources
   */
  function handleModification(modification: any) {
    setIsModifying(true);
    
    // Add to modifications list
    setModifications(prev => [...prev, {
      id: `mod_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...modification
    }]);

    // Simulate processing time
    setTimeout(() => {
      // Apply the modification to itinerary via context
      // TODO: Implement actual modification logic through context
      setIsModifying(false);
    }, 1500);
  }

  /**
   * Format date for display
   */
  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get status color for items
   */
  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'modified': return 'bg-blue-100 text-blue-800';
      case 'user_added': return 'bg-purple-100 text-purple-800';
      case 'suggested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get type icon for items
   */
  function getTypeIcon(type: string) {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'hotel': return <Hotel className="h-4 w-4" />;
      case 'activity':
      case 'restaurant': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  }

  // AI Chat system prompt for itinerary review
  const aiSystemPrompt = `You are TravelAgentic's AI Travel Agent in ITINERARY REVIEW mode. Help users modify their itinerary through natural language.

CONTEXT: The user is reviewing their generated itinerary and wants to make changes.

CAPABILITIES:
- Modify existing activities (remove, replace, move between days)
- Add new activities or experiences
- Adjust timing and scheduling
- Provide recommendations for improvements
- Answer questions about the itinerary

BEHAVIOR:
- Be helpful and responsive to modification requests
- Understand natural language like "remove the museum visit" or "add more outdoor activities"
- Provide specific suggestions when asked
- Confirm changes before applying them
- Be concise but informative

STYLE:
- Conversational and helpful
- Ask clarifying questions when needed
- Provide brief explanations for recommendations
- Use friendly, professional tone

LIMITATIONS:
- Focus on itinerary modifications only
- Don't make bookings or handle payments
- Direct users to finalize their itinerary when ready`;

  if (!state.travelDetails) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Itinerary to Review
          </h2>
          <p className="text-gray-600 mb-6">
            Please complete the itinerary building process first.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Return to Building
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Container for proper layout alignment */}
        <div className="lg:mr-[384px]">
          {/* Floating Header */}
          <div className="sticky top-0 z-20 pb-6">
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Review your Itinerary
                  </h1>
                  <p className="text-lg text-gray-600">
                    Customize your {state.travelDetails.destination} trip
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Dialog open={showHistory} onOpenChange={setShowHistory}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <History className="h-4 w-4 mr-2" />
                        History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Modification History</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh]">
                        <div className="p-4 text-center text-gray-500">
                          Modification History - Coming in Phase 4
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      // Navigate to finalization page with itinerary data
                      const itineraryId = itinerary.id;
                      router.push(`/itinerary/finalize?itineraryId=${itineraryId}&mode=finalize`);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm & Book
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Status Alert */}
            {isModifying && (
              <Alert className="border-blue-200 bg-blue-50">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Processing your modification request...
                </AlertDescription>
              </Alert>
            )}



            {/* Trip Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Destination</p>
                      <p className="font-semibold">{state.travelDetails.destination}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{itinerary.days.length} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Travelers</p>
                      <p className="font-semibold">{state.travelDetails.travelers} people</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Cost</p>
                      <p className="font-semibold">${itinerary.totalCost}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Itinerary Days */}
            <div className="space-y-6">
              {itinerary.days.map((day, dayIndex) => (
                <Card key={dayIndex} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Day {day.dayNumber}{day.title ? ` - ${day.title}` : ''}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(day.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {day.items.length} activities
                        </Badge>
                        <Badge variant="outline">
                          ${day.totalCost}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleAddActivity(dayIndex)}
                          title="Add activity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    {day.items.length === 0 ? (
                      <div className="p-6 flex items-center justify-between">
                        <p className="text-gray-400 text-sm">Rest Day (No activities scheduled)</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          onClick={() => handleAddActivity(dayIndex)}
                          title="Add activity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {day.items.map((item, itemIndex) => (
                        <div 
                          key={item.id} 
                          className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleActivityEdit(item, dayIndex)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                              {getTypeIcon(item.type)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {item.title}
                                </h3>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {item.time}
                                </div>
                                <Badge 
                                  className={`text-xs ${getStatusColor(item.status)}`}
                                >
                                  {item.status.replace('_', ' ')}
                                </Badge>
                                {item.price && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.price}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {item.description}
                              </p>
                              {item.lastModified && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Last modified: {new Date(item.lastModified).toLocaleString()}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </CardContent>
                </Card>
              ))}
            </div>

                    {/* Last Modified Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>
              Last modified: {new Date(itinerary.lastModified).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>{modifications.length} modifications made</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Desktop AI Chat Interface - Right Panel (hidden on mobile) */}
  <div 
    className={`hidden lg:block fixed right-0 bottom-0 w-96 z-40 border-l bg-white transition-all duration-300 rounded-tl-lg overflow-hidden ${
      isScrolled ? 'top-0' : 'top-[140px]'
    }`}
  >
    <ChatInterface
      customSystemPrompt={aiSystemPrompt}
      customPlaceholder="Ask me to modify your itinerary..."
      customEmptyStateMessage="I can help you modify your itinerary! Try saying 'remove the museum visit' or 'add more outdoor activities'."
      onTripInfoUpdate={() => {}} // Not needed for review mode
      tripInfoComplete={false} // Don't show completion message in review mode
      className="h-full"
    />
  </div>

  {/* Mobile AI Chat Bubble (visible on mobile only) */}
  <div className="lg:hidden">
    <MobileChatBubble
      customSystemPrompt={aiSystemPrompt}
      customPlaceholder="Ask me to modify your itinerary..."
      customEmptyStateMessage="I can help you modify your itinerary! Try saying 'remove the museum visit' or 'add more outdoor activities'."
      onTripInfoUpdate={() => {}} // Not needed for review mode
      tripInfoComplete={false} // Don't show completion message in review mode
      defaultOpen={false}
    />
  </div>

  {/* Activity Edit Dialog */}
  {editingActivity && (
    <ActivityEditDialog
      isOpen={editDialogOpen}
      onClose={() => setEditDialogOpen(false)}
      activity={editingActivity.item}
      currentDayIndex={editingActivity.dayIndex}
      totalDays={itinerary.days.length}
      tripDetails={{
        origin: 'AUS', // TODO: Get from user's actual origin
        destination: state.travelDetails?.destination || '',
        startDate: state.travelDetails?.startDate || new Date(),
        endDate: state.travelDetails?.endDate || new Date(),
        travelers: state.travelDetails?.travelers || 1
      }}
      onRemove={handleRemoveActivity}
      onMove={handleMoveActivity}
      onReplace={handleReplaceActivity}
    />
  )}

  {/* Add Activity Dialog */}
  <AddActivityDialog
    isOpen={addDialogOpen}
    onClose={() => {
      setAddDialogOpen(false);
      setAddingToDayIndex(null);
    }}
    dayIndex={addingToDayIndex || 0}
    tripDetails={{
      destination: state.travelDetails?.destination || '',
      startDate: state.travelDetails?.startDate || new Date(),
      endDate: state.travelDetails?.endDate || new Date()
    }}
    onAdd={handleActivityAdded}
  />
    </>
  );
} 