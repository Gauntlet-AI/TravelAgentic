#!/usr/bin/env python3
"""
Test script for TravelAgentic LangGraph Orchestrator via Web Server
Tests the orchestrator through the web server interface
"""

import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any

def get_future_date(days_from_now: int = 30) -> str:
    """Generate a future date string in YYYY-MM-DD format"""
    return (datetime.now() + timedelta(days=days_from_now)).strftime("%Y-%m-%d")

def get_test_dates() -> Dict[str, str]:
    """Generate consistent test dates for flight/hotel searches"""
    departure_date = get_future_date(30)  # 30 days from now
    return_date = get_future_date(37)     # 7 days later
    checkin_date = get_future_date(30)    # Same as departure
    checkout_date = get_future_date(35)   # 5 days later
    
    return {
        "departure_date": departure_date,
        "return_date": return_date,
        "checkin_date": checkin_date,
        "checkout_date": checkout_date,
        "start_date": departure_date,
        "end_date": get_future_date(35)
    }

# Environment variables are passed by Docker Compose from root .env file
# No need to override them here - Docker handles this automatically

from travel_graphs.orchestrator_graph import TravelOrchestratorGraph

async def test_orchestrator():
    """Test the orchestrator graph with sample data"""
    print("🚀 Testing TravelAgentic LangGraph Orchestrator")
    print("=" * 50)
    
    # Create orchestrator instance
    orchestrator = TravelOrchestratorGraph()
    
    # Test data
    test_input = {
        "message": "I want to plan a trip to Los Angeles from New York",
        "automation_level": 4,
        "user_preferences": {
            "destination": "Los Angeles",
            "origin": "New York",
            "start_date": get_test_dates()["start_date"],
            "end_date": get_test_dates()["end_date"],
            "travelers": 2,
            "budget": 3000,
            "travel_style": "leisure",
            "interests": ["beaches", "entertainment", "dining"]
        }
    }
    
    print(f"📝 Input: {json.dumps(test_input, indent=2)}")
    print()
    
    try:
        # Execute orchestrator
        result = await orchestrator.run(test_input)
        
        print("✅ Orchestrator execution completed!")
        print(f"📊 Result keys: {list(result.keys())}")
        
        if "output_data" in result:
            output = result["output_data"]
            print(f"📋 Output data keys: {list(output.keys())}")
            
            # Show some sample data
            if "messages" in output:
                print(f"💬 Generated {len(output['messages'])} messages")
                
            if "shopping_cart" in output:
                cart = output["shopping_cart"]
                print(f"🛒 Shopping cart structure: {list(cart.keys())}")
                
                # Handle component selection - components can be None if not needed
                if "flights" in cart:
                    flights = cart['flights']
                    print(f"   ✈️  Flights: {len(flights) if flights is not None else 'Not requested'}")
                if "hotels" in cart:
                    hotels = cart['hotels']
                    print(f"   🏨 Hotels: {len(hotels) if hotels is not None else 'Not requested'}")
                if "activities" in cart:
                    activities = cart['activities']
                    print(f"   🎯 Activities: {len(activities) if activities is not None else 'Not requested'}")
                    
            if "progress" in output:
                progress = output["progress"]
                print(f"📈 Progress: {progress}")
        
        print(f"⏱️  Execution time: {result.get('execution_time', 0):.2f}s")
        
    except Exception as e:
        print(f"❌ Orchestrator error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print("Test completed!")

async def test_webserver_integration():
    """Test the web server API integration separately"""
    print("\n🧪 Testing Web Server API Integration")
    print("=" * 50)
    
    from travel_graphs.webserver_api_client import webserver_client
    
    # Test flight search
    print("✈️  Testing flight search...")
    flight_params = {
        "origin": "NYC",
        "destination": "LAX",
        "departure_date": get_test_dates()["departure_date"],
        "passengers": 2
    }
    
    try:
        flights = await webserver_client.search_flights(flight_params)
        print(f"Found {len(flights)} flights")
        
        if flights:
            for i, flight in enumerate(flights[:3]):  # Show first 3
                print(f"  {i+1}. {flight.get('airline_name', 'Unknown')} {flight.get('flight_number', '')} - ${flight.get('price', 0)} ({flight.get('source', 'unknown')})")
    
    except Exception as e:
        print(f"❌ Flight search error: {str(e)}")
    
    # Test hotel search
    print("\n🏨 Testing hotel search...")
    hotel_params = {
        "destination": "LAX",
        "check_in": get_test_dates()["checkin_date"],
        "check_out": get_test_dates()["checkout_date"],
        "guests": 2
    }
    
    try:
        hotels = await webserver_client.search_hotels(hotel_params)
        print(f"Found {len(hotels)} hotels")
        
        if hotels:
            for i, hotel in enumerate(hotels[:3]):  # Show first 3
                print(f"  {i+1}. {hotel.get('name', 'Unknown')} - ${hotel.get('price_per_night', 0)}/night ({hotel.get('source', 'unknown')})")
    
    except Exception as e:
        print(f"❌ Hotel search error: {str(e)}")
    
    await webserver_client.close()

async def main():
    """Main test function"""
    await test_webserver_integration()
    await test_orchestrator()

if __name__ == "__main__":
    asyncio.run(main()) 