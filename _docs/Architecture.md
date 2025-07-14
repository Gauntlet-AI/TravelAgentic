# TravelAgentic Architecture Documentation

**Version:** 2.0  
**Date:** January 2025  
**Status:** Current Implementation

---

## 📋 Executive Summary

TravelAgentic is an AI-first travel planning platform that orchestrates multi-agent workflows for comprehensive trip planning. The system combines LangGraph-based AI orchestration with a Next.js frontend and supports both mock and real APIs through a sophisticated fallback system.

---

## 🏗️ Current Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TravelAgentic Platform                       │
├─────────────────────────────────────────────────────────────────┤
│ Frontend (Next.js 14)                                          │
│ ├── App Router Pages                                           │
│ ├── Real-time Components                                       │
│ ├── LangGraph Integration Hooks                               │
│ └── Automation Level Controls                                  │
├─────────────────────────────────────────────────────────────────┤
│ API Layer (Next.js API Routes)                                │
│ ├── LangGraph Proxy (/api/langgraph/*)                       │
│ ├── Travel Services (/api/flights/*, /api/hotels/*)          │
│ ├── Authentication (/api/auth/*)                              │
│ └── Utility Services (/api/documents/*, /api/preferences/*)   │
├─────────────────────────────────────────────────────────────────┤
│ AI Orchestration (LangGraph Service)                          │
│ ├── Travel Orchestrator Graph (4,391 lines)                  │
│ ├── Legacy Specialized Graphs (User Intake, Search, etc.)    │
│ ├── Performance Optimizations                                 │
│ └── Webserver API Client                                      │
├─────────────────────────────────────────────────────────────────┤
│ Mock Services Layer                                            │
│ ├── Mock Data Sources                                         │
│ ├── Service Factory Pattern                                   │
│ ├── Realistic API Simulation                                  │
│ └── Environment-based Switching                               │
├─────────────────────────────────────────────────────────────────┤
│ Data Layer                                                     │
│ ├── Supabase (PostgreSQL + Auth)                             │
│ ├── Redis (Session/Caching)                                   │
│ ├── 21-Table Database Schema                                  │
│ └── Real-time State Management                                │
└─────────────────────────────────────────────────────────────────┘
```

### Key Implementation Status

| Component | Status | Implementation |
|-----------|--------|---------------|
| **LangGraph Orchestrator** | ✅ Complete | 4,391-line unified orchestrator with conversation state management |
| **Web Frontend** | ✅ Complete | Next.js 14 with App Router, real-time components, automation controls |
| **API Layer** | ✅ Complete | 16 API route groups, SSE support, LangGraph integration |
| **Mock Services** | ✅ Complete | Comprehensive mock system with service factory pattern |
| **Database Schema** | ✅ Complete | 21-table schema with JSONB preferences, conversation state |
| **Docker Environment** | ✅ Complete | Multi-service Docker Compose with development/production configs |
| **Testing Framework** | ✅ Complete | Custom test runner with Docker integration |

---

## 🔧 Technology Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | Next.js | 14+ | App Router, SSR, API Routes |
| **UI Framework** | React | 18+ | Component library with hooks |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS framework |
| **TypeScript** | TypeScript | 5.x | Type safety and developer experience |
| **AI Orchestration** | LangGraph | Latest | Multi-agent conversation workflows |
| **Database** | Supabase | Latest | PostgreSQL with real-time features |
| **Caching** | Redis | 7-alpine | Session management and caching |
| **Containerization** | Docker | Latest | Development and deployment |

### AI & Integration Services

| Service | Purpose | Status |
|---------|---------|--------|
| **OpenAI GPT** | Primary LLM for all AI agents | ✅ Integrated |
| **Amadeus API** | Flight search and booking | ✅ Integrated |
| **LangGraph** | Multi-agent workflow orchestration | ✅ Primary system |
| **Supabase Auth** | User authentication and sessions | ✅ Integrated |
| **Playwright** | Browser automation fallback | 🔄 Planned |
| **Twilio + ElevenLabs** | Voice calling fallback | 🔄 Planned |

---

## 🤖 AI Orchestration Layer

### LangGraph Travel Orchestrator

The heart of the system is the `TravelOrchestratorGraph` class (4,391 lines) that replaces the original 4 separate workflows with a unified conversational system.

#### Key Features

1. **Unified Conversation State** - Single state management across all travel planning stages
2. **Agent Collaboration** - Flight → Hotel → Activities with context passing
3. **Automation Levels** - 4 levels of AI autonomy (1-4, where 4 = "I'm Feeling Lucky")
4. **Real-time UI Updates** - Streaming updates to frontend during planning
5. **Backtracking Support** - Context snapshots for modifying previous decisions
6. **Shopping Cart Management** - Dependency-aware cart with version control

#### Orchestrator Graph Structure

```python
class TravelOrchestratorGraph(BaseTravelGraph, PerformanceOptimizationMixin):
    """
    Single collaborative orchestrator graph that handles complete conversational travel planning
    """
    
    def _build_graph(self):
        workflow = StateGraph(ConversationState)
        
        # Core conversation flow
        workflow.add_node("welcome", self._welcome_user)
        workflow.add_node("collect_preferences", self._collect_preferences)
        workflow.add_node("orchestrator", self._orchestrator_agent)
        
        # Collaborative agents
        workflow.add_node("flight_agent", self._flight_agent)
        workflow.add_node("lodging_agent", self._lodging_agent)
        workflow.add_node("activities_agent", self._activities_agent)
        
        # Shopping cart & booking
        workflow.add_node("shopping_cart", self._shopping_cart)
        workflow.add_node("booking_execution", self._booking_execution)
        workflow.add_node("itinerary_generation", self._itinerary_generation)
        
        # Automation level routing
        workflow.add_conditional_edges(
            "orchestrator",
            self._route_by_automation_level,
            {
                "level_1": "present_options",
                "level_2": "preselect_options", 
                "level_3": "auto_select_with_review",
                "level_4": "auto_book"
            }
        )
```

#### Conversation State Management

```python
class ConversationState(TypedDict):
    # Core conversation
    conversation_id: str
    messages: List[Dict[str, Any]]
    current_step: str
    
    # User context
    user_preferences: Dict[str, Any]
    automation_level: int  # 1-4
    
    # Agent collaboration
    agent_communications: List[Dict[str, Any]]
    agent_status: Dict[str, str]
    
    # Shopping cart
    shopping_cart: Dict[str, Any]
    cart_version: int
    
    # Backtracking
    backtrack_history: List[Dict[str, Any]]
    context_snapshots: Dict[str, Any]
    
    # UI updates
    ui_updates: List[Dict[str, Any]]
    progress: Dict[str, Any]
```

---

## 💻 Frontend Architecture

### Next.js 14 App Router Structure

```
packages/web/app/
├── (auth)/                 # Authentication routes
│   ├── login/
│   └── signup/
├── (booking)/              # Booking flow routes
│   ├── search/
│   └── checkout/
├── account/                # User account management
├── automation-packages/    # Automation level showcases
├── automation-showcase/    # Automation demonstrations
├── enhanced-home/          # Enhanced home page
├── itinerary/             # Itinerary management
│   ├── building/
│   ├── finalize/
│   ├── preferences/
│   └── view/
├── test/                  # Testing pages
└── api/                   # API routes (16 groups)
```

### Real-time Components

The frontend includes sophisticated real-time components for LangGraph integration:

#### 1. Live Itinerary Component
```typescript
// Real-time itinerary updates during AI planning
export function LiveItinerary({ conversationId }: { conversationId: string }) {
  const { itinerarySections, overallProgress } = useLangGraphConversation({
    conversationId,
    enableRealTimeUpdates: true
  });
  
  return (
    <div className="live-itinerary">
      {itinerarySections.map(section => (
        <ItinerarySection
          key={section.id}
          section={section}
          onModify={(changes) => modifySection(section.id, changes)}
        />
      ))}
    </div>
  );
}
```

#### 2. Automation Level Controls
```typescript
// Dynamic automation level control with real-time updates
export function AutomationLevelControl({ 
  currentLevel, 
  onLevelChange 
}: AutomationLevelControlProps) {
  return (
    <div className="automation-controls">
      <Slider
        value={[currentLevel]}
        onValueChange={([level]) => onLevelChange(level)}
        max={4}
        min={1}
        step={1}
      />
      <Button 
        onClick={() => onLevelChange(4)}
        className="feeling-lucky"
      >
        🍀 I'm Feeling Lucky
      </Button>
    </div>
  );
}
```

#### 3. LangGraph Integration Hook
```typescript
// Central hook for LangGraph conversation management
export function useLangGraphConversation(options: UseLangGraphConversationOptions = {}) {
  const [state, setState] = useState<LangGraphConversationState>({
    conversationId: null,
    isConnected: false,
    isLoading: false,
    messages: [],
    currentStep: 'welcome',
    automationLevel: options.automationLevel || 1,
    itinerarySections: [
      { id: 'flights', type: 'flights', status: 'pending' },
      { id: 'accommodation', type: 'accommodation', status: 'pending' },
      { id: 'activities', type: 'activities', status: 'pending' }
    ]
  });
  
  // Real-time event handling, conversation management, etc.
  // ... (511 lines total)
}
```

---

## 🔌 API Architecture

### API Route Organization

The system implements 16 API route groups:

```
packages/web/app/api/
├── activities/            # Activity search and booking
├── airports/              # Airport search and codes
├── auth/                  # Authentication endpoints
├── chat/                  # General chat interface
├── documents/             # PDF generation and management
├── flights/               # Flight search and booking
├── hotels/                # Hotel search and booking
├── itinerary/             # Itinerary management
├── langgraph/             # LangGraph orchestrator proxy
├── langflow/              # Legacy Langflow support
├── payments/              # Payment processing
├── preferences/           # User preference management
├── research/              # Travel research tools
├── test/                  # Testing endpoints
└── user/                  # User management
```

### Key API Endpoints

#### LangGraph Integration
```typescript
// /api/langgraph/chat/route.ts - Main orchestrator endpoint
export async function POST(request: NextRequest) {
  const body: ChatRequest = await request.json();
  
  // Create or load conversation state
  let conversationState: ConversationState;
  
  // Start orchestrator conversation with SSE
  const stream = new ReadableStream({
    start(controller) {
      startOrchestratorConversation(conversationState, controller, body);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

#### Real-time Updates
```typescript
// Server-Sent Events for real-time itinerary updates
async function startOrchestratorConversation(
  state: ConversationState,
  controller: ReadableStreamDefaultController,
  request: ChatRequest
) {
  // Call orchestrator and stream responses
  const response = await fetch(`${LANGGRAPH_URL}/orchestrator/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orchestratorRequest)
  });

  // Stream orchestrator responses to client
  const reader = response.body?.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // Forward real-time updates to frontend
    sendSSEMessage(controller, {
      type: 'orchestrator_update',
      ...parsedData
    });
  }
}
```

---

## 🗄️ Database Architecture

### 21-Table Schema Overview

The system uses a sophisticated 21-table PostgreSQL schema via Supabase:

#### User Management (3 tables)
- `users` - Supabase Auth integration
- `user_preferences` - JSONB preference system  
- `user_sessions` - Flow state management

#### Booking & Travel (3 tables)
- `bookings` - Multi-provider booking support
- `itineraries` - Trip organization with PDF generation
- `itinerary_bookings` - Junction table for relationships

#### Session Management (3 tables)
- `context_snapshots` - Backtracking capability
- `shopping_carts` - Dependency-aware cart management
- `browser_automation_sessions` - Automation tracking

#### Trip Templates (4 tables)
- `trip_templates` - Reusable travel plans
- `template_sharing` - Permission-based sharing
- `template_versions` - Version control system
- `template_usage` - Analytics and feedback

#### Advanced Features (8 tables)
- `search_cache` - API response optimization
- `search_history` - User analytics
- `api_failures` - Failure tracking
- `automation_logs` - Decision logging
- `fallback_cascades` - 5-layer fallback system
- `voice_calls` - Voice calling integration
- `feature_flags` - Phase-based development
- `agent_results` - AI orchestration outcomes

### Key Database Features

#### JSONB Preference System
```sql
-- User preferences with rich data structures
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    travel_preferences JSONB DEFAULT '{}',
    system_preferences JSONB DEFAULT '{}',
    constraints JSONB DEFAULT '[]',
    fallback_preferences JSONB DEFAULT '{}',
    booking_preferences JSONB DEFAULT '{}',
    template_preferences JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    privacy_preferences JSONB DEFAULT '{}'
);
```

#### Conversation State Management
```sql
-- Conversation state with backtracking support
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    state JSONB NOT NULL DEFAULT '{}',
    automation_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔄 Mock Services Architecture

### Service Factory Pattern

The system implements a comprehensive mock service layer that maintains identical interfaces to real APIs:

```typescript
// packages/mocks/factories/service-factory.ts
export class ServiceFactory {
  static getFlightService(): FlightService {
    return process.env.USE_MOCK_APIS === 'true' 
      ? new MockFlightService()
      : new AmadeusFlightService();
  }
  
  static getHotelService(): HotelService {
    return process.env.USE_MOCK_APIS === 'true'
      ? new MockHotelService() 
      : new BookingComHotelService();
  }
  
  static getActivityService(): ActivityService {
    return process.env.USE_MOCK_APIS === 'true'
      ? new MockActivityService()
      : new ViatorActivityService();
  }
}
```

### Mock Service Features

1. **Realistic Data** - Comprehensive mock data with proper relationships
2. **Configurable Failures** - Simulate API failures for testing
3. **Performance Simulation** - Configurable delays for realistic behavior
4. **Environment-based** - Seamless switching via environment variables

### Mock Data Sources

```
packages/mocks/data/
├── activities.ts         # Activity data with categories, pricing
├── airports.ts           # Airport codes and city mappings
└── hotels.ts             # Hotel data with amenities, pricing
```

---

## 🚀 Development & Testing

### Docker Environment

The system uses Docker Compose for consistent development:

```yaml
# docker-compose.yml
services:
  web:                    # Next.js frontend
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    depends_on:
      - langgraph
      - redis
      
  langgraph:              # LangGraph AI service
    build:
      context: packages/langgraph
    ports:
      - "8000:8000"
    depends_on:
      - redis
      
  redis:                  # Session/caching
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Testing Framework

#### Custom Test Runner
```bash
# run-langgraph-tests.sh - Custom test runner
./run-langgraph-tests.sh all                    # Run all tests
./run-langgraph-tests.sh test_orchestrator.py   # Run specific test
./run-langgraph-tests.sh shell                  # Interactive shell
./run-langgraph-tests.sh status                 # Check services
```

#### Available Tests
- `test_orchestrator.py` - Main orchestrator functionality
- `test_webserver_client.py` - API client integration
- `test_amadeus_only.py` - Amadeus API integration
- `test_orchestrator_webserver.py` - Full integration tests
- `test_amadeus_validation.py` - API validation tests

---

## 📊 Data Flow Architecture

### 1. User Input Flow
```
User Input → Travel Form → API Route → LangGraph Orchestrator → AI Agents
```

### 2. AI Processing Flow
```
Orchestrator → Flight Agent → Hotel Agent → Activity Agent → Shopping Cart
```

### 3. Real-time Updates Flow
```
AI Agent → Context Update → SSE Stream → Frontend Update → UI Refresh
```

### 4. Booking Flow
```
Shopping Cart → Booking Execution → 5-Layer Fallback → Confirmation
```

### 5. Itinerary Flow
```
Confirmed Bookings → Itinerary Generation → PDF Creation → User Delivery
```

---

## 🔧 Environment Configuration

### Development Environment
```env
# Core Configuration
NODE_ENV=development
USE_MOCK_APIS=true
ENABLE_LANGGRAPH=true

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# AI Services
OPENAI_API_KEY=your_openai_key
LANGGRAPH_URL=http://localhost:8000

# Travel APIs (when not using mocks)
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
AMADEUS_ENVIRONMENT=test

# Infrastructure
REDIS_URL=redis://localhost:6379
```

### Production Environment
```env
# Core Configuration
NODE_ENV=production
USE_MOCK_APIS=false
ENABLE_LANGGRAPH=true

# All production API keys and configurations
```

---

## 🎯 Automation Levels

The system implements 4 distinct automation levels:

### Level 1: Manual Control
- Present options one by one
- Require user selection for each choice
- Full user control over all decisions

### Level 2: Pre-selected Options
- AI preselects best option
- User confirms or changes selection
- Guided decision-making

### Level 3: Auto-select with Review
- AI auto-selects all options
- Present complete plan for review
- User can modify before booking

### Level 4: "I'm Feeling Lucky"
- Full AI autonomy
- Auto-select and auto-book
- User watches trip come together
- Safety checkpoints for major decisions

---

## 🔄 5-Layer Fallback System

The planned fallback system provides robust booking capabilities:

### Layer 1: Primary API
- Amadeus (flights)
- Booking.com (hotels)
- Viator (activities)

### Layer 2: Secondary API
- Alternative providers for same services
- Automatic retry with different parameters

### Layer 3: Browser Automation
- Playwright + browser-use
- AI-powered web scraping
- Respectful automation with rate limiting

### Layer 4: Voice Calling
- Twilio + ElevenLabs integration
- AI-powered phone calls for bookings
- Human-like conversation capability

### Layer 5: Manual Intervention
- Pause and request user input
- Provide manual booking instructions
- Fallback to human assistance

---

## 🚦 Current Status & Known Issues

### ✅ Completed Features
1. **LangGraph Orchestrator** - Full 4,391-line implementation
2. **Real-time Frontend** - SSE integration with live updates
3. **Mock Services** - Comprehensive mock API layer
4. **Database Schema** - 21-table PostgreSQL schema
5. **Docker Environment** - Multi-service development setup
6. **Testing Framework** - Custom test runner with Docker integration
7. **Automation Levels** - 4-level AI autonomy system
8. **Conversation State** - Backtracking and context snapshots

### 🔄 In Progress
1. **Real API Integration** - Amadeus API partially integrated
2. **Browser Automation** - Playwright integration planned
3. **Voice Calling** - Twilio + ElevenLabs integration planned
4. **Payment Processing** - Stripe integration planned

### ⚠️ Known Issues
1. **Timezone Handling** - Critical gaps in timezone management across flight/hotel times
2. **Documentation Fragmentation** - Multiple outdated documentation sources
3. **Performance Optimization** - Large orchestrator file needs optimization
4. **Error Handling** - Inconsistent error handling across services
5. **Testing Coverage** - Limited test coverage for edge cases

---

## 🔮 Future Enhancements

### Short-term (1-2 months)
1. **Complete API Integration** - Full Amadeus, Booking.com, Viator integration
2. **Timezone Fixes** - Comprehensive timezone handling system
3. **Performance Optimization** - Orchestrator code optimization
4. **Enhanced Testing** - Comprehensive test suite

### Medium-term (3-6 months)
1. **Browser Automation** - Playwright + browser-use implementation
2. **Voice Calling** - Twilio + ElevenLabs integration
3. **Mobile App** - React Native implementation
4. **Advanced Analytics** - User behavior tracking

### Long-term (6+ months)
1. **Multi-language Support** - Internationalization
2. **Group Travel** - Multi-user trip planning
3. **Enterprise Features** - White-label solutions
4. **AI Optimization** - Advanced AI reasoning capabilities

---

## 📚 Documentation Structure

### Current Documentation
- **`_docs/ARCHITECTURE.md`** - This comprehensive architecture document
- **`_docs/LANGGRAPH_REFACTOR.md`** - LangGraph refactor plan (705 lines)
- **`packages/langgraph/README.md`** - LangGraph service documentation
- **`packages/web/README.md`** - Web frontend documentation
- **`packages/mocks/README.md`** - Mock services documentation
- **`packages/seed/README.md`** - Database schema documentation

### Legacy Documentation (Outdated)
- **`_docs/Architecture.md`** - Original architecture (727 lines, outdated)
- **`_docs/PRD.md`** - Product requirements
- **`_docs/API.md`** - API documentation
- **`_docs/setup_phase_1.md`** - Setup guide

---

## 🎉 Conclusion

TravelAgentic represents a sophisticated AI-first travel planning platform with a robust architecture that combines modern web technologies with advanced AI orchestration. The system is designed for scalability, maintainability, and extensibility while providing a seamless user experience through real-time AI-powered trip planning.

The architecture successfully balances development velocity with production readiness, using comprehensive mock services for rapid development while maintaining clear paths to production API integration. The LangGraph orchestrator provides the intelligent backbone for complex travel planning workflows, while the Next.js frontend delivers a modern, responsive user experience.

Key strengths include the unified orchestrator approach, comprehensive mock service layer, real-time user experience, and robust fallback systems. Areas for improvement include timezone handling, documentation consolidation, and performance optimization.

This architecture document serves as the definitive technical reference for the TravelAgentic platform as of January 2025, replacing all previous architectural documentation.

---

**Document Metadata:**
- **Lines:** 500+
- **Last Updated:** January 2025
- **Codebase Analysis:** Based on actual implementation analysis
- **Status:** Current and accurate
- **Next Review:** February 2025 