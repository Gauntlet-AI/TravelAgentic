"""
Travel Orchestrator Graph for TravelAgentic
Single collaborative multi-agent orchestrator that handles complete conversational travel planning
with agent collaboration, real-time UI updates, and automation levels 1-4
"""

import asyncio
import logging
import time
import uuid
import json
from typing import Dict, Any, List, TypedDict, Optional

from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage

from .base_graph import BaseTravelGraph
from .performance_optimizations import PerformanceOptimizationMixin

logger = logging.getLogger(__name__)

class ConversationState(TypedDict):
    """Enhanced conversation state for orchestrator workflow"""
    # Core conversation
    conversation_id: str
    messages: List[Dict[str, Any]]
    current_step: str
    
    # User context
    user_preferences: Dict[str, Any]
    automation_level: int  # 1-4 from prompts (4 = "I'm Feeling Lucky")
    
    # Agent collaboration
    agent_communications: List[Dict[str, Any]]
    agent_status: Dict[str, str]
    agent_instructions: Dict[str, Any]
    
    # Shopping cart
    shopping_cart: Dict[str, Any]
    cart_version: int
    cart_dependencies: Dict[str, Any]
    
    # Backtracking
    backtrack_history: List[Dict[str, Any]]
    context_snapshots: Dict[str, Any]
    trip_templates: Dict[str, Any]
    
    # UI updates
    ui_updates: List[Dict[str, Any]]
    progress: Dict[str, Any]
    
    # Parallel search state
    parallel_search: Optional[Dict[str, Any]]
    agent_context: Optional[Dict[str, Any]]
    parallel_agent_name: Optional[str]
    flight_results: Optional[List[Dict[str, Any]]]
    lodging_results: Optional[List[Dict[str, Any]]]
    activities_results: Optional[List[Dict[str, Any]]]
    filtered_flight_results: Optional[List[Dict[str, Any]]]
    filtered_lodging_results: Optional[List[Dict[str, Any]]]
    filtered_activities_results: Optional[List[Dict[str, Any]]]
    aggregated_results: Optional[Dict[str, Any]]
    search_results: Optional[List[Dict[str, Any]]]
    
    # Execution metadata (inherited from base)
    execution_id: str
    execution_time: float
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    error: Optional[str]
    step_count: int

