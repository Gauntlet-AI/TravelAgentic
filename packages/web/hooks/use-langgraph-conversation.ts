/**
 * React hooks for managing LangGraph conversation state and real-time updates
 * Provides convenient interface for components to interact with LangGraph orchestrator
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  langGraphService, 
  type ConversationState, 
  type ConversationEvent, 
  type LangGraphRequest,
  type ItinerarySection,
  type ConversationMessage,
  formatTravelDetailsForLangGraph 
} from '@/lib/langgraph-service';

// Re-export for component use
export type { ItinerarySection } from '@/lib/langgraph-service';

export interface UseLangGraphConversationOptions {
  automationLevel?: number;
  onError?: (error: string) => void;
  onConversationComplete?: (conversationId: string) => void;
  enablePersistence?: boolean;
}

export interface LangGraphConversationState {
  conversationId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  messages: ConversationMessage[];
  currentStep: string;
  automationLevel: number;
  agentStatus: Record<string, string>;
  shoppingCart: Record<string, any>;
  cartVersion: number;
  progress: Record<string, any>;
  error: string | null;
  // Itinerary-specific state
  itinerarySections: ItinerarySection[];
  overallProgress: number;
  currentDestination: string;
}

/**
 * Main hook for managing a LangGraph conversation
 * Handles connection, state management, and real-time updates
 */
