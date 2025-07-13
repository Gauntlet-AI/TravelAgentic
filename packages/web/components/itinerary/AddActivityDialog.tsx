/**
 * Add Activity Dialog Component
 * Allows users to search for and add new activities to their itinerary
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, MapPin, DollarSign, Clock, CheckCircle, Activity, Info } from 'lucide-react';

interface AddActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dayIndex: number;
  tripDetails?: {
    destination: string;
    startDate: Date;
    endDate: Date;
  };
  onAdd: (dayIndex: number, activity: any) => void;
}

export function AddActivityDialog({
  isOpen,
  onClose,
  dayIndex,
  tripDetails,
  onAdd
}: AddActivityDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedActivity(null);
    setError(null);
    onClose();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch('/api/activities/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: tripDetails?.destination || searchQuery,
          query: searchQuery,
          preferences: ['culture', 'adventure', 'food', 'nature'],
          maxResults: 5
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search activities');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setSearchResults(data.data);
        if (data.data.length === 0) {
          setError('No activities found. Try a different search term.');
        }
      } else {
        setError('No activities found. Please try again.');
      }
    } catch (err) {
      setError('Failed to search activities. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddActivity = () => {
    if (!selectedActivity) return;
    
    // Add proper timing to the activity
    const currentDay = new Date(tripDetails?.startDate || new Date());
    currentDay.setDate(currentDay.getDate() + dayIndex);
    
    const activityWithTiming = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'activity' as const,
      name: selectedActivity.name,
      description: selectedActivity.shortDescription || selectedActivity.description,
      startTime: currentDay,
      endTime: new Date(currentDay.getTime() + 3 * 60 * 60 * 1000),
      location: selectedActivity.location?.address || selectedActivity.location || '',
      price: selectedActivity.price?.amount || 0,
      currency: selectedActivity.price?.currency || 'USD',
      status: 'suggested' as const,
      source: 'user' as const,
      metadata: selectedActivity
    };
    
    onAdd(dayIndex, activityWithTiming);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Activity to Day {dayIndex + 1}</DialogTitle>
          <DialogDescription>
            Search for activities to add to your itinerary
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={`Search activities in ${tripDetails?.destination || 'your destination'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <Info className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Search Results</h4>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {searchResults.map((activity) => (
                    <Card 
                      key={activity.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedActivity?.id === activity.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedActivity(activity)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {activity.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {activity.shortDescription || activity.description}
                            </p>
                            <div className="flex flex-wrap gap-2 text-sm">
                              {activity.location?.address && (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  <span>{activity.location.address}</span>
                                </div>
                              )}
                              {activity.duration && (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{activity.duration.value} {activity.duration.unit}</span>
                                </div>
                              )}
                              {activity.price && (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{activity.price.amount}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedActivity?.id === activity.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* No search yet message */}
          {!isSearching && searchResults.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Search for activities to add to your day</p>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handleAddActivity} 
            disabled={!selectedActivity}
          >
            Add Activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 