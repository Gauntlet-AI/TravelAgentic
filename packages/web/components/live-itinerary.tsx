'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plane, 
  Hotel, 
  MapPin, 
  Calendar, 
  DollarSign,
  Clock,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit3,
  Sparkles,
  RefreshCw,
  Play,
  Pause,
  Star,
  Utensils,
  Camera,
  Car,
  Wifi,
  Coffee
} from 'lucide-react';

interface ItinerarySection {
  id: string;
  type: 'flights' | 'accommodation' | 'activities' | 'logistics' | 'booking';
  title: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  progress?: number;
  data?: any;
  alternatives?: any[];
  agentMessage?: string;
  lastUpdated?: number;
  canModify?: boolean;
}

interface LiveItineraryProps {
  conversationId?: string;
  automationLevel?: number;
  isActive?: boolean;
  onSectionModify?: (sectionId: string, sectionType: string) => void;
  onAutomationLevelChange?: (level: number) => void;
  onAutomationPause?: () => void;
  onAutomationResume?: () => void;
  onAutomationReset?: () => void;
  className?: string;
}

const SECTION_ICONS = {
  flights: Plane,
  accommodation: Hotel,
  activities: MapPin,
  logistics: Calendar,
  booking: DollarSign
};

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-600',
  loading: 'bg-blue-100 text-blue-600',
  complete: 'bg-green-100 text-green-600',
  error: 'bg-red-100 text-red-600'
};

