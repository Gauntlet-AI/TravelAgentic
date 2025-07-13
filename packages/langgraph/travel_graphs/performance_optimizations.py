"""
Performance optimization methods for TravelAgentic LangGraph
Includes parallel execution, progressive filtering, and smart context sharing
"""

import asyncio
import logging
import time
from typing import Dict, Any, List, Optional, Tuple
import json

logger = logging.getLogger(__name__)

class PerformanceOptimizationMixin:
    """Mixin class providing performance optimization methods for TravelOrchestratorGraph"""
    
    # ========================================
    # PARALLEL EXECUTION METHODS
    # ========================================
    
    async def _apply_cross_agent_filtering(self, flight_results: List[Dict[str, Any]], 
                                         lodging_results: List[Dict[str, Any]], 
                                         activities_results: List[Dict[str, Any]], 
                                         state: Dict[str, Any]) -> Dict[str, Any]:
        """Apply intelligent cross-agent filtering to optimize results"""
        logger.info("Applying cross-agent filtering")
        
        preferences = state.get("user_preferences", {})
        budget = preferences.get("budget", 5000)
        
        # Filter flights by budget and preferences
        filtered_flights = self._filter_flights_by_preferences(flight_results, preferences, budget)
        
        # Filter hotels based on flight arrival information
        filtered_hotels = self._filter_hotels_by_flight_context(
            lodging_results, filtered_flights, preferences
        )
        
        # Filter activities based on hotel location and interests
        filtered_activities = self._filter_activities_by_location_context(
            activities_results, filtered_hotels, preferences
        )
        
        return {
            "flights": filtered_flights,
            "hotels": filtered_hotels,
            "activities": filtered_activities
        }
    
    def _filter_flights_by_preferences(self, flights: List[Dict[str, Any]], 
                                     preferences: Dict[str, Any], 
                                     budget: float) -> List[Dict[str, Any]]:
        """Filter flights based on user preferences and budget"""
        if not flights:
            return []
        
        filtered = []
        max_flight_budget = budget * 0.4  # 40% of budget for flights
        
        for flight in flights:
            # Budget filter
            flight_price = flight.get("price", {}).get("amount", 0) if isinstance(flight.get("price"), dict) else flight.get("price", 0)
            if flight_price > max_flight_budget:
                continue
                
            # Preference filters
            flight_preferences = preferences.get("flight_preferences", {})
            
            # Airline preference
            if "preferred_airline" in flight_preferences:
                if flight.get("airline") != flight_preferences["preferred_airline"]:
                    continue
            
            # Stops preference
            if flight_preferences.get("nonstop_only", False):
                if flight.get("stops", 0) > 0:
                    continue
            
            # Class preference
            if "class" in flight_preferences:
                if flight.get("class") != flight_preferences["class"]:
                    continue
            
            filtered.append(flight)
        
        # Sort by price and rating
        filtered.sort(key=lambda x: (x.get("price", {}).get("amount", 0) if isinstance(x.get("price"), dict) else x.get("price", 0), -x.get("rating", 0)))
        
        return filtered[:5]  # Return top 5
    
    def _filter_hotels_by_flight_context(self, hotels: List[Dict[str, Any]], 
                                       flights: List[Dict[str, Any]], 
                                       preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Filter hotels based on flight arrival context"""
        if not hotels or not flights:
            return hotels[:5] if hotels else []
        
        filtered = []
        best_flight = flights[0] if flights else None
        
        if best_flight:
            arrival_airport = best_flight.get("destination_airport", "")
            arrival_time = best_flight.get("arrival_time", "")
            
            for hotel in hotels:
                # Distance from airport
                if arrival_airport and hotel.get("airport_distance_km", 100) > 50:
                    continue
                
                # Check-in time compatibility
                if arrival_time and hotel.get("checkin_time", "15:00") < arrival_time:
                    hotel["arrival_compatible"] = True
                
                # Budget filter
                hotel_budget = preferences.get("budget", 5000) * 0.35  # 35% for hotels
                hotel_price = hotel.get("priceBreakdown", {}).get("total", 0) if hotel.get("priceBreakdown") else hotel.get("price", {}).get("amount", 0) if hotel.get("price") else 0
                if hotel_price > hotel_budget:
                    continue
                
                filtered.append(hotel)
        
        # Sort by distance to airport and rating
        filtered.sort(key=lambda x: (x.get("airport_distance_km", 100), -x.get("rating", 0)))
        
        return filtered[:5]
    
    def _filter_activities_by_location_context(self, activities: List[Dict[str, Any]], 
                                             hotels: List[Dict[str, Any]], 
                                             preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Filter activities based on hotel location and user interests"""
        if not activities:
            return []
        
        filtered = []
        best_hotel = hotels[0] if hotels else None
        interests = preferences.get("interests", [])
        
        for activity in activities:
            # Location proximity to hotel
            if best_hotel:
                hotel_location = best_hotel.get("location", {})
                activity_location = activity.get("location", {})
                
                # Simple distance check (in real implementation, use proper geolocation)
                if self._calculate_distance(hotel_location, activity_location) > 20:  # 20km
                    continue
            
            # Interest matching
            if interests:
                activity_categories = activity.get("categories", [])
                if not any(interest in activity_categories for interest in interests):
                    continue
            
            # Budget filter
            activity_budget = preferences.get("budget", 5000) * 0.25  # 25% for activities
            if activity.get("price", 0) > activity_budget:
                continue
            
            filtered.append(activity)
        
        # Sort by rating and relevance
        filtered.sort(key=lambda x: (-x.get("rating", 0), x.get("price", 0)))
        
        return filtered[:10]
    
    def _calculate_distance(self, location1: Dict[str, Any], location2: Dict[str, Any]) -> float:
        """Calculate distance between two locations (simplified)"""
        # In real implementation, use proper geolocation calculation
        lat1 = location1.get("lat", 0)
        lon1 = location1.get("lon", 0)
        lat2 = location2.get("lat", 0)
        lon2 = location2.get("lon", 0)
        
        # Simple Euclidean distance (replace with haversine formula)
        return ((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2) ** 0.5
    
    # ========================================
    # PRIORITIZATION METHODS
    # ========================================
    
    def _prioritize_flights(self, flights: List[Dict[str, Any]], 
                           state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Prioritize flights based on user preferences and smart ranking"""
        if not flights:
            return []
        
        preferences = state.get("user_preferences", {})
        automation_level = state.get("automation_level", 1)
        
        # Calculate priority scores for each flight
        for flight in flights:
            score = 0
            
            # Price factor (lower is better)
            flight_price = flight.get("price", {}).get("amount", 1000) if isinstance(flight.get("price"), dict) else flight.get("price", 1000)
            price_factor = 1.0 - (flight_price / 2000)  # Normalize to 0-1
            score += price_factor * 0.3
            
            # Duration factor (shorter is better)
            duration_hours = flight.get("duration_hours", 10)
            duration_factor = 1.0 - min(duration_hours / 20, 1.0)  # Normalize to 0-1
            score += duration_factor * 0.2
            
            # Stops factor (fewer is better)
            stops = flight.get("stops", 0)
            stops_factor = 1.0 - min(stops / 3, 1.0)
            score += stops_factor * 0.2
            
            # Rating factor
            rating = flight.get("rating", 3.0)
            rating_factor = rating / 5.0
            score += rating_factor * 0.2
            
            # Preference matching
            flight_prefs = preferences.get("flight_preferences", {})
            if flight.get("airline") in flight_prefs.get("preferred_airlines", []):
                score += 0.1
            
            flight["priority_score"] = score
        
        # Sort by priority score
        flights.sort(key=lambda x: x.get("priority_score", 0), reverse=True)
        
        return flights
    
    def _prioritize_hotels(self, hotels: List[Dict[str, Any]], 
                          state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Prioritize hotels based on user preferences and context"""
        if not hotels:
            return []
        
        preferences = state.get("user_preferences", {})
        
        for hotel in hotels:
            score = 0
            
            # Price factor
            hotel_price = hotel.get("priceBreakdown", {}).get("total", 200) if hotel.get("priceBreakdown") else hotel.get("price", {}).get("amount", 200) if hotel.get("price") else 200
            price_factor = 1.0 - (hotel_price / 500)  # Normalize
            score += price_factor * 0.25
            
            # Rating factor
            rating = hotel.get("rating", 3.0)
            rating_factor = rating / 5.0
            score += rating_factor * 0.3
            
            # Location factor (proximity to attractions)
            location_score = hotel.get("location_score", 0.5)
            score += location_score * 0.2
            
            # Amenities matching
            desired_amenities = preferences.get("hotel_amenities", [])
            hotel_amenities = hotel.get("amenities", [])
            amenity_match = len(set(desired_amenities) & set(hotel_amenities)) / max(len(desired_amenities), 1)
            score += amenity_match * 0.15
            
            # Airport distance factor
            airport_distance = hotel.get("airport_distance_km", 50)
            distance_factor = 1.0 - min(airport_distance / 100, 1.0)
            score += distance_factor * 0.1
            
            hotel["priority_score"] = score
        
        hotels.sort(key=lambda x: x.get("priority_score", 0), reverse=True)
        
        return hotels
    
    def _prioritize_activities(self, activities: List[Dict[str, Any]], 
                              state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Prioritize activities based on interests and context"""
        if not activities:
            return []
        
        preferences = state.get("user_preferences", {})
        interests = preferences.get("interests", [])
        
        for activity in activities:
            score = 0
            
            # Interest matching
            activity_categories = activity.get("categories", [])
            interest_match = len(set(interests) & set(activity_categories)) / max(len(interests), 1)
            score += interest_match * 0.4
            
            # Rating factor
            rating = activity.get("rating", 3.0)
            rating_factor = rating / 5.0
            score += rating_factor * 0.3
            
            # Price factor
            price = activity.get("price", 100)
            price_factor = 1.0 - (price / 300)  # Normalize
            score += price_factor * 0.2
            
            # Popularity factor
            popularity = activity.get("popularity_score", 0.5)
            score += popularity * 0.1
            
            activity["priority_score"] = score
        
        activities.sort(key=lambda x: x.get("priority_score", 0), reverse=True)
        
        return activities
    
    # ========================================
    # SMART CONTEXT SHARING
    # ========================================
    
    async def _create_shared_context(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Create shared context for all agents"""
        preferences = state.get("user_preferences", {})
        
        # Get destination information
        destination_context = await self._get_destination_context(preferences.get("destination", ""))
        
        # Calculate budget distribution
        budget_distribution = self._calculate_budget_distribution(preferences.get("budget", 5000))
        
        # Create shared context
        shared_context = {
            "destination_info": destination_context,
            "budget_distribution": budget_distribution,
            "user_preferences": preferences,
            "automation_level": state.get("automation_level", 1),
            "travelers": preferences.get("travelers", 1),
            "travel_dates": {
                "start": preferences.get("start_date", ""),
                "end": preferences.get("end_date", "")
            },
            "context_timestamp": time.time()
        }
        
        return shared_context
    
    async def _get_destination_context(self, destination: str) -> Dict[str, Any]:
        """Get rich context about the destination"""
        # In real implementation, fetch from external APIs
        # For now, return mock data
        return {
            "city": destination,
            "country": "Unknown",
            "timezone": "UTC",
            "currency": "USD",
            "popular_areas": ["Downtown", "Airport Area", "Tourist District"],
            "main_airport": f"{destination[:3].upper()}",
            "weather_season": "temperate",
            "popular_activities": ["sightseeing", "dining", "shopping"],
            "transportation": ["taxi", "public_transport", "rental_car"]
        }
    
    def _calculate_budget_distribution(self, total_budget: float) -> Dict[str, float]:
        """Calculate smart budget distribution across categories"""
        return {
            "flights": total_budget * 0.40,      # 40% for flights
            "accommodation": total_budget * 0.35, # 35% for hotels
            "activities": total_budget * 0.20,    # 20% for activities
            "meals": total_budget * 0.05,         # 5% for meals/misc
            "total": total_budget
        }
    
    # ========================================
    # RESULTS AGGREGATION
    # ========================================
    
    def _generate_optimal_combinations(self, flights: List[Dict[str, Any]], 
                                     hotels: List[Dict[str, Any]], 
                                     activities: List[Dict[str, Any]], 
                                     state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate optimal combinations of flights, hotels, and activities"""
        combinations = []
        
        # Take top 3 flights, top 3 hotels, top 5 activities
        top_flights = flights[:3]
        top_hotels = hotels[:3]
        top_activities = activities[:5]
        
        for flight in top_flights:
            for hotel in top_hotels:
                # Calculate compatibility score
                compatibility = self._calculate_compatibility(flight, hotel, state)
                
                # Select best activities for this combination
                best_activities = self._select_best_activities_for_combination(
                    flight, hotel, top_activities, state
                )
                
                # Calculate total cost
                flight_price = flight.get("price", 0) if flight.get("price") is not None else 0
                hotel_price = hotel.get("priceBreakdown", {}).get("total", 0) if hotel.get("priceBreakdown") else hotel.get("price", {}).get("amount", 0) if hotel.get("price") else 0
                activity_costs = sum(activity.get("price", 0) if activity.get("price") is not None else 0 for activity in best_activities)
                
                total_cost = flight_price + hotel_price + activity_costs
                
                # Create combination
                combination = {
                    "flight": flight,
                    "hotel": hotel,
                    "activities": best_activities,
                    "total_cost": total_cost,
                    "compatibility_score": compatibility,
                    "budget_remaining": state.get("user_preferences", {}).get("budget", 5000) - total_cost
                }
                
                combinations.append(combination)
        
        # Sort by compatibility score and budget efficiency
        combinations.sort(key=lambda x: (x["compatibility_score"], -x["total_cost"]), reverse=True)
        
        return combinations[:5]  # Return top 5 combinations
    
    def _calculate_compatibility(self, flight: Dict[str, Any], hotel: Dict[str, Any], 
                               state: Dict[str, Any]) -> float:
        """Calculate compatibility score between flight and hotel"""
        score = 0.0
        
        # Airport distance factor
        airport_distance = hotel.get("airport_distance_km", 50)
        distance_score = 1.0 - min(airport_distance / 100, 1.0)
        score += distance_score * 0.4
        
        # Arrival time compatibility
        arrival_time = flight.get("arrival_time", "")
        checkin_time = hotel.get("checkin_time", "15:00")
        if arrival_time and checkin_time:
            # Simple time compatibility check
            arrival_hour = int(arrival_time.split(":")[0]) if ":" in arrival_time else 12
            checkin_hour = int(checkin_time.split(":")[0]) if ":" in checkin_time else 15
            
            if arrival_hour <= checkin_hour:
                score += 0.3
            else:
                score += 0.1  # Late arrival penalty
        
        # Price balance factor
        total_budget = state.get("user_preferences", {}).get("budget", 5000)
        flight_price = flight.get("price", 0) if flight.get("price") is not None else 0
        hotel_price = hotel.get("priceBreakdown", {}).get("total", 0) if hotel.get("priceBreakdown") else hotel.get("price", {}).get("amount", 0) if hotel.get("price") else 0
        combined_cost = flight_price + hotel_price
        budget_efficiency = 1.0 - (combined_cost / total_budget) if total_budget > 0 else 0
        score += budget_efficiency * 0.3
        
        return min(score, 1.0)
    
    def _select_best_activities_for_combination(self, flight: Dict[str, Any], 
                                              hotel: Dict[str, Any], 
                                              activities: List[Dict[str, Any]], 
                                              state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Select best activities for a specific flight/hotel combination"""
        if not activities:
            return []
        
        # Filter activities by location proximity to hotel
        hotel_location = hotel.get("location", {})
        nearby_activities = []
        
        for activity in activities:
            activity_location = activity.get("location", {})
            distance = self._calculate_distance(hotel_location, activity_location)
            
            if distance <= 25:  # Within 25km
                activity["distance_to_hotel"] = distance
                nearby_activities.append(activity)
        
        # Sort by rating and distance
        nearby_activities.sort(key=lambda x: (-x.get("rating", 0), x.get("distance_to_hotel", 0)))
        
        # Select top activities within budget
        remaining_budget = state.get("user_preferences", {}).get("budget", 5000) * 0.2  # 20% for activities
        selected_activities = []
        total_activity_cost = 0
        
        for activity in nearby_activities:
            activity_cost = activity.get("price", 0)
            if total_activity_cost + activity_cost <= remaining_budget:
                selected_activities.append(activity)
                total_activity_cost += activity_cost
                
                if len(selected_activities) >= 3:  # Max 3 activities
                    break
        
        return selected_activities
    
    # ========================================
    # PERFORMANCE MONITORING
    # ========================================
    
    def _track_performance_metrics(self, operation: str, start_time: float, 
                                  results_count: int, state: Dict[str, Any]) -> None:
        """Track performance metrics for monitoring"""
        duration = time.time() - start_time
        
        metrics = {
            "operation": operation,
            "duration_seconds": duration,
            "results_count": results_count,
            "automation_level": state.get("automation_level", 1),
            "timestamp": time.time()
        }
        
        logger.info(f"Performance: {operation} completed in {duration:.2f}s with {results_count} results")
        
        # Store metrics in state for monitoring
        if "performance_metrics" not in state:
            state["performance_metrics"] = []
        
        state["performance_metrics"].append(metrics) 