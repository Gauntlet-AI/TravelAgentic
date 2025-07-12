/**
 * Automation Levels Showcase Page
 * Dedicated page for testing and demonstrating the automation system
 */

'use client';

import React from 'react';
import { AutomationDemo } from '@/components/automation-demo';
import AutomationLevelSelector, { QuickAutomationToggle } from '@/components/automation-level-selector';
import { useAutomationLevel } from '@/hooks/useAutomationLevel';
import { ItineraryProvider } from '@/contexts/ItineraryContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Settings, 
  Eye, 
  CheckCircle, 
  Clock, 
  ShoppingCart,
  Home,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function AutomationShowcasePage() {
  const automation = useAutomationLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Link href="/" className="mr-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center">
              <Zap className="h-10 w-10 text-primary mr-4" />
              <h1 className="text-4xl font-bold">Automation Levels Showcase</h1>
            </div>
            <div className="ml-4">
              <QuickAutomationToggle />
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            Experience TravelAgentic's intelligent automation system. Test all four levels and see how 
            they transform the travel booking experience from manual control to fully automated booking.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <Badge 
              variant={automation.level === 1 ? "default" : "outline"} 
              className="px-4 py-2 text-sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              Level 1: Manual Control
            </Badge>
            <Badge 
              variant={automation.level === 2 ? "default" : "outline"} 
              className="px-4 py-2 text-sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Level 2: Assisted Selection
            </Badge>
            <Badge 
              variant={automation.level === 3 ? "default" : "outline"} 
              className="px-4 py-2 text-sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Level 3: Smart Automation
            </Badge>
            <Badge 
              variant={automation.level === 4 ? "default" : "outline"} 
              className="px-4 py-2 text-sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Level 4: Full Automation
            </Badge>
          </div>
        </div>

        {/* Current Level Summary */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Current Configuration: Level {automation.level}
            </CardTitle>
            <CardDescription>
              {automation.config.description} • {automation.config.userType}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  automation.shouldAutoSelect ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="text-xs font-medium">Auto Select</div>
                <div className="text-xs text-muted-foreground">
                  {automation.shouldAutoSelect ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  automation.shouldShowAllOptions ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Eye className="h-6 w-6" />
                </div>
                <div className="text-xs font-medium">Show All</div>
                <div className="text-xs text-muted-foreground">
                  {automation.shouldShowAllOptions ? 'All Options' : 'Filtered'}
                </div>
              </div>
              
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  automation.requiresConfirmation ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Clock className="h-6 w-6" />
                </div>
                <div className="text-xs font-medium">Confirmation</div>
                <div className="text-xs text-muted-foreground">
                  {automation.requiresConfirmation ? 'Required' : 'Optional'}
                </div>
              </div>
              
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  automation.shouldAutoBook ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="text-xs font-medium">Auto Book</div>
                <div className="text-xs text-muted-foreground">
                  {automation.shouldAutoBook ? 'Enabled' : 'Manual'}
                </div>
              </div>
              
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  automation.selectionTimeout ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Zap className="h-6 w-6" />
                </div>
                <div className="text-xs font-medium">Auto Timer</div>
                <div className="text-xs text-muted-foreground">
                  {automation.selectionTimeout ? `${automation.selectionTimeout / 1000}s` : 'None'}
                </div>
              </div>
              
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  automation.shouldUseBatchProcessing() ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Settings className="h-6 w-6" />
                </div>
                <div className="text-xs font-medium">Batch Mode</div>
                <div className="text-xs text-muted-foreground">
                  {automation.shouldUseBatchProcessing() ? 'Enabled' : 'Step-by-step'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="mb-8" />

        {/* Automation Level Selector */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Automation Level</h2>
          <Card>
            <CardContent className="pt-6">
              <AutomationLevelSelector 
                showDetails={true}
                userContext={{
                  isFirstTimeUser: false,
                  timeConstraints: 'moderate',
                  hasPreviousBookings: true
                }}
              />
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-8" />

        {/* Interactive Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Interactive Booking Demo</h2>
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Zap className="h-5 w-5 mr-2" />
                Live Automation Demo
              </CardTitle>
              <CardDescription className="text-center">
                Experience how Level {automation.level} changes the booking flow in real-time. 
                Try changing automation levels above to see immediate differences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ItineraryProvider>
                <AutomationDemo />
              </ItineraryProvider>
            </CardContent>
          </Card>
        </div>

        {/* Integration Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Integration Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">React Hook Usage</CardTitle>
                <CardDescription>How to use automation levels in your components</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { useAutomationLevel } from '@/hooks/useAutomationLevel';

function MyComponent() {
  const automation = useAutomationLevel();
  
  if (automation.shouldAutoSelect) {
    // Auto-select best option
  }
  
  if (automation.requiresConfirmation) {
    // Show confirmation dialog
  }
  
  return <div>Level: {automation.level}</div>;
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">UI Components</CardTitle>
                <CardDescription>Ready-to-use automation components</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import AutomationLevelSelector, { 
  QuickAutomationToggle 
} from '@/components/automation-level-selector';

// Full selector
<AutomationLevelSelector 
  onLevelChange={(level) => console.log(level)}
/>

// Quick toggle
<QuickAutomationToggle />`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Home Page
              </Button>
            </Link>
            <Link href="/enhanced-home">
              <Button variant="outline">
                Enhanced Home
              </Button>
            </Link>
            <Link href="/itinerary/building">
              <Button variant="outline">
                Itinerary Builder
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 