/**
 * LangGraph Service Layer
 * Manages communication with LangGraph orchestrator backend
 * Handles conversation state, real-time updates, and agent coordination
 */

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    type?: 'itinerary_update' | 'agent_status' | 'search_result' | 'recommendation' | 'user_input' | 'orchestrator_update';
    section?: string;
    progress?: number;
    data?: any;
  };
}

export interface ConversationState {
  conversation_id: string;
  messages: ConversationMessage[];
  current_step: string;
  user_preferences: Record<string, any>;
  automation_level: number;
  agent_communications: Array<Record<string, any>>;
  agent_status: Record<string, string>;
  shopping_cart: Record<string, any>;
  cart_version: number;
  backtrack_history: Array<Record<string, any>>;
  context_snapshots: Record<string, any>;
  ui_updates: Array<Record<string, any>>;
  progress: Record<string, any>;
}

export interface ItinerarySection {
  id: string;
  type: 'flights' | 'accommodation' | 'activities' | 'logistics' | 'booking';
  title: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  progress?: number;
  data?: any;
  alternatives?: any[];
  agentMessage?: string;
  lastUpdated?: number;
  canModify?: boolean;
}

export interface LangGraphRequest {
  message?: string;
  conversation_id?: string;
  automation_level?: number;
  user_preferences?: Record<string, any>;
  action?: 'start' | 'continue' | 'modify' | 'backtrack';
  modify_section?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  travelers?: number;
  budget?: number;
}

export interface LangGraphResponse {
  success: boolean;
  data: any;
  execution_id?: string;
  execution_time?: number;
}

export type ConversationEventType = 
  | 'conversation_started'
  | 'orchestrator_update' 
  | 'itinerary_update'
  | 'agent_status'
  | 'shopping_cart_update'
  | 'conversation_complete'
  | 'error';

export interface ConversationEvent {
  type: ConversationEventType;
  conversation_id?: string;
  current_step?: string;
  automation_level?: number;
  section?: string;
  status?: string;
  progress?: number;
  data?: any;
  cart?: any;
  error?: string;
  message?: string;
}

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
  directFlightsOnly?: boolean;
  maxStops?: number;
  preferredAirlines?: string[];
  automation_level?: number;
}

export interface HotelSearchRequest {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  starRating?: number[];
  amenities?: string[];
  propertyTypes?: string[];
  maxDistance?: number;
  automation_level?: number;
}

export interface SearchResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
  responseTime?: number;
  fallbackUsed?: boolean;
}

class LangGraphService {
  private baseUrl: string;
  private activeConnections: Map<string, EventSource> = new Map();

  constructor() {
    // LangGraph orchestrator URL - used for conversational AI workflows only
    // Flight/hotel searches now go directly to web server APIs to avoid circular dependencies
    this.baseUrl = process.env.LANGGRAPH_URL || 'http://localhost:8000';
  }

  /**
   * Start a new conversation with the orchestrator
   */
  async startConversation(
    request: LangGraphRequest,
    onEvent: (event: ConversationEvent) => void
  ): Promise<string> {
    try {
      // Start conversation via streaming endpoint - DON'T pass conversation_id for new conversations
      const response = await fetch('/api/langgraph/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          // Do NOT include conversation_id for new conversations
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.status}`);
      }

      // Process the streaming response to get conversation_id and events
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let conversationId = '';
      
      if (!reader) {
        throw new Error('No response body available');
      }

      // Read the stream and process events
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.conversation_id && !conversationId) {
                    conversationId = data.conversation_id;
                  }
                  onEvent(data);
                } catch (e) {
                  // Ignore parsing errors
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing stream:', error);
          onEvent({
            type: 'error',
            error: 'Stream processing failed'
          });
        } finally {
          reader.releaseLock();
        }
      };

      // Start processing the stream in the background
      processStream();

      // Wait a bit for the conversation_id to be received
      let attempts = 0;
      while (!conversationId && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!conversationId) {
        throw new Error('Failed to get conversation ID from response');
      }

      return conversationId;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }

  /**
   * Continue an existing conversation
   */
  async continueConversation(
    conversationId: string,
    message: string,
    onEvent: (event: ConversationEvent) => void,
    action: string = 'continue'
  ): Promise<void> {
    try {
      const response = await fetch('/api/langgraph/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to continue conversation: ${response.status}`);
      }

