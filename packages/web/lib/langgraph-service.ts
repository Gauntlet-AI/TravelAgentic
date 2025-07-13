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

class LangGraphService {
  private baseUrl: string;
  private activeConnections: Map<string, EventSource> = new Map();

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_LANGGRAPH_URL || 'http://localhost:8000';
  }

  /**
   * Start a new conversation with the orchestrator
   */
  async startConversation(
    request: LangGraphRequest,
    onEvent: (event: ConversationEvent) => void
  ): Promise<string> {
    const conversationId = crypto.randomUUID();
    
    try {
      // Start conversation via streaming endpoint
      const response = await fetch('/api/langgraph/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.status}`);
      }

      // Set up Server-Sent Events for real-time updates
      this.setupEventStream(conversationId, onEvent);

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

      // Events will come through existing stream
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