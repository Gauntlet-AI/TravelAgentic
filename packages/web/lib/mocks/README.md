# Mock Services for TravelAgentic

This directory contains comprehensive mock implementations of all travel-related services used in TravelAgentic. The mock services are designed to provide realistic data and behavior while maintaining identical interfaces to their real API counterparts.

## Architecture Overview

The mock service system follows a layered architecture that enables seamless transition from development to production:

```
Mock Services Layer
├── Data Sources (JSON/TypeScript)
├── Service Implementations (Business Logic)
├── API Clients (Interface Compatibility)
└── Service Factory (Environment-based Selection)
```

## Key Features

- **Identical Interfaces**: Mock services implement the exact same interfaces as real APIs
- **Realistic Data**: Comprehensive mock data with proper relationships and constraints
- **Configurable Failures**: Simulate API failures to test fallback mechanisms
- **Performance Simulation**: Configurable delays to simulate real API response times
- **Environment-based**: Automatic switching between mock and real services via environment variables

## Phase-Based Implementation

### Phase 1 (Current): Complete Mock Environment
- All travel services use mocks
- Payment processing simulated
- AI services use real APIs (OpenAI)

### Phase 2: Selective Real APIs
- Flight: Tequila API
- Hotels: Booking.com API
- Activities: Viator API
- Payments: Still mocked

### Phase 3: Production APIs
- All services use real APIs
- Mocks available for development/testing

## Usage

```typescript
// Environment-based service selection
const flightService = ServiceFactory.getFlightService();
const hotelService = ServiceFactory.getHotelService();
const activityService = ServiceFactory.getActivityService();

// Services maintain identical interfaces regardless of implementation
const flights = await flightService.search(searchParams);
```

## Configuration

Set `USE_MOCK_APIS=true` in your environment to use mock services.
Set `MOCK_FAILURE_RATE=0.1` to simulate 10% API failure rate for testing.

## Directory Structure

```
packages/mocks/
├── data/           # Mock data sources
├── services/       # Service implementations
├── clients/        # API client interfaces
├── factories/      # Service factory patterns
└── utils/          # Shared utilities
``` 