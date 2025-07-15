# Amadeus API Integration - Unified Parameter Mapping System

## Overview

This system proactively solves parameter mapping and location conversion issues across all Amadeus APIs (Flights, Hotels, Activities) by providing a unified interface that handles the common problems we encountered with the flight API.

## Problems Solved

### 1. **Parameter Naming Inconsistencies**
- **Flight API**: `origin` → `originLocationCode`, `passengers` → `adults`, `budget` → `maxPrice`
- **Hotel API**: `destination` → `cityCode`, `checkin` → `checkInDate`, `guests` → `adults`
- **Activity API**: `destination` → `latitude/longitude`, `duration` → `minimumDuration/maximumDuration`

### 2. **Location Format Requirements**
- **Flights**: City names → Airport codes (JFK, LHR, etc.)
- **Hotels**: City names → City codes (NYC, LON, etc.)
- **Activities**: City names → Geographic coordinates (40.7128, -74.0060)

### 3. **Date Format Standardization**
- All APIs require YYYY-MM-DD format
- Users might provide various formats
- System handles conversion automatically

## System Architecture

### Core Components

#### 1. `LocationService` (`location-service.ts`)
Handles all location format conversions:

```typescript
// Convert city name to airport code (flights)
LocationService.cityToAirportCode('New York') // → 'JFK'

// Convert city name to city code (hotels)  
LocationService.cityToCityCode('New York') // → 'NYC'

// Convert city name to coordinates (activities)
LocationService.cityToCoordinates('New York') // → { latitude: 40.7128, longitude: -74.0060 }

// Get all location info at once
LocationService.getLocationInfo('New York') // → Complete location object
```

#### 2. `Parameter Mappers` (`parameter-mapper.ts`)
Handle API-specific parameter mapping:

```typescript
// Flight parameter mapping
const flightParams = FlightParameterMapper.mapParameters({
  origin: 'New York',
  destination: 'London', 
  passengers: 2,
  budget: 1000
});
// Results in: { originLocationCode: 'JFK', destinationLocationCode: 'LHR', adults: 2, maxPrice: 1000 }

// Hotel parameter mapping
const hotelParams = HotelParameterMapper.mapParameters({
  destination: 'New York',
  checkin: '2025-09-15',
  guests: 2,
  budget: 500
});
// Results in: { cityCode: 'NYC', checkInDate: '2025-09-15', adults: 2, maxPrice: 500 }

// Activity parameter mapping
const activityParams = ActivityParameterMapper.mapParameters({
  destination: 'New York',
  startDate: '2025-09-15',
  groupSize: 4
});
// Results in: { latitude: 40.7128, longitude: -74.0060, startDate: '2025-09-15', groupSize: 4 }
```

#### 3. `Validation & Error Handling`
Each mapper includes validation:

```typescript
const validation = FlightParameterMapper.validateParameters(mappedParams);
if (!validation.isValid) {
  console.log(validation.errors); // Array of specific error messages
}
```

## Usage Examples

### Flight API Integration
```typescript
import { FlightParameterMapper } from '@/lib/amadeus/parameter-mapper';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Map user parameters to Amadeus format
  const mappedParams = FlightParameterMapper.mapParameters({
    origin: body.from,           // User says "from"
    destination: body.to,        // User says "to"
    passengers: body.travelers,  // User says "travelers"
    budget: body.maxPrice       // User says "maxPrice"
  });
  
  // Validate parameters
  const validation = FlightParameterMapper.validateParameters(mappedParams);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }
  
  // Call Amadeus API with correctly formatted parameters
  const response = await amadeusClient.searchFlights(mappedParams);
}
```

### Hotel API Integration
```typescript
import { HotelParameterMapper } from '@/lib/amadeus/parameter-mapper';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Map user parameters to Amadeus format
  const mappedParams = HotelParameterMapper.mapParameters({
    destination: body.city,      // Converts city name to city code
    checkin: body.checkIn,       // Ensures proper date format
    checkout: body.checkOut,     // Ensures proper date format
    guests: body.adults,         // Maps guest count
    budget: body.priceLimit      // Maps budget parameter
  });
  
  // Validate parameters
  const validation = HotelParameterMapper.validateParameters(mappedParams);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }
  
  // Call Amadeus API with correctly formatted parameters
  const response = await amadeusClient.searchHotels(mappedParams);
}
```

