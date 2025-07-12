/**
 * Automation Levels Demo Component
 * Showcases the complete automation system in action
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAutomationLevel, useAutomationBookingFlow } from '@/hooks/useAutomationLevel';
import AutomationLevelSelector, { QuickAutomationToggle } from '@/components/automation-level-selector';
import { AutomationPackageSelector, QuickAutomationPackageToggle } from '@/components/automation-package-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Plane, 
  Hotel, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Eye,
  Zap,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';

// Mock data for demo
const mockFlights = [
  { id: '1', airline: 'Delta', departure: '09:00', arrival: '12:30', price: 320, score: 95 },
  { id: '2', airline: 'United', departure: '14:15', arrival: '17:45', price: 285, score: 88 },
  { id: '3', airline: 'American', departure: '18:30', arrival: '22:00', price: 310, score: 92 },
];

const mockHotels = [
  { id: '1', name: 'Grand Plaza Hotel', rating: 4.5, price: 180, score: 94 },
  { id: '2', name: 'City Center Inn', rating: 4.2, price: 150, score: 89 },
  { id: '3', name: 'Luxury Suites', rating: 4.8, price: 220, score: 96 },
];

const mockActivities = [
  { id: '1', name: 'City Walking Tour', duration: '3 hours', price: 45, score: 91 },
  { id: '2', name: 'Museum Visit', duration: '2 hours', price: 25, score: 87 },
  { id: '3', name: 'Food Tasting Tour', duration: '4 hours', price: 65, score: 93 },
];

/**
 * Calculate Level 3 package-specific score for items
 */
function calculateLevel3Score(item: any, packageConfig: any, category: string): number {
  const criteria = packageConfig.selectionCriteria;
  let score = 0;
  
  // Base score from item
  const baseScore = item.score || 0;
  
  // Apply package-specific weighting
  if (category === 'flights') {
    // For flights: price weight vs convenience/rating
    const priceScore = Math.max(0, 100 - (item.price / 5)); // Lower price = higher score
    const serviceScore = baseScore;
    score = (priceScore * criteria.priceWeight) + (serviceScore * criteria.ratingWeight);
  } else if (category === 'hotels') {
    // For hotels: price vs rating vs convenience
    const priceScore = Math.max(0, 100 - (item.price / 3));
    const ratingScore = (item.rating || 0) * 20; // Convert 5-star to 100-point scale
    const convenienceScore = baseScore;
    score = (priceScore * criteria.priceWeight) + 
            (ratingScore * criteria.ratingWeight) + 
            (convenienceScore * criteria.convenienceWeight);
  } else if (category === 'activities') {
    // For activities: price vs uniqueness vs popularity
    const priceScore = Math.max(0, 100 - (item.price / 1));
    const uniquenessScore = baseScore;
    const popularityScore = baseScore;
    score = (priceScore * criteria.priceWeight) + 
            (uniquenessScore * criteria.uniquenessWeight) + 
            (popularityScore * criteria.ratingWeight);
  }
  
  return Math.round(score);
}

/**
 * Main Demo Component
 */
