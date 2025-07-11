'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sparkles, Plane, MapPin, Calendar, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-context';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export function LandingPage() {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Background slideshow images (same as travel input form)
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
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-white" />
          <span
            className={`text-2xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}
          >
            TravelAgentic
          </span>
        </div>
        
        {user ? (
          <UserProfileDropdown />
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="!text-white hover:!text-white hover:bg-white/10 backdrop-blur-sm border-0 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                className="bg-white text-black hover:bg-white/90 font-medium"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Section */}
            <div className="text-center lg:text-left text-white">
              <h1 className={`text-5xl lg:text-6xl font-bold mb-6 ${inter.className} font-medium`}>
                Your AI Travel
                <br />
                <span className="text-blue-400">Assistant</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed">
                Discover amazing destinations, plan perfect itineraries, and book your dream vacation with the power of AI.
              </p>
              
              {/* Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-lg">AI-powered travel recommendations</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-lg">Smart itinerary planning</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-lg">Best deals and booking assistance</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-lg">24/7 travel support</span>
                </div>
              </div>

              {/* CTA Buttons */}
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/plan">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 text-lg"
                    >
                      <Plane className="mr-2 h-5 w-5" />
                      Start Planning
                    </Button>
                  </Link>
                  <Link href="/account">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-white border-white hover:bg-white/10 backdrop-blur-sm font-medium px-8 py-4 text-lg"
                    >
                      <Users className="mr-2 h-5 w-5" />
                      My Account
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 text-lg"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="!text-white border-white hover:bg-white/10 backdrop-blur-sm font-medium px-8 py-4 text-lg !bg-transparent hover:!text-white"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    Smart Destinations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90">
                    Discover hidden gems and popular attractions tailored to your preferences.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Perfect Timing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90">
                    Get the best travel dates, weather insights, and seasonal recommendations.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-blue-400" />
                    Seamless Booking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90">
                    Book flights, hotels, and activities all in one place with competitive prices.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-400" />
                    AI-Powered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90">
                    Advanced AI learns your preferences to create personalized travel experiences.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 