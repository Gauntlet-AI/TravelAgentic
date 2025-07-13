#!/usr/bin/env python3
"""
Test script for Web Server API integration only
Tests the web server client that calls the web server API (which then calls Amadeus)
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
        "checkout_date": checkout_date
    }

# Environment variables are passed by Docker Compose
# WEBSERVER_URL is automatically set to http://web:3000 by Docker Compose

async def test_webserver_client():
    """Test the web server API client comprehensively"""
    print("🧪 Testing Web Server API Client")
    print("=" * 50)
    
    from travel_graphs.webserver_api_client import webserver_client
    
    # Test 1: Basic flight search
    print("✈️  Test 1: Basic Flight Search")
    flight_params = {
        "originLocationCode": "NYC",
        "destinationLocationCode": "LAX",
        "departureDate": get_test_dates()["departure_date"],
        "adults": 2
    }
    
    try:
        flights = await webserver_client.search_flights(flight_params)
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
        "cityCode": "LAX",
        "checkInDate": get_test_dates()["checkin_date"],
        "checkOutDate": get_test_dates()["checkout_date"],
        "adults": 2
    }
    
    try:
        hotels = await webserver_client.search_hotels(hotel_params)
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
        "originLocationCode": "NYC",
        "destinationLocationCode": "LAX",
        "departureDate": get_test_dates()["departure_date"],
        "returnDate": get_test_dates()["return_date"],
        "adults": 1,
        "travelClass": "BUSINESS"
    }
    
    try:
        flights = await webserver_client.search_flights(roundtrip_params)
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
        "cityCode": "MIA",
        "checkInDate": get_test_dates()["checkin_date"],
        "checkOutDate": get_test_dates()["checkout_date"],
        "adults": 4
    }
    
    try:
        hotels = await webserver_client.search_hotels(extended_hotel_params)
        print(f"✅ Found {len(hotels)} hotels in Miami")
        
        for hotel in hotels[:2]:
            print(f"  - {hotel.get('name', 'Unknown')}: ${hotel.get('total_price', 0)} total")
            print(f"    Amenities: {', '.join(hotel.get('amenities', [])[:3])}")
    
    except Exception as e:
        print(f"❌ Extended hotel search error: {str(e)}")

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
            "departure_date": get_test_dates()["departure_date"],
            "travelers": 2,
            "budget": 3000
        }
        
        print("✈️  Testing flight data conversion...")
        flight_results = await orchestrator._generate_flight_data_with_webserver(flight_context)
        
        print(f"✅ Generated {len(flight_results.get('flights', []))} flights")
        print(f"   Source: {flight_results.get('source', 'unknown')}")
        
        if flight_results.get('flights'):
            flight = flight_results['flights'][0]
            print(f"   Sample flight: {flight.get('airline', 'Unknown')} - ${flight.get('price', 0)}")
        
        # Test hotel context preparation
        hotel_context = {
            "destination_city": "Los Angeles",
            "checkin_date": get_test_dates()["checkin_date"],
            "checkout_date": get_test_dates()["checkout_date"],
            "travelers": 2,
            "budget": 3000,
            "context_aware": True
        }
        
        print("\n🏨 Testing hotel data conversion...")
        hotel_results = await orchestrator._generate_hotel_data_with_webserver(hotel_context)
        
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
    from travel_graphs.webserver_api_client import webserver_client
    
    try:
        await test_webserver_client()
        await test_orchestrator_data_conversion()
    finally:
        # Always close the client at the end
        await webserver_client.close()

if __name__ == "__main__":
    asyncio.run(main()) 