# Automation Levels Integration Guide

This guide shows how to integrate the 4-level automation system into different parts of your TravelAgentic application.

## Quick Start

### 1. Basic Hook Usage

```typescript
import { useAutomationLevel } from '@/hooks/useAutomationLevel';

function MyComponent() {
  const automation = useAutomationLevel();
  
  // Check current level and behavior
  if (automation.shouldAutoSelect) {
    // Auto-select the first/best option
  }
  
  if (automation.requiresConfirmation) {
    // Show confirmation dialog
  }
  
  return <div>Current level: {automation.level}</div>;
}
```

### 2. Adding Automation Selector to UI

```typescript
import AutomationLevelSelector from '@/components/automation-level-selector';

function SettingsPage() {
  return (
    <div>
      <h2>Travel Preferences</h2>
      <AutomationLevelSelector 
        onLevelChange={(level) => console.log('Level changed to:', level)}
        userContext={{
          isFirstTimeUser: false,
          timeConstraints: 'moderate'
        }}
      />
    </div>
  );
}
```

### 3. Quick Toggle in Header

```typescript
import { QuickAutomationToggle } from '@/components/automation-level-selector';

function AppHeader() {
  return (
    <header>
      <nav>
        {/* Other nav items */}
        <QuickAutomationToggle />
      </nav>
    </header>
  );
}
```

## Integration Patterns

### Flight Search Integration

```typescript
import { useAutomationLevel, useAutomationBookingFlow } from '@/hooks/useAutomationLevel';

function FlightSearchResults({ flights }: { flights: Flight[] }) {
  const automation = useAutomationLevel();
  const booking = useAutomationBookingFlow(automation.level);
  
  useEffect(() => {
    if (flights.length > 0) {
      // AI recommends the best flight
      const aiRecommendation = flights[0]; // Or use your AI logic
      
      const autoSelected = booking.handleAutoSelection(
        'flights', 
        flights, 
        aiRecommendation
      );
      
      // For levels 3-4, start auto-advance timer
      if (automation.shouldAutoSelect && !automation.requiresConfirmation) {
        setTimeout(() => {
          booking.autoProceeed();
        }, automation.selectionTimeout || 2000);
      }
    }
  }, [flights, booking, automation]);
  
  return (
    <div>
      {/* Show all options for Level 1, filtered for others */}
      {automation.shouldShowAllOptions ? flights : flights.slice(0, 5)}.map(flight => (
        <FlightCard 
          key={flight.id}
          flight={flight}
          isPreSelected={booking.bookingState.autoSelections.flights?.id === flight.id}
          onSelect={() => booking.confirmSelection('flights', flight)}
          showConfirmButton={automation.requiresConfirmation}
        />
      ))}
      
      {/* Auto-advance progress indicator for Level 3-4 */}
      {automation.shouldAutoSelect && !automation.requiresConfirmation && (
        <AutoAdvanceProgress 
          timeout={automation.selectionTimeout}
          onCancel={booking.cancelAutoAdvance}
        />
      )}
    </div>
  );
}
```

### Itinerary Building Integration

```typescript
import { useItinerary } from '@/contexts/ItineraryContext';
import { useAutomationLevel } from '@/hooks/useAutomationLevel';

function ItineraryBuilder() {
  const { state, setAutomationLevel } = useItinerary();
  const automation = useAutomationLevel(state.automationLevel);
  
  // Sync automation level with itinerary context
  useEffect(() => {
    setAutomationLevel(automation.level);
  }, [automation.level, setAutomationLevel]);
  
  const buildItinerary = async () => {
    const flowConfig = automation.flowConfig;
    
    // Adjust AI behavior based on automation level
    const buildingOptions = {
      showAllOptions: flowConfig.searchFlow.showAllResults,
      autoFilter: flowConfig.searchFlow.autoFilter,
      requireConfirmations: flowConfig.selectionFlow.showConfirmationSteps,
      batchProcessing: automation.shouldUseBatchProcessing(),
    };
    
    // Start building with appropriate settings
    await startAIBuilding(buildingOptions);
  };
  
  return (
    <div>
      <AutomationLevelSelector 
        currentLevel={state.automationLevel}
        compact={true}
      />
      <Button onClick={buildItinerary}>
        {automation.shouldAutoBook ? 'Book Trip' : 'Build Itinerary'}
      </Button>
    </div>
  );
}
```

### Booking Flow Integration

