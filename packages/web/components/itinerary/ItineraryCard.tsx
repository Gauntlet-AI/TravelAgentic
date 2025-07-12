/**
 * Itinerary Card Component
 * Displays individual itinerary items with comprehensive details and interactive features
 * Supports all item types: flights, hotels, activities, restaurants, and transport
 */

'use client';

import React, { useState } from 'react';
import { 
  Plane,
  Hotel,
  Activity,
  UtensilsCrossed,
  Car,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Star,
  Calendar,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  ExternalLink,
  Info
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import { ItineraryItem } from '@/contexts/ItineraryContext';

interface ItineraryCardProps {
  item: ItineraryItem;
  dayIndex?: number;
  onEdit?: (item: ItineraryItem) => void;
  onRemove?: (itemId: string) => void;
  onSelect?: (item: ItineraryItem) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function ItineraryCard({
  item,
  dayIndex,
  onEdit,
  onRemove,
  onSelect,
  showActions = true,
  compact = false,
  className = ''
}: ItineraryCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getTypeIcon = () => {
    const iconClass = "h-5 w-5";
    switch (item.type) {
      case 'flight':
        return <Plane className={iconClass} />;
      case 'hotel':
        return <Hotel className={iconClass} />;
      case 'activity':
        return <Activity className={iconClass} />;
      case 'restaurant':
        return <UtensilsCrossed className={iconClass} />;
      case 'transport':
        return <Car className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'flight':
        return 'text-blue-600 bg-blue-100';
      case 'hotel':
        return 'text-purple-600 bg-purple-100';
      case 'activity':
        return 'text-green-600 bg-green-100';
      case 'restaurant':
        return 'text-orange-600 bg-orange-100';
      case 'transport':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = () => {
    const badges = {
      suggested: { color: 'bg-blue-100 text-blue-800', label: 'Suggested' },
      selected: { color: 'bg-green-100 text-green-800', label: 'Selected' },
      booked: { color: 'bg-purple-100 text-purple-800', label: 'Booked' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const badge = badges[item.status];
    return (
      <Badge className={`text-xs ${badge.color}`}>
        {item.status === 'booked' && <CheckCircle className="h-3 w-3 mr-1" />}
        {item.status === 'cancelled' && <AlertCircle className="h-3 w-3 mr-1" />}
        {badge.label}
      </Badge>
    );
  };

  const getSourceBadge = () => {
    const sources = {
      ai: { color: 'bg-purple-100 text-purple-700', label: 'AI Generated', icon: '🤖' },
      user: { color: 'bg-blue-100 text-blue-700', label: 'User Added', icon: '👤' },
      api: { color: 'bg-green-100 text-green-700', label: 'API Source', icon: '🔗' }
    };
    
    const source = sources[item.source];
    return (
      <Badge variant="outline" className={`text-xs ${source.color}`}>
        {source.icon} {source.label}
      </Badge>
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDuration = () => {
    if (item.startTime && item.endTime) {
      const duration = item.endTime.getTime() - item.startTime.getTime();
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }
    return null;
  };

  const getSpecificDetails = () => {
    if (!item.metadata) return null;

    switch (item.type) {
      case 'flight':
        return (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {item.metadata.airline && (
              <span>✈️ {item.metadata.airline}</span>
            )}
            {item.metadata.flightNumber && (
              <span>#{item.metadata.flightNumber}</span>
            )}
            {item.metadata.aircraft && (
              <span>🛩️ {item.metadata.aircraft}</span>
            )}
            {item.metadata.terminal && (
              <span>🏢 Terminal {item.metadata.terminal}</span>
            )}
          </div>
        );
      
      case 'hotel':
        return (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {item.metadata.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{item.metadata.rating}</span>
              </div>
            )}
            {item.metadata.roomType && (
              <span>🛏️ {item.metadata.roomType}</span>
            )}
            {item.metadata.amenities && (
              <span>🏊 {item.metadata.amenities.length} amenities</span>
            )}
          </div>
        );
      
      case 'activity':
        return (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {item.metadata.category && (
              <span>🎯 {item.metadata.category}</span>
            )}
            {item.metadata.difficulty && (
              <span>📊 {item.metadata.difficulty}</span>
            )}
            {item.metadata.groupSize && (
              <span>👥 Max {item.metadata.groupSize}</span>
            )}
          </div>
        );
      
      case 'restaurant':
        return (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {item.metadata.cuisine && (
              <span>🍽️ {item.metadata.cuisine}</span>
            )}
            {item.metadata.priceRange && (
              <span>💰 {item.metadata.priceRange}</span>
            )}
            {item.metadata.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{item.metadata.rating}</span>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      item.status === 'selected' ? 'ring-2 ring-blue-500' : ''
    } ${className}`}>
      <CardHeader className={compact ? 'p-4 pb-2' : 'p-6 pb-3'}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Type Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor()}`}>
              {getTypeIcon()}
            </div>
            
            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {item.name}
                </h3>
                {getStatusBadge()}
              </div>
              
              {item.description && !compact && (
                <p className="text-sm text-gray-600 mb-2">
                  {item.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {item.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>
                )}
                
                {item.startTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(item.startTime)}</span>
                    {item.endTime && (
                      <span> - {formatTime(item.endTime)}</span>
                    )}
                  </div>
                )}
                
                {getDuration() && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {getDuration()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Price */}
          {item.price && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
                <DollarSign className="h-4 w-4" />
                <span>{item.price}</span>
              </div>
              {item.currency && item.currency !== 'USD' && (
                <span className="text-xs text-gray-500">{item.currency}</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'p-4 pt-0' : 'p-6 pt-0'}>
        {/* Specific Details */}
        {!compact && getSpecificDetails()}
        
        {/* Source Badge */}
        {!compact && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {getSourceBadge()}
              {dayIndex !== undefined && (
                <Badge variant="outline" className="text-xs">
                  Day {dayIndex + 1}
                </Badge>
              )}
            </div>
            
            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-2">
                {showDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                )}
                
                {onSelect && item.status === 'suggested' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(item)}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    Select
                  </Button>
                )}
                
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                
                {onRemove && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Extended Details */}
        {showDetails && item.metadata && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Additional Details</h4>
            <div className="space-y-1 text-xs text-gray-600">
              {Object.entries(item.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Compact Actions */}
        {compact && showActions && (
          <div className="flex items-center justify-end gap-2 mt-2">
            {onSelect && item.status === 'suggested' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(item)}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                Select
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 