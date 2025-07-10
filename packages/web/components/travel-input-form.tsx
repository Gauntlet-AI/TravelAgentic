'use client';

import { format } from 'date-fns';
import {
  ArrowLeftRight,
  CalendarIcon,
  Minus,
  Plane,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';

import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import type { TravelDetails } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth/auth-context';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

// Mock airport data for development - replace with API call in production
const mockAirports = [
  { iata: 'LAX', city: 'Los Angeles', country: 'United States', name: 'Los Angeles International Airport' },
  { iata: 'JFK', city: 'New York', country: 'United States', name: 'John F. Kennedy International Airport' },
  { iata: 'SFO', city: 'San Francisco', country: 'United States', name: 'San Francisco International Airport' },
  { iata: 'LHR', city: 'London', country: 'United Kingdom', name: 'Heathrow Airport' },
  { iata: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle Airport' },
  { iata: 'NRT', city: 'Tokyo', country: 'Japan', name: 'Narita International Airport' },
  { iata: 'DXB', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai International Airport' },
  { iata: 'SYD', city: 'Sydney', country: 'Australia', name: 'Kingsford Smith Airport' },
  { iata: 'HKG', city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong International Airport' },
  { iata: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Singapore Changi Airport' },
  { iata: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
  { iata: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Amsterdam Airport Schiphol' },
  { iata: 'ICN', city: 'Seoul', country: 'South Korea', name: 'Incheon International Airport' },
  { iata: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport' },
  { iata: 'DEL', city: 'New Delhi', country: 'India', name: 'Indira Gandhi International Airport' },
  { iata: 'ORD', city: 'Chicago', country: 'United States', name: 'O\'Hare International Airport' },
  { iata: 'ATL', city: 'Atlanta', country: 'United States', name: 'Hartsfield-Jackson Atlanta International Airport' },
  { iata: 'DEN', city: 'Denver', country: 'United States', name: 'Denver International Airport' },
  { iata: 'MIA', city: 'Miami', country: 'United States', name: 'Miami International Airport' },
  { iata: 'LAS', city: 'Las Vegas', country: 'United States', name: 'McCarran International Airport' },
];

// Type definition for airport data
interface AirportData {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  state?: string;
  displayLocation?: string; // Formatted display string
}

// US State mapping for major airports (IATA code -> state abbreviation)
const US_AIRPORT_STATES: Record<string, string> = {
  // Major US airports by state
  'ATL': 'GA', 'VLD': 'GA', 'CSG': 'GA',
  'LAX': 'CA', 'SFO': 'CA', 'SAN': 'CA', 'SMF': 'CA', 'SJC': 'CA', 'BUR': 'CA', 'LGB': 'CA', 'OAK': 'CA', 'ONT': 'CA', 'PSP': 'CA', 'FAT': 'CA',
  'ORD': 'IL', 'MDW': 'IL', 'RFD': 'IL',
  'DFW': 'TX', 'IAH': 'TX', 'HOU': 'TX', 'AUS': 'TX', 'SAT': 'TX', 'ELP': 'TX', 'LBB': 'TX',
  'DEN': 'CO', 'COS': 'CO', 'GJT': 'CO',
  'JFK': 'NY', 'LGA': 'NY', 'EWR': 'NJ', 'ALB': 'NY', 'BUF': 'NY', 'ROC': 'NY', 'SYR': 'NY',
  'MIA': 'FL', 'MCO': 'FL', 'TPA': 'FL', 'FLL': 'FL', 'JAX': 'FL', 'PBI': 'FL', 'RSW': 'FL', 'PIE': 'FL', 'TLH': 'FL', 'GNV': 'FL', 'DAB': 'FL', 'MLB': 'FL',
  'SEA': 'WA', 'PDX': 'OR', 'BOI': 'ID',
  'LAS': 'NV', 'RNO': 'NV',
  'BOS': 'MA', 'PVD': 'RI', 'BGR': 'ME', 'PWM': 'ME',
  'PHX': 'AZ', 'TUS': 'AZ', 'FLG': 'AZ',
  'MSP': 'MN', 'DLH': 'MN',
  'DTW': 'MI', 'GRR': 'MI', 'FNT': 'MI',
  'CLT': 'NC', 'RDU': 'NC', 'ILM': 'NC', 'GSO': 'NC', 'AVL': 'NC', 'OAJ': 'NC',
  'PHL': 'PA', 'PIT': 'PA', 'ABE': 'PA',
  'BWI': 'MD', 'DCA': 'VA', 'IAD': 'VA', 'ORF': 'VA', 'RIC': 'VA',
  'SLC': 'UT', 'OGD': 'UT',
  'CMH': 'OH', 'CLE': 'OH', 'DAY': 'OH',
  'IND': 'IN', 'SBN': 'IN', 'EVV': 'IN',
  'MKE': 'WI', 'MSN': 'WI', 'GRB': 'WI',
  'STL': 'MO', 'MCI': 'MO', 'SGF': 'MO',
  'MEM': 'TN', 'BNA': 'TN', 'TYS': 'TN', 'CHA': 'TN',
  'BHM': 'AL', 'HSV': 'AL', 'MOB': 'AL', 'MGM': 'AL',
  'JAC': 'WY', 'COD': 'WY', 'CPR': 'WY',
  'HNL': 'HI', 'OGG': 'HI', 'KOA': 'HI', 'ITO': 'HI', 'LIH': 'HI',
  'ANC': 'AK', 'FAI': 'AK', 'JNU': 'AK', 'KTN': 'AK', 'OME': 'AK', 'AKN': 'AK', 'BET': 'AK', 'OTZ': 'AK',
  'ABQ': 'NM', 'SAF': 'NM', 'ROW': 'NM',
  'OKC': 'OK', 'TUL': 'OK', 'LAW': 'OK',
  'LIT': 'AR', 'XNA': 'AR', 'TXK': 'AR',
  'MSY': 'LA', 'BTR': 'LA', 'SHV': 'LA', 'LFT': 'LA',
  'JAN': 'MS', 'GPT': 'MS', 'GTR': 'MS',
  'BDL': 'CT', 'HVN': 'CT',
  'MHT': 'NH', 'LEB': 'NH',
  'BTV': 'VT',
  'CHS': 'SC', 'CAE': 'SC', 'MYR': 'SC', 'GSP': 'SC',
  'SAV': 'GA', 'AGS': 'GA',
  'SDF': 'KY', 'LEX': 'KY', 'PAH': 'KY', 'OWB': 'KY', 'CVG': 'KY', // Cincinnati is actually in Kentucky
  'GUM': 'GU', // Guam
  'SJU': 'PR', 'BQN': 'PR', 'PSE': 'PR', // Puerto Rico
  'STT': 'VI', 'STX': 'VI', // US Virgin Islands
};

// International province/state mapping for major airports
const INTL_AIRPORT_REGIONS: Record<string, string> = {
  // Canada
  'YYZ': 'ON', 'YTZ': 'ON', 'YHM': 'ON', 'YOW': 'ON', 'YKF': 'ON',
  'YVR': 'BC', 'YKA': 'BC', 'YXC': 'BC', 'YCD': 'BC',
  'YUL': 'QC', 'YQB': 'QC', 'YBG': 'QC', 'YMQ': 'QC',
  'YYC': 'AB', 'YEG': 'AB', 'YMM': 'AB', 'YQL': 'AB',
  'YWG': 'MB', 'YBR': 'MB',
  'YQR': 'SK', 'YXE': 'SK',
  'YHZ': 'NS', 'YSJ': 'NB', 'YYT': 'NL', 'YQX': 'NB',
  
  // Australia - states
  'SYD': 'NSW', 'MEL': 'VIC', 'BNE': 'QLD', 'PER': 'WA', 'ADL': 'SA', 'HBA': 'TAS', 'DRW': 'NT', 'CBR': 'ACT',
  
  // India - major states (simplified)
  'DEL': 'Delhi', 'BOM': 'Maharashtra', 'MAA': 'Tamil Nadu', 'BLR': 'Karnataka', 'HYD': 'Telangana', 'CCU': 'West Bengal',
  
  // Germany - states (Länder)
  'FRA': 'Hesse', 'MUC': 'Bavaria', 'DUS': 'North Rhine-Westphalia', 'TXL': 'Berlin', 'HAM': 'Hamburg', 'STR': 'Baden-Württemberg',
};

// Function to get state/province for an airport
function getAirportState(airport: any): string | undefined {
  if (airport.country === 'United States') {
    return US_AIRPORT_STATES[airport.iata];
  } else {
    return INTL_AIRPORT_REGIONS[airport.iata];
  }
}

// Function to format display location with state/province
function formatDisplayLocation(airport: any): string {
  const state = getAirportState(airport);
  
  if (airport.country === 'United States' && state) {
    return `${airport.city}, ${state}, USA`;
  } else if (state) {
    // For international locations with states/provinces
    return `${airport.city}, ${state}, ${airport.country}`;
  } else {
    // Default format without state
    return `${airport.city}, ${airport.country}`;
  }
}

// State/Province full name mappings for search
const US_STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'PR': 'Puerto Rico', 'VI': 'Virgin Islands', 'GU': 'Guam'
};

const CANADIAN_PROVINCE_NAMES: Record<string, string> = {
  'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba', 'NB': 'New Brunswick',
  'NL': 'Newfoundland and Labrador', 'NS': 'Nova Scotia', 'ON': 'Ontario', 'PE': 'Prince Edward Island',
  'QC': 'Quebec', 'SK': 'Saskatchewan', 'NT': 'Northwest Territories', 'NU': 'Nunavut', 'YT': 'Yukon'
};

const AUSTRALIAN_STATE_NAMES: Record<string, string> = {
  'NSW': 'New South Wales', 'VIC': 'Victoria', 'QLD': 'Queensland', 'WA': 'Western Australia',
  'SA': 'South Australia', 'TAS': 'Tasmania', 'NT': 'Northern Territory', 'ACT': 'Australian Capital Territory'
};

// Function to check if search term matches state/province
function matchesStateOrProvince(airport: any, searchTerm: string): boolean {
  const state = getAirportState(airport);
  if (!state) return false;
  
  // Check state abbreviation (case-insensitive)
  if (state.toLowerCase() === searchTerm) return true;
  
  // Check full state name for US states - more precise matching
  if (airport.country === 'United States') {
    const fullStateName = US_STATE_NAMES[state];
    if (fullStateName?.toLowerCase() === searchTerm || 
        (searchTerm.length > 3 && fullStateName?.toLowerCase().startsWith(searchTerm))) {
      return true;
    }
  }
  
  // Check full province name for Canada - more precise matching
  if (airport.country === 'Canada') {
    const fullProvinceName = CANADIAN_PROVINCE_NAMES[state];
    if (fullProvinceName?.toLowerCase() === searchTerm || 
        (searchTerm.length > 3 && fullProvinceName?.toLowerCase().startsWith(searchTerm))) {
      return true;
    }
  }
  
  // Check full state name for Australia - more precise matching
  if (airport.country === 'Australia') {
    const fullStateName = AUSTRALIAN_STATE_NAMES[state];
    if (fullStateName?.toLowerCase() === searchTerm || 
        (searchTerm.length > 3 && fullStateName?.toLowerCase().startsWith(searchTerm))) {
      return true;
    }
  }
  
  // For other countries, check if state/region name matches exactly or starts with search term
  if (state.toLowerCase() === searchTerm || 
      (searchTerm.length > 3 && state.toLowerCase().startsWith(searchTerm))) {
    return true;
  }
  
  return false;
}

// Simple airport search function using mock data
function searchAirports(query: string): AirportData[] {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  
  try {
    const matches = mockAirports.filter((airport) => {
      // For short queries (2-3 chars), be more restrictive
      if (searchTerm.length <= 3) {
        return (
          airport.city?.toLowerCase().startsWith(searchTerm) ||
          airport.iata?.toLowerCase() === searchTerm ||
          airport.country?.toLowerCase().startsWith(searchTerm)
        );
      } else {
        // For longer queries, use inclusive search
        return (
          airport.city?.toLowerCase().includes(searchTerm) ||
          airport.name?.toLowerCase().includes(searchTerm) ||
          airport.country?.toLowerCase().includes(searchTerm) ||
          airport.iata?.toLowerCase().includes(searchTerm)
        );
      }
    });
    
    return matches
      .slice(0, 8) // Limit to 8 results for performance
      .map((airport) => ({
        iata: airport.iata,
        icao: airport.iata, // Use IATA as ICAO for simplicity
        name: airport.name,
        city: airport.city,
        country: airport.country,
        displayLocation: `${airport.city}, ${airport.country}`
      }));
  } catch (error) {
    console.error('Error searching airports:', error);
    return [];
  }
}

interface TravelInputFormProps {
  onSubmit: (details: TravelDetails) => void;
  isMobile?: boolean;
}

export function TravelInputForm({ onSubmit, isMobile }: TravelInputFormProps) {
  const [departureLocation, setDepartureLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [firstDate, setFirstDate] = useState<Date | undefined>();
  const [secondDate, setSecondDate] = useState<Date | undefined>();
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isTravelersOpen, setIsTravelersOpen] = useState(false);

  const [departureSuggestions, setDepartureSuggestions] = useState<AirportData[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<AirportData[]>([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  // Background slideshow images
  const backgroundImages = [
    {
      url: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg',
      alt: 'Tropical Beach Paradise',
    },
    {
      url: 'https://images.pexels.com/photos/32867262/pexels-photo-32867262.jpeg',
      alt: 'Mountain Landscape',
    },
    {
      url: 'https://images.pexels.com/photos/32828093/pexels-photo-32828093.jpeg',
      alt: 'European City',
    },
    {
      url: 'https://images.pexels.com/photos/402028/pexels-photo-402028.jpeg',
      alt: 'Japanese Temple',
    },
    {
      url: 'https://images.pexels.com/photos/20179685/pexels-photo-20179685.jpeg',
      alt: 'African Safari',
    },
    {
      url: 'https://images.pexels.com/photos/360912/pexels-photo-360912.jpeg',
      alt: 'Northern Lights',
    },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Slideshow effect with proper crossfade
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 15000); // Change image every 15 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handleDepartureChange = (value: string) => {
    setDepartureLocation(value);
    if (value.length > 1) {
      const results = searchAirports(value);
      setDepartureSuggestions(results);
      setShowDepartureSuggestions(true);
    } else {
      setShowDepartureSuggestions(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    if (value.length > 1) {
      const results = searchAirports(value);
      setDestinationSuggestions(results);
      setShowDestinationSuggestions(true);
    } else {
      setShowDestinationSuggestions(false);
    }
  };

  const selectDepartureCity = (airport: AirportData) => {
    setDepartureLocation(
      `${airport.displayLocation} (${airport.iata})`
    );
    setShowDepartureSuggestions(false);
  };

  const selectDestinationCity = (airport: AirportData) => {
    setDestination(`${airport.displayLocation} (${airport.iata})`);
    setShowDestinationSuggestions(false);
  };

  const getTravelersText = () => {
    const parts = [];
    parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
    if (children > 0) {
      parts.push(`${children} child${children !== 1 ? 'ren' : ''}`);
    }
    parts.push(`${rooms} room${rooms !== 1 ? 's' : ''}`);
    return parts.join(' • ');
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    console.log('Date selected:', selectedDate);
    console.log(
      'Current state - firstDate:',
      firstDate,
      'secondDate:',
      secondDate
    );

    if (!firstDate) {
      // First click: select first date
      console.log('Setting first date');
      setFirstDate(selectedDate);
      setSecondDate(undefined);
      setHoveredDate(undefined);
    } else if (!secondDate) {
      // Second click: select second date and close picker
      console.log('Setting second date');
      setSecondDate(selectedDate);
      setHoveredDate(undefined);
      setIsStartDateOpen(false);
    } else {
      // Third click: reset to new first date, clear second date
      console.log('Resetting to new first date');
      setFirstDate(selectedDate);
      setSecondDate(undefined);
      setHoveredDate(undefined);
      // Keep picker open for selecting second date
    }
  };

  const getDisplayRange = () => {
    if (!firstDate) return undefined;

    if (secondDate) {
      // Both dates selected - show actual range
      const range = {
        from: firstDate < secondDate ? firstDate : secondDate,
        to: firstDate < secondDate ? secondDate : firstDate,
      };
      console.log('Display range (both dates):', range);
      return range;
    }

    if (hoveredDate && firstDate) {
      // Show hover preview between first date and hovered date
      const range = {
        from: firstDate < hoveredDate ? firstDate : hoveredDate,
        to: firstDate < hoveredDate ? hoveredDate : firstDate,
      };
      console.log('Display range (hover):', range);
      return range;
    }

    console.log('Display range (single date):', {
      from: firstDate,
      to: undefined,
    });
    return { from: firstDate, to: undefined }; // Only first date selected
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (departureLocation && destination && firstDate && secondDate) {
      // Determine start and end dates based on chronological order
      const startDate = firstDate < secondDate ? firstDate : secondDate;
      const endDate = firstDate < secondDate ? secondDate : firstDate;

      onSubmit({
        departureLocation,
        destination,
        startDate,
        endDate,
        travelers: adults + children, // Total travelers for backward compatibility
        adults,
        children,
      });
    }
  };

  const isFormValid =
    departureLocation && destination && firstDate && secondDate;

  if (isMobile) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-50 p-4">
        {/* Background Slideshow for Mobile */}
        <div className="absolute inset-0 z-0">
          {backgroundImages.map((image, index) => {
            const isActive = index === currentImageIndex;
            return (
              <div
                key={index}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-50' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${image.url})`,
                }}
              />
            );
          })}
          <div className="absolute inset-0 bg-black bg-opacity-10 z-10" />
        </div>

        {/* Mobile Logo and Auth */}
        <div className="relative z-20 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}
            >
              TravelAgentic
            </span>
          </div>
          
          {/* Conditional Auth Display */}
          {user ? (
            <UserProfileDropdown className="text-white" />
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent text-sm text-white border-white hover:bg-white hover:text-gray-900"
                onClick={() => router.push('/login')}
              >
                Log in
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 text-sm hover:bg-blue-700"
                onClick={() => router.push('/signup')}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>

        <Card className="relative z-10 w-full bg-white/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle
              className={`text-center text-2xl ${inter.className} font-medium`}
            >
              Plan Your Perfect Vacation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Departure Location */}
              <div className="relative space-y-2">
                <Label htmlFor="departure" className="flex items-center gap-2">
                  <Plane size={16} />
                  Leaving from
                </Label>
                <Input
                  id="departure"
                  placeholder="Enter departure location"
                  value={departureLocation}
                  onChange={(e) => handleDepartureChange(e.target.value)}
                  onFocus={() =>
                    departureLocation.length > 1 &&
                    setShowDepartureSuggestions(true)
                  }
                  className="text-base"
                />
                {showDepartureSuggestions &&
                  departureSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
                      {departureSuggestions.map((airport, index) => (
                        <div
                          key={index}
                          className="cursor-pointer border-b border-gray-100 px-3 py-3 last:border-b-0 hover:bg-gray-100"
                          onClick={() => selectDepartureCity(airport)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">
                                {airport.displayLocation}
                              </div>
                              <div className="text-xs text-gray-500">
                                {airport.name}
                              </div>
                            </div>
                            <div className="flex-shrink-0 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-700">
                              {airport.iata}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Destination */}
              <div className="relative space-y-2">
                <Label
                  htmlFor="destination"
                  className="flex items-center gap-2"
                >
                  <Plane size={16} className="rotate-90" />
                  Going to
                </Label>
                <Input
                  id="destination"
                  placeholder="Enter destination city or airport"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={() =>
                    destination.length > 1 &&
                    setShowDestinationSuggestions(true)
                  }
                  className="text-base"
                />
                {showDestinationSuggestions &&
                  destinationSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
                      {destinationSuggestions.map((airport, index) => (
                        <div
                          key={index}
                          className="cursor-pointer border-b border-gray-100 px-3 py-3 last:border-b-0 hover:bg-gray-100"
                          onClick={() => selectDestinationCity(airport)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">
                                {airport.displayLocation}
                              </div>
                              <div className="text-xs text-gray-500">
                                {airport.name}
                              </div>
                            </div>
                            <div className="flex-shrink-0 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-700">
                              {airport.iata}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Travel Dates */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <CalendarIcon size={16} />
                  Travel dates
                </Label>

                <Popover
                  open={isStartDateOpen}
                  onOpenChange={setIsStartDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border border-gray-400 bg-transparent text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {firstDate
                        ? secondDate
                          ? `${format(firstDate < secondDate ? firstDate : secondDate, 'PPP')} - ${format(
                              firstDate < secondDate ? secondDate : firstDate,
                              'PPP'
                            )}`
                          : `${format(firstDate, 'PPP')} - Select end date`
                        : 'Select travel dates'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={firstDate}
                      onSelect={(selectedDate) => {
                        handleDateSelect(selectedDate);
                      }}
                      onDayMouseEnter={(day) => {
                        if (firstDate && !secondDate) {
                          setHoveredDate(day);
                        }
                      }}
                      onDayMouseLeave={() => {
                        if (firstDate && !secondDate) {
                          setHoveredDate(undefined);
                        }
                      }}
                      disabled={(d) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const compareDate = new Date(d);
                        compareDate.setHours(0, 0, 0, 0);
                        return compareDate < today;
                      }}
                      numberOfMonths={1}
                      initialFocus
                      modifiers={{
                        range_start: firstDate ? [firstDate] : [],
                        range_end: secondDate ? [secondDate] : [],
                        range_middle: (() => {
                          const range = getDisplayRange();
                          console.log('Calculating range_middle for:', range);

                          if (!range?.from || !range?.to) return [];

                          const days = [];
                          const start = new Date(range.from);
                          const end = new Date(range.to);

                          // Make sure we're comparing dates correctly
                          start.setHours(0, 0, 0, 0);
                          end.setHours(0, 0, 0, 0);

                          const current = new Date(start);
                          current.setDate(current.getDate() + 1); // Start from day after start

                          while (current < end) {
                            days.push(new Date(current));
                            current.setDate(current.getDate() + 1);
                          }

                          console.log('Range middle days:', days);
                          return days;
                        })(),
                        past: (date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const compareDate = new Date(date);
                          compareDate.setHours(0, 0, 0, 0);
                          return compareDate < today;
                        },
                      }}
                      modifiersClassNames={{
                        range_start: 'bg-primary text-primary-foreground',
                        range_end: 'bg-primary text-primary-foreground',
                        range_middle: 'bg-accent text-accent-foreground',
                        past: 'text-muted-foreground opacity-30 cursor-not-allowed bg-gray-100',
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Travelers */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users size={16} />
                  Travelers
                </Label>
                <Popover
                  open={isTravelersOpen}
                  onOpenChange={setIsTravelersOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border border-gray-400 bg-transparent text-left font-normal"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {getTravelersText()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="start">
                    <div className="space-y-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Adults</Label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            disabled={adults <= 1}
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {adults}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdults(adults + 1)}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          Children
                        </Label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setChildren(Math.max(0, children - 1))
                            }
                            disabled={children <= 0}
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {children}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setChildren(children + 1)}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>

                      {/* Rooms */}
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Rooms</Label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRooms(Math.max(1, rooms - 1))}
                            disabled={rooms <= 1}
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {rooms}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRooms(rooms + 1)}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={() => setIsTravelersOpen(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Done
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 bg-purple-600 py-6 text-lg hover:bg-purple-700"
                  disabled={!isFormValid}
                >
                  <Sparkles size={20} />
                  I'm Feeling Lucky
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 py-6 text-lg hover:bg-blue-700"
                  disabled={!isFormValid}
                >
                  Start Planning
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 p-6">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((image, index) => {
          const isActive = index === currentImageIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-60' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image.url})`,
              }}
            />
          );
        })}
        <div className="absolute inset-0 bg-black bg-opacity-10 z-10" />
      </div>

      {/* Logo and Auth */}
      <div className="absolute left-6 right-6 top-6 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`text-2xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}
          >
            TravelAgentic
          </span>
        </div>
        
        {/* Conditional Auth Display */}
        {user ? (
          <UserProfileDropdown className="text-white" />
        ) : (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-white hover:text-gray-900"
              onClick={() => router.push('/login')}
            >
              Log in
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push('/signup')}
            >
              Sign up
            </Button>
          </div>
        )}
      </div>

      <Card className="relative z-10 w-full max-w-4xl bg-white/75 backdrop-blur-sm">
        <CardHeader>
          <CardTitle
            className={`mb-2 text-center text-3xl ${inter.className} font-medium`}
          >
            Plan Your Perfect Vacation
          </CardTitle>
          <p className="text-center text-gray-600">
            Tell us where and when you'd like to travel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Desktop: Horizontal Layout */}
            <div className="mb-8 flex items-end gap-2">
              {/* Departure Location */}
              <div className="relative flex-1 space-y-2">
                <Label
                  htmlFor="departure"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Plane size={16} />
                  Leaving from
                </Label>
                <Input
                  id="departure"
                  placeholder="Enter departure location"
                  value={departureLocation}
                  onChange={(e) => handleDepartureChange(e.target.value)}
                  onFocus={() =>
                    departureLocation.length > 1 &&
                    setShowDepartureSuggestions(true)
                  }
                  className="h-12 w-full"
                />
                {showDepartureSuggestions &&
                  departureSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
                      {departureSuggestions.map((airport, index) => (
                        <div
                          key={index}
                          className="cursor-pointer border-b border-gray-100 px-3 py-3 last:border-b-0 hover:bg-gray-100"
                          onClick={() => selectDepartureCity(airport)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">
                                {airport.displayLocation}
                              </div>
                              <div className="text-xs text-gray-500">
                                {airport.name}
                              </div>
                            </div>
                            <div className="flex-shrink-0 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-700">
                              {airport.iata}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Swap Arrow */}
              <div className="flex items-center justify-center px-2 pb-2">
                <ArrowLeftRight size={20} className="text-gray-400" />
              </div>

              {/* Destination */}
              <div className="relative flex-1 space-y-2">
                <Label
                  htmlFor="destination"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Plane size={16} className="rotate-90" />
                  Going to
                </Label>
                <Input
                  id="destination"
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={() =>
                    destination.length > 1 &&
                    setShowDestinationSuggestions(true)
                  }
                  className="h-12 w-full"
                />
                {showDestinationSuggestions &&
                  destinationSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
                      {destinationSuggestions.map((airport, index) => (
                        <div
                          key={index}
                          className="cursor-pointer border-b border-gray-100 px-3 py-3 last:border-b-0 hover:bg-gray-100"
                          onClick={() => selectDestinationCity(airport)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">
                                {airport.displayLocation}
                              </div>
                              <div className="text-xs text-gray-500">
                                {airport.name}
                              </div>
                            </div>
                            <div className="flex-shrink-0 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-700">
                              {airport.iata}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Travel Dates */}
              <div className="min-w-[200px] flex-shrink-0 space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <CalendarIcon size={16} />
                  Travel dates
                </Label>
                <Popover
                  open={isStartDateOpen}
                  onOpenChange={setIsStartDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 w-full justify-start border border-gray-400 bg-transparent text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {firstDate
                        ? secondDate
                          ? `${format(firstDate < secondDate ? firstDate : secondDate, 'MMM d')} - ${format(
                              firstDate < secondDate ? secondDate : firstDate,
                              'MMM d'
                            )}`
                          : `${format(firstDate, 'MMM d')} - Select end date`
                        : 'Select travel dates'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-50 w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={firstDate}
                      onSelect={(selectedDate) => {
                        handleDateSelect(selectedDate);
                      }}
                      onDayMouseEnter={(day) => {
                        if (firstDate && !secondDate) {
                          setHoveredDate(day);
                        }
                      }}
                      onDayMouseLeave={() => {
                        if (firstDate && !secondDate) {
                          setHoveredDate(undefined);
                        }
                      }}
                      disabled={(d) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const compareDate = new Date(d);
                        compareDate.setHours(0, 0, 0, 0);
                        return compareDate < today;
                      }}
                      numberOfMonths={2}
                      initialFocus
                      modifiers={{
                        range_start: firstDate ? [firstDate] : [],
                        range_end: secondDate ? [secondDate] : [],
                        range_middle: (() => {
                          const range = getDisplayRange();
                          console.log(
                            'Calculating range_middle for desktop:',
                            range
                          );

                          if (!range?.from || !range?.to) return [];

                          const days = [];
                          const start = new Date(range.from);
                          const end = new Date(range.to);

                          // Make sure we're comparing dates correctly
                          start.setHours(0, 0, 0, 0);
                          end.setHours(0, 0, 0, 0);

                          const current = new Date(start);
                          current.setDate(current.getDate() + 1); // Start from day after start

                          while (current < end) {
                            days.push(new Date(current));
                            current.setDate(current.getDate() + 1);
                          }

                          console.log('Range middle days (desktop):', days);
                          return days;
                        })(),
                        past: (date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const compareDate = new Date(date);
                          compareDate.setHours(0, 0, 0, 0);
                          return compareDate < today;
                        },
                      }}
                      modifiersClassNames={{
                        range_start: 'bg-primary text-primary-foreground',
                        range_end: 'bg-primary text-primary-foreground',
                        range_middle: 'bg-accent text-accent-foreground',
                        past: 'text-muted-foreground opacity-30 cursor-not-allowed bg-gray-100',
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Travelers and Search */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Users size={16} />
                  Travelers
                </Label>
                <Popover
                  open={isTravelersOpen}
                  onOpenChange={setIsTravelersOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 justify-start border border-gray-400 bg-transparent text-left font-normal"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {getTravelersText()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-50 w-80 p-4" align="start">
                    <div className="space-y-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Adults</Label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            disabled={adults <= 1}
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {adults}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdults(adults + 1)}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          Children
                        </Label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setChildren(Math.max(0, children - 1))
                            }
                            disabled={children <= 0}
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {children}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setChildren(children + 1)}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>

                      {/* Rooms */}
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Rooms</Label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRooms(Math.max(1, rooms - 1))}
                            disabled={rooms <= 1}
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {rooms}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRooms(rooms + 1)}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={() => setIsTravelersOpen(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Done
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  className="flex items-center gap-2 bg-purple-600 px-8 py-3 text-lg hover:bg-purple-700"
                  disabled={!isFormValid}
                >
                  <Sparkles size={20} />
                  I'm Feeling Lucky
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 px-8 py-3 text-lg hover:bg-blue-700"
                  disabled={!isFormValid}
                >
                  Search
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
