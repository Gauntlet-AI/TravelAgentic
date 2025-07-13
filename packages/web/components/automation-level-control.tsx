'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  Eye, 
  CheckCircle, 
  Zap, 
  Settings, 
  Pause, 
  Play,
  RotateCcw,
  Info,
  Loader2
} from 'lucide-react';

import { 
  getAutomationLevelDescription
} from '@/lib/langgraph-service';
import { 
  useAutomationControls 
} from '@/hooks/use-langgraph-conversation';

interface AutomationLevelControlProps {
  conversationId?: string | null;
  currentLevel?: number;
  onLevelChange?: (level: number) => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  isPaused?: boolean;
  isActive?: boolean;
  className?: string;
}

const AUTOMATION_LEVELS = [
  {
    level: 1,
    name: "Present Options",
    description: "AI shows all options, you choose everything",
    icon: Eye,
    color: "bg-blue-500",
    features: ["Manual selection", "Full control", "All options shown"]
  },
  {
    level: 2,
    name: "Recommend Best",
    description: "AI preselects best option, you approve each choice",
    icon: CheckCircle,
    color: "bg-green-500",
    features: ["AI recommendations", "User approval", "Best options highlighted"]
  },
  {
    level: 3,
    name: "Auto-select with Review",
    description: "AI chooses everything, you review before booking",
    icon: Sparkles,
    color: "bg-purple-500",
    features: ["Auto selection", "Review before booking", "Comprehensive planning"]
  },
  {
    level: 4,
    name: "I'm Feeling Lucky",
    description: "Full automation with real-time updates",
    icon: Zap,
    color: "bg-orange-500",
    features: ["Full automation", "Real-time updates", "Instant booking"]
  }
];

export default function AutomationLevelControl({
  conversationId,
  currentLevel = 1,
  onLevelChange,
  onPause,
  onResume,
  onReset,
  isPaused = false,
  isActive = false,
  className = ''
}: AutomationLevelControlProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Use automation controls hook if conversation ID is available
  const { 
    automationLevel, 
    isChanging, 
    changeLevel 
  } = useAutomationControls(conversationId || null, currentLevel);

  // Use local level if no conversation, otherwise use hook level
  const displayLevel = conversationId ? automationLevel : currentLevel;

  const handleLevelChange = async (newLevel: number) => {
    if (conversationId) {
      try {
        await changeLevel(newLevel);
        onLevelChange?.(newLevel);
      } catch (error) {
        console.error('Failed to change automation level:', error);
      }
    } else {
      onLevelChange?.(newLevel);
    }
  };

  const getCurrentLevelInfo = () => {
    return AUTOMATION_LEVELS.find(level => level.level === displayLevel) || AUTOMATION_LEVELS[0];
  };

  const currentLevelInfo = getCurrentLevelInfo();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Control Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Automation Level
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Badge 
                className={`${currentLevelInfo.color} text-white`}
                variant="default"
              >
                Level {displayLevel}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Level Display */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-full ${currentLevelInfo.color}`}>
              <currentLevelInfo.icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{currentLevelInfo.name}</h3>
              <p className="text-sm text-gray-600">{currentLevelInfo.description}</p>
            </div>
          </div>

          {/* Level Slider */}
          <div className="space-y-3">
            <Label>Automation Level: {displayLevel}</Label>
            <Slider
              value={[displayLevel]}
              onValueChange={(value) => handleLevelChange(value[0])}
              min={1}
              max={4}
              step={1}
              className="w-full"
              disabled={isChanging || !conversationId}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Manual</span>
              <span>Automated</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {isActive && !isPaused && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPause}
                  disabled={!conversationId}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              
              {isPaused && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResume}
                  disabled={!conversationId}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                disabled={!conversationId}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {isChanging && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              )}
              
              <Badge variant={isActive ? "default" : "outline"}>
                {isActive ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Active
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Connection Status */}
          {!conversationId && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                ⚠️ Start planning to enable automation controls
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Information */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Automation Levels Explained</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {AUTOMATION_LEVELS.map((level) => (
                <div
                  key={level.level}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    displayLevel === level.level
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${level.color}`}>
                      <level.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">Level {level.level}: {level.name}</h4>
                        {displayLevel === level.level && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{level.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {level.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Start with Level 1 to understand how the AI works</li>
                <li>• Level 2 is great for getting recommendations while staying in control</li>
                <li>• Level 3 saves time while letting you review everything</li>
                <li>• Level 4 is perfect when you trust the AI completely</li>
                <li>• You can change the level anytime during planning</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 