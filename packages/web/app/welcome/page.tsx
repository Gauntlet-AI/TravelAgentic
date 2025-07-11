/**
 * Welcome Page
 * Shown to users after successful login or signup
 * Features three chat modes and an integrated AI chat panel
 */

'use client';

import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import { useAuth } from '@/lib/auth/auth-context';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';
import { ChatInterface } from '@/components/chat-interface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Brain, Sparkles, ChevronRight, Bot, ArrowRight } from 'lucide-react';
import { getCurrentLocation, formatLocationDisplay } from '@/lib/utils';
import type { TravelDetails } from '@/lib/mock-data';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export type ChatMode = 'conversation' | 'quiz' | 'autonomous' | null;

// Interface to track collected trip information
interface TripInformation {
  departureLocation?: string;
  destination?: string;
  flightType?: string;
  hotelType?: string;
  returnFlight?: boolean;
  duration?: string;
  activities?: string;
  travelers?: number;
}

const chatModeConfig = {
  conversation: {
    title: 'Chat About Your Trip',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in CONVERSATION mode. Be CONCISE and FRIENDLY.

CRITICAL: Your ONLY job is to COLLECT user travel preferences. DO NOT search for or book anything.

STYLE:
- Keep responses SHORT (2-3 sentences max)
- Be conversational but brief
- Ask ONE specific question at a time
- Use simple, clear language

REQUIRED FIELDS TO COLLECT (keep asking until ALL are filled):
1. departureLocation - Where they're leaving from (city, airport)
2. destination - Where they want to go (city, country)
3. flightType - Flight class preference (economy, premium economy, business, first class)
4. hotelType - Hotel category (budget, mid-range, luxury, boutique)
5. returnFlight - Round trip or one-way (true/false)
6. duration - Trip length (number of days/weeks)
7. activities - Activity preferences (adventure, culture, relaxation, nightlife, food, shopping, etc.)
8. travelers - Number of travelers (adults and children count)

BEHAVIOR:
- Keep track of what information you've collected
- ALWAYS ask about missing required fields
- Don't let conversation end until ALL 8 fields are collected
- Confirm details they provide
- If they give partial info, ask for clarification
- DO NOT search for flights, hotels, or activities
- DO NOT make bookings

APPROACH:
- Listen to their travel ideas first
- Then systematically ask about any missing required fields
- Say things like "I still need to know..." or "One more thing..."
- Keep asking until you have all 8 required pieces of information
- Once you have ALL required fields, IMMEDIATELY call updateTripInfo tool with the collected information
- Confirm the information was saved and they can proceed

IMPORTANT: Once you have all 8 required fields, you MUST call the updateTripInfo tool to save the information so the user can proceed to itinerary planning!`
  },
  quiz: {
    title: 'Quiz Me',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in QUIZ mode. Be BRIEF and ENGAGING.

CRITICAL: Your ONLY job is to COLLECT user travel preferences through questions. DO NOT search for or book anything.

STYLE:
- Ask ONE short question at a time
- Keep questions simple and fun
- Responses should be 1-2 sentences max
- Use emojis occasionally for engagement

REQUIRED FIELDS TO COLLECT (quiz through ALL of these):
1. departureLocation - Where they're leaving from
2. destination - Where they want to go
3. flightType - Flight class (economy, premium economy, business, first class)
4. hotelType - Hotel type (budget, mid-range, luxury, boutique)
5. returnFlight - Round trip or one-way
6. duration - How many days/weeks
7. activities - What they want to do (adventure, culture, relaxation, etc.)
8. travelers - How many people traveling

BEHAVIOR:
- Work through the quiz systematically
- Don't skip any required fields
- Keep asking until ALL 8 fields are answered
- Make it fun with questions like "Quick question!" or "Almost done!"
- Acknowledge their answers briefly then move to next question
- DO NOT search for options or make bookings

QUIZ FLOW:
1. Start with fun opener about travel style
2. Ask about destination preferences
3. Ask about departure location
4. Ask about trip duration
5. Ask about number of travelers
6. Ask about flight preferences
7. Ask about hotel preferences
8. Ask about activity preferences
9. Confirm all details are complete

APPROACH:
- Keep questions short and engaging
- Use numbers to show progress ("Question 3 of 8!")
- Don't let them proceed until all required fields are collected
- Once you have ALL 8 answers, IMMEDIATELY call updateTripInfo tool with the collected information
- End with "Quiz complete! You're ready to proceed!"

IMPORTANT: Once you have all 8 required answers, you MUST call the updateTripInfo tool to save the information so the user can proceed to itinerary planning!`
  },
  autonomous: {
    title: 'Choose For Me',
    systemPrompt: (userLocation: any) => `You are TravelAgentic's AI Travel Agent in AUTONOMOUS mode. Be DECISIVE and EFFICIENT.

CRITICAL: Your job is to MAKE SMART DECISIONS for the user to fill all required fields quickly.

STYLE:
- Short, confident responses (1-3 sentences)
- Be authoritative but friendly
- Make decisions for them instead of asking questions
- Present your choices clearly

REQUIRED FIELDS TO FILL (make decisions for ALL):
1. departureLocation - ${userLocation ? formatLocationDisplay(userLocation) : 'Use their current location or major nearby airport'}
2. destination - Pick a trending destination based on season/preferences
3. flightType - Choose economy or premium economy (practical default)
4. hotelType - Choose mid-range or boutique (good value)
5. returnFlight - Default to round trip (true)
6. duration - Choose 5-7 days (perfect trip length)
7. activities - Mix of culture, relaxation, and local experiences
8. travelers - Assume 1-2 adults unless they specify otherwise

BEHAVIOR:
- Make ALL decisions for them quickly
- Explain your reasoning briefly
- Fill in ALL required fields in 2-3 exchanges
- Present final summary for confirmation
- DO NOT ask questions - MAKE CHOICES
- DO NOT search for flights, hotels, or activities

DECISION APPROACH:
1. Confirm departure location (use their location)
2. CHOOSE a great destination for them (consider season, weather, popular spots)
3. SET flight preferences (economy for budget-conscious, premium economy for comfort)
4. PICK hotel type (mid-range for value, boutique for experience)
5. SET trip as round trip, 5-7 days duration
6. SELECT activity mix (culture + relaxation + local experiences)
7. ASSUME 1-2 travelers unless specified
8. Present complete plan for confirmation

EXAMPLE RESPONSE:
"Perfect! I'm setting up your trip:
- Departing from: [Location]
- Destination: Barcelona, Spain (perfect weather this time of year!)
- Flight: Premium economy (good comfort/value balance)
- Hotel: Boutique hotel (unique local experience)
- Duration: 6 days round trip
- Activities: Mix of culture (museums, architecture), relaxation (beaches, cafes), and local experiences (food tours)
- Travelers: 2 adults
Let me save this information for you!"

[Then IMMEDIATELY call updateTripInfo tool with all the information]

IMPORTANT: Once you've made all the decisions, you MUST call the updateTripInfo tool to save the information so the user can proceed to itinerary planning!`
  }
};

