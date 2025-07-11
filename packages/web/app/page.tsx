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
          details.travelers,
          details.isRoundTrip !== false // Default to true if not specified
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
    travelers: number,
    isRoundTrip: boolean = true
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
    
    // Generate outbound flights
    const outboundFlights = airlines.slice(0, 3).map((airline: string, index: number) => {
      const departureTime = index === 0 ? '8:30 AM' : index === 1 ? '2:15 PM' : '6:45 PM';
      const arrivalTime = index === 0 ? '12:30 PM' : index === 1 ? '6:15 PM' : '10:45 PM';
      const stops = preferences.stopPreference === 'direct' ? 0 : Math.floor(Math.random() * 2);
      
      return {
        id: `ai-flight-outbound-${index}`,
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

    let allFlights = [...outboundFlights];

    // Generate return flights if round trip
    if (isRoundTrip) {
      const returnFlights = airlines.slice(0, 3).map((airline: string, index: number) => {
        const departureTime = index === 0 ? '9:15 AM' : index === 1 ? '3:30 PM' : '7:20 PM';
        const arrivalTime = index === 0 ? '1:15 PM' : index === 1 ? '7:30 PM' : '11:20 PM';
        const stops = preferences.stopPreference === 'direct' ? 0 : Math.floor(Math.random() * 2);
        
        return {
          id: `ai-flight-return-${index}`,
          airline,
          flightNumber: `${airline.substr(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
          departure: {
            airport: destinationAirport,
            city: destinationCity,
            time: departureTime,
            date: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          },
          arrival: {
            airport: departureAirport,
            city: departureCity,
            time: arrivalTime,
            date: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          },
          duration: stops === 0 ? '4h 0m' : '6h 30m',
          price: basePrice + Math.floor(Math.random() * 200),
          stops,
          class: cabinClass,
          aircraft: aircraftTypes[index % aircraftTypes.length],
          source: 'ai' as const,
        };
      });

      allFlights = [...allFlights, ...returnFlights];
    }

    return allFlights;
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
          <h1 className="text-xl font-bold">Vacation Planner</h1>
          <Button variant="outline" size="sm" onClick={resetAll}>
            <RotateCcw size={16} />
          </Button>
        </div>
                    {travelDetails && (
              <div className="mb-2 text-sm text-gray-600">
                {travelDetails.departureLocation} → {travelDetails.destination}
                {travelDetails.startDate && travelDetails.endDate && (
                  <div>
                    {format(travelDetails.startDate, 'MMM d')} -{' '}
                    {format(travelDetails.endDate, 'MMM d')} ({nights} nights) •{' '}
                    {travelDetails.adults} adult
                    {travelDetails.adults !== 1 ? 's' : ''}
                    {travelDetails.children > 0
                      ? `, ${travelDetails.children} child${travelDetails.children !== 1 ? 'ren' : ''}`
                      : ''}
                    {travelDetails.travelingWithPets ? ' • with pets' : ''}
                    {travelDetails.isRoundTrip === false ? ' • one-way' : ''}
                  </div>
                )}
              </div>
            )}
      </div>

      {/* Mobile Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activities">Activity Types</TabsTrigger>
            <TabsTrigger value="flights" className="flex items-center gap-1">
              <span className="hidden sm:inline">Flights</span>
              <span className="sm:hidden">✈️</span>
              {isLoadingFlights && (
                <Sparkles className="h-3 w-3 animate-pulse text-blue-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-1">
              <span className="hidden sm:inline">Hotels</span>
              <span className="sm:hidden">🏨</span>
              {isLoadingHotels && (
                <Sparkles className="h-3 w-3 animate-pulse text-blue-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-1">
              <span className="hidden sm:inline">Results</span>
              <span className="sm:hidden">📍</span>
              {isLoadingActivities && (
                <Sparkles className="h-3 w-3 animate-pulse text-blue-500" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>What interests you?</CardTitle>
                <p className="text-sm text-gray-600">
                  Select activity types to filter recommendations
                </p>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {activityTypes.map((type) => (
                <ActivityTypeCardComponent
                  key={type.id}
                  card={type}
                  isSelected={selectedActivityTypes.includes(type.id)}
                  onClick={() => handleActivityTypeSelect(type.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flights" className="space-y-4">
            {isLoadingFlights ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-pulse text-blue-500" />
                    AI Flight Agent
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Searching for flights...
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {flightThoughts.map((thought, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-600"
                      >
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                        <p>{thought}</p>
                      </div>
                    ))}
                    {flightThoughts.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        <span>Initializing...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {flights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    travelers={travelDetails?.travelers || 1}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hotels" className="space-y-4">
            {isLoadingHotels ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-pulse text-blue-500" />
                    AI Hotel Agent
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Searching for hotels...
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hotelThoughts.map((thought, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-600"
                      >
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                        <p>{thought}</p>
                      </div>
                    ))}
                    {hotelThoughts.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        <span>Initializing...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} nights={nights} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {isLoadingActivities ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-pulse text-blue-500" />
                    AI Activity Agent
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Researching activities...
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityThoughts.map((thought, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-600"
                      >
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                        <p>{thought}</p>
                      </div>
                    ))}
                    {activityThoughts.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        <span>Initializing...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {selectedActivityTypes.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedActivityTypes.map((typeId) => {
                      const type = activityTypes.find((t) => t.id === typeId);
                      return (
                        <Badge key={typeId} variant="secondary">
                          {type?.icon} {type?.title}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {filteredActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}

                {filteredActivities.length === 0 &&
                  allActivities.length > 0 && (
                    <p className="py-8 text-center text-gray-500">
                      No activities match your selected types. Try selecting
                      different activity types.
                    </p>
                  )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // Desktop Layout
  const desktopLayout = (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold">TravelAgentic</h1>
            <Button variant="outline" onClick={resetAll}>
              <RotateCcw size={16} className="mr-2" />
              Start Over
            </Button>
          </div>
          {travelDetails && (
            <div className="mb-4 text-center text-gray-600">
              <div className="text-lg font-medium">
                {travelDetails.departureLocation} → {travelDetails.destination}
              </div>
              {travelDetails.startDate && travelDetails.endDate && (
                <div className="mt-1 text-sm">
                  {format(travelDetails.startDate, 'MMM d')} -{' '}
                  {format(travelDetails.endDate, 'MMM d')} ({nights}{' '}
                  {nights === 1 ? 'night' : 'nights'}) • {travelDetails.adults}{' '}
                  adult
                  {travelDetails.adults !== 1 ? 's' : ''}
                  {travelDetails.children > 0
                    ? `, ${travelDetails.children} child${travelDetails.children !== 1 ? 'ren' : ''}`
                    : ''}
                  {travelDetails.travelingWithPets ? ' • with pets' : ''}
                  {travelDetails.isRoundTrip === false ? ' • one-way' : ''}
                </div>
              )}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-4">
            <TabsTrigger value="activities">Activity Preferences</TabsTrigger>
            <TabsTrigger value="flights" className="flex items-center gap-2">
              Flights
              {isLoadingFlights && (
                <Sparkles className="h-4 w-4 animate-pulse text-blue-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              Hotels
              {isLoadingHotels && (
                <Sparkles className="h-4 w-4 animate-pulse text-blue-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              Activity Results
              {isLoadingActivities && (
                <Sparkles className="h-4 w-4 animate-pulse text-blue-500" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What type of activities interest you?</CardTitle>
                <p className="text-gray-600">
                  Select the types of activities you'd like to do. This will
                  help us filter the research results.
                </p>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {activityTypes.map((type) => (
                <ActivityTypeCardComponent
                  key={type.id}
                  card={type}
                  isSelected={selectedActivityTypes.includes(type.id)}
                  onClick={() => handleActivityTypeSelect(type.id)}
                />
              ))}
            </div>

            {selectedActivityTypes.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Selected Activity Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedActivityTypes.map((typeId) => {
                      const type = activityTypes.find((t) => t.id === typeId);
                      return (
                        <Badge
                          key={typeId}
                          variant="secondary"
                          className="text-sm"
                        >
                          {type?.icon} {type?.title}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="flights">
            {isLoadingFlights ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-pulse text-blue-500" />
                    AI Flight Agent is searching...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {flightThoughts.map((thought, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-600"
                      >
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                        <p>{thought}</p>
                      </div>
                    ))}
                    {flightThoughts.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                        <span>Initializing flight search...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Flight Options</CardTitle>
                    <p className="text-gray-600">
                      Best flights for your trip from{' '}
                      {travelDetails?.departureLocation} to{' '}
                      {travelDetails?.destination}
                    </p>
                  </CardHeader>
                </Card>
                <div className="space-y-4">
                  {flights.map((flight) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      travelers={travelDetails?.travelers || 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hotels">
            {isLoadingHotels ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-pulse text-blue-500" />
                    AI Hotel Agent is searching...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hotelThoughts.map((thought, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-600"
                      >
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                        <p>{thought}</p>
                      </div>
                    ))}
                    {hotelThoughts.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                        <span>Initializing hotel search...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} nights={nights} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="results">
            {isLoadingActivities ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-pulse text-blue-500" />
                    AI Activity Agent is researching...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityThoughts.map((thought, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-600"
                      >
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                        <p>{thought}</p>
                      </div>
                    ))}
                    {activityThoughts.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                        <span>Initializing activity research...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                {selectedActivityTypes.length > 0 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Filtered by your preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedActivityTypes.map((typeId) => {
                          const type = activityTypes.find(
                            (t) => t.id === typeId
                          );
                          return (
                            <Badge key={typeId} variant="secondary">
                              {type?.icon} {type?.title}
                            </Badge>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>

                {filteredActivities.length === 0 &&
                  allActivities.length > 0 && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="mb-4 text-gray-500">
                          No activities match your selected preferences.
                        </p>
                        <p className="text-sm text-gray-400">
                          Try selecting different activity types or view all
                          activities.
                        </p>
                      </CardContent>
                    </Card>
                  )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Panel - only show after all agents complete */}
      {allAgentsComplete && (
        <div className="w-96 border-l bg-white">
          <ChatInterface 
            className="h-full border-none shadow-none" 
            travelDetails={travelDetails}
            onTabChange={handleTabChange}
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? mobileLayout : desktopLayout}

      {/* Celebration Modal - shown on both mobile and desktop */}
      <Dialog
        open={showCelebrationModal}
        onOpenChange={setShowCelebrationModal}
      >
        <DialogContent className="mx-auto w-[90vw] max-w-[400px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center justify-center gap-2 text-center text-xl sm:text-2xl">
              <PartyPopper className="h-6 w-6 text-yellow-500 sm:h-8 sm:w-8" />
              <span className="text-center">Found your dream vacation!</span>
              <PartyPopper className="h-6 w-6 text-yellow-500 sm:h-8 sm:w-8" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <div className="flex justify-center gap-2 text-4xl"></div>
            <p className="text-base text-gray-700 sm:text-lg">
              Our AI agents have found amazing options for your trip!
            </p>
            <p className="text-sm text-gray-600">
              Check out the flights, hotels, and activities we've curated just
              for you.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => setShowCelebrationModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 text-white hover:from-blue-600 hover:to-purple-700 sm:w-auto sm:px-8"
              >
                Let's explore! ✨
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
