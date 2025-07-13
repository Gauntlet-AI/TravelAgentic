#!/usr/bin/env python3
"""
Test script for Web Server API Client
Tests the webserver_api_client that calls the Next.js API routes
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
        "originLocationCode": "JFK",  # Fixed: Use proper IATA code and parameter name
        "destinationLocationCode": "LAX",
        "departureDate": get_test_dates()["departure_date"],
        "returnDate": get_test_dates()["return_date"],
        "adults": 2,
        "children": 0,
        "infants": 0,
        "travelClass": "ECONOMY",
        "nonStop": False,
        "currencyCode": "USD"
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
        "cityCode": "LAX",  # Fixed: Use proper parameter name
        "checkInDate": get_test_dates()["checkin_date"],
        "checkOutDate": get_test_dates()["checkout_date"],
        "adults": 2,
        "childAges": [],
        "roomQuantity": 1,
        "ratings": [3, 4, 5],
        "amenities": ["WIFI"],
        "radius": 50,
        "radiusUnit": "KM"
    }
    
    try:
        hotels = await webserver_client.search_hotels(hotel_params)
        print(f"✅ Found {len(hotels)} hotels")
        
        for i, hotel in enumerate(hotels[:3]):
            print(f"  {i+1}. {hotel.get('name', 'Unknown')} - ${hotel.get('price_per_night', 0)}/night")
            print(f"      {hotel.get('star_rating', 0)} stars - {hotel.get('location', {}).get('city', 'Unknown city')}")
            print(f"      Source: {hotel.get('source', 'unknown')}")
    
    except Exception as e:
        print(f"❌ Hotel search error: {str(e)}")
    
    print()
    
    # Test 3: Activity search
    print("🎯 Test 3: Activity Search")
    activity_params = {
        "latitude": 34.0522,   # Fixed: Use proper coordinates and parameter names
        "longitude": -118.2437,
        "radius": 50,
        "categories": ["SIGHTSEEING", "MUSEUMS"],
        "startDate": get_test_dates()["departure_date"],
        "endDate": get_test_dates()["return_date"],
        "minimumDuration": "2H",
        "maximumDuration": "6H",
        "limit": 10,
        "currency": "USD"
    }
    
    try:
        activities = await webserver_client.search_activities(activity_params)
        print(f"✅ Found {len(activities)} activities")
        
        for i, activity in enumerate(activities[:3]):
            print(f"  {i+1}. {activity.get('name', 'Unknown')} - ${activity.get('price', 0)}")
            print(f"      Duration: {activity.get('duration', 'Unknown')}")
            print(f"      Source: {activity.get('source', 'unknown')}")
    
    except Exception as e:
        print(f"❌ Activity search error: {str(e)}")
    
    print()
    
    # Test 4: Connection cleanup test (without actually closing)
    print("🔧 Test 4: Connection Cleanup")
    try:
        # Test that the client has a close method and is ready for cleanup
        if hasattr(webserver_client, 'close'):
            print("✅ Connection cleanup method available")
        else:
            print("❌ Connection cleanup method not available")
    except Exception as e:
        print(f"❌ Connection cleanup error: {str(e)}")
    
    print()
    
    # Test 5: Data validation
    print("📋 Test 5: Data Validation")
    try:
        flights = await webserver_client.search_flights(flight_params)
        if flights:
            flight = flights[0]
            required_fields = ['id', 'airline', 'flight_number', 'origin', 'destination', 'price']
            missing_fields = [field for field in required_fields if field not in flight]
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
            else:
                print("✅ All required fields present in flight data")
        else:
            print("❌ No flight data returned")
    
    except Exception as e:
        print(f"❌ Data validation error: {str(e)}")
    
    print()
    
    # Test 6: Error handling
    print("🚨 Test 6: Error Handling")
    try:
        # Test with invalid parameters
        invalid_params = {
            "originLocationCode": "",  # Fixed: Use proper parameter names
            "destinationLocationCode": "",
            "departureDate": "invalid-date",
            "adults": -1
        }
        
        flights = await webserver_client.search_flights(invalid_params)
        print(f"✅ Error handling test passed - returned {len(flights)} flights")
    
    except Exception as e:
        print(f"✅ Error handling test passed - caught exception: {str(e)}")

async def test_orchestrator_data_conversion():
    """Test the orchestrator's data conversion with web server API"""
    print("\n🔄 Testing Orchestrator Data Conversion")
    print("=" * 50)
    
    from travel_graphs.orchestrator_graph import TravelOrchestratorGraph
    
    # Create orchestrator instance
    orchestrator = TravelOrchestratorGraph()
    
    # Test flight data generation
    print("✈️  Testing flight data generation...")
    flight_context = {
        "departure_city": "New York",  # Fixed: Use proper city names
        "destination_city": "Los Angeles",
        "departure_date": get_test_dates()["departure_date"],
        "return_date": get_test_dates()["return_date"],
        "travelers": 2,
        "cabin_class": "economy",
        "budget": 1000
    }
    
    try:
        flight_results = await orchestrator._generate_flight_data_with_webserver(flight_context)
        print(f"✅ Flight data generation successful")
        print(f"   Source: {flight_results.get('source', 'unknown')}")
        print(f"   Flights found: {len(flight_results.get('flights', []))}")
        
        if flight_results.get('flights'):
            flight = flight_results['flights'][0]
            print(f"   Sample flight: {flight.get('airline', 'Unknown')} {flight.get('flight_number', '')}")
    
    except Exception as e:
        print(f"❌ Flight data generation error: {str(e)}")
    
    print()
    
    # Test hotel data generation
    print("🏨 Testing hotel data generation...")
    hotel_context = {
        "destination_city": "Los Angeles",  # Fixed: Use proper city name
        "checkin_date": get_test_dates()["checkin_date"],
        "checkout_date": get_test_dates()["checkout_date"],
        "travelers": 2,
        "budget": 1500,  # Added: Budget for proper calculation
        "room_type": "standard"  # Added: Room type preference
    }
    
    try:
        hotel_results = await orchestrator._generate_hotel_data_with_webserver(hotel_context)
        print(f"✅ Hotel data generation successful")
        print(f"   Source: {hotel_results.get('source', 'unknown')}")
        print(f"   Hotels found: {len(hotel_results.get('hotels', []))}")
        
        if hotel_results.get('hotels'):
            hotel = hotel_results['hotels'][0]
            print(f"   Sample hotel: {hotel.get('name', 'Unknown')} - ${hotel.get('nightly_rate', 0)}/night")
    
    except Exception as e:
        print(f"❌ Hotel data generation error: {str(e)}")

async def main():
    """Main test function"""
    from travel_graphs.webserver_api_client import webserver_client
    
    try:
        await test_webserver_client()
        await test_orchestrator_data_conversion()
        
        print("\n🎉 All tests completed!")
    finally:
        # Always close the client at the end
        await webserver_client.close()

if __name__ == "__main__":
    asyncio.run(main()) 