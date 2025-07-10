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
import { Switch } from '@/components/ui/switch';

import type { TravelDetails } from '@/lib/mock-data';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const airportData = [
  // US Major Cities & Airports
  {
    code: 'ATL',
    city: 'Atlanta',
    country: 'United States',
    name: 'Hartsfield-Jackson Atlanta International Airport',
  },
  {
    code: 'LAX',
    city: 'Los Angeles',
    country: 'United States',
    name: 'Los Angeles International Airport',
  },
  {
    code: 'ORD',
    city: 'Chicago',
    country: 'United States',
    name: "O'Hare International Airport",
  },
  {
    code: 'DFW',
    city: 'Dallas',
    country: 'United States',
    name: 'Dallas/Fort Worth International Airport',
  },
  {
    code: 'DEN',
    city: 'Denver',
    country: 'United States',
    name: 'Denver International Airport',
  },
  {
    code: 'JFK',
    city: 'New York',
    country: 'United States',
    name: 'John F. Kennedy International Airport',
  },
  {
    code: 'LGA',
    city: 'New York',
    country: 'United States',
    name: 'LaGuardia Airport',
  },
  {
    code: 'EWR',
    city: 'Newark',
    country: 'United States',
    name: 'Newark Liberty International Airport',
  },
  {
    code: 'SFO',
    city: 'San Francisco',
    country: 'United States',
    name: 'San Francisco International Airport',
  },
  {
    code: 'SEA',
    city: 'Seattle',
    country: 'United States',
    name: 'Seattle-Tacoma International Airport',
  },
  {
    code: 'LAS',
    city: 'Las Vegas',
    country: 'United States',
    name: 'McCarran International Airport',
  },
  {
    code: 'MCO',
    city: 'Orlando',
    country: 'United States',
    name: 'Orlando International Airport',
  },
  {
    code: 'MIA',
    city: 'Miami',
    country: 'United States',
    name: 'Miami International Airport',
  },
  {
    code: 'BOS',
    city: 'Boston',
    country: 'United States',
    name: 'Logan International Airport',
  },
  {
    code: 'PHX',
    city: 'Phoenix',
    country: 'United States',
    name: 'Phoenix Sky Harbor International Airport',
  },
  {
    code: 'IAH',
    city: 'Houston',
    country: 'United States',
    name: 'George Bush Intercontinental Airport',
  },
  {
    code: 'AUS',
    city: 'Austin',
    country: 'United States',
    name: 'Austin-Bergstrom International Airport',
  },
  {
    code: 'SAN',
    city: 'San Diego',
    country: 'United States',
    name: 'San Diego International Airport',
  },
  {
    code: 'TPA',
    city: 'Tampa',
    country: 'United States',
    name: 'Tampa International Airport',
  },
  {
    code: 'PDX',
    city: 'Portland',
    country: 'United States',
    name: 'Portland International Airport',
  },

  // International Major Airports
  {
    code: 'LHR',
    city: 'London',
    country: 'United Kingdom',
    name: 'Heathrow Airport',
  },
  {
    code: 'LGW',
    city: 'London',
    country: 'United Kingdom',
    name: 'Gatwick Airport',
  },
  {
    code: 'CDG',
    city: 'Paris',
    country: 'France',
    name: 'Charles de Gaulle Airport',
  },
  { code: 'ORY', city: 'Paris', country: 'France', name: 'Orly Airport' },
  {
    code: 'FCO',
    city: 'Rome',
    country: 'Italy',
    name: 'Leonardo da Vinci International Airport',
  },
  {
    code: 'BCN',
    city: 'Barcelona',
    country: 'Spain',
    name: 'Barcelona-El Prat Airport',
  },
  {
    code: 'MAD',
    city: 'Madrid',
    country: 'Spain',
    name: 'Adolfo Suárez Madrid-Barajas Airport',
  },
  {
    code: 'AMS',
    city: 'Amsterdam',
    country: 'Netherlands',
    name: 'Amsterdam Airport Schiphol',
  },
  {
    code: 'FRA',
    city: 'Frankfurt',
    country: 'Germany',
    name: 'Frankfurt Airport',
  },
  { code: 'MUC', city: 'Munich', country: 'Germany', name: 'Munich Airport' },
  {
    code: 'ZUR',
    city: 'Zurich',
    country: 'Switzerland',
    name: 'Zurich Airport',
  },
  {
    code: 'VIE',
    city: 'Vienna',
    country: 'Austria',
    name: 'Vienna International Airport',
  },
  {
    code: 'CPH',
    city: 'Copenhagen',
    country: 'Denmark',
    name: 'Copenhagen Airport',
  },
  {
    code: 'ARN',
    city: 'Stockholm',
    country: 'Sweden',
    name: 'Stockholm Arlanda Airport',
  },
  { code: 'OSL', city: 'Oslo', country: 'Norway', name: 'Oslo Airport' },

  // Asia Pacific
  {
    code: 'NRT',
    city: 'Tokyo',
    country: 'Japan',
    name: 'Narita International Airport',
  },
  { code: 'HND', city: 'Tokyo', country: 'Japan', name: 'Haneda Airport' },
  {
    code: 'ICN',
    city: 'Seoul',
    country: 'South Korea',
    name: 'Incheon International Airport',
  },
  {
    code: 'PVG',
    city: 'Shanghai',
    country: 'China',
    name: 'Shanghai Pudong International Airport',
  },
  {
    code: 'PEK',
    city: 'Beijing',
    country: 'China',
    name: 'Beijing Capital International Airport',
  },
  {
    code: 'HKG',
    city: 'Hong Kong',
    country: 'Hong Kong',
    name: 'Hong Kong International Airport',
  },
  {
    code: 'SIN',
    city: 'Singapore',
    country: 'Singapore',
    name: 'Singapore Changi Airport',
  },
  {
    code: 'BKK',
    city: 'Bangkok',
    country: 'Thailand',
    name: 'Suvarnabhumi Airport',
  },
  {
    code: 'KUL',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    name: 'Kuala Lumpur International Airport',
  },
  {
    code: 'SYD',
    city: 'Sydney',
    country: 'Australia',
    name: 'Kingsford Smith Airport',
  },
  {
    code: 'MEL',
    city: 'Melbourne',
    country: 'Australia',
    name: 'Melbourne Airport',
  },

  // Middle East & Africa
  {
    code: 'DXB',
    city: 'Dubai',
    country: 'UAE',
    name: 'Dubai International Airport',
  },
  {
    code: 'DOH',
    city: 'Doha',
    country: 'Qatar',
    name: 'Hamad International Airport',
  },
  {
    code: 'CAI',
    city: 'Cairo',
    country: 'Egypt',
    name: 'Cairo International Airport',
  },
  {
    code: 'JNB',
    city: 'Johannesburg',
    country: 'South Africa',
    name: 'O.R. Tambo International Airport',
  },

  // South America
  {
    code: 'GRU',
    city: 'São Paulo',
    country: 'Brazil',
    name: 'São Paulo/Guarulhos International Airport',
  },
  {
    code: 'GIG',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    name: 'Rio de Janeiro/Galeão International Airport',
  },
  {
    code: 'EZE',
    city: 'Buenos Aires',
    country: 'Argentina',
    name: 'Ezeiza International Airport',
  },
  {
    code: 'LIM',
    city: 'Lima',
    country: 'Peru',
    name: 'Jorge Chávez International Airport',
  },

  // Canada
  {
    code: 'YYZ',
    city: 'Toronto',
    country: 'Canada',
    name: 'Toronto Pearson International Airport',
  },
  {
    code: 'YVR',
    city: 'Vancouver',
    country: 'Canada',
    name: 'Vancouver International Airport',
  },
  {
    code: 'YUL',
    city: 'Montreal',
    country: 'Canada',
    name: 'Montréal-Pierre Elliott Trudeau International Airport',
  },
];

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
  const [travelingWithPets, setTravelingWithPets] = useState(false);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isTravelersOpen, setIsTravelersOpen] = useState(false);

  const [departureSuggestions, setDepartureSuggestions] = useState<
    typeof airportData
  >([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    typeof airportData
  >([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] =
    useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] =
    useState(false);

  const router = useRouter();

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
    if (value.length > 0) {
      const filtered = airportData
        .filter(
          (airport) =>
            airport.city.toLowerCase().includes(value.toLowerCase()) ||
            airport.code.toLowerCase().includes(value.toLowerCase()) ||
            airport.name.toLowerCase().includes(value.toLowerCase()) ||
            airport.country.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 8); // Limit to 8 results
      setDepartureSuggestions(filtered);
      setShowDepartureSuggestions(true);
    } else {
      setShowDepartureSuggestions(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    if (value.length > 0) {
      const filtered = airportData
        .filter(
          (airport) =>
            airport.city.toLowerCase().includes(value.toLowerCase()) ||
            airport.code.toLowerCase().includes(value.toLowerCase()) ||
            airport.name.toLowerCase().includes(value.toLowerCase()) ||
            airport.country.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 8); // Limit to 8 results
      setDestinationSuggestions(filtered);
      setShowDestinationSuggestions(true);
    } else {
      setShowDestinationSuggestions(false);
    }
  };

  const selectDepartureCity = (airport: (typeof airportData)[0]) => {
    setDepartureLocation(
      `${airport.city}, ${airport.country} (${airport.code})`
    );
    setShowDepartureSuggestions(false);
  };

  const selectDestinationCity = (airport: (typeof airportData)[0]) => {
    setDestination(`${airport.city}, ${airport.country} (${airport.code})`);
    setShowDestinationSuggestions(false);
  };

  const getTravelersText = () => {
    const parts = [];
    parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
    if (children > 0) {
      parts.push(`${children} child${children !== 1 ? 'ren' : ''}`);
    }
    if (travelingWithPets) {
      parts.push('Pets');
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
        travelingWithPets,
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
            const isPrevious =
              index ===
              (currentImageIndex - 1 + backgroundImages.length) %
                backgroundImages.length;

            return (
              <div
                key={index}
                className={`duration-[3000ms] absolute inset-0 bg-cover bg-center transition-opacity ease-in-out ${
                  isActive
                    ? 'opacity-50'
                    : isPrevious
                      ? 'opacity-0'
                      : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${image.url})`,
                  zIndex: isActive ? 2 : 1,
                }}
              />
            );
          })}
          <div className="z-3 absolute inset-0 bg-black bg-opacity-10" />
        </div>

        {/* Mobile Logo and Auth Buttons */}
        <div className="relative z-20 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}
            >
              TravelAgentic
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-sm text-white"
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
                    departureLocation.length > 0 &&
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
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-medium">
                                {airport.city}, {airport.country}
                              </div>
                              <div className="truncate text-xs text-gray-500">
                                {airport.name}
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-700">
                              {airport.code}
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
                    destination.length > 0 &&
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
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-medium">
                                {airport.city}, {airport.country}
                              </div>
                              <div className="truncate text-xs text-gray-500">
                                {airport.name}
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-700">
                              {airport.code}
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
                      disabled={(d) => d < new Date()}
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

                      {/* Pets */}
                      <div className="space-y-3 border-t pt-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">
                            Traveling with pets?
                          </Label>
                          <Switch
                            checked={travelingWithPets}
                            onCheckedChange={setTravelingWithPets}
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Assistance animals aren't considered pets.</p>
                          <a href="#" className="text-blue-600 hover:underline">
                            Read more about traveling with assistance animals
                          </a>
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
          const isPrevious =
            index ===
            (currentImageIndex - 1 + backgroundImages.length) %
              backgroundImages.length;

          return (
            <div
              key={index}
              className={`duration-[3000ms] absolute inset-0 bg-cover bg-center transition-opacity ease-in-out ${
                isActive ? 'opacity-60' : isPrevious ? 'opacity-0' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image.url})`,
                zIndex: isActive ? 2 : 1,
              }}
            />
          );
        })}
        <div className="z-3 absolute inset-0 bg-black bg-opacity-10" />
      </div>

      {/* Logo and Auth Buttons */}
      <div className="absolute left-6 right-6 top-6 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`text-2xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}
          >
            TravelAgentic
          </span>
        </div>
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
                    departureLocation.length > 0 &&
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
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-medium">
                                {airport.city}, {airport.country}
                              </div>
                              <div className="truncate text-xs text-gray-500">
                                {airport.name}
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-700">
                              {airport.code}
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
                    destination.length > 0 &&
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
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-medium">
                                {airport.city}, {airport.country}
                              </div>
                              <div className="truncate text-xs text-gray-500">
                                {airport.name}
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-700">
                              {airport.code}
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
                      disabled={(d) => d < new Date()}
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

                      {/* Pets */}
                      <div className="space-y-3 border-t pt-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">
                            Traveling with pets?
                          </Label>
                          <Switch
                            checked={travelingWithPets}
                            onCheckedChange={setTravelingWithPets}
                          />
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
