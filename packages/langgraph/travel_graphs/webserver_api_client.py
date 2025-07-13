"""
Web Server API Client for TravelAgentic LangGraph
Calls the web server API endpoints instead of directly calling Amadeus
This ensures consistent fallback handling and data formats
"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx

logger = logging.getLogger(__name__)

def get_future_date(days_from_now: int = 30) -> str:
    """Generate a future date string in YYYY-MM-DD format"""
    return (datetime.now() + timedelta(days=days_from_now)).strftime("%Y-%m-%d")

def get_default_dates() -> Dict[str, str]:
    """Generate default dates for API requests"""
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

class WebServerAPIClient:
    """
    Client for calling TravelAgentic web server API endpoints
    Replaces direct Amadeus integration with web server calls
    """
    
    def __init__(self):
        self.base_url = os.getenv("WEBSERVER_URL", "http://web:3000")
        self.timeout = 30.0
        
        # HTTP client for API calls
        self.client = httpx.AsyncClient(
            timeout=self.timeout,
            headers={
                "User-Agent": "TravelAgentic/1.0 LangGraph Service",
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        )
    
    async def search_flights(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Search for flights using web server API
        Uses actual Amadeus API parameter names for consistency
        """
        logger.info(f"Searching flights via web server: {search_params}")
        
        try:
            # Get default dates
            default_dates = get_default_dates()
            
            # Use actual Amadeus API parameter names (expected by web server)
            api_params = {
                "originLocationCode": search_params.get("originLocationCode", "NYC"),
                "destinationLocationCode": search_params.get("destinationLocationCode", "LAX"),
                "departureDate": search_params.get("departureDate", default_dates["departure_date"]),
                "returnDate": search_params.get("returnDate"),
                "adults": search_params.get("adults", 1),
                "children": search_params.get("children", 0),
                "infants": search_params.get("infants", 0),
                "travelClass": search_params.get("travelClass", "ECONOMY"),
                "nonStop": search_params.get("nonStop", False),
                "maxPrice": search_params.get("maxPrice"),
                "includedAirlineCodes": search_params.get("includedAirlineCodes")
            }
            
            # Make API call to web server
            response = await self.client.post(
                f"{self.base_url}/api/flights/search",
                json=api_params
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    # Return FlightResult format directly - no transformation needed
                    return result.get("data", [])
                else:
                    logger.error(f"Web server flight search failed: {result.get('error')}")
                    return []
            else:
                logger.error(f"Web server API error: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Flight search error: {str(e)}")
            return []
    
    async def search_hotels(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Search for hotels using web server API
        Uses actual Amadeus API parameter names for consistency
        """
        logger.info(f"Searching hotels via web server: {search_params}")
        
        try:
            # Get default dates
            default_dates = get_default_dates()
            
            # Use actual Amadeus API parameter names (expected by web server)
            api_params = {
                "cityCode": search_params.get("cityCode", "NYC"),
                "checkInDate": search_params.get("checkInDate", default_dates["checkin_date"]),
                "checkOutDate": search_params.get("checkOutDate", default_dates["checkout_date"]),
                "adults": search_params.get("adults", 1),
                "childAges": search_params.get("childAges", []),
                "roomQuantity": search_params.get("roomQuantity", 1),
                "ratings": search_params.get("ratings"),
                "amenities": search_params.get("amenities"),
                "chainCodes": search_params.get("chainCodes"),
                "radius": search_params.get("radius", 50)
            }
            
            # Make API call to web server
            response = await self.client.post(
                f"{self.base_url}/api/hotels/search",
                json=api_params
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    # Return HotelResult format directly - no transformation needed
                    return result.get("data", [])
                else:
                    logger.error(f"Web server hotel search failed: {result.get('error')}")
                    return []
            else:
                logger.error(f"Web server API error: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Hotel search error: {str(e)}")
            return []
    
    async def search_activities(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Search for activities using web server API
        Uses actual Amadeus API parameter names for consistency
        """
        logger.info(f"Searching activities via web server: {search_params}")
        
        try:
            # Use actual Amadeus API parameter names (expected by web server)
            api_params = {
                "latitude": search_params.get("latitude", 40.7128),  # Default to NYC
                "longitude": search_params.get("longitude", -74.0060),  # Default to NYC
                "radius": search_params.get("radius", 50),
                "categories": search_params.get("categories"),
                "startDate": search_params.get("startDate"),
                "endDate": search_params.get("endDate"),
                "minimumDuration": search_params.get("minimumDuration"),
                "maximumDuration": search_params.get("maximumDuration"),
                "minimumPrice": search_params.get("minimumPrice"),
                "maximumPrice": search_params.get("maximumPrice"),
                "destination": search_params.get("destination"),
                "groupSize": search_params.get("groupSize"),
                "accessibility": search_params.get("accessibility"),
                "limit": search_params.get("limit", 10)
            }
            
            # Make API call to web server
            response = await self.client.post(
                f"{self.base_url}/api/activities/search",
                json=api_params
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    # Return ActivityResult format directly - no transformation needed
                    return result.get("data", [])
                else:
                    logger.error(f"Web server activity search failed: {result.get('error')}")
                    return []
            else:
                logger.error(f"Web server API error: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Activity search error: {str(e)}")
            return []
    

    

    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Global instance
webserver_client = WebServerAPIClient() 