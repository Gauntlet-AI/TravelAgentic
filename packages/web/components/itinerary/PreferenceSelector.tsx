/**
 * Preference Selector Component
 * Manages multiple PreferenceCard components with selection logic, filtering, and search
 * Provides organized display of activity preferences with category filtering
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Search,
  Filter,
  X,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Clock,
  DollarSign,
  Target
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { sortByConfigJSON } from '@/lib/utils';

import { PreferenceCard, ActivityType } from './PreferenceCard';

interface PreferenceSelectorProps {
  availableActivities?: ActivityType[];
  selectedActivities: ActivityType[];
  onSelectionChange: (selected: ActivityType[]) => void;
  maxSelections?: number;
  minSelections?: number;
  showCategories?: boolean;
  showSearch?: boolean;
  showProgress?: boolean;
  showRecommendations?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

type FilterType = 'all' | 'recommended' | 'popular' | 'free' | 'quick';
type SortType = 'name' | 'popularity' | 'recommendations' | 'cost';

// Remove hardcoded activity types - will be fetched from API
// const defaultActivities: ActivityType[] = []; // Now empty - populated by API call

export function PreferenceSelector({
  availableActivities = [],
  selectedActivities = [],
  onSelectionChange,
  maxSelections = 6,
  minSelections = 2,
  showCategories = true,
  showSearch = true,
  showProgress = true,
  showRecommendations = true,
  variant = 'default',
  className = ''
}: PreferenceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recommendations');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activities, setActivities] = useState<ActivityType[]>(availableActivities);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch activities from API when component mounts
  useEffect(() => {
    const fetchActivities = async () => {
      if (activities.length > 0) return; // Already have data
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/activities/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch activity types');
        }
        
        const result = await response.json();
        if (result.success) {
          setActivities(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch activity types');
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err instanceof Error ? err.message : 'Failed to load activity types');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [activities.length]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(activities.map(a => a.category)));
    return ['all', ...cats];
  }, [activities]);

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === activeCategory);
    }

    // Special filters
    switch (activeFilter) {
      case 'recommended':
        filtered = filtered.filter(activity => (activity.recommendations || 0) >= 10);
        break;
      case 'popular':
        filtered = filtered.filter(activity => (activity.popularity || 0) >= 4);
        break;
      case 'free':
        filtered = filtered.filter(activity => activity.cost === 'free' || activity.cost === 'budget');
        break;
      case 'quick':
        filtered = filtered.filter(activity => activity.duration === 'short');
        break;
    }

    // Sort activities using JSON-based sorting
    const sortConfig = [{
      field: sortBy,
      direction: 'desc' as const,
      type: sortBy === 'name' ? 'string' as const : 'number' as const
    }];
    
    const sortedFiltered = sortByConfigJSON(filtered, sortConfig);

    return sortedFiltered;
  }, [activities, searchQuery, activeCategory, activeFilter, sortBy]);

  // Selection handlers
  const handleSelect = useCallback((activity: ActivityType) => {
    if (selectedActivities.length >= maxSelections) return;
    
    const newSelection = [...selectedActivities, activity];
    onSelectionChange(newSelection);
  }, [selectedActivities, maxSelections, onSelectionChange]);

  const handleDeselect = useCallback((activity: ActivityType) => {
    const newSelection = selectedActivities.filter(a => a.id !== activity.id);
    onSelectionChange(newSelection);
  }, [selectedActivities, onSelectionChange]);

  const isSelected = useCallback((activity: ActivityType) => {
    return selectedActivities.some(a => a.id === activity.id);
  }, [selectedActivities]);

  const canSelect = selectedActivities.length < maxSelections;
  const selectionProgress = (selectedActivities.length / maxSelections) * 100;
  const meetsMinimum = selectedActivities.length >= minSelections;

  // Clear all selections
  const clearSelections = () => {
    onSelectionChange([]);
  };

  // Quick select popular activities
  const selectPopular = () => {
    const popular = availableActivities
      .filter(a => (a.popularity || 0) >= 4)
      .slice(0, maxSelections);
    onSelectionChange(popular);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Select Your Activity Preferences
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose {minSelections}-{maxSelections} activities that interest you most
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectPopular}
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Auto-select Popular
            </Button>
            {selectedActivities.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelections}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {selectedActivities.length} of {maxSelections} selected
              </span>
              <span className={`font-medium ${
                meetsMinimum ? 'text-green-600' : 'text-orange-600'
              }`}>
                {meetsMinimum ? '✓ Ready to continue' : `Select ${minSelections - selectedActivities.length} more`}
              </span>
            </div>
            <Progress 
              value={selectionProgress} 
              className={`h-2 ${meetsMinimum ? 'bg-green-100' : 'bg-orange-100'}`}
            />
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filters:</span>
          {(['all', 'recommended', 'popular', 'free', 'quick'] as FilterType[]).map(filter => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="text-xs"
            >
              {filter === 'all' && 'All'}
              {filter === 'recommended' && (
                <>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Recommended
                </>
              )}
              {filter === 'popular' && 'Popular'}
              {filter === 'free' && (
                <>
                  <DollarSign className="h-3 w-3 mr-1" />
                  Budget-friendly
                </>
              )}
              {filter === 'quick' && (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  Quick
                </>
              )}
            </Button>
          ))}
          
          <div className="ml-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="recommendations">AI Recommendations</option>
              <option value="popularity">Popularity</option>
              <option value="name">Name</option>
              <option value="cost">Cost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories and Activities */}
      {showCategories ? (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category === 'all' ? 'All' : 
                 category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeCategory} className="space-y-4">
            <div className={`grid gap-4 ${
              variant === 'compact' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
              variant === 'detailed' ? 'grid-cols-1 lg:grid-cols-2' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {filteredActivities.map(activity => (
                <PreferenceCard
                  key={activity.id}
                  activityType={activity}
                  isSelected={isSelected(activity)}
                  onSelect={handleSelect}
                  onDeselect={handleDeselect}
                  disabled={!isSelected(activity) && !canSelect}
                  showRecommendations={showRecommendations}
                  variant={variant}
                />
              ))}
            </div>
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No activities found matching your criteria</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                    setActiveCategory('all');
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className={`grid gap-4 ${
          variant === 'compact' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
          variant === 'detailed' ? 'grid-cols-1 lg:grid-cols-2' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredActivities.map(activity => (
            <PreferenceCard
              key={activity.id}
              activityType={activity}
              isSelected={isSelected(activity)}
              onSelect={handleSelect}
              onDeselect={handleDeselect}
              disabled={!isSelected(activity) && !canSelect}
              showRecommendations={showRecommendations}
              variant={variant}
            />
          ))}
        </div>
      )}

      {/* Selection Summary */}
      {selectedActivities.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  Selected Preferences
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedActivities.map(activity => (
                    <Badge
                      key={activity.id}
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-800"
                    >
                      {activity.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {selectedActivities.length}
                </div>
                <div className="text-xs text-blue-600">
                  selected
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 