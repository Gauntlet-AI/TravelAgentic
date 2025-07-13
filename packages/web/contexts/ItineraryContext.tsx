/**
 * Itinerary Context for TravelAgentic
 * Manages global itinerary state for the itinerary-centric flow
 */

'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AutomationLevel, DEFAULT_AUTOMATION_LEVEL } from '@/lib/automation-levels';

// Core interfaces for itinerary management
export interface TravelPreferences {
  tripPurpose?: 'leisure' | 'business' | 'adventure' | 'relaxation' | 'culture' | 'family';
  budget?: 'budget' | 'mid-range' | 'luxury' | 'ultra-luxury';
  travelStyle?: 'independent' | 'guided' | 'mixed';
  activityTypes?: string[];
  dietaryRestrictions?: string[];
  accessibility?: string[];
  accommodationType?: 'hotel' | 'resort' | 'apartment' | 'hostel' | 'villa';
}

export interface BasicTravelDetails {
  departureLocation: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  adults: number;
  children: number;
  travelers: number; // backward compatibility
}

export interface ItineraryItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
  name: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  price?: number;
  currency?: string;
  status: 'suggested' | 'selected' | 'booked' | 'cancelled';
  source: 'ai' | 'user' | 'api';
  metadata?: Record<string, any>;
}

export interface ItineraryDay {
  date: Date;
  items: ItineraryItem[];
  budget?: number;
  notes?: string;
}

export interface ItineraryState {
  // Basic travel information
  travelDetails?: BasicTravelDetails;
  preferences?: TravelPreferences;
  
  // Automation configuration
  automationLevel: AutomationLevel;
  
  // Itinerary structure
  days: ItineraryDay[];
  totalBudget?: number;
  estimatedCost?: number;
  
  // Building state
  buildingStatus: 'idle' | 'building' | 'completed' | 'error';
  buildingProgress: number; // 0-100
  currentBuildingStep?: string;
  
  // Modification tracking
  modificationHistory: Array<{
    id: string;
    timestamp: Date;
    action: 'add' | 'remove' | 'modify' | 'reorder';
    description: string;
    previousState?: Partial<ItineraryState>;
  }>;
  
  // Meta information
  version: number;
  lastUpdated: Date;
  isModified: boolean;
}

// Action types for the reducer
type ItineraryAction =
  | { type: 'SET_TRAVEL_DETAILS'; payload: BasicTravelDetails }
  | { type: 'SET_PREFERENCES'; payload: TravelPreferences }
  | { type: 'SET_AUTOMATION_LEVEL'; payload: AutomationLevel }
  | { type: 'START_BUILDING' }
  | { type: 'UPDATE_BUILDING_PROGRESS'; payload: { progress: number; step?: string } }
  | { type: 'COMPLETE_BUILDING' }
  | { type: 'SET_BUILDING_ERROR'; payload: string }
  | { type: 'ADD_ITINERARY_ITEM'; payload: { dayIndex: number; item: ItineraryItem } }
  | { type: 'ADD_OR_ADJUST_ITINERARY_ITEM'; payload: { dayIndex: number; item: ItineraryItem } }
  | { type: 'REMOVE_ITINERARY_ITEM'; payload: { dayIndex: number; itemId: string } }
  | { type: 'UPDATE_ITINERARY_ITEM'; payload: { dayIndex: number; itemId: string; updates: Partial<ItineraryItem> } }
  | { type: 'REORDER_ITINERARY_ITEMS'; payload: { dayIndex: number; fromIndex: number; toIndex: number } }
  | { type: 'ADD_ITINERARY_DAY'; payload: ItineraryDay }
  | { type: 'UPDATE_ITINERARY_DAY'; payload: { dayIndex: number; updates: Partial<ItineraryDay> } }
  | { type: 'RESET_ITINERARY' }
  | { type: 'UNDO_LAST_CHANGE' };

// Storage key for persisting itinerary state in the current browser session
const ITINERARY_STORAGE_KEY = 'travelagentic_itinerary_state_v1';

// Initial state
const initialState: ItineraryState = {
  days: [],
  automationLevel: DEFAULT_AUTOMATION_LEVEL,
  buildingStatus: 'idle',
  buildingProgress: 0,
  modificationHistory: [],
  version: 1,
  lastUpdated: new Date(),
  isModified: false,
};