export function AutomationDemo() {
  const automation = useAutomationLevel();
  const booking = useAutomationBookingFlow(automation.level);
  const [currentStep, setCurrentStep] = useState<'flights' | 'hotels' | 'activities' | 'review'>('flights');
  const [autoAdvanceProgress, setAutoAdvanceProgress] = useState(0);
  const [showAutoAdvance, setShowAutoAdvance] = useState(false);

  const handleAutoAdvance = useCallback(() => {
    setShowAutoAdvance(false);
    setAutoAdvanceProgress(0);
    
    switch (currentStep) {
      case 'flights':
        booking.confirmSelection('flights', mockFlights[0]);
        setCurrentStep('hotels');
        break;
      case 'hotels':
        booking.confirmSelection('hotels', mockHotels[0]);
        setCurrentStep('activities');
        break;
      case 'activities':
        booking.confirmSelection('activities', mockActivities[0]);
        setCurrentStep('review');
        break;
    }
  }, [currentStep, booking]);

  const handleSelection = useCallback((category: string, item: typeof mockFlights[0] | typeof mockHotels[0] | typeof mockActivities[0]) => {
    booking.confirmSelection(category, item);
    setShowAutoAdvance(false);
    setAutoAdvanceProgress(0);
    
    // Move to next step
    if (category === 'flights') setCurrentStep('hotels');
    else if (category === 'hotels') setCurrentStep('activities');
    else if (category === 'activities') setCurrentStep('review');
  }, [booking]);

  const triggerAutoSelection = useCallback((category: string, items: any[]) => {
    let aiRecommendation;
    
    if (automation.automationPackageConfig) {
      // All levels: Use package-specific selection criteria
      const packageConfig = automation.automationPackageConfig;
      aiRecommendation = items.reduce((best, item) => {
        const score = calculateLevel3Score(item, packageConfig, category);
        return score > (best.packageScore || 0) ? { ...item, packageScore: score } : best;
      }, items[0]);
    } else {
      // Other levels: Use highest score
      aiRecommendation = items[0];
    }
    
    const autoSelected = booking.handleAutoSelection(category, items, aiRecommendation);
    
    if (automation.shouldAutoSelect && !automation.requiresConfirmation) {
      setShowAutoAdvance(true);
      setAutoAdvanceProgress(0);
    }
    
    return autoSelected;
  }, [booking, automation.shouldAutoSelect, automation.requiresConfirmation, automation.level, automation.automationPackageConfig]);

  // Memoize the onAutoSelect callbacks to prevent recreation on every render
  const onAutoSelectFlights = useCallback(() => triggerAutoSelection('flights', mockFlights), [triggerAutoSelection]);
  const onAutoSelectHotels = useCallback(() => triggerAutoSelection('hotels', mockHotels), [triggerAutoSelection]);
  const onAutoSelectActivities = useCallback(() => triggerAutoSelection('activities', mockActivities), [triggerAutoSelection]);

  // Simulate auto-advance timer
  useEffect(() => {
    if (automation.shouldAutoSelect && !automation.requiresConfirmation && showAutoAdvance) {
      const timeout = automation.selectionTimeout || 2000;
      const interval = setInterval(() => {
        setAutoAdvanceProgress(prev => {
          if (prev >= 100) {
            handleAutoAdvance();
            return 0;
          }
          return prev + (100 / (timeout / 100));
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [automation.shouldAutoSelect, automation.requiresConfirmation, automation.selectionTimeout, showAutoAdvance, handleAutoAdvance]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Automation Levels Demo</h1>
        <p className="text-muted-foreground">
          Experience how different automation levels change your travel planning flow
        </p>
        <div className="flex items-center justify-center space-x-4">
          <QuickAutomationToggle />
          <QuickAutomationPackageToggle />
          <Badge variant="outline" className="px-4 py-2">
            Current: Level {automation.level} - {automation.config.name}
          </Badge>
        </div>
      </div>

      {/* Automation Level Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Configuration</CardTitle>
          <CardDescription>
            Change the automation level to see how it affects the booking flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutomationLevelSelector 
            compact={true}
            userContext={{
              isFirstTimeUser: false,
              timeConstraints: 'moderate'
            }}
          />
        </CardContent>
      </Card>

      {/* Automation Package Selector (shown for all levels) */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Automation Package</CardTitle>
          <CardDescription>
            Choose your focus area for Level {automation.level} automation - this affects how AI prioritizes your selections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutomationPackageSelector 
            layout="radio"
            showDetails={true}
            showLevelSlider={false}
            className="max-w-2xl"
          />
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Booking Progress</h3>
            <span className="text-sm text-muted-foreground">
              {currentStep === 'review' ? 'Complete' : `Step ${['flights', 'hotels', 'activities'].indexOf(currentStep) + 1} of 3`}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {['flights', 'hotels', 'activities', 'review'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep === step 
                    ? 'border-primary bg-primary text-white' 
                    : booking.bookingState.selections[step]
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-gray-100'
                }`}>
                  {booking.bookingState.selections[step] ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                {index < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    booking.bookingState.selections[step] ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Advance Indicator */}
      {showAutoAdvance && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  Auto-advancing in {Math.ceil((100 - autoAdvanceProgress) / 50)}s
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowAutoAdvance(false);
                  setAutoAdvanceProgress(0);
                }}
              >
                Cancel
              </Button>
            </div>
            <Progress value={autoAdvanceProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Current Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'flights' && (
            <FlightSelection 
              flights={mockFlights}
              automation={automation}
              onSelect={(flight: typeof mockFlights[0]) => handleSelection('flights', flight)}
              onAutoSelect={onAutoSelectFlights}
              selectedFlight={booking.bookingState.selections.flights}
              autoSelectedFlight={booking.bookingState.autoSelections.flights}
            />
          )}
          
          {currentStep === 'hotels' && (
            <HotelSelection 
              hotels={mockHotels}
              automation={automation}
              onSelect={(hotel: typeof mockHotels[0]) => handleSelection('hotels', hotel)}
              onAutoSelect={onAutoSelectHotels}
              selectedHotel={booking.bookingState.selections.hotels}
              autoSelectedHotel={booking.bookingState.autoSelections.hotels}
            />
          )}
          
          {currentStep === 'activities' && (
            <ActivitySelection 
              activities={mockActivities}
              automation={automation}
              onSelect={(activity: typeof mockActivities[0]) => handleSelection('activities', activity)}
              onAutoSelect={onAutoSelectActivities}
              selectedActivity={booking.bookingState.selections.activities}
              autoSelectedActivity={booking.bookingState.autoSelections.activities}
            />
          )}
          
          {currentStep === 'review' && (
            <BookingReview 
              selections={booking.bookingState.selections}
              automation={automation}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <AutomationBehaviorCard automation={automation} />
          <BookingSummaryCard selections={booking.bookingState.selections} />
        </div>
      </div>
    </div>
  );
}

/**
 * Flight Selection Component
 */
function FlightSelection({ 
  flights, 
  automation, 
  onSelect, 
  onAutoSelect, 
  selectedFlight, 
  autoSelectedFlight 
}: any) {
  // Trigger auto-selection only once when component mounts or automation changes
  useEffect(() => {
    if (automation.shouldAutoSelect && !autoSelectedFlight) {
      onAutoSelect();
    }
  }, [automation.shouldAutoSelect, onAutoSelect, autoSelectedFlight]);

  const displayFlights = automation.shouldShowAllOptions ? flights : flights.slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plane className="h-5 w-5 mr-2" />
          Select Flight
        </CardTitle>
        <CardDescription>
          {automation.shouldShowAllOptions 
            ? `Showing all ${flights.length} available flights` 
            : `Showing top ${displayFlights.length} recommended flights`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayFlights.map((flight: any) => (
          <div 
            key={flight.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedFlight?.id === flight.id 
                ? 'border-green-500 bg-green-50' 
                : autoSelectedFlight?.id === flight.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(flight)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{flight.airline}</div>
                <div className="text-sm text-muted-foreground">
                  {flight.departure} → {flight.arrival}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${flight.price}</div>
                <Badge variant="secondary" className="text-xs">
                  Score: {flight.score}
                </Badge>
              </div>
            </div>
            {autoSelectedFlight?.id === flight.id && !selectedFlight && (
              <div className="mt-2 text-xs text-blue-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                AI Recommended
              </div>
            )}
          </div>
        ))}
        
        {automation.requiresConfirmation && autoSelectedFlight && (
          <Button 
            onClick={() => onSelect(autoSelectedFlight)}
            className="w-full"
          >
            Confirm AI Selection
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Hotel Selection Component (similar pattern to flights)
 */
function HotelSelection({ hotels, automation, onSelect, onAutoSelect, selectedHotel, autoSelectedHotel }: any) {
  // Trigger auto-selection only once when component mounts or automation changes
  useEffect(() => {
    if (automation.shouldAutoSelect && !autoSelectedHotel) {
      onAutoSelect();
    }
  }, [automation.shouldAutoSelect, onAutoSelect, autoSelectedHotel]);

  const displayHotels = automation.shouldShowAllOptions ? hotels : hotels.slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Hotel className="h-5 w-5 mr-2" />
          Select Hotel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayHotels.map((hotel: any) => (
          <div 
            key={hotel.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedHotel?.id === hotel.id 
                ? 'border-green-500 bg-green-50' 
                : autoSelectedHotel?.id === hotel.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(hotel)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{hotel.name}</div>
                <div className="text-sm text-muted-foreground">
                  Rating: {hotel.rating}⭐
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${hotel.price}/night</div>
                <Badge variant="secondary" className="text-xs">
                  Score: {hotel.score}
                </Badge>
              </div>
            </div>
            {autoSelectedHotel?.id === hotel.id && !selectedHotel && (
              <div className="mt-2 text-xs text-blue-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                AI Recommended
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Activity Selection Component
 */
function ActivitySelection({ activities, automation, onSelect, onAutoSelect, selectedActivity, autoSelectedActivity }: any) {
  // Trigger auto-selection only once when component mounts or automation changes
  useEffect(() => {
    if (automation.shouldAutoSelect && !autoSelectedActivity) {
      onAutoSelect();
    }
  }, [automation.shouldAutoSelect, onAutoSelect, autoSelectedActivity]);

  const displayActivities = automation.shouldShowAllOptions ? activities : activities.slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Select Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayActivities.map((activity: any) => (
          <div 
            key={activity.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedActivity?.id === activity.id 
                ? 'border-green-500 bg-green-50' 
                : autoSelectedActivity?.id === activity.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(activity)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{activity.name}</div>
                <div className="text-sm text-muted-foreground">
                  Duration: {activity.duration}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${activity.price}</div>
                <Badge variant="secondary" className="text-xs">
                  Score: {activity.score}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Booking Review Component
 */
function BookingReview({ selections, automation }: any) {
  const total = (selections.flights?.price || 0) + 
                (selections.hotels?.price || 0) + 
                (selections.activities?.price || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Review</CardTitle>
        <CardDescription>
          {automation.shouldAutoBook 
            ? 'Booking will be processed automatically' 
            : 'Review your selections before booking'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selections.flights && (
          <div className="flex justify-between">
            <span>Flight: {selections.flights.airline}</span>
            <span>${selections.flights.price}</span>
          </div>
        )}
        {selections.hotels && (
          <div className="flex justify-between">
            <span>Hotel: {selections.hotels.name}</span>
            <span>${selections.hotels.price}</span>
          </div>
        )}
        {selections.activities && (
          <div className="flex justify-between">
            <span>Activity: {selections.activities.name}</span>
            <span>${selections.activities.price}</span>
          </div>
        )}
        
        <Separator />
        
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${total}</span>
        </div>
        
        <Button 
          className="w-full" 
          size="lg"
          disabled={automation.shouldAutoBook}
        >
          {automation.shouldAutoBook ? (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Auto-booking...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Book Trip
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Automation Behavior Card
 */
function AutomationBehaviorCard({ automation }: any) {
  const behaviors = [
    { label: 'Auto Filter', active: automation.shouldAutoSelect },
    { label: 'Auto Select', active: automation.shouldAutoSelect },
    { label: 'Show All Options', active: automation.shouldShowAllOptions },
    { label: 'Require Confirmation', active: automation.requiresConfirmation },
    { label: 'Auto Book', active: automation.shouldAutoBook },
    { label: 'Wait at Checkout', active: automation.shouldWaitAtCheckout },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Current Behavior</CardTitle>
        <CardDescription>Level {automation.level} characteristics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {behaviors.map((behavior) => (
            <div key={behavior.label} className="flex items-center justify-between">
              <span className="text-sm">{behavior.label}</span>
              <Badge 
                variant={behavior.active ? "default" : "secondary"}
                className="text-xs"
              >
                {behavior.active ? '✓' : '✗'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Booking Summary Card
 */
function BookingSummaryCard({ selections }: any) {
  const items = Object.values(selections).filter(Boolean);
  const total = items.reduce((sum: number, item: any) => sum + (item.price || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Selected: {items.length} of 3 items
          </div>
          {total > 0 && (
            <div className="text-lg font-semibold">
              Total: ${total}
            </div>
          )}
          <Progress value={(items.length / 3) * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export default AutomationDemo; 