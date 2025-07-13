'use client';

import { useState } from 'react';
import { TravelDatePicker, DateRange, useTravelDatePicker, getDaysBetween, formatDateRange } from './travel-date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Example component demonstrating how to use the TravelDatePicker
 * Shows both controlled and hook-based usage patterns
 */
export function TravelDatePickerExample() {
  // Controlled usage
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined
  });

  // Hook-based usage
  const datePicker = useTravelDatePicker();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Travel Date Picker Demo</CardTitle>
          <p className="text-sm text-gray-600">
            Interactive date range picker with travel-specific features
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Mobile Style (1 month) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mobile Style (Single Month)</h3>
            <div className="max-w-sm">
              <TravelDatePicker
                value={dateRange}
                onValueChange={setDateRange}
                label="Travel Dates"
                placeholder="Select your travel dates"
                numberOfMonths={1}
              />
            </div>
          </div>

          {/* Desktop Style (2 months) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Desktop Style (Two Months)</h3>
            <div className="max-w-md">
              <TravelDatePicker
                value={datePicker.dateRange}
                onValueChange={datePicker.setDateRange}
                label="Travel Dates"
                placeholder="Choose departure and return dates"
                numberOfMonths={2}
                buttonClassName="h-12"
              />
            </div>
          </div>

          {/* Without Label */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Compact Version (No Label)</h3>
            <div className="max-w-sm">
              <TravelDatePicker
                value={dateRange}
                onValueChange={setDateRange}
                placeholder="When would you like to travel?"
                numberOfMonths={1}
              />
            </div>
          </div>

          {/* Results Display */}
          {(dateRange.startDate || datePicker.dateRange.startDate) && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Selected Dates:</h3>
              
              {/* Controlled component results */}
              {dateRange.startDate && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Controlled Component:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div><strong>Start Date:</strong> {dateRange.startDate.toLocaleDateString()}</div>
                    {dateRange.endDate && (
                      <>
                        <div><strong>End Date:</strong> {dateRange.endDate.toLocaleDateString()}</div>
                        <div><strong>Duration:</strong> {getDaysBetween(dateRange.startDate, dateRange.endDate)} days</div>
                        <div><strong>Formatted:</strong> {formatDateRange(dateRange.startDate, dateRange.endDate, { compact: true })}</div>
                      </>
                    )}
                    <div><strong>Complete:</strong> {dateRange.startDate && dateRange.endDate ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}

              {/* Hook-based component results */}
              {datePicker.dateRange.startDate && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Hook-based Component:</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <div><strong>Start Date:</strong> {datePicker.dateRange.startDate.toLocaleDateString()}</div>
                    {datePicker.dateRange.endDate && (
                      <>
                        <div><strong>End Date:</strong> {datePicker.dateRange.endDate.toLocaleDateString()}</div>
                        <div><strong>Duration:</strong> {getDaysBetween(datePicker.dateRange.startDate, datePicker.dateRange.endDate)} days</div>
                        <div><strong>Formatted:</strong> {formatDateRange(datePicker.dateRange.startDate, datePicker.dateRange.endDate, { includeYear: true })}</div>
                      </>
                    )}
                    <div><strong>Complete:</strong> {datePicker.isComplete ? 'Yes' : 'No'}</div>
                    {datePicker.isComplete && (
                      <div className="mt-2">
                        <strong>Ordered Dates:</strong>
                        <div className="ml-2">
                          Start: {datePicker.getOrderedDates().startDate?.toLocaleDateString()}<br/>
                          End: {datePicker.getOrderedDates().endDate?.toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => datePicker.setStartDate(new Date())}
                    >
                      Set Start to Today
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 7);
                        datePicker.setEndDate(tomorrow);
                      }}
                    >
                      Set End to +7 Days
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={datePicker.reset}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feature Overview */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-lg font-semibold">Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Three-Click Behavior:</strong>
                <ul className="list-disc list-inside text-gray-600 mt-1">
                  <li>First click: Select start date</li>
                  <li>Second click: Select end date</li>
                  <li>Third click: Reset start date</li>
                </ul>
              </div>
              <div>
                <strong>Smart Features:</strong>
                <ul className="list-disc list-inside text-gray-600 mt-1">
                  <li>Hover preview for date ranges</li>
                  <li>Past dates automatically disabled</li>
                  <li>Mobile/desktop responsive formatting</li>
                  <li>Proper range styling</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-lg font-semibold">Usage Examples:</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono">
              <div className="space-y-2">
                <div><strong>Basic Usage:</strong></div>
                <div className="text-gray-700 ml-2">
                  {`<TravelDatePicker`}<br/>
                  {`  value={dateRange}`}<br/>
                  {`  onValueChange={setDateRange}`}<br/>
                  {`  numberOfMonths={2}`}<br/>
                  {`/>`}
                </div>
                
                <div className="pt-2"><strong>With Hook:</strong></div>
                <div className="text-gray-700 ml-2">
                  {`const datePicker = useTravelDatePicker();`}<br/>
                  {`// Access: datePicker.dateRange, datePicker.isComplete, etc.`}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 