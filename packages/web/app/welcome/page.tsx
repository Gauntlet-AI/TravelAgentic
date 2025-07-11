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
import { WelcomeChatInterface, type ChatMode } from '@/components/welcome-chat-interface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Brain, Sparkles, ChevronRight } from 'lucide-react';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export default function WelcomePage() {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<ChatMode>(null);

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

      {/* Main Content - Split Layout */}
      <main className="relative z-10 flex min-h-[calc(100vh-88px)] p-6 gap-6">
        {/* Left Side - Option Selection */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl">
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

          {/* Reset Button */}
          {selectedMode && (
            <Button
              variant="outline"
              onClick={() => setSelectedMode(null)}
              className="mt-6 bg-white/80 hover:bg-white/90 text-gray-900 border-white/30"
            >
              Choose Different Option
            </Button>
          )}
        </div>

        {/* Right Side - Chat Panel */}
        <div className="w-96 flex-shrink-0">
          <WelcomeChatInterface
            mode={selectedMode}
            onModeChange={setSelectedMode}
            className="h-full"
          />
        </div>
      </main>
    </div>
  );
} 