/**
 * Legacy Flow Fallback Component
 * Provides the old search-based flow as a fallback option
 * Used for A/B testing and when the new itinerary flow fails
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plane, Hotel, Activity, Search, ArrowRight } from 'lucide-react';

interface LegacyFallbackProps {
  reason?: 'ab_test' | 'fallback' | 'user_preference';
  onSwitchToNew?: () => void;
  searchParams?: URLSearchParams;
}

/**
 * Legacy search-based travel planning flow
 * Maintained for A/B testing and fallback scenarios
 */
export function LegacyFallback({ 
  reason = 'ab_test', 
  onSwitchToNew,
  searchParams 
}: LegacyFallbackProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('flights');

  // Extract search parameters if available
  const destination = searchParams?.get('destination') || 'Atlanta, United States (ATL)';
  const departureLocation = searchParams?.get('departureLocation') || 'New York, United States (JFK)';
  const startDate = searchParams?.get('startDate') || '2025-08-04';
  const endDate = searchParams?.get('endDate') || '2025-08-11';
  const travelers = searchParams?.get('travelers') || '2';

  const reasonMessages = {
    ab_test: {
      title: 'Classic Travel Search',
      description: 'You\'re seeing our proven search-based travel planning experience.',
      badge: 'A/B Test Variant'
    },
    fallback: {
      title: 'Search-Based Planning',
      description: 'We\'ve switched to our reliable search flow for the best experience.',
      badge: 'Fallback Mode'
    },
    user_preference: {
      title: 'Manual Search Flow',
      description: 'Search and compare options across flights, hotels, and activities.',
      badge: 'User Selected'
    }
  };

  const currentMessage = reasonMessages[reason];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">
            {currentMessage.title}
          </h1>
          <Badge variant="secondary" className="text-xs">
            {currentMessage.badge}
          </Badge>
        </div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {currentMessage.description}
        </p>

        {/* Trip Summary */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-blue-600" />
                <span>{departureLocation} → {destination}</span>
              </div>
              <div className="text-gray-600">
                {startDate} to {endDate} • {travelers} travelers
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Switch Option */}
        {onSwitchToNew && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="font-medium text-blue-900">Try Our New AI-Powered Flow</p>
                <p className="text-sm text-blue-700">Let AI build your itinerary automatically</p>
              </div>
              <Button 
                onClick={onSwitchToNew}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                Switch to AI Flow
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Search Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="flights" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activities
          </TabsTrigger>
        </TabsList>

        {/* Flight Search */}
        <TabsContent value="flights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-blue-600" />
                Flight Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <LegacySearchInput 
                    label="From"
                    value={departureLocation}
                    placeholder="Departure city"
                  />
                  <LegacySearchInput 
                    label="To"
                    value={destination}
                    placeholder="Destination city"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <LegacySearchInput 
                    label="Departure"
                    value={startDate}
                    type="date"
                  />
                  <LegacySearchInput 
                    label="Return"
                    value={endDate}
                    type="date"
                  />
                  <LegacySearchInput 
                    label="Travelers"
                    value={travelers}
                    type="number"
                  />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search Flights
                </Button>
              </div>
            </CardContent>
          </Card>

          <LegacyResultsPlaceholder type="flights" />
        </TabsContent>

        {/* Hotel Search */}
        <TabsContent value="hotels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5 text-green-600" />
                Hotel Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <LegacySearchInput 
                  label="Destination"
                  value={destination}
                  placeholder="City or hotel name"
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <LegacySearchInput 
                    label="Check-in"
                    value={startDate}
                    type="date"
                  />
                  <LegacySearchInput 
                    label="Check-out"
                    value={endDate}
                    type="date"
                  />
                  <LegacySearchInput 
                    label="Guests"
                    value={travelers}
                    type="number"
                  />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search Hotels
                </Button>
              </div>
            </CardContent>
          </Card>

          <LegacyResultsPlaceholder type="hotels" />
        </TabsContent>

        {/* Activity Search */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Activity Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <LegacySearchInput 
                  label="Destination"
                  value={destination}
                  placeholder="City or area"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <LegacySearchInput 
                    label="Date"
                    value={startDate}
                    type="date"
                  />
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>All Categories</option>
                    <option>Tours & Sightseeing</option>
                    <option>Food & Drink</option>
                    <option>Outdoor Activities</option>
                    <option>Cultural Experiences</option>
                    <option>Entertainment</option>
                  </select>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search Activities
                </Button>
              </div>
            </CardContent>
          </Card>

          <LegacyResultsPlaceholder type="activities" />
        </TabsContent>
      </Tabs>

      {/* Legacy Flow Notice */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Classic Search Experience</p>
              <p className="text-sm text-amber-700 mt-1">
                You're using our traditional search-and-compare flow. 
                Each search is independent and you'll manually compare options.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Legacy search input component
 */
function LegacySearchInput({ 
  label, 
  value, 
  placeholder, 
  type = 'text' 
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

/**
 * Placeholder results component for legacy flow
 */
function LegacyResultsPlaceholder({ type }: { type: 'flights' | 'hotels' | 'activities' }) {
  const configs = {
    flights: { icon: Plane, color: 'blue', items: 'flight options' },
    hotels: { icon: Hotel, color: 'green', items: 'hotel options' },
    activities: { icon: Activity, color: 'purple', items: 'activity options' }
  };

  const config = configs[type];
  const IconComponent = config.icon;

  return (
    <Card>
      <CardContent className="p-8 text-center">
        <IconComponent className={`h-12 w-12 text-${config.color}-400 mx-auto mb-4`} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Search Results
        </h3>
        <p className="text-gray-600 mb-4">
          Click "Search" above to see available {config.items} for your trip.
        </p>
        <div className="text-sm text-gray-500">
          Classic search experience - compare options manually
        </div>
      </CardContent>
    </Card>
  );
} 