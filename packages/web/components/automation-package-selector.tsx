/**
 * Automation Package Selector Component
 * Allows users to choose between different automation packages for all levels
 * Features a vertical automation level slider on the right side
 */

'use client';

import React, { useState } from 'react';
import { 
  AutomationPackage, 
  AutomationUtils, 
  AUTOMATION_PACKAGES,
  DEFAULT_AUTOMATION_LEVEL 
} from '@/lib/automation-levels';
import { useAutomationLevel } from '@/hooks/useAutomationLevel';
import { CustomPackageConfigurator } from '@/components/custom-package-configurator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  DollarSign, 
  Star, 
  Clock, 
  Settings, 
  CheckCircle,
  Info,
  Zap,
  Target,
  TrendingUp,
  Eye,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface AutomationPackageSelectorProps {
  /** Current automation package */
  currentPackage?: AutomationPackage;
  /** Callback when package changes */
  onPackageChange?: (packageType: AutomationPackage) => void;
  /** Whether to show as compact version */
  compact?: boolean;
  /** Whether to show detailed descriptions */
  showDetails?: boolean;
  /** Custom styling */
  className?: string;
  /** Whether to show as cards or radio buttons */
  layout?: 'cards' | 'radio' | 'compact';
  /** Whether to show the vertical automation level slider */
  showLevelSlider?: boolean;
}

/**
 * Get icon for package type
 */
const getPackageIcon = (packageType: AutomationPackage, size: 'sm' | 'md' | 'lg' = 'md') => {
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6';
  
  const icons = {
    budget: <DollarSign className={iconSize} />,
    experience: <Star className={iconSize} />,
    time: <Clock className={iconSize} />,
    custom: <Settings className={iconSize} />,
  };
  
  return icons[packageType];
};

/**
 * Get color scheme for package type
 */
const getPackageColor = (packageType: AutomationPackage) => {
  const colors = {
    budget: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-800',
      button: 'bg-green-500 hover:bg-green-600',
    },
    experience: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-800',
      button: 'bg-purple-500 hover:bg-purple-600',
    },
    time: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
    custom: {
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-800',
      button: 'bg-orange-500 hover:bg-orange-600',
    },
  };
  
  return colors[packageType];
};

/**
 * Get automation level name and description
 */
const getAutomationLevelInfo = (level: number) => {
  const levels = {
    1: { name: 'Manual', description: 'Full control' },
    2: { name: 'Assisted', description: 'AI suggestions' },
    3: { name: 'Smart', description: 'Automated with review' },
    4: { name: 'Full Auto', description: 'Complete automation' },
  };
  return levels[level as keyof typeof levels] || { name: 'Unknown', description: '' };
};

/**
 * Main Automation Package Selector Component
 */
