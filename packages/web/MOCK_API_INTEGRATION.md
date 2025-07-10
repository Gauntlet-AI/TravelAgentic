# Mock API Integration Guide

This guide explains how to use the integrated mock APIs for Phase 1 development in TravelAgentic.

## Overview

The mock API integration provides a complete development environment that simulates real travel booking services without requiring external API keys or connections. This allows developers to:

- Build and test the frontend without API dependencies
- Develop with realistic data and response times
- Test fallback mechanisms by simulating API failures
- Transition seamlessly to real APIs in Phase 2

## Architecture

The mock API system uses a **Service Factory Pattern** that provides:

```
Frontend → API Routes → Service Factory → Mock Services → Realistic Data
```

### Key Components

1. **Service Factory** (`/lib/mocks/factories/service-factory.ts`)
   - Environment-based service selection
   - Phase-aware configuration
   - Singleton pattern for consistent behavior

2. **Mock Services** (`/lib/mocks/services/`)
   - `MockFlightService` - Flight search and booking
   - `MockHotelService` - Hotel search and booking
   - `MockActivityService` - Activity search and categories
   - `MockPaymentService` - Payment processing simulation

3. **API Routes** (`/app/api/`)
   - All endpoints updated to use service factory
   - Consistent error handling and response format
   - Support for both POST and streaming GET requests

## Configuration

### Environment Variables

Create a `.env.local` file in the `packages/web` directory:

```bash
# Phase 1 Configuration - Mock APIs
USE_MOCK_APIS=true
DEVELOPMENT_PHASE=1
NODE_ENV=development

# Mock Service Configuration
MOCK_FAILURE_RATE=0.05        # 5% failure rate for testing
MOCK_DELAY_MIN=800            # Minimum response delay (ms)
MOCK_DELAY_MAX=2500           # Maximum response delay (ms)
MOCK_REALISTIC_DATA=true      # Use realistic data
MOCK_PRICE_FLUCTUATION=true   # Enable price variations

# AI Integration (Optional)
OPENAI_API_KEY=your_openai_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Phase-Based Development

The system supports three development phases:

- **Phase 1**: All mock APIs (current)
- **Phase 2**: Real flight/hotel/activity APIs, mock payments
- **Phase 3**: All real APIs

## API Endpoints

### Flight Search

```javascript
// POST /api/flights/search
const response = await fetch('/api/flights/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin: 'NYC',
    destination: 'LAX',
    departureDate: '2024-12-15',
    returnDate: '2024-12-20',
    passengers: 2,
    cabin: 'economy'
  })
});
```

### Hotel Search

```javascript
// POST /api/hotels/search
const response = await fetch('/api/hotels/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destination: 'Los Angeles',
    checkIn: '2024-12-15',
    checkOut: '2024-12-18',
    guests: {
      adults: 2,
      children: 0,
      rooms: 1
    }
  })
});
```

### Activity Search

```javascript
// POST /api/activities/search
const response = await fetch('/api/activities/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destination: 'Los Angeles',
    startDate: '2024-12-15',
    endDate: '2024-12-18',
    categories: ['outdoor', 'culture']
  })
});
```

### Payment Booking

```javascript
// POST /api/payments/booking
const response = await fetch('/api/payments/booking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [
      {
        type: 'flight',
        id: 'FL001',
        quantity: 1,
        price: { amount: 299.99, currency: 'USD' }
      }
    ],
    paymentMethod: {
      type: 'card',
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123'
    },
    customerInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    }
  })
});
```

## Response Format

All API endpoints return a consistent response format:

```javascript
{
  success: true,
  data: [...],              // The actual response data
  fallbackUsed: 'api',      // Which fallback was used
  responseTime: 1250        // Response time in milliseconds
}
```

## Testing

### Quick Test

Run the integration test script:

```bash
cd packages/web
node test-mock-integration.js
```

### Manual Testing

1. Start the development server:
```bash
npm run dev
```

2. Visit `http://localhost:3000` and test the travel search functionality

3. Check the browser console for API response logging

### Test Scenarios

The mock services provide realistic test scenarios:

- **Flight Search**: Returns 5-15 flights with realistic airlines, times, and prices
- **Hotel Search**: Returns 8-20 hotels with different star ratings and amenities
- **Activity Search**: Returns 10-25 activities filtered by category and destination
- **Payment Processing**: Simulates successful/failed payments with realistic responses

## Data Sources

Mock data is sourced from:

- **Airports**: 500+ international airports with IATA codes
- **Airlines**: 17+ major airlines with realistic flight numbers
- **Hotels**: 100+ properties per major destination
- **Activities**: 200+ activities across multiple categories
- **Realistic Pricing**: Dynamic pricing based on destination and season

## Development Tips

### Debugging

1. **Enable Verbose Logging**:
```bash
VERBOSE_LOGGING=true
DEBUG=true
```

2. **Check Service Factory Status**:
```javascript
import { getServiceFactory } from '@/lib/mocks';
const factory = getServiceFactory();
console.log(factory.getConfig());
```

3. **Monitor API Responses**:
```javascript
// All API responses include timing and fallback information
console.log('Response time:', response.responseTime);
console.log('Fallback used:', response.fallbackUsed);
```

### Failure Testing

Test fallback mechanisms by increasing failure rate:

```bash
MOCK_FAILURE_RATE=0.5  # 50% failure rate
```

### Performance Testing

Adjust response delays to simulate different network conditions:

```bash
MOCK_DELAY_MIN=2000    # Slow connection
MOCK_DELAY_MAX=5000    # Very slow connection
```

## Transitioning to Real APIs

When ready to move to Phase 2:

1. Update environment variables:
```bash
USE_MOCK_APIS=false
DEVELOPMENT_PHASE=2
```

2. Add real API keys:
```bash
TEQUILA_API_KEY=your_tequila_key
BOOKING_API_KEY=your_booking_key
VIATOR_API_KEY=your_viator_key
```

3. The service factory will automatically switch to real APIs while maintaining the same interface

## Common Issues

### API Routes Not Found

- Ensure the development server is running
- Check that API routes are properly imported
- Verify environment variables are set correctly

### Mock Data Not Loading

- Check that `USE_MOCK_APIS=true` is set
- Verify the service factory is being used in API routes
- Check console for any import errors

### TypeScript Errors

- Ensure all mock types are properly imported
- Check that the service factory exports are correct
- Verify interface compatibility between mock and real services

## Support

For issues with mock API integration:

1. Check the test script output for specific errors
2. Review the service factory configuration
3. Verify environment variables are properly set
4. Check API route implementations for consistent service factory usage

The mock API integration provides a robust foundation for Phase 1 development, allowing full feature development without external dependencies while maintaining compatibility with future real API integration. 