// Realistic mock data that simulates real travel options
const MOCK_DESTINATIONS = {
  'Paris, France': {
    flights: [
      { airline: 'Air France', flightNumber: 'AF123', departure: '8:30 AM', arrival: '10:45 PM', duration: '7h 15m', price: 650, stops: 0, aircraft: 'Boeing 777' },
      { airline: 'Delta Air Lines', flightNumber: 'DL234', departure: '2:15 PM', arrival: '4:30 AM+1', duration: '8h 15m', price: 590, stops: 1, aircraft: 'Airbus A330' },
      { airline: 'United Airlines', flightNumber: 'UA456', departure: '11:20 PM', arrival: '1:35 PM+1', duration: '7h 15m', price: 720, stops: 0, aircraft: 'Boeing 787' }
    ],
    hotels: [
      { name: 'Le Grand Hotel Paris', location: 'Champs-Élysées', rating: 4.8, pricePerNight: 280, amenities: ['Spa', 'Concierge', 'Restaurant', 'Gym'], image: 'luxury-hotel.jpg' },
      { name: 'Hotel des Arts Montmartre', location: 'Montmartre', rating: 4.5, pricePerNight: 180, amenities: ['WiFi', 'Breakfast', 'Rooftop Terrace'], image: 'boutique-hotel.jpg' },
      { name: 'Ibis Paris Opera', location: 'Opera District', rating: 4.2, pricePerNight: 120, amenities: ['WiFi', '24h Reception', 'Business Center'], image: 'business-hotel.jpg' }
    ],
    activities: [
      { name: 'Skip-the-Line Eiffel Tower Tour', duration: '2 hours', price: 45, category: 'Sightseeing', rating: 4.7 },
      { name: 'Louvre Museum Private Tour', duration: '3 hours', price: 85, category: 'Culture', rating: 4.9 },
      { name: 'Seine River Dinner Cruise', duration: '2.5 hours', price: 125, category: 'Dining', rating: 4.6 },
      { name: 'Versailles Palace Day Trip', duration: '8 hours', price: 95, category: 'Excursion', rating: 4.8 },
      { name: 'Montmartre Food Walking Tour', duration: '3 hours', price: 65, category: 'Food & Drink', rating: 4.5 }
    ]
  },
  'Tokyo, Japan': {
    flights: [
      { airline: 'Japan Airlines', flightNumber: 'JL005', departure: '1:35 PM', arrival: '3:45 PM+1', duration: '14h 10m', price: 890, stops: 0, aircraft: 'Boeing 777' },
      { airline: 'All Nippon Airways', flightNumber: 'NH110', departure: '6:50 PM', arrival: '9:15 PM+1', duration: '13h 25m', price: 950, stops: 0, aircraft: 'Boeing 787' },
      { airline: 'United Airlines', flightNumber: 'UA838', departure: '11:40 AM', arrival: '2:55 PM+1', duration: '14h 15m', price: 820, stops: 0, aircraft: 'Boeing 777' }
    ],
    hotels: [
      { name: 'The Tokyo Station Hotel', location: 'Tokyo Station', rating: 4.9, pricePerNight: 450, amenities: ['Spa', 'Multiple Restaurants', 'Concierge', 'Gym'], image: 'luxury-hotel.jpg' },
      { name: 'Hotel Gracery Shinjuku', location: 'Shinjuku', rating: 4.6, pricePerNight: 220, amenities: ['WiFi', 'Restaurant', 'Godzilla View'], image: 'modern-hotel.jpg' },
      { name: 'Shibuya Granbell Hotel', location: 'Shibuya', rating: 4.4, pricePerNight: 180, amenities: ['WiFi', 'Design Hotel', 'Lounge'], image: 'boutique-hotel.jpg' }
    ],
    activities: [
      { name: 'Tokyo Fish Market & Sushi Making', duration: '4 hours', price: 120, category: 'Food & Culture', rating: 4.8 },
      { name: 'Mount Fuji Day Trip', duration: '12 hours', price: 180, category: 'Nature', rating: 4.7 },
      { name: 'Traditional Tea Ceremony', duration: '1.5 hours', price: 55, category: 'Culture', rating: 4.6 },
      { name: 'Shibuya & Harajuku Walking Tour', duration: '3 hours', price: 45, category: 'Sightseeing', rating: 4.5 },
      { name: 'Tokyo Skytree Fast Track', duration: '2 hours', price: 35, category: 'Sightseeing', rating: 4.4 }
    ]
  },
  'London, England': {
    flights: [
      { airline: 'British Airways', flightNumber: 'BA112', departure: '9:50 PM', arrival: '6:15 AM+1', duration: '6h 25m', price: 580, stops: 0, aircraft: 'Boeing 777' },
      { airline: 'Virgin Atlantic', flightNumber: 'VS004', departure: '7:35 PM', arrival: '4:10 AM+1', duration: '6h 35m', price: 620, stops: 0, aircraft: 'Airbus A350' },
      { airline: 'American Airlines', flightNumber: 'AA100', departure: '10:25 PM', arrival: '7:00 AM+1', duration: '6h 35m', price: 540, stops: 0, aircraft: 'Boeing 777' }
    ],
    hotels: [
      { name: 'The Savoy London', location: 'Covent Garden', rating: 4.9, pricePerNight: 650, amenities: ['Spa', 'Michelin Restaurant', 'Butler Service', 'Thames View'], image: 'luxury-hotel.jpg' },
      { name: 'The Z Hotel Piccadilly', location: 'Piccadilly Circus', rating: 4.3, pricePerNight: 180, amenities: ['WiFi', 'Sky Lounge', 'Smart Rooms'], image: 'modern-hotel.jpg' },
      { name: 'Premier Inn London County Hall', location: 'South Bank', rating: 4.4, pricePerNight: 140, amenities: ['WiFi', 'Restaurant', 'Family Rooms'], image: 'business-hotel.jpg' }
    ],
    activities: [
      { name: 'Tower of London Crown Jewels', duration: '3 hours', price: 35, category: 'History', rating: 4.6 },
      { name: 'West End Theater Show', duration: '2.5 hours', price: 85, category: 'Entertainment', rating: 4.8 },
      { name: 'Thames River Cruise', duration: '1.5 hours', price: 25, category: 'Sightseeing', rating: 4.4 },
      { name: 'Windsor Castle Day Trip', duration: '6 hours', price: 65, category: 'Excursion', rating: 4.7 },
      { name: 'Borough Market Food Tour', duration: '2.5 hours', price: 55, category: 'Food & Drink', rating: 4.5 }
    ]
  }
};

