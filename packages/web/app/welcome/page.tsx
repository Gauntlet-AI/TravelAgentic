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
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Brain, Sparkles, ChevronRight, Bot } from 'lucide-react';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export type ChatMode = 'conversation' | 'quiz' | 'autonomous' | null;

const chatModeConfig = {
  conversation: {
    title: 'Chat About Your Trip',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in CONVERSATION mode. The user has a general idea of what they want and wants to chat about their travel plans.

BEHAVIOR:
- Be conversational and collaborative
- Ask clarifying questions to understand their preferences
- Provide suggestions based on what they tell you
- Help them refine their ideas through natural conversation
- Use your tools to search for flights, hotels, and activities when they provide enough details
- Don't be too pushy with questions - let the conversation flow naturally

APPROACH:
- Start by understanding their basic travel desires
- Ask follow-up questions to get more specific details
- Once you have enough information, proactively search for options
- Present results in a friendly, conversational way
- Offer to search for alternatives or make adjustments

Remember: The user has some ideas but wants to discuss and refine them with you.`
  },
  quiz: {
    title: 'Quiz Me',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in QUIZ mode. The user doesn't know what they want and needs you to ask them questions to discover their preferences.

BEHAVIOR:
- Ask ONE question at a time
- Start with broad questions and get more specific
- Make questions engaging and fun
- Use their answers to guide the next question
- Build a complete travel profile through systematic questioning

QUESTION PROGRESSION:
1. Travel style (adventure, relaxation, culture, mix)
2. Budget range (budget, mid-range, luxury)
3. Time of year/season preferences
4. Duration of trip
5. Group size and travel companions
6. Activity preferences
7. Accommodation preferences
8. Food and dining preferences
9. Transportation preferences
10. Any specific destinations they've been curious about

APPROACH:
- Keep questions light and conversational
- Explain why you're asking each question
- Summarize what you've learned periodically
- Once you have enough information, suggest 2-3 destination options
- After they choose, start searching for specific options using your tools

Remember: Guide them through discovery - they truly don't know what they want yet!`
  },
  autonomous: {
    title: 'Choose For Me',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in AUTONOMOUS mode. The user trusts you to make ALL decisions and create a complete itinerary without asking many questions.

BEHAVIOR:
- Only ask for ESSENTIAL information: budget, dates, departure location, and any hard constraints
- Make confident decisions about destination, flights, hotels, and activities
- Present complete, ready-to-book itineraries
- Use your tools extensively to find actual options
- Be decisive and authoritative in your recommendations

MINIMUM REQUIRED INFO:
- Budget range
- Travel dates (or at least month/season)
- Departure location
- Any absolute deal-breakers (allergies, mobility issues, etc.)

APPROACH:
1. Collect only essential information (max 3-4 questions)
2. Make confident destination recommendations based on budget/season
3. Immediately start searching for flights, hotels, and activities
4. Present a complete itinerary with specific bookings
5. Offer to make adjustments only if asked

DECISION MAKING:
- Choose destinations that offer good value for their budget
- Select flights with reasonable timing and connections
- Pick hotels with good locations and reviews
- Include a mix of must-see attractions and hidden gems
- Create a balanced itinerary with variety

Remember: They want you to be the expert and make all the decisions!`
  }
};

export default function WelcomePage() {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<ChatMode>(null);
  const [chatKey, setChatKey] = useState(0); // Force re-render chat when mode changes

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

  const chatModeOptions = [
    {
      id: 'conversation' as ChatMode,
      title: 'Chat about your trip',
      description: 'You have some ideas and want to discuss them with me',
      icon: MessageCircle,
      color: 'bg-blue-500',
      badge: 'Collaborative',
      details: 'Perfect when you know roughly what you want but need help refining your plans'
    },
    {
      id: 'quiz' as ChatMode,
      title: 'Quiz me',
      description: 'You\'re not sure what you want - let me ask questions to find out',
      icon: Brain,
      color: 'bg-purple-500',
      badge: 'Guided',
      details: 'I\'ll ask you questions to discover your perfect destination and travel style'
    },
    {
      id: 'autonomous' as ChatMode,
      title: 'Choose for me',
      description: 'Just tell me your budget and dates - I\'ll plan everything',
      icon: Sparkles,
      color: 'bg-green-500',
      badge: 'Autonomous',
      details: 'Give me minimal info and I\'ll create a complete itinerary for you'
    }
  ];

  const handleModeSelect = (mode: ChatMode) => {
    setSelectedMode(mode);
    setChatKey(prev => prev + 1); // Force chat to re-render with new mode
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
                  Welcome back, <span className="font-semibold text-blue-300">{user.email}</span>!
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
                          <Badge variant="secondary" className="text-xs mt-1">
                            {option.badge}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 text-sm mb-2">{option.description}</p>
                    <p className="text-gray-500 text-xs">{option.details}</p>
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
            customSystemPrompt={chatModeConfig[selectedMode].systemPrompt}
            customPlaceholder={getPlaceholder(selectedMode)}
            mode={selectedMode}
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
      return 'Tell me about your travel plans... e.g., "I want to go to Japan in March"';
    case 'quiz':
      return 'Ready to discover your perfect trip? Say "start the quiz" to begin!';
    case 'autonomous':
      return 'Just tell me your budget and travel dates, and I\'ll plan everything for you!';
    default:
      return 'How can I help you plan your trip?';
  }
} 