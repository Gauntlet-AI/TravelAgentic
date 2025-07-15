"""
TravelAgentic LangGraph Service
FastAPI application for AI-powered travel planning using LangGraph
"""

import os
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from travel_graphs.user_intake_graph import UserIntakeGraph
from travel_graphs.search_coordination_graph import SearchCoordinationGraph
from travel_graphs.booking_decisions_graph import BookingDecisionsGraph
from travel_graphs.itinerary_generation_graph import ItineraryGenerationGraph
from travel_graphs.orchestrator_graph import TravelOrchestratorGraph

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="TravelAgentic LangGraph Service",
    description="AI-powered travel planning workflows using LangGraph",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize graphs
user_intake_graph = UserIntakeGraph()
search_coordination_graph = SearchCoordinationGraph()
booking_decisions_graph = BookingDecisionsGraph()
itinerary_generation_graph = ItineraryGenerationGraph()
orchestrator_graph = TravelOrchestratorGraph()

# Pydantic models for request/response
class UserIntakeRequest(BaseModel):
    destination: str = Field(..., description="Travel destination")
    start_date: str = Field(..., description="Start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD)")
    travelers: int = Field(..., ge=1, description="Number of travelers")
    budget: Optional[float] = Field(None, description="Travel budget")

class SearchCoordinationRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    travelers: int
    adults: int
    children: int
    budget: Optional[float] = None
    travel_style: Optional[str] = None
    accommodation: Optional[str] = None
    interests: Optional[list[str]] = None
    special_requirements: Optional[list[str]] = None
    traveling_with_pets: Optional[bool] = None

class BookingDecisionsRequest(BaseModel):
    search_results: Dict[str, Any]
    preferences: Dict[str, Any]

class ItineraryGenerationRequest(BaseModel):
    bookings: Dict[str, Any]
    preferences: Dict[str, Any]

class ComponentSelection(BaseModel):
    """Model for travel component selection"""
    flights: bool = Field(True, description="Whether flights are needed")
    hotels: bool = Field(True, description="Whether hotels are needed")
    activities: bool = Field(True, description="Whether activities are needed")

class OrchestratorRequest(BaseModel):
    """Request model for orchestrator conversations"""
    message: Optional[str] = None
    conversation_id: Optional[str] = None
    automation_level: int = Field(1, ge=1, le=4, description="Automation level (1-4)")
    user_preferences: Optional[Dict[str, Any]] = None
    components_needed: Optional[ComponentSelection] = Field(None, description="Which travel components are needed")
    action: Optional[str] = Field(None, description="Action type: start, continue, modify, backtrack")
    modify_section: Optional[str] = Field(None, description="Section to modify: flights, hotels, activities")
    
    # Legacy structured input support
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travelers: Optional[int] = None
    budget: Optional[float] = None

class ConversationResumeRequest(BaseModel):
    """Request model for conversation resumption"""
    conversation_id: str
    snapshot_id: Optional[str] = None
    action: Optional[str] = Field("resume", description="Resume action type")

class TripTemplateRequest(BaseModel):
    """Request model for trip template operations"""
    template_id: Optional[str] = None
    template_name: Optional[str] = None
    conversation_id: Optional[str] = None
    action: str = Field(..., description="Action: save, load, export, import")
    template_data: Optional[Dict[str, Any]] = None

class GraphResponse(BaseModel):
    success: bool
    data: Any
    execution_id: Optional[str] = None
    execution_time: Optional[float] = None

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "langgraph"}

@app.get("/")
async def root():
    """Root endpoint with service info"""
    return {
        "service": "TravelAgentic LangGraph",
        "version": "1.0.0",
        "graphs": [
            "user_intake",
            "search_coordination", 
            "booking_decisions",
            "itinerary_generation"
        ]
    }

@app.post("/graphs/user_intake", response_model=GraphResponse)
async def run_user_intake_graph(request: UserIntakeRequest):
    """
    Generate dynamic preference questions based on travel details
    """
    try:
        logger.info(f"Running user intake graph for {request.destination}")
        
        # Convert request to graph input
        graph_input = {
            "destination": request.destination,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "travelers": request.travelers,
            "budget": request.budget or 5000
        }
        
        # Execute graph
        result = await user_intake_graph.run(graph_input)
        
        return GraphResponse(
            success=True,
            data=result,
            execution_id=result.get("execution_id"),
            execution_time=result.get("execution_time")
        )
        
    except Exception as e:
        logger.error(f"User intake graph error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/graphs/search_coordination", response_model=GraphResponse)
async def run_search_coordination_graph(request: SearchCoordinationRequest):
    """
    Generate optimized search parameters based on user preferences
    """
    try:
        logger.info(f"Running search coordination graph for {request.destination}")
        
        # Convert request to graph input
        graph_input = request.dict()
        
        # Execute graph
        result = await search_coordination_graph.run(graph_input)
        
        return GraphResponse(
            success=True,
            data=result,
            execution_id=result.get("execution_id"),
            execution_time=result.get("execution_time")
        )
        
    except Exception as e:
        logger.error(f"Search coordination graph error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/graphs/booking_decisions", response_model=GraphResponse)
async def run_booking_decisions_graph(request: BookingDecisionsRequest):
    """
    Process booking decisions with AI logic
    """
    try:
        logger.info("Running booking decisions graph")
        
        # Convert request to graph input
        graph_input = {
            "search_results": request.search_results,
            "preferences": request.preferences
        }
        
        # Execute graph
        result = await booking_decisions_graph.run(graph_input)
        
        return GraphResponse(
            success=True,
            data=result,
            execution_id=result.get("execution_id"),
            execution_time=result.get("execution_time")
        )
        
    except Exception as e:
        logger.error(f"Booking decisions graph error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/graphs/itinerary_generation", response_model=GraphResponse)