```typescript
function CheckoutPage() {
  const automation = useAutomationLevel();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCheckout = async () => {
    if (automation.shouldAutoBook) {
      // Level 4: Auto-book immediately
      setIsProcessing(true);
      await processBooking();
      setIsProcessing(false);
    } else if (automation.shouldWaitAtCheckout) {
      // Level 1-3: Show confirmation
      setShowConfirmation(true);
    }
  };
  
  return (
    <div>
      {automation.shouldWaitAtCheckout && (
        <BookingConfirmation 
          onConfirm={processBooking}
          showPriceBreakdown={true}
        />
      )}
      
      <Button 
        onClick={handleCheckout}
        disabled={isProcessing}
      >
        {automation.shouldAutoBook ? 'Book Now' : 'Review & Book'}
      </Button>
    </div>
  );
}
```

## API Integration

### Modifying API Calls Based on Automation Level

```typescript
// API Route: /api/search/flights
import { AutomationLevelManager } from '@/lib/automation-levels';

export async function POST(request: Request) {
  const { searchParams, automationLevel } = await request.json();
  const automation = new AutomationLevelManager(automationLevel);
  
  // Adjust search parameters based on automation level
  const apiParams = {
    ...searchParams,
    maxResults: automation.shouldShowAllOptions() ? 50 : 10,
    includeBasicEconomy: automation.getCurrentLevel() <= 2,
    sortBy: automation.shouldAutoSelect() ? 'recommended' : 'price',
  };
  
  const flights = await searchFlights(apiParams);
  
  // Pre-select for higher automation levels
  if (automation.shouldAutoSelect() && flights.length > 0) {
    flights[0].isPreSelected = true;
  }
  
  return Response.json({ 
    flights,
    automationConfig: automation.getFlowConfig()
  });
}
```

### AI Service Integration

```typescript
// lib/ai-service.ts
import { AutomationLevel, AutomationLevelManager } from '@/lib/automation-levels';

export class AITravelService {
  private automation: AutomationLevelManager;
  
  constructor(automationLevel: AutomationLevel) {
    this.automation = new AutomationLevelManager(automationLevel);
  }
  
  async generateItinerary(preferences: TravelPreferences) {
    const flowConfig = this.automation.getFlowConfig();
    
    const aiPrompt = this.buildPrompt(preferences, {
      includeAlternatives: flowConfig.ui.showAlternatives,
      prioritizeEfficiency: this.automation.shouldUseBatchProcessing(),
      requireExplanations: this.automation.requiresConfirmation(),
    });
    
    return await this.callAI(aiPrompt);
  }
  
  private buildPrompt(preferences: TravelPreferences, options: any) {
    let prompt = `Generate a travel itinerary for ${preferences.destination}...`;
    
    if (options.includeAlternatives) {
      prompt += '\nInclude 2-3 alternatives for each recommendation.';
    }
    
    if (options.requireExplanations) {
      prompt += '\nExplain why each option was selected.';
    }
    
    return prompt;
  }
}
```

## Component Patterns

### Auto-Advance Progress Component

```typescript
function AutoAdvanceProgress({ 
  timeout, 
  onCancel, 
  message = "Auto-advancing in" 
}: {
  timeout?: number;
  onCancel: () => void;
  message?: string;
}) {
  const [timeLeft, setTimeLeft] = useState(timeout || 3000);
  
  useEffect(() => {
    if (!timeout) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [timeout]);
  
  if (!timeout) return null;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-blue-700">
          {message} {Math.ceil(timeLeft / 1000)}s
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
      <div className="mt-2 bg-blue-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ 
            width: `${((timeout - timeLeft) / timeout) * 100}%` 
          }}
        />
      </div>
    </div>
  );
}
```

### Smart Confirmation Dialog

