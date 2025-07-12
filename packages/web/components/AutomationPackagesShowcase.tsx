/**
 * Automation Packages Showcase Component
 * Complete demonstration of the automation package system with vertical automation level slider
 */

'use client';

import React, { useState } from 'react';
import { useAutomationLevel } from '@/hooks/useAutomationLevel';
import { AutomationPackageSelector, QuickAutomationPackageToggle } from '@/components/automation-package-selector';
import { CustomPackageConfigurator } from '@/components/custom-package-configurator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AUTOMATION_PACKAGES, 
  AutomationPackage, 
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
  TrendingUp,
  Play,
  Pause,
  Eye,
  CheckCircle,
  ShoppingCart,
  Plane,
  Hotel,
  MapPin,
  X
} from 'lucide-react';

/**
 * Mock data for demonstration
 */
const mockBookingData = {
  flights: [
    { id: 1, airline: 'Budget Air', price: 280, duration: '8h 30m', rating: 3.8, score: 75 },
    { id: 2, airline: 'Premium Airways', price: 450, duration: '5h 45m', rating: 4.5, score: 90 },
    { id: 3, airline: 'Express Flights', price: 380, duration: '4h 20m', rating: 4.2, score: 85 },
  ],
  hotels: [
    { id: 1, name: 'Economy Inn', price: 120, rating: 3.9, location: 'Downtown', score: 78 },
    { id: 2, name: 'Boutique Hotel', price: 280, rating: 4.7, location: 'Arts District', score: 95 },
    { id: 3, name: 'Business Center', price: 200, rating: 4.3, location: 'Airport', score: 88 },
  ],
  activities: [
    { id: 1, name: 'Free Walking Tour', price: 0, duration: '2h', rating: 4.4, score: 82 },
    { id: 2, name: 'Wine Tasting Experience', price: 85, duration: '3h', rating: 4.8, score: 96 },
    { id: 3, name: 'Express City Tour', price: 45, duration: '1h', rating: 4.1, score: 79 },
  ],
};

/**
 * Main showcase component
 */
