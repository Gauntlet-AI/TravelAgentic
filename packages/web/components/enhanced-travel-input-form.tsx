/**
 * Enhanced Travel Input Form for TravelAgentic
 * Extended version with trip purpose, budget, travel style, and activity preferences
 * Supports both itinerary-centric and traditional search flows
 */

'use client';

import { format } from 'date-fns';
import {
  ArrowLeftRight,
  CalendarIcon,
  DollarSign,
  Heart,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import type { TravelDetails } from '@/lib/mock-data';
import { BasicTravelDetails, TravelPreferences } from '@/contexts/ItineraryContext';
import { useAuth } from '@/lib/auth/auth-context';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

// Mock airport data for development
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

interface AirportData {
  iata: string;
  name: string;
  city: string;
  country: string;
  displayLocation?: string;
}

// Activity types interface
interface ActivityType {
  id: string;
  label: string;
  icon: string;
}

// Enhanced interface that supports both flows
interface EnhancedTravelDetails extends TravelDetails {
  preferences?: TravelPreferences;
}

interface EnhancedTravelInputFormProps {
  onSubmit: (details: EnhancedTravelDetails, useItineraryFlow?: boolean) => void;
  isMobile?: boolean;
  mode?: 'search' | 'itinerary'; // Control which flow to use
  showPreferences?: boolean; // Control whether to show enhanced fields
}

// Airport search function using mock API service instead of hardcoded data
async function searchAirports(query: string): Promise<AirportData[]> {
  if (!query || query.length < 2) return [];
  
  try {
    // Use the mock airport service instead of hardcoded data
    const response = await fetch('/api/airports/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query,
        limit: 8 // Limit to 8 results for performance
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to search airports');
    }
    
    const { data: airports } = await response.json();
    
    return airports.map((airport: any) => ({
      iata: airport.code,
      icao: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      displayLocation: `${airport.city}, ${airport.country}`
    }));
    
  } catch (error) {
    console.error('Error searching airports:', error);
    // Fallback to empty array instead of hardcoded data
    return [];
  }
}

export function EnhancedTravelInputForm({ 
  onSubmit, 
  isMobile = false, 
  mode = 'itinerary',
  showPreferences = true 
}: EnhancedTravelInputFormProps) {
  // Basic travel details state
  const [departureLocation, setDepartureLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [firstDate, setFirstDate] = useState<Date | undefined>();
  const [secondDate, setSecondDate] = useState<Date | undefined>();
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  
  // Enhanced preferences state
  const [budget, setBudget] = useState<TravelPreferences['budget']>();
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [isLoadingActivityTypes, setIsLoadingActivityTypes] = useState(false);

  // UI state
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isTravelersOpen, setIsTravelersOpen] = useState(false);
  const [departureSuggestions, setDepartureSuggestions] = useState<AirportData[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<AirportData[]>([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Fetch activity types from API
  useEffect(() => {
    const fetchActivityTypes = async () => {
      setIsLoadingActivityTypes(true);
      try {
        const response = await fetch('/api/activities/categories');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Transform API response to match our interface
            const transformedTypes = result.data.map((item: any) => ({
              id: item.id,
              label: item.title,
              icon: item.icon
            }));
            setActivityTypes(transformedTypes);
          }
        }
      } catch (error) {
        console.error('Error fetching activity types:', error);
      } finally {
        setIsLoadingActivityTypes(false);
      }
    };

    fetchActivityTypes();
  }, []);

  // Location search handlers
  const handleDepartureChange = (value: string) => {
    setDepartureLocation(value);
    if (value.length > 1) {
      // Use async function to search airports
      searchAirports(value).then(results => {
        setDepartureSuggestions(results);
        setShowDepartureSuggestions(true);
      }).catch(error => {
        console.error('Error searching departure airports:', error);
        setShowDepartureSuggestions(false);
      });
    } else {
      setShowDepartureSuggestions(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    if (value.length > 1) {
      // Use async function to search airports
      searchAirports(value).then(results => {
        setDestinationSuggestions(results);
        setShowDestinationSuggestions(true);
      }).catch(error => {
        console.error('Error searching destination airports:', error);
        setShowDestinationSuggestions(false);
      });
    } else {
      setShowDestinationSuggestions(false);
    }
  };

  const selectDepartureCity = (airport: AirportData) => {
    setDepartureLocation(`${airport.displayLocation} (${airport.iata})`);
    setShowDepartureSuggestions(false);
  };

  const selectDestinationCity = (airport: AirportData) => {
    setDestination(`${airport.displayLocation} (${airport.iata})`);
    setShowDestinationSuggestions(false);
  };

  // Date selection handler
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    if (!firstDate) {
      setFirstDate(selectedDate);
      setSecondDate(undefined);
      setHoveredDate(undefined);
    } else if (!secondDate) {
      setSecondDate(selectedDate);
      setHoveredDate(undefined);
      setIsStartDateOpen(false);
    } else {
      setFirstDate(selectedDate);
      setSecondDate(undefined);
      setHoveredDate(undefined);
    }
  };

  const getDisplayRange = () => {
    if (!firstDate) return undefined;

    if (secondDate) {
      const range = {
        from: firstDate < secondDate ? firstDate : secondDate,
        to: firstDate < secondDate ? secondDate : firstDate,
      };
      return range;
    }

    if (hoveredDate && firstDate) {
      const range = {
        from: firstDate < hoveredDate ? firstDate : hoveredDate,
        to: firstDate < hoveredDate ? hoveredDate : firstDate,
      };
      return range;
    }

    return { from: firstDate, to: undefined };
  };

  // Activity type selection
  const toggleActivityType = (typeId: string) => {
    setSelectedActivityTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const getTravelersText = () => {
    const parts = [];
    parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
    if (children > 0) {
      parts.push(`${children} child${children !== 1 ? 'ren' : ''}`);
    }
    return parts.join(' • ');
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent, useItineraryFlow: boolean = mode === 'itinerary') => {
    e.preventDefault();
    
    if (!departureLocation || !destination || !firstDate || !secondDate) return;
    
    const startDate = firstDate < secondDate ? firstDate : secondDate;
    const endDate = firstDate < secondDate ? secondDate : firstDate;
    
         const details: EnhancedTravelDetails = {
       departureLocation,
       destination,
       startDate,
       endDate,
       travelers: adults + children,
       adults,
       children,
       preferences: showPreferences ? {
         budget,
         activityTypes: selectedActivityTypes,
       } : undefined
     };
    
    onSubmit(details, useItineraryFlow);
  };

  // Form validation  
  const isFormValid = departureLocation && destination && firstDate && secondDate;
  const isEnhancedFormValid = isFormValid; // Budget and preferences are now optional

  // Form sections component
  const BasicFormFields = () => (
    <>
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
        {showDepartureSuggestions && departureSuggestions.length > 0 && (
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
        <Label htmlFor="destination" className="flex items-center gap-2">
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
        {showDestinationSuggestions && destinationSuggestions.length > 0 && (
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
        <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
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
              onSelect={handleDateSelect}
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
                  if (!range?.from || !range?.to) return [];
                  const days = [];
                  const start = new Date(range.from);
                  const end = new Date(range.to);
                  start.setHours(0, 0, 0, 0);
                  end.setHours(0, 0, 0, 0);
                  const current = new Date(start);
                  current.setDate(current.getDate() + 1);
                  while (current < end) {
                    days.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                  }
                  return days;
                })(),
              }}
              modifiersClassNames={{
                range_start: 'bg-primary text-primary-foreground',
                range_end: 'bg-primary text-primary-foreground',
                range_middle: 'bg-accent text-accent-foreground',
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
        <Popover open={isTravelersOpen} onOpenChange={setIsTravelersOpen}>
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
                  <span className="w-8 text-center font-medium">{adults}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdults(adults + 1)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Children</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-8 text-center font-medium">{children}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChildren(children + 1)}
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
    </>
  );

  const EnhancedFormFields = () => (
    <>
      {/* Budget */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <DollarSign size={16} />
          What's your budget range?
        </Label>
        <Select value={budget} onValueChange={(value) => setBudget(value as TravelPreferences['budget'])}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select budget range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="budget">💰 Budget-Friendly</SelectItem>
            <SelectItem value="mid-range">💳 Mid-Range</SelectItem>
            <SelectItem value="luxury">💎 Luxury</SelectItem>
            <SelectItem value="ultra-luxury">👑 Ultra-Luxury</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Preferences */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Heart size={16} />
          What interests you? (Select multiple)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {activityTypes.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-2">
              <Checkbox
                id={activity.id}
                checked={selectedActivityTypes.includes(activity.id)}
                onCheckedChange={() => toggleActivityType(activity.id)}
              />
              <Label
                htmlFor={activity.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {activity.icon} {activity.label}
              </Label>
            </div>
          ))}
        </div>
        {selectedActivityTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedActivityTypes.map((typeId) => {
              const activity = activityTypes.find(a => a.id === typeId);
              return activity ? (
                <Badge key={typeId} variant="secondary" className="text-xs">
                  {activity.icon} {activity.label}
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>


    </>
  );

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

        {/* Mobile Header */}
        <div className="relative z-20 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}>
              TravelAgentic
            </span>
          </div>
          
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
            <CardTitle className={`text-center text-2xl ${inter.className} font-medium`}>
              {mode === 'itinerary' ? 'Plan Your Perfect Itinerary' : 'Plan Your Perfect Vacation'}
            </CardTitle>
            <p className="text-center text-gray-600">
              {mode === 'itinerary' 
                ? 'Tell us about your travel plans and preferences'
                : 'Search for flights, hotels, and activities'
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
              <BasicFormFields />
              {showPreferences && <EnhancedFormFields />}

              <div className="flex gap-3">
                {mode === 'search' && (
                  <Button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-2 bg-purple-600 py-6 text-lg hover:bg-purple-700"
                    disabled={!isFormValid}
                    onClick={(e) => handleSubmit(e, false)}
                  >
                    <Sparkles size={20} />
                    I'm Feeling Lucky
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 py-6 text-lg hover:bg-blue-700"
                  disabled={mode === 'itinerary' ? !isEnhancedFormValid : !isFormValid}
                >
                  {mode === 'itinerary' ? (
                    <>
                      <Sparkles className="mr-2" size={20} />
                      Start Building Itinerary
                    </>
                  ) : (
                    'Start Planning'
                  )}
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

      {/* Desktop Header */}
      <div className="absolute left-6 right-6 top-6 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}>
            TravelAgentic
          </span>
        </div>
        
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

      <Card className="relative z-10 w-full max-w-5xl bg-white/75 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className={`mb-2 text-center text-3xl ${inter.className} font-medium`}>
            {mode === 'itinerary' ? 'Plan Your Perfect Itinerary' : 'Plan Your Perfect Vacation'}
          </CardTitle>
          <p className="text-center text-gray-600">
            {mode === 'itinerary' 
              ? 'Tell us about your travel plans and preferences, and we\'ll build a personalized itinerary for you'
              : 'Search for flights, hotels, and activities for your next trip'
            }
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="grid gap-8">
              {/* Basic Travel Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Plane size={16} />
                    Leaving from
                  </Label>
                  <Input
                    placeholder="Enter departure location"
                    value={departureLocation}
                    onChange={(e) => handleDepartureChange(e.target.value)}
                    onFocus={() =>
                      departureLocation.length > 1 &&
                      setShowDepartureSuggestions(true)
                    }
                    className="h-12"
                  />
                  {showDepartureSuggestions && departureSuggestions.length > 0 && (
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

                <div className="relative">
                  <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Plane size={16} className="rotate-90" />
                    Going to
                  </Label>
                  <Input
                    placeholder="Enter destination"
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    onFocus={() =>
                      destination.length > 1 &&
                      setShowDestinationSuggestions(true)
                    }
                    className="h-12"
                  />
                  {showDestinationSuggestions && destinationSuggestions.length > 0 && (
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

                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <CalendarIcon size={16} />
                    Travel dates
                  </Label>
                  <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {firstDate
                          ? secondDate
                            ? `${format(firstDate < secondDate ? firstDate : secondDate, 'MMM d')} - ${format(
                                firstDate < secondDate ? secondDate : firstDate,
                                'MMM d'
                              )}`
                            : format(firstDate, 'MMM d, yyyy')
                          : 'Select dates'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={firstDate}
                        onSelect={handleDateSelect}
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
                            if (!range?.from || !range?.to) return [];
                            const days = [];
                            const start = new Date(range.from);
                            const end = new Date(range.to);
                            start.setHours(0, 0, 0, 0);
                            end.setHours(0, 0, 0, 0);
                            const current = new Date(start);
                            current.setDate(current.getDate() + 1);
                            while (current < end) {
                              days.push(new Date(current));
                              current.setDate(current.getDate() + 1);
                            }
                            return days;
                          })(),
                        }}
                        modifiersClassNames={{
                          range_start: 'bg-primary text-primary-foreground',
                          range_end: 'bg-primary text-primary-foreground',
                          range_middle: 'bg-accent text-accent-foreground',
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Users size={16} />
                    Travelers
                  </Label>
                  <Popover open={isTravelersOpen} onOpenChange={setIsTravelersOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start text-left font-normal"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {getTravelersText()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                      <div className="space-y-4">
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
                            <span className="w-8 text-center font-medium">{adults}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAdults(adults + 1)}
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Children</Label>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setChildren(Math.max(0, children - 1))}
                              disabled={children <= 0}
                            >
                              <Minus size={16} />
                            </Button>
                            <span className="w-8 text-center font-medium">{children}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setChildren(children + 1)}
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
              </div>

              {/* Enhanced Preferences Section */}
              {showPreferences && (
                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold mb-6">Tell us more about your trip</h3>
                  <div className="max-w-md">
                    <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <DollarSign size={16} />
                      Budget Range
                    </Label>
                    <Select value={budget} onValueChange={(value) => setBudget(value as TravelPreferences['budget'])}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">💰 Budget-Friendly</SelectItem>
                        <SelectItem value="mid-range">💳 Mid-Range</SelectItem>
                        <SelectItem value="luxury">💎 Luxury</SelectItem>
                        <SelectItem value="ultra-luxury">👑 Ultra-Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Activity Preferences */}
                  <div className="mt-8">
                    <Label className="flex items-center gap-2 text-sm font-medium mb-4">
                      <Heart size={16} />
                      What interests you? (Select multiple)
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {activityTypes.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={activity.id}
                            checked={selectedActivityTypes.includes(activity.id)}
                            onCheckedChange={() => toggleActivityType(activity.id)}
                          />
                          <Label
                            htmlFor={activity.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {activity.icon} {activity.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedActivityTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {selectedActivityTypes.map((typeId) => {
                          const activity = activityTypes.find(a => a.id === typeId);
                          return activity ? (
                            <Badge key={typeId} variant="secondary">
                              {activity.icon} {activity.label}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                {mode === 'search' && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-14 text-lg border-purple-600 text-purple-600 hover:bg-purple-50"
                    disabled={!isFormValid}
                    onClick={(e) => handleSubmit(e, false)}
                  >
                    <Sparkles className="mr-2" size={20} />
                    Search Traditional
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700"
                  disabled={mode === 'itinerary' ? !isEnhancedFormValid : !isFormValid}
                >
                  {mode === 'itinerary' ? (
                    <>
                      <Sparkles className="mr-2" size={20} />
                      Start Building Itinerary
                    </>
                  ) : (
                    'Start Planning'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 