/**
 * Preference Card Component
 * Displays individual activity preferences with icons, descriptions, and selection states
 * Supports visual feedback and interactive selection for activity types
 */

'use client';

import React from 'react';
import { 
  Mountain,
  Camera,
  UtensilsCrossed,
  TreePine,
  Building2,
  Waves,
  ShoppingBag,
  Music,
  Palette,
  Heart,
  Users,
  Star,
  MapPin,
  Clock,
  Zap,
  CheckCircle2
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ActivityType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'outdoor' | 'cultural' | 'food' | 'entertainment' | 'relaxation' | 'adventure';
  difficulty?: 'easy' | 'moderate' | 'challenging';
  duration?: 'short' | 'medium' | 'long'; // < 2hrs, 2-6hrs, > 6hrs
  cost?: 'free' | 'budget' | 'moderate' | 'expensive';
  popularity?: number; // 1-5 rating
  recommendations?: number; // Number of AI recommendations
}

interface PreferenceCardProps {
  activityType: ActivityType;
  isSelected: boolean;
  onSelect?: (activityType: ActivityType) => void;
  onDeselect?: (activityType: ActivityType) => void;
  disabled?: boolean;
  showRecommendations?: boolean;
  showDetails?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const activityIcons = {
  // Outdoor & Adventure
  hiking: Mountain,
  cycling: Mountain,
  outdoor: TreePine,
  nature: TreePine,
  adventure: Mountain,
  water_sports: Waves,
  
  // Cultural & Educational
  sightseeing: Camera,
  cultural: Building2,
  museums: Building2,
  historical: Building2,
  art: Palette,
  photography: Camera,
  
  // Food & Dining
  food: UtensilsCrossed,
  dining: UtensilsCrossed,
  culinary: UtensilsCrossed,
  wine: UtensilsCrossed,
  
  // Entertainment & Social
  nightlife: Music,
  music: Music,
  entertainment: Music,
  shopping: ShoppingBag,
  social: Users,
  
  // Relaxation & Wellness
  relaxation: Heart,
  wellness: Heart,
  spa: Heart,
  meditation: Heart,
  
  // Default
  default: Star,
};

export function PreferenceCard({
  activityType,
  isSelected,
  onSelect,
  onDeselect,
  disabled = false,
  showRecommendations = true,
  showDetails = true,
  variant = 'default',
  className = ''
}: PreferenceCardProps) {
  const IconComponent = activityIcons[activityType.icon as keyof typeof activityIcons] || activityIcons.default;

  const handleClick = () => {
    if (disabled) return;
    
    if (isSelected) {
      onDeselect?.(activityType);
    } else {
      onSelect?.(activityType);
    }
  };

  const getCategoryColor = () => {
    const colors = {
      outdoor: 'text-green-600 bg-green-100 border-green-200',
      cultural: 'text-purple-600 bg-purple-100 border-purple-200',
      food: 'text-orange-600 bg-orange-100 border-orange-200',
      entertainment: 'text-blue-600 bg-blue-100 border-blue-200',
      relaxation: 'text-pink-600 bg-pink-100 border-pink-200',
      adventure: 'text-red-600 bg-red-100 border-red-200',
    };
    return colors[activityType.category] || colors.outdoor;
  };

  const getDifficultyBadge = () => {
    if (!activityType.difficulty) return null;
    
    const badges = {
      easy: { color: 'bg-green-100 text-green-800', label: 'Easy' },
      moderate: { color: 'bg-yellow-100 text-yellow-800', label: 'Moderate' },
      challenging: { color: 'bg-red-100 text-red-800', label: 'Challenging' }
    };
    
    const badge = badges[activityType.difficulty];
    return (
      <Badge className={`text-xs ${badge.color}`}>
        {badge.label}
      </Badge>
    );
  };

  const getDurationInfo = () => {
    if (!activityType.duration) return null;
    
    const durations = {
      short: { icon: Clock, label: '< 2 hours', color: 'text-gray-600' },
      medium: { icon: Clock, label: '2-6 hours', color: 'text-blue-600' },
      long: { icon: Clock, label: '6+ hours', color: 'text-purple-600' }
    };
    
    const duration = durations[activityType.duration];
    const DurationIcon = duration.icon;
    
    return (
      <div className={`flex items-center gap-1 text-xs ${duration.color}`}>
        <DurationIcon className="h-3 w-3" />
        <span>{duration.label}</span>
      </div>
    );
  };

  const getCostInfo = () => {
    if (!activityType.cost) return null;
    
    const costs = {
      free: { symbol: 'FREE', color: 'text-green-600' },
      budget: { symbol: '$', color: 'text-blue-600' },
      moderate: { symbol: '$$', color: 'text-orange-600' },
      expensive: { symbol: '$$$', color: 'text-red-600' }
    };
    
    const cost = costs[activityType.cost];
    return (
      <span className={`text-xs font-medium ${cost.color}`}>
        {cost.symbol}
      </span>
    );
  };

  const getPopularityStars = () => {
    if (!activityType.popularity) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < activityType.popularity! 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md',
          isSelected 
            ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
            : 'hover:border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={handleClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              getCategoryColor()
            )}>
              <IconComponent className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">
                {activityType.name}
              </h3>
              {showRecommendations && activityType.recommendations && (
                <p className="text-xs text-gray-500">
                  {activityType.recommendations} recommendations
                </p>
              )}
            </div>
            
            {isSelected && (
              <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-lg',
          isSelected 
            ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200 shadow-md' 
            : 'hover:border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  getCategoryColor()
                )}>
                  <IconComponent className="h-6 w-6" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {activityType.name}
                  </h3>
                  <Badge className={`text-xs mt-1 ${getCategoryColor()}`}>
                    {activityType.category}
                  </Badge>
                </div>
              </div>
              
              {isSelected && (
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {activityType.description}
            </p>
            
            {/* Details */}
            <div className="space-y-3">
              {/* Primary Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getDurationInfo()}
                  {getCostInfo()}
                </div>
                {getPopularityStars()}
              </div>
              
              {/* Tags */}
              <div className="flex items-center gap-2">
                {getDifficultyBadge()}
                {showRecommendations && activityType.recommendations && (
                  <Badge variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    {activityType.recommendations} AI picks
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
          : 'hover:border-gray-300',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                getCategoryColor()
              )}>
                <IconComponent className="h-5 w-5" />
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">
                  {activityType.name}
                </h3>
                {showDetails && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activityType.category}
                  </p>
                )}
              </div>
            </div>
            
            {isSelected && (
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            )}
          </div>
          
          {/* Description */}
          {showDetails && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {activityType.description}
            </p>
          )}
          
          {/* Details Row */}
          {showDetails && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getDurationInfo()}
                {getCostInfo()}
              </div>
              
              <div className="flex items-center gap-2">
                {getDifficultyBadge()}
                {showRecommendations && activityType.recommendations && (
                  <Badge variant="outline" className="text-xs">
                    {activityType.recommendations}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 