/**
 * Custom Package Configurator Component
 * Allows users to create personalized automation preferences for each travel category
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAutomationLevel } from '@/hooks/useAutomationLevel';
import { CustomPackageConfig } from '@/lib/automation-levels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plane, 
  Hotel, 
  MapPin, 
  Utensils,
  Settings,
  Check,
  X,
  Info,
  Save,
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';

interface CustomPackageConfiguratorProps {
  onConfigChange?: (config: CustomPackageConfig) => void;
  className?: string;
}

/**
 * Default configuration for new custom packages
 */
const DEFAULT_CUSTOM_CONFIG: CustomPackageConfig = {
  flights: {
    priority: 'best-value',
    allowLayovers: true,
    maxPrice: undefined,
    preferredAirlines: [],
  },
  hotels: {
    priority: 'convenient',
    maxPrice: undefined,
    preferredChains: [],
    amenities: [],
  },
  activities: {
    priority: 'popular',
    maxPrice: undefined,
    categories: [],
    duration: 'any',
  },
  dining: {
    priority: 'local',
    maxPrice: undefined,
    cuisineTypes: [],
    dietaryRestrictions: [],
  },
};

/**
 * Main Custom Package Configurator Component
 */
export function CustomPackageConfigurator({
  onConfigChange,
  className = '',
}: CustomPackageConfiguratorProps) {
  const automation = useAutomationLevel();
  const [config, setConfig] = useState<CustomPackageConfig>(
    automation.customPackageConfig || DEFAULT_CUSTOM_CONFIG
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update local state when automation config changes
  useEffect(() => {
    if (automation.customPackageConfig) {
      setConfig(automation.customPackageConfig);
      setHasUnsavedChanges(false);
    }
  }, [automation.customPackageConfig]);

  // Handle configuration changes
  const handleConfigChange = (newConfig: CustomPackageConfig) => {
    setConfig(newConfig);
    setHasUnsavedChanges(true);
    onConfigChange?.(newConfig);
  };

  // Save configuration
  const handleSaveConfig = () => {
    automation.setCustomPackageConfig(config);
    setHasUnsavedChanges(false);
  };

  // Reset to default configuration
  const handleResetConfig = () => {
    setConfig(DEFAULT_CUSTOM_CONFIG);
    setHasUnsavedChanges(true);
  };

  // Clear custom configuration
  const handleClearConfig = () => {
    automation.clearCustomPackageConfig();
    setConfig(DEFAULT_CUSTOM_CONFIG);
    setHasUnsavedChanges(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Package Configuration
          </h3>
          <p className="text-sm text-muted-foreground">
            Personalize your automation preferences for each travel category
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Unsaved Changes
            </Badge>
          )}
          <Button
            onClick={handleSaveConfig}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="flights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flights" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="dining" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Dining
          </TabsTrigger>
        </TabsList>

        {/* Flights Configuration */}
        <TabsContent value="flights" className="space-y-4">
          <FlightsConfigurator
            config={config.flights}
            onChange={(flightConfig) =>
              handleConfigChange({ ...config, flights: flightConfig })
            }
          />
        </TabsContent>

        {/* Hotels Configuration */}
        <TabsContent value="hotels" className="space-y-4">
          <HotelsConfigurator
            config={config.hotels}
            onChange={(hotelConfig) =>
              handleConfigChange({ ...config, hotels: hotelConfig })
            }
          />
        </TabsContent>

        {/* Activities Configuration */}
        <TabsContent value="activities" className="space-y-4">
          <ActivitiesConfigurator
            config={config.activities}
            onChange={(activityConfig) =>
              handleConfigChange({ ...config, activities: activityConfig })
            }
          />
        </TabsContent>

        {/* Dining Configuration */}
        <TabsContent value="dining" className="space-y-4">
          <DiningConfigurator
            config={config.dining}
            onChange={(diningConfig) =>
              handleConfigChange({ ...config, dining: diningConfig })
            }
          />
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleResetConfig}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
          <Button
            variant="outline"
            onClick={handleClearConfig}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Clear Configuration
          </Button>
        </div>
        <Alert className="w-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Changes will be applied to all automation levels when using Custom package
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

/**
 * Flights Configuration Component
 */
function FlightsConfigurator({
  config,
  onChange,
}: {
  config: CustomPackageConfig['flights'];
  onChange: (config: CustomPackageConfig['flights']) => void;
}) {
  const [preferredAirlines, setPreferredAirlines] = useState<string[]>(config.preferredAirlines || []);
  const [newAirline, setNewAirline] = useState('');

  const addAirline = () => {
    if (newAirline.trim() && !preferredAirlines.includes(newAirline.trim())) {
      const updated = [...preferredAirlines, newAirline.trim()];
      setPreferredAirlines(updated);
      onChange({ ...config, preferredAirlines: updated });
      setNewAirline('');
    }
  };

  const removeAirline = (airline: string) => {
    const updated = preferredAirlines.filter(a => a !== airline);
    setPreferredAirlines(updated);
    onChange({ ...config, preferredAirlines: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Flight Preferences
        </CardTitle>
        <CardDescription>
          Configure how AI should prioritize and select flights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flight-priority">Priority</Label>
            <Select 
              value={config.priority} 
              onValueChange={(value) => onChange({ ...config, priority: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cheapest">Cheapest First</SelectItem>
                <SelectItem value="fastest">Fastest First</SelectItem>
                <SelectItem value="best-value">Best Value</SelectItem>
                <SelectItem value="premium">Premium Options</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-price">Max Price (USD)</Label>
            <Input
              id="max-price"
              type="number"
              placeholder="No limit"
              value={config.maxPrice || ''}
              onChange={(e) => onChange({ ...config, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="allow-layovers"
            checked={config.allowLayovers}
            onCheckedChange={(checked) => onChange({ ...config, allowLayovers: checked })}
          />
          <Label htmlFor="allow-layovers">Allow flights with layovers</Label>
        </div>

        <div className="space-y-2">
          <Label>Preferred Airlines</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter airline name"
              value={newAirline}
              onChange={(e) => setNewAirline(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAirline()}
            />
            <Button onClick={addAirline} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {preferredAirlines.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {preferredAirlines.map((airline) => (
                <Badge key={airline} variant="secondary" className="flex items-center gap-1">
                  {airline}
                  <button onClick={() => removeAirline(airline)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Hotels Configuration Component
 */
function HotelsConfigurator({
  config,
  onChange,
}: {
  config: CustomPackageConfig['hotels'];
  onChange: (config: CustomPackageConfig['hotels']) => void;
}) {
  const [preferredChains, setPreferredChains] = useState<string[]>(config.preferredChains || []);
  const [amenities, setAmenities] = useState<string[]>(config.amenities || []);

  const availableAmenities = [
    'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Room Service', 
    'Concierge', 'Parking', 'Pet Friendly', 'Business Center', 'Laundry'
  ];

  const toggleAmenity = (amenity: string) => {
    const updated = amenities.includes(amenity)
      ? amenities.filter(a => a !== amenity)
      : [...amenities, amenity];
    setAmenities(updated);
    onChange({ ...config, amenities: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hotel className="h-5 w-5" />
          Hotel Preferences
        </CardTitle>
        <CardDescription>
          Configure how AI should prioritize and select hotels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hotel-priority">Priority</Label>
            <Select 
              value={config.priority} 
              onValueChange={(value) => onChange({ ...config, priority: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget Options</SelectItem>
                <SelectItem value="boutique">Boutique Hotels</SelectItem>
                <SelectItem value="luxury">Luxury Hotels</SelectItem>
                <SelectItem value="convenient">Convenient Location</SelectItem>
                <SelectItem value="eco-friendly">Eco-Friendly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-price">Max Price per Night (USD)</Label>
            <Input
              id="max-price"
              type="number"
              placeholder="No limit"
              value={config.maxPrice || ''}
              onChange={(e) => onChange({ ...config, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Required Amenities</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={amenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Activities Configuration Component
 */
function ActivitiesConfigurator({
  config,
  onChange,
}: {
  config: CustomPackageConfig['activities'];
  onChange: (config: CustomPackageConfig['activities']) => void;
}) {
  const [categories, setCategories] = useState<string[]>(config.categories || []);

  const availableCategories = [
    'Museums', 'Tours', 'Outdoor Adventures', 'Food & Drink', 'Nightlife', 
    'Shopping', 'Cultural', 'Sports', 'Entertainment', 'Wellness', 'Family'
  ];

  const toggleCategory = (category: string) => {
    const updated = categories.includes(category)
      ? categories.filter(c => c !== category)
      : [...categories, category];
    setCategories(updated);
    onChange({ ...config, categories: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Activity Preferences
        </CardTitle>
        <CardDescription>
          Configure how AI should prioritize and select activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="activity-priority">Priority</Label>
            <Select 
              value={config.priority} 
              onValueChange={(value) => onChange({ ...config, priority: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular Activities</SelectItem>
                <SelectItem value="unique">Unique Experiences</SelectItem>
                <SelectItem value="budget">Budget-Friendly</SelectItem>
                <SelectItem value="premium">Premium Experiences</SelectItem>
                <SelectItem value="cultural">Cultural Focus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Preferred Duration</Label>
            <Select 
              value={config.duration} 
              onValueChange={(value) => onChange({ ...config, duration: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (1-2 hours)</SelectItem>
                <SelectItem value="medium">Medium (3-5 hours)</SelectItem>
                <SelectItem value="long">Long (6+ hours)</SelectItem>
                <SelectItem value="any">Any Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-price">Max Price per Activity (USD)</Label>
          <Input
            id="max-price"
            type="number"
            placeholder="No limit"
            value={config.maxPrice || ''}
            onChange={(e) => onChange({ ...config, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        <div className="space-y-2">
          <Label>Preferred Categories</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={categories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label htmlFor={category} className="text-sm">{category}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Dining Configuration Component
 */
function DiningConfigurator({
  config,
  onChange,
}: {
  config: CustomPackageConfig['dining'];
  onChange: (config: CustomPackageConfig['dining']) => void;
}) {
  const [cuisineTypes, setCuisineTypes] = useState<string[]>(config.cuisineTypes || []);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(config.dietaryRestrictions || []);

  const availableCuisines = [
    'Italian', 'French', 'Japanese', 'Chinese', 'Thai', 'Mexican', 'Indian', 
    'Mediterranean', 'American', 'Korean', 'Vietnamese', 'Greek', 'Spanish'
  ];

  const availableDietaryRestrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Dairy-Free', 'Nut-Free'
  ];

  const toggleCuisine = (cuisine: string) => {
    const updated = cuisineTypes.includes(cuisine)
      ? cuisineTypes.filter(c => c !== cuisine)
      : [...cuisineTypes, cuisine];
    setCuisineTypes(updated);
    onChange({ ...config, cuisineTypes: updated });
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const updated = dietaryRestrictions.includes(restriction)
      ? dietaryRestrictions.filter(r => r !== restriction)
      : [...dietaryRestrictions, restriction];
    setDietaryRestrictions(updated);
    onChange({ ...config, dietaryRestrictions: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Dining Preferences
        </CardTitle>
        <CardDescription>
          Configure how AI should prioritize and select dining options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dining-priority">Priority</Label>
            <Select 
              value={config.priority} 
              onValueChange={(value) => onChange({ ...config, priority: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Specialties</SelectItem>
                <SelectItem value="fine-dining">Fine Dining</SelectItem>
                <SelectItem value="casual">Casual Dining</SelectItem>
                <SelectItem value="authentic">Authentic Cuisine</SelectItem>
                <SelectItem value="vegetarian">Vegetarian Options</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-price">Max Price per Meal (USD)</Label>
            <Input
              id="max-price"
              type="number"
              placeholder="No limit"
              value={config.maxPrice || ''}
              onChange={(e) => onChange({ ...config, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Preferred Cuisines</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableCuisines.map((cuisine) => (
              <div key={cuisine} className="flex items-center space-x-2">
                <Checkbox
                  id={cuisine}
                  checked={cuisineTypes.includes(cuisine)}
                  onCheckedChange={() => toggleCuisine(cuisine)}
                />
                <Label htmlFor={cuisine} className="text-sm">{cuisine}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Dietary Restrictions</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableDietaryRestrictions.map((restriction) => (
              <div key={restriction} className="flex items-center space-x-2">
                <Checkbox
                  id={restriction}
                  checked={dietaryRestrictions.includes(restriction)}
                  onCheckedChange={() => toggleDietaryRestriction(restriction)}
                />
                <Label htmlFor={restriction} className="text-sm">{restriction}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomPackageConfigurator; 