export default function LiveItinerary({
  conversationId = 'itinerary',
  automationLevel = 1,
  isActive = false,
  onSectionModify,
  onAutomationLevelChange,
  onAutomationPause,
  onAutomationResume,
  onAutomationReset,
  className = ''
}: LiveItineraryProps) {
  const [sections, setSections] = useState<ItinerarySection[]>([
    {
      id: 'flights',
      type: 'flights',
      title: 'Flights',
      status: 'pending',
      agentMessage: 'Ready to search for flights when you provide destination...',
      canModify: true
    },
    {
      id: 'accommodation',
      type: 'accommodation', 
      title: 'Accommodation',
      status: 'pending',
      agentMessage: 'Accommodation search will begin after flights are found...',
      canModify: true
    },
    {
      id: 'activities',
      type: 'activities',
      title: 'Activities & Experiences',
      status: 'pending',
      agentMessage: 'Activity recommendations will be curated based on your preferences...',
      canModify: true
    },
    {
      id: 'logistics',
      type: 'logistics',
      title: 'Travel Logistics',
      status: 'pending',
      agentMessage: 'Transportation and travel details will be organized...',
      canModify: false
    },
    {
      id: 'booking',
      type: 'booking',
      title: 'Booking Summary',
      status: 'pending',
      agentMessage: 'Final booking summary will be prepared...',
      canModify: false
    }
  ]);

  const [overallProgress, setOverallProgress] = useState(0);
  const [currentDestination, setCurrentDestination] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Enhanced automation simulation based on parent isActive state
  useEffect(() => {
    if (isActive) {
      setOverallProgress(0);
      simulateProgressiveSearch();
    }
  }, [isActive]);

  // Reset when parent resets
  useEffect(() => {
    if (!isActive && overallProgress > 0) {
      resetItinerary();
    }
  }, [isActive, overallProgress]);

  const simulateProgressiveSearch = async () => {
    // Simulate realistic search progression
    const destinations = Object.keys(MOCK_DESTINATIONS);
    const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
    setCurrentDestination(randomDestination);

    // Phase 1: Flight Search (0-30%)
    updateSectionStatus('flights', 'loading', 'Searching for flights...');
    await simulateProgress(0, 30, 3000);
    
    setTimeout(() => {
      const flightData = getRandomFlightData(randomDestination);
      updateSectionStatus('flights', 'complete', `✈️ Found ${MOCK_DESTINATIONS[randomDestination as keyof typeof MOCK_DESTINATIONS].flights.length} flight options`, flightData);
      
      // Phase 2: Accommodation Search (30-55%)
      updateSectionStatus('accommodation', 'loading', 'Finding accommodation options...');
      simulateProgress(30, 55, 2500).then(() => {
        const hotelData = getRandomHotelData(randomDestination);
        updateSectionStatus('accommodation', 'complete', `🏨 Found ${MOCK_DESTINATIONS[randomDestination as keyof typeof MOCK_DESTINATIONS].hotels.length} hotel options`, hotelData);
        
        // Phase 3: Activities Search (55-80%)
        updateSectionStatus('activities', 'loading', 'Curating activities and experiences...');
        simulateProgress(55, 80, 3000).then(() => {
          const activitiesData = getRandomActivitiesData(randomDestination);
          updateSectionStatus('activities', 'complete', `🎯 Curated ${activitiesData.length} experiences for you`, activitiesData);
          
          // Phase 4: Logistics (80-95%)
          updateSectionStatus('logistics', 'loading', 'Organizing travel logistics...');
          simulateProgress(80, 95, 2000).then(() => {
            const logisticsData = getLogisticsData(randomDestination);
            updateSectionStatus('logistics', 'complete', '📋 Travel logistics organized', logisticsData);
            
            // Phase 5: Booking Summary (95-100%)
            updateSectionStatus('booking', 'loading', 'Preparing booking summary...');
            simulateProgress(95, 100, 1500).then(() => {
              const bookingData = calculateBookingSummary();
              updateSectionStatus('booking', 'complete', '💳 Booking summary ready', bookingData);
            });
          });
        });
      });
    }, 1000);
  };

  const simulateProgress = (start: number, end: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentProgress = start + (end - start) * progress;
        
        setOverallProgress(currentProgress);
        
        if (progress >= 1) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  };

  const getRandomFlightData = (destination: string) => {
    const flights = MOCK_DESTINATIONS[destination as keyof typeof MOCK_DESTINATIONS]?.flights || [];
    return flights[Math.floor(Math.random() * flights.length)];
  };

  const getRandomHotelData = (destination: string) => {
    const hotels = MOCK_DESTINATIONS[destination as keyof typeof MOCK_DESTINATIONS]?.hotels || [];
    return hotels[Math.floor(Math.random() * hotels.length)];
  };

  const getRandomActivitiesData = (destination: string) => {
    const activities = MOCK_DESTINATIONS[destination as keyof typeof MOCK_DESTINATIONS]?.activities || [];
    return activities.slice(0, 3 + Math.floor(Math.random() * 3)); // 3-5 activities
  };

  const getLogisticsData = (destination: string) => {
    const logistics = {
      'Paris, France': {
        transportation: 'RER B train from CDG Airport (35 min)',
        weather: 'Mild, 18°C, partly cloudy',
        currency: 'Euro (EUR)',
        timezone: 'CET (UTC+1)',
        language: 'French',
        tips: ['Carry cash for small vendors', 'Metro day passes recommended']
      },
      'Tokyo, Japan': {
        transportation: 'Narita Express to city center (60 min)',
        weather: 'Pleasant, 22°C, clear skies',
        currency: 'Japanese Yen (JPY)',
        timezone: 'JST (UTC+9)',
        language: 'Japanese',
        tips: ['IC card for public transport', 'Many places cash-only']
      },
      'London, England': {
        transportation: 'Heathrow Express to Paddington (15 min)',
        weather: 'Cool, 15°C, light rain expected',
        currency: 'British Pound (GBP)',
        timezone: 'GMT (UTC+0)',
        language: 'English',
        tips: ['Oyster card for tube travel', 'Tipping 10-15% at restaurants']
      }
    };
    
    return logistics[destination as keyof typeof logistics] || logistics['London, England'];
  };

  const calculateBookingSummary = () => {
    const flight = sections.find(s => s.id === 'flights')?.data;
    const hotel = sections.find(s => s.id === 'accommodation')?.data;
    const activities = sections.find(s => s.id === 'activities')?.data || [];
    
    const flightCost = flight?.price || 0;
    const hotelCost = (hotel?.pricePerNight || 0) * 4; // 4 nights
    const activitiesCost = activities.reduce((sum: number, activity: any) => sum + (activity.price || 0), 0);
    const total = flightCost + hotelCost + activitiesCost;
    
    return {
      flightCost,
      hotelCost,
      activitiesCost,
      total,
      currency: 'USD',
      nights: 4,
      travelers: 2,
      cancellationPolicy: 'Free cancellation until 48h before trip',
      paymentOptions: ['Credit Card', 'PayPal', 'Bank Transfer']
    };
  };

  const updateSectionStatus = (sectionId: string, status: ItinerarySection['status'], message?: string, data?: any) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          status,
          agentMessage: message || section.agentMessage,
          data: data || section.data,
          lastUpdated: Date.now()
        };
      }
      return section;
    }));
  };

  const resetItinerary = () => {
    setSections(prev => prev.map(section => ({
      ...section,
      status: 'pending' as const,
      progress: undefined,
      data: undefined,
      agentMessage: section.id === 'flights' ? 'Ready to search for flights when you provide destination...' :
                   section.id === 'accommodation' ? 'Accommodation search will begin after flights are found...' :
                   section.id === 'activities' ? 'Activity recommendations will be curated based on your preferences...' :
                   section.id === 'logistics' ? 'Transportation and travel details will be organized...' :
                   'Final booking summary will be prepared...'
    })));
    setOverallProgress(0);
    setCurrentDestination('');
  };

  const getCompletedSections = () => {
    return sections.filter(section => section.status === 'complete').length;
  };

  const getTotalCost = () => {
    const bookingData = sections.find(s => s.id === 'booking')?.data;
    return bookingData?.total || 0;
  };

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Live Itinerary</h1>
            {currentDestination && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {currentDestination}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Level {automationLevel}
            </Badge>
            
            <Badge variant={isActive ? "default" : "outline"} className={isActive ? "bg-green-500" : ""}>
              {isActive ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  Planning
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                  Ready
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        {overallProgress > 0 && (
          <div className="space-y-2">
            <Progress value={overallProgress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>AI agents working on your itinerary...</span>
              <span>{getCompletedSections()}/{sections.length} sections complete</span>
            </div>
          </div>
        )}
      </div>

      {/* Itinerary Content */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={section.id} id={`section-${section.id}`}>
              <ItinerarySection
                section={section}
                onModify={() => onSectionModify?.(section.id, section.type)}
                automationLevel={automationLevel}
              />
              
              {index < sections.length - 1 && <Separator className="my-6" />}
            </div>
          ))}
        </div>

        {/* Trip Summary */}
        {getCompletedSections() > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Trip Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{getCompletedSections()} of {sections.length} sections ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span>Total: ${getTotalCost().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </ScrollArea>
    </div>
  );
}

function ItinerarySection({ 
  section, 
  onModify, 
  automationLevel 
}: { 
  section: ItinerarySection;
  onModify: () => void;
  automationLevel: number;
}) {
  const IconComponent = SECTION_ICONS[section.type];
  const isLoading = section.status === 'loading';
  const isComplete = section.status === 'complete';
  const hasError = section.status === 'error';

  return (
    <Card className={`transition-all duration-300 ${
      isLoading ? 'ring-2 ring-blue-200 bg-blue-50' : ''
    } ${isComplete ? 'ring-2 ring-green-200 bg-green-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isLoading ? 'bg-blue-500' : 
              isComplete ? 'bg-green-500' : 
              hasError ? 'bg-red-500' : 'bg-gray-400'
            }`}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <IconComponent className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              {section.agentMessage && (
                <p className="text-sm text-gray-600">{section.agentMessage}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[section.status]}>
              {section.status}
            </Badge>
            
            {section.canModify && isComplete && (
              <Button 
                onClick={onModify}
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Section Content */}
        <div className="space-y-4">
          {section.data && (
            <div className="rounded-lg bg-white p-4 border">
              <SectionContent 
                type={section.type}
                data={section.data}
                automationLevel={automationLevel}
              />
            </div>
          )}

          {!section.data && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <IconComponent className="h-8 w-8 text-gray-400" />
              </div>
              <p>Waiting for AI agents to generate {section.title.toLowerCase()}...</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
              <p className="text-blue-600 font-medium">AI agents are working on this section...</p>
              <p className="text-sm text-gray-500 mt-1">{section.agentMessage}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionContent({ 
  type, 
  data, 
  automationLevel 
}: { 
  type: string;
  data: any;
  automationLevel: number;
}) {
  switch (type) {
    case 'flights':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-4">
              <Plane className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-semibold text-lg">{data.airline} {data.flightNumber}</p>
                <p className="text-sm text-gray-600">{data.aircraft}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {data.departure} → {data.arrival}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {data.stops === 0 ? 'Direct' : `${data.stops} stop`}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">${data.price}</p>
              <p className="text-sm text-gray-600">{data.duration}</p>
            </div>
          </div>
        </div>
      );

    case 'accommodation':
      return (
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-start gap-4">
              <Hotel className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <p className="font-semibold text-lg">{data.name}</p>
                <p className="text-sm text-gray-600 mb-2">{data.location}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{data.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.amenities.slice(0, 3).map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">${data.pricePerNight}</p>
              <p className="text-sm text-gray-600">per night</p>
            </div>
          </div>
        </div>
      );

    case 'activities':
      return (
        <div className="space-y-3">
          {data.map((activity: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-200 rounded-full">
                  {activity.category === 'Food & Drink' || activity.category === 'Food & Culture' ? (
                    <Utensils className="h-4 w-4 text-purple-600" />
                  ) : activity.category === 'Sightseeing' ? (
                    <Camera className="h-4 w-4 text-purple-600" />
                  ) : (
                    <MapPin className="h-4 w-4 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{activity.name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      {activity.rating}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activity.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-purple-600">${activity.price}</p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'logistics':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-sm">Transportation</span>
              </div>
              <p className="text-sm text-gray-700">{data.transportation}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-sm">Weather & Time</span>
              </div>
              <p className="text-sm text-gray-700">{data.weather}</p>
              <p className="text-xs text-gray-600">{data.timezone}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-sm">Currency</span>
              </div>
              <p className="text-sm text-gray-700">{data.currency}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-sm">Language</span>
              </div>
              <p className="text-sm text-gray-700">{data.language}</p>
            </div>
          </div>
          {data.tips && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-sm text-blue-700 mb-2">💡 Travel Tips</p>
              <ul className="text-sm text-blue-600 space-y-1">
                {data.tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );

    case 'booking':
      return (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Flight for {data.travelers} travelers</span>
                <span>${data.flightCost}</span>
              </div>
              <div className="flex justify-between">
                <span>Accommodation ({data.nights} nights)</span>
                <span>${data.hotelCost}</span>
              </div>
              <div className="flex justify-between">
                <span>Activities & Experiences</span>
                <span>${data.activitiesCost}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Trip Cost</span>
                <span className="text-green-600">${data.total.toLocaleString()} {data.currency}</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium mb-1">Cancellation Policy</p>
            <p className="text-xs text-blue-600">{data.cancellationPolicy}</p>
          </div>
          
          <div className="flex gap-2">
            {data.paymentOptions.map((option: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {option}
              </Badge>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
} 