export default function WelcomePage() {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<ChatMode>(null);
  const [chatKey, setChatKey] = useState(0); // Force re-render chat when mode changes
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [clearHistory, setClearHistory] = useState(false);
  const [tripInformation, setTripInformation] = useState<TripInformation>({});
  const [userLocation, setUserLocation] = useState<{
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Fetch user location on component mount
  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoadingLocation(true);
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.error('Failed to get user location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchLocation();
  }, []);

  // Background slideshow images (same as landing page)
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

  // Slideshow effect with proper crossfade
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 15000); // Change image every 15 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Check if enough information is collected to proceed
  const hasEnoughInformation = (): boolean => {
    const required = tripInformation;
    return !!(
      required.departureLocation &&
      required.destination &&
      required.flightType &&
      required.hotelType &&
      (required.returnFlight !== undefined) &&
      required.duration &&
      required.activities &&
      required.travelers
    );
  };

  // Handle proceed to itinerary
  const handleProceedToItinerary = () => {
    if (hasEnoughInformation()) {
      // Navigate to itinerary page or trigger next step
      console.log('Proceeding to itinerary with:', tripInformation);
      // TODO: Navigate to itinerary page
    }
  };

  // Update trip information based on chat messages
  const updateTripInformation = (info: Partial<TripInformation>) => {
    setTripInformation(prev => ({ ...prev, ...info }));
  };

  // Create travel details for autonomous mode
  const createTravelDetailsForAutonomous = (): TravelDetails | null => {
    if (!userLocation) return null;
    
    const today = new Date();
    const departureDate = new Date(today);
    departureDate.setDate(today.getDate() + 14); // 2 weeks from now
    
    const returnDate = new Date(departureDate);
    returnDate.setDate(departureDate.getDate() + 5); // 5-day trip
    
    return {
      departureLocation: formatLocationDisplay(userLocation),
      destination: '', // Will be chosen by AI
      startDate: departureDate,
      endDate: returnDate,
      travelers: 1,
      adults: 1,
      children: 0,
    };
  };

  // Get system prompt for selected mode
  const getSystemPrompt = (mode: ChatMode): string => {
    if (!mode) return '';
    
    const config = chatModeConfig[mode];
    if (typeof config.systemPrompt === 'function') {
      return config.systemPrompt(userLocation);
    }
    return config.systemPrompt;
  };

  const chatModeOptions = [
    {
      id: 'conversation' as ChatMode,
      title: 'Chat about your trip',
      description: 'Perfect when you know roughly what you want.',
      icon: MessageCircle,
      color: 'bg-blue-500'
    },
    {
      id: 'quiz' as ChatMode,
      title: 'Quiz me',
      description: 'You\'re not sure what you want - I\'ll ask questions to find out.',
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      id: 'autonomous' as ChatMode,
      title: 'Choose for me',
      description: isLoadingLocation 
        ? 'Detecting your location...'
        : userLocation 
          ? `I'll suggest options using your location (${formatLocationDisplay(userLocation)}).`
          : 'I\'ll suggest options using your current location.',
      icon: Sparkles,
      color: 'bg-green-500'
    }
  ];

  const handleModeSelect = (mode: ChatMode) => {
    setSelectedMode(mode);
    setChatKey(prev => prev + 1); // Force chat to re-render with new mode
    
    // Clear chat history when switching modes
    setClearHistory(true);
    setTimeout(() => setClearHistory(false), 100); // Reset after clearing
    
    // Reset trip information when switching modes
    setTripInformation({});
    
    // Set the initial message based on the selected mode
    const initialMessages = {
      conversation: 'I have some trip ideas and want to discuss them with you',
      quiz: 'Start the quiz',
      autonomous: 'Plan my trip'
    };
    
    if (mode && initialMessages[mode]) {
      setInitialMessage(initialMessages[mode]);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((image, index) => {
          const isActive = index === currentImageIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image.url})`,
              }}
            />
          );
        })}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <span
            className={`text-2xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}
          >
            TravelAgentic
          </span>
        </div>
        
        {user && <UserProfileDropdown />}
      </header>

      {/* Main Content - Centered Layout */}
      <main className="relative z-10 flex min-h-[calc(100vh-88px)] p-6">
        {/* Center Content - Option Selection */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto">
          <div className="w-full max-w-lg text-center mb-8">
            <h1 className={`text-4xl lg:text-5xl font-bold mb-4 text-white ${inter.className} font-medium animate-in fade-in slide-in-from-bottom-4 duration-700`}>
              Let's plan your
              <br />
              <span className="text-blue-400">perfect trip</span>
            </h1>
            <p className="text-lg text-white/90 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {user && (
                <span className="block mb-2">
                  Welcome back, <span className="font-semibold text-blue-300">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}</span>!
                </span>
              )}
              Choose how you'd like to get started
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="w-full max-w-lg space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            {chatModeOptions.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selectedMode === option.id;
              
              return (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    isSelected 
                      ? 'ring-2 ring-blue-400 bg-white/95' 
                      : 'bg-white/80 backdrop-blur-sm hover:bg-white/90'
                  }`}
                  onClick={() => handleModeSelect(option.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${option.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            {option.title}
                          </CardTitle>
                        </div>
                      </div>                      
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 text-sm mb-2">{option.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Proceed to Itinerary Button */}
          <div className="w-full max-w-lg mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
            <Button
              onClick={handleProceedToItinerary}
              disabled={!hasEnoughInformation()}
              className={`w-full h-14 text-lg font-semibold transition-all duration-300 ${
                hasEnoughInformation()
                  ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed opacity-50'
              }`}
            >
              <span className="flex items-center gap-2">
                Proceed to Itinerary
              </span>
            </Button>
            {!hasEnoughInformation() && selectedMode && (
              <p className="text-white/70 text-sm mt-2 text-center">
                Complete your travel preferences in the chat to continue
              </p>
            )}
          </div>
        </div>
      </main>

      {/* AI Chat Interface - Always Visible Right Panel */}
      <div className="fixed right-6 top-24 bottom-6 w-96 z-50">
        {selectedMode ? (
          <ChatInterface
            key={chatKey}
            customSystemPrompt={getSystemPrompt(selectedMode)}
            customPlaceholder={getPlaceholder(selectedMode)}
            customEmptyStateMessage={getEmptyStateMessage(selectedMode)}
            initialMessage={initialMessage}
            clearHistory={clearHistory}
            mode={selectedMode}
            onTripInfoUpdate={updateTripInformation}
            tripInfoComplete={hasEnoughInformation()}
            className="h-full"
          />
        ) : (
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                AI Travel Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Bot className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <p className="text-lg font-medium mb-2">Ready to plan your perfect trip?</p>
                <p className="text-sm">Select how you'd like to get started and I'll help you collect your travel preferences!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getPlaceholder(mode: ChatMode): string {
  switch (mode) {
    case 'conversation':
      return 'Tell me about your trip ideas...';
    case 'quiz':
      return 'Ready for the quiz!';
    case 'autonomous':
      return 'Let me suggest options for you...';
    default:
      return 'How can I help you plan your trip?';
  }
}

function getEmptyStateMessage(mode: ChatMode): string {
  switch (mode) {
    case 'conversation':
      return 'Tell me about your travel ideas and I\'ll help you organize your preferences!';
    case 'quiz':
      return 'I\'ll ask you questions to understand your ideal travel preferences.';
    case 'autonomous':
      return 'I\'ll suggest options to quickly gather your travel preferences!';
    default:
      return 'Ask me anything about your vacation plans!';
  }
} 