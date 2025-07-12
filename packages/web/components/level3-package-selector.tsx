/**
 * Level 3 Package Selector Component
 * Allows users to choose between different Level 3 automation packages
 */

'use client';

import React, { useState } from 'react';
import { 
  AutomationPackage, 
  AutomationPackageConfig, 
  AUTOMATION_PACKAGES,
  AutomationUtils 
} from '@/lib/automation-levels';
import { useAutomationLevel } from '@/hooks/useAutomationLevel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
  TrendingUp
} from 'lucide-react';

interface Level3PackageSelectorProps {
  /** Current Level 3 package */
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
 * Main Level 3 Package Selector Component
 */
export function Level3PackageSelector({
  currentPackage,
  onPackageChange,
  compact = false,
  showDetails = true,
  className = '',
  layout = 'cards',
}: Level3PackageSelectorProps) {
  const automation = useAutomationLevel();
  const [selectedPackage, setSelectedPackage] = useState<AutomationPackage>(
    currentPackage || automation.automationPackage
  );

  const handlePackageChange = (packageType: AutomationPackage) => {
    setSelectedPackage(packageType);
    automation.setAutomationPackage(packageType);
    onPackageChange?.(packageType);
  };

  // Package selector works for all automation levels
  // No level restriction needed

  if (layout === 'compact') {
    return (
      <CompactPackageSelector
        selectedPackage={selectedPackage}
        onPackageChange={handlePackageChange}
        className={className}
      />
    );
  }

  if (layout === 'radio') {
    return (
      <RadioPackageSelector
        selectedPackage={selectedPackage}
        onPackageChange={handlePackageChange}
        showDetails={showDetails}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Automation Package
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose your focus area for Level {automation.level} automation
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Level {automation.level}: {AutomationUtils.getAutomationPackageName(selectedPackage)}
        </Badge>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(AUTOMATION_PACKAGES).map((config) => (
          <PackageCard
            key={config.packageType}
            config={config}
            isSelected={config.packageType === selectedPackage}
            onClick={() => handlePackageChange(config.packageType)}
            showDetails={showDetails}
          />
        ))}
      </div>

      {/* Selected Package Details */}
      {showDetails && (
        <SelectedPackageDetails packageType={selectedPackage} />
      )}
    </div>
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
  selectedPackage: Level3Package;
  onPackageChange: (packageType: Level3Package) => void;
  className?: string;
}) {
  const automation = useAutomationLevel();
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Smart Automation Package</DialogTitle>
          <DialogDescription>
            Choose your focus area for Level {automation.level} automation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
      </DialogContent>
    </Dialog>
  );
}

/**
 * Radio-based Package Selector
 */
function RadioPackageSelector({
  selectedPackage,
  onPackageChange,
  showDetails,
  className,
}: {
  selectedPackage: Level3Package;
  onPackageChange: (packageType: Level3Package) => void;
  showDetails: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <RadioGroup
        value={selectedPackage}
        onValueChange={(value) => onPackageChange(value as Level3Package)}
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

      {showDetails && (
        <SelectedPackageDetails packageType={selectedPackage} />
      )}
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
  config: Level3PackageConfig;
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
 * Selected Package Details
 */
function SelectedPackageDetails({ packageType }: { packageType: Level3Package }) {
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
export function QuickLevel3PackageToggle({ className = '' }: { className?: string }) {
  const automation = useAutomationLevel();
  
  // Package toggle works for all automation levels

  const packages: Level3Package[] = ['budget', 'experience', 'time'];
  const currentIndex = packages.indexOf(automation.automationPackage as Level3Package);
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
            className={`${getPackageColor(automation.automationPackage as Level3Package).bg} ${className}`}
          >
            {getPackageIcon(automation.automationPackage as Level3Package, 'sm')}
            <span className="ml-2">{AUTOMATION_PACKAGES[automation.automationPackage as AutomationPackage].name}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {AUTOMATION_PACKAGES[nextPackage].name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default Level3PackageSelector; 