export function useLangGraphConversation(options: UseLangGraphConversationOptions = {}) {
  const { 
    automationLevel = 1, 
    onError, 
    onConversationComplete,
    enablePersistence = true 
  } = options;

  const [state, setState] = useState<LangGraphConversationState>({
    conversationId: null,
    isConnected: false,
    isLoading: false,
    messages: [],
    currentStep: 'welcome',
    automationLevel,
    agentStatus: {},
    shoppingCart: {},
    cartVersion: 1,
    progress: {},
    error: null,
    itinerarySections: [
      {
        id: 'flights',
        type: 'flights',
        title: 'Flights',
        status: 'pending',
        agentMessage: 'Ready to search for flights...',
        canModify: true
      },
      {
        id: 'accommodation',
        type: 'accommodation',
        title: 'Accommodation',
        status: 'pending',
        agentMessage: 'Accommodation search will begin after flights...',
        canModify: true
      },
      {
        id: 'activities',
        type: 'activities',
        title: 'Activities & Experiences',
        status: 'pending',
        agentMessage: 'Activity recommendations will be curated...',
        canModify: true
      },
      {
        id: 'logistics',
        type: 'logistics',
        title: 'Travel Logistics',
        status: 'pending',
        agentMessage: 'Transportation and travel details...',
        canModify: false
      },
      {
        id: 'booking',
        type: 'booking',
        title: 'Booking Summary',
        status: 'pending',
        agentMessage: 'Final booking summary...',
        canModify: false
      }
    ],
    overallProgress: 0,
    currentDestination: ''
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Handle incoming events from LangGraph
  const handleEvent = useCallback((event: ConversationEvent) => {
    setState(prevState => {
      const newState = { ...prevState };

      switch (event.type) {
        case 'conversation_started':
          newState.isConnected = true;
          newState.isLoading = false;
          newState.conversationId = event.conversation_id || newState.conversationId;
          break;

        case 'orchestrator_update':
          if (event.message) {
            const newMessage: ConversationMessage = {
              role: 'assistant',
              content: event.message,
              timestamp: new Date().toISOString(),
              metadata: {
                type: 'agent_status',
                section: event.section,
                progress: event.progress
              }
            };
            newState.messages = [...newState.messages, newMessage];
          }
          break;

        case 'itinerary_update':
          if (event.section && event.data) {
            newState.itinerarySections = newState.itinerarySections.map(section => {
              if (section.id === event.section) {
                return {
                  ...section,
                  status: (event.status as any) || section.status,
                  data: event.data,
                  agentMessage: event.message || section.agentMessage,
                  lastUpdated: Date.now()
                };
              }
              return section;
            });
          }
          if (event.progress !== undefined) {
            newState.overallProgress = event.progress;
          }
          break;

        case 'agent_status':
          if (event.section && event.status) {
            newState.agentStatus = {
              ...newState.agentStatus,
              [event.section]: event.status
            };
          }
          break;

        case 'shopping_cart_update':
          if (event.cart) {
            newState.shoppingCart = event.cart;
            newState.cartVersion += 1;
          }
          break;

        case 'conversation_complete':
          newState.isLoading = false;
          onConversationComplete?.(newState.conversationId || '');
          break;

        case 'error':
          newState.error = event.error || 'Unknown error occurred';
          newState.isLoading = false;
          onError?.(newState.error);
          break;
      }

      return newState;
    });
  }, [onError, onConversationComplete]);

  // Start a new conversation
  const startConversation = useCallback(async (request: LangGraphRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const conversationId = await langGraphService.startConversation(request, handleEvent);
      
      setState(prev => ({ 
        ...prev, 
        conversationId, 
        isConnected: true,
        automationLevel: request.automation_level || prev.automationLevel
      }));

      // Save to localStorage if persistence is enabled
      if (enablePersistence && conversationId) {
        localStorage.setItem('langGraphConversationId', conversationId);
      }

      return conversationId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, [handleEvent, enablePersistence]);

  // Continue an existing conversation
  const sendMessage = useCallback(async (message: string, action: string = 'continue') => {
    if (!state.conversationId) {
      throw new Error('No active conversation');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Add user message to state immediately
    const userMessage: ConversationMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      metadata: { type: 'user_input' }
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));

    try {
      await langGraphService.continueConversation(
        state.conversationId,
        message,
        handleEvent,
        action
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, [state.conversationId, handleEvent]);

  // Modify a section of the itinerary
  const modifySection = useCallback(async (sectionId: string, modifications: any) => {
    if (!state.conversationId) {
      throw new Error('No active conversation');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await langGraphService.modifySection(
        state.conversationId,
        sectionId,
        modifications,
        handleEvent
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to modify section';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, [state.conversationId, handleEvent]);

  // Change automation level
  const changeAutomationLevel = useCallback(async (newLevel: number) => {
    if (!state.conversationId) {
      throw new Error('No active conversation');
    }

    try {
      await langGraphService.changeAutomationLevel(
        state.conversationId,
        newLevel,
        handleEvent
      );

      setState(prev => ({ ...prev, automationLevel: newLevel }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change automation level';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [state.conversationId, handleEvent]);

  // Disconnect from conversation
  const disconnect = useCallback(() => {
    if (state.conversationId) {
      langGraphService.closeEventStream(state.conversationId);
      setState(prev => ({ 
        ...prev, 
        conversationId: null, 
        isConnected: false,
        isLoading: false 
      }));

      if (enablePersistence) {
        localStorage.removeItem('langGraphConversationId');
      }
    }
  }, [state.conversationId, enablePersistence]);

  // Resume a conversation from localStorage
  const resumeConversation = useCallback(async (conversationId?: string) => {
    const idToResume = conversationId || (enablePersistence ? localStorage.getItem('langGraphConversationId') : null);
    
    if (!idToResume) {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get conversation state first
      const conversationState = await langGraphService.getConversationState(idToResume);
      
      if (!conversationState) {
        // Conversation doesn't exist anymore
        if (enablePersistence) {
          localStorage.removeItem('langGraphConversationId');
        }
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Resume the conversation
      await langGraphService.resumeConversation(idToResume, handleEvent);

      setState(prev => ({
        ...prev,
        conversationId: idToResume,
        isConnected: true,
        isLoading: false,
        messages: conversationState.messages || [],
        currentStep: conversationState.current_step || 'welcome',
        automationLevel: conversationState.automation_level || prev.automationLevel,
        agentStatus: conversationState.agent_status || {},
        shoppingCart: conversationState.shopping_cart || {},
        cartVersion: conversationState.cart_version || 1,
        progress: conversationState.progress || {}
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resume conversation';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return false;
    }
  }, [handleEvent, enablePersistence]);

  // Initialize conversation from travel details
  const startFromTravelDetails = useCallback(async (travelDetails: any) => {
    const request = formatTravelDetailsForLangGraph(travelDetails);
    request.automation_level = state.automationLevel;
    request.action = 'start';
    
    return await startConversation(request);
  }, [startConversation, state.automationLevel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stateRef.current.conversationId) {
        langGraphService.closeEventStream(stateRef.current.conversationId);
      }
    };
  }, []);

  // Try to resume conversation on mount if persistence is enabled
  useEffect(() => {
    if (enablePersistence && !state.conversationId) {
      resumeConversation();
    }
  }, [enablePersistence, resumeConversation, state.conversationId]);

  return {
    // State
    ...state,
    
    // Actions
    startConversation,
    startFromTravelDetails,
    sendMessage,
    modifySection,
    changeAutomationLevel,
    disconnect,
    resumeConversation,
    
    // Computed values
    isActive: state.isConnected && state.conversationId !== null,
    completedSections: state.itinerarySections.filter(s => s.status === 'complete').length,
    totalSections: state.itinerarySections.length,
    hasError: state.error !== null
  };
}

/**
 * Simplified hook for just sending messages to an existing conversation
 */
export function useLangGraphChat(conversationId: string | null) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    if (!conversationId) {
      throw new Error('No conversation ID provided');
    }

    setIsLoading(true);
    setError(null);

    const userMessage: ConversationMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      metadata: { type: 'user_input' }
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      await langGraphService.continueConversation(
        conversationId,
        message,
        (event) => {
          if (event.type === 'orchestrator_update' && event.message) {
            const assistantMessage: ConversationMessage = {
              role: 'assistant',
              content: event.message,
              timestamp: new Date().toISOString(),
              metadata: {
                type: event.type,
                section: event.section
              }
            };
            setMessages(prev => [...prev, assistantMessage]);
          }
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage
  };
}

/**
 * Hook for managing automation level controls
 */
export function useAutomationControls(
  conversationId: string | null,
  initialLevel: number = 1
) {
  const [automationLevel, setAutomationLevel] = useState(initialLevel);
  const [isChanging, setIsChanging] = useState(false);

  const changeLevel = useCallback(async (newLevel: number) => {
    if (!conversationId) {
      throw new Error('No conversation ID provided');
    }

    setIsChanging(true);
    
    try {
      await langGraphService.changeAutomationLevel(
        conversationId,
        newLevel,
        () => {} // Empty handler since we're just changing the level
      );
      setAutomationLevel(newLevel);
    } catch (error) {
      throw error;
    } finally {
      setIsChanging(false);
    }
  }, [conversationId]);

  return {
    automationLevel,
    isChanging,
    changeLevel
  };
} 