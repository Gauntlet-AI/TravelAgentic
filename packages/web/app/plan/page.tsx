'use client';

import { differenceInDays, format } from 'date-fns';
import {
  Heart,
  Loader2,
  PartyPopper,
  RotateCcw,
  Sparkles,
  Star,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';

import { ActivityCard } from '@/components/activity-card';
import { ActivityTypeCardComponent } from '@/components/activity-type-card';
import { ChatInterface } from '@/components/chat-interface';
import { FlightCard } from '@/components/flight-card';
import { HotelCard } from '@/components/hotel-card';
import { MobileChatBubble } from '@/components/mobile-chat-bubble';
import { TravelInputForm } from '@/components/travel-input-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  filterActivitiesByTypes,
  researchActivities,
  searchHotels,
} from '@/lib/api';
import {
  type Activity,
  type Flight,
  type Hotel,
  type TravelDetails,
  activityTypes,
  mockFlights,
} from '@/lib/mock-data';

export default function VacationPlanner() {
  const [isMobile, setIsMobile] = useState(false);
  const [showTravelForm, setShowTravelForm] = useState(true);
  const [travelDetails, setTravelDetails] = useState<TravelDetails | null>(
    null
  );
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>(
    []
  );
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activityResearch, setActivityResearch] = useState<string>('');

  // Add new state variables for loading states
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightThoughts, setFlightThoughts] = useState<string[]>([]);
  const [hotelThoughts, setHotelThoughts] = useState<string[]>([]);
  const [activityThoughts, setActivityThoughts] = useState<string[]>([]);
  const [allAgentsComplete, setAllAgentsComplete] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [hasShownCelebration, setHasShownCelebration] = useState(false);
  const celebrationProcessingRef = useRef(false);

  // Add active tab state management
  const [activeTab, setActiveTab] = useState<string>('activities');
  const { user } = useAuth();
  const router = useRouter();

  // Function for AI to control tabs
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (allActivities.length > 0) {
      const filtered = filterActivitiesByTypes(
        allActivities,
        selectedActivityTypes
      );
      setFilteredActivities(filtered);
    }
  }, [allActivities, selectedActivityTypes]);

  const handleTravelDetailsSubmit = async (details: TravelDetails) => {
    setTravelDetails(details);
    setShowTravelForm(false);

    // Calculate nights first
    const nights =
      details.startDate && details.endDate
        ? differenceInDays(details.endDate, details.startDate)
        : 0;

    // Start all loading states
    setIsLoadingHotels(true);
    setIsLoadingActivities(true);
    setIsLoadingFlights(true);

    // Generate personalized thinking messages with correct data
    const travelerText = `${details.adults} adult${details.adults !== 1 ? 's' : ''}${
      details.children > 0
        ? ` and ${details.children} child${details.children !== 1 ? 'ren' : ''}`
        : ''
    }`;

    // Extract city names from location strings for cleaner display
    const getLocationName = (location: string) => {
      // Extract just the city and country part before the airport code
      const match = location.match(/^([^(]+)/);
      return match ? match[1].trim() : location;
    };

    const departureCity = getLocationName(details.departureLocation);
    const destinationCity = getLocationName(details.destination);

    // AI research thinking simulation
    const researchThinkingSteps = [
      `Analyzing your travel preferences...`,
      `Researching best flight options from ${departureCity} to ${destinationCity}...`,
      `Finding ideal accommodations for ${travelerText}...`,
      `Discovering personalized activities and attractions...`,
      `Comparing prices and availability...`,
      `Generating customized recommendations...`,
    ];

    // Show AI research thinking process
    let researchStep = 0;
    const researchThinkingInterval = setInterval(() => {
      if (researchStep < researchThinkingSteps.length) {
        setFlightThoughts((prev) => [...prev, researchThinkingSteps[researchStep]]);
        researchStep++;
      } else {
        clearInterval(researchThinkingInterval);
      }
    }, 2000);

    // Call AI research API to get structured data
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: details.destination,
          departureLocation: details.departureLocation,
          startDate: details.startDate ? format(details.startDate, 'yyyy-MM-dd') : '',
          endDate: details.endDate ? format(details.endDate, 'yyyy-MM-dd') : '',
          travelers: details.travelers,
        }),
      });

      const researchData = await response.json();
      
      if (researchData.structured && details.startDate && details.endDate) {
        // Use AI-generated preferences to populate results
        
        // Generate AI-informed flights
        const aiFlights = generateAIFlights(
          researchData.flightPreferences,
          details.departureLocation,
          details.destination,
          details.startDate,
          details.endDate,
          details.travelers
        );
        
        // Generate AI-informed hotels
        const aiHotels = generateAIHotels(
          researchData.hotelPreferences,
          details.destination,
          details.startDate,
          details.endDate,
          details.travelers
        );

        // Use AI-generated activity recommendations
        const aiActivities = researchData.activityRecommendations.map((activity: any, index: number) => ({
          id: `ai-activity-${index}`,
          name: activity.name,
          location: destinationCity,
          category: Array.isArray(activity.category) ? activity.category : [activity.category],
          duration: activity.duration,
          rating: Math.round((4.0 + Math.random() * 1.0) * 10) / 10,
          reviewCount: Math.floor(Math.random() * 500) + 100,
          price: activity.estimatedCost,
          currency: 'USD',
          image: '/placeholder.jpg',
          description: activity.description,
          bestTime: activity.bestTime,
          priority: activity.priority,
          source: 'ai' as const,
        }));

        // Set the AI-generated data
        setTimeout(() => {
          setFlights(aiFlights);
          setIsLoadingFlights(false);
          clearInterval(researchThinkingInterval);
          setFlightThoughts((prev) => [...prev, '✅ AI flight recommendations ready!']);
          checkAllAgentsComplete();
        }, 12000);

        setTimeout(() => {
          setHotels(aiHotels);
          setIsLoadingHotels(false);
          setHotelThoughts((prev) => [...prev, '✅ AI hotel recommendations ready!']);
          checkAllAgentsComplete();
        }, 13000);

        setTimeout(() => {
          setAllActivities(aiActivities);
          setIsLoadingActivities(false);
          setActivityThoughts((prev) => [...prev, '✅ AI activity recommendations ready!']);
          checkAllAgentsComplete();
        }, 14000);

        // Store the travel guide
        setActivityResearch(researchData.research);
        
      } else {
        // Fallback to mock data if AI research fails
        console.warn('AI research failed, using mock data');
        fallbackToMockData();
      }
    } catch (error) {
      console.error('Error calling AI research:', error);
      // Fallback to mock data if API call fails
      fallbackToMockData();
    }

    // Fallback function to use mock data
    function fallbackToMockData() {
      setTimeout(() => {
        setFlights(mockFlights);
        setIsLoadingFlights(false);
        clearInterval(researchThinkingInterval);
        checkAllAgentsComplete();
      }, 10000);

      setTimeout(() => {
        searchHotels(details)
          .then(setHotels)
          .catch(console.error)
          .finally(() => {
            setIsLoadingHotels(false);
            checkAllAgentsComplete();
          });
      }, 10000);

      setTimeout(() => {
        researchActivities(details)
          .then(setAllActivities)
          .catch(console.error)
          .finally(() => {
            setIsLoadingActivities(false);
            checkAllAgentsComplete();
          });
      }, 10000);
    }
  };

  // Helper function to generate AI-informed flights
  const generateAIFlights = (
    preferences: any,
    departureLocation: string,
    destination: string,
    startDate: Date,
    endDate: Date,
    travelers: number
  ): Flight[] => {
    const departureAirport = departureLocation.match(/\(([A-Z]{3})\)/)?.[1] || 'ATL';
    const destinationAirport = destination.match(/\(([A-Z]{3})\)/)?.[1] || 'JFK';
    const departureCity = departureLocation.match(/^([^(]+)/)?.[1]?.trim() || 'Atlanta';
    const destinationCity = destination.match(/^([^(]+)/)?.[1]?.trim() || 'New York';
    
    const airlines = preferences.preferredAirlines || ['Delta Air Lines', 'American Airlines', 'United Airlines'];
    const basePrice = preferences.cabinClass === 'business' ? 800 : 
                     preferences.cabinClass === 'premium' ? 400 : 200;
    
    const aircraftTypes = ['Boeing 737-800', 'Airbus A320', 'Boeing 777-200'];
    const cabinClass = preferences.cabinClass === 'business' ? 'Business' : 
                      preferences.cabinClass === 'premium' ? 'Premium Economy' : 'Economy';
    
    return airlines.slice(0, 3).map((airline: string, index: number) => {
      const departureTime = index === 0 ? '8:30 AM' : index === 1 ? '2:15 PM' : '6:45 PM';
      const arrivalTime = index === 0 ? '12:30 PM' : index === 1 ? '6:15 PM' : '10:45 PM';
      const stops = preferences.stopPreference === 'direct' ? 0 : Math.floor(Math.random() * 2);
      
      return {
        id: `ai-flight-${index}`,
        airline,
        flightNumber: `${airline.substr(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
        departure: {
          airport: departureAirport,
          city: departureCity,
          time: departureTime,
          date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        },
        arrival: {
          airport: destinationAirport,
          city: destinationCity,
          time: arrivalTime,
          date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        },
        duration: stops === 0 ? '4h 0m' : '6h 30m',
        price: basePrice + Math.floor(Math.random() * 200),
        stops,
        class: cabinClass,
        aircraft: aircraftTypes[index % aircraftTypes.length],
        source: 'ai' as const,
      };
    });
  };

  // Helper function to generate AI-informed hotels
  const generateAIHotels = (
    preferences: any,
    destination: string,
    startDate: Date,
    endDate: Date,
    travelers: number
  ): Hotel[] => {
    const destinationCity = destination.match(/^([^(]+)/)?.[1]?.trim() || 'New York';
    const hotelTypes = preferences.preferredTypes || ['luxury', 'boutique', 'business'];
    const basePrice = preferences.priceRange === 'luxury' ? 300 : 
                     preferences.priceRange === 'mid-range' ? 150 : 80;
    
    const descriptions = {
      luxury: 'Elegant luxury hotel with world-class amenities and exceptional service',
      boutique: 'Charming boutique hotel with unique character and personalized attention',
      business: 'Modern business hotel with convenient location and professional facilities',
      'family-friendly': 'Comfortable family hotel with amenities for all ages'
    };
    
    return hotelTypes.slice(0, 3).map((type: string, index: number) => ({
      id: `ai-hotel-${index}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${destinationCity} Hotel`,
      location: `${destinationCity}, ${preferences.locationPreference || 'city center'}`,
      rating: Math.round((4.0 + Math.random() * 1.0) * 10) / 10,
      pricePerNight: basePrice + Math.floor(Math.random() * 100),
      image: '/placeholder.jpg',
      amenities: preferences.amenities || ['WiFi', 'Pool', 'Gym'],
      description: descriptions[type as keyof typeof descriptions] || 'Quality accommodation with modern amenities',
      source: 'ai' as const,
    }));
  };

  const handleActivityTypeSelect = (typeId: string) => {
    setSelectedActivityTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const triggerConfetti = () => {
    // Create confetti elements
    const colors = [
      '#ff6b6b',
      '#4ecdc4',
      '#45b7d1',
      '#96ceb4',
      '#feca57',
      '#ff9ff3',
      '#54a0ff',
    ];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`;

      document.body.appendChild(confetti);

      // Remove confetti after animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 5000);
    }
  };

  // Add CSS animation for confetti
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  const checkAllAgentsComplete = () => {
    // Use setTimeout to ensure state updates have been processed
    setTimeout(() => {
      if (!isLoadingFlights && !isLoadingHotels && !isLoadingActivities) {
        // Check if we're already processing the celebration
        if (!celebrationProcessingRef.current) {
          celebrationProcessingRef.current = true;
          setAllAgentsComplete(true);

          // Only show celebration if not already shown
          if (!hasShownCelebration) {
            setShowCelebrationModal(true);
            setHasShownCelebration(true);
            triggerConfetti();
          }
        }
      }
    }, 100);
  };

  const resetAll = () => {
    setShowTravelForm(true);
    setTravelDetails(null);
    setSelectedActivityTypes([]);
    setHotels([]);
    setAllActivities([]);
    setFilteredActivities([]);
    setActivityResearch('');
    setFlights([]);
    setFlightThoughts([]);
    setHotelThoughts([]);
    setActivityThoughts([]);
    setAllAgentsComplete(false);
    setShowCelebrationModal(false);
    setHasShownCelebration(false);
    setActiveTab('activities'); // Reset to default tab
    celebrationProcessingRef.current = false;
  };

  const nights =
    travelDetails?.startDate && travelDetails?.endDate
      ? differenceInDays(travelDetails.endDate, travelDetails.startDate)
      : 0;

  if (showTravelForm) {
    return (
      <TravelInputForm
        onSubmit={handleTravelDetailsSubmit}
        isMobile={isMobile}
      />
    );
  }

  const mobileLayout = (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Chat Bubble - only show after all agents complete */}
      {allAgentsComplete && <MobileChatBubble travelDetails={travelDetails} onTabChange={handleTabChange} />}

      {/* Mobile Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {travelDetails?.destination || 'Your Trip'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetAll}
            className="text-gray-600 hover:text-gray-900"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {travelDetails?.startDate && travelDetails?.endDate
            ? `${format(travelDetails.startDate, 'MMM d')} - ${format(travelDetails.endDate, 'MMM d')}`
            : 'Select dates'}{' '}
          • {nights} nights • {travelDetails?.travelers || 0} travelers
        </p>
      </div>

      {/* Mobile Content */}
      <div className="px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
            <TabsTrigger value="flights">Flights</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="mt-6">
            {/* Activity Type Selection */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                What interests you?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {activityTypes.map((type) => (
                  <ActivityTypeCardComponent
                    key={type.id}
                    type={type}
                    isSelected={selectedActivityTypes.includes(type.id)}
                    onSelect={() => handleActivityTypeSelect(type.id)}
                  />
                ))}
              </div>
            </div>

            {/* Activities */}
            {isLoadingActivities ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hotels" className="mt-6">
            {isLoadingHotels ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="flights" className="mt-6">
            {isLoadingFlights ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  const desktopLayout = (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {travelDetails?.destination || 'Your Trip'}
              </h1>
              <div className="ml-4 text-sm text-gray-600">
                {travelDetails?.startDate && travelDetails?.endDate
                  ? `${format(travelDetails.startDate, 'MMM d')} - ${format(travelDetails.endDate, 'MMM d')}`
                  : 'Select dates'}{' '}
                • {nights} nights • {travelDetails?.travelers || 0} travelers
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={resetAll} variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                New Search
              </Button>
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Activities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Activities & Attractions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Activity Type Selection */}
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    What interests you?
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activityTypes.map((type) => (
                      <ActivityTypeCardComponent
                        key={type.id}
                        type={type}
                        isSelected={selectedActivityTypes.includes(type.id)}
                        onSelect={() => handleActivityTypeSelect(type.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Activities */}
                {isLoadingActivities ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredActivities.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Hotels & Flights */}
          <div className="space-y-8">
            {/* Hotels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Hotels
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHotels ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hotels.map((hotel) => (
                      <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Flights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Flights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingFlights ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {flights.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chat Interface - Desktop */}
      {allAgentsComplete && (
        <ChatInterface
          travelDetails={travelDetails}
          onTabChange={handleTabChange}
          flightThoughts={flightThoughts}
          hotelThoughts={hotelThoughts}
          activityThoughts={activityThoughts}
          activityResearch={activityResearch}
        />
      )}

      {/* Celebration Modal */}
      <Dialog open={showCelebrationModal} onOpenChange={setShowCelebrationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-6 w-6 text-yellow-500" />
              Your Trip is Ready!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              🎉 Congratulations! I've found amazing options for your trip to{' '}
              {travelDetails?.destination}. Everything is personalized just for you!
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{flights.length} flights</Badge>
                <Badge variant="secondary">{hotels.length} hotels</Badge>
                <Badge variant="secondary">{allActivities.length} activities</Badge>
              </div>
            </div>
            <Button
              onClick={() => setShowCelebrationModal(false)}
              className="w-full"
            >
              Start Exploring
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  return isMobile ? mobileLayout : desktopLayout;
} 