export function AutomationPackageSelector({
  currentPackage,
  onPackageChange,
  compact = false,
  showDetails = true,
  className = '',
  layout = 'cards',
  showLevelSlider = true,
}: AutomationPackageSelectorProps) {
  const automation = useAutomationLevel();
  const [selectedPackage, setSelectedPackage] = useState<AutomationPackage>(
    currentPackage || automation.automationPackage
  );
  const [showCustomConfigurator, setShowCustomConfigurator] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handlePackageChange = (packageType: AutomationPackage) => {
    setSelectedPackage(packageType);
    automation.setAutomationPackage(packageType);
    onPackageChange?.(packageType);
    
    // Show custom configurator if custom package is selected
    if (packageType === 'custom') {
      setShowCustomConfigurator(true);
    }
  };

  const handleLevelChange = (value: number[]) => {
    const newLevel = value[0] as 1 | 2 | 3 | 4;
    automation.setLevel(newLevel);
  };

  if (layout === 'compact') {
    return (
      <CompactPackageSelector
        selectedPackage={selectedPackage}
        onPackageChange={handlePackageChange}
        className={className}
      />
    );
  }

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Main Package Selection Area */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automation Package
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose how AI should prioritize your travel planning across all automation levels
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {AutomationUtils.getAutomationPackageName(selectedPackage)}
          </Badge>
        </div>

        {/* Package Selection */}
        {layout === 'radio' ? (
          <RadioPackageSelector
            selectedPackage={selectedPackage}
            onPackageChange={handlePackageChange}
            showDetails={showDetails}
          />
        ) : (
          <CardPackageSelector
            selectedPackage={selectedPackage}
            onPackageChange={handlePackageChange}
            showDetails={showDetails}
          />
        )}

        {/* Custom Package Configurator */}
        {selectedPackage === 'custom' && (
          <CustomPackageConfigurator className="mt-6" />
        )}

        {/* Package Details */}
        {showDetails && selectedPackage !== 'custom' && (
          <SelectedPackageDetails packageType={selectedPackage} />
        )}
      </div>

      {/* Vertical Automation Level Slider */}
      {showLevelSlider && (
        <div className={`transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {!isCollapsed && (
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Automation Level
                  </CardTitle>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-8 w-8 p-0"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Level Display */}
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold">{automation.level}</div>
                {!isCollapsed && (
                  <>
                    <div className="text-sm font-medium">
                      {getAutomationLevelInfo(automation.level).name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getAutomationLevelInfo(automation.level).description}
                    </div>
                  </>
                )}
              </div>

              {/* Vertical Slider */}
              <div className="flex justify-center">
                <div className="relative">
                  <Slider
                    value={[automation.level]}
                    onValueChange={handleLevelChange}
                    max={4}
                    min={1}
                    step={1}
                    orientation="vertical"
                    className="h-48"
                  />
                </div>
              </div>

              {/* Level Markers */}
              {!isCollapsed && (
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((level) => {
                    const info = getAutomationLevelInfo(level);
                    const isActive = automation.level === level;
                    
                    return (
                      <div
                        key={level}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <div className="text-sm font-medium w-6">{level}</div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">{info.name}</div>
                          <div className="text-xs">{info.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Current Configuration Summary */}
              {!isCollapsed && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="text-xs font-medium">Current Setup</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Eye className="h-3 w-3" />
                      <span>Auto-select: {automation.shouldAutoSelect ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3" />
                      <span>Confirmation: {automation.requiresConfirmation ? 'Required' : 'Optional'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Zap className="h-3 w-3" />
                      <span>Auto-book: {automation.shouldAutoBook ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Card-based Package Selector
 */
function CardPackageSelector({
  selectedPackage,
  onPackageChange,
  showDetails,
}: {
  selectedPackage: AutomationPackage;
  onPackageChange: (packageType: AutomationPackage) => void;
  showDetails: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.values(AUTOMATION_PACKAGES).map((config) => (
        <PackageCard
          key={config.packageType}
          config={config}
          isSelected={config.packageType === selectedPackage}
          onClick={() => onPackageChange(config.packageType)}
          showDetails={showDetails}
        />
      ))}
    </div>
  );
}

/**
 * Radio-based Package Selector
 */
function RadioPackageSelector({
  selectedPackage,
  onPackageChange,
  showDetails,
}: {
  selectedPackage: AutomationPackage;
  onPackageChange: (packageType: AutomationPackage) => void;
  showDetails: boolean;
}) {
  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedPackage}
        onValueChange={(value) => onPackageChange(value as AutomationPackage)}
      >
        {Object.values(AUTOMATION_PACKAGES).map((config) => (
          <div key={config.packageType} className="flex items-center space-x-2">
            <RadioGroupItem value={config.packageType} id={config.packageType} />
            <Label htmlFor={config.packageType} className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPackageIcon(config.packageType)}
                  <div>
                    <div className="font-medium">{config.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {config.shortDescription}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {config.focusArea}
                </Badge>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

/**
 * Individual Package Card
 */
function PackageCard({
  config,
  isSelected,
  onClick,
  showDetails = true,
  compact = false,
}: {
  config: typeof AUTOMATION_PACKAGES[AutomationPackage];
  isSelected: boolean;
  onClick: () => void;
  showDetails?: boolean;
  compact?: boolean;
}) {
  const colors = getPackageColor(config.packageType);

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? `ring-2 ring-offset-2 ${colors.border.replace('border-', 'ring-')} ${colors.bg}` 
          : 'hover:bg-gray-50'
      } ${compact ? 'p-3' : ''}`}
      onClick={onClick}
    >
      <CardHeader className={compact ? 'p-0 space-y-1' : 'pb-3'}>
        <div className="flex items-center justify-between">
          <CardTitle className={`${compact ? 'text-sm' : 'text-base'} flex items-center gap-2`}>
            {getPackageIcon(config.packageType, compact ? 'sm' : 'md')}
            {config.name}
          </CardTitle>
          {isSelected && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
        </div>
        {!compact && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {config.focusArea}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{config.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardHeader>

      {!compact && (
        <CardContent className="pt-0">
          <CardDescription className="mb-3">
            {config.shortDescription}
          </CardDescription>

          {showDetails && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Budget Priority:</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {config.priorities.budget}/10
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Experience Priority:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {config.priorities.experience}/10
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Priority:</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {config.priorities.timeEfficiency}/10
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Compact Package Selector for headers/toolbars
 */
function CompactPackageSelector({
  selectedPackage,
  onPackageChange,
  className,
}: {
  selectedPackage: AutomationPackage;
  onPackageChange: (packageType: AutomationPackage) => void;
  className?: string;
}) {
  const config = AUTOMATION_PACKAGES[selectedPackage];
  const colors = getPackageColor(selectedPackage);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`${colors.bg} ${colors.border} ${colors.text} hover:bg-opacity-80 ${className}`}
        >
          {getPackageIcon(selectedPackage, 'sm')}
          <span className="ml-2">{config.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Automation Package</DialogTitle>
          <DialogDescription>
            Choose your focus area for travel automation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(AUTOMATION_PACKAGES).map((config) => (
              <PackageCard
                key={config.packageType}
                config={config}
                isSelected={config.packageType === selectedPackage}
                onClick={() => onPackageChange(config.packageType)}
                showDetails={false}
                compact
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Selected Package Details
 */
function SelectedPackageDetails({ packageType }: { packageType: AutomationPackage }) {
  const config = AUTOMATION_PACKAGES[packageType];

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {getPackageIcon(packageType)}
          {config.name} - Selected Configuration
        </CardTitle>
        <CardDescription>
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Preferences</h4>
            <div className="space-y-1 text-sm">
              <div>Flights: {config.customizations.flightPreference}</div>
              <div>Hotels: {config.customizations.hotelPreference}</div>
              <div>Activities: {config.customizations.activityPreference}</div>
              <div>Dining: {config.customizations.diningPreference}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">AI Approach</h4>
            <p className="text-sm text-muted-foreground">
              {config.userPrompts.overallApproach}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Quick Package Toggle for rapid switching
 */
export function QuickAutomationPackageToggle({ className = '' }: { className?: string }) {
  const automation = useAutomationLevel();
  
  const packages: AutomationPackage[] = ['budget', 'experience', 'time', 'custom'];
  const currentIndex = packages.indexOf(automation.automationPackage);
  const nextPackage = packages[(currentIndex + 1) % packages.length];

  const handleToggle = () => {
    automation.setAutomationPackage(nextPackage);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            className={`${getPackageColor(automation.automationPackage).bg} ${className}`}
          >
            {getPackageIcon(automation.automationPackage, 'sm')}
            <span className="ml-2">{AUTOMATION_PACKAGES[automation.automationPackage].name}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {AUTOMATION_PACKAGES[nextPackage].name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default AutomationPackageSelector; 