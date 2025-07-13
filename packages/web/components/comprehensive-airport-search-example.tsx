'use client';

import { useState } from 'react';
import { ComprehensiveAirportSearch, AirportData } from './comprehensive-airport-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example component demonstrating how to use the ComprehensiveAirportSearch
 * This component shows the comprehensive airport search with state mapping functionality
 */
export function ComprehensiveAirportSearchExample() {
  const [departureLocation, setDepartureLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDeparture, setSelectedDeparture] = useState<AirportData | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<AirportData | null>(null);

  const handleDepartureSelect = (airport: AirportData) => {
    setSelectedDeparture(airport);
    console.log('Selected departure:', airport);
  };

  const handleDestinationSelect = (airport: AirportData) => {
    setSelectedDestination(airport);
    console.log('Selected destination:', airport);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Airport Search Demo</CardTitle>
          <p className="text-sm text-gray-600">
            Try searching for "Hawaii", "HI", "Honolulu", "HNL", or any other state/airport!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Departure Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Departure Location</label>
            <ComprehensiveAirportSearch
              value={departureLocation}
              onValueChange={setDepartureLocation}
              onSelectAirport={handleDepartureSelect}
              placeholder="Try: Hawaii, HI, Honolulu, HNL, California..."
            />
          </div>

          {/* Destination Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination</label>
            <ComprehensiveAirportSearch
              value={destination}
              onValueChange={setDestination}
              onSelectAirport={handleDestinationSelect}
              placeholder="Try: New York, NY, Tokyo, NRT, Germany..."
            />
          </div>

          {/* Selection Details */}
          {(selectedDeparture || selectedDestination) && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Selected Airports:</h3>
              
              {selectedDeparture && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900">Departure:</h4>
                  <div className="text-sm text-blue-800">
                    <div><strong>Display:</strong> {selectedDeparture.displayLocation}</div>
                    <div><strong>IATA:</strong> {selectedDeparture.iata}</div>
                    <div><strong>ICAO:</strong> {selectedDeparture.icao}</div>
                    <div><strong>Name:</strong> {selectedDeparture.name}</div>
                    <div><strong>City:</strong> {selectedDeparture.city}</div>
                    <div><strong>Country:</strong> {selectedDeparture.country}</div>
                    {selectedDeparture.state && <div><strong>State:</strong> {selectedDeparture.state}</div>}
                  </div>
                </div>
              )}

              {selectedDestination && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-medium text-green-900">Destination:</h4>
                  <div className="text-sm text-green-800">
                    <div><strong>Display:</strong> {selectedDestination.displayLocation}</div>
                    <div><strong>IATA:</strong> {selectedDestination.iata}</div>
                    <div><strong>ICAO:</strong> {selectedDestination.icao}</div>
                    <div><strong>Name:</strong> {selectedDestination.name}</div>
                    <div><strong>City:</strong> {selectedDestination.city}</div>
                    <div><strong>Country:</strong> {selectedDestination.country}</div>
                    {selectedDestination.state && <div><strong>State:</strong> {selectedDestination.state}</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Usage Examples */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-lg font-semibold">Try These Searches:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <strong>State Searches:</strong>
                <ul className="list-disc list-inside text-gray-600 mt-1">
                  <li>Hawaii / HI</li>
                  <li>California / CA</li>
                  <li>New York / NY</li>
                  <li>Texas / TX</li>
                </ul>
              </div>
              <div>
                <strong>International:</strong>
                <ul className="list-disc list-inside text-gray-600 mt-1">
                  <li>London / LHR</li>
                  <li>Tokyo / NRT</li>
                  <li>Paris / CDG</li>
                  <li>Toronto / YYZ</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 