export function AutomationPackagesShowcase() {
  const automation = useAutomationLevel();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);

  // Calculate package-specific selections
  const getPackageSelection = (packageType: AutomationPackage, category: string, items: any[]) => {
    const packageConfig = AUTOMATION_PACKAGES[packageType];
    
    if (packageType === 'budget') {
      return items.reduce((best, item) => item.price < best.price ? item : best);
    } else if (packageType === 'experience') {
      return items.reduce((best, item) => item.rating > best.rating ? item : best);
    } else if (packageType === 'time') {
      if (category === 'flights') {
        return items.reduce((best, item) => {
          const currentTime = parseFloat(item.duration.replace(/[^\d.]/g, ''));
          const bestTime = parseFloat(best.duration.replace(/[^\d.]/g, ''));
          return currentTime < bestTime ? item : best;
        });
      }
      return items.reduce((best, item) => item.score > best.score ? item : best);
    } else {
      // Custom package - use balanced approach
      return items.reduce((best, item) => item.score > best.score ? item : best);
    }
  };

  // Simulate AI selection process
  const simulateAISelection = () => {
    setIsSimulating(true);
    
    // Simulate delay for each automation level
    const delay = automation.level === 1 ? 0 : automation.level === 2 ? 1000 : automation.level === 3 ? 2000 : 500;
    
    setTimeout(() => {
      const results = {
        flight: getPackageSelection(automation.automationPackage, 'flights', mockBookingData.flights),
        hotel: getPackageSelection(automation.automationPackage, 'hotels', mockBookingData.hotels),
        activity: getPackageSelection(automation.automationPackage, 'activities', mockBookingData.activities),
        packageUsed: automation.automationPackage,
        levelUsed: automation.level,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setSimulationResults(results);
      setIsSimulating(false);
    }, delay);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          Complete Automation System
        </div>
        <h1 className="text-4xl font-bold">Automation Packages</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience our new automation system that works across all levels with personalized 
          package preferences. Choose from preset packages or create your own custom configuration.
        </p>
        <div className="flex items-center justify-center gap-4">
          <QuickAutomationPackageToggle />
          <Badge variant="outline" className="px-4 py-2">
            Level {automation.level} • {automation.automationPackageConfig?.name}
          </Badge>
        </div>
      </div>

      {/* Current Status Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You're using <strong>Level {automation.level}</strong> automation with the{' '}
          <strong>{automation.automationPackageConfig?.name}</strong> package.
          This configuration affects how AI prioritizes selections across all travel categories.
        </AlertDescription>
      </Alert>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configurator">Configurator</TabsTrigger>
          <TabsTrigger value="simulation">Live Demo</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  What's New?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our enhanced automation system now works across all levels (1-4) with 
                  personalized package preferences that affect AI decision-making throughout 
                  your travel planning process.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Works with all automation levels</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>4 preset packages + custom configuration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Vertical automation level slider</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Per-category customization</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Package Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Budget Smart</div>
                      <div className="text-sm text-muted-foreground">
                        Optimizes for best deals while maintaining quality
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Experience Smart</div>
                      <div className="text-sm text-muted-foreground">
                        Curates unique, memorable experiences
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Time Smart</div>
                      <div className="text-sm text-muted-foreground">
                        Maximizes efficiency and convenience
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Custom Smart</div>
                      <div className="text-sm text-muted-foreground">
                        Personalized preferences for each category
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <AutomationLevelComparisonTable />
        </TabsContent>

        {/* Configurator Tab */}
        <TabsContent value="configurator" className="space-y-6">
          <AutomationPackageSelector 
            layout="cards"
            showDetails={true}
            showLevelSlider={true}
            className="max-w-full"
          />
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <LiveSimulationDemo
            isSimulating={isSimulating}
            simulationResults={simulationResults}
            onSimulate={simulateAISelection}
          />
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
 * Automation Level Comparison Table
 */
function AutomationLevelComparisonTable() {
  const levels = [
    { level: 1, name: 'Manual Control', autoSelect: false, confirmation: true, autoBook: false },
    { level: 2, name: 'Assisted Selection', autoSelect: true, confirmation: true, autoBook: false },
    { level: 3, name: 'Smart Automation', autoSelect: true, confirmation: false, autoBook: false },
    { level: 4, name: 'Full Automation', autoSelect: true, confirmation: false, autoBook: true },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation Level Comparison</CardTitle>
        <CardDescription>
          See how automation behavior changes across different levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Level</th>
                <th className="text-center p-4">Auto-Select</th>
                <th className="text-center p-4">Confirmation</th>
                <th className="text-center p-4">Auto-Book</th>
                <th className="text-left p-4">Use Case</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((level) => (
                <tr key={level.level} className="border-b">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{level.level}</span>
                      <span>{level.name}</span>
                    </div>
                  </td>
                  <td className="text-center p-4">
                    {level.autoSelect ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 mx-auto" />
                    )}
                  </td>
                  <td className="text-center p-4">
                    {level.confirmation ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 mx-auto" />
                    )}
                  </td>
                  <td className="text-center p-4">
                    {level.autoBook ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {level.level === 1 && 'Full control, manual decisions'}
                    {level.level === 2 && 'AI suggestions with approval'}
                    {level.level === 3 && 'Automated with final review'}
                    {level.level === 4 && 'Complete automation'}
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
 * Live Simulation Demo
 */
function LiveSimulationDemo({
  isSimulating,
  simulationResults,
  onSimulate,
}: {
  isSimulating: boolean;
  simulationResults: any;
  onSimulate: () => void;
}) {
  const automation = useAutomationLevel();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live AI Selection Simulation</span>
            <Button
              onClick={onSimulate}
              disabled={isSimulating}
              className="flex items-center gap-2"
            >
              {isSimulating ? (
                <>
                  <Pause className="h-4 w-4" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            See how your current automation level and package affects AI selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Automation Level</div>
              <div className="text-2xl font-bold">{automation.level}</div>
              <div className="text-sm">{AutomationUtils.getLevelName(automation.level)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Package</div>
              <div className="text-lg font-bold">{automation.automationPackageConfig?.name}</div>
              <div className="text-sm">{automation.automationPackageConfig?.focusArea}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Behavior</div>
              <div className="text-sm space-y-1">
                <div>Auto-select: {automation.shouldAutoSelect ? 'Yes' : 'No'}</div>
                <div>Confirmation: {automation.requiresConfirmation ? 'Required' : 'Optional'}</div>
              </div>
            </div>
          </div>

          {simulationResults && (
            <div className="mt-6 space-y-4">
              <Separator />
              <div className="text-sm text-muted-foreground">
                Simulation completed at {simulationResults.timestamp} using{' '}
                <strong>{AUTOMATION_PACKAGES[simulationResults.packageUsed].name}</strong> package
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SimulationResultCard
                  title="Selected Flight"
                  item={simulationResults.flight}
                  type="flight"
                />
                <SimulationResultCard
                  title="Selected Hotel"
                  item={simulationResults.hotel}
                  type="hotel"
                />
                <SimulationResultCard
                  title="Selected Activity"
                  item={simulationResults.activity}
                  type="activity"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Simulation Result Card
 */
function SimulationResultCard({
  title,
  item,
  type,
}: {
  title: string;
  item: any;
  type: 'flight' | 'hotel' | 'activity';
}) {
  return (
    <Card className="border-dashed border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {type === 'flight' && <Plane className="h-4 w-4" />}
          {type === 'hotel' && <Hotel className="h-4 w-4" />}
          {type === 'activity' && <MapPin className="h-4 w-4" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="font-medium">
          {type === 'flight' && item.airline}
          {type === 'hotel' && item.name}
          {type === 'activity' && item.name}
        </div>
        <div className="text-sm text-muted-foreground">
          ${item.price}
          {type === 'flight' && ` • ${item.duration}`}
          {type === 'hotel' && `/night • ${item.location}`}
          {type === 'activity' && ` • ${item.duration}`}
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-sm">{item.rating}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Integration Guide
 */
function IntegrationGuide() {
  const [showCode, setShowCode] = useState(false);

  const codeExamples = {
    basicUsage: `import { AutomationPackageSelector } from '@/components/automation-package-selector';
import { useAutomationLevel } from '@/hooks/useAutomationLevel';

function MyComponent() {
  const automation = useAutomationLevel();

  return (
    <AutomationPackageSelector 
      layout="cards" 
      showDetails={true}
      showLevelSlider={true}
      onPackageChange={(packageType) => {
        console.log('Package changed to:', packageType);
      }}
    />
  );
}`,
    
    hookUsage: `// Access automation state and package preferences
const automation = useAutomationLevel();

// Current settings
const currentLevel = automation.level; // 1-4
const currentPackage = automation.automationPackage; // 'budget' | 'experience' | 'time' | 'custom'
const packageConfig = automation.automationPackageConfig;

// Update settings
automation.setLevel(3);
automation.setAutomationPackage('budget');

// Custom package configuration
if (automation.automationPackage === 'custom') {
  const customConfig = automation.customPackageConfig;
  // Use custom preferences
}`,

    verticalSlider: `// Enable/disable the vertical automation level slider
<AutomationPackageSelector 
  showLevelSlider={true}  // Shows vertical slider on right
  layout="cards"
  showDetails={true}
/>`,
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
            Learn how to integrate the new automation package system
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
                  <TabsTrigger value="hooks">Hooks</TabsTrigger>
                  <TabsTrigger value="slider">Vertical Slider</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic">
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeExamples.basicUsage}</code>
                  </pre>
                </TabsContent>
                
                <TabsContent value="hooks">
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeExamples.hookUsage}</code>
                  </pre>
                </TabsContent>
                
                <TabsContent value="slider">
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeExamples.verticalSlider}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">New Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Works with all automation levels (1-4)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Custom package with per-category controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Vertical automation level slider</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Enhanced persistent storage</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Migration Guide</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  <span>Level3PackageSelector → AutomationPackageSelector</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  <span>level3Package → automationPackage</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  <span>LEVEL3_PACKAGES → AUTOMATION_PACKAGES</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  <span>Added custom package configuration</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AutomationPackagesShowcase; 