#!/usr/bin/env python3
"""
Test script for TravelAgentic LangGraph Orchestrator
Tests the orchestrator with Amadeus API integration
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
        # Run the orchestrator
        print("🔄 Running orchestrator...")
        result = await orchestrator.run(test_input)
        
        print("✅ Result:")
        print(f"Success: {result.get('success', False)}")
        print(f"Execution time: {result.get('execution_time', 0):.2f}s")
        print(f"Steps: {result.get('step_count', 0)}")
        
        if result.get('success'):
            data = result.get('data', {})
            print(f"Final step: {data.get('current_step', 'unknown')}")
            print(f"Agent status: {data.get('agent_status', {})}")
            
            # Check shopping cart
            shopping_cart = data.get('shopping_cart', {})
            if shopping_cart:
                print("\n🛒 Shopping Cart:")
                
                # Handle component selection - components can be None if not needed
                flights = shopping_cart.get('flights')
                hotels = shopping_cart.get('hotels')
                activities = shopping_cart.get('activities')
                
                print(f"Flights: {len(flights) if flights is not None else 'Not requested'}")
                print(f"Hotels: {len(hotels) if hotels is not None else 'Not requested'}")
                print(f"Activities: {len(activities) if activities is not None else 'Not requested'}")
                
                if flights and len(flights) > 0:
                    flight = flights[0]
                    print(f"Selected flight: {flight.get('airline', 'Unknown')} - ${flight.get('price', 0)}")
                
                if hotels and len(hotels) > 0:
                    hotel = hotels[0]
                    print(f"Selected hotel: {hotel.get('name', 'Unknown')} - ${hotel.get('nightly_rate', 0)}/night")
        else:
            print(f"❌ Error: {result.get('error', 'Unknown error')}")
    
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    print("\n" + "=" * 50)
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