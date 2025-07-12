/**
 * Enhanced Home Page with A/B Testing
 * Phase 6: Compares new itinerary-centric flow vs legacy search flow
 * Uses A/B testing framework to measure performance and user satisfaction
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { EnhancedTravelInputForm } from '@/components/enhanced-travel-input-form';
import { TravelInputForm } from '@/components/travel-input-form';
import { FlowSelector, useABTestMetrics } from '@/components/FlowSelector';
import { LegacyFallback } from '@/components/LegacyFallback';
import { AutomationDemo } from '@/components/automation-demo';
import { ItineraryProvider } from '@/contexts/ItineraryContext';
import { featureFlags } from '@/lib/feature-flags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Zap, Settings, ArrowDown } from 'lucide-react';
import type { TravelDetails } from '@/lib/mock-data';
import type { BasicTravelDetails, TravelPreferences } from '@/contexts/ItineraryContext';

interface EnhancedTravelDetails extends TravelDetails {
  preferences?: TravelPreferences;
}

export default function EnhancedHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [showAutomationDemo, setShowAutomationDemo] = useState(false);
  
  // A/B testing metrics
  const { trackEvent, trackConversion } = useABTestMetrics('itinerary_flow_test');
  
  // Check if we should use the itinerary flow (for non-A/B test scenarios)
  const shouldUseItineraryFlow = featureFlags.shouldUseItineraryFlow();
  const shouldShowEnhancedForm = featureFlags.shouldShowEnhancedForm();
  const automationLevelsEnabled = featureFlags.isEnabled('automationLevels');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track page view
  useEffect(() => {
    trackEvent('page_view', { page: 'enhanced_home' });
  }, [trackEvent]);

  const handleFormSubmit = (details: EnhancedTravelDetails, useItineraryFlow: boolean = shouldUseItineraryFlow) => {
    if (!details.startDate || !details.endDate) return;
    
    // Track form submission
    trackEvent('form_submission', {
      flow_type: useItineraryFlow ? 'itinerary' : 'search',
      destination: details.destination,
      duration_days: Math.ceil((details.endDate.getTime() - details.startDate.getTime()) / (1000 * 60 * 60 * 24)),
      travelers: details.travelers,
      has_preferences: !!details.preferences
    });
    
    if (useItineraryFlow) {
      // Redirect to itinerary building flow
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
        if (details.preferences.tripPurpose) {
          params.append('tripPurpose', details.preferences.tripPurpose);
        }
        if (details.preferences.budget) {
          params.append('budget', details.preferences.budget);
        }
        if (details.preferences.travelStyle) {
          params.append('travelStyle', details.preferences.travelStyle);
        }
        if (details.preferences.activityTypes && details.preferences.activityTypes.length > 0) {
          params.append('activityTypes', details.preferences.activityTypes.join(','));
        }
        if (details.preferences.accommodationType) {
          params.append('accommodationType', details.preferences.accommodationType);
        }
      }

      // Track flow progression
      trackEvent('flow_start', { flow_type: 'itinerary' });

      // Redirect to itinerary building
      router.push(`/itinerary/building?${params.toString()}`);
    } else {
      // Use traditional search flow
      const searchParams = new URLSearchParams({
        origin: details.departureLocation,
        destination: details.destination,
        departureDate: details.startDate.toISOString().split('T')[0],
        returnDate: details.endDate.toISOString().split('T')[0],
        passengers: details.travelers.toString(),
        cabin: 'economy',
        useAI: 'true'
      });
      
      // Track flow progression
      trackEvent('flow_start', { flow_type: 'search' });
      
      router.push(`/search?${searchParams.toString()}`);
    }
  };

  // Create the new itinerary flow component
  const ItineraryFlow = () => (
    <ItineraryProvider>
      <EnhancedTravelInputForm
        onSubmit={(details) => handleFormSubmit(details, true)}
        isMobile={isMobile}
        mode="itinerary"
        showPreferences={true}
      />
    </ItineraryProvider>
  );

  // Create the legacy search flow component  
  const LegacyFlow = () => (
    <LegacyFallback
      reason="ab_test"
      onSwitchToNew={() => {
        trackEvent('flow_switch', { from: 'legacy', to: 'itinerary' });
        // Force reload with itinerary flow
        window.location.href = '/enhanced-home?force_itinerary=true';
      }}
      searchParams={searchParams}
    />
  );

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
            Experience the future of travel planning with our 4-level automation system. 
            Choose how much control you want over your booking process.
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
            <Button 
              onClick={() => {
                setShowAutomationDemo(true);
                trackEvent('automation_demo_open', { source: 'enhanced_home' });
              }}
              size="lg"
              className="mb-4"
            >
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
                  Try different automation levels and see how they change the travel booking experience
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

  // Use A/B testing framework to determine flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <FlowSelector
        testName="itinerary_flow_test"
        splitPercentage={50} // 50% get itinerary flow
        enableABTesting={true}
        itineraryFlow={<ItineraryFlow />}
        legacyFlow={<LegacyFlow />}
      >
        {/* Default/fallback content */}
        {shouldShowEnhancedForm ? (
          <ItineraryProvider>
            <EnhancedTravelInputForm
              onSubmit={handleFormSubmit}
              isMobile={isMobile}
              mode={shouldUseItineraryFlow ? 'itinerary' : 'search'}
              showPreferences={shouldUseItineraryFlow}
            />
          </ItineraryProvider>
        ) : (
          <TravelInputForm
            onSubmit={(details) => handleFormSubmit(details, false)}
            isMobile={isMobile}
          />
        )}
      </FlowSelector>
      
      {/* Automation Demo Section */}
      <AutomationSection />
    </div>
  );
} 