/**
 * Automation Level Selector Component
 * Provides an intuitive interface for users to select their preferred automation level
 */

'use client';

import React, { useState } from 'react';
import { 
  AutomationLevel, 
  AutomationUtils, 
  AUTOMATION_LEVEL_CONFIGS,
  DEFAULT_AUTOMATION_LEVEL 
} from '@/lib/automation-levels';
import { useAutomationLevel, useAutomationRecommendation } from '@/hooks/useAutomationLevel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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
  Settings, 
  Zap, 
  CheckCircle, 
  Clock, 
  Eye, 
  ShoppingCart,
  User,
  Users,
  Briefcase,
  Plane
} from 'lucide-react';

interface AutomationLevelSelectorProps {
  /** Current automation level */
  currentLevel?: AutomationLevel;
  /** Callback when level changes */
  onLevelChange?: (level: AutomationLevel) => void;
  /** Whether to show as compact version */
  compact?: boolean;
  /** Whether to show detailed descriptions */
  showDetails?: boolean;
  /** User context for recommendations */
  userContext?: {
    isFirstTimeUser?: boolean;
    hasPreviousBookings?: boolean;
    preferredBudget?: 'low' | 'medium' | 'high';
    timeConstraints?: 'flexible' | 'moderate' | 'tight';
  };
  /** Custom styling */
  className?: string;
}

/**
 * Main Automation Level Selector Component
 */
