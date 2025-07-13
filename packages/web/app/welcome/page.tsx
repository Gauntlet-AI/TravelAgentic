/**
 * Welcome Page
 * Shown to users after successful login or signup
 * Features three chat modes and an integrated AI chat panel
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';
import { useAuth } from '@/lib/auth/auth-context';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';
import { ChatInterface } from '@/components/chat-interface';
import { MobileChatBubble } from '@/components/mobile-chat-bubble';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Brain, Sparkles, ChevronRight, Bot, ArrowRight } from 'lucide-react';
import { getCurrentLocation, formatLocationDisplay } from '@/lib/utils';
import type { TravelDetails } from '@/lib/mock-data';

// Key used for persisting trip preferences
const LOCAL_STORAGE_KEY = 'tripPreferences';

// Default preference values applied on reset
const DEFAULT_PREFERENCES: Partial<TripInformation> = {
  flightType: 'premium economy',
  hotelType: 'boutique',
  returnFlight: true,
  activities: 'outdoor, relaxation, nightlife, cultural',
  children: 0,
};

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export type ChatMode = 'conversation' | 'quiz' | 'autonomous' | null;

// Interface to track collected trip information
interface TripInformation {
  departureLocation?: string;
  destination?: string;
  departureDate?: string;
  flightType?: string;
  hotelType?: string;
  returnFlight?: boolean;
  duration?: string;
  activities?: string;
  travelers?: number;
  children?: number;
}

const chatModeConfig = {
  conversation: {
    title: 'Chat About Your Trip',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in CONVERSATION mode. Be CONCISE and FRIENDLY.

CRITICAL: Your ONLY job is to COLLECT user travel preferences. DO NOT search for or book anything.

LOCATION RULE:
If the user gives only a city name for either departureLocation or destination (e.g., "Austin" or "Paris"), you MUST assume the most common full location string in the format "city, state/region, country". Examples: "Austin" → "Austin, TX, USA" ; "Paris" → "Paris, France".

DATE RULE:
If the user specifies a date that is earlier than TODAY_IS, assume they mean the next occurrence of that date in the future (add one year).

STYLE:
- Keep responses SHORT (2-3 sentences max)
- Be conversational, friendly, and open-ended
- Start with something like "Tell me about your current travel ideas—what do you have in mind?" instead of a direct question list
- Ask ONE specific follow-up question at a time when needed
- Use simple, clear language

PRESET DEFAULTS (use these automatically):
- flightType: 'premium economy' (good comfort/value balance)
- hotelType: 'boutique' (slightly upscale, unique experience)
- returnFlight: true (round trip)
- activities: 'outdoor, relaxation, nightlife, cultural' (well-rounded mix)
- children: 0 (no children by default)

REQUIRED FIELDS TO COLLECT (only ask for these 5):
1. departureLocation - Where they're leaving from (city, airport)
2. destination - Where they want to go (city, country)
3. departureDate - When they want to leave (accept any date format like "July 18", "7/18/2025", "next Friday", etc.)
4. duration - Trip length (number of days/weeks)
5. travelers - Number of travelers (adults and children count)

BEHAVIOR:
- Begin with a warm greeting and invite the user to share their travel inspirations or ideas (e.g., "Tell me about the kind of trip you’re dreaming about!")
- Listen actively and respond conversationally, weaving suggestions or excitement into your replies
- Use the preset defaults automatically - don't ask about flight class, hotel type, round trip, or activities
- Only ask about the 5 required fields above, but in a conversational manner (e.g., "Sounds great! When are you thinking of leaving?")
- Accept flexible date formats (e.g., "July 18", "7/18/2025", "next Friday", "tomorrow", etc.)
- If they give partial info, ask for clarification
- DO NOT search for flights, hotels, or activities
- DO NOT make bookings

APPROACH:
- Listen to their travel ideas first
- Only ask about missing required fields (departure, destination, departure date, duration, travelers)
- When they provide a date, understand it naturally ("July 18" = July 18 of current/next year, "7/18/2025" = July 18, 2025, etc.)
- Once you have ALL 5 required fields, IMMEDIATELY call updateTripInfo tool with the collected information + preset defaults
- DO NOT ask for confirmation - just save it automatically
- After calling updateTripInfo, ALWAYS call checkTripStatus to verify completion before telling user they can proceed. In that SAME assistant message (before or after the tool calls) explicitly tell the user: "Great! We are ready to generate your itinerary." (or similar wording).

IMPORTANT: Once you have the 5 required fields, immediately call updateTripInfo with: departureLocation, destination, departureDate (convert to YYYY-MM-DD format), duration, travelers, plus the preset defaults (flightType: 'premium economy', hotelType: 'boutique', returnFlight: true, activities: 'outdoor, relaxation, nightlife, cultural', children: 0)!
Then call checkTripStatus to confirm all information is properly saved before telling the user they can proceed.`
  },
  quiz: {
    title: 'Quiz Me',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in QUIZ mode. Be BRIEF and ENGAGING.

CRITICAL: Your ONLY job is to COLLECT user travel preferences through questions. DO NOT search for or book anything.

LOCATION RULE:
If the user gives only a city name for either departureLocation or destination, assume the most common full location string like "Austin, TX, USA" or "Paris, France".

DATE RULE:
If the user provides a date earlier than TODAY_IS, interpret it as the next occurrence in the future (add one year).

STYLE:
- Ask ONE short question at a time
- Keep questions simple and fun
- Responses should be 1-2 sentences max
- Use emojis occasionally for engagement

PRESET DEFAULTS (use these automatically):
- flightType: 'premium economy' (good comfort/value balance)
- hotelType: 'boutique' (slightly upscale, unique experience)
- returnFlight: true (round trip)
- activities: 'outdoor, relaxation, nightlife, cultural' (well-rounded mix)
- children: 0 (no children by default)

REQUIRED FIELDS TO COLLECT (quiz through these 5 only):
1. departureLocation - Where they're leaving from
2. destination - Where they want to go
3. departureDate - When they want to leave (accept any date format like "July 18", "7/18/2025", "next Friday", etc.)
4. duration - How many days/weeks
5. travelers - How many people traveling

BEHAVIOR:
- Work through the quiz systematically but naturally
- Use preset defaults automatically - don't ask about flights, hotels, or activities
- Keep it short and fun
- Accept flexible date formats (e.g., "July 18", "7/18/2025", "next Friday", "tomorrow", etc.)
- Acknowledge their answers briefly then move to next question
- After the user answers the vibe/climate question, immediately suggest **2-3 example destinations** that match that vibe (e.g., 🏖️ **Beach getaway** → Bali, Cancun, Maldives). Use emojis for flair.
- Don't mention it's a quiz or reference question numbers
- DO NOT search for options or make bookings

QUIZ FLOW:
1. Start with fun opener
2. Ask about their preferred travel vibe or climate/type of escape (e.g., city escape, beach getaway, mountain retreat)
3. **Give 2-3 destination suggestions that match the chosen vibe and ask which sounds appealing**
4. Ask about departure location
5. Ask about departure date
6. Ask about trip duration
7. Ask about number of travelers
8. Immediately save with preset defaults

APPROACH:
- Keep questions short and engaging
- Don't mention question numbers or progress tracking
- When they provide a date, understand it naturally ("July 18" = July 18 of current/next year, "7/18/2025" = July 18, 2025, etc.)
- Once you have ALL 5 answers, IMMEDIATELY call updateTripInfo tool with the collected information + preset defaults
- End with "Perfect! You're all set to proceed!"
- After calling updateTripInfo, ALWAYS call checkTripStatus to verify completion before telling user they can proceed. In that SAME assistant message (before or after the tool calls) explicitly tell the user: "Great! We are ready to generate your itinerary." (or similar wording).

IMPORTANT: Once you have the 5 required answers, immediately call updateTripInfo with: departureLocation, destination, departureDate (convert to YYYY-MM-DD format), duration, travelers, plus the preset defaults (flightType: 'premium economy', hotelType: 'boutique', returnFlight: true, activities: 'outdoor, relaxation, nightlife, cultural', children: 0)!
Then call checkTripStatus to confirm all information is properly saved before telling the user they can proceed.`
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

PRESET DEFAULTS (use these automatically):
- flightType: 'premium economy' (good comfort/value balance)
- hotelType: 'boutique' (slightly upscale, unique experience)
- returnFlight: true (round trip)
- activities: 'outdoor, relaxation, nightlife, cultural' (well-rounded mix)
- children: 0 (no children by default)

REQUIRED FIELDS TO FILL (make decisions for these 5):
1. departureLocation - ${userLocation ? formatLocationDisplay(userLocation) : 'Use their current location or major nearby airport'} (if only city name is provided, assume full "city, state/region, country")
2. destination - Pick a trending destination based on season/preferences (if only city name, assume full "city, country")
3. departureDate - Choose a date 2-4 weeks from now (or use any date format the user provides; if the provided date is earlier than TODAY_IS, select the next occurrence of that date in the future)
4. duration - Choose 5-7 days (perfect trip length)
5. travelers - Assume 1-2 adults unless they specify otherwise

BEHAVIOR:
- Make ALL decisions for them quickly in 1-2 exchanges
- Use preset defaults automatically - don't ask about flights, hotels, or activities
- If user provides a date in any format, use that instead of choosing one
- Explain your reasoning briefly
- Present final summary and save immediately
- When presenting the final summary, use an UNNUMBERED bullet list where each item starts with "- " (e.g., "- Destination: ..."). Do NOT use numbered lists.
- DO NOT ask questions - MAKE CHOICES
- DO NOT search for flights, hotels, or activities

DECISION APPROACH:
1. Confirm departure location (use their location)
2. CHOOSE a great destination for them (consider season, weather, popular spots)
3. SET departure date (2-4 weeks from now)
4. SET trip duration (5-7 days)
5. ASSUME 1-2 travelers unless specified
6. Present complete plan and save immediately

EXAMPLE RESPONSE:
"Perfect! I'm setting up your trip:
- Departing from: [Location]
- Destination: Barcelona, Spain (perfect weather this time of year!)
- Departure date: March 15, 2025
- Duration: 6 days round trip
- Travelers: 2 adults
- Flight: Premium economy (good comfort/value balance)
- Hotel: Boutique hotel (unique local experience)
- Activities: Mix of outdoor, relaxation, nightlife, and cultural experiences
Let me save this information for you!"

[Then IMMEDIATELY call updateTripInfo tool with all the information]
[Then call checkTripStatus to verify completion before telling user they can proceed]

IMPORTANT: Once you've made all the decisions, immediately call updateTripInfo with: departureLocation, destination, departureDate (convert to YYYY-MM-DD format), duration, travelers, plus the preset defaults (flightType: 'premium economy', hotelType: 'boutique', returnFlight: true, activities: 'outdoor, relaxation, nightlife, cultural', children: 0)!
Then call checkTripStatus to confirm all information is properly saved before telling the user they can proceed. In that SAME assistant message (before or after the tool calls) explicitly tell the user: "Great! We are ready to generate your itinerary." (or similar wording).`
  }
};

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<ChatMode>(null);
  const [chatKey, setChatKey] = useState(0); // Force re-render chat when mode changes
  const [initialMessage, setInitialMessage] = useState<string>('');
  const isMobile = useIsMobile();
  const [tripInformation, setTripInformation] = useState<TripInformation>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored) as TripInformation;
        }
      } catch {
        // ignore parsing errors
      }
    }
    return { ...DEFAULT_PREFERENCES } as TripInformation;
  });
  const [userLocation, setUserLocation] = useState<{
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Persist trip information to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tripInformation));
      } catch {
        // ignore quota / serialization errors
      }
    }
  }, [tripInformation]);

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

  // Redirect unauthenticated users to the landing page
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading && !user) {
      router.replace('/new-landing-page');
    }
  }, [user, loading, router]);

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
      required.departureDate &&
      required.flightType &&
      required.hotelType &&
      (required.returnFlight !== undefined) &&
      required.duration &&
      required.activities &&
      required.travelers &&
      (required.children !== undefined)
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
    setTripInformation(prev => {
      const updated = { ...prev, ...info } as TripInformation;
      // localStorage will be updated by the useEffect above
      return updated;
    });
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
      description: 'I\'ll plan everything for you.',
      icon: Sparkles,
      color: 'bg-green-500'
    }
  ];

  const handleModeSelect = (mode: ChatMode) => {
    // Clear stored preferences & reset defaults
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setTripInformation({ ...DEFAULT_PREFERENCES });
    setSelectedMode(mode);
    setChatKey(prev => prev + 1); // Force chat to re-render with new mode
    
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
      <header className="relative z-20 flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <span
            className={`text-xl md:text-2xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}
          >
            TravelAgentic
          </span>
        </div>
        
        {user && <UserProfileDropdown />}
      </header>

      {/* Main Content - Responsive Layout */}
      <main className="relative z-10 flex min-h-[calc(100vh-88px)] p-3 md:p-6">
        {/* Center Content - Option Selection */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto lg:mr-[400px] pb-20 lg:pb-0">
          <div className="w-full max-w-lg text-center mb-6 md:mb-8">
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white ${inter.className} font-medium animate-in fade-in slide-in-from-bottom-4 duration-700`}>
              Let's plan your
              <br />
              <span className="text-blue-400">perfect trip</span>
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {user && (
                <span className="block mb-2">
                  Welcome back, <span className="font-semibold text-blue-300">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}</span>!
                </span>
              )}
              Choose how you'd like to get started
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="w-full max-w-lg space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
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
                  <CardHeader className="pb-2 md:pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${option.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base md:text-lg font-semibold text-gray-900">
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
          <div className="w-full max-w-lg mt-6 md:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
            <Button
              onClick={handleProceedToItinerary}
              disabled={!hasEnoughInformation()}
              className={`w-full h-12 md:h-14 text-base md:text-lg font-semibold transition-all duration-300 ${
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
              <p className="text-white/70 text-xs md:text-sm mt-2 text-center">
                Complete your travel preferences in the chat to continue
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Desktop AI Chat Interface - Right Panel (hidden on mobile) */}
      <div className="hidden lg:block fixed right-6 top-24 bottom-6 w-96 z-50">
        {selectedMode ? (
          <ChatInterface
            key={chatKey}
            customSystemPrompt={getSystemPrompt(selectedMode)}
            customPlaceholder={getPlaceholder(selectedMode)}
            customEmptyStateMessage={getEmptyStateMessage(selectedMode)}
            initialMessage={initialMessage}
            travelDetails={selectedMode === 'autonomous' ? createTravelDetailsForAutonomous() : null}
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

      {/* Mobile AI Chat Bubble (visible on mobile only) */}
      <div className="lg:hidden">
        {selectedMode ? (
          <MobileChatBubble
            key={chatKey}
            customSystemPrompt={getSystemPrompt(selectedMode)}
            customPlaceholder={getPlaceholder(selectedMode)}
            customEmptyStateMessage={getEmptyStateMessage(selectedMode)}
            initialMessage={initialMessage}
            travelDetails={selectedMode === 'autonomous' ? createTravelDetailsForAutonomous() : null}
            mode={selectedMode}
            onTripInfoUpdate={updateTripInformation}
            tripInfoComplete={hasEnoughInformation()}
            defaultOpen={isMobile}
          />
        ) : (
          <Button
            className="fixed bottom-6 right-6 z-50 h-14 px-4 rounded-full bg-gray-500 shadow-lg opacity-50 cursor-not-allowed"
            disabled
          >
            <MessageCircle className="h-6 w-6 text-white mr-2" />
            <span className="text-white font-medium text-sm">AI Assistant</span>
          </Button>
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