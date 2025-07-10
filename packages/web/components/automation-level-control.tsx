'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw,
  User,
  Bot,
  Sparkles,
  AlertCircle,
  Check
} from 'lucide-react';

interface AutomationLevelControlProps {
  currentLevel?: number;
  isActive?: boolean;
  progress?: number;
  currentTask?: string;
  onLevelChange?: (level: number) => void;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  className?: string;
}

const AUTOMATION_LEVELS = {
  1: {
    name: 'Manual Control',
    description: 'You control every decision. AI provides suggestions.',
    icon: User,
    color: 'blue',
    userControl: '100%',
    features: [
      'AI suggests options',
      'User selects everything',
      'Step-by-step approval',
      'Maximum customization'
    ]
  },
  2: {
    name: 'Guided Assistance', 
    description: 'AI handles routine tasks, asks for preferences.',
    icon: Settings,
    color: 'green',
    userControl: '70%',
    features: [
      'AI filters options',
      'User approves selections',
      'Smart recommendations',
      'Preference learning'
    ]
  },
  3: {
    name: 'Smart Automation',
    description: 'AI makes most decisions, user can override.',
    icon: Bot,
    color: 'orange',
    userControl: '30%',
    features: [
      'AI makes decisions',
      'User can intervene',
      'Context-aware choices',
      'Minimal user input'
    ]
  },
  4: {
    name: 'Full Automation',
    description: 'AI handles everything. "I\'m Feeling Lucky" mode.',
    icon: Sparkles,
    color: 'purple',
    userControl: '10%',
    features: [
      'Complete automation',
      'AI optimizes everything',
      'Minimal interruptions',
      'Surprise & delight'
    ]
  }
};

export default function AutomationLevelControl({
  currentLevel = 1,
  isActive = false,
  progress = 0,
  currentTask = '',
  onLevelChange,
  onStart,
  onPause,
  onResume,
  onReset,
  className = ''
}: AutomationLevelControlProps) {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);

  const currentLevelData = AUTOMATION_LEVELS[selectedLevel as keyof typeof AUTOMATION_LEVELS];
  const IconComponent = currentLevelData.icon;

  const handleLevelChange = (level: number) => {
    setSelectedLevel(level);
    onLevelChange?.(level);
  };

  const handleStart = () => {
    onStart?.();
  };

  const handlePause = () => {
    onPause?.();
  };

  const handleReset = () => {
    setSelectedLevel(1);
    onReset?.();
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Control Level</span>
              <Badge 
                variant="outline" 
                className={getColorClasses(currentLevelData.color)}
              >
                Level {selectedLevel}
              </Badge>
            </div>
            
            <Slider
              value={[selectedLevel]}
              onValueChange={([value]) => handleLevelChange(value)}
              min={1}
              max={4}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Manual</span>
              <span>Guided</span>
              <span>Smart</span>
              <span>Auto</span>
            </div>
          </div>

          {/* Current Level Info */}
          <div className={`p-4 rounded-lg border ${getColorClasses(currentLevelData.color)}`}>
            <div className="flex items-center gap-3 mb-3">
              <IconComponent className="h-6 w-6" />
              <div>
                <h4 className="font-medium">{currentLevelData.name}</h4>
                <p className="text-sm opacity-80">{currentLevelData.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">User Control:</span>
                <div className="mt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/50 rounded-full h-2">
                      <div 
                        className="bg-current h-2 rounded-full transition-all duration-300"
                        style={{ width: currentLevelData.userControl }}
                      />
                    </div>
                    <span className="text-xs">{currentLevelData.userControl}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Features:</span>
                <ul className="mt-1 text-xs space-y-1">
                  {currentLevelData.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-current rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium">
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {selectedLevel === 4 && (
              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                <Sparkles className="h-3 w-3 mr-1" />
                I'm Feeling Lucky
              </Badge>
            )}
          </div>

          {/* Progress */}
          {isActive && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {currentTask && (
                <p className="text-sm text-gray-600">{currentTask}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isActive ? (
              <Button 
                onClick={handleStart}
                className="flex-1"
                disabled={selectedLevel < 1}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Level {selectedLevel}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handlePause}
                  variant="outline"
                  className="flex-1"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button 
                  onClick={handleReset}
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Level 4 Special Button */}
          {selectedLevel === 4 && !isActive && (
            <Button 
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              I'm Feeling Lucky!
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Level Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Level Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(AUTOMATION_LEVELS).map(([level, data]) => {
              const LevelIcon = data.icon;
              const isSelected = parseInt(level) === selectedLevel;
              
              return (
                <button
                  key={level}
                  onClick={() => handleLevelChange(parseInt(level))}
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected 
                      ? `${getColorClasses(data.color)} ring-2 ring-offset-2` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <LevelIcon className="h-5 w-5 mb-2 mx-auto" />
                  <div className="text-xs font-medium">{data.name}</div>
                  <div className="text-xs opacity-70 mt-1">{data.userControl} control</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>


    </div>
  );
} 