'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Plane, RotateCcw, Building2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'travelagentic-flight-test';

interface FlightMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  data?: any;
}

interface FlightOption {
  id?: string; // Added for Amadeus format
  airline?: string;
  flight_number?: string;
  departure_time?: string;
  arrival_time?: string;
  duration?: string;
  price?: { total: number; currency: string } | number;
  totalPrice?: number;
  stops?: number;
  origin?: string;
  destination?: string;
  itineraries?: any[]; // Added for Amadeus data
  segments?: any[]; // Added for Amadeus data
  departure?: { at: string }; // Added for Amadeus data
  arrival?: { at: string }; // Added for Amadeus data
}

interface HotelOption {
  id?: string;
  name?: string;
  address?: string;
  city?: string;
  rating?: number | { score: number; reviewCount: number }; // Support both formats
  price?: number | { total: number; currency: string } | { amount: number; currency: string }; // Support all formats
  totalPrice?: number;
  checkIn?: string;
  checkOut?: string;
  roomType?: string;
  amenities?: string[];
  description?: string;
  images?: string[];
  location?: { lat: number; lng: number } | { address: string; city: string; coordinates: { latitude: number; longitude: number } }; // Support both formats
  policies?: { checkIn: string; checkOut: string }; // Added for Amadeus format
  roomTypes?: { name: string; bedType: string; description: string }[]; // Added for Amadeus format
}

interface ActivityOption {
  id?: string;
  name?: string;
  description?: string;
  price?: number | { total: number; currency: string };
  totalPrice?: number;
  location?: { lat: number; lng: number } | { address: string; city: string; coordinates: { latitude: number; longitude: number } };
  images?: string[];
  rating?: number | { score: number; reviewCount: number };
  duration?: string;
  category?: string;
  highlights?: string[];
}

