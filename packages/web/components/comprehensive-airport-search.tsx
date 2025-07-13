'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';

// Import openflights-cached for comprehensive airport data
const openflights = require('openflights-cached');

// Type definition for airport data
export interface AirportData {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  state?: string;
  displayLocation: string; // Formatted display string
}

// US State mapping for major airports (IATA code -> state abbreviation)
const US_AIRPORT_STATES: Record<string, string> = {
  // Major US airports by state
  'ATL': 'GA', 'VLD': 'GA', 'CSG': 'GA',
  'LAX': 'CA', 'SFO': 'CA', 'SAN': 'CA', 'SMF': 'CA', 'SJC': 'CA', 'BUR': 'CA', 'LGB': 'CA', 'OAK': 'CA', 'ONT': 'CA', 'PSP': 'CA', 'FAT': 'CA',
  'ORD': 'IL', 'MDW': 'IL', 'RFD': 'IL',
  'DFW': 'TX', 'IAH': 'TX', 'HOU': 'TX', 'AUS': 'TX', 'SAT': 'TX', 'ELP': 'TX', 'LBB': 'TX',
  'DEN': 'CO', 'COS': 'CO', 'GJT': 'CO',
  'JFK': 'NY', 'LGA': 'NY', 'EWR': 'NJ', 'ALB': 'NY', 'BUF': 'NY', 'ROC': 'NY', 'SYR': 'NY',
  'MIA': 'FL', 'MCO': 'FL', 'TPA': 'FL', 'FLL': 'FL', 'JAX': 'FL', 'PBI': 'FL', 'RSW': 'FL', 'PIE': 'FL', 'TLH': 'FL', 'GNV': 'FL', 'DAB': 'FL', 'MLB': 'FL',
  'SEA': 'WA', 'PDX': 'OR', 'BOI': 'ID',
  'LAS': 'NV', 'RNO': 'NV',
  'BOS': 'MA', 'PVD': 'RI', 'BGR': 'ME', 'PWM': 'ME',
  'PHX': 'AZ', 'TUS': 'AZ', 'FLG': 'AZ',
  'MSP': 'MN', 'DLH': 'MN',
  'DTW': 'MI', 'GRR': 'MI', 'FNT': 'MI',
  'CLT': 'NC', 'RDU': 'NC', 'ILM': 'NC', 'GSO': 'NC', 'AVL': 'NC', 'OAJ': 'NC',
  'PHL': 'PA', 'PIT': 'PA', 'ABE': 'PA',
  'BWI': 'MD', 'DCA': 'VA', 'IAD': 'VA', 'ORF': 'VA', 'RIC': 'VA',
  'SLC': 'UT', 'OGD': 'UT',
  'CMH': 'OH', 'CLE': 'OH', 'DAY': 'OH',
  'IND': 'IN', 'SBN': 'IN', 'EVV': 'IN',
  'MKE': 'WI', 'MSN': 'WI', 'GRB': 'WI',
  'STL': 'MO', 'MCI': 'MO', 'SGF': 'MO',
  'MEM': 'TN', 'BNA': 'TN', 'TYS': 'TN', 'CHA': 'TN',
  'BHM': 'AL', 'HSV': 'AL', 'MOB': 'AL', 'MGM': 'AL',
  'JAC': 'WY', 'COD': 'WY', 'CPR': 'WY',
  'HNL': 'HI', 'OGG': 'HI', 'KOA': 'HI', 'ITO': 'HI', 'LIH': 'HI',
  'ANC': 'AK', 'FAI': 'AK', 'JNU': 'AK', 'KTN': 'AK', 'OME': 'AK', 'AKN': 'AK', 'BET': 'AK', 'OTZ': 'AK',
  'ABQ': 'NM', 'SAF': 'NM', 'ROW': 'NM',
  'OKC': 'OK', 'TUL': 'OK', 'LAW': 'OK',
  'LIT': 'AR', 'XNA': 'AR', 'TXK': 'AR',
  'MSY': 'LA', 'BTR': 'LA', 'SHV': 'LA', 'LFT': 'LA',
  'JAN': 'MS', 'GPT': 'MS', 'GTR': 'MS',
  'BDL': 'CT', 'HVN': 'CT',
  'MHT': 'NH', 'LEB': 'NH',
  'BTV': 'VT',
  'CHS': 'SC', 'CAE': 'SC', 'MYR': 'SC', 'GSP': 'SC',
  'SAV': 'GA', 'AGS': 'GA',
  'SDF': 'KY', 'LEX': 'KY', 'PAH': 'KY', 'OWB': 'KY', 'CVG': 'KY', // Cincinnati is actually in Kentucky
  'GUM': 'GU', // Guam
  'SJU': 'PR', 'BQN': 'PR', 'PSE': 'PR', // Puerto Rico
  'STT': 'VI', 'STX': 'VI', // US Virgin Islands
};

