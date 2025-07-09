/**
 * Context Manager for Agentic Travel AI
 * Handles persistent state management for multi-step travel workflows
 */

export interface TravelContext {
  sessionId: string;
  userId?: string;
  flowType: 'structured' | 'conversational';
  contextVersion: number;

  // Core travel parameters
  travelDetails?: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number;
    budget?: string;
    travelStyle?:
      | 'luxury'
      | 'budget'
      | 'mid-range'
      | 'adventure'
      | 'relaxation';
  };

  // User preferences
  preferences?: {
    interests?: string[];
    dietaryRestrictions?: string[];
    accessibility?: string[];
    priceRange?: string;
    accommodationType?: string[];
  };

  // Shopping cart state
  shoppingCart?: {
    flights?: any[];
    hotels?: any[];
    activities?: any[];
    totalPrice?: number;
    cartVersion?: number;
  };

  // Workflow state
  workflowState?: {
    currentStep?: string;
    completedSteps?: string[];
    nextActions?: string[];
    blockers?: string[];
  };

  // Conversation history for agentic decisions
  conversationHistory?: {
    userMessages: string[];
    aiResponses: string[];
    toolCalls: Array<{
      tool: string;
      parameters: any;
      result: any;
      timestamp: Date;
    }>;
  };

  // Backtracking support
  backtrackHistory?: Array<{
    step: string;
    contextVersion: number;
    timestamp: Date;
    snapshot: Partial<TravelContext>;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Context Manager for handling persistent travel state
 */
export class TravelContextManager {
  private contexts: Map<string, TravelContext> = new Map();

  /**
   * Initialize a new travel context for a user session
   */
  initializeContext(
    sessionId: string,
    flowType: 'structured' | 'conversational' = 'conversational'
  ): TravelContext {
    const context: TravelContext = {
      sessionId,
      flowType,
      contextVersion: 1,
      travelDetails: {},
      preferences: {},
      shoppingCart: {
        flights: [],
        hotels: [],
        activities: [],
        totalPrice: 0,
        cartVersion: 1,
      },
      workflowState: {
        currentStep: 'initial',
        completedSteps: [],
        nextActions: ['gather_preferences'],
        blockers: [],
      },
      conversationHistory: {
        userMessages: [],
        aiResponses: [],
        toolCalls: [],
      },
      backtrackHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.contexts.set(sessionId, context);
    return context;
  }

  /**
   * Get context for a session
   */
  getContext(sessionId: string): TravelContext | null {
    return this.contexts.get(sessionId) || null;
  }

  /**
   * Update context with new information
   */
  updateContext(
    sessionId: string,
    updates: Partial<TravelContext>
  ): TravelContext | null {
    const context = this.contexts.get(sessionId);
    if (!context) return null;

    // Create snapshot for backtracking
    const snapshot = { ...context };

    // Update context
    const updatedContext = {
      ...context,
      ...updates,
      contextVersion: context.contextVersion + 1,
      updatedAt: new Date(),
      backtrackHistory: [
        ...(context.backtrackHistory || []),
        {
          step: context.workflowState?.currentStep || 'unknown',
          contextVersion: context.contextVersion,
          timestamp: new Date(),
          snapshot,
        },
      ],
    };

    this.contexts.set(sessionId, updatedContext);
    return updatedContext;
  }

  /**
   * Add tool call result to conversation history
   */
  addToolCall(
    sessionId: string,
    tool: string,
    parameters: any,
    result: any
  ): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;

    const updatedHistory = {
      userMessages: context.conversationHistory?.userMessages || [],
      aiResponses: context.conversationHistory?.aiResponses || [],
      toolCalls: [
        ...(context.conversationHistory?.toolCalls || []),
        {
          tool,
          parameters,
          result,
          timestamp: new Date(),
        },
      ],
    };

    this.updateContext(sessionId, { conversationHistory: updatedHistory });
  }

  /**
   * Add items to shopping cart
   */
  addToCart(
    sessionId: string,
    type: 'flights' | 'hotels' | 'activities',
    items: any[]
  ): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;

    const currentCart = context.shoppingCart || {
      flights: [],
      hotels: [],
      activities: [],
      totalPrice: 0,
      cartVersion: 1,
    };

    const updatedCart = {
      ...currentCart,
      [type]: [...(currentCart[type] || []), ...items],
      cartVersion: (currentCart.cartVersion || 1) + 1,
    };

    // Recalculate total price
    updatedCart.totalPrice = this.calculateCartTotal(updatedCart);

    this.updateContext(sessionId, { shoppingCart: updatedCart });
  }

  /**
   * Calculate total cart price
   */
  private calculateCartTotal(cart: any): number {
    let total = 0;

    // Add flight prices
    cart.flights?.forEach((flight: any) => {
      total += flight.price || 0;
    });

    // Add hotel prices (assuming per night)
    cart.hotels?.forEach((hotel: any) => {
      total += (hotel.pricePerNight || 0) * (hotel.nights || 1);
    });

    // Add activity prices
    cart.activities?.forEach((activity: any) => {
      total += activity.price || 0;
    });

    return total;
  }

  /**
   * Update workflow state
   */
  updateWorkflowState(
    sessionId: string,
    updates: Partial<TravelContext['workflowState']>
  ): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;

    const updatedWorkflowState = {
      ...context.workflowState,
      ...updates,
    };

    this.updateContext(sessionId, { workflowState: updatedWorkflowState });
  }

  /**
   * Backtrack to a previous context version
   */
  backtrack(sessionId: string, targetVersion: number): TravelContext | null {
    const context = this.contexts.get(sessionId);
    if (!context) return null;

    const targetSnapshot = context.backtrackHistory?.find(
      (snapshot) => snapshot.contextVersion === targetVersion
    );

    if (!targetSnapshot) return null;

    // Restore to target snapshot
    const restoredContext = {
      ...targetSnapshot.snapshot,
      sessionId, // Ensure session ID is preserved
      updatedAt: new Date(),
    } as TravelContext;

    this.contexts.set(sessionId, restoredContext);
    return restoredContext;
  }

  /**
   * Clear context for session (cleanup)
   */
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }

  /**
   * Get all active contexts (for debugging/monitoring)
   */
  getAllContexts(): TravelContext[] {
    return Array.from(this.contexts.values());
  }
}

// Export singleton instance
export const contextManager = new TravelContextManager();

// Utility functions for working with context
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function isContextComplete(context: TravelContext): boolean {
  return !!(
    context.travelDetails?.origin &&
    context.travelDetails?.destination &&
    context.travelDetails?.departureDate &&
    context.shoppingCart?.flights?.length &&
    context.shoppingCart?.hotels?.length
  );
}

export function getNextRecommendedAction(context: TravelContext): string {
  if (!context.travelDetails?.origin) return 'gather_origin';
  if (!context.travelDetails?.destination) return 'gather_destination';
  if (!context.travelDetails?.departureDate) return 'gather_dates';
  if (!context.shoppingCart?.flights?.length) return 'search_flights';
  if (!context.shoppingCart?.hotels?.length) return 'search_hotels';
  if (!context.shoppingCart?.activities?.length) return 'search_activities';
  return 'review_booking';
}
