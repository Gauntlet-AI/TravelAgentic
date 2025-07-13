/**
 * Enhanced Home Page - AI-First Travel Planning
 * Now served directly at the root route ("/") to avoid redundant paths.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { EnhancedTravelInputForm } from '@/components/enhanced-travel-input-form';
import { AutomationDemo } from '@/components/automation-demo';
import { ItineraryProvider } from '@/contexts/ItineraryContext';
import { featureFlags } from '@/lib/feature-flags';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Zap, Settings, ArrowDown } from 'lucide-react';
import type { TravelDetails } from '@/lib/mock-data';
import type { TravelPreferences } from '@/contexts/ItineraryContext';

interface EnhancedTravelDetails extends TravelDetails {
  preferences?: TravelPreferences;
}

export default function EnhancedHomePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showAutomationDemo, setShowAutomationDemo] = useState(false);

  // Feature flags
  const automationLevelsEnabled = featureFlags.isEnabled('automationLevels');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFormSubmit = (details: EnhancedTravelDetails) => {
    if (!details.startDate || !details.endDate) return;

    // Always use the itinerary flow
    const params = new URLSearchParams({
      departureLocation: details.departureLocation,
      destination: details.destination,
      startDate: details.startDate.toISOString().split('T')[0],
      endDate: details.endDate.toISOString().split('T')[0],
      adults: details.adults.toString(),
      children: details.children.toString(),
      travelers: details.travelers.toString(),
    });

    // Add preferences if available
    if (details.preferences) {
      if (details.preferences.budget) {
        params.append('budget', details.preferences.budget);
      }
      if (
        details.preferences.activityTypes &&
        details.preferences.activityTypes.length > 0
      ) {
        params.append(
          'activityTypes',
          details.preferences.activityTypes.join(',')
        );
      }
    }

    // Redirect to itinerary building
    router.push(`/itinerary/building?${params.toString()}`);
  };

  // Automation demo section component
  const AutomationSection = () => {
    if (!automationLevelsEnabled) return null;

    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Separator className="mb-12" />

        {/* Introduction Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-3xl font-bold">AI Automation Levels</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            Experience the future of travel planning with our 4-level automation
            system. Choose how much control you want over your booking process.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Badge variant="outline" className="px-3 py-1">
              <Settings className="h-3 w-3 mr-1" />
              Level 1: Manual Control
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              Level 2: Assisted Selection
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              Level 3: Smart Automation
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Level 4: Full Automation
            </Badge>
          </div>

          {!showAutomationDemo ? (
            <Button onClick={() => setShowAutomationDemo(true)} size="lg" className="mb-4">
              <ArrowDown className="h-4 w-4 mr-2" />
              Try Interactive Demo
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowAutomationDemo(false)}
              size="lg"
              className="mb-4"
            >
              Hide Demo
            </Button>
          )}
        </div>

        {/* Demo Section */}
        {showAutomationDemo && (
          <div className="relative">
            <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Interactive Automation Demo
                </CardTitle>
                <CardDescription>
                  Try different automation levels and see how they change the
                  travel booking experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ItineraryProvider>
                  <AutomationDemo />
                </ItineraryProvider>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  // Always show the enhanced itinerary flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <ItineraryProvider>
        <EnhancedTravelInputForm
          onSubmit={handleFormSubmit}
          isMobile={isMobile}
          mode="itinerary"
          showPreferences={true}
        />
      </ItineraryProvider>

      {/* Automation Demo Section */}
      <AutomationSection />
    </div>
  );
}
