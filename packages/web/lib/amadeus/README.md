# Amadeus API Integration

This module provides comprehensive integration with the Amadeus Travel API, including flight search, hotel search, and activity/POI search capabilities.

## Features

- **OAuth2 Authentication**: Automatic token refresh with 1-minute buffer
- **Rate Limiting**: Respects API limits (10 TPS for test, 40 TPS for production)
- **Error Handling**: Comprehensive error handling with retry logic
- **Service Compatibility**: Implements TravelAgentic service interfaces
- **Environment Support**: Works with both test and production environments
- **Fallback Integration**: Gracefully falls back to mock services if configuration fails

## Quick Start

### 1. Environment Setup

Add your Amadeus credentials to your environment variables:

```bash
# Required
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret

# Optional (defaults to 'test')
AMADEUS_ENVIRONMENT=test  # or 'production'

# Phase configuration
USE_MOCK_APIS=false
DEVELOPMENT_PHASE=2
```

### 2. Basic Usage

```typescript
import { createAmadeusClient, AmadeusFlightService } from '@/lib/amadeus';

// Create client
const client = createAmadeusClient();

// Create service
const flightService = new AmadeusFlightService(client);

// Search flights
const results = await flightService.search({
  origin: 'NYC',
  destination: 'LAX', 
  departureDate: '2024-08-01',
  passengers: { adults: 1, children: 0, infants: 0 },
  cabin: 'economy'
});

if (results.success) {
  console.log(`Found ${results.data.length} flights`);
  results.data.forEach(flight => {
    console.log(`${flight.segments[0].airline} - ${flight.price.displayPrice}`);
  });
}
```

### 3. Service Factory Integration

The services are automatically integrated with the TravelAgentic service factory:

```typescript
import { getFlightService } from '@/lib/mocks';

// Automatically uses Amadeus when DEVELOPMENT_PHASE >= 2 and USE_MOCK_APIS=false
const flightService = getFlightService();
const results = await flightService.search(params);
```

## API Documentation

### Flight Search

```typescript
interface FlightSearchParams {
  origin: string;              // IATA airport code
  destination: string;         // IATA airport code
  departureDate: string;       // YYYY-MM-DD format
  returnDate?: string;         // YYYY-MM-DD format
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabin: 'economy' | 'premium' | 'business' | 'first';
  directFlightsOnly?: boolean;
  maxStops?: number;
  preferredAirlines?: string[];
  filters?: SearchFilters;
}
```

### Hotel Search

```typescript
interface HotelSearchParams {
  destination: string;         // City name
  checkIn: string;            // YYYY-MM-DD format
  checkOut: string;           // YYYY-MM-DD format
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  starRating?: number[];      // [3, 4, 5]
  amenities?: string[];       // ['WIFI', 'POOL', 'PARKING']
  propertyTypes?: string[];   // ['HOTEL', 'RESORT']
  maxDistance?: number;       // km from city center
  filters?: SearchFilters;
}
```

### Activity Search

```typescript
interface ActivitySearchParams {
  destination: string;         // City name
  startDate?: string;         // YYYY-MM-DD format
  endDate?: string;           // YYYY-MM-DD format
  categories?: string[];      // ['SIGHTSEEING', 'CULTURAL']
  duration?: {
    min?: number;             // hours
    max?: number;             // hours
  };
  groupSize?: number;
  accessibility?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  filters?: SearchFilters;
  excludeIds?: string[];
  preferences?: string[];
  maxResults?: number;
}
```

## Rate Limiting

The client automatically enforces rate limits:

- **Test Environment**: 10 TPS (1 request every 100ms)
- **Production Environment**: 40 TPS (1 request every 25ms)

The client includes automatic retry logic with exponential backoff for rate limit and temporary errors.

## Error Handling

All services return a consistent response format:

```typescript
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: 'api' | 'browser' | 'voice' | 'manual';
  responseTime?: number;
}
```

Common error scenarios:
- **Authentication failures**: Automatic token refresh
- **Rate limiting**: Automatic retry with backoff
- **Network errors**: Configurable retry attempts
- **Invalid requests**: Detailed error messages

