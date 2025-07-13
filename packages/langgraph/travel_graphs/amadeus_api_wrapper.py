"""
Amadeus API Wrapper for TravelAgentic LangGraph
Provides real flight and hotel data with placeholder fallbacks for testing
"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx

logger = logging.getLogger(__name__)

class AmadeusAPIWrapper:
    """
    Wrapper for Amadeus Test API with intelligent fallbacks
    Provides flight and hotel search capabilities with placeholder data
    """
    
    def __init__(self):
        self.base_url = "https://test.api.amadeus.com"
        self.api_key = os.getenv("AMADEUS_API_KEY", "test_key")
        self.api_secret = os.getenv("AMADEUS_API_SECRET", "test_secret")
        self.access_token = None
        self.token_expires_at = None
        self.use_mock_data = os.getenv("USE_MOCK_DATA", "true").lower() == "true"
        
        # HTTP client for API calls
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={
                "User-Agent": "TravelAgentic/1.0 LangGraph Service",
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        )
    
    async def _get_access_token(self) -> Optional[str]:
        """Get or refresh Amadeus API access token"""
        if self.access_token and self.token_expires_at:
            if datetime.now() < self.token_expires_at:
                return self.access_token
        
        try:
            response = await self.client.post(
                f"{self.base_url}/v1/security/oauth2/token",
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.api_key,
                    "client_secret": self.api_secret
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data["access_token"]
                expires_in = token_data.get("expires_in", 3600)
                self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 60)
                return self.access_token
            else:
                logger.warning(f"Failed to get Amadeus token: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting Amadeus token: {str(e)}")
            return None
    
    async def search_flights(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Search for flights using Amadeus API with fallback to placeholder data
        """
        logger.info(f"Searching flights: {search_params}")
        
        # If using mock data or API fails, return placeholder data
        if self.use_mock_data:
            return self._generate_placeholder_flights(search_params)
        
        try:
            # Get access token
            token = await self._get_access_token()
            if not token:
                logger.warning("No access token available, using placeholder data")
                return self._generate_placeholder_flights(search_params)
            
            # Prepare API request
            headers = {"Authorization": f"Bearer {token}"}
            
            # Format search parameters for Amadeus API
            api_params = {
                "originLocationCode": search_params.get("origin", "NYC"),
                "destinationLocationCode": search_params.get("destination", "LAX"),
                "departureDate": search_params.get("departure_date", "2024-08-01"),
                "adults": search_params.get("passengers", 1),
                "max": 10,
                "currencyCode": "USD"
            }
            
            # Add return date if round trip
            if search_params.get("return_date"):
                api_params["returnDate"] = search_params["return_date"]
            
            # Make API call
            response = await self.client.get(
                f"{self.base_url}/v2/shopping/flight-offers",
                params=api_params,
                headers=headers
            )
            
            if response.status_code == 200:
                amadeus_data = response.json()
                return self._process_amadeus_flights(amadeus_data)
            else:
                logger.warning(f"Amadeus API error: {response.status_code}")
                return self._generate_placeholder_flights(search_params)
                
        except Exception as e:
            logger.error(f"Flight search error: {str(e)}")
            return self._generate_placeholder_flights(search_params)
    
    def _process_amadeus_flights(self, amadeus_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process Amadeus flight data into TravelAgentic format"""
        flights = []
        
        for offer in amadeus_data.get("data", []):
            try:
                # Extract flight details
                itinerary = offer.get("itineraries", [{}])[0]
                segments = itinerary.get("segments", [])
                
                if not segments:
                    continue
                
                first_segment = segments[0]
                last_segment = segments[-1]
                
                # Calculate total duration
                total_duration = itinerary.get("duration", "PT0H0M")
                duration_hours = self._parse_duration(total_duration)
                
                # Extract pricing
                price_info = offer.get("price", {})
                price = float(price_info.get("total", 0))
                
                # Create flight object
                flight = {
                    "id": offer.get("id", f"flight_{len(flights)}"),
                    "airline": first_segment.get("carrierCode", "AA"),
                    "airline_name": self._get_airline_name(first_segment.get("carrierCode", "AA")),
                    "flight_number": f"{first_segment.get('carrierCode', 'AA')}{first_segment.get('number', '100')}",
                    "origin": first_segment.get("departure", {}).get("iataCode", "NYC"),
                    "destination": last_segment.get("arrival", {}).get("iataCode", "LAX"),
                    "departure_time": first_segment.get("departure", {}).get("at", "2024-08-01T10:00:00"),
                    "arrival_time": last_segment.get("arrival", {}).get("at", "2024-08-01T14:00:00"),
                    "duration": f"{duration_hours}h",
                    "duration_hours": duration_hours,
                    "price": price,
                    "currency": price_info.get("currency", "USD"),
                    "stops": len(segments) - 1,
                    "cabin": offer.get("travelerPricings", [{}])[0].get("fareDetailsBySegment", [{}])[0].get("cabin", "ECONOMY").lower(),
                    "booking_class": first_segment.get("aircraft", {}).get("code", "320"),
                    "source": "amadeus_api",
                    "rating": 4.2,  # Default rating
                    "amenities": self._extract_amenities(offer),
                    "cancellation_policy": "Standard",
                    "baggage_info": self._extract_baggage_info(offer)
                }
                
                flights.append(flight)
                
            except Exception as e:
                logger.warning(f"Error processing flight offer: {str(e)}")
                continue
        
        return flights[:10]  # Return top 10 results
    
    def _parse_duration(self, duration_str: str) -> float:
        """Parse ISO 8601 duration string to hours"""
        try:
            # Remove PT prefix
            duration_str = duration_str.replace("PT", "")
            
            hours = 0
            minutes = 0
            
            if "H" in duration_str:
                hours_str = duration_str.split("H")[0]
                hours = int(hours_str)
                duration_str = duration_str.split("H")[1]
            
            if "M" in duration_str:
                minutes_str = duration_str.split("M")[0]
                minutes = int(minutes_str)
            
            return hours + (minutes / 60)
            
        except Exception:
            return 4.0  # Default duration
    
    def _get_airline_name(self, carrier_code: str) -> str:
        """Get airline name from carrier code"""
        airline_names = {
            "AA": "American Airlines",
            "UA": "United Airlines",
            "DL": "Delta Air Lines",
            "SW": "Southwest Airlines",
            "JB": "JetBlue Airways",
            "AS": "Alaska Airlines",
            "B6": "JetBlue Airways",
            "WN": "Southwest Airlines"
        }
        return airline_names.get(carrier_code, f"Airline {carrier_code}")
    
    def _extract_amenities(self, offer: Dict[str, Any]) -> List[str]:
        """Extract amenities from flight offer"""
        amenities = []
        
        # Check for wifi, meals, entertainment based on cabin class
        cabin = offer.get("travelerPricings", [{}])[0].get("fareDetailsBySegment", [{}])[0].get("cabin", "ECONOMY")
        
        if cabin in ["BUSINESS", "FIRST"]:
            amenities.extend(["wifi", "meals", "entertainment", "priority_boarding", "lounge_access"])
        elif cabin == "PREMIUM_ECONOMY":
            amenities.extend(["wifi", "meals", "entertainment", "priority_boarding"])
        else:
            amenities.extend(["wifi", "entertainment"])
        
        return amenities
    
    def _extract_baggage_info(self, offer: Dict[str, Any]) -> Dict[str, Any]:
        """Extract baggage information from flight offer"""
        return {
            "carry_on": "1 bag included",
            "checked": "1 bag (up to 50 lbs)",
            "additional_fee": "$30 for extra bags"
        }
    
    def _generate_placeholder_flights(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate placeholder flight data for testing"""
        origin = search_params.get("origin", "NYC")
        destination = search_params.get("destination", "LAX")
        departure_date = search_params.get("departure_date", "2024-08-01")
        passengers = search_params.get("passengers", 1)
        
        # Generate 5 placeholder flights with variety
        flights = []
        
        airlines = [
            {"code": "AA", "name": "American Airlines"},
            {"code": "UA", "name": "United Airlines"},
            {"code": "DL", "name": "Delta Air Lines"},
            {"code": "SW", "name": "Southwest Airlines"},
            {"code": "JB", "name": "JetBlue Airways"}
        ]
        
        base_price = 450
        
        for i, airline in enumerate(airlines):
            flight = {
                "id": f"placeholder_flight_{i}",
                "airline": airline["code"],
                "airline_name": airline["name"],
                "flight_number": f"{airline['code']}{100 + i}",
                "origin": origin,
                "destination": destination,
                "departure_time": f"{departure_date}T{8 + i}:00:00",
                "arrival_time": f"{departure_date}T{12 + i}:00:00",
                "duration": f"{4 + i}h",
                "duration_hours": 4 + i,
                "price": base_price + (i * 50),
                "currency": "USD",
                "stops": i % 2,  # Alternate between nonstop and 1 stop
                "cabin": "economy",
                "booking_class": "V",
                "source": "placeholder",
                "rating": 4.0 + (i * 0.1),
                "amenities": ["wifi", "entertainment"] if i % 2 == 0 else ["wifi"],
                "cancellation_policy": "Flexible" if i < 2 else "Standard",
                "baggage_info": {
                    "carry_on": "1 bag included",
                    "checked": "1 bag (up to 50 lbs)",
                    "additional_fee": "$30 for extra bags"
                }
            }
            flights.append(flight)
        
        return flights
    
    async def search_hotels(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Search for hotels using Amadeus API with fallback to placeholder data
        """
        logger.info(f"Searching hotels: {search_params}")
        
        if self.use_mock_data:
            return self._generate_placeholder_hotels(search_params)
        
        try:
            # Get access token
            token = await self._get_access_token()
            if not token:
                logger.warning("No access token available, using placeholder data")
                return self._generate_placeholder_hotels(search_params)
            
            # Prepare API request
            headers = {"Authorization": f"Bearer {token}"}
            
            # Format search parameters for Amadeus API
            api_params = {
                "cityCode": search_params.get("destination", "NYC"),
                "checkInDate": search_params.get("check_in", "2024-08-01"),
                "checkOutDate": search_params.get("check_out", "2024-08-05"),
                "adults": search_params.get("guests", 1),
                "radius": 20,
                "radiusUnit": "KM",
                "currency": "USD"
            }
            
            # Make API call
            response = await self.client.get(
                f"{self.base_url}/v1/reference-data/locations/hotels/by-city",
                params=api_params,
                headers=headers
            )
            
            if response.status_code == 200:
                amadeus_data = response.json()
                return self._process_amadeus_hotels(amadeus_data, search_params)
            else:
                logger.warning(f"Amadeus hotels API error: {response.status_code}")
                return self._generate_placeholder_hotels(search_params)
                
        except Exception as e:
            logger.error(f"Hotel search error: {str(e)}")
            return self._generate_placeholder_hotels(search_params)
    
    def _process_amadeus_hotels(self, amadeus_data: Dict[str, Any], search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process Amadeus hotel data into TravelAgentic format"""
        hotels = []
        
        for i, hotel_data in enumerate(amadeus_data.get("data", [])):
            try:
                # Extract hotel details
                hotel = {
                    "id": hotel_data.get("hotelId", f"hotel_{i}"),
                    "name": hotel_data.get("name", f"Hotel {i+1}"),
                    "description": f"A comfortable hotel in {search_params.get('destination', 'the city')}",
                    "rating": 4.0 + (i * 0.1),
                    "star_rating": min(5, 3 + (i % 3)),
                    "price_per_night": 150 + (i * 25),
                    "total_price": (150 + (i * 25)) * self._calculate_nights(search_params),
                    "currency": "USD",
                    "location": {
                        "address": hotel_data.get("address", {}).get("lines", [""])[0],
                        "city": search_params.get("destination", "City"),
                        "country": hotel_data.get("address", {}).get("countryCode", "US"),
                        "lat": hotel_data.get("geoCode", {}).get("latitude", 40.7128),
                        "lon": hotel_data.get("geoCode", {}).get("longitude", -74.0060)
                    },
                    "amenities": self._generate_hotel_amenities(i),
                    "room_type": "Standard Room",
                    "check_in": search_params.get("check_in", "2024-08-01"),
                    "check_out": search_params.get("check_out", "2024-08-05"),
                    "guests": search_params.get("guests", 1),
                    "nights": self._calculate_nights(search_params),
                    "source": "amadeus_api",
                    "booking_url": f"https://booking.example.com/hotel/{hotel_data.get('hotelId', i)}",
                    "cancellation_policy": "Free cancellation until 24 hours before check-in",
                    "image_urls": [f"https://images.example.com/hotel_{i}_1.jpg"]
                }
                
                hotels.append(hotel)
                
            except Exception as e:
                logger.warning(f"Error processing hotel: {str(e)}")
                continue
        
        return hotels[:10]  # Return top 10 results
    
    def _calculate_nights(self, search_params: Dict[str, Any]) -> int:
        """Calculate number of nights from check-in/check-out dates"""
        try:
            check_in = datetime.strptime(search_params.get("check_in", "2024-08-01"), "%Y-%m-%d")
            check_out = datetime.strptime(search_params.get("check_out", "2024-08-05"), "%Y-%m-%d")
            return (check_out - check_in).days
        except Exception:
            return 4  # Default to 4 nights
    
    def _generate_hotel_amenities(self, index: int) -> List[str]:
        """Generate hotel amenities based on index"""
        base_amenities = ["wifi", "parking", "front_desk_24h"]
        
        if index % 3 == 0:
            base_amenities.extend(["pool", "gym", "spa"])
        elif index % 3 == 1:
            base_amenities.extend(["restaurant", "bar", "room_service"])
        else:
            base_amenities.extend(["business_center", "concierge"])
        
        return base_amenities
    
    def _generate_placeholder_hotels(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate placeholder hotel data for testing"""
        destination = search_params.get("destination", "NYC")
        check_in = search_params.get("check_in", "2024-08-01")
        check_out = search_params.get("check_out", "2024-08-05")
        guests = search_params.get("guests", 1)
        nights = self._calculate_nights(search_params)
        
        hotel_names = [
            "Grand Plaza Hotel",
            "Downtown Boutique Inn",
            "Luxury Suites & Spa",
            "Business Traveler Lodge",
            "Historic District Hotel"
        ]
        
        hotels = []
        
        for i, name in enumerate(hotel_names):
            base_price = 150 + (i * 30)
            hotel = {
                "id": f"placeholder_hotel_{i}",
                "name": name,
                "description": f"A comfortable hotel in {destination} with excellent amenities",
                "rating": 4.0 + (i * 0.2),
                "star_rating": min(5, 3 + (i % 3)),
                "price_per_night": base_price,
                "total_price": base_price * nights,
                "currency": "USD",
                "location": {
                    "address": f"{i+1}00 Main Street",
                    "city": destination,
                    "country": "US",
                    "lat": 40.7128 + (i * 0.01),
                    "lon": -74.0060 + (i * 0.01)
                },
                "amenities": self._generate_hotel_amenities(i),
                "room_type": "Standard Room" if i < 2 else "Deluxe Suite",
                "check_in": check_in,
                "check_out": check_out,
                "guests": guests,
                "nights": nights,
                "source": "placeholder",
                "booking_url": f"https://booking.example.com/hotel/{i}",
                "cancellation_policy": "Free cancellation until 24 hours before check-in",
                "image_urls": [f"https://images.example.com/hotel_{i}_1.jpg"]
            }
            hotels.append(hotel)
        
        return hotels
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Global instance
amadeus_client = AmadeusAPIWrapper() 