async def run_itinerary_generation_graph(request: ItineraryGenerationRequest):
    """
    Generate personalized itinerary
    """
    try:
        logger.info("Running itinerary generation graph")
        
        # Convert request to graph input
        graph_input = {
            "bookings": request.bookings,
            "preferences": request.preferences
        }
        
        # Execute graph
        result = await itinerary_generation_graph.run(graph_input)
        
        return GraphResponse(
            success=True,
            data=result,
            execution_id=result.get("execution_id"),
            execution_time=result.get("execution_time")
        )
        
    except Exception as e:
        logger.error(f"Itinerary generation graph error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/graphs/status")
async def get_graphs_status():
    """
    Get status of all available graphs
    """
    try:
        return {
            "graphs": {
                "user_intake": {"status": "available", "description": "Generate preference questions"},
                "search_coordination": {"status": "available", "description": "Optimize search parameters"},
                "booking_decisions": {"status": "available", "description": "Process booking decisions"},
                "itinerary_generation": {"status": "available", "description": "Generate personalized itinerary"},
                "orchestrator": {"status": "available", "description": "Unified conversation orchestrator"}
            },
            "total_graphs": 5,
            "service_healthy": True
        }
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ORCHESTRATOR ENDPOINTS (New unified system)
# ============================================================================

@app.post("/orchestrator/invoke", response_model=GraphResponse)
async def invoke_orchestrator(request: OrchestratorRequest):
    """
    Invoke the orchestrator graph for unified conversation-based travel planning
    Supports both structured and conversational input with automation levels 1-4
    """
    try:
        logger.info(f"Invoking orchestrator with automation level {request.automation_level}")
        
        # Prepare input data
        input_data = {
            "automation_level": request.automation_level,
            "action": request.action or "start",
            "modify_section": request.modify_section
        }
        
        # Handle structured input (legacy support)
        if request.destination:
            input_data.update({
                "destination": request.destination,
                "start_date": request.start_date,
                "end_date": request.end_date,
                "travelers": request.travelers,
                "budget": request.budget
            })
        
        # Handle conversational input
        if request.message:
            input_data["message"] = request.message
        
        # Add user preferences
        if request.user_preferences:
            input_data["preferences"] = request.user_preferences
        
        # Handle component selection
        if request.components_needed:
            if "preferences" not in input_data:
                input_data["preferences"] = {}
            input_data["preferences"]["components_needed"] = {
                "flights": request.components_needed.flights,
                "hotels": request.components_needed.hotels,
                "activities": request.components_needed.activities
            }
        
        # Handle conversation resumption
        if request.conversation_id:
            input_data["conversation_id"] = request.conversation_id
        
        # Execute orchestrator graph
        result = await orchestrator_graph.run(input_data)
        
        return GraphResponse(
            success=True,
            data=result,
            execution_id=result.get("execution_id"),
            execution_time=result.get("execution_time")
        )
        
    except Exception as e:
        logger.error(f"Orchestrator execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orchestrator/resume", response_model=GraphResponse)
async def resume_conversation(request: ConversationResumeRequest):
    """
    Resume a conversation from a saved state or snapshot
    """
    try:
        logger.info(f"Resuming conversation {request.conversation_id}")
        
        input_data = {
            "conversation_id": request.conversation_id,
            "action": request.action,
            "snapshot_id": request.snapshot_id
        }
        
        # Execute orchestrator with resumption
        result = await orchestrator_graph.run(input_data)
        
        return GraphResponse(
            success=True,
            data=result,
            execution_id=result.get("execution_id"),
            execution_time=result.get("execution_time")
        )
        
    except Exception as e:
        logger.error(f"Conversation resumption error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orchestrator/templates", response_model=GraphResponse)
async def manage_trip_templates(request: TripTemplateRequest):
    """
    Manage trip templates: save, load, export, import
    """
    try:
        logger.info(f"Managing trip template: {request.action}")
        
        input_data = {
            "template_action": request.action,
            "template_id": request.template_id,
            "template_name": request.template_name,
            "conversation_id": request.conversation_id,
            "template_data": request.template_data
        }
        
        # Execute orchestrator with template management
        result = await orchestrator_graph.run(input_data)
        
        return GraphResponse(
            success=True,
            data=result,
            execution_id=result.get("execution_id"),
            execution_time=result.get("execution_time")
        )
        
    except Exception as e:
        logger.error(f"Template management error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestrator/conversations/{conversation_id}")
async def get_conversation_state(conversation_id: str):
    """
    Get current state of a conversation
    """
    try:
        logger.info(f"Getting conversation state for {conversation_id}")
        
        # This would typically fetch from a database
        # For now, return a placeholder response
        return {
            "conversation_id": conversation_id,
            "status": "active",
            "current_step": "unknown",
            "message": "Conversation state retrieval not yet implemented in orchestrator"
        }
        
    except Exception as e:
        logger.error(f"Get conversation state error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestrator/conversations/{conversation_id}/snapshots")
async def get_conversation_snapshots(conversation_id: str):
    """
    Get available snapshots for backtracking
    """
    try:
        logger.info(f"Getting snapshots for conversation {conversation_id}")
        
        # This would typically fetch from orchestrator's backtrack system
        # For now, return a placeholder response
        return {
            "conversation_id": conversation_id,
            "snapshots": [],
            "message": "Snapshot retrieval not yet implemented in orchestrator"
        }
        
    except Exception as e:
        logger.error(f"Get snapshots error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 