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
  DollarSign,
  Zap,
  Star,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { useAutomationLevel } from '@/hooks/useAutomationLevel';
import { AutomationUtils, type AutomationLevel, AUTOMATION_PACKAGES } from '@/lib/automation-levels';

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
  const automation = useAutomationLevel();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [tripHistory, setTripHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  if (!user) return null;

  // Get user's display name
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  // Fetch trip history from API
  useEffect(() => {
    const fetchTripHistory = async () => {
      setIsLoadingHistory(true);
      
      try {
        const response = await fetch(`/api/user/history?userId=${user.id}&limit=5`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setTripHistory(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch trip history:', error);
        // Keep empty array as fallback
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchTripHistory();
  }, [user.id]);

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

  const handleAutomationLevelChange = (value: number[]) => {
    const newLevel = value[0] as AutomationLevel;
    automation.setLevel(newLevel);
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
              <Zap className="h-4 w-4" />
              Automation Level
            </Label>
            <Badge variant="outline" className="text-xs">
              Level {automation.level}/4
            </Badge>
          </div>
          
          <div className="space-y-2">
            <Slider
              value={[automation.level]}
              onValueChange={handleAutomationLevelChange}
              max={4}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {automation.config.shortDescription}
            </div>
          </div>
        </div>

        {/* Automation Package Selector */}
        <>
          <Separator />
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Package
              </Label>
              <Badge variant="outline" className="text-xs">
                {automation.automationPackageConfig?.name || 'Experience'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1">
                {Object.values(AUTOMATION_PACKAGES).map((pkg) => (
                  <Button
                    key={pkg.packageType}
                    variant={automation.automationPackage === pkg.packageType ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => automation.setAutomationPackage(pkg.packageType)}
                  >
                    {pkg.packageType === 'budget' && <DollarSign className="h-3 w-3 mr-1" />}
                    {pkg.packageType === 'experience' && <Star className="h-3 w-3 mr-1" />}
                    {pkg.packageType === 'time' && <Clock className="h-3 w-3 mr-1" />}
                    {pkg.packageType === 'custom' && <Settings className="h-3 w-3 mr-1" />}
                    {pkg.name.split(' ')[0]}
                  </Button>
                ))}
              </div>
              <div className="text-xs text-gray-500 text-center">
                {automation.automationPackageConfig?.shortDescription}
              </div>
            </div>
          </div>
        </>

        <Separator />

        {/* Trip History */}
        <div className="p-4 space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Recent Trips
          </Label>
          
          <div className="max-h-48 overflow-y-auto space-y-2">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : tripHistory.length > 0 ? (
              tripHistory.map((trip) => (
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
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No trip history available
              </p>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 