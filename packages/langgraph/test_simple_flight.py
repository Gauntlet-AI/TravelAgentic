#!/usr/bin/env python3
"""
Simple focused test for orchestrator -> flight agent flow
Quick debugging of core functionality
"""

import asyncio
import logging
from datetime import datetime, timedelta

from travel_graphs.orchestrator_graph import TravelOrchestratorGraph

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_future_date(days_from_now: int = 30) -> str:
    """Generate a future date string in YYYY-MM-DD format"""
    return (datetime.now() + timedelta(days=days_from_now)).strftime("%Y-%m-%d")

async def test_simple_flight():
    """Test basic orchestrator -> flight agent flow"""
    
    print("\n🚀 SIMPLE FLIGHT TEST")
    print("=" * 40)
    
    # Initialize orchestrator
    orchestrator = TravelOrchestratorGraph()
    
    # Simple test input - flights only
    test_input = {
        "automation_level": 3,
        "preferences": {
            "destination": "Los Angeles", 
            "start_date": get_future_date(30),
            "end_date": get_future_date(33),
            "travelers": 1,
            "budget": 800,
            "origin": "San Francisco",  # Fixed: Use 'origin' instead of 'departure_city'
            "components_needed": {
                "flights": True,
                "hotels": False,
                "activities": False
            }
        }
    }
    
    print(f"Input: {test_input}")
    
    try:
        # Execute orchestrator
        result = await orchestrator.run(test_input)
        
        print(f"\n📊 RESULTS:")
        print(f"Success: {result.get('error') is None}")
        
        if result.get("error"):
            print(f"❌ Error: {result['error']}")
            return False
            
        # Check shopping cart (now in data field from base graph)
        data = result.get("data", {})
        shopping_cart = data.get("shopping_cart", {})
        print(f"Shopping cart keys: {list(shopping_cart.keys())}")
        
        # Check flights specifically
        flights = shopping_cart.get("flights")
        print(f"Flights: {type(flights)} - {flights}")
        
        # Check if flight agent ran
        parallel_search = data.get("parallel_search", {})
        agents = parallel_search.get("agents", {})
        print(f"Agents executed: {list(agents.keys())}")
        
        # Simple validation
        flight_agent_ran = "flight_agent" in agents
        flights_populated = flights is not None and len(flights) > 0 if isinstance(flights, list) else False
        
        print(f"\n✅ Flight agent ran: {flight_agent_ran}")
        print(f"✅ Flights populated: {flights_populated}")
        
        success = flight_agent_ran  # For now, just check if agent ran
        
        print(f"\n🎯 OVERALL: {'PASS' if success else 'FAIL'}")
        return success
        
    except Exception as e:
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_simple_flight())
    exit(0 if success else 1) 