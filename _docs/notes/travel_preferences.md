# TravelAgentic Travel Preferences

## Context-Based Preference Collection

Rather than maintaining a rigid list of predefined preferences, TravelAgentic uses AI-driven context collection to gather relevant travel information dynamically. This allows for more natural, flexible, and comprehensive preference gathering.

## Collection Approaches

### User Story 1: Structured Onboarding Flow

**Process:**

1. **User** → Fills out initial form with required fields:
   - Starting location
   - Destination (can select "unsure")
   - Dates
2. **LLM** → Generates contextually relevant multiple choice questions based on initial form input
3. **User** → Fills out LLM-generated preference questions (can skip any questions or switch to chat mode)
4. **LLM Orchestrator** → Splits tasks (flight, hotel, activities) into multiple agents
5. **LLM** → Returns flight recommendations
6. **User** → Selects a flight or uses chat window to make suggestions/changes for the LLM
7. **LLM** → Sends next tier of recommendations (contextually, flight or hotel)
8. **LLM** → Continues this process until user has made all selections, then returns a shopping cart for user to review or make changes
9. **User** → Confirms shopping or makes changes
10. **LLM** → Books all relevant types through API/browser/voice, and returns a printable itinerary of their vacation that includes todos

### User Story 2: Conversational Discovery Flow

**Process:**

1. **LLM** → Greets user and asks for date, price range, location
2. **User** → Provides information and suggestions
3. **LLM** → Iterates with the user for remaining preferences
4. **LLM** → Spins up agents, then automatically selects best fits before presenting shopping cart
5. **User** → Accepts shopping cart
6. **LLM** → Books the vacation, warning the user when manual intervention is required

## Context Storage Structure

### Preference Context Object

```json
{
  "collection_method": "structured|conversational",
  "preferences": {
    "destination": {
      "value": "Tokyo, Japan",
      "confidence": 0.95,
      "source": "user_stated"
    },
    "dates": {
      "departure": "2024-03-15",
      "return": "2024-03-22",
      "flexibility": "±2 days",
      "confidence": 0.9,
      "source": "user_stated"
    },
    "budget": {
      "total": 3000,
      "currency": "USD",
      "flexibility": "strict",
      "confidence": 0.8,
      "source": "user_stated"
    },
    "group": {
      "size": 2,
      "composition": "couple",
      "confidence": 1.0,
      "source": "user_stated"
    },
    "interests": [
      {
        "category": "cultural_sites",
        "specific": ["temples", "traditional_architecture"],
        "priority": "high",
        "confidence": 0.9,
        "source": "conversational"
      },
      {
        "category": "food_experiences",
        "specific": ["vegetarian_friendly", "authentic_local"],
        "priority": "high",
        "confidence": 0.85,
        "source": "conversational"
      }
    ],
    "constraints": [
      {
        "type": "dietary",
        "value": "vegetarian",
        "strictness": "required",
        "confidence": 1.0,
        "source": "user_stated"
      },
      {
        "type": "language",
        "value": "english_only",
        "comfort_level": "basic_phrases_ok",
        "confidence": 0.7,
        "source": "inferred"
      }
    ],
    "accommodation": {
      "type": ["hotel", "ryokan"],
      "location_preference": "central_access_to_attractions",
      "budget_range": [100, 200],
      "confidence": 0.6,
      "source": "inferred"
    },
    "transportation": {
      "preferred": ["public_transit", "walking"],
      "avoid": ["rental_car"],
      "confidence": 0.8,
      "source": "inferred"
    }
  },
  "context_notes": [
    "User expressed concern about language barriers",
    "Emphasized authentic cultural experiences over modern attractions",
    "Mentioned being vegetarian multiple times"
  ],
  "collection_session": {
    "method": "conversational",
    "timestamp": "2024-01-15T10:30:00Z",
    "trip_id": "tokyo_2024_march"
  }
}
```

### Dynamic Field Discovery

Instead of predefined categories, let the LLM discover what's important:

**LLM-Identified Context Areas:**

- **Destination Insights**: What matters for this specific location
- **Seasonal Considerations**: Weather, events, crowds for travel time
- **Cultural Factors**: Language, customs, social norms relevant to user
- **Personal Constraints**: Budget, accessibility, dietary, family needs
- **Experience Priorities**: What type of experiences matter most
- **Comfort Boundaries**: Risk tolerance, adventure level, cultural immersion
- **Practical Needs**: Transportation, accommodation, connectivity

## Implementation Strategy

### Context-Aware Question Generation

```javascript
// LLM prompt for generating relevant questions
const generateContextQuestions = (initialInput) => {
  const prompt = `
    Based on this travel request: "${initialInput}"
    
    Generate 5-8 multiple choice questions that would help create 
    the best travel recommendations. Focus on:
    - Destination-specific considerations
    - User's experience priorities  
    - Practical constraints
    - Personal comfort levels
    
    Include an open-ended "What else should I know?" option.
    Each question should have 3-5 options plus "unsure".
  `;

  return llm.generateQuestions(prompt);
};
```

### Conversational Context Extraction

```javascript
// Extract structured context from conversation
const extractTravelContext = (conversationHistory) => {
  const prompt = `
    From this conversation about travel planning:
    "${conversationHistory}"
    
    Extract key preferences, constraints, and interests.
    Focus on actionable information for trip planning.
    Note confidence levels for each extracted preference.
    
    Return structured context that can guide travel recommendations.
  `;

  return llm.extractContext(prompt);
};
```

## Context Refinement

### Real-Time Corrections

- **Preference Clarification**: Allow users to correct misunderstood preferences during current session
- **Context Expansion**: Add new context as conversation continues within current trip planning
- **Confidence Adjustment**: Increase confidence in confirmed preferences for current trip

## Benefits of Context-Based Approach

### For Users

- **Natural Expression**: Describe preferences in their own terms
- **Relevant Questions**: Only asked about pertinent information
- **Flexible Input**: Multiple choice, conversation, or mixed modes
- **Dynamic Understanding**: System adapts to user input in real-time

### For System

- **Adaptive Collection**: Questions adapt to destination/trip type
- **Rich Context**: Captures nuanced preferences beyond categories
- **Improved Recommendations**: Better understanding leads to better suggestions
- **Scalable Approach**: Works for any destination or trip type

## Implementation Notes

- Context collection should feel natural, not like a form
- Allow users to skip questions or provide partial information
- Support both structured and unstructured input methods
- Enable context editing and refinement during current session
- Use confidence levels to handle uncertain preferences
- Support context sharing between users for group trips
