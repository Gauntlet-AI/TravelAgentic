"""
Booking Decisions Graph for TravelAgentic
Processes booking decisions with AI logic using LangGraph
"""

import json
import logging
from typing import Dict, Any

from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END

from .base_graph import BaseTravelGraph, GraphState

logger = logging.getLogger(__name__)

class BookingDecisionsGraph(BaseTravelGraph):
    """
    LangGraph implementation for processing booking decisions
    Analyzes search results and user preferences to recommend optimal bookings
    """
    
    def _build_graph(self):
        """Build the booking decisions graph workflow"""
        # Create the graph
        workflow = StateGraph(GraphState)
        
        # Add nodes
        workflow.add_node("validate_inputs", self._validate_inputs)
        workflow.add_node("analyze_results", self._analyze_results)
        workflow.add_node("generate_recommendations", self._generate_recommendations)
        workflow.add_node("calculate_confidence", self._calculate_confidence)
        
        # Add edges
        workflow.add_edge("validate_inputs", "analyze_results")
        workflow.add_edge("analyze_results", "generate_recommendations")
        workflow.add_edge("generate_recommendations", "calculate_confidence")
        workflow.add_edge("calculate_confidence", END)
        
        # Set entry point
        workflow.set_entry_point("validate_inputs")
        
        # Compile the graph
        self.graph = workflow.compile()
    
    async def _validate_inputs(self, state: GraphState) -> GraphState:
        """Validate search results and preferences input"""
        logger.info("Validating booking decision inputs")
        
        input_data = state["input_data"]
        
        if "search_results" not in input_data:
            state["error"] = "Missing search_results"
            return state
        
        if "preferences" not in input_data:
            state["error"] = "Missing preferences"
            return state
        
        search_results = input_data["search_results"]
        
        # Check that we have at least one type of search result
        if not any(key in search_results for key in ["flights", "hotels", "activities"]):
            state["error"] = "No search results found"
            return state
        
        state["step_count"] += 1
        logger.info("Input validation successful")
        return state
    
    async def _analyze_results(self, state: GraphState) -> GraphState:
        """Analyze search results to understand options"""
        logger.info("Analyzing search results")
        
        if state.get("error"):
            return state
        
        input_data = state["input_data"]
        search_results = input_data["search_results"]
        preferences = input_data["preferences"]
        
        # Analyze available options
        analysis = {
            "flight_options": len(search_results.get("flights", [])),
            "hotel_options": len(search_results.get("hotels", [])),
            "activity_options": len(search_results.get("activities", [])),
            "budget_range": self._analyze_budget_range(search_results),
            "quality_range": self._analyze_quality_range(search_results),
            "preferences_match": self._analyze_preferences_match(search_results, preferences)
        }
        
        state["output_data"] = {"analysis": analysis}
        state["step_count"] += 1
        
        logger.info(f"Analysis complete: {analysis['flight_options']} flights, {analysis['hotel_options']} hotels, {analysis['activity_options']} activities")
        return state
    
    async def _generate_recommendations(self, state: GraphState) -> GraphState:
        """Generate booking recommendations using LLM"""
        logger.info("Generating booking recommendations")
        
        if state.get("error"):
            return state
        
        input_data = state["input_data"]
        search_results = input_data["search_results"]
        preferences = input_data["preferences"]
        
        # Create system message for booking decisions
        system_prompt = """You are TravelAgentic's booking decision specialist. Based on search results and user preferences, recommend the best booking options with detailed reasoning.

Analyze the search results considering:
1. User budget and price sensitivity
2. Travel style and preferences
3. Quality ratings and reviews
4. Convenience factors (timing, location)
5. Value for money
6. Group suitability

Return ONLY a JSON object in this exact format:
{
  "recommended_flight": {
    "id": "flight_id",
    "airline": "airline_name",
    "price": 450,
    "departure_time": "08:00",
    "arrival_time": "14:30",
    "duration": "6h 30m",
    "stops": 0,
    "reasoning": "Best balance of price and convenience"
  },
  "recommended_hotel": {
    "id": "hotel_id",
    "name": "hotel_name",
    "price_per_night": 120,
    "rating": 4.5,
    "location": "downtown",
    "amenities": ["wifi", "pool", "gym"],
    "reasoning": "Excellent location with great amenities"
  },
  "recommended_activities": [
    {
      "id": "activity_id",
      "name": "activity_name",
      "price": 75,
      "duration": "half-day",
      "rating": 4.8,
      "category": "culture",
      "reasoning": "Highly rated cultural experience"
    }
  ],
  "confidence_score": 0.85,
  "total_estimated_cost": 1200,
  "reasoning": "Overall recommendation reasoning",
  "alternatives": {
    "flights": [],
    "hotels": [],
    "activities": []
  }
}

Provide detailed reasoning for each recommendation and ensure alternatives are included."""
        
        user_prompt = f"""Analyze these search results and generate optimal booking recommendations:

User Preferences:
- Budget: ${preferences.get('budget', 5000)}
- Travel Style: {preferences.get('travel_style', 'mixed')}
- Travelers: {preferences.get('travelers', 1)}
- Interests: {preferences.get('interests', [])}
- Special Requirements: {preferences.get('special_requirements', [])}

Search Results Summary:
- Flights: {len(search_results.get('flights', []))} options
- Hotels: {len(search_results.get('hotels', []))} options  
- Activities: {len(search_results.get('activities', []))} options

Detailed Results:
{json.dumps(search_results, indent=2)}

Please recommend the best options for this traveler with detailed reasoning."""
        
        try:
            # Create messages
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            # Get LLM response
            response = await self.llm.ainvoke(messages)
            
            # Parse the JSON response
            recommendations = json.loads(response.content)
            
            # Update state with recommendations
            state["output_data"].update(recommendations)
            state["step_count"] += 1
            
            logger.info("Generated booking recommendations successfully")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            state["error"] = f"Invalid JSON response from LLM: {str(e)}"
        except Exception as e:
            logger.error(f"Recommendation generation failed: {str(e)}")
            state["error"] = f"Recommendation generation failed: {str(e)}"
        
        return state
    
    async def _calculate_confidence(self, state: GraphState) -> GraphState:
        """Calculate confidence score for recommendations"""
        logger.info("Calculating confidence score")
        
        if state.get("error"):
            return state
        
        output_data = state.get("output_data", {})
        
        # If LLM didn't provide confidence score, calculate one
        if "confidence_score" not in output_data:
            input_data = state["input_data"]
            search_results = input_data["search_results"]
            
            # Simple confidence calculation based on available options
            flight_count = len(search_results.get("flights", []))
            hotel_count = len(search_results.get("hotels", []))
            activity_count = len(search_results.get("activities", []))
            
            # More options generally mean better confidence
            base_confidence = 0.5
            if flight_count > 0:
                base_confidence += 0.1
            if hotel_count > 0:
                base_confidence += 0.1
            if activity_count > 0:
                base_confidence += 0.1
            
            # Bonus for multiple options
            if flight_count > 3:
                base_confidence += 0.05
            if hotel_count > 3:
                base_confidence += 0.05
            if activity_count > 5:
                base_confidence += 0.05
            
            output_data["confidence_score"] = min(base_confidence, 0.9)
        
        state["step_count"] += 1
        logger.info(f"Confidence score: {output_data.get('confidence_score', 0)}")
        
        return state
    
    def _analyze_budget_range(self, search_results: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze budget range from search results"""
        budget_analysis = {}
        
        # Analyze flight prices
        flights = search_results.get("flights", [])
        if flights:
            flight_prices = [f.get("price", 0) for f in flights if f.get("price")]
            if flight_prices:
                budget_analysis["flights"] = {
                    "min": min(flight_prices),
                    "max": max(flight_prices),
                    "avg": sum(flight_prices) / len(flight_prices)
                }
        
        # Analyze hotel prices
        hotels = search_results.get("hotels", [])
        if hotels:
            hotel_prices = [h.get("price_per_night", 0) for h in hotels if h.get("price_per_night")]
            if hotel_prices:
                budget_analysis["hotels"] = {
                    "min": min(hotel_prices),
                    "max": max(hotel_prices),
                    "avg": sum(hotel_prices) / len(hotel_prices)
                }
        
        # Analyze activity prices
        activities = search_results.get("activities", [])
        if activities:
            activity_prices = [a.get("price", 0) for a in activities if a.get("price")]
            if activity_prices:
                budget_analysis["activities"] = {
                    "min": min(activity_prices),
                    "max": max(activity_prices),
                    "avg": sum(activity_prices) / len(activity_prices)
                }
        
        return budget_analysis
    
    def _analyze_quality_range(self, search_results: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze quality range from search results"""
        quality_analysis = {}
        
        # Analyze hotel ratings
        hotels = search_results.get("hotels", [])
        if hotels:
            hotel_ratings = [h.get("rating", 0) for h in hotels if h.get("rating")]
            if hotel_ratings:
                quality_analysis["hotels"] = {
                    "min": min(hotel_ratings),
                    "max": max(hotel_ratings),
                    "avg": sum(hotel_ratings) / len(hotel_ratings)
                }
        
        # Analyze activity ratings
        activities = search_results.get("activities", [])
        if activities:
            activity_ratings = [a.get("rating", 0) for a in activities if a.get("rating")]
            if activity_ratings:
                quality_analysis["activities"] = {
                    "min": min(activity_ratings),
                    "max": max(activity_ratings),
                    "avg": sum(activity_ratings) / len(activity_ratings)
                }
        
        return quality_analysis
    
    def _analyze_preferences_match(self, search_results: Dict[str, Any], preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze how well search results match user preferences"""
        match_analysis = {}
        
        user_interests = preferences.get("interests", [])
        travel_style = preferences.get("travel_style", "mixed")
        
        # Analyze activity matches
        activities = search_results.get("activities", [])
        if activities and user_interests:
            matching_activities = []
            for activity in activities:
                activity_category = activity.get("category", "")
                if activity_category in user_interests:
                    matching_activities.append(activity)
            
            match_analysis["activities"] = {
                "total": len(activities),
                "matching": len(matching_activities),
                "match_percentage": len(matching_activities) / len(activities) * 100 if activities else 0
            }
        
        return match_analysis 