```typescript
function SmartConfirmationDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  automationLevel,
  data 
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  automationLevel: AutomationLevel;
  data: any;
}) {
  const automation = new AutomationLevelManager(automationLevel);
  const config = automation.getCurrentConfig();
  
  // Different confirmation styles based on level
  const getConfirmationStyle = () => {
    switch (automationLevel) {
      case 1:
        return {
          title: "Confirm Your Selection",
          description: "Please review your choice carefully",
          showDetails: true,
          allowModification: true,
        };
      case 2:
        return {
          title: "Confirm AI Selection",
          description: "The AI has pre-selected this option for you",
          showDetails: true,
          allowModification: true,
        };
      case 3:
        return {
          title: "Final Review",
          description: "Review your complete itinerary before booking",
          showDetails: false,
          allowModification: true,
        };
      default:
        return null; // Level 4 doesn't show confirmations
    }
  };
  
  const style = getConfirmationStyle();
  if (!style) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{style.title}</DialogTitle>
          <DialogDescription>{style.description}</DialogDescription>
        </DialogHeader>
        
        {style.showDetails && (
          <div className="space-y-4">
            {/* Show relevant details based on data */}
            <DetailComponent data={data} />
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {style.allowModification && (
            <Button variant="secondary" onClick={() => {/* Open modification UI */}}>
              Modify
            </Button>
          )}
          <Button onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Testing Integration

### Testing Different Automation Levels

```typescript
// __tests__/automation-integration.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AutomationLevelManager } from '@/lib/automation-levels';
import FlightSearchResults from '@/components/FlightSearchResults';

describe('Automation Level Integration', () => {
  const mockFlights = [
    { id: '1', airline: 'Delta', price: 300 },
    { id: '2', airline: 'United', price: 320 },
    { id: '3', airline: 'American', price: 310 },
  ];
  
  test('Level 1 shows all options', () => {
    render(
      <FlightSearchResults 
        flights={mockFlights} 
        automationLevel={1}
      />
    );
    
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.queryByText('Auto-advancing')).not.toBeInTheDocument();
  });
  
  test('Level 4 auto-selects and processes', async () => {
    const onBooking = jest.fn();
    
    render(
      <FlightSearchResults 
        flights={mockFlights} 
        automationLevel={4}
        onBooking={onBooking}
      />
    );
    
    // Should auto-select first option
    await waitFor(() => {
      expect(onBooking).toHaveBeenCalledWith(mockFlights[0]);
    });
  });
});
```

## Environment Configuration

### Feature Flag Integration

```typescript
// .env.local
NEXT_PUBLIC_FEATURE_AUTOMATION_LEVELS=true
NEXT_PUBLIC_FEATURE_PHASE=phase-2

// Usage in components
import { useFeatureFlag } from '@/lib/feature-flags';

function MyComponent() {
  const automationEnabled = useFeatureFlag('automationLevels');
  
  if (!automationEnabled) {
    return <LegacyComponent />;
  }
  
  return <AutomationEnabledComponent />;
}
```

### Development vs Production Settings

```typescript
// lib/automation-config.ts
export const getAutomationConfig = () => {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    defaultLevel: isDev ? 2 : 1, // Default to assisted in dev
    enableLevelChangeTracking: !isDev,
    showDebugInfo: isDev,
    maxAutoAdvanceTimeout: isDev ? 10000 : 3000,
  };
};
```

## Migration Guide

### Adding to Existing Components

1. **Import the hooks**:
   ```typescript
   import { useAutomationLevel } from '@/hooks/useAutomationLevel';
   ```

2. **Add automation context**:
   ```typescript
   const automation = useAutomationLevel();
   ```

3. **Conditionally modify behavior**:
   ```typescript
   // Before
   return <SearchResults results={allResults} />;
   
   // After
   const displayResults = automation.shouldShowAllOptions 
     ? allResults 
     : allResults.slice(0, 5);
   
   return <SearchResults results={displayResults} />;
   ```

4. **Add UI controls where needed**:
   ```typescript
   return (
     <div>
       <QuickAutomationToggle className="mb-4" />
       <SearchResults results={displayResults} />
     </div>
   );
   ```

## Best Practices

1. **Always provide fallbacks** for when automation levels are disabled
2. **Use feature flags** to gradually roll out automation features
3. **Track user behavior** to understand which levels are most effective
4. **Provide clear visual feedback** for auto-advancing actions
5. **Allow users to cancel** automatic actions at any time
6. **Test all levels thoroughly** with different user scenarios
7. **Keep automation logic separate** from UI components for reusability

## Troubleshooting

### Common Issues

1. **Auto-advance not working**: Check if `selectionTimeout` is set correctly
2. **Level not persisting**: Ensure `AutomationStorage` is working in your environment
3. **UI not updating**: Verify the automation level is passed to all relevant components
4. **Performance issues**: Use `useMemo` for expensive automation calculations

### Debug Tools

```typescript
// Add this to any component for debugging
const automation = useAutomationLevel();

useEffect(() => {
  console.log('Automation Debug:', {
    level: automation.level,
    config: automation.config,
    flowConfig: automation.flowConfig,
  });
}, [automation]);
``` 