      // Process the streaming response like startConversation does
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body available');
      }

      // Read the stream and process events
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  onEvent(data);
                } catch (e) {
                  // Ignore parsing errors
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing stream:', error);
          onEvent({
            type: 'error',
            error: 'Stream processing failed'
          });
        } finally {
          reader.releaseLock();
        }
      };

      // Start processing the stream
      await processStream();

    } catch (error) {
      console.error('Error continuing conversation:', error);
      throw error;
    }
  }

  /**
   * Modify a specific section of the itinerary
   */
  async modifySection(
    conversationId: string,
    section: string,
    modifications: any,
    onEvent: (event: ConversationEvent) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/langgraph/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          action: 'modify',
          modify_section: section,
          modifications,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to modify section: ${response.status}`);
      }
    } catch (error) {
      console.error('Error modifying section:', error);
      throw error;
    }
  }

  /**
   * Get conversation state
   */
  async getConversationState(conversationId: string): Promise<ConversationState | null> {
    try {
      const response = await fetch(`/api/langgraph/chat?conversation_id=${conversationId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to get conversation state: ${response.status}`);
      }

      const data = await response.json();
      return data.state;
    } catch (error) {
      console.error('Error getting conversation state:', error);
      return null;
    }
  }

  /**
   * Set up Server-Sent Events stream for real-time updates
   */
  private setupEventStream(conversationId: string, onEvent: (event: ConversationEvent) => void): void {
    const url = `/api/langgraph/stream?conversation_id=${conversationId}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const data: ConversationEvent = JSON.parse(event.data);
        onEvent(data);
      } catch (error) {
        console.error('Error parsing event data:', error);
      }
    };

    eventSource.onerror = (error: Event) => {
      console.error('EventSource error:', error);
      onEvent({
        type: 'error',
        error: 'Connection to LangGraph service lost'
      });
    };

    // Store connection for cleanup
    this.activeConnections.set(conversationId, eventSource);
  }

  /**
   * Close event stream for a conversation
   */
  closeEventStream(conversationId: string): void {
    const eventSource = this.activeConnections.get(conversationId);
    if (eventSource) {
      eventSource.close();
      this.activeConnections.delete(conversationId);
    }
  }

  /**
   * Change automation level for a conversation
   */
  async changeAutomationLevel(
    conversationId: string,
    automationLevel: number,
    onEvent: (event: ConversationEvent) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/langgraph/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          automation_level: automationLevel,
          action: 'update_automation'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to change automation level: ${response.status}`);
      }
    } catch (error) {
      console.error('Error changing automation level:', error);
      throw error;
    }
  }

  /**
   * Invoke orchestrator directly (for structured input)
   */
  async invokeOrchestrator(request: LangGraphRequest): Promise<LangGraphResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/orchestrator/invoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Orchestrator invocation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error invoking orchestrator:', error);
      throw error;
    }
  }

  /**
   * Resume a conversation from a snapshot
   */
  async resumeConversation(
    conversationId: string,
    onEvent: (event: ConversationEvent) => void,
    snapshotId?: string
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/orchestrator/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          snapshot_id: snapshotId,
          action: 'resume'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to resume conversation: ${response.status}`);
      }

      // Set up new event stream
      this.setupEventStream(conversationId, onEvent);
    } catch (error) {
      console.error('Error resuming conversation:', error);
      throw error;
    }
  }

  /**
   * Get available snapshots for backtracking
   */
  async getSnapshots(conversationId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/orchestrator/conversations/${conversationId}/snapshots`);
      
      if (!response.ok) {
        throw new Error(`Failed to get snapshots: ${response.status}`);
      }

      const data = await response.json();
      return data.snapshots || [];
    } catch (error) {
      console.error('Error getting snapshots:', error);
      return [];
    }
  }

  /**
   * Health check for LangGraph service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('LangGraph health check failed:', error);
      return false;
    }
  }

  /**
   * Search for flights using LangGraph orchestrator with Amadeus integration
   */
  async searchFlights(request: FlightSearchRequest): Promise<SearchResponse<any>> {
    try {
      const startTime = Date.now();
      
      // Convert to web server API format
      const apiRequest = {
        origin: request.origin,
        destination: request.destination,
        departureDate: request.departureDate,
        returnDate: request.returnDate,
        passengers: {
          adults: request.passengers.adults,
          children: request.passengers.children,
          infants: request.passengers.infants,
        },
        cabin: request.cabin || 'economy',
        directFlightsOnly: request.directFlightsOnly,
        maxStops: request.maxStops,
        preferredAirlines: request.preferredAirlines,
      };

      // Call the web server API directly (avoiding circular dependency)
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequest),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`Flight search failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Flight search failed',
          responseTime
        };
      }

      return {
        success: true,
        data: result.data || [],
        responseTime,
        fallbackUsed: result.fallbackUsed || false
      };

    } catch (error) {
      console.error('LangGraph flight search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime: 0
      };
    }
  }

  /**
   * Search for hotels using LangGraph orchestrator with Amadeus integration
   */
  async searchHotels(request: HotelSearchRequest): Promise<SearchResponse<any>> {
    try {
      const startTime = Date.now();
      
      // Convert to web server API format
      const apiRequest = {
        destination: request.destination,
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        guests: {
          adults: request.guests.adults,
          children: request.guests.children,
          rooms: request.guests.rooms,
        },
        starRating: request.starRating,
        amenities: request.amenities,
        propertyTypes: request.propertyTypes,
        maxDistance: request.maxDistance,
      };

      // Call the web server API directly (avoiding circular dependency)
      const response = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequest),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`Hotel search failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Hotel search failed',
          responseTime
        };
      }

      return {
        success: true,
        data: result.data || [],
        responseTime,
        fallbackUsed: result.fallbackUsed || false
      };

    } catch (error) {
      console.error('LangGraph hotel search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime: 0
      };
    }
  }

  /**
   * Cleanup all active connections
   */
  cleanup(): void {
    for (const [conversationId, eventSource] of this.activeConnections) {
      eventSource.close();
    }
    this.activeConnections.clear();
  }
}

// Export singleton instance
export const langGraphService = new LangGraphService();

// Helper function to format automation level
export function getAutomationLevelDescription(level: number): string {
  switch (level) {
    case 1:
      return "Present Options - AI shows all options, you choose";
    case 2:
      return "Recommend Best - AI preselects best option, you approve";
    case 3:
      return "Auto-select with Review - AI chooses everything, you review before booking";
    case 4:
      return "I'm Feeling Lucky - Full automation with real-time updates";
    default:
      return "Unknown automation level";
  }
}

// Helper function to convert travel details to LangGraph format
export function formatTravelDetailsForLangGraph(details: any): LangGraphRequest {
  return {
    destination: details.destination,
    start_date: details.startDate?.toISOString().split('T')[0],
    end_date: details.endDate?.toISOString().split('T')[0],
    travelers: details.travelers || (details.adults || 0) + (details.children || 0),
    budget: details.budget,
    user_preferences: {
      departure_location: details.departureLocation,
      adults: details.adults,
      children: details.children,
      room_preferences: details.rooms ? { rooms: details.rooms } : undefined,
      // Add other preferences as needed
    }
  };
} 