export default function TestPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'activities'>('flights');

  // Flight state
  const [currentFlights, setCurrentFlights] = useState<FlightOption[]>([]);
  const [recommendedFlight, setRecommendedFlight] = useState<FlightOption | null>(null);
  
  // Hotel state
  const [currentHotels, setCurrentHotels] = useState<HotelOption[]>([]);
  const [recommendedHotel, setRecommendedHotel] = useState<HotelOption | null>(null);
  
  // Activity state
  const [currentActivities, setCurrentActivities] = useState<ActivityOption[]>([]);
  const [recommendedActivity, setRecommendedActivity] = useState<ActivityOption | null>(null);
  
  // Shared state
  const [flightMessages, setFlightMessages] = useState<FlightMessage[]>([]);
  const [hotelMessages, setHotelMessages] = useState<FlightMessage[]>([]);
  const [activityMessages, setActivityMessages] = useState<FlightMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Tab-specific loading states
  const [flightLoading, setFlightLoading] = useState(false);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  // Get current messages based on active tab
  const getCurrentMessages = () => {
    switch (activeTab) {
      case 'flights': return flightMessages;
      case 'hotels': return hotelMessages;
      case 'activities': return activityMessages;
      default: return flightMessages;
    }
  };

  // Set current messages based on active tab
  const setCurrentMessages = (messages: FlightMessage[]) => {
    switch (activeTab) {
      case 'flights': setFlightMessages(messages); break;
      case 'hotels': setHotelMessages(messages); break;
      case 'activities': setActivityMessages(messages); break;
    }
  };

  // Get current loading state based on active tab
  const isLoading = (() => {
    switch (activeTab) {
      case 'flights': return flightLoading;
      case 'hotels': return hotelLoading;
      case 'activities': return activityLoading;
      default: return flightLoading;
    }
  })();

  // Set current loading state based on active tab
  const setIsLoading = (loading: boolean) => {
    switch (activeTab) {
      case 'flights': setFlightLoading(loading); break;
      case 'hotels': setHotelLoading(loading); break;
      case 'activities': setActivityLoading(loading); break;
    }
  };

  // Add message to current tab
  const addMessage = (type: 'user' | 'assistant' | 'system', content: string, data?: any) => {
    const message: FlightMessage = {
      id: generateId(),
      type,
      content,
      data,
      timestamp: new Date().toISOString(),
    };

    switch (activeTab) {
      case 'flights':
        setFlightMessages(prev => [...prev, message]);
        break;
      case 'hotels':
        setHotelMessages(prev => [...prev, message]);
        break;
      case 'activities':
        setActivityMessages(prev => [...prev, message]);
        break;
    }
  };

  // Generate unique ID for messages to prevent key collisions
  const generateId = () => {
    // Use crypto.randomUUID if available, otherwise fallback to timestamp + random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setFlightMessages(data.flightMessages || []);
        setHotelMessages(data.hotelMessages || []);
        setActivityMessages(data.activityMessages || []);
        setCurrentFlights(data.flights || []);
        setRecommendedFlight(data.recommended || null);
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    }
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (flightMessages.length > 0 || hotelMessages.length > 0 || activityMessages.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        flightMessages,
        hotelMessages,
        activityMessages,
        flights: currentFlights,
        recommended: recommendedFlight,
        timestamp: new Date().toISOString()
      }));
    }
  }, [flightMessages, hotelMessages, activityMessages, currentFlights, recommendedFlight]);

  const searchFlights = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    addMessage('user', message);

    try {
      const response = await fetch('/api/test/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          automation_level: 2
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'flight_search_started') {
                addMessage('system', parsed.message);
              } else if (parsed.type === 'city_conversion') {
                addMessage('system', parsed.message);
              } else if (parsed.type === 'flight_options_presented') {
                addMessage('assistant', parsed.message);
                
                if (parsed.flights) {
                  setCurrentFlights(parsed.flights);
                }
                
                if (parsed.recommended) {
                  setRecommendedFlight(parsed.recommended);
                }
              }
            } catch (parseError) {
              console.error('Error parsing JSON:', parseError, 'Data:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in searchFlights:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const searchHotels = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    addMessage('user', message);

    try {
      const response = await fetch('/api/test/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          automation_level: 2
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'hotel_search_started') {
                addMessage('system', parsed.message);
              } else if (parsed.type === 'city_conversion') {
                addMessage('system', parsed.message);
              } else if (parsed.type === 'hotel_options_presented') {
                addMessage('assistant', parsed.message);
                
                if (parsed.hotels) {
                  setCurrentHotels(parsed.hotels);
                }
                
                if (parsed.recommended) {
                  setRecommendedHotel(parsed.recommended);
                }
              }
            } catch (parseError) {
              console.error('Error parsing JSON:', parseError, 'Data:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in searchHotels:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const searchActivities = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    addMessage('user', message);

    try {
      const response = await fetch('/api/test/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          automation_level: 2
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'activity_search_started') {
                addMessage('system', parsed.message);
              } else if (parsed.type === 'city_conversion') {
                addMessage('system', parsed.message);
              } else if (parsed.type === 'activity_options_presented') {
                addMessage('assistant', parsed.message);
                
                if (parsed.activities) {
                  setCurrentActivities(parsed.activities);
                }
                
                if (parsed.recommended) {
                  setRecommendedActivity(parsed.recommended);
                }
              }
            } catch (parseError) {
              console.error('Error parsing JSON:', parseError, 'Data:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in searchActivities:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlightEvent = (data: any) => {
    switch (data.type) {
      case 'flight_search_started':
        addMessage('assistant', data.message);
        break;
      
      case 'city_conversion':
        addMessage('assistant', `✈️ ${data.message}`);
        break;
      
      case 'flight_options_presented':
        const flights = data.flights || [];
        const recommended = data.recommended;
        
        setCurrentFlights(flights);
        setRecommendedFlight(recommended);
        
        let message = data.message;
        if (recommended) {
          message += `\n\n🎯 **Recommended**: ${recommended.airline || 'Unknown'} ${recommended.flight_number || ''} - $${getFlightPrice(recommended)}`;
        }
        
        addMessage('assistant', message, { flights, recommended });
        break;
      
      case 'flight_search_complete':
        addMessage('assistant', data.message);
        break;
      
      case 'error':
        addMessage('system', `Error: ${data.message}`);
        setError(data.message);
        break;
      
      default:
        if (data.message) {
          addMessage('assistant', data.message);
        }
    }
  };

  const getFlightPrice = (flight: FlightOption): string => {
    if (typeof flight.price === 'number') return flight.price.toString();
    if (flight.price?.total) return flight.price.total.toString();
    if (flight.totalPrice) return flight.totalPrice.toString();
    return 'N/A';
  };

  // Airport code to timezone mapping
  const airportTimezoneMap: Record<string, string> = {
    // North America - Eastern
    'JFK': 'EST', 'LGA': 'EST', 'EWR': 'EST', 'BOS': 'EST', 'DCA': 'EST', 'IAD': 'EST', 'BWI': 'EST',
    'ATL': 'EST', 'MIA': 'EST', 'MCO': 'EST', 'TPA': 'EST', 'PHL': 'EST', 'BNA': 'EST', 'CLT': 'EST',
    
    // North America - Central  
    'ORD': 'CST', 'DFW': 'CST', 'IAH': 'CST', 'MSP': 'CST', 'DTW': 'CST', 'MSY': 'CST', 'AUS': 'CST',
    'MEM': 'CST', 'OKC': 'CST', 'SAT': 'CST', 'HOU': 'CST',
    
    // North America - Mountain
    'DEN': 'MST', 'PHX': 'MST', 'SLC': 'MST', 'ABQ': 'MST',
    
    // North America - Pacific
    'LAX': 'PST', 'SFO': 'PST', 'SEA': 'PST', 'PDX': 'PST', 'SAN': 'PST', 'LAS': 'PST', 'SJC': 'PST',
    
    // Canada
    'YYZ': 'EST', 'YVR': 'PST', 'YUL': 'EST', 'YYC': 'MST', 'YOW': 'EST',
    
    // Europe
    'LHR': 'GMT', 'LGW': 'GMT', 'STN': 'GMT', 'CDG': 'CET', 'ORY': 'CET', 'FRA': 'CET', 'MUC': 'CET',
    'AMS': 'CET', 'BRU': 'CET', 'ZUR': 'CET', 'VIE': 'CET', 'CPH': 'CET', 'ARN': 'CET', 'OSL': 'CET',
    'MAD': 'CET', 'BCN': 'CET', 'FCO': 'CET', 'MXP': 'CET', 'ATH': 'EET', 'IST': 'TRT',
    
    // Asia
    'NRT': 'JST', 'HND': 'JST', 'ICN': 'KST', 'PVG': 'CST', 'PEK': 'CST', 'HKG': 'HKT', 'SIN': 'SGT',
    'BKK': 'ICT', 'KUL': 'MYT', 'DEL': 'IST', 'BOM': 'IST',
    
    // Australia
    'SYD': 'AEST', 'MEL': 'AEST', 'BNE': 'AEST', 'PER': 'AWST',
    
    // Middle East
    'DXB': 'GST', 'DOH': 'AST', 'AUH': 'GST',
  };

  // Helper function to format date/time with timezone
  const formatDateTime = (dateTimeString: string, airportCode?: string): string => {
    try {
      const dateTime = new Date(dateTimeString);
      const timezone = airportCode ? airportTimezoneMap[airportCode] : undefined;
      
      const formattedTime = dateTime.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      return timezone ? `${formattedTime} ${timezone}` : formattedTime;
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Airport code to city mapping
  const airportCityMap: Record<string, string> = {
    // North America
    'ATL': 'Atlanta',
    'LAX': 'Los Angeles', 
    'ORD': 'Chicago',
    'DFW': 'Dallas',
    'DEN': 'Denver',
    'JFK': 'New York',
    'LGA': 'New York',
    'EWR': 'New York',
    'SFO': 'San Francisco',
    'SEA': 'Seattle',
    'MIA': 'Miami',
    'LAS': 'Las Vegas',
    'PHX': 'Phoenix',
    'IAH': 'Houston',
    'MCO': 'Orlando',
    'BOS': 'Boston',
    'MSP': 'Minneapolis',
    'DTW': 'Detroit',
    'PHL': 'Philadelphia',
    'BWI': 'Baltimore',
    'DCA': 'Washington DC',
    'IAD': 'Washington DC',
    'PDX': 'Portland',
    'SLC': 'Salt Lake City',
    'MSY': 'New Orleans',
    'AUS': 'Austin',
    'SAN': 'San Diego',
    'TPA': 'Tampa',
    'BNA': 'Nashville',
    'STL': 'St. Louis',
    'CVG': 'Cincinnati',
    'CLE': 'Cleveland',
    'PIT': 'Pittsburgh',
    'MCI': 'Kansas City',
    'IND': 'Indianapolis',
    'MKE': 'Milwaukee',
    'RDU': 'Raleigh',
    'JAX': 'Jacksonville',
    'ABQ': 'Albuquerque',
    'OMA': 'Omaha',
    'SMF': 'Sacramento',
    'SJC': 'San Jose',
    'OAK': 'Oakland',
    'BUR': 'Burbank',
    'MDW': 'Chicago',
    'HOU': 'Houston',
    'DAL': 'Dallas',
    
    // Canada
    'YYZ': 'Toronto',
    'YUL': 'Montreal',
    'YVR': 'Vancouver',
    'YYC': 'Calgary',
    'YWG': 'Winnipeg',
    'YOW': 'Ottawa',
    'YQB': 'Quebec City',
    'YHZ': 'Halifax',
    'YEG': 'Edmonton',
    
    // Europe
    'LHR': 'London',
    'LGW': 'London',
    'STN': 'London',
    'CDG': 'Paris',
    'ORY': 'Paris',
    'FRA': 'Frankfurt',
    'MUC': 'Munich',
    'AMS': 'Amsterdam',
    'BCN': 'Barcelona',
    'MAD': 'Madrid',
    'FCO': 'Rome',
    'MXP': 'Milan',
    'ZUR': 'Zurich',
    'VIE': 'Vienna',
    'BRU': 'Brussels',
    'CPH': 'Copenhagen',
    'ARN': 'Stockholm',
    'OSL': 'Oslo',
    'HEL': 'Helsinki',
    'WAW': 'Warsaw',
    'PRG': 'Prague',
    'BUD': 'Budapest',
    'ATH': 'Athens',
    'IST': 'Istanbul',
    'DUB': 'Dublin',
    'EDI': 'Edinburgh',
    'MAN': 'Manchester',
    'LIS': 'Lisbon',
    
    // Asia
    'NRT': 'Tokyo',
    'HND': 'Tokyo',
    'ICN': 'Seoul',
    'PEK': 'Beijing',
    'PVG': 'Shanghai',
    'HKG': 'Hong Kong',
    'SIN': 'Singapore',
    'BKK': 'Bangkok',
    'KUL': 'Kuala Lumpur',
    'CGK': 'Jakarta',
    'MNL': 'Manila',
    'TPE': 'Taipei',
    'BOM': 'Mumbai',
    'DEL': 'Delhi',
    'DXB': 'Dubai',
    'DOH': 'Doha',
    'KWI': 'Kuwait City',
    'RUH': 'Riyadh',
    'JED': 'Jeddah',
    
    // Australia/Oceania
    'SYD': 'Sydney',
    'MEL': 'Melbourne',
    'BNE': 'Brisbane',
    'PER': 'Perth',
    'AKL': 'Auckland',
    'CHC': 'Christchurch',
    
    // South America
    'GRU': 'São Paulo',
    'GIG': 'Rio de Janeiro',
    'EZE': 'Buenos Aires',
    'SCL': 'Santiago',
    'LIM': 'Lima',
    'BOG': 'Bogotá',
    'UIO': 'Quito',
    'CCS': 'Caracas',
    
    // Africa
    'JNB': 'Johannesburg',
    'CPT': 'Cape Town',
    'CAI': 'Cairo',
    'LOS': 'Lagos',
    'ADD': 'Addis Ababa',
    'NBO': 'Nairobi',
    'CAS': 'Casablanca',
    'TUN': 'Tunis',
    'ALG': 'Algiers',
  };

  const getAirportName = (code: string): string => {
    return airportCityMap[code] || code;
  };

  // Helper functions to extract data from Amadeus flight offers
  const getFlightAirline = (flight: FlightOption): string => {
    if (flight.airline) return flight.airline; // Legacy format
    
    // Extract from Amadeus format
    if (flight.itineraries?.[0]?.segments?.[0]?.carrierCode) {
      const carrierCode = flight.itineraries[0].segments[0].carrierCode;
      // Try to get airline name from dictionaries if available
      return carrierCode; // For now, just return the code
    }
    return 'Unknown Airline';
  };

  const getFlightNumber = (flight: FlightOption): string => {
    if (flight.flight_number) return flight.flight_number; // Legacy format
    
    // Extract from Amadeus format - avoid duplicate airline codes
    if (flight.itineraries?.[0]?.segments?.[0]?.number) {
      return flight.itineraries[0].segments[0].number;
    }
    return 'N/A';
  };

  const getFlightRoute = (flight: FlightOption): string => {
    if (flight.itineraries?.[0]?.segments) {
      const outboundSegments = flight.itineraries[0].segments;
      let routeStr = '';
      
      // Outbound route
      if (outboundSegments.length === 1) {
        routeStr = `${outboundSegments[0].departure.iataCode} → ${outboundSegments[0].arrival.iataCode}`;
      } else {
        const cities = outboundSegments.map((seg: any) => seg.departure.iataCode);
        cities.push(outboundSegments[outboundSegments.length - 1].arrival.iataCode);
        routeStr = cities.join(' → ');
    }

      // Return route (if exists) - on new line with reverse flow
      if (flight.itineraries?.[1]?.segments) {
        const returnSegments = flight.itineraries[1].segments;
        routeStr += '\nReturn: ';
        if (returnSegments.length === 1) {
          routeStr += `${returnSegments[0].departure.iataCode} → ${returnSegments[0].arrival.iataCode}`;
        } else {
          const returnCities = returnSegments.map((seg: any) => seg.departure.iataCode);
          returnCities.push(returnSegments[returnSegments.length - 1].arrival.iataCode);
          routeStr += returnCities.join(' → ');
        }
      }
      
      return routeStr;
    }
    return 'Route unknown';
  };

  const getStopDetails = (flight: FlightOption): string => {
    if (flight.itineraries?.[0]?.segments) {
      const outboundSegments = flight.itineraries[0].segments;
      let details = '';
      
      // Outbound stops
      if (outboundSegments.length === 1) {
        details = 'Direct outbound';
      } else {
        const stops = outboundSegments.slice(0, -1).map((seg: any) => 
          airportCityMap[seg.arrival.iataCode] || seg.arrival.iataCode
        );
        details = `${outboundSegments.length - 1} stop${outboundSegments.length > 2 ? 's' : ''} outbound via ${stops.join(', ')}`;
      }
      
      // Return stops (if exists) - on new line
      if (flight.itineraries?.[1]?.segments) {
        const returnSegments = flight.itineraries[1].segments;
        details += '\n';
        if (returnSegments.length === 1) {
          details += 'Direct return';
        } else {
          const returnStops = returnSegments.slice(0, -1).map((seg: any) => 
            airportCityMap[seg.arrival.iataCode] || seg.arrival.iataCode
          );
          details += `${returnSegments.length - 1} stop${returnSegments.length > 2 ? 's' : ''} return via ${returnStops.join(', ')}`;
        }
      }
      
      return details;
    }
    return 'Stop details unknown';
  };

  const getFlightTimes = (flight: FlightOption): { departure: string; arrival: string; returnDeparture?: string; returnArrival?: string } => {
    const result: { departure: string; arrival: string; returnDeparture?: string; returnArrival?: string } = {
      departure: 'Unknown',
      arrival: 'Unknown'
    };
    
    if (flight.itineraries?.[0]?.segments) {
      const outboundSegments = flight.itineraries[0].segments;
      const departureTime = outboundSegments[0].departure.at;
      const arrivalTime = outboundSegments[outboundSegments.length - 1].arrival.at;
      
      result.departure = formatDateTime(departureTime, outboundSegments[0].departure.iataCode);
      result.arrival = formatDateTime(arrivalTime, outboundSegments[outboundSegments.length - 1].arrival.iataCode);
      
      // Return flight times (if exists)
      if (flight.itineraries?.[1]?.segments) {
        const returnSegments = flight.itineraries[1].segments;
        const returnDepartureTime = returnSegments[0].departure.at;
        const returnArrivalTime = returnSegments[returnSegments.length - 1].arrival.at;
        
        result.returnDeparture = formatDateTime(returnDepartureTime, returnSegments[0].departure.iataCode);
        result.returnArrival = formatDateTime(returnArrivalTime, returnSegments[returnSegments.length - 1].arrival.iataCode);
      }
    }
    
    return result;
  };

  // Hotel helper functions
  const getHotelName = (hotel: HotelOption): string => {
    return hotel.name || 'Unknown Hotel';
  };

  const getHotelPrice = (hotel: HotelOption): string => {
    // Handle Amadeus format
    if (hotel.price && typeof hotel.price === 'object' && 'amount' in hotel.price) {
      return Math.round(hotel.price.amount / 5).toString(); // Convert 5-night total to per night
    }
    if (typeof hotel.price === 'number') return hotel.price.toString();
    if (hotel.price && typeof hotel.price === 'object' && 'total' in hotel.price) {
      return hotel.price.total.toString();
    }
    if (hotel.totalPrice) return hotel.totalPrice.toString();
    return 'N/A';
  };

  const getHotelLocation = (hotel: HotelOption): string => {
    // Handle Amadeus format
    if (hotel.location && 'address' in hotel.location) {
      const loc = hotel.location as { address: string; city: string };
      return `${loc.address}, ${loc.city}`;
    }
    if (hotel.location && 'address' in hotel.location) {
      const loc = hotel.location as { address: string };
      return loc.address;
    }
    if (hotel.location && 'city' in hotel.location) {
      const loc = hotel.location as { city: string };
      return loc.city;
    }
    
    // Fallback to legacy format
    if (hotel.address && hotel.city) {
      return `${hotel.address}, ${hotel.city}`;
    }
    return hotel.address || hotel.city || 'Location unknown';
  };

  const getHotelRating = (hotel: HotelOption): string => {
    // Handle Amadeus format
    if (hotel.rating && typeof hotel.rating === 'object' && 'score' in hotel.rating && hotel.rating.score) {
      return `${hotel.rating.score}/5 ⭐`;
    }
    if (hotel.rating && typeof hotel.rating === 'object' && 'reviewCount' in hotel.rating && hotel.rating.reviewCount) {
      return `${hotel.rating.reviewCount} reviews`;
    }
    
    // Fallback to legacy format
    if (typeof hotel.rating === 'number') {
      return `${hotel.rating}/5 ⭐`;
    }
    return 'No rating';
  };

  const getHotelStay = (hotel: HotelOption): string => {
    // Handle Amadeus format
    if (hotel.policies?.checkIn && hotel.policies?.checkOut) {
      return `${formatDateTime(hotel.policies.checkIn)} → ${formatDateTime(hotel.policies.checkOut)}`;
    }
    
    // Fallback to legacy format
    if (hotel.checkIn && hotel.checkOut) {
      return `${formatDateTime(hotel.checkIn)} → ${formatDateTime(hotel.checkOut)}`;
    }
    return 'Dates not specified';
  };

  const getHotelAmenities = (hotel: HotelOption): string => {
    // Handle Amadeus format
    if (hotel.amenities && hotel.amenities.length > 0) {
      return hotel.amenities.slice(0, 3).join(', ') + (hotel.amenities.length > 3 ? '...' : '');
    }
    
    // Handle room type amenities from Amadeus
    if (hotel.roomTypes && hotel.roomTypes.length > 0) {
      const roomType = hotel.roomTypes[0];
      if (roomType.description) {
        // Extract key amenities from description
        const amenities = [];
        if (roomType.description.includes('WiFi')) amenities.push('WiFi');
        if (roomType.description.includes('Breakfast')) amenities.push('Breakfast');
        if (roomType.description.includes('Gym')) amenities.push('Gym');
        if (roomType.description.includes('Pool')) amenities.push('Pool');
        
        return amenities.length > 0 ? amenities.join(', ') : 'Standard amenities';
      }
    }
    
    return 'No amenities listed';
  };

  const getHotelRoomType = (hotel: HotelOption): string => {
    // Handle Amadeus format
    if (hotel.roomTypes && hotel.roomTypes.length > 0) {
      const roomType = hotel.roomTypes[0];
      if (roomType.bedType && roomType.bedType !== 'Unknown') {
        return `${roomType.bedType} Room`;
      }
      if (roomType.name) {
        return roomType.name;
      }
    }
    
    // Fallback to legacy format
    return hotel.roomType || 'Standard Room';
  };

  const getFlightDuration = (flight: FlightOption): string => {
    if (flight.duration) return flight.duration; // Legacy format
    
    // Extract from Amadeus format
    if (flight.itineraries?.[0]?.duration) {
      const duration = flight.itineraries[0].duration;
      // Convert ISO 8601 duration (PT2H30M) to readable format
      const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      if (matches) {
        const hours = parseInt(matches[1] || '0');
        const minutes = parseInt(matches[2] || '0');
        return `${hours}h ${minutes}m`;
      }
    }
    return 'N/A';
  };

  const getFlightStops = (flight: FlightOption): number => {
    if (typeof flight.stops === 'number') return flight.stops; // Legacy format
    
    // Extract from Amadeus format
    if (flight.itineraries?.[0]?.segments) {
      return flight.itineraries[0].segments.length - 1;
    }
    return 0;
  };

  const getAircraftInfo = (flight: FlightOption): string => {
    if (flight.itineraries?.[0]?.segments?.[0]?.aircraft?.code) {
      return flight.itineraries[0].segments[0].aircraft.code;
    }
    return '';
  };

  // Activity helper functions
  const getActivityName = (activity: ActivityOption): string => {
    return activity.name || 'Unknown Activity';
  };

  const getActivityDescription = (activity: ActivityOption): string => {
    return activity.description || 'No description available';
  };

  const getActivityPrice = (activity: ActivityOption): string => {
    if (typeof activity.price === 'number') return activity.price.toString();
    if (activity.price && typeof activity.price === 'object' && 'total' in activity.price) {
      return activity.price.total.toString();
    }
    if (activity.totalPrice) return activity.totalPrice.toString();
    return 'N/A';
  };

  const getActivityLocation = (activity: ActivityOption): string => {
    if (activity.location && 'address' in activity.location) {
      const loc = activity.location as { address: string; city: string };
      return `${loc.address}, ${loc.city}`;
    }
    if (activity.location && 'address' in activity.location) {
      const loc = activity.location as { address: string };
      return loc.address;
    }
    if (activity.location && 'city' in activity.location) {
      const loc = activity.location as { city: string };
      return loc.city;
    }
    return 'Location unknown';
  };

  const getActivityRating = (activity: ActivityOption): string => {
    if (activity.rating && typeof activity.rating === 'object' && 'score' in activity.rating && activity.rating.score) {
      return `${activity.rating.score}/5 ⭐`;
    }
    if (activity.rating && typeof activity.rating === 'object' && 'reviewCount' in activity.rating && activity.rating.reviewCount) {
      return `${activity.rating.reviewCount} reviews`;
    }
    return 'No rating';
  };

  const getActivityDuration = (activity: ActivityOption): string => {
    return activity.duration || 'N/A';
  };

  const getActivityCategory = (activity: ActivityOption): string => {
    return activity.category || 'Uncategorized';
  };

  const getActivityHighlights = (activity: ActivityOption): string => {
    if (activity.highlights && activity.highlights.length > 0) {
      return activity.highlights.slice(0, 3).join(', ') + (activity.highlights.length > 3 ? '...' : '');
    }
    return 'No highlights';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      searchFlights(inputMessage);
      setInputMessage('');
    }
  };

  const clearConversation = () => {
    setFlightMessages([]);
    setHotelMessages([]);
    setActivityMessages([]);
    setCurrentFlights([]);
    setRecommendedFlight(null);
    setCurrentHotels([]);
    setRecommendedHotel(null);
    setCurrentActivities([]);
    setRecommendedActivity(null);
    setError(null);
    setInputMessage('');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Plane className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Travel Agent Test
            </h1>
          </div>
          <p className="text-gray-600 mb-4">
            Testing travel search with automation level 2 (guided selection)
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="bg-blue-50">
              <Plane className="h-3 w-3 mr-1" />
              Multi-Service Testing
          </Badge>
            <Button
              onClick={clearConversation}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
              <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
          </div>
        )}

        {/* Local Storage Info */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <span className="font-medium">💾 Local Storage:</span>
            <span>Conversations saved locally • No database required</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'flights' | 'hotels' | 'activities')} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          <TabsContent value="flights">
              <div className="mb-4 text-center">
                <Badge variant="outline" className="bg-blue-50">
                  <Plane className="h-3 w-3 mr-1" />
                  Flight Search Testing
                </Badge>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                      Flight Search Chat
                </CardTitle>
              </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                      {getCurrentMessages().length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Plane className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>Start by describing your flight needs</p>
                          <p className="text-sm mt-2">Try this example:</p>
                      <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 text-xs bg-white hover:bg-gray-50 border-gray-300"
                            onClick={() => {
                              const exampleText = "Flight from New York to London, September 15-20, 2 people, budget $2000";
                              searchFlights(exampleText);
                            }}
                        disabled={isLoading}
                      >
                            "Flight from New York to London, September 15-20, 2 people, budget $2000"
                      </Button>
                        </div>
                      ) : (
                        getCurrentMessages().map((message) => (
                          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.type === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : message.type === 'system'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-white text-gray-800'
                            }`}>
                              <pre className="whitespace-pre-wrap text-sm">{message.content}</pre>
                              {message.data?.flights && (
                                <div className="mt-2 text-xs opacity-75">
                                  Found {message.data.flights.length} flight options
                                </div>
                              )}
                        </div>
                        </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white text-gray-800 px-4 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                              <span>Searching flights...</span>
                      </div>
                    </div>
                        </div>
                  )}
                </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Describe your flight needs..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                        Search
                      </Button>
                    </form>
                  </CardContent>
            </Card>
          </div>

              {/* Flight Results */}
              <div className="lg:col-span-1">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      Flight Options
                </CardTitle>
              </CardHeader>
                  
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    {currentFlights.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-4">✈️</div>
                        <p>No flights found yet</p>
                        <p className="text-sm mt-2">Search for flights to see options</p>
                    </div>
                    ) : (
                      <div className="space-y-4">
                        {currentFlights.map((flight, index) => {
                          const isRecommended = recommendedFlight?.id === flight.id;
                          return (
                            <div key={flight.id || `flight-${index}`} className={`p-4 rounded-lg border overflow-hidden ${
                              isRecommended ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}>
                              {isRecommended && (
                                <Badge className="mb-2 bg-blue-500">Recommended</Badge>
                              )}
                              <div className="space-y-2 min-w-0">
                                <div className="font-medium text-sm break-words">
                                  {getFlightAirline(flight)}{getFlightNumber(flight)}
                  </div>
                                <div className="font-medium text-blue-600 whitespace-pre-line text-sm break-words">
                                  {getFlightRoute(flight)}
                    </div>
                                <div className="text-xs text-gray-600 break-words">
                                  Departure: {getFlightTimes(flight).departure}
                  </div>
                                <div className="text-xs text-gray-600 break-words">
                                  Arrival: {getFlightTimes(flight).arrival}
                    </div>
                                {getFlightTimes(flight).returnDeparture && (
                                  <>
                                    <div className="text-xs text-gray-600 font-medium break-words">
                                      Return Departure: {getFlightTimes(flight).returnDeparture}
                  </div>
                                    <div className="text-xs text-gray-600 font-medium break-words">
                                      Return Arrival: {getFlightTimes(flight).returnArrival}
                    </div>
                                  </>
                                )}
                                <div className="text-xs text-gray-600">
                                  Duration: {getFlightDuration(flight)}
                  </div>
                                <div className="text-xs text-gray-600">
                                  Stops: {getFlightStops(flight)}
                </div>
                                <div className="text-xs text-gray-600 whitespace-pre-line break-words">
                                  {getStopDetails(flight)}
                    </div>
                                <div className="text-xs text-gray-600">
                                  Aircraft: {getAircraftInfo(flight)}
                    </div>
                                <div className="text-lg font-semibold text-green-600">
                                  ${getFlightPrice(flight)}
                  </div>
                </div>
                    </div>
                          );
                        })}
                  </div>
                )}
              </CardContent>
            </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="hotels">
            <div className="mb-4 text-center">
              <Badge variant="outline" className="bg-green-50">
                <Building2 className="h-3 w-3 mr-1" />
                Hotel Search Testing
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
              <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Hotel Search Chat
                    </CardTitle>
              </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                      {getCurrentMessages().length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>Start by describing your hotel needs</p>
                          <p className="text-sm mt-2">Try this example:</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 text-xs bg-white hover:bg-gray-50 border-gray-300"
                            onClick={() => {
                              const exampleText = "Hotel in London, September 15-20, 2 guests, budget $200/night";
                              searchHotels(exampleText);
                            }}
                            disabled={isLoading}
                          >
                            "Hotel in London, September 15-20, 2 guests, budget $200/night"
                          </Button>
                  </div>
                ) : (
                        getCurrentMessages().map((message) => (
                          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.type === 'user' 
                                ? 'bg-green-500 text-white' 
                                : message.type === 'system'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-white text-gray-800'
                            }`}>
                              <pre className="whitespace-pre-wrap text-sm">{message.content}</pre>
                              {message.data?.hotels && (
                                <div className="mt-2 text-xs opacity-75">
                                  Found {message.data.hotels.length} hotel options
                              </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white text-gray-800 px-4 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full" />
                              <span>Searching hotels...</span>
                              </div>
                            </div>
                        </div>
                      )}
                          </div>
                          
                    {/* Input */}
                    <form onSubmit={(e) => { e.preventDefault(); searchHotels(inputMessage); setInputMessage(''); }} className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Describe your hotel needs..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                        Search
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                          </div>

              {/* Hotel Results */}
              <div className="lg:col-span-1">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Hotel Options
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    {currentHotels.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-4">🏨</div>
                        <p>No hotels found yet</p>
                        <p className="text-sm mt-2">Search for hotels to see options</p>
                              </div>
                    ) : (
                      <div className="space-y-4">
                        {currentHotels.map((hotel, index) => {
                          const isRecommended = recommendedHotel?.id === hotel.id;
                          return (
                            <div key={hotel.id || `hotel-${index}`} className={`p-4 rounded-lg border overflow-hidden ${
                              isRecommended ? 'border-green-500 bg-green-50' : 'border-gray-200'
                            }`}>
                              {isRecommended && (
                                <Badge className="mb-2 bg-green-500">Recommended</Badge>
                              )}
                              <div className="space-y-2 min-w-0">
                                <div className="font-medium text-sm break-words">
                                  {getHotelName(hotel)}
                                </div>
                                <div className="text-xs text-gray-600 break-words">
                                  {getHotelLocation(hotel)}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {getHotelRating(hotel)}
                                </div>
                                <div className="text-xs text-gray-600 break-words">
                                  Stay: {getHotelStay(hotel)}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Room: {getHotelRoomType(hotel)}
                                </div>
                                <div className="text-xs text-gray-600 break-words">
                                  Amenities: {getHotelAmenities(hotel)}
                                </div>
                                <div className="text-lg font-semibold text-green-600">
                                  ${getHotelPrice(hotel)}/night
                                </div>
                              </div>
                            </div>
                          );
                        })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="activities">
          <div className="mb-4 text-center">
            <Badge variant="outline" className="bg-purple-50">
              <MessageCircle className="h-3 w-3 mr-1" />
              Activity Search Testing
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Activity Search Chat
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                    {getCurrentMessages().length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Start by describing your activity needs</p>
                        <p className="text-sm mt-2">Try this example:</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 text-xs bg-white hover:bg-gray-50 border-gray-300"
                          onClick={() => {
                            const exampleText = "Museums and food experiences in London, September 15-20, 2 guests, budget $50/person";
                            searchActivities(exampleText);
                          }}
                          disabled={isLoading}
                        >
                          "Museums and food experiences in London, September 15-20, 2 guests, budget $50/person"
                        </Button>
                      </div>
                    ) : (
                      getCurrentMessages().map((message) => (
                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === 'user' 
                              ? 'bg-purple-500 text-white' 
                              : message.type === 'system'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-white text-gray-800'
                          }`}>
                            <pre className="whitespace-pre-wrap text-sm">{message.content}</pre>
                            {message.data?.activities && (
                              <div className="mt-2 text-xs opacity-75">
                                Found {message.data.activities.length} activity options
                  </div>
                )}
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white text-gray-800 px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                            <span>Searching activities...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <form onSubmit={(e) => { e.preventDefault(); searchActivities(inputMessage); setInputMessage(''); }} className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Describe your activity needs..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                      Search
                    </Button>
                  </form>
              </CardContent>
            </Card>
            </div>

            {/* Activity Results */}
            <div className="lg:col-span-1">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Activity Options
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4">
                  {currentActivities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No activities found yet</p>
                      <p className="text-sm mt-2">Search for activities to see options</p>
                  </div>
                  ) : (
                    <div className="space-y-4">
                      {currentActivities.map((activity, index) => {
                        const isRecommended = recommendedActivity?.id === activity.id;
                        return (
                          <div key={activity.id || `activity-${index}`} className={`p-4 rounded-lg border overflow-hidden ${
                            isRecommended ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                          }`}>
                            {isRecommended && (
                              <Badge className="mb-2 bg-purple-500">Recommended</Badge>
                            )}
                            <div className="space-y-2 min-w-0">
                              <div className="font-medium text-sm break-words">
                                {getActivityName(activity)}
                              </div>
                              <div className="text-xs text-gray-600 break-words">
                                {getActivityDescription(activity)}
                              </div>
                              <div className="text-xs text-gray-600">
                                Price: ${getActivityPrice(activity)}
                              </div>
                              <div className="text-xs text-gray-600">
                                Duration: {getActivityDuration(activity)}
                              </div>
                              <div className="text-xs text-gray-600 break-words">
                                Location: {getActivityLocation(activity)}
                              </div>
                              <div className="text-xs text-gray-600">
                                Rating: {getActivityRating(activity)}
                              </div>
                              <div className="text-xs text-gray-600 break-words">
                                Category: {getActivityCategory(activity)}
                              </div>
                              <div className="text-xs text-gray-600 break-words">
                                Highlights: {getActivityHighlights(activity)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
          </div>
        </div>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 