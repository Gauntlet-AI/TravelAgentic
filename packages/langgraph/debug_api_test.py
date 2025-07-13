#!/usr/bin/env python3
"""
debug_api_test.py - Simple script to test the web server API directly
"""

import asyncio
import json
import httpx
from datetime import datetime, timedelta

async def test_flight_api():
    """Test the flight search API with Amadeus parameters"""
    url = "http://web:3000/api/flights/search"
    
    # Use future dates - 90+ days out from July 2025 (October 2025)
    departure_date = (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")
    return_date = (datetime.now() + timedelta(days=95)).strftime("%Y-%m-%d")
    
    print(f"Using departure date: {departure_date}, return date: {return_date}")
    
    data = {
        "originLocationCode": "NYC",
        "destinationLocationCode": "LAX",
        "departureDate": departure_date,
        "returnDate": return_date,
        "adults": 2,
        "children": 0,
        "infants": 0,
        "travelClass": "ECONOMY",
        "nonStop": False,
        "maxPrice": 1000,
        "includedAirlineCodes": ["AA", "DL"]
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=data)
            print(f"Flight API Response ({response.status_code}):")
            print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Flight API Error: {e}")

async def test_hotel_api():
    """Test the hotel search API with Amadeus parameters"""
    url = "http://web:3000/api/hotels/search"
    
    # Use future dates - 90+ days out from July 2025 (October 2025)
    check_in_date = (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")
    check_out_date = (datetime.now() + timedelta(days=93)).strftime("%Y-%m-%d")
    
    data = {
        "cityCode": "NYC",
        "checkInDate": check_in_date,
        "checkOutDate": check_out_date,
        "adults": 2,
        "childAges": [],
        "roomQuantity": 1,
        "ratings": [3, 4, 5],
        "amenities": ["WIFI", "POOL"],
        "radius": 50,
        "radiusUnit": "KM"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=data)
            print(f"Hotel API Response ({response.status_code}):")
            print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Hotel API Error: {e}")

async def test_activity_api():
    """Test the activity search API with Amadeus parameters"""
    url = "http://web:3000/api/activities/search"
    
    # Use future dates - 90+ days out from July 2025 (October 2025)
    start_date = (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=95)).strftime("%Y-%m-%d")
    
    data = {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "radius": 50,
        "categories": ["SIGHTSEEING", "MUSEUMS"],
        "startDate": start_date,
        "endDate": end_date,
        "minimumDuration": "2H",
        "maximumDuration": "6H",
        "minimumPrice": 10,
        "maximumPrice": 200,
        "limit": 10
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=data)
            print(f"Activity API Response ({response.status_code}):")
            print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Activity API Error: {e}")

async def main():
    """Run all API tests"""
    print("🧪 Testing Web Server APIs with Amadeus Parameters")
    print("=" * 60)
    
    print("\n1. Testing Flight API:")
    print("-" * 30)
    await test_flight_api()
    
    print("\n2. Testing Hotel API:")
    print("-" * 30)
    await test_hotel_api()
    
    print("\n3. Testing Activity API:")
    print("-" * 30)
    await test_activity_api()

if __name__ == "__main__":
    asyncio.run(main()) 