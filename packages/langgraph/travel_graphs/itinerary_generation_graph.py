"""
Itinerary Generation Graph for TravelAgentic
Generates personalized travel itineraries using LangGraph
"""

import json
import logging
from typing import Dict, Any
from datetime import datetime, timedelta

from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END

from .base_graph import BaseTravelGraph, GraphState

logger = logging.getLogger(__name__)

class ItineraryGenerationGraph(BaseTravelGraph):
    """
    LangGraph implementation for generating personalized travel itineraries
    Creates detailed day-by-day itineraries with activities, dining, and local information
    """
    
    def _build_graph(self):
        """Build the itinerary generation graph workflow"""
        # Create the graph
        workflow = StateGraph(GraphState)
        
        # Add nodes
        workflow.add_node("validate_bookings", self._validate_bookings)
        workflow.add_node("analyze_trip_structure", self._analyze_trip_structure)
        workflow.add_node("generate_daily_plans", self._generate_daily_plans)
        workflow.add_node("add_local_info", self._add_local_info)
        workflow.add_node("create_packing_list", self._create_packing_list)
        
        # Add edges
        workflow.add_edge("validate_bookings", "analyze_trip_structure")
        workflow.add_edge("analyze_trip_structure", "generate_daily_plans")
        workflow.add_edge("generate_daily_plans", "add_local_info")
        workflow.add_edge("add_local_info", "create_packing_list")
        workflow.add_edge("create_packing_list", END)
        
        # Set entry point
        workflow.set_entry_point("validate_bookings")
        
        # Compile the graph
        self.graph = workflow.compile()
    
    async def _validate_bookings(self, state: GraphState) -> GraphState:
        """Validate bookings and preferences input"""
        logger.info("Validating bookings and preferences")
        
        input_data = state["input_data"]
        
        if "bookings" not in input_data:
            state["error"] = "Missing bookings"
            return state
        
        if "preferences" not in input_data:
            state["error"] = "Missing preferences"
            return state
        
        bookings = input_data["bookings"]
        preferences = input_data["preferences"]
        
        # Validate preferences have required fields
        required_fields = ["destination", "start_date", "end_date", "travelers"]
        for field in required_fields:
            if field not in preferences:
                state["error"] = f"Missing preference field: {field}"
                return state
        
        state["step_count"] += 1
        logger.info("Bookings validation successful")
        return state
    
    async def _analyze_trip_structure(self, state: GraphState) -> GraphState:
        """Analyze trip structure and timeline"""
        logger.info("Analyzing trip structure")
        
        if state.get("error"):
            return state
        
        input_data = state["input_data"]
        preferences = input_data["preferences"]
        
        # Calculate trip details
        start_date = datetime.strptime(preferences["start_date"], "%Y-%m-%d")
        end_date = datetime.strptime(preferences["end_date"], "%Y-%m-%d")
        trip_duration = (end_date - start_date).days
        
        # Create day-by-day structure
        trip_structure = {
            "total_days": trip_duration,
            "start_date": preferences["start_date"],
            "end_date": preferences["end_date"],
            "destination": preferences["destination"],
            "travelers": preferences["travelers"],
            "daily_structure": []
        }
        
        # Generate daily structure
        for i in range(trip_duration):
            day_date = start_date + timedelta(days=i)
            day_type = "arrival" if i == 0 else "departure" if i == trip_duration - 1 else "full"
            
            trip_structure["daily_structure"].append({
                "day": i + 1,
                "date": day_date.strftime("%Y-%m-%d"),
                "day_name": day_date.strftime("%A"),
                "day_type": day_type
            })
        
        state["output_data"] = {"trip_structure": trip_structure}
        state["step_count"] += 1
        
        logger.info(f"Trip structure created: {trip_duration} days")
        return state
    
    async def _generate_daily_plans(self, state: GraphState) -> GraphState:
        """Generate detailed daily plans using LLM"""
        logger.info("Generating daily plans")
        
        if state.get("error"):
            return state
        
        input_data = state["input_data"]
        bookings = input_data["bookings"]
        preferences = input_data["preferences"]
        trip_structure = state["output_data"]["trip_structure"]
        
        # Create system message for itinerary generation
        system_prompt = """You are TravelAgentic's itinerary generation specialist. Create a detailed day-by-day travel itinerary based on bookings and preferences.

For each day, provide:
1. Morning activities (9:00 AM - 12:00 PM)
2. Afternoon activities (12:00 PM - 6:00 PM)
3. Evening activities (6:00 PM - 10:00 PM)
4. Meal recommendations
5. Transportation notes
6. Special considerations

Return ONLY a JSON object in this exact format:
{
  "title": "Amazing Tokyo Adventure",
  "description": "A personalized 5-day itinerary exploring the best of Tokyo",
  "days": [
    {
      "day": 1,
      "date": "2024-03-15",
      "day_name": "Friday",
      "theme": "Arrival & Exploration",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Arrive at Narita Airport",
          "location": "Narita Airport",
          "duration": "1 hour",
          "type": "travel",
          "notes": "Take Airport Express to Shibuya"
        },
        {
          "time": "12:00 PM",
          "activity": "Check into hotel",
          "location": "Shibuya",
          "duration": "30 minutes",
          "type": "accommodation",
          "notes": "Store luggage if room not ready"
        }
      ],
      "meals": [
        {
          "time": "1:00 PM",
          "meal": "Lunch",
          "restaurant": "Ichiran Ramen",
          "cuisine": "Japanese",
          "location": "Shibuya"
        }
      ],
      "transportation": "Airport Express, Walking",
      "estimated_cost": 150,
      "energy_level": "moderate"
    }
  ],
  "packing_list": [
    "Comfortable walking shoes",
    "Light jacket",
    "Portable charger",
    "Universal adapter"
  ],
  "local_info": {
    "currency": "JPY",
    "language": "Japanese",
    "emergency_numbers": ["110 (Police)", "119 (Fire/Ambulance)"],
    "cultural_tips": [
      "Bow when greeting people",
      "Remove shoes when entering homes",
      "Don't eat or drink while walking"
    ],
    "transportation_tips": [
      "Get a JR Pass for unlimited train travel",
      "Download Google Translate app",
      "IC cards work on all public transport"
    ]
  }
}

Consider:
- Balance of activities (culture, food, sightseeing, relaxation)
- Travel time between locations
- Opening hours and seasonal factors
- Budget constraints
- Group size and interests
- Local customs and etiquette
- Practical logistics (meals, transportation, rest)"""
        
        user_prompt = f"""Create a detailed itinerary for this trip:

Destination: {preferences['destination']}
Duration: {trip_structure['total_days']} days
Travelers: {preferences['travelers']}
Travel Style: {preferences.get('travel_style', 'mixed')}
Budget: ${preferences.get('budget', 5000)}
Interests: {preferences.get('interests', [])}

Trip Structure:
{json.dumps(trip_structure['daily_structure'], indent=2)}

Confirmed Bookings:
{json.dumps(bookings, indent=2)}

Please create a comprehensive day-by-day itinerary that maximizes the experience while considering practical factors like transportation, meal times, and energy levels."""
        
        try:
            # Create messages
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            # Get LLM response
            response = await self.llm.ainvoke(messages)
            
            # Parse the JSON response
            itinerary = json.loads(response.content)
            
            # Update state with itinerary
            state["output_data"].update(itinerary)
            state["step_count"] += 1
            
            logger.info(f"Generated itinerary with {len(itinerary.get('days', []))} days")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            state["error"] = f"Invalid JSON response from LLM: {str(e)}"
        except Exception as e:
            logger.error(f"Itinerary generation failed: {str(e)}")
            state["error"] = f"Itinerary generation failed: {str(e)}"
        
        return state
    
    async def _add_local_info(self, state: GraphState) -> GraphState:
        """Add or enhance local information"""
        logger.info("Adding local information")
        
        if state.get("error"):
            return state
        
        input_data = state["input_data"]
        preferences = input_data["preferences"]
        destination = preferences["destination"]
        
        # If LLM didn't provide comprehensive local info, add basic info
        output_data = state.get("output_data", {})
        
        if "local_info" not in output_data:
            # Add basic local info based on destination
            basic_local_info = self._get_basic_local_info(destination)
            output_data["local_info"] = basic_local_info
        
        state["step_count"] += 1
        logger.info("Local information added")
        return state
    
    async def _create_packing_list(self, state: GraphState) -> GraphState:
        """Create or enhance packing list"""
        logger.info("Creating packing list")
        
        if state.get("error"):
            return state
        
        input_data = state["input_data"]
        preferences = input_data["preferences"]
        
        # If LLM didn't provide packing list, create basic one
        output_data = state.get("output_data", {})
        
        if "packing_list" not in output_data:
            # Create basic packing list
            basic_packing_list = self._get_basic_packing_list(preferences)
            output_data["packing_list"] = basic_packing_list
        
        state["step_count"] += 1
        logger.info("Packing list created")
        return state
    
    def _get_basic_local_info(self, destination: str) -> Dict[str, Any]:
        """Get basic local information for common destinations"""
        
        # Common local info templates
        local_info_templates = {
            "tokyo": {
                "currency": "JPY",
                "language": "Japanese",
                "emergency_numbers": ["110 (Police)", "119 (Fire/Ambulance)"],
                "cultural_tips": [
                    "Bow when greeting people",
                    "Remove shoes when entering homes",
                    "Don't eat or drink while walking"
                ]
            },
            "paris": {
                "currency": "EUR",
                "language": "French",
                "emergency_numbers": ["112 (Emergency)", "17 (Police)"],
                "cultural_tips": [
                    "Greet with 'Bonjour' in shops",
                    "Dress nicely for restaurants",
                    "Keep voice down in public"
                ]
            },
            "london": {
                "currency": "GBP",
                "language": "English",
                "emergency_numbers": ["999 (Emergency)"],
                "cultural_tips": [
                    "Queue politely",
                    "Stand right on escalators",
                    "Mind the gap on the tube"
                ]
            }
        }
        
        destination_lower = destination.lower()
        
        # Check if we have specific info for this destination
        for key, info in local_info_templates.items():
            if key in destination_lower:
                return info
        
        # Default local info
        return {
            "currency": "Local Currency",
            "language": "Local Language",
            "emergency_numbers": ["Emergency Services"],
            "cultural_tips": [
                "Respect local customs",
                "Be polite and patient",
                "Learn basic phrases"
            ]
        }
    
    def _get_basic_packing_list(self, preferences: Dict[str, Any]) -> list:
        """Get basic packing list based on preferences"""
        
        basic_items = [
            "Comfortable walking shoes",
            "Weather-appropriate clothing",
            "Portable charger",
            "Universal adapter",
            "Passport and documents",
            "Travel insurance documents",
            "Medications",
            "Camera"
        ]
        
        # Add items based on travel style
        travel_style = preferences.get("travel_style", "mixed")
        
        if travel_style == "adventure":
            basic_items.extend([
                "Hiking boots",
                "Waterproof jacket",
                "Daypack",
                "First aid kit"
            ])
        elif travel_style == "business":
            basic_items.extend([
                "Business attire",
                "Laptop",
                "Business cards",
                "Presentation materials"
            ])
        elif travel_style == "relaxation":
            basic_items.extend([
                "Sunscreen",
                "Sunglasses",
                "Beach towel",
                "Flip-flops"
            ])
        
        # Add items based on special requirements
        special_requirements = preferences.get("special_requirements", [])
        
        if "dietary" in special_requirements:
            basic_items.append("Dietary restriction cards")
        
        if "accessibility" in special_requirements:
            basic_items.append("Mobility aids")
        
        if preferences.get("traveling_with_pets"):
            basic_items.extend([
                "Pet travel documents",
                "Pet food",
                "Pet carrier/leash"
            ])
        
        return basic_items 