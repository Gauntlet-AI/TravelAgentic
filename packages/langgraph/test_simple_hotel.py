#!/usr/bin/env python3
"""
Simple focused test for orchestrator -> lodging agent flow
Quick debugging of core hotel functionality
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

async def test_simple_hotel():
    """Test basic orchestrator -> lodging agent flow"""
    
    print("\n🏨 SIMPLE HOTEL TEST")
    print("=" * 40)
    
    # Initialize orchestrator
    orchestrator = TravelOrchestratorGraph()
    
    # Simple test input - hotels only (like a local trip where user already has transportation)
    test_input = {
        "automation_level": 3,
        "preferences": {
            "destination": "New York City", 
            "start_date": get_future_date(30),
            "end_date": get_future_date(33),
            "travelers": 2,
            "budget": 1200,
            "origin": "New York City",  # Local trip - already in destination city
            "components_needed": {
                "flights": False,
                "hotels": True,
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
        
        # Check hotels specifically
        hotels = shopping_cart.get("hotels")
        print(f"Hotels: {type(hotels)} - {hotels}")
        
        # Check if lodging agent ran
        parallel_search = data.get("parallel_search", {})
        agents = parallel_search.get("agents", {})
        print(f"Agents executed: {list(agents.keys())}")
        
        # Simple validation
        lodging_agent_ran = "lodging_agent" in agents
        hotels_populated = hotels is not None and len(hotels) > 0 if isinstance(hotels, list) else False
        
        print(f"\n✅ Lodging agent ran: {lodging_agent_ran}")
        print(f"✅ Hotels populated: {hotels_populated}")
        
        success = lodging_agent_ran and hotels_populated  # Check both agent ran and data populated
        
        print(f"\n🎯 OVERALL: {'PASS' if success else 'FAIL'}")
        return success
        
    except Exception as e:
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_simple_hotel())
    exit(0 if success else 1) 