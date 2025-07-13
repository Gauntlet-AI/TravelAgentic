#!/usr/bin/env python3
"""
test_amadeus_validation.py - Comprehensive Amadeus API validation test
Tests data handling, response parsing, and transformation logic against expected results.
"""

import json
import os
import sys
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import traceback

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from travel_graphs.webserver_api_client import WebServerAPIClient

class AmadeusValidationTest:
    """Test suite for validating Amadeus API data handling"""
    
    def __init__(self):
        self.client = WebServerAPIClient()
        self.test_results = []
    
    def get_future_date(self, days_ahead: int = 90) -> str:
        """Get a future date in YYYY-MM-DD format (default 90 days ahead from July 2025)"""
        future_date = datetime.now() + timedelta(days=days_ahead)
        return future_date.strftime("%Y-%m-%d")
    
    def get_return_date(self, departure_days: int = 90, trip_length: int = 5) -> str:
        """Get a return date based on departure date"""
        return_date = datetime.now() + timedelta(days=departure_days + trip_length)
        return return_date.strftime("%Y-%m-%d")
        
    def log_test(self, test_name: str, passed: bool, message: str = "", details: Optional[Dict] = None):
        """Log test results"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "message": message,
            "details": details or {}
        })
    
    def validate_flight_data_structure(self, flight_data: Dict) -> bool:
        """Validate flight data structure matches expected format"""
        required_fields = [
            'id', 'source', 'instantTicketingRequired', 'nonRefundable',
            'oneWay', 'lastTicketingDate', 'numberOfBookableSeats',
            'itineraries', 'price', 'pricingOptions', 'validatingAirlineCodes',
            'travelerPricings'
        ]
        
        for field in required_fields:
            if field not in flight_data:
                return False
        
        # Validate itineraries structure
        if not isinstance(flight_data['itineraries'], list) or len(flight_data['itineraries']) == 0:
            return False
        
        itinerary = flight_data['itineraries'][0]
        if 'duration' not in itinerary or 'segments' not in itinerary:
            return False
        
        # Validate segments structure
        if not isinstance(itinerary['segments'], list) or len(itinerary['segments']) == 0:
            return False
        
        segment = itinerary['segments'][0]
        segment_fields = ['departure', 'arrival', 'carrierCode', 'number', 'aircraft', 'operating']
        for field in segment_fields:
            if field not in segment:
                return False
        
        # Validate price structure
        price = flight_data['price']
        price_fields = ['currency', 'total', 'base', 'fees', 'taxes', 'refundableTaxes']
        for field in price_fields:
            if field not in price:
                return False
        
        return True
    
    def validate_hotel_data_structure(self, hotel_data: Dict) -> bool:
        """Validate hotel data structure matches expected format"""
        required_fields = [
            'type', 'hotel', 'available', 'offers', 'self'
        ]
        
        for field in required_fields:
            if field not in hotel_data:
                return False
        
        # Validate hotel structure
        hotel = hotel_data['hotel']
        hotel_fields = ['type', 'hotelId', 'chainCode', 'dupeId', 'name', 'cityCode', 'latitude', 'longitude']
        for field in hotel_fields:
            if field not in hotel:
                return False
        
        # Validate offers structure
        if not isinstance(hotel_data['offers'], list) or len(hotel_data['offers']) == 0:
            return False
        
        offer = hotel_data['offers'][0]
        offer_fields = ['id', 'checkInDate', 'checkOutDate', 'rateCode', 'rateFamilyEstimated', 'room', 'guests', 'price']
        for field in offer_fields:
            if field not in offer:
                return False
        
        # Validate price structure
        price = offer['price']
        price_fields = ['currency', 'base', 'total', 'taxes', 'markups']
        for field in price_fields:
            if field not in price:
                return False
        
        return True
    
    def validate_activity_data_structure(self, activity_data: Dict) -> bool:
        """Validate activity data structure matches expected format"""
        required_fields = [
            'type', 'id', 'self', 'name', 'shortDescription', 'geoCode',
            'rating', 'pictures', 'bookingLink', 'price'
        ]
        
        for field in required_fields:
            if field not in activity_data:
                return False
        
        # Validate geoCode structure
        geoCode = activity_data['geoCode']
        if 'latitude' not in geoCode or 'longitude' not in geoCode:
            return False
        
        # Validate price structure
        price = activity_data['price']
        price_fields = ['currencyCode', 'amount']
        for field in price_fields:
            if field not in price:
                return False
        
        return True
    
    async def test_flight_search_validation(self):
        """Test flight search data validation"""
        try:
            # Test flight search with actual Amadeus API parameters
            departure_date = self.get_future_date(90)  # ~October 2025
            return_date = self.get_return_date(90, 5)
            
            params = {
                "originLocationCode": "JFK",  # Fixed: Use proper IATA code
                "destinationLocationCode": "LAX", 
                "departureDate": departure_date,
                "returnDate": return_date,
                "adults": 2,
                "children": 0,
                "infants": 0,
                "travelClass": "ECONOMY",
                "nonStop": False,
                "maxPrice": 1000,
                "includedAirlineCodes": ["AA", "DL"],
                "currencyCode": "USD"  # Added: Currency code for pricing
            }
            
            results = await self.client.search_flights(params)
            
            if not results or not isinstance(results, list):
                self.log_test("flight_search_response_format", False, "Invalid response format")
                return
            
            # Validate first result structure
            if len(results) > 0:
                flight = results[0]
                structure_valid = self.validate_flight_data_structure(flight)
                self.log_test("flight_data_structure", structure_valid, 
                             f"Validated {len(results)} flight results")
                
                # Test price conversion
                if 'price' in flight and 'total' in flight['price']:
                    price_valid = isinstance(flight['price']['total'], str) and float(flight['price']['total']) > 0
                    self.log_test("flight_price_validation", price_valid, 
                                 f"Price: {flight['price']['total']} {flight['price']['currency']}")
                
                # Test duration parsing
                if 'itineraries' in flight and len(flight['itineraries']) > 0:
                    duration = flight['itineraries'][0].get('duration', '')
                    duration_valid = duration.startswith('PT') and ('H' in duration or 'M' in duration)
                    self.log_test("flight_duration_format", duration_valid,
                                 f"Duration: {duration}")
            else:
                self.log_test("flight_search_response_format", False, "No results returned")
        
        except Exception as e:
            self.log_test("flight_search_validation", False, f"Exception: {str(e)}")
            traceback.print_exc()
    
    async def test_hotel_search_validation(self):
        """Test hotel search data validation"""
        try:
            # Test hotel search with actual Amadeus API parameters
            check_in_date = self.get_future_date(90)  # ~October 2025
            check_out_date = self.get_return_date(90, 3)
            
            params = {
                "cityCode": "LAX",  # Fixed: Use proper IATA city code
                "checkInDate": check_in_date,
                "checkOutDate": check_out_date, 
                "adults": 2,
                "childAges": [],
                "roomQuantity": 1,
                "ratings": [3, 4, 5],
                "amenities": ["WIFI", "POOL"],
                "radius": 50,
                "radiusUnit": "KM",
                "hotelSource": "ALL",  # Added: Hotel source parameter
                "bestRateOnly": True,   # Added: Best rate only parameter  
                "includeClosed": False, # Added: Include closed hotels parameter
                "priceRange": "0-1000"  # Added: Price range parameter
            }
            
            results = await self.client.search_hotels(params)
            
            if not results or not isinstance(results, list):
                self.log_test("hotel_search_response_format", False, "Invalid response format")
                return
            
            # Validate first result structure
            if len(results) > 0:
                hotel = results[0]
                structure_valid = self.validate_hotel_data_structure(hotel)
                self.log_test("hotel_data_structure", structure_valid,
                             f"Validated {len(results)} hotel results")
                
                # Test price validation
                if 'offers' in hotel and len(hotel['offers']) > 0:
                    offer = hotel['offers'][0]
                    if 'price' in offer and 'total' in offer['price']:
                        price_valid = isinstance(offer['price']['total'], str) and float(offer['price']['total']) > 0
                        self.log_test("hotel_price_validation", price_valid,
                                     f"Price: {offer['price']['total']} {offer['price']['currency']}")
                
                # Test coordinate validation
                if 'hotel' in hotel:
                    hotel_info = hotel['hotel']
                    lat = hotel_info.get('latitude')
                    lon = hotel_info.get('longitude')
                    coord_valid = (isinstance(lat, (int, float)) and isinstance(lon, (int, float)) and
                                  -90 <= lat <= 90 and -180 <= lon <= 180)
                    self.log_test("hotel_coordinates_validation", coord_valid,
                                 f"Coordinates: {lat}, {lon}")
            else:
                self.log_test("hotel_search_response_format", False, "No results returned")
        
        except Exception as e:
            self.log_test("hotel_search_validation", False, f"Exception: {str(e)}")
            traceback.print_exc()
    
    async def test_activity_search_validation(self):
        """Test activity search data validation"""
        try:
            # Test activity search with actual Amadeus API parameters
            start_date = self.get_future_date(90)  # ~October 2025
            end_date = self.get_return_date(90, 5)
            
            params = {
                "latitude": 34.0522,   # Fixed: Los Angeles coordinates
                "longitude": -118.2437,
                "radius": 50,
                "categories": ["SIGHTSEEING", "MUSEUMS"],
                "startDate": start_date,
                "endDate": end_date,
                "minimumDuration": "2H",
                "maximumDuration": "6H",
                "minimumPrice": 10,
                "maximumPrice": 200,
                "limit": 10,
                "currency": "USD",      # Added: Currency for pricing
                "sort": "PRICE",        # Added: Sort parameter
                "language": "en-US"     # Added: Language parameter
            }
            
            results = await self.client.search_activities(params)
            
            if not results or not isinstance(results, list):
                self.log_test("activity_search_response_format", False, "Invalid response format")
                return
            
            # Validate first result structure
            if len(results) > 0:
                activity = results[0]
                structure_valid = self.validate_activity_data_structure(activity)
                self.log_test("activity_data_structure", structure_valid,
                             f"Validated {len(results)} activity results")
                
                # Test price validation
                if 'price' in activity and 'amount' in activity['price']:
                    price_valid = isinstance(activity['price']['amount'], str) and float(activity['price']['amount']) > 0
                    self.log_test("activity_price_validation", price_valid,
                                 f"Price: {activity['price']['amount']} {activity['price']['currencyCode']}")
                
                # Test rating validation
                if 'rating' in activity:
                    rating = activity['rating']
                    rating_valid = isinstance(rating, (int, float)) and 0 <= rating <= 5
                    self.log_test("activity_rating_validation", rating_valid,
                                 f"Rating: {rating}")
            else:
                self.log_test("activity_search_response_format", False, "No results returned")
        
        except Exception as e:
            self.log_test("activity_search_validation", False, f"Exception: {str(e)}")
            traceback.print_exc()
    
    async def test_data_transformation_consistency(self):
        """Test that data transformation is consistent across different searches"""
        try:
            # Test multiple flight searches for consistency
            departure_date_1 = self.get_future_date(90)   # ~October 2025
            departure_date_2 = self.get_future_date(100)  # ~October 2025
            
            search_params = [
                {"originLocationCode": "NYC", "destinationLocationCode": "LAX", "departureDate": departure_date_1, "adults": 1},
                {"originLocationCode": "LAX", "destinationLocationCode": "NYC", "departureDate": departure_date_2, "adults": 2}
            ]
            
            all_consistent = True
            for params in search_params:
                results = await self.client.search_flights(params)
                if results and len(results) > 0:
                    for flight in results[:3]:  # Check first 3 results
                        if not self.validate_flight_data_structure(flight):
                            all_consistent = False
                            break
            
            self.log_test("flight_transformation_consistency", all_consistent,
                         "Data transformation consistent across searches")
            
            # Test hotel search consistency
            check_in_1 = self.get_future_date(90)   # ~October 2025
            check_out_1 = self.get_return_date(90, 3)
            check_in_2 = self.get_future_date(100)  # ~October 2025
            check_out_2 = self.get_return_date(100, 2)
            
            hotel_params = [
                {"cityCode": "NYC", "checkInDate": check_in_1, "checkOutDate": check_out_1, "adults": 1},
                {"cityCode": "LAX", "checkInDate": check_in_2, "checkOutDate": check_out_2, "adults": 2}
            ]
            
            hotel_consistent = True
            for params in hotel_params:
                results = await self.client.search_hotels(params)
                if results and len(results) > 0:
                    for hotel in results[:3]:  # Check first 3 results
                        if not self.validate_hotel_data_structure(hotel):
                            hotel_consistent = False
                            break
            
            self.log_test("hotel_transformation_consistency", hotel_consistent,
                         "Hotel data transformation consistent across searches")
        
        except Exception as e:
            self.log_test("data_transformation_consistency", False, f"Exception: {str(e)}")
            traceback.print_exc()
    
    async def test_error_handling(self):
        """Test error handling for invalid requests"""
        try:
            # Test invalid flight search
            past_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")  # June 2025 (past)
            invalid_params = {
                "originLocationCode": "INVALID",
                "destinationLocationCode": "ALSO_INVALID",
                "departureDate": past_date,  # Past date
                "adults": 0  # Invalid adult count
            }
            
            try:
                results = await self.client.search_flights(invalid_params)
                # Should either return empty results or raise an exception
                error_handled = results is None or len(results) == 0
                self.log_test("flight_error_handling", error_handled,
                             "Invalid flight search handled gracefully")
            except Exception:
                self.log_test("flight_error_handling", True,
                             "Invalid flight search raised appropriate exception")
            
            # Test invalid hotel search
            past_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")  # June 2025 (past)
            invalid_hotel_params = {
                "cityCode": "INVALID",
                "checkInDate": past_date,  # Past date
                "checkOutDate": past_date,
                "adults": 0  # Invalid adult count
            }
            
            try:
                results = await self.client.search_hotels(invalid_hotel_params)
                error_handled = results is None or len(results) == 0
                self.log_test("hotel_error_handling", error_handled,
                             "Invalid hotel search handled gracefully")
            except Exception:
                self.log_test("hotel_error_handling", True,
                             "Invalid hotel search raised appropriate exception")
        
        except Exception as e:
            self.log_test("error_handling", False, f"Exception: {str(e)}")
            traceback.print_exc()
    
    async def run_all_tests(self):
        """Run all validation tests"""
        print("🧪 Starting Amadeus API Validation Tests")
        print("=" * 50)
        
        # Run individual tests
        await self.test_flight_search_validation()
        await self.test_hotel_search_validation()
        await self.test_activity_search_validation()
        await self.test_data_transformation_consistency()
        await self.test_error_handling()
        
        # Generate summary
        print("\n📊 Test Summary")
        print("=" * 20)
        
        passed_tests = sum(1 for result in self.test_results if result['passed'])
        total_tests = len(self.test_results)
        
        print(f"Tests passed: {passed_tests}/{total_tests}")
        print(f"Success rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if passed_tests == total_tests:
            print("🎉 All tests passed!")
            return True
        else:
            print("❌ Some tests failed:")
            for result in self.test_results:
                if not result['passed']:
                    print(f"  - {result['test']}: {result['message']}")
            return False

async def main():
    """Main test runner"""
    tester = AmadeusValidationTest()
    
    try:
        success = await tester.run_all_tests()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Test suite failed: {str(e)}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 