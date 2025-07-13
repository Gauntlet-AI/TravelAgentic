#!/usr/bin/env python3
"""
Test script for Amadeus API integration only
Tests the Amadeus wrapper without LLM dependencies
"""

import asyncio
import json
import os
from typing import Dict, Any

# Set environment variables for testing
os.environ["USE_MOCK_DATA"] = "true"
os.environ["AMADEUS_API_KEY"] = "test_key"
os.environ["AMADEUS_API_SECRET"] = "test_secret"

async def test_amadeus_wrapper():
    """Test the Amadeus API wrapper comprehensively"""
    print("🧪 Testing Amadeus API Wrapper")
    print("=" * 50)
    
    from travel_graphs.amadeus_api_wrapper import amadeus_client
    
    # Test 1: Basic flight search
    print("✈️  Test 1: Basic Flight Search")
    flight_params = {
        "origin": "NYC",
        "destination": "LAX",
        "departure_date": "2024-08-01",
        "passengers": 2
    }
    
    try:
        flights = await amadeus_client.search_flights(flight_params)
        print(f"✅ Found {len(flights)} flights")
        
        for i, flight in enumerate(flights[:3]):
            print(f"  {i+1}. {flight.get('airline_name', 'Unknown')} {flight.get('flight_number', '')}")
            print(f"      ${flight.get('price', 0)} - {flight.get('duration', 'Unknown')} - {flight.get('stops', 0)} stops")
            print(f"      Source: {flight.get('source', 'unknown')}")
    
    except Exception as e:
        print(f"❌ Flight search error: {str(e)}")
    
    print()
    
    # Test 2: Hotel search
    print("🏨 Test 2: Hotel Search")
    hotel_params = {
        "destination": "LAX",
        "check_in": "2024-08-01",
        "check_out": "2024-08-05",
        "guests": 2
    }
    
    try:
        hotels = await amadeus_client.search_hotels(hotel_params)
        print(f"✅ Found {len(hotels)} hotels")
        
        for i, hotel in enumerate(hotels[:3]):
            print(f"  {i+1}. {hotel.get('name', 'Unknown')}")
            print(f"      ${hotel.get('price_per_night', 0)}/night - {hotel.get('star_rating', 0)} stars")
            print(f"      Source: {hotel.get('source', 'unknown')}")
    
    except Exception as e:
        print(f"❌ Hotel search error: {str(e)}")
    
    print()
    
    # Test 3: Round trip flights
    print("✈️  Test 3: Round Trip Flight Search")
    roundtrip_params = {
        "origin": "NYC",
        "destination": "LAX",
        "departure_date": "2024-08-01",
        "return_date": "2024-08-05",
        "passengers": 1,
        "cabin": "business"
    }
    
    try:
        flights = await amadeus_client.search_flights(roundtrip_params)
        print(f"✅ Found {len(flights)} round-trip flights")
        
        if flights:
            flight = flights[0]
            print(f"  Best option: {flight.get('airline_name', 'Unknown')} - ${flight.get('price', 0)}")
            print(f"  Cabin: {flight.get('cabin', 'economy')}")
            print(f"  Amenities: {', '.join(flight.get('amenities', []))}")
    
    except Exception as e:
        print(f"❌ Round trip search error: {str(e)}")
    
    print()
    
    # Test 4: Hotel search with different parameters
    print("🏨 Test 4: Extended Hotel Search")
    extended_hotel_params = {
        "destination": "Miami",
        "check_in": "2024-09-01",
        "check_out": "2024-09-07",
        "guests": 4
    }
    
    try:
        hotels = await amadeus_client.search_hotels(extended_hotel_params)
        print(f"✅ Found {len(hotels)} hotels in Miami")
        
        for hotel in hotels[:2]:
            print(f"  - {hotel.get('name', 'Unknown')}: ${hotel.get('total_price', 0)} total")
            print(f"    Amenities: {', '.join(hotel.get('amenities', [])[:3])}")
    
    except Exception as e:
        print(f"❌ Extended hotel search error: {str(e)}")
    
    await amadeus_client.close()
    
    print("\n" + "=" * 50)
    print("✅ Amadeus API tests completed!")

async def test_orchestrator_data_conversion():
    """Test the data conversion functions in orchestrator"""
    print("\n🔄 Testing Orchestrator Data Conversion")
    print("=" * 50)
    
    try:
        from travel_graphs.orchestrator_graph import TravelOrchestratorGraph
        
        # Create orchestrator instance (no LLM calls needed for this test)
        orchestrator = TravelOrchestratorGraph()
        
        # Test flight context preparation
        flight_context = {
            "departure_city": "New York",
            "destination_city": "Los Angeles", 
            "departure_date": "2024-08-01",
            "travelers": 2,
            "budget": 3000
        }
        
        print("✈️  Testing flight data conversion...")
        flight_results = await orchestrator._generate_flight_data_with_amadeus(flight_context)
        
        print(f"✅ Generated {len(flight_results.get('flights', []))} flights")
        print(f"   Source: {flight_results.get('source', 'unknown')}")
        
        if flight_results.get('flights'):
            flight = flight_results['flights'][0]
            print(f"   Sample flight: {flight.get('airline', 'Unknown')} - ${flight.get('price', 0)}")
        
        # Test hotel context preparation
        hotel_context = {
            "destination_city": "Los Angeles",
            "checkin_date": "2024-08-01",
            "checkout_date": "2024-08-05",
            "travelers": 2,
            "budget": 3000,
            "context_aware": True
        }
        
        print("\n🏨 Testing hotel data conversion...")
        hotel_results = await orchestrator._generate_hotel_data_with_amadeus(hotel_context)
        
        print(f"✅ Generated {len(hotel_results.get('hotels', []))} hotels")
        print(f"   Source: {hotel_results.get('source', 'unknown')}")
        
        if hotel_results.get('hotels'):
            hotel = hotel_results['hotels'][0]
            print(f"   Sample hotel: {hotel.get('name', 'Unknown')} - ${hotel.get('nightly_rate', 0)}/night")
        
        print("✅ Data conversion tests passed!")
        
    except Exception as e:
        print(f"❌ Data conversion test error: {str(e)}")

async def main():
    """Main test function"""
    await test_amadeus_wrapper()
    await test_orchestrator_data_conversion()

if __name__ == "__main__":
    asyncio.run(main()) 