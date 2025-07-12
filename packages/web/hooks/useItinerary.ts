/**
 * Extended itinerary operations hook
 * Provides additional convenience operations for itinerary management
 * Complements the basic useItinerary hook from ItineraryContext
 */

import { useCallback, useMemo } from 'react';
import { useItinerary } from '@/contexts/ItineraryContext';
import { ItineraryItem } from '@/contexts/ItineraryContext';

export function useItineraryOperations() {
  const context = useItinerary();
  
  // Convenience functions for adding specific types of items
  const addFlight = useCallback((dayIndex: number, flightData: {
    name: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location: string;
    price?: number;
    currency?: string;
    metadata?: Record<string, any>;
  }) => {
    const flightItem: ItineraryItem = {
      id: `flight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'flight',
      status: 'suggested',
      source: 'ai',
      ...flightData,
    };
    context.addOrAdjustItineraryItem(dayIndex, flightItem);
  }, [context]);

  const addHotel = useCallback((dayIndex: number, hotelData: {
    name: string;
    description?: string;
    location: string;
    price?: number;
    currency?: string;
    metadata?: Record<string, any>;
  }) => {
    const hotelItem: ItineraryItem = {
      id: `hotel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'hotel',
      status: 'suggested',
      source: 'ai',
      ...hotelData,
    };
    context.addOrAdjustItineraryItem(dayIndex, hotelItem);
  }, [context]);

  const addActivity = useCallback((dayIndex: number, activityData: {
    name: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    location: string;
    price?: number;
    currency?: string;
    metadata?: Record<string, any>;
  }) => {
    const activityItem: ItineraryItem = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'activity',
      status: 'suggested',
      source: 'ai',
      ...activityData,
    };
    context.addOrAdjustItineraryItem(dayIndex, activityItem);
  }, [context]);

  const addRestaurant = useCallback((dayIndex: number, restaurantData: {
    name: string;
    description?: string;
    startTime?: Date;
    location: string;
    price?: number;
    currency?: string;
    metadata?: Record<string, any>;
  }) => {
    const restaurantItem: ItineraryItem = {
      id: `restaurant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'restaurant',
      status: 'suggested',
      source: 'ai',
      ...restaurantData,
    };
    context.addOrAdjustItineraryItem(dayIndex, restaurantItem);
  }, [context]);

  // Bulk operations
  const addMultipleItems = useCallback((dayIndex: number, items: Omit<ItineraryItem, 'id'>[]) => {
    items.forEach(itemData => {
      const item: ItineraryItem = {
        ...itemData,
        id: `${itemData.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      context.addOrAdjustItineraryItem(dayIndex, item);
    });
  }, [context]);

  // Status management
  const markItemAsSelected = useCallback((dayIndex: number, itemId: string) => {
    context.updateItineraryItem(dayIndex, itemId, { status: 'selected' });
  }, [context]);

  const markItemAsBooked = useCallback((dayIndex: number, itemId: string) => {
    context.updateItineraryItem(dayIndex, itemId, { status: 'booked' });
  }, [context]);

  // Search and filter operations
  const getItemsByType = useCallback((type: ItineraryItem['type']) => {
    return context.state.days.map((day, dayIndex) => ({
      dayIndex,
      date: day.date,
      items: day.items.filter(item => item.type === type)
    })).filter(day => day.items.length > 0);
  }, [context.state.days]);

  const getItemsByStatus = useCallback((status: ItineraryItem['status']) => {
    return context.state.days.map((day, dayIndex) => ({
      dayIndex,
      date: day.date,
      items: day.items.filter(item => item.status === status)
    })).filter(day => day.items.length > 0);
  }, [context.state.days]);

  // Cost calculations
  const getCostByDay = useCallback((dayIndex: number) => {
    if (!context.state.days[dayIndex]) return 0;
    return context.state.days[dayIndex].items.reduce((total, item) => total + (item.price || 0), 0);
  }, [context.state.days]);

  const getCostByType = useCallback((type: ItineraryItem['type']) => {
    return context.state.days.reduce((total, day) => {
      return total + day.items
        .filter(item => item.type === type)
        .reduce((typeTotal, item) => typeTotal + (item.price || 0), 0);
    }, 0);
  }, [context.state.days]);

  // Computed statistics
  const stats = useMemo(() => {
    const allItems = context.state.days.flatMap(day => day.items);
    
    return {
      totalItems: allItems.length,
      itemsByType: {
        flight: allItems.filter(item => item.type === 'flight').length,
        hotel: allItems.filter(item => item.type === 'hotel').length,
        activity: allItems.filter(item => item.type === 'activity').length,
        restaurant: allItems.filter(item => item.type === 'restaurant').length,
        transport: allItems.filter(item => item.type === 'transport').length,
      },
      itemsByStatus: {
        suggested: allItems.filter(item => item.status === 'suggested').length,
        selected: allItems.filter(item => item.status === 'selected').length,
        booked: allItems.filter(item => item.status === 'booked').length,
        cancelled: allItems.filter(item => item.status === 'cancelled').length,
      },
      costByType: {
        flight: getCostByType('flight'),
        hotel: getCostByType('hotel'),
        activity: getCostByType('activity'),
        restaurant: getCostByType('restaurant'),
        transport: getCostByType('transport'),
      }
    };
  }, [context.state.days, getCostByType]);

  return {
    // Re-export context methods for convenience
    ...context,
    
    // Type-specific add methods
    addFlight,
    addHotel,
    addActivity,
    addRestaurant,
    
    // Bulk operations
    addMultipleItems,
    
    // Status management
    markItemAsSelected,
    markItemAsBooked,
    
    // Search and filter
    getItemsByType,
    getItemsByStatus,
    
    // Cost calculations
    getCostByDay,
    getCostByType,
    
    // Statistics
    stats,
  };
} 