# TravelAgentic User Flow

## Trip Storage & Templating System

The entire user process should be capturable in JSON format to enable:

- **Trip History Storage** - Store completed trips for reference and modification
- **Re-checkout Capability** - Modify existing trips to re-check availability/pricing
- **Import/Export Functionality** - Share trip configurations between users
- **Template Creation** - Save preference sets to avoid re-entering information
- **Proxy Trip Creation** - Allow users to plan trips on behalf of others (e.g., "Nancy's trip")

### Trip JSON Structure

```json
{
  "trip_id": "uuid",
  "trip_name": "Nancy's Summer Vacation",
  "created_by": "user_id",
  "created_for": "nancy@example.com",
  "preferences": { /* full preference struct */ },
  "selections": {
    "flights": [...],
    "hotels": [...],
    "activities": [...]
  },
  "booking_status": "confirmed|pending|failed",
  "fallback_reports": {...},
  "created_at": "timestamp",
  "last_modified": "timestamp"
}
```

## Automation Control

### Automation Slider (0-10 Scale)

- **0-2**: Manual approval required for every selection
- **3-5**: Auto-select obvious choices, ask for approval on complex decisions
- **6-8**: Auto-select most options, only ask for approval on high-impact decisions
- **9-10**: Full automation, only interrupt for critical failures

### Fallback Warning System

When automation reaches its limits, warn user that manual intervention is required and present the specific action needed.

## User Stories

### User Story 1: Structured Onboarding Flow

**Process:**

1. **User** → Fills out onboarding preferences via multiple choice form
2. **LLM Orchestrator** → Splits tasks (flight, hotel, activities) into specialized agents
3. **LLM** → Returns flight recommendations
4. **User** → Selects a flight OR uses chat window to make suggestions/changes
5. **LLM** → Sends next tier of recommendations (contextually: hotel if flight selected)
6. **LLM** → Continues iterative process until all selections made
7. **LLM** → Presents shopping cart for user review/changes
8. **User** → Confirms shopping cart or makes modifications
9. **LLM** → Books all components through API/browser/voice fallback system
10. **LLM** → Returns printable itinerary with todos

**Key Features:**

- Structured preference collection upfront
- Sequential recommendation tiers
- Interactive chat refinement capability
- Comprehensive shopping cart review
- Multi-modal booking execution

### User Story 2: Conversational Discovery Flow

**Process:**

1. **LLM** → Greets user and asks for basic parameters (date, price range, location)
2. **User** → Provides information and suggestions
3. **LLM** → Iterates conversationally to gather remaining preferences
4. **LLM** → Spins up specialized agents for search
5. **LLM** → Automatically selects best fits based on preferences
6. **LLM** → Presents pre-populated shopping cart
7. **User** → Accepts shopping cart
8. **LLM** → Books vacation components, warning when manual intervention required

**Key Features:**

- Natural conversation preference discovery
- Intelligent auto-selection based on learned preferences
- Streamlined approval process
- Proactive manual intervention warnings
- Reduced decision fatigue

## Implementation Notes

### State Management

- Each step should be recoverable and resumable
- Trip state should be persistable at any point
- User can switch between automation levels mid-flow
- Support for multiple concurrent trip planning sessions

### Agent Orchestration

- Flight Agent: Search, filter, rank flight options
- Hotel Agent: Search accommodations with contextual location awareness
- Activity Agent: Curate experiences based on destination and preferences
- Booking Agent: Execute purchases across all channels with fallback support

### Fallback Integration

- Each agent should respect user's automation level setting
- Escalate to higher fallback tiers when automation limits reached
- Provide clear progress indicators during fallback attempts
- Log all fallback usage for system improvement

### User Experience

- Progressive disclosure of complexity based on user expertise
- Context-aware recommendations (e.g., hotel location relative to selected flight)
- Seamless switching between structured and conversational modes
- Trip comparison capabilities for saved templates
