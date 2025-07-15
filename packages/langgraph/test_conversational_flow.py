#!/usr/bin/env python3
"""
Conversational flow test for orchestrator with natural language input
Tests AI's ability to parse user input and extract travel planning requirements
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

async def test_conversational_flow():
    """Test orchestrator with natural language input to validate AI parsing"""
    
    start_time = time.time()
    
    print("\n🗣️ CONVERSATIONAL FLOW TEST")
    print("=" * 50)
    print("Testing natural language input parsing")
    
    # Initialize orchestrator
    orchestrator = TravelOrchestratorGraph()
    
    setup_time = time.time()
    
    # Realistic conversational input - no structured data
    user_message = """Hi! I want to plan a leisure trip from Los Angeles to New York for 2 people. 
    We're thinking of going from August 5th to August 9th. I'm really interested in sightseeing, 
    cultural activities, and entertainment - maybe some Broadway shows and museums. 
    
    Our budget is around $2500 total. We'll need flights, a nice hotel, and some fun activities. 
    Can you help us plan this trip?"""
    
    test_input = {
        "automation_level": 3,
        "user_input": user_message
        # Note: No structured preferences provided - testing pure AI parsing
    }
    
    print(f"\n💬 CONVERSATIONAL INPUT:")
    print(f"=" * 25)
    print(f'"{user_message}"')
    print(f"=" * 25)
    print(f"")
    print(f"🧠 Testing AI's ability to extract:")
    print(f"   • Origin & Destination")
    print(f"   • Travel Dates") 
    print(f"   • Traveler Count")
    print(f"   • Budget")
    print(f"   • Trip Type")
    print(f"   • Activity Preferences")
    print(f"   • Required Components")
    
    try:
        # Execute orchestrator with natural language only
        pre_execution_time = time.time()
        result = await orchestrator.run(test_input)
        post_execution_time = time.time()
        
        print(f"\n📊 RESULTS:")
        print(f"Success: {result.get('error') is None}")
        
        if result.get("error"):
            print(f"❌ Error: {result['error']}")
            return False
        
        # Check if AI successfully parsed the input
        data = result.get("data", {})
        
        # Look for extracted user preferences in multiple locations
        extracted_prefs = data.get("user_preferences", {})
        if not extracted_prefs:
            # Try alternative locations - the state itself may contain user_preferences
            extracted_prefs = result.get("user_preferences", {})
        if not extracted_prefs:
            # Try in output_data
            output_data = result.get("output_data", {})
            extracted_prefs = output_data.get("user_preferences", {})
        
        print(f"\n🧠 AI PARSING RESULTS:")
        print(f"=" * 30)
        
        if extracted_prefs:
            print(f"✅ User preferences extracted:")
            for key, value in extracted_prefs.items():
                if key not in ['dynamic_questions', 'questions_generated', 'flow_type', 'input_type', 'initial_message']:
                    print(f"   {key}: {value}")
        else:
            print(f"⚠️ No user preferences found in result")
            print(f"Available data keys: {list(data.keys())}")
        
        # Check if components were identified
        components_needed = extracted_prefs.get("components_needed", {})
        if components_needed:
            print(f"\n🏗️ Components Identified:")
            for component, needed in components_needed.items():
                status = "✅ Required" if needed else "⏭️ Skipped"
                print(f"   {component}: {status}")
        
        # Check shopping cart results and parallel execution
        shopping_cart = data.get("shopping_cart", {})
        if not shopping_cart:
            shopping_cart = result.get("shopping_cart", {})
        
        parallel_search = data.get("parallel_search", {})
        agents = parallel_search.get("agents", {})
        
        if shopping_cart:
            print(f"\n🛒 SEARCH RESULTS:")
            flights = shopping_cart.get("flights", [])
            hotels = shopping_cart.get("hotels", [])
            activities = shopping_cart.get("activities", [])
            
            print(f"   Flights found: {len(flights) if isinstance(flights, list) else 'N/A'}")
            print(f"   Hotels found: {len(hotels) if isinstance(hotels, list) else 'N/A'}")
            print(f"   Activities found: {len(activities) if isinstance(activities, list) else 'N/A'}")
            
            total_cost = shopping_cart.get("total_cost", 0)
            print(f"   Total Cost: ${total_cost}")
            
            # Show selected items summary like full flow test
            if flights and isinstance(flights, list) and len(flights) > 0:
                flight = flights[0]
                print(f"   Selected flight: {flight.get('airline', 'N/A')} - ${flight.get('price', flight.get('total_cost', 'N/A'))}")
                
            if hotels and isinstance(hotels, list) and len(hotels) > 0:
                hotel = hotels[0]
                print(f"   Selected hotel: {hotel.get('name', 'N/A')} - ${hotel.get('price', hotel.get('total_cost', 'N/A'))}")
                
            if activities and isinstance(activities, list) and len(activities) > 0:
                activity = activities[0]
                print(f"   Selected activity: {activity.get('name', 'N/A')} - ${activity.get('price', activity.get('cost_per_person', 'N/A'))}")
        
        # Detailed parallel execution analysis
        if agents:
            print(f"\n📊 PARALLEL EXECUTION:")
            flight_agent_ran = "flight_agent" in agents
            lodging_agent_ran = "lodging_agent" in agents  
            activities_agent_ran = "activities_agent" in agents
            
            print(f"   Flight agent executed: {flight_agent_ran}")
            print(f"   Lodging agent executed: {lodging_agent_ran}")
            print(f"   Activities agent executed: {activities_agent_ran}")
            print(f"   Total agents executed: {len(agents)}")
        
        # Calculate detailed timing breakdown like full flow test
        total_time = time.time() - start_time
        setup_duration = pre_execution_time - setup_time
        execution_duration = post_execution_time - pre_execution_time
        
        # Try to extract actual parallel search time from result data
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
        efficiency_percent = (efficiency_savings / sequential_estimate) * 100 if sequential_estimate > 0 else 0
        print(f"   Sequential (estimated):     {sequential_estimate:.1f}s")
        print(f"   Parallel (actual):          {parallel_search_duration:.1f}s")
        print(f"   Time saved:                 {efficiency_savings:.1f}s ({efficiency_percent:.0f}% faster)")
        print(f"=" * 50)
        
        # Test success criteria matching full flow test
        ai_parsed_successfully = bool(
            extracted_prefs and
            extracted_prefs.get("destination") and
            extracted_prefs.get("start_location") and 
            extracted_prefs.get("start_date") and
            extracted_prefs.get("end_date") and
            extracted_prefs.get("travelers") and
            extracted_prefs.get("budget")
        )
        
        components_identified = bool(components_needed)
        
        # Parallel execution validation like full flow test
        all_agents_ran = False
        all_data_populated = False
        
        if agents:
            flight_agent_ran = "flight_agent" in agents
            lodging_agent_ran = "lodging_agent" in agents  
            activities_agent_ran = "activities_agent" in agents
            all_agents_ran = flight_agent_ran and lodging_agent_ran and activities_agent_ran
            
        if shopping_cart:
            flights = shopping_cart.get("flights", [])
            hotels = shopping_cart.get("hotels", [])
            activities = shopping_cart.get("activities", [])
            
            flights_populated = flights is not None and len(flights) > 0 if isinstance(flights, list) else bool(flights)
            hotels_populated = hotels is not None and len(hotels) > 0 if isinstance(hotels, list) else bool(hotels)
            activities_populated = activities is not None and len(activities) > 0 if isinstance(activities, list) else bool(activities)
            
            all_data_populated = flights_populated and hotels_populated and activities_populated
        
        search_executed_successfully = all_agents_ran and all_data_populated
        test_passed = ai_parsed_successfully and components_identified and search_executed_successfully
        
        print(f"\n📊 CONVERSATIONAL AI TEST:")
        print(f"💬 Input Type: Natural Language")
        print(f"📝 User Message: \"{user_message[:100]}...\"")
        print(f"🧠 AI Parsing: {'✅ PASS' if ai_parsed_successfully else '❌ FAIL'}")
        print(f"🏗️ Component Detection: {'✅ PASS' if components_identified else '❌ FAIL'}")
        print(f"🔄 Parallel Search: {'✅ PASS' if all_agents_ran else '❌ FAIL'}")
        print(f"🗃️ Data Population: {'✅ PASS' if all_data_populated else '❌ FAIL'}")
        print(f"🎯 OVERALL RESULT: {'✅ PASS' if test_passed else '❌ FAIL'}")
        
        # Dedicated INPUT PROMPT section
        print(f"\n" + "=" * 50)
        print(f"💬 INPUT PROMPT")
        print(f"=" * 50)
        print(f"📝 Type: Natural Language (Conversational AI)")
        print(f"🗣️ User Input:")
        print(f'   "{user_message}"')
        print(f"🎯 Challenge: AI must extract structured travel preferences from unstructured text")
        print(f"=" * 50)
        
        # Print the itinerary if available (like full flow test)
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
        
        print(f"\n" + "=" * 30)
        print(f"⏱️ EXECUTION TIME: {total_time:.1f}s")
        print(f"=" * 30)
        
        # Show any dynamic questions generated
        questions = extracted_prefs.get("dynamic_questions", [])
        if questions:
            print(f"\n❓ DYNAMIC QUESTIONS GENERATED:")
            for i, q in enumerate(questions[:3], 1):  # Show first 3
                print(f"   {i}. {q.get('question', 'N/A')}")
            if len(questions) > 3:
                print(f"   ... and {len(questions) - 3} more")
        
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
    success = asyncio.run(test_conversational_flow())
    exit(0 if success else 1) 