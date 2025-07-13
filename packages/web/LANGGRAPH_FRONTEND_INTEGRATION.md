# LangGraph Frontend Integration Guide

This guide explains how to integrate the LangGraph AI backend with the TravelAgentic frontend components for real-time, conversational travel planning.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Service Layer](#service-layer)
3. [React Hooks](#react-hooks)
4. [Component Integration](#component-integration)
5. [Real-time Updates](#real-time-updates)
6. [Error Handling](#error-handling)
7. [Development Workflow](#development-workflow)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

## Architecture Overview

The integration follows a layered architecture that separates concerns and provides a clean interface between the LangGraph backend and React frontend:

```
┌─────────────────────┐
│   React Components  │  ← UI Layer (LiveItinerary, ChatInterface, etc.)
├─────────────────────┤
│   React Hooks       │  ← State Management Layer (useLangGraphConversation)
├─────────────────────┤
│   Service Layer     │  ← API Layer (langGraphService)
├─────────────────────┤
│   Next.js API Routes│  ← Backend Bridge (/api/langgraph/*)
├─────────────────────┤
│   LangGraph Service │  ← AI Backend (FastAPI + LangGraph)
└─────────────────────┘
```

### Key Principles

- **Separation of Concerns**: UI components don't directly call LangGraph APIs
- **Real-time Updates**: Server-Sent Events for live itinerary building
- **Error Resilience**: Graceful degradation when connections fail
- **State Persistence**: Conversation state survives page reloads
- **Type Safety**: Full TypeScript support throughout the stack

## Service Layer

### LangGraph Service (`lib/langgraph-service.ts`)

The core service layer that manages communication with the LangGraph backend:

```typescript
import { langGraphService } from '@/lib/langgraph-service';

// Start a new conversation
const conversationId = await langGraphService.startConversation({
  destination: 'Paris',
  start_date: '2024-06-01',
  end_date: '2024-06-07',
  travelers: 2,
  automation_level: 2
}, handleEvent);

// Continue conversation
await langGraphService.continueConversation(
  conversationId,
  "Find budget hotels near the Eiffel Tower",
  handleEvent
);

// Modify itinerary section
await langGraphService.modifySection(
  conversationId,
  'accommodation',
  { budget_range: 'budget', location: 'central' },
  handleEvent
);
```

### Key Features

- **Event-Driven**: All updates come through event handlers
- **Connection Management**: Automatic reconnection and cleanup
- **Error Handling**: Comprehensive error management with fallbacks
- **Type Safety**: Full TypeScript interfaces for all data structures

### API Interface

```typescript
interface LangGraphRequest {
  message?: string;
  conversation_id?: string;
  automation_level?: number;
  user_preferences?: Record<string, any>;
  action?: 'start' | 'continue' | 'modify' | 'backtrack';
  // Travel details
  destination?: string;
  start_date?: string;
  end_date?: string;
  travelers?: number;
  budget?: number;
}

interface ConversationEvent {
  type: 'conversation_started' | 'orchestrator_update' | 'itinerary_update' 
        | 'agent_status' | 'shopping_cart_update' | 'conversation_complete' | 'error';
  conversation_id?: string;
  section?: string;
  status?: string;
  progress?: number;
  data?: any;
  message?: string;
  error?: string;
}
```

## React Hooks

### Main Hook: `useLangGraphConversation`

The primary hook for managing LangGraph conversations:

```typescript
import { useLangGraphConversation } from '@/hooks/use-langgraph-conversation';

function TravelPlanningComponent() {
  const {
    // State
    conversationId,
    isConnected,
    isLoading,
    messages,
    automationLevel,
    itinerarySections,
    overallProgress,
    error,
    
    // Actions
    startFromTravelDetails,
    sendMessage,
    modifySection,
    changeAutomationLevel,
    disconnect,
    
    // Computed
    isActive,
    completedSections,
    totalSections
  } = useLangGraphConversation({
    automationLevel: 2,
    onError: (error) => console.error('LangGraph error:', error),
    onConversationComplete: (id) => console.log('Conversation complete:', id)
  });

  // Start conversation with travel details
  const handleStartPlanning = async () => {
    await startFromTravelDetails({
      destination: 'Tokyo',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-07'),
      travelers: 2
    });
  };

  return (
    <div>
      <button onClick={handleStartPlanning}>Start Planning</button>
      {isActive && <LiveItinerary {...hookState} />}
    </div>
  );
}
```

### Additional Hooks

#### `useLangGraphChat` - Simplified chat interface
```typescript
const { messages, isLoading, error, sendMessage } = useLangGraphChat(conversationId);
```

#### `useAutomationControls` - Automation level management
```typescript
const { automationLevel, isChanging, changeLevel } = useAutomationControls(conversationId, 1);
```

## Component Integration

### LiveItinerary Component

The main component for displaying real-time itinerary building:

```typescript
import LiveItinerary from '@/components/live-itinerary';

function PlanningPage() {
  const [travelDetails, setTravelDetails] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Travel Input */}
      <div className="lg:col-span-1">
        <TravelInputForm onSubmit={setTravelDetails} />
        <Button 
          onClick={() => setIsPlanning(true)}
          disabled={!travelDetails}
        >
          Start Planning
        </Button>
      </div>

      {/* Live Itinerary */}
      <div className="lg:col-span-2">
        <LiveItinerary
          isActive={isPlanning}
          automationLevel={2}
          travelDetails={travelDetails}
          onConversationStart={(id) => console.log('Started:', id)}
          onSectionModify={(section, type) => console.log('Modify:', section)}
          onAutomationLevelChange={(level) => console.log('Level:', level)}
          onAutomationPause={() => setIsPlanning(false)}
          onAutomationResume={() => setIsPlanning(true)}
          onAutomationReset={() => {
            setIsPlanning(false);
            setTravelDetails(null);
          }}
        />
      </div>
    </div>
  );
}
```

### ChatInterface Component

Enhanced chat interface with LangGraph integration:

```typescript
import { ChatInterface } from '@/components/chat-interface';

function ChatPage() {
  const { conversationId } = useLangGraphConversation();

  return (
    <div className="h-screen">
      <ChatInterface
        conversationId={conversationId}
        travelDetails={travelDetails}
        onConversationStart={(id) => console.log('Chat started:', id)}
        className="h-full"
      />
    </div>
  );
}
```

### AutomationLevelControl Component

Control panel for managing AI automation:

```typescript
import AutomationLevelControl from '@/components/automation-level-control';

function ControlPanel() {
  const { conversationId, automationLevel, isActive } = useLangGraphConversation();

  return (
    <AutomationLevelControl
      conversationId={conversationId}
      currentLevel={automationLevel}
      isActive={isActive}
      onLevelChange={(level) => console.log('New level:', level)}
      onPause={() => console.log('Paused')}
      onResume={() => console.log('Resumed')}
      onReset={() => console.log('Reset')}
    />
  );
}
```

## Real-time Updates

### Server-Sent Events Flow

The integration uses Server-Sent Events (SSE) for real-time updates:

```
Frontend                 Next.js API              LangGraph
   │                         │                        │
   ├─ startConversation() ──→│                        │
   │                         ├─ POST /orchestrator ──→│
   │                         ├─ Setup SSE stream      │
   │←─ conversationId ───────┤                        │
   │                         │                        │
   │←─ itinerary_update ─────┤←─ Agent progress ──────┤
   │←─ agent_status ─────────┤←─ Status updates ──────┤
   │←─ shopping_cart ────────┤←─ Cart changes ────────┤
   │←─ conversation_complete ┤←─ Planning done ───────┤
```

### Event Types

```typescript
// Real-time event handling
const handleEvent = (event: ConversationEvent) => {
  switch (event.type) {
    case 'conversation_started':
      // Connection established
      break;
      
    case 'itinerary_update':
      // Section updated (flights, hotels, activities)
      updateItinerarySection(event.section, event.data);
      break;
      
    case 'agent_status':
      // Agent working on something
      showAgentProgress(event.section, event.status);
      break;
      
    case 'shopping_cart_update':
      // Bookings added/modified
      updateShoppingCart(event.cart);
      break;
      
    case 'conversation_complete':
      // Planning finished
      showCompletionUI();
      break;
      
    case 'error':
      // Handle errors gracefully
      showErrorMessage(event.error);
      break;
  }
};
```

### Progress Tracking

```typescript
// Track overall progress
const { overallProgress, itinerarySections } = useLangGraphConversation();

// Individual section progress
itinerarySections.forEach(section => {
  console.log(`${section.title}: ${section.status}`);
  // Status: 'pending' | 'loading' | 'complete' | 'error'
});
```

## Error Handling

### Connection Resilience

The integration includes multiple layers of error handling:

```typescript
// Service layer error handling
try {
  await langGraphService.continueConversation(id, message, handleEvent);
} catch (error) {
  if (error.message.includes('Connection')) {
    // Show connection error UI
    setConnectionError('Lost connection to AI service');
    // Attempt automatic reconnection
    attemptReconnection();
  } else {
    // Show general error
    setError(error.message);
  }
}

// Component error boundaries
const { error, isConnected } = useLangGraphConversation();

if (!isConnected && conversationId) {
  return <ConnectionLostBanner onRetry={reconnect} />;
}

if (error) {
  return <ErrorMessage error={error} onDismiss={clearError} />;
}
```

### Graceful Degradation

```typescript
// Fallback UI when LangGraph unavailable
if (!langGraphService.healthCheck()) {
  return (
    <div className="fallback-ui">
      <h3>AI Service Temporarily Unavailable</h3>
      <p>You can still plan manually using our search tools.</p>
      <ManualPlanningInterface />
    </div>
  );
}
```

## Development Workflow

### Environment Setup

1. **Start LangGraph Service**:
```bash
cd packages/langgraph
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Configure Environment Variables**:
```bash
# In packages/web/.env.local
NEXT_PUBLIC_LANGGRAPH_URL=http://localhost:8000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

3. **Start Frontend**:
```bash
cd packages/web
npm run dev
```

### Development Best Practices

#### Mock Mode for Development
```typescript
// Use mock responses when LangGraph unavailable
const useMockMode = !process.env.NEXT_PUBLIC_LANGGRAPH_URL;

if (useMockMode) {
  // Return mock conversation data
  return mockLangGraphConversation();
}
```

#### Debug Logging
```typescript
// Enable debug logging in development
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('LangGraph Event:', event);
  console.log('Conversation State:', state);
}
```

#### Testing Components
```typescript
// Test with mock conversation data
import { render } from '@testing-library/react';

const mockConversation = {
  conversationId: 'test-123',
  isConnected: true,
  messages: [...],
  itinerarySections: [...]
};

render(
  <LiveItinerary {...mockConversation} />
);
```

### Hot Reloading

The integration supports hot reloading in development:

- **Frontend changes**: Instant reload with state preservation
- **LangGraph changes**: Restart FastAPI server, frontend reconnects automatically
- **API route changes**: Next.js hot reloads API endpoints

## Production Deployment

### Docker Configuration

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  web:
    build: ./packages/web
    environment:
      - NEXT_PUBLIC_LANGGRAPH_URL=http://langgraph:8000
    depends_on:
      - langgraph
    
  langgraph:
    build: ./packages/langgraph
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    expose:
      - "8000"
```

### Environment Variables

```bash
# Production environment variables
NEXT_PUBLIC_LANGGRAPH_URL=https://your-langgraph-service.com
LANGGRAPH_API_KEY=your_api_key
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# LangGraph service
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Performance Optimization

```typescript
// Use React.memo for expensive components
const LiveItinerary = React.memo(({ ...props }) => {
  // Component implementation
});

// Debounce user input
const debouncedSendMessage = useCallback(
  debounce((message) => sendMessage(message), 300),
  [sendMessage]
);

// Lazy load heavy components
const AutomationControls = lazy(() => import('@/components/automation-level-control'));
```

### Health Checks

```typescript
// Monitor LangGraph service health
useEffect(() => {
  const checkHealth = async () => {
    const isHealthy = await langGraphService.healthCheck();
    setServiceStatus(isHealthy ? 'healthy' : 'degraded');
  };
  
  checkHealth();
  const interval = setInterval(checkHealth, 30000); // Check every 30s
  return () => clearInterval(interval);
}, []);
```

## Troubleshooting

### Common Issues

#### 1. Connection Failures
```typescript
// Symptoms: "Connection to LangGraph service lost"
// Solutions:
- Check NEXT_PUBLIC_LANGGRAPH_URL is correct
- Verify LangGraph service is running on correct port
- Check network connectivity between services
- Validate CORS settings in LangGraph
```

#### 2. Events Not Received
```typescript
// Symptoms: Itinerary not updating in real-time
// Solutions:
- Check EventSource implementation in browser dev tools
- Verify SSE endpoint is working: /api/langgraph/stream
- Check conversation ID is being passed correctly
- Look for errors in Next.js API route logs
```

#### 3. State Persistence Issues
```typescript
// Symptoms: Lost conversation on page reload
// Solutions:
- Verify localStorage is enabled in browser
- Check conversation state is being saved to Supabase
- Ensure conversation resumption logic is working
```

#### 4. Type Errors
```typescript
// Symptoms: TypeScript compilation errors
// Solutions:
- Ensure all LangGraph types are properly exported
- Check import paths are correct
- Verify interface compatibility between frontend and backend
```

### Debug Tools

#### 1. LangGraph Service Status
```bash
curl http://localhost:8000/health
curl http://localhost:8000/graphs/status
```

#### 2. Conversation State Inspector
```typescript
// Add to any component
const { conversationId } = useLangGraphConversation();

useEffect(() => {
  if (conversationId) {
    console.log('Conversation Debug:', {
      id: conversationId,
      state: /* current state */,
      messages: /* message history */
    });
  }
}, [conversationId]);
```

#### 3. Event Stream Monitor
```typescript
// Monitor all incoming events
const handleEvent = (event) => {
  console.log(`[${new Date().toISOString()}] LangGraph Event:`, event);
  // Handle event normally...
};
```

### Performance Monitoring

```typescript
// Track conversation performance
const trackConversationMetrics = {
  startTime: Date.now(),
  messageCount: 0,
  sectionsCompleted: 0,
  errorsEncountered: 0
};

// Monitor for slow responses
const SLOW_RESPONSE_THRESHOLD = 5000; // 5 seconds
if (responseTime > SLOW_RESPONSE_THRESHOLD) {
  console.warn('Slow LangGraph response:', responseTime);
}
```

## Summary

This integration provides a robust, real-time connection between the LangGraph AI backend and React frontend. Key benefits include:

- **Real-time Updates**: Live itinerary building with Server-Sent Events
- **Type Safety**: Full TypeScript support throughout the stack
- **Error Resilience**: Graceful degradation and automatic reconnection
- **State Management**: Persistent conversations that survive page reloads
- **Performance**: Optimized for production with monitoring and health checks

The modular architecture makes it easy to extend and customize for specific use cases while maintaining clean separation of concerns. 