## Testing

### Manual Testing

Use the provided test script to verify your integration:

```bash
# Set environment variables
export AMADEUS_CLIENT_ID=your_client_id
export AMADEUS_CLIENT_SECRET=your_client_secret
export AMADEUS_ENVIRONMENT=test

# Run test
node test-amadeus-integration.js
```

### Unit Testing

```typescript
import { AmadeusFlightService } from '@/lib/amadeus';

// Mock the client for testing
const mockClient = {
  searchFlights: jest.fn(),
  searchHotels: jest.fn(),
  // ... other methods
};

const flightService = new AmadeusFlightService(mockClient);
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AMADEUS_CLIENT_ID` | Yes | - | Your Amadeus API client ID |
| `AMADEUS_CLIENT_SECRET` | Yes | - | Your Amadeus API client secret |
| `AMADEUS_ENVIRONMENT` | No | `test` | API environment (`test` or `production`) |

### Client Configuration

```typescript
const client = new AmadeusClient({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  baseUrl: 'https://test.api.amadeus.com', // or production URL
  timeout: 30000,           // Request timeout in ms
  retryAttempts: 3,         // Number of retry attempts
  retryDelay: 1000,         // Base retry delay in ms
  rateLimitDelay: 100,      // Delay between requests in ms
});
```

## Advanced Features

### Custom Error Handling

```typescript
try {
  const results = await flightService.search(params);
} catch (error) {
  if (error.message.includes('Authentication failed')) {
    // Handle auth error
  } else if (error.message.includes('Rate limited')) {
    // Handle rate limit
  }
}
```

### Rate Limit Monitoring

```typescript
const rateLimitState = client.getRateLimitState();
console.log(`Requests made: ${rateLimitState.requestCount}`);
console.log(`Reset time: ${new Date(rateLimitState.resetTime)}`);
```

### Configuration Validation

```typescript
import { validateAmadeusConfig, getAmadeusConfig } from '@/lib/amadeus';

if (!validateAmadeusConfig()) {
  console.error('Amadeus not configured properly');
  process.exit(1);
}

const config = getAmadeusConfig();
console.log(`Using ${config.environment} environment`);
```

## API Endpoints Used

### Flight Search
- `GET /v2/shopping/flight-offers` - Search for flight offers
- `POST /v1/shopping/flight-offers/pricing` - Confirm flight pricing

### Hotel Search
- `GET /v1/reference-data/locations/hotels/by-city` - Search hotels by city
- `GET /v3/shopping/hotel-offers` - Get hotel offers

### Activity Search
- `GET /v1/reference-data/locations/pois` - Search points of interest
- `GET /v1/shopping/activities` - Search tours and activities

## Limitations

### Test Environment
- Limited cached data (not real-time)
- 10 TPS rate limit
- Free monthly quota

### Data Completeness
- Some fields may not be available in all responses
- Airport names require additional lookup service
- Timezone information needs separate service
- Limited activity data compared to specialized providers

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Check your client ID and secret
   - Ensure environment variables are set correctly
   - Verify your Amadeus account is active

2. **Rate Limit Exceeded**
   - Reduce request frequency
   - Implement proper retry logic
   - Consider caching responses

3. **No Results Found**
   - Verify search parameters are valid
   - Check date formats (YYYY-MM-DD)
   - Ensure airport codes are correct IATA codes

4. **Network Errors**
   - Check internet connection
   - Verify API endpoint URLs
   - Check for firewall/proxy issues

### Debug Mode

Enable verbose logging:

```bash
export DEBUG=amadeus:*
export VERBOSE_LOGGING=true
```

## Support

For issues specific to this integration, check:
1. Environment configuration
2. API credentials
3. Network connectivity
4. Rate limiting

For Amadeus API issues, consult:
- [Amadeus Developer Portal](https://developers.amadeus.com/)
- [API Documentation](https://developers.amadeus.com/self-service/apis-docs)
- [Support Portal](https://developers.amadeus.com/support) 