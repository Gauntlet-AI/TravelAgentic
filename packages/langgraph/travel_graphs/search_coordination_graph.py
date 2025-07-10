"""
Search Coordination Graph for TravelAgentic
Converts the langflow search coordination flow to LangGraph
Optimizes flight, hotel, and activity search parameters based on user preferences
"""

import json
import logging
from typing import Dict, Any

from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END

from .base_graph import BaseTravelGraph, GraphState
from .prompts import prompt_manager

logger = logging.getLogger(__name__)

class SearchCoordinationGraph(BaseTravelGraph):
    """
    LangGraph implementation of the search coordination workflow
    Coordinates and optimizes search parameters for flights, hotels, and activities
    """
    
    def _build_graph(self):
        """Build the search coordination graph workflow"""
        # Create the graph
        workflow = StateGraph(GraphState)
        
        # Add nodes
        workflow.add_node("validate_preferences", self._validate_preferences)
        workflow.add_node("generate_search_params", self._generate_search_params)
        workflow.add_node("validate_parameters", self._validate_parameters)
        workflow.add_node("optimize_parameters", self._optimize_parameters)
        
        # Add edges
        workflow.add_edge("validate_preferences", "generate_search_params")
        workflow.add_edge("generate_search_params", "validate_parameters")
        workflow.add_edge("validate_parameters", "optimize_parameters")
        workflow.add_edge("optimize_parameters", END)
        
        # Set entry point
        workflow.set_entry_point("validate_preferences")
        
        # Compile the graph
        self.graph = workflow.compile()
    
    async def _validate_preferences(self, state: GraphState) -> GraphState:
        """Validate user preferences input"""
        logger.info("Validating user preferences")
        
        input_data = state["input_data"]
        required_fields = ["destination", "start_date", "end_date", "travelers"]
        
        for field in required_fields:
            if field not in input_data:
                state["error"] = f"Missing required field: {field}"
                return state
        
        state["step_count"] += 1
        logger.info("Preferences validation successful")
        return state
    
    async def _generate_search_params(self, state: GraphState) -> GraphState:
        """Generate optimized search parameters using LLM"""
        logger.info("Generating search parameters")
        
        if state.get("error"):
            return state
        
        input_data = state["input_data"]
        
        # Use the orchestrator prompt as base and enhance it for search coordination
        try:
            base_orchestrator_prompt = prompt_manager.get_orchestrator_prompt()
            # Create enhanced system message for search coordination
            system_prompt = f"""Based on this orchestrator guidance:

{base_orchestrator_prompt}

You are now acting as TravelAgentic's search coordination agent. Based on user preferences, create optimized search parameters for flights, hotels, and activities that will yield the best results for their specific needs.

Analyze the user preferences and generate search parameters that:
1. Match their budget constraints
2. Align with their travel style and interests
3. Consider the number of travelers and group dynamics
4. Account for destination-specific factors
5. Optimize for the best user experience

Return ONLY a JSON object in this exact format:
{{
  "flight_search": {{
    "origin": "departure_city",
    "destination": "destination_city",
    "departure_date": "YYYY-MM-DD",
    "return_date": "YYYY-MM-DD",
    "passengers": 2,
    "cabin": "economy|premium|business|first"
  }},
  "hotel_search": {{
    "destination": "destination_city",
    "check_in": "YYYY-MM-DD",
    "check_out": "YYYY-MM-DD",
    "guests": 2,
    "price_range": "budget|mid-range|luxury|any",
    "amenities_priority": ["wifi", "pool", "gym", "spa", "pet_friendly"],
    "location_preference": "city_center|airport|beach|quiet"
  }},
  "activity_search": {{
    "destination": "destination_city",
    "interests": ["outdoor", "culture", "food", "adventure", "nightlife"],
    "duration": "half-day|full-day|multi-day|any",
    "price_sensitivity": "budget|moderate|premium",
    "group_suitability": "solo|couple|family|group"
  }},
  "search_strategy": {{
    "priority_order": ["flights", "hotels", "activities"],
    "flexibility": {{
      "dates": "strict|moderate|flexible",
      "budget": "strict|moderate|flexible"
    }},
    "booking_timing": "immediate|planned|flexible"
  }}
}}

Consider these factors:
- Budget allocation: Higher budgets = premium cabin/luxury hotels
- Travel style: Adventure = outdoor activities, Cultural = museums/tours
- Group size: Families need family-friendly options
- Destination: Beach destinations = beach hotels, Cities = central location
- Season: Consider weather and seasonal activities
- Special requirements: Pets, accessibility, dietary restrictions"""

        except Exception as prompt_error:
            logger.warning(f"Could not load orchestrator prompt: {prompt_error}")
            # Fallback to original system prompt
            system_prompt = """You are TravelAgentic's search coordination agent. Based on user preferences, create optimized search parameters for flights, hotels, and activities that will yield the best results for their specific needs.

Analyze the user preferences and generate search parameters that:
1. Match their budget constraints
2. Align with their travel style and interests
3. Consider the number of travelers and group dynamics
4. Account for destination-specific factors
5. Optimize for the best user experience

Return ONLY a JSON object in this exact format:
{{
  "flight_search": {{
    "origin": "departure_city",
    "destination": "destination_city", 
    "departure_date": "YYYY-MM-DD",
    "return_date": "YYYY-MM-DD",
    "passengers": 2,
    "cabin": "economy|premium|business|first"
  }},
  "hotel_search": {{
    "destination": "destination_city",
    "check_in": "YYYY-MM-DD",
    "check_out": "YYYY-MM-DD",
    "guests": 2,
    "price_range": "budget|mid-range|luxury|any",
    "amenities_priority": ["wifi", "pool", "gym", "spa", "pet_friendly"],
    "location_preference": "city_center|airport|beach|quiet"
  }},
  "activity_search": {{
    "destination": "destination_city",
    "interests": ["outdoor", "culture", "food", "adventure", "nightlife"],
    "duration": "half-day|full-day|multi-day|any",
    "price_sensitivity": "budget|moderate|premium",
    "group_suitability": "solo|couple|family|group"
  }},
  "search_strategy": {{
    "priority_order": ["flights", "hotels", "activities"],
    "flexibility": {{
      "dates": "strict|moderate|flexible",
      "budget": "strict|moderate|flexible"
    }},
    "booking_timing": "immediate|planned|flexible"
  }}
}}

Consider these factors:
- Budget allocation: Higher budgets = premium cabin/luxury hotels
- Travel style: Adventure = outdoor activities, Cultural = museums/tours
- Group size: Families need family-friendly options
- Destination: Beach destinations = beach hotels, Cities = central location
- Season: Consider weather and seasonal activities
- Special requirements: Pets, accessibility, dietary restrictions"""
        
        user_prompt = f"""Generate optimized search parameters for this travel plan:

Destination: {input_data['destination']}
Travel dates: {input_data['start_date']} to {input_data['end_date']}
Number of travelers: {input_data['travelers']}
Adults: {input_data.get('adults', input_data['travelers'])}
Children: {input_data.get('children', 0)}
Budget: ${input_data.get('budget', 5000)}
Travel style: {input_data.get('travel_style', 'mixed')}
Accommodation preference: {input_data.get('accommodation', 'any')}
Interests: {input_data.get('interests', [])}
Special requirements: {input_data.get('special_requirements', [])}
Traveling with pets: {input_data.get('traveling_with_pets', False)}

Please generate comprehensive search parameters that will find the best options for this specific trip."""
        
        try:
            # Create messages
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            # Get LLM response
            response = await self.llm.ainvoke(messages)
            
            # Parse the JSON response
            search_params = json.loads(response.content)
            
            state["output_data"] = search_params
            state["step_count"] += 1
            
            logger.info("Generated search parameters successfully")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            state["error"] = f"Invalid JSON response from LLM: {str(e)}"
        except Exception as e:
            logger.error(f"Search parameter generation failed: {str(e)}")
            state["error"] = f"Search parameter generation failed: {str(e)}"
        
        return state
    
    async def _validate_parameters(self, state: GraphState) -> GraphState:
        """Validate the generated search parameters"""
        logger.info("Validating search parameters")
        
        if state.get("error"):
            return state
        
        output_data = state.get("output_data", {})
        
        # Check required sections
        required_sections = ["flight_search", "hotel_search", "activity_search", "search_strategy"]
        for section in required_sections:
            if section not in output_data:
                state["error"] = f"Missing required section: {section}"
                return state
        
        # Validate flight search parameters
        flight_search = output_data["flight_search"]
        flight_required = ["origin", "destination", "departure_date", "passengers", "cabin"]
        for field in flight_required:
            if field not in flight_search:
                state["error"] = f"Missing flight search field: {field}"
                return state
        
        # Validate hotel search parameters
        hotel_search = output_data["hotel_search"]
        hotel_required = ["destination", "check_in", "check_out", "guests", "price_range"]
        for field in hotel_required:
            if field not in hotel_search:
                state["error"] = f"Missing hotel search field: {field}"
                return state
        
        # Validate activity search parameters
        activity_search = output_data["activity_search"]
        activity_required = ["destination", "interests", "duration"]
        for field in activity_required:
            if field not in activity_search:
                state["error"] = f"Missing activity search field: {field}"
                return state
        
        state["step_count"] += 1
        logger.info("Search parameters validation successful")
        
        return state
    
    async def _optimize_parameters(self, state: GraphState) -> GraphState:
        """Optimize parameters for best results"""
        logger.info("Optimizing search parameters")
        
        if state.get("error"):
            return state
        
        input_data = state["input_data"]
        output_data = state["output_data"]
        
        # Create optimization prompt
        system_prompt = """You are a parameter optimization specialist. Review the generated search parameters and ensure they are:
1. Logically consistent (dates, passenger counts, etc.)
2. Realistic for the destination and budget
3. Properly formatted
4. Complete with all required fields

If any issues are found, correct them and return the optimized parameters in the same JSON format.
If everything is correct, return the parameters unchanged.

Ensure:
- Check-in date >= departure date
- Check-out date >= return date
- Hotel guests >= flight passengers
- Activity interests match travel style
- Price ranges are consistent across all searches
- All dates are in YYYY-MM-DD format
- All enum values are valid"""
        
        user_prompt = f"""Review and optimize these search parameters:

Original preferences:
- Destination: {input_data['destination']}
- Budget: ${input_data.get('budget', 5000)}
- Travel style: {input_data.get('travel_style', 'mixed')}
- Travelers: {input_data['travelers']}

Generated parameters:
{json.dumps(output_data, indent=2)}

Please review and optimize these parameters for best results."""
        
        try:
            # Create messages
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            # Get LLM response
            response = await self.llm.ainvoke(messages)
            
            # Parse the optimized JSON response
            optimized_params = json.loads(response.content)
            
            state["output_data"] = optimized_params
            state["step_count"] += 1
            
            logger.info("Search parameters optimized successfully")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse optimization response: {str(e)}")
            # Keep original parameters if optimization fails
            logger.info("Using original parameters due to optimization failure")
        except Exception as e:
            logger.error(f"Parameter optimization failed: {str(e)}")
            # Keep original parameters if optimization fails
            logger.info("Using original parameters due to optimization failure")
        
        return state 