// International province/state mapping for major airports
const INTL_AIRPORT_REGIONS: Record<string, string> = {
  // Canada
  'YYZ': 'ON', 'YTZ': 'ON', 'YHM': 'ON', 'YOW': 'ON', 'YKF': 'ON',
  'YVR': 'BC', 'YKA': 'BC', 'YXC': 'BC', 'YCD': 'BC',
  'YUL': 'QC', 'YQB': 'QC', 'YBG': 'QC', 'YMQ': 'QC',
  'YYC': 'AB', 'YEG': 'AB', 'YMM': 'AB', 'YQL': 'AB',
  'YWG': 'MB', 'YBR': 'MB',
  'YQR': 'SK', 'YXE': 'SK',
  'YHZ': 'NS', 'YSJ': 'NB', 'YYT': 'NL', 'YQX': 'NB',
  
  // Australia - states
  'SYD': 'NSW', 'MEL': 'VIC', 'BNE': 'QLD', 'PER': 'WA', 'ADL': 'SA', 'HBA': 'TAS', 'DRW': 'NT', 'CBR': 'ACT',
  
  // India - major states (simplified)
  'DEL': 'Delhi', 'BOM': 'Maharashtra', 'MAA': 'Tamil Nadu', 'BLR': 'Karnataka', 'HYD': 'Telangana', 'CCU': 'West Bengal',
  
  // Germany - states (Länder)
  'FRA': 'Hesse', 'MUC': 'Bavaria', 'DUS': 'North Rhine-Westphalia', 'TXL': 'Berlin', 'HAM': 'Hamburg', 'STR': 'Baden-Württemberg',
};

// Function to get state/province for an airport
function getAirportState(airport: any): string | undefined {
  if (airport.country === 'United States') {
    return US_AIRPORT_STATES[airport.iata];
  } else {
    return INTL_AIRPORT_REGIONS[airport.iata];
  }
}

// Function to format display location with state/province
function formatDisplayLocation(airport: any): string {
  const state = getAirportState(airport);
  
  if (airport.country === 'United States' && state) {
    return `${airport.city}, ${state}, USA`;
  } else if (state) {
    // For international locations with states/provinces
    return `${airport.city}, ${state}, ${airport.country}`;
  } else {
    // Default format without state
    return `${airport.city}, ${airport.country}`;
  }
}

// State/Province full name mappings for search
const US_STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'PR': 'Puerto Rico', 'VI': 'Virgin Islands', 'GU': 'Guam'
};

const CANADIAN_PROVINCE_NAMES: Record<string, string> = {
  'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba', 'NB': 'New Brunswick',
  'NL': 'Newfoundland and Labrador', 'NS': 'Nova Scotia', 'ON': 'Ontario', 'PE': 'Prince Edward Island',
  'QC': 'Quebec', 'SK': 'Saskatchewan', 'NT': 'Northwest Territories', 'NU': 'Nunavut', 'YT': 'Yukon'
};

const AUSTRALIAN_STATE_NAMES: Record<string, string> = {
  'NSW': 'New South Wales', 'VIC': 'Victoria', 'QLD': 'Queensland', 'WA': 'Western Australia',
  'SA': 'South Australia', 'TAS': 'Tasmania', 'NT': 'Northern Territory', 'ACT': 'Australian Capital Territory'
};

