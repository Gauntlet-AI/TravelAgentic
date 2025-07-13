#!/usr/bin/env python3
"""
Test script for TravelAgentic LangGraph Orchestrator
Tests the orchestrator with Amadeus API integration
"""

import asyncio
import json
import os
from typing import Dict, Any

# Set environment variables for testing
os.environ["OPENAI_API_KEY"] = "sk-test-placeholder"
os.environ["ANTHROPIC_API_KEY"] = "sk-ant-test-placeholder"
os.environ["USE_MOCK_DATA"] = "true"
os.environ["AMADEUS_API_KEY"] = "test_key"
os.environ["AMADEUS_API_SECRET"] = "test_secret"

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
        "automation_level": 2,
        "user_preferences": {
            "destination": "Los Angeles",
            "origin": "New York",
            "start_date": "2024-08-01",
            "end_date": "2024-08-05",
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
                print(f"Flights: {len(shopping_cart.get('flights', []))}")
                print(f"Hotels: {len(shopping_cart.get('hotels', []))}")
                print(f"Activities: {len(shopping_cart.get('activities', []))}")
                
                if shopping_cart.get('flights'):
                    flight = shopping_cart['flights'][0]
                    print(f"Selected flight: {flight.get('airline', 'Unknown')} - ${flight.get('price', 0)}")
                
                if shopping_cart.get('hotels'):
                    hotel = shopping_cart['hotels'][0]
                    print(f"Selected hotel: {hotel.get('name', 'Unknown')} - ${hotel.get('nightly_rate', 0)}/night")
        else:
            print(f"❌ Error: {result.get('error', 'Unknown error')}")
    
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    print("\n" + "=" * 50)
    print("Test completed!")

async def test_amadeus_integration():
    """Test the Amadeus API integration separately"""
    print("\n🧪 Testing Amadeus API Integration")
    print("=" * 50)
    
    from travel_graphs.amadeus_api_wrapper import amadeus_client
    
    # Test flight search
    print("✈️  Testing flight search...")
    flight_params = {
        "origin": "NYC",
        "destination": "LAX",
        "departure_date": "2024-08-01",
        "passengers": 2
    }
    
    try:
        flights = await amadeus_client.search_flights(flight_params)
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
        "check_in": "2024-08-01",
        "check_out": "2024-08-05",
        "guests": 2
    }
    
    try:
        hotels = await amadeus_client.search_hotels(hotel_params)
        print(f"Found {len(hotels)} hotels")
        
        if hotels:
            for i, hotel in enumerate(hotels[:3]):  # Show first 3
                print(f"  {i+1}. {hotel.get('name', 'Unknown')} - ${hotel.get('price_per_night', 0)}/night ({hotel.get('source', 'unknown')})")
    
    except Exception as e:
        print(f"❌ Hotel search error: {str(e)}")
    
    await amadeus_client.close()

async def main():
    """Main test function"""
    await test_amadeus_integration()
    await test_orchestrator()

if __name__ == "__main__":
    asyncio.run(main()) 