// Reducer function
function itineraryReducer(state: ItineraryState, action: ItineraryAction): ItineraryState {
  const createModification = (actionType: string, description: string) => ({
    id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    action: actionType as any,
    description,
    previousState: { 
      ...state,
      days: [...state.days],
      modificationHistory: [...state.modificationHistory]
    } as ItineraryState,
  });

  switch (action.type) {
    case 'SET_TRAVEL_DETAILS':
      return {
        ...state,
        travelDetails: action.payload,
        version: state.version + 1,
        lastUpdated: new Date(),
        isModified: true,
        modificationHistory: [
          ...state.modificationHistory,
          createModification('modify', 'Updated travel details'),
        ],
      };

    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: action.payload,
        version: state.version + 1,
        lastUpdated: new Date(),
        isModified: true,
        modificationHistory: [
          ...state.modificationHistory,
          createModification('modify', 'Updated travel preferences'),
        ],
      };

    case 'SET_AUTOMATION_LEVEL':
      return {
        ...state,
        automationLevel: action.payload,
        version: state.version + 1,
        lastUpdated: new Date(),
        modificationHistory: [
          ...state.modificationHistory,
          createModification('modify', `Changed automation level to ${action.payload}`),
        ],
      };

    case 'START_BUILDING':
      return {
        ...state,
        buildingStatus: 'building',
        buildingProgress: 0,
        currentBuildingStep: 'Initializing AI building process...',
        lastUpdated: new Date(),
      };

    case 'UPDATE_BUILDING_PROGRESS':
      return {
        ...state,
        buildingProgress: action.payload.progress,
        currentBuildingStep: action.payload.step || state.currentBuildingStep,
        lastUpdated: new Date(),
      };

    case 'COMPLETE_BUILDING':
      return {
        ...state,
        buildingStatus: 'completed',
        buildingProgress: 100,
        currentBuildingStep: 'Building completed!',
        lastUpdated: new Date(),
      };

    case 'SET_BUILDING_ERROR':
      return {
        ...state,
        buildingStatus: 'error',
        currentBuildingStep: `Error: ${action.payload}`,
        lastUpdated: new Date(),
      };

    case 'ADD_ITINERARY_ITEM':
      const newDays = [...state.days];
      if (!newDays[action.payload.dayIndex]) {
        // Create day if it doesn't exist
        const dayDate = new Date(state.travelDetails?.startDate || new Date());
        dayDate.setDate(dayDate.getDate() + action.payload.dayIndex);
        newDays[action.payload.dayIndex] = {
          date: dayDate,
          items: [],
        };
      }
      
      // Check for duplicates before adding the item
      const existingItem = newDays[action.payload.dayIndex].items.find(
        item => item.id === action.payload.item.id
      );
      
      if (!existingItem) {
        newDays[action.payload.dayIndex].items.push(action.payload.item);
        // Resort items by startTime after insertion
        newDays[action.payload.dayIndex].items.sort((a, b) => {
          if (!a.startTime || !b.startTime) return 0;
          return a.startTime.getTime() - b.startTime.getTime();
        });
        
        return {
          ...state,
          days: newDays,
          version: state.version + 1,
          lastUpdated: new Date(),
          isModified: true,
          modificationHistory: [
            ...state.modificationHistory,
            createModification('add', `Added ${action.payload.item.type}: ${action.payload.item.name}`),
          ],
        };
      } else {
        // Item already exists, don't add again and don't modify state
        console.log(`Duplicate item prevented: ${action.payload.item.id}`);
        return state;
      }

    case 'ADD_OR_ADJUST_ITINERARY_ITEM': {
      const { dayIndex, item } = action.payload;
      const newDays = [...state.days];

      // Ensure all preceding days exist to avoid sparse arrays
      for (let i = 0; i <= dayIndex; i++) {
        if (!newDays[i]) {
          const fillDate = new Date(state.travelDetails?.startDate || new Date());
          fillDate.setDate(fillDate.getDate() + i);
          newDays[i] = { date: fillDate, items: [] };
        }
      }

      // Work with a mutable targetDayIndex that can shift if needed
      let targetDayIndex = dayIndex;

      const targetDayExists = newDays[targetDayIndex] !== undefined;
      if (!targetDayExists) {
        const dayDate = new Date(state.travelDetails?.startDate || new Date());
        dayDate.setDate(dayDate.getDate() + targetDayIndex);
        newDays[targetDayIndex] = { date: dayDate, items: [] };
      }

      let targetDay = newDays[targetDayIndex];
      const lastItemInDay = targetDay.items[targetDay.items.length - 1];

      // If new item's time is earlier than last item's time, it belongs to the next day
      if (lastItemInDay && item.startTime && lastItemInDay.startTime && item.startTime < lastItemInDay.startTime) {
        targetDayIndex += 1;
        if (!newDays[targetDayIndex]) {
          const nextDayDate = new Date(state.travelDetails?.startDate || new Date());
          nextDayDate.setDate(nextDayDate.getDate() + targetDayIndex);
          newDays[targetDayIndex] = { date: nextDayDate, items: [] };
        }
        targetDay = newDays[targetDayIndex];
      }

      // Prevent duplicates in the target day
      if (!targetDay.items.find(i => i.id === item.id)) {
        targetDay.items.push(item);
      } else {
        console.log(`Duplicate item prevented: ${item.id}`);
        return state;
      }
      
      return {
        ...state,
        days: newDays,
        version: state.version + 1,
        lastUpdated: new Date(),
        isModified: true,
        modificationHistory: [
          ...state.modificationHistory,
          createModification('add', `Added/Adjusted ${item.type}: ${item.name}`),
        ],
      };
    }

    case 'REMOVE_ITINERARY_ITEM':
      const updatedDays = [...state.days];
      if (updatedDays[action.payload.dayIndex]) {
        updatedDays[action.payload.dayIndex].items = updatedDays[action.payload.dayIndex].items.filter(
          item => item.id !== action.payload.itemId
        );
      }
      
      return {
        ...state,
        days: updatedDays,
        version: state.version + 1,
        lastUpdated: new Date(),
        isModified: true,
        modificationHistory: [
          ...state.modificationHistory,
          createModification('remove', `Removed itinerary item`),
        ],
      };

    case 'UPDATE_ITINERARY_ITEM':
      const modifiedDays = [...state.days];
      if (modifiedDays[action.payload.dayIndex]) {
        const itemIndex = modifiedDays[action.payload.dayIndex].items.findIndex(
          item => item.id === action.payload.itemId
        );
        if (itemIndex !== -1) {
          modifiedDays[action.payload.dayIndex].items[itemIndex] = {
            ...modifiedDays[action.payload.dayIndex].items[itemIndex],
            ...action.payload.updates,
          };
        }
      }
      
      return {
        ...state,
        days: modifiedDays,
        version: state.version + 1,
        lastUpdated: new Date(),
        isModified: true,
        modificationHistory: [
          ...state.modificationHistory,
          createModification('modify', `Modified itinerary item`),
        ],
      };

    case 'ADD_ITINERARY_DAY':
      return {
        ...state,
        days: [...state.days, action.payload],
        version: state.version + 1,
        lastUpdated: new Date(),
        isModified: true,
        modificationHistory: [
          ...state.modificationHistory,
          createModification('add', 'Added new day to itinerary'),
        ],
      };

    case 'RESET_ITINERARY':
      return {
        ...initialState,
        version: 1,
        lastUpdated: new Date(),
      };

    case 'UNDO_LAST_CHANGE':
      if (state.modificationHistory.length > 0) {
        const lastModification = state.modificationHistory[state.modificationHistory.length - 1];
        if (lastModification.previousState) {
          return {
            ...state,
            ...lastModification.previousState,
            days: lastModification.previousState.days || [],
            modificationHistory: state.modificationHistory.slice(0, -1),
            version: state.version + 1,
            lastUpdated: new Date(),
          };
        }
      }
      return state;

    default:
      return state;
  }
}

