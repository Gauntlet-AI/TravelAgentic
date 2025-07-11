/**
 * Welcome Page
 * Shown to users after successful login or signup
 */

'use client';

import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import { useAuth } from '@/lib/auth/auth-context';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export default function WelcomePage() {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
          <span
            className={`text-2xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}
          >
            TravelAgentic
          </span>
        </div>
        
        {user && <UserProfileDropdown />}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-white">
            <h1 className={`text-5xl lg:text-6xl font-bold mb-6 ${inter.className} font-medium animate-in fade-in slide-in-from-bottom-4 duration-700`}>
              Welcome to
              <br />
              <span className="text-blue-400">TravelAgentic</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Your journey begins here. Let's plan your next adventure together.
            </p>
            
            {/* Animated welcome message */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              <div className="text-lg text-white/80">
                {user && (
                  <p className="mb-4">
                    Welcome back, <span className="font-semibold text-blue-300">{user.email}</span>!
                  </p>
                )}
                <p>Get ready to explore the world with AI-powered travel planning.</p>
              </div>
              
              {/* Features showcase */}
              <div className="grid md:grid-cols-3 gap-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Discover</h3>
                  <p className="text-white/80 text-sm">
                    Find amazing destinations tailored to your preferences
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Plan</h3>
                  <p className="text-white/80 text-sm">
                    Create perfect itineraries with AI assistance
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">✈️</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Book</h3>
                  <p className="text-white/80 text-sm">
                    Find the best deals and book with confidence
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating dots indicator for slideshow */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {backgroundImages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 