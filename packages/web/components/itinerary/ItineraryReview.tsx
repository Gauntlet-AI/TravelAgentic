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

      // Calculate a non-conflicting time slot on the target day ----------------------------------
      const targetDay = state.days[toDayIndex];
      const existingTimes = (targetDay?.items || [])
        .filter(item => item.startTime)
        .map(item => new Date(item.startTime as string | number | Date));

      let proposedStart = activityToMove.startTime ? new Date(activityToMove.startTime) : new Date();
      let originalDuration = 2 * 60 * 60 * 1000; // default 2h
      if (activityToMove.startTime && activityToMove.endTime) {
        originalDuration = new Date(activityToMove.endTime as string | number | Date).getTime() - new Date(activityToMove.startTime as string | number | Date).getTime();
      }

      // Helper to check if a time conflict exists (same hour & minute)
      const hasConflict = (date: Date) => {
        return existingTimes.some(t => t.getHours() === date.getHours() && t.getMinutes() === date.getMinutes());
      };

      // Iterate in 2-hour increments until we find a free slot (max 24h iterations)
      let iterations = 0;
      const incrementMs = 2 * 60 * 60 * 1000; // 2 hours
      while (hasConflict(proposedStart) && iterations < 12) {
        proposedStart = new Date(proposedStart.getTime() + incrementMs);
        iterations += 1;
      }

      // Set the new times on a clone of the activity
      const updatedActivity = {
        ...activityToMove,
        startTime: proposedStart,
        endTime: new Date(proposedStart.getTime() + originalDuration),
        lastModified: new Date().toISOString(),
      };

      // Remove from current day
      removeItineraryItem(fromDayIndex, activityId);

      // Add to new day with updated time
      addItineraryItem(toDayIndex, updatedActivity);

      handleModification({
        type: 'move',
        description: `Moved activity from Day ${fromDayIndex + 1} to Day ${toDayIndex + 1}` + (iterations ? ` (new time ${proposedStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''),
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
    ).map(hotel => {
      // Get star rating from metadata or default to 4
      const starRating = hotel.metadata?.starRating || 4;
      
      return {
        ...hotel,
        // Store star rating in metadata
        metadata: {
          ...hotel.metadata,
          starRating
        },
        // Update name to include star rating if not already present
        name: hotel.name && !hotel.name.includes('★') && !hotel.name.includes('star') 
          ? `${hotel.name} (${starRating}-star)` 
          : hotel.name,
        // Update description to emphasize star quality
        description: hotel.description && !hotel.description.includes('star') 
          ? `${starRating}-star accommodation • ${hotel.description}` 
          : hotel.description
      };
    }).sort((a, b) => {
      // Prioritize 4-star hotels, then higher ratings
      const aRating = a.metadata?.starRating || 4;
      const bRating = b.metadata?.starRating || 4;
      
      // Prefer 4-star hotels over others
      if (aRating === 4 && bRating !== 4) return -1;
      if (bRating === 4 && aRating !== 4) return 1;
      
      // Then sort by rating descending
      return bRating - aRating;
    });
    
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
          // Day 1 (Arrival): Set proper arrival sequence - flights first, then hotel check-in
          const sequencedArrivalActivities = [];
          
          // Add arrival flights with realistic arrival times (morning to early afternoon)
          const processedFlights = arrivalFlights.map((flight, index) => ({
            ...flight,
            startTime: new Date(dayDate.getTime() + (10 + index * 2) * 60 * 60 * 1000), // 10 AM, 12 PM, etc.
            endTime: new Date(dayDate.getTime() + (12 + index * 2) * 60 * 60 * 1000), // 2 hours later
            travelToNext: {
              distance: 25, // km from airport to hotel
              duration: 45, // 45 minutes travel time
              method: 'taxi' as const,
              cost: 35
            }
          }));
          
          // Calculate hotel check-in time based on latest flight arrival + travel time + buffer
          const latestFlightArrival = processedFlights.length > 0 
            ? Math.max(...processedFlights.map(f => f.endTime.getTime()))
            : dayDate.getTime() + 12 * 60 * 60 * 1000; // default to 12 PM if no flights
          
          const hotelCheckInTime = Math.max(
            latestFlightArrival + 3 * 60 * 60 * 1000, // 3 hours after latest flight (travel + buffer)
            dayDate.getTime() + 15 * 60 * 60 * 1000 // but no earlier than 3:00 PM (standard check-in)
          );
          
          // Add hotel check-ins with calculated times
          const processedHotels = hotelCheckins.map((hotel, index) => ({
            ...hotel,
            startTime: new Date(hotelCheckInTime + index * 60 * 60 * 1000), // 3:00 PM+, 4:00 PM+, etc.
            endTime: new Date(hotelCheckInTime + (0.5 + index * 1) * 60 * 60 * 1000), // 30 minutes later
          }));
          
          dayActivities = [...processedFlights, ...processedHotels];
          
          // LIMIT: Maximum 2 activities per day (prioritize flights and hotels for arrival)
          if (dayActivities.length > 2) {
            dayActivities = dayActivities
              .sort((a, b) => {
                // Priority: flights first, then hotels, then other activities
                const typePriority = { 'flight': 1, 'hotel': 2, 'activity': 3, 'restaurant': 4, 'transport': 5 };
                const aPriority = typePriority[a.type as keyof typeof typePriority] || 6;
                const bPriority = typePriority[b.type as keyof typeof typePriority] || 6;
                return aPriority - bPriority;
              })
              .slice(0, 2); // Take only the first 2 activities
          }
          
          console.log(`Day ${dayIndex + 1}: Adding ${dayActivities.length} arrival activities (limited to max 2, prioritizing flights and hotels)`);
        } else if (dayIndex === state.days.length - 1) {
          // Last day (Departure): Set proper departure times for return flights
          const processedReturnFlights = returnFlights.map((flight, index) => ({
            ...flight,
            startTime: new Date(dayDate.getTime() + (11 + index * 3) * 60 * 60 * 1000), // 11 AM, 2 PM, etc.
            endTime: new Date(dayDate.getTime() + (13 + index * 3) * 60 * 60 * 1000), // 2 hours later
          }));
          
          dayActivities = [...processedReturnFlights];
          
          // LIMIT: Maximum 2 activities per day (prioritize return flights for departure)
          if (dayActivities.length > 2) {
            dayActivities = dayActivities
              .sort((a, b) => {
                // Priority: flights first, then other activities
                const typePriority = { 'flight': 1, 'activity': 2, 'restaurant': 3, 'transport': 4, 'hotel': 5 };
                const aPriority = typePriority[a.type as keyof typeof typePriority] || 6;
                const bPriority = typePriority[b.type as keyof typeof typePriority] || 6;
                return aPriority - bPriority;
              })
              .slice(0, 2); // Take only the first 2 activities
          }
          
          console.log(`Day ${dayIndex + 1}: Adding ${dayActivities.length} departure activities (limited to max 2, prioritizing return flights)`);
        } else {
          // Middle days: Include activities originally assigned to this day, plus any activities from Day 1 and last day
          dayActivities = otherActivities.filter(item => item.originalDayIndex === dayIndex);
          
          // Redistribute activities from Day 1 and last day to middle days
          const redistributedFromDay1 = otherActivities.filter(item => item.originalDayIndex === 0);
          const redistributedFromLastDay = otherActivities.filter(item => item.originalDayIndex === state.days.length - 1);
          
          // Simple redistribution: spread activities evenly across middle days
          const middleDayCount = Math.max(1, state.days.length - 2);
          const currentMiddleDayIndex = dayIndex - 1; // 0-based index for middle days
          
          const redistributedActivities = [...redistributedFromDay1, ...redistributedFromLastDay];
          const activitiesForThisDay = redistributedActivities.filter((_, index) => 
            index % middleDayCount === currentMiddleDayIndex
          );
          
          dayActivities = [...dayActivities, ...activitiesForThisDay];
          
          // LIMIT: Maximum 2 activities per day for middle days
          if (dayActivities.length > 2) {
            // Prioritize activities by type and rating/importance
            dayActivities = dayActivities
              .sort((a, b) => {
                // Sort by activity type priority (activities > restaurants > transport)
                const typePriority = { 'activity': 1, 'restaurant': 2, 'transport': 3 };
                const aPriority = typePriority[a.type as keyof typeof typePriority] || 4;
                const bPriority = typePriority[b.type as keyof typeof typePriority] || 4;
                
                if (aPriority !== bPriority) return aPriority - bPriority;
                
                // Then by price (higher price = more premium)
                const aPrice = a.price || 0;
                const bPrice = b.price || 0;
                return bPrice - aPrice;
              })
              .slice(0, 2); // Take only the first 2 activities
          }
          
          console.log(`Day ${dayIndex + 1}: Adding ${dayActivities.length} activities (limited to max 2)`);
        }

        // Sort activities by time using JSON-based sorting
        const sortedItems = sortItineraryItemsJSON(dayActivities);

        // Fix time conflicts by using predefined allowed times
        const timeAdjustedItems = sortedItems.map((item: any, index: number) => {
          let assignedHour: number;
          
          if (item.type === 'hotel') {
            // Hotels always check-in at 6:00 PM
            assignedHour = 18; // 6:00 PM
          } else {
            // Define allowed times for other activities: 9 AM, 10 AM, 12 PM, 1 PM, 3 PM
            const allowedHours = [9, 10, 12, 13, 15]; // 9 AM, 10 AM, 12 PM, 1 PM, 3 PM
            
            // Assign times in order, cycling through allowed times
            assignedHour = allowedHours[index % allowedHours.length];
          }
          
          // Create completely new start time, ignoring any existing startTime
          const finalStartTime = new Date(dayDate);
          finalStartTime.setHours(assignedHour, 0, 0, 0); // Set to exact hour with 0 minutes, 0 seconds, 0 milliseconds
          
          // Calculate duration (default 2 hours for activities, 1 hour for others)
          const durationHours = item.type === 'activity' ? 2 : 
                               item.type === 'flight' ? 2 : 
                               item.type === 'hotel' ? 0.5 : 1;
          
          const newEndTime = new Date(finalStartTime.getTime() + durationHours * 60 * 60 * 1000);
          
          return {
            ...item,
            startTime: finalStartTime,
            endTime: newEndTime
          };
        });

        // Filter out duplicates based on activity name/title
        const uniqueItems = timeAdjustedItems.filter((item: any) => {
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
          
          // Fix hotel description to show correct star rating
          if (item.type === 'hotel') {
            const starRating = item.metadata?.starRating || 4;
            enhancedDescription = `${starRating}-star recommendation`;
          }
          
          if (item.type === 'flight' && item.timezoneInfo?.nextDay) {
            enhancedDescription += ` (arrives next day in ${item.timezoneInfo.abbreviation})`;
          }
          

          
          // Travel information removed per user request
          
          // Calculate price based on item type
          let displayPrice;
          if (item.price) {
            if (item.type === 'hotel') {
              // For hotels, multiply per-night rate by number of nights
              // Use the actual number of days from the itinerary - 1 for nights
              const nights = Math.max(1, state.days.length - 1);
              const totalHotelCost = item.price * nights;
              displayPrice = `$${totalHotelCost} (${nights} nights)`;
            } else if (item.type === 'flight') {
              // Ensure flights have a minimum price of $600
              const flightPrice = Math.max(600, item.price);
              displayPrice = `$${flightPrice}`;
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
          
          // Ensure flights have minimum price of $600 in cost calculation
          if (item.type === 'flight') {
            const flightPrice = Math.max(600, item.price);
            return sum + flightPrice;
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

  /**
   * Export itinerary as PDF using browser's print functionality
   */
  async function exportToPDF() {
    try {
      setIsModifying(true);
      
      // Create a printable version of the itinerary
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Travel Itinerary - ${itinerary.destination}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 16px; color: #666; }
            .summary { background-color: #f0f9ff; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .summary-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #1e40af; }
            .summary-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .day-container { margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
            .day-header { font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .day-date { font-size: 14px; color: #666; margin-bottom: 15px; }
            .item { display: flex; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
            .item-time { width: 80px; font-size: 12px; color: #666; }
            .item-content { flex: 1; padding-left: 10px; }
            .item-title { font-size: 14px; font-weight: bold; margin-bottom: 3px; }
            .item-description { font-size: 12px; color: #666; margin-bottom: 3px; }
            .item-price { font-size: 12px; color: #059669; font-weight: bold; }
            .rest-day { font-style: italic; color: #666; padding: 10px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10px; color: #666; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Travel Itinerary</div>
            <div class="subtitle">${itinerary.destination} • ${itinerary.days.length} days</div>
          </div>
          
          <div class="summary">
            <div class="summary-title">Trip Summary</div>
            <div class="summary-item">
              <span>Destination:</span>
              <span>${itinerary.destination}</span>
            </div>
            <div class="summary-item">
              <span>Duration:</span>
              <span>${itinerary.days.length} days</span>
            </div>
            <div class="summary-item">
              <span>Total Cost:</span>
              <span>$${itinerary.totalCost}</span>
            </div>
          </div>
          
          <div class="section">
            <h2>Daily Itinerary</h2>
            ${itinerary.days.map((day: any) => `
              <div class="day-container">
                <div class="day-header">Day ${day.dayNumber}${day.title ? ` - ${day.title}` : ''}</div>
                <div class="day-date">${formatDate(day.date)}</div>
                ${day.items && day.items.length > 0 ? 
                  day.items.map((item: any) => `
                    <div class="item">
                      <div class="item-time">${item.time}</div>
                      <div class="item-content">
                        <div class="item-title">${item.title}</div>
                        <div class="item-description">${item.description}</div>
                        ${item.price ? `<div class="item-price">${item.price}</div>` : ''}
                      </div>
                    </div>
                  `).join('') : 
                  '<div class="rest-day">Rest Day (No activities scheduled)</div>'
                }
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            Generated by TravelAgentic • ${new Date().toLocaleDateString()}
          </div>
        </body>
        </html>
      `;
      
      // Open in new window and trigger print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }
      
      handleModification({
        type: 'export',
        description: 'Exported itinerary as PDF',
        itemId: 'pdf-export'
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      // You could show a toast notification here
    } finally {
      setIsModifying(false);
    }
  }

  /**
   * Handle sharing the itinerary via email
   */
  function handleShare() {
    const subject = encodeURIComponent(`Travel Itinerary for ${itinerary.destination}`);
    // Compose a simple summary for the email body
    const body = encodeURIComponent(
      `Hi!\n\nHere's my travel itinerary for ${itinerary.destination}:\n\n` +
      itinerary.days.map((day: any) => {
        return `Day ${day.dayNumber}${day.title ? ` - ${day.title}` : ''} (${formatDate(day.date)}):\n` +
          (day.items && day.items.length > 0
            ? day.items.map((item: any) => `- ${item.time}: ${item.title}${item.description ? ` (${item.description})` : ''}${item.price ? ` [${item.price}]` : ''}`).join('\n')
            : '  Rest Day (No activities scheduled)') + '\n';
      }).join('\n') +
      `\nTotal Cost: $${itinerary.totalCost}\n\nShared via TravelAgentic`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
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
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToPDF}>
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
                      <div className="p-6">
                        <p className="text-gray-400 text-sm">Rest Day (No activities scheduled)</p>
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
                                  Last modified: {new Date(item.lastModified).toLocaleString([], { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
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
            <div className="flex items-center text-sm text-gray-500 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>
                  Last modified: {new Date(itinerary.lastModified).toLocaleString([], { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
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