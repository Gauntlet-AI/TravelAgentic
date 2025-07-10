/**
 * User Profile Dropdown Component
 * Displays user profile information and account management options
 * Includes automation slider, payment options, trip history, and sign out
 */

'use client';

import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Sliders,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth/auth-context';

interface UserProfileDropdownProps {
  className?: string;
}

/**
 * User Profile Dropdown Component
 * Shows user info and account management options when authenticated
 */
export function UserProfileDropdown({ className }: UserProfileDropdownProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [automationLevel, setAutomationLevel] = useState([2]); // Default to level 2
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) return null;

  // Get user's display name
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  // Mock trip history data
  const tripHistory = [
    {
      id: 1,
      destination: 'Paris, France',
      dates: 'Mar 15-22, 2024',
      status: 'Completed',
      total: '$2,840'
    },
    {
      id: 2,
      destination: 'Tokyo, Japan',
      dates: 'Jan 10-18, 2024',
      status: 'Completed',
      total: '$3,220'
    },
    {
      id: 3,
      destination: 'Barcelona, Spain',
      dates: 'Dec 20-27, 2023',
      status: 'Completed',
      total: '$1,950'
    },
    {
      id: 4,
      destination: 'Rome, Italy',
      dates: 'Oct 5-12, 2023',
      status: 'Completed',
      total: '$2,100'
    },
    {
      id: 5,
      destination: 'New York, USA',
      dates: 'Aug 20-25, 2023',
      status: 'Completed',
      total: '$1,680'
    }
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // Redirect will be handled by auth context
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getAutomationDescription = (level: number) => {
    switch (level) {
      case 1: return 'No specific filtering, sorted by most likely';
      case 2: return 'Auto-select but require confirmation to move on';
      case 3: return 'One-shot but wait at checkout';
      case 4: return 'One-shot checkout';
      default: return 'Auto-select but require confirmation to move on';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center gap-2 hover:bg-white/10 ${className}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="hidden sm:flex sm:flex-col sm:items-start">
            <span className="text-sm font-medium">{displayName}</span>
            <span className={`text-xs ${className?.includes('text-white') ? 'text-white/70' : 'text-gray-500'}`}>
              {userEmail.length > 20 ? `${userEmail.substring(0, 20)}...` : userEmail}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 ${className?.includes('text-white') ? 'text-white/70' : 'text-gray-400'}`} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0"
        sideOffset={8}
      >
        {/* Header with Action Buttons */}
        <div className="p-4 relative">
          <div className="flex items-center gap-3 pr-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{displayName}</div>
              <div className="text-sm text-gray-500">{userEmail}</div>
              <Badge variant="secondary" className="mt-1 text-xs">
                Premium Member
              </Badge>
            </div>
          </div>
          
          {/* Action Buttons - Top Right */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => router.push('/account')}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Automation Level */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Automation Level
            </Label>
            <Badge variant="outline" className="text-xs">
              Level {automationLevel[0]}/4
            </Badge>
          </div>
          
          <div className="space-y-2">
            <Slider
              value={automationLevel}
              onValueChange={setAutomationLevel}
              max={4}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {getAutomationDescription(automationLevel[0])}
            </div>
          </div>
        </div>

        <Separator />

        {/* Trip History */}
        <div className="p-4 space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Recent Trips
          </Label>
          
          <div className="max-h-48 overflow-y-auto space-y-2">
            {tripHistory.map((trip) => (
              <div key={trip.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{trip.destination}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {trip.dates}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {trip.total.replace('$', '')}
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {trip.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 