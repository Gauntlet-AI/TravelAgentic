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
import { MessageCircle, Brain, Sparkles, ChevronRight, Bot } from 'lucide-react';
import { getCurrentLocation, formatLocationDisplay } from '@/lib/utils';
import type { TravelDetails } from '@/lib/mock-data';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export type ChatMode = 'conversation' | 'quiz' | 'autonomous' | null;

const chatModeConfig = {
  conversation: {
    title: 'Chat About Your Trip',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in CONVERSATION mode. Be CONCISE and FRIENDLY.

STYLE:
- Keep responses SHORT (2-3 sentences max)
- Be conversational but brief
- Ask ONE specific question at a time
- Use simple, clear language

BEHAVIOR:
- Listen to their travel ideas
- Ask focused questions to understand preferences
- Search for options when you have enough details
- Present results briefly with key highlights only

APPROACH:
- Understand their basic desires first
- Get specific details through short questions
- Search proactively when ready
- Give concise summaries, not long descriptions

Remember: Short, helpful responses. Quality over quantity.`
  },
  quiz: {
    title: 'Quiz Me',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in QUIZ mode. Be BRIEF and ENGAGING.

STYLE:
- Ask ONE short question at a time
- Keep questions simple and fun
- Responses should be 1-2 sentences max
- Use emojis occasionally for engagement

BEHAVIOR:
- Ask focused questions to discover preferences
- Start broad, then get specific
- Build their travel profile step by step
- Search for options once you know enough

QUESTION ORDER:
1. Travel style (adventure/relaxation/culture)
2. Budget range
3. When they want to travel
4. Trip duration
5. Who's traveling
6. Activity preferences
7. Accommodation style

APPROACH:
- One question per response
- Brief acknowledgment of their answer
- Quick transition to next question
- Suggest destinations when ready, then search

Remember: Keep it short, fun, and focused. No long explanations.`
  },
  autonomous: {
    title: 'Choose For Me',
    systemPrompt: (userLocation: any) => `You are TravelAgentic's AI Travel Agent in AUTONOMOUS mode. Be DECISIVE and PROACTIVE.

STYLE:
- Short, confident responses (1-3 sentences)
- Be authoritative but friendly
- Make immediate decisions
- Present complete bookings, not just options

BEHAVIOR:
- DON'T ask questions - make smart assumptions
- Automatically select popular destinations for the current season
- Search and book flights, hotels, and activities immediately
- Present complete trip as a done deal

AUTOMATIC SELECTION LOGIC:
- Pick trending destinations based on current month
- Choose mid-range budget ($2000-4000 total)
- Select 4-7 day trips departing within 2-4 weeks
- Use departure location: ${userLocation ? formatLocationDisplay(userLocation) : 'major city'}
- Book centrally located 4-star hotels
- Include mix of must-see attractions and local experiences

DECISION STYLE:
- Pick destinations with great value and weather
- Choose practical flight times and central hotels
- Include 3-4 activities per day
- Present as complete booked package
- Show total cost and itinerary

APPROACH:
1. Immediately announce destination choice with reasoning
2. Search for flights, hotels, activities simultaneously
3. Present complete booked trip with highlights
4. Show confirmation details and total cost
5. Offer to modify if needed

Remember: You're making ALL decisions. Book everything immediately. Present as complete, confirmed trip!`
  }
};

export default function WelcomePage() {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<ChatMode>(null);
  const [chatKey, setChatKey] = useState(0); // Force re-render chat when mode changes
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [clearHistory, setClearHistory] = useState(false);
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
          ? `I'll book everything using your location (${formatLocationDisplay(userLocation)}).`
          : 'I\'ll book everything using your current location.',
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
                      <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 text-sm mb-2">{option.description}</p>
                  </CardContent>
                </Card>
              );
            })}
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
            travelDetails={selectedMode === 'autonomous' ? createTravelDetailsForAutonomous() : undefined}
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
                <p className="text-sm">Select how you'd like to get started and I'll help you every step of the way!</p>
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
      return 'I want to go to Japan in March';
    case 'quiz':
      return 'Start the quiz';
    case 'autonomous':
      return 'Plan my trip';
    default:
      return 'How can I help you plan your trip?';
  }
}

function getEmptyStateMessage(mode: ChatMode): string {
  switch (mode) {
    case 'conversation':
      return 'Tell me about your travel ideas and I\'ll help you plan the perfect trip!';
    case 'quiz':
      return 'I\'ll ask you questions to discover your ideal destination and travel style.';
    case 'autonomous':
      return 'Give me your budget and dates, and I\'ll create a complete itinerary for you!';
    default:
      return 'Ask me anything about your vacation plans!';
  }
} 