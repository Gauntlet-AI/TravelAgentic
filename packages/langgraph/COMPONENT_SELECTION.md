# Component Selection Feature

## Overview

The TravelAgentic LangGraph now supports **component selection**, allowing users to specify which travel components they need help with. This enables more flexible travel planning by excluding components that users don't need.

## Supported Components

- **Flights**: Air transportation to/from destination
- **Hotels**: Accommodation at destination  
- **Activities**: Things to do, attractions, experiences

## Use Cases

### 1. Local/Regional Trips (No Flights)
For trips within driving distance where flights aren't needed:
```json
{
  "components_needed": {
    "flights": false,
    "hotels": true,
    "activities": true
  }
}
```

### 2. Day Trips (No Hotels)
For single-day excursions without overnight stays:
```json
{
  "components_needed": {
    "flights": false,
    "hotels": false,
    "activities": true
  }
}
```

### 3. Business Trips (No Activities)
For work-focused trips without leisure activities:
```json
{
  "components_needed": {
    "flights": true,
    "hotels": true,
    "activities": false
  }
}
```

### 4. Transportation Only
When users have their own accommodation and activities:
```json
{
  "components_needed": {
    "flights": true,
    "hotels": false,
    "activities": false
  }
}
```

## API Usage

### REST API

Use the `/orchestrator/invoke` endpoint with the `components_needed` field:

```python
import requests

response = requests.post("http://localhost:8000/orchestrator/invoke", json={
    "automation_level": 1,
    "destination": "San Francisco",
    "start_date": "2025-08-15",
    "end_date": "2025-08-17",
    "travelers": 2,
    "budget": 1500,
    "components_needed": {
        "flights": False,
        "hotels": True,
        "activities": True
    }
})
```

### Direct Graph Usage

```python
from travel_graphs.orchestrator_graph import TravelOrchestratorGraph

orchestrator = TravelOrchestratorGraph()

input_data = {
    "automation_level": 1,
    "preferences": {
        "destination": "Napa Valley",
        "start_date": "2025-08-15",
        "end_date": "2025-08-15",
        "travelers": 2,
        "budget": 500,
        "components_needed": {
            "flights": False,
            "hotels": False,
            "activities": True
        }
    }
}

result = await orchestrator.run(input_data)
```

## User Interface Options

The system can present component selection through multiple choice questions:

**Question**: "Which travel components do you need help with?"

**Options**:
- Flights + Hotels + Activities (full trip planning)
- Hotels + Activities (I have my own transportation)
- Flights + Activities (I have accommodation)
- Activities only (I have flights and hotels)
- Flights + Hotels (just need transport and accommodation)
- Flights only (just need transportation)

## System Behavior

### Agent Coordination
- Only requested agents are executed in parallel
- Skip agents for unneeded components (improves performance)
- Context sharing adapts to active components

### Shopping Cart Structure
- Dynamic cart creation based on component selection
- Excluded components are set to `null` instead of empty arrays
- Budget allocation adjusts to active components only

### Booking Process
- Only attempts booking for selected components
- Progress tracking reflects actual components being booked
- Success criteria based on requested components only

## Examples

### Example 1: Weekend Getaway (No Flights)
```json
{
  "destination": "Sonoma County",
  "start_date": "2025-08-16",
  "end_date": "2025-08-18",
  "travelers": 2,
  "budget": 800,
  "components_needed": {
    "flights": false,
    "hotels": true,
    "activities": true
  }
}
```

**Result**: System searches for hotels and activities only, skips flight agent entirely.

### Example 2: Day Trip (Activities Only)
```json
{
  "destination": "Monterey Bay",
  "start_date": "2025-08-15",
  "end_date": "2025-08-15",
  "travelers": 4,
  "budget": 300,
  "components_needed": {
    "flights": false,
    "hotels": false,
    "activities": true
  }
}
```

**Result**: System searches for activities only, entire budget allocated to experiences.

### Example 3: Business Trip (No Activities)
```json
{
  "destination": "Denver",
  "start_date": "2025-08-20",
  "end_date": "2025-08-22",
  "travelers": 1,
  "budget": 1200,
  "components_needed": {
    "flights": true,
    "hotels": true,
    "activities": false
  }
}
```

**Result**: System books flights and hotels only, focuses on convenient business travel.

## Testing

Run the component selection test suite:

```bash
cd packages/langgraph
python test_component_selection.py
```

This tests various component combinations to ensure:
- Correct agents are executed
- Shopping cart structure matches requests
- Budget allocation works properly
- Booking process handles optional components

## Benefits

1. **Performance**: Faster execution by skipping unnecessary agents
2. **Relevance**: More focused recommendations for user's actual needs
3. **Budget Optimization**: Better allocation across needed components
4. **User Experience**: Less overwhelming for specific use cases
5. **Flexibility**: Supports diverse travel planning scenarios

## Migration

The feature is backward compatible - if no `components_needed` is specified, all components default to `true` (full trip planning). 