// Context interfaces
interface ItineraryContextType {
  state: ItineraryState;
  dispatch: React.Dispatch<ItineraryAction>;
  
  // Convenience methods
  setTravelDetails: (details: BasicTravelDetails) => void;
  setPreferences: (preferences: TravelPreferences) => void;
  setAutomationLevel: (level: AutomationLevel) => void;
  startBuilding: () => void;
  updateBuildingProgress: (progress: number, step?: string) => void;
  completeBuilding: () => void;
  addItineraryItem: (dayIndex: number, item: ItineraryItem) => void; // Kept for potential internal use, but will also be updated
  addOrAdjustItineraryItem: (dayIndex: number, item: ItineraryItem) => void;
  removeItineraryItem: (dayIndex: number, itemId: string) => void;
  updateItineraryItem: (dayIndex: number, itemId: string, updates: Partial<ItineraryItem>) => void;
  resetItinerary: () => void;
  undoLastChange: () => void;
  
  // Computed properties
  totalDays: number;
  totalEstimatedCost: number;
  isBuilding: boolean;
  canUndo: boolean;
}

// Create context
const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

/**
 * Itinerary Provider Component
 * Wraps the app to provide itinerary state management
 */
export function ItineraryProvider({ children }: { children: ReactNode }) {
  // Lazy initializer to restore state from sessionStorage when available
  const loadPersistedState = (): ItineraryState => {
    if (typeof window === 'undefined') return initialState;

    try {
      const stored = sessionStorage.getItem(ITINERARY_STORAGE_KEY);
      if (!stored) return initialState;

      const parsed = JSON.parse(stored);

      // Revive Date objects that were stringified during storage
      if (parsed.travelDetails) {
        if (parsed.travelDetails.startDate) parsed.travelDetails.startDate = new Date(parsed.travelDetails.startDate);
        if (parsed.travelDetails.endDate) parsed.travelDetails.endDate = new Date(parsed.travelDetails.endDate);
      }

      if (Array.isArray(parsed.days)) {
        parsed.days = parsed.days.map((day: any) => ({
          ...day,
          date: day.date ? new Date(day.date) : new Date(),
          items: Array.isArray(day.items)
            ? day.items.map((item: any) => ({
                ...item,
                startTime: item.startTime ? new Date(item.startTime) : undefined,
                endTime: item.endTime ? new Date(item.endTime) : undefined,
              }))
            : [],
        }));
      }

      return { ...initialState, ...parsed } as ItineraryState;
    } catch (error) {
      console.warn('Failed to load persisted itinerary state:', error);
      return initialState;
    }
  };

  const [state, dispatch] = useReducer(itineraryReducer, undefined as any, loadPersistedState);

  // Convenience methods
  const setTravelDetails = (details: BasicTravelDetails) => {
    dispatch({ type: 'SET_TRAVEL_DETAILS', payload: details });
  };

  const setPreferences = (preferences: TravelPreferences) => {
    dispatch({ type: 'SET_PREFERENCES', payload: preferences });
  };

  const setAutomationLevel = (level: AutomationLevel) => {
    dispatch({ type: 'SET_AUTOMATION_LEVEL', payload: level });
  };

  const startBuilding = () => {
    dispatch({ type: 'START_BUILDING' });
  };

  const updateBuildingProgress = (progress: number, step?: string) => {
    dispatch({ type: 'UPDATE_BUILDING_PROGRESS', payload: { progress, step } });
  };

  const completeBuilding = () => {
    dispatch({ type: 'COMPLETE_BUILDING' });
  };

  const addItineraryItem = (dayIndex: number, item: ItineraryItem) => {
    dispatch({ type: 'ADD_ITINERARY_ITEM', payload: { dayIndex, item } });
  };

  const addOrAdjustItineraryItem = (dayIndex: number, item: ItineraryItem) => {
    dispatch({ type: 'ADD_OR_ADJUST_ITINERARY_ITEM', payload: { dayIndex, item } });
  };

  const removeItineraryItem = (dayIndex: number, itemId: string) => {
    dispatch({ type: 'REMOVE_ITINERARY_ITEM', payload: { dayIndex, itemId } });
  };

  const updateItineraryItem = (dayIndex: number, itemId: string, updates: Partial<ItineraryItem>) => {
    dispatch({ type: 'UPDATE_ITINERARY_ITEM', payload: { dayIndex, itemId, updates } });
  };

  const resetItinerary = () => {
    dispatch({ type: 'RESET_ITINERARY' });
  };

  const undoLastChange = () => {
    dispatch({ type: 'UNDO_LAST_CHANGE' });
  };

  // Computed properties
  const totalDays = state.days.length;
  const totalEstimatedCost = state.days.reduce((total, day) => {
    return total + day.items.reduce((dayTotal, item) => dayTotal + (item.price || 0), 0);
  }, 0);
  const isBuilding = state.buildingStatus === 'building';
  const canUndo = state.modificationHistory.length > 0;

  const value = {
    state,
    dispatch,
    setTravelDetails,
    setPreferences,
    setAutomationLevel,
    startBuilding,
    updateBuildingProgress,
    completeBuilding,
    addItineraryItem, // Keep original for now
    addOrAdjustItineraryItem,
    removeItineraryItem,
    updateItineraryItem,
    resetItinerary,
    undoLastChange,
    totalDays,
    totalEstimatedCost,
    isBuilding,
    canUndo,
  };

  // Persist state to sessionStorage whenever it changes
  React.useEffect(() => {
    try {
      // Persist a subset of the state to keep payload small and avoid deep nesting
      const { modificationHistory, ...stateToPersist } = state;
      sessionStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (error) {
      console.warn('Failed to persist itinerary state:', error);
    }
  }, [state]);

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
}

/**
 * Hook to access itinerary context
 */
export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
}

/**
 * Hook for building-specific operations
 */
export function useItineraryBuilder() {
  const { state, startBuilding, updateBuildingProgress, completeBuilding } = useItinerary();
  
  return {
    buildingStatus: state.buildingStatus,
    buildingProgress: state.buildingProgress,
    currentBuildingStep: state.currentBuildingStep,
    isBuilding: state.buildingStatus === 'building',
    startBuilding,
    updateBuildingProgress,
    completeBuilding,
  };
} 