### Activity API Integration
```typescript
import { ActivityParameterMapper } from '@/lib/amadeus/parameter-mapper';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Map user parameters to Amadeus format
  const mappedParams = ActivityParameterMapper.mapParameters({
    destination: body.location,  // Converts city name to coordinates
    startDate: body.date,        // Ensures proper date format
    categories: body.interests,  // Maps activity categories
    groupSize: body.people       // Maps group size
  });
  
  // Validate parameters
  const validation = ActivityParameterMapper.validateParameters(mappedParams);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }
  
  // Call Amadeus API with correctly formatted parameters
  const response = await amadeusClient.searchActivities(mappedParams);
}
```

## Error Prevention

### 1. **Location Errors**
```typescript
// Before: User enters "New York" → API fails because it needs "JFK"
// After: LocationService.cityToAirportCode('New York') → 'JFK'

// Before: User enters "London" → Hotel API fails because it needs "LON"  
// After: LocationService.cityToCityCode('London') → 'LON'

// Before: User enters "Paris" → Activity API fails because it needs coordinates
// After: LocationService.cityToCoordinates('Paris') → { latitude: 48.8566, longitude: 2.3522 }
```

### 2. **Parameter Naming Errors**
```typescript
// Before: { origin: 'JFK', passengers: 2 } → API fails
// After: { originLocationCode: 'JFK', adults: 2 } → API succeeds

// Before: { destination: 'NYC', checkin: '2025-09-15' } → API fails
// After: { cityCode: 'NYC', checkInDate: '2025-09-15' } → API succeeds
```

### 3. **Date Format Errors**
```typescript
// Before: { departureDate: '9/15/2025' } → API fails
// After: { departureDate: '2025-09-15' } → API succeeds
```

## Testing

Test endpoints have been created to demonstrate the system:

- **`/api/test/flights`** - Flight parameter mapping (already working)
- **`/api/test/hotels`** - Hotel parameter mapping (demonstrates city→cityCode)
- **`/api/test/activities`** - Activity parameter mapping (demonstrates city→coordinates)

### Example Test Requests

```bash
# Test flight mapping
curl -X POST /api/test/flights \
  -H "Content-Type: application/json" \
  -d '{"origin": "New York", "destination": "London", "passengers": 2, "budget": 1000}'

# Test hotel mapping  
curl -X POST /api/test/hotels \
  -H "Content-Type: application/json" \
  -d '{"destination": "New York", "checkin": "2025-09-15", "guests": 2, "budget": 500}'

# Test activity mapping
curl -X POST /api/test/activities \
  -H "Content-Type: application/json" \
  -d '{"destination": "New York", "startDate": "2025-09-15", "groupSize": 4}'
```

## Supported Cities

The system supports 100+ major cities worldwide across all continents. See the mappings in `location-service.ts` for the complete list.

## Future Enhancements

1. **Dynamic City Resolution**: Add API calls to resolve cities not in our static mapping
2. **Airline-Specific Airport Preferences**: Some cities have multiple airports
3. **Regional Hotel Codes**: More granular hotel location codes
4. **Activity Category Mapping**: Map user interests to Amadeus activity categories
5. **Currency Conversion**: Handle different currency formats across APIs

## Integration Guidelines

### For New Agents
1. Import the appropriate parameter mapper for your API
2. Use `LocationService` for any location-related conversions
3. Always validate parameters before making API calls
4. Handle errors gracefully with user-friendly messages

### For Existing Agents
1. Replace existing parameter mapping with the unified system
2. Update location conversion to use `LocationService`
3. Add parameter validation using the mapper's `validateParameters()` method
4. Update error handling to use `AmadeusErrorHandler`

This unified system ensures that the same parameter mapping and location conversion issues that occurred with flights will never happen with hotels, activities, or any future agents. 