export function AutomationLevelSelector({
  currentLevel,
  onLevelChange,
  compact = false,
  showDetails = true,
  userContext = {},
  className = '',
}: AutomationLevelSelectorProps) {
  const automation = useAutomationLevel(currentLevel);
  const recommendation = useAutomationRecommendation(userContext);
  
  const [selectedLevel, setSelectedLevel] = useState<AutomationLevel>(
    currentLevel || automation.level
  );

  const handleLevelChange = (newLevel: AutomationLevel) => {
    setSelectedLevel(newLevel);
    automation.setLevel(newLevel);
    onLevelChange?.(newLevel);
  };

  const getLevelIcon = (level: AutomationLevel) => {
    const icons = {
      1: <Eye className="h-4 w-4" />,
      2: <CheckCircle className="h-4 w-4" />,
      3: <Clock className="h-4 w-4" />,
      4: <Zap className="h-4 w-4" />,
    };
    return icons[level];
  };

  const getLevelColor = (level: AutomationLevel) => {
    const colors = {
      1: 'bg-blue-100 text-blue-800 border-blue-200',
      2: 'bg-green-100 text-green-800 border-green-200',
      3: 'bg-orange-100 text-orange-800 border-orange-200',
      4: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[level];
  };

  if (compact) {
    return (
      <CompactSelector
        selectedLevel={selectedLevel}
        onLevelChange={handleLevelChange}
        recommendedLevel={recommendation.recommendedLevel}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with current selection */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Automation Level</h3>
          <p className="text-sm text-muted-foreground">
            Choose how much control you want over your travel planning
          </p>
        </div>
        <Badge 
          variant="outline" 
          className={`${getLevelColor(selectedLevel)} px-3 py-1`}
        >
          {getLevelIcon(selectedLevel)}
          <span className="ml-2">Level {selectedLevel}</span>
        </Badge>
      </div>

      {/* Slider Control */}
      <div className="space-y-4">
        <div className="px-2">
          <Slider
            value={[selectedLevel]}
            onValueChange={(value) => handleLevelChange(value[0] as AutomationLevel)}
            max={4}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
        
        {/* Level labels */}
        <div className="flex justify-between text-xs text-muted-foreground px-2">
          <span>Manual</span>
          <span>Assisted</span>
          <span>Smart</span>
          <span>Full Auto</span>
        </div>
      </div>

      {/* Current Level Details */}
      <Card className="border-2 border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              {getLevelIcon(selectedLevel)}
              <span className="ml-2">{AutomationUtils.getLevelName(selectedLevel)}</span>
            </CardTitle>
            {recommendation.isRecommended(selectedLevel) && (
              <Badge variant="secondary" className="text-xs">
                Recommended
              </Badge>
            )}
          </div>
          <CardDescription>
            {AutomationUtils.getLevelDescription(selectedLevel)}
          </CardDescription>
        </CardHeader>
        {showDetails && (
          <CardContent className="pt-0">
            <LevelDetails level={selectedLevel} />
          </CardContent>
        )}
      </Card>

      {/* Level Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(AUTOMATION_LEVEL_CONFIGS).map((config) => (
          <LevelCard
            key={config.level}
            config={config}
            isSelected={config.level === selectedLevel}
            isRecommended={recommendation.isRecommended(config.level)}
            onClick={() => handleLevelChange(config.level)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Compact Automation Level Selector
 */
function CompactSelector({
  selectedLevel,
  onLevelChange,
  recommendedLevel,
  className,
}: {
  selectedLevel: AutomationLevel;
  onLevelChange: (level: AutomationLevel) => void;
  recommendedLevel: AutomationLevel;
  className?: string;
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Level {selectedLevel}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{AutomationUtils.getLevelDescription(selectedLevel)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            Change
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Automation Level</DialogTitle>
            <DialogDescription>
              Choose how much control you want over your travel planning process.
            </DialogDescription>
          </DialogHeader>
          <AutomationLevelSelector
            currentLevel={selectedLevel}
            onLevelChange={onLevelChange}
            compact={false}
            showDetails={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Individual Level Card Component
 */
function LevelCard({
  config,
  isSelected,
  isRecommended,
  onClick,
}: {
  config: typeof AUTOMATION_LEVEL_CONFIGS[AutomationLevel];
  isSelected: boolean;
  isRecommended: boolean;
  onClick: () => void;
}) {
  const getLevelIcon = (level: AutomationLevel) => {
    const icons = {
      1: <Eye className="h-5 w-5" />,
      2: <CheckCircle className="h-5 w-5" />,
      3: <Clock className="h-5 w-5" />,
      4: <Zap className="h-5 w-5" />,
    };
    return icons[level];
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getLevelIcon(config.level)}
            <CardTitle className="text-sm">{config.name}</CardTitle>
          </div>
          <div className="flex space-x-1">
            {isRecommended && (
              <Badge variant="secondary" className="text-xs">
                Recommended
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              Level {config.level}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          {config.shortDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-muted-foreground">
          {config.userType}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Level Details Component
 */
function LevelDetails({ level }: { level: AutomationLevel }) {
  const config = AUTOMATION_LEVEL_CONFIGS[level];
  
  const getCharacteristicIcon = (key: string) => {
    const icons: Record<string, React.ReactNode> = {
      autoFilter: <Eye className="h-3 w-3" />,
      autoSelect: <CheckCircle className="h-3 w-3" />,
      requireConfirmation: <Clock className="h-3 w-3" />,
      showAllOptions: <User className="h-3 w-3" />,
      autoBook: <ShoppingCart className="h-3 w-3" />,
      waitAtCheckout: <Briefcase className="h-3 w-3" />,
    };
    return icons[key] || <Plane className="h-3 w-3" />;
  };

  const getCharacteristicLabel = (key: string): string => {
    const labels: Record<string, string> = {
      autoFilter: 'Auto Filter Results',
      autoSelect: 'Auto Select Options',
      requireConfirmation: 'Require Confirmation',
      showAllOptions: 'Show All Options',
      autoBook: 'Auto Book',
      waitAtCheckout: 'Wait at Checkout',
    };
    return labels[key] || key;
  };

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium mb-2">What this level does:</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(config.characteristics).map(([key, value]) => (
            <div 
              key={key} 
              className={`flex items-center space-x-2 text-xs p-2 rounded ${
                value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
              }`}
            >
              {getCharacteristicIcon(key)}
              <span>{getCharacteristicLabel(key)}</span>
              <span className="ml-auto">
                {value ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {config.timing.selectionTimeout && (
        <div className="text-xs text-muted-foreground">
          <strong>Auto-advance timer:</strong> {config.timing.selectionTimeout / 1000}s
        </div>
      )}
    </div>
  );
}

/**
 * Quick Automation Level Toggle (for header/nav)
 */
export function QuickAutomationToggle({ className = '' }: { className?: string }) {
  const automation = useAutomationLevel();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`${className}`}
            onClick={() => {
              const nextLevel = (automation.level % 4) + 1 as AutomationLevel;
              automation.setLevel(nextLevel);
            }}
          >
            <Zap className="h-4 w-4 mr-1" />
            L{automation.level}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Automation Level {automation.level}: {automation.config.shortDescription}</p>
          <p className="text-xs text-muted-foreground mt-1">Click to cycle</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default AutomationLevelSelector; 