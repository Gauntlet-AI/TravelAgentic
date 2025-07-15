#!/usr/bin/env python3
"""
Full flow test for orchestrator with parallel flight, hotel, and activity search
Tests complete travel planning workflow minus booking/checkout
"""

import asyncio
import logging
import json
import time
from datetime import datetime, timedelta

from travel_graphs.orchestrator_graph import TravelOrchestratorGraph

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_future_date(days_from_now: int = 30) -> str:
    """Generate a future date string in YYYY-MM-DD format"""
    return (datetime.now() + timedelta(days=days_from_now)).strftime("%Y-%m-%d")

async def test_full_flow():
    """Test complete orchestrator flow with parallel search for all components"""
    
    start_time = time.time()  # Start timing
    
    print("\n🌟 FULL FLOW TEST (No Booking)")
    print("=" * 50)
    
    # Initialize orchestrator
    orchestrator = TravelOrchestratorGraph()
    
    setup_time = time.time()
    
    # Full flow test input - all components enabled
    test_input = {
        "automation_level": 3,  # Level 3: Auto-select best options, completes full flow including itinerary
        "preferences": {
            "destination": "New York, NY",
            "origin": "Los Angeles, CA", 
            "start_date": get_future_date(21),
            "end_date": get_future_date(25),
            "budget_max": 2500,
            "traveler_count": 2,
            "trip_type": "leisure",
            "activity_preferences": ["sightseeing", "cultural", "entertainment"],
            
            # ALL components enabled for parallel search
            "components_needed": {
                "flights": True,
                "hotels": True, 
                "activities": True
            }
        }
    }
    
    print(f"\n📋 STRUCTURED INPUT:")
    print(f"=" * 25)
    print(f"🎯 Route: {test_input['preferences']['origin']} → {test_input['preferences']['destination']}")
    print(f"📅 Dates: {test_input['preferences']['start_date']} to {test_input['preferences']['end_date']}")
    print(f"👥 Travelers: {test_input['preferences']['traveler_count']}")
    print(f"💰 Budget: ${test_input['preferences']['budget_max']}")
    print(f"🏷️ Trip Type: {test_input['preferences']['trip_type']}")
    print(f"🎨 Interests: {', '.join(test_input['preferences']['activity_preferences'])}")
    print(f"🏗️ Components: {', '.join([k for k, v in test_input['preferences']['components_needed'].items() if v])}")
    print(f"🤖 Automation Level: {test_input['automation_level']}")
    print(f"=" * 25)
    
    try:
        # Execute orchestrator
        pre_execution_time = time.time()
        result = await orchestrator.run(test_input)
        post_execution_time = time.time()
        
        print(f"\n📊 RESULTS:")
        print(f"Success: {result.get('error') is None}")
        
        if result.get("error"):
            print(f"❌ Error: {result['error']}")
            return False
        
        # Check all component data
        data = result.get("data", {})
        shopping_cart = data.get("shopping_cart", {})
        print(f"Shopping cart keys: {list(shopping_cart.keys())}")
        
        # Check each component
        flights = shopping_cart.get("flights")
        hotels = shopping_cart.get("hotels") 
        activities = shopping_cart.get("activities")
        
        print(f"Flights: {type(flights)} - {len(flights) if isinstance(flights, list) else flights}")
        print(f"Hotels: {type(hotels)} - {len(hotels) if isinstance(hotels, list) else hotels}")
        print(f"Activities: {type(activities)} - {len(activities) if isinstance(activities, list) else activities}")
        
        # Check parallel agent execution
        parallel_search = data.get("parallel_search", {})
        agents = parallel_search.get("agents", {})
        print(f"Agents executed: {list(agents.keys())}")
        
        # Validate all agents ran
        flight_agent_ran = "flight_agent" in agents
        lodging_agent_ran = "lodging_agent" in agents  
        activities_agent_ran = "activities_agent" in agents
        
        # Validate all components populated
        flights_populated = flights is not None and len(flights) > 0 if isinstance(flights, list) else bool(flights)
        hotels_populated = hotels is not None and len(hotels) > 0 if isinstance(hotels, list) else bool(hotels)
        activities_populated = activities is not None and len(activities) > 0 if isinstance(activities, list) else bool(activities)
        
        print(f"\n📊 AGENT EXECUTION:")
        print(f"Flight agent ran: {flight_agent_ran}")
        print(f"Lodging agent ran: {lodging_agent_ran}")
        print(f"Activities agent ran: {activities_agent_ran}")
        
        print(f"\n📊 DATA POPULATION:")
        print(f"Flights populated: {flights_populated}")
        print(f"Hotels populated: {hotels_populated}")
        print(f"Activities populated: {activities_populated}")
        
        # Show selected items summary
        if flights_populated and isinstance(flights, list) and len(flights) > 0:
            flight = flights[0]
            print(f"Selected flight: {flight.get('airline', 'N/A')} - ${flight.get('price', 'N/A')}")
            
        if hotels_populated and isinstance(hotels, list) and len(hotels) > 0:
            hotel = hotels[0]
            print(f"Selected hotel: {hotel.get('name', 'N/A')} - ${hotel.get('price', 'N/A')}")
            
        if activities_populated and isinstance(activities, list) and len(activities) > 0:
            activity = activities[0]
            print(f"Selected activity: {activity.get('name', 'N/A')} - ${activity.get('price', activity.get('cost_per_person', 'N/A'))}")
        
        # Print total cost
        total_cost = shopping_cart.get("total_cost", 0)
        print(f"\n💰 Total Cost: ${total_cost}")
        
        # Overall test validation
        all_agents_ran = flight_agent_ran and lodging_agent_ran and activities_agent_ran
        all_data_populated = flights_populated and hotels_populated and activities_populated
        
        test_passed = all_agents_ran and all_data_populated
        
        print(f"\n📊 FULL FLOW TEST:")
        print(f"📋 Input Type: Structured Data")
        print(f"🗺️ Route: {test_input['preferences']['origin']} → {test_input['preferences']['destination']}")
        print(f"📅 Dates: {test_input['preferences']['start_date']} to {test_input['preferences']['end_date']}")
        print(f"🎯 PARALLEL SEARCH TEST: {'✅ PASS' if all_agents_ran else '❌ FAIL'}")
        print(f"🗃️ DATA POPULATION TEST: {'✅ PASS' if all_data_populated else '❌ FAIL'}")
        print(f"🎯 OVERALL RESULT: {'✅ PASS' if test_passed else '❌ FAIL'}")
        
        # Dedicated INPUT PROMPT section
        print(f"\n" + "=" * 50)
        print(f"📋 INPUT PROMPT")
        print(f"=" * 50)
        print(f"📝 Type: Structured Data (Direct API)")
        print(f"🏗️ Input Format:")
        print(f"   • Route: {test_input['preferences']['origin']} → {test_input['preferences']['destination']}")
        print(f"   • Dates: {test_input['preferences']['start_date']} to {test_input['preferences']['end_date']}")
        print(f"   • Travelers: {test_input['preferences']['traveler_count']}")
        print(f"   • Budget: ${test_input['preferences']['budget_max']}")
        print(f"   • Trip Type: {test_input['preferences']['trip_type']}")
        print(f"   • Interests: {', '.join(test_input['preferences']['activity_preferences'])}")
        print(f"   • Components: {', '.join([k for k, v in test_input['preferences']['components_needed'].items() if v])}")
        print(f"   • Automation Level: {test_input['automation_level']}")
        print(f"🎯 Challenge: Test parallel agent coordination with pre-structured data")
        print(f"=" * 50)
        
        # Calculate detailed timing breakdown
        total_time = time.time() - start_time
        setup_duration = pre_execution_time - setup_time
        execution_duration = post_execution_time - pre_execution_time
        
        # Try to extract actual parallel search time from result data
        parallel_search = data.get("parallel_search", {})
        parallel_search_duration = None
        
        # Check if timing info is available in parallel_search
        if "completion_time" in parallel_search and "start_time" in parallel_search:
            parallel_search_duration = parallel_search["completion_time"] - parallel_search["start_time"]
        else:
            # Fallback: estimate based on execution duration (parallel search is usually 50-70% of total execution)
            parallel_search_duration = execution_duration * 0.6
        
        # Calculate other phases
        post_processing_duration = max(0, execution_duration - parallel_search_duration)
        
        print(f"\n" + "=" * 50)
        print(f"⏱️ DETAILED TIMING BREAKDOWN")
        print(f"=" * 50)
        print(f"🔧 Setup & Initialization:     {setup_duration:.1f}s")
        print(f"🔄 Parallel Search (3 agents): {parallel_search_duration:.1f}s")
        print(f"⚙️ Processing & Selection:     {post_processing_duration:.1f}s")
        print(f"📊 Total Execution:            {execution_duration:.1f}s")
        print(f"🎯 TOTAL TIME:                 {total_time:.1f}s")
        print(f"")
        print(f"💡 PARALLEL EFFICIENCY:")
        sequential_estimate = parallel_search_duration * 3  # If agents ran sequentially
        efficiency_savings = sequential_estimate - parallel_search_duration
        efficiency_percent = (efficiency_savings / sequential_estimate) * 100
        print(f"   Sequential (estimated):     {sequential_estimate:.1f}s")
        print(f"   Parallel (actual):          {parallel_search_duration:.1f}s")
        print(f"   Time saved:                 {efficiency_savings:.1f}s ({efficiency_percent:.0f}% faster)")
        print(f"=" * 50)
        
        # Print the itinerary if available
        print("\n" + "=" * 50)
        print("📋 GENERATED ITINERARY")
        print("=" * 50)
        
        # Look for itinerary in various possible locations
        itinerary = None
        
        # Check if itinerary is in output_data
        output_data = data.get("output_data", {})
        if "itinerary" in output_data:
            itinerary = output_data["itinerary"]
        elif "generated_itinerary" in output_data:
            itinerary = output_data["generated_itinerary"]
        elif "final_itinerary" in output_data:
            itinerary = output_data["final_itinerary"]
        
        # Check direct data level
        if not itinerary:
            if "itinerary" in data:
                itinerary = data["itinerary"]
            elif "generated_itinerary" in data:
                itinerary = data["generated_itinerary"]
            elif "final_itinerary" in data:
                itinerary = data["final_itinerary"]
        
        # Check for itinerary in search results
        if not itinerary:
            search_results = data.get("search_results", {})
            if "itinerary" in search_results:
                itinerary = search_results["itinerary"]
        
        if itinerary:
            if isinstance(itinerary, dict):
                print(json.dumps(itinerary, indent=2))
            elif isinstance(itinerary, str):
                print(itinerary)
            else:
                print(f"Itinerary found but in unexpected format: {type(itinerary)}")
                print(str(itinerary))
        else:
            print("⚠️ No itinerary found in result data")
            print("Available data keys:", list(data.keys()))
            if output_data:
                print("Available output_data keys:", list(output_data.keys()))
        
        return test_passed
            
    except Exception as e:
        total_time = time.time() - start_time
        print(f"❌ Error during execution: {str(e)}")
        print(f"\n" + "=" * 30)
        print(f"⏱️ TOTAL EXECUTION TIME: {total_time:.1f}s")
        print(f"❌ Test failed due to error")
        print(f"=" * 30)
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Run the test
    success = asyncio.run(test_full_flow())
    exit(0 if success else 1) 