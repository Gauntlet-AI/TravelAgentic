/**
 * Example of using AutomationPackageSelector with all automation levels
 * This component demonstrates the correct way to use automation packages
 */

'use client';

import React from 'react';
import { AutomationPackageSelector, QuickAutomationPackageToggle } from '@/components/automation-package-selector';
import { useAutomationLevel } from '@/hooks/useAutomationLevel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * Example component showing proper automation package usage
 */
export function AutomationPackageExample() {
  const automation = useAutomationLevel();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Automation Settings</CardTitle>
          <CardDescription>
            Your current automation level and package preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Automation Level</div>
              <div className="text-sm text-muted-foreground">
                Level {automation.level} - {automation.config.name}
              </div>
            </div>
            <Badge variant="outline">
              {automation.config.shortDescription}
            </Badge>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Package Selection</div>
              <div className="text-sm text-muted-foreground">
                {automation.automationPackageConfig?.name} - {automation.automationPackageConfig?.focusArea}
              </div>
            </div>
            <QuickAutomationPackageToggle />
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Auto-Select</div>
              <div className="text-muted-foreground">
                {automation.shouldAutoSelect ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div>
              <div className="font-medium">Confirmation</div>
              <div className="text-muted-foreground">
                {automation.requiresConfirmation ? 'Required' : 'Not Required'}
              </div>
            </div>
            <div>
              <div className="font-medium">Auto-Book</div>
              <div className="text-muted-foreground">
                {automation.shouldAutoBook ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Selector - Works with ALL automation levels */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Automation Package</CardTitle>
          <CardDescription>
            These packages work with all automation levels (1-4) and affect how AI prioritizes your travel planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutomationPackageSelector 
            layout="cards" 
            showDetails={true}
            showLevelSlider={true}
            onPackageChange={(packageType) => {
              console.log('Package changed to:', packageType);
            }}
          />
        </CardContent>
      </Card>

      {/* Live Demo - Level Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Live Demo: Packages Work With All Levels</CardTitle>
          <CardDescription>
            Change your automation level and see how packages adapt their behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level Demonstration */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((level) => (
              <Card 
                key={level} 
                className={`cursor-pointer transition-all ${
                  automation.level === level 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => automation.setLevel(level as 1 | 2 | 3 | 4)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Level {level}</CardTitle>
                  <CardDescription className="text-xs">
                    {level === 1 && 'Manual Control'}
                    {level === 2 && 'Assisted Selection'}
                    {level === 3 && 'Smart Automation'}
                    {level === 4 && 'Full Automation'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Auto-Select:</span>
                      <span className={level >= 2 ? 'text-green-600' : 'text-red-600'}>
                        {level >= 2 ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confirmation:</span>
                      <span className={level <= 2 ? 'text-green-600' : 'text-red-600'}>
                        {level <= 2 ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-Book:</span>
                      <span className={level === 4 ? 'text-green-600' : 'text-red-600'}>
                        {level === 4 ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                      <strong>Package Effect:</strong>
                      <br />
                      {automation.automationPackageConfig?.name} affects{' '}
                      {level === 1 && 'option sorting'}
                      {level === 2 && 'AI suggestions'}
                      {level === 3 && 'automated choices'}
                      {level === 4 && 'booking decisions'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Current Package Behavior */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-medium mb-2">
              Current Setup: Level {automation.level} + {automation.automationPackageConfig?.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {automation.level === 1 && automation.automationPackageConfig?.name === 'Budget Smart' && 
                "Shows all flight options sorted by price (cheapest first). You choose manually."}
              {automation.level === 2 && automation.automationPackageConfig?.name === 'Budget Smart' && 
                "AI pre-selects the best budget option for your approval before proceeding."}
              {automation.level === 3 && automation.automationPackageConfig?.name === 'Budget Smart' && 
                "AI automatically chooses budget options, shows you the complete itinerary for final review."}
              {automation.level === 4 && automation.automationPackageConfig?.name === 'Budget Smart' && 
                "AI instantly books the best budget deals without any confirmation needed."}
              
              {automation.level === 1 && automation.automationPackageConfig?.name === 'Experience Smart' && 
                "Shows all options sorted by rating and uniqueness. You choose what appeals to you."}
              {automation.level === 2 && automation.automationPackageConfig?.name === 'Experience Smart' && 
                "AI pre-selects unique, highly-rated experiences for your approval."}
              {automation.level === 3 && automation.automationPackageConfig?.name === 'Experience Smart' && 
                "AI automatically curates memorable experiences, shows complete itinerary for review."}
              {automation.level === 4 && automation.automationPackageConfig?.name === 'Experience Smart' && 
                "AI instantly books unique, premium experiences without confirmation."}
              
              {automation.level === 1 && automation.automationPackageConfig?.name === 'Time Smart' && 
                "Shows all options sorted by convenience and speed. You choose the most efficient."}
              {automation.level === 2 && automation.automationPackageConfig?.name === 'Time Smart' && 
                "AI pre-selects the most time-efficient options for your approval."}
              {automation.level === 3 && automation.automationPackageConfig?.name === 'Time Smart' && 
                "AI automatically chooses fastest, most convenient options for final review."}
              {automation.level === 4 && automation.automationPackageConfig?.name === 'Time Smart' && 
                "AI instantly books the most efficient travel options available."}
              
              {automation.automationPackageConfig?.name === 'Custom Smart' && 
                `AI applies your custom preferences (configured separately) at Level ${automation.level} behavior.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Packages Now Work With ALL Automation Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">What Changed:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Packages work with Levels 1, 2, 3, and 4</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>No more "Level 3 only" restrictions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Package preferences persist across level changes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Consistent AI behavior at every automation level</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">How It Works:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-green-600">Level 1:</span>
                  <span>Package affects option sorting and filtering</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">Level 2:</span>
                  <span>Package guides AI suggestions for approval</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-purple-600">Level 3:</span>
                  <span>Package drives automated selections for review</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-orange-600">Level 4:</span>
                  <span>Package controls fully automated booking decisions</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AutomationPackageExample; 