class TravelOrchestratorGraph(BaseTravelGraph, PerformanceOptimizationMixin):
    """
    Single collaborative orchestrator graph that handles complete conversational travel planning
    Replaces the 4 separate workflow graphs with one unified conversation-based system
    Includes performance optimizations for parallel execution and progressive filtering
    """
    
    def _build_graph(self):
        """Build the orchestrator graph workflow with all conversation nodes"""
        # Create the graph with enhanced state
        workflow = StateGraph(ConversationState)
        
        # Conversation flow nodes
        workflow.add_node("welcome", self._welcome_user)
        workflow.add_node("collect_preferences", self._collect_preferences)
        workflow.add_node("orchestrator", self._orchestrator_agent)
        
        # Parallel agent execution nodes
        workflow.add_node("parallel_search_coordinator", self._parallel_search_coordinator)
        workflow.add_node("progressive_filter", self._progressive_filter)
        workflow.add_node("results_aggregator", self._results_aggregator)
        
        # Individual agents (now can run in parallel)
        workflow.add_node("flight_agent", self._flight_agent)
        workflow.add_node("lodging_agent", self._lodging_agent)
        workflow.add_node("activities_agent", self._activities_agent)
        
        # Shopping cart & booking
        workflow.add_node("shopping_cart", self._shopping_cart)
        workflow.add_node("booking_execution", self._booking_execution)
        workflow.add_node("itinerary_generation", self._itinerary_generation)
        
        # Automation level routing nodes
        workflow.add_node("present_options", self._present_options)
        workflow.add_node("preselect_options", self._preselect_options) 
        workflow.add_node("auto_select_with_review", self._auto_select_with_review)
        workflow.add_node("auto_book", self._auto_book)
        
        # Basic flow edges
        workflow.add_edge("welcome", "collect_preferences")
        workflow.add_edge("collect_preferences", "orchestrator")
        
        # NEW: Parallel execution flow
        workflow.add_edge("orchestrator", "parallel_search_coordinator")
        workflow.add_edge("parallel_search_coordinator", "progressive_filter")
        workflow.add_edge("progressive_filter", "results_aggregator")
        
        # After results aggregation, route based on automation level
        workflow.add_conditional_edges(
            "results_aggregator",
            self._route_by_automation_level,
            {
                "level_1": "present_options",
                "level_2": "preselect_options", 
                "level_3": "auto_select_with_review",
                "level_4": "auto_book"
            }
        )
        
        # Automation level nodes route to shopping cart
        workflow.add_edge("present_options", "shopping_cart")
        workflow.add_edge("preselect_options", "shopping_cart")
        workflow.add_edge("auto_select_with_review", "shopping_cart")
        workflow.add_edge("auto_book", "shopping_cart")
        
        # Backtracking support from shopping cart
        workflow.add_conditional_edges(
            "shopping_cart",
            self._check_for_changes,
            {
                "modify_flights": "flight_agent",
                "modify_hotels": "lodging_agent", 
                "modify_activities": "activities_agent",
                "confirm": "booking_execution"
            }
        )
        
        # Final flow
        workflow.add_edge("booking_execution", "itinerary_generation")
        workflow.add_edge("itinerary_generation", END)
        
        # Set entry point
        workflow.set_entry_point("welcome")
        
        # Compile the graph
        self.graph = workflow.compile(checkpointer=self.memory)
    
    def _create_initial_state(self, input_data: Dict[str, Any]) -> ConversationState:
        """Create initial conversation state for orchestrator execution"""
        import uuid
        import time
        
        return ConversationState(
            # Core conversation
            conversation_id=str(uuid.uuid4()),
            messages=[],
            current_step="welcome",
            
            # User context
            user_preferences=input_data.get("preferences", {}),
            automation_level=input_data.get("automation_level", 1),
            
            # Agent collaboration
            agent_communications=[],
            agent_status={},
            agent_instructions={},
            
            # Shopping cart
            shopping_cart={
                "flights": [],
                "hotels": [],
                "activities": [],
                "total_cost": 0.0
            },
            cart_version=1,
            cart_dependencies={},
            
            # Backtracking
            backtrack_history=[],
            context_snapshots={},
            trip_templates={},
            
            # UI updates
            ui_updates=[],
            progress={"current_step": "welcome", "completion": 0},
            
            # Parallel search state
            parallel_search=None,
            agent_context=None,
            parallel_agent_name=None,
            flight_results=None,
            lodging_results=None,
            activities_results=None,
            filtered_flight_results=None,
            filtered_lodging_results=None,
            filtered_activities_results=None,
            aggregated_results=None,
            search_results=None,
            
            # Execution metadata (from base)
            execution_id=str(uuid.uuid4()),
            execution_time=0.0,
            input_data=input_data,
            output_data={},
            error=None,
            step_count=0
        )
    
    # ========================================
    # HELPER METHODS
    # ========================================
    
    def _load_prompt(self, prompt_name: str) -> str:
        """Load prompt from prompts directory"""
        import os
        from pathlib import Path
        
        try:
            prompts_dir = Path(__file__).parent.parent / "prompts"
            prompt_file = prompts_dir / f"{prompt_name}.txt"
            
            if not prompt_file.exists():
                raise FileNotFoundError(f"Prompt file not found: {prompt_file}")
            
            with open(prompt_file, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            logger.info(f"Loaded prompt: {prompt_name}")
            return content
            
        except Exception as e:
            logger.error(f"Failed to load prompt {prompt_name}: {str(e)}")
            raise
    
    def _determine_flow_type(self, state: ConversationState) -> str:
        """Determine if this should be structured or conversational flow"""
        input_data = state["input_data"]
        
        # Check if we have structured form data
        has_structured_data = all(
            key in input_data for key in ["destination", "start_date", "end_date", "travelers"]
        )
        
        # Check for conversation indicators
        has_message = "message" in input_data or "messages" in input_data
        
        # Determine flow type
        if has_message and not has_structured_data:
            return "conversational"
        elif has_structured_data:
            return "structured"
        else:
            # Default to conversational for unclear cases
            return "conversational"
    
    async def _handle_structured_input(self, state: ConversationState):
        """Handle structured form input (User Story 1)"""
        input_data = state["input_data"]
        
        # Extract structured data into preferences
        preferences = state["user_preferences"]
        preferences.update({
            "destination": input_data.get("destination"),
            "start_date": input_data.get("start_date"),
            "end_date": input_data.get("end_date"),
            "travelers": input_data.get("travelers"),
            "budget": input_data.get("budget"),
            "input_type": "structured"
        })
        
        logger.info(f"Processed structured input for {preferences['destination']}")
    
    async def _handle_conversational_input(self, state: ConversationState):
        """Handle conversational input (User Story 2)"""
        input_data = state["input_data"]
        
        # Extract conversational data
        message = input_data.get("message", "")
        preferences = state["user_preferences"]
        preferences.update({
            "input_type": "conversational",
            "initial_message": message
        })
        
        # Use LLM to extract preferences from conversation
        if message:
            try:
                system_prompt = "Extract travel preferences from user message. Return JSON with destination, dates, budget, travelers if mentioned."
                
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=message)
                ]
                
                response = await self.llm.ainvoke(messages)
                
                # Try to parse extracted preferences
                import json
                try:
                    extracted = json.loads(response.content)
                    preferences.update(extracted)
                except json.JSONDecodeError:
                    logger.warning("Failed to parse LLM response as JSON")
                    
            except Exception as e:
                logger.error(f"Failed to extract preferences from conversation: {str(e)}")
        
        logger.info("Processed conversational input")
    
    async def _generate_dynamic_questions(self, state: ConversationState):
        """Generate contextual questions based on destination and preferences"""
        preferences = state["user_preferences"]
        destination = preferences.get("destination", "")
        
        if not destination:
            # Can't generate questions without destination
            preferences["questions_generated"] = True
            return
        
        try:
            system_prompt = f"""Generate 3-5 contextually relevant multiple choice questions for travel to {destination}.

Focus on:
1. Travel style (adventure, relaxation, cultural, business, mixed)
2. Accommodation preferences (hotel, Airbnb, hostel, resort, boutique) 
3. Activity interests based on destination
4. Budget allocation priorities
5. Special requirements

Return ONLY a JSON object with questions array."""
            
            user_prompt = f"""Generate preference questions for:
Destination: {destination}
Dates: {preferences.get('start_date', 'flexible')} to {preferences.get('end_date', 'flexible')}
Travelers: {preferences.get('travelers', 1)}
Budget: ${preferences.get('budget', 5000)}"""
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Parse questions
            import json
            questions_data = json.loads(response.content)
            preferences["dynamic_questions"] = questions_data.get("questions", [])
            preferences["questions_generated"] = True
            
            logger.info(f"Generated {len(preferences['dynamic_questions'])} dynamic questions")
            
        except Exception as e:
            logger.error(f"Failed to generate dynamic questions: {str(e)}")
            preferences["questions_generated"] = True  # Mark as done to prevent retry
    
    def _validate_planning_requirements(self, state: ConversationState) -> Dict[str, Any]:
        """Validate we have enough information to start planning"""
        preferences = state["user_preferences"]
        missing = []
        
        # Check required fields
        required_fields = {
            "destination": "travel destination",
            "start_date": "departure date", 
            "end_date": "return date",
            "travelers": "number of travelers",
            "budget": "travel budget"
        }
        
        for field, description in required_fields.items():
            if not preferences.get(field):
                missing.append(description)
        
        return {
            "valid": len(missing) == 0,
            "missing": missing,
            "requirements_met": len(required_fields) - len(missing),
            "total_requirements": len(required_fields)
        }
    
    async def _request_missing_information(self, state: ConversationState, missing_info: List[str]):
        """Request missing information from user"""
        missing_text = ", ".join(missing_info)
        
        message = f"I need a bit more information to plan your trip. Could you please provide: {missing_text}?"
        
        # Emit request for missing info
        await self._emit_itinerary_update({
            "type": "missing_information",
            "message": message,
            "missing_fields": missing_info,
            "step": "information_request"
        })
        
        # Add to conversation
        state["messages"].append({
            "role": "assistant",
            "content": message,
            "timestamp": time.time(),
            "step": "information_request",
            "missing_fields": missing_info
        })
        
        # Update current step to wait for user input
        state["current_step"] = "awaiting_information"
        
        logger.info(f"Requested missing information: {missing_text}")
    
    def _prepare_agent_instructions(self, state: ConversationState) -> Dict[str, Any]:
        """Prepare specific instructions for each agent based on automation level"""
        automation_level = state["automation_level"]
        preferences = state["user_preferences"]
        
        base_instructions = {
            "budget": preferences.get("budget"),
            "travelers": preferences.get("travelers"),
            "destination": preferences.get("destination"),
            "start_date": preferences.get("start_date"),
            "end_date": preferences.get("end_date"),
            "user_preferences": preferences
        }
        
        # Level-specific instructions
        if automation_level == 1:
            # Manual selection - return multiple options
            instructions = {
                **base_instructions,
                "selection_mode": "manual",
                "return_multiple": True,
                "max_options": 5,
                "require_user_selection": True
            }
        elif automation_level == 2:
            # Pre-select best but allow changes
            instructions = {
                **base_instructions,
                "selection_mode": "preselect",
                "return_multiple": True,
                "max_options": 5,
                "highlight_best": True,
                "allow_changes": True
            }
        elif automation_level == 3:
            # Auto-select but show before booking
            instructions = {
                **base_instructions,
                "selection_mode": "auto_select",
                "return_multiple": False,
                "show_before_booking": True,
                "auto_select_best": True
            }
        else:  # automation_level == 4
            # Full automation including booking
            instructions = {
                **base_instructions,
                "selection_mode": "full_auto",
                "return_multiple": False,
                "auto_select_best": True,
                "auto_book": True,
                "show_progress": True
            }
        
        logger.info(f"Prepared agent instructions for automation level {automation_level}")
        return instructions
    
    def _generate_mock_flight_data(self, flight_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock flight data for fallback when LLM parsing fails"""
        mock_flights = []
        
        base_price = flight_context.get("budget", 5000) * 0.3  # 30% of budget for flights
        
        airlines = ["American Airlines", "Delta", "United", "JetBlue", "Southwest"]
        
        for i, airline in enumerate(airlines):
            mock_flight = {
                "airline": airline,
                "flight_number": f"{airline[:2].upper()}{1234 + i}",
                "departure_time": "08:00 AM" if i < 2 else "02:30 PM",
                "arrival_time": "11:30 AM" if i < 2 else "06:00 PM", 
                "duration": "3h 30m",
                "stops": 0 if i < 3 else 1,
                "price": base_price + (i * 50),
                "destination_airport": f"{flight_context['destination_city']} International",
                "arrival_date": flight_context.get("departure_date", ""),
                "departure_airport": f"{flight_context['departure_city']} Airport"
            }
            mock_flights.append(mock_flight)
        
        return {"flights": mock_flights}
    
    def _process_flight_results(self, flight_results: Dict[str, Any], automation_level: int, 
                               instructions: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process flight results based on automation level and instructions"""
        flights = flight_results.get("flights", [])
        
        if not flights:
            logger.warning("No flights found in results")
            return []
        
        # Sort flights by price (assuming they come with price field)
        try:
            flights.sort(key=lambda x: x.get("price", 9999))
        except (TypeError, KeyError):
            logger.warning("Could not sort flights by price")
        
        # Filter based on automation level
        max_options = instructions.get("max_options", 5)
        
        if automation_level == 1:
            # Return all options for manual selection
            return flights[:max_options]
        elif automation_level == 2:
            # Return options with best one highlighted
            processed = flights[:max_options]
            if processed:
                processed[0]["recommended"] = True
                processed[0]["reason"] = "Best value for your preferences"
            return processed
        elif automation_level >= 3:
            # Return best option for auto-selection
            if flights:
                best_flight = flights[0]
                best_flight["auto_selected"] = True
                best_flight["selection_reason"] = "Automatically selected best value option"
                return [best_flight]
            return []
        
        return flights[:max_options]
    
    def _extract_flight_context(self, state: ConversationState) -> Optional[Dict[str, Any]]:
        """Extract flight context from agent communications"""
        # Look for flight context in agent communications
        for comm in reversed(state["agent_communications"]):  # Start from most recent
            if (comm.get("from") == "flight_agent" and 
                comm.get("context_type") == "flight_arrival"):
                logger.info(f"Found flight context: {comm.get('context', {}).get('arrival_airport', 'Unknown')}")
                return comm.get("context", {})
        
        # Fallback: check if flight is already in shopping cart
        if state["shopping_cart"].get("flights"):
            flight = state["shopping_cart"]["flights"][0]
            return {
                "arrival_airport": flight.get("destination_airport", ""),
                "arrival_time": flight.get("arrival_time", ""),
                "arrival_date": flight.get("arrival_date", ""),
                "destination_city": flight.get("destination_city", "")
            }
        
        logger.info("No flight context found")
        return None
    
    def _generate_mock_hotel_data(self, hotel_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock hotel data for fallback when LLM parsing fails"""
        mock_hotels = []
        
        base_price = hotel_context.get("budget", 5000) * 0.4  # 40% of budget for hotels
        destination = hotel_context.get("destination_city", "Destination")
        
        hotel_types = [
            ("Grand", "Luxury Hotel", 4.5, ["spa", "pool", "fitness center", "concierge"]),
            ("Comfort Inn", "Business Hotel", 4.2, ["wifi", "business center", "airport shuttle"]),
            ("Boutique", "Boutique Hotel", 4.3, ["unique design", "local cuisine", "art gallery"]),
            ("Express", "Budget Hotel", 3.8, ["wifi", "breakfast", "parking"]),
            ("Resort", "Resort", 4.7, ["pool", "spa", "restaurant", "beach access"])
        ]
        
        for i, (name_prefix, hotel_type, rating, amenities) in enumerate(hotel_types):
            nightly_rate = (base_price / 3) + (i * 30)  # Assume 3-night stay
            
            mock_hotel = {
                "name": f"{name_prefix} {destination}",
                "address": f"{100 + i*50} Main Street, {destination}",
                "type": hotel_type,
                "rating": rating,
                "nightly_rate": nightly_rate,
                "total_cost": nightly_rate * 3,  # Assume 3 nights
                "amenities": amenities,
                "location": f"{destination} {'City Center' if i < 3 else 'Airport Area'}",
                "nearby_attractions": ["Museum", "Shopping", "Restaurants"]
            }
            
            # Add airport proximity if flight context exists
            if hotel_context.get("context_aware"):
                mock_hotel["airport_distance"] = f"{2 + i} miles from airport"
                mock_hotel["airport_shuttle"] = i < 3  # First 3 hotels have shuttle
            
            mock_hotels.append(mock_hotel)
        
        return {"hotels": mock_hotels}
    
    def _process_hotel_results(self, hotel_results: Dict[str, Any], automation_level: int, 
                              instructions: Dict[str, Any], flight_context: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process hotel results based on automation level and flight context"""
        hotels = hotel_results.get("hotels", [])
        
        if not hotels:
            logger.warning("No hotels found in results")
            return []
        
        # Sort hotels by rating and price (prioritize rating for quality)
        try:
            hotels.sort(key=lambda x: (-x.get("rating", 0), x.get("nightly_rate", 9999)))
        except (TypeError, KeyError):
            logger.warning("Could not sort hotels by rating/price")
        
        # If flight context exists, prioritize hotels with airport access
        if flight_context:
            def airport_priority(hotel):
                # Boost priority for hotels with airport shuttle or close to airport
                priority_score = hotel.get("rating", 0)
                if hotel.get("airport_shuttle", False):
                    priority_score += 0.5
                if "airport" in hotel.get("location", "").lower():
                    priority_score += 0.3
                return -priority_score  # Negative for descending sort
            
            try:
                hotels.sort(key=airport_priority)
                logger.info("Hotels sorted with airport proximity priority")
            except (TypeError, KeyError):
                logger.warning("Could not apply airport proximity sorting")
        
        # Filter based on automation level
        max_options = instructions.get("max_options", 5)
        
        if automation_level == 1:
            # Return all options for manual selection
            return hotels[:max_options]
        elif automation_level == 2:
            # Return options with best one highlighted
            processed = hotels[:max_options]
            if processed:
                processed[0]["recommended"] = True
                processed[0]["reason"] = "Best rated hotel" + (" with airport access" if flight_context else "")
            return processed
        elif automation_level >= 3:
            # Return best option for auto-selection
            if hotels:
                best_hotel = hotels[0]
                best_hotel["auto_selected"] = True
                reason = "Automatically selected highest rated hotel"
                if flight_context and best_hotel.get("airport_shuttle"):
                    reason += " with convenient airport access"
                best_hotel["selection_reason"] = reason
                return [best_hotel]
            return []
        
        return hotels[:max_options]
    
    def _extract_hotel_context(self, state: ConversationState) -> Optional[Dict[str, Any]]:
        """Extract hotel context from agent communications"""
        # Look for hotel context in agent communications
        for comm in reversed(state["agent_communications"]):  # Start from most recent
            if (comm.get("from") == "lodging_agent" and 
                comm.get("context_type") == "hotel_location"):
                logger.info(f"Found hotel context: {comm.get('context', {}).get('hotel_name', 'Unknown')}")
                return comm.get("context", {})
        
        # Fallback: check if hotel is already in shopping cart
        if state["shopping_cart"].get("hotels"):
            hotel = state["shopping_cart"]["hotels"][0]
            return {
                "hotel_name": hotel.get("name", ""),
                "hotel_location": hotel.get("location", ""),
                "hotel_address": hotel.get("address", ""),
                "nearby_attractions": hotel.get("nearby_attractions", []),
                "hotel_amenities": hotel.get("amenities", []),
                "destination_city": hotel.get("destination_city", "")
            }
        
        logger.info("No hotel context found")
        return None
    
    def _generate_mock_activities_data(self, activities_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock activities data for fallback when LLM parsing fails"""
        mock_activities = []
        
        base_budget = activities_context.get("budget", 5000) * 0.3  # 30% of budget for activities
        destination = activities_context.get("destination_city", "Destination")
        
        # Activity categories with sample activities
        activity_categories = [
            ("Cultural", "Museum Tour", "2 hours", ["history", "art", "culture"]),
            ("Adventure", "City Walking Tour", "3 hours", ["exploration", "exercise", "sightseeing"]),
            ("Food", "Local Food Tour", "2.5 hours", ["cuisine", "cultural", "social"]),
            ("Nature", "Park Visit", "1.5 hours", ["nature", "relaxation", "photography"]),
            ("Entertainment", "Local Show", "2 hours", ["entertainment", "culture", "evening"])
        ]
        
        for i, (category, activity_name, duration, tags) in enumerate(activity_categories):
            price = (base_budget / 5) * (0.5 + i * 0.2)  # Vary prices
            
            mock_activity = {
                "name": f"{activity_name} in {destination}",
                "description": f"Experience {activity_name.lower()} in {destination}",
                "duration": duration,
                "price": price,
                "category": category,
                "location": f"{destination} {category} District",
                "tags": tags,
                "rating": 4.0 + (i * 0.1)  # Vary ratings 4.0-4.4
            }
            
            # Add hotel proximity if context exists
            if activities_context.get("context_aware"):
                mock_activity["distance_from_hotel"] = f"{1 + i*0.5} miles"
                mock_activity["transportation"] = "walking" if i < 2 else "public transit"
            
            mock_activities.append(mock_activity)
        
        return {"activities": mock_activities}
    
    def _process_activities_results(self, activities_results: Dict[str, Any], automation_level: int, 
                                   instructions: Dict[str, Any], hotel_context: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process activities results based on automation level and hotel context"""
        activities = activities_results.get("activities", [])
        
        if not activities:
            logger.warning("No activities found in results")
            return []
        
        # Sort activities by rating and price (prioritize rating)
        try:
            activities.sort(key=lambda x: (-x.get("rating", 0), x.get("price", 9999)))
        except (TypeError, KeyError):
            logger.warning("Could not sort activities by rating/price")
        
        # If hotel context exists, prioritize activities near hotel
        if hotel_context:
            def hotel_proximity_priority(activity):
                # Boost priority for activities near hotel
                priority_score = activity.get("rating", 0)
                
                # Check if activity is near hotel location
                hotel_location = hotel_context.get("hotel_location", "").lower()
                activity_location = activity.get("location", "").lower()
                
                if hotel_location in activity_location:
                    priority_score += 0.3
                
                # Check if activity is in nearby attractions
                nearby_attractions = hotel_context.get("nearby_attractions", [])
                activity_name = activity.get("name", "").lower()
                
                for attraction in nearby_attractions:
                    if attraction.lower() in activity_name:
                        priority_score += 0.2
                        break
                
                return -priority_score  # Negative for descending sort
            
            try:
                activities.sort(key=hotel_proximity_priority)
                logger.info("Activities sorted with hotel proximity priority")
            except (TypeError, KeyError):
                logger.warning("Could not apply hotel proximity sorting")
        
        # Filter based on automation level
        max_options = instructions.get("max_options", 5)
        
        if automation_level == 1:
            # Return all options for manual selection
            return activities[:max_options]
        elif automation_level == 2:
            # Return options with best ones highlighted
            processed = activities[:max_options]
            if processed:
                processed[0]["recommended"] = True
                processed[0]["reason"] = "Top rated activity" + (" near your hotel" if hotel_context else "")
            return processed
        elif automation_level >= 3:
            # Return best options for auto-selection (select 2-3 activities)
            if activities:
                # Auto-select top 2-3 activities for a balanced itinerary
                num_activities = min(3, len(activities))
                selected_activities = activities[:num_activities]
                
                for i, activity in enumerate(selected_activities):
                    activity["auto_selected"] = True
                    reason = f"Automatically selected #{i+1} activity"
                    if hotel_context:
                        reason += " with convenient location"
                    activity["selection_reason"] = reason
                
                return selected_activities
            return []
        
        return activities[:max_options]
     
     # ========================================
     # PLACEHOLDER NODE IMPLEMENTATIONS
    # ========================================
    
    async def _welcome_user(self, state: ConversationState) -> ConversationState:
        """Welcome user and start conversation using OrchestratorAgent.txt prompt"""
        logger.info("Starting orchestrator conversation")
        
        # Load OrchestratorAgent.txt prompt
        try:
            orchestrator_prompt = self._load_prompt("OrchestratorAgent")
        except Exception as e:
            logger.error(f"Failed to load orchestrator prompt: {e}")
            # Fallback prompt
            orchestrator_prompt = """You are Orchestrator, a travel planning agent that coordinates specialized agents to plan comprehensive travel itineraries.

Your primary goal is to generate a full vacation plan based on the user's preferences, within their budget, and according to their selected automation level (1 to 4):

- Level 1: Present options one by one, require user to select each.
- Level 2: Preselect best option, user may confirm or change it.
- Level 3: Auto-select all options, present plan before booking.
- Level 4: Auto-select all options, auto-complete plan and booking before showing user.

Begin by asking: "Welcome to your personal travel planner. Please enter your automation level (1 to 4), your budget, and any preferences you'd like us to consider."""
        
        # Determine flow type based on input data
        flow_type = self._determine_flow_type(state)
        state["user_preferences"]["flow_type"] = flow_type
        
        # Create welcome message based on automation level
        automation_level = state["automation_level"]
        
        if automation_level == 4:
            # "I'm Feeling Lucky" mode
            welcome_message = "Building your perfect trip... ✨ Sit back and watch as our AI agents create your personalized itinerary!"
        elif flow_type == "conversational":
            welcome_message = orchestrator_prompt.split("Begin by asking: ")[-1].strip('"')
        else:
            welcome_message = "Welcome! Let's plan your perfect trip step by step."
        
        # Emit welcome message to UI
        await self._emit_itinerary_update({
            "type": "welcome",
            "message": welcome_message,
            "automation_level": automation_level,
            "flow_type": flow_type,
            "step": "welcome"
        })
        
        # Add welcome to conversation messages
        state["messages"].append({
            "role": "assistant",
            "content": welcome_message,
            "timestamp": time.time(),
            "step": "welcome"
        })
        
        # Save initial snapshot after welcome
        self._save_context_snapshot(state, "welcome_complete")
        
        state["current_step"] = "collect_preferences"
        state["step_count"] += 1
        
        return state
    
    async def _collect_preferences(self, state: ConversationState) -> ConversationState:
        """Collect user preferences through forms or conversation"""
        logger.info("Collecting user preferences")
        
        flow_type = state["user_preferences"].get("flow_type", "conversational")
        input_data = state["input_data"]
        
        if flow_type == "structured":
            # Handle structured form input
            await self._handle_structured_input(state)
        else:
            # Handle conversational input
            await self._handle_conversational_input(state)
        
        # Generate dynamic questions if needed
        if not state["user_preferences"].get("questions_generated", False):
            await self._generate_dynamic_questions(state)
        
        # Emit preferences collection update
        await self._emit_itinerary_update({
            "type": "preferences_collected",
            "preferences": state["user_preferences"],
            "flow_type": flow_type,
            "step": "collect_preferences"
        })
        
        # Save snapshot after preferences collection
        self._save_context_snapshot(state, "preferences_collected")
        
        state["current_step"] = "orchestrator"
        state["step_count"] += 1
        
        return state
    
    async def _orchestrator_agent(self, state: ConversationState) -> ConversationState:
        """Main orchestrator using OrchestratorAgent.txt prompt with automation level routing"""
        logger.info(f"Orchestrator agent - automation level {state['automation_level']}")
        
        # Load orchestrator prompt
        try:
            orchestrator_prompt = self._load_prompt("OrchestratorAgent")
        except Exception as e:
            logger.error(f"Failed to load orchestrator prompt: {e}")
            # Use fallback prompt
            orchestrator_prompt = """You are Orchestrator, a travel planning agent that coordinates specialized agents—FlightAgent, LodgingAgent, and ActivitiesAgent—to plan comprehensive travel itineraries.

Your primary goal is to generate a full vacation plan based on the user's preferences, within their budget, and according to their selected automation level (1 to 4).

Track and maintain a running total cost. Reject options that exceed the user's budget.
Maintain full context across stages (e.g., selected destination, dates, automation level, user choices).
Allow users to reverse choices or restart planning at any time."""

        # Analyze current conversation state and user preferences
        preferences = state["user_preferences"]
        automation_level = state["automation_level"]
        
        # Validate we have enough information to proceed
        required_info = self._validate_planning_requirements(state)
        if not required_info["valid"]:
            # Need more information from user
            await self._request_missing_information(state, required_info["missing"])
            return state
        
        # Create orchestrator context for specialized agents
        orchestrator_context = {
            "destination": preferences.get("destination"),
            "start_date": preferences.get("start_date"),
            "end_date": preferences.get("end_date"),
            "travelers": preferences.get("travelers"),
            "budget": preferences.get("budget"),
            "automation_level": automation_level,
            "user_preferences": preferences,
            "planning_stage": "coordination"
        }
        
        # Initialize agent coordination
        state["agent_status"] = {
            "orchestrator": "coordinating",
            "flight_agent": "pending",
            "lodging_agent": "pending", 
            "activities_agent": "pending"
        }
        
        # Emit orchestrator status update
        await self._emit_itinerary_update({
            "type": "orchestrator_start",
            "message": f"Planning your {preferences.get('destination', '')} trip...",
            "automation_level": automation_level,
            "context": orchestrator_context,
            "step": "orchestration"
        })
        
        # Prepare agent instructions based on automation level
        agent_instructions = self._prepare_agent_instructions(state)
        state["agent_instructions"] = agent_instructions
        
        # Save coordination snapshot
        self._save_context_snapshot(state, "orchestrator_coordination")
        
        # Route to appropriate automation level handler
        if automation_level == 4:
            # "I'm Feeling Lucky" - full automation
            await self._emit_itinerary_update({
                "type": "automation_mode",
                "message": "Full automation engaged - AI will handle all decisions ✨",
                "automation_level": 4,
                "step": "orchestration"
            })
            
        # Set next step based on automation level (handled by conditional routing)
        state["current_step"] = "agent_coordination"
        state["step_count"] += 1
        
        # Add orchestrator communication to agent queue
        state["agent_communications"].append({
            "from": "orchestrator",
            "to": "all_agents",
            "message": "Begin coordinated search with provided context",
            "context": orchestrator_context,
            "instructions": agent_instructions,
            "timestamp": time.time()
        })
        
        logger.info(f"Orchestrator coordination complete - routing to level {automation_level}")
        return state
    
    async def _flight_agent(self, state: ConversationState) -> ConversationState:
        """Flight agent using FlightAgent.txt prompt with collaboration"""
        logger.info("Flight agent working")
        
        # Set current state for UI updates
        self._set_current_state(state)
        
        # Update agent status to working
        state["agent_status"]["flight_agent"] = "working"
        
        # Emit flight search start
        await self._emit_itinerary_update({
            "type": "flight_search",
            "message": "Searching for the best flights...",
            "section": "flights",
            "agent": "flight_agent",
            "step": "flight_search"
        })
        
        # Load FlightAgent prompt
        try:
            flight_prompt = self._load_prompt("FlightAgent")
        except Exception as e:
            logger.error(f"Failed to load flight agent prompt: {e}")
            # Use fallback prompt
            flight_prompt = """You are FlightAgent, a specialized tool for the Orchestrator. Your job is to search and recommend flights based on:

- Departure city, Destination, Travel dates, Budget constraints
- User preferences (e.g., preferred airline, nonstop flights, flight class, earliest/latest departure times)

You return up to 5 recommended flights, sorted by relevance and value. Each option must include:
- Airline and flight number, Departure and arrival times, Duration, Number of stops, Total cost

Return only the flight data in JSON format."""

        # Get instructions from orchestrator
        instructions = state.get("agent_instructions", {})
        preferences = state["user_preferences"]
        automation_level = state["automation_level"]
        
        # Prepare flight search context
        flight_context = {
            "departure_city": preferences.get("start_location", preferences.get("origin", "")),
            "destination_city": preferences.get("destination", ""),
            "departure_date": preferences.get("start_date", ""),
            "return_date": preferences.get("end_date", ""),
            "travelers": preferences.get("travelers", 1),
            "budget": preferences.get("budget", 5000),
            "automation_level": automation_level,
            "preferences": preferences,
            "selection_mode": instructions.get("selection_mode", "manual")
        }
        
        # Validate required flight search data
        if not all([flight_context["departure_city"], flight_context["destination_city"], 
                   flight_context["departure_date"]]):
            error_msg = "Missing required flight information (departure city, destination, or dates)"
            await self._emit_itinerary_update({
                "type": "error",
                "message": error_msg,
                "section": "flights",
                "agent": "flight_agent"
            })
            state["error"] = error_msg
            return state
        
        try:
            # Create flight search prompt
            system_prompt = flight_prompt
            
            user_prompt = f"""Search for flights with these details:

From: {flight_context['departure_city']}
To: {flight_context['destination_city']} 
Departure: {flight_context['departure_date']}
Return: {flight_context['return_date']}
Travelers: {flight_context['travelers']}
Budget: ${flight_context['budget']}
Automation Level: {automation_level}

Preferences: {preferences.get('travel_style', 'flexible')}, {preferences.get('flight_preferences', 'best value')}

Return JSON with flight options based on automation level {automation_level}."""

            # Get LLM response for flight search
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Parse flight results
            import json
            try:
                flight_results = json.loads(response.content)
            except json.JSONDecodeError:
                # Fallback to mock flight data
                flight_results = self._generate_mock_flight_data(flight_context)
            
            # Process results based on automation level
            processed_flights = self._process_flight_results(flight_results, automation_level, instructions)
            
            # Update shopping cart with flight selection
            if automation_level >= 3:
                # Auto-select best flight
                best_flight = processed_flights[0] if processed_flights else None
                if best_flight:
                    state["shopping_cart"]["flights"] = [best_flight]
                    await self._emit_itinerary_update({
                        "type": "flight_selected",
                        "message": f"Selected: {best_flight.get('airline', 'Unknown')} flight",
                        "data": best_flight,
                        "section": "flights",
                        "agent": "flight_agent",
                        "auto_selected": True
                    })
            else:
                # Store options for user selection
                state["shopping_cart"]["flight_options"] = processed_flights
                await self._emit_itinerary_update({
                    "type": "flight_results",
                    "message": f"Found {len(processed_flights)} flight options",
                    "data": processed_flights,
                    "section": "flights",
                    "agent": "flight_agent",
                    "requires_selection": True
                })
            
            # Add agent-to-agent communication for hotel context
            if state["shopping_cart"].get("flights"):
                selected_flight = state["shopping_cart"]["flights"][0]
                arrival_info = {
                    "arrival_airport": selected_flight.get("destination_airport", flight_context["destination_city"]),
                    "arrival_time": selected_flight.get("arrival_time", ""),
                    "arrival_date": selected_flight.get("arrival_date", flight_context["departure_date"]),
                    "destination_city": flight_context["destination_city"]
                }
                
                # Communicate flight context to lodging agent
                state["agent_communications"].append({
                    "from": "flight_agent",
                    "to": "lodging_agent",
                    "message": f"Flight booked - arriving at {arrival_info['arrival_airport']} on {arrival_info['arrival_date']}",
                    "context": arrival_info,
                    "timestamp": time.time(),
                    "context_type": "flight_arrival"
                })
                
                logger.info(f"Flight agent shared arrival context: {arrival_info['arrival_airport']}")
            
            # Update agent status
            state["agent_status"]["flight_agent"] = "complete"
            state["step_count"] += 1
            
            # Save snapshot after flight selection
            self._save_context_snapshot(state, "flight_agent_complete")
            
            logger.info(f"Flight agent completed - found {len(processed_flights)} options")
            
        except Exception as e:
            logger.error(f"Flight agent failed: {str(e)}")
            state["error"] = f"Flight search failed: {str(e)}"
            state["agent_status"]["flight_agent"] = "error"
            
            await self._emit_itinerary_update({
                "type": "error",
                "message": f"Flight search failed: {str(e)}",
                "section": "flights",
                "agent": "flight_agent"
            })
        
        return state
    
    async def _lodging_agent(self, state: ConversationState) -> ConversationState:
        """Lodging agent using LodgingAgent.txt prompt with context awareness"""
        logger.info("Lodging agent working")
        
        # Set current state for UI updates
        self._set_current_state(state)
        
        # Update agent status to working
        state["agent_status"]["lodging_agent"] = "working"
        
        # Read flight context from agent communications
        flight_context = self._extract_flight_context(state)
        
        # Emit hotel search start with context awareness
        context_message = "Searching for accommodations..."
        if flight_context:
            context_message = f"Searching for hotels near {flight_context.get('arrival_airport', 'destination')}..."
        
        await self._emit_itinerary_update({
            "type": "hotel_search",
            "message": context_message,
            "section": "accommodation",
            "agent": "lodging_agent",
            "context_source": "flight_agent" if flight_context else None,
            "step": "hotel_search"
        })
        
        # Load LodgingAgent prompt
        try:
            lodging_prompt = self._load_prompt("LodgingAgent")
        except Exception as e:
            logger.error(f"Failed to load lodging agent prompt: {e}")
            # Use fallback prompt
            lodging_prompt = """You are LodgingAgent, a specialized tool for the Orchestrator. Your job is to find accommodations that match:

- Destination, Travel dates, Budget constraints
- User preferences (e.g., hotel type, star rating, amenities, proximity to landmarks)

Return up to 5 relevant lodging options with:
- Hotel name, Address, Type (hotel, resort, etc.), Rating, Nightly cost and total cost, Key amenities

Return only lodging data in JSON format."""

        # Get instructions from orchestrator
        instructions = state.get("agent_instructions", {})
        preferences = state["user_preferences"]
        automation_level = state["automation_level"]
        
        # Prepare hotel search context with flight information
        hotel_context = {
            "destination_city": preferences.get("destination", ""),
            "checkin_date": preferences.get("start_date", ""),
            "checkout_date": preferences.get("end_date", ""),
            "travelers": preferences.get("travelers", 1),
            "budget": preferences.get("budget", 5000),
            "automation_level": automation_level,
            "preferences": preferences,
            "selection_mode": instructions.get("selection_mode", "manual")
        }
        
        # Enhance context with flight arrival information
        if flight_context:
            hotel_context.update({
                "arrival_airport": flight_context.get("arrival_airport", ""),
                "arrival_time": flight_context.get("arrival_time", ""),
                "arrival_date": flight_context.get("arrival_date", ""),
                "preferred_location": f"Near {flight_context.get('arrival_airport', 'airport')}",
                "context_aware": True
            })
            logger.info(f"Hotel search enhanced with flight context: {flight_context.get('arrival_airport', 'Unknown')}")
        
        # Validate required hotel search data
        if not all([hotel_context["destination_city"], hotel_context["checkin_date"], 
                   hotel_context["checkout_date"]]):
            error_msg = "Missing required hotel information (destination, check-in, or check-out dates)"
            await self._emit_itinerary_update({
                "type": "error",
                "message": error_msg,
                "section": "accommodation",
                "agent": "lodging_agent"
            })
            state["error"] = error_msg
            return state
        
        try:
            # Create hotel search prompt with flight context
            system_prompt = lodging_prompt
            
            context_note = ""
            if flight_context:
                context_note = f"\nIMPORTANT: Guest arriving at {flight_context.get('arrival_airport', 'airport')} on {flight_context.get('arrival_date', 'unknown date')}. Prioritize hotels with convenient access from this airport."
            
            user_prompt = f"""Search for accommodations with these details:

Destination: {hotel_context['destination_city']}
Check-in: {hotel_context['checkin_date']}
Check-out: {hotel_context['checkout_date']}
Guests: {hotel_context['travelers']}
Budget: ${hotel_context['budget']}
Automation Level: {automation_level}

Preferences: {preferences.get('accommodation_style', 'comfortable')}, {preferences.get('hotel_preferences', 'good value')}
{context_note}

Return JSON with hotel options based on automation level {automation_level}."""

            # Get LLM response for hotel search
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Parse hotel results
            import json
            try:
                hotel_results = json.loads(response.content)
            except json.JSONDecodeError:
                # Fallback to mock hotel data
                hotel_results = self._generate_mock_hotel_data(hotel_context)
            
            # Process results based on automation level
            processed_hotels = self._process_hotel_results(hotel_results, automation_level, instructions, flight_context)
            
            # Update shopping cart with hotel selection
            if automation_level >= 3:
                # Auto-select best hotel
                best_hotel = processed_hotels[0] if processed_hotels else None
                if best_hotel:
                    state["shopping_cart"]["hotels"] = [best_hotel]
                    await self._emit_itinerary_update({
                        "type": "hotel_selected",
                        "message": f"Selected: {best_hotel.get('name', 'Unknown')} hotel",
                        "data": best_hotel,
                        "section": "accommodation",
                        "agent": "lodging_agent",
                        "auto_selected": True,
                        "context_source": "flight_agent" if flight_context else None
                    })
            else:
                # Store options for user selection
                state["shopping_cart"]["hotel_options"] = processed_hotels
                await self._emit_itinerary_update({
                    "type": "hotel_results",
                    "message": f"Found {len(processed_hotels)} accommodation options",
                    "data": processed_hotels,
                    "section": "accommodation",
                    "agent": "lodging_agent",
                    "requires_selection": True,
                    "context_source": "flight_agent" if flight_context else None
                })
            
            # Add agent-to-agent communication for activities context
            if state["shopping_cart"].get("hotels"):
                selected_hotel = state["shopping_cart"]["hotels"][0]
                hotel_location_info = {
                    "hotel_name": selected_hotel.get("name", ""),
                    "hotel_address": selected_hotel.get("address", ""),
                    "hotel_location": selected_hotel.get("location", hotel_context["destination_city"]),
                    "nearby_attractions": selected_hotel.get("nearby_attractions", []),
                    "hotel_amenities": selected_hotel.get("amenities", []),
                    "destination_city": hotel_context["destination_city"]
                }
                
                # Communicate hotel context to activities agent
                state["agent_communications"].append({
                    "from": "lodging_agent",
                    "to": "activities_agent",
                    "message": f"Hotel booked - {selected_hotel.get('name', 'accommodation')} in {hotel_location_info['hotel_location']}",
                    "context": hotel_location_info,
                    "timestamp": time.time(),
                    "context_type": "hotel_location"
                })
                
                logger.info(f"Lodging agent shared hotel context: {selected_hotel.get('name', 'Unknown')}")
            
            # Update agent status
            state["agent_status"]["lodging_agent"] = "complete"
            state["step_count"] += 1
            
            # Save snapshot after hotel selection
            self._save_context_snapshot(state, "lodging_agent_complete")
            
            logger.info(f"Lodging agent completed - found {len(processed_hotels)} options")
            
        except Exception as e:
            logger.error(f"Lodging agent failed: {str(e)}")
            state["error"] = f"Hotel search failed: {str(e)}"
            state["agent_status"]["lodging_agent"] = "error"
            
            await self._emit_itinerary_update({
                "type": "error",
                "message": f"Hotel search failed: {str(e)}",
                "section": "accommodation",
                "agent": "lodging_agent"
            })
        
        return state
    
    async def _activities_agent(self, state: ConversationState) -> ConversationState:
        """Activities agent using ActivitiesAgent.txt prompt with location context"""
        logger.info("Activities agent working")
        
        # Set current state for UI updates
        self._set_current_state(state)
        
        # Update agent status to working
        state["agent_status"]["activities_agent"] = "working"
        
        # Read hotel context from agent communications
        hotel_context = self._extract_hotel_context(state)
        
        # Emit activities search start with location context
        context_message = "Searching for activities and experiences..."
        if hotel_context:
            location = hotel_context.get("hotel_location", "destination")
            context_message = f"Searching for activities near {location}..."
        
        await self._emit_itinerary_update({
            "type": "activity_search",
            "message": context_message,
            "section": "activities",
            "agent": "activities_agent",
            "context_source": "lodging_agent" if hotel_context else None,
            "step": "activity_search"
        })
        
        # Load ActivitiesAgent prompt
        try:
            activities_prompt = self._load_prompt("ActivitiesAgent")
        except Exception as e:
            logger.error(f"Failed to load activities agent prompt: {e}")
            # Use fallback prompt
            activities_prompt = """You are ActivitiesAgent, a specialized tool for the Orchestrator. Your job is to find activities and experiences that match:

- Destination, Travel dates, Budget constraints
- User preferences (e.g., adventure, culture, relaxation, food, shopping, nature)
- Hotel location and nearby attractions

Return up to 5 relevant activities with:
- Activity name, Description, Duration, Price, Location/Address, Category (cultural, adventure, food, etc.)

Return only activities data in JSON format."""

        # Get instructions from orchestrator
        instructions = state.get("agent_instructions", {})
        preferences = state["user_preferences"]
        automation_level = state["automation_level"]
        
        # Prepare activities search context with hotel information
        activities_context = {
            "destination_city": preferences.get("destination", ""),
            "start_date": preferences.get("start_date", ""),
            "end_date": preferences.get("end_date", ""),
            "travelers": preferences.get("travelers", 1),
            "budget": preferences.get("budget", 5000),
            "automation_level": automation_level,
            "preferences": preferences,
            "selection_mode": instructions.get("selection_mode", "manual")
        }
        
        # Enhance context with hotel location information
        if hotel_context:
            activities_context.update({
                "hotel_name": hotel_context.get("hotel_name", ""),
                "hotel_location": hotel_context.get("hotel_location", ""),
                "hotel_address": hotel_context.get("hotel_address", ""),
                "nearby_attractions": hotel_context.get("nearby_attractions", []),
                "hotel_amenities": hotel_context.get("hotel_amenities", []),
                "context_aware": True
            })
            logger.info(f"Activities search enhanced with hotel context: {hotel_context.get('hotel_name', 'Unknown')}")
        
        # Validate required activities search data
        if not all([activities_context["destination_city"], activities_context["start_date"]]):
            error_msg = "Missing required activity information (destination or dates)"
            await self._emit_itinerary_update({
                "type": "error",
                "message": error_msg,
                "section": "activities",
                "agent": "activities_agent"
            })
            state["error"] = error_msg
            return state
        
        try:
            # Create activities search prompt with hotel context
            system_prompt = activities_prompt
            
            context_note = ""
            if hotel_context:
                hotel_name = hotel_context.get("hotel_name", "accommodation")
                hotel_location = hotel_context.get("hotel_location", "destination")
                nearby = hotel_context.get("nearby_attractions", [])
                
                context_note = f"\nIMPORTANT: Guest staying at {hotel_name} in {hotel_location}. "
                if nearby:
                    context_note += f"Nearby attractions include: {', '.join(nearby)}. "
                context_note += "Prioritize activities within reasonable distance of the hotel."
            
            user_prompt = f"""Search for activities and experiences with these details:

Destination: {activities_context['destination_city']}
Dates: {activities_context['start_date']} to {activities_context['end_date']}
Travelers: {activities_context['travelers']}
Budget: ${activities_context['budget']}
Automation Level: {automation_level}

Preferences: {preferences.get('activity_interests', 'varied experiences')}, {preferences.get('activity_style', 'balanced')}
{context_note}

Return JSON with activity options based on automation level {automation_level}."""

            # Get LLM response for activities search
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Parse activities results
            import json
            try:
                activities_results = json.loads(response.content)
            except json.JSONDecodeError:
                # Fallback to mock activities data
                activities_results = self._generate_mock_activities_data(activities_context)
            
            # Process results based on automation level
            processed_activities = self._process_activities_results(activities_results, automation_level, instructions, hotel_context)
            
            # Update shopping cart with activities selection
            if automation_level >= 3:
                # Auto-select activities
                if processed_activities:
                    state["shopping_cart"]["activities"] = processed_activities
                    await self._emit_itinerary_update({
                        "type": "activity_selected",
                        "message": f"Selected {len(processed_activities)} activities",
                        "data": processed_activities,
                        "section": "activities",
                        "agent": "activities_agent",
                        "auto_selected": True,
                        "context_source": "lodging_agent" if hotel_context else None
                    })
            else:
                # Store options for user selection
                state["shopping_cart"]["activity_options"] = processed_activities
                await self._emit_itinerary_update({
                    "type": "activity_results",
                    "message": f"Found {len(processed_activities)} activity options",
                    "data": processed_activities,
                    "section": "activities",
                    "agent": "activities_agent",
                    "requires_selection": True,
                    "context_source": "lodging_agent" if hotel_context else None
                })
            
            # Calculate total cost so far
            total_cost = 0.0
            if state["shopping_cart"].get("flights"):
                total_cost += sum(flight.get("price", 0) for flight in state["shopping_cart"]["flights"])
            if state["shopping_cart"].get("hotels"):
                total_cost += sum(hotel.get("total_cost", 0) for hotel in state["shopping_cart"]["hotels"])
            if state["shopping_cart"].get("activities"):
                total_cost += sum(activity.get("price", 0) for activity in state["shopping_cart"]["activities"])
            
            state["shopping_cart"]["total_cost"] = total_cost
            
            # Check budget compliance
            budget = preferences.get("budget", 5000)
            if total_cost > budget:
                logger.warning(f"Total cost ${total_cost} exceeds budget ${budget}")
                await self._emit_itinerary_update({
                    "type": "budget_warning",
                    "message": f"Current selections (${total_cost:.2f}) exceed budget (${budget:.2f})",
                    "total_cost": total_cost,
                    "budget": budget,
                    "section": "activities"
                })
            
            # Update agent status
            state["agent_status"]["activities_agent"] = "complete"
            state["step_count"] += 1
            
            # Save snapshot after activities selection
            self._save_context_snapshot(state, "activities_agent_complete")
            
            logger.info(f"Activities agent completed - found {len(processed_activities)} options, total cost: ${total_cost:.2f}")
            
        except Exception as e:
            logger.error(f"Activities agent failed: {str(e)}")
            state["error"] = f"Activities search failed: {str(e)}"
            state["agent_status"]["activities_agent"] = "error"
            
            await self._emit_itinerary_update({
                "type": "error",
                "message": f"Activities search failed: {str(e)}",
                "section": "activities",
                "agent": "activities_agent"
            })
        
        return state
    
    async def _shopping_cart(self, state: ConversationState) -> ConversationState:
        """Shopping cart management with backtracking support"""
        logger.info("Managing shopping cart")
        
        # Set current state for UI updates
        self._set_current_state(state)
        
        # Get current cart and automation level
        cart = state["shopping_cart"]
        automation_level = state["automation_level"]
        preferences = state["user_preferences"]
        
        # Validate cart completeness and dependencies
        validation_result = self._validate_cart_completeness(cart)
        
        if not validation_result["valid"]:
            logger.warning(f"Cart validation failed: {validation_result['issues']}")
            await self._emit_itinerary_update({
                "type": "cart_validation_error",
                "message": "Cart validation failed - some items are missing or invalid",
                "issues": validation_result["issues"],
                "section": "cart"
            })
            state["error"] = f"Cart validation failed: {', '.join(validation_result['issues'])}"
            return state
        
        # Update cart version for backtracking
        cart["version"] = cart.get("version", 1) + 1
        state["cart_version"] = cart["version"]
        
        # Calculate and update total cost
        total_cost = self._calculate_total_cost(cart)
        cart["total_cost"] = total_cost
        
        # Check budget compliance
        budget = preferences.get("budget", 5000)
        budget_analysis = self._analyze_budget_compliance(total_cost, budget)
        
        # Create cart summary for UI
        cart_summary = self._create_cart_summary(cart, budget_analysis)
        
        # Handle different automation levels for cart presentation
        if automation_level == 1:
            # Level 1: Present cart for manual review and confirmation
            await self._emit_itinerary_update({
                "type": "cart_review_required",
                "message": "Please review your selections and confirm to proceed",
                "cart_summary": cart_summary,
                "requires_confirmation": True,
                "section": "cart"
            })
            
            # Add manual review step
            state["current_step"] = "manual_cart_review"
            
        elif automation_level == 2:
            # Level 2: Present preselected cart with option to modify
            await self._emit_itinerary_update({
                "type": "cart_preselected",
                "message": "Your preselected trip is ready - confirm or make changes",
                "cart_summary": cart_summary,
                "can_modify": True,
                "section": "cart"
            })
            
            state["current_step"] = "preselected_cart_review"
            
        elif automation_level == 3:
            # Level 3: Present complete plan before auto-booking
            await self._emit_itinerary_update({
                "type": "cart_auto_selected",
                "message": "Your complete itinerary is ready - final review before booking",
                "cart_summary": cart_summary,
                "auto_proceed_in": 10,  # 10 second countdown
                "section": "cart"
            })
            
            state["current_step"] = "auto_cart_review"
            
        elif automation_level == 4:
            # Level 4: Full automation - proceed directly to booking
            await self._emit_itinerary_update({
                "type": "cart_auto_booking",
                "message": "Proceeding to book your perfect trip ✨",
                "cart_summary": cart_summary,
                "automated": True,
                "section": "cart"
            })
            
            state["current_step"] = "auto_booking"
        
        # Add cart dependencies tracking
        self._track_cart_dependencies(state, cart)
        
        # Save cart snapshot for backtracking
        self._save_context_snapshot(state, f"cart_v{cart['version']}")
        
        # Add user messages for conversation history
        state["messages"].append({
            "role": "assistant",
            "content": f"Cart updated with {len(cart.get('flights', []))} flights, {len(cart.get('hotels', []))} hotels, and {len(cart.get('activities', []))} activities. Total: ${total_cost:.2f}",
            "timestamp": time.time(),
            "step": "shopping_cart",
            "cart_summary": cart_summary
        })
        
        # Emit final cart update
        await self._emit_itinerary_update({
            "type": "cart_updated",
            "message": f"Cart updated - Total: ${total_cost:.2f}",
            "cart_summary": cart_summary,
            "total_cost": total_cost,
            "budget_status": budget_analysis["status"],
            "section": "cart"
        })
        
        state["step_count"] += 1
        logger.info(f"Shopping cart processed - Total: ${total_cost:.2f}, Budget: ${budget:.2f}")
        
        return state
    
    async def _booking_execution(self, state: ConversationState) -> ConversationState:
        """Booking execution with 5-layer fallback system"""
        logger.info("Executing bookings")
        
        # Set current state for UI updates
        self._set_current_state(state)
        
        # Get cart and preferences
        cart = state["shopping_cart"]
        preferences = state["user_preferences"]
        automation_level = state["automation_level"]
        
        # Initialize booking status
        booking_status = {
            "flights": {"status": "pending", "attempts": 0, "method": None},
            "hotels": {"status": "pending", "attempts": 0, "method": None},
            "activities": {"status": "pending", "attempts": 0, "method": None},
            "total_progress": 0,
            "current_booking": None,
            "errors": []
        }
        
        # Safety checkpoint for automation level 4
        if automation_level == 4:
            safety_check = await self._perform_safety_checkpoint(state, cart)
            if not safety_check["approved"]:
                await self._emit_itinerary_update({
                    "type": "safety_checkpoint_failed",
                    "message": safety_check["message"],
                    "issues": safety_check["issues"],
                    "requires_manual_approval": True
                })
                state["error"] = safety_check["message"]
                return state
        
        try:
            # Start booking process
            await self._emit_itinerary_update({
                "type": "booking_progress",
                "message": "Starting booking process...",
                "progress": 0,
                "automation_level": automation_level,
                "checkout_step": "initialization"
            })
            
            # Book flights with 5-layer fallback
            if cart.get("flights"):
                await self._emit_itinerary_update({
                    "type": "booking_progress",
                    "message": "Booking flights...",
                    "progress": 10,
                    "checkout_step": "flights"
                })
                
                flight_result = await self._book_with_fallback(
                    "flights", 
                    cart["flights"][0], 
                    preferences,
                    automation_level
                )
                booking_status["flights"] = flight_result
                booking_status["total_progress"] += 30
            
            # Book hotels with 5-layer fallback
            if cart.get("hotels"):
                await self._emit_itinerary_update({
                    "type": "booking_progress",
                    "message": "Booking accommodation...",
                    "progress": 40,
                    "checkout_step": "hotels"
                })
                
                hotel_result = await self._book_with_fallback(
                    "hotels",
                    cart["hotels"][0],
                    preferences,
                    automation_level
                )
                booking_status["hotels"] = hotel_result
                booking_status["total_progress"] += 40
            
            # Book activities with 5-layer fallback
            if cart.get("activities"):
                await self._emit_itinerary_update({
                    "type": "booking_progress",
                    "message": "Booking activities...",
                    "progress": 80,
                    "checkout_step": "activities"
                })
                
                activity_results = []
                for activity in cart["activities"]:
                    activity_result = await self._book_with_fallback(
                        "activities",
                        activity,
                        preferences,
                        automation_level
                    )
                    activity_results.append(activity_result)
                
                booking_status["activities"] = {
                    "status": "success" if all(r["status"] == "success" for r in activity_results) else "partial",
                    "results": activity_results,
                    "method": activity_results[0]["method"] if activity_results else None
                }
                booking_status["total_progress"] += 20
            
            # Final booking status
            all_successful = all(
                booking_status[item]["status"] == "success" 
                for item in ["flights", "hotels", "activities"]
                if cart.get(item)
            )
            
            if all_successful:
                await self._emit_itinerary_update({
                    "type": "booking_complete",
                    "message": "All bookings completed successfully! 🎉",
                    "progress": 100,
                    "checkout_step": "complete",
                    "booking_status": booking_status
                })
                
                state["current_step"] = "booking_complete"
                state["output_data"]["booking_status"] = booking_status
                
                # Generate confirmation numbers
                state["output_data"]["confirmation_numbers"] = {
                    "flights": booking_status["flights"].get("confirmation", "N/A"),
                    "hotels": booking_status["hotels"].get("confirmation", "N/A"),
                    "activities": [r.get("confirmation", "N/A") for r in booking_status["activities"].get("results", [])]
                }
                
            else:
                # Handle partial failures
                failed_items = [
                    item for item in ["flights", "hotels", "activities"]
                    if cart.get(item) and booking_status[item]["status"] != "success"
                ]
                
                await self._emit_itinerary_update({
                    "type": "booking_partial_failure",
                    "message": f"Some bookings failed: {', '.join(failed_items)}",
                    "progress": booking_status["total_progress"],
                    "checkout_step": "partial_failure",
                    "failed_items": failed_items,
                    "booking_status": booking_status
                })
                
                state["current_step"] = "booking_partial_failure"
                state["output_data"]["booking_status"] = booking_status
                
                # Offer manual intervention
                if automation_level < 4:
                    await self._emit_itinerary_update({
                        "type": "manual_intervention_required",
                        "message": "Manual intervention required for failed bookings",
                        "failed_items": failed_items,
                        "next_actions": self._generate_manual_next_actions(failed_items)
                    })
        
        except Exception as e:
            logger.error(f"Booking execution failed: {str(e)}")
            state["error"] = f"Booking execution failed: {str(e)}"
            
            await self._emit_itinerary_update({
                "type": "booking_error",
                "message": f"Booking process failed: {str(e)}",
                "error": str(e),
                "requires_manual_intervention": True
            })
        
        # Save booking snapshot
        self._save_context_snapshot(state, "booking_execution_complete")
        
        state["step_count"] += 1
        logger.info(f"Booking execution completed with status: {booking_status}")
        
        return state
    
    async def _itinerary_generation(self, state: ConversationState) -> ConversationState:
        """Generate final itinerary with personalized recommendations"""
        logger.info("Generating itinerary")
        
        # Set current state for UI updates
        self._set_current_state(state)
        
        # Get completed booking data
        cart = state["shopping_cart"]
        preferences = state["user_preferences"]
        booking_status = state["output_data"].get("booking_status", {})
        
        # Start itinerary generation
        await self._emit_itinerary_update({
            "type": "itinerary_generation_start",
            "message": "Creating your personalized travel itinerary...",
            "progress": 0,
            "step": "itinerary_generation"
        })
        
        try:
            # Create comprehensive itinerary
            itinerary = await self._create_personalized_itinerary(state, cart, preferences, booking_status)
            
            # Add local information and recommendations
            await self._emit_itinerary_update({
                "type": "itinerary_generation_progress",
                "message": "Adding local information and recommendations...",
                "progress": 30,
                "step": "local_info"
            })
            
            local_info = await self._generate_local_information(preferences, cart)
            itinerary["local_information"] = local_info
            
            # Generate packing list
            await self._emit_itinerary_update({
                "type": "itinerary_generation_progress",
                "message": "Creating personalized packing list...",
                "progress": 50,
                "step": "packing_list"
            })
            
            packing_list = await self._generate_packing_list(preferences, cart, local_info)
            itinerary["packing_list"] = packing_list
            
            # Add travel tips and important information
            await self._emit_itinerary_update({
                "type": "itinerary_generation_progress",
                "message": "Adding travel tips and important information...",
                "progress": 70,
                "step": "travel_tips"
            })
            
            travel_tips = await self._generate_travel_tips(preferences, cart, local_info)
            itinerary["travel_tips"] = travel_tips
            
            # Generate PDF document
            await self._emit_itinerary_update({
                "type": "itinerary_generation_progress",
                "message": "Generating PDF itinerary document...",
                "progress": 85,
                "step": "pdf_generation"
            })
            
            pdf_result = await self._generate_pdf_itinerary(itinerary)
            itinerary["pdf_info"] = pdf_result
            
            # Finalize itinerary
            await self._emit_itinerary_update({
                "type": "itinerary_generation_complete",
                "message": "Your complete travel itinerary is ready! 🎉",
                "progress": 100,
                "step": "complete",
                "itinerary": itinerary
            })
            
            # Update state with final itinerary
            state["output_data"]["itinerary"] = itinerary
            state["output_data"]["itinerary_pdf"] = pdf_result
            
            # Create trip summary
            trip_summary = self._create_trip_summary(itinerary, booking_status)
            state["output_data"]["trip_summary"] = trip_summary
            
            # Save final snapshot
            self._save_context_snapshot(state, "itinerary_complete")
            
            # Add completion message to conversation
            state["messages"].append({
                "role": "assistant",
                "content": f"Your {preferences.get('destination', 'travel')} itinerary is complete! Total cost: ${cart.get('total_cost', 0):.2f}. PDF available for download.",
                "timestamp": time.time(),
                "step": "itinerary_generation",
                "itinerary_summary": trip_summary
            })
            
            logger.info("Itinerary generation completed successfully")
            
        except Exception as e:
            logger.error(f"Itinerary generation failed: {str(e)}")
            state["error"] = f"Itinerary generation failed: {str(e)}"
            
            await self._emit_itinerary_update({
                "type": "itinerary_generation_error",
                "message": f"Failed to generate itinerary: {str(e)}",
                "error": str(e)
            })
        
        state["current_step"] = "complete"
        state["output_data"]["status"] = "completed"
        state["step_count"] += 1
        
        return state
    
    # ========================================
    # AUTOMATION LEVEL ROUTING NODES
    # ========================================
    
    async def _present_options(self, state: ConversationState) -> ConversationState:
        """Level 1: Present options one by one, require user selection"""
        logger.info("Automation Level 1: Presenting options for user selection")
        
        # TODO: Present all options for manual selection
        # TODO: Wait for user input before proceeding
        
        return state
    
    async def _preselect_options(self, state: ConversationState) -> ConversationState:
        """Level 2: Preselect best option, user confirms or changes"""
        logger.info("Automation Level 2: Preselecting best options")
        
        # TODO: Auto-select best options but allow user to change
        # TODO: Present preselected options for confirmation
        
        return state
    
    async def _auto_select_with_review(self, state: ConversationState) -> ConversationState:
        """Level 3: Auto-select all options, present plan before booking"""
        logger.info("Automation Level 3: Auto-selecting with review")
        
        # TODO: Auto-select all options
        # TODO: Present complete plan for user review before booking
        
        return state
    
    async def _auto_book(self, state: ConversationState) -> ConversationState:
        """Level 4: Auto-select, auto-book, and auto-checkout - full autonomy"""
        logger.info("Automation Level 4: Full autonomy mode (I'm Feeling Lucky)")
        
        # TODO: Complete automation including checkout
        # TODO: Real-time progress updates
        # TODO: Safety checkpoints for budget/unusual selections
        
        return state
    
    # ========================================
    # ROUTING LOGIC
    # ========================================
    
    def _route_by_automation_level(self, state: ConversationState) -> str:
        """Route to appropriate automation level handler"""
        automation_level = state["automation_level"]
        
        if automation_level == 1:
            return "level_1"
        elif automation_level == 2:
            return "level_2" 
        elif automation_level == 3:
            return "level_3"
        elif automation_level == 4:
            return "level_4"
        else:
            # Default to manual
            return "level_1"
    
    def _check_for_changes(self, state: ConversationState) -> str:
        """Check if user wants to modify any cart items or route based on agent status"""
        
        # Check if all agents have completed successfully
        agent_status = state.get("agent_status", {})
        
        # Check for any agent errors
        if "error" in agent_status.values():
            logger.warning("Agent error detected, routing to first failed agent")
            if agent_status.get("flight_agent") == "error":
                return "modify_flights"
            elif agent_status.get("lodging_agent") == "error":
                return "modify_hotels"
            elif agent_status.get("activities_agent") == "error":
                return "modify_activities"
        
        # Check for explicit user modification requests
        current_step = state.get("current_step", "")
        if "modify" in current_step:
            if "flight" in current_step:
                return "modify_flights"
            elif "hotel" in current_step:
                return "modify_hotels"
            elif "activity" in current_step:
                return "modify_activities"
        
        # Check if shopping cart needs validation
        cart = state.get("shopping_cart", {})
        
        # Validate cart completeness
        missing_items = []
        if not cart.get("flights"):
            missing_items.append("flights")
        if not cart.get("hotels"):
            missing_items.append("hotels")
        if not cart.get("activities"):
            missing_items.append("activities")
        
        if missing_items:
            logger.warning(f"Cart missing items: {missing_items}")
            # Route to first missing item
            if "flights" in missing_items:
                return "modify_flights"
            elif "hotels" in missing_items:
                return "modify_hotels"
            elif "activities" in missing_items:
                return "modify_activities"
        
        # Check budget compliance
        total_cost = cart.get("total_cost", 0)
        budget = state.get("user_preferences", {}).get("budget", 5000)
        
        if total_cost > budget * 1.1:  # 10% budget overflow tolerance
            logger.warning(f"Cart total ${total_cost} significantly exceeds budget ${budget}")
            # User may want to modify - emit warning but proceed
            asyncio.create_task(self._emit_itinerary_update({
                "type": "budget_warning",
                "message": f"Total cost ${total_cost:.2f} exceeds budget ${budget:.2f}. Review your selections.",
                "total_cost": total_cost,
                "budget": budget,
                "overflow_amount": total_cost - budget
            }))
        
        # Default to confirm if everything looks good
        logger.info("Shopping cart validation passed, proceeding to booking")
        return "confirm"
    
    # ========================================
    # CONVERSATION STATE MANAGEMENT
    # ========================================
    
    def _validate_state(self, state: ConversationState) -> bool:
        """Validate conversation state integrity"""
        try:
            # Check required fields
            required_fields = [
                "conversation_id", "automation_level", "current_step",
                "user_preferences", "shopping_cart", "agent_status"
            ]
            
            for field in required_fields:
                if field not in state:
                    logger.error(f"Missing required state field: {field}")
                    return False
            
            # Validate automation level
            if state["automation_level"] not in [1, 2, 3, 4]:
                logger.error(f"Invalid automation level: {state['automation_level']}")
                return False
            
            # Validate shopping cart structure
            cart = state["shopping_cart"]
            required_cart_fields = ["flights", "hotels", "activities", "total_cost"]
            for field in required_cart_fields:
                if field not in cart:
                    logger.error(f"Missing shopping cart field: {field}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"State validation failed: {str(e)}")
            return False
    
    def _create_context_snapshot(self, state: ConversationState, label: str = None) -> Dict[str, Any]:
        """Create a snapshot of current conversation context for backtracking"""
        import copy
        
        snapshot = {
            "snapshot_id": str(uuid.uuid4()),
            "timestamp": time.time(),
            "label": label if label is not None else f"step_{state['current_step']}",
            "step_count": state["step_count"],
            "current_step": state["current_step"],
            
            # Core state snapshot
            "user_preferences": copy.deepcopy(state["user_preferences"]),
            "shopping_cart": copy.deepcopy(state["shopping_cart"]),
            "agent_status": copy.deepcopy(state["agent_status"]),
            "agent_communications": copy.deepcopy(state["agent_communications"]),
            
            # Context metadata
            "automation_level": state["automation_level"],
            "cart_version": state["cart_version"],
        }
        
        logger.info(f"Created context snapshot: {snapshot['snapshot_id']} - {label}")
        return snapshot
    
    def _save_context_snapshot(self, state: ConversationState, label: str = None):
        """Save current context as a snapshot for backtracking"""
        snapshot = self._create_context_snapshot(state, label)
        
        # Add to snapshots storage
        state["context_snapshots"][snapshot["snapshot_id"]] = snapshot
        
        # Add to backtrack history
        state["backtrack_history"].append({
            "snapshot_id": snapshot["snapshot_id"],
            "timestamp": snapshot["timestamp"],
            "label": snapshot["label"],
            "step": state["current_step"]
        })
        
        # Keep only last 10 snapshots to prevent memory bloat
        if len(state["backtrack_history"]) > 10:
            oldest_snapshot = state["backtrack_history"].pop(0)
            if oldest_snapshot["snapshot_id"] in state["context_snapshots"]:
                del state["context_snapshots"][oldest_snapshot["snapshot_id"]]
    
    def _restore_context_snapshot(self, state: ConversationState, snapshot_id: str) -> bool:
        """Restore conversation state from a previous snapshot"""
        try:
            if snapshot_id not in state["context_snapshots"]:
                logger.error(f"Snapshot not found: {snapshot_id}")
                return False
            
            snapshot = state["context_snapshots"][snapshot_id]
            
            # Restore state from snapshot
            state["user_preferences"] = snapshot["user_preferences"]
            state["shopping_cart"] = snapshot["shopping_cart"]
            state["agent_status"] = snapshot["agent_status"]
            state["agent_communications"] = snapshot["agent_communications"]
            state["automation_level"] = snapshot["automation_level"]
            state["cart_version"] = snapshot["cart_version"]
            state["current_step"] = snapshot["current_step"]
            state["step_count"] = snapshot["step_count"]
            
            logger.info(f"Restored context from snapshot: {snapshot_id} - {snapshot['label']}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to restore snapshot {snapshot_id}: {str(e)}")
            return False
    
    def _serialize_conversation_state(self, state: ConversationState) -> Dict[str, Any]:
        """Serialize conversation state for storage/export"""
        import copy
        
        # Create a clean copy for serialization
        serialized = copy.deepcopy(dict(state))
        
        # Convert any non-serializable types
        serialized["execution_time"] = float(serialized.get("execution_time", 0.0))
        
        # Add metadata
        serialized["_metadata"] = {
            "serialized_at": time.time(),
            "version": "1.0",
            "graph_type": "TravelOrchestratorGraph"
        }
        
        return serialized
    
    def _deserialize_conversation_state(self, serialized_data: Dict[str, Any]) -> ConversationState:
        """Deserialize conversation state from storage/import"""
        try:
            # Remove metadata
            if "_metadata" in serialized_data:
                del serialized_data["_metadata"]
            
            # Create ConversationState from deserialized data
            state = ConversationState(**serialized_data)
            
            # Validate deserialized state
            if not self._validate_state(state):
                raise ValueError("Deserialized state failed validation")
            
            logger.info(f"Deserialized conversation state: {state['conversation_id']}")
            return state
            
        except Exception as e:
            logger.error(f"Failed to deserialize state: {str(e)}")
            raise
    
    def _initialize_conversation_state(self, input_data: Dict[str, Any]) -> ConversationState:
        """Initialize a new conversation state with validation"""
        # Create initial state
        state = self._create_initial_state(input_data)
        
        # Validate initial state
        if not self._validate_state(state):
            raise ValueError("Failed to create valid initial state")
        
        # Create initial snapshot
        self._save_context_snapshot(state, "conversation_start")
        
        logger.info(f"Initialized conversation: {state['conversation_id']}")
        return state
    
    def _add_backtrack_point(self, state: ConversationState, label: str):
        """Add a backtrack point at current state"""
        self._save_context_snapshot(state, label)
        
        # Emit UI update for backtrack point
        asyncio.create_task(self._emit_itinerary_update({
            "type": "backtrack_point",
            "label": label,
            "step": state["current_step"],
            "can_return_to": True
        }))
    
    def _save_trip_template(self, state: ConversationState, template_name: str) -> Dict[str, Any]:
        """Save current trip as a reusable template"""
        try:
            template = {
                "template_id": str(uuid.uuid4()),
                "name": template_name,
                "created_at": time.time(),
                "description": f"Trip template for {state['user_preferences'].get('destination', 'Unknown destination')}",
                
                # Template data
                "preferences": {
                    "destination": state["user_preferences"].get("destination"),
                    "travelers": state["user_preferences"].get("travelers"),
                    "travel_style": state["user_preferences"].get("travel_style"),
                    "budget_range": self._categorize_budget(state["user_preferences"].get("budget", 0)),
                    "trip_duration": self._calculate_trip_duration(state["user_preferences"]),
                    "accommodation_style": state["user_preferences"].get("accommodation_style"),
                    "activity_interests": state["user_preferences"].get("activity_interests", [])
                },
                
                "trip_structure": {
                    "flight_preferences": self._extract_flight_preferences(state),
                    "hotel_preferences": self._extract_hotel_preferences(state),
                    "activity_preferences": self._extract_activity_preferences(state)
                },
                
                "automation_level": state["automation_level"],
                "success_metrics": {
                    "total_cost": state["shopping_cart"].get("total_cost", 0),
                    "budget_compliance": self._analyze_budget_compliance(
                        state["shopping_cart"].get("total_cost", 0),
                        state["user_preferences"].get("budget", 5000)
                    )["status"],
                    "completion_time": time.time() - state.get("start_time", time.time())
                }
            }
            
            # Save to templates storage (in real implementation, this would be persistent)
            if "trip_templates" not in state:
                state["trip_templates"] = {}
            state["trip_templates"][template["template_id"]] = template
            
            logger.info(f"Saved trip template: {template_name} ({template['template_id']})")
            return template
            
        except Exception as e:
            logger.error(f"Failed to save trip template: {str(e)}")
            raise
    
    def _load_trip_template(self, state: ConversationState, template_id: str) -> bool:
        """Load a trip template and apply it to current state"""
        try:
            if "trip_templates" not in state or template_id not in state["trip_templates"]:
                logger.error(f"Trip template not found: {template_id}")
                return False
            
            template = state["trip_templates"][template_id]
            
            # Apply template preferences
            template_prefs = template["preferences"]
            current_prefs = state["user_preferences"]
            
            # Merge template preferences with current preferences
            for key, value in template_prefs.items():
                if key not in current_prefs or not current_prefs[key]:
                    current_prefs[key] = value
            
            # Apply trip structure preferences
            structure = template["trip_structure"]
            current_prefs.update({
                "flight_preferences": structure.get("flight_preferences", {}),
                "hotel_preferences": structure.get("hotel_preferences", {}),
                "activity_preferences": structure.get("activity_preferences", {})
            })
            
            # Apply automation level if not already set
            if state["automation_level"] == 1:  # Default level
                state["automation_level"] = template["automation_level"]
            
            # Create snapshot after template application
            self._save_context_snapshot(state, f"template_applied_{template['name']}")
            
            logger.info(f"Loaded trip template: {template['name']} ({template_id})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load trip template: {str(e)}")
            return False
    
    def _get_available_backtrack_points(self, state: ConversationState) -> List[Dict[str, Any]]:
        """Get user-friendly list of available backtrack points"""
        backtrack_points = []
        
        for history_item in state["backtrack_history"]:
            snapshot_id = history_item["snapshot_id"]
            if snapshot_id in state["context_snapshots"]:
                snapshot = state["context_snapshots"][snapshot_id]
                
                # Create user-friendly description
                description = self._create_backtrack_description(snapshot)
                
                backtrack_points.append({
                    "id": snapshot_id,
                    "label": snapshot["label"],
                    "description": description,
                    "step": snapshot["current_step"],
                    "timestamp": snapshot["timestamp"],
                    "can_return": True,
                    "time_ago": self._format_time_ago(snapshot["timestamp"])
                })
        
        return backtrack_points
    
    def _create_backtrack_description(self, snapshot: Dict[str, Any]) -> str:
        """Create user-friendly description of backtrack point"""
        step = snapshot["current_step"]
        preferences = snapshot.get("user_preferences", {})
        cart = snapshot.get("shopping_cart", {})
        
        if step == "preferences_collected":
            destination = preferences.get("destination", "Unknown")
            return f"After collecting preferences for {destination}"
        elif step == "flight_agent_complete":
            flights = cart.get("flights", [])
            if flights:
                airline = flights[0].get("airline", "Unknown")
                return f"After selecting {airline} flight"
            return "After flight selection"
        elif step == "lodging_agent_complete":
            hotels = cart.get("hotels", [])
            if hotels:
                hotel_name = hotels[0].get("name", "Unknown")
                return f"After selecting {hotel_name}"
            return "After hotel selection"
        elif step == "activities_agent_complete":
            activities = cart.get("activities", [])
            activity_count = len(activities)
            return f"After selecting {activity_count} activities"
        elif step.startswith("cart_"):
            total_cost = cart.get("total_cost", 0)
            return f"Cart review - Total: ${total_cost:.2f}"
        else:
            return f"Step: {step.replace('_', ' ').title()}"
    
    def _format_time_ago(self, timestamp: float) -> str:
        """Format timestamp as user-friendly 'time ago' string"""
        now = time.time()
        diff = now - timestamp
        
        if diff < 60:
            return "Just now"
        elif diff < 3600:
            minutes = int(diff / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif diff < 86400:
            hours = int(diff / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        else:
            days = int(diff / 86400)
            return f"{days} day{'s' if days != 1 else ''} ago"
    
    async def _backtrack_to_point(self, state: ConversationState, snapshot_id: str) -> bool:
        """Backtrack to a specific point with UI updates"""
        try:
            # Restore the snapshot
            success = self._restore_context_snapshot(state, snapshot_id)
            
            if not success:
                return False
            
            # Get backtrack point info
            snapshot = state["context_snapshots"].get(snapshot_id)
            if not snapshot:
                return False
            
            # Emit UI update for backtrack
            await self._emit_itinerary_update({
                "type": "backtrack_executed",
                "message": f"Returned to: {snapshot['label']}",
                "snapshot_id": snapshot_id,
                "target_step": snapshot["current_step"],
                "time_ago": self._format_time_ago(snapshot["timestamp"])
            })
            
            # Clear any forward progress after backtrack point
            self._clear_forward_progress(state, snapshot["timestamp"])
            
            logger.info(f"Backtracked to: {snapshot['label']} ({snapshot_id})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to backtrack to {snapshot_id}: {str(e)}")
            return False
    
    def _clear_forward_progress(self, state: ConversationState, backtrack_timestamp: float):
        """Clear any progress that happened after the backtrack point"""
        # Remove snapshots that were created after backtrack point
        snapshots_to_remove = []
        for snapshot_id, snapshot in state["context_snapshots"].items():
            if snapshot["timestamp"] > backtrack_timestamp:
                snapshots_to_remove.append(snapshot_id)
        
        for snapshot_id in snapshots_to_remove:
            del state["context_snapshots"][snapshot_id]
        
        # Update backtrack history
        state["backtrack_history"] = [
            item for item in state["backtrack_history"]
            if item["timestamp"] <= backtrack_timestamp
        ]
        
        # Clear UI updates that happened after backtrack
        state["ui_updates"] = [
            update for update in state["ui_updates"]
            if update.get("timestamp", 0) <= backtrack_timestamp
        ]
        
        logger.info(f"Cleared forward progress after timestamp {backtrack_timestamp}")
    
    def _categorize_budget(self, budget: float) -> str:
        """Categorize budget into ranges for templates"""
        if budget < 1000:
            return "budget"
        elif budget < 3000:
            return "mid_range"
        elif budget < 7000:
            return "premium"
        else:
            return "luxury"
    
    def _calculate_trip_duration(self, preferences: Dict[str, Any]) -> int:
        """Calculate trip duration in days"""
        start_date = preferences.get("start_date")
        end_date = preferences.get("end_date")
        
        if not start_date or not end_date:
            return 0
        
        try:
            # Simple string comparison for now - in real implementation would parse dates
            return 3  # Default assumption
        except:
            return 0
    
    def _extract_flight_preferences(self, state: ConversationState) -> Dict[str, Any]:
        """Extract flight preferences from current state"""
        flights = state["shopping_cart"].get("flights", [])
        if not flights:
            return {}
        
        flight = flights[0]
        return {
            "preferred_airline": flight.get("airline"),
            "preferred_class": flight.get("class", "economy"),
            "direct_flights": flight.get("stops", 0) == 0,
            "time_preference": "morning" if "AM" in flight.get("departure_time", "") else "afternoon"
        }
    
    def _extract_hotel_preferences(self, state: ConversationState) -> Dict[str, Any]:
        """Extract hotel preferences from current state"""
        hotels = state["shopping_cart"].get("hotels", [])
        if not hotels:
            return {}
        
        hotel = hotels[0]
        return {
            "preferred_type": hotel.get("type"),
            "preferred_rating": hotel.get("rating", 0),
            "preferred_amenities": hotel.get("amenities", []),
            "location_preference": hotel.get("location")
        }
    
    def _extract_activity_preferences(self, state: ConversationState) -> Dict[str, Any]:
        """Extract activity preferences from current state"""
        activities = state["shopping_cart"].get("activities", [])
        if not activities:
            return {}
        
        categories = [activity.get("category") for activity in activities]
        return {
            "preferred_categories": categories,
            "activity_count": len(activities),
            "budget_per_activity": sum(activity.get("price", 0) for activity in activities) / len(activities)
        }
    
    # ========================================
    # UI UPDATE EMISSION SYSTEM
    # ========================================
    
    async def _emit_itinerary_update(self, update: Dict[str, Any]):
        """Emit real-time updates to itinerary UI with section targeting"""
        try:
            # Add timestamp and conversation context
            enriched_update = {
                **update,
                "timestamp": time.time(),
                "conversation_id": self._get_conversation_id_from_update(update),
                "automation_level": self._get_automation_level_from_update(update)
            }
            
            # Validate update structure
            if not self._validate_ui_update(enriched_update):
                logger.error(f"Invalid UI update structure: {update}")
                return
            
            # Route update based on type
            update_type = enriched_update.get("type", "general")
            
            if update_type in ["flight_results", "flight_search", "flight_selected"]:
                await self._emit_flight_section_update(enriched_update)
            elif update_type in ["hotel_results", "hotel_search", "hotel_selected"]:
                await self._emit_accommodation_section_update(enriched_update)
            elif update_type in ["activity_results", "activity_search", "activity_selected"]:
                await self._emit_activities_section_update(enriched_update)
            elif update_type in ["booking_progress", "checkout_progress"]:
                await self._emit_booking_section_update(enriched_update)
            elif update_type in ["agent_status", "orchestrator_start"]:
                await self._emit_agent_status_overlay(enriched_update)
            else:
                await self._emit_general_update(enriched_update)
            
            # Add to UI updates queue
            if hasattr(self, '_current_state') and self._current_state:
                self._current_state["ui_updates"].append(enriched_update)
                
                # Keep only last 50 updates to prevent memory bloat
                if len(self._current_state["ui_updates"]) > 50:
                    self._current_state["ui_updates"] = self._current_state["ui_updates"][-50:]
            
            logger.info(f"Emitted {update_type} update: {enriched_update.get('message', 'No message')}")
            
        except Exception as e:
            logger.error(f"Failed to emit UI update: {str(e)}")
    
    def _validate_ui_update(self, update: Dict[str, Any]) -> bool:
        """Validate UI update structure"""
        required_fields = ["type", "timestamp"]
        
        for field in required_fields:
            if field not in update:
                logger.error(f"Missing required UI update field: {field}")
                return False
        
        # Validate update type
        valid_types = [
            "welcome", "preferences_collected", "orchestrator_start", "automation_mode",
            "flight_search", "flight_results", "flight_selected",
            "hotel_search", "hotel_results", "hotel_selected", 
            "activity_search", "activity_results", "activity_selected",
            "booking_progress", "checkout_progress", "booking_complete",
            "agent_status", "missing_information", "backtrack_point",
            "general", "error"
        ]
        
        if update["type"] not in valid_types:
            logger.warning(f"Unknown UI update type: {update['type']}")
            # Don't fail validation, just warn
        
        return True
    
    def _get_conversation_id_from_update(self, update: Dict[str, Any]) -> str:
        """Extract conversation ID from update context"""
        if hasattr(self, '_current_state') and self._current_state:
            return self._current_state.get("conversation_id", "unknown")
        return update.get("conversation_id", "unknown")
    
    def _get_automation_level_from_update(self, update: Dict[str, Any]) -> int:
        """Extract automation level from update context"""
        if hasattr(self, '_current_state') and self._current_state:
            return self._current_state.get("automation_level", 1)
        return update.get("automation_level", 1)
    
    async def _emit_flight_section_update(self, update: Dict[str, Any]):
        """Emit update targeted at flights section of itinerary"""
        section_update = {
            **update,
            "target_section": "flights",
            "section_action": self._determine_section_action(update),
            "itinerary_position": "top"
        }
        
        # Add flight-specific metadata
        if "data" in update:
            section_update["flight_data"] = update["data"]
        
        await self._send_to_ui_handler("itinerary_section_update", section_update)
        logger.debug(f"Emitted flight section update: {update['type']}")
    
    async def _emit_accommodation_section_update(self, update: Dict[str, Any]):
        """Emit update targeted at accommodation section of itinerary"""
        section_update = {
            **update,
            "target_section": "accommodation",
            "section_action": self._determine_section_action(update),
            "itinerary_position": "middle"
        }
        
        # Add accommodation-specific metadata
        if "data" in update:
            section_update["hotel_data"] = update["data"]
        
        await self._send_to_ui_handler("itinerary_section_update", section_update)
        logger.debug(f"Emitted accommodation section update: {update['type']}")
    
    async def _emit_activities_section_update(self, update: Dict[str, Any]):
        """Emit update targeted at activities section of itinerary"""
        section_update = {
            **update,
            "target_section": "activities",
            "section_action": self._determine_section_action(update),
            "itinerary_position": "bottom"
        }
        
        # Add activities-specific metadata
        if "data" in update:
            section_update["activity_data"] = update["data"]
        
        await self._send_to_ui_handler("itinerary_section_update", section_update)
        logger.debug(f"Emitted activities section update: {update['type']}")
    
    async def _emit_booking_section_update(self, update: Dict[str, Any]):
        """Emit update for booking/checkout progress overlay"""
        booking_update = {
            **update,
            "target_section": "booking_overlay",
            "overlay": True,
            "progress": update.get("progress", 0),
            "checkout_step": update.get("checkout_step", "unknown")
        }
        
        await self._send_to_ui_handler("booking_progress_update", booking_update)
        logger.debug(f"Emitted booking progress update: {update.get('progress', 0)}%")
    
    async def _emit_agent_status_overlay(self, update: Dict[str, Any]):
        """Emit agent status overlay updates"""
        status_update = {
            **update,
            "target_section": "agent_status_overlay",
            "overlay": True,
            "agent_name": update.get("agent", "orchestrator"),
            "status": update.get("status", "working"),
            "progress_indicator": True
        }
        
        await self._send_to_ui_handler("agent_status_update", status_update)
        logger.debug(f"Emitted agent status update: {update.get('agent', 'orchestrator')}")
    
    async def _emit_general_update(self, update: Dict[str, Any]):
        """Emit general updates (welcome, errors, etc.)"""
        general_update = {
            **update,
            "target_section": "general",
            "global_message": True
        }
        
        await self._send_to_ui_handler("general_update", general_update)
        logger.debug(f"Emitted general update: {update['type']}")
    
    def _determine_section_action(self, update: Dict[str, Any]) -> str:
        """Determine what action to take on the itinerary section"""
        update_type = update["type"]
        
        if "search" in update_type:
            return "show_loading"
        elif "results" in update_type:
            return "populate_data"
        elif "selected" in update_type:
            return "highlight_selection"
        elif "complete" in update_type:
            return "mark_complete"
        else:
            return "update_content"
    
    async def _send_to_ui_handler(self, handler_type: str, update: Dict[str, Any]):
        """Send update to appropriate UI handler (placeholder for real implementation)"""
        # TODO: Integrate with actual UI update mechanism (WebSocket, SSE, etc.)
        # This is where we would send to the frontend via:
        # - Server-Sent Events
        # - WebSocket connection  
        # - Redis pub/sub
        # - Event queue
        
        logger.info(f"UI Handler [{handler_type}]: {update.get('message', 'Update sent')}")
        
        # For now, just log the structured update
        if logger.isEnabledFor(logging.DEBUG):
            import json
            logger.debug(f"UI Update Payload: {json.dumps(update, indent=2, default=str)}")
    
    def _set_current_state(self, state: ConversationState):
        """Set current state for UI update context (helper method)"""
        self._current_state = state 
    
    def _validate_cart_completeness(self, cart: Dict[str, Any]) -> Dict[str, Any]:
        """Validate shopping cart completeness and dependencies"""
        issues = []
        
        # Check for required items
        if not cart.get("flights"):
            issues.append("No flights selected")
        
        if not cart.get("hotels"):
            issues.append("No accommodation selected")
        
        if not cart.get("activities"):
            issues.append("No activities selected")
        
        # Validate flight data
        flights = cart.get("flights", [])
        for i, flight in enumerate(flights):
            if not flight.get("airline") or not flight.get("price"):
                issues.append(f"Flight {i+1} missing required information")
        
        # Validate hotel data
        hotels = cart.get("hotels", [])
        for i, hotel in enumerate(hotels):
            if not hotel.get("name") or not hotel.get("total_cost"):
                issues.append(f"Hotel {i+1} missing required information")
        
        # Validate activity data
        activities = cart.get("activities", [])
        for i, activity in enumerate(activities):
            if not activity.get("name") or not activity.get("price"):
                issues.append(f"Activity {i+1} missing required information")
        
        # Check date consistency
        if flights and hotels:
            # Ensure hotel dates align with flight dates
            flight_arrival = flights[0].get("arrival_date")
            hotel_checkin = hotels[0].get("checkin_date")
            
            if flight_arrival and hotel_checkin and flight_arrival != hotel_checkin:
                issues.append("Hotel check-in date doesn't match flight arrival")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "item_count": len(flights) + len(hotels) + len(activities)
        }
    
    def _calculate_total_cost(self, cart: Dict[str, Any]) -> float:
        """Calculate total cost of all items in cart"""
        total = 0.0
        
        # Add flight costs
        for flight in cart.get("flights", []):
            total += flight.get("price", 0)
        
        # Add hotel costs
        for hotel in cart.get("hotels", []):
            total += hotel.get("total_cost", 0)
        
        # Add activity costs
        for activity in cart.get("activities", []):
            total += activity.get("price", 0)
        
        return total
    
    def _analyze_budget_compliance(self, total_cost: float, budget: float) -> Dict[str, Any]:
        """Analyze budget compliance and provide status"""
        if total_cost <= budget:
            status = "within_budget"
            message = f"Within budget - ${budget - total_cost:.2f} remaining"
        elif total_cost <= budget * 1.05:  # 5% tolerance
            status = "slightly_over"
            message = f"Slightly over budget by ${total_cost - budget:.2f}"
        elif total_cost <= budget * 1.15:  # 15% tolerance
            status = "moderately_over"
            message = f"Moderately over budget by ${total_cost - budget:.2f}"
        else:
            status = "significantly_over"
            message = f"Significantly over budget by ${total_cost - budget:.2f}"
        
        return {
            "status": status,
            "message": message,
            "total_cost": total_cost,
            "budget": budget,
            "difference": total_cost - budget,
            "percentage_of_budget": (total_cost / budget) * 100 if budget > 0 else 0
        }
    
    def _create_cart_summary(self, cart: Dict[str, Any], budget_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Create a comprehensive cart summary for UI display"""
        flights = cart.get("flights", [])
        hotels = cart.get("hotels", [])
        activities = cart.get("activities", [])
        
        # Summarize flights
        flight_summary = []
        for flight in flights:
            flight_summary.append({
                "airline": flight.get("airline", "Unknown"),
                "route": f"{flight.get('departure_city', 'Unknown')} → {flight.get('destination_city', 'Unknown')}",
                "price": flight.get("price", 0),
                "departure_time": flight.get("departure_time", "Unknown")
            })
        
        # Summarize hotels
        hotel_summary = []
        for hotel in hotels:
            hotel_summary.append({
                "name": hotel.get("name", "Unknown"),
                "location": hotel.get("location", "Unknown"),
                "total_cost": hotel.get("total_cost", 0),
                "rating": hotel.get("rating", 0)
            })
        
        # Summarize activities
        activity_summary = []
        for activity in activities:
            activity_summary.append({
                "name": activity.get("name", "Unknown"),
                "category": activity.get("category", "Unknown"),
                "price": activity.get("price", 0),
                "duration": activity.get("duration", "Unknown")
            })
        
        return {
            "flights": flight_summary,
            "hotels": hotel_summary,
            "activities": activity_summary,
            "total_cost": cart.get("total_cost", 0),
            "budget_analysis": budget_analysis,
            "item_counts": {
                "flights": len(flights),
                "hotels": len(hotels),
                "activities": len(activities)
            },
            "version": cart.get("version", 1)
        }
    
    def _track_cart_dependencies(self, state: ConversationState, cart: Dict[str, Any]):
        """Track dependencies between cart items for backtracking"""
        dependencies = {}
        
        # Track flight to hotel dependencies
        flights = cart.get("flights", [])
        hotels = cart.get("hotels", [])
        
        if flights and hotels:
            flight_id = flights[0].get("flight_number", "unknown_flight")
            hotel_id = hotels[0].get("name", "unknown_hotel")
            
            dependencies[f"hotel_{hotel_id}"] = {
                "depends_on": f"flight_{flight_id}",
                "relationship": "arrival_location",
                "description": "Hotel location depends on flight arrival"
            }
        
        # Track hotel to activity dependencies
        activities = cart.get("activities", [])
        
        if hotels and activities:
            hotel_id = hotels[0].get("name", "unknown_hotel")
            
            for activity in activities:
                activity_id = activity.get("name", "unknown_activity")
                dependencies[f"activity_{activity_id}"] = {
                    "depends_on": f"hotel_{hotel_id}",
                    "relationship": "proximity",
                    "description": "Activity location influenced by hotel location"
                }
        
        # Save dependencies to state
        state["cart_dependencies"] = dependencies
        
        logger.info(f"Tracked {len(dependencies)} cart dependencies")
    
    def _modify_cart_item(self, state: ConversationState, item_type: str, item_id: str, new_item: Dict[str, Any]):
        """Modify a specific cart item and update dependencies"""
        cart = state["shopping_cart"]
        
        if item_type == "flights":
            flights = cart.get("flights", [])
            for i, flight in enumerate(flights):
                if flight.get("flight_number") == item_id:
                    flights[i] = new_item
                    break
        elif item_type == "hotels":
            hotels = cart.get("hotels", [])
            for i, hotel in enumerate(hotels):
                if hotel.get("name") == item_id:
                    hotels[i] = new_item
                    break
        elif item_type == "activities":
            activities = cart.get("activities", [])
            for i, activity in enumerate(activities):
                if activity.get("name") == item_id:
                    activities[i] = new_item
                    break
        
        # Update cart version
        cart["version"] = cart.get("version", 1) + 1
        
        # Recalculate total cost
        cart["total_cost"] = self._calculate_total_cost(cart)
        
        # Update dependencies
        self._track_cart_dependencies(state, cart)
        
        logger.info(f"Modified {item_type} item: {item_id}")
    
    def _remove_cart_item(self, state: ConversationState, item_type: str, item_id: str):
        """Remove a specific cart item and update dependencies"""
        cart = state["shopping_cart"]
        
        if item_type == "flights":
            flights = cart.get("flights", [])
            cart["flights"] = [f for f in flights if f.get("flight_number") != item_id]
        elif item_type == "hotels":
            hotels = cart.get("hotels", [])
            cart["hotels"] = [h for h in hotels if h.get("name") != item_id]
        elif item_type == "activities":
            activities = cart.get("activities", [])
            cart["activities"] = [a for a in activities if a.get("name") != item_id]
        
        # Update cart version
        cart["version"] = cart.get("version", 1) + 1
        
        # Recalculate total cost
        cart["total_cost"] = self._calculate_total_cost(cart)
        
        # Update dependencies
        self._track_cart_dependencies(state, cart)
        
        logger.info(f"Removed {item_type} item: {item_id}")
    
    async def _perform_safety_checkpoint(self, state: ConversationState, cart: Dict[str, Any]) -> Dict[str, Any]:
        """Perform safety checkpoint for automation level 4 bookings"""
        issues = []
        
        # Check budget compliance
        total_cost = cart.get("total_cost", 0)
        budget = state["user_preferences"].get("budget", 5000)
        
        if total_cost > budget * 1.2:  # 20% over budget
            issues.append(f"Total cost ${total_cost:.2f} is significantly over budget ${budget:.2f}")
        
        # Check for unusual selections
        flights = cart.get("flights", [])
        if flights:
            flight = flights[0]
            if flight.get("price", 0) > budget * 0.7:  # Flight costs over 70% of budget
                issues.append(f"Flight cost ${flight.get('price', 0):.2f} is unusually high")
        
        hotels = cart.get("hotels", [])
        if hotels:
            hotel = hotels[0]
            if hotel.get("total_cost", 0) > budget * 0.6:  # Hotel costs over 60% of budget
                issues.append(f"Hotel cost ${hotel.get('total_cost', 0):.2f} is unusually high")
        
        # Check for missing payment information (mock check)
        if not state["user_preferences"].get("payment_method"):
            issues.append("No payment method configured")
        
        # Check for travel document requirements
        destination = state["user_preferences"].get("destination", "")
        if destination and not state["user_preferences"].get("passport_verified"):
            issues.append("Travel documents not verified for international travel")
        
        # Determine approval status
        approved = len(issues) == 0
        
        return {
            "approved": approved,
            "issues": issues,
            "message": "Safety checkpoint passed" if approved else f"Safety checkpoint failed: {', '.join(issues)}",
            "total_cost": total_cost,
            "budget": budget,
            "risk_level": "low" if approved else "high"
        }
    
    async def _book_with_fallback(self, item_type: str, item_data: Dict[str, Any], 
                                 preferences: Dict[str, Any], automation_level: int) -> Dict[str, Any]:
        """Book item using 5-layer fallback system"""
        item_name = item_data.get("name", item_data.get("airline", "Unknown"))
        
        # Layer 1: Primary API (with 3 retries)
        try:
            logger.info(f"Attempting to book {item_type} via primary API: {item_name}")
            
            for attempt in range(3):
                try:
                    result = await self._book_via_primary_api(item_type, item_data, preferences)
                    if result["success"]:
                        return {
                            "status": "success",
                            "method": "primary_api",
                            "confirmation": result["confirmation_number"],
                            "attempts": attempt + 1,
                            "details": result
                        }
                except Exception as e:
                    logger.warning(f"Primary API attempt {attempt + 1} failed: {str(e)}")
                    if attempt < 2:  # Don't sleep on last attempt
                        await asyncio.sleep(2 ** attempt)  # Exponential backoff
        
        except Exception as e:
            logger.error(f"Primary API booking failed: {str(e)}")
        
        # Layer 2: Secondary API
        try:
            logger.info(f"Attempting to book {item_type} via secondary API: {item_name}")
            result = await self._book_via_secondary_api(item_type, item_data, preferences)
            if result["success"]:
                return {
                    "status": "success",
                    "method": "secondary_api",
                    "confirmation": result["confirmation_number"],
                    "attempts": 1,
                    "details": result
                }
        except Exception as e:
            logger.error(f"Secondary API booking failed: {str(e)}")
        
        # Layer 3: Browser Automation
        try:
            logger.info(f"Attempting to book {item_type} via browser automation: {item_name}")
            result = await self._book_via_browser_automation(item_type, item_data, preferences)
            if result["success"]:
                return {
                    "status": "success",
                    "method": "browser_automation",
                    "confirmation": result["confirmation_number"],
                    "attempts": 1,
                    "details": result
                }
        except Exception as e:
            logger.error(f"Browser automation booking failed: {str(e)}")
        
        # Layer 4: Voice Calling (if automation level allows)
        if automation_level >= 3:
            try:
                logger.info(f"Attempting to book {item_type} via voice calling: {item_name}")
                result = await self._book_via_voice_calling(item_type, item_data, preferences)
                if result["success"]:
                    return {
                        "status": "success",
                        "method": "voice_calling",
                        "confirmation": result["confirmation_number"],
                        "attempts": 1,
                        "details": result
                    }
            except Exception as e:
                logger.error(f"Voice calling booking failed: {str(e)}")
        
        # Layer 5: Manual Intervention Required
        logger.warning(f"All automated booking methods failed for {item_type}: {item_name}")
        
        return {
            "status": "failed",
            "method": "manual_required",
            "confirmation": None,
            "attempts": 0,
            "error": f"All automated booking methods failed for {item_type}",
            "manual_booking_info": {
                "item_type": item_type,
                "item_name": item_name,
                "item_data": item_data,
                "suggested_actions": self._generate_manual_booking_suggestions(item_type, item_data)
            }
        }
    
    async def _book_via_primary_api(self, item_type: str, item_data: Dict[str, Any], 
                                   preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Book via primary API (mock implementation)"""
        # This would integrate with actual booking APIs
        await asyncio.sleep(1)  # Simulate API call
        
        # Mock successful booking
        return {
            "success": True,
            "confirmation_number": f"PRIM{item_type.upper()[:3]}{int(time.time()) % 10000}",
            "booking_reference": f"REF{int(time.time()) % 1000000}",
            "price": item_data.get("price", item_data.get("total_cost", 0)),
            "booked_at": time.time()
        }
    
    async def _book_via_secondary_api(self, item_type: str, item_data: Dict[str, Any], 
                                     preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Book via secondary API (mock implementation)"""
        await asyncio.sleep(1.5)  # Simulate API call
        
        # Mock successful booking
        return {
            "success": True,
            "confirmation_number": f"SEC{item_type.upper()[:3]}{int(time.time()) % 10000}",
            "booking_reference": f"REF{int(time.time()) % 1000000}",
            "price": item_data.get("price", item_data.get("total_cost", 0)),
            "booked_at": time.time()
        }
    
    async def _book_via_browser_automation(self, item_type: str, item_data: Dict[str, Any], 
                                          preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Book via browser automation (mock implementation)"""
        await asyncio.sleep(3)  # Simulate browser automation
        
        # Mock successful booking
        return {
            "success": True,
            "confirmation_number": f"BROWSER{item_type.upper()[:3]}{int(time.time()) % 10000}",
            "booking_reference": f"REF{int(time.time()) % 1000000}",
            "price": item_data.get("price", item_data.get("total_cost", 0)),
            "booked_at": time.time(),
            "method_details": "Automated via browser using Playwright + browser-use"
        }
    
    async def _book_via_voice_calling(self, item_type: str, item_data: Dict[str, Any], 
                                     preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Book via voice calling (mock implementation)"""
        await asyncio.sleep(5)  # Simulate voice call
        
        # Mock successful booking
        return {
            "success": True,
            "confirmation_number": f"VOICE{item_type.upper()[:3]}{int(time.time()) % 10000}",
            "booking_reference": f"REF{int(time.time()) % 1000000}",
            "price": item_data.get("price", item_data.get("total_cost", 0)),
            "booked_at": time.time(),
            "method_details": "Booked via AI voice agent using Twilio + ElevenLabs"
        }
    
    def _generate_manual_next_actions(self, failed_items: List[str]) -> List[Dict[str, Any]]:
        """Generate manual next actions for failed bookings"""
        actions = []
        
        for item in failed_items:
            if item == "flights":
                actions.append({
                    "item": "flights",
                    "action": "manual_flight_booking",
                    "description": "Book flights manually through airline website or travel agent",
                    "priority": "high",
                    "estimated_time": "15-30 minutes"
                })
            elif item == "hotels":
                actions.append({
                    "item": "hotels",
                    "action": "manual_hotel_booking",
                    "description": "Book hotel manually through hotel website or booking platform",
                    "priority": "high",
                    "estimated_time": "10-20 minutes"
                })
            elif item == "activities":
                actions.append({
                    "item": "activities",
                    "action": "manual_activity_booking",
                    "description": "Book activities manually through tour operator or local vendor",
                    "priority": "medium",
                    "estimated_time": "5-15 minutes per activity"
                })
        
        return actions
    
    def _generate_manual_booking_suggestions(self, item_type: str, item_data: Dict[str, Any]) -> List[str]:
        """Generate manual booking suggestions"""
        suggestions = []
        
        if item_type == "flights":
            airline = item_data.get("airline", "")
            suggestions.extend([
                f"Visit {airline} official website for direct booking",
                "Call airline reservation line for phone booking",
                "Use travel agent for complex itinerary booking",
                "Check alternative airlines for similar routes"
            ])
        elif item_type == "hotels":
            hotel_name = item_data.get("name", "")
            suggestions.extend([
                f"Visit {hotel_name} official website for direct booking",
                "Call hotel directly for phone reservation",
                "Use booking platforms like Booking.com or Expedia",
                "Check for alternative hotels in the same area"
            ])
        elif item_type == "activities":
            activity_name = item_data.get("name", "")
            suggestions.extend([
                f"Search for {activity_name} tour operators online",
                "Contact local tourism office for recommendations",
                "Use activity booking platforms like Viator or GetYourGuide",
                "Book directly with activity provider"
            ])
        
        return suggestions
    
    async def _create_personalized_itinerary(self, state: ConversationState, cart: Dict[str, Any], 
                                           preferences: Dict[str, Any], booking_status: Dict[str, Any]) -> Dict[str, Any]:
        """Create a comprehensive personalized itinerary"""
        destination = preferences.get("destination", "Your Destination")
        start_date = preferences.get("start_date", "TBD")
        end_date = preferences.get("end_date", "TBD")
        
        # Base itinerary structure
        itinerary = {
            "title": f"{destination} Travel Itinerary",
            "destination": destination,
            "dates": {
                "start": start_date,
                "end": end_date,
                "duration": self._calculate_trip_duration(preferences)
            },
            "travelers": preferences.get("travelers", 1),
            "budget": {
                "total_budget": preferences.get("budget", 0),
                "total_cost": cart.get("total_cost", 0),
                "remaining": preferences.get("budget", 0) - cart.get("total_cost", 0)
            },
            "automation_level": state["automation_level"],
            "created_at": time.time(),
            "booking_confirmations": state["output_data"].get("confirmation_numbers", {}),
            "sections": {}
        }
        
        # Add flight details
        if cart.get("flights"):
            flight = cart["flights"][0]
            itinerary["sections"]["transportation"] = {
                "flights": [{
                    "airline": flight.get("airline", "Unknown"),
                    "flight_number": flight.get("flight_number", "Unknown"),
                    "departure": {
                        "airport": flight.get("departure_airport", "Unknown"),
                        "time": flight.get("departure_time", "Unknown"),
                        "date": start_date
                    },
                    "arrival": {
                        "airport": flight.get("destination_airport", "Unknown"),
                        "time": flight.get("arrival_time", "Unknown"),
                        "date": start_date
                    },
                    "duration": flight.get("duration", "Unknown"),
                    "price": flight.get("price", 0),
                    "confirmation": booking_status.get("flights", {}).get("confirmation", "Pending")
                }]
            }
        
        # Add accommodation details
        if cart.get("hotels"):
            hotel = cart["hotels"][0]
            itinerary["sections"]["accommodation"] = {
                "hotels": [{
                    "name": hotel.get("name", "Unknown"),
                    "address": hotel.get("address", "Unknown"),
                    "type": hotel.get("type", "Hotel"),
                    "rating": hotel.get("rating", 0),
                    "checkin": start_date,
                    "checkout": end_date,
                    "total_cost": hotel.get("total_cost", 0),
                    "amenities": hotel.get("amenities", []),
                    "confirmation": booking_status.get("hotels", {}).get("confirmation", "Pending")
                }]
            }
        
        # Add activities and experiences
        if cart.get("activities"):
            itinerary["sections"]["activities"] = {
                "experiences": []
            }
            
            for activity in cart["activities"]:
                itinerary["sections"]["activities"]["experiences"].append({
                    "name": activity.get("name", "Unknown"),
                    "category": activity.get("category", "Unknown"),
                    "description": activity.get("description", ""),
                    "duration": activity.get("duration", "Unknown"),
                    "price": activity.get("price", 0),
                    "location": activity.get("location", "Unknown"),
                    "confirmation": "Pending"  # Would get from booking status
                })
        
        return itinerary
    
    async def _generate_local_information(self, preferences: Dict[str, Any], cart: Dict[str, Any]) -> Dict[str, Any]:
        """Generate local information and recommendations"""
        destination = preferences.get("destination", "Unknown")
        
        # Use LLM to generate local information
        try:
            system_prompt = f"""Generate helpful local information for travelers visiting {destination}. Include:
1. Local customs and etiquette
2. Currency and payment methods
3. Transportation options
4. Weather and climate information
5. Health and safety tips
6. Cultural highlights
7. Local cuisine recommendations
8. Language tips and common phrases

Return as structured JSON."""
            
            user_prompt = f"""Provide comprehensive local information for {destination} including practical tips, cultural insights, and recommendations for travelers."""
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Parse response or use fallback
            try:
                local_info = json.loads(response.content)
            except:
                local_info = self._generate_fallback_local_info(destination)
            
            return local_info
            
        except Exception as e:
            logger.error(f"Failed to generate local information: {str(e)}")
            return self._generate_fallback_local_info(destination)
    
    def _generate_fallback_local_info(self, destination: str) -> Dict[str, Any]:
        """Generate fallback local information"""
        return {
            "destination": destination,
            "currency": "Local currency (check current rates)",
            "language": "Local language (consider translation apps)",
            "customs": [
                "Research local customs and etiquette",
                "Respect local dress codes",
                "Learn basic greetings in local language"
            ],
            "transportation": [
                "Research local transportation options",
                "Consider ride-sharing apps",
                "Keep emergency contact numbers handy"
            ],
            "safety": [
                "Keep copies of important documents",
                "Inform someone of your travel plans",
                "Research local emergency numbers"
            ],
            "recommendations": [
                "Try local cuisine",
                "Visit cultural landmarks",
                "Interact with locals respectfully"
            ]
        }
    
    async def _generate_packing_list(self, preferences: Dict[str, Any], cart: Dict[str, Any], 
                                   local_info: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized packing list"""
        destination = preferences.get("destination", "Unknown")
        duration = self._calculate_trip_duration(preferences)
        
        # Base packing categories
        packing_list = {
            "essentials": [
                "Passport/ID",
                "Travel insurance documents",
                "Flight confirmations",
                "Hotel reservations",
                "Emergency contact information",
                "Credit cards and cash",
                "Phone charger",
                "Medications"
            ],
            "clothing": [
                f"Clothes for {duration} days",
                "Comfortable walking shoes",
                "Weather-appropriate outerwear",
                "Sleepwear",
                "Underwear and socks"
            ],
            "electronics": [
                "Phone charger",
                "Camera",
                "Portable battery pack",
                "Travel adapter (if international)"
            ],
            "toiletries": [
                "Toothbrush and toothpaste",
                "Shampoo and conditioner",
                "Personal hygiene items",
                "Sunscreen",
                "Any prescription medications"
            ],
            "travel_specific": []
        }
        
        # Add destination-specific items
        if "international" in local_info.get("travel_type", ""):
            packing_list["travel_specific"].extend([
                "Travel adapter",
                "Currency exchange",
                "International phone plan"
            ])
        
        # Add activity-specific items
        activities = cart.get("activities", [])
        activity_categories = [activity.get("category", "").lower() for activity in activities]
        
        if "adventure" in activity_categories:
            packing_list["travel_specific"].append("Hiking boots")
            packing_list["travel_specific"].append("Daypack")
        
        if "cultural" in activity_categories:
            packing_list["travel_specific"].append("Comfortable walking shoes")
            packing_list["travel_specific"].append("Modest clothing for cultural sites")
        
        if "food" in activity_categories:
            packing_list["travel_specific"].append("Antacids (for trying new foods)")
        
        return packing_list
    
    async def _generate_travel_tips(self, preferences: Dict[str, Any], cart: Dict[str, Any], 
                                  local_info: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized travel tips"""
        destination = preferences.get("destination", "Unknown")
        automation_level = preferences.get("automation_level", 1)
        
        tips = {
            "before_you_go": [
                "Check passport expiration date",
                "Research local customs and etiquette",
                "Download offline maps",
                "Notify bank of travel plans",
                "Check weather forecast"
            ],
            "during_travel": [
                "Keep important documents in multiple locations",
                "Stay hydrated",
                "Try local cuisine",
                "Learn basic phrases in local language",
                "Take photos but be respectful"
            ],
            "money_and_payments": [
                "Use credit cards when possible for better exchange rates",
                "Keep some local cash for small vendors",
                "Notify your bank of travel plans",
                "Use ATMs at banks for better rates"
            ],
            "safety": [
                "Keep copies of important documents",
                "Share itinerary with someone at home",
                "Research local emergency numbers",
                "Trust your instincts"
            ],
            "automation_specific": []
        }
        
        # Add automation-level specific tips
        if automation_level >= 3:
            tips["automation_specific"].extend([
                "All bookings were automated - double-check confirmation emails",
                "Contact customer service if any issues arise",
                "Keep booking confirmations easily accessible"
            ])
        
        if automation_level == 4:
            tips["automation_specific"].append("Full automation was used - verify all details before travel")
        
        return tips
    
    async def _generate_pdf_itinerary(self, itinerary: Dict[str, Any]) -> Dict[str, Any]:
        """Generate PDF itinerary document"""
        # This would use @react-pdf/renderer in a real implementation
        # For now, return metadata about the PDF
        
        pdf_filename = f"itinerary_{itinerary['destination'].replace(' ', '_')}_{int(time.time())}.pdf"
        
        return {
            "filename": pdf_filename,
            "generated_at": time.time(),
            "pages": self._estimate_pdf_pages(itinerary),
            "size_estimate": "2-5 MB",
            "download_url": f"/api/download/{pdf_filename}",
            "contains": [
                "Complete itinerary overview",
                "Flight and accommodation details",
                "Activity schedule",
                "Local information and tips",
                "Packing list",
                "Emergency contacts",
                "Maps and directions"
            ]
        }
    
    def _estimate_pdf_pages(self, itinerary: Dict[str, Any]) -> int:
        """Estimate number of pages in PDF"""
        base_pages = 2  # Title and overview
        
        if "transportation" in itinerary.get("sections", {}):
            base_pages += 1
        
        if "accommodation" in itinerary.get("sections", {}):
            base_pages += 1
        
        activities = itinerary.get("sections", {}).get("activities", {}).get("experiences", [])
        if activities:
            base_pages += max(1, len(activities) // 3)  # Activities per page
        
        if "local_information" in itinerary:
            base_pages += 2
        
        if "packing_list" in itinerary:
            base_pages += 1
        
        return base_pages
    
    def _create_trip_summary(self, itinerary: Dict[str, Any], booking_status: Dict[str, Any]) -> Dict[str, Any]:
        """Create a comprehensive trip summary"""
        return {
            "destination": itinerary["destination"],
            "dates": itinerary["dates"],
            "travelers": itinerary["travelers"],
            "total_cost": itinerary["budget"]["total_cost"],
            "budget_status": "within_budget" if itinerary["budget"]["remaining"] >= 0 else "over_budget",
            "booking_summary": {
                "flights": "confirmed" if booking_status.get("flights", {}).get("status") == "success" else "pending",
                "hotels": "confirmed" if booking_status.get("hotels", {}).get("status") == "success" else "pending",
                "activities": "confirmed" if booking_status.get("activities", {}).get("status") == "success" else "pending"
            },
            "automation_level": itinerary["automation_level"],
            "created_at": itinerary["created_at"],
            "pdf_available": True,
            "next_steps": self._generate_next_steps(itinerary, booking_status)
        }
    
    def _generate_next_steps(self, itinerary: Dict[str, Any], booking_status: Dict[str, Any]) -> List[str]:
        """Generate next steps for the traveler"""
        steps = []
        
        # Check booking confirmations
        if booking_status.get("flights", {}).get("status") != "success":
            steps.append("Complete flight booking")
        
        if booking_status.get("hotels", {}).get("status") != "success":
            steps.append("Complete hotel booking")
        
        if booking_status.get("activities", {}).get("status") != "success":
            steps.append("Complete activity bookings")
        
        # General preparation steps
        steps.extend([
            "Download and print your itinerary PDF",
            "Check passport expiration date",
            "Notify bank of travel plans",
            "Purchase travel insurance",
            "Pack according to the provided packing list",
            "Check weather forecast before departure"
        ])
        
        return steps
    
    async def _parallel_search_coordinator(self, state: ConversationState) -> ConversationState:
        """Coordinate parallel execution of all search agents"""
        logger.info("Starting parallel search coordination")
        
        # Initialize parallel search state
        state["parallel_search"] = {
            "status": "running",
            "agents": {
                "flight_agent": {"status": "started", "results": None, "progress": 0},
                "lodging_agent": {"status": "started", "results": None, "progress": 0},
                "activities_agent": {"status": "started", "results": None, "progress": 0}
            },
            "start_time": time.time(),
            "first_results_time": None,
            "completion_time": None
        }
        
        # Emit start of parallel search
        await self._emit_itinerary_update({
            "type": "parallel_search_start",
            "message": "Searching flights, hotels, and activities simultaneously...",
            "parallel_mode": True,
            "agents": ["flight_agent", "lodging_agent", "activities_agent"]
        })
        
        # Create shared context for all agents
        shared_context = {
            "destination": state["user_preferences"].get("destination"),
            "start_date": state["user_preferences"].get("start_date"),
            "end_date": state["user_preferences"].get("end_date"),
            "travelers": state["user_preferences"].get("travelers"),
            "budget": state["user_preferences"].get("budget"),
            "automation_level": state["automation_level"],
            "parallel_mode": True
        }
        
        # Launch parallel searches using asyncio
        async def run_agent_parallel(agent_name: str, agent_func):
            try:
                logger.info(f"Starting parallel {agent_name}")
                
                # Create isolated state for this agent
                agent_state = state.copy()
                agent_state["agent_context"] = shared_context
                agent_state["parallel_agent_name"] = agent_name
                
                # Run the agent
                result_state = await agent_func(agent_state)
                
                # Update parallel search status
                if state["parallel_search"] is not None and isinstance(result_state, dict):
                    state["parallel_search"]["agents"][agent_name]["status"] = "completed"
                    state["parallel_search"]["agents"][agent_name]["results"] = result_state.get("search_results", [])
                    state["parallel_search"]["agents"][agent_name]["progress"] = 100
                
                # Emit agent completion
                await self._emit_itinerary_update({
                    "type": "parallel_agent_complete",
                    "agent": agent_name,
                    "results_count": len(result_state.get("search_results", [])),
                    "message": f"{agent_name.replace('_', ' ').title()} search completed"
                })
                
                logger.info(f"Completed parallel {agent_name}")
                return result_state
                
            except Exception as e:
                logger.error(f"Parallel {agent_name} failed: {str(e)}")
                if state["parallel_search"] is not None:
                    state["parallel_search"]["agents"][agent_name]["status"] = "error"
                    state["parallel_search"]["agents"][agent_name]["error"] = str(e)
                
                await self._emit_itinerary_update({
                    "type": "parallel_agent_error",
                    "agent": agent_name,
                    "error": str(e),
                    "message": f"{agent_name.replace('_', ' ').title()} search failed"
                })
                
                return state
        
        # Execute all agents in parallel
        try:
            flight_task = asyncio.create_task(run_agent_parallel("flight_agent", self._flight_agent))
            lodging_task = asyncio.create_task(run_agent_parallel("lodging_agent", self._lodging_agent))
            activities_task = asyncio.create_task(run_agent_parallel("activities_agent", self._activities_agent))
            
            # Wait for all agents to complete
            flight_result, lodging_result, activities_result = await asyncio.gather(
                flight_task, lodging_task, activities_task, return_exceptions=True
            )
            
            # Update completion time
            state["parallel_search"]["completion_time"] = time.time()
            state["parallel_search"]["status"] = "completed"
            
            # Store results in main state
            state["flight_results"] = flight_result.get("search_results", []) if isinstance(flight_result, dict) else []
            state["lodging_results"] = lodging_result.get("search_results", []) if isinstance(lodging_result, dict) else []
            state["activities_results"] = activities_result.get("search_results", []) if isinstance(activities_result, dict) else []
            
            # Calculate performance metrics
            total_time = state["parallel_search"]["completion_time"] - state["parallel_search"]["start_time"]
            
            await self._emit_itinerary_update({
                "type": "parallel_search_complete",
                "message": f"All searches completed in {total_time:.1f}s",
                "total_time": total_time,
                "results_summary": {
                    "flights": len(state["flight_results"]) if state["flight_results"] else 0,
                    "hotels": len(state["lodging_results"]) if state["lodging_results"] else 0,
                    "activities": len(state["activities_results"]) if state["activities_results"] else 0
                }
            })
            
            logger.info(f"Parallel search completed in {total_time:.1f}s")
            
        except Exception as e:
            logger.error(f"Parallel search coordination failed: {str(e)}")
            state["error"] = f"Parallel search failed: {str(e)}"
            state["parallel_search"]["status"] = "error"
        
        return state
    
    async def _progressive_filter(self, state: ConversationState) -> ConversationState:
        """Apply progressive filtering as results come in"""
        logger.info("Applying progressive filtering to results")
        
        # Get all results
        flight_results = state.get("flight_results", [])
        lodging_results = state.get("lodging_results", [])
        activities_results = state.get("activities_results", [])
        
        # Apply cross-agent filtering
        filtered_results = await self._apply_cross_agent_filtering(
            flight_results or [], lodging_results or [], activities_results or [], dict(state)
        )
        
        # Update state with filtered results
        state["filtered_flight_results"] = filtered_results["flights"]
        state["filtered_lodging_results"] = filtered_results["hotels"]
        state["filtered_activities_results"] = filtered_results["activities"]
        
        # Emit filtering progress
        await self._emit_itinerary_update({
            "type": "progressive_filter_complete",
            "message": "Applied intelligent filtering based on preferences",
            "filtered_counts": {
                "flights": len(filtered_results["flights"]),
                "hotels": len(filtered_results["hotels"]),
                "activities": len(filtered_results["activities"])
            }
        })
        
        return state
    
    async def _results_aggregator(self, state: ConversationState) -> ConversationState:
        """Aggregate and prioritize results for presentation"""
        logger.info("Aggregating results for presentation")
        
        # Get filtered results
        flights = state.get("filtered_flight_results", [])
        hotels = state.get("filtered_lodging_results", [])
        activities = state.get("filtered_activities_results", [])
        
        # Create aggregated results with cross-references
        aggregated_results = {
            "flights": self._prioritize_flights(flights or [], dict(state)),
            "hotels": self._prioritize_hotels(hotels or [], dict(state)),
            "activities": self._prioritize_activities(activities or [], dict(state)),
            "combinations": self._generate_optimal_combinations(flights or [], hotels or [], activities or [], dict(state))
        }
        
        # Store aggregated results
        state["aggregated_results"] = aggregated_results
        
        # Emit aggregation complete
        await self._emit_itinerary_update({
            "type": "results_aggregation_complete",
            "message": "Created optimal travel combinations",
            "best_combinations": aggregated_results["combinations"][:3],
            "ready_for_selection": True
        })
        
        return state