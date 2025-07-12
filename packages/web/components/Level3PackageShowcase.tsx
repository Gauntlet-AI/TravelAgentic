/**
 * Level 3 Package Showcase Component
 * Complete demonstration of the Level 3 automation package system
 */

'use client';

import React, { useState } from 'react';
import { useAutomationLevel } from '@/hooks/useAutomationLevel';
import { Level3PackageSelector, QuickLevel3PackageToggle } from '@/components/level3-package-selector';
import { AutomationLevelSelector } from '@/components/automation-level-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LEVEL3_PACKAGES, 
  Level3Package, 
  AutomationUtils 
} from '@/lib/automation-levels';
import { 
  ArrowRight, 
  Check, 
  Code, 
  Zap, 
  Settings, 
  Lightbulb,
  DollarSign,
  Star,
  Clock,
  Info,
  BookOpen,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';

/**
 * Main showcase component
 */
export function Level3PackageShowcase() {
  const automation = useAutomationLevel();
  const [activeTab, setActiveTab] = useState('overview');
  const [showImplementation, setShowImplementation] = useState(false);

  // Packages work with all automation levels - no level forcing needed

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          Universal Automation Enhancement
        </div>
        <h1 className="text-4xl font-bold">Smart Automation Packages</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose your focus area for Level {automation.level} automation. Each package optimizes AI decision-making 
          for different travel priorities: Budget, Experience, or Time efficiency.
        </p>
        <div className="flex items-center justify-center gap-4">
          <QuickLevel3PackageToggle />
          <Badge variant="outline" className="px-4 py-2">
            Level {automation.level}: {automation.automationPackageConfig?.name || 'Experience Smart'}
          </Badge>
        </div>
      </div>

      {/* Current Status Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You're currently using <strong>{automation.automationPackageConfig?.name}</strong> package
          which focuses on <strong>{automation.automationPackageConfig?.focusArea}</strong> 
          at automation Level {automation.level}. Switch packages or levels to see how it changes AI behavior.
        </AlertDescription>
      </Alert>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  What are Level 3 Packages?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Level 3 packages are specialized configurations that tailor AI decision-making 
                  to your specific travel priorities. Each package uses different weightings 
                  for price, experience, and time considerations.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Personalized AI selection criteria</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Optimized for different travel styles</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Consistent preferences across all bookings</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Who Should Use This?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Budget Travelers</div>
                      <div className="text-sm text-muted-foreground">
                        Want maximum value without compromising quality
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Experience Seekers</div>
                      <div className="text-sm text-muted-foreground">
                        Prioritize unique, memorable experiences
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Time-Conscious</div>
                      <div className="text-sm text-muted-foreground">
                        Need efficient, hassle-free travel
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <PackageComparisonTable />
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-6">
          <Level3PackageSelector 
            layout="cards"
            showDetails={true}
            className="max-w-full"
          />
        </TabsContent>

        {/* Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <LivePackageDemo />
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6">
          <IntegrationGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Package Comparison Table
 */
function PackageComparisonTable() {
  const packages = Object.values(LEVEL3_PACKAGES);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Comparison</CardTitle>
        <CardDescription>
          See how each package prioritizes different aspects of travel planning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Package</th>
                <th className="text-center p-4">Budget Priority</th>
                <th className="text-center p-4">Experience Priority</th>
                <th className="text-center p-4">Time Priority</th>
                <th className="text-left p-4">Best For</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.packageType} className="border-b">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {pkg.packageType === 'budget' && <DollarSign className="h-4 w-4 text-green-600" />}
                      {pkg.packageType === 'experience' && <Star className="h-4 w-4 text-purple-600" />}
                      {pkg.packageType === 'time' && <Clock className="h-4 w-4 text-blue-600" />}
                      <span className="font-medium">{pkg.name}</span>
                    </div>
                  </td>
                  <td className="text-center p-4">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {pkg.priorities.budget}/10
                    </div>
                  </td>
                  <td className="text-center p-4">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3 w-3" />
                      {pkg.priorities.experience}/10
                    </div>
                  </td>
                  <td className="text-center p-4">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      {pkg.priorities.timeEfficiency}/10
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {pkg.shortDescription}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Live Package Demo
 */
function LivePackageDemo() {
  const automation = useAutomationLevel();
  const [simulatedBooking, setSimulatedBooking] = useState({
    flight: null,
    hotel: null,
    activity: null,
  });

  const mockOptions = {
    flights: [
      { id: 1, airline: 'Budget Air', price: 280, duration: '8h 30m', rating: 3.8 },
      { id: 2, airline: 'Premium Airways', price: 450, duration: '5h 45m', rating: 4.5 },
      { id: 3, airline: 'Express Flights', price: 380, duration: '4h 20m', rating: 4.2 },
    ],
    hotels: [
      { id: 1, name: 'Economy Inn', price: 120, rating: 3.9, location: 'Downtown' },
      { id: 2, name: 'Boutique Hotel', price: 280, rating: 4.7, location: 'Arts District' },
      { id: 3, name: 'Business Center', price: 200, rating: 4.3, location: 'Airport' },
    ],
    activities: [
      { id: 1, name: 'Free Walking Tour', price: 0, duration: '2h', rating: 4.4 },
      { id: 2, name: 'Wine Tasting Experience', price: 85, duration: '3h', rating: 4.8 },
      { id: 3, name: 'Express City Tour', price: 45, duration: '1h', rating: 4.1 },
    ],
  };

  const getAIRecommendation = (category: string, options: any[]) => {
    const config = automation.level3PackageConfig;
    if (!config) return options[0];

    // Simulate AI selection based on package priorities
    if (config.packageType === 'budget') {
      return options.reduce((best, item) => item.price < best.price ? item : best);
    } else if (config.packageType === 'experience') {
      return options.reduce((best, item) => item.rating > best.rating ? item : best);
    } else if (config.packageType === 'time') {
      if (category === 'flights') {
        return options.reduce((best, item) => {
          const currentTime = parseFloat(item.duration.replace(/[^\d.]/g, ''));
          const bestTime = parseFloat(best.duration.replace(/[^\d.]/g, ''));
          return currentTime < bestTime ? item : best;
        });
      }
      return options.reduce((best, item) => item.rating > best.rating ? item : best);
    }
    return options[0];
  };

  const handleSimulation = () => {
    const flight = getAIRecommendation('flights', mockOptions.flights);
    const hotel = getAIRecommendation('hotels', mockOptions.hotels);
    const activity = getAIRecommendation('activities', mockOptions.activities);

    setSimulatedBooking({ flight, hotel, activity });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Live Package Simulation</CardTitle>
          <CardDescription>
            See how different packages would select from the same options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={handleSimulation} className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Simulate AI Selection
            </Button>
            <div className="text-sm text-muted-foreground">
              Current package: <strong>{automation.level3PackageConfig?.name}</strong>
            </div>
          </div>

          {simulatedBooking.flight && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">AI Selected Flight</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="font-medium">{simulatedBooking.flight.airline}</div>
                  <div className="text-sm text-muted-foreground">
                    ${simulatedBooking.flight.price} • {simulatedBooking.flight.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{simulatedBooking.flight.rating}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">AI Selected Hotel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="font-medium">{simulatedBooking.hotel.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${simulatedBooking.hotel.price}/night • {simulatedBooking.hotel.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{simulatedBooking.hotel.rating}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">AI Selected Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="font-medium">{simulatedBooking.activity.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${simulatedBooking.activity.price} • {simulatedBooking.activity.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{simulatedBooking.activity.rating}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Integration Guide
 */
function IntegrationGuide() {
  const [showCode, setShowCode] = useState(false);

  const codeExamples = {
    basicUsage: `import { Level3PackageSelector } from '@/components/level3-package-selector';
import { useAutomationLevel } from '@/hooks/useAutomationLevel';

function MyComponent() {
  const automation = useAutomationLevel();

  return (
    <Level3PackageSelector 
      layout="cards" 
      showDetails={true}
      onPackageChange={(packageType) => {
        console.log('Package changed to:', packageType);
      }}
    />
  );
}`,
    
    compactUsage: `// For headers/toolbars
<Level3PackageSelector layout="compact" />

// Quick toggle button
<QuickLevel3PackageToggle />`,

    customIntegration: `// Custom implementation using hooks
const automation = useAutomationLevel();

// Get current package
const currentPackage = automation.level3Package;

// Change package
automation.setLevel3Package('budget');

// Get package configuration
const packageConfig = automation.level3PackageConfig;

// Use in selection logic
if (packageConfig) {
  const criteria = packageConfig.selectionCriteria;
  // Apply criteria to your selection algorithm
}`,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Integration Guide
          </CardTitle>
          <CardDescription>
            Learn how to integrate Level 3 packages into your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button 
                variant={showCode ? "default" : "outline"}
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-2"
              >
                <Code className="h-4 w-4" />
                {showCode ? "Hide" : "Show"} Code Examples
              </Button>
            </div>

            {showCode && (
              <Tabs defaultValue="basic" className="w-full">
                <TabsList>
                  <TabsTrigger value="basic">Basic Usage</TabsTrigger>
                  <TabsTrigger value="compact">Compact</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic">
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeExamples.basicUsage}</code>
                  </pre>
                </TabsContent>
                
                <TabsContent value="compact">
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeExamples.compactUsage}</code>
                  </pre>
                </TabsContent>
                
                <TabsContent value="custom">
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeExamples.customIntegration}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Key Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Multiple layout options (cards, radio, compact)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Automatic persistence with localStorage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>TypeScript support throughout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Component-based architecture</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Use Cases</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  <span>Settings pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  <span>User profile dropdowns</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  <span>Booking flow preferences</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  <span>Quick access toolbars</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Level3PackageShowcase; 