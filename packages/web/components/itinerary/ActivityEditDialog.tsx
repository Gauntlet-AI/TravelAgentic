/**
 * Activity Edit Dialog Component
 * Allows users to edit individual items (activities, flights, hotels) in their itinerary
 * Supports removing, moving to another day (activities only), or finding AI-generated replacements
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, MoveHorizontal, Sparkles, Calendar, Clock, MapPin, DollarSign, AlertCircle, CheckCircle, Plane, Hotel, Activity } from 'lucide-react';

interface ActivityEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activity: any;
  currentDayIndex: number;
  totalDays: number;
  tripDetails?: {
    origin: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    travelers: number;
  };
  onRemove: (activityId: string, dayIndex: number) => void;
  onMove: (activityId: string, fromDayIndex: number, toDayIndex: number) => void;
  onReplace: (activityId: string, dayIndex: number, newActivity: any) => void;
}

export function ActivityEditDialog({
  isOpen,
  onClose,
  activity,
  currentDayIndex,
  totalDays,
  tripDetails,
  onRemove,
  onMove,
  onReplace
}: ActivityEditDialogProps) {
  const [selectedAction, setSelectedAction] = useState<'remove' | 'move' | 'replace' | null>(null);
  const [targetDay, setTargetDay] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replacementActivity, setReplacementActivity] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedAction(null);
    setTargetDay(null);
    setIsLoading(false);
    setReplacementActivity(null);
    setError(null);
    onClose();
  };

  const handleRemove = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onRemove(activity.id, currentDayIndex);
      handleClose();
    } catch (err) {
      setError('Failed to remove activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMove = async () => {
    if (targetDay === null) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onMove(activity.id, currentDayIndex, targetDay);
      handleClose();
    } catch (err) {
      setError('Failed to move activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindReplacement = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let apiEndpoint = '/api/activities/search';
      let searchBody = {};
      
      if (activity.type === 'flight') {
        // Parse flight information from title and description
        // Title format: "Flight to Barcelona" or similar
        const destinationMatch = activity.title?.match(/Flight to (.+)/i);
        const destination = destinationMatch ? destinationMatch[1] : activity.location || 'Unknown';
        
        // Use trip details if available, otherwise use defaults
        const currentDay = new Date(tripDetails?.startDate || new Date());
        currentDay.setDate(currentDay.getDate() + currentDayIndex);
        
        apiEndpoint = '/api/flights/search';
        searchBody = {
          origin: tripDetails?.origin || 'AUS',
          destination: destination,
          departureDate: currentDay.toISOString().split('T')[0],
          passengers: { adults: tripDetails?.travelers || 1, children: 0, infants: 0 },
          excludeIds: [activity.id],
          maxResults: 3
        };
      } else if (activity.type === 'hotel') {
        // Parse hotel information from title and location
        // Title format: "Check-in at Business Center Barcelona"
        const hotelLocation = activity.location || tripDetails?.destination || 'Unknown';
        
        // Calculate check-in and check-out dates based on trip dates
        const checkInDate = new Date(tripDetails?.startDate || new Date());
        checkInDate.setDate(checkInDate.getDate() + currentDayIndex);
        const checkOutDate = new Date(tripDetails?.endDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
        
        apiEndpoint = '/api/hotels/search';
        searchBody = {
          destination: hotelLocation,
          checkIn: checkInDate.toISOString().split('T')[0],
          checkOut: checkOutDate.toISOString().split('T')[0],
          guests: tripDetails?.travelers || 2,
          excludeIds: [activity.id],
          maxResults: 3
        };
      } else {
        // Default to activities
        searchBody = {
          destination: activity.location || tripDetails?.destination || 'Unknown',
          preferences: ['culture', 'adventure', 'food'],
          excludeIds: [activity.id],
          maxResults: 1
        };
      }
      
      // Call the appropriate API to find a replacement
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to find replacement ${activity.type || 'activity'}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        const newItem = data.data[0];
        setReplacementActivity(newItem);
      } else {
        setError(`No alternative ${activity.type === 'flight' ? 'flights' : activity.type === 'hotel' ? 'hotels' : 'activities'} found. Please try again later.`);
      }
    } catch (err) {
      setError('Failed to find replacement activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReplacement = async () => {
    if (!replacementActivity) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onReplace(activity.id, currentDayIndex, replacementActivity);
      handleClose();
    } catch (err) {
      setError('Failed to replace activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDayOptions = () => {
    const options = [];
    for (let i = 0; i < totalDays; i++) {
      if (i !== currentDayIndex) {
        options.push(
          <SelectItem key={i} value={i.toString()}>
            Day {i + 1}
          </SelectItem>
        );
      }
    }
    return options;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit {activity.type === 'flight' ? 'Flight' : activity.type === 'hotel' ? 'Hotel' : 'Activity'}</DialogTitle>
          <DialogDescription>
            Choose what you'd like to do with this {activity.type || 'activity'}
          </DialogDescription>
        </DialogHeader>

        {/* Activity Info Card */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                {activity.type === 'flight' ? <Plane className="h-5 w-5" /> : 
                 activity.type === 'hotel' ? <Hotel className="h-5 w-5" /> : 
                 <Activity className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {activity.title || activity.name}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {activity.time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{activity.time}</span>
                    </div>
                  )}
                  {activity.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                  {activity.price && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{activity.price.replace('$', '')}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    Day {currentDayIndex + 1}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {activity.status?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Selection */}
        {!selectedAction && !replacementActivity && (
          <div className="space-y-3">
            {activity.type === 'activity' && (
              <Button
                onClick={() => setSelectedAction('remove')}
                variant="outline"
                className="w-full justify-start text-red-600 hover:bg-red-50 border-red-200"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove from itinerary
              </Button>
            )}
            
            {activity.type === 'activity' && (
              <Button
                onClick={() => setSelectedAction('move')}
                variant="outline"
                className="w-full justify-start"
                disabled={isLoading}
              >
                <MoveHorizontal className="h-4 w-4 mr-2" />
                Move to another day
              </Button>
            )}
            
            <Button
              onClick={() => setSelectedAction('replace')}
              variant="outline"
              className="w-full justify-start text-purple-600 hover:bg-purple-50 border-purple-200"
              disabled={isLoading}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Find alternative {activity.type === 'flight' ? 'flights' : activity.type === 'hotel' ? 'hotels' : 'activities'}
            </Button>
          </div>
        )}

        {/* Remove Confirmation */}
        {selectedAction === 'remove' && (
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Are you sure you want to remove this {activity.type || 'activity'} from your itinerary? This action cannot be undone.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button
                onClick={handleRemove}
                variant="destructive"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  `Remove ${activity.type === 'flight' ? 'Flight' : activity.type === 'hotel' ? 'Hotel' : 'Activity'}`
                )}
              </Button>
              <Button
                onClick={() => setSelectedAction(null)}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Move Day Selection */}
        {selectedAction === 'move' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Move to which day?
              </label>
              <Select onValueChange={(value) => setTargetDay(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {getDayOptions()}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleMove}
                disabled={isLoading || targetDay === null}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Moving...
                  </>
                ) : (
                  'Move Activity'
                )}
              </Button>
              <Button
                onClick={() => setSelectedAction(null)}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Find Replacement */}
        {selectedAction === 'replace' && !replacementActivity && (
          <div className="space-y-4">
            <Alert className="border-purple-200 bg-purple-50">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                Our AI will find {activity.type === 'flight' ? 'alternative flights' : activity.type === 'hotel' ? 'alternative hotels' : 'a new activity'} that matches your preferences and fits your itinerary.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button
                onClick={handleFindReplacement}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Finding...
                  </>
                ) : (
                  `Find New ${activity.type === 'flight' ? 'Flight' : activity.type === 'hotel' ? 'Hotel' : 'Activity'}`
                )}
              </Button>
              <Button
                onClick={() => setSelectedAction(null)}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replacement Activity Preview */}
        {replacementActivity && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Suggested Replacement</h4>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {replacementActivity.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {replacementActivity.shortDescription || replacementActivity.description}
                      </p>
                      <div className="space-y-1 text-sm text-gray-600">
                        {replacementActivity.location?.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{replacementActivity.location.address}</span>
                          </div>
                        )}
                        {replacementActivity.price && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{replacementActivity.price.amount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleConfirmReplacement}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Replacing...
                  </>
                ) : (
                  `Replace ${activity.type === 'flight' ? 'Flight' : activity.type === 'hotel' ? 'Hotel' : 'Activity'}`
                )}
              </Button>
              <Button
                onClick={() => setReplacementActivity(null)}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Try Another
              </Button>
            </div>
          </div>
        )}

        {/* Dialog Actions */}
        {!selectedAction && !replacementActivity && (
          <DialogFooter>
            <Button onClick={handleClose} variant="outline">
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
} 