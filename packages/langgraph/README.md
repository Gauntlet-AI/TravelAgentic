# TravelAgentic LangGraph Service

This package contains the LangGraph-based AI workflows for TravelAgentic's travel planning system.

## Overview

The LangGraph service replaces the previous Langflow implementation and provides:

- **User Intake Graph**: Generates dynamic preference questions based on destination
- **Search Coordination Graph**: Optimizes search parameters for flights, hotels, and activities  
- **Booking Decisions Graph**: Analyzes search results and recommends optimal bookings
- **Itinerary Generation Graph**: Creates detailed day-by-day travel itineraries

## Key Advantages over Langflow

- **Better State Management**: LangGraph provides more sophisticated state handling
- **Conditional Logic**: More powerful control flow with conditional routing
- **Error Handling**: Robust error handling and recovery mechanisms  
- **Performance**: Better performance and resource utilization
- **Extensibility**: Easier to extend and modify workflows

## Quick Start

### Virtual Environment Setup

**First-time setup:**
```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment (standard method)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Upgrade pip (recommended)
python -m pip install --upgrade pip
```

**Alternative activation (using custom script):**
```bash
# Make activation script executable
chmod +x activate.sh

# Activate virtual environment
./activate.sh
```

**Troubleshooting:**
- If `.venv` folder is corrupted, remove it and recreate: `rm -rf .venv && python3 -m venv .venv`
- Always activate the virtual environment before installing dependencies
- Deactivate with: `deactivate`

### Development

```bash
# Activate virtual environment
source .venv/bin/activate

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Run the service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Docker

```bash
# Build and run with Docker
docker build -t travelagentic-langgraph .
docker run -p 8000:8000 --env-file .env travelagentic-langgraph
```

### With Docker Compose

```bash
# From project root
docker-compose up langgraph
```

## API Endpoints

- `GET /health` - Health check
- `GET /` - Service information
- `POST /graphs/user_intake` - Generate preference questions
- `POST /graphs/search_coordination` - Generate search parameters
- `POST /graphs/booking_decisions` - Process booking decisions
- `POST /graphs/itinerary_generation` - Generate travel itinerary
- `GET /graphs/status` - Get graphs status

## Architecture

Each graph is implemented as a LangGraph StateGraph with the following pattern:

1. **Input Validation** - Validate incoming data
2. **Processing Nodes** - Core business logic using LLMs
3. **Output Validation** - Ensure output quality
4. **Error Handling** - Graceful fallback mechanisms

### Prompt Management

The service includes a sophisticated prompt management system:

- **Prompt Templates**: Reusable prompt files in `/prompts/` directory
- **Prompt Manager**: Centralized loading and caching of prompts
- **Template Enhancement**: Dynamic prompt composition with variables
- **Fallback Support**: Graceful degradation when prompts unavailable

Available prompt templates:
- `OrchestratorAgent.txt` - Main travel planning orchestrator
- `FlightAgent.txt` - Flight search and recommendations  
- `LodgingAgent.txt` - Hotel search and recommendations
- `ActivitiesAgent.txt` - Activity search and recommendations

## Graph Details

### User Intake Graph
- Analyzes destination and travel details
- Generates 3-5 contextual preference questions
- Considers destination-specific interests

### Search Coordination Graph  
- Takes user preferences as input
- Generates optimized search parameters
- Includes validation and optimization steps

### Booking Decisions Graph
- Analyzes search results and preferences
- Recommends optimal bookings with reasoning
- Provides confidence scores and alternatives

### Itinerary Generation Graph
- Creates detailed day-by-day itineraries
- Includes activities, meals, and logistics
- Adds local information and packing lists

## Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Optional
LOG_LEVEL=INFO
PYTHON_ENV=development
```

## Development

### Adding New Graphs

1. Create new graph class in `travel_graphs/`
2. Inherit from `BaseTravelGraph`
3. Implement `_build_graph()` method
4. Add to `main.py` endpoints
5. Update `__init__.py` exports

### Testing

```bash
# Run tests
python -m pytest tests/

# Test specific graph
python -m pytest tests/test_user_intake_graph.py
```

## Deployment

The service is designed to run in containerized environments:

- **Development**: Docker Compose with hot reload
- **Production**: Docker containers with auto-scaling
- **Cloud**: Compatible with AWS ECS, Google Cloud Run, etc.

## Migration from Langflow

This service is a direct replacement for Langflow with:
- Same API interface (for backward compatibility)
- Enhanced functionality and performance
- Better error handling and monitoring
- More flexible workflow definition

## Monitoring

The service provides:
- Health check endpoints
- Structured logging
- Execution metrics
- Error tracking 