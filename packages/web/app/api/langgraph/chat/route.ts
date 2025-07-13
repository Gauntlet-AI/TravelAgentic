import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Types for conversation state
interface ConversationState {
  conversation_id: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>;
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

interface ChatRequest {
  message?: string;
  conversation_id?: string;
  automation_level?: number;
  user_preferences?: Record<string, any>;
  action?: 'start' | 'continue' | 'modify' | 'backtrack';
  modify_section?: string;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    // Validate required fields
    if (!body.message && !body.conversation_id) {
      return NextResponse.json(
        { error: 'Message or conversation_id is required' },
        { status: 400 }
      );
    }

    // Create or load conversation state
    let conversationState: ConversationState;
    
    if (body.conversation_id) {
      // Load existing conversation
      const { data: existing, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', body.conversation_id)
        .single();
      
      if (error || !existing) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      
      conversationState = existing.state;
    } else {
      // Create new conversation
      const conversationId = crypto.randomUUID();
      conversationState = {
        conversation_id: conversationId,
        messages: [],
        current_step: 'welcome',
        user_preferences: body.user_preferences || {},
        automation_level: body.automation_level || 1,
        agent_communications: [],
        agent_status: {},
        shopping_cart: {},
        cart_version: 1,
        backtrack_history: [],
        context_snapshots: {},
        ui_updates: [],
        progress: {}
      };
    }

    // Add user message to conversation
    if (body.message) {
      conversationState.messages.push({
        role: 'user',
        content: body.message,
        timestamp: new Date().toISOString()
      });
    }

    // Save conversation state immediately so it's available for GET requests
    await saveConversationState(conversationState);

    // Create readable stream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Start the orchestrator conversation
        startOrchestratorConversation(conversationState, controller, body);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function startOrchestratorConversation(
  state: ConversationState,
  controller: ReadableStreamDefaultController,
  request: ChatRequest
) {
  try {
    // Send initial response
    sendSSEMessage(controller, {
      type: 'conversation_started',
      conversation_id: state.conversation_id,
      current_step: state.current_step,
      automation_level: state.automation_level
    });

    // Call the orchestrator graph with proper OrchestratorRequest format
    const orchestratorRequest = {
      message: state.messages.length > 0 ? state.messages[state.messages.length - 1]?.content : undefined,
      conversation_id: state.conversation_id,
      automation_level: state.automation_level,
      user_preferences: state.user_preferences,
      action: request.action || 'start',
      modify_section: request.modify_section
    };

    const response = await fetch(`${process.env.LANGGRAPH_URL || 'http://localhost:8000'}/orchestrator/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LANGGRAPH_API_KEY || 'dev-key'}`
      },
      body: JSON.stringify(orchestratorRequest)
    });

    if (!response.ok) {
      throw new Error(`Orchestrator service error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body from orchestrator');
    }

    // Stream orchestrator responses
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            
            // Forward orchestrator updates to client
            sendSSEMessage(controller, {
              type: 'orchestrator_update',
              ...data
            });

            // Handle specific update types
            if (data.type === 'itinerary_update') {
              await handleItineraryUpdate(state, data);
            } else if (data.type === 'agent_status') {
              state.agent_status = { ...state.agent_status, ...data.status };
            } else if (data.type === 'shopping_cart_update') {
              state.shopping_cart = data.cart;
              state.cart_version += 1;
            } else if (data.type === 'conversation_complete') {
              // Save final conversation state
              await saveConversationState(state);
            }

          } catch (parseError) {
            console.error('Error parsing orchestrator response:', parseError);
          }
        }
      }
    }

    // Send completion message
    sendSSEMessage(controller, {
      type: 'conversation_complete',
      conversation_id: state.conversation_id
    });

  } catch (error) {
    console.error('Orchestrator conversation error:', error);
    sendSSEMessage(controller, {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    controller.close();
  }
}

async function handleItineraryUpdate(state: ConversationState, update: any) {
  // Store UI updates in conversation state
  state.ui_updates.push({
    ...update,
    timestamp: new Date().toISOString()
  });

  // Update progress tracking
  if (update.section) {
    state.progress[update.section] = update.status;
  }

  // Save conversation state periodically
  if (state.ui_updates.length % 5 === 0) {
    await saveConversationState(state);
  }
}

async function saveConversationState(state: ConversationState) {
  try {
    await supabase
      .from('conversations')
      .upsert({
        id: state.conversation_id,
        state: state,
        updated_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error saving conversation state:', error);
  }
}

function sendSSEMessage(controller: ReadableStreamDefaultController, data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const conversationId = url.searchParams.get('conversation_id');

  if (!conversationId) {
    return NextResponse.json(
      { error: 'conversation_id parameter is required' },
      { status: 400 }
    );
  }

  try {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      conversation_id: conversationId,
      state: conversation.state,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 