// Function to check if search term matches state/province
function matchesStateOrProvince(airport: any, searchTerm: string): boolean {
  const state = getAirportState(airport);
  if (!state) return false;
  
  // Check state abbreviation (case-insensitive)
  if (state.toLowerCase() === searchTerm) return true;
  
  // Check full state name for US states - more precise matching
  if (airport.country === 'United States') {
    const fullStateName = US_STATE_NAMES[state];
    if (fullStateName?.toLowerCase() === searchTerm || 
        (searchTerm.length > 3 && fullStateName?.toLowerCase().startsWith(searchTerm))) {
      return true;
    }
  }
  
  // Check full province name for Canada - more precise matching
  if (airport.country === 'Canada') {
    const fullProvinceName = CANADIAN_PROVINCE_NAMES[state];
    if (fullProvinceName?.toLowerCase() === searchTerm || 
        (searchTerm.length > 3 && fullProvinceName?.toLowerCase().startsWith(searchTerm))) {
      return true;
    }
  }
  
  // Check full state name for Australia - more precise matching
  if (airport.country === 'Australia') {
    const fullStateName = AUSTRALIAN_STATE_NAMES[state];
    if (fullStateName?.toLowerCase() === searchTerm || 
        (searchTerm.length > 3 && fullStateName?.toLowerCase().startsWith(searchTerm))) {
      return true;
    }
  }
  
  // For other countries, check if state/region name matches exactly or starts with search term
  if (state.toLowerCase() === searchTerm || 
      (searchTerm.length > 3 && state.toLowerCase().startsWith(searchTerm))) {
    return true;
  }
  
  return false;
}

// Comprehensive airport search function using openflights-cached
export function searchAirportsComprehensive(query: string): AirportData[] {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  
  try {
    // Separate state matches from other matches for proper prioritization
    const stateMatches: any[] = [];
    const otherMatches: any[] = [];
    
    openflights.array.forEach((airport: any) => {
      // Only include airports with IATA codes for better UX
      if (!airport.iata || airport.iata === '\\N') return;
      
      // Check if this is a state/province search
      const isStateMatch = matchesStateOrProvince(airport, searchTerm);
      
      if (isStateMatch) {
        stateMatches.push(airport);
        return;
      }
      
      // For short queries (2-3 chars), be more restrictive to avoid false positives
      if (searchTerm.length <= 3) {
        if (
          airport.city?.toLowerCase().startsWith(searchTerm) ||
          airport.iata?.toLowerCase() === searchTerm ||
          airport.country?.toLowerCase().startsWith(searchTerm)
        ) {
          otherMatches.push(airport);
        }
      } else {
        // For longer queries, use inclusive search
        if (
          airport.city?.toLowerCase().includes(searchTerm) ||
          airport.name?.toLowerCase().includes(searchTerm) ||
          airport.country?.toLowerCase().includes(searchTerm) ||
          airport.iata?.toLowerCase().includes(searchTerm)
        ) {
          otherMatches.push(airport);
        }
      }
    });
    
    // Combine results with state matches first, then other matches
    const allMatches = [...stateMatches, ...otherMatches]
      .slice(0, 8) // Limit to 8 results for performance
      .map((airport: any) => {
        const state = getAirportState(airport);
        return {
          iata: airport.iata,
          icao: airport.icao || '',
          name: airport.name,
          city: airport.city,
          country: airport.country,
          state,
          displayLocation: formatDisplayLocation(airport)
        };
      });
    
    return allMatches;
  } catch (error) {
    console.error('Error searching airports:', error);
    return [];
  }
}

// Props for the comprehensive airport search component
interface ComprehensiveAirportSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  onSelectAirport: (airport: AirportData) => void;
  placeholder?: string;
  className?: string;
}

// Main comprehensive airport search component
export function ComprehensiveAirportSearch({ 
  value, 
  onValueChange, 
  onSelectAirport, 
  placeholder = "Search airports, cities, or states...",
  className = ""
}: ComprehensiveAirportSearchProps) {
  const [suggestions, setSuggestions] = useState<AirportData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (inputValue: string) => {
    onValueChange(inputValue);
    
    if (inputValue.length > 1) {
      const results = searchAirportsComprehensive(inputValue);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectAirport = (airport: AirportData) => {
    onValueChange(`${airport.displayLocation} (${airport.iata})`);
    onSelectAirport(airport);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => value.length > 1 && setShowSuggestions(true)}
        onBlur={() => {
          // Delay hiding suggestions to allow clicking on them
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        placeholder={placeholder}
        className="w-full"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
          {suggestions.map((airport, index) => (
            <div
              key={index}
              className="cursor-pointer border-b border-gray-100 px-3 py-3 last:border-b-0 hover:bg-gray-100"
              onClick={() => handleSelectAirport(airport)}
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {airport.displayLocation}
                  </div>
                  <div className="text-xs text-gray-500">
                    {airport.name}
                  </div>
                </div>
                <div className="flex-shrink-0 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-700">
                  {airport.iata}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for using the comprehensive airport search functionality
export function useComprehensiveAirportSearch() {
  return {
    searchAirports: searchAirportsComprehensive,
    formatDisplayLocation,
    getAirportState,
    matchesStateOrProvince
  };
} 